import { Category } from "@discordx/utilities";
import { ButtonStyle, Colors, CommandInteraction, EmbedBuilder, MessageOptions } from "discord.js";
import { Discord, Slash } from "discordx";
import { music } from "../api";
import { BetterQueue } from './../api/structures';
import { Pagination } from '@discordx/pagination';
import { PaginationType } from '@discordx/pagination';

@Discord()
@Category("Music")
class Queue {
    @Slash({ name: "queue", description: "Show the current queue" })
    async queue(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })

        const timeoutEmbed = new EmbedBuilder({
            title: 'Embed expired',
            description: `If you want to see all our commands, please use the </help:${interaction.commandId}> command once again.`,
            footer: { text: 'made by arcin with ❤️' },
            color: Colors.DarkGold
        })

        const player = music.players.get(interaction.guild!.id);

        if (!player) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if atleast **one** song is in the queue.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        const queue = player.queue as BetterQueue;

        if (queue.size === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No Songs in Queue',
                    description: 'please use this Command only if atleast **one** song is in the queue.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        const pagination = new Pagination(interaction, await GeneratePages(queue), {
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

async function GeneratePages(queue: BetterQueue): Promise<MessageOptions[]> {
    const pages = Array.from(queue.getQueuePages);

    // const pages = Array.from(Array((Math.max(queue.size / 10))).keys()).map((i) => {
    //     return { embed: queue.getSongDetails(i, i * 10) };
    // });
    return pages.map((page) => {
        return {
            embeds: [new EmbedBuilder({
                title: 'Queue',
                description: page,
                footer: { text: "Page " + (pages.indexOf(page) + 1) + " of " + pages.length + ' | made by arcin with ❤️' },
                color: Colors.DarkGreen
            })],
        };
    });
}