import { core } from '../../../core/index.js';

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

        return HelpText[category].text;
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
}


// **Init Help Menu Stuff** //
let HelpText: Array<{ category: string, text: string }> = [];