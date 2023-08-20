import React, { useState, useMemo, Ref, useRef } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { newGame } from './model/game';
import { GAELIC_HELP_COMMAND, executeCommand, getValidCommandInputs, look } from './model/command-parser';
import { ToggleInlineTranslation } from './component/toggle-translate';
import { Story, StoryState } from './model/story';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { StoryView } from './component/story-view';

function App() {
  let [gameState, setGameState] = useState(newGame());

  let helpPrompt = {l1: "Type 'help' for help.", l2: `Clò-sgrìobh '${GAELIC_HELP_COMMAND}' airson cuideachadh.`}

  // Initialize the game's Story including welcome messages and an initial "look" command
  let story: Story = [
    {paragraphElements: [
      {l1: "Welcome to the game.", l2: "Fàilte dhan geama."},
      helpPrompt,
    ]},
    ...look(gameState)
  ];

  let [storyState, setStoryState] = useState({story: story} as StoryState);

  const { register, handleSubmit, control } = useForm();

  let onEnterCommand = function(data: any) {
    if (data.command) {
      // TODO clear the command input

      let command: string = data.command[0];
      let newState = executeCommand(command, gameState, storyState);
      setGameState(newState.gameState);
      setStoryState(newState.storyState);
    }
  }

  let validInputs = useMemo(
    () => getValidCommandInputs(gameState),
    [gameState]
  );

  return (
    <div className="App">
      <StoryView storyState={storyState}/>

      <div>
        <Form onSubmit={handleSubmit(onEnterCommand)}>
          <Form.Group as={Row} className="mb-3" controlId="command">
            <Form.Label column sm={2}>
              <ToggleInlineTranslation bilingual={{l1: "command", l2: "comannd"}}/>
              {': '}
            </Form.Label>
            <Col sm={10}>
              <Controller
                  control={control}
                  name="command"
                  render={({ field, fieldState }) => (
                    <Typeahead
                      {...field}
                      id="command"
                      options={validInputs}
                      clearButton
                      flip
                    ></Typeahead>
                  )}
                />
            </Col>
            <button type="submit">⏎</button>

            <Form.Text className="text-muted">
              <ToggleInlineTranslation bilingual={helpPrompt}/>
            </Form.Text>  
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}

export default App;
