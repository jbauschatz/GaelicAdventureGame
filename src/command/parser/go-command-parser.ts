import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const GO_COMMAND_PARSER: CommandParser = {
    l1: 'go',
    l2: 'rach',
    getCommandPreviews: (gameState: GameState) => {
        let exits = gameState.rooms[gameState.currentRoom].exits;

        return {
            l1: [{
                prompt: "go...",
                previewText: "go __________",
                enabled: true,
                isComplete: false,
                followUpPreviews: exits.map(exit => ({
                    prompt: exit.direction.l1,
                    previewText: "go " + exit.direction.l1,
                    enabled: true,
                    isComplete: true,
                    followUpPreviews: [],
                    command: GameCommand.move({
                        actor: gameState.player,
                        fromRoom: gameState.currentRoom,
                        toDirection: exit.direction,
                        toRoom: exit.room,
                    }),
                })),
                command: undefined,
            }],
            l2: [{
                prompt: "rach...",
                previewText: "rach __________",
                enabled: true,
                isComplete: false,
                followUpPreviews: exits.map(exit => ({
                    prompt: exit.direction.l2,
                    previewText: "rach " + exit.direction.l2,
                    enabled: true,
                    isComplete: true,
                    followUpPreviews: [],
                    command: GameCommand.move({
                        actor: gameState.player,
                        fromRoom: gameState.currentRoom,
                        toDirection: exit.direction,
                        toRoom: exit.room,
                    }),
                })),
                command: undefined,
            }]
        };
    },
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