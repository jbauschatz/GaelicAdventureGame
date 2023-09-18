import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row } from 'react-bootstrap';
import { parseCommand } from './command/parser/command-parser';
import { ParagraphElement, Story, StoryElement, StoryState } from './model/bilingual-story/story';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { StoryView } from './view/component/story/story-view';
import { CommandInput } from './view/component/command-input';
import { newGame } from './generation/game-generator';
import { GAELIC_ENGLISH_NARRATOR, narrateRoom } from './narrator/gaelic-english-narrator';
import { GameCommand } from './command/game-command';
import { GameEvent } from './event/game-event';
import { isType } from 'variant';
import { executeCommand } from './command/command-executor';
import { GAELIC_HELP_COMMAND } from './command/parser/help-command-parser';

export const GLOBAL_HELP_PROMPT = {l1: "Type 'help' for help.", l2: `Clò-sgrìobh '${GAELIC_HELP_COMMAND}' airson cuideachadh.`}

function App() {
  // Create a new game when the app loads
  let [gameState, setGameState] = useState(newGame());

  // Initialize the game's Story including welcome messages and an initial "look" command
  let story: Story = [
    StoryElement.paragraph([
      ParagraphElement.bilingual({bilingual: {
        l1: "Welcome to the game.",
        l2: "Fàilte dhan geama."
      }}),
      ParagraphElement.bilingual({bilingual: GLOBAL_HELP_PROMPT})
    ]),
    ...narrateRoom(gameState)
  ];
  let [storyState, setStoryState] = useState({story: story} as StoryState);

  // When a command is entered in the Command Input component, execute it
  let onEnterCommand = function(commandInput: string) {
    // Do not allow any commands if the game is over
    if (gameState.isGameOver === true) {
      return;
    }

    // Parse the user's input
    let commandOrValidation: GameCommand | GameEvent<'commandValidation'> =
        parseCommand(commandInput, gameState);

    if (isType(commandOrValidation, GameEvent.commandValidation)) {
      let validationEvent: GameEvent<'commandValidation'> = commandOrValidation;

      // Narrate the command validation
      let eventNarration: Story = GAELIC_ENGLISH_NARRATOR.narrateEvent(
        validationEvent,
        gameState,
        gameState
      );
      // Combine the previous story, the player's input, and the new validation narration
      setStoryState({
        story: [
            ...storyState.story,
            StoryElement.userInput({input: commandInput}),
            ...eventNarration
        ] 
      });
    } else {
      let command: GameCommand = commandOrValidation;

      // Execute the command and determine the new state
      let stateTransition = executeCommand(command, gameState);

      // Narrate the change in state
      let eventNarration: Story = stateTransition.events.flatMap(event => 
        GAELIC_ENGLISH_NARRATOR.narrateEvent(
          event,
          gameState,
          stateTransition.gameStateAfter
        )
      );
      // Combine the previous story, the player's input, and the new story
      setStoryState({
        story: [
            ...storyState.story,
            StoryElement.userInput({input: commandInput}),
            ...eventNarration
        ]
      });

      setGameState(stateTransition.gameStateAfter);
    }
  }

  return (
    <div className="console">
      <Container className="vh-100 d-flex flex-column">
        <Row className="h-100 overflow-y-scroll" style={{flexDirection: "column-reverse"}}>
            <StoryView storyState={storyState}/>
        </Row>

        <Row className="command-input">
          <CommandInput gameState={gameState} onEnterCommand={(commandInput) => onEnterCommand(commandInput)}/>
        </Row>
      </Container>
    </div>
  );
}

export default App;
