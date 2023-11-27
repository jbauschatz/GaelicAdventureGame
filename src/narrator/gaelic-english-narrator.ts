import { match } from "variant";
import { GameEvent } from "../event/game-event";
import { EntityReference, ParagraphElement, Story, StoryElement, StoryText, ref } from "../model/bilingual-story/story";
import { Narrator } from "./narrator";
import { GameState } from "../model/game/game-state";
import { Room } from "../model/game/room";
import { CONJUNCTION_OR, buildOxfordCommaList } from "../model/bilingual-story/story-util";
import { REGISTERED_COMMAND_PARSERS } from "../command/parser/command-parser";
import { getLivingEnemies } from "../model/game/game-state-util";
import { Character } from "../model/game/character";
import { GameEntityMetadata } from "./game-entity-metadata";
import { capitalizeEnglish, makeEnglishPossessive } from "../model/language/english/english-util";
import { EnglishPersonGenderNumber } from "../model/language/english/english-person-gender-number";
import { GaelicPersonGenderNumber } from "../model/language/gaelic/gaelic-person-gender-number";
import { makeGaelicPossessiveWithAig } from "../model/language/gaelic/gaelic-util";

export const GAELIC_ENGLISH_NARRATOR: Narrator = {
    narrateEvent: (event: GameEvent, gameStateBefore: GameState, gameStateAfter: GameState) => {
        return match(event, {
            commandValidation: commandValidation => narrateCommandValidation(commandValidation),
            help: () => narrateHelp(),
            inventory: () => narrateInventory(gameStateAfter),
            look: look => narrateLook(look, gameStateAfter),
            move: moveEvent => narrateMove(moveEvent, gameStateAfter),
            takeItem: takeItem => narrateTakeItem(takeItem, gameStateAfter),
            attack: attack => narrateAttack(attack, gameStateAfter),
            trapDamage: trapDamage => narrateTrapDamage(trapDamage, gameStateAfter),
            narration: narration => narrateNarration(narration),
            wait: wait => narrateWait(wait, gameStateAfter),
            gameOver: () => narrateGameOver(),
        });
    }
}

/**
 * Narrates the Look command by describing the player's current location
 */
export function narrateRoom(gameState: GameState): Story {
    let player = gameState.characters[gameState.player];
    let room = gameState.rooms[player.room];
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

    // Enemies
    let enemies = getLivingEnemies(gameState.player, room.id, gameState);
    if (enemies.length > 0) {
        story.push(describeCharacters(enemies));
    }
    
    return story;
}

function describeCharacters(enemies: Array<Character>): StoryElement<'paragraph'> {
    let enemiesWithNames = enemies
        .map(enemy => {
            return {
                entity: GameEntityMetadata.enemy(),
                name: {
                    l1: enemy.name.english.indefinite,
                    l2: enemy.name.gaelic.indefinite,
                }
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You see:", l2: "Chì thu:"}),
        ...buildOxfordCommaList(enemiesWithNames)
    ]);
}

function describeItems(room: Room, gameState: GameState): StoryElement<'paragraph'> {
    let itemsInRoom = room.items
        .map(itemId => {
            let item = gameState.items[itemId]
            return {
                entity: GameEntityMetadata.item(),
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
                entity: GameEntityMetadata.direction(),
                name: exit.direction,
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You can go:", l2: "Faodaidh tu a dhol:" }),
        ...buildOxfordCommaList(exits, CONJUNCTION_OR)
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
        let playerItems = player.items
        .map(itemId => {
            let item = gameState.items[itemId]
            return {
                entity: GameEntityMetadata.item(),
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
                    l2: "Agad:"
                }),
                ...buildOxfordCommaList(playerItems)
            ])
        ];
    } else {
        // No items in inventory
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: "You don't have anything.",
                    l2: "Chan eil dad agad."
                }),
            ])
        ];
    }
}

