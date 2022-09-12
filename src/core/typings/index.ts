import { ClientEvents } from "discord.js";
import { IGuild } from "discordx";
import { Client } from '..';


export type BertramCommand = { id: string, name: string, description: string, category: string, guilds?: IGuild[] };

export interface BertramEvents extends ClientEvents {
    beforeLogin: [];
    afterLogin: [client: Client];
    afterInit: [];
    addConfig: [key: string, dataType: BertramDataType, questionType: BertramQuestionType, message: string];
}

export type BertramDataType = 'string' | 'number' | 'boolean';

export type BertramQuestionType = 'input' | 'confirm' | 'select' | 'multiselect' | 'form' | 'survey' | 'list' | 'scale' | 'toggle' | 'autocomplete';