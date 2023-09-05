import { StoryElement } from "../../../model/bilingual-story/story"
import { ToggleInlineTranslation } from "../toggle-translate"
import { match } from 'variant';

export function ParagraphView({paragraph}: {paragraph: StoryElement<'paragraph'>}) {
    return <div>
        {paragraph.sentences.map((sentence, sentenceIndex) => {
            return <span key={`sentence${sentenceIndex}`}>
                {match(sentence, {
                    bilingual: bilingual => <ToggleInlineTranslation bilingual={bilingual.bilingual}/>,
                    staticText: staticText => <>staticText.text</>
                })}
                {' '}
            </span>
        })}
  </div>
}