
import { GameState } from "../../model/game/game-state";
import { GameEvent } from "../../event/game-event";
import { GameCommand } from "../game-command";
import { HELP_COMMAND_PARSER } from "./help-command-parser";
import { LOOK_COMMAND_PARSER } from "./look-command-parser";
import { INVENTORY_COMMAND_PARSER } from "./inventory-command-parser";
import { MOVE_COMMAND_PARSER } from "./move-command-parser";
import { TAKE_COMMAND_PARSER } from "./take-command-parser";
import { CommandParser } from "./command";
import { ATTACK_COMMAND_PARSER } from "./attack-command-parser";
import { CommandPreview } from "./command-preview";
import { WAIT_COMMAND_PARSER } from "./wait-command-parser";

/**
 * Parsers for all commands which the player can execute
 */
export const REGISTERED_COMMAND_PARSERS: Array<CommandParser> = [
    HELP_COMMAND_PARSER,
    LOOK_COMMAND_PARSER,
    INVENTORY_COMMAND_PARSER,
    MOVE_COMMAND_PARSER,
    TAKE_COMMAND_PARSER,
    ATTACK_COMMAND_PARSER,
    WAIT_COMMAND_PARSER,
];

/**
 * 
 */
export function getCommandPreviews(gameState: GameState): Array<CommandPreview> {
    return REGISTERED_COMMAND_PARSERS.flatMap(parser => parser.getCommandPreviews(gameState));
}

/**
 * Produces a list of strings representing every possible well-formed and legal command
 * the player can execute in the current Game State
 */
export function getValidCommandInputs(gameState: GameState): Array<String> {
    return REGISTERED_COMMAND_PARSERS.flatMap(parser => {
        let validCommands = parser.getValidCommands(gameState);

        // Combine all l2 and l1 inputs
        return validCommands.l2.concat(validCommands.l1);
    });
}

export function parseCommand(input: string, gameState: GameState): GameCommand | GameEvent<'commandValidation'> {
    let inputWords = input.split(' ');
    let rest = input.substring(input.indexOf(' ') + 1);

    for (let parser of REGISTERED_COMMAND_PARSERS) {
        // TODO find the longest prefix of a command that matches, like classic parser games
        if ([parser.l1, parser.l2].includes(inputWords[0])) {
            return parser.parse(rest, gameState);
        }
    }

    // Unexected input
    return GameEvent.commandValidation({
        message: {
            l1: `Unknown command: "${input}".`,
            l2: `Comannd neo-aithnichte: "${input}".`
        }
    });
}