import { GameEvent } from "../event/game-event"
import { BilingualText } from "../model/bilingual-story/bilingual-text"
import { GameState } from "../model/game/game-state"

/**
 * A command that can be executed in the game.
 * 
 * This handles a couple of different concerns including:
 * - how the player executes the command
 * - how the command modifies the Game State
 * - what GameEvents are produced indicating the change in GameState
 * 
 * This means there is little separation of concerns but it allows for rapidly adding a command
 */
export type Command = {
    /**
     * Keyword for executing the command in L1, for example "get"
     */
    l1: string,

    /**
     * Keyword for executing the command in L2, for example "faigh"
     */
    l2: string,

    /**
     * Text that is displayed to explain this command to the user
     */
    helpText: BilingualText,

    /**
     * Execute this command and return a GameState transition
     */
    execute: (commandSubstring: string, gameState: GameState) => {event: GameEvent, gameStateAfter: GameState},

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