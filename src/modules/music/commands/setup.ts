import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { Discord, Slash, ButtonComponent } from "discordx";
import { musicGuild } from "../database/entities/guild"
import { Guild as DiscordGuild } from "discord.js";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {
        await interaction.deferReply({
            fetchReply: true
        })

        if (!await this.hasChannel(interaction.guild!.id)) {
            const channel = await this.createChannel(interaction.guild);
            return interaction.editReply(`Channel created ${channel}`);
        }

        return interaction.editReply({
            content: "Möchtest du einen neuen Channel generieren?",
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "abort",
                            style: "SECONDARY",
                            label: "NE DOCH NICHT",
                        }),
                        new MessageButton({
                            customId: "create",
                            label: "MACH MA",
                            style: "SECONDARY",
                        })
                    ]
                })
            ]
        })
    }

    @ButtonComponent("abort")
    async abort(interaction: ButtonInteraction) {
        return interaction.message.delete().catch();
    }

    @ButtonComponent("create")
    async create(interaction: ButtonInteraction) {
        const channel = await this.createChannel(interaction.guild)
        return interaction.update({
            content: `JOO LÜPPT! ${channel}`,
            components: []
        });
    }

    async createChannel(guild: DiscordGuild) {
        const channel = await guild.channels.create('song-requests', {
            type: "text",
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: ["VIEW_CHANNEL"],
                },
            ],
        });

        await musicGuild.createQueryBuilder()
            .insert()
            .values({
                guildId: guild.id,
                guildName: guild.name,
                channelId: channel.id
            })
            .orUpdate(["guildID", "guildName", "channelId"])
            .execute();

        return channel;
    }

    async hasChannel(guildId: string) {
        return (await musicGuild.findOneBy({ guildId: guildId }) !== null)
    }
}
