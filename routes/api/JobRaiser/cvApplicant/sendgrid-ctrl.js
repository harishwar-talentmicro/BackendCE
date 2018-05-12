
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

var path = require('path');
var archiver = require('archiver');
var request = require('request');
var xlsx = require('node-xlsx');  // for xls file generation

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


module.exports = sendgridCtrl;