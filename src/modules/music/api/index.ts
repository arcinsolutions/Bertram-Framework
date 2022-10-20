import { NodeState, Player, Vulkava } from 'vulkava'
import { NodeOptions, OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../bertram.js';
import * as discordJs from 'discord.js';
import { musicGuild } from '../database/entities/guild.js';
import { createCanvas, loadImage } from 'canvas'
import formatDuration from 'format-duration'
import { BetterQueue, BetterTrack } from './structures.js';
import { setMusicEmbed, updateMusicEmbedButtons, updateMusicEmbedFooter, updateQueueEmbed } from './embed.js';
import { core } from './../../../core/index.js';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { config } from './../../../core/config/index.js';
import { musicMember } from '../database/entities/member.js';
import { Member } from 'src/core/database/entities/member.js';

// !IMPORTANT!
export let musicGuilds: Map<string, { channelId: string, messageId: string }> = new Map();
export let musicFavorties: Map<string, { tracks: Array<string> }> = new Map();

export const getMusicStuffFromDB = async () => {
    const data = await core.database.get.getTreeRepository(musicGuild).find();
    const favorites = await core.database.get.getTreeRepository(musicMember).find();

    favorites.map(user => {
        musicFavorties.set(user.memberId, {
            tracks: user.favoriteSongs
        })
    })

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
    player.filters.setVolume(35);

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
        if (!player) {
            player = music.createPlayer({
                guildId: message.guild!.id,
                textChannelId: message.channel.id,
                voiceChannelId: message.member!.voice.channel.id,
                selfDeaf: true,
                queue: new BetterQueue()
            })
            player.filters.setVolume(35);
        }
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

    if (!player.playing && player.queue.size !== 0)
        player.play();
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
        }

        await updateQueueEmbed(player);
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
        await updateQueueEmbed(player);
    }
}

export async function addSongsToQueue(tracks: string[], player: Player, requester: string) {
    const res = await music.search(tracks[0], "youtubemusic");

    switch (res.loadType) {
        case "LOAD_FAILED":
            return new discordJs.EmbedBuilder({
                description: `:x: Load failed!\nError: ${res.exception?.message}`
            })
        case "NO_MATCHES":
            return new discordJs.EmbedBuilder({
                description: `:x: No matches!`
            })
        default:
            break;
    }

    if (res.loadType === 'PLAYLIST_LOADED') {
        for (const track of res.tracks) {
            track.setRequester(requester);
            (player.queue as BetterQueue)?.add(track);
        }

        await updateQueueEmbed(player);
        player.textChannel?.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Playlist loaded!\n${res.tracks.length} tracks added to the queue.`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
    } else {
        const track = res.tracks[0];
        track.setRequester(player.queue.current?.requester);

        (player.queue as BetterQueue)?.add(track);
        player.textChannel?.send({
            embeds: [
                new discordJs.EmbedBuilder({
                    description: `:white_check_mark: Track added to the queue!`,
                    color: discordJs.Colors.DarkGreen
                })
            ]
        });
        await updateQueueEmbed(player);
    }
}

// --- Channel Stuff ---

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

// +++ Image Stuff +++
export async function createMusicImage(track: BetterTrack) {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    var thumbnail;
    if (track.thumbnail == null) {
        thumbnail = await sharp("./src/modules/music/assets/Music_Placeholder.png").blur(8).resize(canvas.width, canvas.height).modulate({ brightness: 0.6 }).toBuffer();
    } else {
        const fetchedImg = await fetch(track.thumbnail!).then(res => res.arrayBuffer());
        const Uint8Buff = new Uint8Array(fetchedImg);

        try {
            thumbnail = await sharp(Uint8Buff).blur(8).resize(canvas.width, canvas.height).modulate({ brightness: 0.6 }).toBuffer();
        } catch (e) {
            thumbnail = await sharp("./src/modules/music/assets/Music_Placeholder.png").blur(8).resize(canvas.width, canvas.height).modulate({ brightness: 0.6 }).toBuffer();
        }
    }

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
    ctx.fillText(track.isStream ? "LIVE" : formatDuration(track.duration, { leading: true }), 100, 600, (canvas.width - 50));

    let formattedRequester = String(track.requester.username);
    if (track.requester.username.length >= 45)
        formattedRequester = formattedRequester.slice(0, 45 - 1) + "…"

    ctx.fillText(formattedRequester, 100, 800, (canvas.width - 50));

    return canvas.toBuffer();
}

// --- Image Stuff ---

export async function addFavoriteToMember(id: string, url: string) {
    const member = await core.database.get.getTreeRepository(musicMember).findOneBy({ memberId: id }) as musicMember | null;

    if (member != null && member.favoriteSongs != undefined)
        if (member.favoriteSongs.includes(url))
            return false
        else {
            await core.database.get.createQueryBuilder().update(musicMember).set({ favoriteSongs: [...member!.favoriteSongs, url] }).where("memberId = :id", { id }).execute()
            return true
        }

    await musicMember.createQueryBuilder()
        .insert()
        .into(musicMember)
        .values({
            memberId: id,
            favoriteSongs: [url]
        })
        .orUpdate(["favoriteSongs"])
        .execute();

    return true
}

export async function removeFavoriteFromMember(id: string, url: string) {
    const member = await core.database.get.getTreeRepository(musicMember).findOneBy({ memberId: id }) as musicMember | null;

    if (member != null && member.favoriteSongs != undefined)
        if (member.favoriteSongs.includes(url)) {
            return await core.database.get.createQueryBuilder().update(musicMember).set({ favoriteSongs: member.favoriteSongs.filter(fav => fav !== url) }).where("memberId = :id", { id }).execute().then(() => { return true })
        }

    return false
}

export async function getFavoritesFromMember(id: string) {
    const member = await core.database.get.getTreeRepository(musicMember).findOneBy({ memberId: id }) as musicMember | null;

    if (member != null && member.favoriteSongs != undefined)
        return member.favoriteSongs

    return null
}

type _mode = "none" | "track" | "queue";

export async function musicLoop(guildId: string, mode: _mode) {
    const player = music.players.get(guildId);

    if (!player) {
        return new discordJs.EmbedBuilder({
            title: 'No active Player',
            description: 'please use this Command only if a is currently being played.',
            color: discordJs.Colors.DarkRed
        })
    }

    if (mode == "none") {
        player.setTrackLoop(false);
        player.setQueueLoop(false);
        updateMusicEmbedFooter(player);
        updateMusicEmbedButtons(player);
        return new discordJs.EmbedBuilder({
            title: 'Loop Disabled',
            description: 'Loop has been disabled',
            color: discordJs.Colors.DarkGreen
        })
    }

    if (mode === "track") {
        player.setTrackLoop(true);
        player.setQueueLoop(false);
        updateMusicEmbedFooter(player, { loop: 'Track' });
        updateMusicEmbedButtons(player);
        return new discordJs.EmbedBuilder({
            title: 'Loop Enabled',
            description: 'Loop has been enabled for the current track',
            color: discordJs.Colors.DarkGreen
        })
    }

    if (mode === "queue") {
        player.setTrackLoop(false);
        player.setQueueLoop(true);
        updateMusicEmbedFooter(player, { loop: 'Queue' });
        updateMusicEmbedButtons(player);
        return new discordJs.EmbedBuilder({
            title: 'Loop Enabled',
            description: 'Loop has been enabled for the current queue',
            color: discordJs.Colors.DarkGreen
        })
    }
}