import { Pagination, PaginationItem, PaginationType } from "@discordx/pagination";
import { Category } from "@discordx/utilities";
import { ButtonStyle, Colors, CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import { core } from "src/core/index.js";
import { music_AddFavoritesToQueue_Buttons } from "../api/buttons.js";
import { getFavoritesFromMember, music } from "../api/index.js";


@Discord()
@Category('Music')
class Favorites {
    @Slash({ name: 'favorites', description: 'a list of all your favorite songs.' })
    async favorites(interaction: CommandInteraction) {
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        })
        const favorites = await getFavoritesFromMember(interaction.member?.user.id!);

        if (favorites == null)
            return await interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: 'you have no favorites yet.',
                    color: Colors.DarkRed
                })]
            })

        let extFavorites: Array<{ label: string, link: string, index: number }> = [];

        for (let index = 0; index < favorites.length; index++) {
            const song = await music.search(favorites[index])

            if (song.loadType != "TRACK_LOADED")
                return await interaction.editReply({
                    embeds: [new EmbedBuilder({
                        description: 'something went wrong while loading your favorites.',
                        color: Colors.DarkRed
                    })]
                })

            const title = `${song.tracks[0].title + ' - ' + song.tracks[0].author.replace('- Topic', '')}`;

            extFavorites.push({ label: title, link: favorites[index], index: index});
        }

        const timeoutEmbed = new EmbedBuilder({
            title: 'Embed expired',
            description: `If you want to see all our favorites, please use the </favorites:${interaction.commandId}> command once again.`,
            color: Colors.DarkGold
        })

        const pagination = new Pagination(interaction, await GeneratePages(extFavorites), {
            onTimeout: () => interaction.editReply({ embeds: [timeoutEmbed], components: [] }),
            start: {
                label: "⏮️",
                style: ButtonStyle.Secondary,
            },
            end: {
                label: '⏭️',
                style: ButtonStyle.Secondary
            },
            next: {
                label: '▶️',
                style: ButtonStyle.Secondary
            },
            previous: {
                label: '◀️',
                style: ButtonStyle.Secondary
            },
            type: PaginationType.Button,
            time: 5 * 10000,
            ephemeral: true,
        });

        try {
            await pagination.send()
        } catch (error) {
            interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: 'looks like your favorites are not available yet.',
                    description: '**Please try again later.**',
                    color: Colors.DarkGold
                })],
                components: []
            })
            console.warn('\x1b[31m%s\x1b[0m', error);
        }

    }

}

async function GeneratePages(favorites: Array<{ label: string, link: string, index: number }>): Promise<PaginationItem[]> {
    const tmpFavorites: Array<{ label: string; value: string }> = favorites.map(favorite => {return { label: favorite.label, value: favorite.link }});

    const pages = Array.from({ length: Math.ceil(favorites.length / 25) }, (_, i) => i * 25).map(begin => favorites.slice(begin, begin + 25));

    return pages.map((page) => {
        return {
            embeds: [new EmbedBuilder({
                title: 'your Favorite',
                description: page.map((favorite) => `${favorite.index + 1}. [${favorite.label}](${favorite.link})`).join('\n'),
                footer: { text: "Page " + (pages.indexOf(page) + 1) + " of " + pages.length },
                color: Colors.DarkGreen
            })],
            components: [music_AddFavoritesToQueue_Buttons(tmpFavorites)]
        };
    });
}