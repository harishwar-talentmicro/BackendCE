var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var htmlpdf = require('html-pdf');
var FormData = require('form-data');
// var streamifier = require('streamifier');
var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var settingsCtrl = {};
var error = {};


var gcloud = require('gcloud');
var fs = require('fs');
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

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */
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


var attachmentFunction = function (req, attachments, i) {
    // console.log("attachments attachments",attachments);
    var heMasterId = 1000;
    var subject = attachments.subject ? attachments.subject : '';
    var inputs = [
        req.st.db.escape(subject),
        req.st.db.escape(heMasterId)
    ];

    var procQuery = 'call pace_autoSourcing_CheckJobCodeInSubject(' + inputs.join(',') + ')';
    req.db.query(procQuery, function (checkJobCodeErr, checkJobCodeResult) {
        // console.log("Error in fetching req id",checkJobCodeErr);
        if (!checkJobCodeErr && checkJobCodeResult && checkJobCodeResult[0] && checkJobCodeResult[0][0] && checkJobCodeResult[0][0].jobCode) {
            // console.log("requirementId",checkJobCodeResult[0][0].requirementId);
            var uniqueId = uuid.v4();
            var timestamp = Date.now();
            var filetype = attachments.filename ? attachments.filename.split('.')[1] : '';
            var aUrl = uniqueId + '.' + filetype;
            var jobCode = checkJobCodeResult[0][0].jobCode;
            var requirementId = checkJobCodeResult[0][0].requirementId;
            ///home/ezeonetalent/ezeone1/api/routes/api/JobRaiser
            // "/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/imap"
            // C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap

            fs.writeFile("C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap" + (timestamp + i) + "." + filetype, attachments.data, function (writeErr) {
                if (!writeErr) {
                    console.log("file written", i);
                    var readStream = fs.createReadStream('C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap' + (timestamp + i) + '.' + filetype);

                    var formData = {
                        name: "attachment",
                        attachment: fs.createReadStream('C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap' + (timestamp + i) + '.' + filetype)
                    };

                    request({
                        url: 'https://dms.tallint.com/parsing/jobraiser/parsing/?IsEmployment=false',
                        method: "POST",
                        //   headers : {
                        //         "Authorization" : auth,
                        //     "X-Atlassian-Token" : "nocheck"
                        //       }, 
                        // ContentType: "application/*",
                        formData: formData
                    }, function optionalCallback(parseErr, httpResponse, body) {
                        if (parseErr) {
                            console.error('upload failed:', parseErr);
                            fs.unlink("C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap" + (timestamp + i) + "." + filetype, function (unLinkFileErr) {
                                if (!unLinkFileErr) {
                                    console.log('File Deleted');
                                }
                            });
                        }
                        else {
                            fs.unlink("C:/Users/TM2/Documents/gitproject/routes/api/JobRaiser/settings/imap" + (timestamp + i) + "." + filetype, function (unLinkFileErr) {
                                if (!unLinkFileErr) {
                                    console.log('File Deleted');
                                }
                            });
                            console.log("tallint parsed success", body);

                            uploadDocumentToCloud(aUrl, readStream, function (uploadToCloudErr) {
                                if (!uploadToCloudErr) {
                                    console.log('attachment Uploaded successfully', i, aUrl);

                                    // console.log('xml body', body);
                                    body = body.replace(/^"(.*)"$/, '$1');

                                    var options = {
                                        trim: true,
                                        compact: true,
                                        ignoreComment: true,
                                        alwaysChildren: true,
                                        instructionHasAttributes: true,
                                        ignoreText: false,
                                        ignoreAttributes: true
                                    };
                                    var convert = require('xml-js');
                                    var jsonResult = convert.xml2json(body, options);

                                    var jsonResponse = JSON.parse(jsonResult);
                                    var Document = jsonResponse.Document;
                                    // console.log(jsonResponse);
                                    // console.log(typeof (Document));

                                    var Name = Document.Name._text;
                                    var firstName = "";
                                    var lastName = "";
                                    if (Name && Name.split(' ')[0])
                                        firstName = Name.split(' ')[0];

                                    if (Name && Name.split(' ')[1])
                                        lastName = Name.split(' ')[1];

                                    // var DOB = Document.DOB._text ? Document.DOB._text : undefined;
                                    var gender = Document.Gender._text ? Document.Gender._text : undefined;
                                    var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
                                    var emailId = Document.EMail._text ? Document.EMail._text : '';

                                    var passportNumber = Document.Passport._text ? Document.Passport._text : '';
                                    var skillText = Document.SkillText._text ? Document.SkillText._text : '';
                                    if (skillText != "") {
                                        var skills = skillText.split(',');  // splits skills and forms array of skills
                                    }
                                    else {
                                        var skills = [];
                                    }
                                    var passportExpiryDate = Document.PassportExpiryDate._text ? Document.PassportExpiryDate._text : undefined;
                                    var PassportIssueDate = Document.PassportIssueDate._text ? Document.PassportIssueDate._text : undefined;
                                    console.log("firstName, lastName, skills", firstName, lastName, skills);
                                    // var applicantId = 0;
                                    if (gender == 1 || 2) {
                                        gender = gender;
                                    }
                                    else {
                                        gender = 3;
                                    }

                                    if (mobileNumber.length > 14) {
                                        mobileNumber = mobileNumber.slice(0, 14);
                                    }

                                    if (passportNumber.length > 14) {
                                        passportNumber = passportNumber.slice(0, 14);
                                    }

                                    var mobileISD = '+91';
                                    var cvPath = aUrl;

                                    var inputs = [
                                        req.st.db.escape(heMasterId),
                                        req.st.db.escape(firstName),
                                        req.st.db.escape(lastName),
                                        req.st.db.escape(gender),  // 1-male ,2-female 
                                        req.st.db.escape(mobileISD),
                                        req.st.db.escape(mobileNumber),
                                        req.st.db.escape(passportNumber),
                                        req.st.db.escape(passportExpiryDate),
                                        req.st.db.escape(PassportIssueDate),
                                        req.st.db.escape(emailId),
                                        req.st.db.escape(JSON.stringify(skills || [])),
                                        req.st.db.escape(cvPath),
                                        req.st.db.escape(requirementId)
                                    ];
                                    var procQuery = 'CALL pace_saveAppicant_autoSourcing( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    // if (emailId && emailId != "") {
                                    req.db.query(procQuery, function (cvErr, cvResult) {
                                        console.log(cvErr);
                                        if (cvErr) {
                                            console.log("Error while saving auto-sourced resume", cvErr);
                                        }
                                        else {
                                            console.log("Resume auto-sourced successfully", cvResult);

                                            var mailContent = (cvResult[0] && cvResult[0][0]) ? cvResult[0][0].mailBody : "Dear [FirstName] <br>Thank you for applying.  To shortlist your profile please update your information by clicking on [ClickHere]. We will revert to you once we find your Resume match with the requirement jobCode " + jobCode + ".<br> Wishing you all the best<br><br>[WalkINSignature]<br>[Disclaimer]";

                                            if (mailContent) {
                                                mailContent = mailContent.replace("[FirstName]", Name);

                                                var applicantId = (cvResult[0] && cvResult[0][0]) ? cvResult[0][0].applicantId : undefined;
                                                applicantId = Date.now().toString().concat(applicantId);
                                                var requirementId = (cvResult[0] && cvResult[0][0]) ? cvResult[0][0].requirementId : undefined;
                                                requirementId = Date.now().toString().concat(requirementId);

                                                var autoSourcingWebLink = cvResult[0] && cvResult[0][0] ? cvResult[0][0].autoSourcingWebLink + applicantId + "/" + requirementId : "";
                                                var walkInSignature = (cvResult[0] && cvResult[0][0]) ? cvResult[0][0].walkInSignature : "";
                                                var disclaimer = (cvResult[0] && cvResult[0][0]) ? cvResult[0][0].disclaimer : "";

                                                autoSourcingWebLink = autoSourcingWebLink.replace('"', '');
                                                autoSourcingWebLink = autoSourcingWebLink.replace('"', '');
                                                mailContent = mailContent.replace("[ClickHere]", "<a title='Link' target='_blank' href=" + autoSourcingWebLink + ">Click Here</a>");
                                                mailContent = mailContent.replace("[WalkINSignature]", walkInSignature);
                                                mailContent = mailContent.replace("[Disclaimer]", disclaimer);
                                            }

                                            var subject = cvResult[0][0].mailSubject ? cvResult[0][0].mailSubject : 'Thank you for Applying for ' + jobCode;
                                            var bccMailId = [];
                                            var bcc = cvResult[0] && cvResult[0][0] && cvResult[0][0].bcc ? cvResult[0][0].bcc : "";
                                            if (bcc != "") {
                                                bccMailId = [bcc];
                                            }

                                            // send mail to candidate
                                            if (emailId && emailId != "") {
                                                var email = new sendgrid.Email();
                                                email.from = cvResult[0] && cvResult[0][0] && cvResult[0][0].fromEmailId ? cvResult[0][0].fromEmailId : 'noreply@talentmicro.com';
                                                email.to = emailId;
                                                email.subject = subject;
                                                email.html = mailContent;
                                                email.bcc = bccMailId;

                                                sendgrid.send(email, function (err11, result11) {
                                                    if (err11) {
                                                        console.log("Failed to send mail to applicant", err11);
                                                    }
                                                    else {
                                                        console.log("mail sent successfully to applicant", result11);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log("emailId does not exist of sourcing applicant");
                                            }
                                        }
                                    });
                                    // }
                                    // else {
                                    //     console.log("Mail id does not exist of sourcing applicant");
                                    // }
                                }
                                else {
                                    console.log("File upload failed", uploadToCloudErr);
                                }
                            });
                        }
                    });

                }
                else {
                    console.log("Write file Error: ", writeErr);
                }
            });
            // }
            // });
        }
        else if (!checkJobCodeErr && checkJobCodeResult && checkJobCodeResult[0] && checkJobCodeResult[0][0] && checkJobCodeResult[0][0].error) {
            console.log("error:", checkJobCodeResult[0][0].error);
        }
        else {
            console.log("checkJobCodeErr:", checkJobCodeErr);
        }
    });
}


settingsCtrl.getAccessrightsMaster = function (req, res, next) {
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

                req.query.userManager = req.query.userManager ? req.query.userManager : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userManager)
                ];

                var procQuery = 'CALL wm_accessRightsmaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0] && result[0][0]._error) {
                        response.status = false;
                        response.message = result[0][0]._error;
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }

                    else if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;

                        if (req.query.userManager == 0) {
                            for (var j = 0; j < result[2].length; j++) {
                                result[2][j].templateData = result[2][j].templateData ? JSON.parse(result[2][j].templateData) : [];
                            }
                            response.data = {
                                formDetails: result[0],
                                formRights: result[1],
                                templateDetails: result[2]
                            };
                        }
                        else if (req.query.userManager == 1) {
                            for (var j = 0; j < result[0].length; j++) {
                                result[0][j].templateData = result[0][j].templateData ? JSON.parse(result[0][j].templateData) : [];
                            }
                            response.data = {
                                templateDetails: result[0]
                            };
                        }
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
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


settingsCtrl.saveAccessrightsTemplate = function (req, res, next) {
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

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    if (!req.body.heMasterId) {
                        error.heMasterId = 'Invalid company';
                        validationFlag *= false;
                    }

                    var moduleRights = req.body.moduleRights;
                    if (typeof (moduleRights) == "string") {
                        moduleRights = JSON.parse(moduleRights);
                    }
                    if (!moduleRights) {
                        moduleRights = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.templateId = req.body.templateId ? req.body.templateId : 0;
                        req.body.isAdmin = req.body.isAdmin ? req.body.isAdmin : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.heMasterId),
                            req.st.db.escape(req.body.templateId),
                            req.st.db.escape(req.body.templateName),
                            req.st.db.escape(JSON.stringify(moduleRights)),
                            req.st.db.escape(req.body.isAdmin)

                        ];

                        var procQuery = 'CALL wm_save_accessrightsTemplate( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);
                            if (!err && result[0]) {
                                response.status = false;
                                response.message = "TemplateName already exist";
                                response.error = null;
                                response.data = result[0];
                                res.status(200).json(response);
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "Template saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }

                            else {
                                response.status = false;
                                response.message = "Error while saving Template";
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


settingsCtrl.saveofferTemplate = function (req, res, next) {
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

                    if (!req.body.offerTemplateName) {
                        error.offerTemplateName = 'Invalid offer template name';
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

                    // var taxTemplate = req.body.taxTemplate;
                    // if (!taxTemplate) {
                    //     taxTemplate = []
                    // }
                    // else if (typeof (taxTemplate) == "string") {
                    //     taxTemplate = JSON.parse(taxTemplate);
                    // }

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
                        req.body.offerTemplateId = req.body.offerTemplateId ? req.body.offerTemplateId : 0;
                        req.body.offerSubject = req.body.offerSubject ? req.body.offerSubject : '';
                        req.body.offerBody = req.body.offerBody ? req.body.offerBody : '';
                        req.body.replyMailId = req.body.replyMailId ? req.body.replyMailId : '';
                        req.body.updateFlag = req.body.updateFlag ? req.body.updateFlag : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.body.offerTemplateId),
                            req.st.db.escape(req.body.offerTemplateName),
                            req.st.db.escape(JSON.stringify(tags)),
                            req.st.db.escape(JSON.stringify(tableTags)),
                            req.st.db.escape(req.body.offerSubject),
                            req.st.db.escape(req.body.offerBody),
                            req.st.db.escape(JSON.stringify(toMail)),
                            req.st.db.escape(JSON.stringify(cc)),
                            req.st.db.escape(JSON.stringify(bcc)),
                            req.st.db.escape(JSON.stringify(attachment)),
                            req.st.db.escape(req.body.replyMailId),
                            req.st.db.escape(req.body.updateFlag),
                            req.st.db.escape(JSON.stringify(tableTemplate))

                        ];

                        var procQuery = 'CALL wm_savePaceOfferTemplate( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0] && result[0][0] && result[0][0].templateExists) {
                                response.status = true;
                                response.message = "Offer template already Exists";
                                response.error = null;
                                response.data = {
                                    templateExists: result[0][0].templateExists,
                                    offerTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
                                }


                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }

                            else if (!err && result && result[0] && result[0][0]) {
                                response.status = true;
                                response.message = "Offer template saved sucessfully";
                                response.error = null;
                                response.data = {
                                    offerTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
                                }


                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }

                            else {
                                response.status = false;
                                response.message = "Error while saving Offer template";
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


settingsCtrl.getOfferTemplateMaster = function (req, res, next) {
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
                req.query.offerTemplateId = req.query.offerTemplateId ? req.query.offerTemplateId : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.offerTemplateId)
                ];

                var procQuery = 'CALL wm_get_offerTemplateMaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] || result[2]) {
                        response.status = true;
                        response.message = "Offer templates loaded sucessfully";
                        response.error = null;
                        for (var i = 0; i < result[3].length; i++) {
                            result[3][i].offerBreakUp = result[3][0] && result[3][0] ? JSON.parse(result[3][i].offerBreakUp) : [];
                        }

                        response.data = {
                            offerTemplates: (result[0] && result[0][0]) ? result[0] : [],
                            offerTemplateDetail: (result[1] && result[1][0]) ? JSON.parse(result[1][0].formData) : {},
                            allowanceBreakUp: result[2] && result[2][0] ? result[2] : [],
                            offerBreakUpTemplates: result[3] && result[3][0] ? result[3] : [],
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

                            offerTemplates: [],
                            offerTemplateDetail: {}
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading offer templates";
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


settingsCtrl.saveOfferBreakUpTemplate = function (req, res, next) {
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


                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(req.body.offerBreakUpTemplate || {})),
                            req.st.db.escape(JSON.stringify(req.body.offerBreakUp || [])),

                        ];

                        var procQuery = 'CALL pace_save_offerBreakUpTemplate( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0] && result[0][0] && result[0][0].saveMessage) {
                                response.status = true;
                                response.message = result[0][0].saveMessage;
                                response.error = null;
                                for (var i = 0; i < result[1].length; i++) {
                                    result[1][i].offerBreakUp = result[1][0] && result[1][0] ? JSON.parse(result[1][i].offerBreakUp) : [];
                                }
                                result[2][0].currentOfferBreakUpTemplate = result[2][0] && result[2][0] ? JSON.parse(result[2][i].currentOfferBreakUpTemplate) : {};

                                response.data = {
                                    offerBreakUpTemplates: result[1] && result[1][0] ? result[1] : [],
                                    currentOfferBreakUpTemplate: result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }

                            else if (!err && result && result[0] && result[0][0] && result[0][0].updateMessage) {
                                response.status = true;
                                response.message = result[0][0].updateMessage;
                                response.error = null;
                                for (var i = 0; i < result[1].length; i++) {
                                    result[1][i].offerBreakUp = result[1][0] && result[1][0] ? JSON.parse(result[1][i].offerBreakUp) : [];
                                }

                                result[2][0].currentOfferBreakUpTemplate = result[2][0] && result[2][0] ? JSON.parse(result[2][i].currentOfferBreakUpTemplate) : {};

                                response.data = {
                                    offerBreakUpTemplates: result[1] && result[1][0] ? result[1] : [],
                                    currentOfferBreakUpTemplate: result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}

                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

                            }

                            else if (!err && result && result[0] && result[0][0] && result[0][0].duplicateName) {
                                response.status = false;
                                response.message = result[0][0].duplicateName;
                                response.error = null;
                                for (var i = 0; i < result[1].length; i++) {
                                    result[1][i].offerBreakUp = result[1][0] && result[1][0] ? JSON.parse(result[1][i].offerBreakUp) : [];
                                }

                                result[2][0].currentOfferBreakUpTemplate = result[2][0] && result[2][0] ? JSON.parse(result[2][i].currentOfferBreakUpTemplate) : {};

                                response.data = {
                                    offerBreakUpTemplates: result[1] && result[1][0] ? result[1] : [],
                                    currentOfferBreakUpTemplate: result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}

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
                                    offerBreakUpTemplates: []
                                };
                                res.status(200).json(response);
                            }

                            else {
                                response.status = false;
                                response.message = "Error while loading offer break up templates";
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


settingsCtrl.offerGeneration = function (req, res, next) {
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
                            req.st.db.escape(JSON.stringify(req.body.reqApplicants || [])),
                            req.st.db.escape(JSON.stringify(req.body.offerTemplate || {})),
                            req.st.db.escape(JSON.stringify(req.body.offerBreakUpTemplate || []))
                        ];

                        var procQuery = 'CALL pace_generateOffer( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0] && result[1] && result[2] && result[2][0]) {

                                var output = [];
                                // for (var i = 0; i < result[2].length; i++) {
                                var tags = JSON.parse(result[0][0].tags);
                                var offerBody = result[0][0].offerBody || '';
                                var offerBreakUp = result[2] && result[2][0] ? JSON.parse(result[2][0].offerBreakUpCalculated) : [];
                                var tableTags = JSON.parse(result[0][0].tableTags);
                                var tableContent = '';
                                var offerManagerId = result[2] && result[2][0] ? result[2][0].offerManagerId : 0;
                                var reqAppId = result[2] && result[2][0] ? result[2][0].reqAppId : 0;
                                var actualCTCAmount = result[2] && result[2][0] ? result[2][0].actualCTCAmount : 0;

                                // fs.readFile('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer.html', 'utf-8', function (err, data) {
                                // fs.readFile(path.basename(__dirname) + '../../../routes/api/JobRaiser/settings/offer.html', 'utf-8', function (err, data) {
                                var path = require('path');
                                fs.readFile('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer.html', 'utf-8', function (err, data) {
                                    console.log('error from reading', err);
                                    if (err) {
                                        response.status = false;
                                        response.message = "File Not found";
                                        response.error = null;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                    else {

                                        if (tags.length) {
                                            for (var tagIndex = 0; tagIndex < tags.length; tagIndex++) {
                                                // if (tags[tagIndex]) {

                                                if (result[2] && result[2][0] && result[2][0][tags[tagIndex].tagName]) {
                                                    offerBody = offerBody.replace('[offer.' + tags[tagIndex].tagName + ']', result[2][0][tags[tagIndex].tagName]);
                                                }
                                                // }
                                            }
                                        }

                                        // if (tableTags.length) {

                                        tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;border-spacing: 0;border-collapse: collapse;font-size: 8px;"><tr>';

                                        for (var tableTagIndex = 0; tableTagIndex < tableTags.length; tableTagIndex++) {

                                            tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;font-family: Verdana,sans-serif;font-size: 8px !important;padding:3px;">' + tableTags[tableTagIndex].displayTagAs + "</th>";
                                        }
                                        tableContent += "</tr>";

                                        //offer break up allowance loop
                                        if (offerBreakUp.length) {
                                            for (var offerBUIndex = 0; offerBUIndex < offerBreakUp.length; offerBUIndex++) {
                                                tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">' + offerBreakUp[offerBUIndex].offerBreakUpAllowanceTitle + '</td>';
                                                tableContent += '<td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;text-align:right;" colspan="1">' + offerBreakUp[offerBUIndex].calAllowance + '</td></tr>';
                                            }
                                        }
                                        tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">Monthly Gross Salary</td>';
                                        tableContent += '<td colspan="1" style="text-align:right;padding:3px;">' + Math.round(actualCTCAmount / 12) + '</td></tr>'

                                        tableContent += '<tr><td style="border: 1px solid #ddd;padding: 3px;vertical-align: top;border-top: 1px solid #ddd;" colspan="4">Annual Gross Salary</td>';
                                        tableContent += '<td colspan="1" style="text-align:right;padding:3px;">' + actualCTCAmount + '</td></tr>'
                                        tableContent += "</table>";

                                        // }

                                        offerBody = offerBody.replace('[offer.offerTable]', tableContent);
                                        data = data.replace('[Content]', offerBody);
                                        data = data.replace(/(<p>&nbsp;<\/p><p>&nbsp;<\/p>)+/g, '<p>&nbsp;<\/p>');

                                        var options = { format: 'A4', width: '8in', height: '10.5in', border: '10', timeout: 30000, "zoomFactor": "1" };

                                        var myBuffer = [];
                                        var buffer = new Buffer(data, 'utf16le');
                                        for (var i = 0; i < buffer.length; i++) {
                                            myBuffer.push(buffer[i]);
                                        }

                                        htmlpdf.create(data, options).toBuffer(function (err, buffer) {
                                            console.log("html to pdf error", err);
                                            if (!err) {

                                                var uniqueId = uuid.v4();
                                                var timestamp = Date.now();
                                                aUrl = uniqueId + '.pdf';

                                                // fs.writeFile("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer" + timestamp + ".pdf", buffer, function (err) {
                                                // fs.writeFile(path.basename(__dirname) + "../../../routes/api/JobRaiser/settings/offer.html" + timestamp + ".pdf", buffer, function (err) {

                                                fs.writeFile("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer.html" + timestamp + ".pdf", buffer, function (err) {
                                                    if (!err) {
                                                        console.log("file written");
                                                        // var readStream = fs.createReadStream('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer' + timestamp + '.pdf');
                                                        // var readStream = fs.createReadStream(path.basename(__dirname) + '../../../routes/api/JobRaiser/settings/offer.html' + timestamp + '.pdf');

                                                        var readStream = fs.createReadStream('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer.html' + timestamp + '.pdf');
                                                        console.log("readStream data");
                                                        uploadDocumentToCloud(aUrl, readStream, function (err) {
                                                            if (!err) {

                                                                var invoiceQuery = "call wm_save_PaceGeneratedOffer(" + offerManagerId + ",'" + aUrl + "'," + reqAppId + ")";
                                                                console.log(invoiceQuery);
                                                                req.db.query(invoiceQuery, function (err, offerresult) {
                                                                    if (!err && offerresult && offerresult[0] && offerresult[0][0]) {
                                                                        console.log("Offer generated saved successfully");
                                                                        response.status = true;
                                                                        response.message = "Offer generated sucessfully";
                                                                        response.error = null;
                                                                        response.data = {
                                                                            offerPdfCdnPath: aUrl
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

                                                                // fs.unlink('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer' + timestamp + '.pdf', function (err) {
                                                                // fs.unlink(path.basename(__dirname) + '../../../routes/api/JobRaiser/settings/offer.html' + timestamp + '.pdf', function (err) {

                                                                fs.unlink('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/offer.html' + timestamp + '.pdf', function (err) {
                                                                    if (!err) {
                                                                        console.log('File Deleted');
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                response.status = false;
                                                                response.message = "Failed to generate offer";
                                                                response.error = null;
                                                                response.data = null;
                                                                res.status(500).json(response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        response.status = false;
                                                        response.message = "Failed to generate offer";
                                                        response.error = null;
                                                        response.data = null;
                                                        res.status(500).json(response);
                                                    }
                                                });

                                            }
                                            else {
                                                response.status = false;
                                                response.message = "Failed to generate pdf";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        });

                                        // invoice = {};
                                        // invoice.reqAppId = reqAppId,
                                        //     invoice.cdnPath = aUrl
                                        // output.push(invoice);
                                    }
                                });

                                // });

                                // }  for loop i
                                // response.status = true;
                                // response.message = "Offer generated sucessfully";
                                // response.error = null;
                                // response.data = {
                                //     invoicePdfCdnPath: output
                                // }
                                // res.status(200).json(response);

                            }

                            else {
                                response.status = false;
                                response.message = "Error while generating offer";
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

// settingsCtrl.mailExtract = function (req, res, next) {
//     var Imap = require('imap'),
//     inspect = require('util').inspect;
//   var fs = require('fs'), fileStream;
//   var buffer = '';

//   var myMap;

//   var imap = new Imap({
//     user: "arun@jobraiser.com",
//     password: "arun@007",
//     host: "imap.gmail.com", //this may differ if you are using some other mail services like yahoo
//     port: 993,
//     tls: true,
//     connTimeout: 10000, // Default by node-imap 
//     authTimeout: 5000, // Default by node-imap, 
//     debug: console.log, // Or your custom function with only one incoming argument. Default: null 
//     tlsOptions: { rejectUnauthorized: false },
//     mailbox: "INBOX", // mailbox to monitor 
//     searchFilter: ["UNSEEN"],//["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved 
//     markSeen: false, // all fetched email willbe marked as seen and not fetched next time 
//     fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
//     mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib. 
//     attachments: true, // download attachments as they are encountered to the project directory 
//     attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
//   });

//   function openInbox(cb) {
//     imap.openBox('INBOX', false, cb);
//   }

//   imap.once('ready', function () {
//     openInbox(function (err, box) {
//       if (err) throw err;
//       imap.search(['UNSEEN', ['SUBJECT', 'testing']], function (err, results) {
//         //   console.log('Results of unread mails',results);
//         if (err) throw err;
//         var f = imap.fetch(results, { bodies: '1', markSeen: true });
//         f.on('message', function (msg, seqno) {
//           console.log('Message #%d' + seqno);
//           console.log('Message type' + msg.text)
//           var prefix = '(#' + seqno + ') ';
//           msg.on('body', function (stream, info) {
//             stream.on('data', function (chunk) {
//               buffer += chunk.toString('utf8');
//               console.log("BUFFER of msg.on" + buffer)

//             })
//             stream.once('end', function () {
//               if (info.which === '1') {
//                 console.log("BUFFER Of Stream.once" + buffer)
//               }


//             });
//             console.log(prefix + 'Body');
//             stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
//           });
//           msg.once('attributes', function (attrs) {
//             console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
//           });
//           msg.once('end', function () {
//             console.log(prefix + 'Finished');
//           });
//         });
//         f.once('error', function (err) {
//           console.log('Fetch error: ' + err);
//         });
//         f.once('end', function () {
//           console.log('Done fetching all messages!');
//           imap.end();
//         });
//       });
//     });
//   });

//   imap.once('error', function (err) {
//     console.log(err);
//   });

//   imap.once('end', function () {
//     console.log('Connection ended');
//   });

//   imap.connect();
//   console.log('attachments',imap.attachmentOptions);
// res.send('ok');
// }



// settingsCtrl.imapExtract = function(req,res,next){
// var inspect = require('util').inspect;
// var fs      = require('fs');
// var base64  = require('base64-stream');
// var Imap    = require('imap');
// var imap    = new Imap({
//   user: 'arun@jobraiser.com',
//   password: 'arun@007',
//   host: 'imap.gmail.com',
//   port: 993,
//   tls: true
//   //,debug: function(msg){console.log('imap:', msg);}
// });

// function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

// function findAttachmentParts(struct, attachments) {
//   attachments = attachments ||  [];
//   for (var i = 0, len = struct.length, r; i < len; ++i) {
//     if (Array.isArray(struct[i])) {
//       findAttachmentParts(struct[i], attachments);
//     } else {
//       if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
//         attachments.push(struct[i]);
//       }
//     }
//   }
//   return attachments;
// }

// function buildAttMessageFunction(attachment) {
//   var filename = attachment.params.name;
//   var encoding = attachment.encoding;

//   return function (msg, seqno) {
//     var prefix = '(#' + seqno + ') ';
//     msg.on('body', function(stream, info) {
//       //Create a write stream so that we can stream the attachment to file;
//       console.log(prefix + 'Streaming this attachment to file', filename, info);
//       var writeStream = fs.createWriteStream(filename);
//       writeStream.on('finish', function() {
//         console.log(prefix + 'Done writing to file %s', filename);
//       });

//       //stream.pipe(writeStream); this would write base64 data to the file.
//       //so we decode during streaming using 
//       if (toUpper(encoding) === 'BASE64') {
//         //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//         stream.pipe(base64.decode()).pipe(writeStream);
//       } else  {
//         //here we have none or some other decoding streamed directly to the file which renders it useless probably
//         stream.pipe(writeStream);
//       }
//     });
//     msg.once('end', function() {
//       console.log(prefix + 'Finished attachment %s', filename);
//     });
//   };
// }

// imap.once('ready', function() {
//   imap.openBox('INBOX', true, function(err, box) {
//     if (err) throw err;
//     var f = imap.seq.fetch('1:3', {
//       bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//       struct: true
//     });
//     f.on('message', function (msg, seqno) {
//       console.log('Message #%d', seqno);
//       var prefix = '(#' + seqno + ') ';
//       msg.on('body', function(stream, info) {
//         var buffer = '';
//         stream.on('data', function(chunk) {
//           buffer += chunk.toString('utf8');
//         });
//         stream.once('end', function() {
//           console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//         });
//       });
//       msg.once('attributes', function(attrs) {
//         var attachments = findAttachmentParts(attrs.struct);
//         console.log(prefix + 'Has attachments: %d', attachments.length);
//         for (var i = 0, len=attachments.length ; i < len; ++i) {
//           var attachment = attachments[i];
//           /*This is how each attachment looks like {
//               partID: '2',
//               type: 'application',
//               subtype: 'octet-stream',
//               params: { name: 'file-name.ext' },
//               id: null,
//               description: null,
//               encoding: 'BASE64',
//               size: 44952,
//               md5: null,
//               disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//               language: null
//             }
//           */
//           console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//           var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
//             bodies: [attachment.partID],
//             struct: true
//           });
//           //build function to process attachment message
//           f.on('message', buildAttMessageFunction(attachment));
//         }
//       });
//       msg.once('end', function() {
//         console.log(prefix + 'Finished email');
//       });
//     });
//     f.once('error', function(err) {
//       console.log('Fetch error: ' + err);
//     });
//     f.once('end', function() {
//       console.log('Done fetching all messages!');
//       imap.end();
//     });
//   });
// });

// imap.once('error', function(err) {
//   console.log(err);
// });

// imap.once('end', function() {
//   console.log('Connection ended');
// });

// imap.connect();

// }


// settingsCtrl.imapExt2 = function(req,res,next){

//   var inspect = require('util').inspect;
// var fs = require('fs');
// var base64 = require('base64-stream');
// var Imap = require('imap');
// var imap = new Imap({
//     user: 'arun@jobraiser.com',
//     password: 'arun@007',
//     host: 'imap.gmail.com',
//     port: 993,
//     tls: true
//     //,debug: function(msg){console.log('imap:', msg);}
// });

// function findAttachmentParts(struct, attachments) {
//     attachments = attachments || [];
//     for (var i = 0, len = struct.length, r; i < len; ++i) {
//         if (Array.isArray(struct[i])) {
//             findAttachmentParts(struct[i], attachments);
//         } else {
//             if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
//                 attachments.push(struct[i]);
//             }
//         }
//     }
//     return attachments;
// }

// function buildAttMessageFunction(attachment) {
//     var filename = attachment.params.name;
//     var encoding = attachment.encoding;

//     return function (msg, seqno) {
//         var prefix = '(#' + seqno + ') ';
//         msg.on('body', function (stream, info) {
//             //Create a write stream so that we can stream the attachment to file;
//             console.log(prefix + 'Streaming this attachment to file', filename, info);
//             var writeStream = fs.createWriteStream(filename);
//             writeStream.on('finish', function () {
//                 console.log(prefix + 'Done writing to file %s', filename);
//             });

//             //stream.pipe(writeStream); this would write base64 data to the file.
//             //so we decode during streaming using 
//             if (encoding === 'BASE64') {
//                 //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//                 stream.pipe(base64.decode()).pipe(writeStream);
//                 console.log(stream);

//             } else {
//                 //here we have none or some other decoding streamed directly to the file which renders it useless probably
//                 stream.pipe(writeStream);
//             }
//         });
//         msg.once('end', function () {
//             console.log(prefix + 'Finished attachment %s', filename);
//         });
//     };
// }

// imap.once('ready', function () {
//     imap.openBox('INBOX', true, function (err, box) {
//         if (err) throw err;
//         imap.search(['UNSEEN'], function (err, results) {
//             if (err) throw err;
//             var f = imap.seq.fetch(results, {
//                 bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//                 struct: true
//             });
//             f.on('message', function (msg, seqno) {
//                 console.log('Message #%d', seqno);
//                 var prefix = '(#' + seqno + ') ';
//                 msg.on('body', function (stream, info) {
//                     var buffer = '';
//                     stream.on('data', function (chunk) {
//                         buffer += chunk.toString('utf8');
//                     });
//                     stream.once('end', function () {
//                         console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//                     });
//                 });
//                 msg.once('attributes', function (attrs) {
//                     var attachments = findAttachmentParts(attrs.struct);
//                     console.log(prefix + 'Has attachments: %d', attachments.length);
//                     for (var i = 0, len = attachments.length; i < len; ++i) {
//                         var attachment = attachments[i];
//                         /*This is how each attachment looks like {
//                             partID: '2',
//                             type: 'application',
//                             subtype: 'octet-stream',
//                             params: { name: 'file-name.ext' },
//                             id: null,
//                             description: null,
//                             encoding: 'BASE64',
//                             size: 44952,
//                             md5: null,
//                             disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//                             language: null
//                           }
//                         */
//                         console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//                         if (attachment.params.name.indexOf('.pdf') > -1 || attachment.params.name.indexOf('.doc') > -1 || attachment.params.name.indexOf('.docx') > -1 || attachment.params.name.indexOf('.txt') > -1 || attachment.params.name.indexOf('.rtf') > -1) {
//                             var f = imap.fetch(attrs.uid, {
//                                 bodies: [attachment.partID],
//                                 struct: true
//                             });
//                             //build function to process attachment message
//                             f.on('message', buildAttMessageFunction(attachment));
//                         }

//                     }
//                 });
//                 msg.once('end', function () {
//                     console.log(prefix + 'Finished email');
//                 });
//             });
//             f.once('error', function (err) {
//                 console.log('Fetch error: ' + err);
//             });
//             f.once('end', function () {
//                 console.log('Done fetching all messages!');
//                 imap.end();
//             });
//         });
//     });

// });

// imap.once('error', function (err) {
//     console.log(err);
// });

// imap.once('end', function () {
//     console.log('Connection ended');
// });

// imap.connect();

// }



settingsCtrl.temporary = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    var query = "call wm_integrationUrlForHircraft()";
    console.log('call wm_integrationUrlForHircraft()');
    req.db.query(query, function (err, result) {
        if (err) {
            console.log('Interview database error: integrationUrlForHircraft', err);
        }
        else if ((result[0].length != 0) && (result[1].length != 0)) {
            var heMasterId;
            var transId;
            var integrationFormData = {};
            var DBUrl;
            // console.log(result);
            if (result && result[0] && result[0][0] && result[1] && result[1][0]) {
                heMasterId = result[0][0].heMasterId;
                DBUrl = result[0][0].url;
                transId = result[1][0].transId;
                var response_server = (result[1][0].integrationFormdata);
                // console.log('response_server',response_server);
                if (response_server && typeof (response_server) == "string") {
                    response_server = JSON.parse(response_server);
                }

                if (response_server.skillAssessment && typeof (response_server.skillAssessment) == 'string') {
                    response_server.skillAssessment = JSON.parse(response_server.skillAssessment);

                }


                if (response_server.assessment && typeof (response_server.assessment) == 'string') {
                    response_server.assessment = JSON.parse(response_server.assessment);

                }

                if (response_server.assessment.integrationAssessmentDetails && typeof (response_server.assessment.integrationAssessmentDetails) == 'string') {
                    response_server.assessment.integrationAssessmentDetails = JSON.parse(response_server.assessment.integrationAssessmentDetails);
                }

                for (var r = 0; r < response_server.assessment.integrationAssessmentDetails.length; r++) {

                    if (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions && typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions) == 'string') {
                        response_server.assessment.integrationAssessmentDetails[r].integrationQuestions = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions);
                    }
                    for (var s = 0; s < response_server.assessment.integrationAssessmentDetails[r].integrationQuestions.length; s++) {
                        if (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption && typeof (response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption) == 'string') {
                            response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption = JSON.parse(response_server.assessment.integrationAssessmentDetails[r].integrationQuestions[s].integrationselectedOption);
                        }
                    }
                }
                // console.log("response_server", JSON.stringify(response_server));
                var count = 0;
                request({
                    url: DBUrl,
                    method: "POST",
                    json: true,   // <--Very important!!!
                    body: response_server
                }, function (error, response, body) {
                    console.log('Tallint error', error);
                    console.log('Tallint body after success', body);
                    // console.log("response_server", response_server);
                    if (body && body.Code && body.Code == "SUCCESS0001") {
                        var updateQuery = "update 1014_trans set sync=1 where heParentId=" + transId;
                        db.query(updateQuery, function (err, results) {
                            if (err) {
                                console.log("update sync query throws error");
                            }
                            else {
                                console.log("sync is updated to 1 successfully", transId);
                            }
                        });
                    }
                    count++;
                });

                response.status = true;
                response.data = response_server;
                res.status(200).json(response);
                console.log('tallint interview hit for ', count, ' times');
            }
        }
    });

};


settingsCtrl.imapFinally = function (req, res, next) {

    var response = {};
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
            var searchCriteria = ['UNSEEN'];  // , ['SINCE', yesterday]
            var fetchOptions = { bodies: ['HEADER'], struct: true, markSeen: true };

            // retrieve only the headers of the messages
            return connection.search(searchCriteria, fetchOptions);
        }).then(function (messages) {
            // console.log("messages",messages);
            // var subjects = messages.map(function (res) {
            //     return res.parts.filter(function (part) {
            //         return part.which === 'HEADER';
            //     })[0].body.subject[0];
            // });

            var attachments = [];


            messages.forEach(function (message) {

                // console.log(message.attributes);
                // console.log(message.attributes.struct);

                var parts = imaps.getParts(message.attributes.struct);
                var subject = message.parts[0].body.subject[0];


                attachments = attachments.concat(parts.filter(function (part) {
                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                }).map(function (part) {
                    // retrieve the attachments only of the messages with attachments
                    return connection.getPartData(message, part)
                        .then(function (partData) {
                            return {
                                filename: part.disposition.params.filename,
                                data: partData,
                                subject: subject
                            };
                        });
                }));
            });

            return Promise.all(attachments);
        }).then(function (attachments) {
            console.log('attachments', attachments);
            // response = {
            //     attachments: attachments
            // };
            // res.status(200).json(response);

            // =>
            //    [ { filename: 'cats.jpg', data: Buffer() },
            //      { filename: 'pay-stub.pdf', data: Buffer() } ]

            for (var i = 0; i < attachments.length; i++) {
                attachmentFunction(req, attachments[i], i);
            }
        });
    });

};


settingsCtrl.fetchoutLook = function (req, res, next) {
    var response = {
        status: false,
        message: "Api error",
        data: null,
        error: null
    };

    var imaps = require('imap-simple');
    var config = {
        imap: {
            user: req.body.userName,
            password: req.body.password,
            host: req.body.popOrImapServer,  //'imap.gmail.com'
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
            yesterday = yesterday.toISOString();  //['SUBJECT', 'testing'],
            var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
            var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, markSeen: true };

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
            // =>
            //    [ { filename: 'cats.jpg', data: Buffer() },
            //      { filename: 'pay-stub.pdf', data: Buffer() } ]
            if (attachments.length) {
                response.status = true;
                response.message = "attachments fetched succesffuly";
                response.error = null;
                response.data = attachments;
                res.status(200).json(response);

            }

            else {
                response.status = false;
                response.message = "Something went wrong! Please try again";
                response.error = null;
                response.data = [];
                res.status(500).json(response);

            }

        });
    });

};


// settingsCtrl.imapFinally = function (req, res, next) {
//     var response = {
//         status: false,
//         message: "Invalid token",
//         data: null,
//         error: null
//     };

//     var inspect = require('util').inspect;
//     var fs = require('fs');
//     var base64 = require('base64-stream');
//     var Imap = require('imap');
//     var imap = new Imap({
//         user: 'arun@jobraiser.com',
//         password: 'arun@007',
//         host: 'imap.gmail.com',
//         port: 993,
//         fetchUnreadOnStart: true,
//         markSeen: true,
//         attachments: true,
//         tls: true,
//         //,debug: function(msg){console.log('imap:', msg);}
//     });

//     function findAttachmentParts(struct, attachments) {
//         attachments = attachments || [];
//         for (var i = 0, len = struct.length, r; i < len; ++i) {
//             if (Array.isArray(struct[i])) {
//                 findAttachmentParts(struct[i], attachments);
//             } else {
//                 if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
//                     attachments.push(struct[i]);
//                     console.log('find attachments',attachments);
//                 }
//             }
//         }
//         return attachments;
//     }

//     function buildAttMessageFunction(attachment) {
//         var filename = attachment.params.name;
//         var encoding = attachment.encoding;

//         return function (msg, seqno) {
//             var prefix = '(#' + seqno + ') ';
//             msg.on('body', function (stream, info) {
//                 //Create a write stream so that we can stream the attachment to file;
//                 console.log(prefix + 'Streaming this attachment to file', filename, info);
//                 var writeStream = fs.createWriteStream(filename);
//                 writeStream.on('finish', function () {

//                     /* service attachment need to be called here */
//                     var uniqueId = uuid.v4();
//                     var filetype = (filename.extension) ? filename.extension : '';

//                     aUrl = uniqueId + '.' + filetype;

//                     console.log("req.files.attachment.path", filename);

//                     var readStream = fs.createReadStream(filename);

//                     uploadDocumentToCloud(aUrl, readStream, function (err) {
//                         if (!err) {
//                             console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
//                         }
//                     });
//                     // take attachment one by one and parse and save
//                     var formData = {
//                         file: {
//                             value: 'https://storage.googleapis.com/ezeone/' + aUrl,   // put full path
//                             options: {
//                                 filename: 'https://storage.googleapis.com/ezeone/' + aUrl,
//                                 contentType: 'application/*'
//                             }
//                         }
//                     };

//                     request.post({
//                         url: 'https://dms.tallint.com/parsing/jobraiser/parsing/?IsEmployment=false',
//                         //   headers : {
//                         //         "Authorization" : auth,
//                         //     "X-Atlassian-Token" : "nocheck"
//                         //       }, 
//                         formData: formData
//                     }, function optionalCallback(err, httpResponse, body) {
//                         if (err) {
//                             return console.error('upload failed:', err);
//                         }
//                         else {

//                             var body = body.replace(/^"(.*)"$/, '$1');

//                             var options = {
//                                 trim: true,
//                                 compact: true,
//                                 ignoreComment: true,
//                                 alwaysChildren: true,
//                                 instructionHasAttributes: true,
//                                 ignoreText: false,
//                                 ignoreAttributes: true
//                             };
//                             var jsonResult = convert.xml2json(body, options);

//                             var jsonResponse = JSON.parse(jsonResult);
//                             var Document = jsonResponse.Document;
//                             console.log(jsonResponse);
//                             console.log(typeof (Document));

//                             // var Name = Document.Name._text;
//                             // var firstName = Name.split(' ')[0];
//                             // var lastName = Name.split(' ')[1];

//                             // var DOB = Document.DOB._text ? Document.DOB._text : undefined;
//                             // var gender = Document.Gender._text ? Document.Gender._text : undefined;
//                             // var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
//                             // var emailId = Document.EMail._text ? Document.EMail._text : '';

//                             // var passportNumber = Document.Passport._text ? Document.Passport._text : '';
//                             // var SkillText = Document.SkillText._text ? Document.SkillText._text : '';
//                             // var skills = SkillText.split(',');  // splits skills and forms array of skills
//                             // var passportExpiryDate = Document.PassportExpiryDate._text ? Document.PassportExpiryDate._text : undefined;
//                             // console.log(firstName, lastName, skills);


//                             // var cvSourcingParentId = req.body.cvSourcingParentId ? req.body.cvSourcingParentId : 0;
//                             // var heMasterId = req.body.heMasterId ? req.body.heMasterId : 2;
//                             // var mobileISD = req.body.mobileISD ? req.body.mobileISD : '+91';
//                             // var cvPath = req.body.cvPath ? req.body.cvPath : '';

//                             // var response = {
//                             //   status: false,
//                             //   message: "Something went wrong",
//                             //   data: null,
//                             //   error: null
//                             // };

//                             // var inputs = [
//                             //   req.st.db.escape(heMasterId),
//                             //   req.st.db.escape(cvSourcingParentId),
//                             //   req.st.db.escape(firstName),
//                             //   req.st.db.escape(lastName),
//                             //   req.st.db.escape(DOB),
//                             //   req.st.db.escape(gender),
//                             //   req.st.db.escape(mobileISD),
//                             //   req.st.db.escape(mobileNumber),
//                             //   req.st.db.escape(passportNumber),
//                             //   req.st.db.escape(passportExpiryDate),
//                             //   req.st.db.escape(emailId),
//                             //   req.st.db.escape(JSON.stringify(skills)),
//                             //   req.st.db.escape(cvPath)
//                             // ];

//                             // var procQuery = 'CALL wm_save_cvSouring( ' + inputs.join(',') + ')';
//                             // console.log(procQuery);

//                             // req.db.query(procQuery, function (cvErr, cvResult) {
//                             //   console.log(cvErr);

//                             //   if (!cvErr && cvResult && cvResult[0] && cvResult[0][0].applicantId) {

//                             //     response.status = true;
//                             //     response.message = "Resume Saved Successfully";
//                             //     response.error = null;
//                             //     response.data = {
//                             //       applicantId: cvResult[0][0].applicantId
//                             //     };
//                             //     res.status(200).json(response);

//                             //   }
//                             //   else if (!cvErr && cvResult && cvResult[0] && cvResult[0][0]._applicantExists) {

//                             //     response.status = false;
//                             //     response.message = "Resume already exists";
//                             //     response.error = null;
//                             //     response.data = {
//                             //       applicantId: cvResult[0][0]._applicantExists
//                             //     };
//                             //     response.duplicate = 1;
//                             //     res.status(200).json(response);

//                             //   }
//                             //   else {
//                             //     response.status = false;
//                             //     response.message = "Error While Saving Resume";
//                             //     response.error = 1;
//                             //     res.status(500).json(response);
//                             //   }
//                             // });
//                         }
//                     });
//                     console.log(prefix + 'Done writing to file %s', filename);
//                 });

//                 //stream.pipe(writeStream); this would write base64 data to the file.
//                 //so we decode during streaming using 
//                 if (encoding === 'BASE64') {
//                     //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//                     stream.pipe(base64.decode()).pipe(writeStream);
//                     console.log(stream);

//                 } else {
//                     //here we have none or some other decoding streamed directly to the file which renders it useless probably
//                     stream.pipe(writeStream);
//                 }
//             });
//             msg.once('end', function () {
//                 console.log(prefix + 'Finished attachment %s', filename);
//             });
//         };
//     }

//     imap.once('ready', function () {
//         imap.openBox('INBOX', false, function (err, box) {  // false makes unread mails to read
//             if (err) throw err;
//             imap.search(['UNSEEN'], function (err, results) {
//                 if (err) throw err;
//                 var f = imap.seq.fetch(results, {
//                     bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//                     struct: true,
//                     markSeen: true
//                 });
//                 f.on('message', function (msg, seqno) {
//                     console.log('Message #%d', seqno);
//                     var prefix = '(#' + seqno + ') ';
//                     msg.on('body', function (stream, info) {
//                         var buffer = '';
//                         stream.on('data', function (chunk) {
//                             buffer += chunk.toString('utf8');
//                         });
//                         stream.once('end', function () {
//                             console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//                         });
//                     });
//                     msg.once('attributes', function (attrs) {
//                         var attachments = findAttachmentParts(attrs.struct);
//                         console.log(prefix + 'Has attachments: %d', attachments.length);
//                         for (var i = 0, len = attachments.length; i < len; ++i) {
//                             var attachment = attachments[i];
//                             console.log('msg once attachment',attachment);
//                             /*This is how each attachment looks like {
//                                 partID: '2',
//                                 type: 'application',
//                                 subtype: 'octet-stream',
//                                 params: { name: 'file-name.ext' },
//                                 id: null,
//                                 description: null,
//                                 encoding: 'BASE64',
//                                 size: 44952,
//                                 md5: null,
//                                 disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//                                 language: null
//                               }
//                             */
//                             console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//                             if (attachment.params.name.indexOf('.pdf') > -1 || attachment.params.name.indexOf('.doc') > -1 || attachment.params.name.indexOf('.docx') > -1 || attachment.params.name.indexOf('.txt') > -1 || attachment.params.name.indexOf('.rtf') > -1) {
//                                 var f = imap.fetch(attrs.uid, {
//                                     bodies: [attachment.partID],
//                                     struct: true,
//                                     markSeen: true
//                                 });
//                                 //build function to process attachment message
//                                 f.on('message', buildAttMessageFunction(attachment));
//                             }

//                         }
//                     });
//                     msg.once('end', function () {
//                         console.log(prefix + 'Finished email');
//                     });
//                 });
//                 f.once('error', function (err) {
//                     console.log('Fetch error: ' + err);
//                 });
//                 f.once('end', function () {
//                     console.log('Done fetching all messages!');
//                     imap.end();
//                 });
//             });
//         });

//     });

//     imap.once('error', function (err) {
//         console.log(err);
//     });

//     imap.once('end', function () {
//         console.log('Connection ended');
//     });

//     imap.connect();

// };


// var inspect = require('util').inspect;
// var fs = require('fs');
// var base64 = require('base64-stream');
// var Imap = require('imap');
// var imap = new Imap({
//     user: 'arun@jobraiser.com',
//     password: 'arun@007',
//     host: 'imap.gmail.com',
//     port: 993,
//     tls: true
//     //,debug: function(msg){console.log('imap:', msg);}
// });

// function findAttachmentParts(struct, attachments) {
//     attachments = attachments || [];
//     for (var i = 0, len = struct.length, r; i < len; ++i) {
//         if (Array.isArray(struct[i])) {
//             findAttachmentParts(struct[i], attachments);
//         } else {
//             if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
//                 attachments.push(struct[i]);
//             }
//         }
//     }
//     return attachments;
// }

// function buildAttMessageFunction(attachment) {
//     var filename = attachment.params.name;
//     var encoding = attachment.encoding;

//     return function (msg, seqno) {
//         var prefix = '(#' + seqno + ') ';
//         msg.on('body', function (stream, info) {
//             //Create a write stream so that we can stream the attachment to file;
//             console.log(prefix + 'Streaming this attachment to file', filename, info);
//             var writeStream = fs.createWriteStream(filename);
//             writeStream.on('finish', function () {
//                 console.log(prefix + 'Done writing to file %s', filename);
//             });

//             //stream.pipe(writeStream); this would write base64 data to the file.
//             //so we decode during streaming using 
//             if (encoding === 'BASE64') {
//                 //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//                 stream.pipe(base64.decode()).pipe(writeStream);
//                 console.log(stream);

//             } else {
//                 //here we have none or some other decoding streamed directly to the file which renders it useless probably
//                 stream.pipe(writeStream);
//             }
//         });
//         msg.once('end', function () {
//             console.log(prefix + 'Finished attachment %s', filename);
//         });
//     };
// }

// imap.once('ready', function () {
//     imap.openBox('INBOX', false, function (err, box) {
//         if (err) throw err;
//         imap.search(['UNSEEN'], function (err, results) {
//             if (err) throw err;
//             var f = imap.seq.fetch(results, {
//                 bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//                 struct: true,
//                 markSeen: true
//             });
//             f.on('message', function (msg, seqno) {
//                 console.log('Message #%d', seqno);
//                 var prefix = '(#' + seqno + ') ';
//                 msg.on('body', function (stream, info) {
//                     var buffer = '';
//                     stream.on('data', function (chunk) {
//                         buffer += chunk.toString('utf8');
//                     });
//                     stream.once('end', function () {
//                         console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//                     });
//                 });
//                 msg.once('attributes', function (attrs) {
//                     var attachments = findAttachmentParts(attrs.struct);
//                     console.log(prefix + 'Has attachments: %d', attachments.length);
//                     for (var i = 0, len = attachments.length; i < len; ++i) {
//                         var attachment = attachments[i];
//                         /*This is how each attachment looks like {
//                             partID: '2',
//                             type: 'application',
//                             subtype: 'octet-stream',
//                             params: { name: 'file-name.ext' },
//                             id: null,
//                             description: null,
//                             encoding: 'BASE64',
//                             size: 44952,
//                             md5: null,
//                             disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//                             language: null
//                           }
//                         */
//                         console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//                         if (attachment.params.name.indexOf('.pdf') > -1 || attachment.params.name.indexOf('.doc') > -1 || attachment.params.name.indexOf('.docx') > -1 || attachment.params.name.indexOf('.txt') > -1 || attachment.params.name.indexOf('.rtf') > -1) {
//                             var f = imap.fetch(attrs.uid, {
//                                 bodies: [attachment.partID],
//                                 struct: true
//                             });
//                             //build function to process attachment message
//                             f.on('message', buildAttMessageFunction(attachment));
//                         }

//                     }
//                 });
//                 msg.once('end', function () {
//                     console.log(prefix + 'Finished email');
//                 });
//             });
//             f.once('error', function (err) {
//                 console.log('Fetch error: ' + err);
//             });
//             f.once('end', function () {
//                 console.log('Done fetching all messages!');
//                 imap.end();
//             });
//         });
//     });

// });

// imap.once('error', function (err) {
//     console.log(err);
// });

// imap.once('end', function () {
//     console.log('Connection ended');
// });

// imap.connect();



// var inspect = require('util').inspect;
// var fs = require('fs');
// var base64 = require('base64-stream');
// var Imap = require('imap');
// var imap = new Imap({
//     user: 'arun@jobraiser.com',
//     password: 'arun@007',
//     host: 'imap.gmail.com',
//     port: 993,
//     tls: true
//     //,debug: function(msg){console.log('imap:', msg);}
// });

// function findAttachmentParts(struct, attachments) {
//     attachments = attachments || [];
//     for (var i = 0, len = struct.length, r; i < len; ++i) {
//         if (Array.isArray(struct[i])) {
//             findAttachmentParts(struct[i], attachments);
//         } else {
//             if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
//                 attachments.push(struct[i]);
//             }
//         }
//     }
//     return attachments;
// }

// function buildAttMessageFunction(attachment) {
//     var filename = attachment.params.name;
//     var encoding = attachment.encoding;

//     return function (msg, seqno) {
//         var prefix = '(#' + seqno + ') ';
//         msg.on('body', function (stream, info) {
//             //Create a write stream so that we can stream the attachment to file;
//             console.log(prefix + 'Streaming this attachment to file', filename, info);
//             var writeStream = fs.createWriteStream(filename);
//             writeStream.on('finish', function () {
//                 console.log(prefix + 'Done writing to file %s', filename);
//             });

//             //stream.pipe(writeStream); this would write base64 data to the file.
//             //so we decode during streaming using 
//             if (encoding === 'BASE64') {
//                 //the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
//                 stream.pipe(base64.decode()).pipe(writeStream);
//                 console.log(stream);

//             } else {
//                 //here we have none or some other decoding streamed directly to the file which renders it useless probably
//                 stream.pipe(writeStream);
//             }
//         });
//         msg.once('end', function () {
//             console.log(prefix + 'Finished attachment %s', filename);
//         });
//     };
// }

// imap.once('ready', function () {
//     imap.openBox('INBOX', true, function (err, box) {
//         if (err) throw err;
//         imap.search(['ALL'], function (err, results) {
//             if (err) throw err;
//             var f = imap.seq.fetch(results, {
//                 bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
//                 struct: true
//             });
//             f.on('message', function (msg, seqno) {
//                 console.log('Message #%d', seqno);
//                 var prefix = '(#' + seqno + ') ';
//                 msg.on('body', function (stream, info) {
//                     var buffer = '';
//                     stream.on('data', function (chunk) {
//                         buffer += chunk.toString('utf8');
//                     });
//                     stream.once('end', function () {
//                         console.log(prefix + 'Parsed header: %s', Imap.parseHeader(buffer));
//                     });
//                 });
//                 msg.once('attributes', function (attrs) {
//                     var attachments = findAttachmentParts(attrs.struct);
//                     console.log(prefix + 'Has attachments: %d', attachments.length);
//                     for (var i = 0, len = attachments.length; i < len; ++i) {
//                         var attachment = attachments[i];

//                         var uniqueId = uuid.v4();
//                         var filetype = (attachment.params.name.extension) ? filename.extension : '';

//                         aUrl = uniqueId + '.' + filetype;

//                         console.log("req.files.attachment.path", attachment.params.name);

//                         var readStream = fs.createReadStream(attachment.params.name);

//                         uploadDocumentToCloud(aUrl, readStream, function (err) {
//                             if (!err) {
//                                 console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
//                             }
//                         });
//                         /*This is how each attachment looks like {
//                             partID: '2',
//                             type: 'application',
//                             subtype: 'octet-stream',
//                             params: { name: 'file-name.ext' },
//                             id: null,
//                             description: null,
//                             encoding: 'BASE64',
//                             size: 44952,
//                             md5: null,
//                             disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
//                             language: null
//                           }
//                         */
//                         console.log(prefix + 'Fetching attachment %s', attachment.params.name);
//                         if (attachment.params.name.indexOf('.pdf') > -1 || attachment.params.name.indexOf('.doc') > -1 || attachment.params.name.indexOf('.docx') > -1 || attachment.params.name.indexOf('.txt') > -1 || attachment.params.name.indexOf('.rtf') > -1) {
//                             var f = imap.fetch(attrs.uid, {
//                                 bodies: [attachment.partID],
//                                 struct: true
//                             });
//                             //build function to process attachment message
//                             f.on('message', buildAttMessageFunction(attachment));
//                         }

//                     }
//                 });
//                 msg.once('end', function () {
//                     console.log(prefix + 'Finished email');
//                 });
//             });
//             f.once('error', function (err) {
//                 console.log('Fetch error: ' + err);
//             });
//             f.once('end', function () {
//                 console.log('Done fetching all messages!');
//                 imap.end();
//             });
//         });
//     });

// });

// imap.once('error', function (err) {
//     console.log(err);
// });

// imap.once('end', function () {
//     console.log('Connection ended');
// });

// imap.connect();

////////////////////////////////////
// var request = require('request');
// var fs = require("fs");
// var convert = require('xml-js');

// var formData = {
//   file: {
//     value: fs.createReadStream('C:/Users/TM2/Desktop/Shweta-2yrs exp-Project Engineer.pdf'),
//     options: {
//       filename: 'C:/Users/TM2/Desktop/Shweta-2yrs exp-Project Engineer.pdf',
//       contentType: 'application/*'
//     }
//   }
// };

// request.post({
//   url: 'https://dms.tallint.com/parsing/jobraiser/parsing/?IsEmployment=false',
//   //   headers : {
//   //         "Authorization" : auth,
//   //     "X-Atlassian-Token" : "nocheck"
//   //       }, 
//   formData: formData
// }, function optionalCallback(err, httpResponse, body) {
//   if (err) {
//     return console.error('upload failed:', err);
//   }
//   else {

//     var body = body.replace(/^"(.*)"$/, '$1');

//     var options = {
//       trim: true,
//       compact: true,
//       ignoreComment: true,
//       alwaysChildren: true,
//       instructionHasAttributes: true,
//       ignoreText: false,
//       ignoreAttributes: true
//     };
//     var jsonResult = convert.xml2json(body, options);

//     var jsonResponse = JSON.parse(jsonResult);
//     var Document = jsonResponse.Document;
//     console.log(jsonResponse);
//     console.log(typeof (Document));

//     var Name = Document.Name._text;
//     var firstName = Name.split(' ')[0];
//     var lastName = Name.split(' ')[1];

//     var DOB = Document.DOB._text ? Document.DOB._text : undefined;
//     var gender = Document.Gender._text ? Document.Gender._text : undefined;
//     var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
//     var emailId = Document.EMail._text ? Document.EMail._text : '';

//     var passportNumber = Document.Passport._text ? Document.Passport._text : '';
//     var SkillText = Document.SkillText._text ? Document.SkillText._text : '';
//     var skills = SkillText.split(',');  // splits skills and forms array of skills
//     var passportExpiryDate = Document.PassportExpiryDate._text ? Document.PassportExpiryDate._text : undefined;
//     console.log(firstName, lastName, skills);


//     var applicantId = req.body.applicantId ? req.body.applicantId : 0;
//     var heMasterId = req.body.heMasterId ? req.body.heMasterId : 2;
//     var mobileISD = req.body.mobileISD ? req.body.mobileISD : '+91';
//     var cvPath = req.body.cvPath ? req.body.cvPath : '';

//     var response = {
//       status: false,
//       message: "Something went wrong",
//       data: null,
//       error: null
//     };

//     var inputs = [
//       req.st.db.escape(heMasterId),
//       req.st.db.escape(applicantId),
//       req.st.db.escape(firstName),
//       req.st.db.escape(lastName),
//       req.st.db.escape(DOB),
//       req.st.db.escape(gender),
//       req.st.db.escape(mobileISD),
//       req.st.db.escape(mobileNumber),
//       req.st.db.escape(passportNumber),
//       req.st.db.escape(passportExpiryDate),
//       req.st.db.escape(emailId),
//       req.st.db.escape(JSON.stringify(skills)),
//       req.st.db.escape(cvPath)
//     ];

//     var procQuery = 'CALL wm_save_cvSouring( ' + inputs.join(',') + ')';
//     console.log(procQuery);

//     req.db.query(procQuery, function (cvErr, cvResult) {
//       console.log(cvErr);

//       if (!cvErr && cvResult && cvResult[0] && cvResult[0][0].applicantId) {

//         response.status = true;
//         response.message = "Resume Saved Successfully";
//         response.error = null;
//         response.data = {
//           applicantId: cvResult[0][0].applicantId
//         };
//         res.status(200).json(response);

//       }
//       else if (!cvErr && cvResult && cvResult[0] && cvResult[0][0]._applicantExists) {

//         response.status = false;
//         response.message = "Resume already exists";
//         response.error = null;
//         response.data = {
//           applicantId: cvResult[0][0]._applicantExists
//         };
//         response.duplicate = 1;
//         res.status(200).json(response);

//       }
//       else {
//         response.status = false;
//         response.message = "Error While Saving Resume";
//         response.error = 1;
//         res.status(500).json(response);
//       }
//     });
//   }
// });


settingsCtrl.autoSourcingMasterData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.applicantId) {
        error.applicantId = "Invalid applicantId";
        validationFlag *= false;
    }

    if (!req.query.requirementId) {
        error.requirementId = "Invalid requirementId";
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {


        var inputs = [
            req.st.db.escape(req.query.applicantId),
            req.st.db.escape(req.query.requirementId)
        ];

        var procQuery = 'CALL pace_get_autoSourcingMasterData( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(req.query.isWeb);

            if (!err && result && result[0] && result[0][0]) {

                for (var i = 0; i < result[6].length; i++) {
                    result[6][i].specialization = result[6][i].specialization ? JSON.parse(result[6][i].specialization) : [];
                }

                for (var j = 0; j < result[7].length; j++) {
                    result[7][j].specialization = result[7][j].specialization ? JSON.parse(result[7][j].specialization) : [];
                }

                response.status = true;
                response.message = "Master data loaded successfully";
                response.error = null;
                response.data = {
                    industryList: result[0] ? result[0] : [],
                    skillList: result[1] ? result[1] : [],
                    locationList: result[2] ? result[2] : [],
                    currency: result[3] ? result[3] : [],
                    scale: result[4] ? result[4] : [],
                    duration: result[5] ? result[5] : [],
                    ugEducationList: result[6] ? result[6] : [],
                    pgEducationList: result[7] ? result[7] : [],
                    nationality: result[8] ? result[8] : [],
                    countryCode: result[9] ? result[9] : [],
                    functionalAreas: result[10] ? result[10] : [],
                    jobTitle: result[11] ? result[11] : []
                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "No results found";
                response.error = null;
                response.data = {};
                res.status(200).json(response);
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

};

settingsCtrl.saveAutosourcedApplicant = function (req, res, next) {
    // var cvKeywords = '';


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
    if (!req.body.resumeCdnPath) {
        error.resumeCdnPath = 'Please upload resume';
        validationFlag *= false;
    }

    if (!req.body.firstName) {
        error.firstName = 'First Name is Mandatory';
        validationFlag *= false;
    }

    // if (!req.body.emailId || !req.body.mobileNumber) {   // any one is mandatory
    //     error.emailId = 'EMail ID or Mobile Number is mandatory';
    //     validationFlag *= false;
    // }

    // if (!req.body.mobileNumber) {
    //     error.mobileNumber = 'Mobile Number is Mandatory';
    //     validationFlag *= false;
    // }
    var education = req.body.education;
    if (typeof (education) == "string") {
        education = JSON.parse(education);
    }
    if (!education) {
        education = [];
    }

    var jobTitle = req.body.jobTitle;
    if (typeof (jobTitle) == "string") {
        jobTitle = JSON.parse(jobTitle);
    }
    if (!jobTitle) {
        jobTitle = {};
    }
    var primarySkills = req.body.primarySkills;
    if (typeof (primarySkills) == "string") {
        primarySkills = JSON.parse(primarySkills);
    }
    if (!primarySkills) {
        primarySkills = [];
    }
    var secondarySkills = req.body.secondarySkills;
    if (typeof (secondarySkills) == "string") {
        secondarySkills = JSON.parse(secondarySkills);
    }
    if (!secondarySkills) {
        secondarySkills = [];
    }
    // var cvSource = req.body.cvSource;
    // if (typeof (cvSource) == "string") {
    //     cvSource = JSON.parse(cvSource);
    // }
    // if (!cvSource) {
    //     cvSource = {};
    // }
    var prefLocations = req.body.prefLocations;
    if (typeof (prefLocations) == "string") {
        prefLocations = JSON.parse(prefLocations);
    }
    if (!prefLocations) {
        prefLocations = [];
    }
    var industry = req.body.industry;
    if (typeof (industry) == "string") {
        industry = JSON.parse(industry);
    }
    if (!industry) {
        industry = [];
    }
    var nationality = req.body.nationality;
    if (typeof (nationality) == "string") {
        nationality = JSON.parse(nationality);
    }
    if (!nationality) {
        nationality = {};
    }
    // var expectedSalaryCurr = req.body.expectedSalaryCurr;
    // if (typeof (expectedSalaryCurr) == "string") {
    //     expectedSalaryCurr = JSON.parse(expectedSalaryCurr);
    // }
    // if (!expectedSalaryCurr) {
    //     expectedSalaryCurr = {};
    // }

    // var expectedSalaryScale = req.body.expectedSalaryScale;
    // if (typeof (expectedSalaryScale) == "string") {
    //     expectedSalaryScale = JSON.parse(expectedSalaryScale);
    // }
    // if (!expectedSalaryScale) {
    //     expectedSalaryScale = {};
    // }
    // var expectedSalaryPeriod = req.body.expectedSalaryPeriod;
    // if (typeof (expectedSalaryPeriod) == "string") {
    //     expectedSalaryPeriod = JSON.parse(expectedSalaryPeriod);
    // }
    // if (!expectedSalaryPeriod) {
    //     expectedSalaryPeriod = {};
    // }
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
    var duration = req.body.duration;
    if (typeof (duration) == "string") {
        duration = JSON.parse(duration);
    }
    if (!duration) {
        duration = {};
    }
    // var attachmentList = req.body.attachmentList;
    // if (typeof (attachmentList) == "string") {
    //     attachmentList = JSON.parse(attachmentList);
    // }
    // if (!attachmentList) {
    //     attachmentList = [];
    // }
    var functionalAreas = req.body.functionalAreas;
    if (typeof (functionalAreas) == "string") {
        functionalAreas = JSON.parse(functionalAreas);
    }
    if (!functionalAreas) {
        functionalAreas = [];
    }

    // var requirementArray = req.body.requirementArray;
    // if (typeof (requirementArray) == "string") {
    //     requirementArray = JSON.parse(requirementArray);
    // }
    // if (!requirementArray) {
    //     requirementArray = [];
    // }

    // var faceSheet = req.body.faceSheet;
    // if (typeof (faceSheet) == "string") {
    //     faceSheet = JSON.parse(faceSheet);
    // }
    // if (!faceSheet) {
    //     faceSheet = {};
    // }

    var presentLocation = req.body.presentLocation;
    if (typeof (presentLocation) == "string") {
        presentLocation = JSON.parse(presentLocation);
    }
    if (!presentLocation) {
        presentLocation = {};
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
                // req.body.cvPath = (req.body.cvPath) ? req.body.cvPath : "";
                var cvKeywords;
                var cv = '';
                var text = '';
                var gs_url = '';
                var storage_bucket = '';


                if (req.body.cvKeywords && req.body.cvKeywords != '') {
                    req.body.cvKeywords = req.body.cvKeywords.replace(/[^\x00-\x7F]/g, "");
                }

                req.query.isWeb = (req.body.isWeb) ? req.body.isWeb : 0;
                // console.log("cvPath from attacment", req.body.cvKeywords);
                if (req.body.resumeCdnPath && req.body.resumeCdnPath != "") //&& (req.body.cvKeywords == '') && req.body.cvKeywords == undefined && req.body.cvKeywords == null &&  req.body.cvKeywords == ' ') 
                {
                    cv = req.body.resumeCdnPath;
                }
                gs_url = req.CONFIG.CONSTANT.GS_URL;
                storage_bucket = req.CONFIG.CONSTANT.STORAGE_BUCKET;

                console.log("cvPath from attacment", cv);

                // var exec = require('child_process').exec;
                // var environment = process.env;
                // environment.ANTIWORDHOME = '/usr/share/antiword';
                // exec(command, { env: environment }, function (err, stdout, stderr) {
                //     console.log(stdout);
                // });

                return new Promise(function (resolve, reject) {
                    if (cv != '') {
                        cv = gs_url + storage_bucket + '/' + cv;
                        console.log('cvPath complete', cv);
                        http.get(cv, function (fileResponse) {
                            var bufs = [];

                            fileResponse.on('data', function (d) { bufs.push(d); });
                            fileResponse.on('end', function () {
                                var buf = Buffer.concat(bufs);
                                process.env.ANTIWORDHOME = '/usr/share/antiword';
                                textract.fromBufferWithName(cv, buf, function (error, txt) {
                                    if (error) {
                                        // var tempCVPath = cv.replace('docx', 'doc');
                                        // textract.fromBufferWithName(tempCVPath, buf, function (error, txt) {
                                        // text = txt;
                                        console.log('error', error);
                                        // console.log('text inside', text);
                                        resolve(text);
                                        // });
                                    }
                                    else {
                                        text = txt;
                                        console.log('error', error);
                                        console.log('text inside', text);
                                        resolve(text);

                                    }
                                });
                            });
                        });

                    }
                    else {
                        resolve('');
                    }
                }).then(function (resp) {
                    // console.log("response after promise", resp);
                    if (1) {

                        cvKeywords = text;
                        if (cvKeywords) {
                            cvKeywords = cvKeywords.replace(/[^\x00-\x7F]/g, "");
                        }

                        // console.log('text from promise', resp);
                        // console.log('text data from promise ', text);

                        req.body.applicantId = (req.body.applicantId) ? req.body.applicantId : 0;

                        req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                        req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : "";
                        req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : "";
                        req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                        req.body.address = (req.body.address) ? req.body.address : "";
                        // req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
                        // req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;
                        req.body.longitude = 0.0;
                        req.body.latitude = 0.0;
                        req.body.IDadhaarNumber = (req.body.IDadhaarNumber) ? req.body.IDadhaarNumber : "";
                        req.body.passportNumber = (req.body.passportNumber) ? req.body.passportNumber : "";
                        req.body.ppExpiryDate = (req.body.ppExpiryDate) ? req.body.ppExpiryDate : null;
                        req.body.experience = (req.body.experience) ? req.body.experience : 0;
                        req.body.employer = (req.body.employer) ? req.body.employer : "";
                        req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
                        req.body.notes = (req.body.notes) ? req.body.notes : "";
                        req.body.DOB = (req.body.DOB) ? req.body.DOB : null;
                        //req.body.originalCvId = (req.body.originalCvId) ? req.body.originalCvId : 0;
                        req.body.status = (req.body.status) ? req.body.status : 0;
                        req.body.blockingPeriod = (req.body.blockingPeriod) ? req.body.blockingPeriod : 0;
                        req.body.affirmitive = (req.body.affirmitive) ? req.body.affirmitive : '';
                        req.body.transactions = (req.body.transactions) ? req.body.transactions : '';
                        req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                        req.body.imageUrl = req.body.imageUrl ? req.body.imageUrl : '';
                        req.body.reqAppId = req.body.reqAppId ? req.body.reqAppId : 0;
                        req.body.clientCvPath = req.body.clientCvPath ? req.body.clientCvPath : "";
                        req.body.importerFlag = req.body.importerFlag ? req.body.importerFlag : 0;
                        req.body.referredBy = req.body.referredBy ? req.body.referredBy : "";
                        req.body.emailId = req.body.emailId ? req.body.emailId : "";
                        req.body.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : "";

                        req.body.gender = (req.body.gender && req.body.gender != 'null') ? req.body.gender : 3;

                        var inputs = [
                            req.st.db.escape(req.query.applicantId),
                            req.st.db.escape(req.query.requirementId),
                            req.st.db.escape(req.body.firstName),
                            req.st.db.escape(req.body.lastName),
                            // req.st.db.escape(req.body.phoneISD),
                            // req.st.db.escape(req.body.phoneNumber),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(req.body.emailId),
                            req.st.db.escape(JSON.stringify(primarySkills)),
                            req.st.db.escape(JSON.stringify(secondarySkills)),
                            req.st.db.escape(JSON.stringify(industry)),
                            req.st.db.escape(JSON.stringify(req.body.ugEducation || {})),
                            req.st.db.escape(JSON.stringify(req.body.pgEducation || {})),
                            req.st.db.escape(JSON.stringify(prefLocations)),
                            req.st.db.escape(JSON.stringify(functionalAreas)),
                            req.st.db.escape(JSON.stringify(nationality)),
                            req.st.db.escape(JSON.stringify(presentLocation)),

                            req.st.db.escape(req.body.experience),
                            req.st.db.escape(req.body.presentEmployer),
                            req.st.db.escape(JSON.stringify(jobTitle[0])),
                            req.st.db.escape(req.body.noticePeriod),
                            req.st.db.escape(JSON.stringify(currency)),
                            req.st.db.escape(req.body.presentSalary),
                            req.st.db.escape(JSON.stringify(scale)),
                            req.st.db.escape(JSON.stringify(duration)),
                            req.st.db.escape(req.body.profilePicture || ""),
                            req.st.db.escape(req.body.gender || 3),
                            req.st.db.escape(req.body.DOB || null),
                            req.st.db.escape(req.body.idNumber || ""),
                            req.st.db.escape(req.body.middleName || ""),
                            req.st.db.escape(req.body.passportNumber),
                            req.st.db.escape(req.body.ppExpiryDate),
                            req.st.db.escape(req.body.ppIssueDate || null),

                            req.st.db.escape(req.body.address),
                            req.st.db.escape(req.body.resumeCdnPath),
                            req.st.db.escape(req.body.cvKeywords || cvKeywords || '')
                            // req.st.db.escape(req.body.notes),
                            // req.st.db.escape(req.body.cvRating),
                            // req.st.db.escape(JSON.stringify(attachmentList)),
                            // req.st.db.escape(JSON.stringify(cvSource)),

                            // //req.st.db.escape(req.body.originalCvId),
                            // req.st.db.escape(req.body.blockingPeriod),
                            // req.st.db.escape(req.body.status),
                            // req.st.db.escape(req.body.requirementId),
                            // req.st.db.escape(req.body.htmlText),
                            // req.st.db.escape(req.body.reqAppId),
                            // req.st.db.escape(req.body.clientCvPath),
                            // req.st.db.escape(req.body.importerFlag),
                            // req.st.db.escape(JSON.stringify(requirementArray)),
                            // req.st.db.escape(req.body.referredBy),
                            // req.st.db.escape(JSON.stringify(faceSheet)),
                            // req.st.db.escape(req.body.gccExp || 0.0),
                            // req.st.db.escape(req.body.licenseOption || 0),
                            // req.st.db.escape(req.body.passportCategory || ""),
                            // req.st.db.escape(JSON.stringify(req.body.licenseData || []))s
                        ];

                        var procQuery = 'CALL wm_save_sourcedApplicantUpdate( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                        console.log(procQuery);

                        req.db.query(procQuery, function (err, result) {
                            console.log(err);

                            if (!err && result && result[0] && result[0][0].applicantId) {

                                response.status = true;
                                response.message = "Resume Saved Successfully";
                                response.error = null;
                                response.data = {
                                    applicantId: result[0][0].applicantId
                                };
                                res.status(200).json(response);

                            }
                            // else if (!err && result && result[0] && result[0][0]._applicantExists) {

                            //     response.status = false;
                            //     response.message = "Resume already exists";
                            //     response.error = null;
                            //     response.data = {
                            //         applicantId: result[0][0]._applicantExists
                            //     };
                            //     response.duplicate = 1;
                            //     res.status(200).json(response);

                            // }
                            else {
                                response.status = false;
                                response.message = "Error While Saving Resume";
                                response.error = 1;
                                console.log(err);
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

module.exports = settingsCtrl;
