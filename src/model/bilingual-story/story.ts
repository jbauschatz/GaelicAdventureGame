import {variant, fields, VariantOf, TypeNames} from 'variant';
import { BilingualText } from "./bilingual-text";

/**
 * Holds the state of the narration of all game play up to this point
 */
export type StoryState = {
    story: Story;
}

/**
 * A narration of the events of the game thus far.
 * 
 * This includes ALL text that should be displayed, in a variety of formats.
 */
export type Story = Array<StoryElement>;

export const StoryElement = variant({
    paragraph: fields<{sentences: Array<ParagraphElement>}>(),
    heading: fields<{heading: BilingualText}>(),
    userInput: fields<{input: string}>(),
});
export type StoryElement<T extends TypeNames<typeof StoryElement> = undefined>
     = VariantOf<typeof StoryElement, T>;

export const ParagraphElement = variant({
    bilingual: fields<{bilingual: BilingualText}>(),
    staticText: fields<{text: string}>(),
});
export type ParagraphElement<T extends TypeNames<typeof ParagraphElement> = undefined>
     = VariantOf<typeof ParagraphElement, T>;