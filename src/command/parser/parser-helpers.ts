
import { Character } from "../../model/game/character";
import { GameState } from "../../model/game/game-state";

/**
 * Finds all {@link Character}s in the given array with names matching the given input (in either language)
 */
export function findCharactersByName(input: string, characters: Array<Character>): Array<Character> {
    return characters
        .filter(character => {
            let characterName = character.name;
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
