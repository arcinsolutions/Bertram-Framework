import { Vulkava } from 'vulkava'
import { client } from '../../../golden';

export const music = new Vulkava({
    nodes: [
        {
            id: 'arcin1',
            hostname: 'arcin.solutions',
            port: 2333,
            password: 'fzx@zbx8apq0tvk-NXA'
        }
    ],
    sendWS: (guildId, payload) => {
        client.guilds.cache.get(guildId)?.shard.send(payload);
        // With eris
        // client.guilds.get(guildId)?.shard.sendWS(payload.op, payload.d);
    }
})