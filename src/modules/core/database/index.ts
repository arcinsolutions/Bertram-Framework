import { log } from 'console';
import { Guild } from "./entities/guild";
import { client, goldenConfig } from '../../../bertram';
import { exit } from "process";
import { DataSource } from 'typeorm';

let DBsource: DataSource;

export const database = {
    init: async () => {
        await initCore();
    },
    getDatabase: () => {
        return DBsource;
    },
    getGuild: async (ID: string) => {
        return await getGuild(ID);
    }
}

async function initCore() {
    if (!goldenConfig || (goldenConfig.DB_Host || goldenConfig.DB_Port || goldenConfig.DB_Username || goldenConfig.DB_Password || goldenConfig.DB_Database) == (null || "" || undefined)) {
        log(
            "Fatal: DB Setup unreadable\nDB Setup instructions at https://github.com/spasten-studio/Golden"
        );
        exit(1);
    }

    DBsource = await new DataSource({
        type: 'mysql',
        host: goldenConfig.DB_Host,
        port: Number(goldenConfig.DB_Port),
        username: goldenConfig.DB_Username,
        password: goldenConfig.DB_Password,
        database: goldenConfig.DB_Database,
        synchronize: true,
        logging: false,
        entities: ["src/modules/**/database/entities/*.ts"],
    })

    await DBsource.initialize().then((connection) => {
        log("[Core] - DB Connected.")
        DBsource = connection;
        client.emit("DB_Connected", () => { });
    }).catch((reason: string) => {
        log(`[Core] -  DB ${reason}`)
    })
}

// +++ functions +++

/**
 * 
 * @param ID The guild ID
 * @returns returns all Saved data which is stored in the database about the guild
 */
async function getGuild(ID: string) {
    return await (DBsource.getRepository(Guild).findOneBy({ guildId: ID }) as Promise<Guild>);
}

// --- functions ---