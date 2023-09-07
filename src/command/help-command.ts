import { GameEvent } from "../event/game-event";
import { GameState } from "../model/game/game-state";
import { Command } from "./command";

export const GAELIC_HELP_COMMAND = 'cuideachadh';

export const HELP_COMMAND: Command = {
    l1: 'help',
    l2: GAELIC_HELP_COMMAND,
    helpText: {l1: 'Get help', l2: 'Faigh ' + GAELIC_HELP_COMMAND},
    execute: (rest: string, gameState: GameState) => {
        return {
            gameStateAfter: gameState,
            event: GameEvent.help()
        };
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['help'],
            l2: [GAELIC_HELP_COMMAND]
        };
    }
}
