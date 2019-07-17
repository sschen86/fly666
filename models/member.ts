import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import md5 from '../utils/md5'

@Entity()
export default class Member extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nick: string

    @Column()
    mobile: string

    @Column()
    password: string

    @Column()
    passwordSafely: Boolean

    constructor(data) {
        super()
        this.nick = data.nick
        this.mobile = data.mobile
        this.password = '123456'
        // this.password = md5('123456')
        this.passwordSafely = false
    }

    async notExists(option) {
        return !(await Member.findOne(option))
    }

    async exists(option) {
        return !this.notExists(option)
    }
}