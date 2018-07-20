
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


var sendgridCtrl = {};
var error = {};

sendgridCtrl.saveSendMail = function (req, res, next) {

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
    var subject = req.body.subject || '';
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
                                    if (!err) {
                                        //saving the mail after sending it
                                        var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                        console.log(saveMailHistory);
                                        req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                            console.log(mailHistoryErr);
                                            console.log(mailHistoryResult);
                                            if (!mailHistoryErr && mailHistoryResult) {
                                                console.log('sent mails saved successfully');
                                            }
                                            else {
                                                console.log('mails could not be saved');
                                            }
                                        });
                                        console.log('Mail sent now save sent history');
                                    }
                                    else {
                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);
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
                    req.body.SMSMessage = req.body.SMSMessage ? req.body.SMSMessage : '';
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
                        req.st.db.escape(req.body.SMSMessage),
                        req.st.db.escape(req.body.whatmateMessage),
                        req.st.db.escape(JSON.stringify(attachment)),
                        req.st.db.escape(JSON.stringify(tags)),
                        req.st.db.escape(JSON.stringify(stage)),
                        req.st.db.escape(req.body.mailerType),
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
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
                    });
                }
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


sendgridCtrl.jobSeekerMailer = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var sentMailFlag=1;
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
    var subject = req.body.subject || '';
    var mailBody = req.body.mailBody || '';

    var whatmateMessage = req.body.whatmateMessage || '';
    var smsMsg = req.body.smsMsg || '';
    var smsFlag = req.body.smsFlag || 0;

    var isWeb = req.query.isWeb || 0;
    var mailerType = req.body.mailerType || 0;
    var userId = req.query.userId || 0;

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
    // emailReceivers.sort(function(a,b){return a-b});

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
                        req.st.db.escape(JSON.stringify(applicants)),
                        req.st.db.escape(sentMailFlag)

                    ];

                    var procQuery = 'CALL wm_paceMailerJobseeker( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result) {
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;
                            // console.log('result of pacemailer procedure', result[0]);
                            for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {
                              
                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                
                                    if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){
    
                                        mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                   
                                        subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
        
                                        smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
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
                                }
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
                                            req.st.db.escape(applicants[0]),   // in procedure only reAppId is stored
                                            req.st.db.escape(transactions[0] ? transactions[0]:0)  
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
                            if (!(templateId == 0 || overWrite)){
                                response.status = true;
                                response.message = "mail sent successfully";
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

                else if(templateId && !overWrite && !emailReceivers.length){
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
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            //check if there are any receivers, if yes sent and saved
                            if (emailReceivers.length != 0)
                                response.message = "Mail is Sent and Template Saved successfully";
                            //else saved
                            else
                                response.message = "Template saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
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
        });
    }
};


sendgridCtrl.jobSeekerPreview = function (req, res, next) {

    var mailBody = req.body.mailBody ? req.body.mailBody : '';
    var subject = req.body.subject ? req.body.subject : '';
    var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sentMailFlag = 0;
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
                                
                                if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                               
                                    subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                    smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
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
                            receiverData : applicantData
                        };
                        res.status(200).json(response);
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
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


sendgridCtrl.ScreeningMailerPreview = function (req, res, next) {

    var mailBody = req.body.mailBody ? req.body.mailBody : '';
    var subject = req.body.subject ? req.body.subject : '';
    var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 0;

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
                    console.log(err);
                    console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        var temp = mailBody;
                        var temp1 = subject;
                        var temp2 = smsMsg;
                        var applicantData = [];
                        for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                            console.log('applicantIndex=', applicantIndex);

                            for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                
                                    subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                    smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                }
                            }

                            for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                
                                if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                    mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                
                                    subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                    smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                }
                            }

                           
                           applicantData.push(result[0][applicantIndex].EmailId);
                            console.log(subject_array);
                            console.log(smsMsg_array);
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
                            applicantData: applicantData
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tagsPreview: [],
                            subjectPreview: [],
                            smsMsgPreview:[],
                            applicantData: []
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

