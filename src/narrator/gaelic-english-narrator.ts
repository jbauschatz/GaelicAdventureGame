import { match } from "variant";
import { GameEvent } from "../event/game-event";
import { EntityReference, ParagraphElement, Story, StoryElement, ref } from "../model/bilingual-story/story";
import { Narrator } from "./narrator";
import { GameState } from "../model/game/game-state";
import { Room } from "../model/game/room";
import { CONJUNCTION_OR, buildOxfordCommaList } from "../model/bilingual-story/story-util";
import { REGISTERED_COMMAND_PARSERS } from "../command/parser/command-parser";
import { Character } from "../model/game/character";
import { GameEntityMetadata } from "./game-entity-metadata";
import { capitalizeEnglish, conjugateEnglishVerb, getEnglishNominativePronoun, makeEnglishPossessive } from "../model/language/english/english-util";
import { getGaelicPronoun } from "../model/language/gaelic/gaelic-util";
import { getLivingCompanionsInRoom, getLivingEnemiesInRoom } from "../model/game/game-state-util";
import { getGaelicPersonGenderNumber, makeGaelicDative, makeGaelicDefinite, makeGaelicIndefinite } from "../model/language/gaelic/gaelic-noun";
import { GAELIC_PREPOSITION_AIG, GAELIC_PREPOSITION_AIR, GaelicPreposition } from "../model/language/gaelic/gaelic-preposition";

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
    let enemies = getLivingEnemiesInRoom(gameState.player, gameState);
    if (enemies.length > 0) {
        story.push(describeEnemies(enemies));
    }

    // Companions
    let companions = getLivingCompanionsInRoom(gameState.player, gameState);
    if (companions.length > 0) {
        story = [...story, ...describeCompanions(companions, gameState)];
    }
    
    return story;
}

function describeEnemies(enemies: Array<Character>): StoryElement<'paragraph'> {
    let enemiesWithNames = enemies
        .map(enemy => {
            return {
                entity: GameEntityMetadata.enemy(),
                name: {
                    l1: enemy.name.english.indefinite,
                    l2: makeGaelicIndefinite(enemy.name.gaelic),
                }
            };
        });

    return StoryElement.paragraph([
        ParagraphElement.bilingual({l1: "You see:", l2: "Chì thu:"}),
        ...buildOxfordCommaList(enemiesWithNames)
    ]);
}

function describeCompanions(companions: Array<Character>, gameState: GameState): Array<StoryElement<'paragraph'>> {
    return companions.map(companion => {
        let companionName = buildDefiniteName(companion, gameState);
        return StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: [
                    "Your companion ",
                    companionName.english,
                    " is here."
                ],
                l2: [
                    "Tha do chompach ",
                    companionName.gaelic,
                    " an seo."
                ]
            }),
        ])
    });
}

