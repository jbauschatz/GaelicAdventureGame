import { match } from "variant"
import { GameEvent } from "../event/game-event"
import { GameState } from "../model/game/game-state"
import { GameCommand } from "./game-command"
import _ from "lodash"

export type GameStateTransition = {
    events: Array<GameEvent>,
    gameStateAfter: GameState,
}

export function executeCommand(command: GameCommand, gameState: GameState): GameStateTransition {
    return match(command, {
        move: (moveCommand: GameCommand<'move'>) => executeMoveCommand(moveCommand, gameState),
        takeItem: (takeItem: GameCommand<'takeItem'>) => executeTakeItem(takeItem, gameState),
        attack: (attack: GameCommand<'attack'>) => executeAttack(attack, gameState),
        look: () => executeLookCommand(gameState),
        help: () => executeHelpCommand(gameState),
        inventory: () => executeInventoryCommand(gameState),
    });
}

function executeMoveCommand(move: GameCommand<'move'>, gameState: GameState): GameStateTransition {
    let playerRoom = gameState.rooms[gameState.currentRoom];
    let exit = playerRoom.exits.find(exit => exit.direction === move.toDirection);
    let newRoom = exit!.room;

    // Move the Player into the new room
    let gameStateAfter = {
        ...gameState,
        currentRoom: newRoom,
    };

    return {
        gameStateAfter,
        events: [GameEvent.move({
            actor: gameState.player,
            fromRoom: gameState.currentRoom,
            toRoom: gameStateAfter.currentRoom,
            toDirection: exit!.direction,
        })],
    };
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

    return {
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
}

function executeAttack(attack: GameCommand<'attack'>, gameState: GameState): GameStateTransition {
    let defender = gameState.characters[attack.defender];
    let attacker = gameState.characters[attack.attacker];

    // Apply damage to the defender
    defender = {
        ...defender,
        currentHealth: defender.currentHealth - 1,
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
            currentHealth: attacker.currentHealth - 1,
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

    // Check for an end of game condition after combat
    return resolveTriggerConditions(combatStateTransition);
}

function executeLookCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        events: [GameEvent.look()],
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
 * Evaluate the {@link GameState} and see if any triggers should be triggered.
 * 
 * If any triggers go off, return a modified {@link GameStateTransition} indicating the new state, and including any {@link GameEvent}s that represent the trigger.
 */
function resolveTriggerConditions(gameStateTransition: GameStateTransition): GameStateTransition {
    let gameState = gameStateTransition.gameStateAfter;

    // Trigger player death
    if (gameState.characters[gameState.player].currentHealth === 0) {
        // Transition to gameOver=true with a GameOver Event
        return {
            events: [...gameStateTransition.events, GameEvent.gameOver()],
            gameStateAfter: {
                ...gameState,
                isGameOver: true,
            },
        };
    }

    // No triggers resolve so return unmodified transition
    return gameStateTransition;
}