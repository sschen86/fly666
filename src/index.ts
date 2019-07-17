/*

import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { User } from './entity/User'

createConnection().then(async connection => {

    console.log('Inserting a new user into the database...')



    const user = new User()
    user.name = '李四'
    user.age = 28
    user.createAt = new Date()


    // await user.save()
    console.log('Loaded users: ', await User.find())
    console.log('Loaded users: ', await User.findOne({ name: '李四' }))



}).catch(error => console.log(error))

*/


import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import router from './router'


console.info({ bodyParser })

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())

/*
app.use(async (ctx, next) => {
    ctx.res.write(JSON.stringify(ctx.req.headers))
    ctx.res.end()
    // ctx.res.end('xxx' + require('./utils/md5')('123456'))
}) */

app.listen(3000)
