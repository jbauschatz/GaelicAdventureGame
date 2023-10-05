import { StoryState } from "../../../model/bilingual-story/story";
import { HeadingView } from "./heading-view";
import { match } from 'variant';
import { UserInputView } from "./user-input-view";
import { ParagraphView } from "./paragraph-view";

export function StoryView({storyState} : {storyState: StoryState}) {
  return <div className="story">
    {storyState.story.map((storyElement, storyIndex) => {
      return match(storyElement, {
        paragraph: paragraph => <ParagraphView paragraph={paragraph} key={"paragraph-" + storyIndex}/>,
        heading: heading => <HeadingView heading={heading} key={"heading-" + storyIndex}/>,
        userInput: userInput => <UserInputView userInput={userInput} key={"user-input-" + storyIndex}/>,
      });
    })}
  </div>
}