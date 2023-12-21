import _ from "lodash";
import { EnglishNoun } from "./english-noun";
import { EnglishPersonGenderNumber } from "./english-person-gender-number";
import { EntityReference } from "../../bilingual-story/story";

export function capitalizeEnglish(input: string | EntityReference): string | EntityReference {
    if (typeof input === 'string') {
        return _.capitalize(input);
    } else {
        return {
            entity: input.entity,
            text: _.capitalize(input.text),
        }
    }
}

export function getEnglishNominativePronoun(personGenderNumber: EnglishPersonGenderNumber) {
    return personGenderNumber;
}

export function makeEnglishPossessive<WrapperType>(
    ownerPersonGenderNumber: EnglishPersonGenderNumber,
    noun: EnglishNoun,
    wrapFunction: (word: string) => WrapperType
): Array<string | WrapperType> {
    let pronoun = {
        'I': 'my',
        'we': 'our',
        'you': 'your',
        'he': 'his',
        'she': 'her',
        'it': 'its',
        'they': 'their',
    }[ownerPersonGenderNumber];

    return [
        pronoun + " ",
        wrapFunction(noun.base),
    ];
}

export function conjugateEnglishVerb(youWeThey: string, heSheIt: string, personGenderNumber: EnglishPersonGenderNumber) {
    if (['he', 'she', 'it'].includes(personGenderNumber)) {
        return heSheIt;
    } else {
        return youWeThey;
    }
}