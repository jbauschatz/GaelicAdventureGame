import { GameEvent } from "../event/game-event"
import { Story } from "../model/bilingual-story/story"
import { GameState } from "../model/game/game-state"

export type Narrator = {
    narrateEvent: (event: GameEvent, gameStateBefore: GameState, gameStateAfter: GameState) => Story
}