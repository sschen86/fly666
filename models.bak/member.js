
const model = require('./system/model')

model.define('Member', {
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
})

model.Member.services.loginInfos = {
    id: '',
    reqAdapter: {

    },
    resAdapter: {

    },
}

model.define('Category', {
    id: {
        $primary: true,
        $comment: '分类id',
        $type: 'long',
    },
    label: {
        $comment: '分类名称',
        $type: String,
    },
})

model.define('Post', {
    id: {
        $comment: '文章id',
        $type: String,
    },
    content: {
        $comment: '文章内容',
        $type: String,
    },
    categoryId: {
        $type: 'id',
        $getters: {
            category: {
                $cascade: {
                    type: Object,
                    model: 'Category',
                    primaryKey: 'categoryId',
                },
            },
        },
    },
})

model.Post.service('post/detail', { id: 666 }, {
    id: true,
    content: true,
    category: {
        id: true,

    },
})
