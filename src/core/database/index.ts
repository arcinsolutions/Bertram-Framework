import { Guild as JSGuild } from "discord.js";
import { DataSource } from "typeorm";
import { goldenConfig } from "../../bertram.js";
import { Guild as DBGuild } from './entities/guild.js';
import { Client } from './../index.js';
import { Member as DBMember } from "./entities/member.js";

let DBsource: DataSource;
let isDBConnected: Boolean = false;

export const database = {
    init: (client: Client) => {
        return initCore(client);
    },
    get get() {
        return DBsource;
    },
    guild: async (ID: string) => await getGuild(ID),
    member: async (ID: string) => await getMember(ID),
    addGuild(guild: JSGuild) {_addGuild(guild)},
    get connected() { return isDBConnected }
}


async function initCore(client: Client) {
    if (!goldenConfig || (goldenConfig.DB_Host || goldenConfig.DB_Port || goldenConfig.DB_Username || goldenConfig.DB_Password || goldenConfig.DB_Database) == (null || "" || undefined))
        throw new TypeError('Fatal: DB Setup unreadable\nDB Setup instructions at https://github.com/arcinsolutions/Bertram');

    DBsource = new DataSource({
        type: 'mysql',
        host: goldenConfig.DB_Host,
        port: Number(goldenConfig.DB_Port),
        username: goldenConfig.DB_Username,
        password: goldenConfig.DB_Password,
        database: goldenConfig.DB_Database,
        synchronize: true,
        logging: false,
        entities: [
            "src/modules/**/database/entities/*.ts",
            DBGuild
        ],
    })

    return await DBsource.initialize().then((connection) => {
        console.log("[Core] - DB Connected.")
        DBsource = connection;
        isDBConnected = connection.isInitialized;
        client.emit("DB_Connected", () => {});
    }).catch((reason: string) => {
        throw new TypeError(`Fatal: DB Connection failed\n${reason}`);
    })
}

// +++ functions +++

/**
 * 
 * @param ID The guild ID
 * @returns returns all Saved data which is stored in the database about the guild
 */
async function getGuild(ID: string) {
    return await (DBsource.getRepository(DBGuild).findOneBy({ guildId: ID }) as Promise<DBGuild>);
}

async function getMember(ID: string) {
    return await (DBsource.getRepository(DBMember).findOneBy({ memberId: ID }) as Promise<DBMember>);
}

async function _addGuild(guild: JSGuild | null) {
    if (guild == null) return;
    if (await getGuild(guild.id) == undefined) {
        const newGuild = new DBGuild();
        newGuild.guildId = guild.id;
        newGuild.guildName = guild.name;
        await DBsource.getRepository(DBGuild).save(newGuild);
    }
}

// --- functions ---