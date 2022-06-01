import { DataSource, DataSourceOptions } from "typeorm";
import { log } from 'console';
import { Guild } from "./entities/guild";
import { goldenConfig } from './../../../golden';
import { exit } from "process";

export async function CoreInit() {
    if (!goldenConfig || (goldenConfig.DB_HOST || goldenConfig.DB_Port || goldenConfig.DB_Username || goldenConfig.DB_Password || goldenConfig.DB_Database) == (null || "" || undefined)) {
        log(
            "Fatal: DB Setup unreadable\nDB Setup instructions at https://github.com/spasten-studio/Golden"
        );
        exit(1);
    }

    const DB = await new DataSource({
        type: "mysql",
        host: goldenConfig.DB_Host,
        port: Number(goldenConfig.DB_Port),
        username: goldenConfig.DB_Username,
        password: goldenConfig.DB_Password,
        database: goldenConfig.DB_Database,
        synchronize: true,
        logging: false,
        entities: [Guild],
    })

    await DB.initialize().then(() => {
        log("DB Connected.")
    }).catch((reason: string) => {
        log(`DB err: ${reason}`)
    })

    return DB;
}