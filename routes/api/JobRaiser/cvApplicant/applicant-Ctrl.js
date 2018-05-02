var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var textract = require('textract');
var http = require('https');
var defer = require('q');  // for handling promise
var bodyParser = require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var applicantCtrl = {};
var error = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;


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
})
//var createPromise = defer.denodeify(attachFile);
//var attachFilePromise = attachFile;

// For saving resume or updating resume   * mandatory fields token,heMasterId,firstName,mobileNumber,emailId
applicantCtrl.saveApplicant = function (req, res, next) {
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
    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid Company';
        validationFlag *= false;
    }
    if (!req.body.firstName) {
        error.firstName = 'First Name is Mandatory';
        validationFlag *= false;
    }
    if (!req.body.emailId && !req.body.mobileNumber) {
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
                req.query.isWeb = (req.body.isWeb) ? req.body.isWeb : 0;
                if (attachmentList.length) {
                    cv = attachmentList[0].CDNPath;
                }
                gs_url = req.CONFIG.CONSTANT.GS_URL;
                storage_bucket = req.CONFIG.CONSTANT.STORAGE_BUCKET;

                console.log(cv);
                attachFile.then(function (resp) {
                    if (1) {

                        cvKeywords = text;

                        req.body.applicantId = (req.body.applicantId) ? req.body.applicantId : 0;

                        req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                        req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : "";
                        req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : "";
                        req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                        req.body.address = (req.body.address) ? req.body.address : "";
                        req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
                        req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;
                        req.body.IDadhaarNumber = (req.body.IDadhaarNumber) ? req.body.IDadhaarNumber : "";
                        req.body.passportNumber = (req.body.passportNumber) ? req.body.passportNumber : "";
                        req.body.ppExpiryDate = (req.body.ppExpiryDate) ? req.body.ppExpiryDate : "0000-00-00 00:00:00";
                        req.body.experience = (req.body.experience) ? req.body.experience : 0;
                        req.body.employer = (req.body.employer) ? req.body.employer : "";
                        req.body.noticePeriod = (req.body.noticePeriod) ? req.body.noticePeriod : 0;
                        req.body.notes = (req.body.notes) ? req.body.notes : "";
                        req.body.DOB = (req.body.DOB) ? req.body.DOB : "0000-00-00";
                        //req.body.originalCvId = (req.body.originalCvId) ? req.body.originalCvId : 0;
                        req.body.status = (req.body.status) ? req.body.status : 0;
                        req.body.blockingPeriod = (req.body.blockingPeriod) ? req.body.blockingPeriod : 0;
                        req.body.affirmitive = (req.body.affirmitive) ? req.body.affirmitive : '';
                        req.body.transactions = (req.body.transactions) ? req.body.transactions : '';
                        req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                        req.body.imageUrl = req.body.imageUrl ? req.body.imageUrl : '';

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
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(JSON.stringify(cvSource)),
                            req.st.db.escape(req.body.gender),
                            req.st.db.escape(req.body.DOB),
                            //req.st.db.escape(req.body.originalCvId),
                            req.st.db.escape(req.body.blockingPeriod),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(JSON.stringify(prefLocations)),
                            req.st.db.escape(JSON.stringify(industry)),
                            req.st.db.escape(JSON.stringify(nationality)),
                            req.st.db.escape(cvKeywords),
                            req.st.db.escape(req.body.requirementId),
                            req.st.db.escape(req.body.imageUrl),
                            req.st.db.escape(req.body.htmlText)
                        ];

                        var procQuery = 'CALL wm_save_applicant( ' + inputs.join(',') + ')';  // call procedure to save requirement data
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

// token and heMasterId is mandatory
applicantCtrl.getApplicantMasterData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid Token",
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.userMasterId = req.query.userMasterId ? req.query.userMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userMasterId)
                ];

                var procQuery = 'CALL wm_get_masterData_for_applicant( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        var output1 = [];
                        for (var j = 0; j < result[14].length; j++) {
                            var res1 = {};
                            res1.educationId = result[14][j].educationId;
                            res1.educationTitle = result[14][j].EducationTitle;
                            res1.specialization = result[14][j].specialization ? JSON.parse(result[14][j].specialization) : [];
                            output1.push(res1);
                        }

                        var output = [];
                        for (var i = 0; i < result[10].length; i++) {
                            var res2 = {};
                            res2.stageId = result[10][i].stageId;
                            res2.stageName = result[10][i].stageName;
                            res2.stageTypeId = result[10][i].stageTypeId;
                            res2.stageTypeName = result[10][i].stageTypeName;
                            res2.colorCode = result[10][i].colorCode;
                            res2.status = JSON.parse(result[10][i].status) ? JSON.parse(result[10][i].status) : [];
                            output.push(res2);
                        }

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
                            mStageStatus: output,
                            tags: {
                                candidate: result[11] ? result[11] : [],
                                requirement: result[12] ? result[12] : [],
                                client: result[13] ? result[13] : [],
                                general: result[27] ? result[27] : [],
                                clientContact: result[30] ? result[30] : []
                            },
                            educationList: output1,
                            Stage: result[15] ? result[15] : [],
                            Status: result[16] ? result[16] : [],
                            roles: result[17] ? result[17] : [],
                            interviewRound: result[18] ? result[18] : [],
                            requirementStatus: result[19] ? result[19] : [],
                            department: result[20] ? result[20] : [],
                            client: result[21] ? result[21] : [],
                            requirementJobTitle: result[22] ? result[22] : [],
                            groupType: result[23] ? result[23] : [],
                            mailerType: result[24] ? result[24] : [],
                            userType: result[25] ? result[25] : [],
                            attachment: result[26] ? result[26] : [],
                            grade: result[28] ? result[28] : [],
                            paceUsers: result[29] ? result[29] : [],
                            reasons: result[31] ? result[31] : [],
                            reportingTo: result[32] ? result[32] : []
                        };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }

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
                            mStageStatus: [],
                            tags: {
                                candidateTags: [],
                                requirementTags: [],
                                client: [],
                                general: [],
                                clientContact: []
                            },
                            educationList: [],
                            stage: [],
                            status: [],
                            roles: [],
                            interviewRound: [],
                            requirementStatus: [],
                            department: [],
                            client: [],
                            requirementJobTitle: [],
                            groupType: [],
                            mailerType: [],
                            userType: [],
                            attachment: [],
                            grade: [],
                            paceUsers: [],
                            reasons: [],
                            reportingTo: []
                        };
                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
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
            else {
                res.status(401).json(response);
            }
        });
    }

};

