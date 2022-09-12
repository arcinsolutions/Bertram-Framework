import { Category, EnumChoice } from "@discordx/utilities";
import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice } from "discordx";
import { music } from './../api/index';

enum mode {
    none = "0",
    Track = "1",
    Queue = "2",
}

@Discord()
@Category("Music")
class Loop {
    @Slash({ name: "loop", description: "Loop the current song or queue" })
    async loop(@SlashChoice(...EnumChoice(mode)) mode :string, interaction: CommandInteraction) {
        const player = music.players.get(interaction.guildId!);

        if (!player) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if a is currently being played.',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        if (mode === "0") {
            player.setTrackLoop(false);
            player.setQueueLoop(false);
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Disabled',
                    description: 'Loop has been disabled',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkGreen
                })]
            });
        }

        if (mode === "1") {
            player.setTrackLoop(true);
            player.setQueueLoop(false);
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Enabled',
                    description: 'Loop has been enabled for the current track',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkGreen
                })]
            });
        }

        if (mode === "2") {
            player.setTrackLoop(false);
            player.setQueueLoop(true);
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Enabled',
                    description: 'Loop has been enabled for the current queue',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkGreen
                })]
            });
        }

    }
}