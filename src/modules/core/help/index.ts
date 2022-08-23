import { DApplicationCommand, IGuild, MetadataStorage } from 'discordx';
import { TypeCategory } from "../types/category";
import { TypeCommand } from "../types/command";
import { ICategory } from "@discordx/utilities";

const categories: Array<{ name: string }> = [];

const category = {
    push: (category: TypeCategory) => {
        categories.push(category);
    },
    get: (category: number) => {
        return categories[category];
    },
    categories: () => {
        return categories;
    },
    length: () => {
        return categories.length;
    }
}

const commands: Array<TypeCommand> = [];

const command = {
    push(command: TypeCommand) {
        commands.push(command);

        if (!categories.includes({ name: command.category.name })) {
            categories.push({ name: command.category.name });
        }
    },
    pushMetaCommand(command: DApplicationCommand & ICategory) {
        const tempCommand: TypeCommand = ({ name: command.name, category: { name: command.category! }, description: command.description, permissions: command.defaultMemberPermissions, guilds: command.guilds });

        if (!categories.includes({ name: command.category! })) {
            categories.push({ name: command.category! });
        }
    },
    get(index: number) {
        return commands[index];
    }
}

export const help = {
    init: async () => {
        await initHelp().then(() => {
            console.log('Help initialized');
        });
    },
    categories() {
        return category;
    },
    getText(category: string | number) {
        if (typeof category == "string") {
            return HelpText.find(x => x.category == category)!.text;
        }

        if (typeof category == "number") {
            return HelpText[category].text;
        }

        return "";
    },
    findCategory(text: string) {
        return HelpText.findIndex(x => x.text == text);
    }
}

async function initHelp() {
    await MetadataStorage.instance.applicationCommands.forEach(
        (cmd: DApplicationCommand & ICategory) => {
            if (cmd.category === undefined)
                return console.log(`Command ${cmd.name} has no category`);

            command.pushMetaCommand(cmd);
        }
    );

    await categories.forEach((category) => {
        let tempText: string = "";
        MetadataStorage.instance.applicationCommands.forEach(
            (cmd: DApplicationCommand & ICategory) => {
                if (cmd.category === category.name) {
                    tempText += `**${cmd.name}**\n:arrow_lower_right: ${cmd.description}\n`;
                }
            }
        );
        HelpText.push({ category: category.name, text: tempText });
    })
}


// **Init Help Menu Stuff** //
let HelpText: Array<{ category: string, text: string }> = [];