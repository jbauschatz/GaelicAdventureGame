import _ from "lodash";
import { HELP_COMMAND } from "./help-command";
import { LOOK_COMMAND } from "./look-command";
import { INVENTORY_COMMAND } from "./inventory-command";
import { GO_COMMAND } from "./go-command";
import { TAKE_COMMAND } from "./take-command";
import { GameState } from "../model/game/game-state";
import { Item } from "../model/game/item";
import { Command } from "./command";
import { GameEvent } from "../event/game-event";

/**
 * All registered commands which the player can execute
 */
export const REGISTERED_COMMANDS: Array<Command> = [
    HELP_COMMAND,
    LOOK_COMMAND,
    INVENTORY_COMMAND,
    GO_COMMAND,
    TAKE_COMMAND,
];

/**
 * Produces a list of strings representing every possible well-formed and legal command
 * the player can execute in the current Game State
 */
export function getValidCommandInputs(gameState: GameState): Array<String> {
    return REGISTERED_COMMANDS.flatMap(command => {
        let validCommands = command.getValidCommands(gameState);

        // Combine all l2 and l1 inputs
        return validCommands.l2.concat(validCommands.l1);
    });
}

export function findItemByName(name: string, items: Array<string>, gameState: GameState): Array<string>{
    // Get all items where l1 or l2 matches the given name
    return items.filter(itemId => {
        let item = gameState.items[itemId];
        return [item.name.l1, item.name.l2].includes(name)
    });
}

export function executeCommand(input: string, gameState: GameState): {event: GameEvent, gameStateAfter: GameState} {
    let inputWords = input.split(' ');
    let rest = input.substring(input.indexOf(' ') + 1);

    for (let command of REGISTERED_COMMANDS) {
        // TODO find the longest prefix of a command that matches, like classic parser games
        if ([command.l1, command.l2].includes(inputWords[0])) {
            return command.execute(rest, gameState);
        }
    }

    // Unexected command
    return {
        gameStateAfter: gameState,
        event: GameEvent.commandValidation({
            message: {
                l1: `Unknown command: "${input}".`,
                l2: `Comannd neo-aithnichte: "${input}".`
            }
        })
    };
}