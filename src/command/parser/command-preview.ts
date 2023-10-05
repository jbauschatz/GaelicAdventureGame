import { GameCommand } from "../game-command";

/**
* Represents a preview of a {@link GameCommand} that the user could try to execute
* 
* This includes complete commands like "go north" and "fight skeleton",
* but also incomplete ones like "go _____" and "fight _____".
*/
export type CommandPreview = {
   /**
    * Text that can be displayed to the user to select or build this preview
    */
   prompt: string,

   /**
    * The full text to display representing the {@link GameCommand} being previewed
    * 
    * This may include blanks if the {@link GameCommand} is still incomplte, for example "go _____"
    */
   previewText: string,

   /**
    * If the preview is not enabled it means that no valid {@link GameCommand} could be executed based on this preview
    */
   enabled: boolean,

   /**
    * If the  {@link GameCommand} being previewed is complete, meaning it can be run as-is.
    * 
    * If this is true {@link command} must be defined.
    */
   isComplete: boolean,

   /**
    * The {@link GameCommand} being previewed
    */
   command: GameCommand | undefined,

   /**
    * More {@link CommandPreview}s which result from adding on this one, for example by filling in the blank with
    * another command word
    */
   followUpPreviews: Array<CommandPreview>,
}