import { NodeState, Player, Track, Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../golden';
import { Message, CommandInteraction, TextChannel, EmbedBuilder, Colors, GuildMember } from 'discord.js';
import { musicGuild } from '../database/entities/guild';
import { CoreDatabase } from './../../core/database/index';
import { createCanvas, loadImage } from 'canvas'
import formatDuration from 'format-duration'
import Jimp from 'jimp'
import { BetterQueue, BetterTrack } from './structures';
import { setMusicEmbed } from './embed';

export let musicGuilds: Map<string, { channelId: string, messageId: string }> = new Map();

// +++ Vulkava Stuff +++
export const music = new Vulkava({
    nodes: [
        {
            id: 'arcin1',
            hostname: 'arcin.solutions',
            port: 2334,
            password: 'eriCmEqBitDZv3rnH3Wr'
        }
    ],
    sendWS: (guildId: string, payload: OutgoingDiscordPayload) => {
        client.guilds.cache.get(guildId)?.shard.send(payload);
        // With eris
        // client.guilds.get(guildId)?.shard.sendWS(payload.op, payload.d);
    }
})
// --- Vulkava Stuff ---

export async function createMusicPlayer(interaction: CommandInteraction) {
    const player = music.createPlayer({
        guildId: interaction.guild!.id,
        voiceChannelId: (interaction.member as GuildMember)?.voice.channel!.id,
        textChannelId: interaction.channel!.id,
        selfDeaf: true,
        queue: new BetterQueue()
    })

    music.emit("playerCreate", player);

    return player;
}


export async function getMusicStuffFromDB() {
    const data = await CoreDatabase.getRepository(musicGuild).createQueryBuilder("guild").getMany()

    await data.map(guild => {
        musicGuilds.set(guild.guildId
            , {
                channelId: guild.channelId,
                messageId: guild.messageId
            }
        );
    });

    data.forEach(guild => {
        setMusicEmbed(guild.guildId)
    })
}


export async function play(message: Message) {
    await message.delete().catch(() => { });

    if (!message.member!.voice.channel)
        return await message.channel.send({
            embeds: [
                new EmbedBuilder({
                    description: ":x: please join a voice channel first",
                    color: Colors.DarkRed
                })
            ]
        })

    let player
    try {
        player = music.players.get(message.guild!.id);
        if (!player)
            player = music.createPlayer({
                guildId: message.guild!.id,
                voiceChannelId: message.member!.voice.channel.id,
                selfDeaf: true,
                queue: new BetterQueue()
            })
    } catch (error) {
        return await message.channel.send({
            embeds: [
                new EmbedBuilder({
                    description: ":x: there is currently no node available, please try again later",
                    color: Colors.DarkRed
                })
            ]
        })
    }

    console.log(message.content);


    // Search for Music
    const res = await music.search(message.content, "youtubemusic");

    switch (res.loadType) {
        case "LOAD_FAILED":
            return message.channel.send({
                embeds: [new EmbedBuilder({
                    description: `:x: Load failed!\nError: ${res.exception?.message}`
                })]
            })
        case "NO_MATCHES":
            return message.channel.send({
                embeds: [
                    new EmbedBuilder({
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
                new EmbedBuilder({
                    description: ":x: the node is currently offline, please try again later",
                    color: Colors.DarkRed
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
                new EmbedBuilder({
                    description: `:white_check_mark: Playlist loaded!\n${res.tracks.length} tracks added to the queue.`
                })
            ]
        });
    } else {
        const track = res.tracks[0];
        track.setRequester(message.author);

        (player.queue as BetterQueue)?.add(track);
        message.channel.send({
            embeds: [
                new EmbedBuilder({
                    description: `:white_check_mark: Track added to the queue!`
                })
            ]
        });
        music.emit("songAdded", player, track);
    }

    if (!player.playing) player.play();
}

export async function addSongToQueue(player: Player, track: Track) {
    const queue = await player.queue as BetterQueue;
    if (queue.size <= 0)
        return;

    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as TextChannel | undefined;
    if (channel == null) return;

    if (!player.current) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null || message.embeds[0] == undefined) return await channel.send("CHANNEL_IS_BROKEN");

    message.edit({
        content: queue.getAllSongDetails() == '' ? '**__Queue:__**\nSend a URL or a search term to add a song to the queue.' : `**__Queue:__**\n${queue.getAllSongDetails()}`,
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

    const thumbnail = await Jimp.read(track.thumbnail!).then(image => {
        image.resize(canvas.width, canvas.height).resize(Jimp.AUTO, canvas.height);
        image.blur(8).background(0xFFFFFF).brightness(-0.6);
        return image;
    })

    await loadImage((await thumbnail.getBufferAsync(Jimp.MIME_PNG))).then(image => {
        const ratio = image.width / image.height
        var width = ((image.width / 100) * (canvas.width / 25))
        const height = ((image.height / 100) * (canvas.height / 25))

        if ((width / height) != ratio)
            width = (height * ratio)

        // ctx.drawImage(image, (canvas.width / 2 - width / 2), (canvas.height - height), width, height);
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