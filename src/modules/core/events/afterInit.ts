import { core } from './../../../core/index.js';
import { help } from './../help/index.js';

core.client.once('afterInit', () => {
    help.init;
})