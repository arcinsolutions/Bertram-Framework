import { client } from '../bertram';
import { commands } from "./commands";
import { Client as ClientTS, ClientOptions, DApplicationCommand, InitCommandOptions } from 'discordx';
import { BertramEvents } from './typings';
import { Awaitable, Client as ClientJS } from 'discord.js';
import * as Config from 'conf'
import { database } from './database/index';

const _nconf = new Config.default();

export const core = {
    get init() {
        return database.init;
    },
    get client() { return client },
    get commands() { return commands },
    get database() { return database },
    get config() { return _nconf },
    // set addConfig()
}

export class Client extends ClientTS {    
    constructor(options: ClientOptions) {
        core.init;
        super(options);
    }

    public emit<K extends keyof BertramEvents>(event: K, ...args: BertramEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof BertramEvents>, ...args: unknown[]): boolean;
    public emit(event: string, args?: unknown[]): boolean {
        return super.emit(event, args);
    }

    public on<K extends keyof BertramEvents>(event: K, listener: (...args: BertramEvents[K]) => Awaitable<void>): this;
    public on<S extends string | symbol>(event: Exclude<S, keyof BertramEvents>, listener: (...args: any[]) => Awaitable<void>): this;
    public on(event: any, listener: any): this {
        return super.on(event, listener);
    }

    public once<K extends keyof BertramEvents>(event: K, listener: (...args: BertramEvents[K]) => Awaitable<void>): this;
    public once<S extends string | symbol>(event: Exclude<S, keyof BertramEvents>, listener: (...args: any[]) => Awaitable<void>): this;
    public once(event: any, listener: any): this {
        return super.once(event, listener);
    }
    

    initApplicationCommands(options?: { global?: InitCommandOptions | undefined; guild?: InitCommandOptions | undefined; } | undefined): Promise<void> {
        super.initApplicationCommands(options);
        super.emit('afterInit');
        return Promise.resolve();
    }

    initGlobalApplicationCommands(options?: InitCommandOptions | undefined): Promise<void> {
        super.initGlobalApplicationCommands(options);
        super.emit('afterInit');
        return Promise.resolve();
    }

    initGuildApplicationCommands(guildId: string, DCommands: DApplicationCommand[], options?: InitCommandOptions | undefined): Promise<void> {
        super.initGuildApplicationCommands(guildId, DCommands, options);
        return Promise.resolve();
    }

    async login(token: string, log?: boolean | undefined): Promise<string> {
        await this.build(log);
        if (log ?? !this.silent) {
            console.log(`[Core] - ${this.user?.username ?? this.botId} connecting to discord...\n`);
        }
        await super.emit('beforeLogin');
        const _client = await super.login(token, log);
        await commands.init;
        await super.emit('afterLogin', client);
        return _client;
    }
}
