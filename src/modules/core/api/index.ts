import { readFile, writeFile } from "fs/promises";
import { createInterface } from 'readline';

export async function addOrCheckConfigKey(key: string, options?: ({ question?: string, type?: 'string' | 'number', comment?: boolean })) {
    // Get the Content from the Config file
    let content = await readFile(`./config.env`, {
        encoding: 'utf-8'
    })
    let questionText = `What should the Value for the Key ${key}? `;

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

    switch (options?.type) {
        case 'number':
            while (Number(value) === NaN)
                value = Number(await question("This is not a Number! What should be the Number?"));
            console.log(Number(value));
            break;

        case 'string':
            let tempString: string = String(value)
            if (tempString.includes('"'))
                value = tempString
            else
                value = `"${tempString}"`
            break;
    }

    content += `\n${key} = ${value}`
    console.log(content);

    // Writes the File with filled Config-Key
    // writeFile('./config.env', content, { encoding: 'utf-8' })



    // console.log(content);
    // let rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    // rl.question('Is this example useful? [y/n] ', (answer) => {
    //     switch (answer.toLowerCase()) {
    //         case 'y':
    //             console.log('Super!');
    //             break;
    //         case 'n':
    //             console.log('Sorry! :(');
    //             break;
    //         default:
    //             console.log('Invalid answer!');
    //     }
    //     rl.close();
    // });

}