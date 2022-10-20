import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    GuildMember,
    MessageActionRowComponentBuilder,
    SelectMenuBuilder,
    SelectMenuInteraction,
    User
} from "discord.js";
import { ButtonComponent, Discord, Guard, SelectMenuComponent } from "discordx";
import { updateQueueEmbed } from "./embed.js";
import { addFavoriteToMember, addSongsToQueue, addSongToPlayer, music, musicLoop, play, removeFavoriteFromMember } from './index.js';
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
                    emoji: looped === "Track" ? "🔂" : looped === "Queue" ? "🔁" : "",
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

export const music_FavoriteButtons = () => {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>(
        {
            components: [
                new ButtonBuilder({
                    customId: "favorite_remove",
                    emoji: '👍',
                    style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                    customId: "removeEphermalMessage",
                    emoji: '👎',
                    style: ButtonStyle.Secondary,
                }),
            ]
        }
    )
}

export const music_AddFavoritesToQueue_Buttons = (favorites: Array<{ label: string, value: string }>) => {
    return new ActionRowBuilder<SelectMenuBuilder>(
        {
            components: [
                new SelectMenuBuilder({
                    custom_id: 'AddFavoritesToQueue', placeholder: 'the Favorites you want to add', min_values: 1, max_values: (favorites.length <= 25) ? favorites.length : 25, options: favorites.filter((_, index) => index <= 24)
                }),
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
        } else {
            const queue = player.queue as BetterQueue;
            queue.shuffle();

            await interaction.deferUpdate().then(() => {
                updateQueueEmbed(player!)
            });
            return interaction.channel!.send({
                embeds: [new EmbedBuilder({
                    description: ":white_check_mark: Queue shuffled!",
                    color: Colors.DarkGreen
                })]
            })
        }
    }

    @ButtonComponent({ id: "music_loop" })
    @Guard(
        RateLimit(TIME_UNIT.seconds, 3, {
            ephemeral: true,
            message: "You can only loop once every **3 seconds!**",
            rateValue: 1
        })
    )
    async loop(interaction: ButtonInteraction) {
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

        const replyEmbed = musicLoop(interaction.guild?.id!, player.trackRepeat ? "queue" : player.queueRepeat ? "none" : "track");

        if (!replyEmbed) {
            await interaction.deferUpdate();
            return interaction.channel!.send({
                embeds: [replyEmbed]
            })
        }

        await interaction.deferUpdate();
    }

    @ButtonComponent({ id: 'music_favorite' })
    async favorite(interaction: ButtonInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })

        const player = music.players.get(interaction.guild?.id!);

        if (!player)
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    color: Colors.DarkRed,
                    description: 'no active Player found.'
                })]
            })

        const curr = player.current;

        if (curr == null)
            return await interaction.editReply({
                embeds: [new EmbedBuilder({
                    color: Colors.DarkRed,
                    description: 'no Song is being played.'
                })]
            })

        if (!await addFavoriteToMember(interaction.member?.user.id!, curr.uri))
            return await interaction.editReply({
                embeds: [new EmbedBuilder({
                    color: Colors.DarkRed,
                    description: `the current Song is already in you favorites.\n do you want to Remove it?`
                })],
                components: [music_FavoriteButtons()]
            })

        return await interaction.editReply({
            embeds: [new EmbedBuilder({
                color: Colors.DarkGreen,
                description: `Song succesfully added to your Favorites.`
            })]
        })
    }

    @ButtonComponent({ id: 'favorite_remove' })
    async favoriteRemove(interaction: ButtonInteraction) {
        const curr = music.players.get(interaction.guild?.id!)?.current;

        if (await removeFavoriteFromMember(interaction.member?.user.id!, curr?.uri!))
            await interaction.update({
                embeds: [new EmbedBuilder({
                    description: '**Favorite removed succesfully.**',
                    color: Colors.DarkGreen
                })],
                components: []
            }).then(() => {
                setTimeout(async () => {
                    try {
                        return await interaction.message.delete();
                    } catch (_err) { }
                }, 10000)
            })
        else
            await interaction.update({
                embeds: [new EmbedBuilder({
                    description: '**Favorite could not be removed!**',
                    color: Colors.DarkRed
                })],
                components: []
            }).then(() => {
                setTimeout(async () => {
                    try {
                        return await interaction.message.delete();
                    } catch (_err) { }
                }, 10000)
            })
    }

    @ButtonComponent({ id: 'removeEphermalMessage' })
    async removeMessage(interaction: ButtonInteraction) {
        return await interaction.update({
            embeds: [new EmbedBuilder({
                description: '**Favorite not removed.**',
                color: Colors.DarkGreen
            })],
            components: []
        })
    }

    @SelectMenuComponent({ id: 'AddFavoritesToQueue' })
    async addFavoritesToQueue(interaction: SelectMenuInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })

        if ((interaction.member as GuildMember).voice.channel == null)
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder({
                        description: ":x: please join a voice channel first",
                        color: Colors.DarkRed
                    })
                ]
            })

        let player = music.players.get(interaction.guild?.id!);

        if (!player)
            try {
                player = music.players.get(interaction.guild!.id);
                if (!player) {
                    player = music.createPlayer({
                        guildId: interaction.guild!.id,
                        textChannelId: interaction.channel?.id,
                        voiceChannelId: (interaction.member as GuildMember).voice.channel!.id,
                        selfDeaf: true,
                        queue: new BetterQueue()
                    })
                    player.filters.setVolume(35);
                }
                await addSongToPlayer(interaction.values[0], (interaction.member as GuildMember).user, player)
            } catch (error) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder({
                            description: ":x: there is currently no node available, please try again later",
                            color: Colors.DarkRed
                        })
                    ]
                })
            }

        await addSongsToQueue(interaction.values.slice(0, 0), player, (interaction.member as GuildMember).displayName);
        // await addSongToPlayer(fav, interaction.user, player);

        if (!player.playing && player.queue.size !== 0)
            player.play();

        await updateQueueEmbed(player);

        return await interaction.update({
            embeds: [new EmbedBuilder({
                color: Colors.DarkGreen,
                description: `Favorites succesfully added to the Queue.`
            })],
        })
    }
}