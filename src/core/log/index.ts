import { BertramColors } from "./colors";

export const log = {
    info: (message: string) => {
        console.log(`${BertramColors.fg.green}[Core]${BertramColors.reset} - ${message}`);
    }
}