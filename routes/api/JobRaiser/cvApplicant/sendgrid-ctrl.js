
var moment = require('moment');

var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();

var fs = require('fs');
var http = require('https');
var bodyParser = require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var uuid = require('node-uuid');
var path = require('path');
var archiver = require('archiver');
var request = require('request');
var xlsx = require('node-xlsx');  // for xls file generation

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var EZEIDEmail = 'noreply@talentmicro.com';
const accountSid = 'AC62cf5e4f884a28b6ad9e2da511d24f4d';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC62cf5e4f884a28b6ad9e2da511d24f4d';
const authToken = 'ff62486827ce8b68c70c1b8f7cef9748';   //'3abf04f536ede7f6964919936a35e614';  //'ff62486827ce8b68c70c1b8f7cef9748';//
const FromNumber = CONFIG.DB.FromNumber || '+16012286363';
const client = require('twilio')(accountSid, authToken);
var logger = require('../error-logger/error-log.js');

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


var sendgridCtrl = {};
var error = {};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(mailStrBody, tagTerm, replaceFromResult) {
    return mailStrBody.replace(new RegExp(escapeRegExp(tagTerm), 'g'), replaceFromResult);
}


sendgridCtrl.saveSendMail = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.saveSendMail'
    }

    try {


        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var emailId = [];
        var validationFlag = true;
        var fromEmailID;
        var toEmailID = [];

        //request parameters
        var updateFlag = req.body.updateFlag || 0;
        var overWrite = req.body.overWrite || 0;
        var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
        var templateId = req.body.template ? req.body.template.templateId : undefined;
        var trackerTemplate = req.body.trackerTemplate || {};
        var tags = req.body.tags || {};
        var cc = req.body.cc || [];
        var toMail = req.body.toMail || [];
        var bcc = req.body.bcc || [];
        var stage = req.body.stage || [];
        var attachment = req.body.attachment || [];
        var reqApplicants = req.body.reqApplicants || [];
        var applicants = req.body.applicantId || [];
        var client = req.body.clientId || [];
        var tableTags = req.body.tableTags || {};
        var clientContacts = req.body.clientContacts || [];
        var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
        var mailBody = req.body.mailBody || '';
        var isWeb = req.query.isWeb || 0;
        var mailerType = req.body.mailerType || 0;
        var userId = req.query.userId || 0;

        //html styling for table in submission mailer
        var tableStyle = '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>';
        var tableHeadingStyle = '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">';
        var tableDataStyle = '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">';

        if (!req.query.heMasterId) {
            error.heMasterId = 'invalid tenant';
            validationFlag *= false;
        }

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (typeof (trackerTemplate) == "string") {
            trackerTemplate = JSON.parse(trackerTemplate);
        }
        if (!trackerTemplate) {
            trackerTemplate = {};
            trackerTags = [];
        }
        else {
            trackerTags = JSON.parse(trackerTemplate.trackerTags);
        }

        if (typeof (tags) == "string") {
            tags = JSON.parse(tags);
        }

        if (typeof (cc) == "string") {
            cc = JSON.parse(cc);
        }

        if (typeof (toMail) == "string") {
            toMail = JSON.parse(toMail);
        }

        if (typeof (bcc) == "string") {
            bcc = JSON.parse(bcc);
        }

        if (typeof (stage) == "string") {
            stage = JSON.parse(stage);
        }

        if (typeof (attachment) == "string") {
            attachment = JSON.parse(attachment);
        }

        if (typeof (reqApplicants) == "string") {
            reqApplicants = JSON.parse(reqApplicants);
        }

        if (typeof (applicants) == "string") {
            applicants = JSON.parse(applicants);
        }

        if (typeof (client) == "string") {
            client = JSON.parse(client);
        }

        if (typeof (clientContacts) == "string") {
            clientContacts = JSON.parse(clientContacts);
        }

        if (typeof (tableTags) == "string") {
            tableTags = JSON.parse(tableTags);
        }


        //check for mail type and assign the recipients
        if (mailerType == 1 || mailerType == 2) {
            emailReceivers = reqApplicants;
        }
        else if (mailerType == 3) {
            emailReceivers = applicants;
        }
        else {
            emailReceivers = client;
        }

        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {
                        if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                            var inputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(JSON.stringify(tags)),
                                req.st.db.escape(JSON.stringify(reqApplicants)),
                                req.st.db.escape(JSON.stringify(applicants)),
                                req.st.db.escape(JSON.stringify(client)),
                                req.st.db.escape(userId),
                                req.st.db.escape(mailerType),
                                req.st.db.escape(JSON.stringify(tableTags)),
                                req.st.db.escape(JSON.stringify(clientContacts)),
                                req.st.db.escape((trackerTemplate.trackerTags))
                            ];

                            var procQuery = 'CALL wm_get_detailsByTags1( ' + inputs.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, result) {
                                try {
                                    console.log(err);
                                    if (!err && result) {
                                        var temp = mailBody;
                                        //if mailer type is not submission mailer, recipients are applicants
                                        if (mailerType != 2) {
                                            //replacing all tags present in the mail body
                                            for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {
                                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                }
                                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                                    mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[1][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                }

                                                for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                                    mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[2][applicantIndex][tags.client[tagIndex].tagName]);
                                                }
                                                mailbody_array.push(mailBody);
                                                fromEmailID = result[4][0].fromemailId;
                                                toEmailID.push(result[3][applicantIndex].emailId);
                                                mailBody = temp;
                                            }
                                        }
                                        //end of if
                                        //if mailer type is submission mailer, recipients are client contacts
                                        else {
                                            console.log('tags', tags);
                                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                                for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                                    //replacing all tags present in the mail body
                                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                                        mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                    }

                                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                                        mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[1][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                    }

                                                    for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                                        mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[2][applicantIndex][tags.client[tagIndex].tagName]);
                                                    }
                                                }
                                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {
                                                    mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[8][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                                }
                                                //Replacing table tags with html table
                                                if (tableTags.applicant.length > 0) {
                                                    var position = mailBody.indexOf('@table');
                                                    var tableContent = '';
                                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                                    tableContent += tableStyle;
                                                    console.log(tableContent, 'mailbody');
                                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                        tableContent += tableHeadingStyle + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                                    }
                                                    tableContent += "</tr>";
                                                    for (var candidateCount = 0; candidateCount < result[5].length; candidateCount++) {
                                                        tableContent += "<tr>";
                                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                            tableContent += tableDataStyle + result[5][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                                        }
                                                        tableContent += "</tr>";
                                                    }

                                                    tableContent += "</table>";
                                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                                }

                                                mailbody_array.push(mailBody);
                                                fromEmailID = result[4][0].fromemailId;
                                                toEmailID.push(result[8][clientIndex].emailId);
                                                mailBody = temp;
                                            }
                                        }
                                        //end of else (mailertype if)                           
                                        var buffer;
                                        if (trackerTemplate) {
                                            var ws_data = '[[';
                                            // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                            for (var i = 0; i < trackerTags.length; i++) {
                                                if (i != trackerTags.length - 1)
                                                    ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                                else
                                                    ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                            }
                                            ws_data += "]";

                                            // console.log(new Buffer(buffer).toString("base64"));
                                            for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                                ws_data += ',[';
                                                for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                                    if (tagIndex < trackerTags.length - 1)
                                                        ws_data += '"' + result[9][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                                    else
                                                        ws_data += '"' + result[9][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                                }
                                                ws_data += ']';
                                            }
                                            ws_data += ']';
                                            console.log(ws_data);
                                            buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                                        }
                                        //for sending mails
                                        for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                            var mailOptions = {
                                                from: fromEmailID,
                                                to: toEmailID[receiverIndex],
                                                subject: subject,
                                                html: mailbody_array[receiverIndex]
                                            };

                                            mailOptions.cc = [];

                                            for (var j = 0; j < cc.length; j++) {
                                                mailOptions.cc.push(cc[j].email);
                                            }
                                            mailOptions.bcc = [];

                                            for (var j = 0; j < bcc.length; j++) {
                                                mailOptions.bcc.push(bcc[j].email);
                                            }

                                            var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                            var email = new sendgrid.Email();
                                            email.from = mailOptions.from;
                                            email.to = mailOptions.to;
                                            email.subject = mailOptions.subject;
                                            email.mbody = mailOptions.html;
                                            email.cc = mailOptions.cc;
                                            email.bcc = mailOptions.bcc;
                                            email.html = mailOptions.html;
                                            //if 1 or more attachments are present
                                            for (var file = 0; file < attachment.length; file++) {
                                                email.addFile({
                                                    filename: attachment[file].fileName,
                                                    content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                    contentType: attachment[file].fileType
                                                });
                                            }
                                            if (trackerTemplate) {
                                                email.addFile({
                                                    filename: trackerTemplate.templateName + '.xlsx',
                                                    content: new Buffer(new Buffer(buffer).toString("base64"), 'base64'),
                                                    contentType: 'application/*'
                                                });
                                            }

                                            var saveMails = [
                                                req.st.db.escape(req.query.token),
                                                req.st.db.escape(req.query.heMasterId),
                                                req.st.db.escape(req.body.heDepartmentId),
                                                req.st.db.escape(userId),
                                                req.st.db.escape(mailerType),
                                                req.st.db.escape(mailOptions.from),
                                                req.st.db.escape(mailOptions.to),
                                                req.st.db.escape(mailOptions.subject),
                                                req.st.db.escape(mailOptions.html),    // contains mail body
                                                req.st.db.escape(JSON.stringify(cc)),
                                                req.st.db.escape(JSON.stringify(bcc)),
                                                req.st.db.escape(JSON.stringify(attachment)),
                                                req.st.db.escape(req.body.replyMailId),
                                                req.st.db.escape(req.body.priority),
                                                req.st.db.escape(req.body.stageId),
                                                req.st.db.escape(req.body.statusId),
                                                req.st.db.escape(req.body.smsMsg),
                                                req.st.db.escape(req.body.whatmateMsg)

                                            ];

                                            sendgrid.send(email, function (err, result) {
                                                try {
                                                    if (!err) {
                                                        //saving the mail after sending it
                                                        var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                        console.log(saveMailHistory);
                                                        req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                            try {
                                                                console.log(mailHistoryErr);
                                                                console.log(mailHistoryResult);
                                                                if (!mailHistoryErr && mailHistoryResult) {
                                                                    console.log('sent mails saved successfully');
                                                                }
                                                                else {
                                                                    error_logger.error = mailHistoryErr;
                                                                    error_logger.proc_call = saveMailHistory;
                                                                    logger(req, error_logger);
                                                                    res.status(500).json(error_response);
                                                                }
                                                            }
                                                            catch (ex) {
                                                                error_logger.error = ex;
                                                                error_logger.proc_call = saveMailHistory;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                        console.log('Mail sent now save sent history');
                                                    }
                                                    else {
                                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                                        error_logger.error = err;
                                                        error_logger.proc_call = procQuery;
                                                        logger(req, error_logger);
                                                        res.status(500).json(error_response);
                                                    }
                                                }
                                                catch (ex) {
                                                    error_logger.error = ex;
                                                    error_logger.proc_call = procQuery;
                                                    logger(req, error_logger);
                                                    res.status(500).json(error_response);
                                                }
                                            });
                                        }

                                        response.status = true;
                                        response.message = "mail sent successfully";
                                        response.error = null;
                                        if (!(templateId == 0 || overWrite))
                                            res.status(200).json(response);
                                    }
                                    //end of if(sendgrid sent mail successfully)
                                    //if mail is not sent
                                    else {
                                        response.status = false;
                                        response.message = "Error while sending mail";
                                        response.error = null;
                                        response.data = null;
                                        res.status(500).json(response);
                                        return;
                                    }
                                    //end of else(sendgrid send mail)
                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    error_logger.proc_call = procQuery;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });

                        }

                        //save it as a template if flag is true or template id is 0
                        if (templateId == 0 || overWrite) {
                            req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                            req.body.type = req.body.type ? req.body.type : 0;
                            req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                            req.body.subject = req.body.subject ? req.body.subject : '';
                            req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                            req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                            req.body.priority = req.body.priority ? req.body.priority : 0;
                            req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                            req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;
                            req.body.smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                            req.body.whatmateMessage = req.body.whatmateMessage ? req.body.whatmateMessage : '';
                            var templateInputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(templateId),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(req.body.templateName),
                                req.st.db.escape(req.body.type),
                                req.st.db.escape(JSON.stringify(toMail)),
                                req.st.db.escape(JSON.stringify(cc)),
                                req.st.db.escape(JSON.stringify(bcc)),
                                req.st.db.escape(req.body.subject),
                                req.st.db.escape(req.body.mailBody),
                                req.st.db.escape(req.body.replymailId),
                                req.st.db.escape(req.body.priority),
                                req.st.db.escape(req.body.updateFlag),
                                req.st.db.escape(req.body.smsMsg),
                                req.st.db.escape(req.body.whatmateMessage),
                                req.st.db.escape(JSON.stringify(attachment)),
                                req.st.db.escape(JSON.stringify(tags)),
                                req.st.db.escape(JSON.stringify(stage)),
                                req.st.db.escape(req.body.mailerType),
                                req.st.db.escape(JSON.stringify(tableTags)),
                                req.st.db.escape(req.body.smsFlag || 0),
                                req.st.db.escape(req.body.attachJD || 0),
                                req.st.db.escape(req.body.attachResume || 0),
                                req.st.db.escape(req.body.interviewerFlag || 0),
                                req.st.db.escape(req.body.resumeFileName || ''),
                                req.st.db.escape(req.body.attachResumeFlag || 0),
                                req.st.db.escape(req.body.isSingleMail || 0)
                            ];
                            var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                            console.log(saveTemplateQuery);
                            req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                try {
                                    console.log(tempSaveErr);
                                    if (!tempSaveErr && tempSaveResult) {
                                        // console.log(tempSaveResult);
                                        response.status = true;
                                        //check if there are any receivers, if yes sent and saved
                                        if (emailReceivers.length != 0)
                                            response.message = "Sent and Saved successfully";
                                        //else saved
                                        else
                                            response.message = "Template saved successfully";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);
                                    }
                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    error_logger.proc_call = saveTemplateQuery;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });
                        }
                    }
                    //end of if(token validation)
                    //else invalid token
                    else {
                        res.status(401).json(response);
                    }
                    //end of else (token validation)
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.jobSeekerMailer = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.jobSeekerMailer'
    }

    try {
        var validationFlag = true;
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        var sentMailFlag = 1;

        var isSendgrid;
        var isSMS;

        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var subject_array = [];
        var smsMsg_array = [];

        var transactions = [];

        var emailId = [];
        var fromEmailID;
        var toEmailID = [];
        var MobileISD = [];
        var MobileNumber = [];
        var isdMobile = '';
        var mobileNo = '';
        var message = '';
        var smsSenderId='';

        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                //request parameters
                                var updateFlag = req.body.updateFlag || 0;
                                var overWrite = req.body.overWrite || 0;
                                var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
                                var templateId = req.body.template ? req.body.template.templateId : undefined;
                                var trackerTemplate = req.body.trackerTemplate || {};
                                var tags = req.body.tags || {};
                                var cc = req.body.cc || [];
                                var toMail = req.body.toMail || [];
                                var bcc = req.body.bcc || [];
                                var stage = req.body.stage || [];
                                var attachment = req.body.attachment || [];
                                var reqApplicants = req.body.reqApplicants || [];
                                var applicants = req.body.applicantId || [];
                                var client = req.body.clientId || [];
                                var tableTags = req.body.tableTags || {};
                                var clientContacts = req.body.clientContacts || [];
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var mailBody = req.body.mailBody || '';

                                var whatmateMessage = req.body.whatmateMessage || '';
                                var smsMsg = req.body.smsMsg || '';
                                var smsFlag = req.body.smsFlag || 0;

                                var isWeb = req.query.isWeb || 0;
                                var mailerType = req.body.mailerType || 0;
                                var userId = req.query.userId || 0;

                                var attachJD = req.body.attachJD || 0;
                                var attachResume = req.body.attachResume || 0;
                                var interviewerFlag = req.body.interviewerFlag || 0;
                                var resumeFileName = req.body.resumeFileName || 0;

                                //html styling for table in submission mailer

                                if (!req.query.heMasterId) {
                                    error.heMasterId = 'Invalid tenant';
                                    validationFlag *= false;
                                }

                                if (!req.query.token) {
                                    error.token = 'Invalid token';
                                    validationFlag *= false;
                                }


                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }

                                if (typeof (cc) == "string") {
                                    cc = JSON.parse(cc);
                                }

                                if (typeof (toMail) == "string") {
                                    toMail = JSON.parse(toMail);
                                }

                                if (typeof (bcc) == "string") {
                                    bcc = JSON.parse(bcc);
                                }

                                if (typeof (stage) == "string") {
                                    stage = JSON.parse(stage);
                                }

                                if (typeof (attachment) == "string") {
                                    attachment = JSON.parse(attachment);
                                }

                                if (typeof (client) == "string") {
                                    client = JSON.parse(client);
                                }

                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }

                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }

                                //check for mail type and assign the recipients
                                emailReceivers = applicants;
                                var recipients = applicants;
                                // emailReceivers.sort(function(a,b){return a-b});


                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {

                                    if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(JSON.stringify(applicants)),
                                            req.st.db.escape(sentMailFlag)

                                        ];

                                        var procQuery = 'CALL wm_paceMailerJobseeker( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);

                                                if (result[2] && result[2][0]) {
                                                    isSendgrid = result[2][0].isSendgrid ? result[2][0].isSendgrid : 0,
                                                        isSMS = result[2][0].isSMS ? result[2][0].isSMS : 0,
                                                        smsSenderId = result[2][0].smsSenderId ? result[2][0].smsSenderId : ""
                                                }

                                                if (!err && result && result[0] && result[0][0]) {

                                                    var temp = mailBody;
                                                    var temp1 = subject;
                                                    var temp2 = smsMsg;
                                                    // console.log('result of pacemailer procedure', result[0]);
                                                    for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {

                                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                            }
                                                        }

                                                        mailbody_array.push(mailBody);
                                                        subject_array.push(subject);
                                                        smsMsg_array.push(smsMsg);

                                                        fromEmailID = result[1][0].fromEmailId;
                                                        toEmailID.push(result[0][applicantIndex].EmailId);
                                                        MobileISD.push(result[0][applicantIndex].MobileISD);
                                                        MobileNumber.push(result[0][applicantIndex].MobileNo);
                                                        mailBody = temp;
                                                        subject = temp1;
                                                        smsMsg = temp2;
                                                    }

                                                    for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                                        var mailOptions = {
                                                            from: fromEmailID,
                                                            to: toEmailID[receiverIndex],
                                                            subject: subject_array[receiverIndex],
                                                            html: mailbody_array[receiverIndex]
                                                        };

                                                        mailOptions.cc = [];

                                                        for (var j = 0; j < cc.length; j++) {
                                                            mailOptions.cc.push(cc[j].emailId);
                                                        }
                                                        mailOptions.bcc = [];

                                                        for (var j = 0; j < bcc.length; j++) {
                                                            mailOptions.bcc.push(bcc[j].emailId);
                                                        }

                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                        var email = new sendgrid.Email();
                                                        email.from = mailOptions.from;
                                                        email.to = mailOptions.to;
                                                        email.subject = mailOptions.subject;
                                                        email.mbody = mailOptions.html;
                                                        email.cc = mailOptions.cc;
                                                        email.bcc = mailOptions.bcc;
                                                        email.html = mailOptions.html;
                                                        //if 1 or more attachments are present
                                                        for (var file = 0; file < attachment.length; file++) {
                                                            email.addFile({
                                                                filename: attachment[file].fileName,
                                                                content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                                contentType: attachment[file].fileType
                                                            });
                                                        }

                                                        // assign mobile no and isdMobile to send sms
                                                        isdMobile = MobileISD[receiverIndex];
                                                        mobileNo = MobileNumber[receiverIndex];
                                                        message = smsMsg_array[receiverIndex];

                                                        // to send normal sms
                                                        if (isSMS) {
                                                            if (smsFlag) {
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
                                                                        try {
                                                                            if (error) {
                                                                                console.log(error, "SMS");
                                                                            }
                                                                            else {
                                                                                console.log("SUCCESS", "SMS response");
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }

                                                                    });
                                                                }
                                                                else if (isdMobile == "+91") {
                                                                    console.log('inside send sms');
                                                                    console.log(isdMobile, ' ', mobileNo);
                                                                    request({
                                                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                                                        qs: {
                                                                            user_name: 'janardana@hirecraft.com',
                                                                            password: 'Ezeid2015',
                                                                            sender_id: smsSenderId,
                                                                            service: 'TRANS',
                                                                            mobile_no: mobileNo,
                                                                            message: message,
                                                                            method: 'send_sms'
                                                                        },
                                                                        method: 'GET'

                                                                    }, function (error, response, body) {
                                                                        try {
                                                                            if (error) {
                                                                                console.log(error, "SMS");
                                                                            }
                                                                            else {
                                                                                console.log("SUCCESS", "SMS response");
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }
                                                                    });

                                                                    var req1 = http.request(options, function (res1) {
                                                                        var chunks = [];

                                                                        res1.on("data", function (chunk) {
                                                                            chunks.push(chunk);
                                                                        });

                                                                        res1.on("end", function () {
                                                                            var body = Buffer.concat(chunks);
                                                                            console.log(body.toString());
                                                                        });
                                                                    });

                                                                    req1.write(qs.stringify({
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
                                                                    req1.end();
                                                                }
                                                                else if (isdMobile != "") {
                                                                    console.log('inside without isd', isdMobile, ' ', mobileNo);
                                                                    client.messages.create(
                                                                        {
                                                                            body: message,
                                                                            to: isdMobile + mobileNo,
                                                                            from: FromNumber
                                                                        },
                                                                        function (error, response) {
                                                                            try {
                                                                                if (error) {
                                                                                    console.log(error, "SMS");
                                                                                }
                                                                                else {
                                                                                    console.log("SUCCESS", "SMS response");
                                                                                }
                                                                            }
                                                                            catch (ex) {
                                                                                error_logger.error = ex;
                                                                                logger(req, error_logger);
                                                                                res.status(500).json(error_response);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        }


                                                        if (isSendgrid && email.subject != '') {
                                                            sendgrid.send(email, function (err, result) {
                                                                try {
                                                                    if (!err) {

                                                                        var saveMails = [
                                                                            req.st.db.escape(req.query.token),
                                                                            req.st.db.escape(req.query.heMasterId),
                                                                            req.st.db.escape(req.body.heDepartmentId),
                                                                            req.st.db.escape(userId),
                                                                            req.st.db.escape(mailerType),
                                                                            req.st.db.escape(mailOptions.from),
                                                                            req.st.db.escape(mailOptions.to),
                                                                            req.st.db.escape(mailOptions.subject),
                                                                            req.st.db.escape(mailOptions.html),    // contains mail body
                                                                            req.st.db.escape(JSON.stringify(cc)),
                                                                            req.st.db.escape(JSON.stringify(bcc)),
                                                                            req.st.db.escape(JSON.stringify(attachment)),
                                                                            req.st.db.escape(req.body.replyMailId),
                                                                            req.st.db.escape(req.body.priority),
                                                                            req.st.db.escape(req.body.stageId),
                                                                            req.st.db.escape(req.body.statusId),
                                                                            req.st.db.escape(message),    // sms message
                                                                            req.st.db.escape(whatmateMessage),
                                                                            req.st.db.escape(recipients[0]),   // in procedure only reAppId is stored
                                                                            req.st.db.escape(JSON.stringify(transactions ? transactions : [])),
                                                                            req.st.db.escape(req.body.interviewerFlag || 0)
                                                                        ];

                                                                        //saving the mail after sending it
                                                                        var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                                        console.log(saveMailHistory);
                                                                        req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                                            try {
                                                                                console.log(mailHistoryErr);
                                                                                console.log(mailHistoryResult);
                                                                                if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                                                    console.log('sent mails saved successfully');
                                                                                }
                                                                                else {
                                                                                    console.log('mails could not be saved');
                                                                                }
                                                                            }
                                                                            catch (ex) {
                                                                                error_logger.error = ex;
                                                                                error_logger.proc_call = saveMailHistory;
                                                                                logger(req, error_logger);
                                                                                res.status(500).json(error_response);
                                                                            }
                                                                        });
                                                                        console.log('Mail sent now save sent history');
                                                                    } //end of if(sendgrid sent mail successfully)
                                                                    //if mail is not sent
                                                                    else {
                                                                        console.log('Mail not Sent Successfully' + err);
                                                                    }
                                                                }
                                                                catch (ex) {
                                                                    error_logger.error = ex;
                                                                    logger(req, error_logger);
                                                                    res.status(500).json(error_response);
                                                                }
                                                            });
                                                        }

                                                    }
                                                    if (!(templateId == 0 || overWrite)) {
                                                        response.status = true;

                                                        if (isSendgrid && isSMS) {  // making changes here reminder
                                                            if (subject != '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "Mail and SMS sent successfully";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                                else {
                                                                    response.message = "Mail sent successfully";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                            }

                                                            else if (subject == '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                                else {
                                                                    response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else if (isSendgrid && !isSMS) {

                                                            if (subject != '') {
                                                                response.message = "Mail sent successfully";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else if (subject == '') {
                                                                response.message = "Mail subject is empty, mail cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else if (isSMS && !isSendgrid) {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "SMS sent successfully";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else if (smsMsg == '' && smsFlag) {
                                                                response.message = "SMS field is empty, SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else {
                                                                response.message = "SMS flag is not enabled, SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else {
                                                            response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                                            response.data = null;
                                                        }

                                                        response.error = null;
                                                        res.status(200).json(response);
                                                    }
                                                }

                                                else {
                                                    response.status = false;
                                                    response.message = "Error while sending mail";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                    return;
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                error_logger.proc_call = procQuery;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                    // else if(!templateId && !overWrite){
                                    //     response.status = false;
                                    //     response.message = "To mail is empty. Mail not sent";
                                    //     response.error = null;
                                    //     response.data = null;
                                    //     res.status(200).json(response);
                                    //     return;
                                    // }

                                    else if (templateId && !overWrite && !emailReceivers.length) {
                                        response.status = false;
                                        response.message = "To mail is empty. Mail not sent. TemplateId exists but no overWrite Flag";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);
                                        return;
                                    }
                                    //save it as a template if flag is true or template id is 0
                                    if (templateId == 0 || overWrite) {
                                        req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                                        req.body.type = req.body.type ? req.body.type : 0;
                                        req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                                        req.body.subject = req.body.subject ? req.body.subject : '';
                                        req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                                        req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                                        req.body.priority = req.body.priority ? req.body.priority : 0;
                                        req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                                        req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                                        var templateInputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(templateId),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(req.body.templateName),
                                            req.st.db.escape(req.body.type),
                                            req.st.db.escape(JSON.stringify(toMail)),
                                            req.st.db.escape(JSON.stringify(cc)),
                                            req.st.db.escape(JSON.stringify(bcc)),
                                            req.st.db.escape(req.body.subject),
                                            req.st.db.escape(req.body.mailBody),
                                            req.st.db.escape(req.body.replymailId),
                                            req.st.db.escape(req.body.priority),
                                            req.st.db.escape(req.body.updateFlag),
                                            req.st.db.escape(smsMsg),
                                            req.st.db.escape(whatmateMessage),
                                            req.st.db.escape(JSON.stringify(attachment)),
                                            req.st.db.escape(JSON.stringify(tags)),
                                            req.st.db.escape(JSON.stringify(stage)),
                                            req.st.db.escape(req.body.mailerType),
                                            req.st.db.escape(JSON.stringify(tableTags)),
                                            req.st.db.escape(req.body.smsFlag || 0),
                                            req.st.db.escape(req.body.attachJD || 0),
                                            req.st.db.escape(req.body.attachResume || 0),
                                            req.st.db.escape(req.body.interviewerFlag || 0),
                                            req.st.db.escape(req.body.resumeFileName || ''),
                                            req.st.db.escape(req.body.attachResumeFlag || 0),
                                            req.st.db.escape(JSON.stringify(trackerTemplate)),
                                            req.st.db.escape(req.body.isSingleMail || 0)
                                        ];
                                        var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                                        console.log(saveTemplateQuery);
                                        req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                            try {
                                                console.log(tempSaveErr);
                                                if (!tempSaveErr && tempSaveResult) {
                                                    // console.log(tempSaveResult);
                                                    response.status = true;
                                                    //check if there are any receivers, if yes sent and saved
                                                    if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                                                        if (isSendgrid && isSMS) {
                                                            response.message = "Mail and SMS Sent and Template Saved successfully";
                                                        }
                                                        else if (!isSendgrid && isSMS) {
                                                            response.message = "SMS is Sent and Template Saved successfully";
                                                        }
                                                        else if (isSendgrid && !isSMS) {
                                                            response.message = "Mail is Sent and Template Saved successfully";
                                                        }
                                                        else {
                                                            response.message = "Template saved successfully";
                                                        }
                                                    }
                                                    //else saved
                                                    else {
                                                        response.message = "Template saved successfully";
                                                    }
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                error_logger.proc_call = saveTemplateQuery;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    //end of if(token validation)
                    //else invalid token
                    else {
                        res.status(401).json(response);
                    }
                    //end of else (token validation)
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.jobSeekerPreview = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.jobSeekerPreview'
    }

    try {
        var validationFlag = true;


        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid company';
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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                                var mailBody = req.body.mailBody ? req.body.mailBody : '';
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                                var isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                var sentMailFlag = 0;

                                var tags = req.body.tags;
                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }
                                if (!tags) {
                                    tags = [];
                                }

                                var applicants = req.body.applicantId;
                                if (typeof (applicants) == "string") {
                                    applicants = JSON.parse(applicants);
                                }
                                if (!applicants) {
                                    applicants = [];
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(applicants)),
                                        req.st.db.escape(sentMailFlag)
                                    ];
                                    var idArray;
                                    idArray = applicants;
                                    // idArray.sort(function(a,b){return a-b});

                                    var mailbody_array = [];
                                    var subject_array = [];
                                    var smsMsg_array = [];

                                    var procQuery;
                                    procQuery = 'CALL wm_paceMailerJobseeker( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            console.log(result);
                                            if (!err && result) {
                                                var temp = mailBody;
                                                var temp1 = subject;
                                                var temp2 = smsMsg;
                                                var applicantData = [];
                                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                                    console.log('applicantIndex=', applicantIndex);

                                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                        }
                                                    }

                                                    applicantData.push(result[0][applicantIndex].EmailId);
                                                    mailbody_array.push(mailBody);
                                                    subject_array.push(subject);
                                                    smsMsg_array.push(smsMsg);
                                                    mailBody = temp;
                                                    subject = temp1;
                                                    smsMsg = temp2;
                                                }

                                                response.status = true;
                                                response.message = "Tags replaced successfully";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: mailbody_array,
                                                    subjectPreview: subject_array,
                                                    smsMsgPreview: smsMsg_array,
                                                    receiverData: applicantData
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    try {
                                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                        res.status(200).json(response);
                                                    }
                                                    catch (ex) {
                                                        error_logger.error = ex;
                                                        logger(req, error_logger);
                                                        res.status(500).json(error_response);
                                                    }
                                                });
                                            }

                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No result found";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: [],
                                                    subjectPreview: [],
                                                    smsMsgPreview: [],
                                                    receiverData: []
                                                };
                                                res.status(200).json(response);
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while replacing tags";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            error_logger.proc_call = procQuery;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.ScreeningMailerPreview = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {

        var validationFlag = true;
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid company';
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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                var mailBody = req.body.mailBody ? req.body.mailBody : '';
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                                var isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                var sendMailFlag = 0;
                                var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;


                                var tags = req.body.tags;
                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }
                                if (!tags) {
                                    tags = [];
                                }

                                var reqApplicants = req.body.reqApplicants;
                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }
                                if (!reqApplicants) {
                                    reqApplicants = [];
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(sendMailFlag)
                                    ];
                                    var idArray;
                                    idArray = reqApplicants;
                                    // idArray.sort(function(a,b){return a-b});
                                    var mailbody_array = [];
                                    var subject_array = [];
                                    var smsMsg_array = [];

                                    var procQuery;
                                    procQuery = 'CALL wm_paceScreeningMailer( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            // console.log(result);
                                            if (!err && result && result[0] && result[0][0]) {
                                                var temp = mailBody;
                                                var temp1 = subject;
                                                var temp2 = smsMsg;
                                                var applicantData = [];
                                                var JDAttachment = [];
                                                var reqAppData = [];
                                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                                    // console.log('applicantIndex=', applicantIndex);

                                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                                        //
                                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                            // str.replace(/[^\x00-\x7F]/g, "");

                                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                        }
                                                    }

                                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                                        // 
                                                        if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                            mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                            // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                        }
                                                    }


                                                    applicantData.push(result[0][applicantIndex].EmailId);
                                                    JDAttachment.push(result[0][applicantIndex].JDAttachment);
                                                    mailbody_array.push(mailBody);
                                                    subject_array.push(subject);
                                                    smsMsg_array.push(smsMsg);
                                                    mailBody = temp;
                                                    subject = temp1;
                                                    smsMsg = temp2;
                                                    reqAppData.push(result[0][applicantIndex].reqAppId);
                                                }

                                                response.status = true;
                                                response.message = "Tags replaced successfully";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: mailbody_array,
                                                    subjectPreview: subject_array,
                                                    smsMsgPreview: smsMsg_array,
                                                    applicantData: applicantData,
                                                    JDAttachment: JDAttachment,
                                                    applicantsReqAppId: reqAppData
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }

                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No result found";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: [],
                                                    subjectPreview: [],
                                                    smsMsgPreview: [],
                                                    applicantData: [],
                                                    JDAttachment: [],
                                                    applicantsReqAppId: []
                                                };
                                                res.status(200).json(response);
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while replacing tags";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            error_logger.proc_call = procQuery;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

