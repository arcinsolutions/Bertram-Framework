import { readFile, writeFile } from "fs/promises";
import { createInterface } from 'readline';
import { Collection, Guild, OverwriteResolvable } from 'discord.js';

export async function addOrCheckConfigKey(key: string, type: 'string' | 'number', options?: ({ question?: string, comment?: boolean })) {
    // Get the Content from the Config file
    let content = await readFile(`./config.env`, {
        encoding: 'utf-8'
    })
    let questionText = `What should be the Value for ${key}? `;

    if (content.includes(key))
        return;

    if (typeof options != 'undefined')
        switch (true) {
            case (typeof options.comment != 'undefined'):
                content += `\n#${key}`
                return;

            case (typeof options.question != 'undefined'):
                questionText = options.question;
                break;
        }

    var rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (str: string) => new Promise(resolve => rl.question(str, resolve));

    let value: any = await question(questionText);

    switch (type) {
        case 'number':
            do {
                value = await Number(await question("that wasn't a Number, please try again: "));
            } while (isNaN(value) || typeof value != 'number')
            break;

        case 'string':
            if (value.includes('"'))
                value = value
            else
                value = `"${value}"`
            break;
    }

    content += `\n${key} = ${value}`

    console.log("Value accepted!");

    // Writes the File with filled Config-Key
    writeFile('./config.env', content, { encoding: 'utf-8' })
}