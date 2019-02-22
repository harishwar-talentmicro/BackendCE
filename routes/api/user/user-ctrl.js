/**
 * @author Anjali Pandya
 * @description Controller for signup, save address, save pin, validate ezeoneid etc for new wizard style UI
 * @since August 26, 2016 10:46 AM IST
 */
var request = require('request');
var validator = require('validator');
var bcrypt = null;
var fs = require('fs');
var http = require('https');
var path = require('path');
var EZEIDEmail = 'noreply@talentmicro.com';
var appConfig = require('../../../ezeone-config.json');

const accountSid = 'AC62cf5e4f884a28b6ad9e2da511d24f4d';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC62cf5e4f884a28b6ad9e2da511d24f4d';
const authToken = 'ff62486827ce8b68c70c1b8f7cef9748';   //'3abf04f536ede7f6964919936a35e614';  //'ff62486827ce8b68c70c1b8f7cef9748';//
const FromNumber = appConfig.DB.FromNumber || '+16012286363';

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var Readable = require('stream').Readable;
var uuid = require('node-uuid');
var randomstring = require("randomstring");
var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var Notification_aws = require('../../modules/notification/aws-sns-push');

var _Notification_aws = new Notification_aws();

var DBSecretKey = appConfig.DB.secretKey;

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

try {
    bcrypt = require('bcrypt-nodejs');
}
catch (ex) {
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
}

var st = null;

/**
 * Compare the password and the hash for authenticating purposes
 * @param password
 * @param hash
 * @returns {*}
 */
function comparePassword(password, hash) {
    if (!password) {
        return false;
    }
    if (!hash) {
        return false;
    }
    return bcrypt.compareSync(password, hash);
}
var UserCtrl = {};

/**
 * saving user data to sign up
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}",
    "firstName":"{string}:[30]",
    "lastName":"{string}:[30]",
    "email":"{string}:[150]",
    "mobile":"{string}:[12]",
    "isdMobile":"{string}:[10]"
}
 * @method POST
 */
UserCtrl.signup = function (req, res, next) {

    var response = {
        status: false,
        message: "Error while user registration",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.mobile) {
        error.mobile = 'Invalid mobile';
        validationFlag *= false;
    }
    if (!validator.isLength((req.body.firstName), 3, 40)) {
        error.firstName = 'First Name can be minimum 3 and maximum 40 characters';
        validationFlag *= false;
    }
    // if (!validator.isEmail(req.body.email)) {
    //     error.email = 'Invalid Email';
    //     validationFlag *= false;
    // }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    else {
        try {
            req.body.lastName = (req.body.lastName) ? req.body.lastName : '';
            req.body.isdMobile = (req.body.isdMobile) ? req.body.isdMobile : '';
            req.body.password = (req.body.password) ? req.body.password : '';
            req.body.isWhatMate = (req.body.isWhatMate) ? req.body.isWhatMate : 0;

            var procParams = [
                req.st.db.escape(req.body.firstName),
                req.st.db.escape(req.body.lastName),
                req.st.db.escape(req.body.email),
                req.st.db.escape(req.body.mobile),
                req.st.db.escape(req.body.isdMobile),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to save user details
             * @type {string}
             */
            var procQuery = 'CALL psignup( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, userResult) {
                /**
                 * fetching ip address and user agent from header
                 * @type {*|string}
                 */
                var ip = req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress;
                var apnsId = '';
                var gcmId = '';
                var secretKey = '';
                var isDialer = 0;
                var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
                if (!err && userResult && userResult[0] && userResult[0][0] && userResult[0][0].masterId) {
                    req.st.generateToken(ip, userAgent, userResult[0][0].ezeoneId, req.body.isWhatMate,apnsId, gcmId, secretKey,isDialer, function (err, token) {
                        if (err) {
                            console.log('Error while generating token' + err);
                            response.status = false;
                            response.message = "Error while generating token";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                        else {
                            response.status = true;
                            response.message = "You are successfully register";
                            response.error = null;
                            response.data = {
                                firstName: (req.body.firstName) ? req.body.firstName : '',
                                lastName: (req.body.lastName) ? req.body.lastName : '',
                                email: (req.body.email) ? req.body.email : '',
                                mobile: (req.body.mobile) ? req.body.mobile : '',
                                isdMobile: (req.body.isdMobile) ? req.body.isdMobile : '',
                                token: token,
                                masterId: (userResult[0][0].masterId) ? userResult[0][0].masterId : 0,
                                ezeoneId: (userResult[0][0].ezeoneId) ? userResult[0][0].ezeoneId : 0
                            };
                            res.status(200).json(response);
                        }
                    });
                }
                else {
                    response.status = false;
                    response.message = "Error while user registration";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }

};

/**
 * saving user's address
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}"
    "address":"{string}:[250]",
    "latitude":"{decimal}:[18,15]",
    "longitude":"{decimal}:[18,15]"
}
 * @method POST
 */
UserCtrl.saveAddress = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    // if(!req.body.address){
    //     error.address = 'address can not be empty';
    //     validationFlag *= false;
    // }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    // if(!req.body.longitude){
    //     error.longitude = 'longitude can not be empty';
    //     validationFlag *= false;
    // }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }

                        else {
                            var emailId = req.body.emailId ? req.body.emailId : "";
                            var address = req.body.address ? req.body.address : "";
                            var latitude = req.body.latitude ? req.body.latitude : 0;
                            var longitude = req.body.longitude ? req.body.longitude : 0;
                            var aboutCompany = req.body.aboutCompany ? req.body.aboutCompany : "";
                            req.body.keywords = req.body.keywords ? req.body.keywords : "";
                            req.body.jobTitle = req.body.jobTitle ? req.body.jobTitle : "";
                            req.body.companyName = req.body.companyName ? req.body.companyName : "";

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.address),
                                req.st.db.escape(req.body.latitude),
                                req.st.db.escape(req.body.longitude),
                                req.st.db.escape(emailId),
                                req.st.db.escape(req.body.aboutCompany),
                                req.st.db.escape(req.body.keywords),
                                req.st.db.escape(req.body.jobTitle),
                                req.st.db.escape(req.body.companyName),
                                req.st.db.escape(DBSecretKey)

                            ];
                            /**
                             * Calling procedure to save deal
                             * @type {string}
                             */
                            var procQuery = 'CALL psave_address( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, addressResult) {
                                if (!err && addressResult && addressResult[0] && addressResult[0][0] && addressResult[0][0].id) {
                                    if (emailId != "") {
                                        var file = path.join(__dirname, '../../../mail/templates/registrationNew.html');

                                        fs.readFile(file, "utf8", function (err, data) {

                                            if (!err) {
                                                data = data.replace("[DisplayName]", tokenResult[0].DisplayName);
                                                data = data.replace("[EZEOneID]", tokenResult[0].ezeoneId);

                                                var mailOptions = {
                                                    from: EZEIDEmail,
                                                    to: emailId,
                                                    subject: 'Welcome to WhatMate™',
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
                                                    //console.log(result);
                                                    if (!err) {
                                                        if (result.message == 'success') {
                                                            var post = {
                                                                MessageType: 7,
                                                                Priority: 1,
                                                                ToMailID: mailOptions.to,
                                                                Subject: mailOptions.subject,
                                                                Body: mailOptions.html,
                                                                SentbyMasterID: tokenResult[0].masterid,
                                                                SentStatus: 1
                                                            };
                                                            //console.log(post);
                                                            var query = req.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                // Neat!
                                                                if (!err) {
                                                                    console.log('FnForgetPassword: Mail saved Successfully');

                                                                }
                                                                else {
                                                                    console.log('FnForgetPassword: Mail not Saved Successfully' + err);

                                                                }
                                                            });
                                                        }
                                                        else {
                                                            console.log('FnForgetPassword: Mail not Saved Successfully' + err);

                                                        }
                                                    }
                                                    else {
                                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);

                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnForgetPassword: readfile ' + err);
                                            }
                                        });
                                    }
                                    else {
                                        /*
                                        @TODO
                                        If email id is not there then send SMS for successfull registration
                                         */

                                    }

                                    response.status = true;
                                    response.message = "Sign Up Complete";
                                    response.error = null;
                                    response.data = {
                                        address: (req.body.address) ? req.body.address : '',
                                        latitude: (req.body.latitude) ? req.body.latitude : '',
                                        longitude: (req.body.longitude) ? req.body.longitude : '',
                                        emailId: (req.body.emailId) ? req.body.emailId : ''
                                    };
                                    res.status(200).json(response);

                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while sign up";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            });
                        }
                    });

                }
                else {
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }


};

