import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const GO_COMMAND_PARSER: CommandParser = {
    l1: 'go',
    l2: 'rach',
    helpText: {l1: 'Go in a direction', l2: 'Rach ann an rathad'},
    parse: (rest: string, gameState: GameState) => {
        // Validate that a full command was received
        if (!rest) {
            return GameEvent.commandValidation({
                message: {
                    l1: 'Type "go" and then the direction you would like to go',
                    l2: '[Type "go" and then the direction you would like to go]'
                }
            });
        }

        let playerRoom = gameState.rooms[gameState.currentRoom];
        let exit = playerRoom.exits.find(exit => exit.direction.l1 === rest || exit.direction.l2 === rest);

        // Validate that a proper exit was identified
        if (!exit) {
            return GameEvent.commandValidation({
                message: {
                    l1: `You cannot go "${rest}".`,
                    l2: `Chan fhaodaidh sibh a dhol "${rest}".`
                }
            });
        }

        return GameCommand.move({
            actor: gameState.player,
            fromRoom: gameState.currentRoom,
            toDirection: exit.direction,
            toRoom: exit.room,
        });
    },
    getValidCommands: (gameState: GameState) => {
        let playerRoom = gameState.rooms[gameState.currentRoom];
        return {
            l1: playerRoom.exits.map(exit => 'go ' + exit.direction.l1),
            l2: playerRoom.exits.map(exit => 'rach ' + exit.direction.l2),
        };
    }
}