//send Screening Mailer
sendgridCtrl.screeningMailer = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.screeningMailer'
    }

    try {
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var sendMailFlag = 1;
        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var subject_array = [];
        var smsMsg_array = [];

        var isSendgrid;
        var isSMS;

        var transactions = [];

        var emailId = [];
        var validationFlag = true;
        var fromEmailID;
        var toEmailID = [];
        var JDAttachment = [];
        var MobileISD = [];
        var MobileNumber = [];
        var isdMobile = '';
        var mobileNo = '';
        var message = '';
        var smsSenderId = '';

        //html styling for table in submission mailer

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid tenant';
            validationFlag *= false;
        }

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                //request parameters
                                var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
                                var updateFlag = req.body.updateFlag || 0;
                                var overWrite = req.body.overWrite || 0;
                                var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
                                var templateId = req.body.template ? req.body.template.templateId : undefined;
                                var trackerTemplate = req.body.trackerTemplate || {};
                                var tags = req.body.tags || {};
                                var cc = req.body.cc || [];
                                var toMail = req.body.toMail || [];
                                var bcc = req.body.bcc || [];
                                var stage = req.body.stage || [];
                                var attachment = req.body.attachment || [];
                                var reqApplicants = req.body.reqApplicants || [];
                                var applicants = req.body.applicantId || [];
                                var client = req.body.clientId || [];
                                var tableTags = req.body.tableTags || {};
                                var clientContacts = req.body.clientContacts || [];
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var mailBody = req.body.mailBody || '';

                                var whatmateMessage = req.body.whatmateMessage || '';
                                var smsMsg = req.body.smsMsg || '';
                                var smsFlag = req.body.smsFlag || 0;

                                var isWeb = req.query.isWeb || 0;
                                var mailerType = req.body.mailerType || 0;
                                var userId = req.query.userId || 0;

                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }

                                if (typeof (cc) == "string") {
                                    cc = JSON.parse(cc);
                                }

                                if (typeof (toMail) == "string") {
                                    toMail = JSON.parse(toMail);
                                }

                                if (typeof (bcc) == "string") {
                                    bcc = JSON.parse(bcc);
                                }

                                if (typeof (stage) == "string") {
                                    stage = JSON.parse(stage);
                                }

                                if (typeof (attachment) == "string") {
                                    attachment = JSON.parse(attachment);
                                }

                                if (typeof (client) == "string") {
                                    client = JSON.parse(client);
                                }

                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }

                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }

                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }

                                //check for mail type and assign the recipients
                                emailReceivers = reqApplicants;
                                var recipients = reqApplicants;
                                // emailReceivers.sort(function(a,b){return a-b});



                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {

                                    if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(JSON.stringify(reqApplicants)),
                                            req.st.db.escape(sendMailFlag)
                                        ];

                                        var procQuery = 'CALL wm_paceScreeningMailer( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);


                                                if (result[2] && result[2][0] && result[2][0].transactions) {
                                                    transactions = JSON.parse(result[2][0].transactions);
                                                }


                                                if (result[3] && result[3][0]) {
                                                    isSendgrid = result[3][0].isSendgrid ? result[3][0].isSendgrid : 0,
                                                        isSMS = result[3][0].isSMS ? result[3][0].isSMS : 0,
                                                        smsSenderId = result[3][0].smsSenderId ? result[3][0].smsSenderId : ''
                                                }
                                                console.log('isSendgrid and isSMS', isSendgrid, isSMS);

                                                if (!err && result && result[0] && result[0][0]) {
                                                    var temp = mailBody;
                                                    var temp1 = subject;
                                                    var temp2 = smsMsg;

                                                    for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {

                                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                                            // 
                                                            if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                            }
                                                        }

                                                        mailbody_array.push(mailBody);
                                                        subject_array.push(subject);
                                                        smsMsg_array.push(smsMsg);

                                                        fromEmailID = result[1][0].fromEmailId;
                                                        // JDAttachment.push("http://storage.googleapis.com/ezeone/"+result[0][applicantIndex].JDAttachment);
                                                        toEmailID.push(result[0][applicantIndex].EmailId);
                                                        MobileISD.push(result[0][applicantIndex].MobileISD);
                                                        MobileNumber.push(result[0][applicantIndex].MobileNo);
                                                        mailBody = temp;
                                                        subject = temp1;
                                                        smsMsg = temp2;
                                                    }

                                                    for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                                        var mailOptions = {
                                                            from: fromEmailID,
                                                            to: toEmailID[receiverIndex],
                                                            subject: subject_array[receiverIndex],
                                                            html: mailbody_array[receiverIndex]
                                                        };

                                                        mailOptions.cc = [];

                                                        for (var j = 0; j < cc.length; j++) {
                                                            mailOptions.cc.push(cc[j].emailId);
                                                        }
                                                        mailOptions.bcc = [];

                                                        for (var j = 0; j < bcc.length; j++) {
                                                            mailOptions.bcc.push(bcc[j].emailId);
                                                        }

                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                        var email = new sendgrid.Email();
                                                        email.from = mailOptions.from;
                                                        email.to = mailOptions.to;
                                                        email.subject = mailOptions.subject;
                                                        email.mbody = mailOptions.html;
                                                        email.cc = mailOptions.cc;
                                                        email.bcc = mailOptions.bcc;
                                                        email.html = mailOptions.html;
                                                        //if 1 or more attachments are present
                                                        for (var file = 0; file < attachment.length; file++) {
                                                            email.addFile({
                                                                filename: attachment[file].fileName,
                                                                content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                                contentType: attachment[file].fileType
                                                            });
                                                        }

                                                        // assign mobile no and isdMobile to send sms
                                                        isdMobile = MobileISD[receiverIndex];
                                                        mobileNo = MobileNumber[receiverIndex];
                                                        message = smsMsg_array[receiverIndex];

                                                        // to send normal sms
                                                        if (isSMS) {
                                                            if (smsFlag) {
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
                                                                    console.log('inside send sms');
                                                                    console.log(isdMobile, ' ', mobileNo);
                                                                    request({
                                                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                                                        qs: {
                                                                            user_name: 'janardana@hirecraft.com',
                                                                            password: 'Ezeid2015',
                                                                            sender_id: smsSenderId,
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

                                                                    var req1 = http.request(options, function (res1) {
                                                                        var chunks = [];

                                                                        res1.on("data", function (chunk) {
                                                                            chunks.push(chunk);
                                                                        });

                                                                        res1.on("end", function () {
                                                                            var body = Buffer.concat(chunks);
                                                                            console.log(body.toString());
                                                                        });
                                                                    });

                                                                    req1.write(qs.stringify({
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
                                                                    req1.end();
                                                                }
                                                                else if (isdMobile != "") {
                                                                    client.messages.create(
                                                                        {
                                                                            body: message,
                                                                            to: isdMobile + mobileNo,
                                                                            from: FromNumber
                                                                        },
                                                                        function (error, response) {
                                                                            try {
                                                                                if (error) {
                                                                                    console.log(error, "SMS");
                                                                                }
                                                                                else {
                                                                                    console.log("SUCCESS", "SMS response");
                                                                                }
                                                                            }
                                                                            catch (ex) {
                                                                                error_logger.error = ex;
                                                                                logger(req, error_logger);
                                                                                res.status(500).json(error_response);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        }


                                                        if (isSendgrid && email.subject != '') {
                                                            sendgrid.send(email, function (err, sendGridResult) {
                                                                try {
                                                                    if (!err) {

                                                                        var saveMails = [
                                                                            req.st.db.escape(req.query.token),
                                                                            req.st.db.escape(req.query.heMasterId),
                                                                            req.st.db.escape(req.body.heDepartmentId),
                                                                            req.st.db.escape(userId),
                                                                            req.st.db.escape(mailerType),
                                                                            req.st.db.escape(mailOptions.from),
                                                                            req.st.db.escape(mailOptions.to),
                                                                            req.st.db.escape(mailOptions.subject),
                                                                            req.st.db.escape(mailOptions.html),    // contains mail body
                                                                            req.st.db.escape(JSON.stringify(cc)),
                                                                            req.st.db.escape(JSON.stringify(bcc)),
                                                                            req.st.db.escape(JSON.stringify(attachment)),
                                                                            req.st.db.escape(req.body.replyMailId),
                                                                            req.st.db.escape(req.body.priority),
                                                                            req.st.db.escape(req.body.stageId),
                                                                            req.st.db.escape(req.body.statusId),
                                                                            req.st.db.escape(message),    // sms message
                                                                            req.st.db.escape(whatmateMessage),
                                                                            req.st.db.escape(recipients[0]),
                                                                            req.st.db.escape(JSON.stringify(transactions ? transactions : [])),
                                                                            req.st.db.escape(req.body.interviewerFlag || 0)
                                                                        ];

                                                                        //saving the mail after sending it
                                                                        var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                                        console.log(saveMailHistory);
                                                                        req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                                            try {
                                                                                console.log("error of save mail", mailHistoryErr);
                                                                                console.log("result of mail save", mailHistoryResult[0]);
                                                                                if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                                                    console.log('Sent mails saved successfully');
                                                                                }
                                                                                else {
                                                                                    console.log('Mails could not be saved');
                                                                                }
                                                                            }
                                                                            catch (ex) {
                                                                                error_logger.error = ex;
                                                                                logger(req, error_logger);
                                                                                res.status(500).json(error_response);
                                                                            }
                                                                        });
                                                                        console.log('Mail sent now save sent history');
                                                                    } //end of if(sendgrid sent mail successfully)
                                                                    //if mail is not sent
                                                                    else {
                                                                        console.log('Mail not Sent Successfully' + err);
                                                                    }
                                                                }
                                                                catch (ex) {
                                                                    error_logger.error = ex;
                                                                    logger(req, error_logger);
                                                                    res.status(500).json(error_response);
                                                                }
                                                            });
                                                        }

                                                    }
                                                    if (!(templateId == 0 || overWrite)) {
                                                        response.status = true;

                                                        if (isSendgrid && isSMS) {  // making changes here reminder
                                                            if (subject != '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "Mail and SMS sent successfully";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                                else {
                                                                    response.message = "Mail sent successfully";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                            }

                                                            else if (subject == '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                                else {
                                                                    response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else if (isSendgrid && !isSMS) {

                                                            if (subject != '') {
                                                                response.message = "Mail sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else if (subject == '') {
                                                                response.message = "Mail subject is empty, mail cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else if (isSMS && !isSendgrid) {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "SMS sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else if (smsMsg == '' && smsFlag) {
                                                                response.message = "SMS field is empty, SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else {
                                                                response.message = "SMS flag is not enabled, SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                                            response.data = {
                                                                transactions: [],
                                                                reqAppList: []
                                                            }
                                                        }

                                                        response.error = null;
                                                        res.status(200).json(response);
                                                    }
                                                }
                                                else {
                                                    response.status = false;
                                                    response.message = "Error while sending mail";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                    return;
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                    // else if(!templateId && !overWrite){
                                    //     response.status = false;
                                    //     response.message = "To mail is empty. Mail not sent";
                                    //     response.error = null;
                                    //     response.data = null;
                                    //     res.status(200).json(response);
                                    //     return;
                                    // }

                                    else if (templateId && !overWrite && !emailReceivers.length) {
                                        response.status = false;
                                        response.message = "To mail is empty. Mail not sent. TemplateId exists, Please set overwrite to update template";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);
                                        return;
                                    }
                                    //save it as a template if flag is true or template id is 0
                                    if (templateId == 0 || overWrite) {
                                        req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                                        req.body.type = req.body.type ? req.body.type : 0;
                                        req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                                        req.body.subject = req.body.subject ? req.body.subject : '';
                                        req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                                        req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                                        req.body.priority = req.body.priority ? req.body.priority : 0;
                                        req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                                        req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                                        var templateInputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(templateId),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(req.body.templateName),
                                            req.st.db.escape(req.body.type),
                                            req.st.db.escape(JSON.stringify(toMail)),
                                            req.st.db.escape(JSON.stringify(cc)),
                                            req.st.db.escape(JSON.stringify(bcc)),
                                            req.st.db.escape(req.body.subject),
                                            req.st.db.escape(req.body.mailBody),
                                            req.st.db.escape(req.body.replymailId),
                                            req.st.db.escape(req.body.priority),
                                            req.st.db.escape(req.body.updateFlag),
                                            req.st.db.escape(smsMsg),
                                            req.st.db.escape(whatmateMessage),
                                            req.st.db.escape(JSON.stringify(attachment)),
                                            req.st.db.escape(JSON.stringify(tags)),
                                            req.st.db.escape(JSON.stringify(stage)),
                                            req.st.db.escape(req.body.mailerType),
                                            req.st.db.escape(JSON.stringify(tableTags)),
                                            req.st.db.escape(req.body.smsFlag || 0),
                                            req.st.db.escape(req.body.attachJD || 0),
                                            req.st.db.escape(req.body.attachResume || 0),
                                            req.st.db.escape(req.body.interviewerFlag || 0),
                                            req.st.db.escape(req.body.resumeFileName || ''),
                                            req.st.db.escape(req.body.attachResumeFlag || 0),
                                            req.st.db.escape(JSON.stringify(trackerTemplate)),
                                            req.st.db.escape(req.body.isSingleMail || 0)

                                        ];
                                        var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                                        console.log(saveTemplateQuery);
                                        req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                            try {
                                                console.log(tempSaveErr);
                                                if (!tempSaveErr && tempSaveResult) {
                                                    // console.log(tempSaveResult);
                                                    response.status = true;
                                                    //check if there are any receivers, if yes sent and saved
                                                    if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                                                        if (isSendgrid && isSMS) {
                                                            response.message = "Mail and SMS Sent and Template Saved successfully";
                                                        }
                                                        else if (!isSendgrid && isSMS) {
                                                            response.message = "SMS is Sent and Template Saved successfully";
                                                        }
                                                        else if (isSendgrid && !isSMS) {
                                                            response.message = "Mail is Sent and Template Saved successfully";
                                                        }
                                                        else {
                                                            response.message = "Template saved successfully";
                                                        }
                                                    }
                                                    //else saved
                                                    else {
                                                        response.message = "Template saved successfully";
                                                    }
                                                    response.error = null;
                                                    response.data = tempSaveResult[0][0];
                                                    res.status(200).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    //end of if(token validation)
                    //else invalid token
                    else {
                        res.status(401).json(response);
                    }
                    //end of else (token validation) 
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};



sendgridCtrl.SubmissionMailerPreview = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {


        var validationFlag = true;

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid company';
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

                        console.log(req.body);
                        var mailBody = req.body.mailBody ? req.body.mailBody : '';
                        var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                        var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                        var isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        var sendMailFlag = 0;
                        var trackerTemplate = req.body.trackerTemplate;
                        var trackerTags = [];
                        var customTags = [];


                        var tags = req.body.tags;
                        if (typeof (tags) == "string") {
                            tags = JSON.parse(tags);
                        }
                        if (!tags) {
                            tags = [];
                        }

                        var reqApplicants = req.body.reqApplicants;
                        if (typeof (reqApplicants) == "string") {
                            reqApplicants = JSON.parse(reqApplicants);
                        }
                        if (!reqApplicants) {
                            reqApplicants = [];
                        }

                        var clientContacts = req.body.clientContacts;
                        if (typeof (clientContacts) == "string") {
                            clientContacts = JSON.parse(clientContacts);
                            // clientContacts.sort(function(a,b){return a-b});
                        }
                        if (!clientContacts) {
                            clientContacts = [];
                        }
                        var tableTags = req.body.tableTags;
                        var sortedTableTags = req.body.sortedTableTags;
                        
                        if (typeof (tableTags) == "string") {
                            tableTags = JSON.parse(tableTags);
                        }
                        if (!tableTags) {
                            tableTags = [];
                        }

                        if (trackerTemplate && typeof (trackerTemplate) == "string") {
                            trackerTemplate = JSON.parse(trackerTemplate);
                        }
                        if (trackerTemplate && trackerTemplate.trackerId) {
                            if (typeof (trackerTemplate.trackerTags) == 'string') {
                                trackerTags = trackerTemplate && trackerTemplate.trackerTags && JSON.parse(trackerTemplate.trackerTags) ? JSON.parse(trackerTemplate.trackerTags) : [];
                            }

                            if (typeof (trackerTemplate.customTags) == 'string') {
                                customTags = trackerTemplate && trackerTemplate.customTags && JSON.parse(trackerTemplate.customTags) ? JSON.parse(trackerTemplate.customTags) : [];
                            }

                        }
                        else {
                            trackerTemplate = {};
                            trackerTags = [];
                            customTags = [];
                        }



                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {

                            var inputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(JSON.stringify(reqApplicants)),
                                req.st.db.escape(JSON.stringify(clientContacts)),
                                req.st.db.escape(sendMailFlag)
                            ];
                            var idArray;
                            idArray = reqApplicants;
                            // idArray.sort(function(a,b){return a-b});
                            var mailbody_array = [];
                            var subject_array = [];
                            var smsMsg_array = [];
                            var resumeFileNameArray = [];
                            var resumeFileName = req.body.resumeFileName;
                            var reqAppData = [];

                            var procQuery;
                            procQuery = 'CALL wm_paceSubmissionMailer( ' + inputs.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, result) {
                                console.log(err);
                                if (!err && result && result[0] && result[0][0] && result[1] && result[1][0]) {
                                    var temp = mailBody;
                                    var temp1 = subject;
                                    var temp2 = smsMsg;
                                    var clientData = [];
                                    var clientContactsData = [];

                                    for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                            var tempFileName = resumeFileName;

                                            for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                    mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                    tempFileName = tempFileName.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                }
                                            }

                                            for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                    mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    tempFileName = replaceAll(tempFileName, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                    // tempFileName = tempFileName.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                }
                                            }

                                            for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                                if ((result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] != null && result[0][applicantIndex][tags.client[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.client[tagIndex].tagName] != '') || result[0][applicantIndex][tags.client[tagIndex].tagName] >= 0) {

                                                    mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    tempFileName = replaceAll(tempFileName, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    // mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    // subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    // smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                    // tempFileName = tempFileName.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
                                                }

                                            }
                                            resumeFileNameArray.push(tempFileName);
                                            reqAppData.push(result[0][applicantIndex].reqAppId);
                                        }
                                        for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                            if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                            }
                                        }

                                        if (sortedTableTags.length > 0) {
                                            var position = mailBody.indexOf('@table');
                                            var tableContent = '';
                                            mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                            tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                            console.log(tableContent, 'mailbody');
                                            if (sortedTableTags && sortedTableTags.length)
                                                for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {
                                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + sortedTableTags[tagCount].displayTagAs + "</th>";
                                                }
                                            // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                            //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                            //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.requirement[tagCount].displayTagAs + "</th>";
                                            //     }
                                            // if (tableTags && tableTags.client && tableTags.client.length)
                                            //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                            //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.client[tagCount].displayTagAs + "</th>";
                                            //     }
                                            tableContent += "</tr>";
                                            if (sortedTableTags && sortedTableTags.length)
                                                for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                                    tableContent += "<tr>";
                                                    for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {
                                                        tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][sortedTableTags[tagCount].tagName] + "</td>";
                                                    }
                                                    // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                                    //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                                    //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.requirement[tagCount].tagName] + "</td>";
                                                    //     }
                                                    // if (tableTags && tableTags.client && tableTags.client.length)
                                                    //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                                    //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.client[tagCount].tagName] + "</td>";
                                                    //     }
                                                    tableContent += "</tr>";
                                                }

                                            tableContent += "</table>";
                                            mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                        }
                                        clientData.push(result[1][clientIndex].EmailId);
                                        mailbody_array.push(mailBody);
                                        subject_array.push(subject);
                                        smsMsg_array.push(smsMsg);
                                        mailBody = temp;
                                        subject = temp1;
                                        smsMsg = temp2;
                                        clientContactsData.push(result[1][clientIndex].contactId);
                                    }
                                    // console.log(mailbody_array);

                                    var originalCVArray = [];
                                    var clientCVArray = [];
                                    if (idArray.length == result[0].length) {
                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                            originalCVArray.push(result[0][applicantIndex].originalCVPath);
                                            clientCVArray.push(result[0][applicantIndex].clientCVPath);
                                        }
                                    }

                                    var buffer;
                                    var ws_data;
                                    if (trackerTemplate && trackerTemplate.trackerId) {
                                        console.log('tracker', trackerTemplate.trackerId);
                                        ws_data = '[[';
                                        // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                        for (var i = 0; i < trackerTags.length; i++) {
                                            if (i != trackerTags.length - 1)
                                                ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                            else
                                                ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                        }

                                        for (var j = 0; j < customTags.length; j++) {
                                            ws_data += ',"' + customTags[j] + '"';
                                        }

                                        ws_data += "]";

                                        // console.log(new Buffer(buffer).toString("base64"));
                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                            ws_data += ',[';
                                            for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                                if (tagIndex < trackerTags.length - 1) {
                                                    if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                                    else
                                                        ws_data += '"' + "" + '",';

                                                }
                                                else {
                                                    if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                                    else
                                                        ws_data += '"' + "" + '"';
                                                }
                                            }

                                            for (var j = 0; j < customTags.length; j++) {
                                                ws_data += ',"' + "" + '"';
                                            }

                                            ws_data += ']';
                                        }
                                        ws_data += ']';
                                        console.log(ws_data);
                                        // buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                                    }

                                    response.status = true;
                                    response.message = "Tags replaced successfully";
                                    response.error = null;
                                    response.data = {
                                        tagsPreview: mailbody_array,
                                        subjectPreview: subject_array,
                                        smsMsgPreview: smsMsg_array,
                                        clientData: clientData,
                                        originalCVArray: originalCVArray,
                                        clientCVArray: clientCVArray,
                                        resumeFileName: resumeFileNameArray,
                                        trackerData: ws_data || "",
                                        clientContactsData: clientContactsData,
                                        applicantsReqAppId: reqAppData

                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }

                                else if (!err) {
                                    response.status = false;
                                    response.message = "No recipients found";
                                    response.error = null;
                                    response.data = {
                                        tagsPreview: [],
                                        subjectPreview: [],
                                        smsMsgPreview: [],
                                        clientData: [],
                                        originalCVArray: [],
                                        clientCVArray: [],
                                        resumeFileName: [],
                                        trackerData: [],
                                        clientContactsData: [],
                                        applicantsReqAppId : []
                                    };
                                    res.status(200).json(response);
                                }

                                else {
                                    response.status = false;
                                    response.message = "Error while replacing tags";
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
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


// send submission mailer
sendgridCtrl.submissionMailer = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var sendMailFlag = 1;
        var isSendgrid;
        var isSMS;

        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var subject_array = [];
        var smsMsg_array = [];
        var transactions = [];

        var emailId = [];
        var validationFlag = true;
        var fromEmailID;
        var toEmailID = [];
        var MobileISD = [];
        var MobileNumber = [];
        var isdMobile = '';
        var mobileNo = '';
        var message = '';
        var smsSenderId = '';
        //html styling for table in submission mailer

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid tenant';
            validationFlag *= false;
        }

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
                        try {
                            req.body = JSON.parse(resultDecrypt.toString('utf-8'));


                            //request parameters
                            var updateFlag = req.body.updateFlag || 0;
                            var overWrite = req.body.overWrite || 0;
                            var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
                            var templateId = req.body.template ? req.body.template.templateId : undefined;
                            var trackerTemplate = req.body.trackerTemplate;
                            var tags = req.body.tags || {};
                            var cc = req.body.cc || [];
                            var toMail = req.body.toMail || [];
                            var bcc = req.body.bcc || [];
                            var stage = req.body.stage || [];
                            var attachment = req.body.attachment || [];
                            var reqApplicants = req.body.reqApplicants || [];
                            var applicants = req.body.applicantId || [];
                            var client = req.body.clientId || [];
                            var tableTags = req.body.tableTags || [];
                            var sortedTableTags = req.body.sortedTableTags || [];
                            
                            var clientContacts = req.body.clientContacts || [];
                            var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                            var mailBody = req.body.mailBody || '';

                            var whatmateMessage = req.body.whatmateMessage || '';
                            var smsMsg = req.body.smsMsg || '';
                            var smsFlag = req.body.smsFlag || 0;

                            var isWeb = req.query.isWeb || 0;
                            var mailerType = req.body.mailerType || 0;
                            var userId = req.query.userId || 0;
                            var trackerTags = [];
                            var customTags = [];


                            if (trackerTemplate && typeof (trackerTemplate) == "string") {
                                trackerTemplate = JSON.parse(trackerTemplate);
                            }
                            if (trackerTemplate && trackerTemplate.trackerId) {
                                if (typeof (trackerTemplate.trackerTags) == 'string') {
                                    trackerTags = trackerTemplate && trackerTemplate.trackerTags && JSON.parse(trackerTemplate.trackerTags) ? JSON.parse(trackerTemplate.trackerTags) : [];
                                }

                                if (typeof (trackerTemplate.customTags) == 'string') {
                                    customTags = trackerTemplate && trackerTemplate.customTags && JSON.parse(trackerTemplate.customTags) ? JSON.parse(trackerTemplate.customTags) : [];
                                }

                            }
                            else {
                                trackerTemplate = {};
                                trackerTags = [];
                                customTags = [];
                            }

                            if (typeof (tags) == "string") {
                                tags = JSON.parse(tags);
                            }

                            if (typeof (cc) == "string") {
                                cc = JSON.parse(cc);
                            }

                            if (typeof (toMail) == "string") {
                                toMail = JSON.parse(toMail);
                            }

                            if (typeof (bcc) == "string") {
                                bcc = JSON.parse(bcc);
                            }

                            if (typeof (stage) == "string") {
                                stage = JSON.parse(stage);
                            }

                            if (typeof (attachment) == "string") {
                                attachment = JSON.parse(attachment);
                            }

                            if (typeof (client) == "string") {
                                client = JSON.parse(client);
                            }

                            if (typeof (clientContacts) == "string") {
                                clientContacts = JSON.parse(clientContacts);
                            }

                            if (typeof (tableTags) == "string") {
                                tableTags = JSON.parse(tableTags);
                            }

                            if (typeof (reqApplicants) == "string") {
                                reqApplicants = JSON.parse(reqApplicants);
                                // reqApplicants.sort(function(a,b){return a-b});
                            }

                            //check for mail type and assign the recipients
                            emailReceivers = clientContacts;
                            var recipients = clientContacts;
                            // emailReceivers.sort(function(a,b){return a-b});


                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(JSON.stringify(clientContacts)),
                                        req.st.db.escape(sendMailFlag)
                                    ];

                                    var procQuery = 'CALL wm_paceSubmissionMailer( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);

                                            if (result[3] && result[3][0] && result[3][0].transactions) {
                                                transactions = JSON.parse(result[3][0].transactions);
                                            }


                                            if (result[4] && result[4][0]) {
                                                isSendgrid = result[4][0].isSendgrid ? result[4][0].isSendgrid : 0,
                                                    isSMS = result[4][0].isSMS ? result[4][0].isSMS : 0,
                                                    smsSenderId = result[4][0].smsSenderId ? result[4][0].smsSenderId : ''
                                            }

                                            if (!err && result && result[0] && result[0][0]) {
                                                var temp = mailBody;
                                                var temp1 = subject;
                                                var temp2 = smsMsg;

                                                for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {
                                                    for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {

                                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] != null && result[0][applicantIndex][tags.client[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.client[tagIndex].tagName] != '') || result[0][applicantIndex][tags.client[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                                // subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
                                                            }

                                                        }
                                                    }
                                                    for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                                        if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                            mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                                        }
                                                    }

                                                    if (sortedTableTags.length > 0) {
                                                        var position = mailBody.indexOf('@table');
                                                        var tableContent = '';
                                                        mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                                        tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                                        console.log(tableContent, 'mailbody');
                                                        if (sortedTableTags && sortedTableTags.length)
                                                            for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {
                                                                tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + sortedTableTags[tagCount].displayTagAs + "</th>";
                                                            }
                                                        // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                                        //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                                        //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.requirement[tagCount].displayTagAs + "</th>";
                                                        //     }
                                                        // if (tableTags && tableTags.client && tableTags.client.length)
                                                        //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                                        //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.client[tagCount].displayTagAs + "</th>";
                                                        //     }
                                                        tableContent += "</tr>";
                                                        if (sortedTableTags && sortedTableTags.length)
                                                            for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                                                tableContent += "<tr>";
                                                                for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {
                                                                    tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][sortedTableTags[tagCount].tagName] + "</td>";
                                                                }
                                                                // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                                                //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                                                //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.requirement[tagCount].tagName] + "</td>";
                                                                //     }
                                                                // if (tableTags && tableTags.client && tableTags.client.length)
                                                                //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                                                //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.client[tagCount].tagName] + "</td>";
                                                                //     }
                                                                tableContent += "</tr>";
                                                            }

                                                        tableContent += "</table>";
                                                        mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                                    }

                                                    mailbody_array.push(mailBody);
                                                    subject_array.push(subject);
                                                    smsMsg_array.push(smsMsg);

                                                    fromEmailID = result[2][0].fromEmailId;
                                                    toEmailID.push(result[1][clientIndex].EmailId);
                                                    MobileISD.push(result[1][clientIndex].MobileISD);
                                                    MobileNumber.push(result[1][clientIndex].MobileNo);
                                                    mailBody = temp;
                                                    subject = temp1;
                                                    smsMsg = temp2;
                                                }

                                                var buffer;
                                                if (trackerTemplate.trackerId) {
                                                    console.log('tracker', trackerTemplate.trackerId);
                                                    var ws_data = '[[';
                                                    // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                                    for (var i = 0; i < trackerTags.length; i++) {
                                                        if (i != trackerTags.length - 1)
                                                            ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                                        else
                                                            ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                                    }

                                                    for (var j = 0; j < customTags.length; j++) {
                                                        ws_data += ',"' + "" + '"';
                                                    }

                                                    ws_data += "]";

                                                    // console.log(new Buffer(buffer).toString("base64"));
                                                    for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                                        ws_data += ',[';
                                                        for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                                            if (tagIndex < trackerTags.length - 1) {
                                                                if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                                    ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                                                else
                                                                    ws_data += '"' + "" + '",';

                                                            }
                                                            else {
                                                                if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                                    ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                                                else
                                                                    ws_data += '"' + "" + '"';
                                                            }
                                                        }

                                                        for (var j = 0; j < customTags.length; j++) {
                                                            ws_data += ',"' + "" + '"';
                                                        }

                                                        ws_data += ']';
                                                    }
                                                    ws_data += ']';
                                                    console.log(ws_data);
                                                    buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]);
                                                }

                                                for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                                    var mailOptions = {
                                                        from: fromEmailID,
                                                        to: toEmailID[receiverIndex],
                                                        subject: subject_array[receiverIndex],
                                                        html: mailbody_array[receiverIndex]
                                                    };

                                                    mailOptions.cc = [];

                                                    for (var j = 0; j < cc.length; j++) {
                                                        mailOptions.cc.push(cc[j].emailId);
                                                    }
                                                    mailOptions.bcc = [];

                                                    for (var j = 0; j < bcc.length; j++) {
                                                        mailOptions.bcc.push(bcc[j].emailId);
                                                    }

                                                    var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                    var email = new sendgrid.Email();
                                                    email.from = mailOptions.from;
                                                    email.to = mailOptions.to;
                                                    email.subject = mailOptions.subject;
                                                    email.mbody = mailOptions.html;
                                                    email.cc = mailOptions.cc;
                                                    email.bcc = mailOptions.bcc;
                                                    email.html = mailOptions.html;
                                                    //if 1 or more attachments are present
                                                    for (var file = 0; file < attachment.length; file++) {
                                                        if (attachment[file].binaryFile) {
                                                            email.addFile({
                                                                filename: attachment[file].fileName,
                                                                content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                                contentType: attachment[file].fileType
                                                            });
                                                        }
                                                    }

                                                    if (trackerTemplate.trackerId) {
                                                        console.log('trackerTemplate send mail attach', trackerTemplate.trackerId);
                                                        email.addFile({
                                                            filename: trackerTemplate.templateName + '.xlsx',
                                                            content: new Buffer(new Buffer(buffer).toString("base64"), 'base64'),
                                                            contentType: 'application/*'
                                                        });
                                                    }

                                                    // assign mobile no and isdMobile to send sms
                                                    isdMobile = MobileISD[receiverIndex];
                                                    mobileNo = MobileNumber[receiverIndex];
                                                    message = smsMsg_array[receiverIndex];

                                                    // to send normal sms
                                                    if (isSMS) {
                                                        if (smsFlag) {
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
                                                                console.log('inside send sms');
                                                                console.log(isdMobile, ' ', mobileNo);
                                                                request({
                                                                    url: 'https://aikonsms.co.in/control/smsapi.php',
                                                                    qs: {
                                                                        user_name: 'janardana@hirecraft.com',
                                                                        password: 'Ezeid2015',
                                                                        sender_id: smsSenderId,
                                                                        service: 'TRANS',
                                                                        mobile_no: mobileNo,
                                                                        message: message,
                                                                        method: 'send_sms'
                                                                    },
                                                                    method: 'GET'

                                                                }, function (error, response, body) {
                                                                    try {

                                                                        if (error) {
                                                                            console.log(error, "SMS");
                                                                        }
                                                                        else {
                                                                            console.log("SUCCESS", "SMS response");
                                                                        }

                                                                    }
                                                                    catch (ex) {
                                                                        error_logger.error = ex;
                                                                        logger(req, error_logger);
                                                                        res.status(500).json(error_response);
                                                                    }
                                                                });

                                                                var req1 = http.request(options, function (res1) {
                                                                    var chunks = [];

                                                                    res1.on("data", function (chunk) {
                                                                        chunks.push(chunk);
                                                                    });

                                                                    res1.on("end", function () {
                                                                        var body = Buffer.concat(chunks);
                                                                        console.log(body.toString());
                                                                    });
                                                                });

                                                                req1.write(qs.stringify({
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
                                                                req1.end();
                                                            }
                                                            else if (isdMobile != "") {
                                                                console.log('inside without isd', isdMobile, ' ', mobileNo);
                                                                client.messages.create(
                                                                    {
                                                                        body: message,
                                                                        to: isdMobile + mobileNo,
                                                                        from: FromNumber
                                                                    },
                                                                    function (error, response) {
                                                                        try {
                                                                            if (error) {
                                                                                console.log(error, "SMS");
                                                                            }
                                                                            else {
                                                                                console.log("SUCCESS", "SMS response");
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    }

                                                    if (isSendgrid) {
                                                        sendgrid.send(email, function (err, result) {
                                                            try {
                                                                if (!err) {

                                                                    var saveMails = [
                                                                        req.st.db.escape(req.query.token),
                                                                        req.st.db.escape(req.query.heMasterId),
                                                                        req.st.db.escape(req.body.heDepartmentId || 0),
                                                                        req.st.db.escape(userId),
                                                                        req.st.db.escape(mailerType),
                                                                        req.st.db.escape(mailOptions.from),
                                                                        req.st.db.escape(mailOptions.to),
                                                                        req.st.db.escape(mailOptions.subject),
                                                                        req.st.db.escape(mailOptions.html),    // contains mail body
                                                                        req.st.db.escape(JSON.stringify(cc)),
                                                                        req.st.db.escape(JSON.stringify(bcc)),
                                                                        req.st.db.escape(JSON.stringify(attachment)),
                                                                        req.st.db.escape(req.body.replyMailId),
                                                                        req.st.db.escape(req.body.priority || 0),
                                                                        req.st.db.escape(req.body.stageId || 0),
                                                                        req.st.db.escape(req.body.statusId || 0),
                                                                        req.st.db.escape(message),    // sms message
                                                                        req.st.db.escape(whatmateMessage),
                                                                        req.st.db.escape(recipients[0]),   // submission mailer save client contactid
                                                                        req.st.db.escape(JSON.stringify(transactions ? transactions : [])),
                                                                        req.st.db.escape(req.body.interviewerFlag || 0)
                                                                    ];

                                                                    //saving the mail after sending it
                                                                    var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                                    console.log(saveMailHistory);
                                                                    req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                                        try {
                                                                            console.log(mailHistoryErr);
                                                                            console.log(mailHistoryResult);
                                                                            if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                                                console.log('sent mails saved successfully');
                                                                            }
                                                                            else {
                                                                                console.log('mails could not be saved');
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }
                                                                    });
                                                                    console.log('Mail sent now save sent history');
                                                                } //end of if(sendgrid sent mail successfully)
                                                                //if mail is not sent
                                                                else {
                                                                    console.log('Mail not Sent Successfully' + err);
                                                                }
                                                            }
                                                            catch (ex) {
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }

                                                }

                                                if (!(templateId == 0 || overWrite)) {
                                                    response.status = true;

                                                    if (isSendgrid && isSMS) {  // making changes here reminder
                                                        if (subject != '') {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "Mail and SMS sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[5] ? result[5] : []
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[5] ? result[5] : []
                                                                }
                                                            }
                                                        }

                                                        else if (subject == '') {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[5] ? result[5] : []
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[5] ? result[5] : []
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                    }
                                                    else if (isSendgrid && !isSMS) {

                                                        if (subject != '') {
                                                            response.message = "Mail sent successfully";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                        else if (subject == '') {
                                                            response.message = "Mail subject is empty, mail cannot be sent";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                    }
                                                    else if (isSMS && !isSendgrid) {
                                                        if (smsMsg != '' && smsFlag) {
                                                            response.message = "SMS sent successfully";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                        else if (smsMsg == '' && smsFlag) {
                                                            response.message = "SMS field is empty, SMS cannot be sent";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                        else {
                                                            response.message = "SMS flag is not enabled, SMS cannot be sent";
                                                            response.data = {
                                                                transactions: transactions[0] ? transactions[0] : [],
                                                                reqAppList: result[5] ? result[5] : []
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                                        response.data = {
                                                            transactions: [],
                                                            reqAppList: []
                                                        }
                                                    }

                                                    response.error = null;
                                                    res.status(200).json(response);
                                                }
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while sending mail";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                                return;
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                                // else if(!templateId && !overWrite){
                                //     response.status = false;
                                //     response.message = "To mail is empty. Mail not sent";
                                //     response.error = null;
                                //     response.data = null;
                                //     res.status(200).json(response);
                                //     return;
                                // }

                                else if (templateId && !overWrite && !emailReceivers.length) {
                                    response.status = false;
                                    response.message = "To mail is empty. Mail not sent. TemplateId exists but no overWrite Flag";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                    return;
                                }
                                //save it as a template if flag is true or template id is 0
                                if (templateId == 0 || overWrite) {
                                    req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                                    req.body.type = req.body.type ? req.body.type : 0;
                                    req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                                    req.body.subject = req.body.subject ? req.body.subject : '';
                                    req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                                    req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                                    req.body.priority = req.body.priority ? req.body.priority : 0;
                                    req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                                    req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                                    var templateInputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(templateId),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(req.body.templateName),
                                        req.st.db.escape(req.body.type),
                                        req.st.db.escape(JSON.stringify(toMail)),
                                        req.st.db.escape(JSON.stringify(cc)),
                                        req.st.db.escape(JSON.stringify(bcc)),
                                        req.st.db.escape(req.body.subject),
                                        req.st.db.escape(req.body.mailBody),
                                        req.st.db.escape(req.body.replymailId),
                                        req.st.db.escape(req.body.priority),
                                        req.st.db.escape(req.body.updateFlag),
                                        req.st.db.escape(smsMsg),
                                        req.st.db.escape(whatmateMessage),
                                        req.st.db.escape(JSON.stringify(attachment)),
                                        req.st.db.escape(JSON.stringify(tags)),
                                        req.st.db.escape(JSON.stringify(stage)),
                                        req.st.db.escape(req.body.mailerType),
                                        req.st.db.escape(JSON.stringify(tableTags)),
                                        req.st.db.escape(req.body.smsFlag || 0),
                                        req.st.db.escape(req.body.attachJD || 0),
                                        req.st.db.escape(req.body.attachResume || 0),
                                        req.st.db.escape(req.body.interviewerFlag || 0),
                                        req.st.db.escape(req.body.resumeFileName || ''),
                                        req.st.db.escape(req.body.attachResumeFlag || 0),
                                        req.st.db.escape(JSON.stringify(trackerTemplate)),
                                        req.st.db.escape(req.body.isSingleMail || 0)

                                    ];
                                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                                    console.log(saveTemplateQuery);
                                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                        try {
                                            console.log(tempSaveErr);
                                            if (!tempSaveErr && tempSaveResult) {
                                                // console.log(tempSaveResult);
                                                response.status = true;
                                                //check if there are any receivers, if yes sent and saved
                                                if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                                                    if (isSendgrid && isSMS) {
                                                        response.message = "Mail and SMS Sent and Template Saved successfully";
                                                    }
                                                    else if (!isSendgrid && isSMS) {
                                                        response.message = "SMS is Sent and Template Saved successfully";
                                                    }
                                                    else if (isSendgrid && !isSMS) {
                                                        response.message = "Mail is Sent and Template Saved successfully";
                                                    }
                                                    else {
                                                        response.message = "Template saved successfully";
                                                    }
                                                }
                                                //else saved
                                                else {
                                                    response.message = "Template saved successfully";
                                                }
                                                response.error = null;
                                                response.data = null;
                                                res.status(200).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }

                            }

                        }
                        catch (ex) {
                            error_logger.error = ex;
                            logger(req, error_logger);
                            res.status(500).json(error_response);
                        }
                    });


                }
                //end of if(token validation)
                //else invalid token
                else {
                    res.status(401).json(response);
                }
                //end of else (token validation)
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.clientMailerPreview = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.clientMailerPreview'
    }

    try {
        var validationFlag = true;

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid company';
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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                var mailBody = req.body.mailBody ? req.body.mailBody : '';
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                                var isWeb = req.query.isWeb ? req.query.isWeb : 0;

                                var tags = req.body.tags;
                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }
                                if (!tags) {
                                    tags = [];
                                }

                                var clientContacts = req.body.clientContacts;
                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }
                                if (!clientContacts) {
                                    clientContacts = [];
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(clientContacts))
                                    ];
                                    var idArray;
                                    idArray = clientContacts;
                                    // idArray.sort(function(a,b){return a-b});
                                    var mailbody_array = [];
                                    var subject_array = [];
                                    var smsMsg_array = [];

                                    var procQuery;
                                    procQuery = 'CALL wm_paceClientMailer( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            // console.log(result);
                                            if (!err && result && result[0] && result[0][0]) {
                                                var temp = mailBody;
                                                var temp1 = subject;
                                                var temp2 = smsMsg;
                                                var clientData = [];
                                                var clientContactsData = [];

                                                for (var clientIndex = 0; clientIndex < idArray.length; clientIndex++) {

                                                    for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                                        if ((result[0][clientIndex][tags.clientContacts[tagIndex].tagName] && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[0][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                            mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                                        }
                                                    }

                                                    for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                                        if ((result[0][clientIndex][tags.client[tagIndex].tagName] && result[0][clientIndex][tags.client[tagIndex].tagName] != null && result[0][clientIndex][tags.client[tagIndex].tagName] != 'null' && result[0][clientIndex][tags.client[tagIndex].tagName] != '') || result[0][clientIndex][tags.client[tagIndex].tagName] >= 0) {

                                                            mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                            subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                            smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                            // mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                            // subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                            // smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);
                                                        }
                                                    }

                                                    clientData.push(result[0][clientIndex].EmailId);
                                                    mailbody_array.push(mailBody);
                                                    subject_array.push(subject);
                                                    smsMsg_array.push(smsMsg);
                                                    mailBody = temp;
                                                    subject = temp1;
                                                    smsMsg = temp2;
                                                    clientContactsData.push(result[0][clientIndex].contactId);
                                                }

                                                response.status = true;
                                                response.message = "Tags replaced successfully";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: mailbody_array,
                                                    subjectPreview: subject_array,
                                                    smsMsgPreview: smsMsg_array,
                                                    clientData: clientData,
                                                    clientContactsData: clientContactsData
                                                };

                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }

                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No result found";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: [],
                                                    subjectPreview: [],
                                                    smsMsgPreview: [],
                                                    clientData: [],
                                                    clientContactsData: []
                                                };
                                                res.status(200).json(response);
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while replacing tags";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// send client mailer

sendgridCtrl.clientMailer = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        var isSendgrid;
        var isSMS;

        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var subject_array = [];
        var smsMsg_array = [];

        var transactions = [];
        var emailId = [];
        var validationFlag = true;
        var fromEmailID;
        var toEmailID = [];
        var MobileISD = [];
        var MobileNumber = [];
        var isdMobile = '';
        var mobileNo = '';
        var message = '';
        var smsSenderId = '';
        //html styling for table in submission mailer

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid tenant';
            validationFlag *= false;
        }

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }



        //check for mail type and assign the recipients
        // emailReceivers.sort(function(a,b){return a-b});

        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                //request parameters
                                var updateFlag = req.body.updateFlag || 0;
                                var overWrite = req.body.overWrite || 0;
                                var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
                                var templateId = req.body.template ? req.body.template.templateId : undefined;
                                var trackerTemplate = req.body.trackerTemplate || {};
                                var tags = req.body.tags || {};
                                var cc = req.body.cc || [];
                                var toMail = req.body.toMail || [];
                                var bcc = req.body.bcc || [];
                                var stage = req.body.stage || [];
                                var attachment = req.body.attachment || [];
                                var reqApplicants = req.body.reqApplicants || [];
                                var applicants = req.body.applicantId || [];
                                var clientContacts = req.body.clientContacts || [];
                                emailReceivers = clientContacts;
                                var recipients = clientContacts; // for saving in mailer history

                                var tableTags = req.body.tableTags || {};
                                var clientContacts = req.body.clientContacts || [];
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var mailBody = req.body.mailBody || '';

                                var whatmateMessage = req.body.whatmateMessage || '';
                                var smsMsg = req.body.smsMsg || '';
                                var smsFlag = req.body.smsFlag || 0;

                                var isWeb = req.query.isWeb || 0;
                                var mailerType = req.body.mailerType || 0;
                                var userId = req.query.userId || 0;


                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }

                                if (typeof (cc) == "string") {
                                    cc = JSON.parse(cc);
                                }

                                if (typeof (toMail) == "string") {
                                    toMail = JSON.parse(toMail);
                                }

                                if (typeof (bcc) == "string") {
                                    bcc = JSON.parse(bcc);
                                }

                                if (typeof (stage) == "string") {
                                    stage = JSON.parse(stage);
                                }

                                if (typeof (attachment) == "string") {
                                    attachment = JSON.parse(attachment);
                                }

                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }

                                // if (typeof (clientContacts) == "string") {
                                //     clientContacts = JSON.parse(clientContacts);
                                // }

                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }


                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(JSON.stringify(clientContacts))

                                        ];

                                        var procQuery = 'CALL wm_paceClientMailer( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);

                                                if (result[2] && result[2][0]) {
                                                    isSendgrid = result[2][0].isSendgrid ? result[2][0].isSendgrid : 0,
                                                        isSMS = result[2][0].isSMS ? result[2][0].isSMS : 0,
                                                        smsSenderId = result[2][0].smsSenderId ? result[2][0].smsSenderId : 0
                                                }

                                                if (!err && result && result[0]) {
                                                    var temp = mailBody;
                                                    var temp1 = subject;
                                                    var temp2 = smsMsg;
                                                    // console.log('result of pacemailer procedure', result[0]);
                                                    for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {

                                                        for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                                            if ((result[0][clientIndex][tags.clientContacts[tagIndex].tagName] && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[0][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                                            if ((result[0][clientIndex][tags.client[tagIndex].tagName] && result[0][clientIndex][tags.client[tagIndex].tagName] != null && result[0][clientIndex][tags.client[tagIndex].tagName] != 'null' && result[0][clientIndex][tags.client[tagIndex].tagName] != '') || result[0][clientIndex][tags.client[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                                // subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][clientIndex][tags.client[tagIndex].tagName]);
                                                            }
                                                        }

                                                        mailbody_array.push(mailBody);
                                                        subject_array.push(subject);
                                                        smsMsg_array.push(smsMsg);

                                                        fromEmailID = result[1][0].fromEmailId;
                                                        toEmailID.push(result[0][clientIndex].EmailId);
                                                        MobileISD.push(result[0][clientIndex].MobileISD);
                                                        MobileNumber.push(result[0][clientIndex].MobileNo);
                                                        mailBody = temp;
                                                        subject = temp1;
                                                        smsMsg = temp2;
                                                    }

                                                    for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                                        var mailOptions = {
                                                            from: fromEmailID,
                                                            to: toEmailID[receiverIndex],
                                                            subject: subject_array[receiverIndex],
                                                            html: mailbody_array[receiverIndex]
                                                        };

                                                        mailOptions.cc = [];

                                                        for (var j = 0; j < cc.length; j++) {
                                                            mailOptions.cc.push(cc[j].emailId);
                                                        }
                                                        mailOptions.bcc = [];

                                                        for (var j = 0; j < bcc.length; j++) {
                                                            mailOptions.bcc.push(bcc[j].emailId);
                                                        }

                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                        var email = new sendgrid.Email();
                                                        email.from = mailOptions.from;
                                                        email.to = mailOptions.to;
                                                        email.subject = mailOptions.subject;
                                                        email.mbody = mailOptions.html;
                                                        email.cc = mailOptions.cc;
                                                        email.bcc = mailOptions.bcc;
                                                        email.html = mailOptions.html;
                                                        //if 1 or more attachments are present
                                                        for (var file = 0; file < attachment.length; file++) {
                                                            email.addFile({
                                                                filename: attachment[file].fileName,
                                                                content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                                contentType: attachment[file].fileType
                                                            });
                                                        }

                                                        // assign mobile no and isdMobile to send sms
                                                        isdMobile = MobileISD[receiverIndex];
                                                        mobileNo = MobileNumber[receiverIndex];
                                                        message = smsMsg_array[receiverIndex];

                                                        // to send normal sms
                                                        if (isSMS) {
                                                            if (smsFlag) {
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
                                                                    console.log('inside send sms');
                                                                    console.log(isdMobile, ' ', mobileNo);
                                                                    request({
                                                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                                                        qs: {
                                                                            user_name: 'janardana@hirecraft.com',
                                                                            password: 'Ezeid2015',
                                                                            sender_id: smsSenderId,
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

                                                                    var req1 = http.request(options, function (res1) {
                                                                        var chunks = [];

                                                                        res1.on("data", function (chunk) {
                                                                            chunks.push(chunk);
                                                                        });

                                                                        res1.on("end", function () {
                                                                            var body = Buffer.concat(chunks);
                                                                            console.log(body.toString());
                                                                        });
                                                                    });

                                                                    req1.write(qs.stringify({
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
                                                                    req1.end();
                                                                }
                                                                else if (isdMobile != "") {
                                                                    console.log('inside without isd', isdMobile, ' ', mobileNo);
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
                                                            }
                                                        }

                                                        if (isSendgrid) {
                                                            sendgrid.send(email, function (err, result) {
                                                                if (!err) {

                                                                    var saveMails = [
                                                                        req.st.db.escape(req.query.token),
                                                                        req.st.db.escape(req.query.heMasterId),
                                                                        req.st.db.escape(req.body.heDepartmentId),
                                                                        req.st.db.escape(userId),
                                                                        req.st.db.escape(mailerType),
                                                                        req.st.db.escape(mailOptions.from),
                                                                        req.st.db.escape(mailOptions.to),
                                                                        req.st.db.escape(mailOptions.subject),
                                                                        req.st.db.escape(mailOptions.html),    // contains mail body
                                                                        req.st.db.escape(JSON.stringify(cc)),
                                                                        req.st.db.escape(JSON.stringify(bcc)),
                                                                        req.st.db.escape(JSON.stringify(attachment)),
                                                                        req.st.db.escape(req.body.replyMailId),
                                                                        req.st.db.escape(req.body.priority),
                                                                        req.st.db.escape(req.body.stageId || 0),
                                                                        req.st.db.escape(req.body.statusId || 0),
                                                                        req.st.db.escape(message),    // sms message
                                                                        req.st.db.escape(whatmateMessage),
                                                                        req.st.db.escape(recipients[0]),
                                                                        req.st.db.escape(JSON.stringify(transactions ? transactions : [])),
                                                                        req.st.db.escape(req.body.interviewerFlag || 0)
                                                                    ];

                                                                    //saving the mail after sending it
                                                                    var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                                    console.log(saveMailHistory);
                                                                    req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                                        console.log(mailHistoryErr);
                                                                        console.log(mailHistoryResult);
                                                                        if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                                            console.log('sent mails saved successfully');
                                                                        }
                                                                        else {
                                                                            console.log('mails could not be saved');
                                                                        }
                                                                    });
                                                                    console.log('Mail sent now save sent history');
                                                                } //end of if(sendgrid sent mail successfully)
                                                                //if mail is not sent
                                                                else {
                                                                    console.log('Mail not Sent Successfully' + err);
                                                                }
                                                            });
                                                        }

                                                    }

                                                    if (!(templateId == 0 || overWrite)) {
                                                        response.status = true;

                                                        if (isSendgrid && isSMS) {  // making changes here reminder
                                                            if (subject != '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "Mail and SMS sent successfully";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                                else {
                                                                    response.message = "Mail sent successfully";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                            }

                                                            else if (subject == '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                                else {
                                                                    response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                                                    response.data = transactions[0] ? transactions[0] : [];
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else if (isSendgrid && !isSMS) {

                                                            if (subject != '') {
                                                                response.message = "Mail sent successfully";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else if (subject == '') {
                                                                response.message = "Mail subject is empty, mail cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else if (isSMS && !isSendgrid) {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "SMS sent successfully";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else if (smsMsg == '' && smsFlag) {
                                                                response.message = "SMS field is empty, SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                            else {
                                                                response.message = "SMS flag is not enabled, SMS cannot be sent";
                                                                response.data = transactions[0] ? transactions[0] : [];
                                                            }
                                                        }
                                                        else {
                                                            response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                                            response.data = null;
                                                        }

                                                        response.error = null;
                                                        res.status(200).json(response);
                                                    }
                                                }

                                                else {
                                                    response.status = false;
                                                    response.message = "Error while sending mail";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                    return;
                                                }

                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                    // else if(!templateId && !overWrite){
                                    //     response.status = false;
                                    //     response.message = "To mail is empty. Mail not sent";
                                    //     response.error = null;
                                    //     response.data = null;
                                    //     res.status(200).json(response);
                                    //     return;
                                    // }

                                    else if (templateId && !overWrite && !emailReceivers.length) {
                                        response.status = false;
                                        response.message = "To mail is empty. Mail not sent. TemplateId exists but no overWrite Flag";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);
                                        return;
                                    }
                                    //save it as a template if flag is true or template id is 0
                                    if (templateId == 0 || overWrite) {
                                        req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                                        req.body.type = req.body.type ? req.body.type : 0;
                                        req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                                        req.body.subject = req.body.subject ? req.body.subject : '';
                                        req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                                        req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                                        req.body.priority = req.body.priority ? req.body.priority : 0;
                                        req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                                        req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                                        var templateInputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(templateId),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(req.body.templateName),
                                            req.st.db.escape(req.body.type),
                                            req.st.db.escape(JSON.stringify(toMail)),
                                            req.st.db.escape(JSON.stringify(cc)),
                                            req.st.db.escape(JSON.stringify(bcc)),
                                            req.st.db.escape(req.body.subject),
                                            req.st.db.escape(req.body.mailBody),
                                            req.st.db.escape(req.body.replymailId),
                                            req.st.db.escape(req.body.priority),
                                            req.st.db.escape(req.body.updateFlag),
                                            req.st.db.escape(smsMsg),
                                            req.st.db.escape(whatmateMessage),
                                            req.st.db.escape(JSON.stringify(attachment)),
                                            req.st.db.escape(JSON.stringify(tags)),
                                            req.st.db.escape(JSON.stringify(stage)),
                                            req.st.db.escape(req.body.mailerType),
                                            req.st.db.escape(JSON.stringify(tableTags)),
                                            req.st.db.escape(req.body.smsFlag || 0),
                                            req.st.db.escape(req.body.attachJD || 0),
                                            req.st.db.escape(req.body.attachResume || 0),
                                            req.st.db.escape(req.body.interviewerFlag || 0),
                                            req.st.db.escape(req.body.resumeFileName || ''),
                                            req.st.db.escape(req.body.attachResumeFlag || 0),
                                            req.st.db.escape(JSON.stringify(trackerTemplate)),
                                            req.st.db.escape(req.body.isSingleMail || 0)
                                        ];
                                        var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                                        console.log(saveTemplateQuery);
                                        req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                            try {
                                                console.log(tempSaveErr);
                                                if (!tempSaveErr && tempSaveResult) {
                                                    // console.log(tempSaveResult);
                                                    response.status = true;
                                                    //check if there are any receivers, if yes sent and saved
                                                    if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                                                        if (isSendgrid && isSMS) {
                                                            response.message = "Mail and SMS Sent and Template Saved successfully";
                                                        }
                                                        else if (!isSendgrid && isSMS) {
                                                            response.message = "SMS is Sent and Template Saved successfully";
                                                        }
                                                        else if (isSendgrid && !isSMS) {
                                                            response.message = "Mail is Sent and Template Saved successfully";
                                                        }
                                                        else {
                                                            response.message = "Template saved successfully";
                                                        }
                                                    }
                                                    //else saved
                                                    else {
                                                        response.message = "Template saved successfully";
                                                    }
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }

                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                }


                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    //end of if(token validation)
                    //else invalid token
                    else {
                        res.status(401).json(response);
                    }
                    //end of else (token validation)

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.interviewMailerPreview = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {

        var validationFlag = true;


        var sendMailFlag = 0;
        var originalCVArray = [];
        var clientCVArray = [];

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid company';
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
                try {
                    if ((!err) && tokenResult) {
                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                                console.log("req.body",JSON.stringify(req.body));
                                var mailBody = req.body.mailBody ? req.body.mailBody : '';
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
                                var isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;  // if 0 mail is for  applicants if 1- mail is for client contacts

                                var trackerTemplate = req.body.trackerTemplate;
                                var trackerTags = [];
                                var customTags = [];


                                if (trackerTemplate && typeof (trackerTemplate) == "string") {
                                    trackerTemplate = JSON.parse(trackerTemplate);
                                }
                                if (trackerTemplate && trackerTemplate.trackerId) {
                                    if (typeof (trackerTemplate.trackerTags) == 'string') {
                                        trackerTags = trackerTemplate && trackerTemplate.trackerTags && JSON.parse(trackerTemplate.trackerTags) ? JSON.parse(trackerTemplate.trackerTags) : [];
                                    }

                                    if (typeof (trackerTemplate.customTags) == 'string') {
                                        customTags = trackerTemplate && trackerTemplate.customTags && JSON.parse(trackerTemplate.customTags) ? JSON.parse(trackerTemplate.customTags) : [];
                                    }

                                }
                                else {
                                    trackerTemplate = {};
                                    trackerTags = [];
                                    customTags = [];
                                }


                                var tags = req.body.tags;
                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }
                                if (!tags) {
                                    tags = [];
                                }

                                var reqApplicants = req.body.reqApplicants;
                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }
                                if (!reqApplicants) {
                                    reqApplicants = [];
                                }

                                var clientContacts = req.body.clientContacts;
                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                    // clientContacts.sort(function(a,b){return a-b});
                                }
                                if (!clientContacts) {
                                    clientContacts = [];
                                }
                                var tableTags = req.body.tableTags || [];
                                var sortedTableTags = req.body.sortedTableTags || [];
                                console.log(sortedTableTags);
                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }
                                if (!tableTags) {
                                    tableTags = [];
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(JSON.stringify(clientContacts)),
                                        req.st.db.escape(sendMailFlag)
                                    ];
                                    var idArray;
                                    idArray = reqApplicants;
                                    var resumeFileNameArray = [];
                                    var resumeFileName = req.body.resumeFileName;
                                    // idArray.sort(function(a,b){return a-b});
                                    var mailbody_array = [];
                                    var subject_array = [];
                                    var smsMsg_array = [];
                                    var clientContactsData = [];
                                    var applicantsReqAppId = [];

                                    var procQuery;
                                    procQuery = 'CALL wm_paceInterviewMailer( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result && result[0] && result[0][0] || result[1] || result[1][0]) {
                                                var temp = mailBody;
                                                var temp1 = subject;
                                                var temp2 = smsMsg;
                                                var clientData = [];
                                                var applicantData = [];

                                                if (interviewerFlag) {
                                                    console.log("interviewer mailer", interviewerFlag);
                                                    for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                                            var tempFileName = resumeFileName;

                                                            for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                                    tempFileName = tempFileName.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                }
                                                            }

                                                            for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                                    tempFileName = tempFileName.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                }
                                                            }

                                                            for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                                                    tempFileName = tempFileName.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                }
                                                            }
                                                            resumeFileNameArray.push(tempFileName);
                                                            applicantsReqAppId.push(result[0][applicantIndex].reqAppId);

                                                        }
                                                        for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                                            if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                                            if ((result[1][clientIndex][tags.interview[tagIndex].tagName] && result[1][clientIndex][tags.interview[tagIndex].tagName] != null && result[1][clientIndex][tags.interview[tagIndex].tagName] != '' && result[1][clientIndex][tags.interview[tagIndex].tagName] != 'null') || result[1][clientIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);

                                                                // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[1][clientIndex][tags.interview[tagIndex].tagName]);
                                                            }
                                                        }

                                                        // if (tableTags.applicant.length > 0) {
                                                        //     var position = mailBody.indexOf('@table');
                                                        //     var tableContent = '';
                                                        //     mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                                        //     tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                                        //     console.log(tableContent, 'mailbody');
                                                        //     for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                        //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                                        //     }
                                                        //     tableContent += "</tr>";
                                                        //     for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                                        //         tableContent += "<tr>";
                                                        //         for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                        //             tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                                        //         }
                                                        //         tableContent += "</tr>";
                                                        //     }

                                                        //     tableContent += "</table>";
                                                        //     mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                                        // }


                                                        if (sortedTableTags.length > 0) {
                                                            var position = mailBody.indexOf('@table');
                                                            var tableContent = '';
                                                            mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                                            tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                                            console.log(tableContent, 'mailbody');
                                                            console.log('sortedTableTags.length',sortedTableTags.length);
                                                            if (sortedTableTags && sortedTableTags.length)
                                                                for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {
                                                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + sortedTableTags[tagCount].displayTagAs + "</th>";
                                                                }
                                                            // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                                            //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                                            //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.requirement[tagCount].displayTagAs + "</th>";
                                                            //     }
                                                            // if (tableTags && tableTags.client && tableTags.client.length)
                                                            //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                                            //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.client[tagCount].displayTagAs + "</th>";
                                                            //     }
                                                            tableContent += "</tr>";
                                                            if (sortedTableTags && sortedTableTags.length)
                                                                for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                                                    tableContent += "<tr>";
                                                                    for (var tagCount = 0; tagCount < sortedTableTags.length; tagCount++) {

                                                                        var data =  result[0][candidateCount] && result[0][candidateCount][sortedTableTags[tagCount].tagName] ?  result[0][candidateCount][sortedTableTags[tagCount].tagName] : "";
                                                                        tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + data + "</td>";
                                                                    }
                                                                    // if (tableTags && tableTags.requirement && tableTags.requirement.length)
                                                                    //     for (var tagCount = 0; tagCount < tableTags.requirement.length; tagCount++) {
                                                                    //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.requirement[tagCount].tagName] + "</td>";
                                                                    //     }
                                                                    // if (tableTags && tableTags.client && tableTags.client.length)
                                                                    //     for (var tagCount = 0; tagCount < tableTags.client.length; tagCount++) {
                                                                    //         tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.client[tagCount].tagName] + "</td>";
                                                                    //     }
                                                                    tableContent += "</tr>";
                                                                }

                                                            tableContent += "</table>";
                                                            mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');
                                                        }

                                                        clientData.push(result[1][clientIndex].EmailId);
                                                        mailbody_array.push(mailBody);
                                                        subject_array.push(subject);
                                                        smsMsg_array.push(smsMsg);
                                                        mailBody = temp;
                                                        subject = temp1;
                                                        smsMsg = temp2;
                                                        clientContactsData.push(result[1][clientIndex].contactId);
                                                    }

                                                    if (idArray.length == result[0].length) {
                                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                                            originalCVArray.push(result[0][applicantIndex].originalCVPath);
                                                            clientCVArray.push(result[0][applicantIndex].clientCVPath);
                                                        }
                                                    }

                                                    var buffer;
                                                    var ws_data;

                                                    if (trackerTemplate && trackerTemplate.trackerId) {
                                                        console.log('tracker', trackerTemplate.trackerId);
                                                        ws_data = '[[';
                                                        // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                                        for (var i = 0; i < trackerTags.length; i++) {
                                                            if (i != trackerTags.length - 1)
                                                                ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                                            else
                                                                ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                                        }

                                                        for (var j = 0; j < customTags.length; j++) {
                                                            ws_data += ',"' + customTags[j] + '"';
                                                        }

                                                        ws_data += "]";

                                                        // console.log(new Buffer(buffer).toString("base64"));
                                                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                                            ws_data += ',[';
                                                            for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                                                if (tagIndex < trackerTags.length - 1) {
                                                                    if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                                                    else
                                                                        ws_data += '"' + "" + '",';

                                                                }
                                                                else {
                                                                    if (result[0][applicantIndex][trackerTags[tagIndex].tagName] != undefined)
                                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                                                    else
                                                                        ws_data += '"' + "" + '"';
                                                                }
                                                            }

                                                            for (var j = 0; j < customTags.length; j++) {
                                                                ws_data += ',"' + "" + '"';
                                                            }

                                                            ws_data += ']';
                                                        }
                                                        ws_data += ']';
                                                        console.log(ws_data);
                                                        // buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                                                    }


                                                }
                                                else {
                                                    console.log('applicants interview mail', interviewerFlag);
                                                    for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);


                                                                subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                            }
                                                        }

                                                        for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                                            if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                                mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                                            }
                                                        }
                                                        applicantData.push(result[0][applicantIndex].EmailId);

                                                        mailbody_array.push(mailBody);
                                                        subject_array.push(subject);
                                                        smsMsg_array.push(smsMsg);
                                                        mailBody = temp;
                                                        subject = temp1;
                                                        smsMsg = temp2;
                                                        applicantsReqAppId.push(result[0][applicantIndex].reqAppId);
                                                    }


                                                }
                                                // console.log(mailbody_array);

                                                response.status = true;
                                                response.message = "Tags replaced successfully";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: mailbody_array,
                                                    subjectPreview: subject_array,
                                                    smsMsgPreview: smsMsg_array,
                                                    applicants: result[0],
                                                    clientContacts: result[1],
                                                    clientData: clientData,
                                                    applicantData: applicantData,
                                                    originalCVArray: originalCVArray,
                                                    clientCVArray: clientCVArray,
                                                    resumeFileName: resumeFileNameArray,
                                                    applicantsReqAppId: applicantsReqAppId,
                                                    trackerData: ws_data || ""
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }

                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No result found";
                                                response.error = null;
                                                response.data = {
                                                    tagsPreview: [],
                                                    subjectPreview: [],
                                                    smsMsgPreview: [],
                                                    clientData: [],
                                                    applicantData: [],
                                                    originalCVArray: [],
                                                    clientCVArray: [],
                                                    resumeFileName: [],
                                                    applicantsReqAppId: [],
                                                    trackerData: ""
                                                };
                                                res.status(200).json(response);
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while replacing tags";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }

                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.interviewMailer = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {

        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var sendMailFlag = 1;

        var transactions = [];

        var isSendgrid;
        var isSMS;

        var emailReceivers;                //emailReceivers to store the recipients
        var mailbody_array = [];    //array to store all mailbody after replacing tags
        var subject_array = [];
        var smsMsg_array = [];

        var emailId = [];
        var validationFlag = true;
        var fromEmailID;
        var toEmailID = [];
        var MobileISD = [];
        var MobileNumber = [];
        var isdMobile = '';
        var mobileNo = '';
        var message = '';
        var smsSenderId = '';

        //html styling for table in submission mailer

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid tenant';
            validationFlag *= false;
        }

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                //request parameters
                                var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;  // if 0 mail is for  applicants if 1- mail is for client contacts
                                var updateFlag = req.body.updateFlag || 0;
                                var overWrite = req.body.overWrite || 0;
                                var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
                                var templateId = req.body.template ? req.body.template.templateId : 0;
                                var trackerTemplate = req.body.trackerTemplate || {};
                                var tags = req.body.tags || {};
                                var cc = req.body.cc || [];
                                var toMail = req.body.toMail || [];
                                var bcc = req.body.bcc || [];
                                var stage = req.body.stage || [];
                                var attachment = req.body.attachment || [];
                                var reqApplicants = req.body.reqApplicants || [];
                                var applicants = req.body.applicantId || [];
                                var client = req.body.clientId || [];
                                var tableTags = req.body.tableTags || {};
                                var clientContacts = req.body.clientContacts || [];
                                var subject = req.body.subject && req.body.subject != '' ? req.body.subject : '(no subject)';
                                var mailBody = req.body.mailBody || '';

                                var whatmateMessage = req.body.whatmateMessage || '';
                                var smsMsg = req.body.smsMsg || '';
                                var smsFlag = req.body.smsFlag || 0;

                                var isWeb = req.query.isWeb || 0;
                                var mailerType = req.body.mailerType || 0;
                                var userId = req.query.userId || 0;
                                var customTags = [];

                                if (trackerTemplate && typeof (trackerTemplate) == "string") {
                                    trackerTemplate = JSON.parse(trackerTemplate);
                                }
                                if (trackerTemplate && trackerTemplate.trackerId) {
                                    if (typeof (trackerTemplate.trackerTags) == 'string') {
                                        trackerTags = trackerTemplate && trackerTemplate.trackerTags && JSON.parse(trackerTemplate.trackerTags) ? JSON.parse(trackerTemplate.trackerTags) : [];
                                    }

                                    if (typeof (trackerTemplate.customTags) == 'string') {
                                        customTags = trackerTemplate && trackerTemplate.customTags && JSON.parse(trackerTemplate.customTags) ? JSON.parse(trackerTemplate.customTags) : [];
                                    }

                                }
                                else {
                                    trackerTemplate = {};
                                    trackerTags = [];
                                    customTags = [];
                                }

                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }

                                if (typeof (cc) == "string") {
                                    cc = JSON.parse(cc);
                                }

                                if (typeof (toMail) == "string") {
                                    toMail = JSON.parse(toMail);
                                }

                                if (typeof (bcc) == "string") {
                                    bcc = JSON.parse(bcc);
                                }

                                if (typeof (stage) == "string") {
                                    stage = JSON.parse(stage);
                                }

                                if (typeof (attachment) == "string") {
                                    attachment = JSON.parse(attachment);
                                }

                                if (typeof (client) == "string") {
                                    client = JSON.parse(client);
                                }

                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }

                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }

                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                    // reqApplicants.sort(function(a,b){return a-b});
                                }

                                //check for mail type and assign the recipients
                                if (interviewerFlag) {
                                    emailReceivers = clientContacts;
                                    var recipients = clientContacts;
                                    // emailReceivers.sort(function(a,b){return a-b});
                                }
                                else {
                                    emailReceivers = reqApplicants;
                                    var recipients = reqApplicants;
                                    // emailReceivers.sort(function(a,b){return a-b});
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(JSON.stringify(reqApplicants)),
                                            req.st.db.escape(JSON.stringify(clientContacts)),
                                            req.st.db.escape(sendMailFlag)
                                        ];

                                        var procQuery = 'CALL wm_paceInterviewMailer( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);
                                                if (result[3] && result[3][0] && result[3][0].transactions) {
                                                    transactions = JSON.parse(result[3][0].transactions);
                                                }

                                                if (result[4] && result[4][0]) {
                                                    isSendgrid = result[4][0].isSendgrid ? result[4][0].isSendgrid : 0,
                                                        isSMS = result[4][0].isSMS ? result[4][0].isSMS : 0,
                                                        smsSenderId = result[4][0].smsSenderId ? result[4][0].smsSenderId : 0
                                                }

                                                if (!err && result && result[0] && result[0][0]) {
                                                    var temp = mailBody;
                                                    var temp1 = subject;
                                                    var temp2 = smsMsg;

                                                    if (interviewerFlag) {
                                                        for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {
                                                            for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {

                                                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                                    if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                        mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                        subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                        smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                        // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                        // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                        // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                                    }

                                                                }

                                                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                                    if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                        mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                        subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                        smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                        // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                        // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                        // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                                    }
                                                                }

                                                                for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                                                    if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                                        mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                        subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                        smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);


                                                                        // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                        // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                        // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    }

                                                                }
                                                            }
                                                            for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                                                if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                    // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                                                }
                                                            }

                                                            if (tableTags.applicant.length > 0) {
                                                                var position = mailBody.indexOf('@table');
                                                                var tableContent = '';
                                                                mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                                                tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                                                console.log(tableContent, 'mailbody');
                                                                for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                                                }
                                                                tableContent += "</tr>";
                                                                for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                                                    tableContent += "<tr>";
                                                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                                        tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                                                    }
                                                                    tableContent += "</tr>";
                                                                }

                                                                tableContent += "</table>";
                                                                mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                                            }

                                                            mailbody_array.push(mailBody);
                                                            subject_array.push(subject);
                                                            smsMsg_array.push(smsMsg);
                                                            fromEmailID = result[2][0].fromEmailId;
                                                            toEmailID.push(result[1][clientIndex].EmailId);
                                                            MobileISD.push(result[1][clientIndex].MobileISD);
                                                            MobileNumber.push(result[1][clientIndex].MobileNo);
                                                            mailBody = temp;
                                                            subject = temp1;
                                                            smsMsg = temp2;
                                                        }

                                                        var buffer;
                                                        if (trackerTemplate.trackerId) {
                                                            var ws_data = '[[';
                                                            // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                                            for (var i = 0; i < trackerTags.length; i++) {
                                                                if (i != trackerTags.length - 1)
                                                                    ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                                                else
                                                                    ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                                            }
                                                            ws_data += "]";

                                                            // console.log(new Buffer(buffer).toString("base64"));
                                                            for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                                                ws_data += ',[';
                                                                for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                                                    if (tagIndex < trackerTags.length - 1)
                                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                                                    else
                                                                        ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                                                }
                                                                ws_data += ']';
                                                            }
                                                            ws_data += ']';
                                                            // console.log(ws_data);
                                                            buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                                                        }
                                                    }
                                                    else {
                                                        for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {

                                                            for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                                                }
                                                            }

                                                            for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                                                }
                                                            }

                                                            for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                                                if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                                    mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                                    // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                                                }
                                                            }

                                                            mailbody_array.push(mailBody);
                                                            subject_array.push(subject);
                                                            smsMsg_array.push(smsMsg);
                                                            fromEmailID = result[2][0].fromEmailId;
                                                            toEmailID.push(result[0][applicantIndex].EmailId);
                                                            MobileISD.push(result[0][applicantIndex].MobileISD);
                                                            MobileNumber.push(result[0][applicantIndex].MobileNo);
                                                            mailBody = temp;
                                                            subject = temp1;
                                                            smsMsg = temp2;
                                                        }
                                                    }

                                                    for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                                        var mailOptions = {
                                                            from: fromEmailID,
                                                            to: toEmailID[receiverIndex],
                                                            subject: subject_array[receiverIndex],
                                                            html: mailbody_array[receiverIndex]
                                                        };

                                                        mailOptions.cc = [];

                                                        for (var j = 0; j < cc.length; j++) {
                                                            mailOptions.cc.push(cc[j].emailId);
                                                        }
                                                        mailOptions.bcc = [];

                                                        for (var j = 0; j < bcc.length; j++) {
                                                            mailOptions.bcc.push(bcc[j].emailId);
                                                        }

                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                        var email = new sendgrid.Email();
                                                        email.from = mailOptions.from;
                                                        email.to = mailOptions.to;
                                                        email.subject = mailOptions.subject;
                                                        email.mbody = mailOptions.html;
                                                        email.cc = mailOptions.cc;
                                                        email.bcc = mailOptions.bcc;
                                                        email.html = mailOptions.html;
                                                        //if 1 or more attachments are present
                                                        for (var file = 0; file < attachment.length; file++) {
                                                            email.addFile({
                                                                filename: attachment[file].fileName,
                                                                content: new Buffer(attachment[file].binaryFile, 'base64'),
                                                                contentType: attachment[file].fileType
                                                            });
                                                        }

                                                        if (trackerTemplate.trackerId) {
                                                            email.addFile({
                                                                filename: trackerTemplate.templateName + '.xlsx',
                                                                content: new Buffer(new Buffer(buffer).toString("base64"), 'base64'),
                                                                contentType: 'application/*'
                                                            });
                                                        }

                                                        // assign mobile no and isdMobile to send sms
                                                        isdMobile = MobileISD[receiverIndex];
                                                        mobileNo = MobileNumber[receiverIndex];
                                                        message = smsMsg_array[receiverIndex];

                                                        // to send normal sms
                                                        if (isSMS) {
                                                            if (smsFlag) {
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
                                                                        try {
                                                                            if (error) {
                                                                                console.log(error, "SMS");
                                                                            }
                                                                            else {
                                                                                console.log("SUCCESS", "SMS response");
                                                                            }
                                                                        }

                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }

                                                                    });
                                                                }
                                                                else if (isdMobile == "+91") {
                                                                    console.log('inside send sms');
                                                                    console.log(isdMobile, ' ', mobileNo);
                                                                    request({
                                                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                                                        qs: {
                                                                            user_name: 'janardana@hirecraft.com',
                                                                            password: 'Ezeid2015',
                                                                            sender_id: smsSenderId,
                                                                            service: 'TRANS',
                                                                            mobile_no: mobileNo,
                                                                            message: message,
                                                                            method: 'send_sms'
                                                                        },
                                                                        method: 'GET'

                                                                    }, function (error, response, body) {
                                                                        try {
                                                                            if (error) {
                                                                                console.log(error, "SMS");
                                                                            }
                                                                            else {
                                                                                console.log("SUCCESS", "SMS response");
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }
                                                                    });

                                                                    var req1 = http.request(options, function (res1) {
                                                                        var chunks = [];

                                                                        res1.on("data", function (chunk) {
                                                                            chunks.push(chunk);
                                                                        });

                                                                        res1.on("end", function () {
                                                                            var body = Buffer.concat(chunks);
                                                                            console.log(body.toString());
                                                                        });
                                                                    });

                                                                    req1.write(qs.stringify({
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
                                                                    req1.end();
                                                                }
                                                                else if (isdMobile != "") {
                                                                    console.log('inside without isd', isdMobile, ' ', mobileNo);
                                                                    client.messages.create(
                                                                        {
                                                                            body: message,
                                                                            to: isdMobile + mobileNo,
                                                                            from: FromNumber
                                                                        },
                                                                        function (error, response) {
                                                                            try {
                                                                                if (error) {
                                                                                    console.log(error, "SMS");
                                                                                }
                                                                                else {
                                                                                    console.log("SUCCESS", "SMS response");
                                                                                }
                                                                            }
                                                                            catch (ex) {
                                                                                error_logger.error = ex;
                                                                                logger(req, error_logger);
                                                                                res.status(500).json(error_response);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        }

                                                        if (isSendgrid) {
                                                            sendgrid.send(email, function (err, result) {
                                                                if (!err) {

                                                                    var saveMails = [
                                                                        req.st.db.escape(req.query.token),
                                                                        req.st.db.escape(req.query.heMasterId),
                                                                        req.st.db.escape(req.body.heDepartmentId),
                                                                        req.st.db.escape(userId),
                                                                        req.st.db.escape(mailerType),
                                                                        req.st.db.escape(mailOptions.from),
                                                                        req.st.db.escape(mailOptions.to),
                                                                        req.st.db.escape(mailOptions.subject),
                                                                        req.st.db.escape(mailOptions.html),    // contains mail body
                                                                        req.st.db.escape(JSON.stringify(cc)),
                                                                        req.st.db.escape(JSON.stringify(bcc)),
                                                                        req.st.db.escape(JSON.stringify(attachment)),
                                                                        req.st.db.escape(req.body.replyMailId),
                                                                        req.st.db.escape(req.body.priority),
                                                                        req.st.db.escape(req.body.stageId),
                                                                        req.st.db.escape(req.body.statusId),
                                                                        req.st.db.escape(message),    // sms message
                                                                        req.st.db.escape(whatmateMessage),
                                                                        req.st.db.escape(recipients[0]),
                                                                        req.st.db.escape(JSON.stringify(transactions ? transactions : [])),
                                                                        req.st.db.escape(req.body.interviewerFlag || 0)
                                                                    ];

                                                                    //saving the mail after sending it
                                                                    var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                                    console.log(saveMailHistory);
                                                                    req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                                        try {
                                                                            console.log(mailHistoryErr);
                                                                            // console.log(mailHistoryResult);
                                                                            if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                                                console.log('sent mails saved successfully');
                                                                            }
                                                                            else {
                                                                                console.log('mails could not be saved');
                                                                            }
                                                                        }
                                                                        catch (ex) {
                                                                            error_logger.error = ex;
                                                                            logger(req, error_logger);
                                                                            res.status(500).json(error_response);
                                                                        }
                                                                    });
                                                                    console.log('Mail sent now save sent history');
                                                                } //end of if(sendgrid sent mail successfully)
                                                                //if mail is not sent
                                                                else {
                                                                    console.log('Mail not Sent Successfully' + err);
                                                                }
                                                            });
                                                        }
                                                    }

                                                    if (!(templateId == 0 || overWrite)) {
                                                        response.status = true;

                                                        if (isSendgrid && isSMS) {  // making changes here reminder
                                                            if (subject != '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "Mail and SMS sent successfully";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                                else {
                                                                    response.message = "Mail sent successfully";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                            }

                                                            else if (subject == '') {
                                                                if (smsMsg != '' && smsFlag) {
                                                                    response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                                else {
                                                                    response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                                                    response.data = {
                                                                        transactions: transactions[0] ? transactions[0] : [],
                                                                        reqAppList: result[4] ? result[4] : []
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else if (isSendgrid && !isSMS) {

                                                            if (subject != '') {
                                                                response.message = "Mail sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else if (subject == '') {
                                                                response.message = "Mail subject is empty, mail cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else if (isSMS && !isSendgrid) {
                                                            if (smsMsg != '' && smsFlag) {
                                                                response.message = "SMS sent successfully";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else if (smsMsg == '' && smsFlag) {
                                                                response.message = "SMS field is empty, SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                            else {
                                                                response.message = "SMS flag is not enabled, SMS cannot be sent";
                                                                response.data = {
                                                                    transactions: transactions[0] ? transactions[0] : [],
                                                                    reqAppList: result[4] ? result[4] : []
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                                            response.data = {
                                                                transactions: [],
                                                                reqAppList: []
                                                            }
                                                        }

                                                        response.error = null;
                                                        res.status(200).json(response);
                                                    }
                                                }

                                                else {
                                                    response.status = false;
                                                    response.message = "Error while sending mail";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                    return;
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                    // else if(!templateId && !overWrite){
                                    //     response.status = false;
                                    //     response.message = "To mail is empty. Mail not sent";
                                    //     response.error = null;
                                    //     response.data = null;
                                    //     res.status(200).json(response);
                                    //     return;
                                    // }

                                    else if (templateId && !overWrite && !emailReceivers.length) {
                                        response.status = false;
                                        response.message = "To mail is empty. Mail not sent. TemplateId exists but no overWrite Flag";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);

                                    }
                                    // else {
                                    //     response.status = true;
                                    //     response.message = "Something went wrong";
                                    //     res.status(200).json(response);

                                    // }
                                    console.log("last if", templateId, overWrite);
                                    //save it as a template if flag is true or template id is 0
                                    if (templateId == 0 || overWrite) {
                                        req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                                        req.body.type = req.body.type ? req.body.type : 0;
                                        req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                                        req.body.subject = req.body.subject ? req.body.subject : '';
                                        req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                                        req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                                        req.body.priority = req.body.priority ? req.body.priority : 0;
                                        req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                                        req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                                        var templateInputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(templateId),
                                            req.st.db.escape(req.query.heMasterId),
                                            req.st.db.escape(req.body.templateName),
                                            req.st.db.escape(req.body.type),
                                            req.st.db.escape(JSON.stringify(toMail)),
                                            req.st.db.escape(JSON.stringify(cc)),
                                            req.st.db.escape(JSON.stringify(bcc)),
                                            req.st.db.escape(req.body.subject),
                                            req.st.db.escape(req.body.mailBody),
                                            req.st.db.escape(req.body.replymailId),
                                            req.st.db.escape(req.body.priority),
                                            req.st.db.escape(req.body.updateFlag),
                                            req.st.db.escape(smsMsg),
                                            req.st.db.escape(whatmateMessage),
                                            req.st.db.escape(JSON.stringify(attachment)),
                                            req.st.db.escape(JSON.stringify(tags)),
                                            req.st.db.escape(JSON.stringify(stage)),
                                            req.st.db.escape(req.body.mailerType),
                                            req.st.db.escape(JSON.stringify(tableTags)),
                                            req.st.db.escape(req.body.smsFlag || 0),
                                            req.st.db.escape(req.body.attachJD || 0),
                                            req.st.db.escape(req.body.attachResume || 0),
                                            req.st.db.escape(req.body.interviewerFlag || 0),
                                            req.st.db.escape(req.body.resumeFileName || ''),
                                            req.st.db.escape(req.body.attachResumeFlag || 0),
                                            req.st.db.escape(JSON.stringify(trackerTemplate)),
                                            req.st.db.escape(req.body.isSingleMail || 0)
                                        ];
                                        var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                                        console.log(saveTemplateQuery);
                                        req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                                            try {
                                                console.log(tempSaveErr);
                                                if (!tempSaveErr && tempSaveResult) {
                                                    // console.log(tempSaveResult);
                                                    response.status = true;
                                                    //check if there are any receivers, if yes sent and saved
                                                    if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                                                        if (isSendgrid && isSMS) {
                                                            response.message = "Mail and SMS Sent and Template Saved successfully";
                                                        }
                                                        else if (!isSendgrid && isSMS) {
                                                            response.message = "SMS is Sent and Template Saved successfully";
                                                        }
                                                        else if (isSendgrid && !isSMS) {
                                                            response.message = "Mail is Sent and Template Saved successfully";
                                                        }
                                                        else {
                                                            response.message = "Template saved successfully";
                                                        }
                                                    }
                                                    //else saved
                                                    else {
                                                        response.message = "Template saved successfully";
                                                    }
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                }

                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    //end of if(token validation)
                    //else invalid token
                    else {
                        res.status(401).json(response);
                    }
                    //end of else (token validation)

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


sendgridCtrl.saveMailSentByGmail = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'sendgridCtrl.ScreeningMailerPreview'
    }

    try {
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var validationFlag = true;

        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid tenant';
            validationFlag *= false;
        }

        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }




        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the error';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                //request parameters
                                var tags = req.body.tags || {};
                                var cc = req.body.cc || [];
                                var toMail = req.body.toMail || [];
                                var bcc = req.body.bcc || [];
                                var stage = req.body.stage || [];
                                var attachment = req.body.attachment || [];
                                var reqApplicants = req.body.reqApplicants || [];
                                var applicants = req.body.applicantId || [];
                                var client = req.body.clientId || [];
                                var tableTags = req.body.tableTags || {};
                                var clientContacts = req.body.clientContacts || [];
                                var subject = req.body.subject || '';
                                var mailBody = req.body.mailBody || '';

                                var whatmateMessage = req.body.whatmateMessage || '';
                                var smsMsg = req.body.smsMsg || '';
                                var smsFlag = req.body.smsFlag || 0;

                                var isWeb = req.query.isWeb || 0;
                                var mailerType = req.body.mailerType || 0;
                                var userId = req.query.userId || 0;

                                var receipients = [];
                                //html styling for table in submission mailer

                                if (typeof (tags) == "string") {
                                    tags = JSON.parse(tags);
                                }

                                if (typeof (cc) == "string") {
                                    cc = JSON.parse(cc);
                                }

                                if (typeof (toMail) == "string") {
                                    toMail = JSON.parse(toMail);
                                }

                                if (typeof (bcc) == "string") {
                                    bcc = JSON.parse(bcc);
                                }

                                if (typeof (stage) == "string") {
                                    stage = JSON.parse(stage);
                                }

                                if (typeof (attachment) == "string") {
                                    attachment = JSON.parse(attachment);
                                }

                                if (typeof (client) == "string") {
                                    client = JSON.parse(client);
                                }

                                if (typeof (clientContacts) == "string") {
                                    clientContacts = JSON.parse(clientContacts);
                                }

                                if (typeof (tableTags) == "string") {
                                    tableTags = JSON.parse(tableTags);
                                }

                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }

                                if (mailerType == 1) {   //screening
                                    receipients = reqApplicants;
                                }
                                else if (mailerType == 2) {  // submission
                                    receipients = clientContacts;
                                }
                                else if (mailerType == 3) {  // // jobseeker
                                    receipients = applicants;
                                }
                                else if (mailerType == 4) {   // client
                                    receipients = clientContacts;
                                }
                                else if (mailerType == 5) {   //interview
                                    receipients = clientContacts;
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.templateId = req.body.templateId ? req.body.templateId : 0;

                                    if(typeof(req.body.toMailId) == 'object'){
                                        req.body.toMailId = JSON.stringify(req.body.toMailId);
                                    }

                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(req.body.heDepartmentId || 0),
                                        req.st.db.escape(mailerType),
                                        req.st.db.escape(req.body.fromMailId),
                                        req.st.db.escape(req.body.toMailId),
                                        req.st.db.escape(req.body.subject),
                                        req.st.db.escape(req.body.html),    // contains mail body
                                        req.st.db.escape(JSON.stringify(cc)),
                                        req.st.db.escape(JSON.stringify(bcc)),
                                        req.st.db.escape(JSON.stringify(attachment)),
                                        req.st.db.escape(req.body.replyMailId),
                                        req.st.db.escape(req.body.priority),
                                        req.st.db.escape(smsMsg),    // sms message
                                        req.st.db.escape(whatmateMessage),
                                        req.st.db.escape(JSON.stringify(receipients)),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(req.body.interviewerFlag || 0),
                                        req.st.db.escape(req.body.threadId || "")
                                    ];

                                    var procQuery = 'CALL wm_save_sentByGMailerHistory( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);

                                            if (!err && result && result[0][0]) {
                                                response.status = true;
                                                response.message = "mails saved sucessfully";
                                                response.error = null;
                                                response.data = result[0][0];
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while saving mails";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });



                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};



sendgridCtrl.MobileScreeningMailerPreview = function (req, res, next) {

    // var mailBody = req.body.mailBody ? req.body.mailBody : '';
    // var subject = req.body.subject ? req.body.subject : '';
    // var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 0;
    var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
    var tags = [];
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    // var tags = req.body.tags;
    // if (typeof (tags) == "string") {
    //     tags = JSON.parse(tags);
    // }
    // if (!tags) {
    //     tags = [];
    // }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var validationFlag = true;
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                console.log(req.body);

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(sendMailFlag),
                    req.st.db.escape(JSON.stringify(req.body.template || {}))
                ];
                var idArray;
                idArray = reqApplicants;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array = [];

                var procQuery;
                procQuery = 'CALL wm_get_mobileScreeningMailerPreview( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {

                        var mailBody = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                        var subject = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                        var smsMsg = result[2] && result[2][0] && result[2][0].smsMsg ? result[2][0].smsMsg : "";

                        var temp = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                        var temp1 = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                        var temp2 = result[2] && result[2][0] && result[2][0].smsMsg ? result[2][0].smsMsg : "";
                        var applicantData = [];
                        var JDAttachment = [];
                        var tags = result[2] && result[2][0] ? JSON.parse(result[2][0].tags) : {};

                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                            // console.log('applicantIndex=', applicantIndex);

                            for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                    mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                }
                            }

                            for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                    mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                }
                            }

                            applicantData.push(result[0][applicantIndex].EmailId);
                            JDAttachment.push(result[0][applicantIndex].JDAttachment);
                            mailbody_array.push(mailBody);
                            subject_array.push(subject);
                            smsMsg_array.push(smsMsg);
                            mailBody = temp;
                            subject = temp1;
                            smsMsg = temp2;
                        }

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            applicantData: applicantData,
                            JDAttachment: JDAttachment
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: [],
                            applicantData: [],
                            JDAttachment: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while replacing tags";
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


sendgridCtrl.SendMobileScreeningMailerPreview = function (req, res, next) {

    // var mailBody = req.body.mailBody ? req.body.mailBody : '';
    // var subject = req.body.subject ? req.body.subject : '';
    // var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 1;
    var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
    var tags = [];
    var cc = req.body.cc || [];
    var bcc = req.body.bcc || [];
    var userId = req.query.userId || 0;
    var mailerType = 1;
    var emailReceivers;                //emailReceivers to store the recipients
    var fromEmailID;
    var toEmailID = [];
    var JDAttachment = [];
    var MobileISD = [];
    var MobileNumber = [];
    var isdMobile = '';
    var mobileNo = '';
    var message = '';
    var whatmateMessage = req.body.whatmateMessage || "";
    var isSendgrid = 1;
    var isSMS = 0;
    var smsFlag = 0;
    var attachment = req.body.attachment || [];
    var transactions = [];

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    // var tags = req.body.tags;
    // if (typeof (tags) == "string") {
    //     tags = JSON.parse(tags);
    // }
    // if (!tags) {
    //     tags = [];
    // }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var validationFlag = true;
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

                    console.log(req.body);

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(reqApplicants)),
                        req.st.db.escape(sendMailFlag),
                        req.st.db.escape(JSON.stringify(req.body.template || {}))
                    ];
                    var idArray;
                    idArray = reqApplicants;
                    // idArray.sort(function(a,b){return a-b});
                    var mailbody_array = [];
                    var subject_array = [];
                    var smsMsg_array = [];

                    var procQuery;
                    procQuery = 'CALL wm_get_mobileScreeningMailerPreview( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        console.log(result);
                        if (!err && result && result[0] && result[0][0]) {

                            var mailBody = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                            var subject = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                            var smsMsg = result[2] && result[2][0] && result[2][0].smsMsg ? result[2][0].smsMsg : "";

                            var temp = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                            var temp1 = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                            var temp2 = result[2] && result[2][0] && result[2][0].smsMsg ? result[2][0].smsMsg : "";
                            var applicantData = [];
                            var JDAttachment = [];
                            var tags = result[2] && result[2][0] ? JSON.parse(result[2][0].tags) : {};

                            if (subject != '') {

                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                    // console.log('applicantIndex=', applicantIndex);

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }

                                    applicantData.push(result[0][applicantIndex].EmailId);
                                    JDAttachment.push(result[0][applicantIndex].JDAttachment);
                                    mailbody_array.push(mailBody);
                                    subject_array.push(subject);
                                    smsMsg_array.push(smsMsg);
                                    toEmailID.push(result[0][applicantIndex].EmailId);
                                    MobileISD.push(result[0][applicantIndex].MobileISD);
                                    MobileNumber.push(result[0][applicantIndex].MobileNo);

                                    mailBody = temp;
                                    subject = temp1;
                                    smsMsg = temp2;
                                }
                                console.log("toEmailID", toEmailID);
                                for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                    var mailOptions = {
                                        from: result[1][0] ? result[1][0].fromEmailId : "noreply@talentmicro.com",
                                        to: toEmailID[receiverIndex],
                                        subject: subject_array[receiverIndex],
                                        html: mailbody_array[receiverIndex]
                                    };

                                    mailOptions.cc = [];
                                    console.log(cc, bcc);

                                    for (var j = 0; j < cc.length; j++) {
                                        mailOptions.cc.push(cc[j].emailId);   //
                                    }
                                    mailOptions.bcc = [];

                                    for (var j = 0; j < bcc.length; j++) {
                                        mailOptions.bcc.push(bcc[j].emailId);   //.emailId acepting array of strings
                                    }

                                    console.log(mailOptions.bcc, mailOptions.cc);
                                    var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                    var email = new sendgrid.Email();
                                    email.from = mailOptions.from;
                                    email.to = mailOptions.to;
                                    email.subject = mailOptions.subject;
                                    email.mbody = mailOptions.html;
                                    email.cc = mailOptions.cc;
                                    email.bcc = mailOptions.bcc;
                                    email.html = mailOptions.html;
                                    //if 1 or more attachments are present
                                    for (var file = 0; file < attachment.length; file++) {
                                        email.addFile({
                                            filename: attachment[file].fileName,
                                            content: new Buffer(attachment[file].binaryFile, 'base64'),
                                            contentType: attachment[file].fileType
                                        });
                                    }

                                    // assign mobile no and isdMobile to send sms
                                    isdMobile = MobileISD[receiverIndex];
                                    mobileNo = MobileNumber[receiverIndex];
                                    message = smsMsg_array[receiverIndex];

                                    // to send normal sms
                                    if (isSMS) {
                                        if (smsFlag) {
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
                                                console.log('inside send sms');
                                                console.log(isdMobile, ' ', mobileNo);
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

                                                var req1 = http.request(options, function (res1) {
                                                    var chunks = [];

                                                    res1.on("data", function (chunk) {
                                                        chunks.push(chunk);
                                                    });

                                                    res1.on("end", function () {
                                                        var body = Buffer.concat(chunks);
                                                        console.log(body.toString());
                                                    });
                                                });

                                                req1.write(qs.stringify({
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
                                                req1.end();
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
                                        }
                                    }


                                    if (isSendgrid && email.subject != '') {
                                        sendgrid.send(email, function (err, sendGridResult) {
                                            if (!err) {

                                                var saveMails = [
                                                    req.st.db.escape(req.query.token),
                                                    req.st.db.escape(req.query.heMasterId || 0),
                                                    req.st.db.escape(req.body.heDepartmentId || 0),
                                                    req.st.db.escape(userId || 0),
                                                    req.st.db.escape(mailerType || 1),
                                                    req.st.db.escape(mailOptions.from),
                                                    req.st.db.escape(mailOptions.to || ""),
                                                    req.st.db.escape(mailOptions.subject),
                                                    req.st.db.escape(mailOptions.html),    // contains mail body
                                                    req.st.db.escape(JSON.stringify(cc)),
                                                    req.st.db.escape(JSON.stringify(bcc)),
                                                    req.st.db.escape(JSON.stringify(attachment)),
                                                    req.st.db.escape(req.body.replyMailId || ""),
                                                    req.st.db.escape(req.body.priority || 1),
                                                    req.st.db.escape(req.body.stageId || 0),
                                                    req.st.db.escape(req.body.statusId || 0),
                                                    req.st.db.escape(message || ""),    // sms message
                                                    req.st.db.escape(whatmateMessage || ""),
                                                    req.st.db.escape(reqApplicants[0]),
                                                    req.st.db.escape(JSON.stringify(transactions ? transactions : []))
                                                ];

                                                //saving the mail after sending it
                                                var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                                console.log(saveMailHistory);
                                                req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                    console.log("error of save mail", mailHistoryErr);
                                                    console.log("result of mail save", mailHistoryResult[0]);
                                                    if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                        console.log('Sent mails saved successfully');
                                                    }
                                                    else {
                                                        console.log('Mails could not be saved');
                                                    }
                                                });
                                                console.log('Mail sent now save sent history');
                                            } //end of if(sendgrid sent mail successfully)
                                            //if mail is not sent
                                            else {
                                                console.log('Mail not Sent Successfully' + err);
                                            }
                                        });
                                    }

                                }
                            }

                            response.status = true;
                            if (subject != '')
                                response.message = "Mail sent and saved successfully";
                            else
                                response.message = "Mail Subject is empty. Mail Not Sent";

                            response.error = null;
                            response.data = {};
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = false;
                            response.message = "No result found";
                            response.error = null;
                            response.data = {};
                            res.status(200).json(response);
                        }

                        else {
                            response.status = false;
                            response.message = "Error while sending mails";
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
        catch (ex) {
            console.log(ex);
            response.status = false;
            response.message = "Server error";
            res.status(500).json(response);
        }

    }
};