//send Screening Mailer
sendgridCtrl.screeningMailer = function (req, res, next) {

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
    
    var transactions =[];

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
    var subject = req.body.subject || '';
    var mailBody = req.body.mailBody || '';

    var whatmateMessage = req.body.whatmateMessage || '';
    var smsMsg = req.body.smsMsg || '';
    var smsFlag = req.body.smsFlag || 0;

    var isWeb = req.query.isWeb || 0;
    var mailerType = req.body.mailerType || 0;
    var userId = req.query.userId || 0;

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
 
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }

    //check for mail type and assign the recipients
    emailReceivers = reqApplicants;
    // emailReceivers.sort(function(a,b){return a-b});

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
                        req.st.db.escape(sendMailFlag)
                    ];
                    
                    var procQuery = 'CALL wm_paceScreeningMailer( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);

                        if(result[2] && result[2][0] && result[2][0].transactions){
                            transactions = JSON.parse(result[2][0].transactions);
                        }

                        if (!err && result && result[0] && result[0][0]) {
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;

                            for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {
                              
                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    
                                        subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
        
                                        smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    }
                                }
    
                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                    
                                    if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    
                                        subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
        
                                        smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
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
                                }
                                sendgrid.send(email, function (err, sendGridResult) {
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
                                            req.st.db.escape(reqApplicants[0]),
                                            req.st.db.escape(transactions[0] ? transactions[0]:0)  
                                        ];

                                        //saving the mail after sending it
                                        var saveMailHistory = 'CALL wm_save_sentMailHistory( ' + saveMails.join(',') + ')';
                                        console.log(saveMailHistory);
                                        req.db.query(saveMailHistory, function (mailHistoryErr, mailHistoryResult) {
                                            console.log("error of save mail",mailHistoryErr);
                                            console.log("result of mail save",mailHistoryResult[0]);
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
                            if (!(templateId == 0 || overWrite)){
                                response.status = true;
                                response.message = "mail sent successfully";
                                response.data = transactions[0];
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

                else if(templateId && !overWrite && !emailReceivers.length){
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
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            //check if there are any receivers, if yes sent and saved
                            if (emailReceivers.length != 0){
                                response.message = "Mail is Sent and Template Saved successfully";
                            }
                            //else saved
                            else{
                                response.message = "Template saved successfully";
                            }
                            response.error = null;
                            response.data = tempSaveResult[0][0];
                            res.status(200).json(response);
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
        });
    }
};



sendgridCtrl.SubmissionMailerPreview = function (req, res, next) {

    var mailBody = req.body.mailBody ? req.body.mailBody : '';
    var subject = req.body.subject ? req.body.subject : '';
    var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var sendMailFlag = 0;

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
    if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }
    if (!tableTags) {
        tableTags = [];
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
                    req.st.db.escape(sendMailFlag)
                ];
                var idArray;
                idArray = reqApplicants;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array =[];

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

                        for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                        smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                        smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] !=null && result[0][applicantIndex][tags.client[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.client[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                        subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
    
                                        smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
                                    }

                                }
                            }
                            for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                if(result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !='null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=''){

                                    mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                    subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                    smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
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
                        console.log(mailbody_array);

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            clientData : clientData
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tagsPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: [],
                            clientData: []
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


// send submission mailer
sendgridCtrl.submissionMailer = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var sendMailFlag =1;
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

    //html styling for table in submission mailer

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid tenant';
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
    // emailReceivers.sort(function(a,b){return a-b});
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
                        req.st.db.escape(sendMailFlag)
                    ];
                    
                    var procQuery = 'CALL wm_paceSubmissionMailer( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result && result[0] && result[0][0]) {
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;

                            for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {
                                for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
    
                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                            subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
        
                                            smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }
    
                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                            subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
        
                                            smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }
    
                                    for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.client[tagIndex].tagName] && result[0][applicantIndex][tags.client[tagIndex].tagName] !=null && result[0][applicantIndex][tags.client[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.client[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
    
                                            subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
        
                                            smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
                                        }

                                    }
                                }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                    if(result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !='null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                        subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
        
                                        smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
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
                                console.log('tracker',trackerTemplate.trackerId);
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
                                    if (attachment[file].binaryFile){
                                        email.addFile({
                                            filename: attachment[file].fileName,
                                            content: new Buffer(attachment[file].binaryFile, 'base64'),
                                            contentType: attachment[file].fileType
                                        });
                                    }
                                }

                                if (trackerTemplate.trackerId) {
                                    console.log('trackerTemplate send mail attach',trackerTemplate.trackerId);
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
                                }
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
                                            req.st.db.escape(reqApplicants[0]),
                                            req.st.db.escape(transactions[0] ? transactions[0]:0)  
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

                            if (!(templateId == 0 || overWrite)){
                                response.status = true;
                                response.message = "mail sent successfully";
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

                else if(templateId && !overWrite && !emailReceivers.length){
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
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            //check if there are any receivers, if yes sent and saved
                            if (emailReceivers.length != 0)
                                response.message = "Mail is Sent and Template Saved successfully";
                            //else saved
                            else
                                response.message = "Template saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
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
        });
    }
};


