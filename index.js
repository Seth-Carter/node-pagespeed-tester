const axios = require('axios').default;
const ora = require('ora');
require('dotenv').config();

const array = []
const testUrl = 'https://www.next.co.uk'
const UrlArray = ['https://www.next.co.uk',
  'https://www.next.co.uk/shop/gender-women-category-dresses-0']

  async function httpRequest(UrlArray) {
    const spinner = ora().start();
  
    for (let i = 0; i < UrlArray.length; i++) {
      const strategy = 'mobile'
      const key = process.env.API_KEY
      let serviceUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${UrlArray[i]}&strategy=${strategy}&key=${key}`
  
      try {
        
        const response = await axios.get(serviceUrl, { timeout: 60000})
        const content = response.data
        
        var score = content["lighthouseResult"]["categories"]["performance"]["score"];
        var largestcontentfulpaint = content["lighthouseResult"]["audits"]["largest-contentful-paint"]["displayValue"].slice(0, -2);
        var timetointeractive = content["lighthouseResult"]["audits"]["interactive"]["displayValue"].slice(0, -2);
        var firstmeaningfulpaint = content["lighthouseResult"]["audits"]["first-meaningful-paint"]["displayValue"].slice(0, -2);
        var firstcontentfulpaint = content["lighthouseResult"]["audits"]["first-contentful-paint"]["displayValue"].slice(0, -2);
        var serverresponsetime = content["lighthouseResult"]["audits"]["server-response-time"]["displayValue"].slice(19, -3);
        var cumulativelayoutshift = content["lighthouseResult"]["audits"]["cumulative-layout-shift"]["displayValue"];
        var speedindex = content["lighthouseResult"]["audits"]["speed-index"]["displayValue"].slice(0, -2);
        
        var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        
        array.push([UrlArray[i], score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "complete"]);
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

        var score = "An error occured";
        var largestcontentfulpaint = "An error occured";
        var timetointeractive = "An error occured";
        var firstmeaningfulpaint = "An error occured";
        var firstcontentfulpaint = "An error occured";
        var serverresponsetime = "An error occured";
        var cumulativelayoutshift = "An error occured";
        var speedindex = "An error occured";

        var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        
        array.push([UrlArray[i], score, timetointeractive, largestcontentfulpaint, firstcontentfulpaint, firstmeaningfulpaint, cumulativelayoutshift, serverresponsetime, speedindex, currentDate, "error"]);
      } 
    }
    spinner.stop();
  
    console.log(array);
  }
  
  httpRequest(UrlArray);