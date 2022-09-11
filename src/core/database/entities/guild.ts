import { Column, BaseEntity, PrimaryColumn, TableInheritance, Entity } from "typeorm"

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Guild extends BaseEntity {
    @PrimaryColumn()
    guildId!: string

    @Column()
    guildName?: string
}