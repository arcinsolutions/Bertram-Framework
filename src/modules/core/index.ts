import { ICategory } from '@discordx/utilities';
import { DApplicationCommand } from 'discordx';
import { MetadataStorage } from 'discordx';
import { client } from '../../golden';

// **Import Database Stuff** //
import './database'


// **Init Help Menu Stuff** //
let tempCategories: Array<string> = [];
let tempHelpText: Array<string> = [];

await client.on("botReady", () => {
    MetadataStorage.instance.applicationCommands.forEach(
        (cmd: DApplicationCommand & ICategory) => {
            if (cmd.category === undefined)
                return;
            if (!tempCategories.includes(cmd.category))
                tempCategories.push(cmd.category);
        }
    );

    categories.forEach((category) => {
        let tempText: string = "";
        MetadataStorage.instance.applicationCommands.forEach(
            (cmd: DApplicationCommand & ICategory) => {
                if (cmd.category === category) {
                    tempText += `**${cmd.name}**\n<:arrowrightbottom:930552463088562246>${cmd.description}\n`;
                }
            }
        );
        tempHelpText.push(tempText);
    })
})

export const categories: Array<string> = tempCategories;
export const helpText: Array<string> = tempHelpText;