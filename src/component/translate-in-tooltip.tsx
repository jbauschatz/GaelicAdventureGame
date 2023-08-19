import { BilingualText } from "../model/language";

export function TranslateInTooltip({bilingual}: {bilingual: BilingualText}) {
    return <span className="tooltip-trigger">
        {bilingual.l2}
        <div className="tooltip tooltip-bottom">
            {bilingual.l2}
            <br/>
            {bilingual.l1}
        </div>
    </span>
}