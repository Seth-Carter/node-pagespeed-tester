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

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Grabs URLs from our Google sheet (a tab called "Config")
function getSheetData(sheetRange) {
  return new Promise( (resolve, reject) => {
    sheets.spreadsheets.values.get({
      auth: jwt,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: sheetRange
    },  (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err)
      } else {
        let sheetValues = response.data.values
        console.log(sheetValues)
        resolve(sheetValues)
      }
    })
  })
}

// Argument one is the input array of rows that we want to upload to a tab in our sheet
//  which we designate with a string entered into argument two
function uploadSpeedData (inputData,outputRange) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.append({
      auth:jwt,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: outputRange,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: inputData
      }
    }, (err, response) => {
      if (err) {
        console.log ('Append failed!: ' + err)
        reject(err)
      } else {
        console.log('Success!: ' + response)
        resolve(response)
      }
    })
  })
}

// This takes the URL we want to test and the index from our map function to determine
//  how long to wait between each api call
async function testPageSpeed(url, index, array) {
  const apiKey = process.env.API_KEY
  const strategy = 'mobile'
  let serviceUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url[0]}&strategy=${strategy}&key=${apiKey}`
  try {
    await sleep(2000 * (1 + index))
    console.log(`Request ${index + 1} of ${array.length} sent!`)
    const response = await axios.get(serviceUrl, { timeout: 60000})
    const content = response.data
    
    var field = url[1]
    var score = content["lighthouseResult"]["categories"]["performance"]["score"];
    var largestcontentfulpaint = content["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
    var timetointeractive = content["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
    var firstmeaningfulpaint = content["lighthouseResult"]["audits"]["first-meaningful-paint"]["displayValue"].slice(0, -2);
    var firstcontentfulpaint = content["lighthouseResult"]["audits"]["first-contentful-paint"]["displayValue"].slice(0, -2);
    var serverresponsetime = content["lighthouseResult"]["audits"]["server-response-time"]["displayValue"].slice(19, -3);
    var cumulativelayoutshift = content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
    var speedindex = content["lighthouseResult"]["audits"]["speed-index"]["displayValue"].slice(0, -2);
    var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');    
    const output = [url[0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "complete"];
    return output
  } catch (error) {
    console.log('There was an error, dude!')
    if (error.response) {
      console.log(error.response.data);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }    
    var field = url[1]
    var score = "An error occured";
    var largestcontentfulpaint = "An error occured";
    var timetointeractive = "An error occured";
    var firstmeaningfulpaint = "An error occured";
    var firstcontentfulpaint = "An error occured";
    var serverresponsetime = "An error occured";
    var cumulativelayoutshift = "An error occured";
    var speedindex = "An error occured";   
    var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
    const output = [url[0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "error"];
    return output
  } 
}

// Helper function that we use to create our array of promises
function startTasks(arrayValue, index, array) {
  return testPageSpeed(arrayValue, index, array)
}


async function run() {
  // This is the cell range in the Google Sheet where we store the URLs for which we 
  //   want to run the page speed API
  const urlRange = 'Config!A13:B'
  // This is an initialized array into which we push the results of the page speed API 
  const outputArray = []
  // This function grabs the URLs and their accompanying template names from the config Google Sheet 
  const inputArray = await getSheetData(urlRange)
  // This function creates an array of promises, which allows us to run the API calls in parallel
  // We pass in the optional index argument for .map() so we can access it in our testPageSpeed() function,
  //   which uses this as a multiplier for our sleep() function
  // This makes each API call happen with a 2 second delay, which prevents us from going over 
  //   the Google page speed API's call limits
  const promises = await inputArray.map((subArray, index, array) => startTasks(subArray, index, array))
  // This gathers up all the promises and returns the result when they've all resolved or rejected
  const results = await Promise.allSettled(promises)
  // We loop through the results of all our promises and push them into an array, which conforms with 
  //   the required data shape for appending data to Google Sheets through the Sheets API
  results.forEach(result => {
    outputArray.push(result.value)
  })
  console.log('This is the output: ', outputArray)
  // This function takes the first argument and uploads it to a tab named "Mobile" in the same sheet 
  //  that holds the config tab (where we pulled in the initial array of URLs we tested)
  await uploadSpeedData(outputArray,'Mobile')
}

run()