import { Discord, Slash } from "discordx";
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index.js';
import { EmbedBuilder } from 'discord.js';
import { Colors } from 'discord.js';
import { BetterQueue } from './../api/structures.js';
import { Category } from "@discordx/utilities";


@Discord()
@Category("Music")
class Shuffle {
    @Slash({ name: "shuffle", description: "Shuffle the current queue" })
    async shuffle(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true
        })

        const player = music.players.get(interaction.guildId!);

        if (!player) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if at least **one** song is currently Playing.',
                    color: Colors.DarkRed
                })]
            });
        }

        const queue = player.queue as BetterQueue;

        if (!queue) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Song in Queue',
                    description: 'please use this Command only if at least **one** song is in the queue.',
                    color: Colors.DarkRed
                })]
            });
        };

        queue.shuffle();
        music.emit('queueShuffled', player);

        return interaction.editReply({
            embeds: [new EmbedBuilder({
                title: 'Shuffled',
                description: `Shuffled the current queue`,
                color: Colors.DarkGreen
            })]
        });
    }
}