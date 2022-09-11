import { Guild } from '../../../core/database/entities/guild'
import { core } from './../../../core/index';

// **Import Database Stuff** //

core.client.on("guildCreate", async (guild) => {
    const dbGuild = new Guild();
    dbGuild.guildId = guild.id;
    dbGuild.guildName = guild.name;
    await dbGuild.save().catch(() => {
        console.log("[Core] - ERROR COULD NOT SAVE GUILD TO DATABASE");
    });
})