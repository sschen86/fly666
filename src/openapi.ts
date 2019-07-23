
import gateway from './gateway'
import Codes from './codes'

const openapis = {}


const config = {
    async response(ctx, resolve, reject) {
        resolve(gateway.getClientConfig(ctx.data))
    },
}

const configs = {
    async response(ctx, resolve, reject) {
        resolve({
            cc: 111,
        })
    },
}

const clientGatewayConfig = {
    async response(ctx, resolve, reject) {
        resolve(gateway.getProductionConfig())
    },
}



openapisInit({
    config,
    configs,
    'client-gateway-config': clientGatewayConfig,
})

export default async function (ctx, next) {
    const { path, query } = ctx
    const openapiId = path.replace('/openapi/', '')
    const openapi = openapis[openapiId]

    if (!openapi) {
        ctx.body = Codes.HTTP404
        return
    }

    let body
    try {
        const { response } = openapi
        await response(context(ctx), resolve, reject)
    } catch (err) {
        if (err.message === 'PROMISE.RESOLVE' || err.message === 'PROMISE.REJECT') {
            ctx.body = body
        } else {
            console.error(err.stack)
            ctx.body = { ...Codes.ERROR_SYSTEM, message: err.message }
        }
    }
    return

    function resolve(data) {
        body = { ...Codes.SUCCESS, data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = Codes.ERROR.code) {
        body = { message, code }
        throw new Error('PROMISE.REJECT')
    }
}

function openapisInit(configs) {
    for (const namespace in configs) {
        const childConfigs = configs[namespace]
        if (typeof childConfigs.response === 'function') {
            const openapiId = namespace
            openapis[openapiId] = childConfigs
        } else {
            /*
            for (const name in childConfigs) {
                const openapiId = [namespace, ...name.replace(/[A-Z]/g, (val) => `_${val.toLowerCase()}`).split('_')].join('/')
                openapis[openapiId] = childConfigs[name]
            } */
        }
    }
    // console.info(openapis)
}

function context(ctx) {
    // console.info(ctx.request)
    return { params: ctx.query, ctx, data: ctx.request.body }
}

// openapi/configs/all
// openapi/configs/one