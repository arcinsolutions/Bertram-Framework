import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashOption } from "discordx";
import { MessageEmbed } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { createMusicPlayer, music } from './../api/index';
import { getGuild } from "../../core/database";

@Discord()
@Category("Music")
class Play {
    @Slash("play", { description: "let you Play your Favorite song." })
    async play(@SlashOption("song", { description: "add a Song to the Queue" }) song: string, interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })
        const embed = new MessageEmbed({
            color: "DARK_RED"
        });

        // interaction.deferReply({
        //     ephemeral: true
        // })

        if (!interaction.member!.voice.channel || !interaction.member)
            return await interaction.editReply({
                embeds: [embed.setDescription(":x: please Join a Voice Channel!")]
            })

        // Search for Music
        const res = await music.search(song);

        switch (res.loadType) {
            case "LOAD_FAILED":
                return interaction.editReply({
                    embeds: [embed.setDescription(`:x: Load failed!\nError: ${res.exception?.message}`)]
                })
            case "NO_MATCHES":
                return interaction.editReply({
                    embeds: [embed.setDescription(`:x: No matches!`)]
                })
            default:
                break;
        }

        const player = await createMusicPlayer(interaction);

        player.channelID = (await getGuild(interaction.guild!.id))?.channelID;
        player.messageID = "01";

        //Connect to the Voice Channel
        await player.connect();


        if (res.loadType === 'PLAYLIST_LOADED') {
            for (const track of res.tracks) {
                track.setRequester(interaction.user);
                player.queue.push(track);
            }

            interaction.editReply({
                embeds: [embed.setDescription(`Playlist \`${res.playlistInfo.name}\` loaded!`).setColor("DARK_GREEN")]
            });
        } else {
            const track = res.tracks[0];
            track.setRequester(interaction.user);

            player.queue.push(track);
            interaction.editReply({
                embeds: [embed.setDescription(`Queued **${track.title}**`).setColor("DARK_GREEN")]
            });
        }

        if (!player.playing) player.play();



    }
}