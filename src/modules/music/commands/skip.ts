import { Category } from "@discordx/utilities";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { music, play } from './../api/index';


@Discord()
@Category("Music")
class Skip {
    @Slash("skip", { description: "Skip the current Song" })
    async skip(@SlashOption("amount", { description: "let you skip a specific amount of Songs", required: false }) amount: number, interaction: CommandInteraction) {
        let player = music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new MessageEmbed({
                    description: "No active Player...",
                    color: "DARK_RED"
                })]
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size == 0)) {
            player.skip();
            interaction.reply({
                embeds: [new MessageEmbed({
                    description: "No Songs in Queue, Player will get destroyed in 5 Seconds if you dont request a Song!",
                    color: "DARK_RED"
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
                        embeds: [new MessageEmbed({
                            description: "Player Stopped and Destroyed!",
                            color: "DARK_GREEN"
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
            embeds: [new MessageEmbed({
                description: "Song skiped!",
                color: "DARK_GREEN"
            })],
            ephemeral: true
        })
    }

}