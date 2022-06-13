import { AnyChannel, TextChannel, VoiceState } from "discord.js";
import { client } from "../../../golden";
import { addOrCheckConfigKey } from "../../core/api";
import { music } from "../api";

client.once("botReady", async () => {
    if (client.user == null)
        return;

    music.start(client.user.id);

    await addOrCheckConfigKey("Key1", { type: 'number' })
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