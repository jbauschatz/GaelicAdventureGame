import _ from "lodash";
import { findItemByName } from "./command-parser";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";
import { GameState } from "../../model/game/game-state";
import { GameEvent } from "../../event/game-event";

export const TAKE_COMMAND_PARSER: CommandParser = {
    l1: 'take',
    l2: 'gabh',
    helpText: {l1: 'Take something', l2: 'Gabh rudeigin'},
    parse: (rest: string, gameState: GameState): GameCommand | GameEvent<'commandValidation'> => {
        let room = gameState.rooms[gameState.currentRoom];

        // Validate that the item exists
        let itemsByName = findItemByName(rest, room.items, gameState);
        if (itemsByName.length === 0) {
            return GameEvent.commandValidation({
                message: {
                    l1: `There is nothing like that here.`,
                    l2: `Chan eil dad mar sin an seo.`
                }
            });
        }

        // TODO give feedback if multiple items are found
        let item = itemsByName[0];

        return GameEvent.takeItem({
            actor: gameState.player,
            item: item,
        });
    },
    getValidCommands: (gameState: GameState) => {
        let room = gameState.rooms[gameState.currentRoom];
        return {
            l1: room.items.map(item => 'take ' + gameState.items[item].name.l1),
            l2: room.items.map(item => 'gabh ' + gameState.items[item].name.l2),
        };
    }
}