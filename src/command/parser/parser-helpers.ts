import { flatMap } from "lodash";
import { GameState } from "../../model/game/game-state";

/**
 * Finds all {@link Character}s in the given {@link Room} of the {@link GameState} with names matching the given input (in either language)
 */
export function findCharactersByName(input: string, roomId: string, gameState: GameState): Array<string> {
    return gameState.rooms[roomId]
        .characters
        .filter(character => {
            let characterName = gameState.characters[character].name;
            let validNames = [
                characterName.english.base,
                characterName.english.definite,
                characterName.english.indefinite,
                characterName.gaelic.definite,
                characterName.gaelic.indefinite,
            ]
            return validNames.includes(input);
        });
}

/**
 * Finds all {@link Items} in the {@link GameState} with names matching the given input (in either language)
 */
export function findItemByName(name: string, items: Array<string>, gameState: GameState): Array<string>{
    let validNames = items.flatMap(itemId => {
        let itemName = gameState.items[itemId].name;
        return [
            itemName.english.base,
            itemName.english.definite,
            itemName.english.indefinite,
            itemName.gaelic.definite,
            itemName.gaelic.indefinite,
        ];
    });

    return items.filter(itemId => {
        let itemName = gameState.items[itemId].name;
        let itemNames = [
            itemName.english.base,
            itemName.english.definite,
            itemName.english.indefinite,
            itemName.gaelic.definite,
            itemName.gaelic.indefinite,
        ];
        return itemNames.includes(name);
    });
}
