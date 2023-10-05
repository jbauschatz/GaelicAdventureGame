import { GameEvent } from "../../event/game-event"
import { BilingualText } from "../../model/bilingual-text"
import { GameState } from "../../model/game/game-state"
import { GameCommand } from "../game-command"
import { CommandPreview } from "./command-preview"

/**
 * An object that can parse one type of GameCommand from user input
 */
export type CommandParser = {
    /**
     * Keyword for executing the command in L1, for example "get"
     */
    l1: string,

    /**
     * Keyword for executing the command in L2, for example "faigh"
     */
    l2: string,

    getCommandPreviews: (gameState: GameState) => {
        l1: Array<CommandPreview>,
        l2: Array<CommandPreview>,
    }

    /**
     * Text that is displayed to explain this command to the user
     */
    helpText: BilingualText,

    /**
     * Parse the given input as a {@link GameCommand} which is valid in the current GameState, or a 
     * {@link GameEvent} indicating how the input was invalid
     */
    parse: (commandSubstring: string, gameState: GameState) => GameCommand | GameEvent<'commandValidation'>,

    /**
     * Gets lists of valid ways to execute this command in l1 and l2
     * 
     * For example {
     *  l1: ["get sword", "get knife"]
     *  l1: ["faigh claidheamh", "faigh sgian"]
    *  }
     */
    getValidCommands: (gameState: GameState) => {
        l1: Array<String>,
        l2: Array<String>
    }
}