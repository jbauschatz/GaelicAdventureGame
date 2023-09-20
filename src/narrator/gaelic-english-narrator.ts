import { match } from "variant";
import { GameEvent } from "../event/game-event";
import { ParagraphElement, Story, StoryElement, ref } from "../model/bilingual-story/story";
import { Narrator } from "./narrator";
import { GameState } from "../model/game/game-state";
import { Room } from "../model/game/room";
import { buildOxfordCommaList } from "../model/bilingual-story/story-util";
import { REGISTERED_COMMAND_PARSERS } from "../command/parser/command-parser";

export const GAELIC_ENGLISH_NARRATOR: Narrator = {
    narrateEvent: (event: GameEvent, gameStateBefore: GameState, gameStateAfter: GameState) => {
        return match(event, {
            commandValidation: commandValidation => narrateCommandValidation(commandValidation),
            help: () => narrateHelp(),
            inventory: () => narrateInventory(gameStateAfter),
            look: () => narrateLook(gameStateAfter),
            move: moveEvent => narrateMove(moveEvent, gameStateAfter),
            takeItem: takeItem => narrateTakeItem(takeItem, gameStateAfter),
            attack: attack => narrateAttack(attack, gameStateAfter),
            gameOver: () => narrateGameOver(),
        });
    }
}

/**
 * Narrates the Look command by describing the player's current location
 */
export function narrateRoom(gameState: GameState): Story {
    let room = gameState.rooms[gameState.currentRoom];
    let story: Story = [];

    // Heading - title of room
    story.push(StoryElement.heading({heading: room.name}));

    // Room description
    story.push(room.description);

    // Items
    if (room.items.length > 0) {
        story.push(describeItems(room, gameState));
    }

    // Exits
    story.push(describeExits(room));

    // Occupants
    story.push(describeCharacters(room, gameState));
    
    return story;
}

function describeCharacters(room: Room, gameState: GameState): StoryElement<'paragraph'> {
    let otherCharactersInRoom = room.characters
        .filter(character => character !== gameState.player)
        .map(characterId => {
            let character = gameState.characters[characterId]
            return {
                entity: character,
                name: {
                    l1: character.name.english.indefinite,
                    l2: character.name.gaelic.indefinite,
                }
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You see:", l2: "Chì thu:"}),
        ...buildOxfordCommaList(otherCharactersInRoom)
    ]);
}

function describeItems(room: Room, gameState: GameState): StoryElement<'paragraph'> {
    let itemsInRoom = room.items
        .map(itemId => {
            let item = gameState.items[itemId]
            return {
                entity: item,
                name: {
                    l1: item.name.english.indefinite,
                    l2: item.name.gaelic.indefinite,
                }
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You see:", l2: "Chì thu:"}),
        ...buildOxfordCommaList(itemsInRoom)
    ]);
}

function describeExits(room: Room): StoryElement<'paragraph'> {
    let exits = room.exits
        .map(exit => {
            return {
                entity: exit,
                name: exit.direction,
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You can go:", l2: "Faodaidh sibh a dhol:" }),
        ...buildOxfordCommaList(exits)
    ]);
}

function narrateCommandValidation(commandValidation: GameEvent<'commandValidation'>): Story {
    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual(commandValidation.message)
        ])
    ];
}

function narrateHelp(): Story {
    return REGISTERED_COMMAND_PARSERS.map(commandParser => {
        return StoryElement.paragraph([
            ParagraphElement.bilingual({l1: commandParser.l1, l2: commandParser.l2}),
            ParagraphElement.staticText({text: ': '}),
            ParagraphElement.bilingual(commandParser.helpText),
        ]);
    });
}

function narrateInventory(gameState: GameState): Story {
    let player = gameState.characters[gameState.player];
    if (player.items.length > 0) {
        let palyerItems = player.items
        .map(itemId => {
            let item = gameState.items[itemId]
            return {
                entity: item,
                name: {
                    l1: item.name.english.indefinite,
                    l2: item.name.gaelic.indefinite,
                }
            };
        });

        // List items in inventory
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: "You have:",
                    l2: "Agaibh:"
                }),
                ...buildOxfordCommaList(palyerItems)
            ])
        ];
    } else {
        // No items in inventory
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: "You don't have anything.",
                    l2: "Chan eil dad agaibh."
                }),
            ])
        ];
    }
}

function narrateLook(gameStateAfter: GameState): Story {
    return [
        // Narrate the player looking around
        StoryElement.paragraph([
            ParagraphElement.bilingual({l1: 'You look around...', l2: 'Seallaidh sibh mun cuairt...'})
        ]),

        // Narrate the current Room
        ...narrateRoom(gameStateAfter)
    ]
}

function narrateMove(move: GameEvent<'move'>, gameStateAfter: GameState): Story {
    let toDirection = move.toDirection

    return [
        // Narrate the movement to the new room
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: `You go ${toDirection.l1}...`,
                l2: `Thèid sibh ${toDirection.l2}...`
            })
        ]),

        // Narrate the new Room
        ...narrateRoom(gameStateAfter)
    ];
}

function narrateTakeItem(takeItem: GameEvent<'takeItem'>, gameState: GameState): Story {
    let item = gameState.items[takeItem.item];
    let itemName = item.name;

    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: ['You take ', ref(item, itemName.english.definite), '.'],
                l2: ['Gabhaidh tu ', ref(item, itemName.gaelic.definite), '.'],
            })
        ])
    ];
}

function narrateAttack(attack: GameEvent<'attack'>, gameState: GameState): Story {
    // Case 1: The Player attacking another Character
    if (attack.attacker === gameState.player) {
        let defender = gameState.characters[attack.defender];

        let attackParagraphElements = [
            ParagraphElement.bilingual({
                l1: ['You attack ', ref(defender, defender.name.english.definite), '!'],
                l2: ['Sabaidichidh tu ', ref(defender, defender.name.gaelic.definite), '!'],
            })
        ];
        if (attack.isFatal) {
            attackParagraphElements.push(
                ParagraphElement.bilingual({
                    l1: `It dies!`,
                    l2: `Dìthidh e!`,
                })
            )
        }
        return [
            StoryElement.paragraph(attackParagraphElements, 'combat')
        ];
    }

    // Case 2: Another Character attacking the Player
    let attacker = gameState.characters[attack.attacker];
    let attackParagraphElements = [
        ParagraphElement.bilingual({
            l1: [ref(attacker, attacker.name.english.definite), ' attacks you!'],
            l2: ['Sabaidichidh ', ref(attacker, attacker.name.gaelic.definite), ' thu!'],
        })
    ];
    if (attack.isFatal) {
        attackParagraphElements.push(
            ParagraphElement.bilingual({
                l1: `You die!`,
                l2: `Dìthidh thu!`,
            })
        )
    }
    return [
        StoryElement.paragraph(attackParagraphElements, 'combat')
    ];
}

function narrateGameOver() {
    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: `The game is over.`,
                l2: `Tha an geama seachad.`,
            })
        ])
    ];
}