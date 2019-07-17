import md5 from '../utils/md5'


const login_account = ['用户名登录', {
    mock: {
        method: 'post2',
        reqAdapter: {
            account: {
                $key: 'mobile',
                $comment: '用户名',
            },
            password: {
                $comment: '密码',
                $value: (value) => md5(value),
            },
        },
        resAdapter2: {
            nick: { $comment: '用户昵称' },
            avatar: { $comment: '用户图标链接' },
        },
        response2(ctx, resolve, reject) {
            // reject('999')
            resolve({
                nick: '张三',
                avatar: 'http://xxxx.com/',
            })
        },
        async response(ctx, resolve, reject) {
            const { account, password } = ctx.params
            const { Member } = ctx.model
            if (await Member.notExists({ account })) {
                reject('用户未注册')
            }
            if (await Member.notExists({ account, password })) {
                reject('密码错误')
            }
            resolve(Member.find({ account, password }))
        },
    },
    sgtest: {
        url: '',
        method: 'post',
    },
}]

const create = ['用户注册', {
    mock: {
        method: 'post',
        async response(ctx, resolve, reject) {
            const { Member } = ctx.model
            const { account, nick } = ctx.params
            if (await Member.exist({ account })) {
                reject('手机号码已被注册')
            }

            if (!account || !/^1([38]\d|5[0-35-9]|7[3678])\d{8}$/.test(account)) {
                reject('手机号码错误')
            }

            const user = new Member({
                mobile: account,
                nick: '张三',
            })

            user.save()

            resolve()
        },
    },

}]


export default {
    login_account,
    loginMobile: ['手机号码登录', {
        mock: {
            response: async (ctx, resolve) => {
                resolve({
                    name: 'xxx',
                })
            },
        },
    }],
}
