import _ from "lodash";
import { EnglishNoun } from "./english-noun";
import { EnglishPersonGenderNumber } from "./english-person-gender-number";

export function capitalizeEnglish(input: string): string {
    return _.capitalize(input);
}

export function makeEnglishPossessive<WrapperType>(
    noun: EnglishNoun,
    personGenderNumber: EnglishPersonGenderNumber,
    wrapFunction: (word: string) => WrapperType
): Array<string | WrapperType> {
    if (personGenderNumber === 'you') {
        return [
            "your ",
            wrapFunction(noun.base),
        ];
    }

    if (personGenderNumber === 'it') {
        return [
            "its ",
            wrapFunction(noun.base),
        ];
    }

    // TODO support additional person/gender/number
    return [];
}