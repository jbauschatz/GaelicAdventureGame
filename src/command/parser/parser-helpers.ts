
import { Character } from "../../model/game/character";
import { GameState } from "../../model/game/game-state";
import { makeGaelicDefinite, makeGaelicIndefinite } from "../../model/language/gaelic/gaelic-noun";

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
                makeGaelicDefinite(characterName.gaelic),
                makeGaelicIndefinite(characterName.gaelic),
            ]
            return validNames.includes(input);
        });
}

/**
 * Finds all {@link Items} in the {@link GameState} with names matching the given input (in either language)
 */
export function findItemByName(name: string, items: Array<string>, gameState: GameState): Array<string>{
    return items.filter(itemId => {
        let itemName = gameState.items[itemId].name;
        let itemNames = [
            itemName.english.base,
            itemName.english.definite,
            itemName.english.indefinite,
            makeGaelicDefinite(itemName.gaelic),
            makeGaelicIndefinite(itemName.gaelic),
        ];
        return itemNames.includes(name);
    });
}
