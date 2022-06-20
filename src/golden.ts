import "reflect-metadata";
import { dirname, importx, isESM } from "@discordx/importer";
import { Koa } from "@discordx/koa";
import { log } from "console";
import { CacheType, Intents, Interaction } from "discord.js";
import { Client } from "discordx";
import { exit } from "process";
import { config, DotenvParseOutput } from "dotenv";
const env = await config({
    path: "./config.env",
    encoding: 'utf8'
});
export const goldenConfig = await env.parsed;

//Init Golden Client
export const client = new Client({
    shards: "auto",
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
    botGuilds: goldenConfig?.RELEASE ? undefined : [(client) => client.guilds.cache.map((guild) => guild.id)]
});

start();

client.on("ready", async () => {
    // make sure all guilds are in cache
    await client.guilds.fetch();

    // init all application commands
    // await client.initApplicationCommands({
    //     guild: { log: true },
    //     global: { log: true,
    //     disable: {
    //         add: true,
    //     } },
    // });

    if (goldenConfig?.RELEASE) {
        return client.initGlobalApplicationCommands({
            log: true
        });
    }
    client.initApplicationCommands();

    // init permissions; enabled log to see changes
    await client.initApplicationPermissions(true);

    // uncomment this line to clear all guild commands,
    // useful when moving to global commands from guild commands
    await client.clearApplicationCommands(
        ...client.guilds.cache.map((g) => g.id)
    );
    log("Golden started");
    client.emit("botReady");
});

client.on("interactionCreate", (interaction: Interaction<CacheType>) => {
    client.executeInteraction(interaction);
});

async function start() {
    if (!goldenConfig || goldenConfig.DISCORD_TOKEN == (null || "")) {
        log(
            "Fatal: config.env file missing or unreadable\nSetup instructions at https://github.com/spasten-studio/Golden"
        );
        exit(1);
    }

    //Import Slash Commands
    const folder = isESM ? dirname(import.meta.url) : __dirname;
    await importx(`${folder}/modules/**/{events,commands,api}/*.{ts,js}`).then(() =>
        console.log("[Core] - All files imported")
    );
    //rest api section
    // api: prepare server
    const server: any = await new Koa();

    // api: need to build the api server first
    await server.build();

    // api: let's start the server now
    const port = process.env.PORT ?? 3000;
    await server.listen(port, () => {
        console.log(`discord api server started on ${port}`);
        console.log(`visit localhost:${port}/guilds`);
    });


    client.login(goldenConfig.DISCORD_TOKEN);
}