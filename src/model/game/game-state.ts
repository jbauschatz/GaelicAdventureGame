import { Character } from "./character";
import { Room } from "./room";

/**
 * The state of a game at a point in time.
 * 
 * This is to be treated as an immutable object - changes to game state are represented as transitions from
 * one GameState to another.
 */
export type GameState = {
    /**
     * The Player Character playing this game
     */
    player: Character,

    /**
     * The current room the Player Character is in, which is the game's narrative focus
     */
    room: Room,
}
