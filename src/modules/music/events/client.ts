import { AnyChannel, TextChannel, VoiceState } from "discord.js";
import { client } from "../../../golden";
import { music } from "../api";
import * as readline from "readline";

client.once("botReady", () => {
    if (client.user == null)
        return;

    music.start(client.user.id);
})

//Important
client.on("raw", (packet) => {
    music.handleVoiceUpdate(packet);
    // let rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    // rl.question('Is this example useful? [y/n] ', (answer) => {
    //     switch (answer.toLowerCase()) {
    //         case 'y':
    //             console.log('Super!');
    //             break;
    //         case 'n':
    //             console.log('Sorry! :(');
    //             break;
    //         default:
    //             console.log('Invalid answer!');
    //     }
    //     rl.close();
    // });


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