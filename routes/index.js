var inspection = require('../controller/inspection');


module.exports =  (router) => {
  router.get('/welcome', async function (ctx, next) {
    ctx.state = {
      title: 'koa2 title'
    };

    await ctx.render('welcome', {title: ctx.state});
  })

  // 链上监管-下达获取巡检状态
  router.get('/v1/sys/inspection/:taskId', inspection.getInspection) 

  // 链上监管-下达巡检指令
  router.post('/v1/sys/inspection', inspection.inspection) 

  // 链上监管-下达取消巡检指令
  router.delete('/v1/sys/inspection/:taskId', inspection.deleteInspection)

  // 下发管控指令
  router.post('/v1/sys/cmd', inspection.cmd)

  // ⼼跳检测
  router.post('/v1/sys/heartbeat', inspection.heartbeat)


    // ⼼跳检测
    router.get('/tx', inspection.getTxInfo)


}