/**
 * saving user's pin to make profile pin protected
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}",
    "pin":"{int}:[3]"
}
 * @method POST
 */
UserCtrl.savePin = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (!validator.isLength((req.body.password), 4, 100)) {
                            error.password = 'Password should be atleast 4 characters';
                            validationFlag *= false;
                        }
                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }

                        else {
                            var encryptPwd = '';
                            if (req.body.password) {
                                encryptPwd = req.st.hashPassword(req.body.password);
                            }
                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.pin),
                                req.st.db.escape(encryptPwd)
                            ];
                            /**
                             * Calling procedure to save deal
                             * @type {string}
                             */
                            var procQuery = 'CALL psave_pin( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, pinResult) {
                                if (!err && pinResult && pinResult[0] && pinResult[0][0]) {
                                    response.status = true;
                                    response.message = "Password saved successfully";
                                    response.error = null;
                                    response.data = {
                                        pin: (req.body.pin) ? req.body.pin : 0,
                                        userDetails: pinResult[0][0]
                                    };
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while saving pin";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

/**
 * generating OTP and sending SMS to given mobile number
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}",
    "pin":"{int}:[3]"
}
 * @method POST
 */
UserCtrl.mobileVerifyCodeGeneration = function (req, res, next) {

    var responseMsg = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.body.mobile) {
        error.mobile = 'Invalid mobile';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors';
        res.status(400).json(responseMsg);
        console.log(responseMsg);
    }
    /**
     * to get otp calling getRandomCode() function from std lib
     */
    else {
        var otp = req.st.getRandomCode();

        req.body.isdMobile = (req.body.isdMobile) ? req.body.isdMobile : 0;
        request({
            url: 'http://sms.ssdindia.com/api/sendhttp.php',
            qs: {
                authkey: '11891AaSe1MQ6W57038d4b',
                mobiles: req.body.isdMobile + req.body.mobile,
                message: 'Your verification code is ' + otp + '.',
                sender: 'EZEOne',
                route: 4
            },
            method: 'GET'

        }, function (error, response, body) {
            if (error) {
                console.log("Status code for error : " + response.statusCode);
                console.log(error);
            }
            else {
                console.log("Message sent successfully");
                console.log("Messege body is :" + body);
                console.log("Status Code :" + response.statusCode);
                responseMsg.status = true;
                responseMsg.message = "OTP sent successfully";
                responseMsg.data = {
                    mobile: req.body.mobile,
                    isdMobile: req.body.isdMobile,
                    otp: otp
                };
                responseMsg.error = null;
                res.status(200).json(responseMsg);
            }
        });
    }
};

