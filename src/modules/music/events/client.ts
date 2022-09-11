import { TextChannel, VoiceState } from "discord.js";
import { client } from "../../../bertram";
import { getMusicStuffFromDB, music, musicGuilds, play } from "../api";
import { registerFont } from 'canvas';
import { core } from "../../../core";

// +++ On Start +++
client.on("afterLogin", async () => {
    if (client.user == null)
        return;

    music.start(client.user.id);

    registerFont("./src/modules/music/assets/Outfit-Regular.ttf", { family: "Outfit" });
    registerFont("./src/modules/music/assets/Outfit-Bold.ttf", { family: "OutfitBold" });
})

core.client.on("ready", async () => await getMusicStuffFromDB());
// --- On Start ---


//Important
client.on("raw", (packet) => {
    music.handleVoiceUpdate(packet);
})

client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
    if (typeof newState === 'undefined')
        return;

    if ((newState.channel == null) || (oldState.client.user?.bot === false))
        return;

    const player = music.players.get(oldState.guild.id);
    if (oldState.channel && !newState.channel) {
        if (player) {
            if (player.voiceChannelId !== oldState.channelId)
                return;
            if (newState.member?.id === client.user?.id)
                return player.destroy();

            let channel = await client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;
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
    const guildData = await musicGuilds.get(message.guild!.id);

    if (guildData == null)
        return;

    if (guildData.channelId == message.channel.id) {
        if (message.id == guildData.messageId)
            return;

        if (message.author.username == client.user?.username) {
            setTimeout(() => message.delete().catch(() => { }), 10000);
            return;
        }

        await play(message)
    }

    return;
})
