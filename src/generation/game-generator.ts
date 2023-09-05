import { BilingualText } from "../model/bilingual-story/bilingual-text";
import { GameState } from "../model/game/game-state";
import { Room } from "../model/game/room";

const directionNorth = {l1: 'north', l2: 'gu tuath'};
const directionSouth = {l1: 'south', l2: 'gu deas'};
const directionEast = {l1: 'east', l2: 'gu ear'};
const directionWest = {l1: 'west', l2: 'an iar'};

/**
 * Generates a GameState representing the initial state of a new game
 */
export function newGame(): GameState {
    let startingRoom: Room = {
        name: {l1: 'Cave', l2: "Uamh"},
        description: {paragraphElements: [
            {l1: "You are in a cave.", l2: "Tha thu ann an uamh."},
            {l1: "It is dark.", l2: "Tha i dorcha."},
        ]},
        characters: [
            {
                name: {l1: "a skeleton", l2: "cnàimhneach"},
                items: [],
            },
            {
                name: {l1: "a spider", l2: "damhan"},
                items: [],
            },
        ],
        items: [
            {
                name: {l1: "a sword", l2: "claidheamh"},
            },
        ],
        exits: [],
    }

    let tunnel: Room = {
        name: {l1: 'Tunnel', l2: "Tunail"},
        description: {paragraphElements: [
            {l1: "You are in a tunnel.", l2: "Tha thu ann an tunail."},
            {l1: "It is dark and a little wet.", l2: "Tha i dorcha 's beagan fliuch."},
        ]},
        characters: [
            {
                name: {l1: "a rat", l2: "radan"},
                items: [],
            },
        ],
        items: [
            {
                name: {l1: "a key", l2: "iuchair"},
            },
        ],
        exits: []
    }
    joinRooms(startingRoom, tunnel, directionNorth, directionSouth);

    return {
        player: {
            name: {l1: "you", l2: "sibh"},
            items: [],
        },
        room: startingRoom
    }
}

function joinRooms(room1: Room, room2: Room, direction: BilingualText, returnDirection: BilingualText) {
    room1.exits.push({
        direction: direction,
        room: room2
    });
    room2.exits.push({
        direction: returnDirection,
        room: room1
    });
}
