import { Category } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, ComponentBuilder, EmbedBuilder, MessageActionRowComponentBuilder, MessageOptions } from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";
import { DefaultQueue } from "vulkava";
import { music } from "../api";
import { BetterQueue } from './../api/structures';

@Discord()
@Category("Music")
class Queue {
    @Slash({ name: "queue", description: "Show the current queue" })
    async queue(interaction: CommandInteraction) {
        let currPage = 0;
        const player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: No player found!",
                        color: Colors.DarkRed
                    })
                ]
            })
        const queue = player.queue as BetterQueue;
        interaction.reply({
            embeds: [
                new EmbedBuilder({
                    title: "Queue",
                    description: queue.getSongDetails(currPage, currPage + 10),
                    color: Colors.DarkGreen
                })
            ],
            ephemeral: true,
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>({
                    components: [
                        new ButtonBuilder({
                            custom_id: "music_queue_previous",
                            emoji: "⏪",
                            disabled: currPage === 0 ? true : false,
                            style: ButtonStyle.Secondary,
                        }),
                        new ButtonBuilder({
                            custom_id: "music_queue_next",
                            emoji: "⏩",
                            disabled: currPage + 10 >= queue.size ? true : false,
                            style: ButtonStyle.Secondary,
                        }),
                    ]
                }
                )
            ]
        })
    }
}


async function GeneratePages(queue: BetterQueue): Promise<MessageOptions[]> {

    const pages = Array.from(Array((queue.getAllSongDetails().length / 20)).keys()).map((i) => {
        return { embed: queue.getSongDetails(i, i + 10) };
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