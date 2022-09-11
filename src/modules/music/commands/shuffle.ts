import { Discord, Slash } from "discordx";
import { CommandInteraction } from 'discord.js';
import { music } from './../api/index';
import { EmbedBuilder } from 'discord.js';
import { Colors } from 'discord.js';
import { BetterQueue } from './../api/structures';
import { Category } from "@discordx/utilities";


@Discord()
@Category("Music")
class Shuffle {
    @Slash({ name: "shuffle", description: "Shuffle the current queue" })
    async shuffle(interaction: CommandInteraction) {
        const player = music.players.get(interaction.guildId!);

        if (!player) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if at least **one** song is currently Playing.',
                    footer: { text: 'made by arcin with ❤️' },
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
                    footer: { text: 'made by arcin with ❤️' },
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
                footer: { text: 'made by arcin with ❤️' },
                color: Colors.DarkGreen
            })]
        });
    }
}