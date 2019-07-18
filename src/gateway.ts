
import member from '../gateways/member'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import Member from '../models/Member'

let hasConnection = false
const gateways = {}
const isMock = true
let sourceId = 'mock'
gatewaysInit({
    member,
})


export default gateway



async function gateway(ctx, next) {
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
    if (isMock) {
        const { response } = gatewayConfig
        if (typeof response === 'function') {
            try {
                if (!hasConnection) {
                    await createConnection()
                    hasConnection = true
                }

                // console.info(ctx.request.body, ctx.request.files)

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
    }

    /*
    let c2 = require('koa2-connect');
let proxy = require('http-proxy-middleware')
    c2k(proxy({
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
            '^/api/*': '^/internal/*',
        },
        logLevel: 'debug',
    }))(ctx, next)
    */


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

gateway.getConfig = getConfig


function gatewaysInit(configs) {
    for (const namespace in configs) {
        const childConfigs = configs[namespace]
        for (const name in childConfigs) {
            const gatewayId = [namespace, ...name.replace(/[A-Z]/g, (val) => `_${val.toLowerCase()}`).split('_')].join('/')
            const gateway = gateways[gatewayId] = childConfigs[name]
            const sources = gateway[1]
            if (sources.mock) {
                const mockSource = sources.mock
                mockSource.url = gatewayId
                mockSource.method = mockSource.method || 'get'
            }
        }
    }
}

function gatewayContext(ctx) {
    return { params: ctx.query, ctx, data: ctx.request.body, model: { Member }}
}

function getConfig(data) {
    const { code, params } = data
    const gateway = gateways[code]

    // 没有配置项，接口不存在
    if (!gateway) {
        return null
    }

    const cleanParams = {}
    for (const key in params) {
        if (key.startsWith('$')) {
            continue
        }
        cleanParams[key] = params[key]
    }

    if (isMock) {
        const mockConfig = gateway[1].mock
        if (mockConfig) {
            const method = mockConfig.method
            const config = {
                url: mockConfig.url,
                method: mockConfig.method,
                reqAdapter: mockConfig.reqAdapter,
                resAdapter: mockConfig.resAdapter,
                params: null,
                data: null,
            }

            return `{
                url: '${mockConfig.url}',
                method: '${mockConfig.method}',
                reqAdapter: null,
                resAdapter: null
            }`
            // return config
        } else {
            return null
        }

    }
}

