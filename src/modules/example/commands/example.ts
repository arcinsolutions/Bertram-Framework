import { Discord, Slash } from "discordx";
import { Colors, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from "@discordx/utilities";

@Discord()
@Category("Example")
class Example {
    @Slash({ name: "example", description: "Example command" })
    private async example(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })

        return interaction.editReply({
            embeds: [new EmbedBuilder({
                title: 'Example',
                description: 'This is an example command',
                footer: { text: 'made by arcin with ❤️' },
                color: Colors.DarkGreen
            })]
        });
    }
}