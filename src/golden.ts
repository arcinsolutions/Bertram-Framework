import "reflect-metadata";
import { log } from "console";
import { CacheType, GatewayIntentBits, Interaction } from "discord.js";
import { exit } from "process";
import { config } from "dotenv";
import { dirname, importx, isESM } from "@discordx/importer";
import { Client } from "discordx";

const env = await config({
    path: "./config.env",
    encoding: 'utf8'
});
export const goldenConfig = env.parsed;

//Init Golden Client
export const client = new Client({
    shards: "auto",
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    botGuilds: goldenConfig?.RELEASE ? undefined : [(client) => client.guilds.cache.map((guild) => guild.id)]
});

start();

client.on("ready", async () => {
    // make sure all guilds are in cache
    await client.guilds.fetch();

    if (goldenConfig?.RELEASE == "true") {
        client.initGlobalApplicationCommands({
            log: true
        });
    }
    else
        client.initApplicationCommands();

    // uncomment this line to clear all guild commands,
    // useful when moving to global commands from guild commands
    // await client.clearApplicationCommands(
    //     ...client.guilds.cache.map((g) => g.id)
    // );
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

    client.login(goldenConfig.DISCORD_TOKEN);
}