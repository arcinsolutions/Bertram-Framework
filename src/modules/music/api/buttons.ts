import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, GuildMember, MessageActionRowComponentBuilder } from "discord.js";
import { ButtonComponent, Discord, Guard } from "discordx";
import { updateQueueEmbed } from "./embed.js";
import { music } from './index.js';
import { BetterQueue } from "./structures.js";

export const music_Buttons = (disabled?: boolean, playerPaused?: Boolean, looped?: "Track" | "Queue") => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>(
        {
            components: [
                new ButtonBuilder({
                    customId: "music_playpause",
                    emoji: playerPaused ? "▶️" : "⏸",
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
                    customId: "music_loop",
                    emoji: looped === "Track" ? "🔂" : "",
                    label: typeof looped === "undefined" ? "Loop disabled" : "",
                    style: ButtonStyle.Secondary,
                    disabled
                }),
            ]
        }
    )
}

export const music_Buttons2 = (disabled?: boolean, url?: string) => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>(
        {
            components: [
                new ButtonBuilder({
                    customId: "music_favorite",
                    emoji: '⭐',
                    style: ButtonStyle.Secondary,
                    disabled
                }),
                new ButtonBuilder({
                    url: url,
                    emoji: "🔗",
                    style: ButtonStyle.Link,
                    disabled: !!(typeof url === 'undefined' || disabled)
                })
            ]
        }
    )
}

@Discord()
class Buttons {
    @ButtonComponent({ id: "music_stop" })
    async stop(interaction: ButtonInteraction) {
        const player = music.players.get(interaction.guild!.id);
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

        music.emit("stop", player)

        await interaction.deferUpdate();
        return interaction.channel!.send({
            embeds: [new EmbedBuilder({
                description: ":white_check_mark: Player Stopped and Destroyed!",
                color: Colors.DarkGreen
            })]
        })
    }

    @ButtonComponent({ id: "music_playpause" })
    @Guard(
        RateLimit(TIME_UNIT.seconds, 3, {
            ephemeral: true,
            message: "You can only Pause or Play once every **3 seconds!**",
            rateValue: 1
        })
    )
    async playPause(interaction: ButtonInteraction) {
        const player = music.players.get(interaction.guild!.id);
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

        player.pause(!player.paused);
        music.emit('songPause', player);
        await interaction.deferUpdate();
        return interaction.channel!.send({
            embeds: [new EmbedBuilder({
                description: !player.paused ? ":arrow_forward: **Resumed** the current Song!" : ":pause_button: **Paused** the current Song!",
                color: Colors.DarkGreen
            })]
        })
    }

    @ButtonComponent({ id: "music_skip" })
    @Guard(
        RateLimit(TIME_UNIT.seconds, 3, {
            ephemeral: true,
            message: "You can only skip once every **3 seconds**!",
            rateValue: 1
        })
    )
    async skip(interaction: ButtonInteraction) {
        let player = music.players.get(interaction.guild!.id);
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
        
        player.skip();
        await interaction.deferUpdate();

        if (player.current || player.trackRepeat || player.queueRepeat) {
            return interaction.channel!.send({
                embeds: [new EmbedBuilder({
                    description: "Song skiped!",
                    color: Colors.DarkGreen
                })]
            })
        }
    }

    @ButtonComponent({ id: "music_shuffle" })
    @Guard(
        RateLimit(TIME_UNIT.seconds, 10, {
            ephemeral: true,
            message: "You can only shuffle once every **10 seconds!**",
            rateValue: 1
        })
    )
    async shuffle(interaction: ButtonInteraction) {
        let player = music.players.get(interaction.guild!.id);
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
            queue.shuffle();
            
            await interaction.deferUpdate().then(() => {updateQueueEmbed(player!)});
            return interaction.channel!.send({
                embeds: [new EmbedBuilder({
                    description: ":white_check_mark: Queue shuffled!",
                    color: Colors.DarkGreen
                })]
            })
        }
    }

}