// token ,heMasterId,requirementId(parentId) , applicantId is mandatory
applicantCtrl.saveReqApplicant = function (req, res, next) {
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
    if (!req.body.reqId) {
        error.reqId = 'Invalid requirement';
        validationFlag *= false;
    }

    if (!req.body.appId) {
        error.appId = 'Invalid applicant';
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
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.body.reqApplicantId = (req.body.reqApplicantId) ? req.body.reqApplicantId : 0;
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                req.body.reasonId = (req.body.reasonId) ? req.body.reasonId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.reqId),
                    req.st.db.escape(req.body.appId),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(req.body.reasonId)

                ];

                var procQuery = 'CALL wm_save_reqApp( ' + inputs.join(',') + ')';
                console.log(procQuery);

                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Applicant is tagged to the requirement successfully";
                        response.error = null;
                        response.data = {
                            reqApplicantId: result[0][0].reqApplicantId
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error While tagging applicant with the requirement";
                        response.error = null;
                        console.log(err);
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

// master data for filters on ATS page tile view. token and heMasterId is mandatory
applicantCtrl.getReqApplicantMasterData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid Token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check The errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_reqAppMaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[2].length; i++) {
                            var res2 = {};
                            res2.stageId = result[2][i].stageId;
                            res2.stageTitle = result[2][i].title;
                            res2.status = result[2][i].status ? JSON.parse(result[2][i].status) : [];
                            output.push(res2);
                        }
                        response.data = {
                            clients: (result && result[0]) ? result[0] : [],
                            jobtitle: (result && result[1]) ? result[1] : [],
                            stageStatus: output
                        };

                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            clients: [],
                            jobtitle: [],
                            stageStatus: []

                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting status";
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

