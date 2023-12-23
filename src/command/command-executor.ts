import { isType, match } from "variant"
import { GameEvent } from "../event/game-event"
import { GameState } from "../model/game/game-state"
import { GameCommand } from "./game-command"
import _ from "lodash"
import { Character } from "../model/game/character"
import { Trigger } from "../model/game/trigger"
import { Room } from "../model/game/room"
import { EndOfGameCondition } from "../model/game/end-of-game-condition"

export type GameStateTransition = {
    events: Array<GameEvent>,
    gameStateAfter: GameState,
}

export function executeCommand(command: GameCommand, gameState: GameState): GameStateTransition {
    return match(command, {
        wait: (waitCommand: GameCommand<'wait'>) => executeWaitCommand(waitCommand, gameState),
        move: (moveCommand: GameCommand<'move'>) => executeMoveCommand(moveCommand, gameState),
        takeItem: (takeItem: GameCommand<'takeItem'>) => executeTakeItem(takeItem, gameState),
        attack: (attack: GameCommand<'attack'>) => executeAttack(attack, gameState),
        trapDamage: (trapDamage: GameCommand<'trapDamage'>) => executeTrapDamage(trapDamage, gameState),
        narrate: (narrate: GameCommand<'narrate'>) => executeNarrateCommand(narrate, gameState),
        look: () => executeLookCommand(gameState),
        help: () => executeHelpCommand(gameState),
        inventory: () => executeInventoryCommand(gameState),
    });
}

/**
 * Advances {@link GameState} to the next turn, skipping any deceased {@link Character}
 */
function nextTurn(gameState: GameState) {
    let characterWithTurn = gameState.characterWithTurn;
    let index = gameState.characterTurnOrder.indexOf(characterWithTurn);

    var lastTurnIndex = index;
    var nextTurnIndex;
    let characterWithNextTurn;

    do {
        if (lastTurnIndex < gameState.characterTurnOrder.length - 1) {
            nextTurnIndex = lastTurnIndex + 1;
        } else {
            nextTurnIndex = 0;
        }
        lastTurnIndex = nextTurnIndex;
        characterWithNextTurn = gameState.characterTurnOrder[nextTurnIndex]
    } while (
        gameState.characters[characterWithNextTurn].currentHealth === 0
                && nextTurnIndex !== index
    );

    return {
        ...gameState,
        characterWithTurn: characterWithNextTurn,
    };
}

function executeWaitCommand(wait: GameCommand<'wait'>, gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: nextTurn(gameState),
        events: [
            GameEvent.wait({actor: wait.actor})
        ],
    }
}

function executeMoveCommand(move: GameCommand<'move'>, gameState: GameState): GameStateTransition {
    let characterMoving = gameState.characters[move.actor];
    let sourceRoom = gameState.rooms[characterMoving.room];
    let exit = sourceRoom.exits.find(exit => exit.id === move.exit)!;
    let destinationRoom = gameState.rooms[exit.room];

    let gameStateAfter: GameState = nextTurn({
        ...gameState,
    });

    // Move the Character from room to room
    let characterAfterMove: Character = {
        ...characterMoving,
        room: destinationRoom.id,
    };
    gameStateAfter.characters = {
        ...gameStateAfter.characters,
        [characterMoving.id]: characterAfterMove,
    };

    let sourceRoomAfterMove: Room = {
        ...sourceRoom,
        characters: _.without(sourceRoom.characters, characterMoving.id),
    };
    let destinationRoomAfterMove: Room = {
        ...destinationRoom,
        characters: [...destinationRoom.characters, characterMoving.id],
    };

    // Any living followers in the same room move too
    let followersWhoMoveToo = sourceRoomAfterMove.characters.filter(characterId => {
        let character = gameStateAfter.characters[characterId];
        return character.currentHealth > 0
                && character.partyLeader === move.actor;
    });
    followersWhoMoveToo.forEach(followerId => {
        let follower = gameStateAfter.characters[followerId];
        let followerAfterMove: Character = {
            ...follower,
            room: destinationRoom.id,
        };
        gameStateAfter.characters = {
            ...gameStateAfter.characters,
            [followerId]: followerAfterMove,
        };
        sourceRoomAfterMove.characters = _.without(sourceRoom.characters, followerId);
        destinationRoomAfterMove.characters = [...destinationRoom.characters, followerId];
    });

    // Update the Rooms in the Game state
    gameStateAfter.rooms = {
        ...gameStateAfter.rooms,
        [sourceRoomAfterMove.id]: sourceRoomAfterMove,
        [destinationRoomAfterMove.id]: destinationRoomAfterMove,
    };

    // Determine the destination exit, the exit on the destinationRoom side
    let destinationExit = destinationRoomAfterMove.exits.find(exit => exit.room === sourceRoomAfterMove.id)!;

    var events: Array<GameEvent> = [
        GameEvent.move({
            actor: move.actor,
            followers: followersWhoMoveToo,
            sourceRoom: sourceRoomAfterMove.id,
            destinationRoom: destinationRoomAfterMove.id,
            sourceExit: exit.id,
            destinationExit: destinationExit.id,
        }),
    ];
    if (move.actor === gameState.player) {
        events = [...events, GameEvent.look({isPlayerInitiated: false})]
    }

    // Generate state transition
    let moveTransition = {
        gameStateAfter,
        events: events,
    };
    return resolveTriggerConditions(moveTransition);
}

