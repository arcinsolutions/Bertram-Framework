import { core } from './index.js';
import { BertramCommand } from './typings/index.js';
import { DApplicationCommand, MetadataStorage } from 'discordx';
import { ICategory } from '@discordx/utilities';
import { ApplicationCommand } from 'discord.js';

const _commands: Array<BertramCommand> = [];
const _categories: Array<{ name: string }> = [];

export const commands = {
    get init() {
        return fetchCommands();
    },
    get(name?: string, id?: string) {
        return _commands.find(command => command.name === name || command.id === id);
    },
    get getAll() {
        return _commands;
    },
    get getAllCategories() {
        return _categories;
    }
}

async function fetchCommands(): Promise<void> {
    const commands = await core.client.application?.commands.fetch();

    if (typeof commands === "undefined")
        throw new TypeError("[Core] - !ERROR! - no Commands found!");

    commands.forEach((element: ApplicationCommand) => {
        const MetaCommand = MetadataStorage.instance.applicationCommands.find(command => command.name === element.name) as DApplicationCommand & ICategory;

        if (typeof MetaCommand !== "undefined")
            if (typeof MetaCommand.category !== "undefined") {
                _commands.push({ id: element.id, name: element.name, description: element.description, category: MetaCommand.category });

                if (_categories.findIndex((category) => category.name === MetaCommand.category) === -1)
                    _categories.push({ name: MetaCommand.category });
            }

            else
                throw new TypeError(`[Core] - !ERROR! - Command ${element.name} has no category!`);
    });
}