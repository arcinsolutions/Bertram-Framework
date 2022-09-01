import { client } from "../../../bertram";
import { core } from '..';
import { Guild } from './../database/entities/guild';

client.on('ready', async (client) => {
    // make sure all guilds are in cache
    const guilds = await client.guilds.fetch();

    // get DB
    const db = core.database.getDatabase();

    // add each guild to DB if not already there
    guilds.forEach(async (guild) => {
        const dbGuild = await db.getRepository(Guild).findOne({ where: { guildId: guild.id } });

        if (!dbGuild) {
            const newGuild = new Guild();
            newGuild.guildId = guild.id;
            newGuild.guildName = guild.name;
            await newGuild.save();
        }
    });

    client.emit('fetchedGuilds');
})