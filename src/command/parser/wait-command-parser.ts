import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const WAIT_COMMAND_PARSER: CommandParser = {
    l1: 'wait',
    l2: 'fuirich',
    getCommandPreviews(gameState: GameState) {
        return [
            {
                l1Prompt: "wait",
                l2Prompt: "fuirich",
                l1PreviewText: "wait",
                l2PreviewText: "fuirich",
                enabled: true,
                isComplete: true,
                followUpPreviews: [],
                command: GameCommand.wait({actor: gameState.player}),
            }
        ]
    },
    helpText: {l1: 'Wait for one turn', l2: 'Fuirich ...'},
    parse: (rest: string, gameState: GameState): GameCommand => {
        return GameCommand.help();
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['wait'],
            l2: ['fuirich']
        };
    }
}