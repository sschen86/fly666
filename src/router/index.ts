
import * as Router from 'koa-router'

import gateway from '../gateway'



const router = new Router()

router.all('/openapi/*', (ctx, next) => {
    ctx.body = { code: 200, message: '开放接口' }
    next()
})

router.all('/gateway/*', gateway)


router.all('/*', async (ctx) => {
    ctx.body = { code: 404, message: '接口不存在', content: gateway }
})

export default router