return {
    mock: {
        name: '用户注册',
        method: 'post',
        response(ctx, resolve, reject) {

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