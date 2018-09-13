var request = require('request');
var validator = require('validator');
var bcrypt = null;
var fs = require('fs');
var http = require('https');
var path = require('path');
var EZEIDEmail = 'noreply@talentmicro.com';
var appConfig = require('../../../ezeone-config.json');

const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+18647547021';

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
    bcrypt = require('bcrypt');
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
var nkCtrl = {};
var error = {};


// nkCtrl.signup = function (req, res, next) {

//     var response = {
//         status: false,
//         message: "Error while user registration",
//         data: null,
//         error: null
//     };
//     var validationFlag = true;
//     var error = {};

//     if (!req.body.mobile) {
//         error.mobile = 'Invalid mobile';
//         validationFlag *= false;
//     }
//     if (!validator.isLength((req.body.firstName), 3, 40)) {
//         error.firstName = 'First Name can be minimum 3 and maximum 40 characters';
//         validationFlag *= false;
//     }
//     // if (!validator.isEmail(req.body.email)) {
//     //     error.email = 'Invalid Email';
//     //     validationFlag *= false;
//     // }

//     if (!validationFlag) {
//         response.error = error;
//         response.message = 'Please check the errors';
//         res.status(400).json(response);
//         console.log(response);
//     }

//     else {
//         try {
//             req.body.lastName = (req.body.lastName) ? req.body.lastName : '';
//             req.body.isdMobile = (req.body.isdMobile) ? req.body.isdMobile : '';
//             req.body.password = (req.body.password) ? req.body.password : '';
//             req.body.isWhatMate = (req.body.isWhatMate) ? req.body.isWhatMate : 0;

//             var procParams = [
//                 req.st.db.escape(req.body.firstName),
//                 req.st.db.escape(req.body.lastName || ''),
//                 req.st.db.escape(req.body.middleName || ''),
//                 req.st.db.escape(req.body.mobileIsd || ''),
//                 req.st.db.escape(req.body.displayName || ''),
//                 req.st.db.escape(req.body.mobileNumber || ''),
//                 req.st.db.escape(req.body.emailId),
//                 req.st.db.escape(req.body.password || ''),
//                 req.st.db.escape(req.body.latitude || 0.0),
//                 req.st.db.escape(req.body.longitude || 0.0),
//                 req.st.db.escape(DBSecretKey)
//             ];
//             /**
//              * Calling procedure to save user details
//              * @type {string}
//              */
//             var procQuery = 'CALL nk_signUp( ' + procParams.join(',') + ')';
//             console.log(procQuery);
//             req.db.query(procQuery, function (err, userResult) {
//                 /**
//                  * fetching ip address and user agent from header
//                  * @type {*|string}
//                  */
//                 var ip = req.headers['x-forwarded-for'] ||
//                     req.connection.remoteAddress ||
//                     req.socket.remoteAddress;
//                 var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
//                 if (!err && userResult && userResult[0] && userResult[0][0] && userResult[0][0].masterId) {
//                     req.st.generateTokenNK(ip, userAgent, userResult[0][0].ezeoneId, req.body.isWhatMate, function (err, token) {
//                         if (err) {
//                             console.log('Error while generating token' + err);
//                             response.status = false;
//                             response.message = "Error while generating token";
//                             response.error = null;
//                             response.data = null;
//                             res.status(500).json(response);
//                         }
//                         else {
//                             response.status = true;
//                             response.message = "You are successfully register";
//                             response.error = null;
//                             response.data = {
//                                 firstName: (req.body.firstName) ? req.body.firstName : '',
//                                 lastName: (req.body.lastName) ? req.body.lastName : '',
//                                 email: (req.body.email) ? req.body.email : '',
//                                 mobile: (req.body.mobile) ? req.body.mobile : '',
//                                 isdMobile: (req.body.isdMobile) ? req.body.isdMobile : '',
//                                 token: token,
//                                 masterId: (userResult[0][0].masterId) ? userResult[0][0].masterId : 0,
//                                 ezeoneId: (userResult[0][0].ezeoneId) ? userResult[0][0].ezeoneId : 0
//                             };
//                             res.status(200).json(response);
//                         }
//                     });
//                 }
//                 else {
//                     response.status = false;
//                     response.message = "Error while user registration";
//                     response.error = null;
//                     response.data = null;
//                     res.status(500).json(response);
//                 }
//             });
//         }
//         catch (ex) {
//             var errorDate = new Date();
//             console.log(errorDate.toTimeString() + '......... error .........');
//             console.log(ex);
//             console.log('Error: ' + ex);
//         }
//     }

// };

nkCtrl.masterData = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {


                var procQuery = 'CALL nk_get_nkMaster()';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] ) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            countryCodeList :result[0] && result[0][0] ? result[0] :[]
                        };
                        res.status(200).json(response);
                    }

                    else if (!err ) {
                        response.status = false;
                        response.message ='No Data found';
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "DB error! Something went wrong";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


nkCtrl.signUp = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
  
    if (!req.body.displayName) {
        error.displayName = 'Invalid displayName';
        validationFlag *= false;
    }

    if (!req.body.mobileNumber) {
        error.mobileNumber = 'Invalid mobileNumber';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.body.mobileIsd || ''),
                    req.st.db.escape(req.body.displayName || ''),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.password || ''),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.body.otp || 0),
                    req.st.db.escape(req.body.profilePicture || '')
                ];


                var procQuery = 'CALL nk_signUp( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message =result[0][0].message;
                        response.error = null;

                        response.data = result[1] && result[1][0] ? result[1][0] : {};
                        res.status(200).json(response);
                    }

                    else if (!err && result[0] && result[0][0] && result[0][0]._error) {
                        response.status = false;
                        response.message =result[0][0]._error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "DB error! Something went wrong";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


nkCtrl.sendOtp = function (req, res, next) {

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

    if (req.body.mobileNo) {
        mobileNo = req.body.mobileNo;
    }
    else if (req.body.mobileNumber) {
        mobileNo = req.body.mobileNumber;
    }

    if (req.body.isdMobile) {
        isdMobile = req.body.isdMobile;
    }
    else if (req.body.mobileIsd) {
        isdMobile = req.body.mobileIsd;
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

            message = 'Your NearKart verification OTP is ' + code + ' . Please enter this 4 digit number where prompted to proceed --NearKart Helpdesk.';

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code) + ',' + req.st.db.escape(isdMobile)+ ',' + req.st.db.escape(emailId)+ ',' + req.st.db.escape(DBSecretKey);
            console.log("query", query);
            req.st.db.query('CALL nk_generate_otp(' + query + ')', function (err, insertResult) {
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


nkCtrl.toVerifyOtp = function (req, res, next) {
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

    if (req.body.mobileNo) {
        mobileNo = req.body.mobileNo;
    }
    else if (req.body.mobileNumber) {
        mobileNo = req.body.mobileNumber;
    }

    if (req.body.isdMobile) {
        isdMobile = req.body.isdMobile;
    }
    else if (req.body.mobileIsd) {
        isdMobile = req.body.mobileIsd;
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

        var procQuery = 'CALL nk_verify_otp( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0][0].message == "OTP verified successfully") {
                response.status = true;
                if (result[1] && result[1][0] && result[1][0]._exists)
                response.message = result[0][0]._exists;
                else
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




module.exports = nkCtrl;
