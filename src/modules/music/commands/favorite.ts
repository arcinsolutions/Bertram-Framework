import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { CommandInteraction, EmbedBuilder, Colors, ButtonBuilder } from 'discord.js';
import { core } from "./../../../core/index.js";
import { Member } from "src/core/database/entities/member.js";
import { addFavoriteToMember, music } from "../api/index.js";
import { music_FavoriteButtons } from "../api/buttons.js";

@Discord()
@Category("Music")
class Favorite {
    @Slash({ name: "favorite", description: "let you add the Current song to your Favorite songs." })
    async favorite(interaction: CommandInteraction) {
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
}