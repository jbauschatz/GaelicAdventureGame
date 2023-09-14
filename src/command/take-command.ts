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
        let room = gameState.rooms[gameState.currentRoom];
        let itemsByName = findItemByName(rest, room.items, gameState);
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

        // Add the Item to the Player's inventory
        let player = gameState.characters[gameState.player]
        let newPlayer = {
            ...player,
            items: [...player.items, item],
        };

        // Remove the Item from the Room's inventory
        let newRoom = {
            ...room,
            items: _.without(room.items, item),
        }

        return {
            gameStateAfter: {
                ...gameState,
                characters: {
                    ...gameState.characters,
                    [player.id]: newPlayer,
                },
                rooms: {
                    ...gameState.rooms,
                    [room.id]: newRoom
                }
            },
            event: GameEvent.takeItem({
                actor: gameState.player,
                item: item,
            }),
        };
    },
    getValidCommands: (gameState: GameState) => {
        let room = gameState.rooms[gameState.currentRoom];
        return {
            l1: room.items.map(item => 'take ' + gameState.items[item].name.l1),
            l2: room.items.map(item => 'gabh ' + gameState.items[item].name.l2),
        };
    }
}