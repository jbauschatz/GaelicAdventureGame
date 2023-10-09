import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const GAELIC_HELP_COMMAND = 'cuideachadh';

export const HELP_COMMAND_PARSER: CommandParser = {
    l1: 'help',
    l2: GAELIC_HELP_COMMAND,
    getCommandPreviews(_: GameState) {
        return [
            {
                l1Prompt: "help",
                l2Prompt: GAELIC_HELP_COMMAND,
                l1PreviewText: "help",
                l2PreviewText: GAELIC_HELP_COMMAND,
                enabled: true,
                isComplete: true,
                followUpPreviews: [],
                command: GameCommand.help(),
            }
        ]
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
