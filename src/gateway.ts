
import member from '../gateways/member'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import Member from '../models/Member'

let hasConnection  = false
const gateways = {}
const sourceId = 'mock'
gatewaysInit({
    member,
})


export default async function (ctx, next) {
    const { path, query } = ctx
    const gatewayId = path.replace('/gateway/', '')
    const gateway = gateways[gatewayId]
    // console.info(ctx.request, {
    //   path: ctx.path, query: ctx.query, querystring: ctx.querystring,
    // })
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
            if (!hasConnection) {
                await createConnection()
                hasConnection = true
            }

            // console.info(ctx.request)

            await response(gatewayContext(ctx), resolve, reject)
        } catch (err) {
            if (err.message === 'PROMISE.RESOLVE' || err.message === 'PROMISE.REJECT') {
                ctx.body = body
            } else {
                console.error(err.stack)
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

function gatewayContext(ctx) {
    console.info(ctx.request.body)
    return { params: ctx.query, ctx, data: {}, model: { Member }}
}