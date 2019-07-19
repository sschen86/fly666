module.exports = {
    mock: {
        name: '用户名登录',
        method: 'post',
        async response(ctx, resolve, reject) {
            const { account: mobile, password } = ctx.data
            const { Member } = ctx.model

            if (await Member.notExists({ mobile })) {
                reject('用户未注册')
            }
            if (await Member.notExists({ mobile, password })) {
                reject('密码错误')
            }
            resolve(await Member.findOne({ mobile, password, select: ['mobile', 'nick'] }))
        },
        reqAdapter: {
            account: {
                $comment: '登录手机号码',
            },
            password: {
                $comment: '登录密码',
            },
        },
        resAdapter: {
            mobile: {
                $comment: '用户手机号码',
                $nick: '用户昵称',
            },
        },
    },
}