import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash } from "discordx";
import { music } from "../api";

@Discord()
@Category("Music")
class Queue {
    @Slash("queue", { description: "Show the current queue" })
    async queue(interaction: CommandInteraction) {
        const player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [
                    new MessageEmbed({
                        description: ":x: No player found!",
                        color: "DARK_RED"
                    })
                ]
            })
        const queue = player.queue;

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    title: "Queue",
                    description: queue.map((song, index) => `${index + 1}. ${song.title}`).join("\n"),
                    color: "DARK_GREEN"
                })
            ],
            ephemeral: true
        })
    }
}