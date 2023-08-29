
export type BilingualText = {
    l1: string;
    l2: string;
}

export const CONJUNCTION_AND = { l1: 'and', l2: 'agus'};

export function buildOxfordCommaList(texts: Array<BilingualText>): Array<BilingualText | string> {
    if (texts.length === 1) {
        return texts
    } else if (texts.length === 2) {
        return [
            texts[0],
            CONJUNCTION_AND,
            texts[1]
        ];
    } else {
        let oxfordList = [];
        for (let i = 0; i < texts.length - 1; ++i) {
            oxfordList.push(texts[i]);
            oxfordList.push(",");
        }
        oxfordList.push(CONJUNCTION_AND);
        oxfordList.push(texts[texts.length - 1]);

        return oxfordList;
    }
}
