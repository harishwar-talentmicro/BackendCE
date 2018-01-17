/**
 * Created by vedha on 12-12-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser =require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

var jobCtrl = {};
var error = {};

jobCtrl.saveJobDefaults = function(req,res,next){
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.body.tid = (req.body.defId) ? req.body.defId : 0;
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;
                req.body.purpose = (req.body.purpose) ? req.body.purpose : 0;
                req.body.jobType = (req.body.jobType) ? req.body.jobType :0;
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 1;
                req.body.scaleId = (req.body.scaleId) ? req.body.scaleId : 0;
                req.body.durationId = (req.body.durationId) ? req.body.durationId : 1;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.defId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.purpose),
                    req.st.db.escape(req.body.jobType),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.scaleId),
                    req.st.db.escape(req.body.durationId),
                    req.st.db.escape(JSON.stringify(req.body.clients))
                ];
                var procQuery = 'CALL WM_save_1010Defaults( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if(!err && results[0]){
                        response.status = true;
                        response.message = "Requirement default saved successfully";
                        response.data ={
                            defaultId : results[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving form default";
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

jobCtrl.saveJob = function(req,res,next){
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

    if (!req.body.purpose) {
        error.purpose = 'select a purpose';
        validationFlag *= false;
    }
    // console.log(req.body.clientId,"req.body.clientId");
    if (!req.body.clientId) {
        error.clientId = 'Invalid client';
        validationFlag *= false;
    }
    if (!req.body.contactList) {
        error.contactList = 'Invalid contacts';
        validationFlag *= false;
    }

    if (!req.body.jobTitle) {
        error.jobTitle = 'Invalid jobTitle';
        validationFlag *= false;
    }
    if (!req.body.jobCode) {
        error.jobCode = 'Invalid jobCode';
        validationFlag *= false;
    }
    if (!req.body.positions) {
        error.positions = 'Positions is not specified';
        validationFlag *= false;
    }
    if (!req.body.jobTypeId) {
        error.jobTypeId = 'Invalid jobType';
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

                req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                req.body.purpose = (req.body.purpose) ? req.body.purpose : 0;

                req.body.jobDescription=(req.body.jobDescription) ? req.body.jobDescription :"";
                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                req.body.targetDate = (req.body.targetDate) ? req.body.targetDate : null;
                req.body.primarySkills = (req.body.primarySkills) ? req.body.primarySkills : "";
                req.body.secondarySkills = (req.body.secondarySkills) ? req.body.secondarySkills : "";
                req.body.educationId = (req.body.educationId) ? req.body.educationId : 0;
                req.body.keywords = (req.body.keywords) ? req.body.keywords : "";

                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                req.body.minSalary = (req.body.minSalary) ? req.body.minSalary : 0;
                req.body.maxSalary = (req.body.maxSalary) ? req.body.maxSalary : 0;
                req.body.scaleId = (req.body.scaleId) ? req.body.scaleId : 0;
                req.body.frequencyId = (req.body.frequencyId) ? req.body.frequencyId : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tenId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(req.body.purpose),
                    req.st.db.escape(req.body.clientId),
                    req.st.db.escape(JSON.stringify(req.body.contactList)),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.jobCode),
                    req.st.db.escape(req.body.positions),
                    req.st.db.escape(req.body.jobTypeId),
                    req.st.db.escape(req.body.jobDescription),
                    req.st.db.escape(req.body.expFrom),
                    req.st.db.escape(req.body.expTo),
                    req.st.db.escape(req.body.targetDate),
                    req.st.db.escape(req.body.primarySkills),
                    req.st.db.escape(req.body.secondarySkills),
                    req.st.db.escape(req.body.educationId),
                    req.st.db.escape(req.body.keywords),

                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.minSalary),
                    req.st.db.escape(req.body.maxSalary),
                    req.st.db.escape(req.body.scaleId),
                    req.st.db.escape(req.body.frequencyId),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(req.body.members)),     // members json with contains roles for diff members
                    req.st.db.escape(JSON.stringify(req.body.locations)),
                    req.st.db.escape(JSON.stringify(req.body.membersInterviewRound))

                ];


                var procQuery = 'CALL wm_save_requirement( ' + procParams.join(',') + ')';  // call procedure to save requirement data
                console.log(procQuery);

                req.db.query(procQuery, function (err, requirementResult) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    console.log(requirementResult);

                    if(!err && requirementResult && requirementResult[0] && requirementResult[0][0] ){

                        response.status = true;
                        response.message = "Requirement saved successfully";
                        response.error = null;
                        response.data ={
                            requirementId : requirementResult[0][0].requirementId
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving requirement template";
                        response.error = null;
                        //response.data = {
                        //   requirementId : req.body.requirementId+' is not present to update'
                        //};
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

jobCtrl.saveJobStatus = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.body.heParentId) {
        error.heParentId = 'invalid parentId';
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
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";

                var statusParams=[
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heParentId),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes)
                ];

                var statusQuery = 'CALL wm_save_requirement_status( ' + statusParams.join(',') + ')';
                console.log(statusQuery);

                req.db.query(statusQuery, function (err, statusResult) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                     console.log(statusResult);

                    if(!err && statusResult && statusResult[0] && statusResult[0][0] ){

                        response.status = true;
                        response.message = "This is the present status";
                        response.error = null;
                        response.data =
                            statusResult[0][0];

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while entering status";
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

jobCtrl.getJobStatus = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if ((!err) && tokenResult) {

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heParentId)
                ];

                var procQuery = 'CALL wm_get_requirement_status( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,statusResult){
                    console.log(err);
                    if(!err && statusResult && statusResult[0] && statusResult[0][0] ){
                        response.status = true;
                        response.message = "status loaded successfully";
                        response.error = null;
                        response.data = statusResult[0];
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "status not found";
                        response.error = null;
                        response.data = null;
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

jobCtrl.getJobDefaultMemberList = function(req,res,next){
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
    console.log(req.query.purpose,"req.query.purpose");
    if (!req.query.purpose) {
        error.purpose = 'Invalid purpose';
        validationFlag *= false;
    }
    
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
               req.query.heDepartmentId = (req.query.hedepartmentId) ? req.query.heDepartmentId : 0;
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.defId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.purpose)

                    // req.st.db.escape(JSON.stringify(req.body.clients))
                ];
                var procQuery = 'CALL WM_get_defMemberList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, memberList) {
                    console.log(err);

                    if(!err && memberList[0]){
                        response.status = true;
                        response.message = "Requirement default member list is";
                        response.error = null;
                        response.data = {
                            memberList:memberList[0]

                        }
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "memberList not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting default member list ";
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

jobCtrl.getJobDefaults = function(req,res,next){
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.query.defId = (req.query.defId) ? req.query.defId : 0;                
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.defId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId)

                ];
                var procQuery = 'CALL WM_get_1010Default( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if(!err && results && results[0] && results[0][0] && results[1]){
                        response.status = true;
                        response.message = "Requirement default data is";
                        response.error = null;
                        response.data = {
                            defId: results[0][0].defId,
                            heMasterId:results[0][0].heMasterId,
                            purpose:results[0][0].purpose,
                            jobType: results[0][0].jobtype,
                            currency: results[0][0].currency,
                            scale: results[0][0].scale,
                            duration: results[0][0].duration,
                            departments:results[1]
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "default data not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data form default";
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




jobCtrl.getcontactlist=function(req,res,next){
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
    console.log(req.query.purpose,"req.query.purpose");
    if (!req.query.purpose) {
        error.purpose = 'Invalid purpose';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
                req.query.isHiringManager = (req.query.isHiringManager) ? req.query.isHiringManager : 0;
                req.query.isinterviewPanel = (req.query.isinterviewPanel) ? req.query.isinterviewPanel : 0;
                req.query.isprocurement = (req.query.isprocurement) ? req.query.isprocurement : 0;
                req.query.isTAHead = (req.query.isTAHead) ? req.query.isTAHead : 0;
                req.query.isrecruiterSPOC = (req.query.isrecruiterSPOC) ? req.query.isrecruiterSPOC : 0;
                req.query.ishiringLead = (req.query.ishiringLead) ? req.query.ishiringLead : 0;


                //  req.query.HEMasterId = (req.query.HEMasterId) ? req.query.HEMasterId : 0;



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.isHiringManager),
                    req.st.db.escape(req.query.isinterviewPanel),
                    req.st.db.escape(req.query.isprocurement),
                    req.st.db.escape(req.query.isTAHead),
                    req.st.db.escape(req.query.isrecruiterSPOC),
                    req.st.db.escape(req.query.ishiringLead)

                    //     req.st.db.escape(req.query.HEMasterId),

                ];
                var procQuery = 'CALL WM_get_membersroles1( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0] && results[0][0]  ){
                        response.status = true;
                        response.message = "Requirement  contactlist loaded sucessfully  ";
                        response.error = null;
                        response.data = {
                            contactList: results[0]

                        }
                        res.status(200).json(response);
                    }

                    else if(!err ){
                        response.status = true;
                        response.message = "Requirement  contactlist  is null";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting contactlist";
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


jobCtrl.saveContact = function(req,res,next){
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
        error.heMasterId = 'invalid tenant';
        validationFlag *= false;
    }
    if (!req.query.heDepartmentId) {
        error.heDepartmentId = 'invalid client';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                    req.body.tId = (req.body.tid) ? req.body.tid : 0;  
                    req.body.imageUrl = (req.body.imageUrl) ? req.body.imageUrl : '';
                    req.body.firstName = (req.body.firstName) ? req.body.firstName : '';
                    req.body.lastName = (req.body.lastName) ? req.body.lastName : '';
                    req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : '';
                    req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : '';
                    req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : '';
                    req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : '';
                    req.body.emailId = (req.body.emailId) ? req.body.emailId : '';
                    req.body.jobtitleId = (req.body.jobtitleId) ? req.body.jobtitleId : 0;
                    req.body.isHiringManager = (req.body.isHiringManager) ? req.body.isHiringManager : 0;
                    req.body.isinterviewPanel = (req.body.isinterviewPanel) ? req.body.isinterviewPanel : 0;
                    req.body.isprocurement = (req.body.isprocurement) ? req.body.isprocurement : 0;
                    req.body.isTAHead = (req.body.isTAHead) ? req.body.isTAHead : 0;
                    req.body.isrecruiterSPOC = (req.body.isrecruiterSPOC) ? req.body.isrecruiterSPOC : 0;
                    req.body.ishiringLead = (req.body.ishiringLead) ? req.body.ishiringLead : 0;
                    req.body.notes = (req.body.notes) ? req.body.notes : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.body.tid),  
                    req.st.db.escape(req.body.imageUrl),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.phoneISD),
                    req.st.db.escape(req.body.phoneNumber),                    
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.jobtitleId),
                    req.st.db.escape(req.body.isHiringManager),
                    req.st.db.escape(req.body.isinterviewPanel),
                    req.st.db.escape(req.body.isprocurement),
                    req.st.db.escape(req.body.isTAHead),
                    req.st.db.escape(req.body.isrecruiterSPOC),
                    req.st.db.escape(req.body.ishiringLead),
                    req.st.db.escape(req.body.notes)

                ];
                var procQuery = 'CALL wm_save_contactDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "contact saved sucessfully";
                        response.error = null;
                        response.data = {
                            contacts: results [0]
                        }
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving contact";
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


jobCtrl.saveEducation = function(req,res,next){
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                    //req.body.tId = (req.body.tid) ? req.body.tid : 0;  
                    req.body.education = (req.body.education) ? req.body.education : '';
                    req.body.level = (req.body.level) ? req.body.level : 0;
                    req.body.educationAlternateName = (req.body.educationAlternateName) ? req.body.educationAlternateName : '';
                    req.body.specialization = (req.body.specialization) ? req.body.specialization : '';
                    req.body.specializationAlternateName = (req.body.specializationAlternateName) ? req.body.specializationAlternateName : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                   // req.st.db.escape(req.body.tid),  
                    req.st.db.escape(req.body.education),
                    req.st.db.escape(req.body.level),
                    req.st.db.escape(req.body.educationAlternateName),
                    req.st.db.escape(req.body.specialization),
                    req.st.db.escape(req.body.specializationAlternateName)
                    
                ];
                var procQuery = 'CALL wm_save_educationDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "education and Specialization saved sucessfully";
                        response.error = null;
                        response.data = {
                            educationSpecialization: results [0]
                        }
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving education and Specialization";
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

jobCtrl.getdefaults=function(req,res,next) {
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
        error.heMasterId = 'Invalid tenant';
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
                    //req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;

                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId)
                        // req.st.db.escape(JSON.stringify(req.body.clients))
                    ];
                    var procQuery = 'CALL WM_get_1010Default1( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        console.log(err);


                        if (!err) {
                            response.status = true;
                            response.message = "Requirement default data is";
                            response.error = null;
                            response.data = {
                                defId: results[0][0].defId,
                                purpose: results[0][0].purpose,
                                jobType: results[0][0].jobtype,
                                currency: results[0][0].currency,
                                scale: results[0][0].scale,
                                duration: results[0][0].duration,
                                List: results[1]

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting data form default";
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

module.exports = jobCtrl;