var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
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


var attachmentFunction = function (req,attachments,i) {
    
    var uniqueId = uuid.v4();
    var timestamp = Date.now();
    var filetype = attachments.filename ? attachments.filename.split('.')[1] : '';

    var aUrl = uniqueId + '.' + filetype;
    ///home/ezeonetalent/ezeone1/api/routes/api/JobRaiser
    console.log('aUrl(',i,')', aUrl);
    // C:\Users\TM2\Documents\gitproject\routes\api\JobRaiser\settings\imap
    fs.writeFile("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/imap" + (timestamp+i) + "." + filetype, attachments.data, function (err) {
        if (!err) {
            console.log("file written",i);
            var readStream = fs.createReadStream('/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/imap' + (timestamp+i) + '.' + filetype);
            console.log('file read',i, readStream);
            uploadDocumentToCloud(aUrl, readStream, function (err) {
                if (!err) {
                    console.log('attachment Uploaded successfully',i, aUrl);
                    console.log('https://storage.googleapis.com/ezeone/' + aUrl);


                    // var buff = fs.readFileSync("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/imap" + (timestamp+i) + "." + filetype);
                    // base64data = new Buffer(buff).toString('base64');
                    // console.log('base64',base64data);

                    var formData = {
                        attachment : attachments
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
                            console.error('upload failed:', err);
                        }
                        else {
                            fs.unlink("/home/ezeonetalent/ezeone1/api/routes/api/JobRaiser/settings/imap" +(timestamp+i) + "." + filetype, function (err) {
                                if (!err) {
                                    console.log('File Deleted');
                                }
                            });

                            console.log('xml body',body);
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
                            var convert = require('xml-js');
                            var jsonResult = convert.xml2json(body, options);

                            var jsonResponse = JSON.parse(jsonResult);
                            var Document = jsonResponse.Document;
                            console.log(jsonResponse);
                            console.log(typeof (Document));

                            var Name = Document.Name._text;
                            var firstName = "";
                            var lastName = "";
                            if (Name && Name.split(' ')[0])
                                firstName = Name.split(' ')[0];

                            if (Name && Name.split(' ')[1])
                                lastName = Name.split(' ')[1];

                            var DOB = Document.DOB._text ? Document.DOB._text : undefined;
                            var gender = Document.Gender._text ? Document.Gender._text : undefined;
                            var mobileNumber = Document.Mobile._text ? Document.Mobile._text : '';
                            var emailId = Document.EMail._text ? Document.EMail._text : '';

                            var passportNumber = Document.Passport._text ? Document.Passport._text : '';
                            var SkillText = Document.SkillText._text ? Document.SkillText._text : '';
                            var skills = SkillText.split(',');  // splits skills and forms array of skills
                            var passportExpiryDate = Document.PassportExpiryDate._text ? Document.PassportExpiryDate._text : undefined;
                            console.log(firstName, lastName, skills);


                            var applicantId =  0;
                            var heMasterId =  1000;
                            var mobileISD ='+91';
                            var cvPath = aUrl;

                            var response = {
                                status: false,
                                message: "Something went wrong",
                                data: null,
                                error: null
                            };

                            var inputs = [
                                req.st.db.escape(heMasterId),
                                req.st.db.escape(applicantId),
                                req.st.db.escape(firstName),
                                req.st.db.escape(lastName),
                                req.st.db.escape(DOB),
                                req.st.db.escape(gender),
                                req.st.db.escape(mobileISD),
                                req.st.db.escape(mobileNumber),
                                req.st.db.escape(passportNumber),
                                req.st.db.escape(passportExpiryDate),
                                req.st.db.escape(emailId),
                                req.st.db.escape(JSON.stringify(skills || [])),
                                req.st.db.escape(cvPath)
                            ];
                            var procQuery = 'CALL wm_save_cvSouring( ' + inputs.join(',') + ')';
                            console.log(procQuery);

                            req.db.query(procQuery, function (cvErr, cvResult) {
                                console.log(cvErr);
                                if (cvErr) {
                                    console.log("error", cvErr);
                                }
                                else {
                                    console.log("resume sourced successfully", cvResult);
                                }
                            });
                        }
                    });
                }
            });

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

                    if (req.query.userManager == 0) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[2].length; j++) {
                                var res3 = {};
                                res3.templateId = result[2][j].templateId;
                                res3.isAdmin = result[2][j].isAdmin;
                                res3.templateName = result[2][j].templateName;
                                res3.templateData = result[2][j].templateData ? JSON.parse(result[2][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {
                                    formDetails: result[0],
                                    formRights: result[1],
                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "Your are Not Admin! No data found";
                            response.error = null;
                            response.data = {
                                formDetails: [],
                                formRights: [],
                                templateDetails: []

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
                    }
                    else if (req.query.userManager == 1) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[0].length; j++) {
                                var res3 = {};
                                res3.templateId = result[0][j].templateId;
                                res3.templateName = result[0][j].templateName;
                                res3.templateData = result[0][j].templateData ? JSON.parse(result[0][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {

                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No results found";
                            response.error = null;
                            response.data = {

                                templateDetails: []

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
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
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
                        res.status(200).json(response);
                    }

                    else if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Offer template saved sucessfully";
                        response.error = null;
                        response.data = {
                            offerTemplateDetail: (result[0] && result[0][0]) ? result[0][0].formData : {}
                        }
                        res.status(200).json(response);
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

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Offer templates loaded sucessfully";
                        response.error = null;
                        for (var i = 0; i < result[3].length; i++) {
                            result[3][i].offerBreakUp = result[3][0] && result[3][0] ? JSON.parse(result[3][i].offerBreakUp) : [];
                        }

                        response.data = {
                            offerTemplates: (result[0] && result[0][0]) ? result[0] : [],
                            offerTemplateDetail: (result[1] && result[1][0]) ? JSON.parse(result[1][0].formData) : {},
                            allowanceBreakUp : result[2] && result[2][0] ? result[2]:[],
                            offerBreakUpTemplates :result[3] && result[3][0] ? result[3]:[],
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
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
                            offerBreakUpTemplates : result[1] && result[1][0] ? result[1] : [],
                            currentOfferBreakUpTemplate : result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}
                        };
                        res.status(200).json(response);
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
                            offerBreakUpTemplates : result[1] && result[1][0] ? result[1] : [],
                            currentOfferBreakUpTemplate : result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}
                            
                        };
                        res.status(200).json(response);
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
                            offerBreakUpTemplates : result[1] && result[1][0] ? result[1] : [],
                            currentOfferBreakUpTemplate : result[2] && result[2][0] && result[2][0].currentOfferBreakUpTemplate ? result[2][0].currentOfferBreakUpTemplate : {}
                            
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            offerBreakUpTemplates:[]
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
            for (var i = 0; i < attachments.length; i++) {
                attachmentFunction(req,attachments[i],i);

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
            var searchCriteria = ['UNSEEN',  ['SINCE', yesterday]];
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


module.exports = settingsCtrl;
