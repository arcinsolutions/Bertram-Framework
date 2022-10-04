import { Node, Player, Track } from 'vulkava';
import { setDefaultMusicEmbed, updateMusicEmbed } from '../api/embed.js';
import { music, updateQueueEmbed } from './../api/index.js';

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
    return updateMusicEmbed(player);
});

// +++ TrackEnd +++
// music.on('trackEnd', (player: Player, track: Track, reason: string) => {
//     return updateMusicEmbed(player);
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
    player.destroy();
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