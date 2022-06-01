import { Player, Track } from 'vulkava';
import { client } from '../../../golden';
import { music } from '../api';

music.on('trackStart', (player: Player, track: Track) => {
    if (player.textChannelId == (undefined || null))
        return

    const channel = client.channels.cache.get(player.textChannelId);

    console.log(`Now playing ${track.title}`);

});

