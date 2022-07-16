import { createMusicImage, music, musicGuilds } from ".";
import { Guild, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { client } from "../../../golden";
import { createCanvas, loadImage } from "canvas";
import { Player } from 'vulkava';
import { BetterQueue, BetterTrack } from './structures';
import { musicGuild } from './../database/entities/guild';

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
    const channel = await guild.channels.create('song-requests', {
        type: "GUILD_TEXT",
        reason: "Create song-requests channel",
        topic: ":white_check_mark: send a URL or a search term to add a song to the queue",
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                allow: [
                    "VIEW_CHANNEL",
                    "SEND_MESSAGES"
                ],
            },
        ]
    });

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

    const attachment = new MessageAttachment(await canvas.toBuffer(), "music.png");

    message.edit({
        content: " ",
        files: [attachment],
        embeds: [
            new MessageEmbed({
                title: ':musical_note: | Join a Voice Channel and add a Song or a Playlist',
                image: { url: 'attachment://music.png' },
                footer: { text: `${new Date().toUTCString()}` }
            })
        ],
        components: [
            new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: "music_stop",
                        style: "SECONDARY",
                        emoji: "⏹",
                        disabled: true
                    }),
                    new MessageButton({
                        customId: "music_playpause",
                        emoji: "⏯",
                        style: "SECONDARY",
                        disabled: true
                    }),
                    new MessageButton({
                        customId: "music_shuffle",
                        emoji: "🔀",
                        style: "SECONDARY",
                        disabled: true
                    }),
                    new MessageButton({
                        customId: "music_skip",
                        emoji: "⏭",
                        style: "SECONDARY",
                        disabled: true
                    }),
                    new MessageButton({
                        url: 'https://arcin.solutions',
                        emoji: "🔗",
                        style: "LINK",
                        disabled: true
                    })
                ]
            })
        ]
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

    const attachment = await new MessageAttachment(await createMusicImage(player.current as BetterTrack), "music.png");

    message.edit({
        content: queue.getAllSongDetails() == '' ? '**__Queue:__**\nJoin a Voice Channel and add a Song or a Playlist' : `**__Queue:__**\n${queue.getAllSongDetails()}`,
        files: [attachment],
        embeds: [
            new MessageEmbed({
                title: ':musical_note: Now Playing:',
                image: { url: 'attachment://music.png' },
            })
        ],
        components: [
            new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: "music_stop",
                        style: "SECONDARY",
                        emoji: "⏹"
                    }),
                    new MessageButton({
                        customId: "music_playpause",
                        emoji: "⏯",
                        style: "SECONDARY"
                    }),
                    new MessageButton({
                        customId: "music_shuffle",
                        emoji: "🔀",
                        style: "SECONDARY"
                    }),
                    new MessageButton({
                        customId: "music_skip",
                        emoji: "⏭",
                        style: "SECONDARY"
                    }),
                    new MessageButton({
                        url: player.current.uri,
                        emoji: "🔗",
                        style: "LINK"
                    })
                ]
            })
        ]
    })
}