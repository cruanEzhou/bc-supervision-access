'use strict';
var crypto = require('crypto');
var config = require('../config')
var chainsqlAPI= require("../util/chainsql-api")

const BCSupervisionAPI = require('../upload-api/bc-supervision');

// status: complete表示巡检完成，failure表示询巡检失败，processing表示巡检执⾏中，none表
// 示巡检任务已取消

const  INSPECTION_STATUS_COMPLETE   = "complete";
const  INSPECTION_STATUS_FAILURE    = "failure";
const  INSPECTION_STATUS_PROCESSING = "processing";
const  INSPECTION_STATUS_NONE       = "none";

const INTERVA_TM = 1000 * 60 * 60 // 1h

class InspectionController {

    /**
     * @swagger
     *
     * definitions:
     *   Success:
     *     type: object
     *     required:
     *       - success
     *       - message
     *     properties:
     *       success:
     *         type: boolean
     *       message:
     *         type: string
     *         default: "ok"
     *   Failure:
     *     type: object
     *     required:
     *       - success
     *       - message
     *     properties:
     *       success:
     *         type: boolean
     *       message:
     *         type: string
     *         default: "失败原因"
     *   Transaction:
     *     type: object
     *     required:
     *       - hash
     *       - fromAct
     *       - toAct
     *     properties:
     *       hash:
     *         type: boolean
     *       fromAcct:
     *         type: string
     *       toAcct:
     *         type: string
     *   HeartbeatData:
     *     type: object
     *     required:
     *       - taskId
     *       - checkpoint
     *       - blocks
     *     properties:
     *       taskId:
     *         type: string
     *       checkpoint:
     *          type: "integer"
     *          format: "int64"
     *       blocks:
     *          type: "array"
     *          items:
     *              $ref: "#/definitions/Block"
     *   Heartbeat:
     *     type: object
     *     required:
     *       - success
     *       - message
     *       - data
     *     properties:
     *       success:
     *         type: boolean
     *       message:
     *         type: string
     *       data:
     *         $ref: "#/definitions/HeartbeatData"
     *   Block:
     *      type: object
     *      properties:
     *        height:
     *          type: "integer"
     *          format: "int64"
     *        hash:
     *          type: "string"
     *        parentHash:
     *          type: "string"
     *        createdAt:
     *          type: "integer"
     *          format: "int64"
     *        txs:
     *          type: "array"
     *          items:
     *              $ref: "#/definitions/Transaction"
     *   inspectionSuccess:
     *      type: object
     *      properties:
     *        success:
     *          type: boolean
     *        message:
     *          type: string
     *          default: "ok"
     *        data:
     *          type: object
     *          properties:
     *            status:
     *              type: "string"
     *              enum:
     *              - "complete"
     *              - "failure"
     *              - "processing"
     *              - "none"   
     */


    /**
     * basic auth 验证的方式
     * @param {*} authorizationField http 请求的Authorization 字段
     */
    static async authorizationVerify(ctx){

        try{

            const clientIP = ctx.request.ip;
            console.log("clientIP: ",clientIP);
            console.log(JSON.stringify(ctx.request));

            //   var API_URL  = "/v1/sys/heartbeat";
            //   var API_BODY = '{"taskId":"bd593933b91040fcb06739da3e057922","checkpoint":33}';
            var API_URL  = ctx.request.url;
            var API_BODY = JSON.stringify(ctx.request.body);

            if( API_BODY === '{}'){
                API_BODY = '';
            }

            var authorizationField = ctx.get('authorization_v2');
           //var authorizationV2 = "JG-b23362d7507902ec553367d3830d89230a288670e6c4d73f41568a0abaf742f12b22fc67d9871a4fd54c9023de841d78c691ede8652fdc8c572e8ed7f3367b0d-1595310000394-261459";
            var arr = authorizationField.toString().split("-");
            if(arr.length != 4){

                console.error("authorization_v2 字段 格式错误",authorizationField);
                return false;
            }


            var Signature = arr[1];
            var Timestamp = arr[2];
            var Nonce     = arr[3]; 
            var Requests  = [API_URL,API_BODY,Timestamp,Nonce];   
            Requests.sort(); 
            var requestStr = "";
            for(var i=0;i<Requests.length;i++){
                requestStr += Requests[i];
            }
                
            var hmac         = crypto.createHmac('sha512', config.appKey);
            var data         = hmac.update(requestStr); 
            var calSignature = data.digest('hex');

            console.log("appKey: ",   config.appKey);
            console.log("apiUrl: "   ,API_URL);
            console.log("apiBody: "  ,API_BODY);
            console.log("calSignature: " , calSignature);
            console.log("Signature: "    , Signature);

            if(calSignature ===  Signature){
                return true;
            }else{
                console.log("权限认证失败");
                return false;
            }

        }catch(e){
            console.error(e);
            return false;
        }
  
    }

