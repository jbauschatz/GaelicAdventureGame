import { buildOxfordCommaList } from "../model/bilingual-story/story-util";
import { Paragraph, Story } from "../model/bilingual-story/story";
import { GameState } from "../model/game/game-state";
import { Room } from "../model/game/room";
import { Command } from "./command-parser";

export const LOOK_COMMAND: Command = {
    l1: 'look',
    l2: 'seall',
    helpText: {l1: 'Look around', l2: 'Seall mun cuairt'},
    execute: (rest: string, gameState: GameState) => {
        return {
            gameState,
            story: [
                // Narrate the player looking around
                {paragraphElements: [
                    {l1: 'You look around...', l2: 'Seallaidh sibh mun cuairt...'}
                ]},

                // Look around
                ...look(gameState)
            ]
        }
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: ['look'],
            l2: ['seall'],
        }
    }
}

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
