import { Player, Vulkava } from 'vulkava'
import { OutgoingDiscordPayload } from 'vulkava/lib/@types';
import { client } from '../../../golden';
import { Guild, MessageEmbed, Message, CommandInteraction, TextChannel, MessageAttachment } from 'discord.js';
import { musicGuild } from '../database/entities/guild';
import { CoreDatabase, getGuild } from './../../core/database/index';
import { createCanvas, loadImage, registerFont } from 'canvas'
import formatDuration from 'format-duration'
import Jimp from 'jimp'

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
export let musicGuilds: Map<string, { channelId: string, messageId: string }> = new Map();

/**
 * 
 * @returns Array of music channel ids and Array of music message ids
 */
export async function getMusicStuffFromDB() {
    const data = await CoreDatabase.getRepository(musicGuild).createQueryBuilder("guild").getMany()

    data.map(guild => {
        musicGuilds.set(guild.guildId
            , {
                channelId: guild.channelId,
                messageId: guild.messageId
            }
        );
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

    musicGuilds.set(guild.id, {
        channelId: channel.id,
        messageId: message.id
    });

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
            track.setRequester({ author: message.author, id: message.author.id });
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
        track.setRequester({ author: message.author, id: message.author.id });

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

export async function updateMusicEmbed(player: Player) {
    const guildData = musicGuilds.get(player.guildId);
    if (!guildData) return;

    const channel = client.channels.cache.get(guildData.channelId) as TextChannel | undefined;
    if (channel == null) return;

    if (!player.current) return;

    const message = await channel.messages.fetch(guildData.messageId);
    if (message == null || message.embeds[0] == undefined) return await channel.send("CHANNEL_IS_BROKEN");


    // Update embed....
    registerFont("./src/modules/music/assets/Outfit-Regular.ttf", { family: "Outfit" });
    registerFont("./src/modules/music/assets/Outfit-Bold.ttf", { family: "OutfitBold" });
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    const thumbnail = await Jimp.read(player.current.thumbnail!).then(image => {
        image.resize(canvas.width, canvas.height).resize(Jimp.AUTO, canvas.height);
        image.blur(8).background(0x000000).brightness(-0.6);
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

        loadImage("./src/modules/music/assets/Music-Test.png").then(img => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        })
    })

    const requester = await client.users.fetch(player.current.requester.id);

    var a = [player.current.author, ' - ', ' (Official Music Video)', ' (Official Video)'];

    ctx.font = '90px OutfitBold';
    ctx.fillStyle = '#ffffff';

    ctx.fillText(
        (player.current.title.includes(player.current.author) ? player.current.title.replace(new RegExp(a.map(function (x) {
            return x.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }).join('|'), 'g'), "") : player.current.title)
        , 100, 200, (canvas.width - 150)
    );

    ctx.fillText(player.current.author, 100, 400, (canvas.width - 50));
    ctx.fillText(await formatDuration(player.current.duration, { leading: true }), 100, 600, (canvas.width - 50));
    ctx.fillText(String(requester.username), 100, 800, (canvas.width - 50));


    message.edit({
        content: "Loading...",
        files: [new MessageAttachment(canvas.toBuffer())]
    }).then(msg => {
        msg.edit({
            content: `${player.queue}`,
            embeds: [
                new MessageEmbed({
                    title: ':musical_note: Now Playing',
                    image: { url: msg.attachments.first()?.url }
                })
            ],
            files: []
        })
    })

}

// --- Channel Stuff ---