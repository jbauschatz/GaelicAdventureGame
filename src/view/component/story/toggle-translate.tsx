import { useState } from "react";
import classNames from "classnames";
import { TextView } from "./text-view";
import { ParagraphElement } from "../../../model/bilingual-story/story";

export function ToggleInlineTranslation({bilingual}: {bilingual: ParagraphElement<'bilingual'>}) {
    let [translate, setTranslate] = useState(false);

    let toggle = function() {
        setTranslate(!translate);
    }

    const l2ClassNames = classNames({
        "l2-text": true,
        "fade-in-text": true,
        "highlight-for-translation": translate
    });

    return <>
        <span className={l2ClassNames}
            onClick={() => toggle()}>
            <TextView text={bilingual.l2}/>
        </span>
        {translate && <span className="l1-text highlight-for-translation fade-in-text"
            onClick={() => toggle()}>
            {' ('}<TextView text={bilingual.l1}/>{')'}
        </span>}
    </>
}