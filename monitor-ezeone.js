var http = require('https');
var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
var sys = require('sys')
var exec = require('child_process').exec;
var child;
var fs = require('fs');

/**
 * HTTP Options for sending up request to EZEOne Node Server
 */
var httpOptions = {
    //host: '130.211.119.159',
    host: 'www.ezeone.com',
    port: 443,
    method:'GET',
    path: '/api/api_health'
};

/**
 * mailOptions used to send mails
 * @type {{from: string, to: *, subject: string, text: string}}
 */
var mailOptions = {
    from:'crashmanager@ezeone.com',
    to : ['indrajeetnagda@gmail.com','indrajeet@hirecraft.in'],
    subject:'EZEOne Crashed at ' + (new Date()).toDateString(),
    text: '',
    html : ''
};


/**
 * Simultaneous server failure count
 * @type {number}
 */
var simultaneousFailureCount = 0;

var checkServerStatus = function(){
    try{
        var httpRequest = http.request(httpOptions, function(res){
            var serverFailed = false;
            console.log("res.statusCode",res.statusCode);
            if(res.statusCode && res.statusCode >= 500){
                serverFailed = true;
                simultaneousFailureCount += 1;
            }
            else{
                simultaneousFailureCount = 0;
            }

            /**
             * Reschedule request if serverFailed is false
             * Start server,send a mail and then reschedule request if serverFailed is false
             */
            if(!serverFailed){
                setTimeout(function(){
                    checkServerStatus();
                },2000)
            }
            else{
                var errorString = "";
                try {
                    fs.accessSync("/var/log/ezeone.log", fs.F_OK);
                    // Do something
                } catch (e) {
                    // It isn't accessible
                    errorString = "Log file is also not accessible ! \n Critical issue please check the server as soon as possible";
                }

                child = exec("tail -100 /var/log/ezeone.log && service ezeid restart",{ shell : '/bin/bash'}, function (error, stdout, stderr) {
                    sys.print('stdout: ' + stdout);
                    sys.print('stderr: ' + stderr);
                    if (error) {
                        console.log('exec error: ' + error);
                    }

                    /**
                     * Trigger a mail from sendgrid containing error from log file
                     */

                    mailOptions.subject = 'EZEOne Crashed at ' + (new Date()).toDateString();
                    mailOptions.text =  'Standard Output : '+stdout + ' \n Standard Error : '+stderr;
                    mailOptions.html = '<html>' +
                        '<body>' +
                        '<h2>EZEOne Crash Report</h2>' +
                        '<h6>' +
                        'Standard Output' +
                        '</h6>' +
                        '<hr/>' +
                        '<code>' +
                        stdout +
                        '</code>' +
                        '<h6>' +
                        'Standard Error' +
                        '</h6>' +
                        '<hr/>' +
                        '<code>' +
                        stderr +
                        '</code>' +
                        '</body>' +
                        '</html>';

                    sendgrid.send(mailOptions, function (error,response) {
                        if (error) {
                            console.log(error);
                        }
                        else {

                        }
                    });

                    setTimeout(function(){
                        checkServerStatus();
                    },(5000*(simultaneousFailureCount + 1)));

                });

            }



            //res.on('end', function(){
            //
            //});
            //
            //res.on('error',function(){
            //    /**
            //     * Reschedule request if serverFailed is false
            //     * Start server,send a mail and then reschedule request if serverFailed is false
            //     */
            //    if(!serverFailed){
            //        setTimeout(function(){
            //            checkServerStatus();
            //        },2000)
            //    }
            //    else{
            //        var errorString = "";
            //        try {
            //            fs.accessSync("/var/log/ezeone.log", fs.F_OK);
            //            // Do something
            //        } catch (e) {
            //            // It isn't accessible
            //            errorString = "Log file is also not accessible ! \n Critical issue please check the server as soon as possible";
            //        }
            //        child = exec("tail -100 /var/log/ezeone.log && service ezeid restart",{ shell : '/bin/bash'}, function (error, stdout, stderr) {
            //            sys.print('stdout: ' + stdout);
            //            sys.print('stderr: ' + stderr);
            //            if (error) {
            //                console.log('exec error: ' + error);
            //            }
            //
            //            /**
            //             * Trigger a mail from sendgrid containing error from log file
            //             */
            //
            //            mailOptions.subject = 'EZEOne Crashed at ' + Date().toDateString();
            //            mailOptions.text =  'Standard Output : '+stdout + ' \n Standard Error : '+stderr;
            //            mailOptions.html = '<html>' +
            //                '<body>' +
            //                '<h2>EZEOne Crash Report</h2>' +
            //                '<h6>' +
            //                'Standard Output' +
            //                '</h6>' +
            //                '<hr/>' +
            //                '<code>' +
            //                stdout +
            //                '</code>' +
            //                '<h6>' +
            //                'Standard Error' +
            //                '</h6>' +
            //                '<hr/>' +
            //                '<code>' +
            //                stderr +
            //                '</code>' +
            //                '</body>' +
            //                '</html>';
            //
            //            sendgrid.send(mailOptions, function (error,response) {
            //                if (error) {
            //                    console.log(error);
            //                }
            //                else {
            //
            //                }
            //            });
            //
            //            setTimeout(function(){
            //                checkServerStatus();
            //            },(5000*(simultaneousFailureCount + 1)));
            //
            //        });
            //
            //    }
            //});
        });
        httpRequest.on('error', function(err){
            console.log('problem with request:', err);
        });
        httpRequest.end();
    }
    catch(ex){
        console.log('exception',ex);
        httpRequest.end();
    }

};

checkServerStatus();