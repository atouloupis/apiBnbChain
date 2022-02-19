
module.exports.getTokenPrice = getTokenPrice;
module.exports.priceHashSell= priceHashSell;

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require("path");
var getAbi=require(path.join(__dirname,'./getAbi.js'));
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));

async function priceHashSell(tokenAddress,txReceip,abiArray) {
var tx=await getTx(txReceip.transactionHash)
if (await tx!=null){
if (txReceip.status==true && await tx.input.substring(0, 10)=="0x791ac947"){
  var values = await getValuesSell(txReceip)
  if (await values.spend!=undefined && await values.received!=undefined){
//console.log(await values.spend)
//console.log(tokenAddress)
    var contract = new web3.eth.Contract(await abiArray, tokenAddress);
    if (await contract.methods.decimals!=undefined){
      var decimals = -(await contract.methods.decimals().call());
    }
    else{var decimals=-18}
//console.log(await decimals)
    var spendWei=await values.spend*10**decimals;;
//console.log(spendWei)
    var receivedWei=await values.received*10**(-18);
//console.log(receivedWei)
    var price=await receivedWei/await spendWei;
  return await price;
  }
  else{return false}
}
else{return false}
}
else{
return false
}
}

async function getTokenPrice(tokenAddress){
  var abiArray=await getAbi.getAbi(await tokenAddress);
if (abiArray!="Contract source code not verified"){
  var url="https://api.bscscan.com/api?module=account&action=tokentx&contractaddress="+tokenAddress+"&page=1&offset=1000&startblock=0&endblock=latest&sort=desc&apikey=7VER72M88Q2SKS9Y7XXD2MBXSK8URP5AEH";
  var response = await fetch(url);
  if (await response.status!=200){console.log('getTxHash Looks like there was a problem. Status Code: ' + response.status);}
  var data = await response.json();
  for(var i=0;i<data.result.length;i++){
    var receipt=await getReceipt(await data.result[i].hash);
    if(await receipt!=null && await receipt.to=="0x10ed43c718714eb63d5aa57b78b54704e256024e"){
        var price = await priceHashSell(tokenAddress,receipt, await abiArray);
       if (await price!=false){
        return await price;
        break
      }
    }if (i==data.result.length-1){return false;}
  }
}
else{return false;}
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getReceipt(transactionHash)
{
  return new Promise ((resolve) =>{
    web3.eth.getTransactionReceipt(transactionHash).then(function (receipt){
    resolve(receipt);
    });
  });
}

function getTx(transactionHash)
{
  return new Promise ((resolve) =>{
    web3.eth.getTransaction(transactionHash).then(function (tx){
    resolve(tx);
    });
  });
}

function getValuesSell(txReceip)
{
  return new Promise ((resolve) =>{
var spend=0;
    for (j=0;j<txReceip.logs.length;j++){
var from=hexto64hex(txReceip.from);
if (txReceip.logs[j].topics[2]!=undefined){
      if (txReceip.logs[j].topics[0]=='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && txReceip.logs[j].topics[2]=='0x00000000000000000000000010ed43c718714eb63d5aa57b78b54704e256024e'){
var received=parseInt(txReceip.logs[j].data,16)
}
      if (txReceip.logs[j].topics[0]=='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && txReceip.logs[j].topics[1]==from){
spend=parseInt(txReceip.logs[j].data,16)+spend;
}}
   }
var values={"received":received,"spend":spend}
//console.log(values)
resolve (values);
  });
}

function hexto64hex(str) {
  const tab = str.split('0x');
  var end=tab[1];
  const zeroNumber = 64-end.length;
  for (var l=0;l<zeroNumber;l++)
  {
    end="0"+end;
  }
  end = "0x"+end;
return end;
}

