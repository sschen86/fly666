return {
    mock: {
        method: 'post',
        reqAdapter: {
            account: true,
            password: true,
        },
        resAdapter: {
            mobile: true,
            nick: (value) => '昵称：' + value,
        },
        async response(ctx, resolve, reject) {
            const { model, data } = ctx
            const { account: mobile, password } = data
            const { Member } = model

            if (await Member.notExists({ mobile })) {
                reject('用户名不存在')
            }

            if (await Member.notExists({ mobile, password })) {
                reject('密码错误')
            }

            resolve(await Member.findOne({ mobile, password, select: ['mobile', 'nick'] }))
        },
    },
    develop: {
        method: 'post',
        url: 'merchant/user/accountLogin',
        reqAdapter: {
            account: { $key: 'accountName' },
            password: {},
        },
    },

    mockjson: {
        delay: 100,
        async response(ctx, resolve, reject) {
            resolve({
                nick: '张三11',
                mobile: 1866998,
                ppk: true,
            })
        },
    },

}