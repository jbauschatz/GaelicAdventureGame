import { ParagraphElement, StoryElement } from "../../../model/bilingual-story/story";
import { ToggleInlineTranslation } from "../toggle-translate";

export function HeadingView({heading}: {heading: StoryElement<'heading'>}) {
    return <h4 className="paragraph-header">
        <ToggleInlineTranslation bilingual={heading.heading}/>
    </h4>
}