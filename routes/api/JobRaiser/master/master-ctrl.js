/**
 * Created by Jana1 on 18-12-2017.
 */

var moment = require('moment');
var fs = require('fs');

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
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId), 
                    req.st.db.escape(req.query.purpose)
                ];

                var procQuery = 'CALL wm_get_jobtype_curr_scale_duration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result ||(result[0] && result[0][0]) ||(result[1] && result[1][0]) ||(result[2] && result[2][0])||(result[3] && result[3][0])||(result[4] && result[4][0])|| (result[5] && result[5][0])|| (result[6] && result[6][0])){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            purposeList : result[0],
                            jobType:result[1],
                            currency: result[2],
                            scale: result[3],
                            duration:result[4],
                            education:result[5],
                            country:result[6]
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

masterCtrl.getSpecilizations = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    if (!req.query.educationId) {
        error.purpose = 'Invalid education type';
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
                //req.query.educationId = req.query.educationId ? req.query.educationId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.educationId)
                ];

                var procQuery = 'CALL wm_get_edu_Specialization( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,specResult){
                    console.log(err);
                    if(!err && specResult && specResult[0] && specResult[0][0] ){
                        response.status = true;
                        response.message = "specialization loaded successfully";
                        response.error = null;
                        response.data ={
                            specializationList: specResult[0]
                        }
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.body.tId = (req.body.tId) ? req.body.tId : 0;  // clientId
                    req.body.tenId = (req.body.tenId) ? req.body.tenId : 0;
                    req.body.shortName = (req.body.shortName) ? req.body.shortName : '';
                    req.body.clientCode = (req.body.clientCode) ? req.body.clientCode : '';
                    req.body.website = (req.body.website) ? req.body.website : '';
                    req.body.notes = (req.body.notes) ? req.body.notes : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),  // clientId
                    req.st.db.escape(req.body.tenId),
                    req.st.db.escape(req.body.shortName),
                    req.st.db.escape(req.body.clientCode),
                    req.st.db.escape(req.body.website),
                    req.st.db.escape(req.body.notes)

                ];
                var procQuery = 'CALL WM_save_WDClient( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results ){
                        response.status = true;
                        response.message = "clients saved sucessfully";
                        response.error = null;
                        response.data = {
                            clientId: results [0]
                        }
                        res.status(200).json(response);
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult) {
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                req.body.heDepartmentId = (req.body.heDepartmentId) ? req.body.heDepartmentId : 0;
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

                    if(!err && results ){
                        response.status = true;
                        response.message = "clientbranches saved sucessfully";
                        response.error = null;
                        response.data = {
                            clientbranchId: results [0]
                        }
                        res.status(200).json(response);
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

                    if(!err && (results[0] && results[0][0]) || (results[1] && results[1][0]) || (results[2] && results[2][0])){
                        response.status = true;
                        response.message = "branchList loaded successfully";
                        response.error = null;
                        response.data = {
                            branchList: results[0],
                            detailedBranchList:results[1],
                            wBranchList:results[2]
                        }
                        res.status(200).json(response);
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "branches does not exist";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
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
                            mailTemplateList: result[0]
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
    if (!req.body.title) {
        error.title = 'Invalid title';
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
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                req.body.type = (req.body.type) ? req.body.type : 0;
                req.body.toMail = (req.body.toMail) ? req.body.toMail :'';
                req.body.cc = (req.body.cc) ? req.body.cc : '';
                req.body.bcc = (req.body.bcc) ? req.body.bcc : '';
                req.body.subject = (req.body.subject) ? req.body.subject : '';
                req.body.mailBody = (req.body.mailBody) ? req.body.mailBody : '';
                req.body.replymailId = (req.body.replymailId) ? req.body.replymailId : '';
                req.body.priority = (req.body.priority) ? req.body.priority : 0;
                req.body.updateFlag = (req.body.updateFlag) ? req.body.updateFlag : 0;
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                req.body.SMSMessage = (req.body.SMSMessage) ? req.body.SMSMessage : '';
                req.body.whatmateMessage = (req.body.whatmateMessage) ? req.body.whatmateMessage : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.toMail),
                    req.st.db.escape(req.body.cc),                    
                    req.st.db.escape(req.body.bcc),
                    req.st.db.escape(req.body.subject),
                    req.st.db.escape(req.body.mailBody),
                    req.st.db.escape(req.body.replymailId),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.updateFlag),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.statusId),
                    req.st.db.escape(req.body.SMSMessage),
                    req.st.db.escape(req.body.whatmateMessage),
                    req.st.db.escape(JSON.stringify(req.body.attachment))
                ];
                var procQuery = 'CALL WM_save_1010_mailTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if(!err ){
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






module.exports = masterCtrl;