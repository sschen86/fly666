
const md5 = require('../utils/md5')
const { Member, services } = require('../models')
const { error, exports } = require('../system/geteway')

const member_login = ['用户登录', {
    mock: {
        response: async ({ data }) => {
            const { type } = data

            if (type === 'account') {
                const { account } = data
                if (await Member.notExists({ account })) {
                    error('用户未注册')
                }

                const password = md5(data.password)
                if (await Member.notExists({ account, password })) {
                    error('密码错误')
                }

                const loginInfos = await services('member/login', { account, password })

                exports(loginInfos, {
                    headers: {
                        // token: session('token', md5(account)),
                    },
                })
            }
        },
        document: {
            request: {
                type: {
                    $required: true,
                    $comment: '登录类型',
                    $emap: {
                        account: '账号登录',
                        mobile: '手机号码登录',
                    },
                },
                account: {
                    $type: String,
                    $comment: '登录账号',
                },
                password: {
                    $type: String,
                    $comment: '登录密码',
                },
                mobile: {
                    $type: String,
                    $regexp: '#mobile',
                    $comment: '手机号码',
                },
                vcode: {
                    $type: String,
                    $validates: [
                        { $regexp: /^(\w{4})$/, message: '验证码必须是数字字母组成长度为4位的字符串' },
                    ],
                    $comment: '手机验证码',
                },
            },
            response: {

            },
        },
    },
    sgtest: {
        method: 'post',
        req: {

        },
        res: {

        },
        mock: (req) => {

        },
    },
}]

module.exports = {
    member_login,
}