function describeItems(room: Room, gameState: GameState): StoryElement<'paragraph'> {
    let itemsInRoom = room.items
        .map(itemId => {
            let item = gameState.items[itemId]
            return {
                entity: GameEntityMetadata.item(),
                name: {
                    l1: item.name.english.indefinite,
                    l2: makeGaelicIndefinite(item.name.gaelic),
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
                    l2: makeGaelicIndefinite(item.name.gaelic),
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
                ParagraphElement.bilingual({l1: 'You look around...', l2: 'Seallaidh thu mun cuairt...'})
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
    let followers = move.followers.map(followerId => gameStateAfter.characters[followerId]);
    
    let followerNames = followers.map(follower => follower.name.english.base);
    console.log(`[event] [move]: ${actor.name.english.base} from ${sourceRoom.name.l1} to ${destinationRoom.name.l1} (followers: ${followerNames})`);

    // Case 1: the Player is moving to another room
    if (move.actor === player.id) {
        // Text for any companions that come along with the Player
        let companionParagraphElements: {
            l1: Array<string | EntityReference>,
            l2: Array<string | EntityReference>,
        };
        if (followers.length === 1) {
            let followerName = buildDefiniteName(followers[0], gameStateAfter);
            companionParagraphElements = {
                l1: [
                    // ", and (Lydia) follows you"
                    ', and ',
                    followerName.english,
                    ' follows you',
                ],
                // ", agus leanaidh (Laoidheach) thu"
                l2: [
                    ', agus leanaidh ',
                    followerName.gaelic,
                    ' thu',
                ],
            };
        } else {
            companionParagraphElements = {
                l1: [],
                l2: [],
            };
        }

        let playerDirection = sourceExit.direction;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    // "You go north..."
                    l1: [
                        'You go ',
                        ref(GameEntityMetadata.direction(), playerDirection.l1),
                        ...companionParagraphElements.l1,
                        '...'
                    ],
                    // "Thèid thu gu tuath..."
                    l2: [
                        'Thèid thu ',
                        ref(GameEntityMetadata.direction(), playerDirection.l2),
                        ...companionParagraphElements.l2,
                        '...'
                    ],
                })
            ]),
        ];
    }

    // Case 2: another Creature exits the Player's room
    if (sourceRoom.id === player.room) {
        let actorName = buildDefiniteName(actor, gameStateAfter);
        let exitDirection = sourceExit.direction;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    // "(Lydia/The skeleton) exits north."
                    l1: [
                        capitalizeEnglish(actorName.english),
                        ' exits ',
                        ref(GameEntityMetadata.direction(), exitDirection.l1),
                        '.'
                    ],
                    // "Falbhaidh (Laoidheach/an cnàimhneach) gu tuath."
                    l2: [
                        'Falbhaidh ',
                        actorName.gaelic,
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
        let actorName = buildIndefiniteName(actor, gameStateAfter);
        let entranceDirection = destinationExit.directionReverse;
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    // "(Lydia/A skeleton) enters from the north."
                    l1: [
                        capitalizeEnglish(actorName.english),
                        ' enters ',
                        ref(GameEntityMetadata.direction(), entranceDirection.l1),
                        '.'
                    ],
                    // "Thèid (Laoidheach/cnàimhneach) a-steach bhon tuath."
                    l2: [
                        'Thèid ',
                        actorName.gaelic,
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
                // "You take the sword."
                l1: [
                    'You take ',
                    ref(GameEntityMetadata.item(), itemName.english.definite),
                    '.'
                ],
                // "Gabhaidh thu an claidheamh."
                l2: [
                    'Gabhaidh thu ',
                    ref(GameEntityMetadata.item(), makeGaelicDefinite(itemName.gaelic)),
                    '.'
                ],
            })
        ])
    ];
}

