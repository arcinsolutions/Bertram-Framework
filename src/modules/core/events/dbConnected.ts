import { Client } from "discordx";
import { core } from "..";
import { client } from "../../../bertram";
import { Guild } from "../database/entities/guild";

// TODO - Add Database Stuff

client.once("DB_Connected", async (client: Client) => {
    const db = core.database.getDatabase();


    db.getRepository(Guild).find({}).then(async (guilds) => {
        for (const guild of guilds) {

        }
    })
})