sendgridCtrl.clientMailerPreview = function (req, res, next) {

    var mailBody = req.body.mailBody ? req.body.mailBody : '';
    var subject = req.body.subject ? req.body.subject : '';
    var smsMsg = req.body.smsMsg ? req.body.smsMsg: '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;

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
                    req.st.db.escape(JSON.stringify(clientContacts))
                ];
                var idArray;
                idArray = clientContacts;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array =[];

                var procQuery;
                procQuery = 'CALL wm_paceClientMailer( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        var temp = mailBody;
                        var temp1 = subject;
                        var temp2 = smsMsg;
                        var clientData =[];

                        for (var clientIndex = 0; clientIndex < idArray.length; clientIndex++) {

                            for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {
                                if(result[0][clientIndex][tags.clientContacts[tagIndex].tagName] && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !='null' && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !=''){

                                    mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                    subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                    smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                }
                            }

                            clientData.push(result[0][clientIndex].EmailId);                            
                            mailbody_array.push(mailBody);
                            subject_array.push(subject);
                            smsMsg_array.push(smsMsg);
                            mailBody = temp;
                            subject = temp1;
                            smsMsg =temp2;
                        }

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            clientData : clientData
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tagsPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: [],
                            clientData :[]
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

// send client mailer

sendgridCtrl.clientMailer = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var emailReceivers;                //emailReceivers to store the recipients
    var mailbody_array = [];    //array to store all mailbody after replacing tags
    var subject_array = [];
    var smsMsg_array = [];

    var transactions =[];
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

    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
    }

    // if (typeof (clientContacts) == "string") {
    //     clientContacts = JSON.parse(clientContacts);
    // }

    if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }

    //check for mail type and assign the recipients
    emailReceivers = clientContacts;
    // emailReceivers.sort(function(a,b){return a-b});

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
                        req.st.db.escape(JSON.stringify(clientContacts))

                    ];

                    var procQuery = 'CALL wm_paceClientMailer( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result) {
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;
                            // console.log('result of pacemailer procedure', result[0]);
                            for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {

                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                    if(result[0][clientIndex][tags.clientContacts[tagIndex].tagName] && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !='null' && result[0][clientIndex][tags.clientContacts[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                        subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
        
                                        smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
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
                                }
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
                                            req.st.db.escape(reqApplicants[0]),
                                            req.st.db.escape(transactions[0] ? transactions[0]:0)   
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

                            if (!(templateId == 0 || overWrite)){
                                response.status = true;
                                response.message = "mail sent successfully";
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

                else if(templateId && !overWrite && !emailReceivers.length){
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
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            //check if there are any receivers, if yes sent and saved
                            if (emailReceivers.length != 0)
                                response.message = "Mail is Sent and Template Saved successfully";
                            //else saved
                            else
                                response.message = "Template saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
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
        });
    }
};


sendgridCtrl.interviewMailerPreview = function (req, res, next) {

    var mailBody = req.body.mailBody ? req.body.mailBody : '';
    var subject = req.body.subject ? req.body.subject : '';
    var smsMsg = req.body.smsMsg ? req.body.smsMsg : '';
    var isWeb = req.query.isWeb ? req.query.isWeb : 0;
    var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;  // if 0 mail is for  applicants if 1- mail is for client contacts
    var sendMailFlag =0;
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
    if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }
    if (!tableTags) {
        tableTags = [];
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
                    req.st.db.escape(sendMailFlag)
                ];
                var idArray;
                idArray = reqApplicants;
                // idArray.sort(function(a,b){return a-b});
                var mailbody_array = [];
                var subject_array = [];
                var smsMsg_array =[];

                var procQuery;
                procQuery = 'CALL wm_paceInterviewMailer( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] || result[1] || result[1][0]) {
                        var temp = mailBody;
                        var temp1 = subject;
                        var temp2 = smsMsg;
                        var clientData =[];
                        var applicantData=[];

                        if (interviewerFlag) {
                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){
                                    
                                            mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                        subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    
                                        smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName]!=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                            subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                            smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] != null && result[0][applicantIndex][tags.interview[tagIndex].tagName]!='' && result[0][applicantIndex][tags.interview[tagIndex].tagName] !='null'){
                                            mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                            subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                        
                                            smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                        }                                    
                                    }
                                }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                    if(result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName]!='null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName]!=''){

                                        mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                        subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                        smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
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
                        }
                        else {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                    
                                if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){
                                 
                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                
                                    smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                }
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                        subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    
                                        smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    }
                                }

                                for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                    if(result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=null && result[0][applicantIndex][tags.interview[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=''){

                                        mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);

                                        subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                    
                                        smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                    }
                                }
                                applicantData.push(result[0][applicantIndex].EmailId);
                            }
                            
                            mailbody_array.push(mailBody);
                            subject_array.push(subject);
                            smsMsg_array.push(smsMsg);
                            mailBody = temp;
                            subject = temp1;
                            smsMsg = temp2;
                        }
                        console.log(mailbody_array);

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            subjectPreview: subject_array,
                            smsMsgPreview: smsMsg_array,
                            applicants:result[0],
                            clientContacts: result[1],
                            clientData : clientData,
                            applicantData : applicantData
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tagsPreview: [],
                            subjectPreview: [],
                            smsMsgPreview: [],
                            clientData :[],
                            applicantData :[]
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


