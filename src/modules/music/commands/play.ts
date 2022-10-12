import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashOption } from 'discordx';
import { ApplicationCommandOptionType, Colors, EmbedBuilder, GuildMember } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { addSongToPlayer, createMusicPlayer, music, play } from './../api/index.js';
import { BetterQueue } from './../api/structures.js';
import { updateQueueEmbed } from "../api/embed.js";

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

        if (!(interaction.member as GuildMember)?.voice.channel || !interaction.member)
            return await interaction.editReply({
                embeds: [embed.setDescription(":x: please Join a Voice Channel!")]
            })

        const player = await createMusicPlayer(interaction);
        addSongToPlayer(song, interaction.user, player);
    }
}