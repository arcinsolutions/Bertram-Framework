import { client } from '../../../bertram';
import { Guild } from '../database/entities/guild'

// **Import Database Stuff** //

client.on("guildCreate", async (guild) => {
    const dbGuild = new Guild();
    dbGuild.guildId = guild.id;
    dbGuild.guildName = guild.name;
    await dbGuild.save().catch(e => {
        console.log("ERROR COULD NOT SAVE GUILD TO DATABASE");
    });
})
