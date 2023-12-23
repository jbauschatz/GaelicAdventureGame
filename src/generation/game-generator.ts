import { BilingualText } from "../model/bilingual-text";
import { ParagraphElement, StoryElement } from "../model/bilingual-story/story";
import { Character } from "../model/game/character";
import { GameState } from "../model/game/game-state";
import { Item } from "../model/game/item";
import { Room } from "../model/game/room";
import { genId } from "./id";
import { NOUN_BIG_SPIDER, NOUN_KEY, NOUN_BIG_RAT, NOUN_SKELETON, NOUN_SWORD, PRONOUN_YOU_SINGULAR, NOUN_FANCY_DAGGER, NOUN_DAGGER, NOUN_HAMMER, NOUN_SWORD_ANCIENT, NOUN_DRAUGR_LORD } from "../model/language/lexicon";
import { Trigger } from "../model/game/trigger";
import { GameCommand } from "../command/game-command";
import { Exit } from "../model/game/exit";
import { buildProperName } from "../model/game/name";
import { GaelicNounPhrase } from "../model/language/gaelic/gaelic-noun";
import { EndOfGameCondition } from "../model/game/end-of-game-condition";

const directionNorth = {l1: 'north', l2: 'gu tuath'};
const directionSouth = {l1: 'south', l2: 'gu deas'};
const directionEast = {l1: 'east', l2: 'gu ear'};
const directionWest = {l1: 'west', l2: 'gus an iar'};

const directionFromNorth = {l1: 'from the north', l2: 'bhon tuath'};
const directionFromSouth = {l1: 'from the south', l2: 'bho dheas'};
const directionFromEast = {l1: 'from the east', l2: 'bhon ear'};
const directionFromWest = {l1: 'from the west', l2: 'bhon iar'};

/**
 * Faction all monsters belong to
 */
const factionMonsters = genId();

/**
 * Generates a GameState representing the initial state of a new game
 * 
 * Some Gaelic vocabulary:
 * doras uamha - cave entrance
 * uamhaidh - cavern
 * seòmar tunail - tunnel chamber
 * tuama - tomb  
 * tuama sheòmraichean - chambered tomb
 * ro-sheòmar - antechamber
 * seòmar-toisich - antechamber
 */
