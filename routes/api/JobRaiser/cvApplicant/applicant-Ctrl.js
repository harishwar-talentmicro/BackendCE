var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var textract = require('textract');
var http = require('https');

var bodyParser =require('body-parser');
//var where=require('node-where');
//var cc = require('currency-codes');
// var countries        = require('country-data').countries,
//     currencies       = require('country-data').currencies,
//     regions          = require('country-data').regions,
//     languages        = require('country-data').languages,
//     callingCountries = require('country-data').callingCountries;

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var applicantCtrl = {};
var error = {};

applicantCtrl.saveApplicant=function(req,res,next){
                var cvKeywords='';
    

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
        error.firstName = 'Please Enter Name';
        validationFlag *= false;
    }
    if (!req.body.emailId) {
        error.emailId = 'EmailId is Mandatory';
        validationFlag *= false;
    }
    // if (!req.body.nationalityId) {
    //     error.nationalityId = 'nationalityId is mandatory';
    //     validationFlag *= false;
    // }

    if (!req.body.mobileNumber) {
        error.mobileNumber = 'Mobile Number is Mandatory';
        validationFlag *= false;
    }
    var education =req.body.education;
    if(typeof(education) == "string") {
        education = JSON.parse(education);
    }
    if(!education){
        education=[];
    }
    var jobTitle =req.body.jobTitle;
    if(typeof(jobTitle) == "string") {
        jobTitle = JSON.parse(jobTitle);
    }
    if(!jobTitle){
        jobTitle={};
    }
    var primarySkills =req.body.primarySkills;
    if(typeof(primarySkills) == "string") {
        primarySkills = JSON.parse(primarySkills);
    }
    if(!primarySkills){
        primarySkills=[];
    }
    var secondarySkills =req.body.secondarySkills;
    if(typeof(secondarySkills) == "string") {
        secondarySkills = JSON.parse(secondarySkills);
    }
    if(!secondarySkills){
        secondarySkills=[];
    }
    var cvSource =req.body.cvSource;
    if(typeof(cvSource) == "string") {
        cvSource = JSON.parse(cvSource);
    }
    if(!cvSource){
        cvSource={};
    }
    var prefLocations =req.body.prefLocations;
    if(typeof(prefLocations) == "string") {
        prefLocations = JSON.parse(prefLocations);
    }
    if(!prefLocations){
        prefLocations=[];
    }
    var industry =req.body.industry;
    if(typeof(industry) == "string") {
        industry = JSON.parse(industry);
    }
    if(!industry){
        industry=[];
    }
    var nationality =req.body.nationality;
    if(typeof(nationality) == "string") {
        nationality = JSON.parse(nationality);
    }
    if(!nationality){
        nationality={};
    }
    var expectedSalaryCurr =req.body.expectedSalaryCurr;
    if(typeof(expectedSalaryCurr) == "string") {
        expectedSalaryCurr = JSON.parse(expectedSalaryCurr);
    }
    if(!expectedSalaryCurr){
        expectedSalaryCurr={};
    }

    var expectedSalaryScale =req.body.expectedSalaryScale;
    if(typeof(expectedSalaryScale) == "string") {
        expectedSalaryScale = JSON.parse(expectedSalaryScale);
    }
    if(!expectedSalaryScale){
        expectedSalaryScale={};
    }
    var expectedSalaryPeriod =req.body.expectedSalaryPeriod;
    if(typeof(expectedSalaryPeriod) == "string") {
        expectedSalaryPeriod = JSON.parse(expectedSalaryPeriod);
    }
    if(!expectedSalaryPeriod){
        expectedSalaryPeriod={};
    }
    var presentSalaryCurr =req.body.presentSalaryCurr;
    if(typeof(presentSalaryCurr) == "string") {
        presentSalaryCurr = JSON.parse(presentSalaryCurr);
    }
    if(!presentSalaryCurr){
        presentSalaryCurr={};
    }
    var presentSalaryScale =req.body.presentSalaryScale;
    if(typeof(presentSalaryScale) == "string") {
        presentSalaryScale = JSON.parse(presentSalaryScale);
    }
    if(!presentSalaryScale){
        presentSalaryScale={};
    }
     var presentSalaryPeriod =req.body.presentSalaryPeriod;
    if(typeof(presentSalaryPeriod) == "string") {
        presentSalaryPeriod = JSON.parse(presentSalaryPeriod);
    }
    if(!presentSalaryPeriod){
        presentSalaryPeriod={};
    }
    // var phoneISD =req.body.phoneISD;
    // if(typeof(phoneISD) == "string") {
    //     phoneISD = JSON.parse(phoneISD);
    // }
    // if(!phoneISD){
    //     phoneISD={};
    // }
    // var mobileISD =req.body.mobileISD;
    // if(typeof(mobileISD) == "string") {
    //     mobileISD = JSON.parse(mobileISD);
    // }
    // if(!mobileISD){
    //     mobileISD={};
    // }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult){
                req.body.cvPath = (req.body.cvPath) ? req.body.cvPath : "";
                req.query.isWeb = (req.body.isWeb) ? req.body.isWeb : 0;

                var cv=req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +req.body.cvPath;
                    console.log(cv);
                    http.get(cv, function(fileResponse){
                        var bufs = [];
                    fileResponse.on('data', function(d){ bufs.push(d); });
                    fileResponse.on('end', function() {
                                var buf = Buffer.concat(bufs);
                                textract.fromBufferWithName(cv,buf, function( error, text ) {
                                    if (1) {
                                        
                                            cvKeywords = text;
                                        
                                        req.body.applicantId = (req.body.applicantId) ? req.body.applicantId : 0;

                req.body.lastName=(req.body.lastName) ? req.body.lastName :"";
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
                req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                req.body.cvPath = (req.body.cvPath) ? req.body.cvPath : "";


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
                    req.st.db.escape(req.body.requirementId)

                ];


                var procQuery = 'CALL wm_save_applicant( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                console.log(procQuery);

                req.db.query(procQuery, function (err, result) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    //console.log(result);

                    if(!err && result && result[0]){

                        response.status = true;
                        response.message = "resume saved successfully";
                        response.error = null;
                        response.data ={
                            applicantId : result[0][0].applicantId
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving resume";
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

applicantCtrl.getApplicantMasterData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId) 
                ];

                var procQuery = 'CALL wm_get_masterData_for_applicant( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        var output1=[];
                        for(var j=0; j<result[14].length; j++){
                            var res1={};
                            res1.educationId=result[14][j].educationId;
                            res1.educationTitle=result[14][j].EducationTitle;
                            res1.specialization=result[14][j].specialization ? JSON.parse(result[14][j].specialization):[];
                            output1.push(res1); 
                        };

                        var output=[];
                        for(var i=0; i<result[10].length; i++){
                            var res2={};
                            res2.stageId=result[10][i].stageId;
                            res2.stageName=result[10][i].stageName;
                            res2.stageTypeId=result[10][i].stageTypeId;
                            res2.stageTypeName=result[10][i].stageTypeName;
                            res2.colorCode=result[10][i].colorCode;                       
                            res2.status=JSON.parse(result[10][i].status) ? JSON.parse(result[10][i].status):[];
                            output.push(res2); 
                        }

                        response.data = {
                            jobType:result[0] ? result[0]:[],
                            currency: result[1] ? result[1]:[],
                            scale: result[2] ? result[2]:[],
                            duration:result[3] ? result[3]:[],
                            country:result[4] ? result[4]:[],
                            jobtitle:result[5] ? result[5]:[],
                            industry:result[6] ? result[6]:[],
                            cvSources:result[7]? result[7]:[],
                            nationList:result[8] ? result[8]:[],
                            skills:result[9] ? result[9]:[],
                            mStageStatus:output,
                            tags:{
                                candidate: result[11],
                                requirement: result[12],
                                client: result[13],
                                general : result[27]
                            },
                            educationList:output1,
                            Stage: result[15] ? result[15]:[],
                            Status:result[16] ? result[16]:[],
                            roles : result[17] ? result[17]:[],
                            interviewRound : result[18] ? result[18]:[],
                            requirementStatus : result[19] ? result[19]:[],
                            department : result[20] ? result[20]:[],
                            client : result[21] ? result[21]:[],
                            requirementJobTitle : result[22] ? result[22]:[],
                            groupType : result[23] ? result[23] :[],
                            mailerType : result[24] ? result[24] : [],
                            userType : result[25] ? result[25] :[],
                            attachment : result[26] ? result[26] :[],
                            grade : result[28] ? result[28] :[]

                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            jobType:[],
                            currency:[],
                            scale: [],
                            duration:[],
                            country:[],
                            jobtitle:[],
                            industry:[],
                            cvSources:[],
                            nationList:[],
                            skills:[],
                            mStageStatus :[],
                            tags:{
                                candidateTags :[],
                            requirementTags:[],
                            client :[],
                            general : []
                            },
                            educationList :[],
                            stage :[],
                            status :[],
                            roles :[],
                            interviewRound : [],
                            requirementStatus : [],
                            department : [],
                            client : [],
                            requirementJobTitle : [],
                            groupType : [],
                            mailerType : [],
                            userType :[],
                            attachment : [],
                            grade :[]
                        };
                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting status";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveReqApplicant=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult){
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                req.body.reqApplicantId = (req.body.reqApplicantId) ? req.body.reqApplicantId : 0;
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                req.body.reasonId = (req.body.reasonId) ? req.body.reasonId : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                   // req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.reqApplicantId),
                    req.st.db.escape(req.body.reqId),
                    req.st.db.escape(req.body.appId),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(req.body.reasonId)

                ];

                var procQuery = 'CALL wm_save_reqApp( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                //console.log(procQuery);

                req.db.query(procQuery, function (err, result) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    //console.log(result);

                    if(!err && result && result[0]){

                        response.status = true;
                        response.message = "requirement applicant saved successfully";
                        response.error = null;
                        response.data ={
                            reqApplicantId : result[0][0].reqApplicantId
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving requirement applicant ";
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


applicantCtrl.getReqApplicantMasterData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_reqAppMaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        var output=[];
                        for(var i=0; i<result[2].length; i++){
                            var res2={};
                            res2.stageId=result[2][i].stageId,
                                res2.stageTitle=result[2][i].title,
                                res2.status=result[2][i].status ? JSON.parse(result[2][i].status):[];
                            output.push(res2);
                        }
                        response.data = {
                            clients:(result && result[0]) ? result[0]:[],
                            jobtitle:(result && result[1]) ? result[1]:[],
                            stageStatus:output
                        };

                            res.status(200).json(response);
                        }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            clients:[],
                            jobtitle:[],
                            stageStatus:[]

                        };

                            res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting status";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getreqApplicants = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };


    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
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
                    req.st.db.escape(req.query.requirementId)

                ];

                var procQuery = 'CALL wm_get_applicants( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,Result){
                    console.log(err);
                    if(!err && Result && Result[0] ){
                        response.status = true;
                        response.message = "Applicants loaded successfully";
                        response.error = null;
                        var output=[];
                        for(var i=0; i<Result[0].length; i++){
                            var res2={};
                            res2.reqApplicantId= Result[0][i].reqAppId,
                               res2.applicantId= Result[0][i].applicantId,
                               res2.createdDate =Result[0][i].createdDate,
                               res2.lastUpdatedDate =Result[0][i].lastUpdatedDate,
                               res2.requirementId= Result[0][i].requirementId,
                               res2.name= Result[0][i].name,
                               res2.emailId= Result[0][i].emailId,                               
                                res2.clientId= Result[0][i].clientId,
                                res2.clientName= Result[0][i].clientname,
                                res2.jobCode =Result[0][i].jobCode,
                                res2.jobTitleId= Result[0][i].jobTitleId,
                                res2.jobTitle= Result[0][i].title,
                                res2.stageId= Result[0][i].stageId,
                                res2.stage= Result[0][i].stageTitle,
                                res2.stageTypeId= Result[0][i].stageTypeId,
                                res2.colorCode= Result[0][i].colorCode,
                                res2.statusId= Result[0][i].statusId,
                                res2.status= Result[0][i].statusTitle,
                                res2.statusTypeId= Result[0][i].statusTypeId,
                                res2.clientContacts= JSON.parse(Result[0][i].clientContacts) ? JSON.parse(Result[0][i].clientContacts) :[]
                                output.push(res2);
                        }

                        response.data = {
                            applicantlist:output,
                            count:Result[1][0].count
                        };

                        
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Applicants not found";
                        response.error = null;
                        response.data = {
                            applicantlist:[],
                            count:[]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading Applicants";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.saveApplicantStageStatus = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    
    var reqApplicants =req.body.reqApplicants;
    if(typeof(reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if(!reqApplicants){
        reqApplicants=[];
    }

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                //req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var statusParams=[
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(req.body.stage),
                    req.st.db.escape(req.body.status),                    
                    req.st.db.escape(req.body.notes)
                ];

                var statusQuery = 'CALL wm_save_reqStageStatus( ' + statusParams.join(',') + ')';
                console.log(statusQuery);

                req.db.query(statusQuery, function (err, statusResult) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'


                    if(!err && statusResult && statusResult[0] ){

                        response.status = true;
                        response.message = "This is the present stage and status";
                        response.error = null;
                        response.data =
                            statusResult[0][0];

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while entering stage and status";
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

applicantCtrl.getreqAppStageStatus = function(req,res,next){
    var isWeb={};
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                 req.query.isWeb = req.query.isWeb ? req.query.isWeb :0;
              
                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.reqApplicantId)
                ];

                var procQuery = 'CALL wm_get_reqStageandStatus( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,statusResult){
                    console.log(err);
                    if(!err && statusResult && statusResult[0] ){
                        response.status = true;
                        response.message = "transaction History and current scenario loaded successfully";
                        response.error = null;
                        response.data = {
                            transactionHistory : statusResult[0] ? statusResult[0]: [],
                            currentScenario : statusResult[1][0] ? statusResult[1][0]:[]
                        };
                        isWeb=req.query.isWeb;
                        if (isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }                    
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "History and current scenario not found";
                        response.error = null;
                        response.data = {
                            transactionHistory :[],
                            currentScenario :[]
                        };
                        if (isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting history and scenario";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};
/*
applicantCtrl.getglobalData=function(req,res,next){
   var ip=req.connection.remoteAddress.split('f:')[1];
    console.log(ip);    
    var countryCode;
    var countryName;
    var currency;
    var currencya;
    where.is('Morocco', function(err, result) {
    if (result) {
         countryCode=result.get('countryCode');    
         countryName=result.get('country');
         currency=countries[countryCode].currencies;
         currencya=currency[0];
         console.log('inside if block');
         console.log(countryCode);
         console.log(countryName);
         console.log(currencya);

var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult){
                 countryCode=countryCode ? countryCode:'';
                 currencya= currencya ? currencya:'';
                 countryName=countryName ? countryName:'';
                var procInputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(countryCode),
                    req.st.db.escape(currencya),
                    req.st.db.escape(countryName)


                ];
                var procQuery = 'CALL wm_get_country_code_currency( ' + procInputs.join(',') + ')';  // call procedure to save requirement data
                console.log(procQuery);

                req.db.query(procQuery, function (err, result) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'

                    if(!err && result && result[0] ){

                        response.status = true;
                        response.message = "countryData is loaded successfully";
                        response.error = null;
                        response.data ={
                            countryData : result[0]
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "countryData cannot be loaded";
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

    }
    });
    console.log('outside if and where');
    console.log(countryCode);
    console.log(countryName);
    console.log(currencya);

    
};

*/
applicantCtrl.resumeSearch=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var roles =req.body.roles;
    if(typeof(roles) == "string") {
        roles = JSON.parse(roles);
    }
    if(!roles){
        roles=[];
    }
    var skills =req.body.skills;
    if(typeof(skills) == "string") {
        skills = JSON.parse(skills);
    }
    if(!skills){
        skills=[];
    }
    var industryExpertise =req.body.industryExpertise;
    if(typeof(industryExpertise) == "string") {
        industryExpertise = JSON.parse(industryExpertise);
    }
    if(!industryExpertise){
        industryExpertise=[];
    }
    var locations =req.body.locations;
    if(typeof(locations) == "string") {
        locations = JSON.parse(locations);
    }
    if(!locations){
        locations=[];
    }
    var education =req.body.education;
    if(typeof(education) == "string") {
        education = JSON.parse(education);
    }
    if(!education){
        education=[];
    }
    var requiredNationalities =req.body.requiredNationalities;
    if(typeof(requiredNationalities) == "string") {
        requiredNationalities = JSON.parse(requiredNationalities);
    }
    if(!requiredNationalities){
        requiredNationalities=[];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult){

                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                //req.body.functions = (req.body.functions) ? req.body.functions : '';
                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                //req.body.searchBy = (req.body.searchBy) ? req.body.searchBy : '';
                req.body.resumeDaysFreshness = (req.body.resumeDaysFreshness) ? req.body.resumeDaysFreshness : 99000;
                //req.body.education = (JSON.stringify(req.body.education)) ? (JSON.stringify(req.body.education)) : '';
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
                    req.st.db.escape (JSON.stringify(education)),
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
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    //console.log(result);

                    if(!err && result && result[0]){

                        response.status = true;
                        response.message = "applicants loaded successfully";
                        response.error = null;

                        var output=[];
                        for(var i=0; i<result[0].length; i++){
                            var res2={};
                            res2.applicantId=result[0][i].applicantId;
                            res2.name=result[0][i].name;
                            res2.emailId=result[0][i].emailId;
                            res2.noticePeriod=result[0][i].noticePeriod;
                            res2.jobTitleId=result[0][i].jobTitleId;
                            res2.jobTitle=result[0][i].jobTitle;
                            res2.experience=result[0][i].experience;                            
                            res2.employer=result[0][i].employer;
                            res2.CTCcurrencyId=result[0][i].CTCcurrencyId;
                            res2.currencySymbol=result[0][i].currencySymbol;
                            res2.CTC=result[0][i].CTC;
                            res2.scaleId=result[0][i].scaleId;
                            res2.scale=result[0][i].scale;
                            res2.durationId=result[0][i].durationId;
                            res2.duration=result[0][i].duration;
                            res2.education=JSON.parse(result[0][i].education) ? JSON.parse(result[0][i].education):[];
                            res2.keySkills=JSON.parse(result[0][i].keySkills) ? JSON.parse(result[0][i].keySkills):[];
                            res2.location=JSON.parse(result[0][i].location) ? JSON.parse(result[0][i].location):[];
                            res2.requirementApplicantCount=result[0][i].requirementApplicantCount ? result[0][i].requirementApplicantCount: 0;
                            output.push(res2); 
                        }
                        response.data ={
                            applicantList : output
                        };
                        res.status(200).json(response);

                    }

                    else if(!err){
                        response.status = true;
                        response.message = "candidates not found";
                        response.error = null;
                        response.data ={
                            applicantList : []
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading applicants ";
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

applicantCtrl.getrequirementList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_requirementList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result){
                        response.status = true;
                        response.message = "requirement data loaded successfully";
                        response.error = null;
                        response.data = {

                            requirementList:result[0] ? result[0] :[]

                        }


                        res.status(200).json(response);


                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  null;

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting data List";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveReqAppMapResult = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
               req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),                    
                    req.st.db.escape(req.body.reqId),
                    req.st.db.escape(JSON.stringify(req.body.applicant)),
                    req.st.db.escape(req.query.heMasterId)

                ];

                var procQuery = 'CALL wm_save_reqAppMap( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]) {
                        response.status = false;
                        response.message = "requirement already mapped to the applicant";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }

                        else if(!err && result){
                            response.status = true;
                            response.message = "requirement applicant map data saved successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }


                    else{
                        response.status = false;
                        response.message = "Error while saving requirement applicant map";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.getApplicantDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.applicantId)

                ];

                var procQuery = 'CALL wm_get_applicantDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] && result[1]){
                        response.status = true;
                        response.message = "applicant data loaded successfully";
                        response.error = null;
                        response.data = 
                        {
                            applicantDetails:JSON.parse(result[0][0].appFormDataJson) ? JSON.parse(result[0][0].appFormDataJson):[],
                            applicantTransaction:result[1]
                        };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            applicantDetails:[],
                            applicantTransaction:[]

                        };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting applicant Data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.getApplicantNames = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.keywords)


                ];

                var procQuery = 'CALL wm_get_applicantName( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "applicant list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                applicantList:result[0] ? result[0]: []
                            };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            applicantList:[]

                        };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting applicant list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getInterviewPanel = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.requirementId),
                    req.st.db.escape(req.query.interviewStageId)

                ];

                var procQuery = 'CALL wm_get_interviewPannel( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "Interview panel list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                interviewPanel: result[0]
                            };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            interviewPannel:[]

                        };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting interviewPanel list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveInterviewScheduler=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
    var applicantList=req.body.applicantList;
    if(typeof(applicantList) == "string"){
        applicantList=JSON.parse(applicantList);
    }
    if(!applicantList){
        applicantList=[];
    }

    var panelMembers=req.body.panelMembers;
    if(typeof(panelMembers) == "string"){
        panelMembers=JSON.parse(panelMembers);
    }
    if(!panelMembers){
        panelMembers=[];
    }

    var assessmentQuestionOptions=req.body.assessmentQuestionOptions;
    if(typeof(assessmentQuestionOptions) == "string"){
        assessmentQuestionOptions=JSON.parse(assessmentQuestionOptions);
    }
    if(!assessmentQuestionOptions){
        assessmentQuestionOptions=[];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult){

                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                req.body.interviewScheduleId=req.body.interviewScheduleId ? req.body.interviewScheduleId:0;
                req.body.heDepartmentId=req.body.heDepartmentId ? req.body.heDepartmentId:0;
                req.body.heParentId=req.body.heParentId ? req.body.heParentId:0;
               // req.body.reqAppTransId=req.body.reqAppTransId ? req.body.reqAppTransId:0;
                req.body.interviewRoundId=req.body.interviewRoundId ? req.body.interviewRoundId:0;
                req.body.reportingDateTime=req.body.reportingDateTime ? req.body.reportingDateTime:null;
                req.body.interviewDuration=req.body.interviewDuration ? req.body.interviewDuration:'';
                req.body.assessmentTemplateId=req.body.assessmentTemplateId ? req.body.assessmentTemplateId:0;
                req.body.assessmentTemplateTitle=req.body.assessmentTemplateTitle ? req.body.assessmentTemplateTitle:'';



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.interviewScheduleId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.heParentId),
                    //req.st.db.escape(req.body.reqAppTransId),
                    req.st.db.escape(req.body.interviewRoundId),
                    req.st.db.escape(req.body.reportingDateTime),
                    req.st.db.escape(req.body.interviewDuration),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(applicantList)),
                    req.st.db.escape(JSON.stringify(panelMembers)),
                    req.st.db.escape(req.body.assessmentTemplateId),
                    req.st.db.escape(req.body.assessmentTemplateTitle),
                    req.st.db.escape(JSON.stringify(assessmentQuestionOptions))

                ];

                var procQuery = 'CALL wm_save_interviewSchdule( ' + inputs.join(',') + ')';  // call procedure to save requirement data
                //console.log(procQuery);

                req.db.query(procQuery, function (err, result) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    //console.log(result);

                    if(!err && result && result[0]){

                        response.status = true;
                        response.message = "interview schedule saved successfully";
                        response.error = null;
                        response.data ={
                            interviewSchedule : result[0][0].interviewScheduleId
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error  while scheduling interview ";
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

applicantCtrl.getInterviewSchedule = function(req,res,next){
   var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heParentId),
                    req.st.db.escape(req.query.interviewScheduleId)

                ];

                var procQuery = 'CALL wm_get_interviewScheduleDropdown( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "interview Schedules loaded successfully";
                        response.error = null;

                        var output=[];
                        for(var i=0; i<result[0].length; i++){
                            var res2={};
                            res2.interviewScheduleTitle=result[0][i].title;
                            res2.name=result[0][i].name;
                            res2.interviewPanelMembers=JSON.parse(result[0][i].interviewPanelMembers) ? JSON.parse(result[0][i].interviewPanelMembers):[];
                            output.push(res2); 
                        }
                        response.data =
                            {
                                interviewSchedule: output 
                            };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                                interviewSchedule: [] 
                            };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading interview schedules";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveOfferManager = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    var documentAttachment=[];
    documentAttachment=req.body.documentAttachment;
    if(typeof(documentAttachment) == "string"){
        documentAttachment=JSON.parse(documentAttachment);
    }
    if(!documentAttachment){
        documentAttachment=[];
    }

    var reqApp=[];
    reqApp=req.body.reqApp;
    if(typeof(reqApp) == "string"){
        reqApp=JSON.parse(reqApp);
    }
    if(!reqApp){
        reqApp=[];
    }

     var offerAttachment=[];
     offerAttachment=req.body.offerAttachment;
    if(typeof(offerAttachment) == "string"){
        offerAttachment=JSON.parse(offerAttachment);
    }
    if(!offerAttachment){
        offerAttachment=[];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

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
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result) {
                        response.status = false;
                        response.message = "offerManager data saved successfully";
                        response.error = null;
                        response.data = {
                            offerManagerId : result[0][0].offerManagerId
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving offerManager";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getOfferManager = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.reqAppId)

                ];

                var procQuery = 'CALL wm_get_offerManager( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "offerManager list loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                grossCTCAmount: result[0][0].grossCTCAmount,
                                grossCTCCurrency: result[0][0].grossCTCCurrency,
                                grossCTCCurrencySymbol: result[0][0].currencySymbol,                                
                                grossCTCScale : result[0][0].grossCTCScale,
                                grossCTCScaleName : result[0][0].scale,
                                grossCTCDuration : result[0][0].grossCTCDuration,
                                grossCTCDurationName : result[0][0].duration,
                                offerAttachment : result[0][0].offerAttachment,
                                reqAppList : JSON.parse(result[0][0].reqAppList) ? JSON.parse(result[0][0].reqAppList) : []
                            };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            offerManager:[]

                        };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting offerManager";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getInterviewScheduler = function(req,res,next){
   var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                req.query.reqApplicantId=req.query.reqApplicantId ? req.query.reqApplicantId:0;
                req.query.interviewStageId=req.query.interviewStageId ? req.query.interviewStageId:0;
                                req.query.applicantId=req.query.applicantId ? req.query.applicantId:0;


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
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "interview Scheduler loaded successfully";
                        response.error = null;

                        var output=[];
                        for(var i=0; i<result[2].length; i++){
                            var res2={};
                            res2.interviewScheduleId=result[2][i].interviewScheduleId;
                            res2.interviewParentId=result[2][i].interviewParentId;

                            res2.heDepartmentId=result[2][i].heDepartmentId;
                            res2.heDepartmentName=result[2][i].heDepartmentName;
                            res2.heParentId=result[2][i].heParentId;
                            res2.interviewRoundId=result[2][i].interviewRoundId;
                            res2.reportingDateTime=result[2][i].reportingDateTime;
                            res2.interviewDuration=result[2][i].interviewDuration;
                            res2.notes=result[2][i].notes;
                            res2.assessmentTemplateId=result[2][i].assessmentTemplateId;
                            res2.assessmentTitle=result[2][i].title;
                            res2.applicant=JSON.parse(result[2][i].applicant) ? JSON.parse(result[2][i].applicant):[];
                            res2.panelMembers=JSON.parse(result[2][i].panelMembers) ? JSON.parse(result[2][i].panelMembers):[];
                            output.push(res2); 
                        }
                        response.data =
                            {   
                                interviewPanel: result[0] ? result[0] :[],
                                AssessmentTemplateList: result[1] ? result[1] : [],
                                interviewScheduler: output[0] ? output[0] : [],
                                interviewStageRounds : result[3] ? result[3] :[],
                                assessmentDetail:JSON.stringify(result[4][0].assessment) ? JSON.stringify(result[4][0].assessment):[],
                                skillAssessment:JSON.parse(result[5][0].skillAssessment) ? JSON.parse(result[5][0].skillAssessment):[]
                            };

                            if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                                interviewPanel: [],
                                AssessmentTemplateList: [],
                                interviewScheduler: [],
                                interviewStageType :[] 
                            };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading interview scheduler Details";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};
