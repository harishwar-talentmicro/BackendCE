var moment = require('moment');
var fs = require('fs');
var Readable = require('stream').Readable;
var bodyParser = require('body-parser');

var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();

var request = require('request');
var path = require('path');
var uuid = require('node-uuid');
var http = require('https');
// var Readable = require('stream').Readable;
var bcrypt = null;
var EZEIDEmail = 'noreply@talentmicro.com';
const accountSid = 'ACcf64b25bcacbac0b6f77b28770852ec9';
const authToken = '3abf04f536ede7f6964919936a35e614';
const client = require('twilio')(accountSid, authToken);


var qs = require("querystring");
var options = {
    "method": "POST",
    "hostname": "www.smsgateway.center",
    "port": null,
    "path": "/SMSApi/rest/send",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    }
};
var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();
var randomstring = require("randomstring");

var otpCtrl = {};
var error=null;

otpCtrl.sendOtp = function (req, res, next) {

    var mobileNo; //= req.body.mobileNo;
    var isdMobile; //= req.body.isdMobile;
    // var displayName = req.body.displayName ;
    var emailId = req.body.emailId ? req.body.emailId : "";
    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (req.body.mobileNo){
        mobileNo = req.body.mobileNo;    
    }
    else if(req.body.mobileNumber){
        mobileNo = req.body.mobileNumber;    
    }

    if (req.body.isdMobile){
        isdMobile = req.body.isdMobile;
    }
    else if (req.body.mobileISD){
        isdMobile = req.body.mobileISD;
    }

    if (!mobileNo) {
        error['mobile'] = 'mobile no is mandatory';
        status *= false;
    }
    if (!isdMobile) {
        error['isdMobile'] = 'isd mobile is mandatory';
        status *= false;
    }
    if (status) {
        try {
            // var isWhatMate= req.body.isWhatMate ? req.body.isWhatMate : 0;
            var message = "";
            var resMessage = "";

            //generate otp 6 digit random number
            var code = "";
            var possible = "1234567890";

            for (var i = 0; i <= 3; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            message = 'Your WhatMate verification OTP is ' + code + ' . Please enter this 4 digit number where prompted to proceed --WhatMate Helpdesk.';

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code)+ ',' + req.st.db.escape(isdMobile);
            console.log("query", query);
            req.st.db.query('CALL general_generate_otp(' + query + ')', function (err, insertResult) {
                if (!err) {
                    if (isdMobile == "+977") {
                        request({
                            url: 'http://beta.thesmscentral.com/api/v3/sms?',
                            qs: {
                                token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                to: mobileNo,
                                message: message,
                                sender: 'Techingen'
                            },
                            method: 'GET'

                        }, function (error, response, body) {
                            if (error) {
                                console.log(error, "SMS");
                            }
                            else {
                                console.log("SUCCESS", "SMS response");
                            }

                        });
                    }
                    else if (isdMobile == "+91") {
                        request({
                            url: 'https://aikonsms.co.in/control/smsapi.php',
                            qs: {
                                user_name: 'janardana@hirecraft.com',
                                password: 'Ezeid2015',
                                sender_id: 'WtMate',
                                service: 'TRANS',
                                mobile_no: mobileNo,
                                message: message,
                                method: 'send_sms'
                            },
                            method: 'GET'

                        }, function (error, response, body) {
                            if (error) {
                                console.log(error, "SMS");
                            }
                            else {
                                console.log("SUCCESS", "SMS response");
                            }
                        });

                        var req = http.request(options, function (res) {
                            var chunks = [];

                            res.on("data", function (chunk) {
                                chunks.push(chunk);
                            });

                            res.on("end", function () {
                                var body = Buffer.concat(chunks);
                                console.log(body.toString());
                            });
                        });

                        req.write(qs.stringify({
                            userId: 'talentmicro',
                            password: 'TalentMicro@123',
                            senderId: 'WTMATE',
                            sendMethod: 'simpleMsg',
                            msgType: 'text',
                            mobile: isdMobile.replace("+", "") + mobileNo,
                            msg: message,
                            duplicateCheck: 'true',
                            format: 'json'
                        }));
                        req.end();


                    }
                    else if (isdMobile != "") {
                        client.messages.create(
                            {
                                body: message,
                                to: isdMobile + mobileNo,
                                from: '+14434322305'
                            },
                            function (error, response) {
                                if (error) {
                                    console.log(error, "SMS");
                                }
                                else {
                                    console.log("SUCCESS", "SMS response");
                                }
                            }
                        );
                    }

                    // if(emailId != ""){
                    //     var file = path.join(__dirname, '../../../../mail/templates/sendOTP.html');

                    //     fs.readFile(file, "utf8", function (err, data) {

                    //         if (!err) {
                    //             data = data.replace("[DisplayName]", displayName);
                    //             data = data.replace("[code]", code);

                    //             var mailOptions = {
                    //                 from: EZEIDEmail,
                    //                 to: emailId,
                    //                 subject: 'WhatMate OTP',
                    //                 html: data // html body
                    //             };

                    //             // send mail with defined transport object
                    //             //message Type 7 - Forgot password mails service
                    //             var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                    //             var email = new sendgrid.Email();
                    //             email.from = mailOptions.from;
                    //             email.to = mailOptions.to;
                    //             email.subject = mailOptions.subject;
                    //             email.html = mailOptions.html;

                    //             sendgrid.send(email, function (err, result) {
                    //                 if (!err) {
                    //                     console.log('Mail sent');
                    //                 }
                    //                 else {
                    //                     console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                    //                 }
                    //             });
                    //         }
                    //         else{
                    //             console.log('FnForgetPassword: readfile '+err);
                    //         }
                    //     });
                    //     resMessage = "OTP is sent successfully to mobile and emailId";
                    // }
                    // else {
                    //     resMessage = 'OTP is sent successfully';
                    // }

                    respMsg.status = true;
                    respMsg.message = 'OTP is sent successfully';
                    respMsg.data = {
                        mobileNo: mobileNo
                    };
                    res.status(200).json(respMsg);
                }
                else {
                    respMsg.status = false;
                    respMsg.message = 'Something went wrong';
                    res.status(500).json(respMsg);
                }
            });


        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }
};


otpCtrl.toVerifyOtp = function (req, res, next) {
    console.log("inside otp");
    var response = {
        status: false,
        message: "Invalid otp",
        data: null,
        error: null
    };
    var mobileNo;
    var isdMobile;
    var otp = req.body.otp;

    if (req.body.mobileNo){
        mobileNo = req.body.mobileNo;    
    }
    else if(req.body.mobileNumber){
        mobileNo = req.body.mobileNumber;    
    }

    if (req.body.isdMobile){
        isdMobile = req.body.isdMobile;
    }
    else if (req.body.mobileISD){
        isdMobile = req.body.mobileISD;
    }

    var validationFlag = true;
    if (!mobileNo) {
        error.mobileNo = "Mobile number is mandatory";
        validationFlag = false;
    }
    if (!isdMobile) {
        error.isdMobile = "isdMobile number is mandatory";
        validationFlag = false;
    }

    if (!otp) {
        error.otp = "Please enter OTP";
        validationFlag = false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(isdMobile),
            req.st.db.escape(mobileNo),
            req.st.db.escape(otp)
        ];

        var procQuery = 'CALL wm_walkIn_verifyOtpInuse( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0][0].message == "OTP verified successfully") {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "INVALID OTP") {
                response.status = false;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "No result found";
                response.error = false;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while verifying OTP";
                response.error = true;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};

module.exports = otpCtrl;