import { AnyChannel, MessageEmbed, TextChannel, VoiceState } from "discord.js";
import { client } from "../../../golden";
import { addOrCheckConfigKey } from "../../core/api";
import { getGuild } from "../../core/database";
import { getMusicStuffFromDB, music, musicChannels, play } from "../api";
import { music, musicMessageIds } from './../api/index';
import { DataSource } from 'typeorm';

client.once("botReady", async () => {
    if (client.user == null)
        return;

    music.start(client.user.id);

    // await addOrCheckConfigKey("Key1", "number")
})

client.once("DB_Connected", async (DataSource) => {
    getMusicStuffFromDB();
})

//Important
client.on("raw", (packet) => {
    music.handleVoiceUpdate(packet);
})

client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
    const player = music.players.get(oldState.guild.id);
    if (oldState.channel && !newState.channel) {
        if (player) {
            if (player.voiceChannelId !== oldState.channelId)
                return;
            if (newState.member?.id === client.user?.id)
                return player.destroy();

            let channel: TextChannel | AnyChannel | undefined = await client.channels.cache.get(player.textChannelId!);
            if (channel == null || client.user == null)
                return;

            if (oldState.channel.members.size === 1 && oldState.channel.members.find(x => x.id === client.user!.id)) {
                player.pause(true);
            }
        }
    }

    if (!oldState.channel && newState.channel && player) {
        if (player.voiceChannelId !== newState.channelId)
            return;
        player.pause(false);
    }
})

client.on("messageCreate", async (message) => {
    // remove all bot messages

    if (message.author.bot && musicChannels.includes(message.channel.id) && !musicMessageIds.includes(message.id)) {
        setTimeout(() => message.delete().catch(() => { }), 10000);
        return;
    }

    // Get the ChannelId from our Database or from the Music Player if it's exits
    if (music.players.get(message.guild!.id) == undefined) {
        const tempX = musicChannels.indexOf(message.guild!.id);
        const tempChannelId = await musicChannels[tempX];
        const tempMessageId = await musicMessageIds[tempX];

        if (await tempChannelId === message.channel.id) {
            if (message.id == await tempMessageId) return;


            await play(message, dbGuild)
        }
    }




    if ((!message.member!.voice.channel || !message.member) && musicChannels.includes(message.channel.id)) {
        message.channel.send({
            embeds: [
                new MessageEmbed({
                    description: ":x: please Join a Voice Channel!",
                    color: "DARK_RED"
                })
            ]
        })
        return;
    }

    // Search for Music
    const res = await music.search(message.content);

    switch (res.loadType) {
        case "LOAD_FAILED":
            message.channel.send({
                embeds: [new MessageEmbed({
                    description: `: x: Load failed!\nError: ${res.exception?.message}`,
                    color: "DARK_RED"
                })]
            });
            return;

        case "NO_MATCHES":
            message.channel.send({
                embeds: [new MessageEmbed({
                    description: `:x: No Matches!`,
                    color: "DARK_RED"
                })]
            });
            return;
    }



    if (music.players.get(message.guild!.id) == null) {
        const dbGuild = await getGuild(message.guild!.id)
        if (await dbGuild?.channelId === message.channel.id) {
            if (message.id == await dbGuild?.messageId) return;

            if (message.author.bot) {
                setTimeout(() => message.delete().catch(() => { }), 10000);
                return;
            }

            await play(message, dbGuild)
        }
    }
    else {
        const player = music.players.get(message.guild!.id);

        if (player?.channelID === message.channel.id) {
            if (message.id == player?.messageID) return;

            if (message.author.bot) {
                setTimeout(() => message.delete().catch(() => { }), 10000);
                return;
            }

        }
    }

    return;
})
