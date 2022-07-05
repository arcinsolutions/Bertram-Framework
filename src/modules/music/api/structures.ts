import { User } from 'discord.js';
import { DefaultQueue, Track } from 'vulkava';
import { ITrack } from 'vulkava/lib/@types';
export class BetterQueue extends DefaultQueue {
    constructor() {
        super();
        this.tracks as BetterTrack[];
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

        for (; startIndex < endIndex && this.tracks[startIndex]; startIndex++) {
            const req = this.tracks[startIndex].requester as User;
            data.push(`${startIndex + 1}º - \`${this.tracks[startIndex].title}\` (Requester: ${this.tracks[startIndex].requester.id})`)
        }
        return data.join('\n');
    }

    public getAllSongDetails() {
        const data = [];

        for (let i = 0; i < this.tracks.length; i++) {
            const req = this.tracks[i].requester as User;
            data.push(`${i + 1}º - \`${this.tracks[i].title}\` (Requester: \`${this.tracks[i].requester.id})`)
        }
        return data.join('\n');
    }
}

export class BetterTrack extends Track {
    constructor(data: ITrack) {
        super(data);
    }

    public setRequester(requester: { author: string, id: string }): void {
        this.requester = requester;
    }
}