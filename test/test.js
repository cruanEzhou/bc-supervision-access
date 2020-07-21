'use strict';
const fs   = require('fs');
var config = require('../config')
var crypto = require('crypto');

var chainsqlAPI= require("../util/chainsql-api")

// const ChainsqlAPI = require('chainsql');
// const c           = new ChainsqlAPI();

// 测试代码
const BCSupervisionAPI = require('../upload-api/bc-supervision');
const { timeStamp, assert } = require('console');


async function getKey(){

        // 1 请求监管系统接口
        const request = require('request');
        request(config.superVisionKeyUrl, function (error, response, body) {
            if(error){
                console.error('getKey error:', error); // Print the error if one occurred
                return ;
            }
           
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.

            const jsonObj = JSON.parse(body);
            // 2 获取appKey
            if(jsonObj.code == 0){

                if(jsonObj.data != undefined && jsonObj.data.appKey != undefined){
                
                    // 3 将appKey存入配置文件
                    let data = JSON.stringify(jsonObj.data);
                    fs.writeFileSync('./config/appKey.json', data, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                    });

                }else{
                    console.error("格式错误",JSON.stringify(jsonObj));
                }

            }else{
                console.error(jsonObj.message);
            }
        });

}

async function wordDetect(){

    var content = {        "Account": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
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
    
    // 1 1000 敏感词检测
    BCSupervisionAPI.wordDetection([txInfo]);

}

async function infoReport(){

    try{

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

        var txInfo = {
            "txHash":   "51534A8184554D4AE26954D84E1584DE3A09712B51151D5781848F998B57E8A4",
            "fromAcct": "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "toAcct":   "zHb9CJAWyB4zj91VRWn96DkukG4bwdtyTh",
            "content":  JSON.stringify(content),
            "type":     "normal",
            "op":       "accept",
            "createdAt": 1585387890
        }
       await  BCSupervisionAPI.infoReport(txInfo);


    }catch(e){

        console.error(e);
    }

}



async function inspectionReport(){

}



async function testSignV2(){


//     {"method":"GET","url":"/v1/sys/inspection/9f245b4aaf6243a3a8bb7ca23f784995","header":{"authorization":
//"JG-608421dec2e280586914ac4e056b969a0a7ce7be35321e7f46c705e94523b883e959a6b1a57fd50a1c735446676b4e552376c1eba640ad579c008a3deeab10ae-1595322002256",
//"authorization_v2":"JG-3c1a05036ad9fca201d16d8e22ba7b7c23ffded38bf20f1e8c170f1222ac1c7c56312f9408ffe16613ccbe132dcf072bce0f863810d97334f85304c4b7796969-1595322002256-258146","host":"39.104.75.249:3001","connection":"Keep-Alive","accept-encoding":"gzip","user-agent":"okhttp/3.14.7"}}
// appKey:  8OnBjEUMLrrPVEjpXrm8+hLYLnTX1K+yoDV4Bv4st56X1B4H4tXSJQkjwn6/5Db0GmbZX6QHlssO5TVwXpG4jA==
// apiUrl:  /v1/sys/inspection/9f245b4aaf6243a3a8bb7ca23f784995
// apiBody:  {}
// calSignature:  6d46311a54636fbaac8c23b8497191850c3f58fb457c7649dfadd94bf61dbd797fbc74f9dd24c40222989e38e115513f82ae5935f851e8679ee87b1136aad267
// Signature:  3c1a05036ad9fca201d16d8e22ba7b7c23ffded38bf20f1e8c170f1222ac1c7c56312f9408ffe16613ccbe132dcf072bce0f863810d97334f85304c4b7796969
// 权限认证失败


    var authorizationV2 = "JG-b23362d7507902ec553367d3830d89230a288670e6c4d73f41568a0abaf742f12b22fc67d9871a4fd54c9023de841d78c691ede8652fdc8c572e8ed7f3367b0d-1595310000394-261459";
    var arr = authorizationV2.toString().split("-");


    var appKey   = "8OnBjEUMLrrPVEjpXrm8+hLYLnTX1K+yoDV4Bv4st56X1B4H4tXSJQkjwn6/5Db0GmbZX6QHlssO5TVwXpG4jA==";
    var API_URL  = "/v1/sys/inspection/9f245b4aaf6243a3a8bb7ca23f784995";
    var API_BODY = '';

    var Timestamp = '1595322002256';
    var Nonce     = '258146';

    var Requests = [API_URL,API_BODY,Timestamp,Nonce];
    
    Requests.sort();

    var requestStr = "";

    for(var i=0;i<Requests.length;i++){
        requestStr += Requests[i];
    }
    
    console.log(requestStr);
    

    var hmac = crypto.createHmac('sha512', appKey);
    var data = hmac.update(requestStr);

    var gen_hmac= data.digest('hex');
    console.log("gen_hmac:",gen_hmac);

}

async function testSign(){
        
    // String body  = "{\"taskId\":\"bd593933b91040fcb06739da3e057922\",\"checkpoint\":0}";
    // String requestStr = util.getRequestBase64("/v1/sys/heartbeat", body);
    // String sign = util.hmacSHA512(requestStr, );

    // System.out.println(sign);


    var appKeyObj   = "8OnBjEUMLrrPVEjpXrm8+hLYLnTX1K+yoDV4Bv4st56X1B4H4tXSJQkjwn6/5Db0GmbZX6QHlssO5TVwXpG4jA==";
    var apiBody     = "{\"taskId\":\"bd593933b91040fcb06739da3e057922\",\"checkpoint\":1}";

    var apiRequest  = Buffer.from("/v1/sys/heartbeat").toString('base64') + 
                      Buffer.from(apiBody).toString('base64');

   console.log("apiRequest ",apiRequest);

    var hmac = crypto.createHmac('sha512', appKeyObj);
    var data = hmac.update(apiRequest);

    var gen_hmac= data.digest('hex');
    console.log("gen_hmac:",gen_hmac);
    
    // var hmac2 = crypto.createHmac("sha512", appKeyObj);
    // var signed = hmac2.update(new Buffer("L3YxL3N5cy9oZWFydGJlYXQ=eyJ0YXNrSWQiOiJiZDU5MzkzM2I5MTA0MGZjYjA2NzM5ZGEzZTA1NzkyMiIsImNoZWNrcG9pbnQi", 'utf-8')).digest("hex");
    

    
    // console.log(signed);

}

async function testChainSQL(){


    try{

        await chainsqlAPI.initChainsqlAPI();
        // 
        var blocksInfo = await  chainsqlAPI.getBlocksInfo(0 ,10);
        console.log(JSON.stringify(blocksInfo));

    }catch(e){

        console.error(e);
    }



}




async function test(){

        //  await getKey();
          await wordDetect();    
          await infoReport();
        //  await inspectionReport();
        //  await testSign();
        //  await testChainSQL();
        //  await testSignV2();
}

test();


