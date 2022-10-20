import { Category, EnumChoice } from "@discordx/utilities";
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { updateMusicEmbedFooter } from "../api/embed.js";
import { music } from './../api/index.js';

enum mode {
    None = 'none',
    Track = 'track',
    Queue = 'queue',
}

@Discord()
@Category("Music")
class Loop {
    @Slash({ name: "loop", description: "Loop the current song or queue" })
    private async loop(
        @SlashChoice(...EnumChoice(mode))
        @SlashOption({
            name: "mode",
            description: "The mode to loop",
            required: true,
            type: ApplicationCommandOptionType.String
        })
        modeOption: string,
        interaction: CommandInteraction) {
        const player = music.players.get(interaction.guildId!);
        await interaction.deferReply({
            ephemeral: true
        })

        if (!player) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'No active Player',
                    description: 'please use this Command only if a is currently being played.',
                    color: Colors.DarkRed
                })]
            });
        }

        if (modeOption === mode.None) {
            player.setTrackLoop(false);
            player.setQueueLoop(false);
            updateMusicEmbedFooter(player);
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Disabled',
                    description: 'Loop has been disabled',
                    color: Colors.DarkGreen
                })]
            });
        }

        if (modeOption === mode.Track) {
            player.setTrackLoop(true);
            player.setQueueLoop(false);
            updateMusicEmbedFooter(player, { loop: 'Track' });
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Enabled',
                    description: 'Loop has been enabled for the current track',
                    color: Colors.DarkGreen
                })]
            });
        }

        if (modeOption === mode.Queue) {
            player.setTrackLoop(false);
            player.setQueueLoop(true);
            updateMusicEmbedFooter(player, { loop: 'Queue' });
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'Loop Enabled',
                    description: 'Loop has been enabled for the current queue',
                    color: Colors.DarkGreen
                })]
            });
        }

    }
}