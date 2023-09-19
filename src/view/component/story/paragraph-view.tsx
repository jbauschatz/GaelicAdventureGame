import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoryElement } from "../../../model/bilingual-story/story"
import { ToggleInlineTranslation } from "./toggle-translate"
import { match } from 'variant';
import { faChessKnight } from '@fortawesome/free-solid-svg-icons'

export function ParagraphView({paragraph}: {paragraph: StoryElement<'paragraph'>}) {
    return <div>
        {/* Icon for paragraph topic */}
        {paragraph.topic === 'combat' &&
            <span className="paragraph-topic-icon combat">
                <FontAwesomeIcon icon={faChessKnight} />
            </span>
        }
        {paragraph.sentences.map((sentence, sentenceIndex) => {
            return <span key={`sentence${sentenceIndex}`}>
                {match(sentence, {
                    bilingual: bilingual => <ToggleInlineTranslation bilingual={bilingual}/>,
                    staticText: staticText => <>{staticText.text}</>
                })}
                {' '}
            </span>
        })}
  </div>
}