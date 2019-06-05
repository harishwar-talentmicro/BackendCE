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

var convert = require('xml-js');
var request = require('request');
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


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));


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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                                    count: (result[1] && result[1][0]) ? result[1][0].count : 0,
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }
                            else if (!err) {
                                response.status = false;
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



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

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

                    if (!err && result && result[0]) {
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
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }

                            else if (!err && result && result[0] && result[0][0]) {
                                response.status = true;
                                response.message = "Invoice template saved sucessfully";
                                response.error = null;
                                response.data = {
                                    invoiceTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
                                }
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

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
                                tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;border-spacing: 0;border-collapse: collapse;font-size: 8px;"><tr>'
                                console.log(tableContent, 'mailbody');
                                for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;font-family: Verdana,sans-serif;font-size: 8px !important;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                }
                                tableContent += "</tr>";
                                for (var candidateCount = 0; candidateCount < result[0].length; candidateCount++) {
                                    tableContent += "<tr>";
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        tableContent += '<td style="border: 1px solid #ddd;vertical-align: top;border-top: 1px solid #ddd;font-size:8px !important;">' + result[0][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
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


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;


                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(codes)),
                            req.st.db.escape(req.body.invoiceDate),
                            req.st.db.escape(req.body.invoiceNumber),
                            req.st.db.escape(JSON.stringify(reqApplicants)),
                            req.st.db.escape(JSON.stringify(req.body.billId || [])),
                            req.st.db.escape(req.body.invoiceDueDate)
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
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
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
                    req.st.db.escape(req.query.invoiceNumber)
                ];

                var procQuery = 'CALL wm_paceInvoiceGeneration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[1] && result[0][0] && result[1][0]) {
                        response.status = true;
                        response.message = "Invoice generated sucessfully";
                        response.error = null;
                        var subTotalAmount = 0;
                        var totalAmount = 0;
                        fs.readFile('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/paceinvoice.html', 'utf-8', function (err, data) {
                            console.log('error from reading', err);
                            var taxTemplate = JSON.parse(result[0][0].taxTemplate);
                            var tags = JSON.parse(result[0][0].tags);
                            var tableTags = JSON.parse(result[0][0].tableTags);
                            var attachment = (result[0][0] && result[0][0].attachment) ? JSON.parse(result[0][0].attachment) : [];


                            var tableContent = '';

                            var invoiceBody = result[0][0].invoiceBody || '';
                            if (tags) {
                                for (var tagIndex = 0; tagIndex < tags.length; tagIndex++) {
                                    if (tags[tagIndex]) {
                                        // var reg = '[invoice.' + tags[tagIndex].tagName+']';
                                        // var regExp = new RegExp(reg, 'g');
                                        // console.log('regExp', regExp);
                                        if (result[2] && result[2][0] && result[2][0][tags[tagIndex].tagName]) {
                                            invoiceBody = invoiceBody.replace('[invoice.' + tags[tagIndex].tagName + ']', result[2][0][tags[tagIndex].tagName]);
                                        }

                                        if (result[1] && result[1][0] && result[1][0][tags[tagIndex].tagName]) {
                                            invoiceBody = invoiceBody.replace('[invoice.' + tags[tagIndex].tagName + ']', result[1][0][tags[tagIndex].tagName]);
                                        }
                                    }
                                }
                            }





                            if (tableTags) {

                                tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;border-spacing: 0;border-collapse: collapse;font-size: 8px;"><tr>';

                                for (var tableTagIndex = 0; tableTagIndex < tableTags.length; tableTagIndex++) {

                                    tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;font-family: Verdana,sans-serif;font-size: 8px !important;padding:3px;">' + tableTags[tableTagIndex].displayTagAs + "</th>";
                                }
                                tableContent += "</tr>";

                                for (var candidateCount = 0; candidateCount < result[2].length; candidateCount++) {
                                    tableContent += "<tr>";
                                    for (var tableTagIndex = 0; tableTagIndex < tableTags.length; tableTagIndex++) {
                                        if (tableTagIndex != 0) {

                                            if (tableTagIndex == tableTags.length - 1) {
                                                subTotalAmount += result[2][candidateCount][tableTags[tableTagIndex].tagName.split('.')[1]];
                                                if (result[2][candidateCount][tableTags[tableTagIndex].tagName.split('.')[1]])
                                                    tableContent += '<td style="text-align:right;border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;">' + result[2][candidateCount][tableTags[tableTagIndex].tagName.split('.')[1]] + "</td>";
                                                else
                                                    tableContent += '<td style="text-align:center;border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;">' + '-' + "</td>";
                                            }
                                            else
                                                if (result[2][candidateCount][tableTags[tableTagIndex].tagName.split('.')[1]])
                                                    tableContent += '<td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;">' + (result[2][candidateCount][tableTags[tableTagIndex].tagName.split('.')[1]]) + "</td>";
                                                else
                                                    tableContent += '<td style="text-align:center;border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;">' + '-' + "</td>";
                                        }
                                        else
                                            tableContent += '<td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;">' + (candidateCount + 1) + "</td>";
                                    }
                                    tableContent += "</tr>";
                                }
                                totalAmount = subTotalAmount;

                                //tax template for loop. run forloop on tax tags length
                                if (taxTemplate && taxTemplate.taxCodes) {
                                    for (var taxCount = 0; taxCount < taxTemplate.taxCodes.length; taxCount++) {
                                        if (taxTemplate.taxCodes[taxCount]) {
                                            // var reg = '[invoice.' + tags[tagIndex].tagName+']';
                                            // var regExp = new RegExp(reg, 'g');
                                            // console.log('regExp', regExp);
                                            var taxAmt = (subTotalAmount * taxTemplate.taxCodes[taxCount].percentage) / 100;
                                            totalAmount += taxAmt;
                                            tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">' + taxTemplate.taxCodes[taxCount].code + '</td>';
                                            tableContent += '<td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;text-align:right;" colspan="1">' + taxAmt + '</td></tr>';

                                        }
                                    }
                                }
                                // for (var taxCount = 0; taxCount < 3; taxCount++) {
                                //     tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">' + result[1][0][taxTemplate[tagIndex].tagName] + '</td>';
                                //     tableContent += '<td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="1">100</td></tr>';
                                // }
                                tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">Total</td>';
                                tableContent += '<td colspan="1" style="text-align:right;padding:3px;">' + totalAmount + '</td></tr>'
                                tableContent += "</table>";

                            }

                            invoiceBody = invoiceBody.replace('[invoice.BillingTable]', tableContent);
                            data = data.replace('[Content]', invoiceBody);
                            data = data.replace(/(<p>&nbsp;<\/p><p>&nbsp;<\/p>)+/g, '<p>&nbsp;<\/p>');
                            // data = data.replace(/\n/g, '<br>');
                            // console.log(data);

                            var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };

                            var myBuffer = [];
                            var buffer = new Buffer(data, 'utf16le');
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
                            htmlpdf.create(data, options).toBuffer(function (err, buffer) {
                                console.log(err);
                                attachmentObjectsList = [{
                                    filename: "INVOICE" + req.query.invoiceNumber + '.pdf',
                                    content: buffer

                                }];

                                var uniqueId = uuid.v4();
                                var timestamp = Date.now();
                                aUrl = uniqueId + '.pdf';

                                console.log("buffer content", attachmentObjectsList[0].content);

                                fs.writeFile("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/invoice" + timestamp + ".pdf", buffer, function (err) {
                                    if (!err) {
                                        console.log("file written");
                                        var readStream = fs.createReadStream('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/invoice' + timestamp + '.pdf');

                                        uploadDocumentToCloud(aUrl, readStream, function (err) {
                                            if (!err) {

                                                var invoiceQuery = "call wm_save_PaceGeneratedInvoice(" + req.st.db.escape(req.query.invoiceNumber) + ",'" + aUrl + "')";
                                                console.log(invoiceQuery);
                                                req.db.query(invoiceQuery, function (err, invoiceresult) {
                                                    if (!err && invoiceresult && invoiceresult[0] && invoiceresult[0][0]) {
                                                        console.log("Invoice generated saved successfully");

                                                        response.data = {
                                                            invoiceBody: data,
                                                            tableContent: tableContent,
                                                            invoiceDetails: (result[0] && result[0][0]) ? result[0][0] : {},
                                                            clientDetails: (result[1] && result[1][0]) ? result[1] : {},
                                                            applicantDetails: (result[2] && result[2][0]) ? result[2] : [],
                                                            taxData: (result[3] && result[3][0]) ? result[3] : [],
                                                            bufferPdf: attachmentObjectsList[0].content,
                                                            invoicePdfCdnPath: aUrl
                                                        }
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                            res.status(200).json(response);
                                                        });

                                                    }
                                                });
                                                console.log("err", err);
                                                console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
                                                fs.unlink('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/invoice' + timestamp + '.pdf', function (err) {
                                                    if (!err) {
                                                        console.log('File Deleted');
                                                    }
                                                });


                                            }
                                        });
                                    }
                                });
                            });
                        })

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



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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

                                if (result[0][0].billData && JSON.parse(result[0][0].billData).length) {
                                    result[0][0].billData = result[0][0].billData ? JSON.parse(result[0][0].billData) : [];

                                    for (var i = 0; i < result[0][0].billData[i].length; i++) {

                                        result[0][0].billData[i].billTo = (result[0] && result[0][0] && result[0][0].billData[i] && result[0][0].billData[i].billTo && JSON.parse(result[0][0].billData[i].billTo).id) ? JSON.parse(result[0][0].billData[i].billTo) : {};

                                        result[0][0].billData[i].amountCurrency = (result[0] && result[0][0] && result[0][0].billData[i] && result[0][0].billData[i].amountCurrency && JSON.parse(result[0][0].billData[i].amountCurrency).currencyId) ? JSON.parse(result[0][0].billData[i].amountCurrency) : {};

                                        result[0][0].billData[i].amountScale = (result[0] && result[0][0] && result[0][0].billData[i] && result[0][0].billData[i].amountScale && JSON.parse(result[0][0].billData[i].amountScale).scaleId) ? JSON.parse(result[0][0].billData[i].amountScale) : {};

                                        result[0][0].billData[i].amountDuration = (result[0] && result[0][0] && result[0][0].billData[i] && result[0][0].billData[i].amountDuration && JSON.parse(result[0][0].billData[i].amountDuration).durationId) ? JSON.parse(result[0][0].billData[i].amountDuration) : {};


                                    }
                                }

                                response.status = true;
                                response.message = "Billing Data saved sucessfully";
                                response.error = null;
                                response.data = result[0] && result[0][0] ? result[0] : [];
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else if (!err) {
                                response.status = false;
                                response.message = "Cuuld not save data";
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

                        if (result[0][0].billData && JSON.parse(result[0][0].billData).length) {
                            result[0][0].billData = result[0][0].billData ? JSON.parse(result[0][0].billData) : [];
                            for (var i = 0; i < result[0][0].billData.length; i++) {

                                result[0][0].billData[i].documents = result[0][0].billData[i] && result[0][0].billData[i].documents && JSON.parse(result[0][0].billData[i].documents) ? JSON.parse(result[0][0].billData[i].documents) : [];
                            }

                        }

                        response.status = true;
                        response.message = "Billing data loaded sucessfully";
                        response.error = null;
                        response.data = (result[0] && result[0][0]) ? result[0] : [];
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

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


billingCtrl.savePaceFollowUpNotes = function (req, res, next) {
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

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    if (!req.body.type) {
                        error.type = 'Invalid type';
                        validationFlag *= false;
                    }

                    var followUpNotes = req.body.followUpNotes;
                    if (typeof (followUpNotes) == "string") {
                        followUpNotes = JSON.parse(followUpNotes);
                    }
                    if (!followUpNotes) {
                        followUpNotes = []
                    }


                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                        if (req.body.type == 1)
                            clientorReqorResumeId = req.body.clientId || 0;
                        else if (req.body.type == 2)
                            clientorReqorResumeId = req.body.requirementId || 0;
                        else if (req.body.type == 3)
                            clientorReqorResumeId = req.body.applicantId || 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(clientorReqorResumeId),
                            req.st.db.escape(JSON.stringify(followUpNotes))
                        ];

                        var procQuery = 'CALL wm_save_paceFollowUpNotes( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0] && result[0][0]) {

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].followUpNotes = (result[0] && result[0][i]) ? JSON.parse(result[0][i].followUpNotes) : [];
                                }

                                response.status = true;
                                response.message = "followUp Data saved sucessfully";
                                response.error = null;
                                response.data = result[0] && result[0][0] ? result[0] : [];

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else if (!err) {
                                response.status = false;
                                response.message = "Something went wrong";
                                response.error = null;
                                response.data = [];
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving followUp data";
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

billingCtrl.getPaceFollowUpNotes = function (req, res, next) {
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

    if (!req.query.type) {
        error.type = 'Invalid type';
        validationFlag *= false;
    }

    if (req.query.type == 1) {
        if (!req.query.clientId) {
            error.clientId = 'Invalid clientId';
            validationFlag *= false;
        }
    }
    else if (req.query.type == 2) {
        if (!req.query.requirementId) {
            error.requirementId = 'Invalid requirementId';
            validationFlag *= false;
        }
    }
    else {
        if (!req.query.applicantId) {
            error.applicantId = 'Invalid applicantId';
            validationFlag *= false;
        }
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

                if (req.query.type == 1)
                    clientorReqorResumeId = req.query.clientId || 0;
                else if (req.query.type == 2)
                    clientorReqorResumeId = req.query.requirementId || 0;
                else if (req.query.type == 3)
                    clientorReqorResumeId = req.query.requirementId || 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(clientorReqorResumeId)
                ];

                var procQuery = 'CALL wm_get_paceFollowUpNotes( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].followUpNotes = (result[0] && result[0][i]) ? result[0][i].followUpNotes : [];
                        }

                        response.status = true;
                        response.message = "followUp data loaded sucessfully";
                        response.error = null;
                        response.data = (result[0] && result[0][0]) ? result[0] : [];

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "followUp Data could not be loaded";
                        response.error = null;
                        response.data = [];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading followUp data";
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

billingCtrl.billingFilterNew = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                        req.body.billUnbill = req.body.billUnbill ? req.body.billUnbill : 0;
                        req.body.invoiceNumber = req.body.invoiceNumber ? req.body.invoiceNumber : '';
                        req.body.name = req.body.name ? req.body.name : '';

                        req.body.start = req.body.start ? req.body.start : 1;
                        req.body.limit = (req.body.limit) ? req.body.limit : 50;

                        req.body.start = ((((req.body.start) * req.body.limit) + 1) - req.body.limit) - 1;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(billStage)),
                            req.st.db.escape(JSON.stringify(billBranch)),
                            req.st.db.escape(req.body.heDepartmentId),
                            req.st.db.escape(req.body.billUnbill),
                            req.st.db.escape(req.body.billTo),
                            req.st.db.escape(req.body.start),
                            req.st.db.escape(req.body.limit),
                            req.st.db.escape(req.body.invoiceNumber),
                            req.st.db.escape(req.body.name)
                        ];
                        var procQuery = 'CALL wm_get_PacebillingFilterNew( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0][0]) {
                                response.status = true;
                                response.message = "Billing Data loaded sucessfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].amountCurrency = (result[0][i].amountCurrency && JSON.parse(result[0][i].amountCurrency).currencyId) ? JSON.parse(result[0][i].amountCurrency) : {};

                                    result[0][i].amountScale = (result[0][i].amountScale && JSON.parse(result[0][i].amountScale).scaleId) ? JSON.parse(result[0][i].amountScale) : {};

                                    result[0][i].amountDuration = (result[0][i].amountDuration && JSON.parse(result[0][i].amountDuration).durationId) ? JSON.parse(result[0][i].amountDuration) : {};

                                    result[0][i].documents = result[0] && result[0][i] && JSON.parse(result[0][i].documents) ? JSON.parse(result[0][i].documents) : []
                                }

                                response.data = {
                                    billingData: (result[0] && result[0][0]) ? result[0] : [],
                                    count: (result[1] && result[1][0]) ? result[1][0].count : 0,
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else if (!err) {
                                response.status = false;
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

                });

            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


