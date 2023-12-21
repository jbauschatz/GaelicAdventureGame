import { Character } from "./character";
import { GameState } from "./game-state";

export function getLivingEnemiesInRoom(characterId: string, gameState: GameState): Array<Character> {
    let character = gameState.characters[characterId];

    return gameState.rooms[character.room]
        .characters
        .filter(roomCharacter => roomCharacter !== characterId)
        .map(roomCharacter => gameState.characters[roomCharacter])
        .filter(roomCharacter => roomCharacter.currentHealth > 0)
        .filter(roomCharacter => roomCharacter.faction == undefined || roomCharacter.faction !== character.faction);
}

export function getLivingCompanionsInRoom(characterId: string, gameState: GameState): Array<Character> {
    let character = gameState.characters[characterId];

    // A character without a faction cannot have companions
    if (character.faction == undefined) {
        return [];
    }

    return gameState.rooms[character.room]
        .characters
        .filter(roomCharacter => roomCharacter !== characterId)
        .map(roomCharacter => gameState.characters[roomCharacter])
        .filter(roomCharacter => roomCharacter.currentHealth > 0)
        .filter(roomCharacter => roomCharacter.faction === character.faction);
}