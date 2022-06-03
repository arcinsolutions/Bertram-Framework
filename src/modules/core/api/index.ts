import { CommandInteraction, MessageEmbed } from "discord.js";

export async function checkCommandInteraction(interaction: CommandInteraction) {
    const embed = new MessageEmbed({
        color: "DARK_RED"
    })

    if (interaction.member == null)
        return await interaction.editReply({
            embeds: [embed.setDescription(":x: no Member")]
        })

    if (interaction.guild == null)
        return await interaction.editReply({
            embeds: [embed.setDescription(`:x: no Guild!`)]
        })

    if (interaction.channel == null)
        return await interaction.editReply({
            embeds: [embed.setDescription(`:x: no Channel!`)]
        })
}