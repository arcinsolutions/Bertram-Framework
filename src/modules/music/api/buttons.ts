import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, GuildMember, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Guard } from "discordx";
import { music } from './index';
import { BetterQueue } from "./structures";

export const music_Buttons = (disabled?: boolean, url?: string) => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>(
        {
            components: [
                new ButtonBuilder({
                    customId: "music_playpause",
                    emoji: "⏯",
                    style: ButtonStyle.Secondary,
                    disabled
                }),
                new ButtonBuilder({
                    customId: "music_stop",
                    style: ButtonStyle.Secondary,
                    emoji: "⏹",
                    disabled
                }),
                new ButtonBuilder({
                    customId: "music_skip",
                    emoji: "⏭",
                    style: ButtonStyle.Secondary,
                    disabled
                }),
                new ButtonBuilder({
                    customId: "music_shuffle",
                    emoji: "🔀",
                    style: ButtonStyle.Secondary,
                    disabled
                }),
                new ButtonBuilder({
                    url: url,
                    emoji: "🔗",
                    style: ButtonStyle.Link,
                    disabled: (typeof url === 'undefined' || disabled) ? true : false
                })
            ]
        }
    )
}

@Discord()
class Buttons {
    @ButtonComponent("music_stop")
    async stop(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: No active found!",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        await music.emit("stop", player)

        interaction.reply({
            embeds: [new EmbedBuilder({
                description: ":white_check_mark: Player Stopped and Destroyed!",
                color: Colors.DarkGreen
            })],
            components: []
        })
    }

    @ButtonComponent("music_playpause")
    async playPause(interaction: ButtonInteraction) {
        const player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: No active Player found!",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: please join a voice channel first",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        await player.pause(!player.paused);
        return interaction.reply({
            embeds: [new EmbedBuilder({
                description: ':white_check_mark: Player' + (player.paused ? "**paused**" : "**unpaused**") + '!',
                color: Colors.DarkGreen
            })]
        })
    }

    @ButtonComponent("music_skip")
    async skip(interaction: ButtonInteraction) {
        let player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: No active Player...",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: please join a voice channel first",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size == 0)) {
            player.skip();
            interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":yellow_circle: **last Song skipped!**\nPlayer will get destroyed in 5 Seconds if you dont request a Song!",
                    color: Colors.DarkOrange
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
                            description: ":white_check_mark: Player Stopped and Destroyed!",
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

        interaction.reply({
            embeds: [new EmbedBuilder({
                description: "Song skiped!",
                color: Colors.DarkGreen
            })]
        })
    }

    @ButtonComponent("music_shuffle")
    async shuffle(interaction: ButtonInteraction) {
        let player = await music.players.get(interaction.guild!.id);
        if (!player)
            return interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: No active Player...",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })

        if (!(interaction.member as GuildMember)?.voice.channel)
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })],
                ephemeral: true
            })

        if ((typeof player.queue == 'undefined') || (player.queue.size <= 1)) {
            interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":x: There are or not enough songs to shuffle 😉",
                    color: Colors.DarkRed
                })],
                ephemeral: true
            })
        }
        else {
            const queue = player.queue as BetterQueue;
            await queue.shuffle();

            return await interaction.reply({
                embeds: [new EmbedBuilder({
                    description: ":white_check_mark: queue Shuffled!",
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