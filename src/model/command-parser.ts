import _ from "lodash";
import { GameState, Item, Room } from "./game";
import { BilingualText, buildOxfordCommaList } from "./language";
import { Paragraph, Story, StoryState } from "./story";

export const GAELIC_HELP_COMMAND = 'cuideachadh';

/**
 * Narrates the Look command by describing the player's current location
 */
export function look(gameState: GameState): Story {
    let story: Story = [];

    // Heading - title of room
    story.push({heading: gameState.room.name});

    // Room description
    story.push(gameState.room.description);

    // Items
    if (gameState.room.items.length > 0) {
        story.push(describeItems(gameState.room));
    }

    // Exits
    story.push(describeExits(gameState.room));

    // Occupants
    story.push({paragraphElements: [
        {l1: "You see:", l2: "Chì thu:"},
        ...buildOxfordCommaList(
            gameState.room.characters
                .filter(character => character != gameState.player)
                .map(character => character.name)
        )
    ]});

    return story;
}

function describeItems(room: Room): Paragraph {
    return {paragraphElements: [
        {l1: "You see:", l2: "Chì thu:"},
        ...buildOxfordCommaList(room.items.map(item => item.name))
    ]};
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
    execute: (rest: string, gameState: GameState) => {gameState: GameState, storyState: StoryState},
    getValidCommands: (gameState: GameState) => {
        l1: Array<String>,
        l2: Array<String>
    }
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
        },
        getValidCommands: (gameState: GameState) => {
            return {
                l1: ['help'],
                l2: [GAELIC_HELP_COMMAND]
            }
        }
    },

    // LOOK
    {
        l1: 'look',
        l2: 'seall',
        helpText: {l1: 'Look around', l2: 'Seall mun cuairt'},
        execute: (rest: string, gameState: GameState) => {
            return {
                gameState,
                storyState: {
                    story: [
                        // Narrate the player looking around
                        {paragraphElements: [
                            {l1: 'You look around...', l2: 'Seallaidh sibh mun cuairt...'}
                        ]},

                        // Look around
                        ...look(gameState)
                    ]
                }
            }
        },
        getValidCommands: (gameState: GameState) => {
            return {
                l1: ['look'],
                l2: ['seall'],
            }
        }
    },
    
    // INVENTORY
    {
        l1: 'inventory',
        l2: 'maoin-chunntas',
        helpText: {l1: '...', l2: '...'},
        execute: (rest: string, gameState: GameState) => {
            let paragraph: Paragraph;

            if (gameState.player.items.length > 0) {
                // List items in inventory
                paragraph = {
                    paragraphElements: [
                        {l1: "You have:", l2: "Agaibh:"},
                        ...buildOxfordCommaList(gameState.player.items.map(item => item.name))
                    ]
                }
            } else {
                // No items in inventory
                paragraph = {
                    paragraphElements: [
                        {l1: "You don't have anything.", l2: "Chan eil dad agaibh."},
                    ]
                }
            }

            return {
                gameState,
                storyState: {
                    story: [paragraph]
                }
            }
        },
        getValidCommands: (gameState: GameState) => {
            return {
                l1: ['inventory'],
                l2: ['maoin-chunntas']
            }
        }
    },
    
    // Go
    {
        l1: 'go',
        l2: 'rach',
        helpText: {l1: 'Go in a direction', l2: 'Rach ann an rathad'},
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
                            {l1: `You go ${exit.direction.l1}...`, l2: `Thèid sibh ${exit.direction.l2}...`}
                        ]},

                        // Execute "look" in the new room
                        ...look(newGameState)
                    ]
                }
            }
        },
        getValidCommands: (gameState: GameState) => {
            return {
                l1: gameState.room.exits.map(exit => 'go ' + exit.direction.l1),
                l2: gameState.room.exits.map(exit => 'rach ' + exit.direction.l2),
            }
        }
    },

    
    // TAKE an item
    {
        l1: 'take',
        l2: 'gabh',
        helpText: {l1: 'Take something', l2: 'Gabh rudeigin'},
        execute: (rest: string, gameState: GameState) => {
            // TODO identify the item in the room
            let itemsByName = findItemByName(rest, gameState.room.items);
            if (itemsByName.length === 0) {
                return {
                    gameState,
                    storyState: {
                        story: [
                            // Narrate the item cannot be found
                            {paragraphElements: [
                                {
                                    l1: `There is nothing like that here.`,
                                    l2: `Chan eil dad mar sin an seo.`
                                }
                            ]}
                        ]
                    }
                };
            }

            // TODO give feedback if multiple items are found
            let item = itemsByName[0];
            return {
                // TODO add the item to the player's inventory
                gameState: {
                    player: {
                        ...gameState.player,
                        items: [
                            ...gameState.player.items,
                            item
                        ]
                    },
                    room: {
                        ...gameState.room,
                        items: _.without(gameState.room.items, item)
                    }
                },
                storyState: {
                    story: [
                        // Narrate the player looking around
                        {paragraphElements: [
                            {l1: `You take ${item.name.l1}.`, l2: `Gabhaidh tu ${item.name.l2}.`}
                        ]},
                    ]
                }
            }
        },
        getValidCommands: (gameState: GameState) => {
            return {
                l1: gameState.room.items.map(item => 'take ' + item.name.l1),
                l2: gameState.room.items.map(item => 'gabh ' + item.name.l2),
            };
        }
    },
    
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

export function getValidCommandInputs(gameState: GameState): Array<String> {
    return commands.flatMap(command => {
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