import { BertramDataType, BertramQuestionType } from '../typings';
import { core } from './../index';
import * as nconf from 'nconf';
import inquirer from 'inquirer';
import { readFile } from 'fs';

const configMap = new Map<string, { dataType: BertramDataType, questionType: BertramQuestionType, message: string }>();

// export const config = {
//     get init() {
//     },
// }

core.client.on('checkConfig', () => {
    
})

core.client.on('addConfig', (key, dataType, questionType, message) => {
    if (configMap.has(key)) {
        throw new TypeError(`[Core] - !ERROR! - Config with key ${key} already exists!`);
    }

    configMap.set(key, { dataType, questionType, message });
})

core.client.on('beforeLogin', async () => {
    nconf.argv().env().file({ file: './config.json' });

    const questions = Array.from(configMap.keys()).map(key => {
        const config = configMap.get(key);
        if (!config) return;

        return {
            type: config.questionType,
            name: key,
            message: config.message,
            default: nconf.get(key),
            validate: (input: any) => {
                if (config.dataType == 'number') {
                    if (isNaN(input)) return 'Please enter a number!';
                }

                return true;
            }
        }
    });

    console.log(questions);
    // configMap.forEach(async (value, key) => {
    //     inquirer.prompt([
    //         question
    //     ]).then(async (answers) => {
    //         nconf.set(key, answers[key]);
    //     })
    // })

    // nconf.save(function (err) {
    //     readFile('./config.json', function (err, data) {
    //         console.dir(JSON.parse(data.toString()))
    //     })
    // })
})