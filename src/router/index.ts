
import * as Router from 'koa-router'

import openapi from '../openapi'
import gateway from '../gateway'



const router = new Router()

router.all('/openapi/*', openapi)

router.all('/gateway/*', gateway)


router.all('/*', async (ctx) => {
    ctx.body = { code: 404, message: '接口不存在' }
})

export default router