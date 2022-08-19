import { Category } from "@discordx/utilities";
import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { music, play } from './../api/index';


@Discord()
@Category("Music")
class Skip {
    @Slash({ name: "skip", description: "Skip the current Song" })
    async skip(@SlashOption({ name: "amount", description: "let you skip a specific amount of Songs", required: false }) amount: number, interaction: CommandInteraction) {
        let player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: "No active Player...",
                    color: Colors.DarkRed
                })]
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size == 0)) {
            player.skip();
            interaction.reply({
                embeds: [new EmbedBuilder({
                    description: "No Songs in Queue, Player will get destroyed in 5 Seconds if you dont request a Song!",
                    color: Colors.DarkGreen
                })]
            })
            return setTimeout(() => {
                player = music.players.get(interaction.guild!.id);

                if (player?.current != null || player?.queue.size! > 0) {
                    return interaction.deleteReply();
                }
                else {
                    music.emit("stop", player);
                    interaction.editReply({
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

        player.skip(amount);

        interaction.reply({
            embeds: [new EmbedBuilder({
                description: "Song skiped!",
                color: Colors.DarkGreen
            })],
            ephemeral: true
        })
    }

}