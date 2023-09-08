import _ from "lodash";
import { findItemByName } from "./command-parser";
import { GameState } from "../model/game/game-state";
import { Command } from "./command";
import { GameEvent } from "../event/game-event";

export const TAKE_COMMAND: Command = {
    l1: 'take',
    l2: 'gabh',
    helpText: {l1: 'Take something', l2: 'Gabh rudeigin'},
    execute: (rest: string, gameState: GameState) => {
        let itemsByName = findItemByName(rest, gameState.room.items);
        if (itemsByName.length === 0) {
            return {
                gameStateAfter: gameState,
                event: GameEvent.commandValidation({
                    message: {
                        l1: `There is nothing like that here.`,
                        l2: `Chan eil dad mar sin an seo.`
                    }
                })
            };
        }

        // TODO give feedback if multiple items are found
        let item = itemsByName[0];
        return {
            gameStateAfter: {
                player: {
                    ...gameState.player,
                    items: [
                        ...gameState.player.items,
                        item
                    ]
                },
                room: {
                    ...gameState.room,
                    items: _.without(gameState.room.items, item)
                }
            },
            event: GameEvent.takeItem({
                actor: gameState.player,
                item: item,
            })
        };
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: gameState.room.items.map(item => 'take ' + item.name.l1),
            l2: gameState.room.items.map(item => 'gabh ' + item.name.l2),
        };
    }
}