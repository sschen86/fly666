return {
    mock: {
        name: '用户注册',
        method: 'post',
        async response(ctx, resolve, reject) {
            const { Member } = ctx.model
            const { account: mobile, nick } = ctx.data

            if (!mobile) {
                reject('手机号码不能为空')
            }

            if (!nick) {
                reject('用户昵称不能为空')
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
        reqAdapter: {
            account: {
                $comment: '用户名',
            },
            password: {
                $comment: '密码',
            },
        },
        resAdapter: {
            nick: {
                $comment: '用户昵称',
            },
            code: {
                $comment: '用户编码',
            },
        },
    },
    sgtest: {

    },
}

