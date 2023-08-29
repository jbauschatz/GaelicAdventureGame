import _ from "lodash";
import { GameState, Item } from "../game";
import { BilingualText } from "../../bilingual-story/language";
import { Paragraph,  Story,  StoryState } from "../../bilingual-story/story";
import { HELP_COMMAND } from "./help-command";
import { LOOK_COMMAND } from "./look-command";
import { INVENTORY_COMMAND } from "./inventory-command";
import { GO_COMMAND } from "./go-command";
import { TAKE_COMMAND } from "./take-command";

/**
 * A command that can be executed in the game.
 * 
 * This handles a lot of different concerns including:
 * - how the player executes the command
 * - how the command modifies the Game State
 * - how the command's effects are narrated to the player
 * 
 * This means there is little separation of concerns but it allows for rapidly adding a command
 */
export type Command = {
    l1: string,
    l2: string,
    helpText: BilingualText,
    execute: (rest: string, gameState: GameState) => {gameState: GameState, story: Story},
    getValidCommands: (gameState: GameState) => {
        l1: Array<String>,
        l2: Array<String>
    }
}

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

export function findItemByName(name: string, items: Array<Item>): Array<Item>{
    // Get all items where l1 or l2 matches the given name
    return items.filter(item => 
        [item.name.l1, item.name.l2].includes(name)
    );
}

export function executeCommand(input: string, gameState: GameState, storyState: StoryState): {gameState: GameState, storyState: StoryState} {
    let inputWords = input.split(' ');
    let rest = input.substring(input.indexOf(' ') + 1);

    for (let command of REGISTERED_COMMANDS) {
        // TODO find the longest prefix of a command that matches, like classic parser games
        if ([command.l1, command.l2].includes(inputWords[0])) {
            let newState = command.execute(rest, gameState);
            return {
                gameState: newState.gameState,
                storyState: {
                    // Combine the previous story, the player's input, and the new story
                    story: [
                        ...storyState.story,
                        {input: input},
                        ...newState.story
                    ]
                }
            }
        }
    }

    // Unexected command
    return {
        gameState,
        storyState: {
            story: [
                ...storyState.story,
                {paragraphElements: [{ l1: `Unknown command: "${input}".`, l2: `Comannd neo-aithnichte: "${input}".`}]} as Paragraph
            ]
        },
    }
}