import { client } from "../../../golden";
import { DApplicationCommand, IGuild, MetadataStorage } from 'discordx';
import { TypeCategory } from "../types/category";
import { TypeCommand } from "../types/command";
import { PermissionResolvable } from "discord.js";
import { ICategory } from "@discordx/utilities";

const categories: Array<{ name: string }> = [];

const category = {
    push: async (category: TypeCategory) => {
        categories.push(category);
    },
    get: async () => {
        return categories;
    }
}

const commands: Array<{ name: string, category: TypeCategory, description: string, permissions: PermissionResolvable | null, guilds?: IGuild[] }> = [];

const command = {
    push(command: TypeCommand) {
        if (typeof command.permissions === 'undefined') {
            commands.push({ name: command.name, category: { name: command.category.name }, description: command.description, permissions: null, guilds: command.guilds });
            return;
        }
        commands.push(command as { name: string, category: TypeCategory, description: string, permissions: PermissionResolvable | null, guilds?: IGuild[] });
    },
    get(index: number) {
        return commands[index];
    }
}

export const help = {
    init: async () => {
        await initHelp();
    },
    getText: async () => {

    },
    categories() {
        return category;
    }
}

async function initHelp() {
    MetadataStorage.instance.applicationCommands.forEach(
        (cmd: DApplicationCommand & ICategory) => {
            if (cmd.category === undefined)
                TypeError('Category is undefined for command ' + cmd.name);

            if (!commands.includes({ name: cmd.name, category: { name: cmd.category! }, description: cmd.description, permissions: cmd.defaultMemberPermissions, guilds: cmd.guilds }))
                commands.push({ name: cmd.name, category: { name: cmd.category! }, description: cmd.description, permissions: cmd.defaultMemberPermissions, guilds: cmd.guilds });
        }
    );

    categories.forEach((category) => {
        let tempText: string = "";
        MetadataStorage.instance.applicationCommands.forEach(
            (cmd: DApplicationCommand & ICategory) => {
                if (cmd.category === category.name) {
                    tempText += `**${cmd.name}**\n<:arrowrightbottom:930552463088562246>${cmd.description}\n`;
                }
            }
        );
        tempHelpText.push(tempText);
    })
}


// **Init Help Menu Stuff** //
let tempCategories: Array<string> = [];
let tempHelpText: Array<string> = [];

await client.once("botReady", () => {

})