import { Client } from 'discordx';
import { Node, Player, Track } from 'vulkava';
import { setDefaultMusicEmbed, updateMusicEmbed, updateMusicEmbedButtons, updateQueueEmbed } from '../api/embed.js';
import { addSongToPlayer, music } from './../api/index.js';
import { core } from './../../../core/index.js';
import { BetterTrack } from './../api/structures.js';
import * as discordJs from 'discord.js';

// +++ Node +++
music.on('nodeConnect', (node: Node) => {
    console.log(`[Music] - Node ${node.identifier} connected!`);
})

music.on('nodeDisconnect', (node: Node, code: number, reason: string) => {
    console.log(`[Music] - Node ${node.identifier} disconnected: Code ${code}, Reason ${reason}`)
})

music.on('nodeResume', (node: Node) => {
    console.log(`[Music] - Node ${node.identifier} reconnected!`)
})
// --- Node ---

// +++ Track / Queue +++

// +++ TrackStart +++
music.on('trackStart', (player: Player) => {
    return updateMusicEmbed(player);
});
// --- TrackStart ---

// +++ TrackPaused +++
music.addListener('songPause', (player: Player) => {
    return updateMusicEmbedButtons(player);
});

// +++ TrackEnd +++
// music.on('trackEnd', async (player: Player, track: Track) => {
//     const currTrack = track as BetterTrack; 
//     if (currTrack.autoplay) {
//         //get channel from player
//         // const channel = await core.client.channels.fetch(player.textChannelId!);
//         // console.log(channel?.id);

//         await addSongToPlayer(`https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`, core.client.user!, player);
//         return updateMusicEmbed(player);
//     }

//     // return updateMusicEmbed(player);
//     //Update Player
// })
// --- TrackEnd ---


// +++ TrackStuck +++
music.on('trackStuck', (player: Player, track: Track, stuckMs: number) => {
    console.log(`[Music] WARNING - a Song is Stuck on Guild ${player.guildId}, Song ${track.title}, URL ${track.source} , Stuck at ${stuckMs}`);
})
// --- TrackStuck ---

// +++ QueueEnd +++
music.on('queueEnd', async (player: Player) => {
    if (player === undefined) return;
    await setDefaultMusicEmbed(player.guildId);

    const channel = await core.client.channels.cache.get(player.textChannelId!) as discordJs.TextChannel | undefined;
    if (channel === undefined) return player.destroy();

    const tmpMsg = await channel!.send({
        embeds: [new discordJs.EmbedBuilder({
            description: ":yellow_circle: **last Song skipped!**\nPlayer will get destroyed in **__10 Seconds__** if you dont request a Song!",
            color: discordJs.Colors.DarkOrange
        })]
    })
    await setTimeout(async () => {
        if (player === undefined) return;

        if (player?.current != null || player?.queue.size! > 0) {
            return tmpMsg.deletable ? tmpMsg.delete().catch(() => {}) : null;
        }
        else {
            music.emit("stop", player);
            channel!.send({
                embeds: [new discordJs.EmbedBuilder({
                    description: ":white_check_mark: Player Stopped and Destroyed!",
                    color: discordJs.Colors.DarkGreen
                })]
            })
        }
    }, 10000);
})
// --- QueueEnd ---

// ----- Track / Queue -----

// +++ Error / Warnings etc. +++

// Currently useless
/*music.on("raw", (node: Node) => {
    console.log(`[Music] - Something happend at Node ${node.identifier}`);
})*/

music.on("error", (node: Node, err: Error) => {
    console.error(`[Music] ERROR - on node ${node.identifier}`, err.message);
})

music.on('warn', (node: Node, msg: string) => {
    console.warn(`[Music] WARNING - on Node ${node.identifier}, Warning: `, msg)
})


// +++ Other / Custom Events +++

music.addListener("stop", (player: Player) => {
    if (player === undefined) return;
    player.destroy();
    return setDefaultMusicEmbed(player.guildId);
})

// --- Other / Custom Events ---