sendgridCtrl.MobileSubmissionMailerPreview = function (req, res, next) {

    // var mailBody = req.body.mailBody ? req.body.mailBody : '';
    // var subject = req.body.subject ? req.body.subject : '';
    // var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 0;
    var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
    var tags = [];
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    // var tags = req.body.tags;
    // if (typeof (tags) == "string") {
    //     tags = JSON.parse(tags);
    // }
    // if (!tags) {
    //     tags = [];
    // }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var clientContacts = req.body.clientContacts;
    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
        // clientContacts.sort(function(a,b){return a-b});
    }
    if (!clientContacts) {
        clientContacts = [];
    }

    var validationFlag = true;
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                console.log(req.body);

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(JSON.stringify(clientContacts)),
                    req.st.db.escape(sendMailFlag),
                    req.st.db.escape(JSON.stringify(req.body.template || {})),
                    req.st.db.escape(JSON.stringify(req.body.trackerTemplate || {}))
                ];
                var idArray;
                idArray = reqApplicants;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array = [];
                var resumeFileNameArray = [];

                var procQuery;
                procQuery = 'CALL wm_paceSubmissionMailerMobile( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {

                        var mailBody = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                        var subject = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                        var smsMsg = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";

                        var temp = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                        var temp1 = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                        var temp2 = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";
                        var resumeFileName = result[3] && result[3][0] && result[3][0].resumeFileName ? result[3][0].resumeFileName : "";
                        var tableTags = result[3] && result[3][0] && result[3][0].tableTags ? JSON.parse(result[3][0].tableTags) : [];

                        var applicantData = [];
                        var JDAttachment = [];
                        var tags = result[3] && result[3][0] ? JSON.parse(result[3][0].tags) : {};


                        for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                var tempFileName = resumeFileName;

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        tempFileName = tempFileName.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        tempFileName = tempFileName.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] != null && result[0][applicantIndex][tags.client[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.client[tagIndex].tagName] != '') || result[0][applicantIndex][tags.client[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                        tempFileName = tempFileName.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                    }
                                }
                                resumeFileNameArray.push(tempFileName);
                            }
                            for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                    mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                    subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                    smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                }
                            }

                            if (tableTags.applicant.length > 0) {
                                var position = mailBody.indexOf('@table');
                                var tableContent = '';
                                mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                console.log(tableContent, 'mailbody');
                                for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                }
                                tableContent += "</tr>";
                                for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                    tableContent += "<tr>";
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                    }
                                    tableContent += "</tr>";
                                }

                                tableContent += "</table>";
                                mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                            }
                            // clientData.push(result[1][clientIndex].EmailId);
                            mailbody_array.push(mailBody);
                            subject_array.push(subject);
                            smsMsg_array.push(smsMsg);
                            mailBody = temp;
                            subject = temp1;
                            smsMsg = temp2;
                        }

                        var originalCVArray = [];
                        var clientCVArray = [];
                        if (idArray.length == result[0].length) {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                originalCVArray.push(result[0][applicantIndex].originalCVPath);
                                clientCVArray.push(result[0][applicantIndex].clientCVPath);
                            }
                        }


                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            resumeFileNameArray: resumeFileNameArray,
                            originalResumeArray: originalCVArray,
                            duplicateResumeArray: clientCVArray,

                            // applicantData: applicantData,
                            // JDAttachment: JDAttachment
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: [],
                            resumeFileNameArray: [],
                            originalResumeArray: originalCVArray,
                            duplicateResumeArray: clientCVArray
                            // applicantData: [],
                            // JDAttachment: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while replacing tags";
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


