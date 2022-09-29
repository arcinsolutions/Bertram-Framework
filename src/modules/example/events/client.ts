import { Discord, On } from "discordx";

@Discord()
class events {
    @On({event: "ready"})
    private async onReady() {
        console.log("Bot is ready!");
    }
}