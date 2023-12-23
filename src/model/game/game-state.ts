import { Character } from "./character";
import { EndOfGameCondition } from "./end-of-game-condition";
import { Item } from "./item";
import { Room } from "./room";

/**
 * The state of a game at a point in time.
 * 
 * This is to be treated as an immutable object - changes to game state are represented as transitions from
 * one GameState to another.
 */
export type GameState = {
        
    /**
     * Whether the game is currently over.
     * 
     * If true, all gameplay should cease.
     */
    isGameOver: boolean,

    /**
     * End of Game Conditions, which will be checked after every side-effect
     */
    endOfGameConditions: Array<EndOfGameCondition>,

    /**
     * Map of all Rooms in the game by their ids
     */
    rooms: Record<string, Room>,

    /**
     * Map of all Characters in the game by their ids
     */
    characters: Record<string, Character>,

    /**
     * Map of all items in the game by their ids
     */
    items: Record<string, Item>,

    /**
     * The Player Character playing this game
     */
    player: string,

    /**
     * {@link Character} ids in order they take their turns
     */
    characterTurnOrder: Array<string>,

    /**
     * Id of the {@link Character} whose turn it currently is
     */
    characterWithTurn: string,
}
