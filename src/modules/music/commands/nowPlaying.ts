import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index';

@Discord()
@Category("Music")
class NowPlaying {
    @Slash({ name: "nowplaying", description: "See what is currently being played." })
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
                embeds: [new EmbedBuilder({
                    description: `:x: no active Player!`,
                    color: Colors.DarkRed
                })]
            })

        return interaction.editReply({
            embeds: [new EmbedBuilder({
                description: `<:musicnote:930887306045435934> **Now Playing:** ${currTrack.title.includes(currTrack.author) ? currTrack.title : currTrack.title + " - " + currTrack.author}`,
                color: Colors.DarkGreen
            })],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>({
                    components: [
                        new ButtonBuilder({
                            customId: "music_stop",
                            style: ButtonStyle.Secondary,
                            emoji: "<:stop:930538012805333122>",
                            disabled: (player ? false : true)
                        }),
                        new ButtonBuilder({
                            customId: "music_playpause",
                            emoji: "<:playpause:930535466908934144>",
                            style: ButtonStyle.Secondary,
                            disabled: (player ? false : true)
                        }),
                        new ButtonBuilder({
                            customId: "music_skip",
                            emoji: "<:skip:930535779887874110>",
                            style: ButtonStyle.Secondary,
                            disabled: (player ? false : true)
                        }),
                        new ButtonBuilder({
                            customId: "music_shuffle",
                            emoji: "<:shuffle:930534110185783386>",
                            style: ButtonStyle.Secondary,
                            disabled: (player ? false : true)
                        })
                    ]
                })
            ]
        })
    }
}