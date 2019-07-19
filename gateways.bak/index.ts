
export default {
    sources: {
        sgtest: {
            baseUrl: 'https://test2sop.sharegoodsmall.com/merchant-gw/',

        },
    },
}



// 错误码定义
const CODES = [
    [0, 'SUCCESS', '处理成功'],
    [10401, 'HTTP401', '用户登录失效'],
    [10403, 'HTTP403', '接口无权限'],
    [10404, 'HTTP404', '接口地址不存在'],
    [20000, 'CUSTOM ERROR', '自定义错误状态码'],
]