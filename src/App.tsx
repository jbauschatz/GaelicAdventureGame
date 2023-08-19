import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { newGame } from './model/game';
import { GAELIC_HELP_COMMAND, executeCommand, look } from './model/command-parser';
import { ToggleInlineTranslation } from './component/toggle-translate';
import { Paragraph, Story, StoryState, UserInput } from './model/story';

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

  const { register, handleSubmit } = useForm();

  let onEnterCommand = function(data: any) {
    let command: string = data.command;
    let newState = executeCommand(command, gameState, storyState);
    setGameState(newState.gameState);
    setStoryState(newState.storyState);
  }

  return (
    <div className="App">
      <div className="story">
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

      <div>
        <Form onSubmit={handleSubmit(onEnterCommand)}>
          <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Form.Label column sm={2}>
              <ToggleInlineTranslation bilingual={{l1: "command", l2: "comannd"}}/>
              {': '}
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" {...register("command")}/>
            </Col>

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
