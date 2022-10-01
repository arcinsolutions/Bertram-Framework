import { Column, ChildEntity } from "typeorm";
import { Guild } from "../../../../core/database/entities/guild.js";

@ChildEntity("guild")
export class musicGuild extends Guild {
    @Column()
    channelId: string = '';

    @Column()
    messageId: string = '';
}