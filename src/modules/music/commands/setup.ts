import { Category } from "@discordx/utilities";
import { CommandInteraction, ButtonInteraction, ButtonStyle, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { Discord, Slash, ButtonComponent } from "discordx";
import { musicGuilds } from "../api";
import { createMusicChannel } from "../api/embed";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {
        await interaction.deferReply({
            fetchReply: true
        })
        const tempMusic = musicGuilds.get(interaction.guild!.id);

        if (interaction.guild!.channels.cache.get(tempMusic!.channelId) === undefined) {
            const channel = await createMusicChannel(interaction.guild!);
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    color: Colors.DarkGrey,
                    image: { url: "https://cdn.discordapp.com/attachments/981163706878689280/989244874756853800/3.gif" }
                }),
                new EmbedBuilder({
                    color: Colors.Default,
                    fields: [
                        {
                            name: "<:tick1:989179973657051197><:tick2:989179972373585951>\n<:tick3:989179970729435136><:tick4:989179968904904774>",
                            value: "\u200B",
                            inline: true,
                        },
                        {
                            name: "Successfully created",
                            value: `You're all set up! Ready to jam some music? Just paste any song-, playlist link in ${channel} or search by typing`,
                            inline: true,
                        },
                        {
                            name: "\u200B",
                            value: "\u200B",
                            inline: true,
                        }
                    ]
                })],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>({
                        components: [
                            new ButtonBuilder({
                                customId: "abort",
                                style: ButtonStyle.Success,
                                label: "Woohoo!",
                            })
                        ]
                    })
                ]
            })
        }

        return await interaction.editReply({
            embeds: [new EmbedBuilder({
                color: Colors.Default,
                image: { url: "https://cdn.discordapp.com/attachments/934031298119475271/989234099216601118/1.gif" }
            }),
            new EmbedBuilder({
                color: Colors.DarkButNotBlack,
                fields: [
                    {
                        name: "<:help1:989179967130726480><:help2:989179965209735188>\n<:help3:989179963607486524><:help4:989179961917186108>",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Channel creation",
                        value: `There already exists a channel on this server <#${tempMusic?.channelId}>, but you can create a new one at anytime.`,
                        inline: true,
                    },
                    {
                        name: "\u200B",
                        value: "\u200B",
                        inline: true,
                    }
                ]
            })],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>({
                    components: [
                        new ButtonBuilder({
                            customId: "abort",
                            style: ButtonStyle.Secondary,
                            emoji: "922932409668874290",
                            label: "Cancel",
                        }),
                        new ButtonBuilder({
                            customId: "create",
                            style: ButtonStyle.Danger,
                            emoji: "922932409157181440",
                            label: "Recreate",
                        })
                    ]
                })
            ]
        })
    }

    @ButtonComponent("abort")
    async abort(interaction: ButtonInteraction) {
        return interaction.message.delete();
    }

    @ButtonComponent("create")
    async create(interaction: ButtonInteraction) {
        const tempMusic = musicGuilds.get(interaction.guild!.id);
        interaction.guild?.channels.cache.get(tempMusic!.channelId)?.delete();

        const channel = await createMusicChannel(interaction.guild!)
        return interaction.update({
            embeds: [new EmbedBuilder({
                color: Colors.NotQuiteBlack,
                image: { url: "https://cdn.discordapp.com/attachments/981163706878689280/989244874756853800/3.gif" }
            }),
            new EmbedBuilder({
                color: Colors.DarkButNotBlack,
                fields: [
                    {
                        name: "<:tick1:989179973657051197><:tick2:989179972373585951>\n<:tick3:989179970729435136><:tick4:989179968904904774>",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Successfully created",
                        value: `Awesome, all set up! Let's jam some music together. Just paste any song-, playlist link in ${channel} or search by typing`,
                        inline: true,
                    },
                    {
                        name: "\u200B",
                        value: "\u200B",
                        inline: true,
                    }
                ]
            })],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>({
                    components: [
                        new ButtonBuilder({
                            style: ButtonStyle.Link,
                            url: "https://arcin.solutions/",
                            label: "Learn more"
                        }),
                        new ButtonBuilder({
                            customId: "abort",
                            style: ButtonStyle.Success,
                            label: "Woohoo!",
                        })
                    ]
                })
            ]
        })
    }
}
