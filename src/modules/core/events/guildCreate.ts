import { Guild } from '../../../core/database/entities/guild.js';
import { core } from './../../../core/index.js';

// **Import Database Stuff** //

core.client.on("guildCreate", async (guild: { id: string; name: string | undefined; }) => {
    const dbGuild = new Guild();
    dbGuild.guildId = guild.id;
    dbGuild.guildName = guild.name;
    await dbGuild.save().catch(() => {
        console.log("[Core] - ERROR COULD NOT SAVE GUILD TO DATABASE");
    });
})