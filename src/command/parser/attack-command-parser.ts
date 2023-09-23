import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
import { getLivingEnemies } from "../../model/game/game-state-util";
import { GameCommand } from "../game-command";
import { CommandParser } from "./command";
import { findCharactersByName } from "./parser-helpers";

export const ATTACK_COMMAND_PARSER: CommandParser = {
    l1: 'fight',
    l2: 'sabaidich',
    helpText: {l1: 'Fight against an enemy', l2: 'Sabaid an aghaidh nàmhaid'},
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

        let validEnemies = getLivingEnemies(gameState.player, gameState.currentRoom, gameState);
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
        let enemies = getLivingEnemies(gameState.player, gameState.currentRoom, gameState);
        return {
            l1: enemies.map(enemy => 'fight ' + enemy.name.english.definite),
            l2: enemies.map(enemy => 'sabaidich ' + enemy.name.gaelic.definite),
        };
    }
}