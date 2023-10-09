import { Button } from "react-bootstrap";
import { CommandPreview } from "../../../../command/parser/command-preview";
import { CommandEntryMode } from "./command-builder-panel";

export type CommandWordButtonProperties = {
    builder: CommandPreview,
    onSelect: (builder: CommandPreview) => void,
    commandEntryMode: CommandEntryMode,
}

export function CommandWordButton({builder, onSelect, commandEntryMode}: CommandWordButtonProperties) {
    return <Button
            className="command-word-button"
            disabled={!builder.enabled}
            onClick={() => onSelect(builder)}
    >
        {builder.l2Prompt}
        {commandEntryMode === 'combined' && <>
            <br/>
            ({builder.l1Prompt})
        </>}
    </Button>
}