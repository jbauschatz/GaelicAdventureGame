import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const GAELIC_HELP_COMMAND = 'cuideachadh';

export const HELP_COMMAND_PARSER: CommandParser = {
    l1: 'help',
    l2: GAELIC_HELP_COMMAND,
    getCommandPreviews(gameState: GameState) {
        return {
            l1: [{
                prompt: "help",
                previewText: "help",
                enabled: true,
                isComplete: true,
                followUpPreviews: [],
                command: GameCommand.help(),
            }],
            l2: [{
                prompt: GAELIC_HELP_COMMAND,
                previewText: GAELIC_HELP_COMMAND,
                enabled: true,
                isComplete: true,
                followUpPreviews: [],
                command: GameCommand.help(),
            }]
        };
    },
    helpText: {l1: 'Get help', l2: 'Faigh ' + GAELIC_HELP_COMMAND},
    parse: (rest: string, gameState: GameState): GameCommand => {
        return GameCommand.help();
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['help'],
            l2: [GAELIC_HELP_COMMAND]
        };
    }
}
