import { buildOxfordCommaList } from "../../bilingual-story/language";
import { Paragraph } from "../../bilingual-story/story";
import { GameState } from "../game";
import { Command } from "./command-parser";

export const INVENTORY_COMMAND: Command = {
    l1: 'inventory',
    l2: 'maoin-chunntas',
    helpText: {l1: '...', l2: '...'},
    execute: (rest: string, gameState: GameState) => {
        let paragraph: Paragraph;

        if (gameState.player.items.length > 0) {
            // List items in inventory
            paragraph = {
                paragraphElements: [
                    {l1: "You have:", l2: "Agaibh:"},
                    ...buildOxfordCommaList(gameState.player.items.map(item => item.name))
                ]
            }
        } else {
            // No items in inventory
            paragraph = {
                paragraphElements: [
                    {l1: "You don't have anything.", l2: "Chan eil dad agaibh."},
                ]
            }
        }

        return {
            gameState,
            story: [paragraph]
        }
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['inventory'],
            l2: ['maoin-chunntas']
        }
    }
}