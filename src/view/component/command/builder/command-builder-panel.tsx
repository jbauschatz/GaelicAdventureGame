import { useMemo, useState } from "react";
import { getCommandPreviews } from "../../../../command/parser/command-parser";
import { GameState } from "../../../../model/game/game-state";
import { CommandWordButton } from "./command-word-button";
import { CommandPreviewText } from "./command-preview-text";
import { Button, Navbar, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { CommandPreview } from "../../../../command/parser/command-preview";
import './CommandBuilder.css';
import { CommandInputs } from "../../../../command/command-inputs";

export type CommandEntryMode = 'l2' | 'combined';

/**
 * Returns the command builder Component and a hook to get the next GameCommand asychronously
 */
export const useCommandBuilderPanel = (gameState: GameState): [
    () => JSX.Element,
    () => Promise<CommandInputs>
] => {
    let [commandMode, setCommandMode] = useState('l2' as CommandEntryMode);
    let [availableCommandPreviews, setAvailableCommandPreviews] = useState<Array<CommandPreview>>([]);
    let [selectedPreview, setSelectedPreview] = useState<CommandPreview | undefined>(undefined);
    const [resolver, setResolver] = useState({ resolve: null as ((value: CommandInputs | PromiseLike<CommandInputs>) => void) | null});

    let initialCommandPreviews = useMemo(
        () => {
            let previews = getCommandPreviews(gameState);
            setAvailableCommandPreviews(previews);

            return previews;
        },
        [gameState]
    );

    let onSelectCommandPreview = (commandBuilder: CommandPreview) => {
        setSelectedPreview(commandBuilder);
        setAvailableCommandPreviews(commandBuilder.followUpPreviews);
    }

    let clearSelection = () => {
        setSelectedPreview(undefined);
        setAvailableCommandPreviews(initialCommandPreviews);
    }

    let acceptCommand = () => {
        let selection = selectedPreview!;
        console.log("User input: '" + selection.l2PreviewText + "' command: ", selection.command);
        setSelectedPreview(undefined);
        setAvailableCommandPreviews(initialCommandPreviews);

        // Execute the command as though it was input in L2
        resolver.resolve!({
            gameCommand: selection.command!,
            rawInput: selection.l2PreviewText
        })
    }

    /**
     * Asynchronously gets the next GameCommand input through the component
     */
    const getCommand:() => Promise<CommandInputs> = async () => {
        let promise = new Promise<CommandInputs>(
            (resolve, reject) => {
                setResolver({resolve});
            }
        );

        return promise;
    }

    const CommandBuilderPanel = () => <>
        <div id="command-preview-area">
            <div>
                <CommandPreviewText commandBuilder={selectedPreview} commandEntryMode={commandMode}/>
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
                                onClick={() => acceptCommand()}>
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
                        commandEntryMode={commandMode}
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
                    id="radio-combined"
                    variant='secondary'
                    value="combined"
                    onChange={() => setCommandMode('combined')}
                >
                    GD / EN
                </ToggleButton>
            </ToggleButtonGroup>
        </Navbar>
    </>

    return [CommandBuilderPanel, getCommand];
}