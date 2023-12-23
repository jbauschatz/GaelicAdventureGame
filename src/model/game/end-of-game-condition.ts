import { TypeNames, VariantOf, fields, variant } from "variant";

export const EndOfGameCondition = variant({
    /**
     * End the game when this character dies
     */
    characterDeath: fields<{
        character: string,
    }>(),
});
export type EndOfGameCondition<T extends TypeNames<typeof EndOfGameCondition> = undefined>
     = VariantOf<typeof EndOfGameCondition, T>;