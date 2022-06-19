import { Category } from "@discordx/utilities";
import { ButtonComponent, Discord, Slash } from "discordx";
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index';

@Discord()
@Category("Music")
class NowPlaying {
    @Slash("nowplaying", { description: "See what is currently being played." })
    async play(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })

        //Connect to the Voice Channel
        const player = await music.players.get(interaction.guild!.id);
        const currTrack = player?.current;

        if (!currTrack)
            return interaction.editReply({
                embeds: [new MessageEmbed({
                    description: `:x: no active Player!`,
                    color: "DARK_RED"
                })]
            })

        return interaction.editReply({
            embeds: [new MessageEmbed({
                description: `<:musicnote:930887306045435934> **Now Playing:** ${currTrack.title.includes(currTrack.author) ? currTrack.title : currTrack.title + " - " + currTrack.author}`,
                color: "DARK_GREEN"
            })],
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: "stop",
                            style: "SECONDARY",
                            emoji: "<:stop:930538012805333122>",
                            disabled: (player ? false : true)
                        }),
                        new MessageButton({
                            customId: "playpause",
                            emoji: "<:playpause:930535466908934144>",
                            style: "SECONDARY",
                            disabled: (player ? false : true)
                        }),
                        new MessageButton({
                            customId: "skip",
                            emoji: "<:skip:930535779887874110>",
                            style: "SECONDARY",
                            disabled: (player ? false : true)
                        }),
                        new MessageButton({
                            customId: "shuffle",
                            emoji: "<:shuffle:930534110185783386>",
                            style: "SECONDARY",
                            disabled: (player ? false : true)
                        })
                    ]
                })
            ]
        })
    }

    @ButtonComponent("stop")
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
        interaction.update({
            embeds: [new MessageEmbed({
                description: ":white_check_mark: Player Stopped and Destroyed!",
                color: "DARK_RED"
            })],
            components: []
        })
        return player.destroy();
    }
}