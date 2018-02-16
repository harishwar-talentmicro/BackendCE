/**
 * Created by vedha on 29-06-2017.
 */

var moment = require('moment');
var request = require('request');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var http = require('http');
var Readable = require('stream').Readable;
var signupCtrl = {};
var bcrypt = null;
var EZEIDEmail = 'noreply@talentmicro.com';
const accountSid = 'ACcf64b25bcacbac0b6f77b28770852ec9';
const authToken = '3abf04f536ede7f6964919936a35e614';
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;


try{
    bcrypt = require('bcrypt');
}
catch(ex){
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
}

signupCtrl.sendOtp = function(req,res,next) {

    var mobileNo= req.body.mobileNo;
    var isdMobile = req.body.isdMobile ;
    var displayName = req.body.displayName ;
    var emailId = req.body.emailId ;

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

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
            var isWhatMate= req.body.isWhatMate ? req.body.isWhatMate : 0;
            var message="";
            var resMessage = "" ;

                //generate otp 6 digit random number
                var code = "";
                var possible = "1234567890";

                for (var i = 0; i <= 5; i++) {

                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }


            if(isWhatMate ==0 )
            {
                message='Your EZEOne verification OTP is ' + code + ' . Please enter this 6 digit number where prompted to proceed.';
            }
            else{
                message='Your WhatMate verification OTP is ' + code + ' . Please enter this 6 digit number where prompted to proceed --WhatMate Helpdesk.';
            }

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code);
            req.st.db.query('CALL generate_otp(' + query + ')', function (err, insertResult) {
                if (!err) {
                    if(isdMobile == "+977"){
                        request({
                            url: 'http://beta.thesmscentral.com/api/v3/sms?',
                            qs: {
                                token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                to : mobileNo,
                                message: message,
                                sender: 'Techingen'
                            },
                            method: 'GET'

                        }, function (error, response, body) {
                            if(error)
                            {
                                console.log(error,"SMS");
                            }
                            else{
                                console.log("SUCCESS","SMS response");
                            }

                        });
                    }
                    else if(isdMobile == "+91")
                    {
                        request({
                            url: 'https://aikonsms.co.in/control/smsapi.php',
                            qs: {
                                user_name : 'janardana@hirecraft.com',
                                password : 'Ezeid2015',
                                sender_id : 'EZEONE',
                                service : 'TRANS',
                                mobile_no: mobileNo,
                                message: message,
                                method : 'send_sms'
                            },
                            method: 'GET'

                        }, function (error, response, body) {
                            if(error)
                            {
                                console.log(error,"SMS");
                            }
                            else{
                                console.log("SUCCESS","SMS response");
                            }
                        });
                    }
                    else if(isdMobile != "")
                    {
                        client.messages.create(
                            {
                                body: message,
                                to: isdMobile + mobileNo,
                                from: '+14434322305'
                            },
                            function (error, response) {
                                if(error)
                                {
                                    console.log(error,"SMS");
                                }
                                else{
                                    console.log("SUCCESS","SMS response");
                                }
                            }
                        );

                        // request({
                        //     url: 'https://rest.nexmo.com/sms/json',
                        //     qs: {
                        //         api_key : '4405b7b5 ',
                        //         api_secret : '77dfad076c27e4c8',
                        //         to: isdMobile.replace("+","") + mobileNo,
                        //         from : 'WtMate',
                        //         text: message
                        //     },
                        //     method: 'POST'
                        //
                        // }, function (error, response, body) {
                        //     if(error)
                        //     {
                        //         console.log(error,"SMS");
                        //     }
                        //     else{
                        //         console.log("SUCCESS","SMS response");
                        //     }
                        // });

                    }

                    if(emailId != ""){
                        var file = path.join(__dirname, '../../../mail/templates/sendOTP.html');

                        fs.readFile(file, "utf8", function (err, data) {

                            if (!err) {
                                data = data.replace("[DisplayName]", displayName);
                                data = data.replace("[code]", code);

                                var mailOptions = {
                                    from: EZEIDEmail,
                                    to: emailId,
                                    subject: 'WhatMate OTP',
                                    html: data // html body
                                };

                                // send mail with defined transport object
                                //message Type 7 - Forgot password mails service
                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                    if (!err) {
                                        console.log('Mail sent');
                                    }
                                    else {
                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                    }
                                });
                            }
                            else{
                                console.log('FnForgetPassword: readfile '+err);
                            }
                        });
                        resMessage = "OTP sent successfully to mobile and email Id ";
                    }
                    else {
                        resMessage = 'OTP Sent Successfully';
                    }

                    respMsg.status = true;
                    respMsg.message = resMessage ;
                    respMsg.data = {
                        mobileNo : mobileNo
                        // message : message,
                        // user_name : 'janardana@hirecraft.com',
                        // password : 'Ezeid2015',
                        // sender_id : 'EZEONE',
                        // service : 'TRANS',
                        // method : 'send_sms'
                    };
                    res.status(200).json(respMsg);
                }
                else{
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
            respMsg.error = {server: 'Internal Server Error'};
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

signupCtrl.verifyOTP = function(req,res,next){
    var mobileNo= req.body.mobileNo;
    var isdMobile = req.body.isdMobile ;
    var emailId = req.body.emailId ;

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!mobileNo) {
        error['mobile'] = 'mobile no is mandatory';
        status *= false;
    }
    if (!isdMobile) {
        error['isdMobile'] = 'isd mobile is mandatory';
        status *= false;
    }
    if (!emailId) {
        error['emailId'] = 'Email id is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
            req.query.token = req.query.token ? req.query.token : "";
            var pictureURL = req.body.pictureURL ? req.body.pictureURL : "";
            var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
            var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";
            var secretKey = (req.body.secretKey) ? (req.body.secretKey) : "";
            var isOTPRequired = (req.body.isOTPRequired) ? (req.body.isOTPRequired) : 0;
            var otp = (req.body.otp) ? (req.body.otp) : 0;
            if (req.body.otp == ""){
                req.body.otp = 0;
            }

            if (pictureURL != "")
            {
                pictureURL = (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + pictureURL);
            }


            var procParams = [
                req.st.db.escape(mobileNo),
                req.st.db.escape(req.body.otp),
                req.st.db.escape(req.body.pictureURL ? req.body.pictureURL : ''),
                req.st.db.escape(req.body.displayName),
                req.st.db.escape(isdMobile),
                req.st.db.escape(req.body.idTypeId),
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.isOTPRequired),
                req.st.db.escape(emailId)
            ];

            var procQuery = 'CALL verify_otp( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,result) {
                if (!err && result && result[0] && result[0][0].message){
                    switch (result[0][0].message) {
                        case 'INVALID' :
                            respMsg.status = false;
                            respMsg.message = "Invalid OTP";
                            res.status(200).json(respMsg);
                            break;
                        case 'NOT_AVAILABLE' :
                            respMsg.status = false;
                            respMsg.message = "EmailId already exists";
                            res.status(200).json(respMsg);
                            break ;

                        default:
                            break;
                    }

                }
                else if (!err && result && result[0] && result[0][0].EZEID){
                    var EZEOneId= result[0][0].EZEID;
                    var ip = req.headers['x-forwarded-for'] ||
                        req.connection.remoteAddress ||
                        req.socket.remoteAddress;
                    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                    req.st.generateToken(ip, userAgent, EZEOneId,isWhatMate,APNS_Id,GCM_Id,secretKey, function (err, token) {
                        if (err) {
                            respMsg.status = false;
                            respMsg.message = "Error while generating token";
                            respMsg.data = null;
                            res.status(500).json(respMsg);
                        }
                        else {
                            respMsg.status = true;
                            respMsg.message = "OTP is matched";
                            respMsg.data = {
                                // EZEOneId : result[0][0].EZEOneId,
                                // masterId : result[0][0].masterId,
                                token : token,
                                IsAuthenticate : true,
                                TID : result[0][0].TID,
                                MasterID : result[0][0].MasterID,
                                ezeone_id : result[0][0].EZEID,
                                FirstName : result[0][0].FirstName,
                                LastName : result[0][0].LastName,
                                CompanyName : result[0][0].CompanyName,
                                Type : result[0][0].IDTypeID,
                                Verified : result[0][0].EZEIDVerifiedID,
                                isHelloEZE : result[0][0].isHelloEZE,
                                displayName : result[0][0].displayName,
                                group_id : result[0][0].group_id,
                                mobilenumber : result[0][0].mobilenumber,
                                pictureUrl : pictureURL
                            };
                            res.status(200).json(respMsg);

                        }
                    });
                }
                else if (!err){
                    respMsg.status = true ;
                    respMsg.message = "OTP is matched";
                    res.status(200).json(respMsg);
                }
                else {
                    respMsg.status = false;
                    respMsg.message = "Internal Server Error";
                    res.status(500).json(respMsg);
                }
            });
        }
        catch (ex) {
            respMsg.error = 'Internal Server Error' ;
            respMsg.message = 'An error occurred ! Please try again';
            res.status(500).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }

    };

