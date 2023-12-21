import { GaelicPersonGenderNumber } from "./gaelic-person-gender-number"

export type GaelicPreposition = {
    baseForm: string,
    pronominalForms: Record<GaelicPersonGenderNumber, string>,
    takesTheGenitive: boolean,
}

export const GAELIC_PREPOSITION_AIG: GaelicPreposition = {
    baseForm: 'aig',
    pronominalForms: {
        ['I']: 'agam',
        ['we']: 'againn',
        ['you (s)']: 'agad',
        ['you (pl)']: 'agaibh',
        ['he']: 'aige',
        ['she']: 'aice',
        ['they']: 'aca'
    },
    takesTheGenitive: true,
};

export const GAELIC_PREPOSITION_AIR: GaelicPreposition = {
    baseForm: 'air',
    pronominalForms: {
        ['I']: 'orm',
        ['we']: 'oirnn',
        ['you (s)']: 'ort',
        ['you (pl)']: 'oirbh',
        ['he']: 'air',
        ['she']: 'oirre',
        ['they']: 'orra'
    },
    takesTheGenitive: true,
};