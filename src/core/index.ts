import { client } from '../bertram.js';
import { commands } from "./commands.js";
import { Client as ClientTS, ClientOptions, DApplicationCommand, InitCommandOptions } from 'discordx';
import { BertramEvents, CoreEvents } from './typings/index.js';
import { Awaitable } from 'discord.js';
import { database } from './database/index.js';
import { config as coreConfig } from './config/index.js';
import pkg from 'eventemitter2';

export const coreEvent = new pkg.EventEmitter2();

export const core = {
    async init() {
        await coreConfig.init();
    },
    get client() { return client },
    get commands() { return commands },
    get database() { return database },
    get config() { return coreConfig },
    emit(event: keyof CoreEvents, ...args: []) {
        coreEvent.emit(event, ...args);
    },
    on(event: keyof CoreEvents, listener: (...args: any[]) => void) {
        coreEvent.on(event, listener);
    },
    once(event: keyof CoreEvents, listener: (...args: any[]) => void) {
        coreEvent.once(event, listener);
    }
}

export class Client extends ClientTS {
    constructor(options: ClientOptions) {
        super(options);
    }

    public static async build(options: ClientOptions): Promise<Client> {
        const client = new Client(options);
        await database.init(client);
        return client;
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
        await coreEvent.emitAsync('addConfig');
        await core.init();
        await this.build(log);
        if (log ?? !this.silent) {
            console.log(`[Core] - ${this.user?.username ?? this.botId} connecting to discord...\n`);
        }
        super.emit('beforeLogin');
        const _client = await super.login(token, log);
        await commands.init;
        super.emit('afterLogin', client);
        return _client;
    }
}
