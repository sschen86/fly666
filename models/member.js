
const model = require('./system/model')

model.define('member', {
    id: {
        $comment: '用户id',
        $type: 'long',
    },
    nick: { $comment: '用户昵称', $type: String },
    createTime: {
        $comment: '用户创建时间',
        $type: Date,
        $getters: {
            createTimeText: { $type: String, $format: 'dateDefault' },
        },
    },
}, {
    methods: {

    },
    statics: {

    },
    query: {

    },
})

member = require('xxx')('member')

model('member').define({
    fields: {

    },

})

model('member').statics({

})

member.query({

})

const serviceSources = ['mock', 'sgtest', {
    id: 'sgdev',
    install: (ctx) => {
        const params = ctx.params
        const { data, headers, cookies } = params
    },
}]

services('member/login', [
    (ctx) => {
        const params = ctx.params
        const { data, headers, cookies } = params
    },
    null,
])

const gateway = {
    url: '',
    method: '',
    reqAdapter: {

    },
    resAdapter: {

    },
}
