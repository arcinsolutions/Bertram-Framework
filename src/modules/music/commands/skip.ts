import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { music } from './../api/index';


@Discord()
@Category("Music")
class Skip {
    @Slash("skip", { description: "Skip the current Song" })
    async skip(@SlashOption("amount", { description: "let you skip a specific amount of Songs", required: false }) amount: number, interaction: CommandInteraction) {
        const embed = new MessageEmbed({
            description: "Song skiped!",
            color: "DARK_GREEN"
        })

        const player = music.players.get(interaction.guild!.id);
        player?.skip(amount);

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    }

}