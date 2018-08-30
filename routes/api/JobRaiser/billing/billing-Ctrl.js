var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');

var htmlpdf = require('html-pdf');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var billingCtrl = {};
var error = {};


var gcloud = require('gcloud');
var uuid = require('node-uuid');

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
                req.body.start = req.body.start ? req.body.start : 1;
                req.body.limit = (req.body.limit) ? req.body.limit : 50;

                req.body.start = ((((req.body.start) * req.body.limit) + 1) - req.body.limit) - 1;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(billStage)),
                    req.st.db.escape(JSON.stringify(billStatus)),
                    req.st.db.escape(JSON.stringify(billBranch)),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.start),
                    req.st.db.escape(req.body.limit)
                ];
                var procQuery = 'CALL wm_get_pacebillingFilter( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Billing Data loaded sucessfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].billingCurrency = (result[0][i].billingCurrency && JSON.parse(result[0][i].billingCurrency).currencyId) ? JSON.parse(result[0][i].billingCurrency) : {};

                            result[0][i].receiptCurrency = (result[0][i].receiptCurrency && JSON.parse(result[0][i].receiptCurrency).currencyId) ? JSON.parse(result[0][i].receiptCurrency) : {};
                            result[0][i].taxCurrency = (result[0][i].taxCurrency && JSON.parse(result[0][i].taxCurrency).currencyId) ? JSON.parse(result[0][i].taxCurrency) : {};

                            result[0][i].TDSCurrency = (result[0][i].TDSCurrency && JSON.parse(result[0][i].TDSCurrency).currencyId) ? JSON.parse(result[0][i].TDSCurrency) : {};

                            result[0][i].actualCTCCurrency = (result[0][i].actualCTCCurrency && JSON.parse(result[0][i].actualCTCCurrency).currencyId) ? JSON.parse(result[0][i].actualCTCCurrency) : {};

                            result[0][i].actualCTCScale = (result[0][i].actualCTCScale && JSON.parse(result[0][i].actualCTCScale).scaleId) ? JSON.parse(result[0][i].actualCTCScale) : {};

                            result[0][i].actualCTCDuration = (result[0][i].actualCTCDuration && JSON.parse(result[0][i].actualCTCDuration).durationId) ? JSON.parse(result[0][i].actualCTCDuration) : {};

                            result[0][i].billableCurrency = (result[0][i].billableCurrency && JSON.parse(result[0][i].billableCurrency).currencyId) ? JSON.parse(result[0][i].billableCurrency) : {};

                            result[0][i].billableScale = (result[0][i].billableScale && JSON.parse(result[0][i].billableScale).scaleId) ? JSON.parse(result[0][i].billableScale) : {};

                            result[0][i].billableDuration = (result[0][i].billableDuration && JSON.parse(result[0][i].billableDuration).durationId) ? JSON.parse(result[0][i].billableDuration) : {};

                            result[0][i].designation = (result[0][i].designation && JSON.parse(result[0][i].designation).roleId) ? JSON.parse(result[0][i].designation) : {};

                            result[0][i].vendorCurrency = (result[0][i].vendorCurrency && JSON.parse(result[0][i].vendorCurrency).currencyId) ? JSON.parse(result[0][i].vendorCurrency) : {};

                            result[0][i].vendorScale = (result[0][i].vendorScale && JSON.parse(result[0][i].vendorScale).scaleId) ? JSON.parse(result[0][i].vendorScale) : {};

                            result[0][i].vendorDuration = (result[0][i].vendorDuration && JSON.parse(result[0][i].vendorDuration).durationId) ? JSON.parse(result[0][i].vendorDuration) : {};
                        }

                        response.data = {
                            billingData: (result[0] && result[0][0]) ? result[0] : [],
                            count : (result[1] && result[1][0]) ? result[1][0].count : 0,
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            billingData: []
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
    if (typeof (taxCodes) == "string") {
        taxCodes = JSON.parse(taxCodes);
    }
    if (!taxCodes) {
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
                req.body.taxTemplateId = req.body.taxTemplateId ? req.body.taxTemplateId : 0;

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
                            taxTemplateId: result[0][0] ? result[0][0].taxTemplateId : 0
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
                req.query.invoiceTemplateId = req.query.invoiceTemplateId ? req.query.invoiceTemplateId : 0;
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

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].taxCodes = (result[1][i] && result[1][i].taxCodes) ? JSON.parse(result[1][i].taxCodes) : []
                        }
                        for (var i = 0; i < result[4].length; i++) {
                            result[4][i].billingTable = result[4][0] ? JSON.parse(result[4][i].billingTable) : [];
                        }

                        response.data = {
                            taxCodes: result[0] ? result[0] : [],
                            taxTemplates: (result[1] && result[1][0]) ? result[1] : [],
                            invoiceTemplates: (result[2] && result[2][0]) ? result[2] : [],
                            invoiceTemplateDetail: (result[3] && result[3][0]) ? JSON.parse(result[3][0].formData) : {},
                            billingTableTemplate: (result[4] && result[4][0]) ? (result[4]) : []
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            taxCodes: [],
                            taxTemplates: [],
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
    if (!tags) {
        tags = []
    }
    else if (typeof (tags) == "string") {
        tags = JSON.parse(tags);
    }

    var tableTags = req.body.tableTags;
    if (!tableTags) {
        tableTags = []
    }
    else if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }

    var taxTemplate = req.body.taxTemplate;
    if (!taxTemplate) {
        taxTemplate = []
    }
    else if (typeof (taxTemplate) == "string") {
        taxTemplate = JSON.parse(taxTemplate);
    }

    var toMail = req.body.toMail;
    if (!toMail) {
        toMail = []
    }
    else if (typeof (toMail) == "string") {
        toMail = JSON.parse(toMail);
    }

    var cc = req.body.cc;
    if (!cc) {
        cc = []
    }
    else if (typeof (cc) == "string") {
        cc = JSON.parse(cc);
    }

    var bcc = req.body.bcc;
    if (!bcc) {
        bcc = []
    }
    else if (typeof (bcc) == "string") {
        bcc = JSON.parse(bcc);
    }

    var attachment = req.body.attachment;
    if (!attachment) {
        attachment = []
    }
    else if (typeof (attachment) == "string") {
        attachment = JSON.parse(attachment);
    }

    var tableTemplate = req.body.tableTemplate;
    if (!tableTemplate) {
        tableTemplate = []
    }
    else if (typeof (tableTemplate) == "string") {
        tableTemplate = JSON.parse(tableTemplate);
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
                req.body.invoiceTemplateId = req.body.invoiceTemplateId ? req.body.invoiceTemplateId : 0;
                req.body.invoiceSubject = req.body.invoiceSubject ? req.body.invoiceSubject : '';
                req.body.invoiceBody = req.body.invoiceBody ? req.body.invoiceBody : '';
                req.body.replyMailId = req.body.replyMailId ? req.body.replyMailId : '';
                req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;

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
                    req.st.db.escape(req.body.updateFlag),
                    req.st.db.escape(JSON.stringify(tableTemplate))

                ];

                var procQuery = 'CALL wm_save_billingInvoiceTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].templateExists) {
                        response.status = true;
                        response.message = "Invoice template already Exists";
                        response.error = null;
                        response.data = {
                            templateExists: result[0][0].templateExists,
                            invoiceTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
                        }
                        res.status(200).json(response);
                    }

                    else if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Invoice template saved sucessfully";
                        response.error = null;
                        response.data = {
                            invoiceTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
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
    if (!taxTemplate) {
        taxTemplate = []
    }
    else if (typeof (taxTemplate) == "string") {
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


billingCtrl.InoviceNumberGeneration = function (req, res, next) {
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_paceInvoiceNumber_generation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Invoice number generated sucessfully";
                        response.error = null;

                        response.data = result[0][0];
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while generating invoice number";
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


billingCtrl.invoiceApplyTax = function (req, res, next) {
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

    if (!req.body.invoiceNumber) {
        error.invoiceNumber = 'Invalid invoiceNumber';
        validationFlag *= false;
    }

    if (!req.body.invoiceDate) {
        error.invoiceDate = 'Invalid invoiceDate';
        validationFlag *= false;
    }

    var codes = req.body.taxTemplate.taxCodes;
    if (typeof (codes) == "string") {
        codes = JSON.parse(codes);
    }
    if (!codes) {
        codes = {}
    }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = []
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


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(codes)),
                    req.st.db.escape(req.body.invoiceDate),
                    req.st.db.escape(req.body.invoiceNumber),
                    req.st.db.escape(JSON.stringify(reqApplicants))
                ];

                var procQuery = 'CALL wm_save_billingTax( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0] && result[0][0].invoiceNumber) {
                        response.status = true;
                        response.message = "Invoice generated and saved sucessfully";
                        response.error = null;
                        response.data = result[0][0];
                        res.status(200).json(response);
                    }
                    else if (!err && result && result[0][0] && result[0][0].alreadyBilled) {
                        response.status = false;
                        response.message = "Invoice already generated";
                        response.error = null;
                        response.data = result[0][0];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while generating invoice";
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


billingCtrl.invoiceBillGenerate = function (req, res, next) {
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

    if (!req.query.invoiceNumber) {
        error.invoiceNumber = 'Invalid invoiceNumber';
        validationFlag *= false;
    }

    if (!req.query.invoiceTemplateId) {
        error.invoiceTemplateId = 'Invalid invoiceTemplateId';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.invoiceTemplateId),
                    req.st.db.escape(req.query.invoiceNumber),
                ];

                var procQuery = 'CALL wm_paceInvoiceGeneration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[1] && result[0][0] && result[1][0]) {
                        response.status = true;
                        response.message = "Invoice generated sucessfully";
                        response.error = null;

                        var taxTemplate = JSON.parse(result[0][0].taxTemplate);
                        var tags = JSON.parse(result[0][0].tags);
                        var tableTags = JSON.parse(result[0][0].tableTags);
                        var attachment = (result[0][0] && result[0][0].attachment) ? JSON.parse(result[0][0].attachment) : [];


                        var tableContent = '';

                        var invoiceBody = result[0][0].invoiceBody || '';
                        if (tags) {
                            for (var tagIndex = 0; tagIndex < tags.length; tagIndex++) {
                                if (tags[tagIndex]) {

                                    var reg = '[invoice.' + tags[tagIndex].tagName+']';
                                    var regExp = new RegExp(reg, 'g');
                                    console.log('regExp', regExp);
                                    if (result[1] && result[1][0][tags[tagIndex].tagName]) {
                                        invoiceBody = invoiceBody.replace(regExp, result[1][0][tags[tagIndex].tagName]);
                                    }
                                }
                            }
                        }

                        if (tableTags) {

                            tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>';

                            for (var tableTagIndex = 0; tableTagIndex < tableTags.length; tableTagIndex++) {

                                tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags[tableTagIndex].displayTagAs + "</th>";
                            }
                            tableContent += "</tr>";

                            for (var candidateCount = 0; candidateCount < result[2].length; candidateCount++) {
                                tableContent += "<tr>";
                                for (var tableTagIndex = 0; tableTagIndex < tableTags.length; tableTagIndex++) {
                                    tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[2][candidateCount][tableTags[tableTagIndex].tagName] + "</td>";
                                }
                                tableContent += "</tr>";
                            }

                            tableContent += "</table>";

                        }

                        invoiceBody = invoiceBody.replace('[table]', tableContent);

                        var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };

                        var myBuffer = [];
                        var buffer = new Buffer(invoiceBody, 'utf16le');
                        for (var i = 0; i < buffer.length; i++) {
                            myBuffer.push(buffer[i]);
                        }

                        // var attachmentObjectsList = [];
                        // htmlpdf.create(invoiceBody, options).toBuffer(function (err, buffer) {
                            // attachment = {
                            //     filename: "INVOICE" + req.query.invoiceNumber+'.pdf',
                            //     extension:'pdf',
                            //     content: buffer
                            // };


                            var attachmentObjectsList = [];
                            htmlpdf.create(invoiceBody, options).toBuffer(function (err, buffer) {
                                attachmentObjectsList = [{
                                    filename: "INVOICE" + req.query.invoiceNumber+'.pdf',
                                    content: buffer

                                }];

                                // var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                // var email = new sendgrid.Email();
                                // email.from = "noreply@talentMicro.com";
                                // email.to = 'sundar@talentmicro.com';
                                // email.subject = "Invoice generated";
                                // email.html = '<h1>asfasdasdasdasdasds</h1>';
                                // email.cc = mailOptions.cc;
                                // email.bcc = mailOptions.bcc;
                                // email.html = mailOptions.html;
                                //if 1 or more attachments are present

                                // email.addFile({
                                //     filename: attachmentObjectsList[0].filename,
                                //     content: attachmentObjectsList[0].content,
                                //     contentType: "application/pdf"
                                // });

                                // sendgrid.send(email, function (err, result) {
                                //     if(!err) console.log(err);
                                //     console.log(result);
                                // });
                                //     console.log('buffer',buffer);
                                //     var wstream = fs.createWriteStream('invoiceGen');
                                //     wstream.write(buffer);
                                //     wstream.end();

                                response.data = {
                                    invoiceBody: invoiceBody,
                                    tableContent: tableContent,
                                    invoiceDetails: (result[0] && result[0][0]) ? result[0][0] : {},
                                    clientDetails: (result[1] && result[1][0]) ? result[1] : {},
                                    applicantDetails: (result[2] && result[2][0]) ? result[2] : [],
                                    taxData: (result[3] && result[3][0]) ? result[3] : [],
                                    bufferPdf: attachmentObjectsList[0].content
                                }
                                res.status(200).json(response);

                            });
                    // });
                    }

                    else {
                        response.status = false;
                        response.message = "Error while generating invoice";
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


billingCtrl.savePaceReqAppBilling = function (req, res, next) {
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

    if (!req.body.stageId) {
        error.stageId = 'Invalid stageId';
        validationFlag *= false;
    }

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = []
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
                req.body.amount = req.body.amount ? req.body.amount : 0;
                req.body.description = req.body.description ? req.body.description : '';


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(JSON.stringify(req.body.billData || []))
                ];

                var procQuery = 'CALL wm_save_pacehcmAllBillingAmount( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {

                        if(result[0][0].billData && JSON.parse(result[0][0].billData).length){
                            result[0][0].billData = result[0][0].billData ? JSON.parse(result[0][0].billData):[];

                            for(var i=0; i< result[0][0].billData[i].length; i++){

                                result[0][0].billData[i].billTo = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].billTo && JSON.parse(result[0][0].billData[i].billTo).id) ? JSON.parse(result[0][0].billData[i].billTo) : {};
    
                                result[0][0].billData[i].amountCurrency = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountCurrency && JSON.parse(result[0][0].billData[i].amountCurrency).currencyId) ? JSON.parse(result[0][0].billData[i].amountCurrency) : {};
    
                                result[0][0].billData[i].amountScale = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountScale && JSON.parse(result[0][0].billData[i].amountScale).scaleId) ? JSON.parse(result[0][0].billData[i].amountScale) : {};
    
                                result[0][0].billData[i].amountDuration = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountDuration && JSON.parse(result[0][0].billData[i].amountDuration).durationId) ? JSON.parse(result[0][0].billData[i].amountDuration) : {};
    
                              
                            }
                        }

                        response.status = true;
                        response.message = "Billing Data saved sucessfully";
                        response.error = null;
                        response.data = result[0] && result[0][0] ? result[0] : [];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Bill Data saved sucessfully";
                        response.error = null;
                        response.data = [];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving bill data";
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


