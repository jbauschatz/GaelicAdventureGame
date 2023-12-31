import { BilingualText } from "../bilingual-text"
import { StoryElement } from "../bilingual-story/story"
import { Trigger } from "./trigger"
import { Exit } from "./exit"

/**
 * A Room that exists somewhere in the game's world
 */
export type Room = {
    /**
     * 
     */
    id: string,

    /**
     * Name of the Room to be displayed in narration
     */
    name: BilingualText,

    /**
     * Description of the Room to be narrated
     */
    description: StoryElement<'paragraph'>,

    /**
     * Ids of current occupants of the Room, possibly including the Player Character
     */
    characters: Array<string>,

    /**
     * Ids of items that are found in the Room
     */
    items: Array<string>,

    /**
     * Possible ways to move from this Room to another Room
     */
    exits: Array<Exit>,

    /**
     * 
     */
    triggers: Array<Trigger>,
}