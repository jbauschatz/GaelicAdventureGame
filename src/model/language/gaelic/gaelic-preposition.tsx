import { GaelicPersonGenderNumber } from "./gaelic-person-gender-number"

export type GaelicPreposition = {
    baseForm: string,
    pronominalForms: Record<GaelicPersonGenderNumber, string>,
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
    }
}