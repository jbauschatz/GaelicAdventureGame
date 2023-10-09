import { GameState } from "../../model/game/game-state";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";

export const INVENTORY_COMMAND_PARSER: CommandParser = {
    l1: 'inventory',
    l2: 'maoin-chunntas',
    getCommandPreviews: (_: GameState) => {
        return [
            {
                l1Prompt: "inventory",
                l2Prompt: "maoin-chunntas",
                l1PreviewText: "inventory",
                l2PreviewText: "maoin-chunntas",
                enabled: true,
                isComplete: true,
                followUpPreviews: [],
                command: GameCommand.inventory(),
            }
        ];
    },
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