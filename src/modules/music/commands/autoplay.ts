// import { Discord, Slash } from "discordx";
// import { Colors, CommandInteraction, EmbedBuilder } from 'discord.js';
// import { music } from "../api/index.js";
// import { BetterTrack } from "../api/structures.js";
// import { updateMusicEmbedFooter } from "../api/embed.js";
// import { Category } from "@discordx/utilities";

// @Discord()
// @Category("Music")
// class Autoplay {
//     @Slash({ name: "autoplay", description: "Toggle autoplay" })
//     async autoplay(interaction: CommandInteraction) {
//         await interaction.deferReply({
//             ephemeral: true
//         })
//         const embed = new EmbedBuilder()

//         const player = music.players.get(interaction.guild!.id);
//         if ((!player) || (player.current === null))
//             return interaction.editReply({
//                 embeds: [embed.setDescription("No active Player...").setColor(Colors.DarkRed)]
//             })

//         const currTrack = player.current as BetterTrack;
//         currTrack.autoplay = !currTrack.autoplay;

//         updateMusicEmbedFooter(player, { autoplay: currTrack.autoplay });
//         interaction.editReply({
//             embeds: [embed.setDescription(`Autoplay ${currTrack.autoplay ? "Enabled" : "Disabled"}`).setColor(Colors.DarkGreen)]
//         })
//     }
// }