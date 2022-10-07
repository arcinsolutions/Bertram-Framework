import { Client } from 'discordx';
import { Node, Player, Track } from 'vulkava';
import { setDefaultMusicEmbed, updateMusicEmbed, updateMusicEmbedButtons } from '../api/embed.js';
import { addSongToPlayer, music, updateQueueEmbed } from './../api/index.js';
import { core } from './../../../core/index.js';
import { BetterTrack } from './../api/structures.js';

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
    return await setDefaultMusicEmbed(player.guildId);
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

music.addListener("songAdded", (player: Player) => {
    return updateQueueEmbed(player);
})

music.addListener("stop", (player: Player) => {
    player.destroy();
    return setDefaultMusicEmbed(player.guildId);
})

music.addListener('queueShuffled', (player: Player) => {
    return updateQueueEmbed(player);
})

// --- Other / Custom Events ---