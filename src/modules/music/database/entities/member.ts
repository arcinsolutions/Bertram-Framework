import { ChildEntity, Column } from "typeorm";
import { Member } from './../../../../core/database/entities/member.js';
import { BetterTrack } from './../../api/structures.js';


@ChildEntity("member")
export class musicMember extends Member {
    @Column()
    favoriteSongs: Array<BetterTrack> = [];
}