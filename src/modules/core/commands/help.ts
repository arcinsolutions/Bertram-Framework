import { Category, Description, ICategory, RateLimit, TIME_UNIT } from "@discordx/utilities";
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ButtonComponent, DApplicationCommand, Discord, Guard, MetadataStorage, Slash } from "discordx";
import { categories, helpText } from "../events/botReady";

let helpMenu: MessageEmbed;

@Discord()
@Category("Information")
class Help {
    @Slash("help")
    @Description("Help me, i am under the water. Menu")
    async help(interaction: CommandInteraction) {
        helpMenu = new MessageEmbed({
            title: 'Help Menu',
            description: helpText[0],
            color: "DARK_GREEN",
            provider: ({ name: 'arcin Solutions', url: 'https://github.com/arcinsolutions' })
        })

        interaction.reply({
            embeds: [helpMenu],
            components: [CreateHelpMenuActionRow(0)],
            ephemeral: true,
            fetchReply: true
        })

    }

    @ButtonComponent("prevBtn")
    async prev_Btn(interaction: ButtonInteraction) {
        let prevPage: number = await (helpText.indexOf(`${helpMenu.description}`) - 1);
        if (prevPage < 0)
            prevPage = 0
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[prevPage]}`)],
            components: [CreateHelpMenuActionRow(prevPage)]
        })
    }

    @ButtonComponent("nextBtn")
    async next_Btn(interaction: ButtonInteraction) {
        let nextPage: number = await (helpText.indexOf(`${helpMenu.description}`) + 1);
        if (nextPage >= categories.length)
            nextPage = categories.length - 1
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[nextPage]}`)],
            components: [CreateHelpMenuActionRow(nextPage)]
        })
    }

}


function CreateHelpMenuActionRow(page: number) {
    const prevBtn = new MessageButton().setCustomId("prevBtn").setEmoji('<:arrowleft:930879597178929153>').setStyle("SECONDARY").setDisabled((page <= 0) ? true : false)
    const currBtn = new MessageButton().setCustomId("currentPage").setLabel(categories[(page <= 0 || page > categories.length) ? 0 : page]).setStyle("SECONDARY").setDisabled(true)
    const nextBtn = new MessageButton().setCustomId("nextBtn").setEmoji('<:arrowright:930879597472518145>').setStyle("SECONDARY").setDisabled((page >= (categories.length - 1)) ? true : false)

    return new MessageActionRow().addComponents(prevBtn).addComponents(currBtn).addComponents(nextBtn)
}

