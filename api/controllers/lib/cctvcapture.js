const fs = require('fs'),
http = require('http'),
https = require('https');
const axios = require('axios');
const Stream = require('stream').Transform;

exports.downloadImageToUrl = (url, filename, callback) => {  
   
    var client = http;
    // var content = '';
    if (url.toString().indexOf("https") === 0){
      client = https;
     }

    client.request(url, function(response) {                                        
      var data = new Stream();                                                    
      
      response.on('data', function(chunk) {  
         var utf8encoded = Buffer.from(chunk, 'base64').toString('utf8');
         console.log('CHUNK : ',utf8encoded);                          
         data.push(chunk);                                                         
      });                                                                         

      response.on('end', function() {   
        // content = content.toString('base64');
         console.log('BASE : ', data.toString());                                          
         fs.writeFileSync(filename, data.read());                               
      });                                                                         
   }).end();

};
