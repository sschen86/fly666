import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import router from './router'


// onsole.info({ koaBody })

const app = new Koa()

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', ctx.headers.origin) // 如果需要使用跨域cookie，那么这里不能使用`*`
    ctx.set('Access-Control-Allow-Headers', 'content-type')
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH')
    ctx.set('Access-Control-Allow-Credentials', 'true')
    await next()
})
app.use(koaBody({
    multipart: true,
    formLimit: '5m',
}))
app.use(router.routes())
app.listen(666)
