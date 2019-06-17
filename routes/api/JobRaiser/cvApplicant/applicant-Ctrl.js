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
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var applicantCtrl = {};
var error = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;
var logger = require('../error-logger/error-log.js');



// var attachFile = return new Promise(function (resolve, reject) {
//     console.log('attachement cvasdfasdfasdf asaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasdfasdf asdfasdfasdfadsfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf');
//     if (cv != '') {
//         cv = gs_url + storage_bucket + '/' + cv;

//         http.get(cv, function (fileResponse) {
//             var bufs = [];

//             fileResponse.on('data', function (d) { bufs.push(d); });
//             fileResponse.on('end', function () {
//                 var buf = Buffer.concat(bufs);
//                 textract.fromBufferWithName(cv, buf, function (error, txt) {
//                     text = txt;
//                     resolve(text);
//                 });
//             });
//         });

//     }
//     else {
//         resolve('');
//     }
// })
//var createPromise = defer.denodeify(attachFile);
//var attachFilePromise = attachFile;

// For saving resume or updating resume   * mandatory fields token,heMasterId,firstName,mobileNumber,emailId

applicantCtrl.saveApplicant = function (req, res, next) {
    // var cvKeywords = '';
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveApplicant'
    }

    try {

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
            response.message = 'Please Check the Errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            try {
                req.st.validateToken(req.query.token, function (err, tokenResult) {
                    try {
                        if ((!err) && tokenResult) {

                            if (tokenResult[0] && tokenResult[0].secretKey && tokenResult[0].secretKey != "") {
                                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                            }
                            else {
                                response.message = "Session expired.! Please re-login";
                                res.status(401).json(response);
                                return;
                            }
                            zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                                try {
                                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                    if (!req.body.heMasterId) {
                                        error.heMasterId = 'Invalid Company';
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
                                        if (attachmentList.length) //&& (req.body.cvKeywords == '') && req.body.cvKeywords == undefined && req.body.cvKeywords == null &&  req.body.cvKeywords == ' ') 
                                        {
                                            cv = attachmentList[0].CDNPath;
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
                                            try {
                                                // if (cv != '' && (!req.body.cvKeywords || req.body.cvKeywords == '')) {
                                                //     cv = gs_url + storage_bucket + '/' + cv;
                                                //     console.log('cvPath complete', cv);
                                                //     http.get(cv, function (fileResponse) {
                                                //         var bufs = [];

                                                //         fileResponse.on('data', function (d) { bufs.push(d); });
                                                //         fileResponse.on('end', function () {
                                                //             var buf = Buffer.concat(bufs);
                                                //             process.env.ANTIWORDHOME = '/usr/share/antiword';
                                                //             try {
                                                //                 textract.fromBufferWithName(cv, buf, function (error, txt) {
                                                //                     if (error) {
                                                //                         // var tempCVPath = cv.replace('docx', 'doc');
                                                //                         // textract.fromBufferWithName(tempCVPath, buf, function (error, txt) {
                                                //                         // text = txt;
                                                //                         console.log('error', error);
                                                //                         // console.log('text inside', text);
                                                //                         resolve(text);
                                                //                         // });
                                                //                     }
                                                //                     else {
                                                //                         text = txt;
                                                //                         console.log('error', error);
                                                //                         console.log('text inside', text);
                                                //                         resolve(text);

                                                //                     }
                                                //                 });
                                                //             }
                                                //             catch (ex) {
                                                //                 console.log("ex", ex);
                                                //                 resolve('');
                                                //             }
                                                //         });
                                                //     });

                                                // }
                                                // else {
                                                resolve('');
                                                // }
                                            }
                                            catch (ex) {
                                                console.log(ex);
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

                                                var educationKey = [];
                                                if (req.body.importerFlag == 1 && education.length) {
                                                    for (var i = 0; i < education.length; i++) {
                                                        // console.log("education[i].split('-')",education[i].split('-'),"education[i].split(' in ')",education[i].split(' in '));

                                                        if (education[i].split('-').length == 1 && education[i].split(' in ').length == 1) {
                                                            educationKey.push({ educationName: education[i].trim(), specializationName: "" });
                                                        }
                                                        else if (education[i].split('-').length == 1 && education[i].split(' in ').length > 1) {
                                                            educationKey.push({ educationName: education[i].split(' in ')[0].trim(), specializationName: education[i].split(' in ')[1].trim() });
                                                        }
                                                        else if (education[i].split('-').length > 1 && education[i].split(' in ').length == 1) {
                                                            educationKey.push({ educationName: education[i].split('-')[0].trim(), specializationName: education[i].split('-')[1].trim() });
                                                        }
                                                    }
                                                    console.log("educationKey", educationKey);
                                                    education = educationKey;
                                                }

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
                                                    req.st.db.escape(req.body.gender || 3),
                                                    req.st.db.escape(req.body.DOB || null),
                                                    //req.st.db.escape(req.body.originalCvId),
                                                    req.st.db.escape(req.body.blockingPeriod),
                                                    req.st.db.escape(req.body.status),
                                                    req.st.db.escape(JSON.stringify(prefLocations)),
                                                    req.st.db.escape(JSON.stringify(industry)),
                                                    req.st.db.escape(JSON.stringify(nationality)),
                                                    req.st.db.escape(req.body.cvKeywords || cvKeywords || ""),
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
                                                    req.st.db.escape(JSON.stringify(presentLocation)),
                                                    req.st.db.escape(req.body.ppIssueDate || null),
                                                    req.st.db.escape(req.body.gccExp || 0.0),
                                                    req.st.db.escape(req.body.licenseOption || 0),
                                                    req.st.db.escape(req.body.passportCategory || ""),
                                                    req.st.db.escape(JSON.stringify(req.body.licenseData || [])),
                                                    req.st.db.escape(JSON.stringify(req.body.document_attachments_list || [])),
                                                    req.st.db.escape(req.body.importedFromFolder || 0),
                                                    req.st.db.escape(req.body.importedFromExcel || 0),
                                                    req.st.db.escape(JSON.stringify(req.body.cvStatus || {})),
                                                    req.st.db.escape(JSON.stringify(req.body.employmentHistory || [])),
                                                    req.st.db.escape(JSON.stringify(req.body.salutation || {})),
                                                    req.st.db.escape(req.body.panNumber || ""),
                                                    req.st.db.escape(req.body.skypeId || ""),
                                                    req.st.db.escape(DBSecretKey),
                                                    req.st.db.escape(req.body.age || 0)
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
                                                            applicantId: result[0][0].applicantId,
                                                            applicantDetails: result[1] && result[1][0] ? result[1][0] : {}

                                                        };
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                            res.status(200).json(response);
                                                        });

                                                        // res.status(200).json(response);

                                                    }
                                                    else if (!err && result && result[0] && result[0][0]._applicantExists) {

                                                        var temp_result = result[1][0] ? result[1][0] : {};
                                                        temp_result.education = JSON.parse(temp_result.education);
                                                        temp_result.cvSource = JSON.parse(temp_result.cvSource);
                                                        temp_result.cvStatus = JSON.parse(temp_result.cvStatus);
                                                        temp_result.expectedSalaryCurr = temp_result.expectedSalaryCurr && JSON.parse(temp_result.expectedSalaryCurr).currencyId ? JSON.parse(temp_result.expectedSalaryCurr) : {};
                                                        temp_result.expectedSalaryPeriod = temp_result.expectedSalaryPeriod && JSON.parse(temp_result.expectedSalaryPeriod).durationId ? JSON.parse(temp_result.expectedSalaryPeriod) : {};
                                                        temp_result.expectedSalaryScale = temp_result.expectedSalaryScale && JSON.parse(temp_result.expectedSalaryScale).scaleId ? JSON.parse(temp_result.expectedSalaryScale) : {};
                                                        temp_result.industry = JSON.parse(temp_result.industry);
                                                        temp_result.jobTitle = JSON.parse(temp_result.jobTitle).jobtitleId ? JSON.parse(temp_result.jobTitle) : {};
                                                        temp_result.nationality = JSON.parse(temp_result.nationality).nationalityId ? JSON.parse(temp_result.nationality) : {};
                                                        temp_result.prefLocations = JSON.parse(temp_result.prefLocations);
                                                        temp_result.presentSalaryCurr = temp_result.presentSalaryCurr && JSON.parse(temp_result.presentSalaryCurr).currencyId ? JSON.parse(temp_result.presentSalaryCurr) : {};
                                                        temp_result.presentSalaryPeriod = temp_result.presentSalaryPeriod && JSON.parse(temp_result.presentSalaryPeriod).durationId ? JSON.parse(temp_result.presentSalaryPeriod) : {};
                                                        temp_result.presentSalaryScale = temp_result.presentSalaryScale && JSON.parse(temp_result.presentSalaryScale).scaleId ? JSON.parse(temp_result.presentSalaryScale) : {};
                                                        temp_result.primarySkills = JSON.parse(temp_result.primarySkills);
                                                        temp_result.secondarySkills = JSON.parse(temp_result.secondarySkills);
                                                        temp_result.functionalAreas = JSON.parse(temp_result.functionalAreas);
                                                        temp_result.presentLocation = JSON.parse(temp_result.presentLocation).locationId ? JSON.parse(temp_result.presentLocation) : {};
                                                        temp_result.licenseData = JSON.parse(temp_result.licenseData);
                                                        temp_result.document_attachments_list = JSON.parse(temp_result.document_attachments_list);
                                                        temp_result.employmentHistory = JSON.parse(temp_result.employmentHistory);
                                                        temp_result.salutation = JSON.parse(temp_result.salutation);


                                                        for (var i = 0; i < result[5].length; i++) {
                                                            if (typeof (result[5] && result[5][i] && result[5][i].cc) == 'string') {
                                                                result[5][i].cc = JSON.parse(result[5][i].cc)
                                                            }
                                                            if (typeof (result[5] && result[5][i] && result[5][i].bcc) == 'string') {
                                                                result[5][i].bcc = JSON.parse(result[5][i].bcc)
                                                            }
                                                            if (typeof (result[5] && result[5][i] && result[5][i].attachment) == 'string') {
                                                                result[5][i].attachment = JSON.parse(result[5][i].attachment)
                                                            }

                                                            if (typeof (result[5] && result[5][i] && result[5][i].mailDump) == 'string') {
                                                                result[5][i].mailDump = JSON.parse(result[5][i].mailDump)
                                                            }

                                                        }


                                                        for (var i = 0; i < result[6].length; i++) {
                                                            result[6][i].followUpNotes = (result[6] && result[6][i]) ? JSON.parse(result[6][i].followUpNotes) : []
                                                        }

                                                        if (req.body.importedFromFolder == 0 && req.body.importedFromExcel == 0)
                                                            response.status = true;
                                                        else
                                                            response.status = false;

                                                        response.message = "Resume already exists";
                                                        response.error = null;
                                                        response.data = {
                                                            duplicate: 1,
                                                            applicantId: result[0][0]._applicantExists,
                                                            applicantDetails: temp_result ? temp_result : {},
                                                            clientCvPath: (result[2] && result[2][0]) && result[2][0].clientCvPath ? result[2][0].clientCvPath : "",
                                                            previousClientCvPath: (result[3] && result[3][0]) && result[3][0].previousClientCvPath ? result[3][0].previousClientCvPath : "",
                                                            faceSheet: (result[4] && result[4][0]) && JSON.parse(result[4][0].faceSheet) ? JSON.parse(result[4][0].faceSheet) : {},
                                                            mailTransactions: result[5] && result[5][0] ? result[5] : [],
                                                            followUpNotes: result[6] && result[6][0] ? result[6] : [],
                                                            applicantTransaction: result[7] ? result[7] : []
                                                        };
                                                        response.duplicate = 1;
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                            res.status(200).json(response);
                                                        });

                                                    }
                                                    else {
                                                        response.status = true;
                                                        response.message = "Error While Saving Resume";
                                                        response.error = 1;
                                                        console.log(err);
                                                        res.status(500).json(response);
                                                    }
                                                });
                                            }
                                        })
                                            .catch(function (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            });

                                    }
                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });

                        }
                        else {
                            res.status(401).json(response);
                        }
                    }
                    catch (ex) {
                        error_logger.error = ex;
                        logger(req, error_logger);
                        res.status(500).json(error_response);
                    }
                });
            }
            catch (ex) {
                console.log(ex);
                res.status(500).json(response);
            }
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// token and heMasterId is mandatory
applicantCtrl.getApplicantMasterData = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getApplicantMasterData'
    }

    try {

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
                try {
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
                            try {
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


                                    for (var i = 0; i < result[10].length; i++) {
                                        result[10][i].status = JSON.parse(result[10][i].status) ? JSON.parse(result[10][i].status) : [];
                                    }

                                    if (result[35].length) {
                                        for (var p = 0; p < result[35].length; p++) {
                                            result[35][p].templateData = (result[35] && result[35][p]) ? JSON.parse(result[35][p].templateData) : {};
                                        }
                                        var templateData = {};
                                        for (var i = 0; i < result[35][0].templateData.length; i++) {
                                            templateData[result[35][0].templateData[i].formId] = result[35][0].templateData[i];
                                            if (i == 100) {
                                                break;
                                            }
                                        }
                                        result[35][0].templateData = templateData;
                                    }

                                    for (var i = 0; i < result[41].length; i++) {
                                        result[41][i].questions = (result[41] && result[41][i]) ? JSON.parse(result[41][i].questions) : [];
                                    }

                                    if (typeof (result[46][0].teamUsers) == 'string') {
                                        result[46][0].teamUsers = (result[46] && result[46][0] && result[46][0].teamUsers) ? JSON.parse(result[46][0].teamUsers) : []
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
                                        mStageStatus: result[10] ? result[10] : [],
                                        tags: {
                                            candidate: result[11] ? result[11] : [],
                                            requirement: result[12] ? result[12] : [],
                                            client: result[13] ? result[13] : [],
                                            general: result[27] ? result[27] : [],
                                            clientContact: result[30] ? result[30] : [],
                                            interview: result[33] ? result[33] : [],
                                            billing: result[38] ? result[38] : [],
                                            billingTable: result[40] ? result[40] : [],
                                            offer: result[51] ? result[51] : []
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
                                        reportingTo: result[32] ? result[32] : [],
                                        functionalAreas: result[34] ? result[34] : [],
                                        accessRightsTemplateDetails: result[35] ? result[35] : [],
                                        layout: (result && result[36] && result[36][0]) ? JSON.parse(result[36][0].layout) : {},
                                        clientStatus: result[37] ? result[37] : [],
                                        group: result[39] ? result[39] : [],
                                        faceSheetTemplates: result[41] ? result[41] : [],
                                        reportingToList: result[42] ? result[42] : [],
                                        jdTemplateList: result[43] ? result[43] : [],
                                        cvStatus: result[44] ? result[44] : [],
                                        visaTravelStatus: result[45] ? result[45] : [],
                                        teamUsers: result[46][0].teamUsers ? result[46][0].teamUsers : [],
                                        paceUserDetails: (result[47] && result[47][0]) ? result[47][0] : {},
                                        stageStatusMapList: result[48] ? result[48] : [],
                                        interviewModeList: result[49] ? result[49] : [],
                                        billTo: result[50] ? result[50] : [],
                                        organizationChart: {
                                            organizationBranches: result[52] && result[52][0] ? result[52] : [],
                                            organizationDepartments: result[53] && result[53][0] ? result[53] : [],
                                            organizationGrades: result[54] && result[54][0] ? result[54] : [],
                                            organizationJobTitles: result[55] && result[55][0] ? result[55] : []
                                        },
                                        typeView: result[56] ? result[56] : [],
                                        taskMembers: result[57] ? result[57] : [],
                                        requirementGroupList: result[58] ? result[58] : [],
                                        reqOrGroup: result[59] && result[59][0] && result[59][0].reqOrGroup ? result[59][0].reqOrGroup : 1,
                                        salutation: result[60] && result[60][0] ? result[60] : [],
                                        clientBirthdayList: result[61] && result[61][0] ? result[61] : [],
                                        customRangeList: result[62] && result[62][0] ? result[62] : [],
                                        backUpMaster : result[63] && result[63][0] ? result[63] : [],
                                        configDetails : result[64] && result[64][0] ? result[64][0] : {}
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
                                            clientContact: [],
                                            interview: [],
                                            billing: [],
                                            billingTable: []
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
                                        reportingTo: [],
                                        functionalAreas: [],
                                        accessRightsTemplateDetails: [],
                                        layout: {},
                                        clientStatus: [],
                                        group: [],
                                        faceSheetTemplates: [],
                                        reportingToList: [],
                                        jdTemplateList: [],
                                        cvStatus: [],
                                        visaTravelStatus: [],
                                        teamUsers: [],
                                        paceUserDetails: {},
                                        stageStatusMapList: [],
                                        interviewModeList: [],
                                        billTo: [],
                                        clientBirthdayList: []
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// token ,heMasterId,requirementId(parentId) , applicantId is mandatory
applicantCtrl.saveReqApplicant = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveReqApplicant'
    }

    try {


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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// master data for filters on ATS page tile view. token and heMasterId is mandatory
applicantCtrl.getReqApplicantMasterData = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getReqApplicantMasterData'
    }

    try {


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
                try {
                    if ((!err) && tokenResult) {
                        // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId)
                        ];

                        var procQuery = 'CALL wm_get_reqAppMaster( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// To load title view ie tagged applicants based on filter. token and heMasterId is mandatory
applicantCtrl.getreqApplicants = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getreqApplicants'
    }

    try {

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
        var heDepartmentId = req.body.heDepartmentId;
        if (!heDepartmentId) {
            heDepartmentId = [];
        }
        else if (typeof (heDepartmentId) == "string") {
            heDepartmentId = JSON.parse(heDepartmentId);
        }


        var jobTitleId = req.body.jobTitleId;
        if (!jobTitleId) {
            jobTitleId = [];
        }
        else if (typeof (jobTitleId) == "string") {
            jobTitleId = JSON.parse(jobTitleId);
        }


        var stageId = req.body.stageId;
        if (!stageId) {
            stageId = [];
        }
        else if (typeof (stageId) == "string") {
            stageId = JSON.parse(stageId);
        }

        var statusId = req.body.statusId;
        if (!statusId) {
            statusId = [];
        }
        else if (typeof (statusId) == "string") {
            statusId = JSON.parse(statusId);
        }


        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {
                        // req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                        // req.body.jobTitleId = (req.body.jobTitleId) ? req.body.jobTitleId : [];
                        // req.body.stageId = (req.body.stageId) ? req.body.stageId : [];
                        // req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                        req.body.startPage = (req.body.startPage) ? req.body.startPage : 0;
                        req.body.limit = (req.body.limit) ? req.body.limit : 12;
                        req.body.applicantId = (req.body.applicantId) || (req.body.applicantId == "") ? req.body.applicantId : 0;
                        req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                        req.body.type = (req.body.type) ? req.body.type : 1;
                        req.body.name = (req.body.name) ? req.body.name.trim() : '';
                        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                        if (req.body.name != "") {
                            req.body.name = req.body.name.split(',');
                        }
                        else {
                            req.body.name = [];
                        }

                        var getStatus = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(heDepartmentId)),
                            req.st.db.escape(JSON.stringify(jobTitleId)),
                            // req.st.db.escape(req.query.heDepartmentId),
                            // req.st.db.escape(req.query.jobTitleId),
                            req.st.db.escape(req.body.applicantId),
                            // req.st.db.escape(req.query.stageId),
                            // req.st.db.escape(req.body.statusId),
                            req.st.db.escape(JSON.stringify(stageId)),
                            req.st.db.escape(JSON.stringify(statusId)),
                            req.st.db.escape(req.body.startPage),
                            req.st.db.escape(req.body.limit),
                            req.st.db.escape(req.body.requirementId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(JSON.stringify(req.body.name || [])),
                            req.st.db.escape(req.body.from || null),
                            req.st.db.escape(req.body.to || null),
                            req.st.db.escape(req.body.userMasterId || 0),
                            req.st.db.escape(req.query.isWeb || 0),
                            req.st.db.escape(JSON.stringify(req.body.stageDetail || {})),
                            req.st.db.escape(req.body.applicantName || ""),
                            req.st.db.escape(req.body.emailId || ""),
                            req.st.db.escape(req.body.mobileNumber || ""),
                            req.st.db.escape(req.body.requirementJobTitle || ""),
                            req.st.db.escape(req.body.jobCode || ""),
                            req.st.db.escape(req.body.clientName || ""),
                            req.st.db.escape(req.body.stageName || ""),
                            req.st.db.escape(req.body.statusName || ""),
                            req.st.db.escape(req.body.applicantJobTitle || ""),
                            req.st.db.escape(req.body.employer || ""),
                            req.st.db.escape(req.body.experience || ""),
                            req.st.db.escape(req.body.stageStatusNotes || ""),
                            req.st.db.escape(req.body.cvSource || ""),
                            req.st.db.escape(req.body.primarySkills || ""),
                            req.st.db.escape(req.body.secondarySkills || ""),
                            req.st.db.escape(req.body.presentLocation || ""),
                            req.st.db.escape(req.body.education || ""),
                            req.st.db.escape(req.body.passportNumber || ""),
                            req.st.db.escape(req.body.faceSheet || ""),
                            req.st.db.escape(req.body.cvCreatedUserName || ""),
                            req.st.db.escape(req.body.cvUpdatedUserName || ""),
                            req.st.db.escape(req.body.reqCvCreatedUserName || ""),
                            req.st.db.escape(req.body.reqCvUpdatedUserName || ""),
                            req.st.db.escape(req.body.cvCreatedDate || null),
                            req.st.db.escape(req.body.cvUpdatedDate || null),
                            req.st.db.escape(req.body.reqCvCreatedDate || null),
                            req.st.db.escape(req.body.reqCvUpdatedDate || null),
                            req.st.db.escape(req.body.emigrationCheck || ""),
                            req.st.db.escape(req.body.DOB || null),
                            req.st.db.escape(req.body.ppExpiryDate || null),
                            req.st.db.escape(req.body.ppIssueDate || null)
                        ];

                        var procQuery = 'CALL wm_get_applicantsWithColumnFilter( ' + getStatus.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, Result) {
                            try {
                                console.log(err);
                                if (!err && Result && Result[0] || Result[2] || Result[3]) {
                                    response.status = true;
                                    response.message = "Applicants loaded successfully";
                                    response.error = null;
                                    if (Result[0] && Result[0][0] && Result[0][0].reqApplicantId) {
                                        for (var i = 0; i < Result[0].length; i++) {
                                            Result[0][i].clientContacts = Result[0][i].clientContacts ? JSON.parse(Result[0][i].clientContacts) : [];

                                            Result[0][i].faceSheetDetailWithAnswers = Result[0][i].faceSheetDetailWithAnswers ? JSON.parse(Result[0][i].faceSheetDetailWithAnswers) : [];

                                            var facesheet = [];
                                            for (var f = 0; f < Result[0][i].faceSheetDetailWithAnswers.length; f++) {
                                                if (Result[0][i].faceSheetDetailWithAnswers[f].answer) {
                                                    var answer = Result[0][i].faceSheetDetailWithAnswers[f].answer;
                                                }
                                                else {
                                                    var answer = "Not Applicable";
                                                }
                                                var QandA = Result[0][i].faceSheetDetailWithAnswers[f].question + " - " + answer;
                                                facesheet.push(QandA);
                                            }
                                            Result[0][i].faceSheetDetailWithAnswers = facesheet;
                                        }
                                    }
                                    var cvSearchMasterData = {};
                                    var offerMasterData = {};
                                    if (req.query.isWeb == 0 && Result[6] && Result[6][0] && Result[7] && Result[7][0]) {
                                        cvSearchMasterData = {
                                            skillList: Result[6] ? Result[6] : [],
                                            roles: Result[7] ? Result[7] : [],
                                            industry: Result[8] ? Result[8] : [],
                                            cvSource: Result[9] ? Result[9] : [],
                                            functionalAreas: Result[10] ? Result[10] : [],
                                            nationality: Result[11] ? Result[11] : []

                                        }
                                        offerMasterData = {
                                            currency: Result[2] ? Result[2] : [],
                                            scale: Result[3] ? Result[3] : [],
                                            duration: Result[4] ? Result[4] : [],
                                            attachment: Result[5] ? Result[5] : [],
                                            grade: Result[12] ? Result[12] : [],
                                            designation: Result[7] ? Result[7] : []
                                        }
                                    }

                                    response.data = {
                                        applicantlist: Result[0] && Result[0][0] && Result[0][0].reqApplicantId ? Result[0] : [],
                                        count: Result[1][0].count,
                                        offerMasterData: offerMasterData,
                                        cvSearchMasterData: cvSearchMasterData
                                    };
                                    // console.log(response.data);
                                    res.status(200).json(response);
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Applicants not found";
                                    response.error = null;
                                    response.data = {
                                        applicantlist: [],
                                        count: [],
                                        currency: [],
                                        scale: [],
                                        duration: [],
                                        attachment: []
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

//change stage and status of tagged applicants. only token is mandatory
applicantCtrl.saveApplicantStageStatus = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveApplicantStageStatus'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                var reqApplicants = req.body.reqApplicants;
                                if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }
                                if (!reqApplicants.length) {
                                    reqApplicants = [];
                                    error.token = 'Select applicants';
                                    validationFlag *= false;
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    req.body.notes = (req.body.notes) ? req.body.notes : "";
                                    req.body.stage = (req.body.stage) ? req.body.stage : 0;
                                    req.body.status = (req.body.status) ? req.body.status : 0;
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.reasonId = (req.body.reasonId) ? req.body.reasonId : 0;

                                    var statusParams = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(req.body.stage),
                                        req.st.db.escape(req.body.status),
                                        req.st.db.escape(req.body.notes),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(req.body.reason || {})),
                                        req.st.db.escape(DBSecretKey)
                                    ];

                                    var statusQuery = 'CALL wm_save_reqStageStatus( ' + statusParams.join(',') + ')';
                                    console.log(statusQuery);
                                    req.db.query(statusQuery, function (err, statusResult) {
                                        try {
                                            console.log(err);

                                            if (!err && statusResult && statusResult[0] && statusResult[0][0] && statusResult[0][0].requirementId) {
                                                response.status = true;
                                                response.message = "Requirement positions have been filled";
                                                response.error = null;
                                                response.data = statusResult[1][0] ? statusResult[1][0] : {},
                                                response.data.reqAppList = statusResult[3] && statusResult[3][0] ? statusResult[3] : []
                                                response.data.postionFilledRequirements = statusResult[0] ? statusResult[0] : []

                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else if (!err && statusResult && statusResult[0] && statusResult[0][0]) {


                                                if (statusResult[1] && statusResult[1][0] && statusResult[1][0].count != 0) {
                                                    response.status = false;
                                                    response.message = statusResult[1][0].countMessage;
                                                }
                                                else {
                                                    response.status = true;
                                                    response.message = "Stage and status changed successfully";

                                                }
                                                response.error = null;

                                                // if (typeof (statusResult[0][0].reason) == 'string') {
                                                //     statusResult[0][0].reason = statusResult[0][0].reason && JSON.parse(statusResult[0][0].reason) && JSON.parse(statusResult[0][0].reason) !={} ? JSON.parse(statusResult[0][0].reason) : null;
                                                // }

                                                response.data = statusResult[0][0] ? statusResult[0][0] : {},
                                                    response.data.reqAppList = statusResult[2] && statusResult[2][0] ? statusResult[2] : []

                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else {
                                                response.status = false;
                                                response.message = "Error while changing stage and status";
                                                response.error = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// to load action view of ATS page. reqApplicantId,token, heMasterId is mandatory
applicantCtrl.getreqAppStageStatus = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveApplicant'
    }

    try {

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
                try {
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
                            try {
                                console.log(err);
                                if (!err && statusResult && statusResult[0]) {
                                    response.status = true;
                                    response.message = "Transaction History and current scenario loaded successfully";
                                    response.error = null;

                                    for (var i = 0; i < statusResult[0].length; i++) {
                                        statusResult[0][i].reason = statusResult[0][i] && JSON.parse(statusResult[0][i].reason).reasonId ? JSON.parse(statusResult[0][i].reason) : {}
                                    }

                                    statusResult[1][0].reason = statusResult[1][0] && JSON.parse(statusResult[1][0].reason).reasonId ? JSON.parse(statusResult[1][0].reason) : {}

                                    response.data = {
                                        transactionHistory: statusResult[0] ? statusResult[0] : [],
                                        currentScenario: statusResult[1][0] ? statusResult[1][0] : {}
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "History and current scenario not found";
                                    response.error = null;
                                    response.data = {
                                        transactionHistory: [],
                                        currentScenario: []
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while getting history and scenario";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// resume search .token and heMasterId is mandatory
applicantCtrl.resumeSearch = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.resumeSearch'
    }

    try {
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = 1;
                        if (req.query.isWeb) {
                            if (tokenResult[0] && tokenResult[0].secretKey && tokenResult[0].secretKey != "") {
                                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                            }
                            else {
                                response.message = "Session expired.! Please re-login";
                                res.status(401).json(response);
                                return;
                            }

                            zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                                try {

                                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                    console.log(req.body);

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

                                    var DOB = req.body.DOB;
                                    if (typeof (DOB) == "string") {
                                        DOB = JSON.parse(DOB);
                                    }
                                    if (!DOB) {
                                        DOB = [];
                                    }

                                    if (!validationFlag) {
                                        response.error = error;
                                        response.message = 'Please check the errors';
                                        res.status(400).json(response);
                                        console.log(response);
                                    }
                                    else {
                                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                        req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                                        req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : -1;
                                        req.body.expTo = (req.body.expTo) ? req.body.expTo : -1;
                                        req.body.resumeDaysFreshness = (req.body.resumeDaysFreshness) ? req.body.resumeDaysFreshness : 1;
                                        req.body.currency = (req.body.currency) ? req.body.currency : 0;
                                        req.body.salaryFrom = (req.body.salaryFrom) ? req.body.salaryFrom : 0;
                                        req.body.salaryTo = (req.body.salaryTo) ? req.body.salaryTo : 0;
                                        req.body.salaryScale = (req.body.salaryScale) ? req.body.salaryScale : 0;
                                        req.body.salaryDuration = (req.body.salaryDuration) ? req.body.salaryDuration : 0;
                                        req.body.noticePeriodFrom = (req.body.noticePeriodFrom) ? req.body.noticePeriodFrom : 0;
                                        req.body.noticePeriodTo = (req.body.noticePeriodTo) ? req.body.noticePeriodTo : 0;
                                        req.body.workLocation = (req.body.workLocation) ? req.body.workLocation : '';
                                        req.body.cvRating = req.body.cvRating ? req.body.cvRating : 0;
                                        req.body.cvKeywords = req.body.cvKeywords ? req.body.cvKeywords : '';
                                        req.body.searchResultsLimit = req.body.searchResultsLimit ? req.body.searchResultsLimit : 100;
                                        req.body.includeJd = req.body.includeJd ? req.body.includeJd : 0;

                                        req.body.start = req.body.start ? req.body.start : 1;
                                        req.body.limit = (req.body.limit) ? req.body.limit : 50;

                                        req.body.start = ((((req.body.start) * req.body.limit) + 1) - req.body.limit) - 1;


                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.body.heMasterId),
                                            req.st.db.escape(req.body.parentId),
                                            req.st.db.escape(req.body.searchBy || 1),
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
                                            req.st.db.escape(JSON.stringify(requiredNationalities)),
                                            req.st.db.escape(JSON.stringify(DOB)),
                                            req.st.db.escape(req.body.start),
                                            req.st.db.escape(req.body.limit),
                                            req.st.db.escape(req.body.cvRating),
                                            req.st.db.escape(req.body.searchResultsLimit),
                                            req.st.db.escape(req.body.includeJd),
                                            req.st.db.escape(req.body.applicantId || ""),
                                            req.st.db.escape(req.body.presentSalFrom || 0),
                                            req.st.db.escape(req.body.presentSalTo || 0),
                                            req.st.db.escape(req.body.presentSalScale || 0),
                                            req.st.db.escape(req.body.presentSalDuration || 0),
                                            req.st.db.escape(req.body.presentSalCurrency || 0),
                                            req.st.db.escape(JSON.stringify(req.body.functionalAreas || [])),
                                            req.st.db.escape(JSON.stringify(req.body.cvSource || [])),
                                            req.st.db.escape(JSON.stringify(req.body.cvStatus || [])),
                                            req.st.db.escape(JSON.stringify(req.body.stageResume || [])),
                                            req.st.db.escape(req.body.uploadedUsers || ""),
                                            req.st.db.escape(req.body.from || null),
                                            req.st.db.escape(req.body.to || null),
                                            req.st.db.escape(req.body.customRange || 0)
                                        ];

                                        var procQuery = 'CALL wd_resume_search_newAlgorithm( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);
                                                if (!err && result && result[0]) {
                                                    response.status = true;
                                                    response.message = "Applicants list loaded successfully";
                                                    response.error = null;

                                                    for (var i = 0; i < result[0].length; i++) {
                                                        if (result[0][i] && result[0][i].education) {
                                                            result[0][i].education = JSON.parse(result[0][i].education) ? JSON.parse(result[0][i].education) : [];
                                                        }
                                                        if (result[0][i] && result[0][i].keySkills) {
                                                            result[0][i].keySkills = JSON.parse(result[0][i].keySkills) ? JSON.parse(result[0][i].keySkills) : [];

                                                        }
                                                        if (result[0][i] && result[0][i].location) {
                                                            result[0][i].location = JSON.parse(result[0][i].location) ? JSON.parse(result[0][i].location) : [];
                                                        }
                                                        result[0][i].requirementApplicantCount = result[0][i].requirementApplicantCount ? result[0][i].requirementApplicantCount : 0;
                                                    }
                                                    response.data = {
                                                        applicantList: result[0],
                                                        count: result[1][0].count,
                                                        applicantIdArray: (result[2] && result[2][0] && JSON.parse(result[2][0].applicantIdArray)) ? JSON.parse(result[2][0].applicantIdArray) : []
                                                    };
                                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                    zlib.gzip(buf, function (_, result) {
                                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                        res.status(200).json(response);
                                                    });

                                                }
                                                else if (!err) {
                                                    response.status = true;
                                                    response.message = "Applicants not found";
                                                    response.error = null;
                                                    response.data = {
                                                        applicantList: [],
                                                        count: 0
                                                    };
                                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                    zlib.gzip(buf, function (_, result) {
                                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                        res.status(200).json(response);
                                                    });
                                                }
                                                else {
                                                    response.status = false;
                                                    response.message = "Error while loading applicants list";
                                                    response.error = null;
                                                    console.log(err);
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }

                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });
                        }
                        else {
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

                            var DOB = req.body.DOB;
                            if (typeof (DOB) == "string") {
                                DOB = JSON.parse(DOB);
                            }
                            if (!DOB) {
                                DOB = [];
                            }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : -1;
                                req.body.expTo = (req.body.expTo) ? req.body.expTo : -1;
                                req.body.resumeDaysFreshness = (req.body.resumeDaysFreshness) ? req.body.resumeDaysFreshness : 1;
                                req.body.currency = (req.body.currency) ? req.body.currency : 0;
                                req.body.salaryFrom = (req.body.salaryFrom) ? req.body.salaryFrom : 0;
                                req.body.salaryTo = (req.body.salaryTo) ? req.body.salaryTo : 0;
                                req.body.salaryScale = (req.body.salaryScale) ? req.body.salaryScale : 0;
                                req.body.salaryDuration = (req.body.salaryDuration) ? req.body.salaryDuration : 0;
                                req.body.noticePeriodFrom = (req.body.noticePeriodFrom) ? req.body.noticePeriodFrom : 0;
                                req.body.noticePeriodTo = (req.body.noticePeriodTo) ? req.body.noticePeriodTo : 0;
                                req.body.workLocation = (req.body.workLocation) ? req.body.workLocation : '';
                                req.body.cvRating = req.body.cvRating ? req.body.cvRating : 0;
                                req.body.cvKeywords = req.body.cvKeywords ? req.body.cvKeywords : '';
                                req.body.searchResultsLimit = req.body.searchResultsLimit ? req.body.searchResultsLimit : 100;
                                req.body.includeJd = req.body.includeJd ? req.body.includeJd : 0;

                                req.body.start = req.body.start ? req.body.start : 1;
                                req.body.limit = (req.body.limit) ? req.body.limit : 50;

                                req.body.start = ((((req.body.start) * req.body.limit) + 1) - req.body.limit) - 1;


                                var inputs = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.body.heMasterId),
                                    req.st.db.escape(req.body.parentId),
                                    req.st.db.escape(req.body.searchBy || 1),
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
                                    req.st.db.escape(JSON.stringify(requiredNationalities)),
                                    req.st.db.escape(JSON.stringify(DOB)),
                                    req.st.db.escape(req.body.start),
                                    req.st.db.escape(req.body.limit),
                                    req.st.db.escape(req.body.cvRating),
                                    req.st.db.escape(req.body.searchResultsLimit),
                                    req.st.db.escape(req.body.includeJd),
                                    req.st.db.escape(req.body.applicantId || ""),
                                    req.st.db.escape(req.body.presentSalFrom || 0),
                                    req.st.db.escape(req.body.presentSalTo || 0),
                                    req.st.db.escape(req.body.presentSalScale || 0),
                                    req.st.db.escape(req.body.presentSalDuration || 0),
                                    req.st.db.escape(req.body.presentSalCurrency || 0),
                                    req.st.db.escape(JSON.stringify(req.body.functionalAreas || [])),
                                    req.st.db.escape(JSON.stringify(req.body.cvSource || [])),
                                    req.st.db.escape(JSON.stringify(req.body.cvStatus || [])),
                                    req.st.db.escape(JSON.stringify(req.body.stageResume || [])),
                                    req.st.db.escape(req.body.uploadedUsers || ""),
                                    req.st.db.escape(req.body.from || null),
                                    req.st.db.escape(req.body.to || null),
                                    req.st.db.escape(req.body.customRange || 0)
                                ];

                                var procQuery = 'CALL wd_resume_search_newAlgorithm( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, result) {
                                    try {
                                        console.log(err);
                                        if (!err && result && result[0]) {
                                            response.status = true;
                                            response.message = "Applicants list loaded successfully";
                                            response.error = null;

                                            for (var i = 0; i < result[0].length; i++) {
                                                if (result[0][i] && result[0][i].education) {
                                                    result[0][i].education = JSON.parse(result[0][i].education) ? JSON.parse(result[0][i].education) : [];
                                                }
                                                if (result[0][i] && result[0][i].keySkills) {
                                                    result[0][i].keySkills = JSON.parse(result[0][i].keySkills) ? JSON.parse(result[0][i].keySkills) : [];

                                                }
                                                if (result[0][i] && result[0][i].location) {
                                                    result[0][i].location = JSON.parse(result[0][i].location) ? JSON.parse(result[0][i].location) : [];
                                                }
                                                result[0][i].requirementApplicantCount = result[0][i].requirementApplicantCount ? result[0][i].requirementApplicantCount : 0;
                                            }
                                            response.data = {
                                                applicantList: result[0],
                                                count: result[1][0].count,
                                                applicantIdArray: (result[2] && result[2][0] && JSON.parse(result[2][0].applicantIdArray)) ? JSON.parse(result[2][0].applicantIdArray) : []
                                            };
                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            });

                                        }
                                        else if (!err) {
                                            response.status = true;
                                            response.message = "Applicants not found";
                                            response.error = null;
                                            response.data = {
                                                applicantList: [],
                                                count: 0
                                            };
                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            });
                                        }
                                        else {
                                            response.status = false;
                                            response.message = "Error while loading applicants list";
                                            response.error = null;
                                            console.log(err);
                                            res.status(500).json(response);
                                        }
                                    }
                                    catch (ex) {
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                        }



                    }
                    else {
                        res.status(401).json(response);
                    }

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getrequirementList = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getrequirementList'
    }

    try {


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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.query.applicantId || 0)
                        ];

                        var procQuery = 'CALL wm_get_requirementList( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
                                console.log(err);
                                if (!err && result && result[0] || result[1]) {
                                    response.status = true;
                                    response.message = "Requirement list loaded successfully";
                                    response.error = null;
                                    response.data = {
                                        requirementList: result[0] && result[0][0] ? result[0] : [],
                                        totalDBResumeCount: result[1] && result[1][0] && result[1][0].totalDBResumeCount ? result[1][0].totalDBResumeCount : 0
                                    }
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No results found";
                                    response.error = null;
                                    response.data = {
                                        requirementList: [],
                                        totalDBResumeCount: result[1] && result[1][0] && result[1][0].totalDBResumeCount ? result[1][0].totalDBResumeCount : 0
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while getting requirement List";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

//map the requirement with applicant. token ,heMasterId,requirementId(reqId) is mandatory
applicantCtrl.saveReqAppMapResult = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveReqAppMapResult'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        if (req.query.isWeb) {
                            var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                            zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                                try {
                                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                    if (!req.body.reqId) {
                                        error.requirement = 'Invalid requirement';
                                        validationFlag *= false;
                                    }
                                    var applicant = req.body.applicant;
                                    if (typeof (applicant) == 'string') {
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
                                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                                        var inputs = [
                                            req.st.db.escape(req.query.token),
                                            req.st.db.escape(req.body.reqId),
                                            req.st.db.escape(JSON.stringify(applicant)),
                                            req.st.db.escape(req.query.heMasterId)
                                        ];

                                        var procQuery = 'CALL wm_save_reqAppMap( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);
                                                if (!err && result && result[0] && result[0][0].error) {
                                                    response.status = false;
                                                    response.message = result[0][0].error;
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }
                                                else if (!err && result && result[0]) {
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
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }

                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });
                        }
                        else {
                            if (!req.body.reqId) {
                                error.token = 'Invalid requirement';
                                validationFlag *= false;
                            }
                            var applicant = req.body.applicant;
                            if (typeof (applicant) == 'string') {
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
                                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                                var inputs = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.body.reqId),
                                    req.st.db.escape(JSON.stringify(applicant)),
                                    req.st.db.escape(req.query.heMasterId)
                                ];

                                var procQuery = 'CALL wm_save_reqAppMap( ' + inputs.join(',') + ')';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, result) {
                                    try {
                                        console.log(err);
                                        if (!err && result && result[0] && result[0][0].error) {
                                            response.status = false;
                                            response.message = result[0][0].error;
                                            response.error = null;
                                            response.data = null;
                                            res.status(200).json(response);
                                        }
                                        else if (!err && result && result[0]) {
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
                                    }
                                    catch (ex) {
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                        }

                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

//to get applicant complete details. token,heMasterId,applicantId is mandatory
applicantCtrl.getApplicantDetails = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getApplicantDetails'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.query.reqAppId = req.query.reqAppId ? req.query.reqAppId : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.query.applicantId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.query.reqAppId)
                        ];

                        var procQuery = 'CALL wm_get_applicantDetails( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
                                console.log(err);
                                if (!err && result && result[0] && result[0][0] && result[1]) {
                                    //parsing the result
                                    var temp_result = result[0][0] ? result[0][0] : {};
                                    temp_result.education = JSON.parse(temp_result.education);
                                    temp_result.cvSource = JSON.parse(temp_result.cvSource);
                                    temp_result.cvStatus = JSON.parse(temp_result.cvStatus);
                                    temp_result.expectedSalaryCurr = temp_result.expectedSalaryCurr && JSON.parse(temp_result.expectedSalaryCurr).currencyId ? JSON.parse(temp_result.expectedSalaryCurr) : {};
                                    temp_result.expectedSalaryPeriod = temp_result.expectedSalaryPeriod && JSON.parse(temp_result.expectedSalaryPeriod).durationId ? JSON.parse(temp_result.expectedSalaryPeriod) : {};
                                    temp_result.expectedSalaryScale = temp_result.expectedSalaryScale && JSON.parse(temp_result.expectedSalaryScale).scaleId ? JSON.parse(temp_result.expectedSalaryScale) : {};
                                    temp_result.industry = JSON.parse(temp_result.industry);
                                    temp_result.jobTitle = JSON.parse(temp_result.jobTitle).jobtitleId ? JSON.parse(temp_result.jobTitle) : {};
                                    temp_result.nationality = JSON.parse(temp_result.nationality).nationalityId ? JSON.parse(temp_result.nationality) : {};
                                    temp_result.prefLocations = JSON.parse(temp_result.prefLocations);
                                    temp_result.presentSalaryCurr = temp_result.presentSalaryCurr && JSON.parse(temp_result.presentSalaryCurr).currencyId ? JSON.parse(temp_result.presentSalaryCurr) : {};
                                    temp_result.presentSalaryPeriod = temp_result.presentSalaryPeriod && JSON.parse(temp_result.presentSalaryPeriod).durationId ? JSON.parse(temp_result.presentSalaryPeriod) : {};
                                    temp_result.presentSalaryScale = temp_result.presentSalaryScale && JSON.parse(temp_result.presentSalaryScale).scaleId ? JSON.parse(temp_result.presentSalaryScale) : {};
                                    temp_result.primarySkills = JSON.parse(temp_result.primarySkills);
                                    temp_result.secondarySkills = JSON.parse(temp_result.secondarySkills);
                                    temp_result.functionalAreas = JSON.parse(temp_result.functionalAreas);
                                    temp_result.presentLocation = JSON.parse(temp_result.presentLocation).locationId ? JSON.parse(temp_result.presentLocation) : {};
                                    temp_result.licenseData = JSON.parse(temp_result.licenseData);
                                    temp_result.document_attachments_list = JSON.parse(temp_result.document_attachments_list);
                                    temp_result.employmentHistory = JSON.parse(temp_result.employmentHistory);
                                    temp_result.salutation = JSON.parse(temp_result.salutation);


                                    for (var i = 0; i < result[5].length; i++) {
                                        if (typeof (result[5] && result[5][i] && result[5][i].cc) == 'string') {
                                            result[5][i].cc = JSON.parse(result[5][i].cc)
                                        }
                                        if (typeof (result[5] && result[5][i] && result[5][i].bcc) == 'string') {
                                            result[5][i].bcc = JSON.parse(result[5][i].bcc)
                                        }
                                        if (typeof (result[5] && result[5][i] && result[5][i].attachment) == 'string') {
                                            result[5][i].attachment = JSON.parse(result[5][i].attachment)
                                        }

                                        if (typeof (result[5] && result[5][i] && result[5][i].mailDump) == 'string') {
                                            result[5][i].mailDump = JSON.parse(result[5][i].mailDump)
                                        }

                                    }


                                    for (var i = 0; i < result[6].length; i++) {
                                        result[6][i].followUpNotes = (result[6] && result[6][i]) ? JSON.parse(result[6][i].followUpNotes) : [];
                                    }

                                    response.status = true;
                                    response.message = "Applicant data loaded successfully";
                                    response.error = null;
                                    response.data =
                                        {
                                            applicantDetails: temp_result ? temp_result : {},
                                            applicantTransaction: result[1] ? result[1] : [],
                                            clientCvPath: (result[2] && result[2][0]) ? result[2][0].clientCvPath : "",
                                            previousClientCvPath: (result[3] && result[3][0]) ? result[3][0].previousClientCvPath : "",
                                            faceSheet: (result[4] && result[4][0]) ? JSON.parse(result[4][0].faceSheet) : {},
                                            mailTransactions: result[5] ? result[5] : [],
                                            followUpNotes: result[6] && result[6][0] ? result[6] : []
                                        };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No results found";
                                    response.error = null;
                                    response.data = {
                                        applicantDetails: [],
                                        applicantTransaction: [],
                                        clientCvPath: "",
                                        previousClientCvPath: "",
                                        faceSheet: {},
                                        mailTransactions: [],
                                        followUpNotes: []
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while getting applicant Data";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getApplicantNames = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getApplicantNames'
    }

    try {

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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getInterviewPanel = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getInterviewPanel'
    }

    try {

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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

//to load interview schedule.
applicantCtrl.getInterviewSchedule = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getInterviewSchedule'
    }

    try {


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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// oofer manager save api. token,heMasterId is mandatory
applicantCtrl.saveOfferManager = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveOfferManager'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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

                                var billableCurrency = {};
                                billableCurrency = req.body.billableCurrency;
                                if (typeof (billableCurrency) == "string") {
                                    billableCurrency = JSON.parse(billableCurrency);
                                }
                                if (!billableCurrency) {
                                    billableCurrency = {};
                                }

                                var billableScale = {};
                                billableScale = req.body.billableScale;
                                if (typeof (billableScale) == "string") {
                                    billableScale = JSON.parse(billableScale);
                                }
                                if (!billableScale) {
                                    billableScale = {};
                                }

                                var billableDuration = {};
                                billableDuration = req.body.billableDuration;
                                if (typeof (billableDuration) == "string") {
                                    billableDuration = JSON.parse(billableDuration);
                                }
                                if (!billableDuration) {
                                    billableDuration = {};
                                }

                                var billingCurrency = {};
                                billingCurrency = req.body.billingCurrency;
                                if (typeof (billingCurrency) == "string") {
                                    billingCurrency = JSON.parse(billingCurrency);
                                }
                                if (!billingCurrency) {
                                    billingCurrency = {};
                                }

                                var billingScale = {};
                                billingScale = req.body.billingScale;
                                if (typeof (billingScale) == "string") {
                                    billingScale = JSON.parse(billingScale);
                                }
                                if (!billingScale) {
                                    billingScale = {};
                                }

                                var billingDuration = {};
                                billingDuration = req.body.billingDuration;
                                if (typeof (billingDuration) == "string") {
                                    billingDuration = JSON.parse(billingDuration);
                                }
                                if (!billingDuration) {
                                    billingDuration = {};
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
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.offerManagerId = req.body.offerManagerId ? req.body.offerManagerId : 0;
                                    req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                                    req.body.grossCTCAmount = req.body.grossCTCAmount ? req.body.grossCTCAmount : 0;
                                    req.body.grossCTCCurrency = req.body.grossCTCCurrency ? req.body.grossCTCCurrency : 0;
                                    req.body.grossCTCScale = req.body.grossCTCScale ? req.body.grossCTCScale : 0;
                                    req.body.grossCTCDuration = req.body.grossCTCDuration ? req.body.grossCTCDuration : 0;
                                    req.body.expectedJoining = req.body.expectedJoining ? req.body.expectedJoining : null;
                                    req.body.billableCTCAmount = req.body.billableCTCAmount ? req.body.billableCTCAmount : 0;
                                    req.body.billingCTCAmount = req.body.billingCTCAmount ? req.body.billingCTCAmount : 0;

                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.body.offerManagerId),
                                        req.st.db.escape(req.body.heMasterId),
                                        req.st.db.escape(req.body.heDepartmentId),
                                        req.st.db.escape(req.body.grossCTCAmount),
                                        req.st.db.escape(req.body.grossCTCCurrency),
                                        req.st.db.escape(req.body.grossCTCScale),
                                        req.st.db.escape(req.body.grossCTCDuration),
                                        req.st.db.escape(JSON.stringify(offerAttachment)),
                                        req.st.db.escape(JSON.stringify(reqApp)),
                                        req.st.db.escape(req.body.expectedJoining),
                                        req.st.db.escape(JSON.stringify(documentAttachment)),
                                        req.st.db.escape(JSON.stringify(billableCurrency)),
                                        req.st.db.escape(JSON.stringify(billableScale)),
                                        req.st.db.escape(JSON.stringify(billableDuration)),
                                        req.st.db.escape(req.body.billableCTCAmount),
                                        req.st.db.escape(JSON.stringify(billingCurrency)),
                                        req.st.db.escape(JSON.stringify(billingScale)),
                                        req.st.db.escape(JSON.stringify(billingDuration)),
                                        req.st.db.escape(req.body.billingCTCAmount),
                                        req.st.db.escape(req.body.offerExpiryDate || null),
                                        req.st.db.escape(req.body.noticePeriod || 0),
                                        req.st.db.escape(JSON.stringify(req.body.grade || {})),
                                        req.st.db.escape(req.body.employeeCode || ""),
                                        req.st.db.escape(JSON.stringify(req.body.designation || {}))
                                    ];

                                    var procQuery = 'CALL wm_save_offerManager( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result) {
                                                response.status = true;
                                                response.message = "Offer manager data saved successfully";
                                                response.error = null;
                                                response.data = {
                                                    offerManagerId: result[0][0].offerManagerId,
                                                    reqAppList: (result[1] && result[1][0]) ? result[1] : [],
                                                    transactionHistory: (result[2] && result[2][0]) ? result[2] : []
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });

                                            }
                                            else {
                                                response.status = false;
                                                response.message = "Error while saving offer manager";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }

                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }


                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getOfferManager = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getOfferManager'
    }

    try {

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
                try {
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
                            try {
                                console.log(err);
                                if (!err && result && (result[0] || result[1] || result[2])) {
                                    response.status = true;
                                    response.message = "Offer manager list loaded successfully";
                                    response.error = null;
                                    if (result[0][0].offerManagerId != 0) {
                                        result[0][0].reqAppList = result[0][0].reqAppList ? JSON.parse(result[0][0].reqAppList) : [];
                                        result[0][0].documentAttachment = result[0][0].documentAttachment ? JSON.parse(result[0][0].documentAttachment) : [];
                                        result[0][0].billableCurrency = result[0][0].billableCurrency ? JSON.parse(result[0][0].billableCurrency) : {};
                                        result[0][0].billableScale = result[0][0].billableScale ? JSON.parse(result[0][0].billableScale) : {};
                                        result[0][0].billableDuration = result[0][0].billableDuration ? JSON.parse(result[0][0].billableDuration) : {};
                                        result[0][0].billingCurrency = result[0][0].billingCurrency ? JSON.parse(result[0][0].billingCurrency) : {};
                                        result[0][0].billingScale = result[0][0].billingScale ? JSON.parse(result[0][0].billingScale) : [];
                                        result[0][0].billingDuration = result[0][0].billingDuration ? JSON.parse(result[0][0].billingDuration) : {};
                                        result[0][0].grade = result[0][0] && result[0][0].grade && JSON.parse(result[0][0].grade).gradeId ? JSON.parse(result[0][0].grade) : {};
                                        result[0][0].designation = result[0][0] && result[0][0].designation && JSON.parse(result[0][0].designation).jobtitleId ? JSON.parse(result[0][0].designation) : {};

                                    }

                                    for (var i = 0; i < result[2].length; i++) {
                                        result[2][i].offerBreakUp = result[2][0] && result[2][0] ? JSON.parse(result[2][i].offerBreakUp) : [];
                                    }

                                    response.data = {
                                        offerDetails: result[0] && result[0][0] && result[0][0].offerManagerId ? result[0][0] : {},
                                        offerTemplate: result[1] && result[1][0] ? result[1] : [],
                                        offerBreakUpTemplate: result[2] && result[2][0] ? result[2] : [],
                                        requirementJobTitle: result[3] && result[3][0] ? result[3][0] : {}
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else if (!err) {
                                    response.status = false;
                                    response.message = "No results found";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while getting offer manager";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getInterviewScheduler = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getInterviewScheduler'
    }

    try {

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
                try {
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
                            try {
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
                                        res2.reportingDateTime = result[2][i].reportingDateTime ? result[2][i].reportingDateTime : null;
                                        res2.interviewDuration = result[2][i].interviewDuration ? result[2][i].interviewDuration : 0;
                                        res2.notes = result[2][i].notes ? result[2][i].notes : "";
                                        res2.assessmentTemplateId = result[2][i].assessmentTemplateId ? result[2][i].assessmentTemplateId : 0;
                                        res2.assessmentTitle = result[2][i].title ? result[2][i].title : "";
                                        res2.applicant = JSON.parse(result[2][i].applicant) ? JSON.parse(result[2][i].applicant) : [];
                                        res2.panelMembers = JSON.parse(result[2][i].panelMembers) ? JSON.parse(result[2][i].panelMembers) : [];
                                        res2.address = result[2][i].address ? result[2][i].address : '';
                                        res2.interviewType = JSON.parse(result[2][i].interviewType).interviewModeId ? JSON.parse(result[2][i].interviewType) : {};
                                        res2.branchAddress = JSON.parse(result[2][i].interviewType).branchAddress ? JSON.parse(result[2][i].branchAddress) : {};

                                        output.push(res2);
                                    }
                                    response.data =
                                        {
                                            interviewPanel: result[0] ? result[0] : [],
                                            AssessmentTemplateList: result[1] ? result[1] : [],
                                            interviewScheduler: output[0] ? output[0] : {},
                                            interviewStageRounds: result[3] ? result[3] : [],
                                            assessmentDetail: JSON.stringify(result[4][0].assessment) ? JSON.stringify(result[4][0].assessment) : [],
                                            skillAssessment: JSON.parse(result[5][0].skillAssessment) ? JSON.parse(result[5][0].skillAssessment) : [],
                                            clientLocations: result[6][0] ? result[6] : [],
                                            interviewMailerTemplate: (result[7] && result[7][0]) ? JSON.parse(result[7][0].formDataJson) : [],
                                            branchAddress: (result[8] && result[8][0]) ? result[8][0] : null,
                                            address: result[8][0] && result[8][0].address ? result[8][0].address : "",
                                            clientContacts : result[9] && result[9][0] ?  result[9] : []
                                        };

                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No results found";
                                    response.error = null;
                                    response.data = {
                                        interviewPanel: [],
                                        AssessmentTemplateList: [],
                                        interviewScheduler: [],
                                        interviewStageRounds: [],
                                        assessmentDetail: [],
                                        skillAssessment: [],
                                        clientLocations: {},
                                        interviewMailerTemplate: {},
                                        address: '',
                                        branchLocationList: []

                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }

                                else {
                                    response.status = false;
                                    response.message = "Error while loading interview scheduler Details";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getAssessmentTemplate = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getAssessmentTemplate'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId)
                        ];

                        var procQuery = 'CALL wm_get_assessmentTemplates( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
                                console.log(err);
                                if (!err && result && result[0]) {
                                    response.status = true;
                                    response.message = "Assessment templates loaded successfully";
                                    response.error = null;
                                    response.data =
                                        {
                                            AssessmentTemplateList: result[0]
                                        };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else if (!err) {
                                    response.status = false;
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
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
                            stageStatus: output,
                            knownPeriodList: result[4] ? result[4] : [],
                            relationWithReferral: result[5] ? result[5] : [],
                            companyLocations: result[6] ? result[6] : [],
                            genderList: result[7] ? result[7] : []
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
                            requirementList: [],
                            knownPeriodList: [],
                            relationWithReferral: [],
                            companyLocations: [],
                            genderList: []
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



    var senderGroupId;
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                if (req.query.isWeb = 1) {

                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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

                        var interviewType = req.body.interviewType;
                        if (typeof (interviewType) == "string") {
                            interviewType = JSON.parse(interviewType);
                        }
                        if (!interviewType) {
                            interviewType = {};
                        }

                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
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
                            req.body.address = req.body.address ? req.body.address : '';


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
                                req.st.db.escape(DBSecretKey),
                                req.st.db.escape(req.body.address),
                                req.st.db.escape(JSON.stringify(interviewType)),
                                req.st.db.escape(req.body.branchId || 0),
                                req.st.db.escape(req.body.incrementalAllotment || 0)
                            ];

                            var procQuery = 'CALL wm_save_interviewSchedular_new1( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(err);
                                var isWeb = req.query.isWeb;
                                if (!err && results && results[0]) {
                                    // senderGroupId = results[0][0].senderId;
                                    // notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                    //     senderName: results[0][0].senderName
                                    // });

                                    // for (var i = 0; i < results[1].length; i++) {
                                    //     if (notificationTemplaterRes.parsedTpl) {
                                    //         notification.publish(
                                    //             results[1][i].receiverId,
                                    //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    //             results[0][0].senderId,
                                    //             notificationTemplaterRes.parsedTpl,
                                    //             31,
                                    //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                    //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                    //             0,
                                    //             0,
                                    //             0,
                                    //             0,
                                    //             1,
                                    //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                    //             '',
                                    //             0,
                                    //             0,
                                    //             null,
                                    //             '',
                                    //             /** Data object property to be sent with notification **/
                                    //             {
                                    //                 messageList: {
                                    //                     messageId: results[1][i].messageId,
                                    //                     message: results[1][i].message,
                                    //                     messageLink: results[1][i].messageLink,
                                    //                     createdDate: results[1][i].createdDate,
                                    //                     messageType: results[1][i].messageType,
                                    //                     messageStatus: results[1][i].messageStatus,
                                    //                     priority: results[1][i].priority,
                                    //                     senderName: results[1][i].senderName,
                                    //                     senderId: results[1][i].senderId,
                                    //                     receiverId: results[1][i].receiverId,
                                    //                     groupId: results[1][i].groupId,
                                    //                     groupType: 2,
                                    //                     transId: results[1][i].transId,
                                    //                     formId: results[1][i].formId,
                                    //                     currentStatus: results[1][i].currentStatus,
                                    //                     currentTransId: results[1][i].currentTransId,
                                    //                     parentId: results[1][i].parentId,
                                    //                     accessUserType: results[1][i].accessUserType,
                                    //                     heUserId: results[1][i].heUserId,
                                    //                     formData: JSON.parse(results[1][i].formDataJSON)
                                    //                 }
                                    //             },
                                    //             null,
                                    //             tokenResult[0].isWhatMate,
                                    //             results[1][i].secretKey);
                                    //         console.log('postNotification : notification for compose_message is sent successfully');
                                    //     }
                                    //     else {
                                    //         console.log('Error in parsing notification compose_message template - ',
                                    //             notificationTemplaterRes.error);
                                    //         console.log('postNotification : notification for compose_message is sent successfully');
                                    //     }
                                    // }
                                    if (req.query.isWeb) {
                                        var messageList = [];
                                    }
                                    else {
                                        var output1 = [];
                                        for (var k = 0; k < results.length - 1; k + 2) {
                                            var res2 = {};
                                            res2.messageId = results[k][0].messageId,
                                                res2.message = results[k][0].message,
                                                res2.messageLink = results[k][0].messageLink,
                                                res2.createdDate = results[k][0].createdDate,
                                                res2.messageType = results[k][0].messageType,
                                                res2.messageStatus = results[k][0].messageStatus,
                                                res2.priority = results[k][0].priority,
                                                res2.senderName = results[k][0].senderName,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.senderId = results[k][0].senderId,
                                                res2.receiverId = results[k][0].receiverId,
                                                res2.transId = results[k][0].transId,
                                                res2.formId = results[k][0].formId,
                                                res2.groupId = results[k][0].groupId,
                                                res2.currentStatus = results[k][0].currentStatus,
                                                res2.currentTransId = results[k][0].currentTransId,
                                                res2.localMessageId = results[k][0].localMessageId,
                                                res2.parentId = results[k][0].parentId,
                                                res2.accessUserType = results[k][0].accessUserType,
                                                res2.heUserId = results[k][0].heUserId,
                                                formData = JSON.parse(results[k][0].formDataJSON)
                                            output1.push(res2);
                                        };

                                        var messageList = output1;
                                    }

                                    response.status = true;
                                    response.message = "Interview  is scheduled successfully";
                                    response.error = null;
                                    response.data = {
                                        messageList: messageList,
                                        reqAppList: results[results.length - 2] ? results[results.length - 2] : []
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
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
                    });
                }
                else {
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
                    req.body.address = req.body.address ? req.body.address : '';


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
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.address),
                        req.st.db.escape(JSON.stringify(interviewType))
                    ];

                    var procQuery = 'CALL wm_save_interviewSchedular_new1( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        console.log(err);
                        // console.log(results);
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
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getInterviewApplicantDetailWeb'
    }

    try {

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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
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
                                heDepartment: result[4] ? result[4] : [],
                                skillList: result[5] ? result[5] : [],
                                assessmentOptionList: result[6] && result[6][0] ? result[6] : [],
                                isAddAssessmentEnable: result[6] && result[6][0] && result[6][0].isAddAssessmentEnable ? result[6][0].isAddAssessmentEnable : 0,
                                isAddSkillEnable: result[6] && result[6][0] && result[6][0].isAddSkillEnable ? result[6][0].isAddSkillEnable : 0
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
                            heDepartment: [],
                            skillOptionList: [],
                            isAddAssessmentEnable: 0,
                            isAddSkillEnable: 0

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
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveInterviewSchedulerForApplicant'
    }

    try {
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
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {
                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));
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
                                var skills = req.body.skills;
                                if (typeof (skills) == "string") {
                                    skills = JSON.parse(skills);
                                }
                                if (!skills) {
                                    skills = [];
                                }

                                var senderGroupId;
                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                }
                                else {
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
                                        req.st.db.escape(JSON.stringify(attachmentList)),
                                        req.st.db.escape(JSON.stringify(assessmentTypeList)),
                                        req.st.db.escape(JSON.stringify(skillAssessment)),
                                        req.st.db.escape(JSON.stringify(heDepartment)),
                                        req.st.db.escape(DBSecretKey),
                                        req.st.db.escape(JSON.stringify(skills))
                                    ];

                                    var procQuery = 'CALL wm_save_interviewSchedulerOfOneApplicant( ' + procParams.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, results) {
                                        try {
                                            console.log(err);

                                            var isWeb = req.query.isWeb;
                                            console.log(results);
                                            if (!err && results && results[0]) {
                                                senderGroupId = results[0][0].senderId;
                                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                                //     senderName : results[0][0].message
                                                // });
                                                // console.log("notificationTemplaterRes.parsedTpl",notificationTemplaterRes.parsedTpl) ;
                                                //
                                                // for (var i = 0; i < results[1].length; i++ ) {
                                                //     if (notificationTemplaterRes.parsedTpl) {
                                                //         notification.publish(
                                                //             results[1][i].receiverId,
                                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                //             results[0][0].senderId,
                                                //             notificationTemplaterRes.parsedTpl,
                                                //             31,
                                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                                //             0,
                                                //             0,
                                                //             0,
                                                //             0,
                                                //             1,
                                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                                //             '',
                                                //             0,
                                                //             0,
                                                //             null,
                                                //             '',
                                                //             /** Data object property to be sent with notification **/
                                                //             {
                                                //                 messageList: {
                                                //                     messageId: results[1][i].messageId,
                                                //                     message: results[1][i].message,
                                                //                     messageLink: results[1][i].messageLink,
                                                //                     createdDate: results[1][i].createdDate,
                                                //                     messageType: results[1][i].messageType,
                                                //                     messageStatus: results[1][i].messageStatus,
                                                //                     priority: results[1][i].priority,
                                                //                     senderName: results[1][i].senderName,
                                                //                     senderId: results[1][i].senderId,
                                                //                     receiverId: results[1][i].receiverId,
                                                //                     groupId: results[1][i].senderId,
                                                //                     groupType: 2,
                                                //                     transId : results[1][i].transId,
                                                //                     formId : results[1][i].formId,
                                                //                     currentStatus : results[1][i].currentStatus,
                                                //                     currentTransId : results[1][i].currentTransId,
                                                //                     parentId : results[1][i].parentId,
                                                //                     accessUserType : results[1][i].accessUserType,
                                                //                     heUserId : results[1][i].heUserId,
                                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                                //
                                                //                 }
                                                //             },
                                                //             null,
                                                //             tokenResult[0].isWhatMate,
                                                //             results[1][i].secretKey);
                                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                                //     }
                                                //     else {
                                                //         console.log('Error in parsing notification compose_message template - ',
                                                //             notificationTemplaterRes.error);
                                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                                //     }
                                                // }
                                                notifyMessages.getMessagesNeedToNotify();
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
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });

                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.saveOnBoarding = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveOnBoarding'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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

                                var offerLocation = [];
                                offerLocation = req.body.offerLocation;
                                if (typeof (offerLocation) == "string") {
                                    offerLocation = JSON.parse(offerLocation);
                                }
                                if (!offerLocation) {
                                    offerLocation = [];
                                }

                                var offerCTCCurr = [];
                                offerCTCCurr = req.body.offerCTCCurr;
                                if (typeof (offerCTCCurr) == "string") {
                                    offerCTCCurr = JSON.parse(offerCTCCurr);
                                }
                                if (!offerCTCCurr) {
                                    offerCTCCurr = {};
                                }

                                var offerCTCScale = [];
                                offerCTCScale = req.body.offerCTCScale;
                                if (typeof (offerCTCScale) == "string") {
                                    offerCTCScale = JSON.parse(offerCTCScale);
                                }
                                if (!offerCTCScale) {
                                    offerCTCScale = {};
                                }

                                var offerCTCPeriod = [];
                                offerCTCPeriod = req.body.offerCTCPeriod;
                                if (typeof (offerCTCPeriod) == "string") {
                                    offerCTCPeriod = JSON.parse(offerCTCPeriod);
                                }
                                if (!offerCTCPeriod) {
                                    offerCTCPeriod = {};
                                }

                                var salaryCurr = [];
                                salaryCurr = req.body.salaryCurr;
                                if (typeof (salaryCurr) == "string") {
                                    salaryCurr = JSON.parse(salaryCurr);
                                }
                                if (!salaryCurr) {
                                    salaryCurr = {};
                                }

                                var salaryScale = [];
                                salaryScale = req.body.salaryScale;
                                if (typeof (salaryScale) == "string") {
                                    salaryScale = JSON.parse(salaryScale);
                                }
                                if (!salaryScale) {
                                    salaryScale = {};
                                }

                                var salaryPeriod = [];
                                salaryPeriod = req.body.salaryPeriod;
                                if (typeof (salaryPeriod) == "string") {
                                    salaryPeriod = JSON.parse(salaryPeriod);
                                }
                                if (!salaryPeriod) {
                                    salaryPeriod = {};
                                }

                                var billableCurrency = {};
                                billableCurrency = req.body.billableCurrency;
                                if (typeof (billableCurrency) == "string") {
                                    billableCurrency = JSON.parse(billableCurrency);
                                }
                                if (!billableCurrency) {
                                    billableCurrency = {};
                                }

                                var billableScale = {};
                                billableScale = req.body.billableScale;
                                if (typeof (billableScale) == "string") {
                                    billableScale = JSON.parse(billableScale);
                                }
                                if (!billableScale) {
                                    billableScale = {};
                                }

                                var billableDuration = {};
                                billableDuration = req.body.billableDuration;
                                if (typeof (billableDuration) == "string") {
                                    billableDuration = JSON.parse(billableDuration);
                                }
                                if (!billableDuration) {
                                    billableDuration = {};
                                }


                                var vendorCurrency = {};
                                vendorCurrency = req.body.vendorCurrency;
                                if (typeof (vendorCurrency) == "string") {
                                    vendorCurrency = JSON.parse(vendorCurrency);
                                }
                                if (!vendorCurrency) {
                                    vendorCurrency = {};
                                }

                                var vendorScale = {};
                                vendorScale = req.body.vendorScale;
                                if (typeof (vendorScale) == "string") {
                                    vendorScale = JSON.parse(vendorScale);
                                }
                                if (!vendorScale) {
                                    vendorScale = {};
                                }

                                var vendorDuration = {};
                                vendorDuration = req.body.vendorDuration;
                                if (typeof (vendorDuration) == "string") {
                                    vendorDuration = JSON.parse(vendorDuration);
                                }
                                if (!vendorDuration) {
                                    vendorDuration = {};
                                }

                                var designation = {};
                                designation = req.body.designation;
                                if (typeof (designation) == "string") {
                                    designation = JSON.parse(designation);
                                }
                                if (!designation) {
                                    designation = {};
                                }


                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.onBoardingId = req.body.onBoardingId ? req.body.onBoardingId : 0;
                                    req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                                    req.body.jobTitleId = req.body.jobTitleId ? req.body.jobTitleId : 0;
                                    req.body.jobTitle = req.body.jobTitle ? req.body.jobTitle : '';
                                    req.body.contactId = req.body.contactId ? req.body.contactId : 0;
                                    req.body.managerId = req.body.managerId ? req.body.managerId : 0;
                                    req.body.offerJoiningDate = req.body.offerJoiningDate ? req.body.offerJoiningDate : null;
                                    req.body.plannedJoiningDate = req.body.plannedJoiningDate ? req.body.plannedJoiningDate : null;
                                    req.body.offerCTCCurrId = req.body.offerCTCCurrId ? req.body.offerCTCCurrId : 0;
                                    req.body.offerCTCSalary = req.body.offerCTCSalary ? req.body.offerCTCSalary : 0;
                                    req.body.offerCTCScaleId = req.body.offerCTCScaleId ? req.body.offerCTCScaleId : 0;
                                    req.body.offerCTCPeriodId = req.body.offerCTCPeriodId ? req.body.offerCTCPeriodId : 0;
                                    req.body.salaryCurrId = req.body.salaryCurrId ? req.body.salaryCurrId : 0;
                                    req.body.salaryAmount = req.body.salaryAmount ? req.body.salaryAmount : 0;
                                    req.body.salaryScaleId = req.body.salaryScaleId ? req.body.salaryScaleId : 0;
                                    req.body.salaryPeriodId = req.body.salaryPeriodId ? req.body.salaryPeriodId : 0;
                                    req.body.notes = req.body.notes ? req.body.notes : '';
                                    req.body.workInMentionedShifts = req.body.workInMentionedShifts ? req.body.workInMentionedShifts : 0;
                                    req.body.grade = req.body.grade ? req.body.grade : '';
                                    req.body.actualJoiningDate = req.body.actualJoiningDate ? req.body.actualJoiningDate : null;

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
                                        req.st.db.escape(JSON.stringify(offerCTCCurr)),
                                        req.st.db.escape(req.body.offerCTCSalary),
                                        req.st.db.escape(JSON.stringify(offerCTCScale)),
                                        req.st.db.escape(JSON.stringify(offerCTCPeriod)),
                                        req.st.db.escape(JSON.stringify(salaryCurr)),
                                        req.st.db.escape(req.body.salaryAmount),
                                        req.st.db.escape(JSON.stringify(salaryScale)),
                                        req.st.db.escape(JSON.stringify(salaryPeriod)),
                                        req.st.db.escape(req.body.notes),
                                        req.st.db.escape(req.body.workInMentionedShifts),
                                        req.st.db.escape(JSON.stringify(documentAttachment)),
                                        req.st.db.escape(JSON.stringify(offerLocation)),
                                        req.st.db.escape(req.body.grade),
                                        req.st.db.escape(JSON.stringify(billableCurrency)),
                                        req.st.db.escape(req.body.billableAmount),
                                        req.st.db.escape(JSON.stringify(billableScale)),
                                        req.st.db.escape(JSON.stringify(billableDuration)),
                                        req.st.db.escape(JSON.stringify(designation)),
                                        req.st.db.escape(req.body.empCode),
                                        req.st.db.escape(JSON.stringify(vendorCurrency)),
                                        req.st.db.escape(req.body.vendorAmount),
                                        req.st.db.escape(JSON.stringify(vendorScale)),
                                        req.st.db.escape(JSON.stringify(vendorDuration))
                                    ];

                                    var procQuery = 'CALL wm_save_onBoarding( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result) {
                                                response.status = true;
                                                response.message = "OnBoarding data saved successfully";
                                                response.error = null;
                                                response.data = {
                                                    onBoardingId: (result[0] && result[0][0]) ? result[0][0].onBoardingId : 0,
                                                    reqAppList: (result[1] && result[1][0]) ? result[1] : [],
                                                    transactionHistory: (result[2] && result[2][0]) ? result[2] : []

                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else {
                                                response.status = false;
                                                response.message = "Error while saving onBoarding data";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.getOnBoarding = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getOnBoarding'
    }

    try {


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
                try {
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
                            try {
                                console.log(err);
                                if (!err && result && result[0] && result[0][0]) {
                                    response.status = true;
                                    response.message = "onBoarding details loaded successfully";
                                    response.error = null;

                                    if (result[0][0]) {
                                        result[0][0].documentAttachment = (result && result[0] && result[0][0]) ? JSON.parse(result[0][0].documentAttachment) : [];
                                        result[0][0].offerLocation = (result && result[0] && result[0][0] && JSON.parse(result[0][0].offerLocation).locationId) ? JSON.parse(result[0][0].offerLocation) : [];

                                        result[0][0].offerCTCCurr = (result && result[0] && result[0][0] && JSON.parse(result[0][0].offerCTCCurr).currencyId) ? JSON.parse(result[0][0].offerCTCCurr) : {};
                                        result[0][0].offerCTCScale = (result && result[0] && result[0][0] && JSON.parse(result[0][0].offerCTCScale).scaleId) ? JSON.parse(result[0][0].offerCTCScale) : {};
                                        result[0][0].offerCTCPeriod = (result && result[0] && result[0][0] && JSON.parse(result[0][0].offerCTCPeriod).durationId) ? JSON.parse(result[0][0].offerCTCPeriod) : {};
                                        result[0][0].salaryCurr = (result && result[0] && result[0][0] && JSON.parse(result[0][0].salaryCurr).currencyId) ? JSON.parse(result[0][0].salaryCurr) : {};
                                        result[0][0].salaryScale = (result && result[0] && result[0][0] && JSON.parse(result[0][0].salaryScale).scaleId) ? JSON.parse(result[0][0].salaryScale) : {};
                                        result[0][0].salaryPeriod = (result && result[0] && result[0][0] && JSON.parse(result[0][0].salaryPeriod).durationId) ? JSON.parse(result[0][0].salaryPeriod) : {};

                                        result[0][0].billableCurrency = (result && result[0] && result[0][0] && JSON.parse(result[0][0].billableCurrency).currencyId) ? JSON.parse(result[0][0].billableCurrency) : {};
                                        result[0][0].billableScale = (result && result[0] && result[0][0] && JSON.parse(result[0][0].billableScale).scaleId) ? JSON.parse(result[0][0].billableScale) : {};
                                        result[0][0].billableDuration = (result && result[0] && result[0][0] && JSON.parse(result[0][0].billableDuration).durationId) ? JSON.parse(result[0][0].billableDuration) : {};

                                        result[0][0].vendorCurrency = (result && result[0] && result[0][0] && JSON.parse(result[0][0].vendorCurrency).currencyId) ? JSON.parse(result[0][0].vendorCurrency) : {};
                                        result[0][0].vendorScale = (result && result[0] && result[0][0] && JSON.parse(result[0][0].vendorScale).scaleId) ? JSON.parse(result[0][0].vendorScale) : {};
                                        result[0][0].vendorDuration = (result && result[0] && result[0][0] && JSON.parse(result[0][0].vendorDuration).durationId) ? JSON.parse(result[0][0].vendorDuration) : {};

                                        result[0][0].designation = (result && result[0] && result[0][0] && JSON.parse(result[0][0].designation).roleId) ? JSON.parse(result[0][0].designation) : {};
                                    }

                                    if (result[1][0]) {
                                        result[1][0].offerDate = (result[1] && result[1][0]) ? result[1][0].offerDate : null;
                                        result[1][0].plannedJoiningDate = (result[1] && result[1][0]) ? result[1][0].plannedJoiningDate : null;
                                    }

                                    response.data = {
                                        onBoarding: (result[0] && result[0][0]) ? result[0][0] : {},
                                        offer: (result[1] && result[1][0]) ? result[1][0] : {}
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else if (!err) {
                                    response.status = false;
                                    response.message = "No results found";
                                    response.error = null;
                                    response.data = {
                                        onBoarding: {},
                                        offer: {}
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.saveMedical = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveMedical'
    }

    try {


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
                try {
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
                            try {
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};



applicantCtrl.faceSheetTemplate = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveApplicant'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));


                                if (!req.body.templateName) {
                                    error.templateName = 'Invalid templateName';
                                    validationFlag *= false;
                                }

                                var questions = req.body.questions;
                                if (typeof (questions) == "string") {
                                    questions = JSON.parse(questions);
                                }
                                if (!questions) {
                                    questions = []
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {
                                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                                    req.body.templateId = req.body.templateId ? req.body.templateId : 0;

                                    var inputs = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(req.body.templateId),
                                        req.st.db.escape(req.body.templateName),
                                        req.st.db.escape(JSON.stringify(questions)),
                                        req.st.db.escape(req.body.customFaceSheet || ""),
                                        req.st.db.escape(req.body.isCustomTab || 0)
                                    ];

                                    var procQuery = 'CALL wm_save_paceFacesheetTemplate( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);

                                            if (!err && result && result[0][0]) {
                                                response.status = true;
                                                response.message = "Facesheet Template saved sucessfully";
                                                response.error = null;
                                                response.data = {
                                                    templateId: result[0][0] ? result[0][0].templateId : 0
                                                };

                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });

                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while saving Facesheet";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.faceSheetReplaceDetails = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.faceSheetReplaceDetails'
    }

    try {

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
            response.message = 'Please check the error';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                console.log(req.body);
                                var faceSheet = req.body.faceSheet;
                                if (typeof (faceSheet) == "string") {
                                    faceSheet = JSON.parse(faceSheet);
                                }
                                if (!faceSheet) {
                                    faceSheet = []
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
                                        req.st.db.escape(req.query.applicantId)
                                    ];

                                    var procQuery = 'CALL wm_get_fillFaceSheet( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);

                                            if (!err && result && result[0] && result[0][0]) {
                                                response.status = true;
                                                response.message = "Facesheet Template loaded sucessfully";
                                                response.error = null;
                                                if (faceSheet.questions)
                                                    for (var i = 0; i < faceSheet.questions.length; i++) {
                                                        faceSheet.questions[i].answer = result[0][0][faceSheet.questions[i].type.tagName];
                                                    }
                                                console.log("facesheet custom tags", faceSheet.customTags && faceSheet.customTags.length);
                                                if (faceSheet.customTags && faceSheet.customTags.length) {
                                                    for (var customIndex = 0; customIndex < faceSheet.customTags.length; customIndex++) {
                                                        console.log("resume", result[0][0][faceSheet.customTags[customIndex].tagName]);
                                                        if (result[0][0] && result[0][0][faceSheet.customTags[customIndex].tagName]) {
                                                            faceSheet.customFaceSheet = faceSheet.customFaceSheet.replace('[facesheet.' + faceSheet.customTags[customIndex].tagName + ']', result[0][0][faceSheet.customTags[customIndex].tagName]);
                                                            console.log(faceSheet.customFaceSheet);
                                                        }
                                                    }
                                                }

                                                response.data = {
                                                    faceSheet: faceSheet ? faceSheet : {}
                                                };


                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }

                                            else {
                                                response.status = false;
                                                response.message = "Error while loading Facesheet";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                            }
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.referFriend = function (req, res, next) {
    //console.log('body data',req.body.data);
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
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = {};
                    }
                    var preferredLocation = req.body.preferredLocation;
                    if (typeof (preferredLocation) == "string") {
                        preferredLocation = JSON.parse(preferredLocation);
                    }
                    if (!preferredLocation) {
                        preferredLocation = {};
                    }

                    var senderGroupId;

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.profileSummary = req.body.profileSummary ? req.body.profileSummary : '';
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';


                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            // req.st.db.escape(req.body.jobTitleId),
                            // req.st.db.escape(req.body.jobTitle),
                            req.st.db.escape(req.body.firstName),
                            req.st.db.escape(req.body.lastName),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(req.body.emailId),
                            req.st.db.escape(req.body.knownPeriodId),
                            req.st.db.escape(req.body.relationWithReferalId),
                            req.st.db.escape(req.body.DOB),
                            req.st.db.escape(req.body.gender),
                            //  req.st.db.escape(req.body.referredBy),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(JSON.stringify(preferredLocation)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp)
                        ];

                        var procQuery = 'CALL HE_save_referCV_new1( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                //             0,
                                //             0,
                                //             0,
                                //             0,
                                //             1,
                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                //             '',
                                //             0,
                                //             0,
                                //             null,
                                //             '',
                                //             /** Data object property to be sent with notification **/
                                //             {
                                //                 messageList: {
                                //                     messageId: results[1][i].messageId,
                                //                     message: results[1][i].message,
                                //                     messageLink: results[1][i].messageLink,
                                //                     createdDate: results[1][i].createdDate,
                                //                     messageType: results[1][i].messageType,
                                //                     messageStatus: results[1][i].messageStatus,
                                //                     priority: results[1][i].priority,
                                //                     senderName: results[1][i].senderName,
                                //                     senderId: results[1][i].senderId,
                                //                     receiverId: results[1][i].receiverId,
                                //                     groupId: results[1][i].senderId,
                                //                     groupType: 2,
                                //                     transId : results[1][i].transId,
                                //                     formId : results[1][i].formId,
                                //                     currentStatus : results[1][i].currentStatus,
                                //                     currentTransId : results[1][i].currentTransId,
                                //                     parentId : results[1][i].parentId,
                                //                     accessUserType : results[1][i].accessUserType,
                                //                     heUserId : results[1][i].heUserId,
                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,
                                //             tokenResult[0].isWhatMate,
                                //             results[1][i].secretKey);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                //     else {
                                //         console.log('Error in parsing notification compose_message template - ',
                                //             notificationTemplaterRes.error);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                // }
                                notifyMessages.getMessagesNeedToNotify();
                                response.status = true;
                                response.message = "Referred successfully";
                                response.error = null;
                                response.data = {
                                    messageList: {
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
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while referred";
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


applicantCtrl.saveApplicantForImporter = function (req, res, next) {
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
    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid Company';
        validationFlag *= false;
    }
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
                req.query.isWeb = (req.body.isWeb) ? req.body.isWeb : 0;
                if (attachmentList.length) {
                    cv = attachmentList[0].CDNPath;
                }
                gs_url = req.CONFIG.CONSTANT.GS_URL;
                storage_bucket = req.CONFIG.CONSTANT.STORAGE_BUCKET;

                // console.log(cv);
                attachFile.then(function (resp) {
                    console.log("response after promise", resp);
                    if (1) {

                        //   cvKeywords = text;

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
                        req.body.importerFlag = req.body.importerFlag ? req.body.importerFlag : 1;
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
                            req.st.db.escape(req.body.cvKeywords),
                            req.st.db.escape(req.body.requirementId),
                            req.st.db.escape(req.body.imageUrl),
                            req.st.db.escape(req.body.htmlText),
                            req.st.db.escape(req.body.reqAppId),
                            req.st.db.escape(req.body.clientCvPath),
                            req.st.db.escape(JSON.stringify(functionalAreas)),
                            req.st.db.escape(req.body.importerFlag || 1),
                            req.st.db.escape(JSON.stringify(requirementArray)),
                            req.st.db.escape(req.body.referredBy),
                            req.st.db.escape(JSON.stringify(faceSheet)),
                            req.st.db.escape(JSON.stringify(presentLocation))
                        ];

                        var procQuery = 'CALL wm_save_applicantForImporter( ' + inputs.join(',') + ')';  // call procedure to save requirement data
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

applicantCtrl.resumeSearchResultsByPage = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.resumeSearchResultsByPage'
    }

    try {
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
                try {
                    if ((!err) && tokenResult) {

                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                        req.query.start = req.query.start ? req.query.start : 0;
                        req.query.limit = (req.query.limit) ? req.query.limit : 10;

                        if (req.query.isWeb == 0) {
                            req.query.start = ((((req.query.start) * req.query.limit) + 1) - req.query.limit) - 1;
                        }

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.query.start),
                            req.st.db.escape(req.query.limit)
                        ];

                        var procQuery = 'CALL wm_get_paceResumeSearchResults( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
                                console.log(err);
                                if (!err && result && result[0] && result[0][0]) {
                                    response.status = true;
                                    response.message = "Applicants list loaded successfully";
                                    response.error = null;

                                    for (var i = 0; i < result[0].length; i++) {
                                        if (result[0][i] && result[0][i].education) {
                                            result[0][i].education = JSON.parse(result[0][i].education) ? JSON.parse(result[0][i].education) : [];
                                        }
                                        if (result[0][i] && result[0][i].keySkills) {
                                            result[0][i].keySkills = JSON.parse(result[0][i].keySkills) ? JSON.parse(result[0][i].keySkills) : [];

                                        }
                                        if (result[0][i] && result[0][i].location) {
                                            result[0][i].location = JSON.parse(result[0][i].location) ? JSON.parse(result[0][i].location) : [];
                                        }

                                    }
                                    response.data = {
                                        applicantList: result[0] ? result[0] : [],
                                        count: result[1][0].count
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else if (!err) {
                                    response.status = false;
                                    response.message = "Applicants not found";
                                    response.error = null;
                                    response.data = {
                                        applicantList: [],
                                        count: 0
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
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }

                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getMailerApplicants = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getMailerApplicants'
    }

    try {

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
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));


                                var stageStatusId = req.body.stageStatusId;
                                if (!stageStatusId) {
                                    stageStatusId = [];
                                }
                                else if (typeof (stageStatusId) == "string") {
                                    stageStatusId = JSON.parse(stageStatusId);
                                }

                                var reqApplicants = req.body.reqApp;
                                if (!reqApplicants) {
                                    reqApplicants = [];
                                }
                                else if (typeof (reqApplicants) == "string") {
                                    reqApplicants = JSON.parse(reqApplicants);
                                }

                                if (!validationFlag) {
                                    response.error = error;
                                    response.message = 'Please check the errors';
                                    res.status(400).json(response);
                                    console.log(response);
                                }
                                else {

                                    req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                                    req.body.startPage = (req.body.startPage) ? req.body.startPage : 0;
                                    req.body.limit = (req.body.limit) ? req.body.limit : 100;



                                    var getStatus = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.query.heMasterId),
                                        req.st.db.escape(JSON.stringify(stageStatusId)),
                                        req.st.db.escape(DBSecretKey),
                                        req.st.db.escape(JSON.stringify(reqApplicants)),
                                        req.st.db.escape(req.body.startPage),
                                        req.st.db.escape(req.body.limit),
                                        req.st.db.escape(req.body.type || 1)  // take my self by default
                                    ];

                                    var procQuery = 'CALL wm_get_mailerApplicants( ' + getStatus.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, Result) {
                                        try {
                                            console.log(err);
                                            if (!err && Result && Result[0] && Result[0][0]) {
                                                response.status = true;
                                                response.message = "Applicants loaded successfully";
                                                response.error = null;
                                                var output = [];
                                                for (var i = 0; i < Result[0].length; i++) {
                                                    Result[0][i].clientContacts = Result[0][i] && Result[0][i].clientContacts ? JSON.parse(Result[0][i].clientContacts) : [];
                                                }
                                                response.data = {
                                                    applicantlist: Result[0] ? Result[0] : []
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else if (!err) {
                                                response.status = false;
                                                response.message = "Applicants not found";
                                                response.error = null;
                                                response.data = {
                                                    applicantlist: []
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
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

applicantCtrl.ReqAppMapFromReqView = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.ReqAppMapFromReqView'
    }

    try {

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
            try {
                req.st.validateToken(req.query.token, function (err, tokenResult) {
                    try {
                        if ((!err) && tokenResult) {

                            var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                            zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                                try {
                                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                    var applicants = req.body.applicants;
                                    if (typeof (applicants) == 'string') {
                                        applicants = JSON.parse(applicants);
                                    }
                                    if (!applicants) {
                                        applicants = [];
                                    }

                                    var requirements = req.body.requirements;
                                    if (typeof (requirements) == 'string') {
                                        requirements = JSON.parse(requirements);
                                    }
                                    if (!requirements) {
                                        requirements = [];
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
                                            req.st.db.escape(JSON.stringify(requirements)),
                                            req.st.db.escape(JSON.stringify(applicants))
                                        ];

                                        var procQuery = 'CALL pace_save_reqAppMapFromReqView( ' + inputs.join(',') + ')';
                                        console.log(procQuery);
                                        req.db.query(procQuery, function (err, result) {
                                            try {
                                                console.log(err);
                                                if (!err && result && result[0] && result[0][0].message) {
                                                    response.status = true;
                                                    response.message = result[0][0].message;
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }
                                                else if (!err && result && result[0] && result[0][0]._error) {
                                                    response.status = false;
                                                    response.message = result[0][0]._error;
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(200).json(response);
                                                }

                                                else {
                                                    response.status = false;
                                                    response.message = "Error while tagging applicant";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }

                                }
                                catch (ex) {
                                    error_logger.error = ex;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            });

                        }
                        else {
                            res.status(401).json(response);
                        }

                    }
                    catch (ex) {
                        error_logger.error = ex;
                        logger(req, error_logger);
                        res.status(500).json(error_response);
                    }
                });
            }
            catch (ex) {
                console.log("exception", ex);
                response.message = ex;
                response.status(500).json(response);
            }
        }

    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getPanelMembersForInterviewMailerMobile = function (req, res, next) {
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

    if (!req.query.requirementId) {
        error.requirementId = 'Invalid requirementId';
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
                    req.st.db.escape(req.query.requirementId)
                ];

                var procQuery = 'CALL wm_get_interviewMailerPanelMembersForMobile( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Panel members loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                interviewPanelMembers: result[0]
                            };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            interviewPanelMembers: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading panel members";
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

applicantCtrl.getInterviewPanelMembersForMobile = function (req, res, next) {
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

    if (!req.query.requirementId) {
        error.requirementId = 'Invalid requirementId';
        validationFlag *= false;
    }
    if (!req.query.interviewStageId) {
        error.interviewStageId = 'Invalid interviewStageId';
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

                var procQuery = 'CALL wm_get_interviewPanelMembersForMobile( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Interview Panel members loaded successfully";
                        response.error = null;
                        var output = [];
                        response.data = {
                            interviewPanel: result[0] ? result[0] : []
                        };

                        // if (req.query.isWeb == 0) {
                        //     var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        //     zlib.gzip(buf, function (_, result) {
                        //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        //         res.status(200).json(response);
                        //     });
                        // }
                        // else {
                        res.status(200).json(response);
                        // }
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading interview panel members";
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

applicantCtrl.getRecruiterPerformanceByClientWise = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getRecruiterPerformanceByClientWise'
    }

    try {

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

        // if (!req.query.userMasterId) {
        //     error.userMasterId = 'Invalid userMasterId';
        //     validationFlag *= false;
        // }


        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                if (!req.body.from) {
                                    error.from = 'Invalid from';
                                    validationFlag *= false;
                                }

                                if (!req.body.to) {
                                    error.to = 'Invalid to';
                                    validationFlag *= false;
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
                                        req.st.db.escape(req.body.from),
                                        req.st.db.escape(req.body.to),
                                        req.st.db.escape(JSON.stringify(req.body.userMasterId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.requirementId || [])),
                                        req.st.db.escape(DBSecretKey)

                                    ];

                                    var procQuery = 'CALL pace_get_dashboardRecruiterPerformanceClientView( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result && result[0] && result[0][0]) {
                                                response.status = true;
                                                response.message = "Data loaded successfully";
                                                response.error = null;
                                                response.data = {
                                                    clientWiseData: result[0] ? result[0] : []
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No results found";
                                                response.error = null;
                                                response.data = {
                                                    clientWiseData: []
                                                };
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
                                        }
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }

                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });

                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getRecruiterPerformanceByRequirementWise = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.getRecruiterPerformanceByRequirementWise'
    }

    try {

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

        // if (!req.query.userMasterId) {
        //     error.userMasterId = 'Invalid userMasterId';
        //     validationFlag *= false;
        // }

        // if (!req.query.heDepartmentId) {
        //     error.heDepartmentId = 'Invalid heDepartmentId';
        //     validationFlag *= false;
        // }
        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                if (!req.body.from) {
                                    error.from = 'Invalid from';
                                    validationFlag *= false;
                                }

                                if (!req.body.to) {
                                    error.to = 'Invalid to';
                                    validationFlag *= false;
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
                                        req.st.db.escape(req.body.from),
                                        req.st.db.escape(req.body.to),
                                        req.st.db.escape(JSON.stringify(req.body.userMasterId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.requirementId || [])),
                                        req.st.db.escape(DBSecretKey),
                                        req.st.db.escape(req.body.startPage || 1),
                                        req.st.db.escape(req.body.limit || 20),
                                        req.st.db.escape(req.body.isExport || 0),
                                        req.st.db.escape(req.body.customRange || 0)
                                    ];

                                    var procQuery = 'CALL pace_get_dashboardRecruiterPerformanceRequirementView( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result && result[0] && result[0][0]) {
                                                response.status = true;
                                                response.message = "Data loaded successfully";
                                                response.error = null;
                                                response.data = {
                                                    requirementWiseData: result[0] ? result[0] : [],
                                                    requirementWiseDataForExport: result[1] && result[1][0] ? result[1] : []
                                                };
                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No results found";
                                                response.error = null;
                                                response.data = {
                                                    requirementWiseDataForExport: [],
                                                    requirementWiseData: []
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
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getRecruiterPerformanceReqApplicantData = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'applicantCtrl.saveApplicant'
    }

    try {

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

        // if (!req.query.userMasterId) {
        //     error.userMasterId = 'Invalid userMasterId';
        //     validationFlag *= false;
        // }

        // if (!req.query.heDepartmentId) {
        //     error.heDepartmentId = 'Invalid heDepartmentId';
        //     validationFlag *= false;
        // }

        // if (!req.query.requirementId) {
        //     error.requirementId = 'Invalid requirementId';
        //     validationFlag *= false;
        // }

        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                try {
                    if ((!err) && tokenResult) {

                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            try {
                                req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                                if (!req.body.from) {
                                    error.from = 'Invalid from';
                                    validationFlag *= false;
                                }

                                if (!req.body.to) {
                                    error.to = 'Invalid to';
                                    validationFlag *= false;
                                }

                                if (!req.body.userMasterId.length) {
                                    error.to = 'Invalid userMasterId';
                                    validationFlag *= false;
                                }

                                // if (!req.body.heDepartmentId.length) {
                                //     error.to = 'Invalid heDepartmentId';
                                //     validationFlag *= false;
                                // }
                                // if (!req.body.requirementId.length) {
                                //     error.to = 'Invalid requirementId';
                                //     validationFlag *= false;
                                // }


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
                                        req.st.db.escape(req.body.from),
                                        req.st.db.escape(req.body.to),
                                        req.st.db.escape(JSON.stringify(req.body.userMasterId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                                        req.st.db.escape(JSON.stringify(req.body.requirementId || [])),
                                        req.st.db.escape(DBSecretKey),
                                        req.st.db.escape(req.body.stageId || 0),
                                        req.st.db.escape(req.body.startPage || 1),
                                        req.st.db.escape(req.body.limit || 20),
                                        req.st.db.escape(req.body.isExport || 0),
                                        req.st.db.escape(req.body.customRange || 0)
                                    ];

                                    var procQuery = 'CALL pace_get_dashboardRecruiterPerformanceApplicantView( ' + inputs.join(',') + ')';
                                    console.log(procQuery);
                                    req.db.query(procQuery, function (err, result) {
                                        try {
                                            console.log(err);
                                            if (!err && result && result[0] && result[0][0]) {
                                                response.status = true;
                                                response.message = "Data loaded successfully";
                                                response.error = null;

                                                for (var i = 0; i < result[0].length; i++) {
                                                    result[0][i].clientContacts = result[0][i] && result[0][i].clientContacts && JSON.parse(result[0][i].clientContacts) ? JSON.parse(result[0][i].clientContacts) : [];
                                                }

                                                if (result[2] && result[2][0]) {
                                                    for (var i = 0; i < result[2].length; i++) {
                                                        result[2][i].clientContacts = result[2][i] && result[2][i].clientContacts && JSON.parse(result[2][i].clientContacts) ? JSON.parse(result[2][i].clientContacts) : [];
                                                    }
                                                }

                                                response.data = {
                                                    reqApplicantData: result[0] ? result[0] : [],
                                                    count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0,
                                                    reqApplicantDataForExport: result[2] ? result[2] : [],
                                                    countForExport: result[3] && result[3][0] && result[3][0].count ? result[3][0].count : 0
                                                };

                                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                zlib.gzip(buf, function (_, result) {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                });
                                            }
                                            else if (!err) {
                                                response.status = false;
                                                response.message = "No results found";
                                                response.error = null;
                                                response.data = {
                                                    reqApplicantData: [],
                                                    count: 0,
                                                    reqApplicantDataForExport: [],
                                                    countForExport: 0
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
                                        catch (ex) {
                                            error_logger.error = ex;
                                            logger(req, error_logger);
                                            res.status(500).json(error_response);
                                        }
                                    });
                                }

                            }
                            catch (ex) {
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });


                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


applicantCtrl.getreqApplicantsWithColumnFilter = function (req, res, next) {
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

                var decryptBuf = "";
                if (tokenResult[0] && tokenResult[0].secretKey && tokenResult[0].secretKey != "") {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                }
                else {
                    response.message = "Session expired.! Please re-login";
                    res.status(401).json(response);
                    return;
                }
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    console.log('resultDecrypt', resultDecrypt);
                    if (resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    } else {
                        response.status = false;
                        response.message = "Please refresh page";
                        res.status(500).json(response);
                        return;
                    }

                    var heDepartmentId = req.body.heDepartmentId;
                    if (!heDepartmentId) {
                        heDepartmentId = [];
                    }
                    else if (typeof (heDepartmentId) == "string") {
                        heDepartmentId = JSON.parse(heDepartmentId);
                    }


                    var jobTitleId = req.body.jobTitleId;
                    if (!jobTitleId) {
                        jobTitleId = [];
                    }
                    else if (typeof (jobTitleId) == "string") {
                        jobTitleId = JSON.parse(jobTitleId);
                    }


                    var stageId = req.body.stageId;
                    if (!stageId) {
                        stageId = [];
                    }
                    else if (typeof (stageId) == "string") {
                        stageId = JSON.parse(stageId);
                    }

                    var statusId = req.body.statusId;
                    if (!statusId) {
                        statusId = [];
                    }
                    else if (typeof (statusId) == "string") {
                        statusId = JSON.parse(statusId);
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        // req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                        // req.body.jobTitleId = (req.body.jobTitleId) ? req.body.jobTitleId : [];
                        // req.body.stageId = (req.body.stageId) ? req.body.stageId : [];
                        // req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                        req.body.startPage = (req.body.startPage) ? req.body.startPage : 0;
                        req.body.limit = (req.body.limit) ? req.body.limit : 12;
                        req.body.applicantId = (req.body.applicantId) || (req.body.applicantId == "") ? req.body.applicantId : 0;
                        req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                        req.body.type = (req.body.type) ? req.body.type : 1;
                        req.body.name = (req.body.name) ? req.body.name.trim() : '';
                        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                        if (req.body.name != "") {
                            req.body.name = req.body.name.split(',');
                        }
                        else {
                            req.body.name = [];
                        }

                        var getStatus = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(heDepartmentId)),
                            req.st.db.escape(JSON.stringify(jobTitleId)),
                            // req.st.db.escape(req.query.heDepartmentId),
                            // req.st.db.escape(req.query.jobTitleId),
                            req.st.db.escape(req.body.applicantId),
                            // req.st.db.escape(req.query.stageId),
                            // req.st.db.escape(req.body.statusId),
                            req.st.db.escape(JSON.stringify(stageId)),
                            req.st.db.escape(JSON.stringify(statusId)),
                            req.st.db.escape(req.body.startPage),
                            req.st.db.escape(req.body.limit),
                            req.st.db.escape(req.body.requirementId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(JSON.stringify(req.body.name || [])),
                            req.st.db.escape(req.body.from || null),
                            req.st.db.escape(req.body.to || null),
                            req.st.db.escape(req.body.userMasterId || 0),
                            req.st.db.escape(req.query.isWeb || 0),
                            req.st.db.escape(JSON.stringify(req.body.stageDetail || {})),
                            req.st.db.escape(req.body.applicantName || ""),
                            req.st.db.escape(req.body.emailId || ""),
                            req.st.db.escape(req.body.mobileNumber || ""),
                            req.st.db.escape(req.body.requirementJobTitle || ""),
                            req.st.db.escape(req.body.jobCode || ""),
                            req.st.db.escape(req.body.clientName || ""),
                            req.st.db.escape(req.body.stageName || ""),
                            req.st.db.escape(req.body.statusName || ""),
                            req.st.db.escape(req.body.applicantJobTitle || ""),
                            req.st.db.escape(req.body.employer || ""),
                            req.st.db.escape(req.body.experience || ""),
                            req.st.db.escape(req.body.stageStatusNotes || ""),
                            req.st.db.escape(req.body.cvSource || ""),
                            req.st.db.escape(req.body.primarySkills || ""),
                            req.st.db.escape(req.body.secondarySkills || ""),
                            req.st.db.escape(req.body.presentLocation || ""),
                            req.st.db.escape(req.body.education || ""),
                            req.st.db.escape(req.body.passportNumber || ""),
                            req.st.db.escape(req.body.faceSheet || ""),
                            req.st.db.escape(req.body.cvCreatedUserName || ""),
                            req.st.db.escape(req.body.cvUpdatedUserName || ""),
                            req.st.db.escape(req.body.reqCvCreatedUserName || ""),
                            req.st.db.escape(req.body.reqCvUpdatedUserName || ""),
                            req.st.db.escape(JSON.stringify(req.body.cvCreatedDate || {})),
                            req.st.db.escape(JSON.stringify(req.body.cvUpdatedDate || {})),
                            req.st.db.escape(JSON.stringify(req.body.reqCvCreatedDate || {})),
                            req.st.db.escape(JSON.stringify(req.body.reqCvUpdatedDate || {})),
                            req.st.db.escape(req.body.emigrationCheck || ""),
                            req.st.db.escape(JSON.stringify(req.body.DOB || {})),
                            req.st.db.escape(JSON.stringify(req.body.ppExpiryDate || {})),
                            req.st.db.escape(JSON.stringify(req.body.ppIssueDate || {})),
                            req.st.db.escape(req.body.isExport || 0),
                            req.st.db.escape(req.body.customRange || 0)
                        ];

                        var procQuery = 'CALL wm_get_applicantsWithColumnFilter( ' + getStatus.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, Result) {
                            console.log(err);
                            if (!err && Result && Result[0]) {
                                response.status = true;
                                response.message = "Applicants loaded successfully";
                                response.error = null;
                                if (Result[0] && Result[0][0] && Result[0][0].reqApplicantId) {
                                    for (var i = 0; i < Result[0].length; i++) {
                                        Result[0][i].clientContacts = Result[0][i].clientContacts ? JSON.parse(Result[0][i].clientContacts) : [];
                                        Result[0][i].followUpNotes = Result[0][i].followUpNotes ? JSON.parse(Result[0][i].followUpNotes) : [];

                                        Result[0][i].faceSheetDetailWithAnswers = Result[0][i].faceSheetDetailWithAnswers ? JSON.parse(Result[0][i].faceSheetDetailWithAnswers) : [];

                                        var facesheet = [];
                                        for (var f = 0; f < Result[0][i].faceSheetDetailWithAnswers.length; f++) {
                                            if (Result[0][i].faceSheetDetailWithAnswers[f].answer) {
                                                var answer = Result[0][i].faceSheetDetailWithAnswers[f].answer;
                                            }
                                            else {
                                                var answer = "Not Applicable";
                                            }
                                            var QandA = Result[0][i].faceSheetDetailWithAnswers[f].question + " - " + answer;
                                            facesheet.push(QandA);
                                        }
                                        Result[0][i].faceSheetDetailWithAnswers = facesheet;
                                    }
                                }

                                if (Result[13] && Result[13][0] && Result[13][0].reqApplicantId) {
                                    for (var i = 0; i < Result[13].length; i++) {
                                        Result[13][i].clientContacts = Result[13][i].clientContacts ? JSON.parse(Result[13][i].clientContacts) : [];

                                        Result[13][i].faceSheetDetailWithAnswers = Result[13][i].faceSheetDetailWithAnswers ? JSON.parse(Result[13][i].faceSheetDetailWithAnswers) : [];

                                        var facesheet = [];
                                        for (var f = 0; f < Result[13][i].faceSheetDetailWithAnswers.length; f++) {
                                            if (Result[13][i].faceSheetDetailWithAnswers[f].answer) {
                                                var answer = Result[13][i].faceSheetDetailWithAnswers[f].answer;
                                            }
                                            else {
                                                var answer = "Not Applicable";
                                            }
                                            var QandA = Result[13][i].faceSheetDetailWithAnswers[f].question + " - " + answer;
                                            facesheet.push(QandA);
                                        }
                                        Result[13][i].faceSheetDetailWithAnswers = facesheet;
                                    }
                                }

                                var cvSearchMasterData = {};
                                var offerMasterData = {};
                                if (req.query.isWeb == 0) {
                                    cvSearchMasterData = {
                                        skillList: Result[6] ? Result[6] : [],
                                        roles: Result[7] ? Result[7] : [],
                                        industry: Result[8] ? Result[8] : [],
                                        cvSource: Result[9] ? Result[9] : [],
                                        functionalAreas: Result[10] ? Result[10] : [],
                                        nationality: Result[11] ? Result[11] : []

                                    }
                                    offerMasterData = {
                                        currency: Result[2] ? Result[2] : [],
                                        scale: Result[3] ? Result[3] : [],
                                        duration: Result[4] ? Result[4] : [],
                                        attachment: Result[5] ? Result[5] : [],
                                        grade: Result[12] ? Result[12] : [],
                                        designation: Result[7] ? Result[7] : []
                                    }
                                }



                                response.data = {
                                    applicantlist: Result[0] && Result[0][0] && Result[0][0].reqApplicantId ? Result[0] : [],
                                    count: Result[1] && Result[1][0] ? Result[1][0].count : 0,
                                    offerMasterData: offerMasterData,
                                    cvSearchMasterData: cvSearchMasterData,
                                    applicantlistForExport: Result[13] && Result[13][0] && Result[13][0].reqApplicantId ? Result[13] : []
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else if (!err) {
                                response.status = false;
                                response.message = "Applicants not found";
                                response.error = null;
                                response.data = {
                                    applicantlist: [],
                                    count: [],
                                    currency: [],
                                    scale: [],
                                    duration: [],
                                    attachment: []
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

                });

            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


// token and heMasterId is mandatory
applicantCtrl.paceMasterNew = function (req, res, next) {
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
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL pace_get_paceMaster_new( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        for (var j = 0; j < result[3].length; j++) {
                            result[3][j].specialization = result[3][j].specialization ? JSON.parse(result[3][j].specialization) : [];
                        }

                        response.data = {
                            jobtitle: result[0] ? result[0] : [],
                            industry: result[1] ? result[1] : [],
                            skills: result[2] ? result[2] : [],
                            educationList: result[3] ? result[3] : [],
                            roles: result[4] ? result[4] : [],
                            functionalAreas: result[5] ? result[5] : []
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
                            jobtitle: [],
                            industry: [],
                            skills: [],
                            educationList: [],
                            roles: [],
                            functionalAreas: []
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


applicantCtrl.moveOrCopyTaggedTransactions = function (req, res, next) {
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

                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                if (!req.body.moveOrCopy) {
                    error.moveOrCopy = 'Invalid moveOrCopy';
                    validationFlag *= false;
                }

                if (!req.body.moveOrCopyToReqId.length) {
                    error.moveOrCopyToReqId = 'Invalid moveOrCopyToReqId';
                    validationFlag *= false;
                }

                if (!req.body.reqApp.length) {
                    error.reqApp = 'Invalid reqApp';
                    validationFlag *= false;
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
                        req.st.db.escape(JSON.stringify(req.body.reqApp || [])),
                        req.st.db.escape(req.body.stageId || 0),
                        req.st.db.escape(req.body.statusId || 0),
                        req.st.db.escape(req.body.notes || ""),
                        req.st.db.escape(JSON.stringify(req.body.reason || {})),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.moveOrCopy),
                        req.st.db.escape(JSON.stringify(req.body.moveOrCopyToReqId)),   //send to req id
                        req.st.db.escape(req.body.keepAtCurrentStage || 0)
                    ];

                    var procQuery = 'CALL pace_save_moveCopyReqAppTo( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result && result[0] && result[0][0]) {
                            response.status = true;
                            response.message = "Transaction updated successfully";
                            response.error = null;

                            response.data = {
                                reqAppList: result[0]
                            };

                            // if (req.query.isWeb == 0) {
                            //     var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            //     zlib.gzip(buf, function (_, result) {
                            //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            //     });
                            // }
                            // else {
                            //     res.status(200).json(response);
                            // }

                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "no results found";
                            response.error = null;
                            response.data = {
                                reqAppList: []
                            };
                            // if (req.query.isWeb == 0) {
                            //     var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            //     zlib.gzip(buf, function (_, result) {
                            //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            //     });
                            // }
                            // else {
                            //     res.status(200).json(response);
                            // }
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting update";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

applicantCtrl.paceMailThreads = function (req, res, next) {
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
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL pace_get_userMailSentThreadIds( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Mail threads loaded successfully";
                        response.error = null;
                        response.data = {
                            threads: result[0][0] && result[0][0].threads ? JSON.parse(result[0][0].threads) : []
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


applicantCtrl.savepaceMailThreads = function (req, res, next) {
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
                    req.st.db.escape(req.query.threadId),
                    req.st.db.escape(JSON.stringify(req.body.mailDump))
                ];

                var procQuery = 'CALL pace_save_mailThreadDumpHistory( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Mail data saved successfully";
                        response.error = null;
                        response.data = null;

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
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving data";
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


applicantCtrl.saveCloseRequirements = function (req, res, next) {
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body.requirementList))
                ];

                var procQuery = 'CALL pace_save_closeRequirements( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Requirement closed successfully";
                        response.error = null;
                        response.data = {
                            requirementList: result[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving data";
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