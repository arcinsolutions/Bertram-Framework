import { Node } from 'vulkava';
import { music } from './../api/index';

music.on("error", (node: Node, err: Error) => {
    console.error(`[Vulkava] Error on node ${node.identifier}`, err.message);
})