import { createMusicImage, music, musicGuilds } from ".";
import { client } from "../../../bertram";
import { createCanvas, loadImage } from "canvas";
import { Player } from 'vulkava';
import { BetterQueue, BetterTrack } from './structures';
import { musicGuild } from './../database/entities/guild';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Guild, MessageActionRowComponentBuilder, TextChannel } from 'discord.js';
import Jimp from 'jimp'
import { music_Buttons } from "./buttons";

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
        .into(musicGuild)
        .values({
            guildId: guild.id,
            guildName: guild.name,
            channelId: channel.id,
            messageId: message.id,
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

    const thumbnail = await Jimp.read("https://source.unsplash.com/random/?wallpapers").then(image => {
        image.resize(canvas.width, canvas.height).resize(Jimp.AUTO, canvas.height);
        image.blur(8).background(0xFFFFFF).brightness(-0.6);
        return image;
    })

    await loadImage(await thumbnail.getBufferAsync(Jimp.MIME_PNG)).then(img => {
        ctx.drawImage(img, 25, 25, canvas.width - 50, canvas.height - 50);

        loadImage("./src/modules/music/assets/Music_Default.png").then(img => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        })
    })

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "music_default.png", description: "The default music image" });

    message.edit({
        content: " ",
        files: [attachment],
        embeds: [
            new EmbedBuilder({
                title: ':musical_note: | Join a Voice Channel and add a Song or a Playlist',
                image: { url: 'attachment://music_default.png' },
            })
        ],
        components: [music_Buttons(true, "https://arcin.solutions")]
    })
}


export async function updateMusicEmbed(player: Player) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as TextChannel | undefined;
    if (channel == null) return;

    if (player.current === null) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null) return await channel.send("CHANNEL_IS_BROKEN");

    const queue = await player.queue as BetterQueue;
    const current = await player.current as BetterTrack;

    const attachment = await new AttachmentBuilder(await createMusicImage(current), { name: "music.png", description: "The music image" });

    const formattedQueue = queue.generateFormattedQueue();

    message.edit({
        content: (formattedQueue == '' ?
            '**__Queue:__**\nJoin a Voice Channel and add a Song or a Playlist' : formattedQueue),
        files: [attachment],
        embeds: [
            new EmbedBuilder({
                description: '**:musical_note: Now Playing:**',
                image: { url: 'attachment://music.png' },
            })
        ],
        components: [music_Buttons(false, await current.uri)]
    })
}