
import { BilingualName } from "./name";

/**
 * A Character in the game such as the Player Character, an enemy, or other NPC.
 */
export type Character = {
    id: string,
    name: BilingualName,
    room: string,
    items: Array<string>,
    maxHealth: number,
    currentHealth: number,
}