function narrateLook(look: GameEvent<'look'>, gameStateAfter: GameState): Story {
    let lookStory = [];

    if (look.isPlayerInitiated) {
        // Narrate the player looking around
        lookStory.push(
            StoryElement.paragraph([
                ParagraphElement.bilingual({l1: 'You look around...', l2: 'Seallaidh tu mun cuairt...'})
            ]),
        );
    }

    return [
        ...lookStory,

        // Narrate the current Room
        ...narrateRoom(gameStateAfter)
    ]
}

function narrateMove(move: GameEvent<'move'>, gameStateAfter: GameState): Story {
    let player = gameStateAfter.characters[gameStateAfter.player];
    let actor = gameStateAfter.characters[move.actor];
    let sourceRoom = gameStateAfter.rooms[move.sourceRoom];
    let destinationRoom = gameStateAfter.rooms[move.destinationRoom];
    let sourceExit = sourceRoom.exits.find(exit => exit.id === move.sourceExit)!;
    let destinationExit = destinationRoom.exits.find(exit => exit.id === move.destinationExit)!;
    
    console.log(`[event] [move]: ${actor.name.english.base} from ${sourceRoom.name.l1} to ${destinationRoom.name.l1}`);

    // Case 1: the Player is moving to another room
    if (move.actor === player.id) {
        let playerDirection = sourceExit.direction;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: [
                        'You go ',
                        ref(GameEntityMetadata.direction(), playerDirection.l1),
                        '...'
                    ],
                    l2: [
                        'Thèid thu ',
                        ref(GameEntityMetadata.direction(), playerDirection.l2),
                        '...'
                    ],
                })
            ]),
        ];
    }

    // Case 2: another Creature exits the Player's room
    if (sourceRoom.id === player.room) {
        let exitDirection = sourceExit.direction;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: [
                        ref(GameEntityMetadata.enemy(), capitalizeEnglish(actor.name.english.definite)),
                        ' exits ',
                        ref(GameEntityMetadata.direction(), exitDirection.l1),
                        '.'
                    ],
                    l2: [
                        'Falbhaidh ',
                        ref(GameEntityMetadata.enemy(), actor.name.gaelic.definite),
                        ' ',
                        ref(GameEntityMetadata.direction(), exitDirection.l2),
                        '.'
                    ],
                })
            ]),
        ];
    }

    // Case 3: another Creature enters the Player's room
    if (destinationRoom.id === player.room) {
        let entranceDirection = destinationExit.directionReverse;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: [
                        ref(GameEntityMetadata.enemy(), capitalizeEnglish(actor.name.english.indefinite)),
                        ' enters ',
                        ref(GameEntityMetadata.direction(), entranceDirection.l1),
                        '.'
                    ],
                    l2: [
                        'Thèid ',
                        ref(GameEntityMetadata.enemy(), actor.name.gaelic.indefinite),
                        ' a-steach ',
                        ref(GameEntityMetadata.direction(), entranceDirection.l2),
                        '.'
                    ],
                })
            ]),
        ];
    }

    // Case 4: movement does not involve the Player's location
    return [];
}

function narrateTakeItem(takeItem: GameEvent<'takeItem'>, gameState: GameState): Story {
    let item = gameState.items[takeItem.item];
    let itemName = item.name;

    return [
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: [
                    'You take ',
                    ref(GameEntityMetadata.item(), itemName.english.definite),
                    '.'
                ],
                l2: [
                    'Gabhaidh tu ',
                    ref(GameEntityMetadata.item(), itemName.gaelic.definite),
                    '.'
                ],
            })
        ])
    ];
}

