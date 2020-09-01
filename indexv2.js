//Required packages
const { google } = require('googleapis')
const axios = require('axios').default;
const ora = require('ora');
require('dotenv').config();




const promises = []
const exampleOutput = []

const exampleArray = [[
  [ 'https://www.next.co.uk', 'Home' ],
  [
    'https://www.next.co.uk/shop/gender-women-category-dresses-0',
    'PLP'
  ],
  [
    'https://www.next.co.uk/shop/gender-women-productaffiliation-footwear/category-sandals-category-shoes-heel-high-heel-mid',
    'PLP'
  ]]]


for (i = 0; i < exampleArray[0].length; i++) {
  const apiKey = process.env.API_KEY
  let serviceUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${exampleArray[0][i][0]}&strategy=mobile&key=${apiKey}`
  console.log(promises)
  promises.push(
    axios.get(serviceUrl, { timeout: 60000})
    // .then( response => {
    //   let content = response.data
      
    //   var field = exampleArray[0][i][1]
    //   var score = content["lighthouseResult"]["categories"]["performance"]["score"];
    //   var largestcontentfulpaint = content["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
    //   var timetointeractive = content["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
    //   var firstmeaningfulpaint = content["lighthouseResult"]["audits"]["first-meaningful-paint"]["displayValue"].slice(0, -2);
    //   var firstcontentfulpaint = content["lighthouseResult"]["audits"]["first-contentful-paint"]["displayValue"].slice(0, -2);
    //   var serverresponsetime = content["lighthouseResult"]["audits"]["server-response-time"]["displayValue"].slice(19, -3);
    //   var cumulativelayoutshift = content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
    //   var speedindex = content["lighthouseResult"]["audits"]["speed-index"]["displayValue"].slice(0, -2);
    //   var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      
    //   exampleOutput.push([exampleArray[0][i][0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "complete"]);
    //   console.log(`API query ${i+1} successful!`)
    // })
    // .catch(error => {
    //   var field = exampleArray[0][i][1]
    //   var score = "An error occured";
    //   var largestcontentfulpaint = "An error occured";
    //   var timetointeractive = "An error occured";
    //   var firstmeaningfulpaint = "An error occured";
    //   var firstcontentfulpaint = "An error occured";
    //   var serverresponsetime = "An error occured";
    //   var cumulativelayoutshift = "An error occured";
    //   var speedindex = "An error occured";
    //   var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
      
    //   exampleOutput.push([exampleArray[0][i][0], field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "error"]);
      
    //   console.log(`API query ${i+1} failed!`)
    //   console.log(error.response.status)       
    // })
  )
}

console.log(promises)
Promise.allSettled(promises).then(results => results.forEach(result => {
  const content = result.data
  let pageUrl = content['loadingExperience']['id']
  let field = () => {
    for (let i = 0; i < exampleArray[0].length; i ++ ) {
      if ( exampleArray[0][i][0] === pageUrl) {
        return exampleArray[0][i][1]
      } else {
        return 'No field!'
      }
    }  
  }
  let score = content["lighthouseResult"]["categories"]["performance"]["score"];
  let largestcontentfulpaint = content["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
  let timetointeractive = content["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
  let firstmeaningfulpaint = content["lighthouseResult"]["audits"]["first-meaningful-paint"]["displayValue"].slice(0, -2);
  let firstcontentfulpaint = content["lighthouseResult"]["audits"]["first-contentful-paint"]["displayValue"].slice(0, -2);
  let serverresponsetime = content["lighthouseResult"]["audits"]["server-response-time"]["displayValue"].slice(19, -3);
  let cumulativelayoutshift = content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
  let speedindex = content["lighthouseResult"]["audits"]["speed-index"]["displayValue"].slice(0, -2);
  let currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  
  exampleOutput.push(pageUrl, field, score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "complete");
  console.log(exampleOutput)
}))
