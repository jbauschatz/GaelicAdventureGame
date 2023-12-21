import { TypeNames, VariantOf, fields, match, variant } from "variant"
import { GaelicPersonGenderNumber } from "./gaelic-person-gender-number"
import { getGaelicPronoun } from "./gaelic-util";

export type GaelicNoun = {
    definite: string,
    indefinite: string,
    dative: string,
    personGenderNumber: GaelicPersonGenderNumber,
}

export const GaelicNounPhrase = variant({
    pronoun: fields<{
        personGenderNumber: GaelicPersonGenderNumber,
    }>(),
    properName: fields<{
        base: string,
        vocative: string,
        personGenderNumber: GaelicPersonGenderNumber,
    }>(),
    bareNoun: fields<{
        noun: GaelicNoun,
    }>(),
});

export type GaelicNounPhrase<T extends TypeNames<typeof GaelicNounPhrase> = undefined>
     = VariantOf<typeof GaelicNounPhrase, T>;

export function makeGaelicIndefinite(nounPhrase: GaelicNounPhrase, isAfterRelativeFutureConditional: boolean = false): string {
    return match(nounPhrase, {
        bareNoun: bareNoun => bareNoun.noun.indefinite,
        pronoun: pronoun => getGaelicPronoun(pronoun.personGenderNumber, isAfterRelativeFutureConditional),
        properName: properName => properName.base,
    });
}

export function makeGaelicDefinite(nounPhrase: GaelicNounPhrase, isAfterRelativeFutureConditional: boolean = false): string {
    return match(nounPhrase, {
        bareNoun: bareNoun => bareNoun.noun.definite,
        pronoun: pronoun => getGaelicPronoun(pronoun.personGenderNumber, isAfterRelativeFutureConditional),
        properName: properName => properName.base,
    });
}

export function makeGaelicDative(nounPhrase: GaelicNounPhrase): string {
    return match(nounPhrase, {
        bareNoun: bareNoun => bareNoun.noun.dative,
        pronoun: pronoun => getGaelicPronoun(pronoun.personGenderNumber, false),
        properName: properName => properName.base,
    });
}

export function getGaelicPersonGenderNumber(nounPhrase: GaelicNounPhrase): GaelicPersonGenderNumber {
    return match(nounPhrase, {
        bareNoun: bareNoun => bareNoun.noun.personGenderNumber,
        pronoun: pronoun => pronoun.personGenderNumber,
        properName: properName => properName.personGenderNumber,
    });
}