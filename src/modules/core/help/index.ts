import { DApplicationCommand, MetadataStorage } from 'discordx';
import { ICategory } from "@discordx/utilities";
import { client } from '../../../bertram';
import { BertramCommand } from '../../../core/typings';
import { core } from '../../../core';

export const help = {
    get init() {
        return initHelp().then(() => {
            console.log('[Core] - Help text generated!');
        });
    },
    getText(category: string | number): string {
        if (typeof category == "string") {
            return HelpText.find(x => x.category == category)!.text;
        }

        if (typeof category == "number") {
            return HelpText[category].text;
        }

        return "";
    },
    get lenght() {
        return core.commands.getAllCategories.length;
    },
    findCategory(text: string): number {
        return HelpText.findIndex(x => x.text == text);
    }
}

async function initHelp(): Promise<void> {
    // TODO: WIP
    // NEW
    const commands = core.commands.getAll;
    const categories = core.commands.getAllCategories;

    categories.forEach(category => {
        let tempText: string = "";
        const commandsInCategory = commands.filter(command => command.category == category.name);

        commandsInCategory.forEach(command => {
            tempText += `</${command.name}:${command.id}>\n⇾ ${command.description}\n`; // note sure with the arrows | ◟⌞⨽▸►⇾⇢⇨⇒↳↣→›»
        });
        HelpText.push({ category: category.name, text: tempText });
    });

    // OLD
    // const commands = await client.application?.commands.fetch();

    // await MetadataStorage.instance.applicationCommands.forEach(
    //     (cmd: DApplicationCommand & ICategory) => {
    //         if (cmd.category === undefined)
    //             return console.log(`[Core] - !WARNING! - Command ${cmd.name} has no category`);

    //         command.pushMetaCommand(cmd);
    //     }
    // );

    // await categories.forEach((category) => {
    //     let tempText: string = "";
    //     MetadataStorage.instance.applicationCommands.forEach(
    //         (cmd: DApplicationCommand & ICategory) => {
    //             if (cmd.category === category.name) {
    //                 const cmdID = commands?.find((command) => command.name == cmd.name)?.id;

    //                 tempText += `</${cmd.name}:${cmdID}>\n⇾ ${cmd.description}\n`; // note sure with the arrows | ◟⌞⨽▸►⇾⇢⇨⇒↳↣→›»
    //             }
    //         }
    //     );
    //     HelpText.push({ category: category.name, text: tempText });
    // })
}


// **Init Help Menu Stuff** //
let HelpText: Array<{ category: string, text: string }> = [];