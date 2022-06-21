import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageActionRow, MessageButton, ButtonInteraction } from "discord.js";
import { Discord, Slash, ButtonComponent } from "discordx";
import { Guild as GuildEntity } from "../../core/database/entities/guild"
import { Guild } from "discord.js";

@Discord()
@Category("Music")
class Setup {
    @Slash("setup", { description: "Create a song-requests channel" })
    async setup(interaction: CommandInteraction) {
        await interaction.deferReply({
            fetchReply: true
        })

        const dbGuild = await this.getGuild(interaction.guild.id);

        if (interaction.guild.channels.cache.get(dbGuild?.channelId) === undefined) {
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

    async createChannel(guild: Guild) {
        const channel = await guild.channels.create('song-requests', {
            type: "text",
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: ["VIEW_CHANNEL"],
                },
            ],
        });

        await GuildEntity.createQueryBuilder()
            .insert()
            .values({
                guildId: guild.id,
                guildName: guild.name,
                channelId: channel.id
            })
            .orUpdate(["guildID", "guildName", "channelId"])
            .execute();

        channel.send("Hallo!")

        return channel;
    }

    async getGuild(guildId: string) {
        return (await GuildEntity.findOneBy({ guildId: guildId }))
    }
}