    /**
     * @swagger
     * /v1/sys/inspection:
     *   get:
     *     description: 链上监管-下达获取巡检状态
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: taskId 
     *         description: 任务id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: 成功响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/inspectionSuccess'
     *       400:
     *         description: 失败响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Failure'
     */
    static async getInspection(ctx) {

        // 权限验证
        var bVerified = await InspectionController.authorizationVerify(ctx);
        if(!bVerified){

            ctx.body = {
                code: 1,
                msg: "权限认证失败"
            };
            return ;
        }

        console.log(JSON.stringify(ctx.params));

        var taskIdInfo  = ctx.params;
        if( taskIdInfo === undefined  ||  taskIdInfo.taskId === undefined){
            
            ctx.body = {
                success: false,
                message: "Params taskId not found!"
            };
            return ;
        }


        if(global.taskId === undefined || global.taskId === "" || global.taskId != taskIdInfo.taskId ){
    
            ctx.body = {
                success:true,
                message:"ok",
                data:{
                    status: INSPECTION_STATUS_NONE
                }
            };
            return ;
        }
        //  判断 taskIdInfo.taskId 的修改状态
        var inspectionStatus = INSPECTION_STATUS_NONE;
        if(global.inspectionStatus != undefined){
            inspectionStatus = global.inspectionStatus;
        }

        //  1008 链上监管-下达获取巡检状态
        ctx.body = {
            success:true,
            message:"ok",
            data:{
                status: inspectionStatus
            }
        };

        // 状态需要根据发送来的指令的执行情况来判断
        //  status: complete表示巡检完成，failure表示询巡检失败，processing表示巡检执⾏中，none表示巡检任务已取消
    }

    /**
     * @swagger
     * /v1/sys/inspection:
     *   post:
     *     description: 链上监管-下达巡检指令
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: taskId 
     *         description: 任务id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: 成功响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Success'
     *       400:
     *         description: 失败响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Failure'
     */
    static async inspection(ctx) {

        //  1002 链上监管-下达巡检指令
        // 权限验证
        var bVerified = await InspectionController.authorizationVerify(ctx);
        if(!bVerified){

            ctx.body = {
                code: 1,
                msg: "权限认证失败"
            };
            return ;
        }

        console.log(JSON.stringify(ctx.request))
        console.log(JSON.stringify(ctx.request.body))

        var taskIdInfo       = ctx.request.body;
        if(taskIdInfo.taskId != undefined){

        
            // 1 循检的周期 必须大于等于 1 小时
            if(global.taskStartTime != undefined && (Date.now() - global.taskStartTime < INTERVA_TM) ){

                ctx.body = {
                    success: false,
                    message: "两次请求间隔时间太短"
                };
                return ;
            }
            // 2 一个任务尚未执行完毕，不能开启第二个任务


            global.inspectionStatus = INSPECTION_STATUS_PROCESSING;
        
            setTimeout(function(){
               
                global.taskStartTime = Date.now();
                // 存储  taskIdInfo.taskId  
                global.taskId = taskIdInfo.taskId;
                BCSupervisionAPI.startInspection(global.taskId);
            },60000);
             
           
            // 存全局变量 
            ctx.body = {
                success: true,
                message: "ok"
            };

        }else{

            ctx.body = {
                success: false,
                message: "请求格式错误"
            };
        }


        // a55d649f3fc8464a7d32193d04a7e7
        // 记录
        // {
        //     "taskId": "a55d649f3fc8464a7d32193d04a7e7"
        // }

    }


    /**
     * @swagger
     * /v1/sys/inspection:
     *   delete:
     *     description: 链上监管-下达取消巡检指令
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: taskId 
     *         description: 任务id.
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: 成功响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Success'
     *       400:
     *         description: 失败响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Failure'
     */
    static async deleteInspection(ctx) {

        //  1007 链上监管-下达取消巡检指令
        // 权限验证
        var bVerified = await InspectionController.authorizationVerify(ctx);
        if(!bVerified){

            ctx.body = {
                code: 1,
                msg: "权限认证失败"
            };
            return ;
        }

        console.log(JSON.stringify(ctx.params));

        var taskIdInfo  = ctx.params;
        if(taskIdInfo.taskId != undefined ){

            // 取消对于 任务号 :tashID 的监管
            // global.taskId      
            if(taskIdInfo.taskId === global.taskId){
                global.taskId = "";

                ctx.body = {
                    success: true,
                    message: "ok",
                };

            }else{

                var errorInfo = "未循检" + taskIdInfo.taskId;
                ctx.body = {
                    success: false,
                    message: errorInfo
                };

            }

   
        }else{
            ctx.body = {
                success: false,
                message: "格式错误"
            };

        }
    }

