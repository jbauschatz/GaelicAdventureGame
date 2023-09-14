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
     * 
     */
    rooms: Record<string, Room>,

    /**
     * 
     */
    characters: Record<string, Character>,

    /**
     * 
     */
    items: Record<string, Item>,

    /**
     * The Player Character playing this game
     */
    player: string,

    /**
     * The current room the Player Character is in, which is the game's narrative focus
     */
    room: string,

}
