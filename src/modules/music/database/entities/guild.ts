import { Entity, Column, ChildEntity } from "typeorm";
import { Guild } from "../../../core/database/entities/guild";

@ChildEntity("musicGuild")
export class musicGuild extends Guild {
    @Column()
    channelId: string = '';

    @Column()
    messageId: string = '';
}