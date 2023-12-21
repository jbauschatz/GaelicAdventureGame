import _ from "lodash";
import { GaelicNoun, GaelicNounPhrase, makeGaelicDefinite } from "./gaelic-noun";
import { GaelicPersonGenderNumber } from "./gaelic-person-gender-number";
import { GAELIC_PREPOSITION_AIG } from "./gaelic-preposition";

export function capitalizeGaelic(input: string): string {
    // TODO This should abide by Gaelic orthography, like capitalizing the "s" in "'S mise"
    return _.capitalize(input);
}

/**
 * Note: whether sn can lenite is dialect dependent
 */
export function leniteIfPossible(string: string): string {
    if (canLenite(string)) {
        return string[0] + 'h' + string.substring(1);
    } else {
        return string;
    }
}

/**
 * Note: whether sn can lenite is dialect dependent
 */
export function canLenite(string: string): boolean {
    if (string.length === 0) {
        return false;
    }

    // Certain two letter combinations can not lenite
    if (string.length >= 2) {
        let firstTwoChars = string.substring(0, 2);
        if (['sg', 'sn', 'sp', 'st'].includes(firstTwoChars)) {
            return false;
        }
    }

    // Words starting with certain first letters can lenite
    let firstLetter = string[0];
    return ['b', 'c', 'd', 'f', 'g', 'm', 'p', 's', 't'].includes(firstLetter);
}

export function getGaelicPronoun(personGenderNumber: GaelicPersonGenderNumber, isAfterRelativeFutureConditional: boolean = false): string {
    return {
        'I': 'mi',
        'we': 'sinn',
        'you (s)': isAfterRelativeFutureConditional ? 'tu' : 'thu',
        'he': 'e',
        'she': 'i',
        'you (pl)': 'sibh',
        'they': 'iad',
    }[personGenderNumber];
}

/**
 * Makes a possessive using the preposition "aig" (example: "an taigh agam" / "my house")
 */
export function makeGaelicPossessiveWithAig<WrapperType>(
    noun: GaelicNounPhrase,
    ownerPersonGenderNumber: GaelicPersonGenderNumber,
    wrapFunction: (word: string) => WrapperType
): Array<string | WrapperType> {
    return [
        wrapFunction(makeGaelicDefinite(noun)),
        ' ',
        GAELIC_PREPOSITION_AIG.pronominalForms[ownerPersonGenderNumber]
    ];
}

/**
 * Makes a possessive using a pronoun (do, mo, ur, etc)
 */
export function makeGaelicPronominalPossessive<WrapperType>(
    noun: GaelicNoun,
    personGenderNumber: GaelicPersonGenderNumber,
    wrapFunction: (word: string) => WrapperType
): Array<string | WrapperType> {
    if (personGenderNumber === 'you (s)') {
        // 2nd common singular - possessive "do" and the noun lenites if possible 
        return [
            "do ",
            wrapFunction(leniteIfPossible(noun.indefinite)),
        ];
    }

    if (personGenderNumber === 'he') {
        // 3rd Masculine - particle "a" and the noun lenites if possible
        return [
            "a ",
            wrapFunction(leniteIfPossible(noun.indefinite)),
        ];
    }

    // TODO support additional person/gender/number
    return [];
}