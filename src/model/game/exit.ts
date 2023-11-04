import { BilingualText } from "../bilingual-text";

export type Exit = {
    id: string,
    direction: BilingualText,
    directionReverse: BilingualText,
    room: string,
}