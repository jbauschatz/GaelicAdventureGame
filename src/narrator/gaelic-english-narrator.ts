import { match } from "variant";
import { GameEvent } from "../event/game-event";
import { ParagraphElement, Story, StoryElement } from "../model/bilingual-story/story";
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
    story.push(StoryElement.paragraph([
        ParagraphElement.bilingual({bilingual: {l1: "You see:", l2: "Chì thu:"}}),
        ...buildOxfordCommaList(
            room.characters
                .filter(character => character !== gameState.player)
                .map(character => gameState.characters[character].name)
        )
    ]));

    return story;
}

function describeItems(room: Room, gameState: GameState): StoryElement<'paragraph'> {
    return StoryElement.paragraph([
        ParagraphElement.bilingual({bilingual: {l1: "You see:", l2: "Chì thu:"}}),
        ...buildOxfordCommaList(room.items.map(item => gameState.items[item].name))
    ]);
}

function describeExits(room: Room): StoryElement<'paragraph'> {
    return StoryElement.paragraph([
        ParagraphElement.bilingual({bilingual: { l1: "You can go:", l2: "Faodaidh sibh a dhol:" }}),
        ...buildOxfordCommaList(room.exits.map(roomExit => roomExit.direction))
    ]);
}

function narrateCommandValidation(commandValidation: GameEvent<'commandValidation'>): Story {
    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual({bilingual: commandValidation.message})
        ])
    ];
}

function narrateHelp(): Story {
    return REGISTERED_COMMAND_PARSERS.map(commandParser => {
        return StoryElement.paragraph([
            ParagraphElement.bilingual({bilingual: {l1: commandParser.l1, l2: commandParser.l2}}),
            ParagraphElement.staticText({text: ': '}),
            ParagraphElement.bilingual({bilingual: commandParser.helpText}),
        ]);
    });
}

function narrateInventory(gameState: GameState): Story {
    let player = gameState.characters[gameState.player];
    if (player.items.length > 0) {
        // List items in inventory
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({bilingual: {
                    l1: "You have:",
                    l2: "Agaibh:"
                }}),
                ...buildOxfordCommaList(player.items.map(item => gameState.items[item].name))
            ])
        ];
    } else {
        // No items in inventory
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({bilingual: {
                    l1: "You don't have anything.",
                    l2: "Chan eil dad agaibh."
                }}),
            ])
        ];
    }
}

function narrateLook(gameStateAfter: GameState): Story {
    return [
        // Narrate the player looking around
        StoryElement.paragraph([
            ParagraphElement.bilingual({bilingual: {l1: 'You look around...', l2: 'Seallaidh sibh mun cuairt...'}})
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
            ParagraphElement.bilingual({bilingual: {
                l1: `You go ${toDirection.l1}...`,
                l2: `Thèid sibh ${toDirection.l2}...`
            }})
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
            ParagraphElement.bilingual({bilingual: {
                l1: `You take ${itemName.l1}.`,
                l2: `Gabhaidh tu ${itemName.l2}.`
            }})
        ])
    ];
}

function narrateAttack(attack: GameEvent<'attack'>, gameState: GameState): Story {
    // Case 1: The Player attacking another Character
    if (attack.attacker === gameState.player) {
        let defender = gameState.characters[attack.defender];

        let attackParagraphElements = [
            ParagraphElement.bilingual({bilingual: {
                l1: `You attack ${defender.name.l1}!`,
                l2: `Sabaidichidh tu ${defender.name.l2}!`,
            }})
        ];
        if (attack.isFatal) {
            attackParagraphElements.push(
                ParagraphElement.bilingual({bilingual: {
                    l1: `It dies!`,
                    l2: `Dìthidh e!`,
                }})
            )
        }
        return [
            StoryElement.paragraph(attackParagraphElements, 'combat')
        ];
    }

    // Case 2: Another Character attacking the Player
    let attacker = gameState.characters[attack.attacker];
    let attackParagraphElements = [
        ParagraphElement.bilingual({bilingual: {
            l1: `${attacker.name.l1} attacks you!`,
            l2: `Sabaidichidh ${attacker.name.l2} thu!`
        }})
    ];
    if (attack.isFatal) {
        attackParagraphElements.push(
            ParagraphElement.bilingual({bilingual: {
                l1: `You die!`,
                l2: `Dìthidh thu!`,
            }})
        )
    }
    return [
        StoryElement.paragraph(attackParagraphElements, 'combat')
    ];
}

function narrateGameOver() {
    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual({bilingual: {
                l1: `The game is over.`,
                l2: `Tha an geama seachad.`,
            }})
        ])
    ];
}