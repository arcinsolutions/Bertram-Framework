import { Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../golden';
import { Guild, MessageEmbed, Message, CommandInteraction } from 'discord.js';
import { musicGuild } from '../database/entities/guild';
import { Guild as baseGuild } from './../../core/database/entities/guild';
import { CoreDatabase, getGuild } from './../../core/database/index';

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

/**
 * 
 * @param interaction The command interaction
 * @returns the created music Player
 */
export async function createMusicPlayer(interaction: CommandInteraction) {
    const player = music.createPlayer({
        guildId: interaction.guild!.id,
        voiceChannelId: interaction.member!.voice.channel.id,
        textChannelId: interaction.channel!.id,
        selfDeaf: true
    })

    music.emit("playerCreate", player);

    return player;
}

export async function setPlayerData(guildId: string, channelId: string, messageId: string) {
    const player = await music.players.get(guildId);
    player!.channelID = channelId;
    player!.messageID = messageId;
}

// --- Vulkava Stuff ---


// +++ Get Stuff from Database +++

export let musicChannels: Array<string> = [];
export let musicMessageIds: Array<string> = [];

/**
 * 
 * @returns Array of music channel ids and Array of music message ids
 */
export async function getMusicStuffFromDB(): Promise<string[]> {
    const data = await CoreDatabase.getRepository(baseGuild).createQueryBuilder("guild").getMany()
    data.map(guild => {
        musicChannels.push(guild.channelId)
        musicMessageIds.push(guild.messageId)
    });

    // data.forEach(async (guild) => {
    //     musicChannels.push(await guild.channelId);
    //     musicMessageIds.push(await guild.messageId);
    // })

    console.log(musicMessageIds);
    console.log(musicChannels);

    return musicChannels && musicMessageIds;
}


// --- Get Stuff from Database ---



// +++ Channel stuff +++

/**
 * 
 * @param guild Guild object
 * @returns channel id of music channel
 */
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
            messageId: message.id
        })
        .orUpdate(["guildID", "guildName", "channelId", "messageId"])
        .execute();

    return channel;
}

/**
 * 
 * @param message Message object
 * @param dbGuild Database guild object
 */
export async function play(message: Message, dbGuild: musicGuild | Guild) {
    await message.delete().catch(() => { });

    if (!message.member!.voice.channel)
        return await message.channel.send("JOIN_A_VOICECHANNEL")

    console.log("Success!")
}

// --- Channel Stuff ---