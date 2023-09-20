import { EnglishNoun } from "../language/english/english-noun"
import { GaelicNoun } from "../language/gaelic/gaelic-noun"

export type BilingualName = {
    english: EnglishNoun;
    gaelic: GaelicNoun;
}