signupCtrl.savePassword = function(req,res,next){

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.body.password) {
        error['password'] = 'password is mandatory';
        status *= false;
    }
    if (!req.body.masterId) {
        error['masterId'] = 'MasterId is mandatory';
        status *= false;
    }
    if (!req.body.EZEOneId) {
        error['EZEOneId'] = 'EZEOneId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var encryptPwd = req.st.hashPassword(req.body.password);
            req.body.isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;

            var procParams = [
                req.st.db.escape(encryptPwd),
                req.st.db.escape(req.body.masterId),
                req.st.db.escape(req.body.EZEOneId)
            ];

            var procQuery = 'CALL save_password( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,result) {
                if (!err ){
                    var file = "";
                    if(req.body.isWhatMate == 0)
                    {
                        file = path.join(__dirname, '../../../mail/templates/signup.html');
                    }
                    else {
                        file = path.join(__dirname, '../../../mail/templates/signupWhatMate.html');
                    }

                    fs.readFile(file, "utf8", function (err, data) {
                        if (!err) {
                            respMsg.status = true;
                            respMsg.message = "Saved..";
                            respMsg.data = data ;
                            res.status(200).json(respMsg);
                        }
                        else{
                            respMsg.status = false;
                            respMsg.message = "Internal Server Error";
                            respMsg.data =null;
                            res.status(200).json(respMsg);
                        }
                    });

                }
                else {
                    respMsg.status = false;
                    respMsg.message = "Internal Server Error";
                    res.status(500).json(respMsg);
                }
            });
        }
        catch (ex) {
            respMsg.error = 'Internal Server Error' ;
            respMsg.message = 'An error occurred ! Please try again';
            res.status(500).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }

};

