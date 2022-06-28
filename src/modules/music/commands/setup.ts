import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, ButtonComponent } from "discordx";
import { createMusicChannel, musicGuilds } from "../api";
import { getGuild } from "../../core/database";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {
        await interaction.deferReply({
            fetchReply: true
        })

        const tempMusic = musicGuilds.get(interaction.guild!.id);

        if (interaction.guild!.channels.cache.get(tempMusic[0]) === undefined) {
            const channel = await createMusicChannel(interaction.guild!);
            return interaction.editReply({
                embeds: [new MessageEmbed({
                    color: "#2F3136",
                    image: { url: "https://cdn.discordapp.com/attachments/981163706878689280/989244874756853800/3.gif" }
                }),
                new MessageEmbed({
                    color: "DEFAULT",
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
                    new MessageActionRow({
                        components: [
                            new MessageButton({
                                customId: "abort",
                                style: "SUCCESS",
                                label: "Woohoo!",
                            })
                        ]
                    })
                ]
            })
        }

        return await interaction.editReply({
            embeds: [new MessageEmbed({
                color: "#2F3136",
                image: { url: "https://cdn.discordapp.com/attachments/934031298119475271/989234099216601118/1.gif" }
            }),
            new MessageEmbed({
                color: "#ED4245",
                fields: [
                    {
                        name: "<:help1:989179967130726480><:help2:989179965209735188>\n<:help3:989179963607486524><:help4:989179961917186108>",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Channel creation",
                        value: `There already exists a channel on this server <#${tempMusic[0]}>, but you can create a new one at anytime.`,
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
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "abort",
                            style: "SECONDARY",
                            emoji: "922932409668874290",
                            label: "Cancel",
                        }),
                        new MessageButton({
                            customId: "create",
                            style: "DANGER",
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
        interaction.guild?.channels.cache.get(tempMusic[0])?.delete();

        const channel = await createMusicChannel(interaction.guild!)
        return interaction.update({
            embeds: [new MessageEmbed({
                color: "#2F3136",
                image: { url: "https://cdn.discordapp.com/attachments/981163706878689280/989244874756853800/3.gif" }
            }),
            new MessageEmbed({
                color: "#45C16C",
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
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            style: "LINK",
                            url: "https://arcin.solutions/",
                            label: "Learn more"
                        }),
                        new MessageButton({
                            customId: "abort",
                            style: "SUCCESS",
                            label: "Woohoo!",
                        })
                    ]
                })
            ]
        })
    }
}
