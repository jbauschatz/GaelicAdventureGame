import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row } from 'react-bootstrap';
import { ParagraphElement, Story, StoryElement, StoryState } from './model/bilingual-story/story';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { StoryView } from './view/component/story/story-view';
import { newGame } from './generation/game-generator';
import { GAELIC_ENGLISH_NARRATOR, narrateRoom } from './narrator/gaelic-english-narrator';
import { GameCommand } from './command/game-command';
import { executeCommand } from './command/command-executor';
import { GAELIC_HELP_COMMAND } from './command/parser/help-command-parser';
import { useCommandBuilderPanel } from './view/component/command/builder/command-builder-panel';
import { CommandInputs } from './command/command-inputs';
import { ATTACK_NEARBY_ENEMY, CharacterController, MOVE_RANDOMLY, buildCharacterController } from './command/controller/character-controller';

export const GLOBAL_HELP_PROMPT = ParagraphElement.bilingual({
  l1: "Type 'help' for help.", 
  l2: `Clò-sgrìobh '${GAELIC_HELP_COMMAND}' airson cuideachadh.`
});

// Create a new game when the app loads
let initialGameState = newGame();

// Initialize the game's Story including welcome messages and an initial "look" command
let initialStory: Story = [
  StoryElement.paragraph([
    ParagraphElement.bilingual({
      l1: "Welcome to the game.",
      l2: "Fàilte dhan geama."
    }),
    GLOBAL_HELP_PROMPT
  ]),
  ...narrateRoom(initialGameState)
];

/**
 * Default {@link CharacterController} to control Creatures on their turn
 */
let defaultCreatureController = buildCharacterController([
  ATTACK_NEARBY_ENEMY,
  MOVE_RANDOMLY,
]);

function App() {
  let [gameState, setGameState] = useState(initialGameState);
  let [storyState, setStoryState] = useState({story: initialStory} as StoryState);
  let [turnNumber, setTurnNumber] = useState(1);
  let [CommandBuilderPanel, getCommandInput] = useCommandBuilderPanel(gameState);

  /**
   * Gets the next GameCommand for whichever Creature's turn it is
   */
  let receiveNextCommand = async () => {
    if (gameState.characterWithTurn === gameState.player) {
      console.log("waiting for player input...");
      let commandInput: CommandInputs = await getCommandInput();
      onReceivePlayerCommand(commandInput.gameCommand, commandInput.rawInput);
    } else {
      let controllerCommand = defaultCreatureController(gameState.characterWithTurn, gameState);
      onReceiveCommand(controllerCommand);
    }

    setTurnNumber(turnNumber + 1);
  }

  /**
   * Executes a command received via player input from the UI
   * 
   * @param command the GameCommand received from the player
   * @param commandInput direct textual representation of the GameCommand as entered by the player
   */
  let onReceivePlayerCommand = function(command: GameCommand, commandInput: string) {
    // Do not allow any commands if the game is over
    if (gameState.isGameOver === true) {
      return;
    }

    // Execute the command and determine the new state
    let stateTransition = executeCommand(command, gameState);

    // Narrate the change in state
    let eventNarration: Story = stateTransition.events.flatMap(event => 
      GAELIC_ENGLISH_NARRATOR.narrateEvent(
        event,
        gameState,
        stateTransition.gameStateAfter,
      )
    );
    // Combine the previous story, the player's input, and the new story
    setStoryState({
      story: [
          ...storyState.story,
          StoryElement.userInput({input: commandInput}),
          ...eventNarration,
      ]
    });

    setGameState(stateTransition.gameStateAfter);
  }

  /**
   * Execute a GameCommand not received from a player
   */
  let onReceiveCommand = (command: GameCommand) => {
    // Do not allow any commands if the game is over
    if (gameState.isGameOver === true) {
      return;
    }

    // Execute the command and determine the new state
    let stateTransition = executeCommand(command, gameState);

    // Narrate the change in state
    let eventNarration: Story = stateTransition.events.flatMap(event => 
      GAELIC_ENGLISH_NARRATOR.narrateEvent(
        event,
        gameState,
        stateTransition.gameStateAfter,
      )
    );

    // Combine the previous story, and the new story
    setStoryState({
      story: [
          ...storyState.story,
          ...eventNarration,
      ]
    });

    setGameState(stateTransition.gameStateAfter);
  }

  // Iterate the game's core loop - once per turn, execute a single Command
  useEffect(
    () => {
      if (!gameState.isGameOver) {
        console.log("Turn " + turnNumber);
        receiveNextCommand();
      } else {
        console.log("Turn " + turnNumber + " (Game Over)");
      }
    },
    [turnNumber],
  );

  return (
    <div className="console">
      <Container className="vh-100 d-flex flex-column">
        <Row className="h-100 overflow-y-scroll" style={{flexDirection: "column-reverse"}}>
            <StoryView storyState={storyState}/>
        </Row>

        <Row>
          <CommandBuilderPanel/>
        </Row>
      </Container>
    </div>
  );
}

export default App;
