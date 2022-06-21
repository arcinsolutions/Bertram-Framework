import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { Discord, Slash, Guild, ButtonComponent } from "discordx";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {

        return interaction.reply({
            embeds: [new MessageEmbed({
                description: `SETUP TEXT LOL`,
                color: "DARK_GREEN"
            })],
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "abort",
                            style: "SECONDARY",
                            label: "MACH MA",
                        }),
                        new MessageButton({
                            customId: "create",
                            label: "NE DOCH NICH",
                            style: "SECONDARY",
                        })
                    ]
                })
            ]
        })
    }

    @ButtonComponent("abort")
    async abort(interaction: ButtonInteraction) {
            return interaction.update({
                embeds: [new MessageEmbed({
                    description: "Ok dann nicht",
                    color: "DARK_RED"
                })]
            })
    }
}
