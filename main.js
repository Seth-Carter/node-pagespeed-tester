//Required packages
const { google } = require('googleapis')
const axios = require('axios').default;
const ora = require('ora');
require('dotenv').config();

const sheets = google.sheets('v4')

//Service account credentials
const key = require('./service_account.json')

//Authentication happens here that allows us to connect to 
//sheets through the use of a service account
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, process.env.GOOGLE_SCOPES)

jwt.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!");
  }
});


function getSheetData(sheetRange, arrayType) {
  sheets.spreadsheets.values.get({
    auth: jwt,
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: sheetRange
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
    } else {
      let sheetValues = response.data.values
      arrayType.push(sheetValues)
      console.log(arrayType[0])
    }
  })
}

const urlRange = 'Config!A13:B'
const competitorRange = 'Config!D13:E'

const urlArray = []
const competitorArray = []

getSheetData(urlRange, urlArray)
getSheetData(competitorRange, competitorArray)

//For the device type arg, input 'mobile' or 'desktop'
async function testPageSpeed(testArray, outputArray, deviceType) {
  const spinner = ora().start();
  
  for (let i = 0; i < testArray[0].length; i++) {
    const apiKey = process.env.API_KEY
    let serviceUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${testArray[0][i][0]}&strategy=${deviceType}&key=${apiKey}`
    
    try {
      
      const response = await axios.get(serviceUrl, { timeout: 60000})
      const content = response.data
      
      var field = testArray[0][i][1]
      var score = content["lighthouseResult"]["categories"]["performance"]["score"];
      var largestcontentfulpaint = content["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
      var timetointeractive = content["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
      var firstmeaningfulpaint = content["lighthouseResult"]["audits"]["first-meaningful-paint"]["displayValue"].slice(0, -2);
      var firstcontentfulpaint = content["lighthouseResult"]["audits"]["first-contentful-paint"]["displayValue"].slice(0, -2);
      var serverresponsetime = content["lighthouseResult"]["audits"]["server-response-time"]["displayValue"].slice(19, -3);
      var cumulativelayoutshift = content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
      var speedindex = content["lighthouseResult"]["audits"]["speed-index"]["displayValue"].slice(0, -2);
      
      var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      
      outputArray.push([testArray[0][i][0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "complete"]);
      console.log(`API query ${i+1} successful!`)
    } catch (error) {
      console.log(`API query ${i+1} failed!`)
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error.config);
      
      var field = testArray[0][i][1]
      var score = "An error occured";
      var largestcontentfulpaint = "An error occured";
      var timetointeractive = "An error occured";
      var firstmeaningfulpaint = "An error occured";
      var firstcontentfulpaint = "An error occured";
      var serverresponsetime = "An error occured";
      var cumulativelayoutshift = "An error occured";
      var speedindex = "An error occured";

      var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      
      outputArray.push([testArray[0][i][0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "error"]);
    } 
  }
  spinner.stop();

  console.log(outputArray);
}

const mobileData = []
const desktopData = []
const competitorData = []
// testPageSpeed(urlArray);