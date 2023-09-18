import { GameState } from "../../model/game/game-state";

/**
 * Finds all {@link Character}s in the given {@link Room} of the {@link GameState} with names matching the given input (in either language)
 */
export function findCharactersByName(input: string, roomId: string, gameState: GameState): Array<string> {
    return gameState.rooms[roomId]
        .characters
        .filter(character => {
            let characterName = gameState.characters[character].name;
            return characterName.l1 === input || characterName.l2 === input;
        });
}

/**
 * Finds all {@link Items} in the {@link GameState} with names matching the given input (in either language)
 */
export function findItemByName(name: string, items: Array<string>, gameState: GameState): Array<string>{
    // TODO limit this to only the specified room and not the entire game state
    return items.filter(itemId => {
        let item = gameState.items[itemId];
        return [item.name.l1, item.name.l2].includes(name)
    });
}
