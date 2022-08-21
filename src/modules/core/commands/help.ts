import { Category, Description } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash } from 'discordx';
import { categories, helpText } from "../events/botReady";

let helpMenu: EmbedBuilder;

@Discord()
@Category("Information")
class Help {
    @Slash({ name: "help", description: "Show the help menu", })
    async help(interaction: CommandInteraction) {
        helpMenu = new EmbedBuilder({
            title: 'Help Menu',
            description: helpText[0],
            color: Colors.DarkGreen
        })

        interaction.reply({
            embeds: [helpMenu],
            components: [CreateHelpMenuActionRow(0)],
            ephemeral: true,
            fetchReply: true
        })

    }

    @ButtonComponent({ id: "firstBtn" })
    async first_Btn(interaction: ButtonInteraction) {
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[0]}`)],
            components: [CreateHelpMenuActionRow(0)]
        })
    }

    @ButtonComponent({ id: "prevBtn" })
    async prev_Btn(interaction: ButtonInteraction) {
        let prevPage: number = await (helpText.indexOf(`${helpMenu.data.description}`) - 1);
        if (prevPage < 0)
            prevPage = 0
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[prevPage]}`)],
            components: [CreateHelpMenuActionRow(prevPage)]
        })
    }

    @ButtonComponent({ id: "nextBtn" })
    async next_Btn(interaction: ButtonInteraction) {
        let nextPage: number = await (helpText.indexOf(`${helpMenu.data.description}`) + 1);
        if (nextPage >= categories.length)
            nextPage = categories.length - 1
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[nextPage]}`)],
            components: [CreateHelpMenuActionRow(nextPage)]
        })
    }

    @ButtonComponent({ id: "lastBtn" })
    async last_Btn(interaction: ButtonInteraction) {
        interaction.update({
            embeds: [helpMenu.setDescription(`${helpText[helpText.length - 1]}`)],
            components: [CreateHelpMenuActionRow(helpText.length - 1)]
        })
    }

}


function CreateHelpMenuActionRow(page: number) {
    return new ActionRowBuilder({
        components: [new ButtonBuilder({
            customId: "firstBtn",
            emoji: '<:firstPage:984398945872670760> ',
            style: ButtonStyle.Secondary,
            disabled: (page <= 0) ? true : false
        }),
        new ButtonBuilder({
            customId: "prevBtn",
            emoji: '<:arrowleft:930879597178929153>',
            style: ButtonStyle.Secondary,
            disabled: (page <= 0) ? true : false
        }),
        new ButtonBuilder({
            style: ButtonStyle.Secondary,
            customId: "currPage",
            label: categories[(page <= 0 || page > categories.length) ? 0 : page],
            disabled: true
        }),
        new ButtonBuilder({
            style: ButtonStyle.Secondary,
            customId: "nextBtn",
            emoji: '<:arrowright:930879597472518145>',
            disabled: (page >= (categories.length - 1)) ? true : false
        }),
        new ButtonBuilder({
            style: ButtonStyle.Secondary,
            customId: "lastBtn",
            emoji: '<:lastPage:984398886376460339>',
            disabled: (page >= (categories.length - 1)) ? true : false
        })]
    }) as any
}

