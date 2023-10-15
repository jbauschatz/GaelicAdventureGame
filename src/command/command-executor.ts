import { constant, isType, match, partial } from "variant"
import { GameEvent } from "../event/game-event"
import { GameState } from "../model/game/game-state"
import { GameCommand } from "./game-command"
import _, { takeRight } from "lodash"
import { Character } from "../model/game/character"
import { Trigger } from "../model/game/trigger"

export type GameStateTransition = {
    events: Array<GameEvent>,
    gameStateAfter: GameState,
}

export function executeCommand(command: GameCommand, gameState: GameState): GameStateTransition {
    return match(command, {
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

function executeMoveCommand(move: GameCommand<'move'>, gameState: GameState): GameStateTransition {
    let playerRoom = gameState.rooms[gameState.currentRoom];
    let exit = playerRoom.exits.find(exit => exit.direction === move.toDirection)!;
    let newRoom = exit.room;

    // Move the Player into the new room
    let player = gameState.characters[gameState.player];
    let playerAfterMove: Character = {
        ...player,
        room: newRoom,
    }
    let gameStateAfter: GameState = {
        ...gameState,
        characters: {
            ...gameState.characters,
            [gameState.player]: playerAfterMove,
        },
        currentRoom: newRoom,
    };

    let moveTransition = {
        gameStateAfter,
        events: [
            GameEvent.move({
                actor: gameState.player,
                fromRoom: gameState.currentRoom,
                toRoom: gameStateAfter.currentRoom,
                toDirection: exit.direction,
                exit: exit.id
            }),
            GameEvent.look({isPlayerInitiated: false}),
        ],
    };
    return resolveTriggerConditions(moveTransition);
}

function executeTakeItem(takeItem: GameCommand<'takeItem'>, gameState: GameState): GameStateTransition {
    let room = gameState.rooms[gameState.currentRoom];

    // Add the Item to the Player's inventory
    let player = gameState.characters[gameState.player]
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
    let defender = gameState.characters[attack.defender];
    let attacker = gameState.characters[attack.attacker];

    // Apply damage to the defender
    defender = {
        ...defender,
        currentHealth: Math.max(0, defender.currentHealth - 1),
    }
    let attackEvent = GameEvent.attack({
        attacker: attack.attacker,
        defender: attack.defender,
        isFatal: defender.currentHealth === 0,
    });
    let combatEvents: Array<GameEvent> = [attackEvent];

    // If the defender survives it can counterattack
    if (defender.currentHealth > 0) {
        // Apply damange back to the attacker
        attacker = {
            ...attacker,
            currentHealth: Math.max(attacker.currentHealth - 1, 0),
        }
        
        let counterattackEvent = GameEvent.attack({
            attacker: attack.defender,
            defender: attack.attacker,
            isFatal: attacker.currentHealth === 0,
        });
        combatEvents.push(counterattackEvent);
    }

    let combatStateTransition = {
        gameStateAfter: {
            ...gameState,
            characters: {
                ...gameState.characters,
                [attacker.id]: attacker,
                [defender.id]: defender,
            }
        },
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
            let eventRoomId = event.fromRoom;
            let eventRoom = gameState.rooms[eventRoomId];
            eventRoom.triggers.forEach(trigger => {
                if (isType(trigger, Trigger.move)) {
                    // Determine if the direction triggers the trigger
                    if (event.exit === trigger.exit) {
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

        // Don't continue triggering events once the game is over
        if (gameState.isGameOver) {
            break;
        }
    }

    if (!gameState.isGameOver) {
        // Check for player death
        if (gameState.characters[gameState.player].currentHealth === 0) {
            // Transition to gameOver=true with a GameOver Event
            gameEvents = [...gameEvents, GameEvent.gameOver()];
            gameState = {
                ...gameState,
                isGameOver: true,
            };
        }
    }

    return {
        gameStateAfter: gameState,
        events: gameEvents,
    };
}