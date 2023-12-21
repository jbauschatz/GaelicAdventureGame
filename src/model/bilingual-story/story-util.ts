import { BilingualText } from "../bilingual-text";
import { ParagraphElement, ref } from "./story";

export const CONJUNCTION_AND = { l1: 'and', l2: 'agus'};
export const CONJUNCTION_OR = { l1: 'or', l2: 'no'};

/**
 * Builds a Bilingual list of names, seperated into individual translated elements, and separated by the Oxford Comma
 */
export function buildOxfordCommaList(
    namedEntities: Array<{entity: any, name: BilingualText}>,
    conjunction: BilingualText = CONJUNCTION_AND
): Array<ParagraphElement> {
    if (namedEntities.length === 1) {
        return [
            buildBilingualEntityReference(namedEntities[0])
        ];
    } else if (namedEntities.length === 2) {
        let firstNamedEntity = namedEntities[0]
        let secondNamedEntity = namedEntities[1]
        return [
            ParagraphElement.bilingual({
                l1: [ref(firstNamedEntity.entity, firstNamedEntity.name.l1)],
                l2: [ref(firstNamedEntity.entity, firstNamedEntity.name.l2)],
            }),
            ParagraphElement.bilingual(conjunction),
            ParagraphElement.bilingual({
                l1: [ref(secondNamedEntity.entity, secondNamedEntity.name.l1)],
                l2: [ref(secondNamedEntity.entity, secondNamedEntity.name.l2)],
            }),
        ];
    } else {
        let oxfordList = Array<ParagraphElement>();
        for (let i = 0; i < namedEntities.length - 1; ++i) {
            oxfordList.push(buildBilingualEntityReference(namedEntities[0]));
            oxfordList.push(ParagraphElement.staticText({text: ','}));
        }
        oxfordList.push(ParagraphElement.bilingual(conjunction));
        oxfordList.push(buildBilingualEntityReference(namedEntities[namedEntities.length - 1]));

        return oxfordList;
    }
}

function buildBilingualEntityReference({entity, name}: {entity: any, name: BilingualText}): ParagraphElement<'bilingual'> {
    return ParagraphElement.bilingual({
        l1: [ref(entity, name.l1)],
        l2: [ref(entity, name.l2)],
    });
}