import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index.js';
import { Colors } from 'discord.js';
import { Category } from "@discordx/utilities";
import { time } from "console";

@Discord()
@Category("Music")
class Seek {
    @Slash({ name: "seek", description: "Seek to a specific time in the current song" })
    async seek(
        @SlashOption({ description: "the timestamp you want too skip to.", name: "time", type: ApplicationCommandOptionType.String, required: true }) 
        timestamp: string, 
        
        interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })

        const player = music.players.get(interaction.guildId!);

        if (!player)
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if a Song is currently Playing.',
                    color: Colors.DarkRed
                })]
            });

        const track = player.current;

        if (!track) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Track',
                    description: 'please use this Command only if a Song is currently Playing.',
                    color: Colors.DarkRed
                })]
            });
        };

        const ms = Number(timestamp.split(':')[0]) * 60 * 1000 + Number(timestamp.split(':')[1]) * 1000;

        if (!ms) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Not a valid timestamp',
                    description: 'please enter a timestamp with the following format mm:ss',
                    color: Colors.DarkRed
                })]
            });
        };

        if (ms > track.duration) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Invalid Time',
                    description: 'please use a time that is smaller than the duration of the current track.',
                    color: Colors.DarkRed
                })]
            });
        };

        player.seek(ms);

        return interaction.editReply({
            embeds: [new EmbedBuilder({
                title: 'Seeked',
                description: `Seeked to ${timestamp}.`,
                color: Colors.DarkGreen
            })]
        });
    }
}