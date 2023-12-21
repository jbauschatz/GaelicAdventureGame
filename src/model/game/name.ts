import { EnglishNoun } from "../language/english/english-noun"
import { EnglishPersonGenderNumber } from "../language/english/english-person-gender-number";
import { GaelicNounPhrase } from "../language/gaelic/gaelic-noun"

export type BilingualName = {
    english: EnglishNoun;
    gaelic: GaelicNounPhrase;
}

export function buildProperName(
    english: string,
    englishPgn: EnglishPersonGenderNumber,
    gaelic: GaelicNounPhrase<'properName'>,
): BilingualName {
    return {
        english: {
            base: english,
            indefinite: english,
            definite: english,
            personGenderNumber: englishPgn,
        },
        gaelic,
    };
}