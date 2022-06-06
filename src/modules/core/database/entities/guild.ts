import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm"

@Entity()
export class Guild extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    guildID: string

    @Column()
    guildName: string

}