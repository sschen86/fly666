
import member from '../gateways/member'
import Member from '../models/Member'


const gateways = {}
const sourceId = 'mock'
gatewaysInit({
    member,
})


export default async function (ctx, next) {
    const { url } = ctx.request
    const gatewayId = url.replace('/gateway/', '')
    const gateway = gateways[gatewayId]

    if (!gateway) {
        ctx.body = { code: 404, message: '接口不存在' }
        return
    }

    const sources = gateway[1]
    const gatewayConfig = sources[sourceId]

    if (!gatewayConfig) {
        ctx.body = { code: 404, message: '接口数据源未定义' }
        return
    }

    let body = {}

    // mock源
    const { response } = gatewayConfig
    if (typeof response === 'function') {
        try {
            await response({ params: {}, headers: {}, model: { Member }}, resolve, reject)
        } catch (err) {
            if (err.message === 'PROMISE.RESOLVE' || err.message === 'PROMISE.REJECT') {
                ctx.body = body
            } else {
                ctx.body = { code: 503, message: err.message }
            }
        }
        return
    }

    function resolve(data) {
        const { resAdapter } = gatewayConfig
        body = { code: 200, data: resAdapter ? resAdapter(data) : data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = 500) {
        body = { message, code }
        throw new Error('PROMISE.REJECT')
    }
}


function gatewaysInit(configs) {
    for (const namespace in configs) {
        const childConfigs = configs[namespace]
        for (const name in childConfigs) {
            const gatewayId = [namespace, ...name.replace(/[A-Z]/g, (val) => `_${val.toLowerCase()}`).split('_')].join('/')
            gateways[gatewayId] = childConfigs[name]
        }
    }
}