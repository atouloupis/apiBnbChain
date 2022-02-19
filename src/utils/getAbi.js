module.exports.getAbi = getAbi;

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function getAbi(contractAddress){
const promiseAbi = new Promise((resolve, reject) => {

  var url="https://api.bscscan.com/api?module=contract&action=getabi&apikey=7VER72M88Q2SKS9Y7XXD2MBXSK8URP5AEH&address="+contractAddress;
  fetch(url)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Get ABI Looks like there was a problem. Status Code: ' + response.status);
          resolve(false);
        }
      // Examine the text in the response
      response.json().then(function(data) {
	var abi=data.result;
        if (abi=='Contract source code not verified'){resolve(abi);}else{
//console.log(abi)
	  var abiparse=JSON.parse(abi);
          resolve(abiparse);
        }
      });
    }
  )
  .catch(function(err) {
    resolve(false);
    console.log('Fetch Error :-S', err);
  });
});
return promiseAbi;
}

