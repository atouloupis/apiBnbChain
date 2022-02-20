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
    console.log(new Date())
    var factoryAbi=await getAbi.getAbi("0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
    const factoryContract = new web3.eth.Contract(factoryAbi, "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
    //console.log("token0 "+token0Address+" token1 "+token1Address)
    var newValue=await getSpreadsheet();
    newValue.shift();
    var sheetValue=await cleanArray(await newValue);
    for (var b=await sheetValue.length-2;b<sheetValue.length;b++){
        var volumeToBuy=23000000000000000;
        var currentToken=await sheetValue[b];
        var tokenAddress=await currentToken[4];
        var getPairBNBToken =await factoryContract.methods.getPair(WBNBAddress,tokenAddress).call();
        if(getPairBNBToken!="0x0000000000000000000000000000000000000000"){
          var pairAbiBNBToken=await getAbi.getAbi(getPairBNBToken);
        var getPairTokenBNB =await factoryContract.methods.getPair(tokenAddress,WBNBAddress).call();
        if(getPairTokenBNB!="0x0000000000000000000000000000000000000000"){
          var pairAbiTokenBNB=await getAbi.getAbi(getPairTokenBNB);
        var abiArray=await getAbi.getAbi(tokenAddress)
        if(abiArray!="Contract source code not verified"){
            const contract = new web3.eth.Contract(await abiArray, await tokenAddress);
            if (await contract.methods.decimals!=undefined){
                var decimals = await contract.methods.decimals().call();
                var resultPriceBuy1=await determine.buyPrice(await tokenAddress,volumeToBuy, await contract,await pairAbiBNBToken,await getPairBNBToken);
                resultPriceBuy1=multiplicatorBuy*await resultPriceBuy1;
                var volumeToSell=((volumeToBuy*10**-18)/await resultPriceBuy1)*10**decimals;
                var resultPriceSell1=await determine.sellPrice(await tokenAddress,await volumeToSell,await pairAbiTokenBNB,await getPairTokenBNB);
                resultPriceSell1=multiplicatorSell*await resultPriceSell1;
                var cumulativePriceLast=await getCumulative(await pairAbiBNBToken, await getPairBNBToken)
                output.avgprice.push({
                    getDate:dateNow,
                    tokenAddress:tokenAddress,
                    priceBuy:resultPriceBuy1,
                    priceSell:resultPriceSell1,
                    cumulativePriceLast:cumulativePriceLast
                });
            }
        }
    }}
    }
    if (b==sheetValue.length){
        console.log(new Date())
        return output};
}

async function getCumulative(pairAbiBNBToken,getPairBNBToken){

       const pairContract = new web3.eth.Contract(await pairAbiBNBToken, await getPairBNBToken);
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