const fs   = require('fs');
const path = require('path');

function getAppKey(){

  try{

    var appKeyJson = JSON.parse(fs.readFileSync(path.join(__dirname, './appKey.json')));

    return appKeyJson.appKey;
  }catch(e){

    console.error(e);
    return "";
  }
}


module.exports = {
  port: 3001,
  appKey:getAppKey(),
  chainsqlWsUrl:"ws://127.0.0.1:16006",
  apiUrl:"http://39.104.75.249:3001",
  superVisionUrl:"http://114.55.142.90:80",
  superVisionKeyUrl: "http://114.55.142.90:80/v1/reg/key",
  superVisionKWUrl: "http://114.55.142.90:80/v1/reg/kw",
  superVisionReportUrl: "http://114.55.142.90:80/v1/reg/report",
  superVisionInspReportUrl: "http://114.55.142.90:80/v1/reg/inspection/report"
}
