const { google } = require('googleapis')

const key = require('./service_account.json')
const scopes = 'https://www.googleapis.com/auth/spreadsheets'
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)

const dummyArray = ['Claudia', 53, 'Pisces']

//authenticate request
jwt.authorize(function (err, tokens) {
if (err) {
console.log(err);
return;
} else {
console.log("Successfully connected!");
}
});

//Google Sheets API
let spreadsheetId = '1pj7JoNODsAqz5zqI5IeemGqE_NbDQdGHXVESw2szyW8';
let sheetName = 'Sheet1'
let sheets = google.sheets('v4');

let resource = {
  values: [...dummyArray]
}

sheets.spreadsheets.values.append({
  auth:jwt,
  spreadsheetId: spreadsheetId,
  range:'Sheet1',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  resource: {
    values: [
      ['Claudia', 53, 'Pisces'],
      ['Jonas', 18, 'Aries']
    ]
  }
}, (err, response) => {
  if (err) {
    console.log ('Append failed!: ' + err)
  } else {
    console.log('Success!: ' + response)
  }
})


function getSheetData() {
  sheets.spreadsheets.values.get({
   auth: jwt,
   spreadsheetId: spreadsheetId,
   range: sheetName
}, function (err, response) {
   if (err) {
       console.log('The API returned an error: ' + err);
   } else {
       console.log('Names, ages, and signs:');
       console.log(response.data.values)
       const sheetValues = response.data.values
       for (let i = 1; i<sheetValues.length; i++) {
           console.log(`${sheetValues[i][0]} is ${sheetValues[i][1]} years old. Their sign is ${sheetValues[i][2]}.`);
       }
   }
})
}

setTimeout(getSheetData, 1000);