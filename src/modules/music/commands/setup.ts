import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, ButtonComponent } from "discordx";
import { musicGuild as GuildEntity } from "../database/entities/guild"
import { createMusicChannel } from "../api";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {
        await interaction.deferReply({
            fetchReply: true
        })

        const dbGuild = await this.getGuild(interaction.guild!.id);

        if (interaction.guild!.channels.cache.get(dbGuild!.channelId) === undefined) {
            const channel = await createMusicChannel(interaction.guild!);
            return interaction.editReply({
                embeds: [new MessageEmbed({
                    color: "#45C16C",
                    fields: [
                        {
                            name: "<:tick1:989179973657051197><:tick2:989179972373585951>\n<:tick3:989179970729435136><:tick4:989179968904904774>",
                            value: "\u200B",
                            inline: true,
                        },
                        {
                            name: "Successfully created",
                            value:
                                `You're all set up! Ready to jam some music? Just paste any song-, playlist link or just search for anything in here ${channel}`,
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
                                label: "Finish",
                            })
                        ]
                    })
                ]
            })
        }

        return interaction.editReply({
            embeds: [new MessageEmbed({
                color: "#ED4245",
                fields: [
                    {
                        name: "<:help1:989179967130726480><:help2:989179965209735188>\n<:help3:989179963607486524><:help4:989179961917186108>",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Channel creation",
                        value:
                            `There already exists a channel on this server <#${dbGuild?.channelId}>\nBut you can create a new one at anytime.`,
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
        const dbGuild = await this.getGuild(interaction.guild!.id);
        interaction.guild?.channels.cache.get(String(dbGuild?.channelId))?.delete();

        const channel = await createMusicChannel(interaction.guild!)
        return interaction.update({
            embeds: [new MessageEmbed({
                color: "#45C16C",
                fields: [
                    {
                        name: "<:tick1:989179973657051197><:tick2:989179972373585951>\n<:tick3:989179970729435136><:tick4:989179968904904774>",
                        value: "\u200B",
                        inline: true,
                    },
                    {
                        name: "Successfully created",
                        value:
                            `Awesome, all set up! Now let's jam some music together.\nJust paste any link or name in here ${channel}`,
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
                            label: "Finish",
                        })
                    ]
                })
            ]
        })
    }

    async getGuild(guildId: string) {
        return (await GuildEntity.findOneBy({ guildId: guildId }))
    }
}
