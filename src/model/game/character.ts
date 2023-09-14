
import { BilingualText } from "../bilingual-story/bilingual-text";

/**
 * A Character in the game such as the Player Character, an enemy, or other NPC.
 */
export type Character = {
    id: string,
    name: BilingualText,
    items: Array<string>,
}
