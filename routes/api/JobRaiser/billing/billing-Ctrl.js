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
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var billingCtrl = {};
var error = {};


billingCtrl.billingFilter = function (req, res, next) {
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

    var billStage = req.body.billStage;
    if (typeof (billStage) == "string") {
        billStage = JSON.parse(billStage);
    }
    if (!billStage) {
        billStage = [];
    }

    var billStatus = req.body.billStatus;
    if (typeof (billStatus) == "string") {
        billStatus = JSON.parse(billStatus);
    }
    if (!billStatus) {
        billStatus = [];
    }

    var billBranch = req.body.billBranch;
    if (typeof (billBranch) == "string") {
        billBranch = JSON.parse(billBranch);
    }
    if (!billBranch) {
        billBranch = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(billStage)),
                    req.st.db.escape(JSON.stringify(billStatus)),
                    req.st.db.escape(JSON.stringify(billBranch)),
                    req.st.db.escape(req.body.heDepartmentId)                   
                ];
                var procQuery = 'CALL wm_get_pacebillingFilter( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Billing Data loaded sucessfully";
                        response.error = null;
                        response.data = {
                            billingData : (result[0] && result[0][0]) ? result[0] :[]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            billingData : []
                        };
                        res.status(200).json(response);
                    }
                
                    else {
                        response.status = false;
                        response.message = "Error while loading billing data";
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



billingCtrl.billTaxTemplate = function (req, res, next) {
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

    if (!req.body.taxTemplateTitle) {
        error.taxTemplateTitle = 'Invalid Tax Template Title';
        validationFlag *= false;
    }

    var taxCodes = req.body.taxCodes;
    if(typeof(taxCodes) == "string"){
        taxCodes = JSON.parse(taxCodes);
    }
    if(!taxCodes){
        taxCodes = []
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.taxTemplateId = req.body.taxTemplateId ? req.body.taxTemplateId :0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.taxTemplateId),                   
                    req.st.db.escape(req.body.taxTemplateTitle),                            
                    req.st.db.escape(JSON.stringify(taxCodes))                   
                ];

                var procQuery = 'CALL wm_save_pacebillingTaxTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Tax template saved sucessfully";
                        response.error = null;
                        response.data = {
                            taxTemplateId : result[0][0] ?  result[0][0].taxTemplateId : 0
                        };
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while loading billing data";
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


billingCtrl.billmasterTaxTypes = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0
                req.query.invoiceTemplateId = req.query.invoiceTemplateId ? req.query.invoiceTemplateId :0; 
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.invoiceTemplateId)      
                ];

                var procQuery = 'CALL wm_get_billingMaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Tax types loaded sucessfully";
                        response.error = null;
                        
                        for(var i=0; i<result[1].length; i++){
                            result[1][i].taxCodes = (result[1][i] && result[1][i].taxCodes) ? JSON.parse(result[1][i].taxCodes):[]
                        }
                        for(var i=0; i<result[4].length; i++){
                            result[4][i].billingTable = result[4][0] ? JSON.parse(result[4][i].billingTable): [];
                        }

                        response.data = {
                            taxCodes : result[0] ?  result[0] : [],
                            taxTemplates: (result[1] && result[1][0]) ? result[1] :[],
                            invoiceTemplates : (result[2] && result[2][0]) ? result[2] :[],
                            invoiceTemplateDetail: (result[3] && result[3][0]) ? JSON.parse(result[3][0].formData) :{},
                            billingTableTemplate: (result[4] && result[4][0]) ? (result[4]) :[]
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            taxCodes : [],
                            taxTemplates:[],
                            invoiceTemplates: [],
                            invoiceTemplateDetail: {},
                            billingTableTemplate: []
                        };
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while loading tax codes";
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

