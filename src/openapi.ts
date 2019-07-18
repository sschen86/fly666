
import gateway from './gateway'

const openapis = {}


const config = {
    async response(ctx, resolve, reject) {
        resolve(gateway.getConfig(ctx.data))
    },
}

const configs = {
    all: {
        async response(ctx, resolve, reject) {
            resolve({
                cc: 111,
            })
        },
    },
    one: {
        async response(ctx, resolve, reject) {
            console.info(ctx.data)
            resolve(gateway.getConfig(ctx.data))
        },
    },
}


openapisInit({
    config,
    configs,
})

export default async function (ctx, next) {
    const { path, query } = ctx
    const openapiId = path.replace('/openapi/', '')
    const openapi = openapis[openapiId]

    if (!openapi) {
        ctx.body = { code: 404, message: '接口不存在' }
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
            ctx.body = { code: 503, message: err.message }
        }
    }
    return

    function resolve(data) {
        body = { code: 200, data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = 500) {
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
            for (const name in childConfigs) {
                const openapiId = [namespace, ...name.replace(/[A-Z]/g, (val) => `_${val.toLowerCase()}`).split('_')].join('/')
                openapis[openapiId] = childConfigs[name]
            }
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