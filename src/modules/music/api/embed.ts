import { createMusicImage, music, musicGuilds } from ".";
import { client } from "../../../golden";
import { createCanvas, loadImage } from "canvas";
import { Player } from 'vulkava';
import { BetterQueue, BetterTrack } from './structures';
import { musicGuild } from './../database/entities/guild';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Guild, TextChannel } from 'discord.js';

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

export async function setMusicEmbed(guildID: string) {
    const player = await music.players.get(guildID)

    if (player == undefined)
        setDefaultMusicEmbed(guildID)
    else
        updateMusicEmbed(player)
}


export async function createMusicChannel(guild: Guild) {
    const channel = await guild.channels.create({
        name: 'song-requests',
        type: ChannelType.GuildText,
        reason: "Create song-requests channel",
        topic: ":white_check_mark: send a URL or a search term to add a song to the queue",
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                allow: [
                    "ViewChannel",
                    "SendMessages",
                    "UseExternalEmojis"
                ]
            }
        ]
    })

    const message = await channel.send({
        content: 'Loading ...'
    })

    await musicGuild.createQueryBuilder()
        .insert()
        .values({
            guildId: guild.id,
            guildName: guild.name,
            channelId: channel.id,
            messageId: message.id
        })
        .orUpdate(["guildID", "guildName", "channelId", "messageId"])
        .execute();

    musicGuilds.set(guild.id, {
        channelId: channel.id,
        messageId: message.id
    });

    setMusicEmbed(guild.id)

    return channel;
}



export async function setDefaultMusicEmbed(guildId: string) {
    const guildData = musicGuilds.get(guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as TextChannel | undefined;
    if (channel == null) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null) return await channel.send("CHANNEL_IS_BROKEN");

    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    await loadImage("./src/modules/music/assets/Music_Default.png").then(img => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    })

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "music_default.png", description: "The default music image" });
    const actions = new ActionRowBuilder({
        components: [
            new ButtonBuilder({
                customId: "music_stop",
                style: ButtonStyle.Secondary,
                emoji: "⏹",
                disabled: true
            }),
            new ButtonBuilder({
                customId: "music_playpause",
                emoji: "⏯",
                style: ButtonStyle.Secondary,
                disabled: true
            }),
            new ButtonBuilder({
                customId: "music_shuffle",
                emoji: "🔀",
                style: ButtonStyle.Secondary,
                disabled: true
            }),
            new ButtonBuilder({
                customId: "music_skip",
                emoji: "⏭",
                style: ButtonStyle.Secondary,
                disabled: true
            }),
            new ButtonBuilder({
                url: 'https://arcin.solutions',
                emoji: "🔗",
                style: ButtonStyle.Link,
                disabled: true
            })
        ]
    })


    message.edit({
        content: " ",
        files: [attachment],
        embeds: [
            new EmbedBuilder({
                title: ':musical_note: | Join a Voice Channel and add a Song or a Playlist',
                footer: { text: `${new Date()}` },
                image: { url: 'attachment://music_default.png' },
            })
        ],
        components: [actions]
    })
}


export async function updateMusicEmbed(player: Player) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as TextChannel | undefined;
    if (channel == null) return;

    if (!player.current) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null) return await channel.send("CHANNEL_IS_BROKEN");

    const queue = await player.queue as BetterQueue;

    const attachment = await new AttachmentBuilder(await createMusicImage(player.current as BetterTrack), { name: "music.png", description: "The music image" });
    const actions = new ActionRowBuilder({
        components: [
            new ButtonBuilder({
                customId: "music_stop",
                style: ButtonStyle.Secondary,
                emoji: "⏹"
            }),
            new ButtonBuilder({
                customId: "music_playpause",
                emoji: "⏯",
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: "music_shuffle",
                emoji: "🔀",
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                customId: "music_skip",
                emoji: "⏭",
                style: ButtonStyle.Secondary
            }),
            new ButtonBuilder({
                url: player.current.uri,
                emoji: "🔗",
                style: ButtonStyle.Link
            })
        ]
    })

    message.edit({
        content: queue.getAllSongDetails() == '' ? '**__Queue:__**\nJoin a Voice Channel and add a Song or a Playlist' : `**__Queue:__**\n${queue.getAllSongDetails()}`,
        files: [attachment],
        embeds: [
            new EmbedBuilder({
                title: ':musical_note: Now Playing:',
                image: { url: 'attachment://music.png' },
            })
        ],
        components: [
            actions
        ]
    })
}