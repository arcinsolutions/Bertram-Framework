import { AnyChannel, MessageEmbed, TextChannel, VoiceState } from "discord.js";
import { client } from "../../../golden";
import { getMusicStuffFromDB, music, musicGuilds, play } from "../api";
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
    if (oldState.client.user?.bot === false)
        return;

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
    // Get the ChannelId from our Database or from the Music Player if it's exits
    const tempX = musicGuilds.get(message.guild!.id);

    if (tempX == null)
        return;

    if (tempX[0] == message.channel.id) {
        if (message.id == tempX[1])
            return;

        if (message.author.username == client.user?.username) {
            setTimeout(() => message.delete().catch(() => { }), 10000);
            return;
        }

        await play(message)
    }

    return;
})
