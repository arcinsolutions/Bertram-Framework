import { Category } from "@discordx/utilities";
import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import { DefaultQueue } from "vulkava";
import { music } from "../api";
import { BetterQueue } from './../api/structures';

@Discord()
@Category("Music")
class Queue {
    @Slash("queue", { description: "Show the current queue" })
    async queue(interaction: CommandInteraction) {
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
                    description: queue.getAllSongDetails(),
                    color: Colors.DarkGreen
                })
            ],
            ephemeral: true
        })
    }
}