billingCtrl.imapFinally = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var imaps = require('imap-simple');
    var config = {
        imap: {
            user: 'arun@jobraiser.com',
            password: 'arun@007',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000
        }
    };

    imaps.connect(config).then(function (connection) {

        connection.openBox('INBOX').then(function () {

            // Fetch emails from the last 24h
            var delay = 24 * 3600 * 1000;
            var yesterday = new Date();
            yesterday.setTime(Date.now() - delay);
            yesterday = yesterday.toISOString();
            var searchCriteria = ['UNSEEN', ['SUBJECT', 'testing'], ['SINCE', yesterday]];
            var fetchOptions = {
                bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                struct: true,
                markSeen: true
            };

            // retrieve only the headers of the messages
            return connection.search(searchCriteria, fetchOptions);
        }).then(function (messages) {

            var attachments = [];

            messages.forEach(function (message) {
                var parts = imaps.getParts(message.attributes.struct);
                attachments = attachments.concat(parts.filter(function (part) {
                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                }).map(function (part) {
                    // retrieve the attachments only of the messages with attachments
                    return connection.getPartData(message, part)
                        .then(function (partData) {
                            return {
                                filename: part.disposition.params.filename,
                                data: partData
                            };
                        });
                }));
            });

            return Promise.all(attachments);
        }).then(function (attachments) {
            console.log('attachments', attachments);
            response.data = attachments;

            // =>
            //    [ { filename: 'cats.jpg', data: Buffer() },
            //      { filename: 'pay-stub.pdf', data: Buffer() } ]
            for (var i = 0; i < attachments.length; i++) {

                return new Promise(function (resolve, reject) {

                    var uniqueId = uuid.v4();
                    var timestamp = Date.now();
                    var filetype = attachments[i].filename ? attachments[i].filename.split('.')[1] : '';
                    // var filetype = (attachments[i].filename && attachments[i].filename && attachments[i].filename.extension) ? attachments[i].filename.extension : '';

                    aUrl = uniqueId + '.' + filetype;
                    ///home/ezeonetalent/ezeone1/api/routes/api/JobRaiser
                    console.log('aUrl', aUrl);
                    console.log("req.files.attachment.path", attachments[i].filename);
                    // C:\Users\TM2\Documents\gitproject\routes\api\JobRaiser\settings\imap.js
                    fs.writeFile("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/imap" + timestamp + "." + filetype, attachments[i].data, function (err) {
                        if (!err) {
                            console.log("file written");
                            var readStream = fs.createReadStream('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/imap' + timestamp + '.' + filetype);
                            console.log('file read', readStream);
                            uploadDocumentToCloud(aUrl, readStream, function (err) {
                                if (!err) {
                                    console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);

                                    fs.unlink("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/billing/imap" + timestamp + "." + filetype, function (err) {
                                        if (!err) {
                                            console.log('File Deleted');
                                        }
                                    });

                                    //take attachment one by one and parse and save
                                    var formData = {
                                        file: {
                                            value: 'https://storage.googleapis.com/ezeone/' + aUrl,   // put full path
                                            options: {
                                                filename: 'https://storage.googleapis.com/ezeone/' + aUrl,
                                                contentType: 'application/*'
                                            }
                                        }
                                    };

                                    request.post({
                                        url: 'https://dms.tallint.com/parsing/jobraiser/parsing/?IsEmployment=false',
                                        //   headers : {
                                        //         "Authorization" : auth,
                                        //     "X-Atlassian-Token" : "nocheck"
                                        //       }, 
                                        formData: formData
                                    }, function optionalCallback(err, httpResponse, body) {
                                        if (err) {
                                            return console.error('upload failed:', err);
                                        }
                                        else {

                                            var body = body.replace(/^"(.*)"$/, '$1');

                                            var options = {
                                                trim: true,
                                                compact: true,
                                                ignoreComment: true,
                                                alwaysChildren: true,
                                                instructionHasAttributes: true,
                                                ignoreText: false,
                                                ignoreAttributes: true
                                            };
                                            var jsonResult = convert.xml2json(body, options);

                                            var jsonResponse = JSON.parse(jsonResult);
                                            var Document = jsonResponse.Document;
                                            console.log(jsonResponse);
                                            console.log(typeof (Document));

                                            var Name = Document.Name._text;
                                            // var firstName = Name.split(' ')[0];
                                            // var lastName = Name.split(' ')[1];

                                            var DOB = Document.DOB._text ? Document.DOB._text : undefined;
                                            var gender = Document.Gender._text ? Document.Gender._text : undefined;
                                            var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
                                            var emailId = Document.EMail._text ? Document.EMail._text : '';
                                            var SkillText = Document.SkillText._text ? Document.SkillText._text : '';
                                            var skills = SkillText.split(',');  // splits skills and forms array of skills

                                            var applicantId = 0;
                                            var heMasterId = 2;
                                            var mobileISD = '+91';
                                            var cvPath = aUrl ? aUrl : '';

                                            // var inputs = [
                                            //     req.st.db.escape(heMasterId),
                                            //     req.st.db.escape(applicantId),
                                            //     req.st.db.escape(firstName),
                                            //     req.st.db.escape(lastName),
                                            //     // req.st.db.escape(DOB),
                                            //     // req.st.db.escape(gender),
                                            //     req.st.db.escape(mobileISD),
                                            //     req.st.db.escape(mobileNumber),
                                            //     // req.st.db.escape(passportNumber),
                                            //     // req.st.db.escape(passportExpiryDate),
                                            //     req.st.db.escape(emailId),
                                            //     req.st.db.escape(JSON.stringify(skills)),
                                            //     req.st.db.escape(cvPath)
                                            // ];

                                            // var procQuery = 'CALL wm_save_cvSouringApplicant( ' + inputs.join(',') + ')';
                                            // console.log(procQuery);

                                            // req.db.query(procQuery, function (cvErr, cvResult) {
                                            //     console.log(cvErr);

                                            //     if (!cvErr && cvResult && cvResult[0] && cvResult[0][0].applicantId) {


                                            //         var mailContent = (cvResult[3] && cvResult[3][0]) ? cvResult[3][0].mailBody : "Dear [FirstName] <br>Thank you for registering your profile.  We will revert to you once we find your Resume match one of the requirements we have.In the mean time, please [ClickHere] to upload your latest CV that will help us with more detailed information about your profile.Wishing you all the best<br><br>[WalkINSignature]<br>[Disclaimer]";

                                            //         if (mailContent) {
                                            //             mailContent = mailContent.replace("[FirstName]", req.body.firstName);
                                            //             mailContent = mailContent.replace("[FullName]", (req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName));

                                            //             var webLink = (cvResult[3] && cvResult[3][0]) ? cvResult[3][0].webLink : "";

                                            //             // For updating resume though url link after registering for walkIn

                                            //             var applicantId = (cvResult[4] && cvResult[4][0]) ? cvResult[4][0].applicantId : undefined;
                                            //             applicantId = Date.now().toString().concat(applicantId);
                                            //             var webLinkTo = cvResult[3][0].whatmateWebTestOrLive + applicantId;
                                            //             webLinkTo = webLinkTo.replace('"', '');
                                            //             webLinkTo = webLinkTo.replace('"', '');

                                            //             mailContent = mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + webLinkTo + ">Click Here</a>");
                                            //             // ------------------------------------------------

                                            //             // mailContent = mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + webLink + ">Click Here</a>");

                                            //             var walkInSignature = (cvResult[3] && cvResult[3][0]) ? cvResult[3][0].walkInSignature : "";
                                            //             var disclaimer = (cvResult[3] && cvResult[3][0]) ? cvResult[3][0].disclaimer : "";

                                            //             mailContent = mailContent.replace("[WalkINSignature]", walkInSignature);
                                            //             mailContent = mailContent.replace("[Disclaimer]", disclaimer);
                                            //         }

                                            //         var subject = cvResult[3][0].mailSubject ? cvResult[3][0].mailSubject : 'Registration Completed Successfully';
                                            //         var bcc=[];
                                            //         if(cvResult[3][0] && cvResult[3][0].bccMailId && typeof(cvResult[3][0].bccMailId) =='string'){
                                            //             bcc = cvResult[3][0].bccMailId ? JSON.parse(cvResult[3][0].bccMailId) : [];
                                            //         }

                                            //         // send mail to candidate
                                            //         var email = new sendgrid.Email();
                                            //         email.from = cvResult[2][0].fromEmailId ? cvResult[2][0].fromEmailId : 'noreply@talentmicro.com';
                                            //         email.to = req.body.emailId;
                                            //         email.subject = subject;
                                            //         email.html = mailContent;
                                            //         email.bcc = bcc;

                                            //         sendgrid.send(email, function (err11, result11) {
                                            //             if (err11) {
                                            //                 console.log("Failed to send to candidate", err11);
                                            //             }
                                            //             else {
                                            //                 mailSent = 1;
                                            //                 console.log("mail sent successfully to candidate", result11);
                                            //             }
                                            //         });  // sendgrid



                                            //     }
                                            // }); // db query

                                        }
                                    });  // tallint parse

                                }
                            }); //upload to cloud

                        }
                    });
                    // var readStream = fs.createReadStream(attachments[i].data);

                    resolve('');
                });
            }
        });
    });
    // response.data = attachments;
    res.status(200).json(response);

};

module.exports = billingCtrl;