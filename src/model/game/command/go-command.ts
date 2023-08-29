import { GameState } from "../game";
import { Command } from "./command-parser";
import { look } from "./look-command";

export const GO_COMMAND: Command = {
    l1: 'go',
    l2: 'rach',
    helpText: {l1: 'Go in a direction', l2: 'Rach ann an rathad'},
    execute: (rest: string, gameState: GameState) => {
        if (!rest) {
            return {
                gameState,
                story: [{paragraphElements: [
                    {
                        l1: 'Type "go" and then the direction you would like to go',
                        l2: '[Type "go" and then the direction you would like to go]'
                    }
                ]}]
            }
        }

        let exit = gameState.room.exits.find(exit => exit.direction.l1 === rest || exit.direction.l2 === rest);
        if (!exit) {
            return {
                gameState,
                story: [{paragraphElements: [
                    {
                        l1: `You cannot go "${rest}".`,
                        l2: `Chan fhaodaidh sibh a dhol "${rest}".`
                    }
                ]}]
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
            story: [
                // Narrate the movement to the new room
                {paragraphElements: [
                    {l1: `You go ${exit.direction.l1}...`, l2: `Thèid sibh ${exit.direction.l2}...`}
                ]},

                // Execute "look" in the new room
                ...look(newGameState)
            ]
        }
    },
    getValidCommands: (gameState: GameState) => {
        return {
            l1: gameState.room.exits.map(exit => 'go ' + exit.direction.l1),
            l2: gameState.room.exits.map(exit => 'rach ' + exit.direction.l2),
        }
    }
}