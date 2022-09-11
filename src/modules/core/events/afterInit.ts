import { core } from "../../../core";
import { help } from "../help";

core.client.once('afterInit', () => {
    help.init;
})