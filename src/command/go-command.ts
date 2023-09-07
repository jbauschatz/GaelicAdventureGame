import { GameEvent } from "../event/game-event";
import { GameState } from "../model/game/game-state";
import { Command } from "./command";

export const GO_COMMAND: Command = {
    l1: 'go',
    l2: 'rach',
    helpText: {l1: 'Go in a direction', l2: 'Rach ann an rathad'},
    execute: (rest: string, gameState: GameState) => {
        if (!rest) {
            return {
                gameStateAfter: gameState,
                event: GameEvent.commandValidation({
                    message: {
                        l1: 'Type "go" and then the direction you would like to go',
                        l2: '[Type "go" and then the direction you would like to go]'
                    }
                })
            };
        }

        let exit = gameState.room.exits.find(exit => exit.direction.l1 === rest || exit.direction.l2 === rest);
        if (!exit) {
            return {
                gameStateAfter: gameState,
                event: GameEvent.commandValidation({
                    message: {
                        l1: `You cannot go "${rest}".`,
                        l2: `Chan fhaodaidh sibh a dhol "${rest}".`
                    }
                })
            };
        }

        let newRoom = exit.room;

        // Move the Player into the new room
        let gameStateAfter = {
            ...gameState,
            room: newRoom
        };

        return {
            gameStateAfter,
            event: GameEvent.move({
                actor: gameState.player,
                fromRoom: gameState.room,
                toRoom: gameStateAfter.room,
                toDirection: exit?.direction,
            })
        };
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: gameState.room.exits.map(exit => 'go ' + exit.direction.l1),
            l2: gameState.room.exits.map(exit => 'rach ' + exit.direction.l2),
        };
    }
}