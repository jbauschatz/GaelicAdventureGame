import { BilingualText } from "../bilingual-story/bilingual-text"
import { Paragraph } from "../bilingual-story/story"
import { Character } from "./character"
import { Item } from "./item"

/**
 * A Room that exists somewhere in the game's world
 */
export type Room = {
    /**
     * Name of the Room to be displayed in narration
     */
    name: BilingualText,

    /**
     * Description of the Room to be narrated
     */
    description: Paragraph,

    /**
     * Current occupants of the Room, possibly including the Player Character
     */
    characters: Array<Character>,

    /**
     * Items that are found in the Room
     */
    items: Array<Item>,

    /**
     * Possible ways to move from this Room to another Room
     */
    exits: Array<{direction: BilingualText, room: Room}>
}