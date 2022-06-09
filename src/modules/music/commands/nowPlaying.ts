import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { MessageEmbed } from 'discord.js';
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
                    description: `**no active Player!**`,
                    color: "DARK_RED"
                })]
            })

        return interaction.editReply({
            embeds: [new MessageEmbed({
                description: `${currTrack.title.includes(currTrack.author) ? currTrack.title : currTrack.title + "-" + currTrack.author}`,
                color: "DARK_GREEN"
            })]
        })

    }
}