export function newGame(): GameState {
    let caveEntrance = buildRoom(
        {l1: 'Cave Entrance', l2: "Doras Uamha"},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in a cave.",
                l2: "Tha thu ann an uamh."
            }),
            ParagraphElement.bilingual({
                l1: "It is dark.",
                l2: "Tha i dorcha."
            }),
        ]),
        [generateSpider(),],
        [generateSword()],
    );

    let tunnelNS = buildRoom(
        {l1: 'Tunnel Chamber', l2: "Seòmar Tunail"},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in a tunnel.",
                l2: "Tha thu ann an tunail."
            }),
            ParagraphElement.bilingual({
                l1: "It is dark and a little wet.",
                l2: "Tha i dorcha 's beagan fliuch."
            }),
        ]),
        [],
        [],
    );
    joinRooms(caveEntrance.room, tunnelNS.room, directionNorth, directionFromNorth, directionSouth, directionFromSouth);

    let cavern = buildRoom(
        {l1: 'Big Cavern', l2: "Uamhaidh Mhòr"},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in a big cavern.",
                l2: "Tha thu ann an uamhaidh mhòr."
            }),
        ]),
        [generateBigRat()],
        [generateKey()],
    );
    joinRooms(tunnelNS.room, cavern.room, directionNorth, directionFromNorth, directionSouth, directionFromSouth);

    let tunnelEW = buildRoom(
        {l1: 'Narrow Tunnel', l2: "Tunail Caol"},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in a narrow tunnel going east and west.",
                l2: "Tha thu ann an tunail caol a' dol dhan ear agus dhan iar."
            }),
        ]),
        [],
        [],
    );
    joinRooms(cavern.room, tunnelEW.room, directionEast, directionFromEast, directionWest, directionFromWest);

    let tomb = buildRoom(
        {l1: 'Tomb', l2: "Tuama"},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in a tomb.",
                l2: "Tha thu ann an tuama."
            }),
            ParagraphElement.bilingual({
                l1: "There is a sarcophagus in the middle of the room.",
                l2: "Tha ciste-laighe cloiche ann am meadhan an t-seòmair."
            }),
        ]),
        [generateSkeleton(), generateBigRat()],
        [],
    );
    joinRooms(tunnelEW.room, tomb.room, directionEast, directionFromEast, directionWest, directionFromWest);

    let gildedDagger = generateFancyDagger();
    let antechamber = buildRoom(
        {l1: 'Antechamber', l2: 'Seòmar-Toisich'},
        StoryElement.paragraph([
            ParagraphElement.bilingual({
                l1: "You are in an antechamber.",
                l2: "Tha thu ann an seòmar-toisich."
            }),
            ParagraphElement.bilingual({
                l1: "There are columns and carved stone.",
                l2: "Tha colbhan agus clach shnaidhte ann."
            }),
        ]),
        [generateBigRat()],
        [gildedDagger],
    );
    let {going} = joinRooms(tomb.room, antechamber.room, directionSouth, directionFromSouth, directionNorth, directionFromNorth);

    // Trap the entrance from Tomb to Antechamber
    tomb.room.triggers.push(Trigger.move({
        exit: going.id,
        buildCommand: (triggeringCharacter: string | undefined, _) => GameCommand.trapDamage({
            defender: triggeringCharacter!!,
            damage: 1,
        }),
    }))

    // Trap the gilden dagger in the antechamber
    antechamber.room.triggers.push(
        Trigger.takeItem({
            item: gildedDagger.id,
            buildCommand: (triggeringCharacter: string | undefined, _) => GameCommand.trapDamage({
                defender: triggeringCharacter!!,
                damage: 1,
            }),
        }),
    );

    // Player
    let factionPlayerParty = genId();
    let playerWeapon = generateDagger();
    let player: CharacterWithResources = {
        character: {
            id: genId(),
            name: PRONOUN_YOU_SINGULAR,
            room: caveEntrance.room.id,
            items: [playerWeapon.id],
            equippedWeapon: playerWeapon.id,
            maxHealth: 10,
            currentHealth: 10,
            faction: factionPlayerParty,
            partyLeader: undefined,
        },
        items: [playerWeapon],
    }

    // Player's companion Lydia in the starting room
    let lydiaWeapon = generateHammer();
    let lydia: CharacterWithResources = {
        character: {
            id: genId(),
            name: buildProperName("Lydia", "she", GaelicNounPhrase.properName({base: "Laoidheach", vocative: "a Laoidheach", personGenderNumber: "she"})),
            room: caveEntrance.room.id,
            items: [lydiaWeapon.id],
            equippedWeapon: lydiaWeapon.id,
            maxHealth: 10,
            currentHealth: 10,
            faction: factionPlayerParty,
            partyLeader: player.character.id,
        },
        items: [lydiaWeapon],
    }
    caveEntrance.characters = [...caveEntrance.characters, lydia];
    caveEntrance.room.characters = [...caveEntrance.room.characters, lydia.character.id];

    // Final Boss
    let draugrBoss = generateDraugrBoss();
    draugrBoss.character.room = antechamber.room.id;
    antechamber.characters = [...antechamber.characters, draugrBoss];
    antechamber.room.characters = [...antechamber.room.characters, draugrBoss.character.id];

    // End of Game Conditions
    let endOfGameConditions: Array<EndOfGameCondition> = [
        EndOfGameCondition.characterDeath({character: draugrBoss.character.id}),
    ];

    return buildGameState(
        player,
        [caveEntrance, tunnelNS, cavern, tunnelEW, tomb, antechamber],
        endOfGameConditions,
    );
}

function buildGameState(
    player: CharacterWithResources,
    allRooms: Array<RoomWithResources>,
    endOfGameConditions: Array<EndOfGameCondition>,
): GameState {
    let rooms: Record<string, Room> = {};
    let characters: Record<string, Character> = {
        [player.character.id]: player.character,
    };
    let items: Record<string, Item> = {};

    // Add all rooms to the game state, with their characters and items
    allRooms.forEach(room => {
        rooms[room.room.id] = room.room;

        // Add the Room's Items to the GameState
        room.items.forEach(item => {
            items[item.id] = item;
        });

        room.characters.forEach(characterWithResources => {
            // Add the Character to the GameState
            characters[characterWithResources.character.id] = characterWithResources.character;

            // Add each of its Items to the GameState
            characterWithResources.items.forEach(item => {
                items[item.id] = item;
            });
        });
    });

    // Add the player's inventory to game state
    player.items.forEach(item => {
        items[item.id] = item;
    });

    // Add the Player to their starting room
    let playerRoom = rooms[player.character.room]
    rooms[playerRoom.id] = {
        ...playerRoom,
        characters: [...playerRoom.characters, player.character.id]
    }

    // Combine characters into an arbitrary turn order
    let characterTurnOrder = Object.keys(characters);

    // Include an EndOfGameCondition for the Player's death
    endOfGameConditions = [
        EndOfGameCondition.characterDeath({character: player.character.id}),
        ...endOfGameConditions,
    ];

    return {
        isGameOver: false,
        endOfGameConditions,
        rooms,
        characters,
        items,
        player: player.character.id,
        characterTurnOrder: characterTurnOrder,
        characterWithTurn: player.character.id,
    };
}

