import { GameEvent } from "../../event/game-event";
import { GameState } from "../../model/game/game-state";
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

        let enemies = findCharactersByName(restOfCommand, gameState.currentRoom, gameState);

        // Validate the enemy name
        if (enemies.length === 0) {
            return GameEvent.commandValidation({
                message: {
                    l1: `There is no enemy here called "${restOfCommand}".`,
                    l2: `Chan eil nàmhaid ann ... "${restOfCommand}".`
                }
            });
        }

        let enemy = enemies[0];
        return GameCommand.attack({
            attacker: gameState.player,
            defender: enemy,
        });
    },
    getValidCommands: (gameState: GameState) => {
        let playerRoom = gameState.rooms[gameState.currentRoom];
        let enemies = playerRoom.characters
                .filter(character => character !== gameState.player)
                .map(character => gameState.characters[character]);
        return {
            l1: enemies.map(enemy => 'fight ' + enemy.name.l1),
            l2: enemies.map(enemy => 'sabaidich ' + enemy.name.l2),
        };
    }
}