var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();


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
// const VoiceResponse = require('twilio').twiml.VoiceResponse;

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;

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

try {
    bcrypt = require('bcrypt');
}
catch (ex) {
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
}

/**
 * Hashes the password for saving into database
 * @param password
 * @returns {*}
 */
function hashPassword(password){
    if(!password){
        return null;
    }
    try{
        var hash = bcrypt.hashSync(password, 12);
        return hash;
    }
    catch(ex){
        console.log(ex);
    }
}

/**
 * Compare the password and the hash for authenticating purposes
 * @param password
 * @param hash
 * @returns {*}
 */
function comparePassword(password,hash){
    if(!password){
        return false;
    }
    if(!hash){
        return false;
    }
    return bcrypt.compareSync(password,hash);
}

var walkInCvCtrl = {};
var error = {};

walkInCvCtrl.getmasterData = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),

                ];

                var procQuery = 'CALL wm_get_masterDataForWalkinForm( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < result[3].length; i++) {
                            var res2 = {};
                            res2.educationId = result[3][i].educationId;
                            res2.educationTitle = result[3][i].EducationTitle;
                            res2.specialization = result[3][i].specialization ? JSON.parse(result[3][i].specialization) : [];
                            output.push(res2);
                        }

                        var output1 = [];
                        for (var j = 0; j < result[4].length; j++) {
                            var res3 = {};
                            res3.educationId = result[4][j].educationId;
                            res3.educationTitle = result[4][j].EducationTitle;
                            res3.specialization = result[4][j].specialization ? JSON.parse(result[4][j].specialization) : [];
                            output1.push(res3);
                        }

                        response.data = {

                            currency: (result && result[0]) ? result[0] : [],
                            scale: (result && result[1]) ? result[1] : [],
                            duration: (result && result[2]) ? result[2] : [],
                            ugEducationList: output ? output : [],
                            pgEducationList: output1 ? output1 : []

                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {

                            currency: [],
                            scale: [],
                            duration: [],
                            ugEducationList: [],
                            pgEducationList: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting master data";
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

walkInCvCtrl.getskillIndustry = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.type = req.query.type ? req.query.type : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.keyword),
                    req.st.db.escape(req.query.type)

                ];

                var procQuery = 'CALL wm_get_skill_industry_forWalkinForm( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {

                            searchResult: (result && result[0]) ? result[0] : []

                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {

                            searchResult: []

                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting  data";
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

walkInCvCtrl.saveCandidate = function (req, res, next) {

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
    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid Com123pany';
        validationFlag *= false;
    }
    if (!req.body.firstName) {
        error.firstName = 'First Name is Mandatory';
        validationFlag *= false;
    }
    if (!req.body.emailId) {
        error.emailId = 'EmailId is Mandatory';
        validationFlag *= false;
    }

    if (!req.body.mobileNumber) {
        error.mobileNumber = 'Mobile Number is Mandatory';
        validationFlag *= false;
    }
    var ugEducation = req.body.ugEducation;
    if (typeof (ugEducation) == "string") {
        ugEducation = JSON.parse(ugEducation);
    }
    if (!ugEducation) {
        ugEducation = [];
    }

    var pgEducation = req.body.pgEducation;
    if (typeof (pgEducation) == "string") {
        pgEducation = JSON.parse(pgEducation);
    }
    if (!pgEducation) {
        pgEducation = [];
    }

    var skills = req.body.skills;
    if (typeof (Skills) == "string") {
        skills = JSON.parse(skills);
    }
    if (!skills) {
        skills = [];
    }

    var industry = req.body.industry;
    if (typeof (industry) == "string") {
        industry = JSON.parse(industry);
    }
    if (!industry) {
        industry = [];
    }

    var currency = req.body.currency;
    if (typeof (currency) == "string") {
        currency = JSON.parse(currency);
    }
    if (!currency) {
        currency = {};
    }
    var scale = req.body.scale;
    if (typeof (scale) == "string") {
        scale = JSON.parse(scale);
    }
    if (!scale) {
        scale = {};
    }
    var period = req.body.period;
    if (typeof (period) == "string") {
        period = JSON.parse(period);
    }
    if (!period) {
        period = {};
    }

    var location = req.body.location;
    if (typeof (location) == "string") {
        location = JSON.parse(location);
    }
    if (!location) {
        location = {};
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please Check the Errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {


                req.body.heParentId = (req.body.heParentId) ? req.body.heParentId : 0;
                req.body.fresherExperience = (req.body.fresherExperience) ? req.body.fresherExperience : 0;
                req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                req.body.presentEmployer = (req.body.presentEmployer) ? req.body.presentEmployer : "";
                req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.experience = (req.body.experience) ? req.body.experience : '0.0';
                req.body.presentSalary = (req.body.presentSalary) ? req.body.presentSalary : '0.0';
                req.body.walkinType = (req.body.walkinType) ? req.body.walkinType : 0;
                // req.body.referedByUserId = (req.body.referedByUserId) ? req.body.referedByUserId : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.heParentId),
                    req.st.db.escape(req.body.fresherExperience),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(JSON.stringify(skills)),
                    req.st.db.escape(JSON.stringify(industry)),
                    req.st.db.escape(JSON.stringify(ugEducation)),
                    req.st.db.escape(JSON.stringify(pgEducation)),
                    req.st.db.escape(req.body.experience),
                    req.st.db.escape(req.body.presentEmployer),
                    req.st.db.escape(req.body.noticePeriod),
                    req.st.db.escape(JSON.stringify(currency)),
                    req.st.db.escape(req.body.presentSalary),
                    req.st.db.escape(JSON.stringify(scale)),
                    req.st.db.escape(JSON.stringify(period)),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.walkInType),
                    req.st.db.escape(req.body.userId),
                    req.st.db.escape(JSON.stringify(location)),
                    req.st.db.escape(req.body.profilePicture),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_save_wlkinForm( ' + inputs.join(',') + ')';
                console.log(procQuery);

                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    
                    if (!err && results && results[0][0]) {
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                            senderName: results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++) {         // main line 
                            if (notificationTemplaterRes.parsedTpl) {
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                    (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    moment().format("YYYY-MM-DD HH:mm:ss"),
                                    '',
                                    0,
                                    0,
                                    null,
                                    '',
                                    /** Data object property to be sent with notification **/
                                    {
                                        messageList: {
                                            messageId: results[1][i].messageId,
                                            message: results[1][i].message,
                                            messageLink: results[1][i].messageLink,
                                            createdDate: results[1][i].createdDate,
                                            messageType: results[1][i].messageType,
                                            messageStatus: results[1][i].messageStatus,
                                            priority: results[1][i].priority,
                                            senderName: results[1][i].senderName,
                                            senderId: results[1][i].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: results[1][i].senderId,
                                            groupType: 2,
                                            transId: results[1][i].transId,
                                            formId: results[1][i].formId,
                                            currentStatus: results[1][i].currentStatus,
                                            currentTransId: results[1][i].currentTransId,
                                            parentId: results[1][i].parentId,
                                            accessUserType: results[1][i].accessUserType,
                                            heUserId: results[1][i].heUserId,
                                            formData: JSON.parse(results[1][i].formDataJSON)
                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Walkin Form saved successfully";
                        response.error = null;
                        response.data = {
                            messageList:
                                {
                                    messageId: results[0][0].messageId,
                                    message: results[0][0].message,
                                    messageLink: results[0][0].messageLink,
                                    createdDate: results[0][0].createdDate,
                                    messageType: results[0][0].messageType,
                                    messageStatus: results[0][0].messageStatus,
                                    priority: results[0][0].priority,
                                    senderName: results[0][0].senderName,
                                    senderId: results[0][0].senderId,
                                    receiverId: results[0][0].receiverId,
                                    transId: results[0][0].transId,
                                    formId: results[0][0].formId,
                                    groupId: req.body.groupId,
                                    currentStatus: results[0][0].currentStatus,
                                    currentTransId: results[0][0].currentTransId,
                                    localMessageId: req.body.localMessageId,
                                    parentId: results[0][0].parentId,
                                    accessUserType: results[0][0].accessUserType,
                                    heUserId: results[0][0].heUserId,
                                    formData: JSON.parse(results[0][0].formDataJSON)
                                },
                                walkinMessage:results[2][0],
                                token: results[3][0].token
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else if(!err && (results [1] || results [2] && results [3]) ){
            
                            response.status = true;
                            response.message = "Walkin Form saved successfully";
                            response.error = null;
                            response.data={
                                walkinMessage:results[2][0],
                                token:results[3][0].token
                            };
                            res.status(200).json(response);
                        }

                    else if(!err && (results [1] || results [2]) ){

                        response.status = true;
                        response.message = "Walkin Form saved successfully";
                        response.error = null;
                        response.data={
                            walkinMessage:results[2][0]
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error While Saving walkIn";
                        response.error = null;
                        console.log(err);
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


walkInCvCtrl.sendOtp = function (req, res, next) {

    var mobileNo = req.body.mobileNo;
    var isdMobile = req.body.isdMobile;
    // var displayName = req.body.displayName ;
    var emailId = req.body.emailId ? req.body.emailId : "";
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

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code);
            console.log("query", query);
            req.st.db.query('CALL generate_otp(' + query + ')', function (err, insertResult) {
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


walkInCvCtrl.verifyOtp = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid otp",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.mobileNo) {
        error.mobileNo = "Mobile number is mandatory";
        validationFlag = false;
    }

    if (!req.query.otp) {
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
            req.st.db.escape(req.query.mobileNo),
            req.st.db.escape(req.query.otp)
        ];

        var procQuery = 'CALL wm_walkIn_verifyOtp( ' + inputs.join(',') + ')';
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

walkInCvCtrl.bannerList = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_walkInBanners( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Banner List loaded successfully";
                        response.error = null;

                        response.data = {
                            bannerList: result[0],
                            companyLogo:result[1][0].companyLogo,
                            registrationType :result[6][0].walkinRegistrationType,  // need to come from backend, will be done later.
                            // tokenGeneration : result[6][0].walkinTokenGeneration,
                            tokenGeneration :0,
                            industryList: result[2] ? result[2]:[],
                            skillList: result[3] ? result[3]:[],// need to come from backend, will be done later.
                            locationList:result[4] ? result[4]:[],
                            referedNameList:result[5] ? result[5]:[],
                            walkInJobs : (result[7] && result[7][0]) ? result[7] : []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            bannerList: [],
                            companyLogo:"",
                            registrationType :0,  // need to come from backend, will be done later.
                            tokenGeneration : 0,
                            industryList: [],
                            skillList: []  
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting bannerList";
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

walkInCvCtrl.InterviewSchedulerForPublish = function (req, res, next) {
    var status = true, error = null;

    var response = {
        status: false,
        message: "Invalid user",
        data: null,
        error: null
    };

    if (!req.body.password) {
        error['password'] = 'password is mandatory';
        status *= false;
    }

    if (!req.body.loginId) {
        error['loginId'] = 'loginId is mandatory';
        status *= false;
    }

    var assessment = req.body.assessment;
    if (typeof (assessment) == "string") {
        assessment = JSON.parse(assessment);
    }
    if (!assessment) {
        assessment = {};
    }


    var assessmentDetail = {};
    assessmentDetail = req.body.assessmentTypeList;
    if (typeof (assessmentDetail) == "string") {
        assessmentDetail = JSON.parse(assessmentDetail);
    }
    if (!assessmentDetail) {
        assessmentDetail = {};
    }

    var skillAssessment = {};
    skillAssessment = req.body.skillAssessment;
    if (typeof (skillAssessment) == "string") {
        skillAssessment = JSON.parse(skillAssessment);
    }
    if (!skillAssessment) {
        skillAssessment = {};
    }


    var interviewRound = req.body.interviewRound;
    if (typeof (interviewRound) == "string") {
        interviewRound = JSON.parse(interviewRound);
    }
    if (!interviewRound) {
        interviewRound = {};
    }
    var requirementDetails = req.body.requirementDetails;
    if (typeof (requirementDetails) == "string") {
        requirementDetails = JSON.parse(requirementDetails);
    }
    if (!requirementDetails) {
        requirementDetails={};
    }

    var candidateDetails = req.body.candidateDetails;
    if (typeof (candidateDetails) == "string") {
        candidateDetails = JSON.parse(candidateDetails);
    }
    if (!candidateDetails) {
        candidateDetails={};
    }

    var clientDetails = req.body.clientDetails;
    if (typeof (clientDetails) == "string") {
        clientDetails = JSON.parse(clientDetails);
    }
    if (!clientDetails) {
        clientDetails={};
    }

    var senderGroupId;
    var loginId = req.body.loginId;
    var password = req.body.password;
    var apiKey = req.body.APIKey;
    // var heMasterId = req.body.heMasterId;

    if (status) {

        var queryParams = req.st.db.escape(loginId) + ',' + req.st.db.escape(apiKey)+ ',' + req.st.db.escape(DBSecretKey);
        var query = 'CALL checkLogin(' + queryParams + ')';
        console.log('query', query);
        req.db.query(query, function (err, loginResult) {
            console.log(loginResult);
            if (!err) {

                if (loginResult && loginResult[0][0]) {

                        var loginDetails = loginResult;

                        if(loginResult[0][0].userError == 'Invalid User'){

                            response.status=false;
                            response.error = error;
                            response.message = loginResult[0][0].userError;
                            res.status(401).json(response);
                        }

                        else if(loginResult[0][0].companyError == 'Invalid Company User'){

                            response.status=false;
                            response.error = error;
                            response.message = loginResult[0][0].companyError;
                            res.status(401).json(response);
                        }
                        else {

                            if(comparePassword(password, loginResult[0][0].Password)){
                                var heMasterId=loginResult[1][0].heMasterId;

                                var CVFile=candidateDetails.cvFile;
                                function base64_decode(base64str, CVFile) {
                                    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
                                    var bitmap = new Buffer(base64str, 'base64');
                                    // write buffer to file
                                    fs.writeFileSync(CVFile, bitmap);
                                    console.log();
                                }

                                var source=2;

                                if ((!err) && loginResult[0]) {
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                                    req.body.status = req.body.status ? req.body.status : 1;
                                    req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                                    req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                                    req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                                    req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                                    req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                                    req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                                    // req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                                    req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                                    req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                                    req.body.notes = req.body.notes ? req.body.notes : "";
                                    req.body.interviewDuration = req.body.interviewDuration ? req.body.interviewDuration : 0;

                                    var procParams = [

                                        req.st.db.escape(req.body.loginId),
                                        req.st.db.escape(heMasterId),
                                        req.st.db.escape(req.body.parentId),
                                        req.st.db.escape(JSON.stringify(interviewRound)),
                                        req.st.db.escape(req.body.reportingDateTime),
                                        req.st.db.escape(req.body.interviewDuration),
                                        req.st.db.escape(req.body.notes),
                                        req.st.db.escape(JSON.stringify(assessment)),
                                        req.st.db.escape(req.body.senderNotes),
                                        req.st.db.escape(req.body.approverNotes),
                                        req.st.db.escape(req.body.receiverNotes),
                                        req.st.db.escape(req.body.changeLog),
                                        
                                        req.st.db.escape(req.body.learnMessageId),
                                        req.st.db.escape(req.body.accessUserType),
                                        req.st.db.escape(req.body.approverCount),
                                        req.st.db.escape(req.body.receiverCount),
                                        req.st.db.escape(req.body.status),
                                            req.st.db.escape(JSON.stringify(requirementDetails)),
                                            req.st.db.escape(JSON.stringify(candidateDetails)),
                                            req.st.db.escape(JSON.stringify(clientDetails)),

                                        req.st.db.escape(DBSecretKey),
                                        req.st.db.escape(source)
                                    ];

                                    var procQuery = 'CALL wm_save_interviewSchedulerForHirecraft( ' + procParams.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, results) {
                                        console.log(err);

                                        var isWeb = req.query.isWeb;

                                        if (!err && results && results[0]) {
                                            senderGroupId = results[0][0].senderId;
                                            notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                                senderName: results[0][0].senderName
                                            });

                                            for (var i = 0; i < results[1].length; i++) {         // main line
                                                if (notificationTemplaterRes.parsedTpl) {
                                                    notification.publish(
                                                        results[1][i].receiverId,
                                                        (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                        (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                        results[0][0].senderId,
                                                        notificationTemplaterRes.parsedTpl,
                                                        31,
                                                        0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                                        (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                        1,
                                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                                        '',
                                                        0,
                                                        0,
                                                        null,
                                                        '',
                                                        /** Data object property to be sent with notification **/
                                                        {
                                                            messageList: {
                                                                messageId: results[1][i].messageId,
                                                                message: results[1][i].message,
                                                                messageLink: results[1][i].messageLink,
                                                                createdDate: results[1][i].createdDate,
                                                                messageType: results[1][i].messageType,
                                                                messageStatus: results[1][i].messageStatus,
                                                                priority: results[1][i].priority,
                                                                senderName: results[1][i].senderName,
                                                                senderId: results[1][i].senderId,
                                                                receiverId: results[1][i].receiverId,
                                                                groupId: results[1][i].groupId,
                                                                groupType: 2,
                                                                transId: results[1][i].transId,
                                                                formId: results[1][i].formId,
                                                                currentStatus: results[1][i].currentStatus,
                                                                currentTransId: results[1][i].currentTransId,
                                                                parentId: results[1][i].parentId,
                                                                accessUserType: results[1][i].accessUserType,
                                                                heUserId: results[1][i].heUserId,
                                                                formData: JSON.parse(results[1][i].formDataJSON)
                                                            }
                                                        },
                                                        null,
                                                        // tokenResult[0].isWhatMate,
                                                        results[1][i].secretKey);
                                                    console.log('postNotification : notification for compose_message is sent successfully');
                                                }
                                                else {
                                                    console.log('Error in parsing notification compose_message template - ',
                                                        notificationTemplaterRes.error);
                                                    console.log('postNotification : notification for compose_message is sent successfully');
                                                }
                                            }

                                            response.status = true;
                                            response.message = "Interview scheduled successfully";
                                            response.error = null;
                                            response.data = {
                                               /* messageList:
                                                    {
                                                        messageId: results[0][0].messageId,
                                                        message: results[0][0].message,
                                                        messageLink: results[0][0].messageLink,
                                                        createdDate: results[0][0].createdDate,
                                                        messageType: results[0][0].messageType,
                                                        messageStatus: results[0][0].messageStatus,
                                                        priority: results[0][0].priority,
                                                        senderName: results[0][0].senderName,
                                                        senderId: results[0][0].senderId,
                                                        receiverId: results[0][0].receiverId,
                                                        transId: results[0][0].transId,
                                                        formId: results[0][0].formId,
                                                        groupId: req.body.groupId,
                                                        currentStatus: results[0][0].currentStatus,
                                                        currentTransId: results[0][0].currentTransId,
                                                        localMessageId: req.body.localMessageId,
                                                        parentId: results[0][0].parentId,
                                                        accessUserType: results[0][0].accessUserType,
                                                        heUserId: results[0][0].heUserId,
                                                        formData: JSON.parse(results[0][0].formDataJSON)
                                                    }*/
                                               transactionId:results[2][0].transId
                                            };
                                            res.status(200).json(response);
                                        }
                                        else {
                                            response.status = false;
                                            response.message = "Error while scheduling interview";
                                            response.error = null;
                                            response.data = null;
                                            res.status(500).json(response);
                                        }
                                    });
                                }  // loginDetails[0] closes here
                            }
                            else {
                                response.status=false;
                                response.error = error;
                                response.message = 'Invalid  loginDatails';
                                res.status(401).json(response);
                            }
                        }
                        // if password comparison closed here
                        // else {
                        //     response.status=false;
                        //     response.error = error;
                        //     response.message = 'password doesnt match';
                        //     res.status(401).json(response);
                        //     // console.log('FnLogin:password doesnt match found');
                        // }

                }
                else {
                    response.status=false;
                    response.error = error;
                    response.message = 'Invalid login credentials';
                    res.status(401).json(response);
                }
            }
            else {
                    response.status=false;
                    response.error = error;
                    response.message = 'Internal server error';
                    res.status(500).json(response);
                // console.log('FnLogin:' + err);
            }
        });
    }
    else {
        response.error = error;
        response.message = 'Invalid User and password';
        res.status(400).json(response);
        // console.log('loginId and password required');
    }
};

module.exports = walkInCvCtrl;