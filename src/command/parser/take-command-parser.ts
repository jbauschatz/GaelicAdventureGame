import { GameCommand } from "../game-command";
import { CommandParser } from "./command";
import { GameState } from "../../model/game/game-state";
import { GameEvent } from "../../event/game-event";
import { findItemByName } from "./parser-helpers";

export const TAKE_COMMAND_PARSER: CommandParser = {
    l1: 'take',
    l2: 'gabh',
    getCommandPreviews: (gameState: GameState) => {
        let player = gameState.characters[gameState.player];
        let room = gameState.rooms[player.room];
        let items = room.items.map(itemId => gameState.items[itemId]);
        let enabled = items.length > 0;

        return [
            {
                l1Prompt: "take...",
                l2Prompt: "gabh...",
                l1PreviewText: "take __________",
                l2PreviewText: "gabh __________",
                enabled: enabled,
                isComplete: false,
                followUpPreviews: items.map(item => ({
                    l1Prompt: item.name.english.definite,
                    l2Prompt: item.name.gaelic.definite,
                    l1PreviewText: "take " + item.name.english.definite,
                    l2PreviewText: "gabh " + item.name.gaelic.definite,
                    enabled: true,
                    isComplete: true,
                    followUpPreviews: [],
                    command: GameEvent.takeItem({
                        actor: gameState.player,
                        item: item.id,
                    }),
                })),
                command: undefined,
            },
        ];
    },
    helpText: {l1: 'Take something', l2: 'Gabh rudeigin'},
    parse: (rest: string, gameState: GameState): GameCommand | GameEvent<'commandValidation'> => {
        let player = gameState.characters[gameState.player];
        let room = gameState.rooms[player.room];

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
        let player = gameState.characters[gameState.player];
        let room = gameState.rooms[player.room];
        return {
            l1: room.items.map(item => 'take ' + gameState.items[item].name.english.definite),
            l2: room.items.map(item => 'gabh ' + gameState.items[item].name.gaelic.definite),
        };
    }
}