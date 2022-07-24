import { Category, Description } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { Colors, EmbedBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { client } from "../../../golden";

@Discord()
@Category("Information")
class Stats {
    @Slash("stats")
    @Description("shows you a lot of stats how Golden performs...")
    async stats(interaction: CommandInteraction) {
        const embed = new EmbedBuilder();
        const startUsage = process.cpuUsage();

        const sent: any = await interaction.reply({
            embeds: [embed.setDescription(`**Pinging...**`).setColor(Colors.DarkRed)],
            fetchReply: true,
            ephemeral: true,
        })

        const now = Date.now();
        while (Date.now() - now < 500);

        let totalSeconds = 6000;

        if (client.uptime != null)
            totalSeconds = client.uptime / 1000;

        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        interaction.editReply({
            embeds: [
                new EmbedBuilder({
                    description: '',
                    color: Colors.DarkGreen,
                    fields: [
                        {
                            name: "Uptime",
                            value: `${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"
                                }, ${minutes} minute${minutes === 1 ? "" : "s"
                                } & ${seconds} second${seconds === 1 ? "" : "s"}`,
                        },
                        {
                            name: `Ping`,
                            value: `${sent.createdTimestamp - interaction.createdTimestamp
                                }ms`,
                            inline: true,
                        },
                        {
                            name: "Discord API Ping",
                            value: `${client.ws.ping}ms`,
                            inline: true,
                        },
                        {
                            name: "\u200B",
                            value: `\u200B`,
                            inline: true,
                        },
                        {
                            name: "CPU usage",
                            value: `${process.cpuUsage(startUsage).user / 100000} %`,
                            inline: true,
                        },
                        {
                            name: "RAM usage",
                            value: `${Math.round(
                                (process.memoryUsage().heapUsed / 1024 / 1024) * 100
                            ) / 100
                                }MB\n`,
                            inline: true,
                        },
                        {
                            name: "\u200B",
                            value: `\u200B`,
                            inline: true,
                        },
                        {
                            name: "Servers",
                            value: `${client.guilds.cache.size}`,
                            inline: true,
                        },
                        {
                            name: "Users",
                            value: `${client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)}`,
                            inline: true,
                        }
                    ]
                })
            ]
        });
    }
}