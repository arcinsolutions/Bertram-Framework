import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, PrimaryColumn } from "typeorm"

@Entity()
export class Guild extends BaseEntity {
    @PrimaryColumn()
    guildId: string

    @Column()
    guildName: string

}