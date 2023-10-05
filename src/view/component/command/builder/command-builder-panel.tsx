import { useMemo, useState } from "react";
import { getCommandPreviews } from "../../../../command/parser/command-parser";
import { GameState } from "../../../../model/game/game-state";
import { CommandWordButton } from "./command-word-button";
import { GameCommand } from "../../../../command/game-command";
import { CommandPreviewText } from "./command-preview-text";
import { Button, Navbar, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { CommandPreview } from "../../../../command/parser/command-preview";
import './CommandBuilder.css';

type CommandBuilderProperties = {
    gameState: GameState,
    onEnterCommand: (command: GameCommand, input: string) => void;
}

type CommandEntryMode = 'l1' | 'l2';

export function CommandBuilderPanel({gameState, onEnterCommand}: CommandBuilderProperties) {
    let [commandMode, setCommandMode] = useState('l2' as CommandEntryMode);
    let [availableCommandPreviews, setAvailableCommandPreviews] = useState<Array<CommandPreview>>([]);
    let [selectedPreview, setSelectedPreview] = useState<CommandPreview | undefined>(undefined);

    let initialCommandPreviews = useMemo(
        () => {
            let previewsBothLanguages = getCommandPreviews(gameState);
            let previews = commandMode === 'l1' 
                ? previewsBothLanguages.l1
                : previewsBothLanguages.l2
            setAvailableCommandPreviews(previews);

            return previews;
        },
        [gameState, commandMode]
    );

    let onSelectCommandPreview = (commandBuilder: CommandPreview) => {
        setSelectedPreview(commandBuilder);
        setAvailableCommandPreviews(commandBuilder.followUpPreviews);
    }

    let clearSelection = () => {
        setSelectedPreview(undefined);
        setAvailableCommandPreviews(initialCommandPreviews);
    }

    let executeCommand = () => {
        let selection = selectedPreview!;
        setSelectedPreview(undefined);
        setAvailableCommandPreviews(initialCommandPreviews);
        onEnterCommand(selection.command!, selection.previewText);
    }

    return <>
        <div id="command-preview-area">
            <div>
                <CommandPreviewText commandBuilder={selectedPreview}/>
                {selectedPreview && <>
                    {' '}
                    <Button 
                            className="command-preview-action-button"
                            variant="outline-secondary"
                            onClick={() => clearSelection()}
                    >
                        <FontAwesomeIcon icon={faCircleXmark} />
                    </Button>
                    {selectedPreview.isComplete && 
                        <Button 
                                className="command-preview-action-button"
                                variant="outline-primary" 
                                onClick={() => executeCommand()}>
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </Button>
                    }
                </>}
            </div>
        </div>

        <div id="command-word-area">
            {availableCommandPreviews.map((builder, index) => {
                return <CommandWordButton
                        key={"command-word-" + index}
                        builder={builder} 
                        onSelect={onSelectCommandPreview}
                />
            })}
        </div>

        <Navbar>
            <ToggleButtonGroup type="radio" name="options" defaultValue={commandMode}>
                <ToggleButton
                    id="radio-l2"
                    variant='secondary'
                    value="l2"
                    onChange={() => setCommandMode('l2')}
                >
                    GD
                </ToggleButton>
                <ToggleButton
                    id="radio-l1"
                    variant='secondary'
                    value="l1"
                    onChange={() => setCommandMode('l1')}
                >
                    EN
                </ToggleButton>
            </ToggleButtonGroup>
        </Navbar>
    </>
}