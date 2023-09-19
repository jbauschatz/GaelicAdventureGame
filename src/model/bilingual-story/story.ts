import { variant, fields, VariantOf, TypeNames } from 'variant';
import { BilingualText } from "../bilingual-text";

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

/**
 * Indicates the "topic" of some narration, which may indicate how it should be formatted of displayed to the user.
 */
export type Topic = 'narrative' | 'combat';

export const StoryElement = variant({
    paragraph: (
        sentences: Array<ParagraphElement>,
        topic: Topic = 'narrative',
    ) => ({
        sentences,
        topic,
    }),
    heading: fields<{
        heading: BilingualText
    }>(),
    userInput: fields<{
        input: string
    }>(),
});
export type StoryElement<T extends TypeNames<typeof StoryElement> = undefined>
     = VariantOf<typeof StoryElement, T>;

export const ParagraphElement = variant({
    /**
     * Bilingual text which could be displayed in either language.
     */
    bilingual: fields<{
        l1: StoryText,
        l2: StoryText,
    }>(),

    /**
     * Text appearing in the paragraph which is not translatable but fixed in one representation.
     * 
     * This will usually include short sections of punctuation, like ", ", between other bilingual elements.
     */
    staticText: fields<{text: string}>(),
});
export type ParagraphElement<T extends TypeNames<typeof ParagraphElement> = undefined>
     = VariantOf<typeof ParagraphElement, T>;

/**
 * The lowest level text element appearing in the {@link Story}.
 * 
 * This text can be plain or include a mixture of plain text and entity references
 */
export type StoryText = string | Array<string | EntityReference>;

/**
 * Text which is tagged as a reference to some game entity.
 * 
 * This text might be formatted or have a tooltip to reflect data about the entity.
 */
export type EntityReference = { entity: any, text: string }

/**
 * Creates a {@link EntityReference} for the given entity and text.
 */
export function ref(entity: any, text: string) {
    return {entity, text}
}