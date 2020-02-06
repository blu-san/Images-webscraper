/*
* Images webscraper 
* --- targets: ---
* 1. Get the page source code
* 2. Store <img> elements src attribute values
* 3. Download the images over the internet
*/
const scrape = require('website-scraper'),
fs = require('fs'),
request = require('request'),
rimraf = require('rimraf'),
prompt = require('prompt'),
colors = require("colors/safe");

class MyPlugin {
    constructor() {
        this.count = 0
    }
    apply(registerAction) {
        registerAction('onResourceSaved', ({resource}) => {
            if (!resource.filename.includes('.')) {
                download(resource.url, 'lib/' + this.count + '.png');
                this.count++;
            }
        });
        registerAction('afterFinish', async () => {
            rimraf("./node-website", function () {
                console.log('done');
                promptUser();
            });
        });
    }
}

let download = function(uri, filename) { 
    request.head(uri, function(err, res) {
      if (err) throw err;
      request(uri).pipe(fs.createWriteStream(filename));
    });
},
    CustomPlugin = new MyPlugin();

function initScrape(url, plugin = new MyPlugin()) {
    let options = {
        urls: [url],
        directory: './node-website',
        sources: [
            {
                selector: 'img',
                attr: 'src'
            }
        ],
        plugins: [ CustomPlugin ]
    };    
    
    scrape(options).then(() => {
        console.log('Website succesfully downloaded');
    }).catch(err => {
        throw err;
    });  
}

function promptUser() {
    prompt.start();
    prompt.get({
        properties: {
        url: {
            description: colors.magenta("URL: ")
        }
        }
    }, function (err, result) {
        if (err || !result.url) { throw err || new Error('No data provided.') }
        initScrape(result.url);
    });
}

promptUser(); // invoke

