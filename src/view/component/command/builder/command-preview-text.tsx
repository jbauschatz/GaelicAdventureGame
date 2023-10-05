import { CommandPreview } from "../../../../command/parser/command-preview";
import { ParagraphElement } from "../../../../model/bilingual-story/story";
import { ToggleInlineTranslation } from "../../story/toggle-translate";

let instructions = ParagraphElement.bilingual({
    l1: "enter a command...",
    l2: "cuir a-steach comand..."
})

export function CommandPreviewText({commandBuilder}: {commandBuilder: CommandPreview | undefined}) {
    if (commandBuilder) {
        return <span className="player-input">
            {'> '}
            {commandBuilder.previewText}
        </span>
    } else {
        return <span className="player-input">
            {'> '}
            <i>
                <ToggleInlineTranslation bilingual={instructions}/>
            </i>
        </span>
    }
}