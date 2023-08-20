import { useState } from "react";
import { BilingualText } from "../model/language";
import classNames from "classnames";

export function ToggleInlineTranslation({bilingual}: {bilingual: BilingualText}) {
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
            {bilingual.l2}
        </span>
        {translate && <span className="l1-text highlight-for-translation fade-in-text"
            onClick={() => toggle()}>
            {' '}({bilingual.l1})
        </span>}
    </>
}  