function narrateAttack(attack: GameEvent<'attack'>, gameState: GameState): Story {
    let attacker = gameState.characters[attack.attacker];

    // If a weapon was used, build a descriptive clause about the weapon
    let weaponParagraphElements: {
        l1: Array<string | EntityReference>,
        l2: Array<string | EntityReference>,
    };
    if (attack.weapon === undefined) {
        weaponParagraphElements = {
            l1: [],
            l2: [],
        };
    } else {
        let attackItem = gameState.items[attack.weapon];
        let englishPgn: EnglishPersonGenderNumber = attack.attacker === gameState.player ? 'you' : 'it';
        let gaelicPgn: GaelicPersonGenderNumber = attack.attacker === gameState.player ? 'you (s)' : 'he';
        weaponParagraphElements = {
            l1: [
                ' with ',
                ...makeEnglishPossessive(
                    attackItem.name.english,
                    englishPgn,
                    itemWord => ref(GameEntityMetadata.item(), itemWord),
                ),
            ],
            l2: [
                ' leis ', // TODO - determine when le vs leis is used
                ...makeGaelicPossessiveWithAig(
                    attackItem.name.gaelic,
                    gaelicPgn,
                    itemWord => ref(GameEntityMetadata.item(), itemWord),
                ),
            ],
        };
    }

    // Case 1: The Player attacking another Character
    if (attack.attacker === gameState.player) {
        let defender = gameState.characters[attack.defender];

        let attackParagraphElements: ParagraphElement[] = [
            ParagraphElement.bilingual({
                l1: [
                    'You attack ',
                    ref(GameEntityMetadata.enemy(), defender.name.english.definite),
                    ...weaponParagraphElements.l1,
                    '!'
                ],
                l2: [
                    'Sabaidichidh tu ',
                    ref(GameEntityMetadata.enemy(), defender.name.gaelic.definite),
                    ...weaponParagraphElements.l2,
                    '!'
                ],
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
    let attackParagraphElements = [
        ParagraphElement.bilingual({
            l1: [
                ref(GameEntityMetadata.enemy(), capitalizeEnglish(attacker.name.english.definite)),
                ' attacks you',
                ...weaponParagraphElements.l1,
                '!'
            ],
            l2: [
                'Sabaidichidh ',
                ref(GameEntityMetadata.enemy(), attacker.name.gaelic.definite),
                ' thu',
                ...weaponParagraphElements.l2,
                '!'
            ],
        })
    ];
    if (attack.isFatal) {
        attackParagraphElements.push(
            ParagraphElement.bilingual({
                l1: `You die!`,
                l2: `Dìthidh tu!`,
            })
        )
    }
    return [
        StoryElement.paragraph(attackParagraphElements, 'combat')
    ];

    // TODO Case 3: Another Character attacks another Character in the Player's room
}

function narrateTrapDamage(trapDamage: GameEvent<'trapDamage'>, gameState: GameState): Story {
    // Case 1: the Player gets damaged
    if (trapDamage.defender === gameState.player) {
        let attackParagraphElements = [
            ParagraphElement.bilingual({
                l1: 'A trap damages you!',
                l2: 'Nì trap cron ort!',
            })
        ];
        if (trapDamage.isFatal) {
            attackParagraphElements.push(
                ParagraphElement.bilingual({
                    l1: `You die!`,
                    l2: `Dìthidh tu!`,
                })
            )
        }
        return [
            StoryElement.paragraph(attackParagraphElements, 'combat')
        ];
    }

    // Case 2: another Creature gets damaged which the Player can see
    let defender = gameState.characters[trapDamage.defender];
    let player = gameState.characters[gameState.player];
    if (defender.room === player.room) {
        let attackParagraphElements = [
            ParagraphElement.bilingual({
                l1: [
                    'A trap damages ',
                    ref(GameEntityMetadata.enemy(), defender.name.english.definite),
                    '!',
                ],
                l2: [
                    'Nì trap cron air ',
                    ref(GameEntityMetadata.enemy(), defender.name.gaelic.definite),
                    '!',
                ],
            })
        ];
        if (trapDamage.isFatal) {
            attackParagraphElements.push(
                ParagraphElement.bilingual({
                    l1: 'It dies!',
                    l2: 'Dìthidh e!',
                })
            )
        }
        return [
            StoryElement.paragraph(attackParagraphElements, 'combat')
        ];
    }

    // Case 3: another Creature gets damaged and the Player cannot see
    return [];    
}

function narrateNarration(narration: GameEvent<'narration'>): Story {
    return narration.story;
}

function narrateWait(wait: GameEvent<'wait'>, gameState: GameState): Story {
    // Case 1: the Player waits
    if (wait.actor === gameState.player) {
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    l1: 'You wait...',
                    l2: 'Fuirich tu...',
                })
            ])
        ];
    }

    // Case 2: another Character waits
    return [];
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