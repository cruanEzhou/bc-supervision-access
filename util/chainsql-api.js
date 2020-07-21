'use strict'
const ChainsqlAPI = require('chainsql');
var config        = require('../config')
const c           = new ChainsqlAPI();


const CHECK_NUMS = 20


async function initChainsqlAPI(){

    try{
        var wsUrl = config.chainsqlWsUrl;
        await c.connect(wsUrl);
        console.log(wsUrl , "连接成功" )
    
    }catch(e){

        console.log(wsUrl , "连接失败" )
        console.error(e);
    }
}


function getTxSrcAndDes(tx){

    // 需要区分每一种交易类型，暂时只处理payment交易
    if(tx.type === "payment"){

        return {fromAcct:tx.address,toAcct:tx.specification.destination.address};

    }else{

        return {fromAcct:tx.address,toAcct:tx.address};
    }


}

// "result": [
//     {
//     "txHash":
//    "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
//     "fromAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
//     "toAcct": "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
//     "content": "包含违规内容",
//     "type": "normal",
//     "createdAt": 1585387890
//     }]

async function getTxsInfo(fromIndex,toIndex){


    // var minIndex =  372737;
    // var maxIndex =  372750;

    // fromIndex = fromIndex + minIndex;
    // toIndex   = toIndex   + minIndex;


    if(fromIndex > toIndex ){
        toIndex = await  c.getLedgerVersion();
       //toIndex = maxIndex;
    }

    var Txs = [] ;
    try{

        for(var index = fromIndex; index <= toIndex ; index++){

            const opts = {
                ledgerVersion : index,
                includeAllData : false,
                includeTransactions : true,
                includeState : false
            }
            var ledgerInfo  = await c.getLedger(opts);
            
            var date        = new Date(ledgerInfo.closeTime);
            var createdTime = date.getTime()/1000;//转换成秒；
            var Tx = {};  

            if(ledgerInfo.transactionHashes != undefined){
               
                var txs = ledgerInfo.transactionHashes;
                for(var txIndex = 0; txIndex < txs.length ; txIndex++){

                    
                    var txInfo = await c.getTransaction(txs[txIndex]);
                    var txSrcAndDes = getTxSrcAndDes(txInfo);

                    Tx.txHash      = txs[txIndex];
                    Tx.fromAcct    = txSrcAndDes.fromAcct;
                    Tx.txSrcAndDes = txSrcAndDes.txSrcAndDes;
                    Tx.type        = "normal";
                    Tx.createdAt   = createdTime;
                    Tx.content     = txInfo;
                    Txs.push(Tx);
                }
            }
        }

    }catch(e){

        console.error(e);
    }

    //console.log(JSON.stringify(blocks));
    return Txs;
}


async function getBlocksCheckInfo(checkpoint){

    var blocksCheckInfo = {} ;

    blocksCheckInfo.blocks        = [];
    blocksCheckInfo.checkpoint    = checkpoint;
    
    try{

        if(checkpoint <= 0)  checkpoint = 1;

        if(global.preCheckpoint == undefined){
            global.preCheckpoint = 0; 

            if(false){

                var minIndex =  372737;
                global.preCheckpoint = minIndex -1;
                checkpoint           = minIndex + CHECK_NUMS;              
            }
        }
     
        // [global.preCheckpoint + 1,checkpoint] 如果超过20个则分配处理
        blocksCheckInfo.blocks     = await  getBlocksInfo(global.preCheckpoint + 1 ,checkpoint);
        blocksCheckInfo.checkpoint = global.preCheckpoint + 1 + blocksCheckInfo.blocks.length;
        global.preCheckpoint       = blocksCheckInfo.checkpoint - 1;

    }catch(e){

        console.error("err getBlocksInfo", e);
    }

    return blocksCheckInfo;
}



async function getBlocksInfo(fromIndex,toIndex){
   
    var blocks = [] ;

    if(fromIndex > toIndex || fromIndex <=0){
        return blocks;
    }


    try{

        var latestIndex = await  c.getLedgerVersion();

        if(toIndex > latestIndex ){
            toIndex = latestIndex;
        }

        if(toIndex - fromIndex + 1 > CHECK_NUMS){
            toIndex = fromIndex + CHECK_NUMS - 1;
        }


        for(var index = fromIndex; index <= toIndex ; index++){

            const opts = {
                ledgerVersion : index,
                includeAllData : false,
                includeTransactions : true,
                includeState : false
            }
            var ledgerInfo  = await c.getLedger(opts);
            
            var date = new Date(ledgerInfo.closeTime);
            var createdTime = date.getTime()/1000;//转换成秒；
            var txsArr = [];  

            if(ledgerInfo.transactionHashes != undefined){

                    
                var txs = ledgerInfo.transactionHashes;
                for(var txIndex = 0; txIndex < txs.length ; txIndex++){

                    
                    var txInfo = await c.getTransaction(txs[txIndex]);

                    var txSrcAndDes = getTxSrcAndDes(txInfo);

                    txsArr.push({hash:txs[txIndex],fromAcct:txSrcAndDes.fromAcct,toAcct:txSrcAndDes.toAcct});

                }
            }

            var blockInfo = {
                height:ledgerInfo.ledgerVersion,
                hash:ledgerInfo.ledgerHash,
                parentHash:ledgerInfo.parentLedgerHash,
                createdAt:createdTime,
                txs:txsArr
            }

            blocks.push(blockInfo);
            //  console.log(JSON.stringify(ledgerInfo))
        }

    }catch(e){

        console.error(e);
    }

    //console.log(JSON.stringify(blocks));

    return blocks;

}

// data: {
//     taskId:heartbeatInfo.taskId,
//     checkpoint:12,
//     reviewType: "api",
//     blocks: [
//         {
//             height: 11,
//             hash:
//            "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
//             parentHash:
//            "0xec8e43d184e799695e723038eaf1acd7964547b65b1507c910e11e01da9bbe16",
//             createdAt: 1585387890,
//             txs: [
//                 {
//                 hash:
//             "0x128acf9e443f371b8ebfb1082384ed2b64eade57fe6611ff5c5ccf697461ddc4",
//                 fromAcct: "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7",
//                 toAcct: "0xa55d649f3fc8464a7d32193d04a7e7eb30cc6bb7"
//                 }
//             ]
//             }

//     ]
// }

module.exports = {
    initChainsqlAPI:initChainsqlAPI,
    getBlocksCheckInfo:getBlocksCheckInfo,
    getBlocksInfo:getBlocksInfo,
    getTxsInfo:getTxsInfo
};