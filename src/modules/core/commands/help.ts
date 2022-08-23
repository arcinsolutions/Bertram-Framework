import { Category } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash } from 'discordx';
import { help } from "../help";

let helpMenu: EmbedBuilder;

@Discord()
@Category("Information")
class Help {
    @Slash({ name: "help", description: "Show the help menu" })
    async help(interaction: CommandInteraction) {
        helpMenu = new EmbedBuilder({
            title: 'Help Menu',
            description: help.getText(0),
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
            embeds: [helpMenu.setDescription(`${help.getText(0)}`)],
            components: [CreateHelpMenuActionRow(0)]
        })
    }

    @ButtonComponent({ id: "prevBtn" })
    async prev_Btn(interaction: ButtonInteraction) {
        let prevPage: number = await (help.findCategory(helpMenu.data.description!) - 1);
        if (prevPage < 0)
            prevPage = 0
        interaction.update({
            embeds: [helpMenu.setDescription(`${help.getText(prevPage)}`)],
            components: [CreateHelpMenuActionRow(prevPage)]
        })
    }

    @ButtonComponent({ id: "nextBtn" })
    async next_Btn(interaction: ButtonInteraction) {
        let nextPage: number = await (help.findCategory(helpMenu.data.description!) + 1);
        if (nextPage >= help.categories().length())
            nextPage = help.categories().length() - 1
        interaction.update({
            embeds: [helpMenu.setDescription(`${help.getText(nextPage)}`)],
            components: [CreateHelpMenuActionRow(nextPage)]
        })
    }

    @ButtonComponent({ id: "lastBtn" })
    async last_Btn(interaction: ButtonInteraction) {
        interaction.update({
            embeds: [helpMenu.setDescription(`${help.getText(help.categories().length() - 1)}`)],
            components: [CreateHelpMenuActionRow(help.categories().length() - 1)]
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
            label: help.categories().get((page <= 0 || page > help.categories().length()) ? 0 : page).name,
            disabled: true
        }),
        new ButtonBuilder({
            style: ButtonStyle.Secondary,
            customId: "nextBtn",
            emoji: '<:arrowright:930879597472518145>',
            disabled: (page >= (help.categories().length() - 1)) ? true : false
        }),
        new ButtonBuilder({
            style: ButtonStyle.Secondary,
            customId: "lastBtn",
            emoji: '<:lastPage:984398886376460339>',
            disabled: (page >= (help.categories().length() - 1)) ? true : false
        })]
    }) as any
}

