import { EnglishPersonGenderNumber } from "./english-person-gender-number"

export type EnglishNoun = {
    base: string,
    definite: string,
    indefinite: string,
    personGenderNumber: EnglishPersonGenderNumber,
}
