import { Button, Col, Form, Row } from "react-bootstrap";
import { ToggleInlineTranslation } from "../story/toggle-translate";
import { Controller, useForm } from "react-hook-form";
import { Typeahead } from "react-bootstrap-typeahead";
import { useMemo } from "react";
import { getValidCommandInputs } from "../../../command/parser/command-parser";
import { GLOBAL_HELP_PROMPT } from "../../../App";
import { GameState } from "../../../model/game/game-state";
import { ParagraphElement, StoryElement } from "../../../model/bilingual-story/story";

type CommandInputProperties = {
    gameState: GameState,
    onEnterCommand: (commandInput: string) => void;
}

const COMMAND_PROMPT = ParagraphElement.bilingual({
    l1: "command",
    l2: "comannd",
});

export function CommandInput({gameState, onEnterCommand}: CommandInputProperties) {

    const { handleSubmit, control } = useForm();

    let onSubmit = function(data: any) {
        if (data.command) {
            let command: string = data.command[0];
            onEnterCommand(command);
        }
    }

    // Whenever the GameState changes, calculate the valid commands that can be run in that state
    let validInputs = useMemo(
        () => getValidCommandInputs(gameState),
        [gameState]
    ); 

    return <div>
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group as={Row} className="mb-3" controlId="command">
                <Form.Label column sm={2}>
                    <ToggleInlineTranslation bilingual={COMMAND_PROMPT}/>
                    {': '}
                </Form.Label>
                <Col sm={8}>
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
                <Col sm={2}>
                    <Button variant="secondary" type="submit">⏎</Button>
                </Col>
    
                <Form.Text muted>
                    <ToggleInlineTranslation bilingual={GLOBAL_HELP_PROMPT}/>
                </Form.Text>
            </Form.Group>
        </Form>
    </div>
}