sendgridCtrl.interviewMailer = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var sendMailFlag =1;
    var interviewerFlag = req.body.interviewerFlag ? req.body.interviewerFlag : 0;  // if 0 mail is for  applicants if 1- mail is for client contacts

    var transactions =[];

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
    var subject = req.body.subject || '';
    var mailBody = req.body.mailBody || '';

    var whatmateMessage = req.body.whatmateMessage || '';
    var smsMsg = req.body.smsMsg || '';
    var smsFlag = req.body.smsFlag || 0;

    var isWeb = req.query.isWeb || 0;
    var mailerType = req.body.mailerType || 0;
    var userId = req.query.userId || 0;

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
 
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
        // reqApplicants.sort(function(a,b){return a-b});
    }

    //check for mail type and assign the recipients
    if(interviewerFlag){
        emailReceivers = clientContacts;
        // emailReceivers.sort(function(a,b){return a-b});
    }
    else{
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
                        req.st.db.escape(sendMailFlag)
                    ];
                    
                    var procQuery = 'CALL wm_paceInterviewMailer( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if(result[3] && result[3][0] && result[3][0].transactions){
                            transactions = JSON.parse(result[3][0].transactions);
                        }
                       

                        if (!err && result && result[0] && result[0][0]) {
                            var temp = mailBody;
                            var temp1 = subject;
                            var temp2 = smsMsg;

                            if (interviewerFlag) {
                                for (var clientIndex = 0; clientIndex < emailReceivers.length; clientIndex++) {
                                    for (var applicantIndex = 0; applicantIndex < reqApplicants.length; applicantIndex++) {
    
                                        for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                            if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                                mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                                subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                            
                                                smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                            }
                                           
                                        }
    
                                        for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                            if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName]!=''){

                                                mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                                subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
        
                                                smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                            }
                                        }
    
                                        for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {
                                            
                                            if(result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=null && result[0][applicantIndex][tags.interview[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=''){

                                                mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
    
                                                subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                            
                                                smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                            
                                            }

                                        }
                                    }
                                    for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {

                                        if(result[1][clientIndex][tags.clientContacts[tagIndex].tagName] && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=null && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !='null' && result[1][clientIndex][tags.clientContacts[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
    
                                            subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
        
                                            smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);
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
                            }
                            else{
                                for (var applicantIndex = 0; applicantIndex < emailReceivers.length; applicantIndex++) {

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.applicant[tagIndex].tagName] && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=null && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.applicant[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
    
                                            subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        
                                            smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                        }
                                    }
    
                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.requirement[tagIndex].tagName] && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=null && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.requirement[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
    
                                            subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        
                                            smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                        }
                                    }
    
                                    for (var tagIndex = 0; tagIndex < tags.interview.length; tagIndex++) {

                                        if(result[0][applicantIndex][tags.interview[tagIndex].tagName] && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=null && result[0][applicantIndex][tags.interview[tagIndex].tagName] !='null' && result[0][applicantIndex][tags.interview[tagIndex].tagName] !=''){

                                            mailBody = mailBody.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
    
                                            subject = subject.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
                                        
                                            smsMsg = smsMsg.replace('[interview.' + tags.interview[tagIndex].tagName + ']', result[0][applicantIndex][tags.interview[tagIndex].tagName]);
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

                                if (trackerTemplate) {
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
                                }
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
                                            req.st.db.escape(reqApplicants[0]),
                                            req.st.db.escape(transactions[0] ? transactions[0]:0)    
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
                            if (!(templateId == 0 || overWrite)){
                                response.status = true;
                                response.message = "mail sent successfully";
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

                else if(templateId && !overWrite && !emailReceivers.length){
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
                        req.st.db.escape(JSON.stringify(tableTags))
                    ];
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            //check if there are any receivers, if yes sent and saved
                            if (emailReceivers.length != 0)
                                response.message = "Mail is Sent and Template Saved successfully";
                            //else saved
                            else
                                response.message = "Template saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
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
        });
    }
};


