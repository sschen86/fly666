import md5 from '../utils/md5'


const login_account = ['用户名登录', {
    mock: {
        method: 'post',
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
        async response(ctx, resolve, reject) {
            const { account, password } = ctx.data
            const { Member } = ctx.model

            if (await Member.notExists({ mobile: account })) {
                reject('用户未注册')
            }
            if (await Member.notExists({ mobile: account, password })) {
                reject('密码错误')
            }
            resolve(await Member.findOne({ mobile: account, password, select: ['mobile', 'nick'] }))
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
            const { account: mobile, nick } = ctx.data

            if (!mobile) {
                reject('手机号码不能为空')
            }

            if (!/^1([38]\d|5[0-35-9]|7[3678])\d{8}$/.test(mobile)) {
                reject('手机号码错误')
            }

            if (await Member.exists({ mobile })) {
                reject('用户已注册')
            }

            const user = Member.create({
                mobile,
                nick,
                passwordSafely: false,
                password: '123456',
            })

            await user.save()

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
    create,
}