type RoomWithResources = {
    room: Room,
    characters: Array<CharacterWithResources>,
    items: Array<Item>
};

function buildRoom(
    name: BilingualText,
    description: StoryElement<'paragraph'>,
    characters: Array<CharacterWithResources>,
    items: Array<Item>,
): RoomWithResources {
    let roomId = genId()

    return {
        room: {
            id: roomId,
            name,
            description,
            characters: characters.map(character => character.character.id),
            items: items.map(item => item.id),
            exits: [],
            triggers: [],
        },
        characters: characters.map(characterWithResources => ({
            ...characterWithResources,
            character: {
                ...characterWithResources.character,
                room: roomId,
            },
        })),
        items,
    }
}

function joinRooms(
    room1: Room,
    room2: Room,
    direction1to2: BilingualText,
    directionReverse1to2: BilingualText,
    direction2to1: BilingualText,
    directionReverse2to1: BilingualText
): {
    going: Exit,
    coming: Exit,
} {
    let going = {
        id: genId(),
        direction: direction1to2,
        directionReverse: directionReverse1to2,
        room: room2.id,
    };
    room1.exits.push(going);

    let coming = {
        id: genId(),
        direction: direction2to1,
        directionReverse: directionReverse2to1,
        room: room1.id,
    };
    room2.exits.push(coming);

    return {
        going,
        coming,
    }
}

type CharacterWithResources = {
    character: Character,
    items: Item[],
}

function generateDraugrBoss(): CharacterWithResources {
    let weapon = {
        id: genId(),
        name: NOUN_SWORD_ANCIENT,
    };

    return {
        character: {
            id: genId(),
            name: NOUN_DRAUGR_LORD,
            room: '',
            items: [weapon.id],
            equippedWeapon: weapon.id,
            maxHealth: 5,
            currentHealth: 5,
            faction: factionMonsters,
            partyLeader: undefined,
        },
        items: [weapon],
    }
}

function generateSkeleton(): CharacterWithResources {
    let weapon = generateSword();

    return {
        character: {
            id: genId(),
            name: NOUN_SKELETON,
            room: '',
            items: [weapon.id],
            equippedWeapon: weapon.id,
            maxHealth: 2,
            currentHealth: 2,
            faction: factionMonsters,
            partyLeader: undefined,
        },
        items: [weapon],
    }
}

function generateSpider(): CharacterWithResources {
    return {
        character: {
            id: genId(),
            name: NOUN_BIG_SPIDER,
            room: '',
            items: [],
            equippedWeapon: undefined,
            maxHealth: 1,
            currentHealth: 1,
            faction: factionMonsters,
            partyLeader: undefined,
        },
        items: [],
    }
}

function generateBigRat(): CharacterWithResources {
    return {
        character: {
            id: genId(),
            name: NOUN_BIG_RAT,
            room: '',
            items: [],
            equippedWeapon: undefined,
            maxHealth: 1,
            currentHealth: 1,
            faction: factionMonsters,
            partyLeader: undefined,
        },
        items: [],
    }
}

function generateDagger(): Item {
    return {
        id: genId(),
        name: NOUN_DAGGER,
    };
}

function generateHammer(): Item {
    return {
        id: genId(),
        name: NOUN_HAMMER,
    };
}

function generateSword(): Item {
    return {
        id: genId(),
        name: NOUN_SWORD,
    };
}

function generateFancyDagger(): Item {
    return {
        id: genId(),
        name: NOUN_FANCY_DAGGER,
    };
}

function generateKey(): Item {
    return {
        id: genId(),
        name: NOUN_KEY,
    };
}