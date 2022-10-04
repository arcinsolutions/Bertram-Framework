import nconf from 'nconf';
import inquirer, { QuestionCollection } from 'inquirer';
import { format } from 'util';

nconf.argv().env().file({ file: './config.json' });

const configMap = new Map<string, { question: QuestionCollection }>();

export const config = {
    async init() {
        // set up config map
        return await configInit();
    },

    get(key: string) {
        return nconf.get(key);
    },
    add(key: string, question: QuestionCollection ) {
        if (!configMap.has(key))
            configMap.set(key, { question });
        else
            console.log(format('[WARNING] - a Key %s is already defined by someone else', key));
    },
    save(key: string, value: any) {
        nconf.set(key, value);
        nconf.save(() => {});
    }
}

async function configInit() {
    await askForConfigValue();
    return;
}

async function askForConfigValue() {
    const questions: Array<{name: string, question: QuestionCollection}> = [];
    for (const [key, value] of configMap.entries()) {
        if (nconf.get(key) != null)
            continue;

        questions.push({
            name: key,
            question: value.question
        })
    }

    if (questions.length === 0) {
        console.log('[Core] - All config values are set!\n[Core] - Starting up...');
        return;
    }

    const answers = await inquirer.prompt(questions);

    // set config values
    for (const [key, value] of Object.entries(answers)) {
        await nconf.set(key, value);
    }

    console.log('[Core] - All config values are set!');
    return await nconf.save(() => { 
        console.log('[Core] - Config saved'); 
        throw new Error('please restart the bot to make sure all configurations are applied correctly!'); 
    });
}
