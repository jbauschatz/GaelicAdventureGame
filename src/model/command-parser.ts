import { GameState, Room } from "./game";
import { BilingualText, buildOxfordCommaList } from "./language";
import { Paragraph, Story, StoryState } from "./story";

export const GAELIC_HELP_COMMAND = 'cuideachadh';

/**
 * Narrates the Look command by describing the player's current location
 */
export function look(gameState: GameState): Story {
    return [
        // Heading - title of room
        {heading: gameState.room.name},

        // Room description
        gameState.room.description,

        // Exits
        describeExits(gameState.room),

        // Occupants
        {paragraphElements: [
            {l1: "You see:", l2: "Chì thu:"},
            ...buildOxfordCommaList(
                gameState.room.characters
                    .filter(character => character != gameState.player)
                    .map(character => character.name)
            )
        ]}
    ];
}

function describeExits(room: Room): Paragraph {
    return {paragraphElements: [
        { l1: "You can go:", l2: "Faodaidh sibh a dhol:" },
        ...buildOxfordCommaList(room.exits.map(roomExit => roomExit.direction))
    ]};
}

type Command = {
    l1: string,
    l2: string,
    helpText: BilingualText,
    execute: (rest: string, gameState: GameState) => {gameState: GameState, storyState: StoryState}
}

/**
 * All registered command which the player can execute
 */
let commands: Array<Command> = [

    // HELP
    {
        l1: 'help',
        l2: GAELIC_HELP_COMMAND,
        helpText: {l1: 'Get help', l2: 'Faigh ' + GAELIC_HELP_COMMAND},
        execute: (rest: string, gameState: GameState) => {
            return {
                gameState,
                storyState: {
                    story: getHelpText()
                }
            }
        }
    },

    // LOOK
    {
        l1: 'look',
        l2: 'amhraic',
        helpText: {l1: 'Look around', l2: '[look around]'},
        execute: (rest: string, gameState: GameState) => {
            return {
                gameState,
                storyState: {
                    story: look(gameState)
                }
            }
        }
    },
    
    // Go
    {
        l1: 'go',
        l2: 'dol',
        helpText: {l1: 'Go in a direction', l2: 'Dol ann an rathad'},
        execute: (rest: string, gameState: GameState) => {
            if (!rest) {
                return {
                    gameState,
                    storyState: {
                        story: [{paragraphElements: [
                            {
                                l1: 'Type "go" and then the direction you would like to go',
                                l2: '[Type "go" and then the direction you would like to go]'
                            }
                        ]}]
                    }
                }
            }

            let exit = gameState.room.exits.find(exit => exit.direction.l1 === rest || exit.direction.l2 === rest);
            if (!exit) {
                return {
                    gameState,
                    storyState: {
                        story: [{paragraphElements: [
                            {
                                l1: `You cannot go "${rest}".`,
                                l2: `Chan fhaodaidh sibh a dhol "${rest}".`
                            }
                        ]}]
                    }
                }
            }

            let newRoom = exit.room;

            // Move the Player into the new room
            let newGameState = {
                ...gameState,
                room: newRoom
            };

            return {
                gameState: newGameState,
                storyState: {
                    story: [
                        // Narrate the movement to the new room
                        {paragraphElements: [
                            {l1: `You go  ${exit.direction.l1}...`, l2: `Thèid sibh ${exit.direction.l2}...`}
                        ]},

                        // Execute "look" in the new room
                        ...look(newGameState)
                    ]
                }
            }
        }
    }
];

/**
 * Builds help text which describes each command
 */
function getHelpText(): Story {
    return commands.map(command => {
        return {paragraphElements: [
            {l1: command.l1, l2: command.l2},
            ': ',
            command.helpText
        ]};
    });
}

export function executeCommand(input: string, gameState: GameState, storyState: StoryState): {gameState: GameState, storyState: StoryState} {
    let inputWords = input.split(' ');
    let rest = input.substring(input.indexOf(' ') + 1);
    
    for (let command of commands) {
        // TODO find the longest prefix of a command that matches, like classic parser games
        if ([command.l1, command.l2].includes(inputWords[0])) {
            let newState = command.execute(rest, gameState);
            return {
                gameState: newState.gameState,
                storyState: {
                    story: [
                        ...storyState.story,
                        {input: input},
                        ...newState.storyState.story
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