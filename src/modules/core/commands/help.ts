import { Pagination, PaginationResolver, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, MessageOptions } from "discord.js";
import { ButtonComponent, Discord, Slash } from 'discordx';
import { help } from "../help";

let helpMenu: EmbedBuilder;

@Discord()
@Category("Information")
class Help {
    @Slash({ name: "help", description: "Show the help menu" })
    async help(interaction: CommandInteraction) {
        const pagination = new Pagination(interaction, await GeneratePages(), {
            onTimeout: () => interaction.editReply({ embeds: [new EmbedBuilder({ title: 'Timed out', color: Colors.DarkRed })] }),
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
        return { embed: `**__${help.categories().get(i).name}__**\n${help.getText(i)}` };
    });
    return pages.map((page) => {
        return {
            embeds: [new EmbedBuilder({
                title: 'Help Menu',
                description: page.embed,
                color: Colors.DarkGreen
            })],
        };
    });
}