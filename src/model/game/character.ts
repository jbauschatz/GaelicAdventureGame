
import { BilingualText } from "../bilingual-story/bilingual-text";
import { Item } from "./item";

/**
 * A Character in the game such as the Player Character, an enemy, or other NPC.
 */
export type Character = {
    name: BilingualText,
    items: Array<Item>,
}
