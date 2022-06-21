import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, PrimaryColumn, TableInheritance } from "typeorm"

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Guild extends BaseEntity {
    @PrimaryColumn()
    guildId: string

    @Column()
    guildName: string
}