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
var bodyParser = require('body-parser');
var textract = require('textract');
var http = require('https');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var jobPortalCtrl = {};
var error = {};


jobPortalCtrl.portalSaveApplicant = function (req, res, next) {
    var cvKeywords = '';


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
    if (!req.body.firstName) {
        error.firstName = 'please Enter Name';
        validationFlag *= false;
    }
    if (!req.body.emailId) {
        error.emailId = 'emailId is mandatory';
        validationFlag *= false;
    }
    // if (!req.body.nationalityId) {
    //     error.nationalityId = 'nationalityId is mandatory';
    //     validationFlag *= false;
    // }

    if (!req.body.mobileNumber) {
        error.mobileNumber = 'mobile Number is mandatory';
        validationFlag *= false;
    }
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



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var cv = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.body.cvPath;
                console.log(cv);
                http.get(cv, function (fileResponse) {
                    var bufs = [];
                    fileResponse.on('data', function (d) { bufs.push(d); });
                    fileResponse.on('end', function () {
                        var buf = Buffer.concat(bufs);
                        textract.fromBufferWithName(cv, buf, function (error, text) {
                            if (!error) {

                                cvKeywords = text;

                                req.body.applicantId = (req.body.applicantId) ? req.body.applicantId : 0;
                                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;
                                req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                                req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : "";
                                req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : "";
                                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                                //req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : "";
                                //req.body.emailId = (req.body.emailId) ? req.body.emailId : "";
                                //education = (JSON.stringify(education)) ? (JSON.stringify(education)) : [];
                                req.body.address = (req.body.address) ? req.body.address : "";
                                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
                                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;
                                req.body.IDadhaarNumber = (req.body.IDadhaarNumber) ? req.body.IDadhaarNumber : "";
                                req.body.passportNumber = (req.body.passportNumber) ? req.body.passportNumber : "";
                                req.body.ppExpiryDate = (req.body.ppExpiryDate) ? req.body.ppExpiryDate : null;
                                req.body.experience = (req.body.experience) ? req.body.experience : 0;
                                req.body.employer = (req.body.employer) ? req.body.employer : "";
                                //jobTitle = (JSON.stringify(jobTitle)) ? (JSON.stringify(jobTitle)) : [];
                                req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
                                // req.body.expectedSalaryCurrId = (req.body.expectedSalaryCurrId) ? req.body.expectedSalaryCurrId : 0; // default INR
                                // req.body.expectedSalary = (req.body.expectedSalary) ? req.body.expectedSalary : 0.0;
                                // req.body.expectedSalaryScaleId = (req.body.expectedSalaryScaleId) ? req.body.expectedSalaryScaleId : 0;
                                // req.body.expectedSalaryPeriodId = (req.body.expectedSalaryPeriodId) ? req.body.expectedSalaryPeriodId : 0;
                                // req.body.presentSalaryCurrId = (req.body.presentSalaryCurrId) ? req.body.presentSalaryCurrId : 0;
                                // req.body.presentSalary = (req.body.presentSalary) ? req.body.presentSalary : 0.0;
                                // req.body.presentSalaryScaleId = (req.body.presentSalaryScaleId) ? req.body.presentSalaryScaleId : 0;
                                // req.body.presentSalaryPeriodId = (req.body.presentSalaryPeriodId) ? req.body.presentSalaryPeriodId : 0;
                                //primarySkills = (JSON.stringify(primarySkills)) ? (JSON.stringify(primarySkills)) : [];
                                //secondarySkills = (JSON.stringify(secondarySkills)) ? (JSON.stringify(secondarySkills)) : [];
                                req.body.notes = (req.body.notes) ? req.body.notes : "";
                                //req.body.cvRating = (req.body.cvRating) ? req.body.cvRating : 0;
                                //cvSource = (JSON.stringify(cvSource)) ? (JSON.stringify(cvSource)) : [];
                                //req.body.cvSourceReference = (req.body.cvSourceReference) ? req.body.cvSourceReference : "";
                                //req.body.gender = (req.body.gender) ? req.body.gender : 0;
                                req.body.DOB = (req.body.DOB) ? req.body.DOB : null;
                                //req.body.originalCvId = (req.body.originalCvId) ? req.body.originalCvId : 0;
                                req.body.status = (req.body.status) ? req.body.status : 0;
                                req.body.blockingPeriod = (req.body.blockingPeriod) ? req.body.blockingPeriod : 0;
                                //prefLocations = (JSON.stringify(prefLocations)) ? (JSON.stringify(prefLocations)) : [];
                                //industry = (JSON.stringify(industry)) ? (JSON.stringify(industry)) : [];
                                //req.body.nationalityId = (req.body.nationalityId) ? req.body.nationalityId : 0;
                                req.body.affirmitive = (req.body.affirmitive) ? req.body.affirmitive : '';
                                req.body.transactions = (req.body.transactions) ? req.body.transactions : '';
                                req.body.isJobPortal = (req.body.isJobPortal) ? req.body.isJobPortal : 0;
                                req.body.imageUrl = (req.body.imageUrl) ? req.body.imageUrl : '';


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
                                    req.st.db.escape(JSON.stringify(jobTitle[0])),
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
                                    //req.st.db.escape(req.body.cvSourceReference),
                                    req.st.db.escape(req.body.gender),
                                    req.st.db.escape(req.body.DOB),
                                    //req.st.db.escape(req.body.originalCvId),
                                    req.st.db.escape(req.body.blockingPeriod),
                                    req.st.db.escape(req.body.status),
                                    req.st.db.escape(JSON.stringify(prefLocations)),
                                    req.st.db.escape(JSON.stringify(industry)),
                                    req.st.db.escape(JSON.stringify(nationality)),
                                    req.st.db.escape(cvKeywords),
                                    req.st.db.escape(req.body.isJobPortal),
                                    req.st.db.escape(req.body.imageUrl)

                                ];

                                var procQuery = 'CALL portal_save_applicant( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                                console.log(procQuery);

                                req.db.query(procQuery, function (err, result) {
                                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                                    //console.log(result);

                                    if (!err && result && result[0]) {

                                        response.status = true;
                                        response.message = "profile saved successfully";
                                        response.error = null;
                                        response.data = {
                                            applicantId: result[0][0].applicantId
                                        };
                                        res.status(200).json(response);

                                    }
                                    else {
                                        response.status = false;
                                        response.message = "Error while saving profile";
                                        response.error = null;
                                        console.log(err);
                                        res.status(500).json(response);

                                    }
                                });


                            }

                        });
                    });
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

                var procQuery = 'CALL portal_get_requirementDetails( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "requirement Details loaded successfully";
                        response.error = null;
                        response.data = {

                            portalrequirementDetails: JSON.parse(result[1][0].reqJsonData) ? JSON.parse(result[1][0].reqJsonData) : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "requirement Details not found";
                        response.error = null;
                        response.data = {
                            portalrequirementDetails: []
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
            }
            else {
                res.status(401).json(response);
            }
        });
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

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "applicant details loaded successfully";
                        response.error = null;
                        response.data = {

                            portalApplicantDetails: JSON.parse(result[0][0].appFormDataJson) ? JSON.parse(result[0][0].appFormDataJson) : []
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "applicant Details not found";
                        response.error = null;
                        response.data = {
                            portalApplicantDetails: []
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
                            educationList: result[10] ? result[10] : []

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
                            educationList: []
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
    if (!req.body.mobileNumber) {
        error.mobileNumber = 'Invalid mobileNumber';
        validationFlag *= false;
    }

    if (!req.body.mobileISD) {
        error.mobileISD = 'Invalid mobileISD';
        validationFlag *= false;
    }

    if (!req.body.emailId) {
        error.emailId = 'Invalid emailId';
        validationFlag *= false;
    }

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
            req.st.db.escape(req.body.mobileNumber),
            req.st.db.escape(req.body.mobileISD),
            req.st.db.escape(req.body.otp),
            req.st.db.escape(req.body.emailId),
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
    if (!req.body.mobileNumber) {
        error.mobileNumber = 'Invalid mobileNumber';
        validationFlag *= false;
    }

    if (!req.body.firstName) {
        error.firstName = 'Invalid firstName';
        validationFlag *= false;
    }

    if (!req.body.mobileISD) {
        error.mobileISD = 'Invalid mobileISD';
        validationFlag *= false;
    }

    if (!req.body.emailId) {
        error.emailId = 'Invalid emailId';
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
            req.st.db.escape(req.body.mobileNumber),
            req.st.db.escape(req.body.mobileISD),
            req.st.db.escape(req.body.emailId),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(encryptPwd)

        ];

        var procQuery = 'CALL portal_save_signUp( ' + getStatus.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0]) {
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


module.exports = jobPortalCtrl;
