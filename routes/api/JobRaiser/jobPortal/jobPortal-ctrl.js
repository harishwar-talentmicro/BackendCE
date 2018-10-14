/**
 * Created by Jana1 on 18-12-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var path = require('path');
var request = require('request');

var bodyParser = require('body-parser');
var textract = require('textract');
var http = require('https');
var EZEIDEmail = 'noreply@talentmicro.com';

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;
var appConfig = require('../../../../ezeone-config.json');

const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+18647547021';
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


var jobPortalCtrl = {};
var error = {};



var cv = '';
var text = '';
var gs_url = '';
var storage_bucket = '';

var attachFile = new Promise(function (resolve, reject) {
    if (cv != '') {
        cv = gs_url + storage_bucket + '/' + cv;

        http.get(cv, function (fileResponse) {
            var bufs = [];

            fileResponse.on('data', function (d) { bufs.push(d); });
            fileResponse.on('end', function () {
                var buf = Buffer.concat(bufs);
                textract.fromBufferWithName(cv, buf, function (error, txt) {
                    text = txt;
                    resolve(text);
                });
            });
        });

    }
    else {
        resolve('');
    }
});

// jobPortalCtrl.portalSaveApplicant = function (req, res, next) {
//     var cvKeywords = '';


//     var response = {
//         status: false,
//         message: "Invalid token",
//         data: null,
//         error: null
//     };
//     var validationFlag = true;
//     if (!req.query.token) {
//         error.token = 'Invalid token';
//         validationFlag *= false;
//     }
//     if (!req.body.firstName) {
//         error.firstName = 'please Enter Name';
//         validationFlag *= false;
//     }
//     if (!req.body.emailId) {
//         error.emailId = 'emailId is mandatory';
//         validationFlag *= false;
//     }
//     // if (!req.body.nationalityId) {
//     //     error.nationalityId = 'nationalityId is mandatory';
//     //     validationFlag *= false;
//     // }

//     if (!req.body.mobileNumber) {
//         error.mobileNumber = 'mobile Number is mandatory';
//         validationFlag *= false;
//     }
//     var education = req.body.education;
//     if (typeof (education) == "string") {
//         education = JSON.parse(education);
//     }
//     if (!education) {
//         education = [];
//     }
//     var jobTitle = req.body.jobTitle;
//     if (typeof (jobTitle) == "string") {
//         jobTitle = JSON.parse(jobTitle);
//     }
//     if (!jobTitle) {
//         jobTitle = {};
//     }
//     var primarySkills = req.body.primarySkills;
//     if (typeof (primarySkills) == "string") {
//         primarySkills = JSON.parse(primarySkills);
//     }
//     if (!primarySkills) {
//         primarySkills = [];
//     }
//     var secondarySkills = req.body.secondarySkills;
//     if (typeof (secondarySkills) == "string") {
//         secondarySkills = JSON.parse(secondarySkills);
//     }
//     if (!secondarySkills) {
//         secondarySkills = [];
//     }
//     var cvSource = req.body.cvSource;
//     if (typeof (cvSource) == "string") {
//         cvSource = JSON.parse(cvSource);
//     }
//     if (!cvSource) {
//         cvSource = {};
//     }
//     var prefLocations = req.body.prefLocations;
//     if (typeof (prefLocations) == "string") {
//         prefLocations = JSON.parse(prefLocations);
//     }
//     if (!prefLocations) {
//         prefLocations = [];
//     }
//     var industry = req.body.industry;
//     if (typeof (industry) == "string") {
//         industry = JSON.parse(industry);
//     }
//     if (!industry) {
//         industry = [];
//     }
//     var nationality = req.body.nationality;
//     if (typeof (nationality) == "string") {
//         nationality = JSON.parse(nationality);
//     }
//     if (!nationality) {
//         nationality = {};
//     }
//     var expectedSalaryCurr = req.body.expectedSalaryCurr;
//     if (typeof (expectedSalaryCurr) == "string") {
//         expectedSalaryCurr = JSON.parse(expectedSalaryCurr);
//     }
//     if (!expectedSalaryCurr) {
//         expectedSalaryCurr = {};
//     }

//     var expectedSalaryScale = req.body.expectedSalaryScale;
//     if (typeof (expectedSalaryScale) == "string") {
//         expectedSalaryScale = JSON.parse(expectedSalaryScale);
//     }
//     if (!expectedSalaryScale) {
//         expectedSalaryScale = {};
//     }
//     var expectedSalaryPeriod = req.body.expectedSalaryPeriod;
//     if (typeof (expectedSalaryPeriod) == "string") {
//         expectedSalaryPeriod = JSON.parse(expectedSalaryPeriod);
//     }
//     if (!expectedSalaryPeriod) {
//         expectedSalaryPeriod = {};
//     }
//     var presentSalaryCurr = req.body.presentSalaryCurr;
//     if (typeof (presentSalaryCurr) == "string") {
//         presentSalaryCurr = JSON.parse(presentSalaryCurr);
//     }
//     if (!presentSalaryCurr) {
//         presentSalaryCurr = {};
//     }
//     var presentSalaryScale = req.body.presentSalaryScale;
//     if (typeof (presentSalaryScale) == "string") {
//         presentSalaryScale = JSON.parse(presentSalaryScale);
//     }
//     if (!presentSalaryScale) {
//         presentSalaryScale = {};
//     }
//     var presentSalaryPeriod = req.body.presentSalaryPeriod;
//     if (typeof (presentSalaryPeriod) == "string") {
//         presentSalaryPeriod = JSON.parse(presentSalaryPeriod);
//     }
//     if (!presentSalaryPeriod) {
//         presentSalaryPeriod = {};
//     }



//     if (!validationFlag) {
//         response.error = error;
//         response.message = 'Please check the errors';
//         res.status(400).json(response);
//         console.log(response);
//     }
//     else {
//         req.st.validateToken(req.query.token, function (err, tokenResult) {
//             if ((!err) && tokenResult) {
//                 var cv='';
//                 cv = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.body.cvPath;
//                 console.log(cv);
//                 http.get(cv, function (fileResponse) {
//                     var bufs = [];
//                     fileResponse.on('data', function (d) { bufs.push(d); });
//                     fileResponse.on('end', function () {
//                         var buf = Buffer.concat(bufs);
//                         textract.fromBufferWithName(cv, buf, function (error, text) {
//                             if (!error) {

//                                 cvKeywords = text;

//                                 req.body.applicantId = (req.body.applicantId) ? req.body.applicantId : 0;
//                                 req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;
//                                 req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
//                                 req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : "";
//                                 req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : "";
//                                 req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
//                                 //req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : "";
//                                 //req.body.emailId = (req.body.emailId) ? req.body.emailId : "";
//                                 //education = (JSON.stringify(education)) ? (JSON.stringify(education)) : [];
//                                 req.body.address = (req.body.address) ? req.body.address : "";
//                                 req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
//                                 req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;
//                                 req.body.IDadhaarNumber = (req.body.IDadhaarNumber) ? req.body.IDadhaarNumber : "";
//                                 req.body.passportNumber = (req.body.passportNumber) ? req.body.passportNumber : "";
//                                 req.body.ppExpiryDate = (req.body.ppExpiryDate) ? req.body.ppExpiryDate : null;
//                                 req.body.experience = (req.body.experience) ? req.body.experience : 0;
//                                 req.body.employer = (req.body.employer) ? req.body.employer : "";
//                                 //jobTitle = (JSON.stringify(jobTitle)) ? (JSON.stringify(jobTitle)) : [];
//                                 req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
//                                 // req.body.expectedSalaryCurrId = (req.body.expectedSalaryCurrId) ? req.body.expectedSalaryCurrId : 0; // default INR
//                                 // req.body.expectedSalary = (req.body.expectedSalary) ? req.body.expectedSalary : 0.0;
//                                 // req.body.expectedSalaryScaleId = (req.body.expectedSalaryScaleId) ? req.body.expectedSalaryScaleId : 0;
//                                 // req.body.expectedSalaryPeriodId = (req.body.expectedSalaryPeriodId) ? req.body.expectedSalaryPeriodId : 0;
//                                 // req.body.presentSalaryCurrId = (req.body.presentSalaryCurrId) ? req.body.presentSalaryCurrId : 0;
//                                 // req.body.presentSalary = (req.body.presentSalary) ? req.body.presentSalary : 0.0;
//                                 // req.body.presentSalaryScaleId = (req.body.presentSalaryScaleId) ? req.body.presentSalaryScaleId : 0;
//                                 // req.body.presentSalaryPeriodId = (req.body.presentSalaryPeriodId) ? req.body.presentSalaryPeriodId : 0;
//                                 //primarySkills = (JSON.stringify(primarySkills)) ? (JSON.stringify(primarySkills)) : [];
//                                 //secondarySkills = (JSON.stringify(secondarySkills)) ? (JSON.stringify(secondarySkills)) : [];
//                                 req.body.notes = (req.body.notes) ? req.body.notes : "";
//                                 //req.body.cvRating = (req.body.cvRating) ? req.body.cvRating : 0;
//                                 //cvSource = (JSON.stringify(cvSource)) ? (JSON.stringify(cvSource)) : [];
//                                 //req.body.cvSourceReference = (req.body.cvSourceReference) ? req.body.cvSourceReference : "";
//                                 //req.body.gender = (req.body.gender) ? req.body.gender : 0;
//                                 req.body.DOB = (req.body.DOB) ? req.body.DOB : null;
//                                 //req.body.originalCvId = (req.body.originalCvId) ? req.body.originalCvId : 0;
//                                 req.body.status = (req.body.status) ? req.body.status : 0;
//                                 req.body.blockingPeriod = (req.body.blockingPeriod) ? req.body.blockingPeriod : 0;
//                                 //prefLocations = (JSON.stringify(prefLocations)) ? (JSON.stringify(prefLocations)) : [];
//                                 //industry = (JSON.stringify(industry)) ? (JSON.stringify(industry)) : [];
//                                 //req.body.nationalityId = (req.body.nationalityId) ? req.body.nationalityId : 0;
//                                 req.body.affirmitive = (req.body.affirmitive) ? req.body.affirmitive : '';
//                                 req.body.transactions = (req.body.transactions) ? req.body.transactions : '';
//                                 req.body.isJobPortal = (req.body.isJobPortal) ? req.body.isJobPortal : 0;
//                                 req.body.imageUrl = (req.body.imageUrl) ? req.body.imageUrl : '';


//                                 var inputs = [
//                                     req.st.db.escape(req.query.token),
//                                     req.st.db.escape(req.body.heMasterId),
//                                     req.st.db.escape(req.body.applicantId),
//                                     req.st.db.escape(req.body.firstName),
//                                     req.st.db.escape(req.body.lastName),
//                                     req.st.db.escape(req.body.phoneISD),
//                                     req.st.db.escape(req.body.phoneNumber),
//                                     req.st.db.escape(req.body.mobileISD),
//                                     req.st.db.escape(req.body.mobileNumber),
//                                     req.st.db.escape(req.body.emailId),
//                                     req.st.db.escape(JSON.stringify(education)),
//                                     req.st.db.escape(req.body.address),
//                                     req.st.db.escape(req.body.latitude),
//                                     req.st.db.escape(req.body.longitude),
//                                     req.st.db.escape(req.body.IDadhaarNumber),
//                                     req.st.db.escape(req.body.passportNumber),
//                                     req.st.db.escape(req.body.ppExpiryDate),
//                                     req.st.db.escape(req.body.experience),
//                                     req.st.db.escape(req.body.employer),
//                                     req.st.db.escape(JSON.stringify(jobTitle[0])),
//                                     req.st.db.escape(req.body.noticePeriod),
//                                     req.st.db.escape(JSON.stringify(expectedSalaryCurr)),
//                                     req.st.db.escape(req.body.expectedSalary),
//                                     req.st.db.escape(JSON.stringify(expectedSalaryScale)),
//                                     req.st.db.escape(JSON.stringify(expectedSalaryPeriod)),
//                                     req.st.db.escape(JSON.stringify(presentSalaryCurr)),
//                                     req.st.db.escape(req.body.presentSalary),
//                                     req.st.db.escape(JSON.stringify(presentSalaryScale)),
//                                     req.st.db.escape(JSON.stringify(presentSalaryPeriod)),
//                                     req.st.db.escape(JSON.stringify(primarySkills)),
//                                     req.st.db.escape(JSON.stringify(secondarySkills)),
//                                     req.st.db.escape(req.body.notes),
//                                     req.st.db.escape(req.body.cvRating),
//                                     req.st.db.escape(req.body.cvPath),
//                                     req.st.db.escape(JSON.stringify(cvSource)),
//                                     //req.st.db.escape(req.body.cvSourceReference),
//                                     req.st.db.escape(req.body.gender),
//                                     req.st.db.escape(req.body.DOB),
//                                     //req.st.db.escape(req.body.originalCvId),
//                                     req.st.db.escape(req.body.blockingPeriod),
//                                     req.st.db.escape(req.body.status),
//                                     req.st.db.escape(JSON.stringify(prefLocations)),
//                                     req.st.db.escape(JSON.stringify(industry)),
//                                     req.st.db.escape(JSON.stringify(nationality)),
//                                     req.st.db.escape(cvKeywords),
//                                     req.st.db.escape(req.body.isJobPortal),
//                                     req.st.db.escape(req.body.imageUrl)

//                                 ];

//                                 var procQuery = 'CALL portal_save_applicant( ' + inputs.join(',') + ')';  // call procedure to save requirement data
//                                 console.log(procQuery);

//                                 req.db.query(procQuery, function (err, result) {
//                                     console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
//                                     //console.log(result);

//                                     if (!err && result && result[0]) {

//                                         response.status = true;
//                                         response.message = "profile saved successfully";
//                                         response.error = null;
//                                         response.data = {
//                                             applicantId: result[0][0].applicantId
//                                         };
//                                         res.status(200).json(response);

//                                     }
//                                     else {
//                                         response.status = false;
//                                         response.message = "Error while saving profile";
//                                         response.error = null;
//                                         console.log(err);
//                                         res.status(500).json(response);

//                                     }
//                                 });


//                             }

//                         });
//                     });
//                 });


//             }
//             else {
//                 res.status(401).json(response);
//             }

//         });
//     }
// };


jobPortalCtrl.portalSaveApplicant = function (req, res, next) {
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
    //  if (!req.body.heMasterId) {
    //      error.heMasterId = 'Invalid Company';
    //      validationFlag *= false;
    //  }
    if (!req.body.firstName) {
        error.firstName = 'First Name is Mandatory';
        validationFlag *= false;
    }
    if (!req.body.emailId || !req.body.mobileNumber) {   // any one is mandatory
        error.emailId = 'EMail ID or Mobile Number is mandatory';
        validationFlag *= false;
    }

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
    var cvSource = req.body.cvSource;
    if (typeof (cvSource) == "string") {
        cvSource = JSON.parse(cvSource);
    }
    if (!cvSource) {
        cvSource = {};
    }
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
    var expectedSalaryCurr = req.body.expectedSalaryCurr;
    if (typeof (expectedSalaryCurr) == "string") {
        expectedSalaryCurr = JSON.parse(expectedSalaryCurr);
    }
    if (!expectedSalaryCurr) {
        expectedSalaryCurr = {};
    }

    var expectedSalaryScale = req.body.expectedSalaryScale;
    if (typeof (expectedSalaryScale) == "string") {
        expectedSalaryScale = JSON.parse(expectedSalaryScale);
    }
    if (!expectedSalaryScale) {
        expectedSalaryScale = {};
    }
    var expectedSalaryPeriod = req.body.expectedSalaryPeriod;
    if (typeof (expectedSalaryPeriod) == "string") {
        expectedSalaryPeriod = JSON.parse(expectedSalaryPeriod);
    }
    if (!expectedSalaryPeriod) {
        expectedSalaryPeriod = {};
    }
    var presentSalaryCurr = req.body.presentSalaryCurr;
    if (typeof (presentSalaryCurr) == "string") {
        presentSalaryCurr = JSON.parse(presentSalaryCurr);
    }
    if (!presentSalaryCurr) {
        presentSalaryCurr = {};
    }
    var presentSalaryScale = req.body.presentSalaryScale;
    if (typeof (presentSalaryScale) == "string") {
        presentSalaryScale = JSON.parse(presentSalaryScale);
    }
    if (!presentSalaryScale) {
        presentSalaryScale = {};
    }
    var presentSalaryPeriod = req.body.presentSalaryPeriod;
    if (typeof (presentSalaryPeriod) == "string") {
        presentSalaryPeriod = JSON.parse(presentSalaryPeriod);
    }
    if (!presentSalaryPeriod) {
        presentSalaryPeriod = {};
    }
    var attachmentList = req.body.attachmentList;
    if (typeof (attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if (!attachmentList) {
        attachmentList = [];
    }
    var functionalAreas = req.body.functionalAreas;
    if (typeof (functionalAreas) == "string") {
        functionalAreas = JSON.parse(functionalAreas);
    }
    if (!functionalAreas) {
        functionalAreas = [];
    }
    var requirementArray = req.body.requirementArray;
    if (typeof (requirementArray) == "string") {
        requirementArray = JSON.parse(requirementArray);
    }
    if (!requirementArray) {
        requirementArray = [];
    }

    var faceSheet = req.body.faceSheet;
    if (typeof (faceSheet) == "string") {
        faceSheet = JSON.parse(faceSheet);
    }
    if (!faceSheet) {
        faceSheet = {};
    }

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

                req.query.isWeb = (req.body.isWeb) ? req.body.isWeb : 0;
                if (attachmentList.length && !req.body.cvKeywords) {
                    cv = attachmentList[0].CDNPath;
                }
                gs_url = req.CONFIG.CONSTANT.GS_URL;
                storage_bucket = req.CONFIG.CONSTANT.STORAGE_BUCKET;

                console.log(cv);
                attachFile.then(function (resp) {
                    console.log("response after promise", resp);
                    if (1) {

                        cvKeywords = text;
                        console.log('text from promise', resp);

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
                        req.body.gender = (req.body.gender && req.body.gender != 'null') ? req.body.gender : undefined;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.heMasterId),
                            req.st.db.escape(req.body.applicantId),
                            req.st.db.escape(req.body.firstName),
                            req.st.db.escape(req.body.lastName),
                            req.st.db.escape(req.body.phoneISD),
                            req.st.db.escape(req.body.phoneNumber),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(req.body.emailId),
                            req.st.db.escape(JSON.stringify(education)),
                            req.st.db.escape(req.body.address),
                            req.st.db.escape(req.body.latitude),
                            req.st.db.escape(req.body.longitude),
                            req.st.db.escape(req.body.IDadhaarNumber),
                            req.st.db.escape(req.body.passportNumber),
                            req.st.db.escape(req.body.ppExpiryDate),
                            req.st.db.escape(req.body.experience),
                            req.st.db.escape(req.body.employer),
                            req.st.db.escape(JSON.stringify(jobTitle)),
                            req.st.db.escape(req.body.noticePeriod),
                            req.st.db.escape(JSON.stringify(expectedSalaryCurr)),
                            req.st.db.escape(req.body.expectedSalary),
                            req.st.db.escape(JSON.stringify(expectedSalaryScale)),
                            req.st.db.escape(JSON.stringify(expectedSalaryPeriod)),
                            req.st.db.escape(JSON.stringify(presentSalaryCurr)),
                            req.st.db.escape(req.body.presentSalary),
                            req.st.db.escape(JSON.stringify(presentSalaryScale)),
                            req.st.db.escape(JSON.stringify(presentSalaryPeriod)),
                            req.st.db.escape(JSON.stringify(primarySkills)),
                            req.st.db.escape(JSON.stringify(secondarySkills)),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(req.body.cvRating),
                            req.st.db.escape(req.body.cvPath),
                            req.st.db.escape(JSON.stringify(cvSource)),
                            req.st.db.escape(req.body.gender),
                            req.st.db.escape(req.body.DOB),
                            //req.st.db.escape(req.body.originalCvId),
                            req.st.db.escape(req.body.blockingPeriod),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(JSON.stringify(prefLocations)),
                            req.st.db.escape(JSON.stringify(industry)),
                            req.st.db.escape(JSON.stringify(nationality)),
                            req.st.db.escape(cvKeywords || req.body.cvKeywords),
                            req.st.db.escape(req.body.requirementId),
                            req.st.db.escape(req.body.imageUrl),
                            req.st.db.escape(req.body.htmlText),
                            req.st.db.escape(req.body.reqAppId),
                            req.st.db.escape(req.body.clientCvPath),
                            req.st.db.escape(JSON.stringify(functionalAreas)),
                            req.st.db.escape(req.body.importerFlag),
                            req.st.db.escape(JSON.stringify(requirementArray)),
                            req.st.db.escape(req.body.referredBy),
                            req.st.db.escape(JSON.stringify(faceSheet)),
                            req.st.db.escape(JSON.stringify(presentLocation))

                        ];

                        var procQuery = 'CALL portal_save_applicant( ' + inputs.join(',') + ')';  // call procedure to save requirement data
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
                            else if (!err && result && result[0] && result[0][0]._applicantExists) {

                                response.status = false;
                                response.message = "Resume already exists";
                                response.error = null;
                                response.data = {
                                    applicantId: result[0][0]._applicantExists
                                };
                                response.duplicate = 1;
                                res.status(200).json(response);

                            }
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



jobPortalCtrl.getPortalRequirementDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heParentId) {
        error.heParentId = 'Invalid parentId';
        validationFlag *= false;
    }

    var validationFlag = true;
    if (!req.query.parentId) {
        error.parentId = 'Invalid parentId';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        //         //req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

        var getStatus = [
            req.st.db.escape(req.query.token || ""),
            req.st.db.escape(req.query.parentId),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(req.query.applicantId || 0)
        ];


        var procQuery = 'CALL portal_get_requirementDetails( ' + getStatus.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0]) {
                response.status = true;
                response.message = "requirement Details loaded successfully";
                response.error = null;

                result[0][0].branchList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].branchList) : {};
                result[0][0].contactList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].contactList) : [];
                result[0][0].currency = (result[0] && result[0][0]) ? JSON.parse(result[0][0].currency) : {};
                result[0][0].duration = (result[0] && result[0][0]) ? JSON.parse(result[0][0].duration) : {};
                result[0][0].educationSpecialization = (result[0] && result[0][0]) ? JSON.parse(result[0][0].educationSpecialization) : [];
                result[0][0].heDepartment = (result[0] && result[0][0]) ? JSON.parse(result[0][0].heDepartment) : {};
                result[0][0].jobTitle = (result[0] && result[0][0]) ? JSON.parse(result[0][0].jobTitle) : {};
                result[0][0].jobType = (result[0] && result[0][0]) ? JSON.parse(result[0][0].jobType) : {};
                result[0][0].locationlist = (result[0] && result[0][0]) ? JSON.parse(result[0][0].locationlist) : [];
                result[0][0].memberInterviewRound = (result[0] && result[0][0]) ? JSON.parse(result[0][0].memberInterviewRound) : [];
                result[0][0].members = (result[0] && result[0][0]) ? JSON.parse(result[0][0].members) : [];
                result[0][0].primarySkills = (result[0] && result[0][0]) ? JSON.parse(result[0][0].primarySkills) : [];
                result[0][0].scale = (result[0] && result[0][0]) ? JSON.parse(result[0][0].scale) : {};
                result[0][0].secondarySkills = (result[0] && result[0][0]) ? JSON.parse(result[0][0].secondarySkills) : [];
                result[0][0].industry = (result[0] && result[0][0]) ? JSON.parse(result[0][0].industry) : [];
                result[0][0].attachmentList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].attachmentList) : [];

                response.data = {

                    portalrequirementDetails: result[0] && result[0][0] ? result[0][0] : {}
                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = false;
                response.message = "requirement Details not found";
                response.error = null;
                response.data = {
                    portalrequirementDetails: {}
                };
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while getting requirement Details";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }

};

jobPortalCtrl.getPortalApplicantDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.applicantId) {
        error.applicantId = 'Invalid applicantId';
        validationFlag *= false;
    }

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
                //req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.applicantId)

                ];

                var procQuery = 'CALL portal_get_applicantDetails( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "applicant details loaded successfully";
                        response.error = null;

                        var temp_result = result[0][0] ? result[0][0] : {};
                        temp_result.education = JSON.parse(temp_result.education);
                        temp_result.cvSource = JSON.parse(temp_result.cvSource).cvSourceId ? JSON.parse(temp_result.cvSource) : {};
                        temp_result.expectedSalaryCurr = JSON.parse(temp_result.expectedSalaryCurr).currencyId ? JSON.parse(temp_result.expectedSalaryCurr) : {};
                        temp_result.expectedSalaryPeriod = JSON.parse(temp_result.expectedSalaryPeriod).durationId ? JSON.parse(temp_result.expectedSalaryPeriod) : {};
                        temp_result.expectedSalaryScale = JSON.parse(temp_result.expectedSalaryScale).scaleId ? JSON.parse(temp_result.expectedSalaryScale) : {};
                        temp_result.industry = JSON.parse(temp_result.industry);
                        temp_result.jobTitle = JSON.parse(temp_result.jobTitle).jobTitleId ? JSON.parse(temp_result.jobTitle) : {};
                        //  temp_result.jobTitle = temp_result.jobTitle.titleId != null ? temp_result.jobTitle : undefined;
                        temp_result.nationality = JSON.parse(temp_result.nationality).nationalityId ? JSON.parse(temp_result.nationality) : {};
                        temp_result.prefLocations = JSON.parse(temp_result.prefLocations);
                        temp_result.presentSalaryCurr = JSON.parse(temp_result.presentSalaryCurr).currencyId ? JSON.parse(temp_result.presentSalaryCurr) : {};
                        temp_result.presentSalaryPeriod = JSON.parse(temp_result.presentSalaryPeriod).durationId ? JSON.parse(temp_result.presentSalaryPeriod) : {};
                        temp_result.presentSalaryScale = JSON.parse(temp_result.presentSalaryScale).scaleId ? JSON.parse(temp_result.presentSalaryScale) : {};
                        temp_result.primarySkills = JSON.parse(temp_result.primarySkills);
                        temp_result.secondarySkills = JSON.parse(temp_result.secondarySkills);
                        temp_result.functionalAreas = JSON.parse(temp_result.functionalAreas);
                        temp_result.presentLocation = JSON.parse(temp_result.presentLocation);

                        response.data = {
                            applicantDetails: temp_result ? temp_result : {}
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "applicant Details not found";
                        response.error = null;
                        response.data = {
                            applicantDetails: {}
                        };
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting applicant Details";
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


jobPortalCtrl.getPortalSearchJob = function (req, res, next) {
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
                //req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile
                req.query.keyword = (req.query.keyword) ? req.query.keyword : '';
                req.query.function = (req.query.function) ? req.query.function : 0;
                req.query.location = (req.query.location) ? req.query.location : 0;

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.keyword),
                    req.st.db.escape(req.query.function),
                    req.st.db.escape(req.query.location)
                ];

                var procQuery = 'CALL portal_search_job( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "jobs loaded successfully";
                        response.error = null;
                        response.data = {

                            jobs: result[0] ? result[0] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "job not found";
                        response.error = null;
                        response.data = {
                            jobs: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading jobs";
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

jobPortalCtrl.getportalApplicantMasterData = function (req, res, next) {
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
                // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token)
                ];

                var procQuery = 'CALL portal_masterData_for_Applicant( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;

                        for (var j = 0; j < result[10].length; j++) {
                            result[10][j].specialization = result[10][j].specialization ? JSON.parse(result[10][j].specialization) : [];
                        };

                        response.data = {
                            jobType: result[0] ? result[0] : [],
                            currency: result[1] ? result[1] : [],
                            scale: result[2] ? result[2] : [],
                            duration: result[3] ? result[3] : [],
                            country: result[4] ? result[4] : [],
                            jobtitle: result[5] ? result[5] : [],
                            industry: result[6] ? result[6] : [],
                            cvSources: result[7] ? result[7] : [],
                            nationList: result[8] ? result[8] : [],
                            skills: result[9] ? result[9] : [],
                            educationList: result[10] ? result[10] : [],
                            industryList: result[11] ? result[11] : [],
                            locationList: result[12] ? result[12] : []
                        };
                        res.status(200).json(response);

                        // if (req.query.isWeb==0) {
                        //     var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        //     zlib.gzip(buf, function (_, result) {
                        //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        //         res.status(200).json(response);
                        //     });
                        // }
                        // else{
                        //     res.status(200).json(response);
                        // }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            jobType: [],
                            currency: [],
                            scale: [],
                            duration: [],
                            country: [],
                            jobtitle: [],
                            industry: [],
                            cvSources: [],
                            nationList: [],
                            skills: [],
                            stage: [],
                            educationList: [],
                            industryList: [],
                            locationList: []
                        };
                        res.status(200).json(response);
                        // if (req.query.isWeb==0) {
                        //     var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        //     zlib.gzip(buf, function (_, result) {
                        //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        //         res.status(200).json(response);
                        //     });
                        // }
                        // else{
                        //     res.status(200).json(response);
                        // }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading master data";
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

jobPortalCtrl.getPortalRequirementList = function (req, res, next) {
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
                //req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupBy)

                ];

                var procQuery = 'CALL portal_get_requirementList( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "requirement List loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[0].length; i++) {
                            var res2 = {};
                            res2.parentId = result[0][i].parentId;
                            res2.transId = result[0][i].transId;
                            res2.heMasterId = result[0][i].heMasterId;
                            res2.heDepartmentId = result[0][i].heDepartmentId;
                            res2.departmentTitle = result[0][i].departmentTitle;
                            res2.jobCode = result[0][i].jobCode;
                            res2.jobTitleId = result[0][i].jobTitleId;
                            res2.jobTitle = result[0][i].jobTitle;
                            res2.positions = result[0][i].positions;
                            res2.jobTypeId = result[0][i].jobTypeId;
                            res2.jobType = result[0][i].jobType;
                            res2.jobDescription = result[0][i].jobDescription;
                            res2.expFrom = result[0][i].expFrom;
                            res2.expTo = result[0][i].expTo;
                            res2.targetDate = result[0][i].targetDate;
                            res2.keywords = result[0][i].keywords;
                            res2.currencyId = result[0][i].currencyId;
                            res2.currencySymbol = result[0][i].currencySymbol;
                            res2.minSalary = result[0][i].minSalary;
                            res2.maxSalary = result[0][i].maxSalary;
                            res2.scaleId = result[0][i].scaleId;
                            res2.scale = result[0][i].scale;
                            res2.durationId = result[0][i].durationId;
                            res2.duration = result[0][i].duration;
                            res2.notes = result[0][i].notes;
                            res2.expectedJoining = result[0][i].expectedJoining;
                            res2.locationList = JSON.parse(result[0][i].locationList) ? JSON.parse(result[0][i].locationList) : [];
                            output.push(res2);
                        }
                        response.data = {
                            jobList: output
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "requirement List not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting requirement List";
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


jobPortalCtrl.portalverifyotp = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    // if (!req.body.mobileNumber) {
    //     error.mobileNumber = 'Invalid mobileNumber';
    //     validationFlag *= false;
    // }

    // if (!req.body.mobileISD) {
    //     error.mobileISD = 'Invalid mobileISD';
    //     validationFlag *= false;
    // }

    // if (!req.body.emailId) {
    //     error.emailId = 'Invalid emailId';
    //     validationFlag *= false;
    // }

    if (!req.body.otp) {
        error.otp = 'Invalid otp';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token,function(err,tokenResult){
        //     if ((!err) && tokenResult) {

        var getStatus = [
            req.st.db.escape(req.body.mobileNumber || ""),
            req.st.db.escape(req.body.mobileISD || ""),
            req.st.db.escape(req.body.otp),
            req.st.db.escape(req.body.emailId || ""),
            req.st.db.escape(DBSecretKey)
        ];

        var procQuery = 'CALL portal_verifyOtp( ' + getStatus.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0] && result[0][0].message == "OTP verified successfully") {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0].message == "Mobile Number or EmailId already exists") {
                response.status = false;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].message == "INVALID OTP") {
                response.status = false;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Error while verifying otp";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else{
        //         res.status(401).json(response);
        //     }
        // });
    }

};



jobPortalCtrl.portalsignup = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    // if (!req.body.mobileNumber) {
    //     error.mobileNumber = 'Invalid mobileNumber';
    //     validationFlag *= false;
    // }

    if (!req.body.firstName) {
        error.firstName = 'Invalid firstName';
        validationFlag *= false;
    }

    // if (!req.body.mobileISD) {
    //     error.mobileISD = 'Invalid mobileISD';
    //     validationFlag *= false;
    // }

    if (!req.body.emailId && !req.body.mobileNumber) {
        error.emailId = 'Invalid emailId or mobileNumber';
        validationFlag *= false;
    }

    if (!req.body.password) {
        error.password = 'Invalid password';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token,function(err,tokenResult){
        //     if ((!err) && tokenResult) {
        req.body.lastName = req.body.lastName ? req.body.lastName : '';

        var password = req.body.password;
        var encryptPwd = req.st.hashPassword(req.body.password);

        console.log('password', password);
        console.log('encryptPwd', encryptPwd);

        var getStatus = [
            req.st.db.escape(req.body.firstName),
            req.st.db.escape(req.body.lastName),
            req.st.db.escape(req.body.mobileNumber || ""),
            req.st.db.escape(req.body.mobileISD || ""),
            req.st.db.escape(req.body.emailId || ""),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(encryptPwd),
            req.st.db.escape(req.body.heMasterId || 0)
        ];

        var procQuery = 'CALL portal_save_signUp( ' + getStatus.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = false;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].masterId) {
                response.status = true;
                response.message = "Sign up successfull";
                response.error = null;
                response.data = result[0][0];
                res.status(200).json(response);
            }

            else if (!err) {
                response.status = false;
                response.message = "Something went wrong! Please try again";
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Internal server error";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else{
        //         res.status(401).json(response);
        //     }
        // });
    }

};


jobPortalCtrl.generalMasterNoToken = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };

    var procQuery = 'CALL wm_generalMasterDataNoToken()';
    console.log(procQuery);
    req.db.query(procQuery, function (err, result) {
        console.log(err);

        if (!err && result && result[0] && result[0][0]) {
            response.status = true;
            response.message = "Data loaded successfully";
            response.error = null;
            response.data = {
                countryList: result[0] ? result[0] : [],
                industryList: result[1] ? result[1] : [],
                locationList: result[2] ? result[2] : []
            }
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

};

jobPortalCtrl.getCareerPortalRequirementList = function (req, res, next) {
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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        //req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

        var getStatus = [
            req.st.db.escape(req.body.heMasterId),
            req.st.db.escape(req.body.startPage || 0),
            req.st.db.escape(req.body.limit || 20)
        ];

        var procQuery = 'CALL wm_get_careerPortalRequirementList( ' + getStatus.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0]) {
                response.status = true;
                response.message = "Job List loaded successfully";
                response.error = null;

                response.data = {
                    jobList: result[0] && result[0][0] ? result[0] : [],
                    count: result[1] && result[1][0] ? result[1][0].count : 0
                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = false;
                response.message = "Job List not found";
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while getting Job List";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }

};



jobPortalCtrl.portalreqAppMap = function (req, res, next) {
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
                // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                req.body.requirements = req.body.requirements != undefined ? req.body.requirements : [];

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body.requirements || [])),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_save_portal_reqAppMap( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result[0] && result[0][0] && result[0][0].applicantName) {
                        response.status = true;
                        response.message = "Applied for jobs successfully";
                        response.error = null;
                        response.data = result[0] && result[0][0] ? result[0][0] : {};
                        res.status(200).json(response);


                    }
                    else if (!err && result[0] && result[0][0] && result[0][0]._error) {
                        response.status = true;
                        response.message = result[0][0]._error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while applying for job";
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

jobPortalCtrl.portalrequirementSearch = function (req, res, next) {
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
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
        req.body.industry = req.body.industry != undefined ? req.body.industry : [];
        req.body.location = req.body.location != undefined ? req.body.location : [];

        var inputs = [
            req.st.db.escape(req.query.heMasterId),
            req.st.db.escape(JSON.stringify(req.body.industry || [])),
            req.st.db.escape(JSON.stringify(req.body.location || [])),
            req.st.db.escape(req.body.keyword || ''),
            req.st.db.escape(req.body.applicantId),
            req.st.db.escape(req.body.startPage || 0),
            req.st.db.escape(req.body.limit || 50)
        ];

        var procQuery = 'CALL wm_save_portal_requirementSearch( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result[0] && result[0][0]) {
                response.status = true;
                response.message = "Jobs loaded successfully";
                response.error = null;
                response.data = {
                    jobList: result[0] && result[0][0] ? result[0] : [],
                    count: result[1][0].count,
                    locationList: result[2] && result[2][0] ? result[2] : [],
                    industryList : result[3] && result[3][0] ? result[3] : [],
                    functionalAreas : []
                }
                res.status(200).json(response);


            }
            else if (!err) {
                response.status = true;
                response.message = 'Jobs not found';
                response.error = null;
                response.data = null;
                res.status(200).json(response);

            }
            else {
                response.status = false;
                response.message = "Error while job search";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


jobPortalCtrl.portalApplicantHistory = function (req, res, next) {
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

    if (!req.body.applicantId) {
        error.applicantId = 'Invalid applicantId';
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
                req.body.heMasterId = req.body.heMasterId ? req.body.heMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.startPage || 0),
                    req.st.db.escape(req.body.limit || 50),
                    req.st.db.escape(req.body.heMasterId || 0)
                ];

                var procQuery = 'CALL wm_get_portalApplicantJobHistory( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Applied jobs loaded successfully";
                        response.error = null;
                        response.data = {
                            jobList: result[0] && result[0][0] ? result[0] : [],
                            count: result[1][0].count
                        }
                        res.status(200).json(response);


                    }
                    else if (!err) {
                        response.status = true;
                        response.message = 'Applied jobs not found';
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data";
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


jobPortalCtrl.portalPasswordResetOTP = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.body.loginId) {
        error['loginId'] = 'loginId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var message = "";

            //generate otp 6 digit random number
            var code = "";
            var possible = "1234567890";

            for (var i = 0; i <= 3; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            var query = [
                req.st.db.escape(req.body.loginId),
                req.st.db.escape(code),
                req.st.db.escape(DBSecretKey),
                req.st.db.escape(req.body.mobileIsd || "")
            ];

            console.log('CALL portal_validateportaluser(' + query + ')');
            req.st.db.query('CALL portal_validateportaluser(' + query + ')', function (err, userResult) {

                console.log("error", err);

                if (!err && userResult && userResult[0] && userResult[0][0].applicantId) {
                    // code = userResult[0][0].otp;

                    message = 'Your career portal password reset OTP is ' + code + ' .';

                    if (userResult[0][0].emailId) {
                        var file = path.join(__dirname, '../../../../mail/templates/passwordResetOTP.html');

                        fs.readFile(file, "utf8", function (err, data) {

                            if (!err) {
                                data = data.replace("[name]", userResult[0][0].firstName);
                                data = data.replace("[OTP]", code);

                                var mailOptions = {
                                    from: "noreply@talentmicro.com",
                                    to: userResult[0][0].emailId,
                                    subject: 'Password Reset Request',
                                    html: data // html body
                                };

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                    if (!err) {
                                        console.log('message sent successfully');
                                    }
                                });
                            }
                        });
                    }

                    if (userResult[0][0].isd && userResult[0][0].mobile) {
                        if (userResult[0][0].isd == "+977") {
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to: userResult[0][0].mobile,
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
                        else if (userResult[0][0].isd == "+91") {
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name: 'janardana@hirecraft.com',
                                    password: 'Ezeid2015',
                                    sender_id: 'WtMate',
                                    service: 'TRANS',
                                    mobile_no: userResult[0][0].mobile,
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
                                mobile: userResult[0][0].isd.replace("+", "") + userResult[0][0].mobile,
                                msg: message,
                                duplicateCheck: 'true',
                                format: 'json'
                            }));
                            req.end();


                        }
                        else if (userResult[0][0].isd != "") {
                            client.messages.create(
                                {
                                    body: message,
                                    to: userResult[0][0].isd + userResult[0][0].mobile,
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
                    respMsg.status = true;
                    respMsg.message = 'OTP Sent Successfully';
                    respMsg.data = null;
                    res.status(200).json(respMsg);

                }
                else if (!err && userResult && userResult[0] && userResult[0][0].messageError) {
                    respMsg.status = true;
                    respMsg.message = userResult[0][0].messageError;
                    respMsg.data = null;
                    res.status(200).json(respMsg);
                }
                else if (!err && userResult && userResult[0] && userResult[0][0]._error) {
                    respMsg.status = true;
                    respMsg.message = userResult[0][0]._error;
                    respMsg.data = null;
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


jobPortalCtrl.portalpasswordResetVerifyOtp = function (req, res, next) {
    console.log("inside otp");
    var response = {
        status: false,
        message: "Invalid otp",
        data: null,
        error: null
    };

    var otp = req.body.otp;
    var loginId = req.body.loginId;

    var validationFlag = true;
    if (!loginId) {
        error.loginId = "Invalid loginId";
        validationFlag = false;
    }

    if (!otp) {
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
        var inputs = [
            req.st.db.escape(loginId),
            req.st.db.escape(otp),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(req.body.mobileIsd || "")
        ];

        var procQuery = 'CALL portal_resetverifyOtp( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].messageError) {
                response.status = false;
                response.message = result[0][0].messageError;
                response.error = false;
                response.data = {
                    message: result[0][0].messageError
                };
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                response.status = false;
                response.message = result[0][0]._error;
                response.error = false;
                response.data = {
                    message: result[0][0]._error
                };
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0]._uerror) {
                response.status = false;
                response.message = result[0][0]._uerror;
                response.error = false;
                response.data = {
                    message: result[0][0]._uerror
                };
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


jobPortalCtrl.portalresetPassword = function (req, res, next) {
    console.log("inside otp");
    var response = {
        status: false,
        message: "Invalid mobile number",
        data: null,
        error: null
    };

    var otp = req.body.otp;
    var loginId = req.body.loginId;
    var newPassword = req.body.newPassword;

    var validationFlag = true;
    if (!loginId) {
        error.loginId = "loginId is mandatory";
        validationFlag = false;
    }
    if (!otp) {
        error.otp = "otp is mandatory";
        validationFlag = false;
    }

    if (!newPassword) {
        error.newPassword = "Please enter New Password";
        validationFlag = false;
    }

    if (!req.body.otp) {
        error.otp = "Enter otp";
        validationFlag = false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var encryptPwd = req.st.hashPassword(newPassword);
        console.log(encryptPwd);

        var inputs = [
            req.st.db.escape(loginId),
            req.st.db.escape(encryptPwd),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(otp),
            req.st.db.escape(req.body.mobileIsd || "")
        ];

        var procQuery = 'CALL portal_resetPassword( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].messageError) {
                response.status = false;
                response.message = result[0][0].messageError;
                response.error = false;
                response.data = {
                    message: result[0][0].messageError
                };
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                response.status = false;
                response.message = result[0][0]._error;
                response.error = false;
                response.data = {
                    message: result[0][0]._error
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0]._uerror) {
                response.status = false;
                response.message = result[0][0]._uerror;
                response.error = false;
                response.data = {
                    message: result[0][0]._uerror
                };
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while updating password";
                response.error = true;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};

jobPortalCtrl.signUpsendOtp = function (req, res, next) {

    var mobileNo; //= req.body.mobileNo;
    var isdMobile; //= req.body.isdMobile;
    // var displayName = req.body.displayName ;
    var emailId = req.body.emailId ? req.body.emailId : "";
    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (req.body.mobileNo) {
        mobileNo = req.body.mobileNo || "";
    }
    else if (req.body.mobileNumber) {
        mobileNo = req.body.mobileNumber || "";
    }

    if (req.body.isdMobile) {
        isdMobile = req.body.isdMobile || "";
    }
    else if (req.body.mobileISD) {
        isdMobile = req.body.mobileISD || "";
    }

    // if (!mobileNo) {
    //     error['mobile'] = 'mobile no is mandatory';
    //     status *= false;
    // }
    // if (!isdMobile) {
    //     error['isdMobile'] = 'isd mobile is mandatory';
    //     status *= false;
    // }
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

            message = 'Your WhatMate verification Code is ' + code + ' . Please enter this 4 digit number where prompted to proceed --WhatMate Helpdesk.';

            var query = req.st.db.escape(mobileNo) + ',' + req.st.db.escape(code) + ',' + req.st.db.escape(isdMobile) + ',' + req.st.db.escape(emailId);
            console.log("query", query);
            req.st.db.query('CALL portal_generate_otp(' + query + ')', function (err, insertResult) {
                if (!err) {

                    if (mobileNo != "") {
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


                    if (emailId != "") {
                        // var file = path.join(__dirname, '../../../../../mail/templates/JobportalSendOTP.html');
                        // '/home/ezeonetalent/ezeone1/api/mail/templates/JobportalSendOTP.html'
                        fs.readFile('/home/ezeonetalent/ezeone1/api/mail/templates/JobportalSendOTP.html', "utf8", function (err, data) {

                            if (!err) {
                                // data = data.replace("[DisplayName]", displayName);
                                data = data.replace("[code]", code);

                                var mailOptions = {
                                    from: EZEIDEmail,
                                    to: emailId,
                                    subject: 'Portal Verification Code',
                                    html: data // html body
                                };

                                // send mail with defined transport object
                                //message Type 7 - Forgot password mails service
                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                    if (!err) {
                                        console.log('Mail sent');
                                    }
                                    else {
                                        console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                    }
                                });
                            }
                            else {
                                console.log('FnForgetPassword: readfile ' + err);
                            }
                        });
                        resMessage = "OTP is sent successfully to mobile and emailId";
                    }
                    else {
                        resMessage = 'OTP is sent successfully';
                    }

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

module.exports = jobPortalCtrl;
