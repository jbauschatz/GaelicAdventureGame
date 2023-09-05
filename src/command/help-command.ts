import { Story } from "../model/bilingual-story/story"
import { GameState } from "../model/game/game-state";
import { Command, REGISTERED_COMMANDS } from "./command-parser"

export const GAELIC_HELP_COMMAND = 'cuideachadh';

export const HELP_COMMAND: Command = {
    l1: 'help',
    l2: GAELIC_HELP_COMMAND,
    helpText: {l1: 'Get help', l2: 'Faigh ' + GAELIC_HELP_COMMAND},
    execute: (rest: string, gameState: GameState) => {
        return {
            gameState,
            story: getHelpText()
        }
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['help'],
            l2: [GAELIC_HELP_COMMAND]
        }
    }
}

/**
 * Builds help text which describes each command
 */
function getHelpText(): Story {
    return REGISTERED_COMMANDS.map(command => {
        return {paragraphElements: [
            {l1: command.l1, l2: command.l2},
            ': ',
            command.helpText
        ]};
    });
}