// sendgridCtrl.saveMailSentByGmail = function (req, res, next) {
//     var response = {
//         status: false,
//         message: "Invalid token",
//         data: null,
//         error: null
//     };
//     var validationFlag = true;
//     var sendMailFlag = 1;
//     var emailReceivers;                //emailReceivers to store the recipients
//     var mailbody_array = [];    //array to store all mailbody after replacing tags
//     var subject_array = [];
//     var smsMsg_array = [];
    
//     var transactions =[];

//     var emailId = [];
//     var fromEmailID;
//     var toEmailID = [];
//     var MobileISD = [];
//     var MobileNumber = [];
//     var isdMobile = '';
//     var mobileNo = '';
//     var message = '';
//     //request parameters
//     var updateFlag = req.body.updateFlag || 0;
//     var overWrite = req.body.overWrite || 0;
//     var saveTemplate = req.body.saveTemplate || 0;       //flag to check whether to save template or not
//     var templateId = req.body.template ? req.body.template.templateId : undefined;
//     var trackerTemplate = req.body.trackerTemplate || {};
//     var tags = req.body.tags || {};
//     var cc = req.body.cc || [];
//     var toMail = req.body.toMail || [];
//     var bcc = req.body.bcc || [];
//     var stage = req.body.stage || [];
//     var attachment = req.body.attachment || [];
//     var reqApplicants = req.body.reqApplicants || [];
//     var applicants = req.body.applicantId || [];
//     var client = req.body.clientId || [];
//     var tableTags = req.body.tableTags || {};
//     var clientContacts = req.body.clientContacts || [];
//     var subject = req.body.subject || '';
//     var mailBody = req.body.mailBody || '';

