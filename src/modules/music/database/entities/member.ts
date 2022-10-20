import { ChildEntity, Column } from "typeorm";
import { Member } from './../../../../core/database/entities/member.js';


@ChildEntity("member")
export class musicMember extends Member {
    @Column("simple-array")
    favoriteSongs: string[];
}