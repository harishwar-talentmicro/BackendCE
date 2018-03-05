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
                    var cv=req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +req.body.cvPath;
                    console.log(cv);
                    http.get(cv, function(fileResponse){
                        var bufs = [];
                    fileResponse.on('data', function(d){ bufs.push(d); });
                    fileResponse.on('end', function() {
                                var buf = Buffer.concat(bufs);
                                textract.fromBufferWithName(cv,buf, function( error, text ) {
                                    if (!error) {
                                        
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
                    req.st.db.escape(JSON.stringify(req.body.expectedSalaryCurr)),
                    req.st.db.escape(req.body.expectedSalary),
                    req.st.db.escape(JSON.stringify(req.body.expectedSalaryScale)),
                    req.st.db.escape(JSON.stringify(req.body.expectedSalaryPeriod)),
                    req.st.db.escape(JSON.stringify(req.body.presentSalaryCurr)),
                    req.st.db.escape(req.body.presentSalary),
                    req.st.db.escape(JSON.stringify(req.body.presentSalaryScale)),
                    req.st.db.escape(JSON.stringify(req.body.presentSalaryPeriod)),
                    req.st.db.escape(JSON.stringify(primarySkills)),
                    req.st.db.escape(JSON.stringify(secondarySkills)),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.cvRating),
                    req.st.db.escape(req.body.cvPath),
                    req.st.db.escape(JSON.stringify(cvSource)),
                    //req.st.db.escape(req.body.cvSourceReference),
                    req.st.db.escape(req.body.gender),
                    req.st.db.escape(req.body.DOB),
                    req.st.db.escape(req.body.originalCvId),
                    req.st.db.escape(req.body.blockingPeriod),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(prefLocations)),
                    req.st.db.escape(JSON.stringify(industry)),
                    req.st.db.escape(JSON.stringify(nationality)),
                    req.st.db.escape(cvKeywords)
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
                        var output=[];
                        for(var i=0; i<result[10].length; i++){
                            var res2={};
                            res2.stageId=result[10][i].stageId,
                            res2.stageName=result[10][i].stageName,
                            res2.status=result[10][i].status ? JSON.parse(result[10][i].status):[];
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
                            stage:output,
                            tags:{
                                candidate : result[11] ? result[11]: [],
                            requirement : result[12] ? result[12]: []
                            }
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
                            stage :[],
                            tags:{
                                candidateTags :[],
                            requirementTags:[]
                        }
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
                            applicantId : result[0][0].applicantId
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
                req.query.limit = (req.query.limit) ? req.query.limit : 0;
                req.query.applicantId = (req.query.applicantId) ? req.query.applicantId : 0;


                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.jobTitleId),
                    req.st.db.escape(req.query.applicantId),

                    req.st.db.escape(req.query.stageId),
                    req.st.db.escape(req.query.statusId),
                    req.st.db.escape(req.query.startPage),
                    req.st.db.escape(req.query.limit)

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
                               res2.requirementId= Result[0][i].requirementId,
                               res2.name= Result[0][i].name,
                                res2.clientName= Result[0][i].clientname,
                                res2.jobCode =Result[0][i].jobCode,
                                res2.jobTitle= Result[0][i].title,
                                res2.stage= Result[0][i].stageTitle,
                                res2.colorCode= Result[0][i].colorCode,                                
                                res2.status= Result[0][i].statusTitle
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
                     console.log(statusResult);

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
 console.log(req);
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
                            currentScenario : statusResult[1][0] ? statusResult[0]:[]
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
                        }                    }
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

                req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                //req.body.functions = (req.body.functions) ? req.body.functions : '';
                //req.body.roles = (JSON.stringify(req.body.roles)) ? (JSON.stringify(req.body.roles)) : '';
                //req.body.industryExpertise = (JSON.stringify(req.body.industryExpertise)) ? (JSON.stringify(req.body.industryExpertise)) : '';
                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                //req.body.locations = (JSON.stringify(req.body.locations)) ? (JSON.stringify(req.body.locations)) : '';
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
                //req.body.requiredNationalities = (JSON.stringify(req.body.requiredNationalities)) ? (JSON.stringify(req.body.requiredNationalities)) : '';



                var inputs = [
                    req.st.db.escape(req.query.token),
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
                        response.data ={
                            applicantList : result[0]
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

                            requirementList:result[0]

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
               // req.query.isWeb=req.query.isWeb ? req.query.isWeb:0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.reqId),
                    req.st.db.escape(JSON.stringify(req.body.applicant))
                    //req.st.db.escape(req.query.heMasterId)

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

module.exports = applicantCtrl;