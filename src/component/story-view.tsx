import { Paragraph, StoryState, UserInput } from "../model/bilingual-story/story";
import { ToggleInlineTranslation } from "./toggle-translate";

export function StoryView({storyState} : {storyState: StoryState}) {
    return <div className="story">
    {storyState.story.map((storyElement, storyIndex) => {
      if ('heading' in storyElement) {
        return <h4>
          <ToggleInlineTranslation bilingual={storyElement.heading}/>
        </h4>
      } else if ('input' in storyElement) {
        let input: UserInput = storyElement;
        return <div>
          {'>' }{input.input}
        </div>;
      } else {
        let paragraph: Paragraph = storyElement;
        return <div key={`paragraph${storyIndex}`}>

          {paragraph.paragraphElements.map((element, sentenceIndex) => {
            return <span key={`paragraph${storyIndex}-sentence${sentenceIndex}`}>
                {/* Non-translation text */}
                {(typeof element === 'string' || element instanceof String) && element}

                {/* Translation text */}
                {!(typeof element === 'string' || element instanceof String) && <ToggleInlineTranslation bilingual={element}/>}
                {' '}
            </span>
          })}
        </div>;
      }
    })}
  </div>
}