// To load title view ie tagged applicants based on filter. token and heMasterId is mandatory
applicantCtrl.getreqApplicants = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
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
                // req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.query.jobTitleId = (req.query.jobTitleId) ? req.query.jobTitleId : 0;
                req.query.stageId = (req.query.stageId) ? req.query.stageId : 0;
                req.query.statusId = (req.query.statusId) ? req.query.statusId : 0;
                req.query.startPage = (req.query.startPage) ? req.query.startPage : 0;
                req.query.limit = (req.query.limit) ? req.query.limit : 100;
                req.query.applicantId = (req.query.applicantId) ? req.query.applicantId : 0;
                req.query.requirementId = (req.query.requirementId) ? req.query.requirementId : 0;


                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.jobTitleId),
                    req.st.db.escape(req.query.applicantId),
                    req.st.db.escape(req.query.stageId),
                    req.st.db.escape(req.query.statusId),
                    req.st.db.escape(req.query.startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.requirementId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_applicants( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result && Result[0]) {
                        response.status = true;
                        response.message = "Applicants loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < Result[0].length; i++) {
                            var res2 = {};
                            res2.reqApplicantId = Result[0][i].reqAppId;
                            res2.applicantId = Result[0][i].applicantId;
                            res2.imageUrl = Result[0][i].imageUrl;
                            res2.createdDate = Result[0][i].createdDate;
                            res2.lastUpdatedDate = Result[0][i].lastUpdatedDate;
                            res2.reqCvCreatedUserId = Result[0][i].reqCvCreatedUserId;
                            res2.reqCvCreatedUserName = Result[0][i].reqCvCreatedUserName;
                            res2.reqCvUpdatedUserId = Result[0][i].reqCvUpdatedUserId;
                            res2.reqCvUpdatedUserName = Result[0][i].reqCvUpdatedUserName;
                            res2.cvCreatedDate = Result[0][i].cvCreatedDate;
                            res2.cvCreatedUSerId = Result[0][i].cvCreatedUSerId;
                            res2.cvCreatedUserName = Result[0][i].cvCreatedUserName;
                            res2.cvUpdatedDate = Result[0][i].cvUpdatedDate;
                            res2.cvUpdatedUserId = Result[0][i].cvUpdatedUserId;
                            res2.cvUpdatedUserName = Result[0][i].cvUpdatedUserName;
                            res2.requirementId = Result[0][i].requirementId;
                            res2.name = Result[0][i].name;
                            res2.emailId = Result[0][i].emailId;
                            res2.clientId = Result[0][i].clientId;
                            res2.clientName = Result[0][i].clientname;
                            res2.jobCode = Result[0][i].jobCode;
                            res2.jobTitleId = Result[0][i].jobTitleId;
                            res2.jobTitle = Result[0][i].title;
                            res2.stageId = Result[0][i].stageId;
                            res2.stage = Result[0][i].stageTitle;
                            res2.stageTypeId = Result[0][i].stageTypeId;
                            res2.colorCode = Result[0][i].colorCode;
                            res2.statusId = Result[0][i].statusId;
                            res2.status = Result[0][i].statusTitle;
                            res2.statusTypeId = Result[0][i].statusTypeId;
                            res2.clientContacts = JSON.parse(Result[0][i].clientContacts) ? JSON.parse(Result[0][i].clientContacts) : [];
                            output.push(res2);
                        }
                        response.data = {
                            applicantlist: output,
                            count: Result[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Applicants not found";
                        response.error = null;
                        response.data = {
                            applicantlist: [],
                            count: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading applicants";
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

//change stage and status of tagged applicants. only token is mandatory
applicantCtrl.saveApplicantStageStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

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

                req.body.notes = (req.body.notes) ? req.body.notes : "";
                req.body.stage = (req.body.stage) ? req.body.stage : 0;
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var statusParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(req.body.stage),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var statusQuery = 'CALL wm_save_reqStageStatus( ' + statusParams.join(',') + ')';
                console.log(statusQuery);
                req.db.query(statusQuery, function (err, statusResult) {
                    console.log(err);

                    if (!err && statusResult && statusResult[0]) {
                        response.status = true;
                        response.message = "Stage and status changed successfully";
                        response.error = null;
                        response.data = statusResult[0][0];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while changing stage and status";
                        response.error = null;
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

// to load action view of ATS page. reqApplicantId,token, heMasterId is mandatory
applicantCtrl.getreqAppStageStatus = function (req, res, next) {
    var isWeb = {};
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.reqApplicantId) {
        error.reqApplicantId = 'Invalid reqApplicantId';
        validationFlag *= false;
    }

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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.reqApplicantId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_reqStageandStatus( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, statusResult) {
                    console.log(err);
                    if (!err && statusResult && statusResult[0]) {
                        response.status = true;
                        response.message = "Transaction History and current scenario loaded successfully";
                        response.error = null;
                        response.data = {
                            transactionHistory: statusResult[0] ? statusResult[0] : [],
                            currentScenario: statusResult[1][0] ? statusResult[1][0] : []
                        };
                        isWeb = req.query.isWeb;
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "History and current scenario not found";
                        response.error = null;
                        response.data = {
                            transactionHistory: [],
                            currentScenario: []
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting history and scenario";
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

// resume search .token and heMasterId is mandatory
applicantCtrl.resumeSearch = function (req, res, next) {
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
    var roles = req.body.roles;
    if (typeof (roles) == "string") {
        roles = JSON.parse(roles);
    }
    if (!roles) {
        roles = [];
    }
    var skills = req.body.skills;
    if (typeof (skills) == "string") {
        skills = JSON.parse(skills);
    }
    if (!skills) {
        skills = [];
    }
    var industryExpertise = req.body.industryExpertise;
    if (typeof (industryExpertise) == "string") {
        industryExpertise = JSON.parse(industryExpertise);
    }
    if (!industryExpertise) {
        industryExpertise = [];
    }
    var locations = req.body.locations;
    if (typeof (locations) == "string") {
        locations = JSON.parse(locations);
    }
    if (!locations) {
        locations = [];
    }
    var education = req.body.education;
    if (typeof (education) == "string") {
        education = JSON.parse(education);
    }
    if (!education) {
        education = [];
    }
    var requiredNationalities = req.body.requiredNationalities;
    if (typeof (requiredNationalities) == "string") {
        requiredNationalities = JSON.parse(requiredNationalities);
    }
    if (!requiredNationalities) {
        requiredNationalities = [];
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

                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : -1;
                req.body.expTo = (req.body.expTo) ? req.body.expTo : -1;
                req.body.resumeDaysFreshness = (req.body.resumeDaysFreshness) ? req.body.resumeDaysFreshness : 99000;
                req.body.currency = (req.body.currency) ? req.body.currency : 0;
                req.body.salaryFrom = (req.body.salaryFrom) ? req.body.salaryFrom : 0;
                req.body.salaryTo = (req.body.salaryTo) ? req.body.salaryTo : 0;
                req.body.salaryScale = (req.body.salaryScale) ? req.body.salaryScale : 0;
                req.body.salaryDuration = (req.body.salaryDuration) ? req.body.salaryDuration : 0;
                req.body.noticePeriodFrom = (req.body.noticePeriodFrom) ? req.body.noticePeriodFrom : 0;
                req.body.noticePeriodTo = (req.body.noticePeriodTo) ? req.body.noticePeriodTo : 0;
                req.body.workLocation = (req.body.workLocation) ? req.body.workLocation : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.resumeDaysFreshness),
                    req.st.db.escape(JSON.stringify(skills)),
                    req.st.db.escape(req.body.cvKeywords),
                    //req.st.db.escape(req.body.functions),
                    req.st.db.escape(JSON.stringify(roles)),
                    req.st.db.escape(JSON.stringify(industryExpertise)),
                    req.st.db.escape(req.body.expFrom),
                    req.st.db.escape(req.body.expTo),
                    req.st.db.escape(JSON.stringify(locations)),
                    //req.st.db.escape(req.body.searchBy),
                    req.st.db.escape(JSON.stringify(education)),
                    req.st.db.escape(req.body.currency),
                    req.st.db.escape(req.body.salaryFrom),
                    req.st.db.escape(req.body.salaryTo),
                    req.st.db.escape(req.body.salaryScale),
                    req.st.db.escape(req.body.salaryDuration),
                    req.st.db.escape(req.body.noticePeriodFrom),
                    req.st.db.escape(req.body.noticePeriodTo),
                    //req.st.db.escape(req.body.workLocation),
                    req.st.db.escape(JSON.stringify(requiredNationalities))
                ];

                var procQuery = 'CALL wd_resume_search_new2( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Applicants list loaded successfully";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < result[0].length; i++) {
                            var res2 = {};
                            res2.applicantId = result[0][i].applicantId;
                            res2.name = result[0][i].name;
                            res2.emailId = result[0][i].emailId;
                            res2.noticePeriod = result[0][i].noticePeriod;
                            res2.jobTitleId = result[0][i].jobTitleId;
                            res2.jobTitle = result[0][i].jobTitle;
                            res2.experience = result[0][i].experience;
                            res2.employer = result[0][i].employer;
                            res2.CTCcurrencyId = result[0][i].CTCcurrencyId;
                            res2.currencySymbol = result[0][i].currencySymbol;
                            res2.CTC = result[0][i].CTC;
                            res2.scaleId = result[0][i].scaleId;
                            res2.scale = result[0][i].scale;
                            res2.durationId = result[0][i].durationId;
                            res2.duration = result[0][i].duration;
                            res2.education = JSON.parse(result[0][i].education) ? JSON.parse(result[0][i].education) : [];
                            res2.keySkills = JSON.parse(result[0][i].keySkills) ? JSON.parse(result[0][i].keySkills) : [];
                            res2.location = JSON.parse(result[0][i].location) ? JSON.parse(result[0][i].location) : [];
                            res2.requirementApplicantCount = result[0][i].requirementApplicantCount ? result[0][i].requirementApplicantCount : 0;
                            output.push(res2);
                        }
                        response.data = {
                            applicantList: output
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Applicants not found";
                        response.error = null;
                        response.data = {
                            applicantList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading applicants list";
                        response.error = null;
                        console.log(err);
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

applicantCtrl.getrequirementList = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_requirementList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Requirement list loaded successfully";
                        response.error = null;
                        response.data = {
                            requirementList: result[0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            requirementList: []
                        };
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

//map the requirement with applicant. token ,heMasterId,requirementId(reqId) is mandatory
applicantCtrl.saveReqAppMapResult = function (req, res, next) {
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
    if (!req.body.reqId) {
        error.token = 'Invalid requirement';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.reqId),
                    req.st.db.escape(JSON.stringify(req.body.applicant)),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_save_reqAppMap( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = false;
                        response.message = "Requirement already mapped to the applicant";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err && result) {
                        response.status = true;
                        response.message = "Requirement applicant map data saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving requirement applicant map";
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

//to get applicant complete details. token,heMasterId,applicantId is mandatory
applicantCtrl.getApplicantDetails = function (req, res, next) {
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
    if (!req.query.applicantId) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.applicantId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_applicantDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[1]) {
                        //parsing the result
                        var temp_result = result[0][0] ? result[0][0] : [];
                        temp_result.education = JSON.parse(temp_result.education);
                        temp_result.cvSource = JSON.parse(temp_result.cvSource);
                        temp_result.expectedSalaryCurr = JSON.parse(temp_result.expectedSalaryCurr);
                        temp_result.expectedSalaryPeriod = JSON.parse(temp_result.expectedSalaryPeriod);
                        temp_result.expectedSalaryScale = JSON.parse(temp_result.expectedSalaryScale);
                        temp_result.industry = JSON.parse(temp_result.industry);
                        temp_result.jobTitle = JSON.parse(temp_result.jobTitle);
                        temp_result.jobTitle = temp_result.jobTitle.titleId != null ? temp_result.jobTitle : undefined;
                        temp_result.nationality = JSON.parse(temp_result.nationality);
                        temp_result.prefLocations = JSON.parse(temp_result.prefLocations);
                        temp_result.presentSalaryCurr = JSON.parse(temp_result.presentSalaryCurr);
                        temp_result.presentSalaryPeriod = JSON.parse(temp_result.presentSalaryPeriod);
                        temp_result.presentSalaryScale = JSON.parse(temp_result.presentSalaryScale);
                        temp_result.primarySkills = JSON.parse(temp_result.primarySkills);
                        temp_result.secondarySkills = JSON.parse(temp_result.secondarySkills);

                        response.status = true;
                        response.message = "Applicant data loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                applicantDetails: temp_result ? temp_result : [],
                                applicantTransaction: result[1] ? result[1] : []
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            applicantDetails: [],
                            applicantTransaction: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting applicant Data";
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

applicantCtrl.getApplicantNames = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'CALL wm_get_applicantName( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Applicant list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                applicantList: result[0] ? result[0] : []
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            applicantList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting applicant list";
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

applicantCtrl.getInterviewPanel = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.requirementId),
                    req.st.db.escape(req.query.interviewStageId)
                ];
                var procQuery = 'CALL wm_get_interviewPannel( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview panel list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                interviewPanel: result[0]
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewPannel: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting interviewPanel list";
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

//to load interview schedule.
applicantCtrl.getInterviewSchedule = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.heParentId),
                    req.st.db.escape(req.query.interviewScheduleId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduleDropdown( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview schedules loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[0].length; i++) {
                            var res2 = {};
                            res2.interviewScheduleTitle = result[0][i].title;
                            res2.name = result[0][i].name;
                            res2.interviewPanelMembers = JSON.parse(result[0][i].interviewPanelMembers) ? JSON.parse(result[0][i].interviewPanelMembers) : [];
                            output.push(res2);
                        }
                        response.data =
                            {
                                interviewSchedule: output
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewSchedule: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading interview schedules";
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

// oofer manager save api. token,heMasterId is mandatory
applicantCtrl.saveOfferManager = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
    var documentAttachment = [];
    documentAttachment = req.body.documentAttachment;
    if (typeof (documentAttachment) == "string") {
        documentAttachment = JSON.parse(documentAttachment);
    }
    if (!documentAttachment) {
        documentAttachment = [];
    }

    var reqApp = [];
    reqApp = req.body.reqApp;
    if (typeof (reqApp) == "string") {
        reqApp = JSON.parse(reqApp);
    }
    if (!reqApp) {
        reqApp = [];
    }

    var offerAttachment = [];
    offerAttachment = req.body.offerAttachment;
    if (typeof (offerAttachment) == "string") {
        offerAttachment = JSON.parse(offerAttachment);
    }
    if (!offerAttachment) {
        offerAttachment = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.offerManagerId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.heDepartmentId),
                    // req.st.db.escape(req.body.reqAppTransId),
                    req.st.db.escape(req.body.grossCTCAmount),
                    req.st.db.escape(req.body.grossCTCCurrency),
                    req.st.db.escape(req.body.grossCTCScale),
                    req.st.db.escape(req.body.grossCTCDuration),
                    req.st.db.escape(JSON.stringify(offerAttachment)),
                    req.st.db.escape(JSON.stringify(reqApp)),
                    req.st.db.escape(req.body.expectedJoining),
                    req.st.db.escape(JSON.stringify(documentAttachment))
                ];

                var procQuery = 'CALL wm_save_offerManager( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Offer manager data saved successfully";
                        response.error = null;
                        response.data = {
                            offerManagerId: result[0][0].offerManagerId
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving offer manager";
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

applicantCtrl.getOfferManager = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.reqAppId)
                ];

                var procQuery = 'CALL wm_get_offerManager( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Offer manager list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                grossCTCAmount: result[0][0].grossCTCAmount,
                                grossCTCCurrency: result[0][0].grossCTCCurrency,
                                grossCTCCurrencySymbol: result[0][0].currencySymbol,
                                grossCTCScale: result[0][0].grossCTCScale,
                                grossCTCScaleName: result[0][0].scale,
                                expectedjoining: result[0][0].expectedjoining,
                                grossCTCDuration: result[0][0].grossCTCDuration,
                                grossCTCDurationName: result[0][0].duration,
                                offerAttachment: result[0][0].offerAttachment,
                                reqAppList: JSON.parse(result[0][0].reqAppList) ? JSON.parse(result[0][0].reqAppList) : []
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            offerManager: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting offer manager";
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

applicantCtrl.getInterviewScheduler = function (req, res, next) {
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
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.reqApplicantId = req.query.reqApplicantId ? req.query.reqApplicantId : 0;
                req.query.interviewStageId = req.query.interviewStageId ? req.query.interviewStageId : 0;
                req.query.applicantId = req.query.applicantId ? req.query.applicantId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqApplicantId),
                    req.st.db.escape(req.query.requirementId),
                    req.st.db.escape(req.query.interviewStageId),
                    req.st.db.escape(req.query.applicantId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduler( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview scheduler loaded successfully";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < result[2].length; i++) {
                            var res2 = {};
                            res2.interviewScheduleId = result[2][i].interviewScheduleId ? result[2][i].interviewScheduleId : 0;
                            res2.interviewParentId = result[2][i].interviewParentId ? result[2][i].interviewParentId : 0;
                            res2.heDepartmentId = result[2][i].heDepartmentId ? result[2][i].heDepartmentId : 0;
                            res2.heDepartmentName = result[2][i].heDepartmentName ? result[2][i].heDepartmentName : "";
                            res2.heParentId = result[2][i].heParentId ? result[2][i].heParentId : 0;
                            res2.interviewRoundId = result[2][i].interviewRoundId ? result[2][i].interviewRoundId : 0;
                            res2.reportingDateTime = result[2][i].reportingDateTime ? result[2][i].reportingDateTime : "0000-00-00 00:00:00";
                            res2.interviewDuration = result[2][i].interviewDuration ? result[2][i].interviewDuration : 0;
                            res2.notes = result[2][i].notes ? result[2][i].notes : "";
                            res2.assessmentTemplateId = result[2][i].assessmentTemplateId ? result[2][i].assessmentTemplateId : 0;
                            res2.assessmentTitle = result[2][i].title ? result[2][i].title : "";
                            res2.applicant = JSON.parse(result[2][i].applicant) ? JSON.parse(result[2][i].applicant) : [];
                            res2.panelMembers = JSON.parse(result[2][i].panelMembers) ? JSON.parse(result[2][i].panelMembers) : [];
                            output.push(res2);
                        }
                        response.data =
                            {
                                interviewPanel: result[0] ? result[0] : [],
                                AssessmentTemplateList: result[1] ? result[1] : [],
                                interviewScheduler: output[0] ? output[0] : [],
                                interviewStageRounds: result[3] ? result[3] : [],
                                assessmentDetail: JSON.stringify(result[4][0].assessment) ? JSON.stringify(result[4][0].assessment) : [],
                                skillAssessment: JSON.parse(result[5][0].skillAssessment) ? JSON.parse(result[5][0].skillAssessment) : [],
                                clientLocations: result[6][0] ? result[6][0] : {}
                            };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewPanel: [],
                            AssessmentTemplateList: [],
                            interviewScheduler: [],
                            interviewStageType: []
                        };
                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading interview scheduler Details";
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


applicantCtrl.getAssessmentTemplate = function (req, res, next) {
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
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_assessmentTemplates( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Assessment templates loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                AssessmentTemplateList: result[0]
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            AssessmentTemplateList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Assessment Templates";
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

//masterdata for resume referral mobile only
applicantCtrl.getReferralResumeMaster = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_MasterForResumeReferal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[1]) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < result[3].length; i++) {
                            var res2 = {};
                            res2.stageId = result[3][i].stageId;
                            res2.stageName = result[3][i].stageName;
                            res2.stageTypeId = result[3][i].stageTypeId;
                            res2.stageTypeName = result[3][i].stageTypeName;
                            res2.colorCode = result[3][i].colorCode;
                            res2.status = JSON.parse(result[3][i].status) ? JSON.parse(result[3][i].status) : [];
                            output.push(res2);
                        }
                        response.data = {
                            country: result[0] ? result[0] : [],
                            skills: result[1] ? result[1] : [],
                            requirementList: result[2] ? result[2] : [],
                            stageStatus: output
                        };
                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            country: [],
                            skills: [],
                            requirementList: []
                        };
                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
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
            else {
                res.status(401).json(response);
            }
        });
    }
};


applicantCtrl.saveInterviewSchedulerNew = function (req, res, next) {
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

    var assessmentTypeList = [];
    assessmentTypeList = req.body.assessmentTypeList;
    if (typeof (assessmentTypeList) == "string") {
        assessmentTypeList = JSON.parse(assessmentTypeList);
    }
    if (!assessmentTypeList) {
        assessmentTypeList = [];
    }

    var skillAssessment = [];
    skillAssessment = req.body.skillAssessment;
    if (typeof (skillAssessment) == "string") {
        skillAssessment = JSON.parse(skillAssessment);
    }
    if (!skillAssessment) {
        skillAssessment = [];
    }

    var applicantList = req.body.applicantList;
    if (typeof (applicantList) == "string") {
        applicantList = JSON.parse(applicantList);
    }
    if (!applicantList) {
        applicantList = [];
    }

    var assessment = req.body.assessment;
    if (typeof (assessment) == "string") {
        assessment = JSON.parse(assessment);
    }
    if (!assessment) {
        assessment = [];
    }
    var interviewRound = req.body.interviewRound;
    if (typeof (interviewRound) == "string") {
        interviewRound = JSON.parse(interviewRound);
    }
    if (!interviewRound) {
        interviewRound = {};
    }

    var panelMembers = req.body.panelMembers;
    if (typeof (panelMembers) == "string") {
        panelMembers = JSON.parse(panelMembers);
    }
    if (!panelMembers) {
        error.panelMembers = 'Invalid panels';
        validationFlag *= false;
    }
    var interviewLocation = req.body.interviewLocation;
    if (typeof (interviewLocation) == "string") {
        interviewLocation = JSON.parse(interviewLocation);
    }
    if (!interviewLocation) {
        interviewLocation = [];
    }

    var heDepartment = req.body.heDepartment;
    if (typeof (heDepartment) == "string") {
        heDepartment = JSON.parse(heDepartment);
    }
    if (!heDepartment) {
        heDepartment = {};
    }

    var senderGroupId;
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.notes = req.body.notes ? req.body.notes : "";
                req.body.groupId = req.body.groupId ? req.body.groupId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(JSON.stringify(interviewRound)),
                    req.st.db.escape(req.body.reportingDateTime),
                    req.st.db.escape(req.body.interviewDuration),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(applicantList)),
                    req.st.db.escape(JSON.stringify(panelMembers)),
                    req.st.db.escape(JSON.stringify(assessment)),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(assessmentTypeList)),
                    req.st.db.escape(JSON.stringify(skillAssessment)),
                    req.st.db.escape(JSON.stringify(interviewLocation)),
                    req.st.db.escape(JSON.stringify(heDepartment)),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_save_interviewSchedular_new1( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    console.log(results);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                            senderName: results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++) {
                            if (notificationTemplaterRes.parsedTpl) {
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                    (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    moment().format("YYYY-MM-DD HH:mm:ss"),
                                    '',
                                    0,
                                    0,
                                    null,
                                    '',
                                    /** Data object property to be sent with notification **/
                                    {
                                        messageList: {
                                            messageId: results[1][i].messageId,
                                            message: results[1][i].message,
                                            messageLink: results[1][i].messageLink,
                                            createdDate: results[1][i].createdDate,
                                            messageType: results[1][i].messageType,
                                            messageStatus: results[1][i].messageStatus,
                                            priority: results[1][i].priority,
                                            senderName: results[1][i].senderName,
                                            senderId: results[1][i].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: results[1][i].groupId,
                                            groupType: 2,
                                            transId: results[1][i].transId,
                                            formId: results[1][i].formId,
                                            currentStatus: results[1][i].currentStatus,
                                            currentTransId: results[1][i].currentTransId,
                                            parentId: results[1][i].parentId,
                                            accessUserType: results[1][i].accessUserType,
                                            heUserId: results[1][i].heUserId,
                                            formData: JSON.parse(results[1][i].formDataJSON)
                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }
                        var output1 = [];
                        for (var k = 0; k < results[0].length; k++) {
                            var res2 = {};
                            res2.messageId = results[0][k].messageId,
                                res2.message = results[0][k].message,
                                res2.messageLink = results[0][k].messageLink,
                                res2.createdDate = results[0][k].createdDate,
                                res2.messageType = results[0][k].messageType,
                                res2.messageStatus = results[0][k].messageStatus,
                                res2.priority = results[0][k].priority,
                                res2.senderName = results[0][k].senderName,
                                res2.senderId = results[0][k].senderId,
                                res2.receiverId = results[0][k].receiverId,
                                res2.transId = results[0][k].transId,
                                res2.formId = results[0][k].formId,
                                res2.groupId = results[0][k].groupId,
                                res2.currentStatus = results[0][k].currentStatus,
                                res2.currentTransId = results[0][k].currentTransId,
                                res2.localMessageId = results[0][k].localMessageId,
                                res2.parentId = results[0][k].parentId,
                                res2.accessUserType = results[0][k].accessUserType,
                                res2.heUserId = results[0][k].heUserId,
                                formData = JSON.parse(results[0][k].formDataJSON)
                            output1.push(res2);
                        };

                        response.status = true;
                        response.message = "Interview  is scheduled successfully";
                        response.error = null;
                        response.data = {
                            messageList: output1
                            // {
                            //     messageId: results[0][0].messageId,
                            //     message: results[0][0].message,
                            //     messageLink: results[0][0].messageLink,
                            //     createdDate: results[0][0].createdDate,
                            //     messageType: results[0][0].messageType,
                            //     messageStatus: results[0][0].messageStatus,
                            //     priority: results[0][0].priority,
                            //     senderName: results[0][0].senderName,
                            //     senderId: results[0][0].senderId,
                            //     receiverId: results[0][0].receiverId,
                            //     transId : results[0][0].transId,
                            //     formId : results[0][0].formId,
                            //     groupId: req.body.groupId,
                            //     currentStatus : results[0][0].currentStatus,
                            //     currentTransId : results[0][0].currentTransId,
                            //     localMessageId : req.body.localMessageId,
                            //     parentId : results[0][0].parentId,
                            //     accessUserType : results[0][0].accessUserType,
                            //     heUserId : results[0][0].heUserId,
                            //     formData : JSON.parse(results[0][0].formDataJSON)
                            // }
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while scheduling interview";
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


applicantCtrl.getInterviewApplicantList = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    // req.st.db.escape(req.query.panelMemberId),
                    // req.st.db.escape(req.query.parentId),
                    req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewApplicantList_new( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview applicant loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                interviewApplicantList: result[0]
                            };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewApplicantList: []
                        };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading interview applicant";
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

applicantCtrl.getInterviewApplicantDetail = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.applicantId),
                    req.st.db.escape(req.query.interviewScheduleId)
                    // req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduleApplicantDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview applicant loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[0].length; i++) {
                            var res2 = {};
                            res2.assessment = JSON.parse(result[0][i].groupTypeName) ? JSON.parse(result[0][i].groupTypeName) : [];
                            res2.assessmentQuestionList = JSON.parse(result[0][i].assessmentByGroups) ? JSON.parse(result[0][i].assessmentByGroups) : [];
                            var output1 = [];
                            for (var j = 0; j < res2.assessmentQuestionList.length; j++) {
                                var res3 = {};
                                res3.questionId = res2.assessmentQuestionList[j].questionId;
                                res3.questionName = res2.assessmentQuestionList[j].questionName;
                                res3.questionWeightage = res2.assessmentQuestionList[j].questionWeightage;
                                res3.groupTypeName = res2.assessmentQuestionList[j].groupTypeName;
                                res3.options = JSON.parse(res2.assessmentQuestionList[j].options) ? JSON.parse(res2.assessmentQuestionList[j].options) : [];
                                output1.push(res3);
                            };
                            res2.assessmentQuestionList = output1;
                            output.push(res2);
                        }
                        response.data =
                            {
                                assessmentList: output,
                                skillAssessment: JSON.parse(result[1][0].skillAssessment)
                            };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewApplicantList: [],
                            skillAssessment: []
                        };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading interviewApplicant";
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

applicantCtrl.getInterviewApplicantDetailWeb = function (req, res, next) {
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
        response.message = 'Please check the errors';
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
                    req.st.db.escape(req.query.applicantId),
                    req.st.db.escape(req.query.assessmentTemplateId)
                    // req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduleApplicantDetailsWeb( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Interview applicant loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[0].length; i++) {
                            var res2 = {};
                            res2.assessment = JSON.parse(result[0][i].groupTypeName) ? JSON.parse(result[0][i].groupTypeName) : [];
                            res2.assessmentQuestionList = JSON.parse(result[0][i].assessmentByGroups) ? JSON.parse(result[0][i].assessmentByGroups) : [];
                            var output1 = [];
                            for (var j = 0; j < res2.assessmentQuestionList.length; j++) {
                                var res3 = {};
                                res3.questionId = res2.assessmentQuestionList[j].questionId;
                                res3.questionName = res2.assessmentQuestionList[j].questionName;
                                res3.groupTypeName = res2.assessmentQuestionList[j].groupTypeName;
                                res3.options = JSON.parse(res2.assessmentQuestionList[j].options) ? JSON.parse(res2.assessmentQuestionList[j].options) : [];
                                output1.push(res3);
                            };
                            res2.assessmentQuestionList = output1;
                            output.push(res2);
                        }
                        response.data =
                            {
                                assessmentList: output,
                                skillAssessment: JSON.parse(result[1][0].skillAssessment)
                            };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewApplicantList: [],
                            skillAssessment: []
                        };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading interviewApplicant";
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

applicantCtrl.getMasterInterviewScheduler = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_MasterForInterviewScheduler( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Interview master data loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                jobTitle: result[0] ? result[0] : [],
                                assessmentList: result[1] ? result[1] : [],
                                interviewRound: result[2] ? result[2] : [],
                                skillLevelList: result[3] ? result[3] : [],
                                heDepartment: result[4] ? result[4] : []
                            };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            jobTitle: [],
                            assessmentList: [],
                            interviewRound: [],
                            skillLevelList: [],
                            heDepartment: []
                        };

                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting loading Interview Master list";
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


applicantCtrl.saveInterviewSchedulerForApplicant = function (req, res, next) {
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

    var assessment = req.body.assessment;
    if (typeof (assessment) == "string") {
        assessment = JSON.parse(assessment);
    }
    if (!assessment) {
        assessment = {};
    }

    var jobTitle = req.body.jobTitle;
    if (typeof (jobTitle) == "string") {
        jobTitle = JSON.parse(jobTitle);
    }
    if (!jobTitle) {
        jobTitle = {};
    }

    var assessmentTypeList = [];
    assessmentTypeList = req.body.assessmentTypeList;
    if (typeof (assessmentTypeList) == "string") {
        assessmentTypeList = JSON.parse(assessmentTypeList);
    }
    if (!assessmentTypeList) {
        assessmentTypeList = [];
    }

    var skillAssessment = [];
    skillAssessment = req.body.skillAssessment;
    if (typeof (skillAssessment) == "string") {
        skillAssessment = JSON.parse(skillAssessment);
    }
    if (!skillAssessment) {
        skillAssessment = [];
    }
    var heDepartment = [];
    heDepartment = req.body.heDepartment;
    if (typeof (heDepartment) == "string") {
        heDepartment = JSON.parse(heDepartment);
    }
    if (!heDepartment) {
        heDepartment = [];
    }

    var interviewRound = req.body.interviewRound;
    if (typeof (interviewRound) == "string") {
        interviewRound = JSON.parse(interviewRound);
    }
    if (!interviewRound) {
        interviewRound = {};
    }

    var panelMembers = req.body.panelMembers;
    if (typeof (panelMembers) == "string") {
        panelMembers = JSON.parse(panelMembers);
    }
    if (!panelMembers) {
        error.panelMembers = 'Invalid panels';
        validationFlag *= false;
    }

    var attachmentList = req.body.attachmentList;
    if (typeof (attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if (!attachmentList) {
        attachmentList = [];
    }

    var senderGroupId;
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                // req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.notes = req.body.notes ? req.body.notes : "";
                req.body.interviewDuration = req.body.interviewDuration ? req.body.interviewDuration : 0;
                req.body.mobileISD = req.body.mobileISD ? req.body.mobileISD : '';
                req.body.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : '';

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(JSON.stringify(interviewRound)),
                    req.st.db.escape(req.body.reportingDateTime),
                    req.st.db.escape(req.body.interviewDuration),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(panelMembers)),
                    req.st.db.escape(JSON.stringify(assessment)),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(JSON.stringify(jobTitle)),
                    req.st.db.escape(req.body.profilePicture),
                    req.st.db.escape(JSON.stringify(attachmentList[0])),
                    req.st.db.escape(JSON.stringify(assessmentTypeList)),
                    req.st.db.escape(JSON.stringify(skillAssessment)),
                    req.st.db.escape(JSON.stringify(heDepartment))
                ];

                var procQuery = 'CALL wm_save_interviewSchedulerOfOneApplicant( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                            senderName: results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++) {         // main line 
                            if (notificationTemplaterRes.parsedTpl) {
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                    (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                    0,
                                    0,
                                    0,
                                    0,
                                    1,
                                    moment().format("YYYY-MM-DD HH:mm:ss"),
                                    '',
                                    0,
                                    0,
                                    null,
                                    '',
                                    /** Data object property to be sent with notification **/
                                    {
                                        messageList: {
                                            messageId: results[1][i].messageId,
                                            message: results[1][i].message,
                                            messageLink: results[1][i].messageLink,
                                            createdDate: results[1][i].createdDate,
                                            messageType: results[1][i].messageType,
                                            messageStatus: results[1][i].messageStatus,
                                            priority: results[1][i].priority,
                                            senderName: results[1][i].senderName,
                                            senderId: results[1][i].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: results[1][i].groupId,
                                            groupType: 2,
                                            transId: results[1][i].transId,
                                            formId: results[1][i].formId,
                                            currentStatus: results[1][i].currentStatus,
                                            currentTransId: results[1][i].currentTransId,
                                            parentId: results[1][i].parentId,
                                            accessUserType: results[1][i].accessUserType,
                                            heUserId: results[1][i].heUserId,
                                            formData: JSON.parse(results[1][i].formDataJSON)
                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Interview scheduled successfully";
                        response.error = null;
                        response.data = {
                            messageList:
                                {
                                    messageId: results[0][0].messageId,
                                    message: results[0][0].message,
                                    messageLink: results[0][0].messageLink,
                                    createdDate: results[0][0].createdDate,
                                    messageType: results[0][0].messageType,
                                    messageStatus: results[0][0].messageStatus,
                                    priority: results[0][0].priority,
                                    senderName: results[0][0].senderName,
                                    senderId: results[0][0].senderId,
                                    receiverId: results[0][0].receiverId,
                                    transId: results[0][0].transId,
                                    formId: results[0][0].formId,
                                    groupId: req.body.groupId,
                                    currentStatus: results[0][0].currentStatus,
                                    currentTransId: results[0][0].currentTransId,
                                    localMessageId: req.body.localMessageId,
                                    parentId: results[0][0].parentId,
                                    accessUserType: results[0][0].accessUserType,
                                    heUserId: results[0][0].heUserId,
                                    formData: JSON.parse(results[0][0].formDataJSON)
                                }
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while scheduling interview";
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


applicantCtrl.saveOnBoarding = function (req, res, next) {
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
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    var documentAttachment = [];
    documentAttachment = req.body.documentAttachment;
    if (typeof (documentAttachment) == "string") {
        documentAttachment = JSON.parse(documentAttachment);
    }
    if (!documentAttachment) {
        documentAttachment = [];
    }

    var applicant = [];
    applicant = req.body.applicant;
    if (typeof (applicant) == "string") {
        applicant = JSON.parse(applicant);
    }
    if (!applicant) {
        applicant = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.onBoardingId = req.body.onBoardingId ? req.body.onBoardingId : 0;
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                req.body.jobTitleId = req.body.jobTitleId ? req.body.jobTitleId : 0;
                req.body.jobTitle = req.body.jobTitle ? req.body.jobTitle : '';
                req.body.contactId = req.body.contactId ? req.body.contactId : 0;
                req.body.managerId = req.body.managerId ? req.body.managerId : 0;
                req.body.offerJoiningDate = req.body.offerJoiningDate ? req.body.offerJoiningDate : '';
                req.body.plannedJoiningDate = req.body.plannedJoiningDate ? req.body.plannedJoiningDate : '';
                req.body.offerCTCCurrId = req.body.offerCTCCurrId ? req.body.offerCTCCurrId : 0;
                req.body.offerCTCSalary = req.body.offerCTCSalary ? req.body.offerCTCSalary : 0;
                req.body.offerCTCScaleId = req.body.offerCTCScaleId ? req.body.offerCTCScaleId : 0;
                req.body.offerCTCPeriodId = req.body.offerCTCPeriodId ? req.body.offerCTCPeriodId : 0;
                req.body.salaryCurrId = req.body.salaryCurrId ? req.body.salaryCurrId : 0;
                req.body.salarySalary = req.body.salarySalary ? req.body.salarySalary : 0;
                req.body.salaryScaleId = req.body.salaryScaleId ? req.body.salaryScaleId : 0;
                req.body.salaryPeriodId = req.body.salaryPeriodId ? req.body.salaryPeriodId : 0;
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.workInMentionedShifts = req.body.workInMentionedShifts ? req.body.workInMentionedShifts : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.onBoardingId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(JSON.stringify(applicant)),
                    req.st.db.escape(req.body.jobTitleId),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.contactId),
                    req.st.db.escape(req.body.managerId),
                    req.st.db.escape(req.body.offerJoiningDate),
                    req.st.db.escape(req.body.plannedJoiningDate),
                    req.st.db.escape(req.body.actualJoiningDate),
                    req.st.db.escape(req.body.offerCTCCurrId),
                    req.st.db.escape(req.body.offerCTCSalary),
                    req.st.db.escape(req.body.offerCTCScaleId),
                    req.st.db.escape(req.body.offerCTCPeriodId),
                    req.st.db.escape(req.body.salaryCurrId),
                    req.st.db.escape(req.body.salarySalary),
                    req.st.db.escape(req.body.salaryScaleId),
                    req.st.db.escape(req.body.salaryPeriodId),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.workInMentionedShifts),
                    req.st.db.escape(JSON.stringify(documentAttachment))
                ];

                var procQuery = 'CALL wm_save_onBoarding( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "OnBoarding data saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving onBoarding data";
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

applicantCtrl.getOnBoarding = function (req, res, next) {
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
        response.message = 'Please check the errors';
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

                var procQuery = 'CALL wm_get_onBoarding( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "onBoarding details loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                result:result[0]
                                // heMasterId: result[0][0].heMasterId,
                                // heDepartmentId: result[0][0].heDepartmentId,
                                // applicantId: result[0][0].applicantId,
                                // jobTitleId: result[0][0].jobTitleId,
                                // jobtitle: result[0][0].jobtitle,
                                // expectedjoining: result[0][0].expectedjoining,
                                // companyContactId: result[0][0].companyContactId,
                                // companyContactName: result[0][0].companyContactName,
                                // accountManagerId: result[0][0].accountManagerId,
                                // accountManagerName: result[0][0].accountManagerName,
                                // offerJoiningDate: result[0][0].offerJoiningDate,
                                // plannedJoiningDate: result[0][0].plannedJoiningDate,
                                // actualJoiningDate: result[0][0].actualJoiningDate,
                                // offerCTCCurrId: result[0][0].offerCTCCurrId,
                                // offerCTCSalary: result[0][0].offerCTCSalary,
                                // offerCTCScaleId: result[0][0].offerCTCScaleId,
                                // offerCTCPeriodId: result[0][0].offerCTCPeriodId,
                                // salaryCurrId: result[0][0].salaryCurrId,
                                // salarySalary: result[0][0].salarySalary,
                                // salaryScaleId: result[0][0].salaryScaleId,
                                // salaryPeriodId: result[0][0].salaryPeriodId,
                                // notes: result[0][0].notes,
                                // workInMentionedShifts: result[0][0].workInMentionedShifts,
                                // attachmentList: JSON.parse(result[0][0].attachmentList) ? JSON.parse(result[0][0].attachmentList) : []
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            offerManager: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting onBoarding details";
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

applicantCtrl.saveMedical = function (req, res, next) {
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
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.medicalId = req.body.medicalId ? req.body.medicalId : 0;
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                req.body.currencyId = req.body.currencyId ? req.body.currencyId : 0;
                req.body.scaleId = req.body.scaleId ? req.body.scaleId : 0;
                req.body.medicalStatus = req.body.medicalStatus ? req.body.medicalStatus : 1;
                req.body.reMedical = req.body.reMedical ? req.body.reMedical : 0;
                req.body.medicalNotes = req.body.medicalNotes ? req.body.medicalNotes : '';
                req.body.notes = req.body.notes ? req.body.notes : '';
                
                

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.medicalId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.billTo),
                    req.st.db.escape(req.body.amount),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.scaleId),
                    req.st.db.escape(req.body.receivedDate),
                    req.st.db.escape(req.body.sentDate),
                    req.st.db.escape(req.body.date),
                    req.st.db.escape(req.body.tokenNumber),
                    req.st.db.escape(req.body.MOFANumber),
                    req.st.db.escape(req.body.medicalStatus),
                    req.st.db.escape(req.body.medicalNotes),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.reMedical)
                ];

                var procQuery = 'CALL wm_save_1010_medical( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Medical data saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving Medical data";
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

module.exports = applicantCtrl;