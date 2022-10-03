import inquirer from 'inquirer';
import { config } from './../../../core/config/index.js';
import { core } from './../../../core/index.js';

core.once('addConfig', async () => {
    if (config.get('node') != undefined) {
        return;
    }

    const nodes = await inquirer.prompt({
        name: 'nodeAmount',
        type: 'number',
        message: 'How many nodes do you want to use?',
        default: 1,
    })
    config.save('nodes', nodes.nodeAmount);
    
    for (const [, value] of Object.entries(nodes)) {
        if ( config.get(`node:${value}`) != undefined ) {
            continue;
        }

        // {
        //     id: 'arcin2',
        //         hostname: '78.47.184.165',
        //             port: 2332,
        //                 password: 'tiZDJ7dvZJsDDU2x',
        //                     region: 'EU'
        // }
        config.add(`node:${value}:id`, { type: 'number', message: `What is the id for node ${value}?` });
        config.add(`node:${value}:hostname`, { type: 'input', message: `What is the hostname / IP for node ${value}?` });
        config.add(`node:${value}:port`, { type: 'number', message: `What is the port for node ${value}?` });
        config.add(`node:${value}:password`, { type: 'password', message: `What is the password for node ${value}?`, mask: '*' });
        config.add(`node:${value}:region`, { type: 'input', message: `What is the region for node ${value}?`, default: 'EU'});
    }
})