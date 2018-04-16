
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var textract = require('textract');
var http = require('https');

var bodyParser = require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();


var path = require('path');
var archiver = require('archiver');
var request = require('request');

var moment = require('moment');
var sendgridCtrl = {};
var error = {};

sendgridCtrl.saveSendMail = function (req, res, next) {

    var idArray;
    var mailbody_array = [];
    var emailId = [];
    var saveTemplate = 0;              //flag to check whether to save template or not
    var templateId;
    var tags = req.body.tags;
    var cc = req.body.cc;
    var toMail = req.body.toMail;
    var bcc = req.body.bcc;
    var stage = req.body.stage;
    var attachment = req.body.attachment;
    var reqApplicants = req.body.reqApplicants;
    var applicants = req.body.applicantId;
    var client = req.body.clientId;
    var tableTags = req.body.tableTags;
    var validationFlag = true;
    var updateFlag = 0;
    var overWrite = 0;

    if (req.body.overWrite) {
        overWrite = req.body.overWrite;
    }

    if (req.body.updateFlag) {
        updateFlag = req.body.updateFlag;
    }

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid tenant';
        validationFlag *= false;
    }

    if (req.body.template) {
        templateId = req.body.template.templateId;
    }

    if (req.body.saveTemplate) {
        saveTemplate = req.body.saveTemplate;
    }

    if (!tags) {
        tags = [];
    }
    else if (typeof (tags) == "string") {
        tags = JSON.parse(tags);
    }

    if (!cc) {
        cc = [];
    }
    else if (typeof (cc) == "string") {
        cc = JSON.parse(cc);
    }

    if (!toMail) {
        toMail = [];
    }
    else if (typeof (toMail) == "string") {
        toMail = JSON.parse(toMail);
    }

    if (!bcc) {
        bcc = [];
    }
    else if (typeof (bcc) == "string") {
        bcc = JSON.parse(bcc);
    }

    if (!stage) {
        stage = [];
    }
    else if (typeof (stage) == "string") {
        stage = JSON.parse(stage);
    }

    if (!attachment) {
        attachment = [];
    }
    else if (typeof (attachment) == "string") {
        attachment = JSON.parse(attachment);
    }

    if (!reqApplicants) {
        reqApplicants = [];
    }
    else if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }

    if (!applicants) {
        applicants = [];
    }
    else if (typeof (applicants) == "string") {
        applicants = JSON.parse(applicants);
    }

    if (!client) {
        client = [];
    }
    else if (typeof (client) == "string") {
        client = JSON.parse(client);
    }

    if (!clientContacts) {
        clientContacts = [];
    }
    else if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
    }

    if (!tableTags) {
        tableTags = [];
    }
    else if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (req.body.mailerType == 1 || req.body.mailerType == 2) {
        idArray = reqApplicants;
    }
    else if (req.body.mailerType == 3) {
        idArray = applicants;
    }
    else {
        idArray = client;
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
                if (idArray.length > 0) {				//for checking if the mailer is just a template
                    req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                    var mailBody = req.body.mailBody;
                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                    req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                    req.query.userId = req.query.userId ? req.query.userId : 0;

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(tags)),
                        req.st.db.escape(JSON.stringify(reqApplicants)),
                        req.st.db.escape(JSON.stringify(applicants)),
                        req.st.db.escape(JSON.stringify(client)),
                        req.st.db.escape(req.query.userId),
                        req.st.db.escape(req.body.mailerType),
                        req.st.db.escape(JSON.stringify(tableTags)),
                        req.st.db.escape(JSON.stringify(clientContacts))
                    ];

                    var procQuery = 'CALL wm_get_detailsByTags1( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        console.log(result);

                        if (!err && result) {
                            var temp = mailBody;
                            for (var i = 0; i < idArray.length; i++) {

                                for (var j = 0; j < tags.applicant.length; j++) {
                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[j].tagName + ']', result[0][i][tags.applicant[j].tagName]);
                                }
                                for (var j = 0; j < tags.requirement.length; j++) {

                                    mailBody = mailBody.replace('[requirement.' + tags.requirement[j].tagName + ']', result[1][i][tags.requirement[j].tagName]);
                                }

                                for (var j = 0; j < tags.client.length; j++) {

                                    mailBody = mailBody.replace('[client.' + tags.client[j].tagName + ']', result[2][i][tags.client[j].tagName]);
                                }
                                for (var j = 0; j < result[3].length; j++) {

                                    emailId.push(result[3][j].emailId);
                                }
                                for (var j = 0; j < tags.clientContact.length; j++) {
                                    mailBody = mailBody.replace('[clientContact.' + tags.clientContact[j].tagName + ']', result[8][i][tags.clientContact[j].tagName]);
                                }

                                //table creation for table tags
                                console.log(tableTags, 'tabletags');
                                if (tableTags.applicant.length > 0) {
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    mailBody += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    console.log(mailBody, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        mailBody += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                    }
                                    mailBody += "</tr>";
                                    for (var candidateCount = 0; candidateCount < result[5].length; candidateCount++) {
                                        mailBody += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                            mailBody += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[5][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                        }
                                        mailBody += "</tr>";
                                    }

                                    mailBody += "</table>";
                                    mailBody += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>';


                                }

                                EZEIDEmail = result[4][0].fromemailId;

                                mailbody_array.push(mailBody);

                                var mailOptions = {
                                    from: EZEIDEmail,
                                    to: emailId[i],
                                    subject: req.body.subject,
                                    html: mailBody
                                };


                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.mbody = mailOptions.html;
                                email.html = mailOptions.html;

                                var saveMails = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.query.heMasterId),
                                    req.st.db.escape(req.body.heDepartmentId),
                                    req.st.db.escape(req.body.userId),
                                    req.st.db.escape(req.body.mailerType),
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
                                        // response.status = true;
                                        // response.message = "mail sent successfully";
                                        // response.error = null;
                                        // response.data = null;
                                        // res.status(200).json(response);


                                    }
                                    else {
                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                    }
                                });
                                mailBody = temp;
                            }

                            response.status = true;
                            response.message = "mail sent successfully";
                            response.error = null;

                            res.status(200).json(response);
                        }

                        else {
                            response.status = false;
                            response.message = "Error while sending mail";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }

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
                //inputs for save template procedure
                var templateInputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(templateId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.template.templateName),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(JSON.stringify(toMail)),
                    req.st.db.escape(JSON.stringify(cc)),
                    req.st.db.escape(JSON.stringify(bcc)),
                    req.st.db.escape(req.body.subject),
                    req.st.db.escape(req.body.templateContent),
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
                //console.log('List is empty', saveTemplate);
                console.log(overWrite, "overWrite");
                if (templateId == 0 || overWrite) {
                    var saveTemplateQuery = 'CALL WM_save_1010_mailTemplate( ' + templateInputs.join(',') + ')';
                    console.log(saveTemplateQuery);
                    req.db.query(saveTemplateQuery, function (tempSaveErr, tempSaveResult) {
                        if (!tempSaveErr && tempSaveResult) {
                            console.log(tempSaveErr);
                            console.log(tempSaveResult);
                            response.status = true;
                            if (idArray.length != 0)
                                response.message = "Sent and Saved successfully";
                            else
                                response.message = "Template saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                    });
                }
                else {
                    console.log('out of save template');
                }
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


module.exports = sendgridCtrl;