signupCtrl.verifyEmailId = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.emailId){
        error.emailId = 'Invalid emailId';
        validationFlag *= false;
    }
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
                var procParams = [
                    req.st.db.escape(req.query.emailId)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL validate_emailId( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(result);
                    if(!err && result && result[0] && result[0][0] && result[0][0].message ){
                        switch (result[0][0].message) {
                            case 'AVAILABLE' :
                                response.status = true;
                                response.message = "Valid email id." ;
                                response.error = null;
                                res.status(200).json(response);
                                break;
                            case 'NOT_AVAILABLE' :
                                response.status = false;
                                response.message = "Email id already exists.";
                                response.error = null;
                                res.status(200).json(response);
                                break ;

                            default:
                                break;
                        }
                    }
                    else if(!err){
                        response.status = false;
                        response.message = "Email id already exists.";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while validating emailId";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
    }
};

signupCtrl.testOtp = function(req,res,next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (status) {
        try {
        //     client.messages.create(
        //         {
        //             body: "WhatMate test,please confirm receipt - Janardana",
        //             to: '+919945232397',
        //             from: '+14434322305'
        //         },
        //         function (error, response) {
        //             if(error)
        //             {
        //                 console.log(error,"SMS");
        //             }
        //             else{
        //                 console.log("SUCCESS","SMS response");
        //             }
        //         }
        // );
            const response = new VoiceResponse();
            response.say('Hello');
            var s = new Readable;
            // s.push(response.toString());
            s.push('<Response><Say >Thanks for trying our documentation. vedha!</Say></Response>');

            s.push(null);
            var uniqueFileName = uuid.v4() + '.xml';
            var fileName = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + uniqueFileName;
            console.log("uniqueFileName",fileName);

            req.st.uploadXMLToCloud(uniqueFileName, s, function (err) {
                if (!err) {
                    console.log("success");
                    client.calls
                        .create({
                                url: fileName,
                                to: '+919743883221',
                                from: '+14434322305',
                                method: 'GET'
                            },
                            function (error, response){
                                if(error)
                                {
                                    req.st.deleteDocumentFromCloud(uniqueFileName);
                                    console.log(error,"phone");
                                }
                                else{
                                    req.st.deleteDocumentFromCloud(uniqueFileName);
                                    console.log("SUCCESS","phone call");
                                }
                            });

                    // client.calls
                    //     .create({
                    //         url: fileName,
                    //         to: '+919743883221',
                    //         from: '+14434322305',
                    //         method: 'GET'
                    //     });

                }
                else {
                    console.log(err);
                }
            });


        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = {server: 'Internal Server Error'};
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

signupCtrl.sendOtpPhone = function(req,res,next) {

    var status = true, error = {};
    var mobileNo= req.body.mobileNo;
    var isdMobile = req.body.isdMobile ;

    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };
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
            var code = "";
            var possible = "1234567890";

            for (var i = 0; i <= 5; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code);
            req.st.db.query('CALL generate_otp(' + query + ')', function (err, insertResult) {
                if (!err && insertResult && insertResult[0] && insertResult[0][0].otp ) {
                    code = insertResult[0][0].otp ;
                    var message='Your WhatMate verification OTP is ' + code + ' . Please enter this 6 digit number where prompted to proceed --WhatMate Helpdesk.';

                    const response = new VoiceResponse();
                    response.say(
                        {
                            voice: 'alice',
                            language : 'en',
                            loop: 2
                        },
                        message
                    );

                    var s = new Readable;
                    s.push(response.toString());
                    console.log(response.toString());
                    s.push(null);
                    var uniqueFileName = 'phone_' +uuid.v4() + '.xml';
                    var fileName = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + uniqueFileName;

                    req.st.uploadXMLToCloud(uniqueFileName, s, function (err) {
                        if (!err) {
                            client.calls
                                .create({
                                        url: fileName,
                                        to: isdMobile+mobileNo,
                                        from: '+14434322305',
                                        method: 'GET'
                                    },
                                    function (error, response){
                                        if(error)
                                        {
                                            // req.st.deleteDocumentFromCloud(uniqueFileName);
                                            console.log(error,"phone");
                                            respMsg.status = false;
                                            respMsg.message = 'Something went wrong';
                                            res.status(500).json(respMsg);

                                        }
                                        else{
                                            // req.st.deleteDocumentFromCloud(uniqueFileName);
                                            console.log("SUCCESS","phone call");
                                            respMsg.status = true;
                                            respMsg.message = 'success';
                                            res.status(200).json(respMsg);

                                        }
                                    });

                        }
                        else {
                            console.log(err);
                            respMsg.status = false;
                            respMsg.message = 'Something went wrong';
                            res.status(500).json(respMsg);

                        }
                    });

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
            respMsg.error = {server: 'Internal Server Error'};
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

module.exports = signupCtrl;
