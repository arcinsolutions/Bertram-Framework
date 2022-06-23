import { AnyChannel, TextChannel, VoiceState } from "discord.js";
import { client } from "../../../golden";
import { addOrCheckConfigKey } from "../../core/api";
import { music, getGuild, play } from "../api";

client.once("botReady", async () => {
    if (client.user == null)
        return;

    music.start(client.user.id);

    await addOrCheckConfigKey("Key1", "number")
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

            let channel: TextChannel | AnyChannel | undefined = await client.channels.cache.get(player.textChannelId);
            if (channel == null || client.user == null)
                return;

            if (oldState.channel.members.size === 1 && oldState.channel.members.find(x => x.id === client.user.id)) {
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
    const dbGuild = await getGuild(message.guild!.id)
    if (dbGuild?.channelId === message.channel.id) {
        if (message.id == dbGuild?.embedId) return;

        if (message.author.bot) {
            setTimeout(() => message.delete().catch(() => {}), 10000);
            return;
        }

        await play(message, dbGuild)
    }
        
})
