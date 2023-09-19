import { useMemo } from "react";
import { ParagraphElement, StoryElement } from "../../../model/bilingual-story/story";
import { ToggleInlineTranslation } from "./toggle-translate";

export function HeadingView({heading}: {heading: StoryElement<'heading'>}) {
    let bilingualHeading = useMemo(
        () => ParagraphElement.bilingual(heading.heading),
        [heading]
    );
    return <h4 className="paragraph-header">
        <ToggleInlineTranslation bilingual={bilingualHeading}/>
    </h4>
}