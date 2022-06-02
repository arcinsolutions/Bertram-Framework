import { Category, Description } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { Interaction, MessageEmbed } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { client } from "../../../golden";
import { music } from './../api/index';

@Discord()
@Category("Music")
class Stats {
    @Slash("play")
    @Description("let you Play your Favorite song.")
    async play(interaction: CommandInteraction) {
        const embed = new MessageEmbed();

        interaction.deferReply({
            fetchReply: true,
        })

        

        const sent: any = await interaction.reply({
            embeds: [embed.setDescription(`**Pinging...**`).setColor('DARK_RED')],
            fetchReply: true,
            ephemeral: true,
        })


    }
}