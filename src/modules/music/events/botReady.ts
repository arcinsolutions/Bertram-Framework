import { client } from "../../../golden";
import { music } from "../api";

await client.once("botReady", () => {
    if (client.user == null)
        return;

    music.start(client.user.id);
    console.log("check!");
})