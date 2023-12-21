
import { BilingualName } from "./name";

/**
 * A Character in the game such as the Player Character, an enemy, or other NPC.
 */
export type Character = {
    id: string,
    name: BilingualName,
    room: string,
    items: Array<string>,
    equippedWeapon: string | undefined,
    maxHealth: number,
    currentHealth: number,

    /**
     * Faction this Character belongs to, indicating alliance status with other Characters
     */
    faction: string | undefined,

    /**
     * The Character this Character is following around, if any
     */
    partyLeader: string | undefined,
}
