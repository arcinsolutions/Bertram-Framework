import { Entity, Column } from "typeorm";
import { Guild } from "../../../core/database/entities/guild";

@Entity("guild")
export class musicGuild extends Guild {

}