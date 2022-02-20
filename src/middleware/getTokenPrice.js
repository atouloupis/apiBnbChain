const path=require('path');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));

var getAbi=require(path.join(__dirname,'../utils/getAbi.js'));
const determine=require(path.join(__dirname,'../utils/determinePrice.js'));
const {getSpreadsheet}=require(path.join(__dirname,'../utils/googleSheet.js'));
var qs = require('qs');
    var dateNow=new Date()
    dateNow = Date.parse(dateNow)
    dateNow=dateNow+(1*60*60*1000)
    dateNow=new Date(dateNow)
const myAddress = '0x50c69f09763E1fa792907046a09F09876c732D2a';
const pancakeSwapRouterAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
var WBNBAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
var multiplicatorBuy=1.01; //1.03;
var multiplicatorSell=0.9;
let output={avgprice:[]};

async function getTokenPrice(){
    var newValue=await getSpreadsheet();
    newValue.shift();
    var sheetValue=await cleanArray(await newValue);
    for (var b=await sheetValue.length-20;b<sheetValue.length;b++){
        var volumeToBuy=23000000000000000;
        var currentToken=await sheetValue[b];
        var tokenAddress=await currentToken[4];
        var abiArray=await getAbi.getAbi(tokenAddress);
        if(abiArray!="Contract source code not verified"){
            const contract = new web3.eth.Contract(await abiArray, await tokenAddress);
            if (await contract.methods.decimals!=undefined){
                var decimals = await contract.methods.decimals().call();
                var resultPriceBuy1=await determine.buyPrice(await tokenAddress,volumeToBuy, await contract);
                resultPriceBuy1=multiplicatorBuy*await resultPriceBuy1;
                var volumeToSell=((volumeToBuy*10**-18)/await resultPriceBuy1)*10**decimals;
                var resultPriceSell1=await determine.sellPrice(await tokenAddress,await volumeToSell);
                resultPriceSell1=multiplicatorSell*await resultPriceSell1;
                var cumulativePriceLast=await getCumulative(tokenAddress)
                output.avgprice.push({
                    getDate:dateNow,
                    tokenAddress:tokenAddress,
                    priceBuy:resultPriceBuy1,
                    priceSell:resultPriceSell1,
                    cumulativePriceLast:cumulativePriceLast
                });
            }
        }
    }
    if (b==sheetValue.length){
        return output};
}

async function getCumulative(tokenAddress){
    var factoryAbi=await getAbi.getAbi("0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
     const factoryContract = new web3.eth.Contract(await factoryAbi, "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
     //console.log("token0 "+token0Address+" token1 "+token1Address)
     var getPair =await factoryContract.methods.getPair(WBNBAddress,tokenAddress).call();
     if(getPair!="0x0000000000000000000000000000000000000000"){
       var pairAbi=await getAbi.getAbi(getPair);
       const pairContract = new web3.eth.Contract(await pairAbi, await getPair);
       var token0 = await pairContract.methods.token0().call();
   //console.log(token0)
       if(token0==WBNBAddress){
         var getPriceCumulative = await pairContract.methods.getReserves().call();
         getPriceCumulative=(await getPriceCumulative._reserve0)*10**-18
   //console.log("getPriceCumulative "+await getPriceCumulative)
         return await getPriceCumulative
       }else{
         var getPriceCumulative = await pairContract.methods.getReserves().call();
         getPriceCumulative=(await getPriceCumulative._reserve1)*10**-18
   //console.log("getPriceCumulative "+await getPriceCumulative)
         return await getPriceCumulative
       }
     }
   }
   
   async function cleanArray(array){
    return new Promise ((resolve) =>{
      var result=[]
      for (var c=0;c<array.length;c++){
        if(array[c][4]!=""){
          result.push(array[c])
        }
        if(c==array.length-1){resolve(result)}
      }
    });
    }
    




module.exports = getTokenPrice;