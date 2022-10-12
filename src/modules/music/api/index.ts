import { NodeState, Player, Vulkava } from 'vulkava'
import { NodeOptions, OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../bertram.js';
import * as discordJs from 'discord.js';
import { musicGuild } from '../database/entities/guild.js';
import { createCanvas, loadImage } from 'canvas'
import formatDuration from 'format-duration'
import { BetterQueue, BetterTrack } from './structures.js';
import { setMusicEmbed } from './embed.js';
import { core } from './../../../core/index.js';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { config } from './../../../core/config/index.js';

// !IMPORTANT!
export let musicGuilds: Map<string, { channelId: string, messageId: string }> = new Map();

export const getMusicStuffFromDB = async () => {
    const data = await core.database.get.getTreeRepository(musicGuild).find();

    data.map(guild => {
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

const nodes: NodeOptions[] = getNodesFromConfig();

export const music = new Vulkava({
    nodes: nodes,
    sendWS: (guildId: string, payload: OutgoingDiscordPayload) => {
        client.guilds.cache.get(guildId)?.shard.send(payload);
        // With eris
        // client.guilds.get(guildId)?.shard.sendWS(payload.op, payload.d);
    }
})

function getNodesFromConfig() {
    const nodeAmount = config.get('nodes') as number;
    const nodes: NodeOptions[] = [];

    for (let index = 1; index <= nodeAmount; index++) {
        const node = config.get(`node:${index}`) as { id: string; hostname: string; port: number; password: string; region: string; secure: boolean };
        // console.log(node);
        nodes.push({
            id: node.id,
            hostname: node.hostname,
            port: Number(node.port),
            password: node.password,
            region: node.region as "EU" | "USA" | undefined,
            secure: Boolean(node.secure)
        });
    }

    if (nodes.length == 0) {
        nodes.push({
            id: 'temp',
            hostname: 'localhost',
            port: 2333,
            password: 'password',
        });
    }
    return nodes;
}

export async function createMusicPlayer(interaction: discordJs.CommandInteraction) {
    const player = music.createPlayer({
        guildId: interaction.guild!.id,
        voiceChannelId: (interaction.member as discordJs.GuildMember)?.voice.channel!.id,
        textChannelId: interaction.channel!.id,
        selfDeaf: true,
        queue: new BetterQueue()
    })

    music.emit("playerCreated", player)

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
            player = music.createPlayer({
                guildId: message.guild!.id,
                textChannelId: message.channel.id,
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

    await addSongToPlayer(message.content, message.author, player, message.channel as discordJs.TextChannel);

    if (!player.playing) player.play();
}

export async function addSongToPlayer(searchTerm: string, author: discordJs.User, player: Player, channel?: discordJs.TextChannel) {
    // Search for Music
    const res = await music.search(searchTerm, "youtubemusic");

    if (typeof channel === 'undefined')
        channel = await client.channels.cache.get(player.textChannelId!) as discordJs.TextChannel | undefined;

    if (typeof channel === 'undefined')
        return;

    switch (res.loadType) {
        case "LOAD_FAILED":
            return channel.send({
                embeds: [new discordJs.EmbedBuilder({
                    description: `:x: Load failed!\nError: ${res.exception?.message}`
                })]
            })
        case "NO_MATCHES":
            return channel.send({
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
        await channel.send({
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
            track.setRequester(author);
            (player.queue as BetterQueue)?.add(track);
            music.emit("songAdded", player, track);
        }

        channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Playlist loaded!\n${res.tracks.length} tracks added to the queue.`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
    } else {
        const track = res.tracks[0];
        track.setRequester(author);

        (player.queue as BetterQueue)?.add(track);
        channel.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Track added to the queue!`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
        music.emit("songAdded", player, track);
    }
}

export async function updateQueueEmbed(player: Player) {
    const queue = player.queue as BetterQueue;
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
        let width = ((image.width / 100) * (canvas.width / 25));
        const height = ((image.height / 100) * (canvas.height / 25))

        if ((width / height) != ratio)
            width = (height * ratio)

        ctx.drawImage(image, 25, 25, canvas.width - 50, canvas.height - 50);

        loadImage("./src/modules/music/assets/Music.png").then(img => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        })
    })

    const a = [track.author, ' - ', ' (Official Music Video)', ' (Official Video)'];

    ctx.font = '90px OutfitBold';
    ctx.fillStyle = '#ffffff';

    let formattedTitle = track.title.includes(track.author) ? track.title.replace(new RegExp(a.map(function (x) {
        return x.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }).join('|'), 'g'), "") : track.title;

    if (formattedTitle.length >= 45)
        formattedTitle = formattedTitle.slice(0, 45 - 1) + "…"  

    ctx.fillText(
        (formattedTitle)
        , 100, 200, (canvas.width - 150)
    );

    let formattedAuthor = track.author;
    if (formattedAuthor.length >= 45)
        formattedAuthor = formattedAuthor.slice(0, 45 - 1) + "…"  

    ctx.fillText(formattedAuthor, 100, 400, (canvas.width - 50));
    ctx.fillText(formatDuration(track.duration, { leading: true }), 100, 600, (canvas.width - 50));
    
    let formattedRequester = String(track.requester.username);
    if (track.requester.username.length >= 45)
        formattedRequester = formattedRequester.slice(0, 45 - 1) + "…"  
    
    ctx.fillText(formattedRequester, 100, 800, (canvas.width - 50));

    return canvas.toBuffer();
}

// --- Image Stuff ---