applicantCtrl.getAssessmentTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_assessmentTemplates( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "Assessment Templates loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                AssessmentTemplateList: result[0]
                            };

                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            AssessmentTemplateList: []
                        };

                        res.status(200).json(response);

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading Assessment Templates";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.getReferralResumeMaster = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId) 
                ];

                var procQuery = 'CALL wm_get_MasterForResumeReferal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] && result[1]){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        
                        var output=[];
                        for(var i=0; i<result[3].length; i++){
                            var res2={};
                            res2.stageId=result[3][i].stageId;
                            res2.stageName=result[3][i].stageName;
                            res2.stageTypeId=result[3][i].stageTypeId;
                            res2.stageTypeName=result[3][i].stageTypeName;
                            res2.colorCode=result[3][i].colorCode;                       
                            res2.status=JSON.parse(result[3][i].status) ? JSON.parse(result[3][i].status):[];
                            output.push(res2); 
                        }
                        response.data = {
                            country:result[0] ? result[0]:[],
                            skills: result[1] ? result[1]:[],
                            requirementList: result[2] ? result[2]:[],
                            stageStatus:output
                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            country:[],
                            skills:[],
                            requirementList: []
                            };
                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting status";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveInterviewSchedulerNew = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.body.jobTitleId) {
    //     error.jobTitleId = 'Invalid jobTitleId';
    //     validationFlag *= false;
    // }
    // var attachmentList =req.body.attachmentList;
    // if(typeof(attachmentList) == "string") {
    //     attachmentList = JSON.parse(attachmentList);
    // }
    // if(!attachmentList){
    //     attachmentList = [] ;
    // }

    // var assessment =req.body.assessment;
    // if(typeof(assessment) == "string") {
    //     assessment = JSON.parse(assessment);
    // }
    // if(!assessment){
    //     assessment = [] ;
    // }
    var applicantList=req.body.applicantList;
    if(typeof(applicantList) == "string"){
        applicantList=JSON.parse(applicantList);
    }
    if(!applicantList){
        applicantList=[];
    }

    var assessment=req.body.assessment;
    if(typeof(assessment) == "string"){
        assessment=JSON.parse(assessment);
    }
    if(!assessment){
        assessment=[];
    }
    var interviewRound =req.body.interviewRound;
    if(typeof(interviewRound) == "string") {
        interviewRound = JSON.parse(interviewRound);
    }
    if(!interviewRound){
        interviewRound={};
    }

    var panelMembers =req.body.panelMembers;
    if(typeof(panelMembers) == "string") {
        panelMembers = JSON.parse(panelMembers);
    }
    if(!panelMembers){
        error.panelMembers = 'Invalid panels';
        validationFlag *= false;
    }

    var senderGroupId;
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                // req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.notes = req.body.notes ? req.body.notes : "";
                req.body.groupId = req.body.groupId ? req.body.groupId : 0 ;
                // req.body.maxRating = req.body.maxRating ? req.body.maxRating : 0 ;
                // req.body.overallRating = req.body.overallRating ? req.body.overallRating : 0 ;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.requirementId),
                    //req.st.db.escape(req.body.reqAppTransId),
                    req.st.db.escape(JSON.stringify(interviewRound)),
                    req.st.db.escape(req.body.reportingDateTime),
                    req.st.db.escape(req.body.interviewDuration),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(applicantList)),
                    req.st.db.escape(JSON.stringify(panelMembers)),
                    req.st.db.escape(JSON.stringify(assessment)),
                    //req.st.db.escape(req.body.assessmentTemplateTitle),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.status)
                ];

                var procQuery = 'CALL wm_save_interviewSchedular_new1( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(err);
                    console.log(results);
                    var isWeb=req.query.isWeb;
                    if(!err && results && results[0] ){
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++ ) {
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
                                            transId : results[1][i].transId,
                                            formId : results[1][i].formId,
                                            currentStatus : results[1][i].currentStatus,
                                            currentTransId : results[1][i].currentTransId,
                                            parentId : results[1][i].parentId,
                                            accessUserType : results[1][i].accessUserType,
                                            heUserId : results[1][i].heUserId,
                                            formData : JSON.parse(results[1][i].formDataJSON)

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
                        var output1=[];
                        for(var k=0; k<results[0].length; k++){
                            var res2={};
                            res2.messageId = results[0][k].messageId,
                            res2.message =results[0][k].message,
                            res2.messageLink = results[0][k].messageLink,
                            res2.createdDate = results[0][k].createdDate,
                            res2.messageType = results[0][k].messageType,
                            res2.messageStatus = results[0][k].messageStatus,
                            res2.priority = results[0][k].priority,
                            res2.senderName = results[0][k].senderName,
                            res2.senderId = results[0][k].senderId,
                            res2.receiverId = results[0][k].receiverId,
                            res2.transId =results[0][k].transId,
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
                        response.message = "Interview scheduled successfully";
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
                        if(isWeb == 0){
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });  
                        }
                        else{
                           res.status(200).json(response);

                        }       
                    }
                    else{
                        response.status = false;
                        response.message = "Error while interview scheduled";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.getInterviewApplicantList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    // req.st.db.escape(req.query.panelMemberId),
                    // req.st.db.escape(req.query.parentId),
                    req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewApplicantList_new( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "interviewApplicant loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                interviewApplicantList: result[0]
                            };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                           });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            interviewApplicantList: []
                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                           });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading interviewApplicant";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getInterviewApplicantDetail = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.applicantId),
                     req.st.db.escape(req.query.interviewScheduleId)
                    // req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduleApplicantDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "interviewApplicant loaded successfully";
                        response.error = null;
                        var output=[];
                         for(var i=0; i<result[0].length; i++){
                            var res2={};
                             res2.assessment=JSON.parse(result[0][i].groupTypeName) ? JSON.parse(result[0][i].groupTypeName) :[];
                             res2.assessmentQuestionList=JSON.parse(result[0][i].assessmentByGroups) ? JSON.parse(result[0][i].assessmentByGroups) : [];
                                    var output1=[];
                                    for(var j=0; j<res2.assessmentQuestionList.length; j++){
                                        var res3={};
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
                                assessmentList : output,    //.concat(JSON.parse(result[1][0].skillAssessment)),
                                skillAssessment:JSON.parse(result[1][0].skillAssessment),
                                allresult : result[0]
                            // assessmentList : result[0]
                            };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            interviewApplicantList: [],
                            skillAssessment : []
                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading interviewApplicant";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getInterviewApplicantDetailWeb = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.applicantId),
                     req.st.db.escape(req.query.assessmentTemplateId)
                    // req.st.db.escape(req.query.statusId)
                ];

                var procQuery = 'CALL wm_get_interviewScheduleApplicantDetailsWeb( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "interviewApplicant loaded successfully";
                        response.error = null;
                        var output=[];
                         for(var i=0; i<result[0].length; i++){
                            var res2={};
                             res2.assessment=JSON.parse(result[0][i].groupTypeName) ? JSON.parse(result[0][i].groupTypeName) :[];
                             res2.assessmentQuestionList=JSON.parse(result[0][i].assessmentByGroups) ? JSON.parse(result[0][i].assessmentByGroups) : [];
                                    var output1=[];
                                    for(var j=0; j<res2.assessmentQuestionList.length; j++){
                                        var res3={};
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
                                assessmentList : output,    
                                skillAssessment:JSON.parse(result[1][0].skillAssessment)
                           
                            };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            interviewApplicantList: [],
                            skillAssessment : []
                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading interviewApplicant";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.getMasterInterviewScheduler = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)

                ];

                var procQuery = 'CALL wm_get_MasterForInterviewScheduler( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "Interview Master data loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                jobTitle: result[0] ? result[0] :[],
                                // internalDepartment: result[1],
                                // clientDepartment : result[2],
                                assessmentList : result[1] ? result[1] :[],
                                interviewRound : result[2] ? result[2] :[]
                            };

                         if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data =  {
                            jobTitle:[],
                            assessmentList :[],
                            interviewRound:[]

                        };

                        if (req.query.isWeb==0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else{
                            res.status(200).json(response);
                        }

                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting loading Interview Master list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

applicantCtrl.saveInterviewSchedulerForApplicant = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.body.jobTitleId) {
    //     error.jobTitleId = 'Invalid jobTitleId';
    //     validationFlag *= false;
    // }
    // var attachmentList =req.body.attachmentList;
    // if(typeof(attachmentList) == "string") {
    //     attachmentList = JSON.parse(attachmentList);
    // }
    // if(!attachmentList){
    //     attachmentList = [] ;
    // }

    // var assessment =req.body.assessment;
    // if(typeof(assessment) == "string") {
    //     assessment = JSON.parse(assessment);
    // }
    // if(!assessment){
    //     assessment = [] ;
    // }
    // var applicantList=req.body.applicantList;
    // if(typeof(applicantList) == "string"){
    //     applicantList=JSON.parse(applicantList);
    // }
    // if(!applicantList){
    //     applicantList=[];
    // }

    var assessment=req.body.assessment;
    if(typeof(assessment) == "string"){
        assessment=JSON.parse(assessment);
    }
    if(!assessment){
        assessment={};
    }

    var jobTitle=req.body.jobTitle;
    if(typeof(jobTitle) == "string"){
        jobTitle=JSON.parse(jobTitle);
    }
    if(!jobTitle){
        jobTitle={};
    }

    var assessmentTypeList=[];
    assessmentTypeList=req.body.assessmentTypeList;
    if(typeof(assessmentTypeList) == "string"){
        assessmentTypeList=JSON.parse(assessmentTypeList);
    }
    if(!assessmentTypeList){
        assessmentTypeList=[];
    }

    var skillAssessment=[];
    skillAssessment=req.body.skillAssessment;
    if(typeof(skillAssessment) == "string"){
        skillAssessment=JSON.parse(skillAssessment);
    }
    if(!skillAssessment){
        skillAssessment=[];
    }


    var interviewRound =req.body.interviewRound;
    if(typeof(interviewRound) == "string") {
        interviewRound = JSON.parse(interviewRound);
    }
    if(!interviewRound){
        interviewRound={};
    }

    var panelMembers =req.body.panelMembers;
    if(typeof(panelMembers) == "string") {
        panelMembers = JSON.parse(panelMembers);
    }
    if(!panelMembers){
        error.panelMembers = 'Invalid panels';
        validationFlag *= false;
    }

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList=[];
    }

    var senderGroupId;
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                // req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.notes = req.body.notes ? req.body.notes : "";
                // req.body.interviewDate = req.body.interviewDate ? req.body.interviewDate : null ;
                // req.body.maxRating = req.body.maxRating ? req.body.maxRating : 0 ;
                // req.body.overallRating = req.body.overallRating ? req.body.overallRating : 0 ;
                req.body.interviewDuration  = req.body.interviewDuration  ? req.body.interviewDuration  : 0;
                req.body.mobileISD  = req.body.mobileISD  ? req.body.mobileISD  : '';
                req.body.mobileNumber  = req.body.mobileNumber  ? req.body.mobileNumber  : '';
                
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.parentId),
                    // req.st.db.escape(req.body.requirementId),
                    //req.st.db.escape(req.body.reqAppTransId),
                    req.st.db.escape(JSON.stringify(interviewRound)),
                    req.st.db.escape(req.body.reportingDateTime),
                    req.st.db.escape(req.body.interviewDuration),
                    req.st.db.escape(req.body.notes),
                    // req.st.db.escape(JSON.stringify(applicantList)),
                    req.st.db.escape(JSON.stringify(panelMembers)),
                    req.st.db.escape(JSON.stringify(assessment)),
                    //req.st.db.escape(req.body.assessmentTemplateTitle),
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
                    req.st.db.escape(JSON.stringify(skillAssessment))
                ];

                var procQuery = 'CALL wm_save_interviewSchedulerOfOneApplicant( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(err);
                    console.log(results,'tfytgyuhukjghj');  // check output on console.
                    var isWeb=req.query.isWeb;
                    if(!err && results && results[0] ){
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });
                         // parsing the result[0][0]th formdata above
                        var formData =JSON.parse(results[0][0].formDataJSON);
                         var resultData={};
                                    resultData.heMasterId = formData.heMasterId;
                                    resultData.interviewRound = formData.interviewRound;
                                    resultData.reportingDateTime = formData.reportingDateTime;
                                    resultData.interviewDuration = formData.interviewDuration;
                                    resultData.transId = formData.transId;
                                    resultData.parentId = formData.parentId;
                                    if (typeof(formData.panelMembers)=="string"){
                                        resultData.panelMembers = JSON.parse(formData.panelMembers) ? JSON.parse(formData.panelMembers) : [];
                                    }
                                    else{
                                        resultData.panelMembers = JSON.parse(JSON.stringify(formData.panelMembers)) ? JSON.parse(JSON.stringify(formData.panelMembers)) : [];
                                    }
                                    //resultData.panelMembers = JSON.parse(JSON.stringify(formData.panelMembers)) ? JSON.parse(JSON.stringify(formData.panelMembers)) : [];
                                    resultData.applicantId = formData.applicantId;
                                    resultData.firstName = formData.firstName;
                                    resultData.lastName = formData.lastName;
                                    resultData.mobileISD = formData.mobileISD;
                                    resultData.mobileNumber = formData.mobileNumber;
                                    resultData.emailId = formData.emailId;
                                    resultData.jobTitle = formData.jobTitle ? formData.jobTitle :{} ;
                                    resultData.profilePicture = formData.profilePicture;
                                    resultData.attachmentList = formData.attachmentList ? formData.attachmentList : [];
                                    resultData.assessment = formData.assessment ? formData.assessment :{};
                                    if(typeof(formData.assessmentTypeList)=="string"){
                                        resultData.assessmentTypeList = JSON.parse(formData.assessmentTypeList) ? JSON.parse(formData.assessmentTypeList) :[];
                                    }
                                    else{
                                        resultData.assessmentTypeList = JSON.parse(JSON.stringify(formData.assessmentTypeList)) ? JSON.parse(JSON.stringify(formData.assessmentTypeList)) :[];
                                    }
                                    // resultData.assessmentTypeList = JSON.parse(JSON.stringify(formData.assessmentTypeList)) ? JSON.parse(JSON.stringify(formData.assessmentTypeList)) :[];
                                     if(typeof(formData.skillAssessment)=="string"){
                                        resultData.skillAssessment = JSON.parse(formData.skillAssessment) ? JSON.parse(formData.skillAssessment) :[];
                                    }
                                    else{
                                        resultData.skillAssessment = JSON.parse(JSON.stringify(formData.skillAssessment)) ? JSON.parse(JSON.stringify(formData.skillAssessment)) :[];
                                    }
                                    //resultData.skillAssessment = JSON.parse(JSON.stringify(formData.skillAssessment)) ? JSON.parse(JSON.stringify(formData.skillAssessment)) : {};
                                    resultData.senderNotes = formData.senderNotes;
                                    resultData.status = formData.status;
                                    resultData.notes = formData.notes;
                                    resultData.approverNotes = formData.approverNotes;
                                    resultData.receiverNotes = formData.receiverNotes;
                                    resultData.groupId = formData.groupId;
                                    resultData.learnMessageId = formData.learnMessageId;
                                    // resultData.accessUserType = formData.accessUserType;
                                    resultData.approverCount = formData.approverCount;
                                    resultData.receiverCount = formData.receiverCount;

                                    var output2=[]; 
                                    // var temporaryData = JSON.parse(JSON.stringify(resultData));                                   
                                    for(var l=0; l<resultData.assessmentTypeList.length; l++){  //assessment type list
                                        var res3={};
                                        res3.assessmentTypeId =resultData.assessmentTypeList[l].assessmentTypeId;
                                        res3.assessmentTypeName=resultData.assessmentTypeList[l].assessmentTypeName;
                                        if(typeof(resultData.assessmentTypeList[l].assessment)=="string"){
                                            res3.assessment=JSON.parse(resultData.assessmentTypeList[l].assessment) ? JSON.parse(resultData.assessmentTypeList[l].assessment) :[];    
                                        }
                                        else{
                                            res3.assessment=JSON.parse(JSON.stringify(resultData.assessmentTypeList[l].assessment)) ? JSON.parse(JSON.stringify(resultData.assessmentTypeList[l].assessment)) :[];     
                                        }
                                        // res3.assessment=JSON.parse(JSON.stringify(resultData.assessmentTypeList[l].assessment)) ? JSON.parse(JSON.stringify(resultData.assessmentTypeList[l].assessment)) :[];
                                       // res3.assessmentQuestionList=JSON.parse(resultData.assessmentTypeList[l].assessmentQuestionList) ? JSON.parse(resultData.assessmentTypeList[l].assessmentQuestionList) :[] ;
                                                var output3=[];
                                                for(var m=0; m<res3.assessment.length; m++){    //assessment question list
                                                    var res4={};
                                                    res4.groupTypeId=res3.assessment[m].groupTypeId;
                                                    res4.groupTypeName=res3.assessment[m].groupTypeName;
                                                    res4.questionId=res3.assessment[m].questionId;
                                                    res4.questionWeightage=res3.assessment[m].questionWeightage;
                                                    if(typeof(res3.assessment[m].options)=="string"){
                                                        res4.options=JSON.parse(res3.assessment[m].options) ? JSON.parse(res3.assessment[m].options) :[] ;    
                                                    }
                                                    else{
                                                        res4.options=JSON.parse(JSON.stringify(res3.assessment[m].options)) ? JSON.parse(JSON.stringify(res3.assessment[m].options)) :[] ;
                                                    }
                                                    // res4.options=JSON.parse(JSON.stringify(res3.assessment[m].options)) ? JSON.parse(JSON.stringify(res3.assessment[m].options)) :[] ;
                                                    if(typeof(res3.assessment[m].selectedOption)=="string"){
                                                        res4.selectedOption= JSON.parse(res3.assessment[m].selectedOption) ? JSON.parse(res3.assessment[m].selectedOption) :{} ;
                                                    }
                                                    else{
                                                        res4.selectedOption= JSON.parse(JSON.stringify(res3.assessment[m].selectedOption)) ? JSON.parse(JSON.stringify(res3.assessment[m].selectedOption)) :{} ;
                                                    }
                                                    // res4.selectedOption= JSON.parse(JSON.stringify(res3.assessment[m].selectedOption)) ? JSON.parse(JSON.stringify(res3.assessment[m].selectedOption)) :{} ;
                                                    res4.comment=res3.assessment[m].comment ? res3.assessment[m].comment :"";
                                                    output3.push(res4);   
                                                    if(m > 100){
                                                        console.log('returning from m');
                                                        return;
                                                    }
                                                }
                                        res3.assessment=output3;
                                        output2.push(res3);
                                        if(l > 100){
                                            console.log('return from l');
                                            return;
                                        }
                                    }
                                    resultData.assessmentTypeList=output2;
                                    formData=resultData;
                                    console.log(formData,'formData');
                                    console.log(resultData,'resultData');
                                   return; 
                        // parsing the result[1][i]th formData below
                        for (var i = 0; i < results[1].length; i++ ) {         // main line 

                                var parsejson=JSON.parse(results[1][i].formDataJSON);
                                var mainJson={};
                                    mainJson.transId = parsejson.transId;
                                    mainJson.parentId = parsejson.parentId;
                                    mainJson.heMasterId = parsejson.heMasterId;
                                    mainJson.interviewRound = parsejson.interviewRound;
                                    mainJson.reportingDateTime = parsejson.reportingDateTime;
                                    mainJson.interviewDuration = parsejson.interviewDuration;
                                    if (typeof(parsejson.panelMembers) =="string"){
                                        mainJson.panelMembers=JSON.parse(parsejson.panelMembers) ? JSON.parse(parsejson.panelMembers): [];    
                                    }
                                    else{
                                        mainJson.panelMembers = JSON.parse(JSON.stringify(parsejson.panelMembers)) ? JSON.parse(JSON.stringify(parsejson.panelMembers)) : [];   
                                    }
                                    //mainJson.panelMembers = JSON.parse(JSON.stringify(parsejson.panelMembers)) ? JSON.parse(JSON.stringify(parsejson.panelMembers)) : [];
                                    mainJson.applicantId = parsejson.applicantId;
                                    mainJson.firstName = parsejson.firstName;
                                    mainJson.lastName = parsejson.lastName;
                                    mainJson.mobileISD = parsejson.mobileISD;
                                    mainJson.mobileNumber = parsejson.mobileNumber;
                                    mainJson.emailId = parsejson.emailId;
                                    mainJson.jobTitle = parsejson.jobTitle ? parsejson.jobTitle :{} ;
                                    mainJson.profilePicture = parsejson.profilePicture;
                                    mainJson.attachmentList = parsejson.attachmentList ? parsejson.attachmentList : [];
                                    mainJson.assessment = parsejson.assessment ? parsejson.assessment :{};
                                    if(typeof(parsejson.assessmentTypeList)=="string"){
                                         mainJson.assessmentTypeList = JSON.parse(parsejson.assessmentTypeList) ? JSON.parse(parsejson.assessmentTypeList) :[];     
                                    }
                                    else{
                                        mainJson.assessmentTypeList= JSON.parse(JSON.stringify(parsejson.assessmentTypeList)) ? JSON.parse(JSON.stringify(parsejson.assessmentTypeList)) :[];   
                                    }
                                    //mainJson.assessmentTypeList = JSON.parse(JSON.stringify(parsejson.assessmentTypeList)) ? JSON.parse(JSON.stringify(parsejson.assessmentTypeList)) :[];
                                    
                                    if(typeof(parsejson.skillAssessment)=="string"){
                                         mainJson.skillAssessment = JSON.parse(parsejson.skillAssessment) ? JSON.parse(parsejson.skillAssessment) :[];     
                                    }
                                    else{
                                        mainJson.skillAssessment= JSON.parse(JSON.stringify(parsejson.skillAssessment)) ? JSON.parse(JSON.stringify(parsejson.skillAssessment)) :[];   
                                    }
                                    //mainJson.skillAssessment = JSON.parse(JSON.stringify(parsejson.skillAssessment)) ? JSON.parse(JSON.stringify(parsejson.skillAssessment)) : {};
                                    mainJson.senderNotes = parsejson.senderNotes;
                                    mainJson.status = parsejson.status;
                                    mainJson.notes = parsejson.notes;
                                    mainJson.approverNotes = parsejson.approverNotes;
                                    mainJson.receiverNotes = parsejson.receiverNotes;
                                    mainJson.groupId = parsejson.groupId;
                                    mainJson.learnMessageId = parsejson.learnMessageId;
                                    // mainJson.accessUserType = parsejson.accessUserType;
                                    mainJson.approverCount = parsejson.approverCount;
                                    mainJson.receiverCount = parsejson.receiverCount;

                                    var output=[];                                    
                                    for(var k=0; k<mainJson.assessmentTypeList.length; k++){
                                        var res1={};
                                        res1.assessmentTypeId= mainJson.assessmentTypeList[k].assessmentTypeId;
                                        res1.assessmentTypeName= mainJson.assessmentTypeList[k].assessmentTypeName;
                                        if(typeof(mainJson.assessmentTypeList[k].assessment)=="string"){
                                            res1.assessment=JSON.parse(mainJson.assessmentTypeList[k].assessment) ? JSON.parse(mainJson.assessmentTypeList[k].assessment) :[];
                                        }
                                        else{
                                            res1.assessment=JSON.parse(JSON.stringify(mainJson.assessmentTypeList[k].assessment)) ? JSON.parse(JSON.stringify(mainJson.assessmentTypeList[k].assessment)) :[];    
                                        }
                                        //res1.assessment=JSON.parse(JSON.stringify(mainJson.assessmentTypeList[k].assessment)) ? JSON.parse(JSON.stringify(mainJson.assessmentTypeList[k].assessment)) :[];
                                       
                                        //res1.assessmentQuestionList= JSON.parse(mainJson.assessmentTypeList[k].assessmentQuestionList) ? JSON.parse(mainJson.assessmentTypeList[k].assessmentQuestionList) :[] ;
                                                var outputInside=[];
                                                for(var h=0;h<res1.assessment.length ; h++){
                                                    var res2={};
                                                    res2.groupTypeId=res1.assessment[h].groupTypeId;
                                                    res2.groupTypeName=res1.assessment[h].groupTypeName;
                                                    res2.questionId=res1.assessment[h].questionId;
                                                    res2.questionWeightage=res1.assessment[h].questionWeightage;
                                                    if(typeof(res1.assessment[h].options)=="string"){
                                                        res2.options=JSON.parse(res1.assessment[h].options) ? JSON.parse(res1.assessment[h].options) :[] ;
                                                    }
                                                    else{
                                                        res2.options=JSON.parse(JSON.stringify(res1.assessment[h].options)) ? JSON.parse(JSON.stringify(res1.assessment[h].options)) :[] ;
                                                    }
                                                    //res2.options=JSON.parse(JSON.stringify(res1.assessment[h].options)) ? JSON.parse(JSON.stringify(res1.assessment[h].options)) :[] ;
                                                    if(typeof(res1.assessment[h].selectedOption)=="string"){
                                                        res2.selectedOption= JSON.parse(res1.assessment[h].selectedOption) ? JSON.parse(res1.assessment[h].selectedOption) :{} ;    
                                                    }
                                                    else{
                                                        res2.selectedOption= JSON.parse(JSON.stringify(res1.assessment[h].selectedOption)) ? JSON.parse(JSON.stringify(res1.assessment[h].selectedOption)) :{} ;
                                                    }
                                                    // res2.selectedOption= JSON.parse(res1.assessment[h].selectedOption) ? JSON.parse(res1.assessment[h].selectedOption) :{} ;
                                                    res2.comment=res1.assessment[h].comment ? res1.assessment[h].comment :"";
                                                    outputInside.push(res2);
                                                }
                                        res1.assessment=outputInside;
                                        output.push(res1);
                                    }
                                    mainJson.assessmentTypeList=output;
                                    parsejson=mainJson;

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
                                            transId : results[1][i].transId,
                                            formId : results[1][i].formId,
                                            currentStatus : results[1][i].currentStatus,
                                            currentTransId : results[1][i].currentTransId,
                                            parentId : results[1][i].parentId,
                                            accessUserType : results[1][i].accessUserType,
                                            heUserId : results[1][i].heUserId,
                                            formData : parsejson
                                           
                                            //formData : JSON.parse(results[1][i].formDataJSON)


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
                                transId : results[0][0].transId,
                                formId : results[0][0].formId,
                                groupId: req.body.groupId,
                                currentStatus : results[0][0].currentStatus,
                                currentTransId : results[0][0].currentTransId,
                                localMessageId : req.body.localMessageId,
                                parentId : results[0][0].parentId,
                                accessUserType : results[0][0].accessUserType,
                                heUserId : results[0][0].heUserId,
                                formData : formData //JSON.parse(results[0][0].formDataJSON)
                            }

                        };
                        if(isWeb == 0){
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });  
                        }
                        else{
                           res.status(200).json(response);

                        }       
                    }
                    else{
                        response.status = false;
                        response.message = "Error while interview scheduled";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


applicantCtrl.saveOnBoarding = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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

    var documentAttachment=[];
    documentAttachment=req.body.documentAttachment;
    if(typeof(documentAttachment) == "string"){
        documentAttachment=JSON.parse(documentAttachment);
    }
    if(!documentAttachment){
        documentAttachment=[];
    }

    var applicant=[];
    applicant=req.body.applicant;
    if(typeof(applicant) == "string"){
        applicant=JSON.parse(applicant);
    }
    if(!applicant){
        applicant=[];
    }

    

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {
                req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;
                req.body.onBoardingId = req.body.onBoardingId ? req.body.onBoardingId :0;
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId :0;
                req.body.jobTitleId = req.body.jobTitleId ? req.body.jobTitleId :0;
                req.body.jobTitle = req.body.jobTitle ? req.body.jobTitle :'';
                req.body.contactId = req.body.contactId ? req.body.contactId :0;
                req.body.managerId = req.body.managerId ? req.body.managerId :0;
                req.body.offerJoiningDate = req.body.offerJoiningDate ? req.body.offerJoiningDate :'';
                req.body.plannedJoiningDate = req.body.plannedJoiningDate ? req.body.plannedJoiningDate :'';
                req.body.offerCTCCurrId = req.body.offerCTCCurrId ? req.body.offerCTCCurrId :0;
                req.body.offerCTCSalary = req.body.offerCTCSalary ? req.body.offerCTCSalary :0;
                req.body.offerCTCScaleId = req.body.offerCTCScaleId ? req.body.offerCTCScaleId :0;
                req.body.offerCTCPeriodId = req.body.offerCTCPeriodId ? req.body.offerCTCPeriodId :0;
                req.body.salaryCurrId = req.body.salaryCurrId ? req.body.salaryCurrId :0;
                req.body.salarySalary = req.body.salarySalary ? req.body.salarySalary :0;
                req.body.salaryScaleId = req.body.salaryScaleId ? req.body.salaryScaleId :0;
                req.body.salaryPeriodId = req.body.salaryPeriodId ? req.body.salaryPeriodId :0;
                req.body.notes = req.body.notes ? req.body.notes :'';
                req.body.workInMentionedShifts = req.body.workInMentionedShifts ? req.body.workInMentionedShifts :0;
               
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
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result) {
                        response.status = false;
                        response.message = "onBoarding data saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving onBoarding";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

module.exports = applicantCtrl;