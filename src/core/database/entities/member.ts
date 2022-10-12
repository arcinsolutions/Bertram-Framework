import { Entity, TableInheritance, BaseEntity, PrimaryColumn } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Member extends BaseEntity {
    @PrimaryColumn()
    memberId!: string
}