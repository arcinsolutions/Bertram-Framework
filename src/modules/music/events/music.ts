import { Node, Player, Track } from 'vulkava';
import { client } from '../../../golden';
import { music } from './../api/index';

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
music.on('trackStart', (player: Player, track: Track) => {
    if (player.textChannelId == (undefined || null))
        return

    //Update Player

    console.log(`[Music] - Now playing ${track.title}, ${track.source}`);

});

music.on('trackEnd', (player: Player, track: Track, reason: string) => {
    console.log(`[Music] - Track ended ${track.title}, ${track.source}`);

    //Update Player
})

music.on('trackStuck', (player: Player, track: Track, stuckMs: number) => {
    console.log(`[Music] - Warning | a Song is Stuck on Guild ${player.guildId}, Song ${track.title}, URL ${track.source} , Stuck at ${stuckMs}`);

})

music.on('queueEnd', (player: Player) => {
    if (player.textChannelId == (undefined || null))
        return

    //Update Player

    player.destroy();
})
// --- Track / Queue ---

// +++ Error / Warnings etc. +++
music.on("raw", (node: Node, payload: unknown) => {
    console.log(`[Music] - Something happend at Node ${node.identifier}: ${payload}`);

})

music.on("error", (node: Node, err: Error) => {
    console.error(`[Music] - Error on node ${node.identifier}`, err.message);
})

music.on('warn', (node: Node, msg: string) => {
    console.warn(`[Music] - Warning on Node ${node.identifier}, Warning: `, msg)
})
// +++ Other +++