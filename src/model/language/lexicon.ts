import { BilingualName } from "../game/name";
import { GaelicNounPhrase } from "./gaelic/gaelic-noun";

export const PRONOUN_YOU_SINGULAR: BilingualName = {
    english: {
        base: 'you',
        indefinite: 'you',
        definite: 'you',
        personGenderNumber: 'you',
    },
    gaelic: GaelicNounPhrase.pronoun({
        personGenderNumber: 'you (s)',
    }),
};

export const NOUN_SKELETON: BilingualName = {
    english: {
        base: 'skeleton',
        indefinite: 'a skeleton',
        definite: 'the skeleton',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'cnàimhneach',
            definite: 'an cnàimhneach',
            dative: "a' chnàimhneach",
            personGenderNumber: 'he',
        },
    }),
};

export const NOUN_BIG_SPIDER: BilingualName = {
    english: {
        base: 'big spider',
        indefinite: 'a big spider',
        definite: 'the big spider',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'damhan-allaidh mòr',
            definite: 'an damhan-allaidh mòr',
            dative: 'an damhan-alluidh mhòr',
            personGenderNumber: 'he',
        },
    }),
};

export const NOUN_BIG_RAT: BilingualName = {
    english: {
        base: 'big rat',
        indefinite: 'a big rat',
        definite: 'the big rat',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'radan mòr',
            definite: 'an radan mòr',
            dative: 'an radan mhòr',
            personGenderNumber: 'he',
        },
    }),
};

export const NOUN_SWORD: BilingualName = {
    english: {
        base: 'sword',
        indefinite: 'a sword',
        definite: 'the sword',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'claidheamh',
            definite: 'an claidheamh',
            dative: "a' chlaidheamh",
            personGenderNumber: 'he',
        },
    }),
};

export const NOUN_HAMMER: BilingualName = {
    english: {
        base: 'hammer',
        indefinite: 'a hammer',
        definite: 'the hammer',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'òrd',
            definite: 'an t-òrd',
            dative: "an òrd",
            personGenderNumber: 'he',
        },
    }),
};

export const NOUN_DAGGER: BilingualName = {
    english: {
        base: 'dagger',
        indefinite: 'a dagger',
        definite: 'the dagger',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'biodag',
            definite: "a' bhiodag",
            dative: "a' bhiodaig",
            personGenderNumber: 'she',
        },
    }),
};

export const NOUN_FANCY_DAGGER: BilingualName = {
    english: {
        base: 'gilded dagger',
        indefinite: 'a gilded dagger',
        definite: 'the gilded dagger',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'biodag òrail',
            definite: "a' bhiodag òrail",
            dative: "a' bhiodaig òrail",
            personGenderNumber: 'she',
        },
    }),
};

export const NOUN_KEY: BilingualName = {
    english: {
        base: 'key',
        indefinite: 'a key',
        definite: 'the key',
        personGenderNumber: 'it',
    },
    gaelic: GaelicNounPhrase.bareNoun({
        noun: {
            indefinite: 'iuchair',
            definite: 'an iuchair',
            dative: 'an iuchair',
            personGenderNumber: 'he',
        },
    }),
};
