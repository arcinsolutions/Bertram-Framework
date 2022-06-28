import { DataSource, DataSourceOptions, Db } from "typeorm";
import { log } from 'console';
import { Guild } from "./entities/guild";
import { client, goldenConfig } from './../../../golden';
import { exit } from "process";
import { musicGuild } from './../../music/database/entities/guild';

export let CoreDatabase: DataSource;

export async function CoreInit() {
    if (!goldenConfig || (goldenConfig.DB_HOST || goldenConfig.DB_Port || goldenConfig.DB_Username || goldenConfig.DB_Password || goldenConfig.DB_Database) == (null || "" || undefined)) {
        log(
            "Fatal: DB Setup unreadable\nDB Setup instructions at https://github.com/spasten-studio/Golden"
        );
        exit(1);
    }

    CoreDatabase = await new DataSource({
        type: "mysql",
        host: goldenConfig.DB_Host,
        port: Number(goldenConfig.DB_Port),
        username: goldenConfig.DB_Username,
        password: goldenConfig.DB_Password,
        database: goldenConfig.DB_Database,
        synchronize: true,
        logging: false,
        entities: ["src/modules/**/database/entities/*.ts"]
    })

    await CoreDatabase.initialize().then(() => {
        log("[Core] - DB Connected.")
        client.emit("DB_Connected", (CoreDatabase: DataSource) => { });
    }).catch((reason: string) => {
        log(`[Core] -  DB err: ${reason}`)
    })
}

// +++ functions +++

/**
 * 
 * @param ID The guild ID
 * @returns returns all Saved data which is stored in the database about the guild
 */
export async function getGuild(ID: string) {
    return await (CoreDatabase.getRepository(Guild).findOneBy({ guildId: ID }) as Promise<Guild>);
}

// --- functions ---