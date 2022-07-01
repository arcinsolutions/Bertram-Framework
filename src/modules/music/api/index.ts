import { Track, Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../golden';
import { Guild, MessageEmbed, Message, CommandInteraction, TextChannel } from 'discord.js';
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

// export async function setPlayerData(guildId: string, channelId: string, messageId: string) {
//     const player = await music.players.get(guildId);
//     player!.channelID = channelId;
//     player!.messageID = messageId;
// }

// --- Vulkava Stuff ---


// +++ Get Stuff from Database +++

/**
 * Get the music Guild from the Database
 * @get [0] = channelId [1] = messageId
 */
export let musicGuilds: Map<string, Object> = new Map();

/**
 * 
 * @returns Array of music channel ids and Array of music message ids
 */
export async function getMusicStuffFromDB() {
    const data = await CoreDatabase.getRepository(baseGuild).createQueryBuilder("guild").getMany()

    data.map(guild => {
        // musicGuilds.set(guild.guildId, [guild.channelId, guild.messageId]);
        musicGuilds.set(guild.guildId, {
            channelId: guild.channelId,
            messageId: guild.messageId
        });
    });

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

    musicGuilds.set(guild.id, [channel.id, message.id]);
    // TODO CHECK IF GUILD HAS ACTIVE PLAYER --> updateEmbed
    return channel;
}

/**
 * 
 * @param message Message object
 */
export async function play(message: Message) {
    await message.delete().catch(() => { });

    if (!message.member!.voice.channel)
        return await message.channel.send({
            embeds: [
                new MessageEmbed({
                    description: ":x: please join a voice channel first",
                    color: "DARK_RED"
                })
            ]
        })

    let player = music.players.get(message.guild!.id);
    if (!player)
        player = music.createPlayer({
            guildId: message.guild!.id,
            voiceChannelId: message.member!.voice.channel.id,
            selfDeaf: true
        })

    // Search for Music
    const res = await music.search(message.content);

    switch (res.loadType) {
        case "LOAD_FAILED":
            return message.channel.send({
                embeds: [new MessageEmbed({
                    description: `:x: Load failed!\nError: ${res.exception?.message}`
                })]
            })
        case "NO_MATCHES":
            return message.channel.send({
                embeds: [
                    new MessageEmbed({
                        description: `:x: No matches!`
                    })
                ]
            })
        default:
            break;
    }

    //Connect to the Voice Channel
    player.connect();

    if (res.loadType === 'PLAYLIST_LOADED') {
        for (const track of res.tracks) {
            track.setRequester(message.author);
            player.queue.push(track);
        }

        message.channel.send({
            embeds: [
                new MessageEmbed({
                    description: `:white_check_mark: Playlist loaded!\n${res.tracks.length} tracks added to the queue.`
                })
            ]
        });
    } else {
        const track = res.tracks[0];
        track.setRequester(message.author);

        player.queue.push(track);
        message.channel.send({
            embeds: [
                new MessageEmbed({
                    description: `:white_check_mark: Track added to the queue!`
                })
            ]
        });
    }

    if (!player.playing) player.play();
}

export async function updateMusicEmbed(guildId: string, track: Track) {
    const musicGuild = musicGuilds.get(guildId);
    if (musicGuild == null) return;

    const channel = client.channels.cache.get(musicGuild.channelId) as TextChannel;
    if (channel == null) return;

    const message = await channel.messages.fetch(musicGuild.messageId);
    if (message == null || message.embeds[0] == undefined) return await channel.send("CHANNEL_IS_BROKEN");

   // Update embed....
   console.log(track)
}

// --- Channel Stuff ---