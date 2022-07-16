import { ButtonInteraction, MessageEmbed } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { music } from './index';

@Discord()
class Buttons {
    @ButtonComponent("music_stop")
    async stop(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new MessageEmbed({
                    description: ":x: No active found!",
                    color: "DARK_RED"
                })],
                ephemeral: true
            })

        await music.emit("stop", player)

        interaction.reply({
            embeds: [new MessageEmbed({
                description: ":white_check_mark: Player Stopped and Destroyed!",
                color: "DARK_GREEN"
            })],
            components: []
        })
    }

    @ButtonComponent("music_playpause")
    async playPause(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new MessageEmbed({
                    description: ":x: No active Player found!",
                    color: "DARK_RED"
                })],
                ephemeral: true
            })

        await player.pause(!player.paused);
        return interaction.reply({
            embeds: [new MessageEmbed({
                description: 'Player' + (player.paused ? "**paused**" : "**unpaused**") + '!',
                color: "DARK_GREEN"
            })]
        })
    }

    @ButtonComponent("music_skip")
    async skip(interaction: ButtonInteraction) {
        let player = await music.players.get(interaction.guild!.id);
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
                    interaction.reply({
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

        player.skip();

        interaction.reply({
            embeds: [new MessageEmbed({
                description: "Song skiped!",
                color: "DARK_GREEN"
            })],
            ephemeral: true
        })
    }
}