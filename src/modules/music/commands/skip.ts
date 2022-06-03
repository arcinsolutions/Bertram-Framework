import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Player } from "vulkava";
import { checkCommandInteraction } from "../../core/api";
import { music } from './../api/index';


@Discord()
@Category("Music")
class Skip {
    @Slash("skip", { description: "SKip the current Sogn" })
    async skip(@SlashOption("amount", { description: "let you skip a specific amount of Songs", required: false }) amount: number, interaction: CommandInteraction) {
        await checkCommandInteraction(interaction);

        const embed = new MessageEmbed({
            description: "Song skiped!",
            color: "DARK_GREEN"
        })

        const player = music.players.get(interaction.guild?.id);
        player?.skip(amount);

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }

}