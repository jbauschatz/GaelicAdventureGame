import { TypeNames, VariantOf, fields, variant } from "variant";
import { GameCommand } from "../../command/game-command";

export const Trigger = variant({
    takeItem: fields<{
        item: string,
        buildCommand: (
            triggeringCharacter: string | undefined,
            room: string | undefined
        ) => GameCommand,
    }>(),
    move: fields<{
        exit: string,
        buildCommand: (
            triggeringCharacter: string | undefined,
            room: string | undefined
        ) => GameCommand,
    }>(),
});
export type Trigger<T extends TypeNames<typeof Trigger> = undefined>
     = VariantOf<typeof Trigger, T>;