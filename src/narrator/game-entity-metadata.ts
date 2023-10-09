import { TypeNames, VariantOf, fields, variant } from "variant";

/**
 * Metadata to be included on a {@link EntityReference} so that as various game entities are narrated,
 * additional data about them can be conveyed to the user
 */
export const GameEntityMetadata = variant({
    enemy: () => fields({}),
    item: () => fields({}),
    direction: () => fields({}),
    other: () => fields({}),
});
export type GameEntityMetadata<T extends TypeNames<typeof GameEntityMetadata> = undefined>
        = VariantOf<typeof GameEntityMetadata, T>;