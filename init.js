'use strict';
const fs   = require('fs');
var config = require('./config')
var crypto = require('crypto');

// var apiUrl  = 'http://127.0.0.1:3000/v1/sys/heartbeat';
// var apiBody = JSON.stringify({"method":"server_info","params":[]});

// var appKeyObj   = config.appKey;
// var apiRequest  = Buffer.from(apiUrl).toString('base64') + 
//                   Buffer.from(apiBody).toString('base64');

// var hmac = crypto.createHmac('sha512', appKeyObj);
// var data = hmac.update(apiRequest);

// var gen_hmac= data.digest('hex');


// console.log(gen_hmac);


// 1 请求监管系统接口
const request = require('request');
request(config.superVisionKeyUrl, function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
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



//

