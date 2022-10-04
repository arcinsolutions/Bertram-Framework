import { Category } from "@discordx/utilities";
import { Colors, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Discord, Slash } from "discordx";
import { music } from "../api/index.js";

@Discord()
@Category("Music")
class Pause {
    @Slash({ name: "pause", description: "Pause or Unpause the current Song" })
    async pause(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: please join a voice channel first",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        const player = music.players.get(interaction.guildId!);
        if (player == null)
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: ":x: No active Player found!",
                    color: Colors.DarkRed
                })]
            })

        player.pause(!player.paused);
        music.emit('songPause', player);
        interaction.editReply({
            embeds: [new EmbedBuilder({
                description: !player.paused ? ":arrow_forward: **Resumed** the current Song!" : ":pause_button: **Paused** the current Song!",
                color: Colors.DarkGreen
            })]
        })
    }
}