function narrateAttack(attack: GameEvent<'attack'>, gameState: GameState): Story {
    let attacker = gameState.characters[attack.attacker];
    let defender = gameState.characters[attack.defender];
    console.log(`[event] [attack]: ${attacker.name.english.base} attacks ${defender.name.english}`);

    // Don't narrate combat outside the Player's room
    let player = gameState.characters[gameState.player];
    if (attack.room !== player.room) {
        return [];
    }

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
        weaponParagraphElements = {
            // " with (your/his) sword"
            l1: [
                ' with ',
                ...makeEnglishPossessive(
                    attacker.name.english.personGenderNumber,
                    attackItem.name.english,
                    itemWord => ref(GameEntityMetadata.item(), itemWord),
                ),
            ],
            // " leis a' chlaidheamh (agad/aige)"
            l2: [
                ' leis ',
                ref(GameEntityMetadata.item(), makeGaelicDative(attackItem.name.gaelic)),
                ' ',
                GAELIC_PREPOSITION_AIG.pronominalForms[getGaelicPersonGenderNumber(attacker.name.gaelic)],
            ],
        };
    }

    let attackerName = buildDefiniteName(attacker, gameState);
    let defenderName = buildDefiniteName(defender, gameState);

    // Main attack sentence
    let attackParagraphElements: ParagraphElement[] = [
        ParagraphElement.bilingual({
            // "(You/Lydia) attack(s) the skeleton[ with your/her sword]!"
            l1: [
                capitalizeEnglish(attackerName.english),
                ' ',
                conjugateEnglishVerb('attack', 'attacks', attacker.name.english.personGenderNumber),
                ' ',
                defenderName.english,
                ...weaponParagraphElements.l1,
                '!'
            ],
            // "Bheir (thu/Laoidheach) ionnsaigh (ort/air an cnàimhneach)[ leis an claidheamh agad/aice]!"
            l2: [
                'Bheir ',
                attackerName.gaelic,
                ' ionnsaigh ',
                ...buildGaelicPrepositionalPhrase(defender, gameState, GAELIC_PREPOSITION_AIR),
                ...weaponParagraphElements.l2,
                '!'
            ],
        })
    ];
    
    // Fatality sentence
    if (attack.isFatal) {
        // Refer to the defender by its pronoun
        let defenderPronoun = buildPronounReference(defender);

        attackParagraphElements.push(
            ParagraphElement.bilingual({
                // "(You/It) die(s)!"
                l1: [
                    capitalizeEnglish(defenderPronoun.english),
                    ' ',
                    conjugateEnglishVerb('die', 'dies', defender.name.english.personGenderNumber),
                    '!',
                ],
                // "Dìthidh (thu/e)!"
                l2: [
                    "Dìthidh ",
                    defenderPronoun.gaelic,
                    "!",
                ]
            })
        )
    }

    return [
        StoryElement.paragraph(attackParagraphElements, 'combat')
    ];
}

function narrateTrapDamage(trapDamage: GameEvent<'trapDamage'>, gameState: GameState): Story {
    let defender = gameState.characters[trapDamage.defender];
    let player = gameState.characters[gameState.player];

    if (trapDamage.room === player.room) {
        // Case 1: A Trap Damage occurs in the Player's room
        let defenderName = buildDefiniteName(defender, gameState);
        let attackParagraphElements = [
            ParagraphElement.bilingual({
                // "A trap damages (you/the skeleton)!"
                l1: [
                    'A trap damages ',
                    defenderName.english,
                    '!'
                ],
                // "Nì trap cron (ort/air an cnàimhneach)!"
                l2: [
                    'Nì trap cron ',
                    ...buildGaelicPrepositionalPhrase(defender, gameState, GAELIC_PREPOSITION_AIR),
                    '!',
                ],
            })
        ];
        if (trapDamage.isFatal) {
            attackParagraphElements.push(
                ParagraphElement.bilingual({
                    // "(You/The skeleton) die(s)!"
                    l1: [
                        capitalizeEnglish(defenderName.english),
                        conjugateEnglishVerb("die", "dies", defender.name.english.personGenderNumber),
                        "!",
                    ],
                    // "Dìthidh (thu/an cnàimhneach)!"
                    l2: [
                        "Dìthidh ",
                        defenderName.gaelic,
                        "!",
                    ],
                })
            )
        }
        return [
            StoryElement.paragraph(attackParagraphElements, 'combat')
        ];
    } else {
        // Case 2: a Trap Damage occurs outside of the Player's room
        return []
    }
}

function narrateNarration(narration: GameEvent<'narration'>): Story {
    return narration.story;
}

function narrateWait(wait: GameEvent<'wait'>, gameState: GameState): Story {
    // Case 1: the Player waits
    if (wait.actor === gameState.player) {
        let actor = gameState.characters[wait.actor];
        let actorName = buildDefiniteName(actor, gameState);
        return [
            StoryElement.paragraph([
                ParagraphElement.bilingual({
                    // "(You/The skeleton) wait(s)..."
                    l1: [
                        capitalizeEnglish(actorName.english),
                        ' ',
                        conjugateEnglishVerb('wait', 'waits', actor.name.english.personGenderNumber),
                    ],
                    // "Fuirichidh (thu/an cnàimhneach)..."
                    l2: [
                        'Fuirichidh ',
                        actorName.gaelic,
                        "...",
                    ],
                })
            ])
        ];
    }

    // Case 2: another Character waits
    return [];
}

