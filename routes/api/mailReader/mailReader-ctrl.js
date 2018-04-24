/**
 * Created by vedha on 19-04-2018.
 */

var mailReaderCtrl = {};

var Client = require('node-poplib-gowhich').Client;
var client = new Client({
    hostname: 'pop.gmail.com',
    port:  995,
    tls: true,
    mailparser: true,
    username: 'vedha@talentmicro.com',
    password: 'vedha@123'
});



mailReaderCtrl.getMails = function(req,res,next){
    client.connect(function() {
        client.retrieveAll(function(err, messages) {
            messages.forEach(function(message) {
                console.log(message);
            });
            client.quit();
        })
    });
};

module.exports = mailReaderCtrl;