import { Entity, Column, ChildEntity } from "typeorm";
import { Guild } from "../../../core/database/entities/guild";

@ChildEntity("guild")
export class musicGuild extends Guild {
    @Column()
    channelId: string

    @Column()
    embedId: string
}