import { Pagination, PaginationItem, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { ButtonStyle, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from 'discordx';
import { help } from './../help/index.js';
import { core } from './../../../core/index.js';

@Discord()
@Category("Information")
class Help {
    @Slash({ name: "help", description: "Show the help menu", nameLocalizations: { de: "hilfe" }, descriptionLocalizations: { de: "Zeigt das Hilfemenü" } })
    async help(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const timeoutEmbed = new EmbedBuilder({
            title: 'Embed expired',
            description: `If you want to see all our commands, please use the </help:${interaction.id}> command once again.`,
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

        try {
            await pagination.send()
        } catch (error) {
            interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'looks like the help menu is not available yet.',
                    description: '**Please try again later.**',
                    color: Colors.DarkGold
                })]
            })
            console.warn('\x1b[31m%s\x1b[0m',error);
        };
    }

}

async function GeneratePages(): Promise<PaginationItem[]> {
    const pages = Array.from(Array((help.lenght)).keys()).map((i) => {
        return { title: core.commands.getAllCategories[i].name, embed: help.getText(i) };
    });
    return pages.map((page) => {
        return {
            embeds: [new EmbedBuilder({
                title: 'Category: ' + page.title,
                description: page.embed,
                footer: { text: "Page " + (pages.indexOf(page) + 1) + " of " + pages.length },
                color: Colors.DarkGreen
            })],
        };
    });
}