sendgridCtrl.sendSubmissionMailerMobile = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var sendMailFlag = 1;
    var isSendgrid = 1;
    var isSMS = 0;

    console.log("req.body", req.body);
    var emailReceivers;                //emailReceivers to store the recipients
    var mailbody_array = [];    //array to store all mailbody after replacing tags
    var subject_array = [];
    var smsMsg_array = [];
    var transactions = [];

    var emailId = [];
    var validationFlag = true;
    var fromEmailID;
    var toEmailID = [];
    var MobileISD = [];
    var MobileNumber = [];
    var isdMobile = '';
    var mobileNo = '';
    var message = '';
    //request parameters
    // var updateFlag = req.body.updateFlag || 0;
    // var overWrite = req.body.overWrite || 0;
    // var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
    // var templateId = req.body.template ? req.body.template.templateId : undefined;
    // var trackerTemplate = req.body.trackerTemplate;
    var tags = req.body.tags || {};
    var cc = req.body.cc || [];
    // var toMail = req.body.toMail || [];
    var bcc = req.body.bcc || [];
    var stage = req.body.stage || [];

    var attachment = req.body.attachment || [];
    var reqApplicants = req.body.reqApplicants || [];
    var clientContacts = req.body.clientContacts || [];

    // var attachResume = req.body.attachResume || 0;  // 1-original resume ,2 - client resume
    var whatmateMessage = req.body.whatmateMessage || '';
    var smsFlag = req.body.smsFlag || 0;

    var isWeb = req.query.isWeb || 0;
    var mailerType = req.body.mailerType || 2;
    var userId = req.query.userId || 0;

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid tenant';
        validationFlag *= false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (typeof (trackerTemplate) == "string") {
    //     trackerTemplate = JSON.parse(trackerTemplate);
    // }
    // if (!trackerTemplate) {
    //     trackerTemplate = {};
    //     trackerTags = [];
    // }
    // else {
    //     trackerTags = JSON.parse(trackerTemplate.trackerTags);
    // }

    if (typeof (tags) == "string") {
        tags = JSON.parse(tags);
    }

    if (typeof (cc) == "string") {
        cc = JSON.parse(cc);
    }

    if (typeof (bcc) == "string") {
        bcc = JSON.parse(bcc);
    }

    if (typeof (attachment) == "string") {
        attachment = JSON.parse(attachment);
    }

    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
    }
    emailReceivers = clientContacts;

    if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }

    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
        // reqApplicants.sort(function(a,b){return a-b});
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
                if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(reqApplicants)),
                        req.st.db.escape(JSON.stringify(clientContacts)),
                        req.st.db.escape(sendMailFlag),
                        req.st.db.escape(JSON.stringify(req.body.template || {})),
                        req.st.db.escape(JSON.stringify(req.body.trackerTemplate || {}))
                    ];

                    var procQuery = 'CALL wm_paceSubmissionMailerMobile( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);

                        // if (result[2] && result[2][0] && result[2][0].transactions) {
                        //     transactions = JSON.parse(result[2][0].transactions);
                        // }
                        if (!err && result && result[0] && result[0][0]) {

                            // if (result[4] && result[4][0]) {
                            //     isSendgrid = result[4][0].isSendgrid ? result[4][0].isSendgrid : 0,
                            //         isSMS = result[4][0].isSMS ? result[4][0].isSMS : 0
                            // }
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;

                            var mailBody = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                            var subject = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                            var smsMsg = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";

                            var temp = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                            var temp1 = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                            var temp2 = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";

                            // var tempFileName = result[3] && result[3][0] && result[3][0].resumeFileName ? result[3][0].resumeFileName : "";;                            
                            // var resumeFileName = result[3] && result[3][0] && result[3][0].resumeFileName ? result[3][0].resumeFileName : "";
                            var applicantData = [];
                            var JDAttachment = [];
                            var tags = result[3] && result[3][0] ? JSON.parse(result[3][0].tags) : {};
                            var tableTags = result[3] && result[3][0] ? JSON.parse(result[3][0].tableTags) : {};
                            var trackerId = result[5] && result[5][0] && result[5][0].trackerId ? result[5][0].trackerId : 0;
                            var trackerTags = result[5] && result[5][0] && result[5][0].trackerTags ? JSON.parse(result[5][0].trackerTags) : [];
                            var generatedFileName = result[5] && result[5][0] && result[5][0].generatedFileName ? result[5][0].generatedFileName : "";

                            var templateName = result[5] && result[5][0] && result[5][0].templateName ? result[5][0].templateName : "";


                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {


                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // tempFileName = tempFileName.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // tempFileName = tempFileName.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] != null && result[0][applicantIndex][tags.client[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.client[tagIndex].tagName] != '') || result[0][applicantIndex][tags.client[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                            // tempFileName = replaceAll(tempFileName, '[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                        }
                                    }
                                    //  resumeFileNameArray.push(tempFileName);

                                }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                    if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                    }
                                }

                                if (tableTags.applicant.length > 0) {
                                    var position = mailBody.indexOf('@table');
                                    var tableContent = '';
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    console.log(tableContent, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                    }
                                    tableContent += "</tr>";
                                    for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                        tableContent += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                            tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                        }
                                        tableContent += "</tr>";
                                    }

                                    tableContent += "</table>";
                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                }
                                // clientData.push(result[1][clientIndex].EmailId);
                                mailbody_array.push(mailBody);
                                subject_array.push(subject);
                                smsMsg_array.push(smsMsg);

                                fromEmailID = result[2][0].fromEmailId;
                                toEmailID.push(result[1][clientIndex].EmailId);
                                MobileISD.push(result[1][clientIndex].MobileISD);
                                MobileNumber.push(result[1][clientIndex].MobileNo);
                                mailBody = temp;
                                subject = temp1;
                                smsMsg = temp2;
                            }

                            var buffer;
                            if (trackerId) {
                                console.log('tracker', trackerId);
                                var ws_data = '[[';
                                // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                for (var i = 0; i < trackerTags.length; i++) {
                                    if (i != trackerTags.length - 1)
                                        ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                    else
                                        ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                }
                                ws_data += "]";

                                // console.log(new Buffer(buffer).toString("base64"));
                                for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                    ws_data += ',[';
                                    for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                        if (tagIndex < trackerTags.length - 1)
                                            ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                        else
                                            ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                    }
                                    ws_data += ']';
                                }
                                ws_data += ']';
                                console.log(ws_data);
                                buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                            }

                            for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                var mailOptions = {
                                    from: fromEmailID,
                                    to: toEmailID[receiverIndex],
                                    subject: subject_array[receiverIndex],
                                    html: mailbody_array[receiverIndex]
                                };

                                mailOptions.cc = [];

                                for (var j = 0; j < cc.length; j++) {
                                    mailOptions.cc.push(cc[j].emailId);
                                }
                                mailOptions.bcc = [];

                                for (var j = 0; j < bcc.length; j++) {
                                    mailOptions.bcc.push(bcc[j].emailId);
                                }

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.mbody = mailOptions.html;
                                email.cc = mailOptions.cc;
                                email.bcc = mailOptions.bcc;
                                email.html = mailOptions.html;
                                //if 1 or more attachments are present
                                for (var file = 0; file < attachment.length; file++) {
                                    if (attachment[file].binaryFile) {
                                        email.addFile({
                                            filename: attachment[file].fileName,
                                            content: new Buffer(attachment[file].binaryFile, 'base64'),
                                            contentType: attachment[file].fileType
                                        });
                                    }
                                }

                                if (trackerId) {
                                    console.log('trackerTemplate send mail attach', trackerId);
                                    email.addFile({
                                        filename: templateName + '.xlsx',
                                        content: new Buffer(new Buffer(buffer).toString("base64"), 'base64'),
                                        contentType: 'application/*'
                                    });
                                }

                                // assign mobile no and isdMobile to send sms
                                isdMobile = MobileISD[receiverIndex];
                                mobileNo = MobileNumber[receiverIndex];
                                message = smsMsg_array[receiverIndex];

                                // to send normal sms
                                isSMS = 0;
                                if (isSMS) {
                                    if (smsFlag) {
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
                                            console.log('inside send sms');
                                            console.log(isdMobile, ' ', mobileNo);
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

                                            var req1 = http.request(options, function (res1) {
                                                var chunks = [];

                                                res1.on("data", function (chunk) {
                                                    chunks.push(chunk);
                                                });

                                                res1.on("end", function () {
                                                    var body = Buffer.concat(chunks);
                                                    console.log(body.toString());
                                                });
                                            });

                                            req1.write(qs.stringify({
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
                                            req1.end();
                                        }
                                        else if (isdMobile != "") {
                                            console.log('inside without isd', isdMobile, ' ', mobileNo);
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
                                    }
                                }

                                if (isSendgrid) {
                                    sendgrid.send(email, function (err, result) {
                                        if (!err) {

                                            var saveMails = [
                                                req.st.db.escape(req.query.token),
                                                req.st.db.escape(req.query.heMasterId),
                                                req.st.db.escape(req.body.heDepartmentId || 0),
                                                req.st.db.escape(userId),
                                                req.st.db.escape(mailerType),
                                                req.st.db.escape(mailOptions.from),
                                                req.st.db.escape(mailOptions.to),
                                                req.st.db.escape(mailOptions.subject),
                                                req.st.db.escape(mailOptions.html),    // contains mail body
                                                req.st.db.escape(JSON.stringify(cc)),
                                                req.st.db.escape(JSON.stringify(bcc)),
                                                req.st.db.escape(JSON.stringify(attachment)),
                                                req.st.db.escape(req.body.replyMailId),
                                                req.st.db.escape(req.body.priority || 0),
                                                req.st.db.escape(req.body.stageId || 0),
                                                req.st.db.escape(req.body.statusId || 0),
                                                req.st.db.escape(message),    // sms message
                                                req.st.db.escape(whatmateMessage),
                                                req.st.db.escape(clientContacts[receiverIndex]),   // submission mailer save client contactid
                                                req.st.db.escape(JSON.stringify(transactions ? transactions : []))
                                            ];

                                            //saving the mail after sending it
                                            var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                            console.log(saveMailHistory);
                                            req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                console.log(mailHistoryErr);
                                                // console.log(mailHistoryResult);
                                                if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                    console.log('sent mails saved successfully');
                                                }
                                                else {
                                                    console.log('mails could not be saved');
                                                }
                                            });
                                        } //end of if(sendgrid sent mail successfully)
                                        //if mail is not sent
                                        else {
                                            console.log('Mail not Sent Successfully' + err);
                                        }
                                    });
                                }

                            }

                            // if (!(templateId == 0 || overWrite)) {
                            response.status = true;

                            if (isSendgrid && isSMS) {  // making changes here reminder
                                if (subject != '') {
                                    if (smsMsg != '' && smsFlag) {
                                        response.message = "Mail and SMS sent successfully";
                                        response.data = null;//transactions[0] ? transactions[0] : [];
                                    }
                                    else {
                                        response.message = "Mail sent successfully";
                                        response.data = null;//transactions[0] ? transactions[0] : [];
                                    }
                                }

                                else if (subject == '') {
                                    if (smsMsg != '' && smsFlag) {
                                        response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                        response.data = null;//transactions[0] ? transactions[0] : [];
                                    }
                                    else {
                                        response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                        response.data = null;//transactions[0] ? transactions[0] : [];
                                    }
                                }
                                else {
                                    response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                    response.data = null;//transactions[0] ? transactions[0] : [];
                                }
                            }
                            else if (isSendgrid && !isSMS) {

                                if (subject != '') {
                                    response.message = "Mail sent successfully";
                                    response.data = null;//transactions[0] ? transactions[0] : [];
                                }
                                else if (subject == '') {
                                    response.message = "Mail subject is empty, mail cannot be sent";
                                    response.data = null;// transactions[0] ? transactions[0] : [];
                                }
                            }
                            else if (isSMS && !isSendgrid) {
                                if (smsMsg != '' && smsFlag) {
                                    response.message = "SMS sent successfully";
                                    response.data = null;//transactions[0] ? transactions[0] : [];
                                }
                                else if (smsMsg == '' && smsFlag) {
                                    response.message = "SMS field is empty, SMS cannot be sent";
                                    // response.data = transactions[0] ? transactions[0] : [];
                                }
                                else {
                                    response.message = "SMS flag is not enabled, SMS cannot be sent";
                                    response.data = null;//transactions[0] ? transactions[0] : [];
                                }
                            }
                            else {
                                response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                response.data = null;
                            }

                            response.error = null;
                            res.status(200).json(response);
                            // }
                        }

                        else {
                            response.status = false;
                            response.message = "Error while sending mail";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                            // return;
                        }
                    });
                }
                // else if(!templateId && !overWrite){
                //     response.status = false;
                //     response.message = "To mail is empty. Mail not sent";
                //     response.error = null;
                //     response.data = null;
                //     res.status(200).json(response);
                //     return;
                // }

                else if (!emailReceivers.length) {
                    response.status = false;
                    response.message = "Please select recipients";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                    return;
                }
                //save it as a template if flag is true or template id is 0
                // if (templateId == 0 || overWrite) {
                //     req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                //     req.body.type = req.body.type ? req.body.type : 0;
                //     req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                //     req.body.subject = req.body.subject ? req.body.subject : '';
                //     req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                //     req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                //     req.body.priority = req.body.priority ? req.body.priority : 0;
                //     req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                //     req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                //     var templateInputs = [
                //         req.st.db.escape(req.query.token),
                //         req.st.db.escape(templateId),
                //         req.st.db.escape(req.query.heMasterId),
                //         req.st.db.escape(req.body.templateName),
                //         req.st.db.escape(req.body.type),
                //         req.st.db.escape(JSON.stringify(toMail)),
                //         req.st.db.escape(JSON.stringify(cc)),
                //         req.st.db.escape(JSON.stringify(bcc)),
                //         req.st.db.escape(req.body.subject),
                //         req.st.db.escape(req.body.mailBody),
                //         req.st.db.escape(req.body.replymailId),
                //         req.st.db.escape(req.body.priority),
                //         req.st.db.escape(req.body.updateFlag),
                //         req.st.db.escape(smsMsg),
                //         req.st.db.escape(whatmateMessage),
                //         req.st.db.escape(JSON.stringify(attachment)),
                //         req.st.db.escape(JSON.stringify(tags)),
                //         req.st.db.escape(JSON.stringify(stage)),
                //         req.st.db.escape(req.body.mailerType),
                //         req.st.db.escape(JSON.stringify(tableTags)),
                //         req.st.db.escape(req.body.smsFlag || 0),
                //         req.st.db.escape(req.body.attachJD || 0),
                //         req.st.db.escape(req.body.attachResume || 0),
                //         req.st.db.escape(req.body.interviewerFlag || 0),
                //         req.st.db.escape(req.body.resumeFileName || '')
                //     ];
                //     var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                //     console.log(saveTemplateQuery);
                //     req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                //         if (!tempSaveErr && tempSaveResult) {
                //             console.log(tempSaveErr);
                //             console.log(tempSaveResult);
                //             response.status = true;
                //             //check if there are any receivers, if yes sent and saved
                //             if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                //                 if (isSendgrid && isSMS) {
                //                     response.message = "Mail and SMS Sent and Template Saved successfully";
                //                 }
                //                 else if (!isSendgrid && isSMS) {
                //                     response.message = "SMS is Sent and Template Saved successfully";
                //                 }
                //                 else if (isSendgrid && !isSMS) {
                //                     response.message = "Mail is Sent and Template Saved successfully";
                //                 }
                //                 else {
                //                     response.message = "Template saved successfully";
                //                 }
                //             }
                //             //else saved
                //             else {
                //                 response.message = "Template saved successfully";
                //             }
                //             response.error = null;
                //             response.data = null;
                //             res.status(200).json(response);
                //         }
                //     });
                // }
            }
            //end of if(token validation)
            //else invalid token
            else {
                res.status(401).json(response);
            }
            //end of else (token validation)
        });
    }
};

