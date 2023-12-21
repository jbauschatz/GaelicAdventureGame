import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
import { getLivingEnemiesInRoom } from "../../model/game/game-state-util";
import { makeGaelicDative } from "../../model/language/gaelic/gaelic-noun";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";
import { findCharactersByName } from "./parser-helpers";

export const ATTACK_COMMAND_PARSER: CommandParser = {
    l1: 'attack',
    l2: 'thoir ionnsaigh air',
    getCommandPreviews: (gameState: GameState) => {
        let validEnemies = getLivingEnemiesInRoom(gameState.player, gameState);
        let enabled = validEnemies.length > 0;
        return [
            {
                l1Prompt: "attack...",
                l2Prompt: "ionnsaigh...",
                l1PreviewText: "attack __________",
                l2PreviewText: "thoir ionnsaigh air __________",
                enabled: enabled,
                followUpPreviews: validEnemies.map(enemy => {
                    let enemyName = makeGaelicDative(enemy.name.gaelic)
                    return {
                        l1Prompt: enemy.name.english.definite,
                        l2Prompt: enemyName,
                        l1PreviewText: "attack " + enemy.name.english.definite,
                        l2PreviewText: "thoir ionnsaigh air " + enemyName,
                        enabled: true,
                        followUpPreviews: [],
                        isComplete: true,
                        command: GameCommand.attack({
                            attacker: gameState.player,
                            defender: enemy.id,
                        }),
                    };
                }),
                isComplete: false,
                command: undefined,
            },
        ]
    },
    helpText: {l1: 'Attack an enemy', l2: 'Thoir ionnsaigh air nàmhaid'},
    parse: (restOfCommand: string, gameState: GameState) => {
        // Validate that a full command was received
        if (!restOfCommand) {
            return GameEvent.commandValidation({
                message: {
                    l1: '...',
                    l2: '[...]'
                }
            });
        }

        let validEnemies = getLivingEnemiesInRoom(gameState.player, gameState);
        let identifiedEnemies = findCharactersByName(restOfCommand, validEnemies);

        // Validate the enemy name
        if (identifiedEnemies.length === 0) {
            return GameEvent.commandValidation({
                message: {
                    l1: `There is no enemy here called "${restOfCommand}".`,
                    l2: `Chan eil nàmhaid ann ... "${restOfCommand}".`
                }
            });
        }

        let enemy = identifiedEnemies[0];
        return GameCommand.attack({
            attacker: gameState.player,
            defender: enemy.id,
        });
    },
    getValidCommands: (gameState: GameState) => {
        let enemies = getLivingEnemiesInRoom(gameState.player, gameState);
        return {
            l1: enemies.map(enemy => 'attack ' + enemy.name.english.definite),
            l2: enemies.map(enemy => 'thoir ionnsaigh air ' + makeGaelicDative(enemy.name.gaelic)),
        };
    }
}