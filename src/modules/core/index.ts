import { database } from "./database"
import { help } from "./help";

export const core = {
    init: async () => {
        await database.init();
        await help.init();
    }
}