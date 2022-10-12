import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { CommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import { core } from "src/core/index.js";

@Discord()
@Category("Music")
class Favorite {
    @Slash({ name: "favorite", description: "let you add the Current song to your Favorite songs." })
    async favorite(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })
        const embed = new EmbedBuilder({
            color: Colors.DarkRed
        });

        core.database.member(interaction.member.id)
    }
}