var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
// var fs = require('fs');
var bodyParser = require('body-parser');

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var b64;
var extensionType;
var name;

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var htmlpdf = require('html-pdf');
var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();

var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');


var request = require('request');
var path = require('path');
var uuid = require('node-uuid');
var http = require('https');
// var Readable = require('stream').Readable;
var bcrypt = null;
var EZEIDEmail = 'noreply@talentmicro.com';
// const VoiceResponse = require('twilio').twiml.VoiceResponse;

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;
const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = CONFIG.DB.FromNumber || '+18647547021';

const client = require('twilio')(accountSid, authToken);

var uuid = require('node-uuid');
const fs = require('fs');
var defer = require('q');

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
function hashPassword(password) {
    if (!password) {
        return null;
    }
    try {
        var hash = bcrypt.hashSync(password, 12);
        return hash;
    }
    catch (ex) {
        console.log(ex);
    }
}

var gcloud = require('gcloud');
// var fs = require('fs');

var appConfig = require('../../../../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});


var uploadDocumentToCloud = function (uniqueName, readStream, callback) {
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function () {
        console.log('done');
        if (callback) {
            if (typeof (callback) == 'function') {
                callback(null);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function (err) {
        if (callback) {
            if (typeof (callback) == 'function') {
                console.log(err);
                callback(err);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};

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

var walkInCvCtrl = {};
var error = {};

var candidateDetailsHirecraft;
var cloudUrl;

/*var attachFile = new Promise(function (resolve, reject) {

    var CVFile=candidateDetailsHirecraft.cvFile;
    var CVFileType=candidateDetailsHirecraft.cvFileType;
    var CVFileName=candidateDetailsHirecraft.CVFileName;
    var b64=CVFile;
    var buff = new Buffer(b64, 'base64');
    fs.writeFileSync('Resume.'+ CVFileType , buff);
    var attachment={
        path:'Resume.'+ CVFileType ,
        extension:CVFileType,
        fileName:CVFileName
    };

    var uniqueId = uuid.v4();
    var filetype = (attachment.extension) ? attachment.extension : '';
    console.log(filetype);
    cloudUrl = uniqueId + '.' + filetype;
    console.log (uniqueId);
    aFilename = attachment.fileName;
    console.log("aFilenameaFilename",aFilename);
    console.log("req.files.attachment.path",attachment.path);

    var readStream = fs.createReadStream(attachment.path);


    uploadDocumentToCloud(cloudUrl, readStream, function (err) {
        if (!err) {
            console.log(cloudUrl)
        }
        else {

            console.log('FnSaveServiceAttachment:attachment not upload');
        }
        fs.unlinkSync('Resume.'+ CVFileType);
    });
});*/



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

    var isdMobile = req.body.mobileISD;
    var mobileNo = req.body.mobileNumber;
    var message = "Congratulations your profile is successfully registered";

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
        ugEducation = {};
    }

    var pgEducation = req.body.pgEducation;
    if (typeof (pgEducation) == "string") {
        pgEducation = JSON.parse(pgEducation);
    }
    if (!pgEducation) {
        pgEducation = {};
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

    var details = req.body.details;
    if (typeof (details) == "string") {
        details = JSON.parse(details);
    }
    if (!details) {
        details = {};
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

    var walkInJobs = req.body.walkInJobs;
    if (typeof (walkInJobs) == "string") {
        walkInJobs = JSON.parse(walkInJobs);
    }
    if (!walkInJobs) {
        walkInJobs = {};
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

                var mailSent = 0;
                var msgSent = 0;
                var referrerMailSent = 0;
                var isWeb = req.query.isWeb;
                req.body.heParentId = (req.body.heParentId) ? req.body.heParentId : 0;
                req.body.fresherExperience = (req.body.fresherExperience) ? req.body.fresherExperience : 0;
                req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                req.body.presentEmployer = (req.body.presentEmployer) ? req.body.presentEmployer : "";
                req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.experience = (req.body.experience) ? req.body.experience : '0.0';
                req.body.presentSalary = (req.body.presentSalary) ? req.body.presentSalary : '0.0';
                req.body.walkinType = req.body.walkinType ? req.body.walkinType : 0;
                req.body.DOB = (req.body.DOB) ? req.body.DOB : null;
                req.body.IDNumber = (req.body.IDNumber) ? req.body.IDNumber : '';
                req.body.profilePicture = (req.body.profilePicture) ? req.body.profilePicture : '';
                req.body.middleName = (req.body.middleName) ? req.body.middleName : '';
                req.body.registrationType = req.body.registrationType ? req.body.registrationType : 0;
                req.body.IDNumberNew = (req.body.IDNumberNew) ? req.body.IDNumberNew : '';
                req.body.localId = (req.body.localId) ? req.body.localId : 0;
                req.body.token = (req.body.token) ? req.body.token : 0;
                req.body.userType = (req.body.userType) ? req.body.userType : 0;


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
                    req.st.db.escape(req.body.senderNotes || ''),
                    req.st.db.escape(req.body.approverNotes || ''),
                    req.st.db.escape(req.body.receiverNotes || ''),
                    req.st.db.escape(req.body.changeLog || ''),
                    req.st.db.escape(req.body.groupId || ''),
                    req.st.db.escape(req.body.learnMessageId || 0),
                    req.st.db.escape(req.body.accessUserType || 0),
                    req.st.db.escape(req.body.approverCount || 0),
                    req.st.db.escape(req.body.receiverCount || 0),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.walkInType),
                    req.st.db.escape(JSON.stringify(details)),
                    req.st.db.escape(JSON.stringify(location)),
                    req.st.db.escape(req.body.profilePicture),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(JSON.stringify(walkInJobs)),
                    req.st.db.escape(req.body.DOB),
                    req.st.db.escape(req.body.IDNumber),
                    req.st.db.escape(req.body.middleName),
                    req.st.db.escape(req.body.registrationType),
                    req.st.db.escape(req.body.IDNumberNew),
                    req.st.db.escape(req.body.userType)
                ];


                var procQuery = 'CALL wm_save_wlkinForm( ' + inputs.join(',') + ')';
                console.log(procQuery);

                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    // if (!err && results && results[0][0]) {
                    //     senderGroupId = results[0][0].senderId;
                    //     notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                    //         senderName: results[0][0].senderName
                    //     });

                    //     for (var i = 0; i < results[1].length; i++) {         // main line 
                    //         if (notificationTemplaterRes.parsedTpl) {
                    //             notification.publish(
                    //                 results[1][i].receiverId,
                    //                 (results[0][0].groupName) ? (results[0][0].groupName) : '',
                    //                 (results[0][0].groupName) ? (results[0][0].groupName) : '',
                    //                 results[0][0].senderId,
                    //                 notificationTemplaterRes.parsedTpl,
                    //                 31,
                    //                 0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                    //                 (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                    //                 0,
                    //                 0,
                    //                 0,
                    //                 0,
                    //                 1,
                    //                 moment().format("YYYY-MM-DD HH:mm:ss"),
                    //                 '',
                    //                 0,
                    //                 0,
                    //                 null,
                    //                 '',
                    //                 /** Data object property to be sent with notification **/
                    //                 {
                    //                     messageList: {
                    //                         messageId: results[1][i].messageId,
                    //                         message: results[1][i].message,
                    //                         messageLink: results[1][i].messageLink,
                    //                         createdDate: results[1][i].createdDate,
                    //                         messageType: results[1][i].messageType,
                    //                         messageStatus: results[1][i].messageStatus,
                    //                         priority: results[1][i].priority,
                    //                         senderName: results[1][i].senderName,
                    //                         senderId: results[1][i].senderId,
                    //                         receiverId: results[1][i].receiverId,
                    //                         groupId: results[1][i].senderId,
                    //                         groupType: 2,
                    //                         transId: results[1][i].transId,
                    //                         formId: results[1][i].formId,
                    //                         currentStatus: results[1][i].currentStatus,
                    //                         currentTransId: results[1][i].currentTransId,
                    //                         parentId: results[1][i].parentId,
                    //                         accessUserType: results[1][i].accessUserType,
                    //                         heUserId: results[1][i].heUserId,
                    //                         formData: JSON.parse(results[1][i].formDataJSON)
                    //                     }
                    //                 },
                    //                 null,
                    //                 tokenResult[0].isWhatMate,
                    //                 results[1][i].secretKey);
                    //             console.log('postNotification : notification for compose_message is sent successfully');
                    //         }
                    //         else {
                    //             console.log('Error in parsing notification compose_message template - ',
                    //                 notificationTemplaterRes.error);
                    //             console.log('postNotification : notification for compose_message is sent successfully');
                    //         }
                    //     }

                    //     response.status = true;
                    //     response.message = "Walkin Form saved successfully";
                    //     response.error = null;
                    //     response.data = {
                    //         messageList:
                    //             {
                    //                 messageId: results[0][0].messageId,
                    //                 message: results[0][0].message,
                    //                 messageLink: results[0][0].messageLink,
                    //                 createdDate: results[0][0].createdDate,
                    //                 messageType: results[0][0].messageType,
                    //                 messageStatus: results[0][0].messageStatus,
                    //                 priority: results[0][0].priority,
                    //                 senderName: results[0][0].senderName,
                    //                 senderId: results[0][0].senderId,
                    //                 receiverId: results[0][0].receiverId,
                    //                 transId: results[0][0].transId,
                    //                 formId: results[0][0].formId,
                    //                 groupId: req.body.groupId,
                    //                 currentStatus: results[0][0].currentStatus,
                    //                 currentTransId: results[0][0].currentTransId,
                    //                 localMessageId: req.body.localMessageId,
                    //                 parentId: results[0][0].parentId,
                    //                 accessUserType: results[0][0].accessUserType,
                    //                 heUserId: results[0][0].heUserId,
                    //                 formData: JSON.parse(results[0][0].formDataJSON)
                    //             },
                    //         walkinMessage: results[2][0],
                    //         token: results[3][0].token
                    //     };
                    //     if (isWeb == 0) {
                    //         var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    //         zlib.gzip(buf, function (_, result) {
                    //             response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                    //             res.status(200).json(response);
                    //         });
                    //     }
                    //     else {
                    //         res.status(200).json(response);
                    //     }

                    // }
                    if (!err && (results[1] || results[2] && results[2][0] && results[3] && results[3][0])) {    // walkInForm Message with token
                        console.log('Result with walk-In Message and Token');
                        if (results[2] && results[2][0] || results[3] || results[3][0]) {

                            var mailContent = (results[3] && results[3][0]) ? results[3][0].mailBody : "Dear [FirstName] <br>Thank you for registering your profile.  We will revert to you once we find your Resume match one of the requirements we have.In the mean time, please [ClickHere] to upload your latest CV that will help us with more detailed information about your profile.Wishing you all the best<br><br>[WalkINSignature]<br>[Disclaimer]";

                            if (mailContent) {
                                mailContent = mailContent.replace("[FirstName]", req.body.firstName);
                                mailContent = mailContent.replace("[FullName]", (req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName));

                                var webLink = (results[3] && results[3][0]) ? results[3][0].webLink : "";

                                // For updating resume though url link after registering for walkIn

                                var parentId = (results[4] && results[4][0]) ? results[4][0].walkInApplicantId : undefined;
                                walkInApplicantId = Date.now().toString().concat(parentId);
                                var webLinkTo = results[3][0].whatmateWebTestOrLive + walkInApplicantId;
                                webLinkTo = webLinkTo.replace('"', '');
                                webLinkTo = webLinkTo.replace('"', '');

                                mailContent = mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + webLinkTo + ">Click Here</a>");
                                // ------------------------------------------------

                                // mailContent = mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + webLink + ">Click Here</a>");

                                var walkInSignature = (results[3] && results[3][0]) ? results[3][0].walkInSignature : "";
                                var disclaimer = (results[3] && results[3][0]) ? results[3][0].disclaimer : "";

                                mailContent = mailContent.replace("[WalkINSignature]", walkInSignature);
                                mailContent = mailContent.replace("[Disclaimer]", disclaimer);
                            }

                            var subject = results[3][0].mailSubject ? results[3][0].mailSubject : 'Registration Completed Successfully';
                            // send mail to candidate
                            var email = new sendgrid.Email();
                            email.from = results[2][0].fromEmailId ? results[2][0].fromEmailId : 'noreply@talentmicro.com';
                            email.to = req.body.emailId;
                            email.subject = subject;
                            email.html = mailContent;

                            sendgrid.send(email, function (err11, result11) {
                                if (err11) {
                                    console.log("Failed to send to candidate", err11);
                                }
                                else {
                                    mailSent = 1;
                                    console.log("mail sent successfully to candidate", result11);
                                }
                            });

                            // To send mail to refered person
                            if (results[2] && results[4] && results[4][0]) {
                                var refererEmail = new sendgrid.Email();
                                refererEmail.from = results[2][0].fromEmailId ? results[2][0].fromEmailId : 'noreply@talentmicro.com';
                                refererEmail.to = results[4][0].refererMailId;
                                refererEmail.subject = results[4][0].message;
                                refererEmail.html = results[4][0].message;

                                sendgrid.send(refererEmail, function (err1, result1) {
                                    if (err1) {
                                        console.log("Failed to send to referrer", err1);
                                    }
                                    else {
                                        req.db.query('update 1039_trans set mailSent=1 where tid=' + results[4][0].walkInTransId, function (err, mailsentResults) {
                                            if (!err) {
                                                console.log('mail sent status is updated successfully');
                                            }
                                        });
                                        referrerMailSent = 1;
                                        console.log("mail sent successfully to referrer", result1);

                                    }
                                });
                            }

                            // to send sms to candidate
                            if (results[3][0].sendCandidateSms) {
                                message = results[3][0].candidateSmsFormat ? results[3][0].candidateSmsFormat : message;
                                message = message.replace('[token]', results[1][0].token);

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

                                    }, function (error2, response2, body2) {
                                        if (error2) {
                                            console.log(error2, "SMS");
                                        }
                                        else {
                                            console.log("SUCCESS", "SMS response");
                                            console.log("SUCCESS", "SMS response");
                                        }

                                    });
                                }
                                else if (isdMobile == "+91") {
                                    console.log('mobile number and isd is', isdMobile, mobileNo);
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

                                    }, function (error2, response2, body2) {
                                        if (error2) {
                                            console.log(error2, "SMS");
                                        }
                                        else {
                                            console.log("SUCCESS", "SMS response with ISD");
                                            msgSent = 1;

                                            req.db.query('update 1039_trans set msgSent=1 where tid=' + results[4][0].walkInTransId, function (msgerr, msgsentResults) {
                                                if (!msgerr) {
                                                    console.log('msg sent status is updated successfully');
                                                }
                                            });
                                        }
                                    });

                                    var req5 = http.request(options, function (res5) {
                                        var chunks = [];

                                        res5.on("data", function (chunk) {
                                            chunks.push(chunk);
                                            console.log('sms fateway type 2 sent the sms');
                                        });

                                        res5.on("end", function () {
                                            var body5 = Buffer.concat(chunks);
                                            console.log(body5.toString());
                                        });
                                    });

                                    req5.write(qs.stringify({
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
                                    console.log('sms type 2 gateway worked');
                                    req5.end();
                                    msgSent = 1;
                                }
                                else if (isdMobile != "") {
                                    client.messages.create(
                                        {
                                            body: message,
                                            to: isdMobile + mobileNo,
                                            from: FromNumber
                                        },
                                        function (error6, response6) {
                                            if (error6) {
                                                console.log(error6, "SMS");
                                            }
                                            else {
                                                msgSent = 1;
                                                req.db.query('update 1039_trans set msgSent=1 where tid=' + results[4][0].walkInTransId, function (msgerr, msgsentResults) {
                                                    if (!msgerr) {
                                                        console.log('msg sent status is updated successfully');
                                                    }
                                                });
                                                console.log("SUCCESS", "SMS response with empty isd");
                                            }
                                        });
                                }
                            }
                        }

                        // if (referrerMailSent==0){
                        //     referrerMailSent=1;
                        // }
                        // if (mailSent == 0){
                        //     mailSent=1;
                        // }
                        // if(msgSent = 0){
                        //     msgSent=1;
                        // }
                        if (referrerMailSent && mailSent && msgSent) {
                            var updateQuery = 'CALL wm_afterWalkRegConfMsgMailSent( ' + results[4][0].walkInTransId + ',' + mailSent + ',' + msgSent + ',' + referrerMailSent + ',' + results[1][0].token + ')';
                            console.log(updateQuery);

                            req.db.query(updateQuery, function (err, afterResults) {
                                if (!err && afterResults[0] && afterResults[0][0]) {
                                    console.log("registration mailsent or msg sent respectively");
                                }
                            });
                        }

                        response.status = true;
                        response.message = "Walkin Form saved successfully";
                        response.error = null;
                        response.data = {
                            walkinMessage: results[0][0],
                            token: results[1][0].token,
                            localId : req.body.localId ? req.body.localId: 0
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
                                from: FromNumber//'+14434322305' //+18647547021
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

        req.body.heParentId = req.body.heParentId ? req.body.heParentId : 0;
        req.body.mobileISD = req.body.mobileISD ? req.body.mobileISD : '';
        req.body.IDNumber = req.body.IDNumber ? req.body.IDNumber : '';
        req.body.emailId = req.body.emailId ? req.body.emailId : '';
        req.body.firstName = req.body.firstName ? req.body.firstName : '';
        req.body.heMasterId = req.body.heMasterId ? req.body.heMasterId : 0;


        var inputs = [
            req.st.db.escape(req.query.mobileNo),
            req.st.db.escape(req.query.otp),
            req.st.db.escape(req.body.heParentId),
            req.st.db.escape(req.body.firstName),
            req.st.db.escape(req.body.lastName),
            req.st.db.escape(req.body.mobileISD),
            req.st.db.escape(req.body.IDNumber),
            req.st.db.escape(req.body.emailId),
            req.st.db.escape(req.body.heMasterId)
        ];

        var procQuery = 'CALL wm_walkIn_verifyOtp( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            // console.log(result);
            if (!err && result && result[0][0].message == "OTP verified successfully" && result[2] && result[2][0]) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;

                if (result[2] && result[2][0]) {
                    result[2][0].location = (result[2] && result[2][0] && result[2][0].location) ? JSON.parse(result[2][0].location) : {};
                    if (result[2][0].location.locationId == 0) {
                        result[2][0].location = {};
                    }

                    result[2][0].currency = (result[2] && result[2][0]) ? JSON.parse(result[2][0].currency) : {};
                    if (result[2][0].currency.presentSalaryCurrId == 0) {
                        result[2][0].currency = {};
                    }

                    result[2][0].scale = (result[2] && result[2][0]) ? JSON.parse(result[2][0].scale) : {};
                    if (result[2][0].scale.presentSalaryScaleId == 0) {
                        result[2][0].scale = {};
                    }

                    result[2][0].period = (result[2] && result[2][0]) ? JSON.parse(result[2][0].period) : {};
                    if (result[2][0].period.presentSalaryPeriodId == 0) {
                        result[2][0].period = {};
                    }

                    result[2][0].details = (result[2] && result[2][0]) ? JSON.parse(result[2][0].details) : {};
                    if (result[2][0].details.referedId == 0 && result[2][0].details.empCode == "" && result[2][0].details.referedName == "") {
                        result[2][0].details = {};
                    }

                    result[2][0].skills = (result[2] && result[2][0]) ? JSON.parse(result[2][0].skills) : [];
                    if (result[2][0].skills.skillId == 0) {
                        result[2][0].skills = {};
                    }
                    result[2][0].industry = (result[2] && result[2][0]) ? JSON.parse(result[2][0].industry) : [];
                    if (result[2][0].industry.industryId == 0) {
                        result[2][0].industry = {};
                    }
                    result[2][0].ugEducation = (result[2] && result[2][0]) ? JSON.parse(result[2][0].ugEducation) : {};
                    if (result[2][0].ugEducation.educationId == 0) {
                        result[2][0].ugEducation = {};
                    }
                    result[2][0].pgEducation = (result[2] && result[2][0]) ? JSON.parse(result[2][0].pgEducation) : {};
                    if (result[2][0].pgEducation.educationId == 0) {
                        result[2][0].pgEducation = {};
                    }
                    // result[2][0].walkInJobs = (result[2] && result[2][0]) ? JSON.parse(result[2][0].walkInJobs):{};

                }
                response.data = {
                    message: (result[0] && result[0][0]) ? result[0][0].message : '',
                    existsMessage: (result[1] && result[1][0]) ? result[1][0]._error : '',
                    applicantDetails: (result[2] && result[2][0]) ? result[2][0] : {}
                   
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "OTP verified successfully") {
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
                    // existsMessage:'',
                    // applicantDetails:{}
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
                    var output = [];
                    for (var i = 0; i < result[11].length; i++) {
                        var res2 = {};
                        res2.educationId = result[11][i].educationId;
                        res2.educationTitle = result[11][i].EducationTitle;
                        res2.specialization = result[11][i].specialization ? JSON.parse(result[11][i].specialization) : [];
                        output.push(res2);
                    }

                    var output1 = [];
                    for (var j = 0; j < result[12].length; j++) {
                        var res3 = {};
                        res3.educationId = result[12][j].educationId;
                        res3.educationTitle = result[12][j].EducationTitle;
                        res3.specialization = result[12][j].specialization ? JSON.parse(result[12][j].specialization) : [];
                        output1.push(res3);
                    }


                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Banner List loaded successfully";
                        response.error = null;
                        response.data = {
                            bannerList: result[0],
                            companyLogo: result[1][0].companyLogo,
                            registrationType: result[6][0].walkinRegistrationType,  // need to come from backend, will be done later.
                            tokenGeneration: result[6][0].walkinTokenGeneration,
                            walkInWelcomeMessage: result[6][0].walkInWelcomeMessage,


                            industryList: result[2] ? result[2] : [],
                            skillList: result[3] ? result[3] : [],// need to come from backend, will be done later.
                            locationList: result[4] ? result[4] : [],
                            referedNameList: result[5] ? result[5] : [],
                            walkInJobs: (result[7] && result[7][0]) ? result[7] : [],
                            currency: (result && result[8]) ? result[8] : [],
                            scale: (result && result[9]) ? result[9] : [],
                            duration: (result && result[10]) ? result[10] : [],
                            ugEducationList: output ? output : [],
                            pgEducationList: output1 ? output1 : [],
                            isDOBRequired: result[13][0].isDOBRequired,
                            acceptTnCFlag: result[13][0].acceptTnCFlag,
                            acceptTnCMsgFormat: result[13][0].acceptTnCMsgFormat,
                            isIDRequired: result[14][0].isIDRequired,
                            IDType: result[14][0].IDType,  // field Name
                            isIDNumberOrString: (result[14] && result[14][0]) ? result[14][0].isIDNumberOrString : 1,
                            maxIDLength: (result[14] && result[14][0]) ? result[14][0].maxIDLength : 0,

                            isIDRequiredNew: result[14][0].isIDRequiredNew,
                            IDTypeNew: result[14][0].IDTypeNew,  // field Name
                            isIDNumberOrStringNew: (result[14] && result[14][0]) ? result[14][0].isIDNumberOrStringNew : 1,
                            maxIDLengthNew: (result[14] && result[14][0]) ? result[14][0].maxIDLengthNew : 0,

                            DOBType: result[13][0].DOBType,
                            isVisitorCheckIn: result[14][0].isVisitorCheckIn,
                            isWalkIn: result[14][0].isWalkIn,
                            isVisitorCheckOut: result[14][0].isVisitorCheckOut,
                            vendorDetails: (result && result[15]) ? result[15] : [],
                            directWalkIn: result[14][0].directWalkIn,
                            referredByEmployeeList: result[14][0].referredByEmployeeList,
                            referredByName: result[14][0].referredByName,
                            vendors: result[14][0].vendors,
                            isProfileMandatory: (result[16] && result[16][0] && result[16][0].isProfileMandatory) ? result[16][0].isProfileMandatory : 0,
                            showJobCode: (result[17] && result[17][0] && result[17][0].showJobCode) ? result[17][0].showJobCode : 0,
                            syncInBackground: (result[17] && result[17][0] && result[17][0].syncInBackground) ? result[17][0].syncInBackground : 0,
                            completionMessage: result[18][0].completionMessage


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
                            companyLogo: "",
                            registrationType: 0,  // need to come from backend, will be done later.
                            tokenGeneration: 0,
                            walkInWelcomeMessage: '',
                            industryList: [],
                            skillList: [],
                            currency: [],
                            scale: [],
                            duration: [],
                            ugEducationList: [],
                            pgEducationList: [],
                            isDOBRequired: 0,
                            acceptTnCFlag: 0,
                            acceptTnCMsgFormat: '',
                            isIDRequired: 0,
                            IDType: 0,
                            isIDNumberOrString: 1,
                            maxIDLength: 0,
                            isIDRequiredNew: 0,
                            IDTypeNew: 0,
                            isIDNumberOrStringNew: 1,
                            maxIDLengthNew: 0,
                            DOBType: '',
                            isVisitorCheckIn: 0,
                            isWalkIn: 0,
                            isVisitorCheckOut: 0,
                            vendorDetails: [],
                            directWalkIn: 0,
                            referredByEmployeeList: 0,
                            referredByName: 0,
                            vendors: 0,
                            showJobCode: 0,
                            syncInBackground:0,
                            completionMessage:''
                            
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
        requirementDetails = {};
    }

    var candidateDetails = req.body.candidateDetails;
    if (typeof (candidateDetails) == "string") {
        candidateDetails = JSON.parse(candidateDetails);
    }
    if (!candidateDetails) {
        candidateDetails = {};
    }

    var clientDetails = req.body.clientDetails;
    if (typeof (clientDetails) == "string") {
        clientDetails = JSON.parse(clientDetails);
    }
    if (!clientDetails) {
        clientDetails = {};
    }

    var senderGroupId;
    var loginId = req.body.loginId;
    var password = req.body.password;
    var apiKey = req.body.APIKey;
    // var heMasterId = req.body.heMasterId;

    if (status) {

        var queryParams = req.st.db.escape(loginId) + ',' + req.st.db.escape(apiKey) + ',' + req.st.db.escape(DBSecretKey);
        var query = 'CALL checkLogin(' + queryParams + ')';
        console.log('query', query);
        req.db.query(query, function (err, loginResult) {
            console.log(loginResult);
            if (!err) {

                if (loginResult && loginResult[0][0]) {

                    var loginDetails = loginResult;

                    if (loginResult[0][0].userError == 'Invalid User') {

                        response.status = false;
                        response.error = error;
                        response.message = loginResult[0][0].userError;
                        res.status(401).json(response);
                    }

                    else if (loginResult[0][0].companyError == 'Invalid Company User') {

                        response.status = false;
                        response.error = error;
                        response.message = loginResult[0][0].companyError;
                        res.status(401).json(response);
                    }
                    else {

                        if (comparePassword(password, loginResult[0][0].Password)) {

                            if ((!err) && loginResult[0]) {
                                var heMasterId = loginResult[1][0].heMasterId;
                                console.log('heMasterId is', heMasterId);
                                candidateDetailsHirecraft = candidateDetails;
                                // console.log(candidateDetailsHirecraft)

                                var b64 = candidateDetails.cvFile;
                                console.log("----------", b64, "-=-==--=--=-");
                                var extensionType = candidateDetails.cvFileType;
                                // console.log("----------",extensionType);
                                var name = candidateDetails.CVFileName;

                                var attachFile = new Promise(function (resolve, reject) {



                                    // new Buffer(b64, 'base64').toString();
                                    var buff = new Buffer(b64, 'base64');
                                    fs.writeFileSync('stack-abuse-logo-out.docx', buff);

                                    // console.log('Base64 image data converted to file: stack-abuse-logo-out.txt');

                                    fs.readFile('stack-abuse-logo-out.docx', 'utf8', function (err, data) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        console.log("-hbjkliu-", data);
                                    });

                                    var attachment = {
                                        path: 'stack-abuse-logo-out.docx',
                                        extension: extensionType,
                                        fileName: name
                                    };

                                    var uniqueId = uuid.v4();
                                    var filetype = (attachment.extension) ? attachment.extension : '';
                                    //    console.log(filetype);
                                    aUrl = uniqueId + '.' + filetype;
                                    //    console.log (uniqueId);
                                    aFilename = attachment.fileName;
                                    //    console.log("aFilenameaFilename",aFilename);
                                    //    console.log("req.files.attachment.path",attachment.path);

                                    var readStream = fs.createReadStream(attachment.path);


                                    uploadDocumentToCloud(aUrl, readStream, function (err) {
                                        if (!err) {
                                            console.log(aUrl)
                                        }
                                        else {

                                            console.log('FnSaveServiceAttachment:attachment not upload');
                                        }
                                    });
                                    fs.unlinkSync('stack-abuse-logo-out.docx');

                                });

                                attachFile.then(function (result) {
                                    // Use user details from here
                                    console.log(result)
                                }, function (err) {
                                    console.log(err);
                                })



                                candidateDetails.cvFile = aUrl;

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

                                    req.st.db.escape(DBSecretKey)
                                ];

                                var procQuery = 'CALL wm_save_interviewSchedulerForHirecraft( ' + procParams.join(',') + ')';
                                //  console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    console.log(err);

                                    var isWeb = req.query.isWeb;

                                    if (!err && results && results[0]) {
                                        senderGroupId = results[0][0].senderId;
                                        // notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                        //     senderName: results[0][0].senderName
                                        // });

                                        // for (var i = 0; i < results[1].length; i++) {         // main line
                                        //     if (notificationTemplaterRes.parsedTpl) {
                                        //         notification.publish(
                                        //             results[1][i].receiverId,
                                        //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                        //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                        //             results[0][0].senderId,
                                        //             notificationTemplaterRes.parsedTpl,
                                        //             31,
                                        //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                        //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                        //             0,
                                        //             0,
                                        //             0,
                                        //             0,
                                        //             1,
                                        //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                        //             '',
                                        //             0,
                                        //             0,
                                        //             null,
                                        //             '',
                                        //             /** Data object property to be sent with notification **/
                                        //             {
                                        //                 messageList: {
                                        //                     messageId: results[1][i].messageId,
                                        //                     message: results[1][i].message,
                                        //                     messageLink: results[1][i].messageLink,
                                        //                     createdDate: results[1][i].createdDate,
                                        //                     messageType: results[1][i].messageType,
                                        //                     messageStatus: results[1][i].messageStatus,
                                        //                     priority: results[1][i].priority,
                                        //                     senderName: results[1][i].senderName,
                                        //                     senderId: results[1][i].senderId,
                                        //                     receiverId: results[1][i].receiverId,
                                        //                     groupId: results[1][i].groupId,
                                        //                     groupType: 2,
                                        //                     transId: results[1][i].transId,
                                        //                     formId: results[1][i].formId,
                                        //                     currentStatus: results[1][i].currentStatus,
                                        //                     currentTransId: results[1][i].currentTransId,
                                        //                     parentId: results[1][i].parentId,
                                        //                     accessUserType: results[1][i].accessUserType,
                                        //                     heUserId: results[1][i].heUserId,
                                        //                     formData: JSON.parse(results[1][i].formDataJSON)
                                        //                 }
                                        //             },
                                        //             null,
                                        //             // tokenResult[0].isWhatMate,
                                        //             results[1][i].secretKey);
                                        //         console.log('postNotification : notification for compose_message is sent successfully');
                                        //     }
                                        //     else {
                                        //         console.log('Error in parsing notification compose_message template - ',
                                        //             notificationTemplaterRes.error);
                                        //         console.log('postNotification : notification for compose_message is sent successfully');
                                        //     }
                                        // }
                                        notifyMessages.getMessagesNeedToNotify();
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
                                            transactionId: results[2][0].transId
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
                                //  });


                            }  // loginDetails[0] closes here
                        }
                        else {
                            response.status = false;
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
                    response.status = false;
                    response.error = error;
                    response.message = 'Invalid login credentials';
                    res.status(401).json(response);
                }
            }
            else {
                response.status = false;
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



walkInCvCtrl.saveWalkInJobs = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var users = req.body.users;
    if (typeof (users) == "string") {
        users = JSON.parse(users);
    }
    if (!users) {
        users = [];
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
                req.body.walkInJobId = req.body.walkInJobId ? req.body.walkInJobId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.DOBRequired = req.body.DOBRequired ? req.body.DOBRequired : 0;
                req.body.IDRequired = req.body.IDRequired ? req.body.IDRequired : 0;
                req.body.IDType = req.body.IDType ? req.body.IDType : "";
                req.body.DOBType = req.body.DOBType ? req.body.DOBType : "";
                req.body.profilePic = req.body.profilePic ? req.body.profilePic : 1;

                var walkinJobCode = req.body.jobCode.replace(/<(.*)>/g, '');

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.walkInJobId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.jobCode),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.jobSummary),
                    req.st.db.escape(req.body.jobDescription),
                    req.st.db.escape(JSON.stringify(users)),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.DOBRequired),
                    req.st.db.escape(req.body.IDRequired),
                    req.st.db.escape(req.body.IDType),
                    req.st.db.escape(req.body.DOBType),
                    req.st.db.escape(walkinJobCode),
                    req.st.db.escape(req.body.profilePic)

                ];

                var procQuery = 'CALL wm_save_walkinJobs( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Job saved successfully";
                        response.error = null;
                        response.data = {
                            walkInJobId: result[0][0].walkInJobId
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving job";
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

walkInCvCtrl.getWalkinJoblist = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)

                ];

                var procQuery = 'CALL wm_get_walkInJobList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Walkin Joblist loaded successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].users = result[0][i].users ? JSON.parse(result[0][i].users) : [];
                        }

                        for (var i = 0; i < result[2].length; i++) {
                            result[2][i].contactLocation = result[2][i].contactLocation ? JSON.parse(result[2][i].contactLocation) : [];
                        }

                        result[1][0].userList = (result[1] && result[1][0]) ? JSON.parse(result[1][0].userList) : [];

                        response.data = {
                            jobList: (result[0] && result[0][0]) ? result[0] : [],
                            walkInWebConfig: result[1][0],
                            vendors: result[2]
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            jobList: [],
                            walkInWebConfig: {},
                            vendors: []
                        };
                        res.status(200).json(response);

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


walkInCvCtrl.getUsersOnSearch = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'CALL wm_get_walkinUsers( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "User list loaded successfully";
                        response.error = null;
                        response.data = {
                            userList: (result[0] && result[0][0]) ? result[0] : [],
                            unconfiguredUserList: (result[1] && result[1][0]) ? result[1] : []
                        };
                        res.status(200).json(response);
                    }


                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            userList: [],
                            unconfiguredUserList: []
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


walkInCvCtrl.saveVisitorCheckIn = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid tenant';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                // var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                if (!req.body.mobileNumber) {
                    error.mobileNumber = 'Invalid mobileNumber';
                    validationFlag *= false;
                }

                var toMeetWhom = req.body.toMeetWhom;
                if (typeof (toMeetWhom) == "string") {
                    toMeetWhom = JSON.stringify(toMeetWhom);
                }
                if (!toMeetWhom) {
                    toMeetWhom = {};
                }

                var senderGroupId;

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                }
                else {
                    req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                    req.body.expectedTime = req.body.expectedTime ? req.body.expectedTime : null;
                    req.body.assetDetails = req.body.assetDetails ? req.body.assetDetails : '';
                    req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                    req.body.purposeOfGuest = req.body.purposeOfGuest ? req.body.purposeOfGuest : 0;
                    req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                    req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                    req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                    req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                    req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                    req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                    req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                    req.body.companyName = req.body.companyName ? req.body.companyName : '';
                    req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                    req.body.mobileISD = req.body.mobileISD ? req.body.mobileISD : '';
                    req.body.status = req.body.status ? req.body.status : 1;
                    req.body.name = req.body.name ? req.body.name : '';
                    req.body.emailId = req.body.emailId ? req.body.emailId : '';
                    req.body.visitorBadgeNumber = req.body.visitorBadgeNumber ? req.body.visitorBadgeNumber : '';
                    req.body.signInHere = req.body.signInHere ? req.body.signInHere : '';
                    req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.parentId),
                        req.st.db.escape(req.body.pictureUrl),
                        req.st.db.escape(req.body.name),
                        req.st.db.escape(req.body.mobileNumber),
                        req.st.db.escape(req.body.emailId),
                        req.st.db.escape(req.body.purposeOfGuest),
                        req.st.db.escape(req.body.expectedTime),
                        req.st.db.escape(req.body.assetDetails),
                        req.st.db.escape(req.body.senderNotes),
                        req.st.db.escape(req.body.receiverNotes),
                        req.st.db.escape(req.body.changeLog),
                        req.st.db.escape(req.body.groupId),
                        req.st.db.escape(req.body.learnMessageId),
                        req.st.db.escape(req.body.accessUserType),
                        req.st.db.escape(req.body.approverCount),
                        req.st.db.escape(req.body.receiverCount),
                        req.st.db.escape(req.body.companyName),
                        req.st.db.escape(req.body.status),
                        req.st.db.escape(req.body.approverNotes),
                        req.st.db.escape(req.body.mobileISD),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.firstName),
                        req.st.db.escape(req.body.middleName),
                        req.st.db.escape(req.body.lastName),
                        req.st.db.escape(req.body.IDNumber),
                        req.st.db.escape(req.body.visitorBadgeNumber),
                        req.st.db.escape(JSON.stringify(toMeetWhom)),
                        req.st.db.escape(req.body.signInHere),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.timestamp),
                        req.st.db.escape(req.body.createdTimeStamp)
                    ];

                    /**
                     * Calling procedure to save form template
                     * @type {string}
                     */
                    var procQuery = 'CALL wm_save_visitorCheckIn( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        console.log(err);
                        if (!err && results && results[0]) {
                            senderGroupId = results[0][0].senderId;
                            // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            //     senderName : results[0][0].message
                            // });
                            //
                            // for (var i = 0; i < results[1].length; i++ ) {
                            //     if (notificationTemplaterRes.parsedTpl) {
                            //         notification.publish(
                            //             results[1][i].receiverId,
                            //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                            //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                            //             results[0][0].senderId,
                            //             notificationTemplaterRes.parsedTpl,
                            //             31,
                            //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                            //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                            //             0,
                            //             0,
                            //             0,
                            //             0,
                            //             1,
                            //             moment().format("YYYY-MM-DD HH:mm:ss"),
                            //             '',
                            //             0,
                            //             0,
                            //             null,
                            //             '',
                            //             /** Data object property to be sent with notification **/
                            //             {
                            //                 messageList: {
                            //                     messageId: results[1][i].messageId,
                            //                     message: results[1][i].message,
                            //                     messageLink: results[1][i].messageLink,
                            //                     createdDate: results[1][i].createdDate,
                            //                     messageType: results[1][i].messageType,
                            //                     messageStatus: results[1][i].messageStatus,
                            //                     priority: results[1][i].priority,
                            //                     senderName: results[1][i].senderName,
                            //                     senderId: results[1][i].senderId,
                            //                     receiverId: results[1][i].receiverId,
                            //                     groupId: results[1][i].senderId,
                            //                     groupType: 2,
                            //                     transId : results[1][i].transId,
                            //                     formId : results[1][i].formId,
                            //                     currentStatus : results[1][i].currentStatus,
                            //                     currentTransId : results[1][i].currentTransId,
                            //                     parentId : results[1][i].parentId,
                            //                     accessUserType : results[1][i].accessUserType,
                            //                     heUserId : results[1][i].heUserId,
                            //                     formData : JSON.parse(results[1][i].formDataJSON)
                            //
                            //                 }
                            //             },
                            //             null,tokenResult[0].isWhatMate,
                            //             results[1][i].secretKey);
                            //         console.log('postNotification : notification for compose_message is sent successfully');
                            //     }
                            //     else {
                            //         console.log('Error in parsing notification compose_message template - ',
                            //             notificationTemplaterRes.error);
                            //         console.log('postNotification : notification for compose_message is sent successfully');
                            //     }
                            // }
                            notifyMessages.getMessagesNeedToNotify();
                            response.status = true;
                            response.message = "Visitor gate pass request saved successfully";
                            response.error = null;
                            response.data = {
                                messageList: {
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
                                }
                            };
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving Visitor gate pass request";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }

        });
    }
};


