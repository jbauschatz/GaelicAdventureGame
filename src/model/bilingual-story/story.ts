import { BilingualText } from "./language";

export type Heading = {heading: BilingualText}

export type ParagraphElement = BilingualText | string;

export type Paragraph = {paragraphElements: Array<ParagraphElement>};

/**
 * Exact record of the command a user entered
 */
export type UserInput = {input: string}

export type StoryElement = Paragraph | Heading | UserInput

export type Story = Array<StoryElement>;

export type StoryState = {
    story: Story;
}