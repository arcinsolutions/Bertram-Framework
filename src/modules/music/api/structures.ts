import { User } from 'discord.js';
import { DefaultQueue, Track, UnresolvedTrack, Vulkava } from 'vulkava';
import { ITrack } from 'vulkava/lib/@types';
export class BetterQueue extends DefaultQueue {
    constructor() {
        super();
    }

    public addToBeginning(track: Track) {
        this.tracks.unshift(track);
    }

    public removeTrackAt(index: number) {
        this.tracks.splice(index, 1);
    }

    public getTrackAt(index: number) {
        return this.tracks[index];
    }

    public getSongDetails(startIndex: number, endIndex: number) {
        const data = [];

        for (; endIndex > startIndex && this.tracks[endIndex]; endIndex--) {
            const track = this.tracks[endIndex] as BetterTrack;
            data.push(`**${startIndex + 1}.** ${track.title} - ${track.author} (Requester: ${track.requester.username})`)
        }
        return data.join('\n');
    }

    public getAllSongDetails() {
        const data = [];

        for (let i = (this.tracks.length - 1); i >= 0; i--) {
            const track = this.tracks[i] as BetterUnresolvedTrack;
            data.push(`**${i + 1}.** ${track.title} - ${track.author} (Requester: ${track.requester.username})`)
        }
        return data.join('\n');
    }
}

export class BetterUnresolvedTrack extends UnresolvedTrack {
    constructor(vulkava: Vulkava, title: string, author: string, duration?: number | undefined, uri?: string | undefined, source?: string | undefined, isrc?: string | undefined) {
        super(vulkava, title, author, duration, uri, source, isrc)
    }

    declare public requester: User;
}

export class BetterTrack extends Track {
    constructor(data: ITrack) {
        super(data);
    }

    declare public requester: User;
}