//     var whatmateMessage = req.body.whatmateMessage || '';
//     var smsMsg = req.body.smsMsg || '';
//     var smsFlag = req.body.smsFlag || 0;

//     var isWeb = req.query.isWeb || 0;
//     var mailerType = req.body.mailerType || 0;
//     var userId = req.query.userId || 0;

//     //html styling for table in submission mailer

//     if (!req.query.heMasterId) {
//         error.heMasterId = 'Invalid tenant';
//         validationFlag *= false;
//     }

//     if (!req.query.token) {
//         error.token = 'Invalid token';
//         validationFlag *= false;
//     }


//     if (typeof (tags) == "string") {
//         tags = JSON.parse(tags);
//     }

//     if (typeof (cc) == "string") {
//         cc = JSON.parse(cc);
//     }

//     if (typeof (toMail) == "string") {
//         toMail = JSON.parse(toMail);
//     }

//     if (typeof (bcc) == "string") {
//         bcc = JSON.parse(bcc);
//     }

//     if (typeof (stage) == "string") {
//         stage = JSON.parse(stage);
//     }

//     if (typeof (attachment) == "string") {
//         attachment = JSON.parse(attachment);
//     }

//     if (typeof (client) == "string") {
//         client = JSON.parse(client);
//     }

//     if (typeof (clientContacts) == "string") {
//         clientContacts = JSON.parse(clientContacts);
//     }

//     if (typeof (tableTags) == "string") {
//         tableTags = JSON.parse(tableTags);
//     }
 
//     if (typeof (reqApplicants) == "string") {
//         reqApplicants = JSON.parse(reqApplicants);
//     }

//     if (!validationFlag) {
//         response.error = error;
//         response.message = 'Please check the error';
//         res.status(400).json(response);
//         console.log(response);
//     }
//     else {
//         req.st.validateToken(req.query.token, function (err, tokenResult) {
//             if ((!err) && tokenResult) {
//                 req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
//                 req.body.templateId = req.body.templateId ? req.body.templateId :0;

//                 var inputs = [
//                     req.st.db.escape(req.query.token),
//                     req.st.db.escape(req.query.heMasterId),
//                     req.st.db.escape(req.body.heDepartmentId),
//                     req.st.db.escape(userId),
//                     req.st.db.escape(mailerType),
//                     req.st.db.escape(mailOptions.from),
//                     req.st.db.escape(mailOptions.to),
//                     req.st.db.escape(mailOptions.subject),
//                     req.st.db.escape(mailOptions.html),    // contains mail body
//                     req.st.db.escape(JSON.stringify(cc)),
//                     req.st.db.escape(JSON.stringify(bcc)),
//                     req.st.db.escape(JSON.stringify(attachment)),
//                     req.st.db.escape(req.body.replyMailId),
//                     req.st.db.escape(req.body.priority),
//                     req.st.db.escape(req.body.stageId),
//                     req.st.db.escape(req.body.statusId),
//                     req.st.db.escape(message),    // sms message
//                     req.st.db.escape(whatmateMessage),
//                     req.st.db.escape(reqApplicants[0]),
//                     req.st.db.escape(transactions[0] ? transactions[0]:0)  
//                 ];

//                 var procQuery = 'CALL wm_save_sentByGMailerHistory( ' + inputs.join(',') + ')';
//                 console.log(procQuery);
//                 req.db.query(procQuery, function (err, result) {
//                     console.log(err);

//                     if (!err && result && result[0][0]) {
//                         response.status = true;
//                         response.message = "mails saved sucessfully";
//                         response.error = null;
//                         response.data =result[0][0];
//                         res.status(200).json(response);
//                     }
                   
//                     else {
//                         response.status = false;
//                         response.message = "Error while saving mails";
//                         response.error = null;
//                         response.data = null;
//                         res.status(500).json(response);
//                     }
//                 });
//             }
//             else {
//                 res.status(401).json(response);
//             }
//         });
//     }
// };


module.exports = sendgridCtrl;