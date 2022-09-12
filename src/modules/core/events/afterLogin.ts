import { Guild } from '../../../core/database/entities/guild';
import { core } from '../../../core/index';

core.client.once('afterLogin', async (client) => {
    // make sure all guilds are in cache
    const guilds = await client.guilds.fetch();

    const interval = await setInterval(async () => {
        if (!core.database.connected)
            return;

        const db = core.database.get;

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
    }, 100);

    if (core.database.connected)
        clearInterval(interval);
})