import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { music, play } from './../api/index.js';


@Discord()
@Category("Music")
class Skip {
    @Slash({ name: "skip", description: "Skip the current Song" })
    async skip(
        @SlashOption({ name: "amount", description: "let you skip a specific amount of Songs", required: false, type: ApplicationCommandOptionType.Integer })
        amount: number,

        interaction: CommandInteraction) {
        let player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: "No active Player...",
                    color: Colors.DarkRed
                })]
            })

        if (!amount) amount = 1;
        player.skip(amount);

        if (player.current && player.queue && player.queue.size > 0 || player.trackRepeat || player.queueRepeat) {
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: "Song skiped!",
                    color: Colors.DarkGreen
                })],
                ephemeral: true
            })

        }

        interaction.reply({
            embeds: [new EmbedBuilder({
                description: "No Songs in Queue, Player will get destroyed in 5 Seconds if you dont request a Song!",
                color: Colors.DarkGreen
            })]
        })
        return setTimeout(() => {
            player = music.players.get(interaction.guild!.id);
            if (player === undefined) return;

            if (player?.current != null || player?.queue.size! > 0) {
                return interaction.deleteReply().catch(() => {});
            }
            else {
                music.emit("stop", player);
                interaction.channel!.send({
                    embeds: [new EmbedBuilder({
                        description: "Player Stopped and Destroyed!",
                        color: Colors.DarkGreen
                    })]
                }).then(() => {
                    player?.destroy();
                })
                return;
            }
        }, 5000);
    }

}