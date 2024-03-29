import { Category, EnumChoice } from "@discordx/utilities";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder, GuildMember, GuildPremiumTier } from "discord.js";
import { together } from "../api/index.js";

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
@Category("Fun")
class Together {
    @Slash({ name: "together", description: "Start a together session" })
    private async together(
        @SlashChoice(...EnumChoice(games))
        @SlashOption({name: 'game', description: 'The game you want to play', required: true, type: ApplicationCommandOptionType.String})
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
                    color: Colors.DarkRed
                })]
            });
        }

        if (!user.voice.channel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: ':x: | You need to be in a voice channel to use this command',
                    color: Colors.DarkRed
                })]
            });
        }

        if (guild.premiumTier == GuildPremiumTier.None && !((game == games.youtube) || (game == games.checkers))) {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    description: '**:x: | You need to be in a server with a premium tier to play games other than YouTube or Checkers**',
                    color: Colors.DarkRed
                })]
            });
        }

        together.createTogetherCode(user.voice.channel.id, game).then(invite => {
            return interaction.editReply({
                embeds: [new EmbedBuilder({
                    title: `${game} Together`,
                    description: `Click [here](${invite.code}) to join the together session\nor this Link: ${invite.code}`,
                    color: Colors.DarkGreen
                })]
            });
        });
    }
}