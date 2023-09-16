import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const INVENTORY_COMMAND_PARSER: CommandParser = {
    l1: 'inventory',
    l2: 'maoin-chunntas',
    helpText: {l1: '...', l2: '...'},
    parse: (rest: string, gameState: GameState): GameCommand => {
        return GameCommand.inventory();
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['inventory'],
            l2: ['maoin-chunntas']
        };
    }
}