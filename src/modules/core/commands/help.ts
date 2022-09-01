import { Pagination, PaginationResolver, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, MessageOptions } from "discord.js";
import { ButtonComponent, Discord, Slash, MetadataStorage } from 'discordx';
import { help } from "../help";

let helpMenu: EmbedBuilder;

@Discord()
@Category("Information")
class Help {
    @Slash({ name: "help", description: "Show the help menu" })
    async help(interaction: CommandInteraction) {
        const timeoutEmbed = new EmbedBuilder({
            title: 'Embed expired',
            description: `If you want to see all our commands, please use the </help:${interaction.commandId}> command once again.`,
            footer: { text: 'made by Botis with ❤️' },
            color: Colors.DarkGold
        })

        const pagination = new Pagination(interaction, await GeneratePages(), {
            onTimeout: () => interaction.editReply({ embeds: [timeoutEmbed] }),
            start: {
                label: "⏮️",
                style: ButtonStyle.Secondary,
            },
            end: {
                label: '⏭️',
                style: ButtonStyle.Secondary
            },
            next: {
                label: '▶️',
                style: ButtonStyle.Secondary
            },
            previous: {
                label: '◀️',
                style: ButtonStyle.Secondary
            },
            type: PaginationType.Button,
            time: 5 * 10000,
            ephemeral: true,
        });

        await pagination.send();
    }

}

async function GeneratePages(): Promise<MessageOptions[]> {
    const pages = Array.from(Array((help.getLenght())).keys()).map((i) => {
        return { title: help.categories().get(i).name, embed: help.getText(i) };
    });
    return pages.map((page) => {
        return {
            embeds: [new EmbedBuilder({
                title: 'Category: ' + page.title,
                description: page.embed,
                footer: { text: "Page " + (pages.indexOf(page) + 1) + " of " + pages.length + ' | made by Botis with ❤️' },
                color: Colors.DarkGreen
            })],
        };
    });
}