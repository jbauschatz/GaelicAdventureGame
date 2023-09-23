import { Character } from "./character";
import { GameState } from "./game-state";

export function getLivingEnemies(character: string, room: string, gameState: GameState): Array<Character> {
    return gameState.rooms[room]
        .characters
        .filter(roomCharacter => roomCharacter !== character)
        .map(roomCharacter => gameState.characters[roomCharacter])
        .filter(roomCharacter => roomCharacter.currentHealth > 0);
}