billingCtrl.billInvoiceTemplate = function (req, res, next) {
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

    if (!req.body.invoiceTemplateName) {
        error.invoiceTemplateName = 'Invalid Invoice Template Name';
        validationFlag *= false;
    }

    var tags = req.body.tags;
    if(!tags){
        tags = []
    }
    else if(typeof(tags) == "string"){
        tags = JSON.parse(tags);
    }

    var tableTags = req.body.tableTags;
    if(!tableTags){
        tableTags = []
    }
    else if(typeof(tableTags) == "string"){
        tableTags = JSON.parse(tableTags);
    }

    var taxTemplate = req.body.taxTemplate;
    if(!taxTemplate){
        taxTemplate = []
    }
    else if(typeof(taxTemplate) == "string"){
        taxTemplate = JSON.parse(taxTemplate);
    }

    var toMail = req.body.toMail;
    if(!toMail){
        toMail = []
    }
    else if(typeof(toMail) == "string"){
        toMail = JSON.parse(toMail);
    }
    
    var cc = req.body.cc;
    if(!cc){
        cc = []
    }
    else if(typeof(cc) == "string"){
        cc = JSON.parse(cc);
    }

    var bcc = req.body.bcc;
    if(!bcc){
        bcc = []
    }
    else if(typeof(bcc) == "string"){
        bcc = JSON.parse(bcc);
    }

    var attachment = req.body.attachment;
    if(!attachment){
        attachment = []
    }
    else if(typeof(attachment) == "string"){
        attachment = JSON.parse(attachment);
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.invoiceTemplateId = req.body.invoiceTemplateId ? req.body.invoiceTemplateId :0;
                req.body.invoiceSubject = req.body.invoiceSubject ? req.body.invoiceSubject :'';
                req.body.invoiceBody = req.body.invoiceBody ? req.body.invoiceBody :'';
                req.body.replyMailId = req.body.replyMailId ? req.body.replyMailId :'';
                req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag :0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.invoiceTemplateId),                   
                    req.st.db.escape(req.body.invoiceTemplateName),                            
                    req.st.db.escape(JSON.stringify(taxTemplate)),                   
                    req.st.db.escape(JSON.stringify(tags)),                   
                    req.st.db.escape(JSON.stringify(tableTags)),                   
                    req.st.db.escape(req.body.invoiceSubject),                            
                    req.st.db.escape(req.body.invoiceBody),                            
                    req.st.db.escape(JSON.stringify(toMail)),                   
                    req.st.db.escape(JSON.stringify(cc)),                   
                    req.st.db.escape(JSON.stringify(bcc)),                   
                    req.st.db.escape(JSON.stringify(attachment)),                   
                    req.st.db.escape(req.body.replyMailId),                            
                    req.st.db.escape(req.body.updateFlag)                           
                ];

                var procQuery = 'CALL wm_save_billingInvoiceTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].templateExists) {
                        response.status = true;
                        response.message = "Invoice template already Exists";
                        response.error = null;
                        response.data ={
                            templateExists: result[0][0].templateExists,
                            invoiceTemplateDetail : (result[0] && result[0][0]) ? result[0][0].formData: {}
                        }
                        res.status(200).json(response);
                    }

                    else if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Invoice template saved sucessfully";
                        response.error = null;
                        response.data ={
                            invoiceTemplateDetail : (result[0] && result[0][0]) ? result[0][0].formData: {}
                        }
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while saving inovice template";
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


billingCtrl.invoiceMailerPreview = function (req, res, next) {

    var invoiceBody = req.body.invoiceBody ? req.body.invoiceBody : '';
    var invoiceSubject = req.body.invoiceSubject ? req.body.invoiceSubject : '';
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

    var taxTemplate = req.body.taxTemplate;
    if(!taxTemplate){
        taxTemplate = []
    }
    else if(typeof(taxTemplate) == "string"){
        taxTemplate = JSON.parse(taxTemplate);
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
                // var smsMsg_array =[];

                var procQuery;
                procQuery = 'CALL wm_paceSubmissionMailer( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[1] && result[1][0]) {
                        var temp = mailBody;
                        var temp1 = subject;
                        // var temp2 = smsMsg;

                        for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    subject = subject.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);

                                    // smsMsg = smsMsg.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                }

                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                    mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    subject = subject.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);

                                    // smsMsg = smsMsg.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[0][applicantIndex][tags.requirement[tagIndex].tagName]);
                                }

                                for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                    mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                    subject = subject.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);

                                    // smsMsg = smsMsg.replace('[client.' + tags.client[tagIndex].tagName + ']', result[0][applicantIndex][tags.client[tagIndex].tagName]);
                                }
                            }
                            for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {
                                mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                subject = subject.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

                                // smsMsg = smsMsg.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[1][clientIndex][tags.clientContacts[tagIndex].tagName]);

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
                            // smsMsg_array.push(smsMsg);
                            mailBody = temp;
                            subject = temp1;
                            // smsMsg = temp2;
                        }
                        console.log(mailbody_array);

                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            subjectPreview: subject_array,
                            // smsMsgPreview: smsMsg_array
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

module.exports = billingCtrl;