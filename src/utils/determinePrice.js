module.exports={buyPrice,sellPrice,getPrice1};

const path = require("path");
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
const tokenPrice=require(path.join(__dirname,'./tokenPrice.js'))
var getAbi=require(path.join(__dirname,'./getAbi.js'));


async function buyPrice(tokenAddress,amount,contract)
{
//console.log("decimals")
//console.log(contract.methods.decimals)
    if (contract.methods.decimals!=undefined){
            var priceResult=await getPrice1("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",tokenAddress,amount,true)
//console.log("priceResult")
//console.log(await priceResult)
      if (await priceResult!=false){
//console.log("priceImpact"+priceResult.priceImpact)
        if(await priceResult.priceImpact>-0.001&&await priceResult.priceImpact<0.001)
        {
          return await priceResult.price;
        }
        else {return false}
      }
    else{return false}
  }
  else{return false}
}

async function sellPrice(tokenAddress,amount)
{
      var priceResult=await getPrice1(tokenAddress,"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",amount,false)
      if (await priceResult!=false){
        //console.log("sellprice estimate"+await priceResult.price)
        var getTokenPrice=await tokenPrice.getTokenPrice(tokenAddress);
        //console.log("getTokenPrice"+getTokenPrice)
        //console.log("diff sellPrice/getTokenPrice = "+await priceResult.price/await getTokenPrice)
        //console.log("priceImpact"+priceResult.priceImpact)
        if(await getTokenPrice!=false && await priceResult.price/await getTokenPrice<1.5 && await priceResult.price/await getTokenPrice>0.5 && await priceResult.priceImpact>-0.001 && await priceResult.priceImpact<0.001){
          return await priceResult.price;
        }
        else {return false}
      }
      else {return false}
}
async function compareAddress(token0Address,token1Address,token0,getReserves)
{
  if (token0Address.toLowerCase()!=await token0.toLowerCase()){
    var token0=token0Address
    var token1=token1Address
    var token0_reserve = await getReserves._reserve1;
    var token1_reserve = await getReserves._reserve0;
    return {"token0":token0,"token1":token1,"token0_reserve":token0_reserve,"token1_reserve":token1_reserve}
  }
  else{
    var token0_reserve = await getReserves._reserve0;
    var token1_reserve = await getReserves._reserve1;
    return {"token0":token0Address,"token1":token1Address,"token0_reserve":token0_reserve,"token1_reserve":token1_reserve}
  }
}

async function getPrice1(token0Address,token1Address,amount,buy)
{
  var factoryAbi=await getAbi.getAbi("0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
  const factoryContract = new web3.eth.Contract(await factoryAbi, "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73");
//console.log("token0 "+token0Address+" token1 "+token1Address)
  var getPair = await factoryContract.methods.getPair(token0Address,token1Address).call();
if(await getPair!="0x0000000000000000000000000000000000000000"){
  var pairAbi=await getAbi.getAbi(await getPair);
  const pairContract = new web3.eth.Contract(await pairAbi, await getPair);
  var getReserves = await pairContract.methods.getReserves().call();
//console.log("reserves")
//console.log(await getReserves)
  var token0 = await pairContract.methods.token0().call();
  var token1 = await pairContract.methods.token1().call();
  var resultAddress=await compareAddress(token0Address,token1Address,token0,getReserves)
//console.log(await resultAddress)
  var token0abiArray=await getAbi.getAbi(await resultAddress.token0);
  const token0contract = new web3.eth.Contract(await token0abiArray, await resultAddress.token0);
  var token0decimals = await token0contract.methods.decimals().call();

  var token1abiArray=await getAbi.getAbi(await resultAddress.token1);
  const token1contract = new web3.eth.Contract(await token1abiArray, await resultAddress.token1);
  var token1decimals = await token1contract.methods.decimals().call();

   var token0_reserve = await resultAddress.token0_reserve / (10 ** await token0decimals)
   var token1_reserve = await resultAddress.token1_reserve / (10 ** await token1decimals)
   amount= await amount/(10 ** await token0decimals)

  var constant_product = await token0_reserve * await token1_reserve
//console.log("constantProduct "+constant_product)
//console.log("token1_reserve "+token1_reserve+" token0_reserve "+token0_reserve)

  var new_token1_reserve = await constant_product / (await token0_reserve + await amount)
//console.log("amount "+await amount)
//console.log("constant_product / (await token0_reserve + await amount "+new_token1_reserve)
  var token1_out = await token1_reserve - await new_token1_reserve
//console.log("await token1_reserve - await new_token1_reserve "+token1_out)
if (buy){
var new_market_price=await amount/await token1_out;
var marketPrice=await token0_reserve/await token1_reserve
}
else{
  var marketPrice=await token1_reserve/await token0_reserve
  var new_market_price=await token1_out/await amount;
}
  /*console.log("new market price")
  console.log( new_market_price)
  console.log("marketPrice")
  console.log(marketPrice)*/
  var priceImpact=(await marketPrice/await new_market_price)-1;
  //console.log("price Impact")
  //console.log(priceImpact)
  var result={"price":await new_market_price,"priceImpact":await priceImpact}
  return await result;
}else{return false}
}
