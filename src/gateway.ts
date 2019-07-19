
import watch from 'node-watch'
import * as path from 'path'
import * as fs from 'fs'

import 'reflect-metadata'
import { createConnection } from 'typeorm'
import models from './models'

const configs = {}
const baseDir = path.resolve('gateways') + '\\'

let hasConnection = false
let gatewayType = 'mock'
let gatewayIsMock = gatewayType === 'mock'

imports()

watch('gateways', { recursive: true, filter: /\.ts$/ }, function (e, name) {
    reload(name)
})

// console.info({ configs })

gateway.getClientConfig = getClientConfig

export default gateway

async function gateway(ctx, next) {
    const { path, query } = ctx
    const code = path.replace('/gateway/', '')
    const config = configs[code]
    if (!config) {
        ctx.body = { code: 404, message: '接口不存在' }
        return
    }

    const gatewayConfig = config[gatewayType]
    if (!gatewayConfig) {
        ctx.body = { code: 404, message: '接口数据源未定义' }
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
                    ctx.body = { code: 503, message: err.message }
                }
            }
            return
        }
    }

    function resolve(data) {
        body = { code: 200, data }
        throw new Error('PROMISE.RESOLVE')
    }

    function reject(message, code = 500) {
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

    console.info('99999', code, config)

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