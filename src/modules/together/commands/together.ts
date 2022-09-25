import { Category, EnumChoice } from "@discordx/utilities";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { Colors, CommandInteraction, EmbedBuilder, GuildMember, GuildPremiumTier } from "discord.js";
import { together } from "../api";

enum games {
    youtube = 'Youtube',
    poker = 'Poker',
    betrayal = 'Betrayal',
    fishing = 'Fishing',
    chess = 'Chess',
    lettertile = 'Lettertile',
    wordsnack = 'Wordsnack',
    doodlecrew = 'Doodlecrew',
    awkword = 'Awkword',
    spellcast = 'Spellcast',
    checkers = 'Checkers',
    puttparty = 'Puttparty',
    sketchheads = 'Sketchheads',
    ocho = 'Ocho',
    land = 'Land',
    meme = 'Meme',
    askaway = 'Askaway',
    bobble = 'Bobble'
}

@Discord()
@Category("Together")
class Together {
    @Slash({ name: "together", description: "Start a together session" })
    private async together(
        @SlashChoice(...EnumChoice(games))
        @SlashOption({ description: "The game to play", required: true, name: "game" })
        game: string,

        interaction: CommandInteraction
    ) {
        await interaction.deferReply();
        const user = interaction.member! as GuildMember;
        const guild = interaction.guild;

        if (!guild) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: '**:x: please use this Command only on a Guild!**',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        if (!user.voice.channel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: ':x: | You need to be in a voice channel to use this command',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        if (guild.premiumTier == GuildPremiumTier.None && !((game == games.youtube) || (game == games.checkers))) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: '**:x: | You need to be in a server with a premium tier to play games other than YouTube or Checkers**',
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkRed
                })]
            });
        }

        together.createTogetherCode(user.voice.channel.id, game).then(invite => {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: `${game} Together`,
                    description: `Click [here](${invite.code}) to join the together session\nor this Link: ${invite.code}`,
                    footer: { text: 'made by arcin with ❤️' },
                    color: Colors.DarkGreen
                })]
            });
        });
    }
}