import { Discord, Slash, SlashOption } from "discordx";
import { EmbedBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index';
import { Colors } from 'discord.js';
import { Category } from "@discordx/utilities";

@Discord()
@Category("Music")
class Seek {
    @Slash({ name: "seek", description: "Seek to a specific time in the current song" })
    async seek(@SlashOption({ description: "the millisecond you want too skip to.", name: "time" }) ms: number, interaction: CommandInteraction) {
        const player = music.players.get(interaction.guildId!);

        if (!player)
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if a Song is currently Playing.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });

        const track = player.current;

        if (!track) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Track',
                    description: 'please use this Command only if a Song is currently Playing.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        };

        if (ms > track.duration) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Invalid Time',
                    description: 'please use a time that is smaller than the duration of the current track.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        };

        player.seek(ms);

        return interaction.editReply({
            embeds: [new EmbedBuilder({
                title: 'Seeked',
                description: `Seeked to ${ms}ms.`,
                footer: { text: 'made by arcin with ❤️' },
                color: Colors.DarkGreen
            })]
        });
    }
}