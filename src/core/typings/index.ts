import { ClientEvents } from "discord.js";
import { IGuild } from "discordx";
import { Client } from "../index.js";


export type BertramCommand = { id: string, name: string, description: string, category: string, guilds?: IGuild[] };

export type CoreConfig = { key: string, questionType: BertramQuestionType, message: string };

export interface CoreEvents {
    addConfig: [CoreConfig];
}

export interface BertramEvents extends ClientEvents {
    beforeLogin: [];
    afterLogin: [client: Client];
    afterInit: [];
    addConfig: [key: string, dataType: BertramDataType, questionType: BertramQuestionType, message: string];
}

export type BertramDataType = 'string' | 'number' | 'boolean';

export type BertramQuestionType = 'input'| 'number'| 'confirm'| 'list'| 'rawlist'| 'expand'| 'checkbox'| 'password'| 'editor';