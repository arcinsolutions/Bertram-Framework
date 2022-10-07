import { User } from 'discord.js';
import formatDuration from 'format-duration';
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

        for (let i = endIndex; startIndex <= i && this.tracks[i]; i--) {
            const track = this.tracks[i] as BetterTrack;
            data.push(`**${i + 1}.** ${track.title} - ${track.author} [${formatDuration(track.duration, { leading: true })}]`)
        }

        // for (let i = endIndex; endIndex > startIndex && this.tracks[endIndex]; endIndex--) {
        //     const track = this.tracks[endIndex] as BetterTrack;
        //     data.push(`**${startIndex - i + endIndex + 1}.** ${track.title} - ${track.author} [${formatDuration(track.duration, { leading: true })}]`)
        // }
        return data.join('\n');
    }

    get getAllSongDetails() {
        const data = [];

        for (let i = (this.tracks.length - 1); i >= 0; i--) {
            const track = this.tracks[i] as BetterUnresolvedTrack;
            data.push(`**${i + 1}.** ${track.title} - ${track.author} [${formatDuration(track.duration, { leading: true })}]`)
        }

        return data;
    }

    get getQueuePages() {
        const pages = [];
        const tracks = this.tracks;
        const tracksLength = tracks.length;
        const tracksPerPage = 10;
        const pagesCount = Math.ceil(tracksLength / tracksPerPage);

        for (let i = 0; i < pagesCount; i++) {
            const startIndex = i * tracksPerPage;
            const endIndex = startIndex + tracksPerPage;
            const data = [];

            for (let i = startIndex; endIndex >= i && this.tracks[i]; i++) {
                const track = this.tracks[i] as BetterTrack;
                data.push(`**${i + 1}.** ${track.title} - ${track.author} [${formatDuration(track.duration, { leading: true })}]`)
            }

            pages.push(data.join('\n'));
        }

        return pages;
    }

    get generateFormattedQueue() {
        if (this.tracks.length < 1) return '';

        let contentLength = 0;
        const formattedQueueArray = [];

        for (var i = 0; i <= this.tracks.length; i++) {
            const track = this.tracks[i] as BetterUnresolvedTrack;

            if (track === undefined) continue;
            const formattedTrack = `\n**${i + 1}.** ${track.title} - ${track.author} [${formatDuration(track.duration, { leading: true })}]`;
            contentLength += formattedTrack.length;

            if (contentLength > 1500) {
                formattedQueueArray.push(`\nAnd **${this.tracks.length - i}** more tracks`);
                formattedQueueArray.push('\n__**Queue:**__');
                return formattedQueueArray.reverse().join('');
            }

            formattedQueueArray.push(formattedTrack);
        }

        formattedQueueArray.push('\n__**Queue:**__');
        return formattedQueueArray.reverse().join('');
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
    // declare public autoplay: boolean;
}