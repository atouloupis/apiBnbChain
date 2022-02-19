//googleapis
const { google } = require("googleapis");
module.exports={getSpreadsheet, setSpreadsheet, setOneSpreadsheet,getAllSpreadsheet};
const path=require('path');

async function getSpreadsheet(){
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname,"../credentials.json"), //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets", 
    });
    //Auth client Object
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    // spreadsheet id
    const spreadsheetId = "1QFD3vCWIGDzo0odaP5KfgL5na3R7ufMu5ExKsufJsZI";
    //Read front the spreadsheet
    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "BestBuy!A:S", //range of cells to read from.
    })
  return await readData.data.values;
}



async function setSpreadsheet(values,line){
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname,"credentials.json"), //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    //Auth client Object
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
// spreadsheet id
const spreadsheetId = "1QFD3vCWIGDzo0odaP5KfgL5na3R7ufMu5ExKsufJsZI";
const range='BestBuy!I2:J'+line+1;
    const data = [{
      range,
      values,
    }];
    const writeData=await googleSheetsInstance.spreadsheets.values.batchUpdate({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        resource: {
            data,
            valueInputOption: "USER_ENTERED"
        },
    });
//console.log(await writeData)
return await writeData;
}

async function setOneSpreadsheet(values,column,line){
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname,"credentials.json"), //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    //Auth client Object
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
// spreadsheet id
const spreadsheetId = "1QFD3vCWIGDzo0odaP5KfgL5na3R7ufMu5ExKsufJsZI";
const range='BestBuy!'+column+line;
//console.log(range)
    const data = [{
      range,
      values,
    }];
    const writeData=await googleSheetsInstance.spreadsheets.values.batchUpdate({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        resource: {
            data,
            valueInputOption: "USER_ENTERED"
        },
    });
//console.log(await writeData)
return await writeData;
}


async function getAllSpreadsheet(){
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname,"credentials.json"), //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    //Auth client Object
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    // spreadsheet id
    const spreadsheetId = "1QFD3vCWIGDzo0odaP5KfgL5na3R7ufMu5ExKsufJsZI";
    //Read front the spreadsheet
    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "BestBuy!A:ZZ", //range of cells to read from.
    })
  return await readData.data.values;
}