    /**
     * @swagger
     * /v1/sys/cmd:
     *   post:
     *     description: 下发管控指令
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: txHash 
     *         description: 交易哈希
     *         required: true
     *         type: string
     *       - name: op 
     *         description: 管控指令：destroy（过滤整个内容）、harmless(从滤敏感词转标记为⽆害)
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: 成功响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Success'
     *       400:
     *         description: 失败响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Failure'
     */
    static async cmd(ctx) {

        // 1004 下发管控指令
        // 权限验证
        var bVerified = InspectionController.authorizationVerify(ctx);
        if(!bVerified){

            ctx.body = {
                code: 1,
                msg: "权限认证失败"
            };
            return ;
        }

        console.log(JSON.stringify(ctx.request))
        console.log(JSON.stringify(ctx.request.body))
        // 属于监管的任务？一个任务只发送一个监控指令？

        var cmdInfo = ctx.request.body;
        if(cmdInfo.txHash != undefined && cmdInfo.op != undefined){

            // 管控指令：destroy（过滤整个内容）、harmless(从滤敏感词转标记为⽆害)      
            ctx.body = {
                success: true,
                message: "ok",
                data: {
                    reviewType: "api",
                    reviewUrl: config.apiUrl + "/tx?" + cmdInfo.txHash
                }
            };
        
        }else{
            ctx.body = {
                success: false,
                message: "格式错误"
            };

        }
    }

    /**
     * @swagger
     * /v1/sys/heartbeat:
     *   post:
     *     description:  ⼼跳检测
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: taskId 
     *         description: ⼼跳任务Id.
     *         required: true
     *         type: string
     *       - name: checkpoint 
     *         description: 监管系统本地保存的最新检查点，受监管链应该根据该信息确认
     *                      需返回的结果集合边界。集合边界应为(旧检查点, 最新检查点]
     *                     （左开右闭），因为checkpoint初始值为0，不同的受监管链区
     *                      块链特性不同，可能不存在0区块的概念，则可⽤1来代替0
     *         required: true
     *         type: int
     *     responses:
     *       200:
     *         description: 成功响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Heartbeat'
     *       400:
     *         description: 失败响应
     *         schema:
     *           type: object
     *           $ref: '#/definitions/Failure'
     */
    static async heartbeat(ctx) {

        // 1005 ⼼跳检测
        // 权限验证
        var bVerified = InspectionController.authorizationVerify(ctx);
        if(!bVerified){

            ctx.body = {
                code: 1,
                msg: "权限认证失败"
            };
            return ;
        }     

        console.log(JSON.stringify(ctx.request))
        console.log(JSON.stringify(ctx.request.body))

        //
        // {
        //    "taskId":"0x2345678abc12",
        //    "checkpoint": 0 
        // }
        // 
        var heartbeatInfo = ctx.request.body;
        if(heartbeatInfo.taskId != undefined && heartbeatInfo.checkpoint != undefined){

            // 存储  taskIdInfo.taskId  
            global.heartbeatId  = heartbeatInfo.taskId;   
            var checkInfo       = await chainsqlAPI.getBlocksCheckInfo(heartbeatInfo.checkpoint);
            if( checkInfo.error != undefined && checkInfo.error != "" ){

                ctx.body = {
                    success: false,
                    message: checkInfo.error
                };
                return ;
            }

            ctx.body = {
                success: true,
                message: "ok",
                data: {
                    taskId:heartbeatInfo.taskId,
                    checkpoint:checkInfo.checkpoint,
                    blocks:checkInfo.blocks
                }
            };
        
        }else{
            ctx.body = {
                success: false,
                message: "格式错误"
            };

        }

        console.log("response: ",JSON.stringify(ctx.body))
    }


    static async getTxInfo(ctx){

        let query = ctx.request.query;
        console.log(JSON.stringify(query))
        console.log(JSON.stringify(ctx.request.body))

        var content = {        
                "Account": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
                "Amount": "1000000000",
                "Destination": "zKQwdkkzpUQC9haHFEe2EwUsKHvvwwPHsv",
                "Fee": "10",
                "Flags": 2147483648,
                "LastLedgerSequence": 132,
                "Sequence": 84,
                "Raw": "内容违反相关法规，不予显示",
                "TransactionType": "Payment",
                "TxnSignature": "3045022100CEF2B82D019B9A147EDB785841C46D3AC99769E18968666F3EAB9C3709B4592802204C374B96CA8FBAA92FE66C6ABAD287EB675F2F1A3B8900BE3B733821B75F6E65",
                "date": 647503387,
                "hash": "51534A8184554D4AE26954D84E1584DE3A09712B51151D5781848F998B57E8A4",
                "inLedger": 127,
                "ledger_index": 127,
                "meta": {
                    "AffectedNodes": [],
                    "TransactionIndex": 0,
                    "TransactionResult": "tesSUCCESS",
                    "delivered_amount": "1000000000"
                },
                "status": "success",
                "validated": true
        };

        ctx.body = {
            success: true,
            message: "ok",
            data:content
        };

    }

}
exports = module.exports = InspectionController;