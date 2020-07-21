
const request = require('request');
var config = require('../config')
var chainsqlAPI= require("../util/chainsql-api")
class BCSupervisionAPI {


    //  1000 敏感词检测
    // /v1/reg/kw
    static async wordDetection(txInfos) {


        var request = require('request');
        var options = {
            'method': 'POST',
            'url': config.superVisionKWUrl,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(txInfos)
        };
        request(options, function (error, response) {

            if(error){
                console.error("wordDetection  error:",error);
                // 处理错误
                return ;
            }

            console.log(response.body);

            // var report  = {
            //     "txHash":
            //     "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
            //     "fromAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            //     "toAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            //     "content": "{}",
            //     "type": "normal",
            //     "op": "reject",
            //     "createdAt": 1585387890
            // }

            // BCSupervisionAPI.infoReport(report);

        });


        // request.post({
        //     url:     config.superVisionKWUrl,
        //     form:    txInfos
        //   }, function(error, response, body){

        //     if(error){
        //         console.error("wordDetection  error:",error);
        //         // 处理错误
        //         return ;
        //     }

        //     console.log(body);

        //     // {
        //     //     "code":0,
        //     //     "message":"ok",
        //     //     "data":{              
        //     //    "txHash":"0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4"
        //     //    ,
        //     //     "hits":[
        //     //     {            
        //     //    "txHash":"0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4"
        //     //    ,
        //     //     "trigger":false,
        //     //     "level":-1
        //     //     },
        //     //     {             
        //     //    "txHash":"0x133acf9e4438ebfb108257fe6611ff371bf5c5cc384ed2b64eade461ddc4f697"
        //     //    ,
        //     //     "trigger":true,
        //     //     "level":10
        //     //     }
        //     //     ]
        //     //     }
        //     //    }

        //     // 异步的返回结果
        //     // 1001 链前检测-违规内容上报
        //     // 如果存在问题，则将交易进行上报

        //     var report  = {
        //         "txHash":
        //         "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
        //         "fromAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
        //         "toAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
        //         "content": "{}",
        //         "type": "normal",
        //         "op": "reject",
        //         "createdAt": 1585387890
        //     }

        //     BCSupervisionAPI.infoReport(report);

        // });

        // request({
        //     url: 'http://127.0.0.1:3001/v1/reg/kw',
        //     method: 'POST',
        //     json: txInfos
        //     }).then( response => {
        //         console.log('Response', response.data);
        // });

    }

    // 1001 链前检测-违规内容上报
    /**
     *  txInfo
            {
            "txHash":
            "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
            "fromAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            "toAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            "content": "包含违规内容",
            "type": "normal",
            "op": "reject",
            "createdAt": 1585387890
            }
     */
    static async infoReport(txInfo) {

        var request = require('request');
        var options = {
            'method': 'POST',
            'url': config.superVisionReportUrl,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(txInfo)
        };
        request(options, function (error, response) {

            if(error){
                console.error("infoReport  error:",error);
                // 处理错误
                return ;
            }

            console.log(JSON.stringify(response));
            console.log(response.body);
            // var report  = {
            //     "txHash":
            //     "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
            //     "fromAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            //     "toAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
            //     "content": "{}",
            //     "type": "normal",
            //     "op": "reject",
            //     "createdAt": 1585387890
            // }
            // BCSupervisionAPI.infoReport(report);
        });

    }

    
    static async getAppKey(ctx) {


        request.get({url:config.superVisionKeyUrl, json:true}, function (e, r, user) {
            console.log(user)
        })

        ctx.body = {
            code: 200,
            msg: "登录异常"
        };
    }


    // 1003 链上监管-上报巡检结果
    static async inspectionReport() {

        var content = {        
            "Account": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "Amount": "1000000000",
            "Destination": "zKQwdkkzpUQC9haHFEe2EwUsKHvvwwPHsv",
            "Fee": "10",
            "Flags": 2147483648,
            "LastLedgerSequence": 132,
            "Sequence": 84,
            "Raw": "春心荡漾",
            "TransactionType": "Payment",
            "TxnSignature": "3045022100CEF2B82D019B9A147EDB785841C46D3AC99769E18968666F3EAB9C3709B4592802204C374B96CA8FBAA92FE66C6ABAD287EB675F2F1A3B8900BE3B733821B75F6E65",
            "date": 1585387890,
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

        // 受监管链处理完巡检任务后，通过该接⼝向监管系统汇报巡检结果。已经上报的数据不⽤重复上传。
        //var Txs = await  chainsqlAPI.getTxsInfo(1,0);
        var txInfo = {
            "txHash":   "51534A8184554D4AE26954D84E1584DE3A09712B51151D5781848F998B57E8A4",
            "fromAcct": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "toAcct":   "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "content":  JSON.stringify(content),
            "type":     "normal",
            "createdAt": 1585387890
        }

        var params = {
            "taskId": global.taskId,
            "success": true,
            "message": "成功",
            "status": true,
            "result": [txInfo]
        };
        var apiUrl  = config.superVisionInspReportUrl;
        var apiBody = JSON.stringify(params);

        var options = {
            'method': 'POST',
            'url': apiUrl,
            'headers': {
              'Content-Type': 'application/json'
            },
            body: apiBody  
          };
          request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log("inspectionReport ");
                console.log(response.body);
          });
        
    }


    static async startInspection(taskId) {

        // 开启关键词检查
        var content = {        
            "Account": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "Amount": "1000000000",
            "Destination": "zKQwdkkzpUQC9haHFEe2EwUsKHvvwwPHsv",
            "Fee": "10",
            "Flags": 2147483648,
            "LastLedgerSequence": 132,
            "Sequence": 84,
            "Raw": "春心荡漾",
            "TransactionType": "Payment",
            "TxnSignature": "3045022100CEF2B82D019B9A147EDB785841C46D3AC99769E18968666F3EAB9C3709B4592802204C374B96CA8FBAA92FE66C6ABAD287EB675F2F1A3B8900BE3B733821B75F6E65",
            "date": 1585387890,
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
        
        var txInfo = {};
        txInfo.txHash  = "51534A8184554D4AE26954D84E1584DE3A09712B51151D5781848F998B57E8A4";
        txInfo.content = JSON.stringify(content);
        
        // 敏感词检测
        await BCSupervisionAPI.wordDetection([txInfo]);

        // // 没有异常的信息不需要进行上报

    
        // 结束后进行上报
        await BCSupervisionAPI.inspectionReport();

        global.inspectionStatus = "complete";
    }


}
exports = module.exports = BCSupervisionAPI;