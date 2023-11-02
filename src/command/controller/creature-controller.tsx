import { GameState } from "../../model/game/game-state";
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
 * If the Player is in the same room, attack it
 */
export const ATTACK_NEARBY_PLAYER: characterControllerModule = {
    canExecute: (characterId: string, gameState: GameState) => {
        return gameState.characters[characterId].room === gameState.characters[gameState.player].room;
    },
    execute: (characterId: string, gameState: GameState) => {
        return GameCommand.attack({
            attacker: characterId,
            defender: gameState.player
        });
    }
}