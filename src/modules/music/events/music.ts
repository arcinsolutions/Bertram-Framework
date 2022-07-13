import { Node, Player, Track } from 'vulkava';
import { addSongToQueue, music, setDefaultMusicEmbed, updateMusicEmbed } from './../api/index';

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
music.on('trackStart', (player: Player, track: Track) => {
    return updateMusicEmbed(player);
});
// --- TrackStart ---



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
    return await setDefaultMusicEmbed(player);
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

music.addListener("songAdded", (player: Player, track: Track) => {
    return addSongToQueue(player, track);
})

music.addListener("stop", (player: Player) => {
    player.destroy();
    return setDefaultMusicEmbed(player);
})

// --- Other / Custom Events ---