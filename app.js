const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')
const Moment = require("moment");
const config = require('./config')
const routes = require('./routes')

const port = process.env.PORT || config.port

const swagger = require('./util/swagger')
app.use(swagger.routes(), swagger.allowedMethods())


const koaSwagger = require('koa2-swagger-ui')
app.use(koaSwagger({
  routePrefix: '/swagger', // host at /swagger instead of default /docs
  swaggerOptions: {
    url: '/swagger.json', // example path to json 其实就是之后swagger-jsdoc生成的文档地址
 },
}))

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
  .use(json())
  .use(logger((str) => {                // 使用日志中间件
    console.log(Moment().format('YYYY-MM-DD HH:mm:ss')+str);
  }))
  .use(require('koa-static')(__dirname + '/public'))
  .use(views(path.join(__dirname, '/views'), {
    options: {settings: {views: path.join(__dirname, 'views')}},
    map: {'njk': 'nunjucks'},
    extension: 'njk'
  }))
  .use(router.routes())
  .use(router.allowedMethods())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  // const ms = new Date() - start
  // const now  = Moment().format('YYYY-MM-DD HH:mm:ss');
  // console.log(`$now ${ctx.method} ${ctx.url} - $ms`)
  // console.log('test code')
})

router.get('/', async (ctx, next) => {
  // ctx.body = 'Hello World'
  ctx.state = {
    title: 'Koa2'
  }
  await ctx.render('index', ctx.state)
})

routes(router)
app.on('error', function(err, ctx) {
  console.log(err)
  console.error('server error', err, ctx)
})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})


var chainsqlAPI = require("./util/chainsql-api")
chainsqlAPI.initChainsqlAPI();

