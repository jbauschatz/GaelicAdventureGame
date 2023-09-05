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

/**
 * Any kind of text which should be displayed in the narration
 */
export type StoryElement = Paragraph | Heading | UserInput

/**
 * A series of text elements that shoud be grouped in a paragraph, which may appear in
 * one or both languages.
 */
export type Paragraph = {paragraphElements: Array<ParagraphElement>};

export type ParagraphElement = BilingualText | string;

/**
 * Primary header text which introduces a new paragraph or narrative section
 */
export type Heading = {heading: BilingualText}

/**
 * Exact record of the command a user entered
 */
export type UserInput = {input: string}