sendgridCtrl.interviewMailerPreviewForMobile = function (req, res, next) {

    var sendMailFlag = 0;
    var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
    var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }


    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var clientContacts = req.body.clientContacts;
    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
        // clientContacts.sort(function(a,b){return a-b});
    }
    if (!clientContacts) {
        clientContacts = [];
    }

    var validationFlag = true;
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
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(JSON.stringify(clientContacts)),
                    req.st.db.escape(sendMailFlag),
                    req.st.db.escape(JSON.stringify(req.body.template || {}))
                ];
                var idArray;
                idArray = reqApplicants;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array = [];

                var procQuery;
                procQuery = 'CALL wm_paceInterviewMailerForMobile( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] || result[1] || result[1][0]) {
                        var mailBody = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                        var subject = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                        var smsMsg = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";
                        var tableTags = result[3] && result[3][0] && result[3][0].tableTags ? JSON.parse(result[3][0].tableTags) : [];
                        var tags = result[3] && result[3][0] ? JSON.parse(result[3][0].tags) : {};


                        var temp = mailBody;
                        var temp1 = subject;
                        var temp2 = smsMsg;
                        var clientData = [];
                        var applicantData = [];

                        if (interviewerFlag) {
                            console.log("interviewer mailer", interviewerFlag);
                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                        }
                                    }
                                }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                    if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                    }
                                }

                                if (tableTags.applicant.length > 0) {
                                    var position = mailBody.indexOf('@table');
                                    var tableContent = '';
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    console.log(tableContent, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                    }
                                    tableContent += "</tr>";
                                    for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                        tableContent += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                            tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                        }
                                        tableContent += "</tr>";
                                    }

                                    tableContent += "</table>";
                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                }

                                clientData.push(result[1][clientIndex].EmailId);
                                mailbody_array.push(mailBody);
                                subject_array.push(subject);
                                smsMsg_array.push(smsMsg);
                                mailBody = temp;
                                subject = temp1;
                                smsMsg = temp2;
                            }

                            // if (idArray.length == result[0].length) {
                            //     for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                            //         originalCVArray.push(result[0][applicantIndex].originalCVPath);
                            //         clientCVArray.push(result[0][applicantIndex].clientCVPath);
                            //     }
                            // }

                        }
                        else {
                            console.log('applicants interview mail', interviewerFlag);
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);


                                        subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                        mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                    }
                                }
                                applicantData.push(result[0][applicantIndex].EmailId);
                                mailbody_array.push(mailBody);
                                subject_array.push(subject);
                                smsMsg_array.push(smsMsg);
                                mailBody = temp;
                                subject = temp1;
                                smsMsg = temp2;
                            }


                        }
                        // console.log(mailbody_array);

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            // applicants: result[0],
                            // clientContacts: result[1],
                            clientData: clientData,
                            applicantData: applicantData
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            mailBodyPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: []

                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while replacing tags";
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


