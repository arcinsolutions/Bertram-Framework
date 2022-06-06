import { VoiceState } from "discord.js";
import { client } from "../../../golden";
import { music } from "../api";

client.once("botReady", () => {
    if (client.user == null)
        return;

    music.start(client.user.id);
})

client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
    if (newState.member?.user.bot) {
        // User moved bot to another channel
        const player = await music.players.get(newState.guild.id);

        if (player == undefined || newState.channel == undefined)
            return;
        if (newState.channel.id != player.voiceChannelId)
            return;

    } else if (oldState.channel?.id != null && newState.channel?.id == null) {
        // User joined
        const player = await music.players.get(oldState.guild.id);

        if (player === undefined || newState.channel == null)
            return;
        if (newState.channel.id != player.voiceChannelId)
            return;

    } else if (oldState.channel?.id != null && newState.channel?.id === null) {
        // User left or kicked
        const player = await music.players.get(oldState.guild.id);

        if (player === undefined)
            return;
        if (oldState.channel.id != player.voiceChannelId)
            return;

    } else if (oldState.channel?.id != null && newState.channel?.id != null) {
        // User moved in or out
        const player = await music.players.get(newState.guild.id);

        if (player === undefined)
            return;
        if (oldState.channel.id != player.voiceChannelId && newState.channel.id != player.voiceChannelId)
            return;

    }
})