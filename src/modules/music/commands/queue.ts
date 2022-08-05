import { Category } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, ComponentBuilder, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Slash } from "discordx";
import { DefaultQueue } from "vulkava";
import { music } from "../api";
import { BetterQueue } from './../api/structures';

@Discord()
@Category("Music")
class Queue {
    @Slash("queue", { description: "Show the current queue" })
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


    @ButtonComponent("music_queue_previous")
    async queuePrevious(interaction: ButtonInteraction) {
        const player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.update({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: No player found!",
                        color: Colors.DarkRed
                    })
                ]
            })

        const queue = player.queue as BetterQueue;
        let lenght: number = (Number(await queue.size.toFixed()) / 10);
        let currPage = 0;

        for (let i = 0; i < lenght; i++) {
            if (interaction.message.embeds[0].description?.includes(queue.getSongDetails(i * 10, (i * 10) + 10))) {
                currPage = i;
                break;
            }
        }

        return await interaction.update({
            embeds: [
                new EmbedBuilder({
                    title: "Queue",
                    description: await queue.getSongDetails(currPage * 10 - 20, currPage * 10 - 10),
                    color: Colors.DarkGreen
                })
            ],
            components: [await generateMusicQueueComponents(queue, currPage)]
        })
    }

    @ButtonComponent("music_queue_next")
    async queueNext(interaction: ButtonInteraction) {
        const player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.update({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: No player found!",
                        color: Colors.DarkRed
                    })
                ]
            })

        const queue = player.queue as BetterQueue;
        let lenght = (Number(await queue.size.toFixed(0)) / 10);
        let currPage = 0;

        for (let i = 0; i < lenght; i++) {
            if (await interaction.message.embeds[0].description?.includes(await queue.getSongDetails(i * 10, (i * 10) + 10))) {
                currPage = i;
                break;
            }
        }

        return await interaction.update({
            embeds: [
                new EmbedBuilder({
                    title: "Queue",
                    description: await queue.getSongDetails(currPage * 10 + 10, currPage * 10 + 20),
                    color: Colors.DarkGreen
                })
            ],
            components: [await generateMusicQueueComponents(queue, currPage + 1)]
        })
    }
}

async function generateMusicQueueComponents(queue: BetterQueue, currPage: number): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>> {
    const components: ActionRowBuilder<MessageActionRowComponentBuilder> = new ActionRowBuilder<MessageActionRowComponentBuilder>;
    const lenght = (Number(await queue.size.toFixed(0)) / 10);

    console.log(Number(lenght.toFixed()));
    console.log(currPage);

    components.addComponents(
        new ButtonBuilder({
            custom_id: "music_queue_previous",
            emoji: "⏪",
            disabled: currPage == 0 ? true : false,
            style: ButtonStyle.Secondary,
        }),
        new ButtonBuilder({
            custom_id: "music_queue_next",
            emoji: "⏩",
            disabled: currPage > Number(lenght.toFixed()) ? true : false,
            style: ButtonStyle.Secondary,
        }),
    )

    return components;
}