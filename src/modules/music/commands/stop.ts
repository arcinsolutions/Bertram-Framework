import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Player } from "vulkava";
import { checkCommandInteraction } from "../../core/api";
import { music } from './../api/index';


@Discord()
@Category("Music")
class Stop {
    @Slash("stop", { description: "Stop the current Player" })
    async stop(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })
        await checkCommandInteraction(interaction);

        const embed = new MessageEmbed()

        const player = music.players.get(interaction.guild!.id);
        if (!player) 
            return interaction.editReply({
                embeds: [embed.setDescription("No active Player...").setColor("DARK_RED")]
            })

        player?.destroy();
        interaction.editReply({
            embeds: [embed.setDescription("Player Stopped and Destroyed!").setColor("DARK_GREEN")]
        })
            
    }

}