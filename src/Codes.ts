// 响应专题码定义

export default class Codes {
    static SUCCESS = new Codes(0, '处理成功')
    static HTTP401 = new Codes(10404, '登录失效')
    static HTTP403 = new Codes(10403, '无权限')
    static HTTP404 = new Codes(10404, '资源不存在')
    static ERROR = new Codes(20000, '错误')
    static ERROR_SYSTEM = new Codes(10500, '系统错误')


    static stringify() {
        return JSON.stringify('SUCCESS, HTTP401, HTTP403, HTTP404, ERROR, ERROR_SYSTEM'.split(/,\s*/).reduce((codes, id) => {
            codes[id] = Codes[id].code
            return codes
        }, {}))
    }

    code: number
    message: string
    constructor(code, message) {
        this.code = code
        this.message = message
    }
}