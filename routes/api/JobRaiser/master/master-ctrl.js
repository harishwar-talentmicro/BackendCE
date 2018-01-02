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
                    req.st.db.escape(req.query.token)
                ];

                var procQuery = 'CALL wm_get_jobtype_curr_scale_duration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    console.log(err);
                    if(!err && result || (result[0] && result[0][0]) ||(result[1] && result[1][0]) ||(result[2] && result[2][0])||(result[3] && result[3][0])||(result[4] && result[4][0])){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            jobType:result[0],
                            currency: result[1],
                            scale: result[2],
                            duration:result[3],
                            education:result[4]
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
                req.query.educationId = req.query.educationId ? req.query.educationId : 0;

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

masterCtrl.getClients = function(req,res,next){
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


    console.log(req.query.tenId,"req.query.tenId");
    if (!req.query.tenId) {
        error.tenId = 'Invalid tenId';
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
                req.query.tenId = (req.query.tenId) ? req.query.tenId : 0;
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
                req.query.HEMasterId = (req.query.HEMasterId) ? req.query.HEMasterId : 0;



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.tenId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.HEMasterId),


                ];
                var procQuery = 'CALL WM_get_clients( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, clientList) {
                    console.log(err);

                    if(!err && clientList[0]){
                        response.status = true;
                        response.message = "Requirement  clientList  saved successfully";
                        response.error = null;
                        response.data = {
                            clientList: clientList [0]

                        }
                        res.status(200).json(response);
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "Requirement  clientList  is null";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting clientList";
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
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
                req.query.HEMasterId = (req.query.HEMasterId) ? req.query.HEMasterId : 0;



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.clientId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.HEMasterId),

                ];
                var procQuery = 'CALL WM_get_membersroles( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if(!err && results && results[0] && results[0][0] || results[1] && results[1][0] ){
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


module.exports = masterCtrl;