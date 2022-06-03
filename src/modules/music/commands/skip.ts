import { Category } from "@discordx/utilities";
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Player } from "vulkava";
import { checkCommandInteraction } from "../../core/api/functions";
import { music } from './../api/index';


@Discord()
@Category("music")
class Skip {
    @Slash("skip", { description: "SKip the current Sogn" })
    async skip(interaction: CommandInteraction) {
        await checkCommandInteraction(interaction);

        const player = music.players.get(interaction.guild?.id);

        player?.skip();

    }

}