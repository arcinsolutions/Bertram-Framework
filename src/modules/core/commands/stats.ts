import { Category, Description } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { Interaction, MessageEmbed } from 'discord.js';
import { CommandInteraction } from 'discord.js';

@Discord()
@Category("Information")
class Stats {
    @Slash("stats")
    @Description("shows you a lot of stats how Golden performs...")
    async stats(Interaction: CommandInteraction) {
        const stats = new MessageEmbed({
            title: "Stats",
            description: "Tests",
            color: "DARK_GREEN"
        })
    }
}