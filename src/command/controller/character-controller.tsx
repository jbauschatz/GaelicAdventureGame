import { GameState } from "../../model/game/game-state";
import { getLivingEnemiesInRoom } from "../../model/game/game-state-util";
import { pickOne } from "../../util/random-util";
import { GameCommand } from "../game-command";

/**
 * Function to control a {@link Character} on its turn by producing the {@link GameCommand} it wishes to execute
 */
export type CharacterController = (characterId: string, gameState: GameState) => GameCommand;

/**
 * Creates a {@link CharacterController} composed of multiple {@link characterControllerModule}s in order of priority
 */
export function buildCharacterController(modules: Array<characterControllerModule>): CharacterController {
    return (characterId: string, gameState: GameState) => {
        for (let module of modules) {
            if (module.canExecute(characterId, gameState)) {
                return module.execute(characterId, gameState);
            }
        }

        // Default behavior is to wait
        return GameCommand.wait({actor: characterId});
    }
}

/**
 * Modular piece of a {@link CharacterController} that will only execute if it is applicable
 */
export type characterControllerModule = {
    /**
     * Whether the module can produce a {@link GameCommand} in the current {@link GameState}
     */
    canExecute: (characterId: string, gameState: GameState) => boolean,

    /**
     * Produces a {@link GameCommand} on behalf of the {@link Character}
     */
    execute: (characterId: string, gameState: GameState) => GameCommand;
}

/**
 * If there are enemies in the same room, attach one randomly
 */
export const ATTACK_NEARBY_ENEMY: characterControllerModule = {
    canExecute: (characterId: string, gameState: GameState) => {
        return getLivingEnemiesInRoom(characterId, gameState).length > 0;
    },
    execute: (characterId: string, gameState: GameState) => {
        let enemies = getLivingEnemiesInRoom(characterId, gameState);
        let randomEnemy = pickOne(enemies);
        return GameCommand.attack({
            attacker: characterId,
            defender: randomEnemy.id,
        });
    }
}

/**
 * Move through a random exit available in the current room
 */
export const MOVE_RANDOMLY: characterControllerModule = {
    canExecute: (characterId: string, gameState: GameState) => {
        // Followers should remain with their party leader
        let character = gameState.characters[characterId];
        if (character.partyLeader !== undefined) {
            return false;
        }

        // Assume there is always a valid exit
        return true;
    },
    execute: (characterId: string, gameState: GameState) => {
        let currentRoomId = gameState.characters[characterId].room;
        let exit = pickOne(gameState.rooms[currentRoomId].exits);
        return GameCommand.move({
            actor: characterId,
            exit: exit.id,
        });
    }
}