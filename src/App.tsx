import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row } from 'react-bootstrap';
import { newGame } from './model/game/game';
import { executeCommand } from './model/game/command/command-parser';
import { Story, StoryState } from './model/bilingual-story/story';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { StoryView } from './component/story-view';
import { look } from './model/game/command/look-command';
import { GAELIC_HELP_COMMAND } from './model/game/command/help-command';
import { CommandInput } from './component/command-input';


export const GLOBAL_HELP_PROMPT = {l1: "Type 'help' for help.", l2: `Clò-sgrìobh '${GAELIC_HELP_COMMAND}' airson cuideachadh.`}

function App() {
  // Create a new game when the app loads
  let [gameState, setGameState] = useState(newGame());

  // Initialize the game's Story including welcome messages and an initial "look" command
  let story: Story = [
    {paragraphElements: [
      {l1: "Welcome to the game.", l2: "Fàilte dhan geama."},
      GLOBAL_HELP_PROMPT,
    ]},
    ...look(gameState)
  ];
  let [storyState, setStoryState] = useState({story: story} as StoryState);

  // When a command is ented in the Command Input component, execute it
  let onEnterCommand = function(commandInput: string) {
      let newState = executeCommand(commandInput, gameState, storyState);
      setGameState(newState.gameState);
      setStoryState(newState.storyState);
  }

  return (
    <div className="console">
      <Container className="vh-100 d-flex flex-column">
        <Row className="h-100 overflow-y-scroll" style={{flexDirection: "column-reverse"}}>
            <StoryView storyState={storyState}/>
        </Row>

        <Row>
          <div className="commands">
            <CommandInput gameState={gameState} onEnterCommand={(commandInput) => onEnterCommand(commandInput)}/>
          </div>
        </Row>
      </Container>
    </div>
  );
}

export default App;