function executeTakeItem(takeItem: GameCommand<'takeItem'>, gameState: GameState): GameStateTransition {
    // TODO do not assume the player is taking the item
    let player = gameState.characters[gameState.player];
    let room = gameState.rooms[player.room];

    // Add the Item to the Player's inventory
    let newPlayer = {
        ...player,
        items: [...player.items, takeItem.item],
    };

    // Remove the Item from the Room's inventory
    let newRoom = {
        ...room,
        items: _.without(room.items, takeItem.item),
    }

    let gameStateTransition: GameStateTransition = {
        gameStateAfter: {
            ...gameState,
            characters: {
                ...gameState.characters,
                [player.id]: newPlayer,
            },
            rooms: {
                ...gameState.rooms,
                [room.id]: newRoom
            }
        },
        events: [GameEvent.takeItem({
            actor: gameState.player,
            item: takeItem.item,
        })],
    };

    return resolveTriggerConditions(gameStateTransition);
}

function executeAttack(attack: GameCommand<'attack'>, gameState: GameState): GameStateTransition {
    let attacker = gameState.characters[attack.attacker];
    let defender = gameState.characters[attack.defender];

    // Apply damage to the defender
    defender = {
        ...defender,
        currentHealth: Math.max(0, defender.currentHealth - 1),
    }
    let attackEvent = GameEvent.attack({
        attacker: attack.attacker,
        room: attacker.room,
        defender: attack.defender,
        weapon: attacker.equippedWeapon,
        isFatal: defender.currentHealth === 0,
    });
    let combatEvents: Array<GameEvent> = [attackEvent];

    let combatStateTransition = {
        gameStateAfter: nextTurn({
            ...gameState,
            characters: {
                ...gameState.characters,
                [defender.id]: defender,
            }
        }),
        events: combatEvents,
    }

    return resolveTriggerConditions(combatStateTransition);
}

function executeTrapDamage(trapDamage: GameCommand<'trapDamage'>, gameState: GameState): GameStateTransition {
    let defender = gameState.characters[trapDamage.defender];

    // Apply damage to the defender
    defender = {
        ...defender,
        currentHealth: Math.max(0, defender.currentHealth - trapDamage.damage),
    };

    let trapDamageEvent = GameEvent.trapDamage({
        defender: defender.id,
        room: defender.room,
        isFatal: defender.currentHealth === 0,
    });

    let combatStateTransition = {
        gameStateAfter: {
            ...gameState,
            characters: {
                ...gameState.characters,
                [defender.id]: defender,
            }
        },
        events: [trapDamageEvent],
    }

    return resolveTriggerConditions(combatStateTransition);
}

function executeNarrateCommand(narrate: GameCommand<'narrate'>, gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        events: [GameEvent.narration({
            story: narrate.story,
        })],
    }
}

function executeLookCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        events: [GameEvent.look({isPlayerInitiated: true})],
    };
}

function executeHelpCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        events: [GameEvent.help()]
    };
}

function executeInventoryCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        events: [GameEvent.inventory()]
    };
}

/**
 * Evaluate the {@link GameStateTransition} and see if any {@link Trigger}s should be triggered.
 * 
 * If any triggers go off, return a modified {@link GameStateTransition} indicating the new state,
 * and including any {@link GameEvent}s that represent the trigger.
 */
function resolveTriggerConditions(gameStateTransition: GameStateTransition): GameStateTransition {
    let gameState = gameStateTransition.gameStateAfter;
    let gameEvents: Array<GameEvent> = [];

    for (const event of gameStateTransition.events) {
        gameEvents.push(event);

        if (isType(event, GameEvent.takeItem)) {
            let triggeringCharacter = event.actor;
            let eventRoomId = gameState.characters[event.actor].room;
            let eventRoom = gameState.rooms[eventRoomId];
            eventRoom.triggers.forEach(trigger => {
                if (isType(trigger, Trigger.takeItem)) {
                    if (event.item === trigger.item) {
                        let triggeredCommand = trigger.buildCommand(
                            triggeringCharacter,
                            eventRoomId,
                        );
                        let triggerTransition = executeCommand(triggeredCommand, gameState);
                        gameState = triggerTransition.gameStateAfter;
                        gameEvents = [...gameEvents, ...triggerTransition.events];
                    }
                }
            });
        }
        if (isType(event, GameEvent.move)) {
            let triggeringCharacter = event.actor;
            let eventRoom = gameState.rooms[event.sourceRoom];
            eventRoom.triggers.forEach(trigger => {
                // Move triggers trigger from the source room
                if (isType(trigger, Trigger.move)) {
                    // Determine if the direction triggers the trigger
                    if (event.sourceExit === trigger.exit) {
                        let triggeredCommand = trigger.buildCommand(
                            triggeringCharacter,
                            event.sourceRoom,
                        );
                        let triggerTransition = executeCommand(triggeredCommand, gameState);
                        gameState = triggerTransition.gameStateAfter;
                        gameEvents = [...gameEvents, ...triggerTransition.events];
                    }
                }
            });
        }

        // Don't continue triggering events once the game is over
        if (gameState.isGameOver) {
            break;
        }
    }

    // End the game if any EndOfGameConditions currently resolve
    gameState.endOfGameConditions.forEach(condition => {
        if (!gameState.isGameOver && isEndOfGameConditionResolved(gameState, condition)) {
            // Transition to gameOver=true with a GameOver Event
            gameEvents = [...gameEvents, GameEvent.gameOver()];
            gameState = {
                ...gameState,
                isGameOver: true,
            };
        }
    });

    return {
        gameStateAfter: gameState,
        events: gameEvents,
    };
}

function isEndOfGameConditionResolved(gameState: GameState, endOfGameCondition: EndOfGameCondition): boolean {
    return match(endOfGameCondition, {
        characterDeath: characterDeath => gameState.characters[characterDeath.character].currentHealth <= 0
    });
}