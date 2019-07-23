
import * as fs from 'fs'
import * as path from 'path'
import * as proxy from 'koa-better-http-proxy'

import watch from 'node-watch'
import 'reflect-metadata'
import { createConnection } from 'typeorm'

import Codes from './Codes'
import models from './models'

const gatewayBaseDir = path.resolve('gateways') + '\\'
const gatewayConfigsDir = gatewayBaseDir + 'children\\'
const globalGatewayConfigFile = gatewayBaseDir + 'config.js'

let globalGatewayConfig = null
let gatewayConfigs = {}
let gatewayType = null
let dbIsReady = false


loadGlobalGatewayConfig()
loadGatewayConfigs()


watch(globalGatewayConfigFile, function (e, name) {
    loadGlobalGatewayConfig()
})

watch(gatewayConfigsDir, { recursive: true, filter: /\.js$/ }, function (e, filePath) {
    reloadGatewayConfig(filePath)
})

gateway.getClientConfig = getClientConfig

export default gateway


function loadGlobalGatewayConfig() {
    const code = fs.readFileSync(globalGatewayConfigFile, { encoding: 'utf-8' })
    globalGatewayConfig = {
        // eslint-disable-next-line no-new-func
        code, object: Function(code)(),
    }

    gatewayType = globalGatewayConfig.object.development
    // console.info({ globalGatewayConfig, gatewayType })
}

function loadGatewayConfigs() {
    const fileNames = fs.readdirSync(gatewayConfigsDir)
    fileNames.forEach((fileName) => reloadGatewayConfig(gatewayConfigsDir + fileName))
}

function reloadGatewayConfig(filePath) {
    const code = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const gatewayCode = path.basename(filePath, '.js').replace(/-/g, '/')

    gatewayConfigs[gatewayCode] = {
        code,
        // eslint-disable-next-line no-new-func
        object: Function(code)(),
    }
}

async function gateway(ctx, next) {
    const { path, query } = ctx
    const gatewayCode = path.replace('/gateway/', '')

    const gatewatyConfigObject = gatewayConfigs[gatewayCode].object
    if (!gatewatyConfigObject) {
        ctx.body = Codes.HTTP404
        return
    }

    let body = {}

    if (gatewatyConfigObject.mockjson) {
        const { response } = gatewatyConfigObject.mockjson
        try {
            await response(responseContext(ctx), resolve, reject)
        } catch (err) {

            if (err.message === 'PROMISE.RESOLVE' || err.message === 'PROMISE.REJECT') {
                ctx.body = body
            } else {
                console.error(err.stack)
                ctx.body = { ...Codes.ERROR_SYSTEM, message: err.message }
            }
        }
        return
    }

    const gatewayConfig = gatewatyConfigObject[gatewayType]
    if (!gatewayConfig) {
        ctx.body = Codes.HTTP404
        return
    }
    if (gatewayType === 'mock') {
        const { response } = gatewayConfig
        if (typeof response === 'function') {
            try {
                if (!dbIsReady) {
                    await createConnection()
                    dbIsReady = true
                }

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
    } else {
        await httpProxy(ctx)
    }

    function resolve(data) {
        body = { ...Codes.SUCCESS, data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = Codes.ERROR.code) {
        body = { message, code }
        throw new Error('PROMISE.REJECT')
    }

    async function httpProxy(ctx) {
        const { baseUrl } = globalGatewayConfig.object.sources[gatewayType]
        const [host, port] = baseUrl.replace(/^https?:\/\/|\/.*/g, '').split(':')
        const domain = baseUrl.replace(/^(https?:\/\/)|(\/.*)/g, (all, protocol) => {
            return protocol ? protocol : ''
        })
        const https = /^https:\/\//i.test(domain)
        const myPort = port ? port : (https ? 443 : 80)


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
                // console.info({ proxyReqOpts }, 'xxxxxxxxxx')
                return proxyReqOpts
            },
            proxyReqPathResolver: function (ctx) {
                return (baseUrl + gatewayConfig.url).replace(domain, '')
            },
        }))(ctx, async () => { })

    }

}

function responseContext(ctx) {
    return {
        params: ctx.query, ctx, data: ctx.request.body,
        model: models, util: {},
    }
}

function getClientConfig(ctx) {
    const { code, params } = ctx
    const gatewatyConfig = gatewayConfigs[code]

    // 没有配置项，接口不存在
    if (!gatewatyConfig) {
        return null
    }

    const cleanParams = {}
    for (const key in params) {
        if (key.startsWith('$')) {
            continue
        }
        cleanParams[key] = params[key]
    }

    return { type: gatewatyConfig.object.mockjson ? 'mockjson' : gatewayType, code: gatewatyConfig.code }
}