sendgridCtrl.sendInterviewMailerForMobile = function (req, res, next) {
    console.log("interview mailer start");
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var sendMailFlag = 1;
    var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;  // if 0 mail is for  applicants if 1- mail is for client contacts

    var isSendgrid = 1;
    var isSMS = 0;

    var emailReceivers;                //emailReceivers to store the recipients
    var mailbody_array = [];    //array to store all mailbody after replacing tags
    var subject_array = [];
    var smsMsg_array = [];

    var validationFlag = true;
    var fromEmailID;
    var toEmailID = [];
    var MobileISD = [];
    var MobileNumber = [];
    var isdMobile = '';
    var mobileNo = '';
    var message = '';
    //request parameters
    var cc = req.body.cc || [];
    var bcc = req.body.bcc || [];
    var attachment = req.body.attachment || [];
    var reqApplicants = req.body.reqApplicants || [];
    var clientContacts = req.body.clientContacts || [];

    var whatmateMessage = req.body.whatmateMessage || '';
    var smsMsg = req.body.smsMsg || '';
    var smsFlag = req.body.smsFlag || 0;

    //html styling for table in submission mailer

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid tenant';
        validationFlag *= false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }


    if (typeof (cc) == "string") {
        cc = JSON.parse(cc);
    }


    if (typeof (bcc) == "string") {
        bcc = JSON.parse(bcc);
    }

    if (typeof (attachment) == "string") {
        attachment = JSON.parse(attachment);
    }

    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
    }

    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
        // reqApplicants.sort(function(a,b){return a-b});
    }

    //check for mail type and assign the recipients
    if (interviewerFlag) {
        emailReceivers = clientContacts;
        // emailReceivers.sort(function(a,b){return a-b});
    }
    else {
        emailReceivers = reqApplicants;
        // emailReceivers.sort(function(a,b){return a-b});
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
                if (emailReceivers.length > 0) {				//for checking if the mailer is just a template

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(reqApplicants)),
                        req.st.db.escape(JSON.stringify(clientContacts)),
                        req.st.db.escape(sendMailFlag),
                        req.st.db.escape(JSON.stringify(req.body.template || {}))
                    ];

                    var procQuery = 'CALL wm_paceInterviewMailerForMobile( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);

                        // if (result[4] && result[4][0]) {
                        //     isSendgrid = result[4][0].isSendgrid ? result[4][0].isSendgrid : 0,
                        //         isSMS = result[4][0].isSMS ? result[4][0].isSMS : 0
                        // }

                        if (!err && result && result[0] || result[1]) {

                            var mailBody = result[3] && result[3][0] && result[3][0].mailBody ? result[3][0].mailBody : "";
                            var subject = result[3] && result[3][0] && result[3][0].subject && result[3][0].subject != '' ? result[3][0].subject : "(no subject)";
                            var smsMsg = result[3] && result[3][0] && result[3][0].smsMsg ? result[3][0].smsMsg : "";
                            var tableTags = result[3] && result[3][0] && result[3][0].tableTags ? JSON.parse(result[3][0].tableTags) : [];
                            var tags = result[3] && result[3][0] ? JSON.parse(result[3][0].tags) : {};


                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;

                            if (interviewerFlag) {
                                for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {
                                    for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {

                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                            if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                                mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                                // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                            }

                                        }

                                        for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                            if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                                mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                                // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                            }
                                        }

                                        for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                            if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                                mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);


                                                // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                                // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            }

                                        }
                                    }
                                    for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                        if ((result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != 'null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] != '') || result[1][clientIndex][tags.clientContacts[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                            // subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                        }
                                    }

                                    if (tableTags.applicant.length > 0) {
                                        var position = mailBody.indexOf('@table');
                                        var tableContent = '';
                                        mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                        tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                        console.log(tableContent, 'mailbody');
                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                            tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                        }
                                        tableContent += "</tr>";
                                        for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                            tableContent += "<tr>";
                                            for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                                tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                            }
                                            tableContent += "</tr>";
                                        }

                                        tableContent += "</table>";
                                        mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                    }

                                    mailbody_array.push(mailBody);
                                    subject_array.push(subject);
                                    smsMsg_array.push(smsMsg);
                                    fromEmailID = result[2][0].fromEmailId;
                                    toEmailID.push(result[1][clientIndex].EmailId);
                                    MobileISD.push(result[1][clientIndex].MobileISD);
                                    MobileNumber.push(result[1][clientIndex].MobileNo);
                                    mailBody = temp;
                                    subject = temp1;
                                    smsMsg = temp2;
                                }

                                // var buffer;
                                // if (trackerTemplate.trackerId) {
                                //     var ws_data = '[[';
                                //     // var trackerTags = JSON.parse(trackerTemplate.trackerTags);
                                //     for (var i = 0; i < trackerTags.length; i++) {
                                //         if (i != trackerTags.length - 1)
                                //             ws_data += '"' + trackerTags[i].displayTagAs + '",';
                                //         else
                                //             ws_data += '"' + trackerTags[i].displayTagAs + '"';
                                //     }
                                //     ws_data += "]";

                                //     // console.log(new Buffer(buffer).toString("base64"));
                                //     for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
                                //         ws_data += ',[';
                                //         for (var tagIndex = 0; tagIndex < trackerTags.length; tagIndex++) {
                                //             if (tagIndex < trackerTags.length - 1)
                                //                 ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '",';
                                //             else
                                //                 ws_data += '"' + result[0][applicantIndex][trackerTags[tagIndex].tagName] + '"';
                                //         }
                                //         ws_data += ']';
                                //     }
                                //     ws_data += ']';
                                //     // console.log(ws_data);
                                //     buffer = xlsx.build([{ name: "Resume", data: JSON.parse(ws_data) }]); // Returns a buffer
                                // }
                            }
                            else {
                                for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                        if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                            mailBody = replaceAll(mailBody, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            subject = replaceAll(subject, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            // smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                        }
                                    }

                                    mailbody_array.push(mailBody);
                                    subject_array.push(subject);
                                    smsMsg_array.push(smsMsg);
                                    fromEmailID = result[2][0].fromEmailId;
                                    toEmailID.push(result[0][applicantIndex].EmailId);
                                    MobileISD.push(result[0][applicantIndex].MobileISD);
                                    MobileNumber.push(result[0][applicantIndex].MobileNo);
                                    mailBody = temp;
                                    subject = temp1;
                                    smsMsg = temp2;
                                }
                            }

                            for (var receiverIndex = 0; receiverIndex < toEmailID.length; receiverIndex++) {
                                var mailOptions = {
                                    from: fromEmailID,
                                    to: toEmailID[receiverIndex],
                                    subject: subject_array[receiverIndex],
                                    html: mailbody_array[receiverIndex]
                                };

                                mailOptions.cc = [];

                                for (var j = 0; j < cc.length; j++) {
                                    mailOptions.cc.push(cc[j].emailId);
                                }
                                mailOptions.bcc = [];

                                for (var j = 0; j < bcc.length; j++) {
                                    mailOptions.bcc.push(bcc[j].emailId);
                                }

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.mbody = mailOptions.html;
                                email.cc = mailOptions.cc;
                                email.bcc = mailOptions.bcc;
                                email.html = mailOptions.html;
                                //if 1 or more attachments are present
                                for (var file = 0; file < attachment.length; file++) {
                                    email.addFile({
                                        filename: attachment[file].fileName,
                                        content: new Buffer(attachment[file].binaryFile, 'base64'),
                                        contentType: attachment[file].fileType
                                    });
                                }

                                // if (trackerTemplate.trackerId) {
                                //     email.addFile({
                                //         filename: trackerTemplate.templateName + '.xlsx',
                                //         content: new Buffer(new Buffer(buffer).toString("base64"), 'base64'),
                                //         contentType: 'application/*'
                                //     });
                                // }

                                // assign mobile no and isdMobile to send sms
                                isdMobile = MobileISD[receiverIndex];
                                mobileNo = MobileNumber[receiverIndex];
                                message = smsMsg_array[receiverIndex];

                                // to send normal sms
                                if (isSMS) {
                                    if (smsFlag) {
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
                                            console.log('inside send sms');
                                            console.log(isdMobile, ' ', mobileNo);
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

                                            var req1 = http.request(options, function (res1) {
                                                var chunks = [];

                                                res1.on("data", function (chunk) {
                                                    chunks.push(chunk);
                                                });

                                                res1.on("end", function () {
                                                    var body = Buffer.concat(chunks);
                                                    console.log(body.toString());
                                                });
                                            });

                                            req1.write(qs.stringify({
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
                                            req1.end();
                                        }
                                        else if (isdMobile != "") {
                                            console.log('inside without isd', isdMobile, ' ', mobileNo);
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
                                    }
                                }

                                if (isSendgrid) {
                                    sendgrid.send(email, function (err, result) {
                                        if (!err) {

                                            var saveMails = [
                                                req.st.db.escape(req.query.token),
                                                req.st.db.escape(req.query.heMasterId),
                                                req.st.db.escape(req.body.heDepartmentId),
                                                req.st.db.escape(req.body.userId || 0),
                                                req.st.db.escape(req.body.mailerType || 5),
                                                req.st.db.escape(mailOptions.from),
                                                req.st.db.escape(mailOptions.to),
                                                req.st.db.escape(mailOptions.subject),
                                                req.st.db.escape(mailOptions.html),    // contains mail body
                                                req.st.db.escape(JSON.stringify(cc)),
                                                req.st.db.escape(JSON.stringify(bcc)),
                                                req.st.db.escape(JSON.stringify(attachment)),
                                                req.st.db.escape(req.body.replyMailId || ""),
                                                req.st.db.escape(req.body.priority || 1),
                                                req.st.db.escape(req.body.stageId || 0),
                                                req.st.db.escape(req.body.statusId || 0),
                                                req.st.db.escape(message),    // sms message
                                                req.st.db.escape(whatmateMessage),
                                                req.st.db.escape(clientContacts[0]),
                                                req.st.db.escape(JSON.stringify(req.body.transactions ? req.body.transactions : []))
                                            ];

                                            //saving the mail after sending it
                                            var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                            console.log(saveMailHistory);
                                            req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                                console.log(mailHistoryErr);
                                                // console.log(mailHistoryResult);
                                                if (!mailHistoryErr && mailHistoryResult && mailHistoryResult[0] && mailHistoryResult[0][0]) {
                                                    console.log('sent mails saved successfully');
                                                }
                                                else {
                                                    console.log('mails could not be saved');
                                                }
                                            });
                                            console.log('Mail sent now save sent history');
                                        } //end of if(sendgrid sent mail successfully)
                                        //if mail is not sent
                                        else {
                                            console.log('Mail not Sent Successfully' + err);
                                        }
                                    });
                                }
                            }

                            // if (!(templateId == 0 || overWrite)) {

                            if (isSendgrid && isSMS) {  // making changes here reminder
                                if (subject != '') {
                                    if (smsMsg != '' && smsFlag) {
                                        response.message = "Mail and SMS sent successfully";
                                        response.data = null;
                                    }
                                    else {
                                        response.message = "Mail sent successfully";
                                        response.data = null;
                                    }
                                }

                                else if (subject == '') {
                                    if (smsMsg != '' && smsFlag) {
                                        response.message = "SMS sent successfully. Mail subject is empty, mail cannot be sent";
                                        response.data = null;
                                    }
                                    else {
                                        response.message = "Mail subject is fields empty and SMS flag is not enabled, Mail and SMS cannot be sent";
                                        response.data = null;
                                    }
                                }
                                else {
                                    response.message = "Mail subject field is empty, SMS flag is not enabled . Mail and SMS cannot be sent";
                                    response.data = null;
                                }
                            }
                            else if (isSendgrid && !isSMS) {

                                if (subject != '') {
                                    response.message = "Mail sent successfully";
                                    response.data = null;
                                }
                                else if (subject == '') {
                                    response.message = "Mail subject is empty, mail cannot be sent";
                                    response.data = null;
                                }
                            }
                            else if (isSMS && !isSendgrid) {
                                if (smsMsg != '' && smsFlag) {
                                    response.message = "SMS sent successfully";
                                    response.data = null;
                                }
                                else if (smsMsg == '' && smsFlag) {
                                    response.message = "SMS field is empty, SMS cannot be sent";
                                    response.data = null;
                                }
                                else {
                                    response.message = "SMS flag is not enabled, SMS cannot be sent";
                                    response.data = null;
                                }
                            }
                            else {
                                response.message = "Sendgrid or SMS is not configured. Please contact the admin";
                                response.data = null;
                            }
                            response.status = true;
                            response.error = null;
                            res.status(200).json(response);
                            // }
                        }

                        else {
                            response.status = false;
                            response.message = "Error while sending mail";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                            return;
                        }
                    });
                }
                // else if(!templateId && !overWrite){
                //     response.status = false;
                //     response.message = "To mail is empty. Mail not sent";
                //     response.error = null;
                //     response.data = null;
                //     res.status(200).json(response);
                //     return;
                // }

                else if (!emailReceivers.length) {
                    response.status = false;
                    response.message = "Recipients is empty.Please Check";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);

                }
                // else {
                //     response.status = true;
                //     response.message = "Something went wrong";
                //     res.status(200).json(response);

                // }
                //save it as a template if flag is true or template id is 0
                // if (templateId == 0 || overWrite) {
                //     req.body.templateName = req.body.template.templateName ? req.body.template.templateName : '';
                //     req.body.type = req.body.type ? req.body.type : 0;
                //     req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                //     req.body.subject = req.body.subject ? req.body.subject : '';
                //     req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                //     req.body.replymailId = req.body.replymailId ? req.body.replymailId : '';
                //     req.body.priority = req.body.priority ? req.body.priority : 0;
                //     req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;
                //     req.body.overWrite = req.body.overWrite ? req.body.overWrite : 0;

                //     var templateInputs = [
                //         req.st.db.escape(req.query.token),
                //         req.st.db.escape(templateId),
                //         req.st.db.escape(req.query.heMasterId),
                //         req.st.db.escape(req.body.templateName),
                //         req.st.db.escape(req.body.type),
                //         req.st.db.escape(JSON.stringify(toMail)),
                //         req.st.db.escape(JSON.stringify(cc)),
                //         req.st.db.escape(JSON.stringify(bcc)),
                //         req.st.db.escape(req.body.subject),
                //         req.st.db.escape(req.body.mailBody),
                //         req.st.db.escape(req.body.replymailId),
                //         req.st.db.escape(req.body.priority),
                //         req.st.db.escape(req.body.updateFlag),
                //         req.st.db.escape(smsMsg),
                //         req.st.db.escape(whatmateMessage),
                //         req.st.db.escape(JSON.stringify(attachment)),
                //         req.st.db.escape(JSON.stringify(tags)),
                //         req.st.db.escape(JSON.stringify(stage)),
                //         req.st.db.escape(req.body.mailerType),
                //         req.st.db.escape(JSON.stringify(tableTags)),
                //         req.st.db.escape(req.body.smsFlag || 0),
                //         req.st.db.escape(req.body.attachJD || 0),
                //         req.st.db.escape(req.body.attachResume || 0),
                //         req.st.db.escape(req.body.interviewerFlag || 0),
                //         req.st.db.escape(req.body.resumeFileName || ''),
                //         req.st.db.escape(req.body.attachResumeFlag || 0),
                //         req.st.db.escape(JSON.stringify(trackerTemplate))

                //     ];
                //     var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                //     console.log(saveTemplateQuery);
                //     req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                //         console.log(tempSaveErr);
                //         if (!tempSaveErr && tempSaveResult) {
                //             // console.log(tempSaveResult);
                //             response.status = true;
                //             //check if there are any receivers, if yes sent and saved
                //             if (emailReceivers.length != 0 && (isSendgrid || isSMS)) {
                //                 if (isSendgrid && isSMS) {
                //                     response.message = "Mail and SMS Sent and Template Saved successfully";
                //                 }
                //                 else if (!isSendgrid && isSMS) {
                //                     response.message = "SMS is Sent and Template Saved successfully";
                //                 }
                //                 else if (isSendgrid && !isSMS) {
                //                     response.message = "Mail is Sent and Template Saved successfully";
                //                 }
                //                 else {
                //                     response.message = "Template saved successfully";
                //                 }
                //             }
                //             //else saved
                //             else {
                //                 response.message = "Template saved successfully";
                //             }
                //             response.error = null;
                //             response.data = null;
                //             res.status(200).json(response);
                //         }
                //     });
                // }
            }
            //end of if(token validation)
            //else invalid token
            else {
                res.status(401).json(response);
            }
            //end of else (token validation)
        });
    }
};

