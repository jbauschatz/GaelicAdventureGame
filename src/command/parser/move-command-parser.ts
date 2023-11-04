import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const MOVE_COMMAND_PARSER: CommandParser = {
    l1: 'go',
    l2: 'rach',
    getCommandPreviews: (gameState: GameState) => {
        let player = gameState.characters[gameState.player];
        let exits = gameState.rooms[player.room].exits;

        return [
            {
                l1Prompt: "go...",
                l2Prompt: "rach...",
                l1PreviewText: "go __________",
                l2PreviewText: "rach __________",
                enabled: true,
                isComplete: false,
                followUpPreviews: exits.map(exit => ({
                    l1Prompt: exit.direction.l1,
                    l2Prompt: exit.direction.l2,
                    l1PreviewText: "go " + exit.direction.l1,
                    l2PreviewText: "rach " + exit.direction.l2,
                    enabled: true,
                    isComplete: true,
                    followUpPreviews: [],
                    command: GameCommand.move({
                        actor: gameState.player,
                        exit: exit.id,
                    }),
                })),
                command: undefined,
            },
        ]
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

        let player = gameState.characters[gameState.player];
        let playerRoom = gameState.rooms[player.room];
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
            exit: exit.id,
        });
    },
    getValidCommands: (gameState: GameState) => {
        let player = gameState.characters[gameState.player];
        let exits = gameState.rooms[player.room].exits;
        return {
            l1: exits.map(exit => 'go ' + exit.direction.l1),
            l2: exits.map(exit => 'rach ' + exit.direction.l2),
        };
    }
}