billingCtrl.getPaceReqAppBilling = function (req, res, next) {
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

    if (!req.query.stageId) {
        error.stageId = 'Invalid stageId';
        validationFlag *= false;
    }

    if (!req.query.reqAppId) {
        error.reqAppId = 'Invalid reqAppId';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqAppId),
                    req.st.db.escape(req.query.stageId)
                ];

                var procQuery = 'CALL wm_get_pacehcmReqAppBillingList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        
                        if(result[0][0].billData && JSON.parse(result[0][0].billData).length){
                            result[0][0].billData = result[0][0].billData ? JSON.parse(result[0][0].billData):[];
                            for(var i=0; i< result[0][0].billData[i].length; i++){

                                result[0][0].billData[i].billTo = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].billTo && JSON.parse(result[0][0].billData[i].billTo).id) ? JSON.parse(result[0][0].billData[i].billTo) : {};
    
                                result[0][0].billData[i].amountCurrency = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountCurrency && JSON.parse(result[0][0].billData[i].amountCurrency).currencyId) ? JSON.parse(result[0][0].billData[i].amountCurrency) : {};
    
                                result[0][0].billData[i].amountScale = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountScale && JSON.parse(result[0][0].billData[i].amountScale).scaleId) ? JSON.parse(result[0][0].billData[i].amountScale) : {};
    
                                result[0][0].billData[i].amountDuration = (result[0] && result[0][0]  && result[0][0].billData[i] && result[0][0].billData[i].amountDuration && JSON.parse(result[0][0].billData[i].amountDuration).durationId) ? JSON.parse(result[0][0].billData[i].amountDuration) : {};
                              
                            }
                        }
                     
                        response.status = true;
                        response.message = "Billing data loaded sucessfully";
                        response.error = null;
                        response.data = (result[0] && result[0][0]) ? result[0] : [];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "Bill Data could not be loaded sucessfully";
                        response.error = null;
                        response.data = [];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading bill data";
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