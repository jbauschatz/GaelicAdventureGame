import { Character } from "./character";
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
     * The current room the Player Character is in, which is the game's narrative focus
     */
    currentRoom: string,

    /**
     * {@link Character} ids in order they take their turns
     */
    characterTurnOrder: Array<string>,

    /**
     * Id of the {@link Character} whose turn it currently is
     */
    characterWithTurn: string,
}
