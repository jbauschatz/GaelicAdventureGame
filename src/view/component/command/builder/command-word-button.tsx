import { Button } from "react-bootstrap";
import { CommandPreview } from "../../../../command/parser/command-preview";

export type CommandWordButtonProperties = {
    builder: CommandPreview,
    onSelect: (builder: CommandPreview) => void,
}

export function CommandWordButton({builder, onSelect}: CommandWordButtonProperties) {
    return <Button 
            className="command-word-button"
            disabled={!builder.enabled}
            onClick={() => onSelect(builder)}
    >
        {builder.prompt}
    </Button>
}