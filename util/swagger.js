const router = require('koa-router')() //引入路由函数
const path = require('path')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerDefinition = {
    info: {
        title: '区块链监管平台api接口',
        version: '1.0.0',
        description: 'API',
    },
    host: 'localhost:3000',
    basePath: '/' // Base path (optional)
};
const options = {
    swaggerDefinition,
    apis: [path.join(__dirname,'../routes/*.js'),path.join(__dirname,'../controller/*.js'),
           './parameters.yaml'], 
};
const swaggerSpec = swaggerJSDoc(options)

//console.log(swaggerSpec);

// 通过路由获取生成的注解文件
router.get('/swagger.json', async function (ctx) {
    ctx.set('Content-Type', 'application/json');
    ctx.body = swaggerSpec;
})
module.exports = router