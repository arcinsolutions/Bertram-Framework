import { config } from 'dotenv';
import { Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../golden';
import { Guild, MessageEmbed, Message } from 'discord.js';
import { musicGuild } from '../database/entities/guild';

// +++ create Vulkava Client +++

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

// --- create Vulkava Client ---

export async function getGuild(guildId: string) {
    return (await musicGuild.findOneBy({ guildId: guildId }))
}

// +++ Channel stuff +++

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

    const embed = await channel.send({
        embeds: [
            new MessageEmbed({
                title: "Song-Requests",
                description: "Hier kannst du Songs hinzufügen, die du abspielen möchtest.",
                color: "DARK_GREEN",
                fields: [
                    {
                        name: "Hinzufügen",
                        value: "Schreibe einen Song in diesen Channel und er wird automatisch hinzugefügt.",
                        inline: true
                    },
                    {
                        name: "Entfernen",
                        value: "Schreibe einen Song in diesen Channel und er wird automatisch entfernt.",
                        inline: true
                    }
                ],
                image: {
                    url: "https://cdn.discordapp.com/attachments/911271717492621343/912002185267646544/bg4.png"
                },
                footer: {
                    text: "Powered by arcin Solutions"
                }
            })
        ]
    })

    await musicGuild.createQueryBuilder()
    .insert()
    .values({
        guildId: guild.id,
        guildName: guild.name,
        channelId: channel.id,
        embedId: embed.id
    })
    .orUpdate(["guildID", "guildName", "channelId", "embedId"])
    .execute();

    return channel;
}

export async function play(message: Message, dbGuild: musicGuild) {
    await message.delete().catch(() => {});

    if (!message.member!.voice.channel)
            return await message.channel.send("JOIN_A_VOICECHANNEL")

    console.log("Success!")
}

// --- Channel Stuff ---