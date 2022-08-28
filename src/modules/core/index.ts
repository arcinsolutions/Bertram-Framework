import { database } from "./database"
import { help } from "./help";

export const core = {
    init: async () => {
        help.init();
        await database.init();
    },
    database: database
}