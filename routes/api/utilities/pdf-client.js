
var net = require('net');
var fs = require('fs');
var chalk = require('chalk');
/**
 * Converts File from DOCX to PDF (No other format is entertained)
 * @param docxFileBuffer
 * @param callback
 */

/**
 * Pass server configuration
 * @param serverConfiguration
 * @constructor
 */

var defaultConfig = {
    HOST : "127.0.0.1" ,
    PORT : 9111
};

function PDFClient(serverConfiguration){
    if(serverConfiguration && serverConfiguration.PDF_SERVER){
        this.serverConfiguration = serverConfiguration.PDF_SERVER;
        chalk.green(console.log('PDF Client using server defined configuration'));
    }
    else{
        chalk.red(console.log('No ServerConfiguration Found ! PDF Client using default configuration'));

        this.serverConfiguration = defaultConfig
    }

}

/**
 * Converts file to PDF
 * @param docxFileBuffer
 * @param callback
 */
PDFClient.prototype.convertToPdf =  function (docxFileBuffer, callback){
        /**
         * Opening PDF Client Socket to Java Server
         * @type {net.Socket}
         */
        var pdfClient = new net.Socket({allowHalfOpen: false,
            readable: true,
            writable: true});
        /**
         * PDF Buffer array output supplied by PDF Java Server
         * @type {Array}
         */
        var pdfBufferArray = [];
        pdfClient.connect(this.serverConfiguration.PORT, this.serverConfiguration.HOST, function() {
            console.log('Connected');

            pdfClient.write(docxFileBuffer,function(){
                pdfClient.end();
            });

        });


        pdfClient.on('data', function(data) {
            console.log('Received: ', data);
            pdfBufferArray.push(data);
        });

        pdfClient.on('close', function() {
            console.log('Connection closed');
            pdfClient.destroy(); // kill pdfClient after server's response
            if(typeof callback == "function"){
                callback(null,Buffer.concat(pdfBufferArray));
            }

        });
        pdfClient.on('error',function(err){
            if(typeof callback == "function"){
                callback(err,null);
            }
            console.log('Connection error',err);
        });
};

module.exports = PDFClient;

