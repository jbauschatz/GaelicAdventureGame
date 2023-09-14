
import {variant, fields, VariantOf, TypeNames} from 'variant';
import { Character } from '../model/game/character';
import { Room } from '../model/game/room';
import { Item } from '../model/game/item';
import { BilingualText } from '../model/bilingual-story/bilingual-text';

export const GameEvent = variant({
    /**
     * Indicates the Player receives some kind of validation about a command they attempted to run
     */
    commandValidation: fields<{
        message: BilingualText
    }>(),

    /**
     * Indicates a Character moves from one Room to another
     */
    move: fields<{
        /**
         * The Character doing the moving
         */
        actor: string,

        /**
         * Room the Character is moving from
         */
        fromRoom: string,

        /**
         * Room the Character is moving to
         */
        toRoom: string,

        /**
         * Direction the Character is moving as they exit the fromRoom
         */
        toDirection: BilingualText,
    }>(),

    /**
     * Indicates a Character takes an item from the Room they occupy
     */
    takeItem: fields<{
        /**
         * The Character taking the item
         */
        actor: string,

        /**
         * The Item being taken
         */
        item: string,
    }>(),

    /**
     * Indicates the Player looks at their current Room
     */
    look: {},

    /**
     * Indicates the Player lists their Inventory
     */
    inventory: {},

    /**
     * Indicates the Player asks for help
     */
    help: {},
});
export type GameEvent<T extends TypeNames<typeof GameEvent> = undefined>
     = VariantOf<typeof GameEvent, T>;