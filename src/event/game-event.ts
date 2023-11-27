
import {variant, fields, VariantOf, TypeNames} from 'variant';
import { BilingualText } from '../model/bilingual-text';
import { Story } from '../model/bilingual-story/story';

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
        sourceRoom: string,

        /**
         * Room the Character is moving into
         */
        destinationRoom: string,

        /**
         * The Exit the Character took as they leave the source room, from the perspective of the source room
         */
        sourceExit: string,

        /**
         * The Exit the Character took as they entered the destination room, from the perspective of the destination room
         */
        destinationExit: string,
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
     * Indicates a Character attacks another Character
     */
    attack: fields<{
        /**
         * The Character attacking
         */
        attacker: string,

        /**
         * Item the attacker is attacking with, if any
         */
        weapon: string | undefined,

        /**
         * The Character defending
         */
        defender: string,

        /**
         * Whether the attack killed the defender
         */
        isFatal: boolean,
    }>(),

    /**
     * A trap deals damage to the given Character
     */
    trapDamage: fields<{
        /**
         * The Character being damaged
         */
        defender: string,

        /**
         * Whether the trap killed the defender
         */
        isFatal: boolean,
    }>(),

    /**
     * The given {@link Story} should be narrated to the user
     */
    narration: fields<{
        story: Story
    }>(),

    /**
     * Indicates that the game is over
     */
    gameOver: {},

    /**
     * Indicates the Player looks at their current Room
     */
    look: fields<{
        isPlayerInitiated: boolean
    }>(),

    /**
     * Indicates the Player lists their Inventory
     */
    inventory: {},

    /**
     * Indicates the Player asks for help
     */
    help: {},

    /**
     * Indicates a Character waits
     */
    wait: fields<{actor: string}>(),
});
export type GameEvent<T extends TypeNames<typeof GameEvent> = undefined>
     = VariantOf<typeof GameEvent, T>;