/**
 * validating ezeone id
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}",
    "ezeoneid":"{string}:[21]"
}
 * @method GET
 */
UserCtrl.verifyEzeoneId = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.params.ezeoneId) {
        error.ezeoneId = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token), req.st.db.escape(req.params.ezeoneId),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL pvalidate_ezeoneid( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0] && result[0][0]) {
                        if (result[0][0].ezeoneId) {
                            response.status = true;
                            response.message = "This ezeoneid is available! ";
                            response.error = null;
                            response.data = {
                                ezeoneId: result[0][0].ezeoneId
                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Ezeoneid already exist! You can not use this ezeoneid";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while validating ezeoneid";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

/**
 * validating ezeone id
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}",
    "ezeoneid":"{string}:[21]"
}
 * @method GET
 */
UserCtrl.login = function (req, res, next) {
    var responseMessage = {
        status: false,
        message: "Invalid login details",
        data: null,
        error: null
    };

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');


    var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    var isWhatMate = req.body.isWhatMate ? parseInt(req.body.isWhatMate) : 0;

    var deviceToken = req.body.device_token ? req.body.device_token : '';
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    var isDialer = req.query.isDialer ? req.query.isDialer : 0;
    var code = req.body.code ? req.st.alterEzeoneId(req.body.code) : '';
    var APNS_Id = (req.body.APNS_Id) ? (req.body.APNS_Id) : "";
    var GCM_Id = (req.body.GCM_Id) ? (req.body.GCM_Id) : "";

    switch (req.platform) {

        case 'ios':
            /**
             * If IOS version is not supported
             */
            if (req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1) {
                responseMessage.versionStatus = 2;
                responseMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.send(responseMessage);
                return;
            }
            else if (req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1) {
                responseMessage.versionStatus = 1;
                responseMessage.versionMessage = "New update available. Please update your application to latest version";
                //res.send(responseMessage);
                //return;
            }
            else {
                responseMessage.versionStatus = 0;
                responseMessage.versionMessage = "Applications is up to date";
                //res.send(responseMessage);
            }
            break;
        case 'android':
            /**
             * If Android version is not supported
             */
            if (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1) {
                responseMessage.versionStatus = 2;
                responseMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.send(responseMessage);
                return;
            }
            else {
                responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
                    (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
                responseMessage.versionMessage = (responseMessage.versionStatus)
                    ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;

            }
            break;
        case 'web':
            /**
             * If Web version is not supported
             */
            if (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1) {
                responseMessage.versionStatus = 2;
                responseMessage.versionMessage = "Please update your application to latest version to continue using it";
                //res.send(responseMessage);
                //return;
            }
            else {
                responseMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
                    (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
                responseMessage.versionMessage = (responseMessage.versionStatus)
                    ? "New update available. Please update your application to latest version" : responseMessage.versionMessage;
            }
            break;
        default:
            responseMessage.versionStatus = 2;
            responseMessage.versionMessage = "Please update your application to latest version to continue using it";
        //res.send(responseMessage);
        //return;
        //break;
    }

    try {
        var passwordMatchStatus = false;
        var ezeoneId = '';
        var queryParams = req.st.db.escape(req.body.userName) + ',' + req.st.db.escape(code) + ',' + req.st.db.escape(DBSecretKey);
        var query = 'CALL plogin_v2(' + queryParams + ')';
        console.log(query);
        req.db.query(query, function (err, loginResult) {
            if ((!err) && loginResult && loginResult[0]) {
                console.log(loginResult);
                var loginDetails = loginResult[0];
                for (var i = 0; i < loginResult[0].length; i++) {
                    if (comparePassword(req.body.password, loginResult[0][i].Password)) {
                        passwordMatchStatus = true;
                        ezeoneId = loginResult[0][i].EZEID;
                        break;
                    }
                    else {
                        res.send(responseMessage);
                        console.log('Invalid password');
                    }
                }
                if (passwordMatchStatus) {
                    req.st.generateToken(ip, userAgent, ezeoneId, isWhatMate, APNS_Id, GCM_Id, isDialer, function (err, tokenResult) {

                        if ((!err) && tokenResult) {
                            var APNSID = req.query.APNSID ? req.query.APNSID : '';
                            var GCMID = req.query.GCMID ? req.query.GCMID : '';
                            var procQuery = 'CALL pGetEZEIDDetails(' + req.st.db.escape(tokenResult) + ',' + req.st.db.escape(DBSecretKey) + ',' + st.db.escape(APNSID) + ',' + st.db.escape(GCMID) + ',' + st.db.escape(isDialer) + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, UserDetailsResult) {
                                console.log(UserDetailsResult);
                                if ((!err) && UserDetailsResult[0] && UserDetailsResult[0][0]) {
                                    UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                        (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +
                                            UserDetailsResult[0][0].Picture) : '';

                                    /**
                                     * Every time the user loads the website the browser sends the cookie
                                     * back to the server to notify the user previous activity
                                     */
                                    res.cookie('Token', tokenResult, {
                                        maxAge: 900000,
                                        httpOnly: true
                                    });
                                    responseMessage.message = 'You are logged in';
                                    responseMessage.status = true;
                                    responseMessage.Token = tokenResult;
                                    responseMessage.IsAuthenticate = true;
                                    responseMessage.TID = loginDetails[0].TID;
                                    responseMessage.ezeone_id = loginDetails[0].EZEID;
                                    responseMessage.FirstName = loginDetails[0].FirstName;
                                    responseMessage.CompanyName = loginDetails[0].CompanyName;
                                    responseMessage.Type = loginDetails[0].IDTypeID;
                                    responseMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                    responseMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                    responseMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                    responseMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                    responseMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                    responseMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                    responseMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                    responseMessage.SalesFormMsg = loginDetails[0].SalesFormMsg;
                                    responseMessage.ReservationFormMsg = loginDetails[0].ReservationFormMsg;
                                    responseMessage.HomeDeliveryFormMsg = loginDetails[0].HomeDeliveryFormMsg;
                                    responseMessage.ServiceFormMsg = loginDetails[0].ServiceFormMsg;
                                    responseMessage.CVFormMsg = loginDetails[0].CVFormMsg;
                                    responseMessage.SalesItemListType = loginDetails[0].SalesItemListType;
                                    responseMessage.RefreshInterval = loginDetails[0].RefreshInterval;
                                    responseMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                    responseMessage.LastName = loginDetails[0].LastName;
                                    if (loginDetails[0].ParentMasterID == 0) {
                                        responseMessage.MasterID = loginDetails[0].TID;
                                    }
                                    else {
                                        responseMessage.MasterID = loginDetails[0].ParentMasterID;
                                    }
                                    responseMessage.PersonalEZEID = loginDetails[0].PersonalEZEID;
                                    responseMessage.VisibleModules = loginDetails[0].VisibleModules;
                                    responseMessage.FreshersAccepted = loginDetails[0].FreshersAccepted;
                                    responseMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                    responseMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                    responseMessage.mobilenumber = loginDetails[0].mobilenumber;
                                    responseMessage.isAddressSaved = loginDetails[0].isAddressSaved;
                                    responseMessage.group_id = loginDetails[0].group_id;
                                    responseMessage.isinstitute_admin = loginDetails[0].isinstituteadmin;
                                    responseMessage.cvid = loginDetails[0].cvid;
                                    responseMessage.profile_status = loginDetails[0].ps;
                                    responseMessage.isNewUser = loginDetails[0].isNewUser;
                                    responseMessage.userDetails = UserDetailsResult[0];

                                    console.log('FnLogin: Login success');
                                    /**
                                     * saving ios device id to database
                                     */
                                    if (isIphone == 1) {
                                        var queryParams1 = req.st.db.escape(ezeoneId) + ',' + req.st.db.escape(deviceToken);
                                        var query1 = 'CALL pSaveIPhoneDeviceID(' + queryParams1 + ')';
                                        req.db.query(query1, function (err, deviceResult) {
                                            if (!err) {
                                                console.log('FnLogin:Ios Device Id saved successfully');
                                            }
                                            else {
                                                console.log(err);
                                            }
                                        });
                                    }
                                    res.send(responseMessage);
                                }
                            });
                        }
                        else {
                            res.statusCode = 500;
                            res.send(responseMessage);
                            console.log('Failed to generate a token ' + err);
                        }
                    });
                }
            }
            else {
                res.statusCode = 500;
                res.send(responseMessage);
                console.log('Error: ' + err);
            }
        });
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + '......... error .........');
        console.log(ex);
        console.log('Error: ' + ex);
        res.send("Something went wrong! Please try again");
    }
};

/**
 * get profile data
 * @param req
 * @param res
 * @param next
 * @service-params {
    "token": "{string}"
}
 * @method GET
 */
UserCtrl.getProfileData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL get_profile_data( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result) {
                        response.status = true;
                        response.message = "User details loaded successfully";
                        response.error = null;
                        response.data = {
                            userData: {
                                displayName: result[0][0].displayName,
                                isdMobile: result[0][0].isdMobile,
                                mobileNo: result[0][0].mobileNo,
                                EZEOneId: result[0][0].EZEOneId,
                                address: result[0][0].address,
                                latitude: result[0][0].latitude,
                                longitude: result[0][0].longitude,
                                emailId: result[0][0].emailId,
                                keywords: result[0][0].keywords,
                                about: result[0][0].about,
                                jobTitle: result[0][0].jobTitle,
                                companyName: result[0][0].companyName,
                                pictureURL: (result[0][0].pictureURL) ?
                                    (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + result[0][0].pictureURL) : ''
                            },
                            vaultData: result[1],
                            tags: result[2]
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting user data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

UserCtrl.saveProfileData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var vaultData = req.body.vaultData;
                    if (typeof (vaultData) == "string") {
                        vaultData = JSON.parse(vaultData);
                    }
                    if (!vaultData) {
                        vaultData = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.keywords = req.body.keywords ? req.body.keywords : "";
                        req.body.about = req.body.about ? req.body.about : "";
                        req.body.jobTitle = req.body.jobTitle ? req.body.jobTitle : "";
                        req.body.companyName = req.body.companyName ? req.body.companyName : "";
                        req.body.EZEOneId = req.st.alterEzeoneId(req.body.EZEOneId);
                        req.body.latitude = req.body.latitude ? req.body.latitude : 0.0;
                        req.body.longitude = req.body.longitude ? req.body.longitude : 0.0;
                        req.body.displayName = req.body.displayName ? req.body.displayName : '';
                        req.body.isdMobile = req.body.isdMobile ? req.body.isdMobile : '';
                        req.body.mobileNo = req.body.mobileNo ? req.body.mobileNo : '';
                        req.body.emailId = req.body.emailId ? req.body.emailId : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.pictureURL ? req.body.pictureURL : ''),
                            req.st.db.escape(req.body.displayName),
                            req.st.db.escape(req.body.isdMobile),
                            req.st.db.escape(req.body.mobileNo),
                            req.st.db.escape(req.body.EZEOneId),
                            req.st.db.escape(req.body.address),
                            req.st.db.escape(req.body.latitude),
                            req.st.db.escape(req.body.longitude),
                            req.st.db.escape(req.body.emailId),
                            req.st.db.escape(JSON.stringify(vaultData)),
                            req.st.db.escape(req.body.keywords),
                            req.st.db.escape(req.body.about),
                            req.st.db.escape(req.body.jobTitle),
                            req.st.db.escape(req.body.companyName),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL update_profile_data( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result) {
                                response.status = true;
                                response.message = "Profile updated successfully";
                                response.error = null;
                                response.data = {
                                    userData: {
                                        displayName: result[0][0].displayName,
                                        isdMobile: result[0][0].isdMobile,
                                        mobileNo: result[0][0].mobileNo,
                                        EZEOneId: result[0][0].EZEOneId,
                                        address: result[0][0].address,
                                        latitude: result[0][0].latitude,
                                        longitude: result[0][0].longitude,
                                        emailId: result[0][0].emailId,
                                        pictureURL: (result[0][0].pictureURL) ?
                                            (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + result[0][0].pictureURL) : ''
                                    },
                                    vaultData: result[1],
                                    tags: result[2]
                                };
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting user data";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

UserCtrl.sendPasswordResetOTP = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.body.WhatMateId) {
        error['WhatMateId'] = 'WhatMateId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
            var message = "";

            //generate otp 6 digit random number
            var code = "";
            var possible = "1234567890";

            for (var i = 0; i <= 3; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }


            // if(isWhatMate ==0 )
            // {
            //     message='Your EZEOne password reset OTP is ' + code + ' .';
            // }
            // else{
            //     message='Your WhatMate password reset OTP is ' + code + ' .';
            // }

            var query = [
                req.st.db.escape(req.body.WhatMateId),
                req.st.db.escape(code),
                req.st.db.escape(DBSecretKey)
            ];

            console.log('CALL pvalidateEZEOne(' + query + ')');
            req.st.db.query('CALL pvalidateEZEOne(' + query + ')', function (err, otpResult) {
                
                console.log("error",err);

                if (!err && otpResult && otpResult[0] && otpResult[0][0].otp) {
                    console.log("otpResult[0][0].name", otpResult[0][0].name);
                    code = otpResult[0][0].otp;
                    message = 'Your WhatMate password reset OTP is ' + code + ' .';

                    if (otpResult[0][0].email) {
                        var file = path.join(__dirname, '../../../mail/templates/passwordResetOTP.html');

                        fs.readFile(file, "utf8", function (err, data) {

                            if (!err) {
                                data = data.replace("[name]", otpResult[0][0].name);
                                data = data.replace("[OTP]", code);

                                var mailOptions = {
                                    from: EZEIDEmail,
                                    to: otpResult[0][0].email,
                                    subject: 'Password Reset Request',
                                    html: data // html body
                                };

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                });
                            }
                        });
                    }

                    if (otpResult[0][0].isd && otpResult[0][0].mobile) {
                        if (otpResult[0][0].isd == "+977") {
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to: otpResult[0][0].mobile,
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
                        else if (otpResult[0][0].isd == "+91") {
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name: 'janardana@hirecraft.com',
                                    password: 'Ezeid2015',
                                    sender_id: 'WtMate',
                                    service: 'TRANS',
                                    mobile_no: otpResult[0][0].mobile,
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
                                mobile: otpResult[0][0].isd.replace("+", "") + otpResult[0][0].mobile,
                                msg: message,
                                duplicateCheck: 'true',
                                format: 'json'
                            }));
                            req.end();


                        }
                        else if (otpResult[0][0].isd != "") {
                            client.messages.create(
                                {
                                    body: message,
                                    to: otpResult[0][0].isd + otpResult[0][0].mobile,
                                    from: FromNumber
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

                            // request({
                            //     url: 'https://rest.nexmo.com/sms/json',
                            //     qs: {
                            //         api_key : '4405b7b5 ',
                            //         api_secret : '77dfad076c27e4c8',
                            //         to: otpResult[0][0].isd.replace("+","") + otpResult[0][0].mobile,
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
                    }
                    respMsg.status = true;
                    respMsg.message = 'OTP Sent Successfully';
                    respMsg.data = null;
                    res.status(200).json(respMsg);

                }
                else if(!err && otpResult && otpResult[0] && otpResult[0][0].messageError){
                    respMsg.status = false;
                    respMsg.message = otpResult[0][0].messageError;
                    respMsg.data = null;
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

UserCtrl.verifyPasswordResetOTP = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.WhatMateId) {
        error.WhatMateId = 'Invalid WhatMateId';
        validationFlag *= false;
    }
    if (!req.query.otp) {
        error.otp = 'Invalid otp';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var procParams = [
            req.st.db.escape(req.query.WhatMateId),
            req.st.db.escape(req.query.otp),
            req.st.db.escape(DBSecretKey)
        ];

        var procQuery = 'CALL pverifyresetcode( ' + procParams.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                if (result[0][0].message == "VALID") {
                    response.status = true;
                    response.message = "Valid OTP";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else if (result[0][0].message == "IN_VALID") {
                    response.status = false;
                    response.message = "In valid OTP";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "In valid OTP";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
            }
            else {
                response.status = false;
                response.message = "Error while validating otp";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};

UserCtrl.changePassword = function (req, res, next) {

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
    if (!req.body.WhatMateId) {
        error['WhatMateId'] = 'WhatMateId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var encryptPwd = req.st.hashPassword(req.body.password);
            req.body.isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;

            var procParams = [
                req.st.db.escape(encryptPwd),
                req.st.db.escape(req.body.WhatMateId),
                req.st.db.escape(req.body.otp),
                req.st.db.escape(DBSecretKey)
            ];

            var procQuery = 'CALL change_password( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, result) {
                if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                    respMsg.status = false;
                    respMsg.message = "Invalid OTP";
                    res.status(200).json(respMsg);
                }
                else if (!err) {
                //     if(result && result[0] && result[0][0] && result[1] && result[1][0]) {
                //         var name=(result[0] && result[0][0]) ? result[0][0].name : "";
                //         var emailId=(result[0] && result[0][0]) ? result[0][0].emailId : "";
                //         var mailContent=(result[1] && result[1][0]) ? result[1][0].mailbody : "";
                   
                

                //     if (mailContent) {
                //                 mailContent = mailContent.replace("[FirstName]", name);
                //                 mailContent = mailContent.replace("[FullName]", name);
        
                //                 var signature = (result[1] && result[1][0]) ? result[1][0].signature : "";
                //                 var disclaimer = (result[1] && result[1][0]) ? result[1][0].disclaimer : "";
                //                 var mailBCC = (result[1] && result[1][0]) ? result[1][0].mailBCC : "";
                //                 var mailSubject = (result[1] && result[1][0]) ? result[1][0].mailSubject : "";

                //                 var linkurl = (result[1] && result[1][0]) ? result[1][0].linkUrl : "";
                //                 var heMasterId = (result[1] && result[1][0]) ? result[1][0].heMasterId : "";

                //                 var code = Date.now().toString().concat(heMasterId);
                //                 var webLinkTo = linkurl + code;
                //                 webLinkTo = webLinkTo.replace('"', '');
                //                 webLinkTo = webLinkTo.replace('"', '');
        
                //                 mailContent = mailContent.replace("[Signature]", signature);
                //                 mailContent = mailContent.replace("[Disclaimer]", disclaimer);
                //                 mailContent=mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + webLinkTo + ">Click Here</a>");
                //             }
                //     var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                //     var email = new sendgrid.Email();
                //     email.from = "noreply@talentmicro.com";
                //     email.to = emailId;
                //     email.bcc=mailBCC;
                //     email.subject = mailSubject;
                //     email.html = mailContent;
                //     sendgrid.send(email, function (err, result) {
                //         //console.log(result);
                //         if (!err) {
                //             console.log("mail sent successfully");
                //         }
                //         else{
                //             console.log("error while sending mail");
                //         }
                //     });
                // }
                    respMsg.status = true;
                    respMsg.message = "Password changed successfully";
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
            respMsg.error = 'Internal Server Error';
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

UserCtrl.verifyUpdateOTP = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.otp) {
                        error.otp = 'Invalid otp';
                        validationFlag *= false;
                    }
                    if (!req.body.mobile) {
                        error.mobile = 'Invalid mobile';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.mobile),
                            req.st.db.escape(req.body.isdMobile),
                            req.st.db.escape(req.body.otp),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL verify_mobile( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                                if (result[0][0].message == "INVALID_OTP") {
                                    response.status = false;
                                    response.message = "In valid OTP";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                }

                            }
                            else {
                                response.status = true;
                                response.message = "Validated,mobile number is updated ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                        });
                    }
                });
            }
        });
    }
};

UserCtrl.sendPasswordResetOtpPhone = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };
    if (!req.body.WhatMateId) {
        error['WhatMateId'] = 'WhatMateId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var code = "";
            var possible = "1234567890";
            var isdMobile = "";
            var mobileNo = "";

            for (var i = 0; i <= 3; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            var query = [
                req.st.db.escape(req.body.WhatMateId),
                req.st.db.escape(code),
                req.st.db.escape(DBSecretKey)
            ];

            req.st.db.query('CALL pvalidateEZEOne(' + query + ')', function (err, insertResult) {
                if (!err && insertResult && insertResult[0] && insertResult[0][0].otp) {
                    code = insertResult[0][0].otp;
                    isdMobile = insertResult[0][0].isd;
                    mobileNo = insertResult[0][0].mobile;


                    var message = 'Your WhatMate password reset OTP is ' + code + ' .';
                    const response = new VoiceResponse();
                    response.say(
                        {
                            voice: 'alice',
                            loop: 2
                        },
                        message
                    );

                    var s = new Readable;
                    s.push(response.toString());
                    console.log(response.toString());

                    s.push(null);
                    var uniqueFileName = 'phone_' + uuid.v4() + '.xml';
                    var fileName = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + uniqueFileName;

                    req.st.uploadXMLToCloud(uniqueFileName, s, function (err) {
                        if (!err) {
                            client.calls
                                .create({
                                    url: fileName,
                                    to: isdMobile + mobileNo,
                                    from: FromNumber,
                                    method: 'GET'
                                },
                                    function (error, response) {
                                        if (error) {
                                            // req.st.deleteDocumentFromCloud(uniqueFileName);
                                            console.log("error", error);
                                            respMsg.status = false;
                                            respMsg.message = 'Something went wrong';
                                            res.status(500).json(respMsg);

                                        }
                                        else {
                                            // req.st.deleteDocumentFromCloud(uniqueFileName);
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

UserCtrl.invitePublicProfile = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var password = randomstring.generate({
                        length: 6,
                        charset: 'alphanumeric'
                    });
                    var message = "";

                    var encryptPwd = req.st.hashPassword(password);

                    req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;


                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.isdmobile),
                        req.st.db.escape(req.body.mobile),
                        req.st.db.escape(req.body.name),
                        req.st.db.escape(req.body.email),
                        req.st.db.escape(req.body.meetingId),
                        req.st.db.escape(encryptPwd),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.query.isDialer)
                    ];

                    //CompanyName
                    var procQuery = 'CALL he_invite_publicUser( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, userResult) {
                        if (!err && userResult && userResult[0]) {
                            console.log("userResult[0][0].status", userResult[0][0].status);

                            if (userResult[0][0].status == "New") {
                                // if(Qndata[0].email != ""){
                                //     mailerApi.sendMailNew('NewUserUpload', {
                                //         name : Qndata[0].name,
                                //         UserName : userResult[0][0].whatmateId,
                                //         Password : password
                                //     }, '',Qndata[0].email,[]);
                                // }

                                message = tokenResult[0].DisplayName + ' want you on WhatMate.Login ID: ' + userResult[0][0].ezeoneId + ',Password: ' + password + '. App Links: iOS: www.goo.gl/124323  Android: www.goo.gl/123234534';

                                if (userResult[0][0].mobile != "") {
                                    if (userResult[0][0].isd == "+977") {
                                        request({
                                            url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                            qs: {
                                                token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                                to: userResult[0][0].mobile,
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
                                    else if (userResult[0][0].isd == "+91") {
                                        request({
                                            url: 'https://aikonsms.co.in/control/smsapi.php',
                                            qs: {
                                                user_name: 'janardana@hirecraft.com',
                                                password: 'Ezeid2015',
                                                sender_id: 'WtMate',
                                                service: 'TRANS',
                                                mobile_no: userResult[0][0].mobile,
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
                                            mobile: userResult[0][0].isd.replace("+", "") + userResult[0][0].mobile,
                                            msg: message,
                                            duplicateCheck: 'true',
                                            format: 'json'
                                        }));
                                        req.end();


                                    }
                                    else if (userResult[0][0].isd != "") {
                                        client.messages.create(
                                            {
                                                body: message,
                                                to: userResult[0][0].isd + userResult[0][0].mobile,
                                                from: FromNumber
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

                                }

                            }
                            else if (userResult[0][0].status == "Existing") {
                                // if(Qndata[0].email != ""){
                                //     mailerApi.sendMailNew('existingUsers', {
                                //         name : Qndata[0].name,
                                //         UserName : userResult[0][0].whatmateId,
                                //         CompanyName : req.query.CompanyName
                                //     }, '',Qndata[0].email,[]);
                                // }

                                var messagePayload = {
                                    message: userResult[1][0].message,
                                    meetingId: userResult[1][0].meetingId,
                                    title: userResult[1][0].title,
                                    startDate: userResult[1][0].startDate,
                                    members: userResult[1][0].members,
                                    type: 91
                                };

                                if (userResult[2] && userResult[2][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(userResult[2][0].APNS_Id, messagePayload, 0);
                                }
                                if (userResult[3] && userResult[3][0].GCM_Id) {
                                    _Notification_aws.publish_Android(userResult[3][0].GCM_Id, messagePayload);
                                }

                                // message = 'Dear ' + Qndata[0].name  + ', Your existing profile on WhatMate is successfully linked to ' + req.query.CompanyName + ' now.';
                                //
                                // if(Qndata[0].mobile !="")
                                // {
                                //     if(Qndata[0].isdmobile == "+977"){
                                //         request({
                                //             url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                //             qs: {
                                //                 token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                //                 to : Qndata[0].mobile,
                                //                 message: message,
                                //                 sender: 'Techingen'
                                //             },
                                //             method: 'GET'
                                //
                                //         }, function (error, response, body) {
                                //             if(error)
                                //             {
                                //                 console.log(error,"SMS");
                                //             }
                                //             else{
                                //                 console.log("SUCCESS","SMS response");
                                //             }
                                //
                                //         });
                                //     }
                                //     else if(Qndata[0].isdmobile == "+91")
                                //     {
                                //         request({
                                //             url: 'https://aikonsms.co.in/control/smsapi.php',
                                //             qs: {
                                //                 user_name : 'janardana@hirecraft.com',
                                //                 password : 'Ezeid2015',
                                //                 sender_id : 'EZEONE',
                                //                 service : 'TRANS',
                                //                 mobile_no: Qndata[0].mobile,
                                //                 message: message,
                                //                 method : 'send_sms'
                                //             },
                                //             method: 'GET'
                                //
                                //         }, function (error, response, body) {
                                //             if(error)
                                //             {
                                //                 console.log(error,"SMS");
                                //             }
                                //             else{
                                //                 console.log("SUCCESS","SMS response");
                                //             }
                                //         });
                                //
                                //         req = http.request(options, function (res) {
                                //             var chunks = [];
                                //
                                //             res.on("data", function (chunk) {
                                //                 chunks.push(chunk);
                                //             });
                                //
                                //             res.on("end", function () {
                                //                 var body = Buffer.concat(chunks);
                                //                 console.log(body.toString());
                                //             });
                                //         });
                                //
                                //         req.write(qs.stringify({ userId: 'talentmicro',
                                //             password: 'TalentMicro@123',
                                //             senderId: 'DEMOSG',
                                //             sendMethod: 'simpleMsg',
                                //             msgType: 'text',
                                //             mobile: Qndata[0].isdmobile.replace("+","") + Qndata[0].mobile,
                                //             msg: message,
                                //             duplicateCheck: 'true',
                                //             format: 'json' }));
                                //         req.end();
                                //
                                //     }
                                //     else if(Qndata[0].isdmobile != "")
                                //     {
                                //         client.messages.create(
                                //             {
                                //                 body: message,
                                //                 to: Qndata[0].isdmobile + Qndata[0].mobile,
                                //                 from: '+14434322305'
                                //             },
                                //             function (error, response) {
                                //                 if(error)
                                //                 {
                                //                     console.log(error,"SMS");
                                //                 }
                                //                 else{
                                //                     console.log("SUCCESS","SMS response");
                                //                 }
                                //             }
                                //         );
                                //
                                //     }
                                //
                                // }
                            }

                            response.status = true;
                            response.message = "Invited successfully";
                            response.error = null;
                            response.data = {
                                status: userResult[0][0].status
                            };
                            res.status(200).json(response);
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "Invited successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while inviting";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

UserCtrl.getWelcomeAttachments = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token)
                ];

                var procQuery = 'CALL he_get_companyAttachments( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, attachmentResult) {
                    if (!err && attachmentResult && attachmentResult[0]) {
                        var output = [];
                        for (var i = 0; i < attachmentResult[0].length; i++) {
                            var res1 = {};
                            res1.seqNo = attachmentResult[0][i].seqNo;
                            res1.attachment = (attachmentResult[0][i].attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentResult[0][i].attachment) : "";
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Attachments loaded successfully";
                        response.error = null;
                        response.data = {
                            attachmentList: output
                        };
                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No attachments found";
                        response.error = null;
                        response.data = {
                            attachmentList: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while inviting";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

UserCtrl.getUserDetails = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    /**
     * @todo FnGetUserDetails
     */
    var rtnMessage = {
        versionStatus: 0,
        versionMessage: "Your application is up to date"
    };


    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.token;


        if (Token) {
            req.st.validateToken(Token, function (err, tokenResult) {
                console.log(err);
                //console.log(Result);
                if (!err) {
                    if (tokenResult) {
                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                            req.body.dialerAPNS_Id = req.body.dialerAPNS_Id ? req.body.dialerAPNS_Id : "";
                            req.body.dialerGCM_Id = req.body.dialerGCM_Id ? req.body.dialerGCM_Id : "";

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.dialerAPNS_Id),
                                req.st.db.escape(req.body.dialerGCM_Id),
                                req.st.db.escape(DBSecretKey)
                            ];

                            req.db.query('CALL pGetDialerEZEIDDetails(' + procParams.join(',') + ')', function (err, UserDetailsResult) {
                                if (!err) {
                                    //console.log('UserDetailsResult',UserDetailsResult);
                                    if (UserDetailsResult[0]) {
                                        if (UserDetailsResult[0].length > 0) {
                                            UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                                (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserDetailsResult[0][0].Picture) : '';
                                            console.log('FnGetUserDetails : tmaster: User details sent successfully');
                                            UserDetailsResult[0][0].versionStatus = rtnMessage.versionStatus;
                                            UserDetailsResult[0][0].versionMessage = rtnMessage.versionMessage;
                                            response.status = true;
                                            response.message = "Attachments loaded successfully";
                                            response.error = null;
                                            response.data = UserDetailsResult[0][0];

                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            });
                                            // res.send(UserDetailsResult[0][0]);  // response is json object now from array
                                        }
                                        else {
                                            response.status = true;
                                            response.message = "FnGetUserDetails : tmaster: No User details found";
                                            response.error = null;
                                            response.data = null;
                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            });
                                            // res.json(null);
                                            console.log('FnGetUserDetails : tmaster: No User details found');
                                        }
                                    }
                                    else {
                                        response.status = true;
                                        response.message = "FnGetUserDetails : tmaster: No User details found";
                                        response.error = null;
                                        response.data = null;
                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                            res.status(200).json(response);
                                        });
                                        // res.json(null);
                                        console.log('FnGetUserDetails : tmaster: No User details found');
                                    }

                                }
                                else {
                                    response.status = false;
                                    response.message = "FnGetUserDetails : tmaster:" + err;
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                    // res.json(null);
                                    // res.statusCode = 500;
                                    console.log('FnGetUserDetails : tmaster:' + err);
                                }
                            });
                        });

                    }
                    else {
                        console.log('FnGetUserDetails: Invalid token');
                        res.status(401).json(response);
                        // res.json(null);
                    }
                }
                else {
                    console.log('FnGetUserDetails: ' + err);
                    res.status(500).json(response);
                    // res.json(null);
                }
            });
        }
        else {
            // res.json(null);
            res.status(400).json(response);
            console.log('FnGetUserDetails :  token is empty');
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetUserDetails error:' + ex);

    }
};

UserCtrl.getUserLink = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var error = {};

    

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.query.name = req.query.name ? req.query.name : '';

        var procParams = [
           
            req.st.db.escape(req.query.code),
            req.st.db.escape(req.query.name)
        ];

        var procQuery = 'CALL wm_get_termsAndconditionlink( ' + procParams.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            if (!err && result && result[0] ) {
               
                    response.status = true;
                    response.message = "success";
                    response.error = null;
                    if (result[0][0].termsAndCondition) {
                        result[0][0].termsAndCondition = result[0][0].termsAndCondition.replace("[DisplayName]",req.query.name);
                        result[0][0].termsAndCondition = result[0][0].termsAndCondition.replace("[DisplayName]",req.query.name);
                    }
                    response.data = (result[0][0]) ? result[0][0] :"";
                    res.status(200).json(response);
                }
                
                else {
                    response.status = false;
                    response.message = "error while loading";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
                        
        });
    }
};

module.exports = UserCtrl;