import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
// import md5 from '../utils/md5'

@Entity()
export default class Member extends BaseEntity {

    static instance(data) {
        const instance = new Member()
        instance.mobile = data.mobile
        instance.nick = data.nick
        instance.password = '123456'
        instance.passwordSafely = false
        return instance
    }

    static async notExists(option) {
        return !(await this.findOne(option))
    }

    static async exists(option) {
        return !(await this.notExists(option))
    }

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nick: string

    @Column({ unique: true })
    mobile: string

    @Column()
    password: string

    @Column()
    passwordSafely: Boolean

}