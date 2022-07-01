import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Node, Player, Track } from 'vulkava';
import { client } from '../../../golden';
import { music, musicGuilds, updateMusicEmbed } from './../api/index';

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
music.on('trackStart', async (player: Player, track: Track) => {
    return updateMusicEmbed(player.guildId, track);

    //Get the Data from our Map
    const tempMusic = musicGuilds.get(player.guildId);

    //Update Player
    let channel = client.channels.cache.get(tempMusic[0]) as TextChannel;

    if (channel === undefined)
        return;

    let embed = new MessageEmbed({
        title: `Now Playing`,
        description: `**[${track.title}](${track.uri})**`,
        color: "DARK_BUT_NOT_BLACK",
        image: {
            url: track.thumbnail?.toString()
        },
        fields: [
            {
                name: `Duration`,
                value: `${track.duration}`,
                inline: true
            },
            {
                name: `Author`,
                value: `${track.author}`,
                inline: true
            },
            {
                name: `Requested By`,
                value: `${track.requester}`,
                inline: true
            }
        ]
    })

    let message = await channel.messages.fetch(tempMusic[1]);

    if (message.embeds === undefined || message.embeds.length < 0)
        return channel.send({
            embeds: [
                new MessageEmbed({
                    title: `Broken channel!`,
                    description: 'Sorry but it seems like the channel is broken. Please create a new one!',
                    color: "DARK_RED"
                })
            ]
        });
    else
        message.edit({
            embeds: [embed]
        })


});
// --- TrackStart ---



// +++ TrackEnd +++
music.on('trackEnd', (player: Player, track: Track, reason: string) => {
    //Update Player
})
// --- TrackEnd ---


// +++ TrackStuck +++
music.on('trackStuck', (player: Player, track: Track, stuckMs: number) => {
    console.log(`[Music] WARNING - a Song is Stuck on Guild ${player.guildId}, Song ${track.title}, URL ${track.source} , Stuck at ${stuckMs}`);

})
// --- TrackStuck ---



// +++ QueueEnd +++
music.on('queueEnd', (player: Player) => {
    //Get the Data from our Map
    const tempMusic = musicGuilds.get(player.guildId);

    //Update Player
    let channel = client.channels.cache.get(tempMusic[0]) as TextChannel;

    if (channel === undefined)
        return;

    let embed = new MessageEmbed({
        title: `:musical_note:  | No song is being played`,
        description: `[Bot Invite](https://golden.invite.spasten.studio) | [Support Server](https://discord.gg/PX28nyVgdP) | [Commands](https://golden.spasten.studio)`,
        color: "DARK_BUT_NOT_BLACK",
    })

    let message = channel.messages.fetch(tempMusic[1]);

    if (message.embeds === undefined || message.embeds.length < 0)
        return channel.send({
            embeds: [
                new MessageEmbed({
                    title: `Broken channel!`,
                    description: 'Sorry but it seems like the channel is broken. Please create a new one!',
                    color: "DARK_RED"
                })
            ]
        });
    else
        message.edit({
            embeds: [embed]
        })

    player.destroy();
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

music.addListener('playerCreate', (player: Player) => {
    console.log(`[Music] - Player ${player.guildId} created!`);
})

// +++ Other +++