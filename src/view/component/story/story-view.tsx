import { StoryState } from "../../../model/bilingual-story/story";
import { HeadingView } from "./heading-view";
import { match } from 'variant';
import { UserInputView } from "./UserInputView";
import { ParagraphView } from "./paragraph-view";

export function StoryView({storyState} : {storyState: StoryState}) {
  return <div className="story">
    {storyState.story.map((storyElement, storyIndex) => {
      return match(storyElement, {
        paragraph: paragraph => <ParagraphView paragraph={paragraph}/>,
        heading: heading => <HeadingView heading={heading}/>,
        userInput: userInput => <UserInputView userInput={userInput}/>,
      });
    })}
  </div>
}