import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashOption } from 'discordx';
import { ApplicationCommandOptionType, Colors, EmbedBuilder, GuildMember } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { createMusicPlayer, music } from './../api/index';
import { BetterQueue } from './../api/structures';

@Discord()
@Category("Music")
class Play {
    @Slash({ name: "play", description: "let you Play your Favorite song." })
    async play(@SlashOption({ name: "song", description: "add a Song to the Queue", type: ApplicationCommandOptionType.String, required: true  }) song: string, interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })
        const embed = new EmbedBuilder({
            color: Colors.DarkRed
        });

        // interaction.deferReply({
        //     ephemeral: true
        // })

        if (!(interaction.member as GuildMember)?.voice.channel || !interaction.member)
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

        //Connect to the Voice Channel
        player.connect();


        if (res.loadType === 'PLAYLIST_LOADED') {
            for (const track of res.tracks) {
                track.setRequester(interaction.user);
                (player.queue as BetterQueue)?.add(track);
            }

            interaction.editReply({
                embeds: [embed.setDescription(`Playlist ${res.playlistInfo.name} loaded!`).setColor(Colors.DarkGreen)]
            });
        } else {
            const track = res.tracks[0];
            track.setRequester(interaction.user);

            (player.queue as BetterQueue)?.add(track);
            interaction.editReply({
                embeds: [embed.setDescription(`Queued **${track.title}**`).setColor(Colors.DarkGreen)]
            });
        }

        if (!player.playing) player.play();

    }
}