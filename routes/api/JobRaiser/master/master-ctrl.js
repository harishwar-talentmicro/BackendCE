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
var bodyParser =require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

var masterCtrl = {};
var error = {};

masterCtrl.getReqMasterData = function(req,res,next){
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
                    req.st.db.escape(req.query.heMasterId), 
                    req.st.db.escape(req.query.purpose)
                ];

                var procQuery = 'CALL wm_get_jobtype_curr_scale_duration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    console.log(req.query.isWeb);
                    
                        var isWeb = req.query.isWeb;
                        if(!err && result ){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            heDepartment : (result && result[0]) ? result[0] : [],
                            jobType:(result &&result[1]) ? result[1]:[],
                            currency: (result && result[2]) ? result[2]:[],
                            scale: (result && result[3]) ? result[3]:[],
                            duration:(result && result[4]) ? result[4]:[],
                            country:(result && result[5]) ? result[5]:[],
                            jobTitle:(result && result[6]) ? result[6]:[],
                            roleList: result[7] ?result[7]:[],
                            interviewRoundList:result[8] ? result[8]:[],
                            status:result[9] ? result[9]:[]

                        };
                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                        
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            heDepartment : [],
                            jobType: [],
                            currency: [],
                            scale: [],
                            duration:[],
                            country:[],
                            jobTitle:[],
                            roleList:[],
                            interviewRoundList:[],
                            status:[]
                        };
                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting master data";
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