walkInCvCtrl.getvisitorTracker = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.query.date) {
        error.date = 'Invalid date';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.date)
                ];

                var procQuery = 'CALL wm_get_visitorTracker( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].toMeetWhom = result[0][i].toMeetWhom ? JSON.parse(result[0][i].toMeetWhom) : {};
                        }
                        response.data = {
                            visitorData: result[0]
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading data";
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


walkInCvCtrl.getUser = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber)
                ];

                var procQuery = 'CALL wm_get_visitorData( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Visitor data loaded successfully";
                        response.error = null;
                        response.data = {
                            visitorData: result[0][0]
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Visitor data";
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


walkInCvCtrl.getMaster = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL wm_get_masterForVisitor( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result[0][0]) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            IDRequired: result[0][0].isIDRequired,
                            IDType: result[0][0].IDType,
                            users: result[1]
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Master data";
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


walkInCvCtrl.getvisitorTrackerPdf = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    var toMailId = req.body.toMailId;
    if (typeof (toMailId) == "string") {
        toMailId = JSON.parse(toMailId);
    }
    if (!toMailId) {
        toMailId = []
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.startDate),
                    req.st.db.escape(req.body.endDate)
                ];

                var procQuery = 'CALL wm_get_visitorTrackerpdf( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    htmlContent = "";
                    if (result[1].length) {

                        htmlContent += "<!DOCTYPE html><html><head lang='en'><meta charset='UTF-8'><title></title><body><h1 style='text-align:center;margin-bottom: 0px;'>";
                        htmlContent += result[0][0].companyName;
                        htmlContent += "</h1>";
                        htmlContent += "<h3 style='text-align:center;margin-top:0px'>Visitor Register from " + result[2][0].startDate + " to " + result[2][0].endDate;
                        htmlContent += "</h3>";
                        htmlContent += '<center><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;">';
                        htmlContent += "<thead><th>SL No.</th>";

                        for (var i = 0; i < Object.keys(result[1][0]).length; i++) {
                            htmlContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + Object.keys(result[1][0])[i] + '</th>';
                        }
                        htmlContent += "</thead>";

                        for (var j = 0; j < result[1].length; j++) {
                            htmlContent += '<tr><td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + (j + 1) + '</td>';
                            for (var i = 0; i < Object.keys(result[1][0]).length; i++) {
                                htmlContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[1][j][Object.keys(result[1][0])[i]] + '</td>';
                            }
                            htmlContent += "</tr>";
                        }
                        htmlContent += "<table></center></body></html>";
                    }

                    // for (var k = 0; k < toMailId.length; k++) {

                    var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };

                    var myBuffer = [];
                    var buffer = new Buffer(htmlContent, 'utf16le');
                    for (var i = 0; i < buffer.length; i++) {
                        myBuffer.push(buffer[i]);
                    }

                    var attachmentObjectsList = [];
                    htmlpdf.create(htmlContent, options).toBuffer(function (err, buffer) {
                        attachmentObjectsList = [{
                            filename: "VisitorList" + '.pdf',
                            content: buffer

                        }];

                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                        var email = new sendgrid.Email();
                        email.from = "noreply@talentMicro.com";
                        email.to = toMailId;
                        email.subject = "Visitor Register from " + result[2][0].startDate + " to " + result[2][0].endDate;
                        email.html = "Please find the Visitor Register for the period from " + result[2][0].startDate + " to " + result[2][0].endDate + " attached herewith. <br><br><br><br>Whatmate Team.<br><br> This email is intended only for the person to whom it is addressed and/or otherwise authorized personnel. The information contained herein and attached is confidential TalentMicro Innovations and the property of TalentMicro Innovations Pvt. Ltd. If you are not the intended recipient, please be advised that viewing this message and any attachments, as well as copying, forwarding, printing, and disseminating any information related to this email is prohibited, and that you should not take any action based on the content of this email and/or its attachments. If you received this message in error, please contact the sender and destroy all copies of this email and any attachment. Please note that the views and opinions expressed herein are solely those of the author and do not necessarily reflect those of the company. While antivirus protection tools have been employed, you should check this email and attachments for the presence of viruses. No warranties or assurances are made in relation to the safety and content of this email and ttachments. TalentMicro Innovations Pvt. Ltd. accepts no liability for any damage caused by any virus transmitted by or contained in this email and attachments. No liability is accepted for any consequences arising from this email";
                        // email.cc = mailOptions.cc;
                        // email.bcc = mailOptions.bcc;
                        // email.html = mailOptions.html;
                        //if 1 or more attachments are present

                        email.addFile({
                            filename: attachmentObjectsList[0].filename,
                            content: attachmentObjectsList[0].content,
                            contentType: "application/pdf"
                        });

                        sendgrid.send(email, function (err, results) {
                            if (err) {
                                console.log("mail not sent", err);
                            }
                            else {
                                console.log("mail sent successfully", results);
                                if (!err && result && result[0] && result[1]) {
                                    response.status = true;
                                    response.message = "Visitor register mailed successfully";
                                    response.error = null;
                                    response.data = {
                                        companyDetails: (result && result[0]) ? result[0][0] : {},
                                        visitorList: (result && result[1]) ? result[1] : []
                                    };
                                    res.status(200).json(response);
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No result found";
                                    response.error = null;
                                    response.data = {
                                        companyDetails: {},
                                        visitorList: []
                                    };
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while sending mail";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                        });
                    });
                    // }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


walkInCvCtrl.checkOUT = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_checkOut( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Visitor Checked OUT successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while  Visitor Checked OUT";
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

walkInCvCtrl.forceCheckOUT = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.transId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_forceCheckOut( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Visitor Checked OUT successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while  Visitor Checked OUT";
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



walkInCvCtrl.vendorDetails = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
    if (!req.body.vendorId) {
        error.vendorId = 'Invalid vendorId';
        validationFlag *= false;
    }

    var contactLocation = req.body.contactLocation;
    if (typeof (contactLocation) == "string") {
        contactLocation = JSON.parse(contactLocation);
    }
    if (!contactLocation) {
        contactLocation = {};
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
                req.body.tid = req.body.tid ? req.body.tid : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tid),
                    req.st.db.escape(req.body.vendorId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.name),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.contactName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(JSON.stringify(contactLocation))
                ];

                var procQuery = 'CALL wm_save_vendorDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].vendorId) {
                        response.status = true;
                        response.message = "Vendor details saved successfully";
                        response.error = null;
                        response.data = result[0][0].vendorId;
                        res.status(200).json(response);
                    }
                    else if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                        response.status = false;
                        response.message = "Vendor details already exists";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while  saving vendor details";
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

walkInCvCtrl.walkInWebConfig = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    var userList = req.body.userList;
    if (!userList) {
        userList = [];
    }
    else if (typeof (userList) == "string") {
        userList = JSON.parse(userList);
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
                req.body.tid = req.body.tid ? req.body.tid : 0;
                req.body.subject = req.body.subject ? req.body.subject : '';
                req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                req.body.walkInSignature = req.body.walkInSignature ? req.body.walkInSignature : '';
                req.body.disclaimer = req.body.disclaimer ? req.body.disclaimer : '';
                req.body.webLink = req.body.webLink ? req.body.webLink : '';
                req.body.DOBRequired = req.body.DOBRequired ? req.body.DOBRequired : 0;
                req.body.IDRequired = req.body.IDRequired ? req.body.IDRequired : 0;
                req.body.IDType = req.body.IDType ? req.body.IDType : '';
                req.body.maxIDLength = req.body.maxIDLength ? req.body.maxIDLength : 0;
                req.body.isIDNumberOrString = req.body.isIDNumberOrString ? req.body.isIDNumberOrString : 1;
                req.body.sendCandidateSms = req.body.sendCandidateSms ? req.body.sendCandidateSms : 0;
                req.body.candidateSmsFormat = req.body.candidateSmsFormat ? req.body.candidateSmsFormat : "";
                req.body.configureUsersFlag = req.body.configureUsersFlag ? req.body.configureUsersFlag : 0;
                req.body.walkinFormMessage = req.body.walkinFormMessage ? req.body.walkinFormMessage : '';
                req.body.walkInWelcomeMessage = req.body.walkInWelcomeMessage ? req.body.walkInWelcomeMessage : '';
                req.body.acceptTnCFlag = req.body.acceptTnCFlag ? req.body.acceptTnCFlag : 0;
                req.body.acceptTnCMsgFormat = req.body.acceptTnCMsgFormat ? req.body.acceptTnCMsgFormat : '';
                req.body.profilePic = req.body.profilePic ? req.body.profilePic : 1;
                req.body.showJobCode = req.body.showJobCode ? req.body.showJobCode : 0;
                req.body.syncInBackground = req.body.syncInBackground ? req.body.syncInBackground : 0;

                req.body.IDRequiredNew = req.body.IDRequiredNew ? req.body.IDRequiredNew : 0;
                req.body.IDTypeNew = req.body.IDTypeNew ? req.body.IDTypeNew : '';
                req.body.maxIDLengthNew = req.body.maxIDLengthNew ? req.body.maxIDLengthNew : 0;
                req.body.isIDNumberOrStringNew = req.body.isIDNumberOrStringNew ? req.body.isIDNumberOrStringNew : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.subject),
                    req.st.db.escape(req.body.mailBody),
                    req.st.db.escape(req.body.walkInSignature),
                    req.st.db.escape(req.body.disclaimer),
                    req.st.db.escape(req.body.webLink),
                    req.st.db.escape(req.body.DOBRequired),
                    req.st.db.escape(req.body.IDRequired),
                    req.st.db.escape(req.body.IDType),
                    req.st.db.escape(req.body.DOBType),
                    req.st.db.escape(req.body.walkinTokenGeneration),
                    req.st.db.escape(req.body.walkinRegistrationType),
                    req.st.db.escape(req.body.isVisitorCheckIn),
                    req.st.db.escape(req.body.isWalkIn),
                    req.st.db.escape(req.body.isVisitorCheckOut),
                    req.st.db.escape(req.body.directWalkIn),
                    req.st.db.escape(req.body.referredByEmployeeList),
                    req.st.db.escape(req.body.referredByName),
                    req.st.db.escape(req.body.vendors),
                    req.st.db.escape(JSON.stringify(userList)),
                    req.st.db.escape(req.body.maxIDLength),
                    req.st.db.escape(req.body.isIDNumberOrString),
                    req.st.db.escape(req.body.sendCandidateSms),
                    req.st.db.escape(req.body.candidateSmsFormat),
                    req.st.db.escape(req.body.configureUsersFlag),
                    req.st.db.escape(req.body.walkinFormMessage),
                    req.st.db.escape(req.body.walkInWelcomeMessage),
                    req.st.db.escape(req.body.acceptTnCFlag),
                    req.st.db.escape(req.body.acceptTnCMsgFormat),
                    req.st.db.escape(req.body.profilePic),
                    req.st.db.escape(req.body.IDRequiredNew),
                    req.st.db.escape(req.body.IDTypeNew),
                    req.st.db.escape(req.body.maxIDLengthNew),
                    req.st.db.escape(req.body.isIDNumberOrStringNew),
                    req.st.db.escape(req.body.showJobCode),
                    req.st.db.escape(req.body.syncInBackground)

                ];

                var procQuery = 'CALL wm_save_walkWebConfig( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Walk-In configuration details saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while  saving walk-In configuration details";
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


walkInCvCtrl.walkInCVUpload = function (req, res, next) {
    var response = {
        status: false,
        message: "Some Error occurred",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.walkInApplicantId) {
        error.token = 'Invalid walkInApplicantId';
        validationFlag *= false;
    }
    if (!req.body.cdnPath) {
        error.cdnPath = 'Invalid cdnPath';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var walkInApplicantId = req.query.walkInApplicantId;
        parentId = walkInApplicantId.substr(13);  // parentId is in string
        parentId = parseInt(parentId);   // parse to string

        var inputs = [
            req.st.db.escape(parentId),
            req.st.db.escape(req.body.cdnPath)
        ];

        var procQuery = 'CALL wm_walkInCvUploadLink( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0]) {
                response.status = true;
                response.message = "CV uploaded successfully";
                response.error = null;
                response.data = result[0][0].cvUploadRes;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Error while  uploading cv";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });

    }
};


walkInCvCtrl.walkInUploadLinkFlag = function (req, res, next) {
    var response = {
        status: false,
        message: "Some Error occurred",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.walkInApplicantId) {
        error.token = 'Invalid walkInApplicantId';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var walkInApplicantId = req.query.walkInApplicantId;
        parentId = walkInApplicantId.substr(13);  // parentId is in string
        parentId = parseInt(parentId);   // parse to string

        var inputs = [
            req.st.db.escape(parentId)
        ];

        var procQuery = 'CALL wm_get_walkInUploadLinkExpiryFlag( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0]) {

                if(result[0][0].validateLinkFlag=='true'){
                    result[0][0].validateLinkFlag= true;
                    response.message = "Please upload your resume";
                }
                else{
                    result[0][0].validateLinkFlag=false;
                    response.message = "Link has expired";
               
                }

                response.status = result[0][0].validateLinkFlag;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Error while validating upload link";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};


walkInCvCtrl.masterDataofCVUpdate = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        req.query.heMasterId = req.query.heMasterId ? req.query.heMasterId : 0;
        req.query.token = req.query.token ? req.query.token : '';

        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(req.query.heMasterId)
        ];

        var procQuery = 'CALL wm_get_walkInBanners( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(req.query.isWeb);
            var output = [];
            for (var i = 0; i < result[10].length; i++) {
                var res2 = {};
                res2.educationId = result[10][i].educationId;
                res2.educationTitle = result[10][i].EducationTitle;
                res2.specialization = result[10][i].specialization ? JSON.parse(result[10][i].specialization) : [];
                output.push(res2);
            }

            var output1 = [];
            for (var j = 0; j < result[11].length; j++) {
                var res3 = {};
                res3.educationId = result[11][j].educationId;
                res3.educationTitle = result[11][j].EducationTitle;
                res3.specialization = result[11][j].specialization ? JSON.parse(result[11][j].specialization) : [];
                output1.push(res3);
            }


            var isWeb = req.query.isWeb;
            if (!err && result && result[0] && result[0][0]) {
                response.status = true;
                response.message = "Banner List loaded successfully";
                response.error = null;
                response.data = {
                    bannerList: result[0],
                    companyLogo: result[1][0].companyLogo,
                    registrationType: result[6][0].walkinRegistrationType,  // need to come from backend, will be done later.
                    tokenGeneration: result[6][0].walkinTokenGeneration,
                    walkInWelcomeMessage: result[6][0].walkInWelcomeMessage,

                    industryList: result[2] ? result[2] : [],
                    skillList: result[3] ? result[3] : [],// need to come from backend, will be done later.
                    locationList: result[4] ? result[4] : [],
                    referedNameList: result[5] ? result[5] : [],
                    // walkInJobs: (result[7] && result[7][0]) ? result[7] : [],
                    currency: (result && result[7]) ? result[7] : [],
                    scale: (result && result[8]) ? result[8] : [],
                    duration: (result && result[9]) ? result[9] : [],
                    ugEducationList: output ? output : [],
                    pgEducationList: output1 ? output1 : [],
                    isDOBRequired: result[12][0].isDOBRequired,
                    DOBType: result[12][0].DOBType,
                    // isIDRequired: result[14][0].isIDRequired,
                    // IDType: result[14][0].IDType,  // field Name
                    // isIDNumberOrString: (result[14] && result[14][0]) ? result[14][0].isIDNumberOrString : 1,
                    // maxIDLength: (result[14] && result[14][0]) ? result[14][0].maxIDLength : 0,
                    // isVisitorCheckIn: result[14][0].isVisitorCheckIn,
                    // isWalkIn: result[14][0].isWalkIn,
                    // isVisitorCheckOut: result[14][0].isVisitorCheckOut,
                    vendorDetails: (result && result[13]) ? result[13] : [],
                    // directWalkIn: result[14][0].directWalkIn,
                    // referredByEmployeeList: result[14][0].referredByEmployeeList,
                    // referredByName: result[14][0].referredByName,
                    // vendors: result[14][0].vendors

                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "No results found";
                response.error = null;
                response.data = {
                    bannerList: [],
                    companyLogo: "",
                    registrationType: 0,  // need to come from backend, will be done later.
                    tokenGeneration: 0,
                    walkInWelcomeMessage: '',
                    industryList: [],
                    skillList: [],
                    currency: [],
                    scale: [],
                    duration: [],
                    ugEducationList: [],
                    pgEducationList: [],
                    isDOBRequired: 0,
                    DOBType: '',
                    isVisitorCheckOut: 0,
                    vendorDetails: [],
                    directWalkIn: 0,
                    referredByEmployeeList: 0,
                    referredByName: 0,
                    vendors: 0
                };
                res.status(200).json(response);
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

};



walkInCvCtrl.saveCVUpdatedData = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    // var s;
    var isdMobile = req.body.mobileISD;
    var mobileNo = req.body.mobileNumber;
    var message = "Congratulations your profile is successfully registered";

    var validationFlag = true;

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
        ugEducation = {};
    }

    var pgEducation = req.body.pgEducation;
    if (typeof (pgEducation) == "string") {
        pgEducation = JSON.parse(pgEducation);
    }
    if (!pgEducation) {
        pgEducation = {};
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

    var details = req.body.details;
    if (typeof (details) == "string") {
        details = JSON.parse(details);
    }
    if (!details) {
        details = {};
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

    var walkInJobs = req.body.walkInJobs;
    if (typeof (walkInJobs) == "string") {
        walkInJobs = JSON.parse(walkInJobs);
    }
    if (!walkInJobs) {
        walkInJobs = {};
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please Check the Errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var isWeb = req.query.isWeb;
        req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 2;
        req.body.fresherExperience = (req.body.fresherExperience) ? req.body.fresherExperience : 0;
        req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
        req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
        req.body.presentEmployer = (req.body.presentEmployer) ? req.body.presentEmployer : "";
        req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
        req.body.status = (req.body.status) ? req.body.status : 1;
        req.body.experience = (req.body.experience) ? req.body.experience : '0.0';
        req.body.presentSalary = (req.body.presentSalary) ? req.body.presentSalary : '0.0';
        req.body.walkinType = (req.body.walkinType) ? req.body.walkinType : 0;
        req.body.DOB = (req.body.DOB) ? req.body.DOB : null;
        req.body.IDNumber = (req.body.IDNumber) ? req.body.IDNumber : '';
        req.body.profilePicture = (req.body.profilePicture) ? req.body.profilePicture : '';
        req.body.middleName = (req.body.middleName) ? req.body.middleName : '';
        req.body.registrationType = req.body.registrationType ? req.body.registrationType : 2;
        req.body.jobCode = req.body.jobCode ? req.body.jobCode : '';
        req.body.resumeCdnPath = req.body.resumeCdnPath ? req.body.resumeCdnPath : '';

        var cvSourcingParentId = req.body.cvSourcingParentId;
        parentId = cvSourcingParentId.substr(13);  // parentId is in string
        parentId = parseInt(parentId);   // parse to string

        var inputs = [
            req.st.db.escape(req.body.heMasterId),
            req.st.db.escape(parentId),
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
            // req.st.db.escape(req.body.senderNotes),
            // req.st.db.escape(req.body.approverNotes),
            // req.st.db.escape(req.body.receiverNotes),
            // req.st.db.escape(req.body.changeLog),
            // req.st.db.escape(req.body.groupId),
            // req.st.db.escape(req.body.learnMessageId),
            // req.st.db.escape(req.body.accessUserType),
            // req.st.db.escape(req.body.approverCount),
            // req.st.db.escape(req.body.receiverCount),
            // req.st.db.escape(req.body.status),
            req.st.db.escape(req.body.walkInType),
            req.st.db.escape(JSON.stringify(details)),
            req.st.db.escape(JSON.stringify(location)),
            req.st.db.escape(req.body.profilePicture),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(req.body.jobCode),  // i have to send job code to candidate mail. the same is taken back while updating
            req.st.db.escape(req.body.DOB),
            req.st.db.escape(req.body.IDNumber),
            req.st.db.escape(req.body.middleName),
            req.st.db.escape(req.body.registrationType),
            req.st.db.escape(req.body.resumeCdnPath)
        ];

        var procQuery = 'CALL wm_save_webCVUpdatePage( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, results) {
            console.log(err);

            if (!err && (results[0] || results[1] || results[2])) {    // walkInForm Message with token
                // console.log('Result with walk-In Message and Token');
                // if (results[2] ) {  // check 

                //     var mailContent = (results[5] && results[5][0]) ? results[5][0].mailBody : " Dear [FirstName],<br><br> Your profile is successfully registered.  We will call you back once we scrutinize  your profile. Thank You <br><br>[WalkINSignature]<br>[Disclaimer]";

                //     if (mailContent) {
                //         mailContent = mailContent.replace("[FirstName]", req.body.firstName);
                //         mailContent = mailContent.replace("[FullName]", (req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName));

                //         var webLink = (results[5] && results[5][0]) ? results[5][0].webLink : "";

                //         var walkInSignature = (results[5] && results[5][0]) ? results[5][0].walkInSignature : "";
                //         var disclaimer = (results[5] && results[5][0]) ? results[5][0].disclaimer : "";

                //         mailContent = mailContent.replace("[WalkINSignature]", walkInSignature);
                //         mailContent = mailContent.replace("[Disclaimer]", disclaimer);
                //     }

                //     var subject = results[5][0].mailSubject ? results[5][0].mailSubject:"Congratulations your profile is successfully registered";
                //     // send mail to candidate
                //     var email = new sendgrid.Email();
                //     email.from = results[4][0].fromEmailId ? results[4][0].fromEmailId: "noreply@talentmicro.com";
                //     email.to = req.body.emailId;
                //     email.subject = subject;
                //     email.html = mailContent;

                //     sendgrid.send(email, function (err11, result11) {
                //         if (err11) {
                //             console.log("Failed to send to candidate", err11);
                //         }
                //         else {
                //             console.log("mail sent successfully to candidate", result11);
                //         }
                //     });

                //     // To send mail to refered person
                //     // if (results[4] && results[6] && results[6][0]) {
                //     //     var refererEmail = new sendgrid.Email();
                //     //     refererEmail.from = results[4][0].fromEmailId;
                //     //     refererEmail.to = results[6][0].refererMailId;
                //     //     refererEmail.subject = results[6][0].message;
                //     //     refererEmail.html = results[6][0].message;

                //     //     sendgrid.send(refererEmail, function (err1, result1) {
                //     //         if (err1) {
                //     //             console.log("Failed to send to referrer", err1);
                //     //         }
                //     //         else {
                //     //             console.log("mail sent successfully to referrer", result1);
                //     //         }
                //     //     });
                //     // }


                // }

                response.status = true;
                response.message = "Data saved successfully";
                response.error = null;
                response.data = {
                    walkinFormMessage: results[0][0].walkinFormMessage ? results[0][0].walkinFormMessage : ''
                    // token: results[3][0].token
                };
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Error While Saving cv update data";
                response.error = null;
                console.log(err);
                res.status(500).json(response);
            }
        });
    }
};


walkInCvCtrl.walkInPDfGeneration = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    var toMailId = req.body.toMailId;
    if (typeof (toMailId) == "string") {
        toMailId = JSON.parse(toMailId);
    }
    if (!toMailId) {
        toMailId = []
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.startDate),
                    req.st.db.escape(req.body.endDate)
                ];

                var procQuery = 'CALL wm_get_walkInPdfGeneration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    htmlContent = "";
                    if (result[1].length) {

                        htmlContent += "<!DOCTYPE html><html><head lang='en'><meta charset='UTF-8'><title></title><body><h1 style='text-align:center;margin-bottom: 0px;'>";
                        htmlContent += result[0][0].companyName;
                        htmlContent += "</h1>";
                        htmlContent += "<h3 style='text-align:center;margin-top:0px'>WalkIn Registration from " + result[2][0].startDate + " to " + result[2][0].endDate;
                        htmlContent += "</h3>";
                        htmlContent += '<center><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;">';
                        htmlContent += "<thead><th>SL No.</th>";

                        for (var i = 0; i < Object.keys(result[1][0]).length; i++) {
                            htmlContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + Object.keys(result[1][0])[i] + '</th>';
                        }
                        htmlContent += "</thead>";

                        for (var j = 0; j < result[1].length; j++) {
                            htmlContent += '<tr><td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + (j + 1) + '</td>';
                            for (var i = 0; i < Object.keys(result[1][0]).length; i++) {
                                htmlContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[1][j][Object.keys(result[1][0])[i]] + '</td>';
                            }
                            htmlContent += "</tr>";
                        }
                        htmlContent += "<table></center></body></html>";
                    }

                    // for (var k = 0; k < toMailId.length; k++) {

                    var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };

                    var myBuffer = [];
                    var buffer = new Buffer(htmlContent, 'utf16le');
                    for (var i = 0; i < buffer.length; i++) {
                        myBuffer.push(buffer[i]);
                    }

                    var attachmentObjectsList = [];
                    htmlpdf.create(htmlContent, options).toBuffer(function (err, buffer) {
                        attachmentObjectsList = [{
                            filename: "WalkIn-Registration" + '.pdf',
                            content: buffer

                        }];

                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                        var email = new sendgrid.Email();
                        email.from = "noreply@talentMicro.com";
                        email.to = toMailId;
                        email.subject = "Walk-In Registration from " + result[2][0].startDate + " to " + result[2][0].endDate;
                        email.html = "Please find the WalkIn Registration for the period from " + result[2][0].startDate + " to " + result[2][0].endDate + " attached herewith. <br><br><br><br>Whatmate Team.<br><br> This email is intended only for the person to whom it is addressed and/or otherwise authorized personnel. The information contained herein and attached is confidential TalentMicro Innovations and the property of TalentMicro Innovations Pvt. Ltd. If you are not the intended recipient, please be advised that viewing this message and any attachments, as well as copying, forwarding, printing, and disseminating any information related to this email is prohibited, and that you should not take any action based on the content of this email and/or its attachments. If you received this message in error, please contact the sender and destroy all copies of this email and any attachment. Please note that the views and opinions expressed herein are solely those of the author and do not necessarily reflect those of the company. While antivirus protection tools have been employed, you should check this email and attachments for the presence of viruses. No warranties or assurances are made in relation to the safety and content of this email and ttachments. TalentMicro Innovations Pvt. Ltd. accepts no liability for any damage caused by any virus transmitted by or contained in this email and attachments. No liability is accepted for any consequences arising from this email";
                        // email.cc = mailOptions.cc;
                        // email.bcc = mailOptions.bcc;
                        // email.html = mailOptions.html;
                        //if 1 or more attachments are present

                        email.addFile({
                            filename: attachmentObjectsList[0].filename,
                            content: attachmentObjectsList[0].content,
                            contentType: "application/pdf"
                        });

                        sendgrid.send(email, function (err, results) {
                            if (err) {
                                console.log("mail not sent", err);
                            }
                            else {
                                console.log("mail sent successfully", results);
                                if (!err && result && result[0] && result[1]) {
                                    response.status = true;
                                    response.message = "WalkIn Registration pdf mailed successfully";
                                    response.error = null;
                                    response.data = {
                                        companyDetails: (result && result[0]) ? result[0][0] : {},
                                        visitorList: (result && result[1]) ? result[1] : []
                                    };
                                    res.status(200).json(response);
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No result found";
                                    response.error = null;
                                    response.data = {
                                        companyDetails: {},
                                        visitorList: []
                                    };
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while sending mail";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                        });
                    });
                    // }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


walkInCvCtrl.publicWalkInConfig = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
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
                req.body.tid = req.body.tid ? req.body.tid : 0;
                
                req.body.IDRequired = req.body.IDRequired ? req.body.IDRequired : 0;
                req.body.IDType = req.body.IDType ? req.body.IDType : '';
                req.body.maxIDLength = req.body.maxIDLength ? req.body.maxIDLength : 0;
                req.body.isIDNumberOrString = req.body.isIDNumberOrString ? req.body.isIDNumberOrString : 1;
                req.body.sendCandidateSms = req.body.sendCandidateSms ? req.body.sendCandidateSms : 0;
                req.body.candidateSmsFormat = req.body.candidateSmsFormat ? req.body.candidateSmsFormat : "";
                
                req.body.showJobCode = req.body.showJobCode ? req.body.showJobCode : 0;
                req.body.syncInBackground = req.body.syncInBackground ? req.body.syncInBackground : 0;

                req.body.IDRequiredNew = req.body.IDRequiredNew ? req.body.IDRequiredNew : 0;
                req.body.IDTypeNew = req.body.IDTypeNew ? req.body.IDTypeNew : '';
                req.body.maxIDLengthNew = req.body.maxIDLengthNew ? req.body.maxIDLengthNew : 0;
                req.body.isIDNumberOrStringNew = req.body.isIDNumberOrStringNew ? req.body.isIDNumberOrStringNew : 0;
                req.body.walkinFormMessage = req.body.walkinFormMessage ? req.body.walkinFormMessage : "";


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.directWalkIn),
                    req.st.db.escape(req.body.referredByEmployeeList),
                    req.st.db.escape(req.body.referredByName),
                    req.st.db.escape(req.body.vendors),
                    req.st.db.escape(req.body.IDRequired),
                    req.st.db.escape(req.body.IDType),
                    req.st.db.escape(req.body.maxIDLength),
                    req.st.db.escape(req.body.isIDNumberOrString),
                    req.st.db.escape(req.body.sendCandidateSms),
                    req.st.db.escape(req.body.candidateSmsFormat),            
                    req.st.db.escape(req.body.profilePic),
                    req.st.db.escape(req.body.IDRequiredNew),
                    req.st.db.escape(req.body.IDTypeNew),
                    req.st.db.escape(req.body.maxIDLengthNew),
                    req.st.db.escape(req.body.isIDNumberOrStringNew),
                    req.st.db.escape(req.body.showJobCode),
                    req.st.db.escape(req.body.syncInBackground),
                    req.st.db.escape(req.body.walkinRegistrationType),
                    req.st.db.escape(req.body.walkinTokenGeneration),
                    req.st.db.escape(req.body.walkinFormMessage)

                ];

                var procQuery = 'CALL wm_save_publicWalkinConfig( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err) {
                        response.status = true;
                        response.message = "Walk-In configuration details saved successfully";
                        response.error = null;
                        response.data = {
                            companyList:result[0]
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while  saving walk-In configuration details";
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



walkInCvCtrl.publicWalkinMaster = function (req, res, next) {
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

                var procQuery = 'CALL wm_get_publicWalkInMaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);
                    var output = [];
                    for (var i = 0; i < result[11].length; i++) {
                        var res2 = {};
                        res2.educationId = result[11][i].educationId;
                        res2.educationTitle = result[11][i].EducationTitle;
                        res2.specialization = result[11][i].specialization ? JSON.parse(result[11][i].specialization) : [];
                        output.push(res2);
                    }

                    var output1 = [];
                    for (var j = 0; j < result[12].length; j++) {
                        var res3 = {};
                        res3.educationId = result[12][j].educationId;
                        res3.educationTitle = result[12][j].EducationTitle;
                        res3.specialization = result[12][j].specialization ? JSON.parse(result[12][j].specialization) : [];
                        output1.push(res3);
                    }


                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Banner List loaded successfully";
                        response.error = null;
                        response.data = {
                           // bannerList: result[0],
                            companyLogo: result[1][0].companyLogo,
                            registrationType: result[6][0].walkinRegistrationType,  // need to come from backend, will be done later.
                            tokenGeneration: result[6][0].walkinTokenGeneration,
                            walkInWelcomeMessage: result[6][0].walkInWelcomeMessage,


                            industryList: result[2] ? result[2] : [],
                            skillList: result[3] ? result[3] : [],// need to come from backend, will be done later.
                            locationList: result[4] ? result[4] : [],
                            referedNameList: result[5] ? result[5] : [],
                            walkInJobs: (result[7] && result[7][0]) ? result[7] : [],
                            currency: (result && result[8]) ? result[8] : [],
                            scale: (result && result[9]) ? result[9] : [],
                            duration: (result && result[10]) ? result[10] : [],
                            ugEducationList: output ? output : [],
                            pgEducationList: output1 ? output1 : [],
                            isDOBRequired: result[13][0].isDOBRequired,
                            acceptTnCFlag: result[13][0].acceptTnCFlag,
                            acceptTnCMsgFormat: result[13][0].acceptTnCMsgFormat,
                            isIDRequired: result[14][0].isIDRequired,
                            IDType: result[14][0].IDType,  // field Name
                            isIDNumberOrString: (result[14] && result[14][0]) ? result[14][0].isIDNumberOrString : 1,
                            maxIDLength: (result[14] && result[14][0]) ? result[14][0].maxIDLength : 0,

                            isIDRequiredNew: result[14][0].isIDRequiredNew,
                            IDTypeNew: result[14][0].IDTypeNew,  // field Name
                            isIDNumberOrStringNew: (result[14] && result[14][0]) ? result[14][0].isIDNumberOrStringNew : 1,
                            maxIDLengthNew: (result[14] && result[14][0]) ? result[14][0].maxIDLengthNew : 0,

                            DOBType: result[13][0].DOBType,
                            // isVisitorCheckIn: result[14][0].isVisitorCheckIn,
                            // isWalkIn: result[14][0].isWalkIn,
                            // isVisitorCheckOut: result[14][0].isVisitorCheckOut,
                            vendorDetails: (result && result[15]) ? result[15] : [],
                            directWalkIn: result[14][0].directWalkIn,
                            referredByEmployeeList: result[14][0].referredByEmployeeList,
                            referredByName: result[14][0].referredByName,
                            vendors: result[14][0].vendors,
                            isProfileMandatory: (result[16] && result[16][0] && result[16][0].isProfileMandatory) ? result[16][0].isProfileMandatory : 0,
                            showJobCode: (result[17] && result[17][0] && result[17][0].showJobCode) ? result[17][0].showJobCode : 0,
                            syncInBackground: (result[17] && result[17][0] && result[17][0].syncInBackground) ? result[17][0].syncInBackground : 0,
                            completionMessage: result[18][0].completionMessage


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
                            companyLogo: "",
                            registrationType: 0,  // need to come from backend, will be done later.
                            tokenGeneration: 0,
                            walkInWelcomeMessage: '',
                            industryList: [],
                            skillList: [],
                            currency: [],
                            scale: [],
                            duration: [],
                            ugEducationList: [],
                            pgEducationList: [],
                            isDOBRequired: 0,
                            acceptTnCFlag: 0,
                            acceptTnCMsgFormat: '',
                            isIDRequired: 0,
                            IDType: 0,
                            isIDNumberOrString: 1,
                            maxIDLength: 0,
                            isIDRequiredNew: 0,
                            IDTypeNew: 0,
                            isIDNumberOrStringNew: 1,
                            maxIDLengthNew: 0,
                            DOBType: '',
                            isVisitorCheckIn: 0,
                            isWalkIn: 0,
                            isVisitorCheckOut: 0,
                            vendorDetails: [],
                            directWalkIn: 0,
                            referredByEmployeeList: 0,
                            referredByName: 0,
                            vendors: 0,
                            showJobCode: 0,
                            syncInBackground:0,
                            completionMessage:''
                            
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

walkInCvCtrl.getCompanySearch = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_walkinCompanyConfig( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "company loaded successfully";
                        response.error = null;
                        response.data = {
                            companyConfigDetails: (result[0] && result[0][0]) ? result[0][0] : {}
                        };
                        res.status(200).json(response);
                    }


                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            companyConfigDetails: {},
                            
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

module.exports = walkInCvCtrl;