sendgridCtrl.sendSMSToCandidates = function (req, res, next) {

    // var mailBody = req.body.mailBody ? req.body.mailBody : '';
    // var subject = req.body.subject ? req.body.subject : '';
    // var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 1;
    var attachJD = req.body.attachJD != undefined ? req.body.attachJD : 0;
    var tags = [];
    var cc = req.body.cc || [];
    var bcc = req.body.bcc || [];
    var userId = req.query.userId || 0;
    var mailerType = 1;
    var emailReceivers;                //emailReceivers to store the recipients
    var fromEmailID;
    var toEmailID = [];
    var JDAttachment = [];
    var MobileISD = [];
    var MobileNumber = [];
    var isdMobile = '';
    var mobileNo = '';
    var message = '';
    var whatmateMessage = req.body.whatmateMessage || "";
    var isSendgrid = 1;
    var isSMS = 0;
    var smsFlag = 0;
    var attachment = req.body.attachment || [];
    var transactions = [];

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    // var tags = req.body.tags;
    // if (typeof (tags) == "string") {
    //     tags = JSON.parse(tags);
    // }
    // if (!tags) {
    //     tags = [];
    // }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var validationFlag = true;
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

                    console.log(req.body);

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(reqApplicants)),
                        req.st.db.escape(JSON.stringify(req.body.template || {}))
                    ];
                    var idArray;
                    idArray = reqApplicants;
                    // idArray.sort(function(a,b){return a-b});
                    var mailbody_array = [];
                    var subject_array = [];
                    var smsMsg_array = [];

                    var procQuery;
                    procQuery = 'CALL pace_sendSmsForCandidates( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);

                        if (!err && result && result[0] && result[0][0] && result[0][0].MobileNumber=="" || result[0][0].MobileISD=="") {
                            response.status = true;
                            response.message = "Mobile number doesn't exist";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                            return;
                        }

                        if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                            response.status = false;
                            response.message = result[0][0]._error;
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                            return;
                        }

                        if (!err && result && result[3] && result[3][0] && result[3][0].isSMS == 0) {
                            response.status = false;
                            response.message = result[0][0].message;
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                            return;
                        }
                        // console.log(result);
                        if (!err && result && result[0] && result[0][0]) {

                            // var mailBody = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                            // var subject = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                            var smsMsg = req.body.smsMsg;

                            // var temp = result[2] && result[2][0] && result[2][0].mailBody ? result[2][0].mailBody : "";
                            // var temp1 = result[2] && result[2][0] && result[2][0].subject && result[2][0].subject != '' ? result[2][0].subject : "(no subject)";
                            var temp2 = req.body.smsMsg;
                            // var applicantData = [];
                            // var JDAttachment = [];
                            var tags = result[2] && result[2][0] ? JSON.parse(result[2][0].tags) : {};

                            // isSMS = result[3] && result[3][0] && result[3][0].isSMS ? result[3][0].isSMS : 0

                            // if (subject != '') {

                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                // console.log('applicantIndex=', applicantIndex);

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] != '') || result[0][applicantIndex][tags.applicant[tagIndex].tagName] >= 0) {

                                        smsMsg = replaceAll(smsMsg, '[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] != '') || result[0][applicantIndex][tags.requirement[tagIndex].tagName] >= 0) {

                                        smsMsg = replaceAll(smsMsg, '[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                    if ((result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName] != 'null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] != '') || result[0][applicantIndex][tags.interview[tagIndex].tagName] >= 0) {

                                        smsMsg = replaceAll(smsMsg, '[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                    }
                                }

                                // applicantData.push(result[0][applicantIndex].EmailId);
                                // JDAttachment.push(result[0][applicantIndex].JDAttachment);
                                // mailbody_array.push(mailBody);
                                // subject_array.push(subject);
                                smsMsg_array.push(smsMsg);
                                toEmailID.push(result[0][applicantIndex].EmailId);
                                MobileISD.push(result[0][applicantIndex].MobileISD);
                                MobileNumber.push(result[0][applicantIndex].MobileNo);

                                // mailBody = temp;
                                // subject = temp1;
                                smsMsg = temp2;
                            }

                            // console.log("toEmailID", toEmailID);
                            for (var receiverIndex = 0; receiverIndex < MobileNumber.length; receiverIndex++) {
                                var sentSMS = 0;
                                // assign mobile no and isdMobile to send sms
                                isdMobile = MobileISD[receiverIndex];
                                mobileNo = MobileNumber[receiverIndex];
                                message = smsMsg_array[receiverIndex];

                                // to send normal sms
                                // if (isSMS) {

                                console.log('inside send sms');
                                console.log(isdMobile, ' ', mobileNo);

                                if (isdMobile == "+91") {
                                    request({
                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                        qs: {
                                            user_name: 'janardana@hirecraft.com',
                                            password: 'Ezeid2015',
                                            sender_id: result[3][0].smsSenderId,
                                            service: 'TRANS',
                                            mobile_no: mobileNo,
                                            message: message,
                                            method: 'send_sms'
                                        },
                                        method: 'GET'

                                    }, function (error, aikonresponse, body) {
                                        if (error) {
                                            console.log(error, "SMS");
                                            response.status = false;
                                            response.message = "Failed to send sms";
                                            response.error = null;
                                            response.data = null;
                                            res.status(200).json(response);
                                            return;
                                            // var req1 = http.request(options, function (res1) {
                                            //     var chunks = [];

                                            //     res1.on("data", function (chunk) {
                                            //         chunks.push(chunk);
                                            //     });

                                            //     res1.on("end", function () {
                                            //         var body = Buffer.concat(chunks);
                                            //         console.log(body.toString());
                                            //     });
                                            // });

                                            // req1.write(qs.stringify({
                                            //     userId: 'talentmicro',
                                            //     password: 'TalentMicro@123',
                                            //     senderId: 'WTMATE',
                                            //     sendMethod: 'simpleMsg',
                                            //     msgType: 'text',
                                            //     mobile: isdMobile.replace("+", "") + mobileNo,
                                            //     msg: message,
                                            //     duplicateCheck: 'true',
                                            //     format: 'json'
                                            // }));
                                            // req1.end();
                                        }
                                        else {
                                            sentSMS = 1;
                                            console.log("SUCCESS aikon", "SMS response " + sentSMS);

                                            var inputs = [
                                                req.st.db.escape(req.query.token),
                                                req.st.db.escape(req.query.heMasterId),
                                                req.st.db.escape(mobileNo),
                                                req.st.db.escape(isdMobile),
                                                req.st.db.escape(message),
                                                req.st.db.escape(1)
                                            ];

                                            var procQuery = 'CALL pace_save_sentSmsHistory( ' + inputs.join(',') + ')';
                                            console.log(procQuery);
                                            req.db.query(procQuery, function (smserr, smsresult) {
                                                if (!smserr && smsresult && smsresult[0] && smsresult[0][0] && smsresult[0][0].errorCode) {
                                                    console.log("Continue sending sms");
                                                    console.log('receiverIndex', receiverIndex, 'MobileNumber.length', MobileNumber.length);
                                                    if (receiverIndex == MobileNumber.length) {
                                                        response.status = true;
                                                        response.message = "Sms sent successfully";
                                                        response.error = null;
                                                        response.data = null;
                                                        res.status(200).json(response);
                                                    }
                                                }
                                                else if (!smserr && smsresult && smsresult[0] && smsresult[0][0] && smsresult[0][0].errorCode == 0) {
                                                    response.status = false;
                                                    response.message = smsresult[0][0]._error;
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                    return;
                                                }

                                            });

                                        }
                                    });
                                }
                                // else if (isdMobile != "") {
                                //     client.messages.create(
                                //         {
                                //             body: message,
                                //             to: isdMobile + mobileNo,
                                //             from: FromNumber
                                //         },
                                //         function (error, response) {
                                //             if (error) {
                                //                 console.log(error, "SMS");
                                //             }
                                //             else {
                                //                 sentSMS = 1;
                                //                 console.log("SUCCESS", "SMS response");
                                //             }
                                //         }
                                //     );
                                // }

                                if (sentSMS) {
                                    var savesms = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(reqApplicants[0]),
                                        req.st.db.escape(message || ""),    // sms message
                                        req.st.db.escape(isdMobile),
                                        req.st.db.escape(MobileNumber)
                                    ];

                                    //saving the mail after sending it
                                    var saveMailHistory = 'CALL pace_save_smsHistory( ' + savesms.join(',') + ')';
                                    console.log(saveMailHistory);
                                    req.db.query(saveMailHistory, function (smserr, smsresult) {
                                        console.log("error of save mail", smserr);
                                        if (!smserr && smsresult && smsresult[0] && smsresult[0][0]) {
                                            console.log('sms sent and saved successfully');
                                        }
                                        else {
                                            console.log('Mails could not be saved');
                                        }
                                    });
                                    console.log('Mail sent now save sent history');
                                }
                                // }
                            }
                            // }


                        }

                        else if (!err) {
                            response.status = false;
                            response.message = "No result found";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }

                        else {
                            response.status = false;
                            response.message = "Error while sending mails";
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
        catch (ex) {
            console.log(ex);
            response.status = false;
            response.message = "Server error";
            res.status(500).json(response);
        }

    }
};

module.exports = sendgridCtrl;