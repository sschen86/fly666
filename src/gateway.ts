
import watch from 'node-watch'
import * as path from 'path'
import * as fs from 'fs'

import 'reflect-metadata'
import { createConnection } from 'typeorm'
import models from './models'
import Codes from './Codes'
import globalGatewayConfig from '../config/gateway'

import * as proxy from 'koa-better-http-proxy'

const configs = {}
const baseDir = path.resolve('gateways') + '\\'

let hasConnection = false
let gatewayType = globalGatewayConfig.developmentType || 'mock'
let gatewayIsMock = gatewayType === 'mock'

console.info({ gatewayType, gatewayIsMock })

imports()

watch('gateways', { recursive: true, filter: /\.js$/ }, function (e, name) {
    reload(name)
})

// console.info({ configs })

gateway.getClientConfig = getClientConfig

export default gateway

async function gateway(ctx, next) {
    const { path, query } = ctx
    const code = path.replace('/gateway/', '')
    console.info(code, 'xxxxxxxxxxxxxxxxxxx')

    const config = configs[code].object
    if (!config) {
        ctx.body = Codes.HTTP404
        return
    }

    // console.info('xxx', config)

    const gatewayConfig = config[gatewayType]
    if (!gatewayConfig) {
        ctx.body = Codes.HTTP404
        return
    }

    let body = {}

    // mock源
    if (gatewayIsMock) {
        const { response } = gatewayConfig
        if (typeof response === 'function') {
            try {
                if (!hasConnection) {
                    await createConnection()
                    hasConnection = true
                }

                // console.info(ctx.request.body, ctx.request.files)

                await response(responseContext(ctx), resolve, reject)
            } catch (err) {
                if (err.message === 'PROMISE.RESOLVE' || err.message === 'PROMISE.REJECT') {
                    ctx.body = body
                } else {
                    console.error(err.stack)
                    ctx.body = { ...Codes.ERROR_SYSTEM, message: err.message }
                }
            }
        } else {
            ctx.body = Codes.ERROR_SYSTEM
        }
        return
    } else {
        const { baseUrl } = globalGatewayConfig.sources[gatewayType]
        const [host, port] = baseUrl.replace(/^https?:\/\/|\/.*/g, '').split(':')
        const domain = baseUrl.replace(/^(https?:\/\/)|(\/.*)/g, (all, protocol, more) => {
            return protocol ? protocol : ''
        })
        const https = /^https:\/\//i.test(domain)
        const myPort = port ? port : (https ? 443 : 80)

        // console.info({ host, port, url: baseUrl + gatewayConfig.url })
        await (proxy(baseUrl + gatewayConfig.url, {
            https,
            port: myPort,
            proxyReqOptDecorator: function (proxyReqOpts, ctx) {
                // you can update headers
                // proxyReqOpts.headers['content-type'] = 'application-x/json'
                // you can change the method
                // proxyReqOpts.method = gatewayConfig.method || 'GET'
                // you could change the path
                // proxyReqOpts.path = (baseUrl + gatewayConfig.url).replace(domain, '')


                delete proxyReqOpts.headers.referer
                proxyReqOpts.headers.origin = domain
                proxyReqOpts.headers.host = host
                // proxyReqOpts.headers.referer = proxyReqOpts.headers.referer.replace(/^https?:\/\/([^/]+)/, domain)
                console.info({ proxyReqOpts }, 'xxxxxxxxxx')
                return proxyReqOpts
            },
            proxyReqPathResolver: function (ctx) {
                return (baseUrl + gatewayConfig.url).replace(domain, '')
            },
        }))(ctx, async () => { })

    }

    function resolve(data) {
        body = { ...Codes.SUCCESS, data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = Codes.ERROR.code) {
        body = { message, code }
        throw new Error('PROMISE.REJECT')
    }
}

function responseContext(ctx) {
    return {
        params: ctx.query, ctx, data: ctx.request.body,
        model: models, util: {},
    }
}


function imports() {
    const fileNames = fs.readdirSync(baseDir)
    fileNames.forEach(name => {
        reload(name)
    })
}

function reload(name) {
    const moduleName = path.basename(name, '.js')
    const modulePath = baseDir + path.basename(name)
    const code = moduleName.replace(/-/g, '/')

    const sourceCode = fs.readFileSync(modulePath, { encoding: 'utf-8' })

    configs[code] = {
        sourceCode,
        // eslint-disable-next-line no-new-func
        object: Function(sourceCode)(),
    }
}

function getClientConfig(data) {
    const { code, params } = data
    const config = configs[code]

    // console.info('99999', code, config)

    // 没有配置项，接口不存在
    if (!config) {
        return null
    }

    const cleanParams = {}
    for (const key in params) {
        if (key.startsWith('$')) {
            continue
        }
        cleanParams[key] = params[key]
    }

    return { gatewayType, sourceCode: config.sourceCode }
}