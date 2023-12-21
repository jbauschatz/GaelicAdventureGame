import { CommandPreview } from "../../../../command/parser/command-preview";
import { ParagraphElement } from "../../../../model/bilingual-story/story";
import { ToggleInlineTranslation } from "../../story/toggle-translate";
import { CommandEntryMode } from "./command-builder-panel";

let instructions = ParagraphElement.bilingual({
    l1: "enter a command...",
    l2: "cuir a-steach àithne..."
});

type CommandPreviewTextProperties = {
    commandBuilder: CommandPreview | undefined,
    commandEntryMode: CommandEntryMode,
}

export function CommandPreviewText({commandBuilder, commandEntryMode}: CommandPreviewTextProperties) {
    if (commandBuilder) {
        return <span className="player-input">
            {'> '}
            {commandBuilder.l2PreviewText}
            {commandEntryMode === 'combined' && <>
                <br/>
                {' '}{' '}({commandBuilder.l1PreviewText})
            </>}
        </span>
    } else {
        // Show this prompt when no command is being previewed
        return <span className="player-input">
            {'> '}
            <i>
                <ToggleInlineTranslation bilingual={instructions}/>
            </i>
        </span>
    }
}