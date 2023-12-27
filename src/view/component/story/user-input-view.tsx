import { StoryElement } from '../../../model/bilingual-story/story';

export function UserInputView({
  userInput,
}: {
  userInput: StoryElement<'userInput'>;
}) {
  return (
    <div className='player-input'>
      {'> '}
      {userInput.input}
    </div>
  );
}
