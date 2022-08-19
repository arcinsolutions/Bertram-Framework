import { ButtonInteraction, Colors, EmbedBuilder, GuildMember } from "discord.js";
import { ButtonComponent, Discord, Guard } from "discordx";
import { music } from './index';
import { BetterQueue } from "./structures";

@Discord()
class Buttons {
    @ButtonComponent({ id: "music_stop" })
    async stop(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: ":x: No active found!",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        await music.emit("stop", player)

        interaction.followUp({
            embeds: [new EmbedBuilder({
                description: ":white_check_mark: Player Stopped and Destroyed!",
                color: Colors.DarkGreen
            })],
            components: []
        })
    }

    @ButtonComponent({ id: "music_playpause" })
    async playPause(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: ":x: No active Player found!",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        await player.pause(!player.paused);
        return interaction.followUp({
            embeds: [new EmbedBuilder({
                description: 'Player' + (player.paused ? "**paused**" : "**unpaused**") + '!',
                color: Colors.DarkGreen
            })]
        })
    }

    @ButtonComponent({ id: "music_skip" })
    async skip(interaction: ButtonInteraction) {
        let player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: "No active Player...",
                    color: Colors.DarkRed
                })]
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size == 0)) {
            player.skip();
            interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: "No Songs in Queue, Player will get destroyed in 5 Seconds if you dont request a Song!",
                    color: Colors.DarkRed
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

        player.skip();

        interaction.followUp({
            embeds: [new EmbedBuilder({
                description: "Song skiped!",
                color: Colors.DarkGreen
            })],
            ephemeral: true
        })
    }

    @ButtonComponent({ id: "music_shuffle" })
    async shuffle(interaction: ButtonInteraction) {
        let player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: "No active Player...",
                    color: Colors.DarkRed
                })]
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.followUp({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size <= 1)) {
            interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: "There are no or not enough songs to shuffle!",
                    color: Colors.DarkRed
                })]
            })
        }
        else {
            const queue = player.queue as BetterQueue;
            await queue.shuffle();

            return await interaction.followUp({
                embeds: [new EmbedBuilder({
                    description: "queue Shuffled!",
                    color: Colors.DarkGreen
                })]
            })
        }
    }

    //#####################################################################################################################
    //#####################################################################################################################
    //#####################################################################################################################
    //#####################################################################################################################

}