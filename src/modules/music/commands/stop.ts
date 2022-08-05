import { Category } from "@discordx/utilities";
import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { music } from './../api/index';


@Discord()
@Category("Music")
class Stop {
    @Slash("stop", { description: "Stop the current Player" })
    async stop(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })
        const embed = new EmbedBuilder()

        const player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.editReply({
                embeds: [embed.setDescription("No active Player...").setColor(Colors.DarkRed)]
            })

        await music.emit("stop", player);

        interaction.editReply({
            embeds: [embed.setDescription("Player Stopped and Destroyed!").setColor(Colors.DarkGreen)]
        })

    }

}