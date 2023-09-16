import { match } from "variant"
import { GameEvent } from "../event/game-event"
import { GameState } from "../model/game/game-state"
import { GameCommand } from "./game-command"
import _ from "lodash"

export type GameStateTransition = {
    event: GameEvent,
    gameStateAfter: GameState,
}

export function executeCommand(command: GameCommand, gameState: GameState): GameStateTransition {
    return match(command, {
        move: (moveCommand: GameCommand<'move'>) => executeMoveCommand(moveCommand, gameState),
        takeItem: (takeItem: GameCommand<'takeItem'>) => executeTakeItem(takeItem, gameState),
        look: () => executeLookCommand(gameState),
        help: () => executeHelpCommand(gameState),
        inventory: () => executeInventoryCommand(gameState),
    });
}

function executeMoveCommand(move: GameCommand<'move'>, gameState: GameState): GameStateTransition {
    let playerRoom = gameState.rooms[gameState.currentRoom];
    let exit = playerRoom.exits.find(exit => exit.direction == move.toDirection);
    let newRoom = exit!.room;

    // Move the Player into the new room
    let gameStateAfter = {
        ...gameState,
        currentRoom: newRoom,
    };

    return {
        gameStateAfter,
        event: GameEvent.move({
            actor: gameState.player,
            fromRoom: gameState.currentRoom,
            toRoom: gameStateAfter.currentRoom,
            toDirection: exit!.direction,
        }),
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
        event: GameEvent.takeItem({
            actor: gameState.player,
            item: takeItem.item,
        }),
    };
}

function executeLookCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        event: GameEvent.look(),
    };
}

function executeHelpCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        event: GameEvent.help()
    };
}

function executeInventoryCommand(gameState: GameState): GameStateTransition {
    return {
        gameStateAfter: gameState,
        event: GameEvent.inventory()
    };
}