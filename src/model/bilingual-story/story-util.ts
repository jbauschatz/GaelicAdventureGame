import { BilingualText } from "./bilingual-text";
import { ParagraphElement } from "./story";

export const CONJUNCTION_AND = { l1: 'and', l2: 'agus'};

export function buildOxfordCommaList(texts: Array<BilingualText>): Array<ParagraphElement> {
    if (texts.length === 1) {
        return [
            ParagraphElement.bilingual({bilingual: texts[0]})
        ];
    } else if (texts.length === 2) {
        return [
            ParagraphElement.bilingual({bilingual: texts[0]}),
            ParagraphElement.bilingual({bilingual: CONJUNCTION_AND}),
            ParagraphElement.bilingual({bilingual: texts[1]}),
        ];
    } else {
        let oxfordList = Array<ParagraphElement>();
        for (let i = 0; i < texts.length - 1; ++i) {
            oxfordList.push(ParagraphElement.bilingual({bilingual: texts[i]}));
            oxfordList.push(ParagraphElement.staticText({text: ','}));
        }
        oxfordList.push(ParagraphElement.bilingual({bilingual: CONJUNCTION_AND}));
        oxfordList.push(ParagraphElement.bilingual({bilingual: texts[texts.length - 1]}));

        return oxfordList;
    }
}
