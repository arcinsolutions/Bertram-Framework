import { TextChannel } from "discord.js";
import { getMusicStuffFromDB, music, musicGuilds, play } from "../api/index.js";
import { registerFont } from 'canvas';
import { core } from "../../../core/index.js";
import { Discord, On, Once } from 'discordx';
import type { ArgsOf } from "discordx";
import { setTimeout } from "timers";
import { IncomingDiscordPayload } from "vulkava/lib/@types/index.js";

@Discord()
class Events {
    @Once({ event: "ready" })
    private async onReady() {
        await getMusicStuffFromDB();
    }

    @On({ event: "voiceStateUpdate" })
    private async onVoiceStateUpdate([newState, oldState]: ArgsOf<'voiceStateUpdate'>) {
        if (typeof newState === 'undefined' || typeof oldState === 'undefined' || typeof newState.client === 'undefined' || typeof oldState.client === 'undefined')
            return;

        if ((newState.channel == null) || (oldState.client.user?.bot === false))
            return;

        const player = music.players.get(oldState.guild.id);
        if (oldState.channel && !newState.channel) {
            if (player) {
                if (player.voiceChannelId !== oldState.channelId)
                    return;
                if (newState.member?.id === core.client.user?.id)
                    return player.destroy();

                let channel = await core.client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;
                if (channel == null || core.client.user == null)
                    return;

                if (oldState.channel.members.size === 1 && oldState.channel.members.find(x => x.id === core.client.user!.id)) {
                    player.pause(true);
                }
            }
        }

        if (!oldState.channel && newState.channel && player) {
            if (player.voiceChannelId !== newState.channelId)
                return;
            player.pause(false);
        }
    }

    @On({ event: "messageCreate" })
    private onMessageCreate([message]: ArgsOf<'messageCreate'>) {
        if ((message.content === '') && (message.author.username !== core.client.user?.username))
            return;

        // Get the ChannelId from our Database or from the Music Player if it exits
        const guildData = musicGuilds.get(message.guild!.id);

        if ((guildData == null) || (guildData.channelId != message.channel.id) || (message.id == guildData.messageId))
            return;

        if (message.author.id === core.client.user!.id) {
            setTimeout(() => message.delete().catch(() => { }), 10000);
            return;
        }

        play(message)
    }
}

// +++ Custom Events +++

// +++ On Start +++
core.client.once("afterLogin", async () => {
    if (core.client.user == null)
        return;

    music.start(core.client.user.id);

    registerFont("./src/modules/music/assets/Outfit-Regular.ttf", { family: "Outfit" });
    registerFont("./src/modules/music/assets/Outfit-Bold.ttf", { family: "OutfitBold" });
})

// --- On Start ---


//Important
core.client.on("raw", (packet: IncomingDiscordPayload) => {
    music.handleVoiceUpdate(packet);
})

// --- Custom Events ---