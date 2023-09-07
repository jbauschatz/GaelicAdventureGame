import { GameEvent } from "../event/game-event";
import { GameState } from "../model/game/game-state";
import { Command } from "./command";

export const INVENTORY_COMMAND: Command = {
    l1: 'inventory',
    l2: 'maoin-chunntas',
    helpText: {l1: '...', l2: '...'},
    execute: (rest: string, gameState: GameState) => {
        return {
            gameStateAfter: gameState,
            event: GameEvent.inventory()
        };
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['inventory'],
            l2: ['maoin-chunntas']
        };
    }
}