import { NodeState, Player, Track, Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../bertram';
import * as discordJs from 'discord.js';
import { musicGuild } from '../database/entities/guild';
import { createCanvas, loadImage } from 'canvas'
import formatDuration from 'format-duration'
import { BetterQueue, BetterTrack } from './structures';
import { setMusicEmbed } from './embed';
import { core } from './../../../core/index';
import sharp from 'sharp';
import fetch from 'node-fetch';

// !IMPORTANT!
export let musicGuilds: Map<string, { channelId: string, messageId: string }> = new Map();

export const getMusicStuffFromDB = async () => {
    const data = await core.database.get.getTreeRepository(musicGuild).find();

    await data.map(guild => {
        musicGuilds.set(guild.guildId, {
            channelId: guild.channelId,
            messageId: guild.messageId
        });
    });

    data.forEach(guild => {
        setMusicEmbed(guild.guildId)
    })

}
// !IMPORTANT!


export const music = new Vulkava({
    nodes: [
        {
            id: 'arcin1',
            hostname: '185.234.72.80',
            port: 2334,
            password: 'eriCmEqBitDZv3rnH3Wr',
            region: 'EU'
        },
        {
            id: 'arcin2',
            hostname: '78.47.184.165',
            port: 2332,
            password: 'tiZDJ7dvZJsDDU2x',
            region: 'EU'
        }
    ],
    sendWS: (guildId: string, payload: OutgoingDiscordPayload) => {
        client.guilds.cache.get(guildId)?.shard.send(payload);
        // With eris
        // client.guilds.get(guildId)?.shard.sendWS(payload.op, payload.d);
    }
})

export async function createMusicPlayer(interaction: discordJs.CommandInteraction) {
    const player = music.createPlayer({
        guildId: interaction.guild!.id,
        voiceChannelId: (interaction.member as discordJs.GuildMember)?.voice.channel!.id,
        textChannelId: interaction.channel!.id,
        selfDeaf: true,
        queue: new BetterQueue()
    })

    await music.emit("playerCreated", player)

    return player;
}

export async function play(message: discordJs.Message) {
    await message.delete().catch(() => { });

    if (!message.member!.voice.channel)
        return await message.channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: ":x: please join a voice channel first",
                    color: discordJs.Colors.DarkRed
                })
            ]
        })

    let player
    try {
        player = music.players.get(message.guild!.id);
        if (!player)
            player = await music.createPlayer({
                guildId: message.guild!.id,
                voiceChannelId: message.member!.voice.channel.id,
                selfDeaf: true,
                queue: new BetterQueue()
            })
    } catch (error) {
        return await message.channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: ":x: there is currently no node available, please try again later",
                    color: discordJs.Colors.DarkRed
                })
            ]
        })
    }

    // Search for Music
    const res = await music.search(message.content, "youtubemusic");

    switch (res.loadType) {
        case "LOAD_FAILED":
            return message.channel.send({
                embeds: [new discordJs.EmbedBuilder({
                    description: `:x: Load failed!\nError: ${res.exception?.message}`
                })]
            })
        case "NO_MATCHES":
            return message.channel.send({
                embeds: [
                    new discordJs.EmbedBuilder({
                        description: `:x: No matches!`
                    })
                ]
            })
        default:
            break;
    }

    //Connect to the Voice Channel
    if (player.node?.state === NodeState.DISCONNECTED) {
        await message.channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: ":x: the node is currently offline, please try again later",
                    color: discordJs.Colors.DarkRed
                })
            ]
        })
        return player.destroy();
    }

    player.connect();

    if (res.loadType === 'PLAYLIST_LOADED') {
        for (const track of res.tracks) {
            track.setRequester(message.author);
            (player.queue as BetterQueue)?.add(track);
            music.emit("songAdded", player, track);
        }

        message.channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Playlist loaded!\n${res.tracks.length} tracks added to the queue.`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
    } else {
        const track = res.tracks[0];
        track.setRequester(message.author);

        (player.queue as BetterQueue)?.add(track);
        message.channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Track added to the queue!`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
        music.emit("songAdded", player, track);
    }

    if (!player.playing) player.play();
}

export async function updateQueueEmbed(player: Player) {
    const queue = await player.queue as BetterQueue;
    if (queue.size <= 0)
        return;

    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as discordJs.TextChannel | undefined;
    if (channel == null) return;

    if (!player.current) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null || message.embeds[0] == undefined) return await channel.send({
        embeds: [new discordJs.EmbedBuilder({
            description: ':x: the channel is broken, please use **/setup** to fix it',
            color: discordJs.Colors.DarkButNotBlack
        })]
    });

    message.edit({
        content: queue.generateFormattedQueue == '' ? '**__Queue:__**\nSend a URL or a search term to add a song to the queue.' : queue.generateFormattedQueue,
        files: [],
        embeds: [message.embeds[0]]
    })
}
// --- Channel Stuff ---

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

// +++ Image Stuff +++
export async function createMusicImage(track: BetterTrack) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    const fetchedImg = await fetch(track.thumbnail!).then(res => res.arrayBuffer());
    const Uint8Buff = new Uint8Array(fetchedImg);

    const thumbnail = await sharp(Uint8Buff).blur(8).resize(canvas.width, canvas.height).modulate({brightness: 0.6}).toBuffer();

    await loadImage(thumbnail).then(image => {
        const ratio = image.width / image.height
        var width = ((image.width / 100) * (canvas.width / 25))
        const height = ((image.height / 100) * (canvas.height / 25))

        if ((width / height) != ratio)
            width = (height * ratio)

        ctx.drawImage(image, 25, 25, canvas.width - 50, canvas.height - 50);

        loadImage("./src/modules/music/assets/Music.png").then(img => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        })
    })

    var a = [track.author, ' - ', ' (Official Music Video)', ' (Official Video)'];

    ctx.font = '90px OutfitBold';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        (track.title.includes(track.author) ? track.title.replace(new RegExp(a.map(function (x) {
            return x.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }).join('|'), 'g'), "") : track.title)
        , 100, 200, (canvas.width - 150)
    );

    ctx.fillText(track.author, 100, 400, (canvas.width - 50));
    ctx.fillText(await formatDuration(track.duration, { leading: true }), 100, 600, (canvas.width - 50));
    ctx.fillText(String(track.requester.username), 100, 800, (canvas.width - 50));

    return canvas.toBuffer();
}

// --- Image Stuff ---