masterCtrl.getSpecializations = function(req,res,next){
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
                 
                 req.query.isWeb = (req.query.isWeb) ? req.query.isWeb: 0;
                
                var inputs = [
                    req.st.db.escape(req.query.token),
                ];

                var procQuery = 'CALL wm_get_edu_Specialization( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,specResult){
                    console.log(err);
                   
                    var isWeb=req.query.isWeb;
                    if(!err && specResult && specResult[0] && specResult[0][0] ){
                        response.status = true;
                        response.message = "specialization loaded successfully";
                        response.error = null;
                        var output=[];
                        for(var i=0; i<specResult[0].length; i++){
                            var res2={};
                            res2.educationId=specResult[0][i].educationId,
                            res2.educationTitle=specResult[0][i].EducationTitle,
                            res2.specialization=specResult[0][i].specialization ? JSON.parse(specResult[0][i].specialization):[];
                            output.push(res2); 
                        }
                        response.data ={
                            educationList:output
                        };

                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data ={
                                educationList:[]
                        };
                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting specializations";
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
masterCtrl.getMemberList = function(req,res,next){
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

    console.log(req.query.clientId,"req.query.clientId");
    if (!req.query.clientId) {
        error.clientId = 'Invalid clientId';
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
                req.query.clientId = (req.query.clientId) ? req.query.clientId : 0;
                //req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
               // req.query.HEMasterId = (req.query.HEMasterId) ? req.query.HEMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.clientId),
                    req.st.db.escape(req.query.purpose)
                  //  req.st.db.escape(req.query.HEMasterId),

                ];
                var procQuery = 'CALL WM_get_membersroles( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results || (results[0] && results[0][0]) || (results[1] && results[1][0] )){
                        response.status = true;
                        response.message = "Requirement  memberList saved successfully ";
                        response.error = null;
                        response.data = {
                            memberList: results[0],
                            roles: results[1]
                        }
                        res.status(200).json(response);
                    }

                    else if(!err ){
                        response.status = true;
                        response.message = "Requirement  memberList  is null";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting memberList";
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
*/

masterCtrl.saveClients = function(req,res,next){
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

    var heDepartment =req.body.heDepartment;
    if(typeof(heDepartment) == "string") {
        heDepartment = JSON.parse(heDepartment);
    }
    if(!heDepartment){
        heDepartment=[];
    }
    var businessLocation =req.body.businessLocation;
    if(typeof(businessLocation) == "string") {
        businessLocation = JSON.parse(businessLocation);
    }
    if(!businessLocation){
        businessLocation=[];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; 
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(heDepartment)),
                    req.st.db.escape(JSON.stringify(businessLocation))
                    

                ];
                var procQuery = 'CALL wm_saveClientBusinessLocationContacts( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results ){
                        response.status = true;
                        response.message = "client businessLocation saved sucessfully";
                        response.error = null;
                        response.data = {
                            heDepartmentId: results[0][0].heDepartmentId
                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving client businessLocation";
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


masterCtrl.savebranches = function(req,res,next){
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
    if (!req.body.heDepartmentId) {
        error.heDepartmentId = 'Invalid client';
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                //req.body.HEDepartmentId = (req.body.HEDepartmentId) ? req.body.HEDepartmentId : 0;
                req.body.branchName = (req.body.branchName) ? req.body.branchName : '';
                req.body.branchCode = (req.body.branchCode) ? req.body.branchCode : '';
                req.body.shippingAddress = (req.body.shippingAddress) ? req.body.shippingAddress : '';
                req.body.shipPhoneISD = (req.body.shipPhoneISD) ? req.body.shipPhoneISD : '';
                req.body.shipPhoneNumber = (req.body.shipPhoneNumber) ? req.body.shipPhoneNumber : '';
                req.body.shipLatitude = (req.body.shipLatitude) ? req.body.shipLatitude : 0.0;
                req.body.shipLongitude = (req.body.shipLongitude) ? req.body.shipLongitude : 0.0;
                req.body.BillingAddress = (req.body.BillingAddress) ? req.body.BillingAddress : '';
                req.body.billPhoneISD = (req.body.billPhoneISD) ? req.body.billPhoneISD : '';
                req.body.billPhoneNumber = (req.body.billPhoneNumber) ? req.body.billPhoneNumber : '';
                req.body.billLatitude = (req.body.billLatitude) ? req.body.billLatitude : 0.0;
                req.body.billLongitude = (req.body.billLongitude) ? req.body.billLongitude : 0.0;
                req.body.Status = (req.body.Status) ? req.body.Status : 0;
                req.body.LandMark = (req.body.LandMark) ? req.body.LandMark : '';
                req.body.EntryProcedure = (req.body.EntryProcedure) ? req.body.EntryProcedure : '';
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                //req.body.type = (req.body.type) ? req.body.type : 0;
                req.body.timeZone = (req.body.timeZone) ? req.body.timeZone : '';                



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.branchName),
                    req.st.db.escape(req.body.branchCode),
                    req.st.db.escape(req.body.shippingAddress),
                    req.st.db.escape(req.body.shipPhoneISD),
                    req.st.db.escape(req.body.shipPhoneNumber),
                    req.st.db.escape(req.body.shipLatitude),
                    req.st.db.escape(req.body.shipLongitude),
                    req.st.db.escape(req.body.BillingAddress),
                    req.st.db.escape(req.body.billPhoneISD),
                    req.st.db.escape(req.body.billPhoneNumber),
                    req.st.db.escape(req.body.billLatitude),
                    req.st.db.escape(req.body.billLongitude),
                    req.st.db.escape(req.body.Status),
                    req.st.db.escape(req.body.LandMark),
                    req.st.db.escape(req.body.EntryProcedure),
                    req.st.db.escape(req.body.currencyId),
                    //req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.timeZone)

                ];
                var procQuery = 'CALL WM_save_WDClientBranches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb=req.query.isWeb;
                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "clientbranches saved sucessfully";
                        response.error = null;
                        response.data = {
                            clientbranchId: results[0]
                        };

                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving clients";
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


masterCtrl.getbranchList = function(req,res,next){
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
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb: 0;

                //req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heDepartmentId)
                    //req.st.db.escape(req.query.purpose)


                ];
                var procQuery = 'CALL WM_get_branches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb=req.query.isWeb;
                    if(!err && results){
                        response.status = true;
                        response.message = "branchList loaded successfully";
                        response.error = null;
                        response.data = {
                            branchList: results[0] ? results[0]:[],
                            detailedBranchList:results[1] ? results[1]:[],
                            wBranchList:results[2] ? results[2]:[]
                        };
                        if(isWeb==1){
                        res.status(200).json(response);
                    }
                    else{
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "branches does not exist";
                        response.error = null;
                        response.data ={
                                branchList:[],
                                detailedBranchList:[],
                                wBranchList:[]
                        };
                        if(isWeb==1){
                        res.status(200).json(response);
                    }
                    else{
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }                    
                }
                else{
                        response.status = false;
                        response.message = "Error while getting branchlist";
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


// Mail templates section

masterCtrl.getmailTemplate=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid tenant';
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

                req.query.isWeb = req.query.isWeb ? req.query.isWeb :0 ;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_1010_mailtemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] && result[0][0] ){
                        response.status = true;
                        response.message = "mail template list";
                        response.error = null;
                        response.data ={
                            mailTemplateList: result[0] ? result[0]: []
                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while getting mail templates";
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

masterCtrl.savetemplate=function(req,res,next){
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
        error.heMasterId = 'Invalid tenant';
        validationFlag *= false;
    }
    if (!req.body.templateName) {
        error.templateName = 'Invalid templateName';
        validationFlag *= false;
    }
    var tags =req.body.tags;
    if(typeof(tags) == "string") {
        tags = JSON.parse(tags);
    }
    if(!tags){
        tags=[];
    }
    var toMail =req.body.toMail;
    if(typeof(toMail) == "string") {
        toMail = JSON.parse(toMail);
    }
    if(!toMail){
        toMail=[];
    }
    var cc =req.body.cc;
    if(typeof(cc) == "string") {
        cc = JSON.parse(cc);
    }
    if(!cc){
        cc=[];
    }
    var bcc =req.body.bcc;
    if(typeof(bcc) == "string") {
        bcc = JSON.parse(bcc);
    }
    if(!bcc){
        bcc=[];
    }
    var attachment =req.body.attachment;
    if(typeof(attachment) == "string") {
        attachment = JSON.parse(attachment);
    }
    if(!attachment){
        attachment=[];
    }
    var stage =req.body.stage;
    if(typeof(stage) == "string") {
        stage = JSON.parse(stage);
    }
    if(!stage){
        stage=[];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;                
                req.body.templateId = (req.body.templateId) ? req.body.templateId : 0;
                req.body.type = (req.body.type) ? req.body.type : 0;
                //req.body.toMail = (req.body.toMail) ? req.body.toMail :'';
                //req.body.cc = (req.body.cc) ? req.body.cc : '';
                //req.body.bcc = (req.body.bcc) ? req.body.bcc : '';
                req.body.subject = (req.body.subject) ? req.body.subject : '';
                req.body.mailBody = (req.body.mailBody) ? req.body.mailBody : '';
                req.body.replymailId = (req.body.replymailId) ? req.body.replymailId : '';
                req.body.priority = (req.body.priority) ? req.body.priority : 0;
                req.body.updateFlag = (req.body.updateFlag) ? req.body.updateFlag : 0;
                //req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                //req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                req.body.SMSMessage = (req.body.SMSMessage) ? req.body.SMSMessage : '';
                req.body.whatmateMessage = (req.body.whatmateMessage) ? req.body.whatmateMessage : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(JSON.stringify(toMail)),
                    req.st.db.escape(JSON.stringify(cc)),                    
                    req.st.db.escape(JSON.stringify(bcc)),
                    req.st.db.escape(req.body.subject),
                    req.st.db.escape(req.body.mailBody),
                    req.st.db.escape(req.body.replymailId),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.updateFlag),
                    req.st.db.escape(req.body.SMSMessage),
                    req.st.db.escape(req.body.whatmateMessage),
                    req.st.db.escape(JSON.stringify(attachment)),
                    req.st.db.escape(JSON.stringify(tags)),
                    req.st.db.escape(JSON.stringify(stage))

                ];
                var procQuery = 'CALL WM_save_1010_mailTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "template saved successfully";
                        response.error = null;
                        response.data = {
                            templateId:results[0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving form template";
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


masterCtrl.getLocation = function(req,res,next){
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
                 req.query.isWeb = (req.query.isWeb) ? req.query.isWeb: 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.keyword)
                    
                ];
                var procQuery = 'CALL wm_get_location( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb=req.query.isWeb;
                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "locations loaded successfully";
                        response.error = null;
                        response.data = {
                           locationList:results[0] ? results[0]:[]
                        };
                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "locations does not exist";
                        response.error = null;
                        response.data ={
                            locationList: []
                        };
                      if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting lcoations";
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

masterCtrl.getmailTemplatedetaile=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid tenant';
        validationFlag *= false;
    }

    if (!req.query.mailtemplateId) {
        error.mailtemplateId = 'invalid template';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.mailTemplateId)

                ];

                var procQuery = 'CALL WM_get_1010mailTemplateDetail( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] ){
                        response.status = true;
                        response.message = "mail template detaile";
                        response.error = null;
                        response.data ={

                            mailTemplateDetails : JSON.parse(result[0][0].formDataJson) ? JSON.parse(result[0][0].formDataJson) :[]
                        };
                                res.status(200).json(response);
                    }
                   
                    else{
                        response.status = false;
                        response.message = "Error while getting mail templates";
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
masterCtrl.getEduSpec = function(req,res,next){
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.educationId),
                    req.st.db.escape(req.query.specializationId)
                ];

                var procQuery = 'CALL wm_get_eduSpec( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] && result[0][0] ){
                        response.status = true;
                        response.message = "educationSpecialization loaded successfully";
                        response.error = null;
                        response.data ={
                        eduSpecId:result[0][0].educationspecializationmapId
                    };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = "empty array";
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting educationSpecialization";
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
*/
/*
masterCtrl.requirementEduSpec = function(req,res,next){
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

    var specialization =req.body.specialization;
    if(typeof(specialization) == "string") {
        specialization = JSON.parse(specialization);
    }
    if(!specialization){
        error.speciialization = 'Invalid specialization';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.educationId),
                    req.st.db.escape(JSON.stringify(specialization))
                ];

                var procQuery = 'CALL wm_get_requirementEduSpec( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "educationSpecialization loaded successfully";
                        response.error = null;
                        var output=[];
                        for(var i=0; i<result.length-1; i++){
                            var res2={};
                            res2.eduSpecId=result[i][0].educationspecializationmapId;
                            output.push(res2); 
                        }
                         response.data =output;
                    //     response.data ={
                    //     eduSpecId:result
                    // };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = "empty array";
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting educationSpecialization";
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
*/

masterCtrl.getSkills = function(req,res,next){
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
                 
                 req.query.isWeb = (req.query.isWeb) ? req.query.isWeb: 0;
                
                var inputs = [
                    req.st.db.escape(req.query.token)
                    //req.st.db.escape(req.query.keyword)
                    
                ];
                var procQuery = 'CALL Wm_get_skills( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    
                    var isWeb=req.query.isWeb;
                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = "skills loaded successfully";
                        response.error = null;
                        response.data = {
                           skillList:results[0]
                        };
                        if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "skills does not exist";
                        response.error = null;
                        response.data ={
                            skillList: []
                        };
                      if(isWeb == 1){
                           res.status(200).json(response);    
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting skills";
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

masterCtrl.getRoleLocationMasterData = function(req,res,next){
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
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.heDepartmentId)
                ];

                var procQuery = 'CALL wm_get_location_rolemaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if(!err && result ){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            locationList : (result && result[0]) ? result[0] : [],
                            roles:(result &&result[1]) ? result[1]:[]
                        };
                        if(req.query.isWeb == 1){
                            res.status(200).json(response);
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            locationList : [],
                            roles: []
                        };
                        if(req.query.isWeb == 1){
                            res.status(200).json(response);
                        }
                        else{
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting master data";
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


masterCtrl.saveClientsBusinessLocation = function(req,res,next){
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
                req.body.tid = (req.body.tid) ? req.body.tid : 0;  // clientId
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;
                req.body.clientName = (req.body.clientName) ? req.body.clientName : '';
                req.body.title = (req.body.title) ? req.body.title : '';
                req.body.location = (req.body.location) ? req.body.location : '';
                //req.body.clientCode = (req.body.clientCode) ? req.body.clientCode : '';
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.nearestParking = req.body.nearestParking ? req.body.nearestParking:'';
                req.body.entryProcedure = (req.body.entryProcedure) ? req.body.entryProcedure : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tid),  // clientId
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.clientName),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.location),
                    //req.st.db.escape(req.body.clientCode),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.nearestParking),
                    req.st.db.escape(req.body.entryProcedure)

                ];
                var procQuery = 'CALL wm_save_businessLocation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                        if(!err && results ){
                            response.status = true;
                            response.message = "Business Location  saved sucessfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }

                    else{
                        response.status = false;
                        response.message = "Error while saving Business Location";
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

masterCtrl.saveMasterStageStatus = function(req,res,next){
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

    var stage =req.body.stage;
    if(typeof(stage) == "string") {
        stage = JSON.parse(stage);
    }
    if(!stage){
        stage=[];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(stage))
                ];
                var procQuery = 'CALL wm_save_masterStageStatus( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results ){
                        response.status = true;
                        response.message = "stage and status saved sucessfully";
                        response.error = null;
                        response.data = {
                            stage: results[0][0].stages
                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving client businessLocation";
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

masterCtrl.getRequirementView = function(req,res,next){
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; 
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.status),                    
                    req.st.db.escape(req.query.heMasterId)
                                    ];
                var procQuery = 'CALL wm_get_requirementView( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = " Requirement View loaded sucessfully";
                        response.error = null;
                        var output=[];
                         for(var i=0; i<results[0].length; i++){
                            var res2={};
                            res2.parentId= results[0][i].parentId ? results[0][i].parentId: 0,
                            res2.transId= results[0][i].transId ? results[0][i].transId: 0,
                            res2.heDepartmentId= results[0][i].heDepartmentId ? results[0][i].heDepartmentId: 0,
                            res2.positions= results[0][i].positions ? results[0][i].positions: 0,
                            res2.positionsFilled= results[0][i].positionsFilled ? results[0][i].positionsFilled: 0,
                            res2.departmentTitle= results[0][i].departmentTitle ? results[0][i].departmentTitle: '',
                            res2.jobCode= results[0][i].jobCode ? results[0][i].jobCode: '',
                            res2.jobtitleId= results[0][i].jobtitleId ? results[0][i].jobtitleId: 0,
                            res2.title= results[0][i].title ? results[0][i].title: '',
                            res2.jobtypeid= results[0][i].jobtypeid ? results[0][i].jobtypeid: 0,
                            res2.jobType= results[0][i].jobType ? results[0][i].jobType: '',
                            res2.jobDescription= results[0][i].jobDescription ? results[0][i].jobDescription: '',
                            res2.remainingDays= results[0][i].remainingDays ? results[0][i].remainingDays: 0,
                            res2.keywords=results[0][i].keywords ? results[0][i].keywords: '',
                            res2.branchList= JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList): [],
                            res2.contactList= JSON.parse(results[0][i].contactList) ? JSON.parse(results[0][i].contactList): [],
                            res2.stageDetail= JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail): []
                            output.push(res2);
                           } 
                        response.data ={ 
                                    requirementView : output

                                    
                        };

                        res.status(200).json(response);
                        
                    }
                    else if(!err){
                        response.status = true;
                        response.message = " Requirement View is empty";
                        response.error = null;
                        response.data={
                            requirementView :[]

                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading Requirement View";
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
masterCtrl.saveMailingTemplate = function(req,res,next){
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
    var tagId =req.body.tagId;
    if(typeof(tagId) == "string") {
        tagId = JSON.parse(tagId);
    }
    if(!tagId){
        tagId=[];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.body.templateId = (req.body.templateId) ? req.body.templateId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.templateId),                    
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(req.body.templateBody),
                    req.st.db.escape(JSON.stringify(tagId))                    


                ];
                var procQuery = 'CALL wm_save_mailingTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results ){
                        response.status = true;
                        response.message = "template saved sucessfully";
                        response.error = null;
                        response.data = {
                            templateId: results[0][0].templateId
                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while saving template";
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
*/
masterCtrl.getClientView = function(req,res,next){
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; 
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                                    ];
                var procQuery = 'CALL wm_get_clientView( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0]){
                        response.status = true;
                        response.message = " client View loaded sucessfully";
                        response.error = null;
                         var output=[];
                          for(var i=0; i<results[0].length; i++){
                             var res2={};
                             res2.stageDetail= JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail): [],                            
                             res2.heDepartmentId= results[0][i].heDepartmentId ? results[0][i].heDepartmentId: 0, 
                             res2.clientName= results[0][i].clientName ? results[0][i].clientName: 0,                             
                             res2.count= results[0][i].count ? results[0][i].count: 0,
                             res2.notes= results[0][i].notes ? results[0][i].notes: 0
                             output.push(res2);
                            }     
                        response.data ={ 
                                clientView : output                                    
                         };
                        res.status(200).json(response);                        
                    }
                    // else if(!err ){
                    //     response.status = true;
                    //     response.message = " client View is empty";
                    //     response.error = null;
                    //     response.data ={
                    //         clientView :[]
                    //     };
                    //      res.status(200).json(response);
                    // };

                    else{
                        response.status = false;
                        response.message = "Error while loading client View";
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


masterCtrl.mailTags=function(req,res,next){
    
    //var applicantId=36;

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid tenant';
        validationFlag *= false;
    }

     var tags =req.body.tags;
    if(typeof(tags) == "string") {
        tags = JSON.parse(tags);
    }
    if(!tags){
        tags=[];
    }
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
                req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                var mailBody = req.body.mailBody;
                req.query.isWeb = req.query.isWeb ? req.query.isWeb :0 ;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(tags)),
                    req.st.db.escape(JSON.stringify(reqApplicants))


                ];
                var mailbody_array = [];

                var procQuery = 'CALL wm_get_detailsByTags( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0]){

                        var temp = mailBody;
                        for (var i = 0; i < result[0].length; i++){
                           // console.log('outer',i);
                            //console.log('result[i]',result[0][i]);
                    
                               // console.log('inside');
                                for(var j = 0; j < tags.length; j++){
                                    console.log(j);
                                    console.log('tags '+result[0][i][tags[j].tagName]);
                                    mailBody=mailBody.replace('['+tags[j].tagName+']',result[0][i][tags[j].tagName]);
                                }

                                mailbody_array.push(mailBody);   
                                mailBody = temp;
                        }
                        //console.log('asdf',mailBody);
                        //return;

                        response.status = true;
                        response.message = "tags replaced successfully";
                        response.error = null;
                        response.data ={
                            tagsPreview: mailbody_array
                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while replacing tags";
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

masterCtrl.getmasterStageStatusTypes=function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid tenant';
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

                req.query.isWeb = req.query.isWeb ? req.query.isWeb :0 ;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_masterStageStatusTypes( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result && result[0] ){
                        response.status = true;
                        response.message = "stage and status loaded successfully";
                        response.error = null;
                        response.data ={
                            Stage: result[0] ? result[0]:[],
                            Status:result[1] ? result[1]:[]

                        };
                        res.status(200).json(response);
                    }

                    else{
                        response.status = false;
                        response.message = "Error while loading stage and status";
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


module.exports = masterCtrl;
