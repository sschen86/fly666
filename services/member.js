
module.exports = {
    login: '用户登录',
    logout: '用户登出',
    login_msgcode: '发送手机验证码',
    merchants: '获取用户的商家列表',
}

mock.define('login', (ctx) => {
    const { request } = ctx
    const { type } = request

    if (type === 1) {
        const { user } = request
        if (!Member.exists({ user })) {
            error('用户未注册')
        }
        const password = md5(request.password)
        if (!Member.exists({ user, password })) {
            error('密码错误')
        }
        const member = Member.findOne({ user }, {

        })

        return ok(member)
    }
})

sgtest.define('login', {
    method: 'post',
    url: '',
    reqAdapter: {

    },
    resAdapter: {
        ppk: { /// string 哈哈

        },
    },
})

serviceSource(serviceId, option)

mock('member/login', {
    method: 'post',
    callback: async (ctx, resolve, reject) => {

    },
})

local('sort', {
    callback: async (ctx, resolve, reject) => {

    },
})
