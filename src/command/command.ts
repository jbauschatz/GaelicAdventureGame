import { GameEvent } from "../event/game-event"
import { BilingualText } from "../model/bilingual-story/bilingual-text"
import { GameState } from "../model/game/game-state"

/**
 * A command that can be executed in the game.
 * 
 * This handles a lot of different concerns including:
 * - how the player executes the command
 * - how the command modifies the Game State
 * - how the command's effects are narrated to the player
 * 
 * This means there is little separation of concerns but it allows for rapidly adding a command
 */
export type Command = {
    l1: string,
    l2: string,
    helpText: BilingualText,
    execute: (rest: string, gameState: GameState) => {event: GameEvent, gameStateAfter: GameState},
    getValidCommands: (gameState: GameState) => {
        l1: Array<String>,
        l2: Array<String>
    }
}