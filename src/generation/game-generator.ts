import { BilingualText } from "../model/bilingual-text";
import { ParagraphElement, StoryElement } from "../model/bilingual-story/story";
import { Character } from "../model/game/character";
import { GameState } from "../model/game/game-state";
import { Item } from "../model/game/item";
import { Room } from "../model/game/room";
import { genId } from "./id";

const directionNorth = {l1: 'north', l2: 'gu tuath'};
const directionSouth = {l1: 'south', l2: 'gu deas'};
const directionEast = {l1: 'east', l2: 'gu ear'};
const directionWest = {l1: 'west', l2: 'an iar'};

/**
 * Generates a GameState representing the initial state of a new game
 */
export function newGame(): GameState {
    let startingRoom = buildRoom(
        {l1: 'Cave', l2: "Uamh"},
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
        [generateSkeleton(), generateSpider(),],
        [generateSword()],
    );

    let tunnel = buildRoom(
        {l1: 'Tunnel', l2: "Tunail"},
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
        [generateRat()],
        [generateKey()],
    );
    joinRooms(startingRoom.room, tunnel.room, directionNorth, directionSouth);

    let player: Character = {
        id: genId(),
        name: {l1: "you", l2: "sibh"},
        items: [],
        maxHealth: 1,
        currentHealth: 1,
    };

    return buildGameState(
        player,
        startingRoom.room,
        [startingRoom, tunnel],
    );
}

function buildGameState(
    player: Character,
    startingRoom: Room,
    allRooms: Array<RoomWithResources>,
): GameState {
    let rooms: Record<string, Room> = {};
    let characters: Record<string, Character> = {
        [player.id]: player,
    };
    let items: Record<string, Item> = {};

    allRooms.forEach(room => {
        rooms[room.room.id] = room.room;
        room.characters.forEach(character => {
            characters[character.id] = character;
        });
        room.items.forEach(item => {
            items[item.id] = item;
        });
    });

    return {
        isGameOver: false,
        rooms,
        characters,
        items,
        player: player.id,
        currentRoom: startingRoom.id,
    }
}

type RoomWithResources = {
    room: Room,
    characters: Array<Character>,
    items: Array<Item>
};

function buildRoom(
    name: BilingualText,
    description: StoryElement<'paragraph'>,
    characters: Array<Character>,
    items: Array<Item>,
): RoomWithResources {
    return {
        room: {
            id: genId(),
            name,
            description,
            characters: characters.map(character => character.id),
            items: items.map(item => item.id),
            exits: [],
        },
        characters,
        items,
    }
}

function joinRooms(room1: Room, room2: Room, direction: BilingualText, returnDirection: BilingualText) {
    room1.exits.push({
        direction: direction,
        room: room2.id
    });
    room2.exits.push({
        direction: returnDirection,
        room: room1.id
    });
}

function generateSkeleton(): Character {
    return {
        id: genId(),
        name: {l1: "a skeleton", l2: "cnàimhneach"},
        items: [],
        maxHealth: 2,
        currentHealth: 2,
    };
}

function generateSpider(): Character {
    return {
        id: genId(),
        name: {l1: "a big spider", l2: "damhan mòr"},
        items: [],
        maxHealth: 1,
        currentHealth: 1,
    }
}

function generateRat(): Character {
    return {
        id: genId(),
        name: {l1: "a rat", l2: "radan"},
        items: [],
        maxHealth: 1,
        currentHealth: 1,
    }
}

function generateSword(): Item {
    return {
        id: genId(),
        name: {l1: "a sword", l2: "claidheamh"},
    };
}

function generateKey(): Item {
    return {
        id: genId(),
        name: {l1: "a key", l2: "iuchair"},
    };
}