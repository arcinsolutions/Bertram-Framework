import { createMusicImage, music, musicGuilds } from "./index.js";
import { client } from "../../../bertram.js";
import { loadImage, createCanvas } from "canvas";
import { Player } from 'vulkava';
import { BetterQueue, BetterTrack } from './structures.js';
import { musicGuild } from './../database/entities/guild.js';
import * as discordJs from 'discord.js';
import { music_Buttons } from "./buttons.js";
import fetch from 'node-fetch';
import sharp from 'sharp';
import { commands } from './../../../core/commands.js';

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

export async function setMusicEmbed(guildID: string) {
    const player = music.players.get(guildID)

    if (player == undefined)
        setDefaultMusicEmbed(guildID)
    else
        updateMusicEmbed(player)
}


export async function createMusicChannel(guild: discordJs.Guild) {
    const channel = await guild.channels.create({
        name: 'song-requests',
        type: discordJs.ChannelType.GuildText,
        reason: "Create song-requests channel for Bertram",
        topic: ":white_check_mark: send a URL or a search term to add a song to the queue",
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                allow: [
                    "ViewChannel",
                    "SendMessages",
                    "EmbedLinks",
                    "UseApplicationCommands",
                    "UseEmbeddedActivities"
                ],
            },
            {
                id: guild.roles.botRoleFor(client.user!)?.id!,
                allow: [
                    "AttachFiles"
                ],
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

    const channel = client.channels.cache.get(guildData.channelId) as discordJs.TextChannel | undefined;
    if (channel == null) return;

    const message: discordJs.Message<true> | null = await getMusicEmbedMessage(channel, guildData);

    if (!checkHasMusicChannelPermissions(channel))
        return channel.send({ embeds: [getBrokenChannelEmbed()] });

    if (message == null)
        return await channel.send({
            embeds: [getBrokenChannelEmbed()]
        });

    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    const ImgBuff = await fetch('https://source.unsplash.com/collection/11649432/1920x1080').then(res => { return res.arrayBuffer() });
    const Uint8Buff = new Uint8Array(ImgBuff);
    var thumbnail;

    try {
        thumbnail = await sharp(Uint8Buff).blur(8).resize(canvas.width, canvas.height).modulate({ brightness: 0.6 }).toBuffer();
    } catch (e) {
        thumbnail = await sharp("./src/modules/music/assets/Music_Placeholder.png").blur(8).resize(canvas.width, canvas.height).modulate({brightness: 0.6}).toBuffer();
    }

    await loadImage(thumbnail).then(img => {
        ctx.drawImage(img, 25, 25, canvas.width - 50, canvas.height - 50);

        loadImage("./src/modules/music/assets/Music_Default.png").then(img => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        })
    })

    const attachment = new discordJs.AttachmentBuilder(canvas.toBuffer(), { name: "music_default.png", description: "The default music image" });

    message.edit({
        content: " ",
        files: [attachment],
        embeds: [
            new discordJs.EmbedBuilder({
                title: ':musical_note: | Join a Voice Channel and add a Song or a Playlist',
                image: { url: 'attachment://music_default.png' },
                color: discordJs.Colors.DarkButNotBlack
            })
        ],
        components: [music_Buttons(true, "https://arcin.solutions", false)]
    })
}


function getBrokenChannelEmbed(): discordJs.APIEmbed | discordJs.JSONEncodable<discordJs.APIEmbed> {
    return new discordJs.EmbedBuilder({
        title: 'Something went wrong',
        description: `Looks like this channel is broken.\nPlease use the ${(commands.get({ name: 'setup' }) === undefined) ? '/setup' : `</setup:${commands.get({ name: 'setup' })!.id}>`} command.`,
        color: discordJs.Colors.DarkRed,
    });
}

export async function updateMusicEmbed(player: Player) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as discordJs.TextChannel | undefined;
    if (channel == null) return;

    if (player.current === null) return;

    const message: discordJs.Message<true> | null = await getMusicEmbedMessage(channel, guildData);

    if (message == null)
        return channel.send({
            embeds: [getBrokenChannelEmbed()]
        });

    if (!checkHasMusicChannelPermissions(channel))
        return channel.send({ embeds: [getBrokenChannelEmbed()] });

    const queue = player.queue as BetterQueue;
    const current = player.current as BetterTrack;

    const attachment = new discordJs.AttachmentBuilder(await createMusicImage(current), { name: "music.png", description: "The music image" });

    const formattedQueue = queue.generateFormattedQueue;

    message.edit({
        content: (formattedQueue == '' ?
            '**__Queue:__**\nJoin a Voice Channel and add a Song or a Playlist' : formattedQueue),
        files: [attachment],
        embeds: [
            new discordJs.EmbedBuilder({
                description: '**:musical_note: Now Playing:**',
                image: { url: 'attachment://music.png' },
            })
        ],
        components: [music_Buttons(false, current.uri, player.paused)]
    })
}

async function getMusicEmbedMessage(channel: discordJs.TextChannel, guildData: { channelId: string; messageId: string; }) {
    try {
        return await channel.messages.fetch(guildData.messageId);
    } catch (error) {
        return null
        // channel.send({ embeds: [brokenEmbedMsg] });
    }
}

export async function updateMusicEmbedButtons(player: Player) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as discordJs.TextChannel | undefined;
    if (channel == null) return;

    const message: discordJs.Message<true> | null = await getMusicEmbedMessage(channel, guildData);

    if (message == null)
        return await channel.send({
            embeds: [getBrokenChannelEmbed()]
        });

    if (player.current === null) return;

    message.edit({
        components: [music_Buttons(false, player.current.uri, player.paused)]
    })
}

export async function updateMusicEmbedFooter(player: Player, options?: { loop?: "Track" | "Queue", autoplay?: boolean }) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as discordJs.TextChannel | undefined;
    if (channel == null) return;

    const message: discordJs.Message<true> | null = await getMusicEmbedMessage(channel, guildData);

    if (message == null)
        return await channel.send({
            embeds: [getBrokenChannelEmbed()]
        });

    if (player.current === null) return;

    let footerOptionsText = '';

    if (typeof options !== 'undefined') {
        if (typeof options.loop !== 'undefined') {
            footerOptionsText += `Loop: ${options.loop}`;
        }
        // if (typeof options.autoplay !== 'undefined') {
        //     footerOptionsText += `${options.autoplay}` ? '| Autoplay activated' : '';
        // }
    }

    message.edit({
        embeds: [
            new discordJs.EmbedBuilder({
                description: '**:musical_note: Now Playing:**',
                image: { url: 'attachment://music.png' },
                footer: { text: footerOptionsText }
            })
        ]
    })
}

async function checkHasMusicChannelPermissions(channel: discordJs.TextChannel) {
    const permissions = channel.permissionsFor(client.user!);
    try {
        if (permissions == null || !permissions.has(discordJs.PermissionFlagsBits.AttachFiles) ||
            !permissions.has(discordJs.PermissionFlagsBits.EmbedLinks) || !permissions.has(discordJs.PermissionFlagsBits.ManageMessages))
            return false
    } catch (error) {
        return true
    }
}