/**
 * Builds a definite name for a Character in both languages.
 * 
 * This should be used any time a Character is referenced by name, so that the metadata is consistent.
 * @param isAfterRelativeFutureConditional - for proper Gaelic, whether this name appears immediately after a Relative Future or Conditional verb
 */
function buildDefiniteName(character: Character, gameState: GameState, isAfterRelativeFutureConditional: boolean = false): {
    english: string | EntityReference,
    gaelic: string | EntityReference,
  } {
    // Player will always be referred to by their pronouns
    if (character.id === gameState.player) {
        return buildPronounReference(character, isAfterRelativeFutureConditional);
    }

    return {
        english: buildCharacterMetadata(
            character.name.english.definite,
            character,
            gameState
        ),
        gaelic: buildCharacterMetadata(
            makeGaelicDefinite(character.name.gaelic, isAfterRelativeFutureConditional),
            character,
            gameState
        ),
    };
}

/**
 * Builds an indefinite name for a Character in both languages.
 * 
 * This should be used any time a Character is referenced by name, so that the metadata is consistent.
 * @param isAfterRelativeFutureConditional - for proper Gaelic, whether this name appears immediately after a Relative Future or Conditional verb
 */
function buildIndefiniteName(character: Character, gameState: GameState, isAfterRelativeFutureConditional: boolean = false): {
    english: string | EntityReference,
    gaelic: string | EntityReference,
  } {
    // Player will always be referred to by their pronouns
    if (character.id === gameState.player) {
        return buildPronounReference(character, isAfterRelativeFutureConditional);
    }

    return {
        english: buildCharacterMetadata(
            character.name.english.indefinite,
            character,
            gameState
        ),
        gaelic: buildCharacterMetadata(
            makeGaelicIndefinite(character.name.gaelic, isAfterRelativeFutureConditional),
            character,
            gameState
        ),
    };
}

function buildGaelicPrepositionalPhrase(character: Character, gameState: GameState, preposition: GaelicPreposition): Array<string | EntityReference> {
    // Player will always be referred to the pronominal preposition, example "ort" or "agad"
    if (character.id === gameState.player) {
        let player = gameState.characters[gameState.player];
        let playerPersonGenderNumber = getGaelicPersonGenderNumber(player.name.gaelic);
        return [preposition.pronominalForms[playerPersonGenderNumber]];
    };

    // Form the preposition separately from the name, example "air an ch"
    // TODO some prepositions assimilate the definite article
    let characterName = preposition.takesTheGenitive
            ? makeGaelicDative(character.name.gaelic)
            : makeGaelicDefinite(character.name.gaelic);
    let characterReference = buildCharacterMetadata(characterName, character, gameState);
    return [preposition.baseForm + ' ', characterReference];
}

function buildPronounReference(character: Character, isAfterRelativeFutureConditional: boolean = false): {
    english: string,
    gaelic: string,
} { 
    return {
        english: getEnglishNominativePronoun(character.name.english.personGenderNumber),
        gaelic: getGaelicPronoun(
            getGaelicPersonGenderNumber(character.name.gaelic),
            isAfterRelativeFutureConditional,
        ),
    }
}

function buildCharacterMetadata(name: string, character: Character, gameState: GameState): string | EntityReference {
    // Player does not have any metadata associated with them
    if (character.id === gameState.player) {
        return name;
    }

    let player = gameState.characters[gameState.player];

    if (character.faction !== undefined && character.faction === player.faction) {
        // Character is a companion
        return ref(
            GameEntityMetadata.companion(), 
            name,
        );
    }

    // Any other Character is an enemy
    return ref(
        GameEntityMetadata.enemy(), 
        name,
    );
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