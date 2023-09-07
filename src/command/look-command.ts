
import { GameState } from "../model/game/game-state";
import { Command } from "./command";
import { GameEvent } from "../event/game-event";

export const LOOK_COMMAND: Command = {
    l1: 'look',
    l2: 'seall',
    helpText: {l1: 'Look around', l2: 'Seall mun cuairt'},
    execute: (rest: string, gameState: GameState) => {
        return {
            gameStateAfter: gameState,
            event: GameEvent.look(),
        };
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['look'],
            l2: ['seall'],
        };
    }
}
