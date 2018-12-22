/**
 * Created by Jana1 on 03-07-2017.
 */

var request = require('request');
var fs = require('fs');
var path = require('path');

var appConfig = require('../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

var managerCtrl = {};

managerCtrl.getUsers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(DBSecretKey)                                                            
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL get_whatmate_managers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result ){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting users";
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

managerCtrl.saveUsers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var formList =req.body.formList;
    if(typeof(formList) == "string") {
        formList = JSON.parse(formList);
    }
    if(!formList){
        formList = [];
    }

    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var code = "";
                var possible = "1234567890";

                for (var i = 0; i <= 7; i++) {

                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.userManager),
                    req.st.db.escape(req.body.masterConfiguration),
                    req.st.db.escape(code),
                    req.st.db.escape(JSON.stringify(formList)),
                    req.st.db.escape(req.body.adoptionReport),
                    req.st.db.escape(req.body.empDocuments),
                    req.st.db.escape(req.body.eventManager),
                    req.st.db.escape(req.body.HRPayrollDocs || 0)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL save_whatmate_managers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result ){
                        response.status = true;
                        response.message = "Users saved successfully";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving users";
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

managerCtrl.getUserDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.query.managerId){
        error.managerId = 'Invalid managerId';
        validationFlag *= false;
    }

    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.managerId),
                    req.st.db.escape(DBSecretKey)                                        
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL get_whatmate_manager_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0][0] && result[1][0] ){
                        response.status = true;
                        response.message = "User data loaded successfully";
                        response.error = null;
                        response.data = {
                            userMasterId : result[1][0].userMasterId,
                            ezeoneId : result[1][0].ezeoneId,
                            displayName : result[1][0].displayName,
                            userManager : result[1][0].userManager,
                            masterConfiguration : result[1][0].masterConfiguration,
                            adoptionReport : result[1][0].adoptionReport,
                            empDocuments : result[1][0].empDocuments,
                            eventManager : result[1][0].eventManager,
                            HRPayrollDocs : result[1][0].HRPayrollDocs,
                            formList : result[0][0].formList ? JSON.parse(result[0][0].formList) : null
                        };
                        res.status(200).json(response);
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "User data loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting user data";
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

managerCtrl.resetAPIKey = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var code = "";
                var possible = "1234567890";

                for (var i = 0; i <= 7; i++) {

                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.managerId),
                    req.st.db.escape(code)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL save_whatmate_managers_APIKey( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result ){
                        response.status = true;
                        response.message = "Saved";
                        response.error = null;
                        response.data = {
                            APIKey : code
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving users";
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

managerCtrl.validateEzeoneId = function(req,res,next){
    var response = {
        status : false,
        message : "Error while validating EZEOneId",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.EZEOneId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL validate_ezeoneId( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,searchList){
                console.log(searchList[0][0]._error);
                if(!err && searchList && searchList[0] && searchList[0][0]._error){
                    switch (searchList[0][0]._error) {
                        case 'EZEONE_DOESNT_EXISTS' :
                            response.status = false;
                            response.message = "Invalid EZEOne ID try again with correct ID";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                        default:
                            break;
                    }
                }
                else if (!err)
                {
                    response.status = true;
                    response.message = "Valid EZEOne ID";
                    response.error = null;
                    response.data = {
                        searchList : searchList[0]
                    }
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while validating EZEOne ID";
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
};

managerCtrl.getWhatMateCompaniesList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(DBSecretKey)                    
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL get_whatmate_companies( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0]){
                        response.status = true;
                        response.message = "Companies list loaded successfully";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "Companies list loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting companies list";
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

managerCtrl.getFormTransactionData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.query.HEMasterId){
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }

    if(!req.query.APIKey){
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if(!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.fromDate = req.query.fromDate ? req.query.fromDate : null;
                req.query.toDate = req.query.toDate ? req.query.toDate : null;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.fromDate),
                    req.st.db.escape(req.query.toDate),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save deal
                 * @type {string}
                 */
                var procQuery = 'CALL get_whatmate_dashboard1( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err && result && result[0] && result[0][0] && result[0][0].message){
                        response.status = false;
                        response.message = "Access denied";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if(!err && result && result[0] && result[0][0]&& result[2]&&result[2][0]){
                        var output = [];
                        var dashboard = JSON.parse(result[0][0].data) ;
                        for(var i = 0; i < dashboard.length; i++) {
                            var res1 = {};
                            res1.formName = dashboard[i].formName;
                            res1.formId = dashboard[i].formId;
                            res1.statusList = JSON.parse(dashboard[i].statusList);
                            output.push(res1);
                        }
                      
                        if(result[3] && result[3][0] && result[3][0].helpDeskDEtails){
                            var help = JSON.parse(result[3][0].helpDeskDEtails) ;
                            console.log(help);
                                help.statusList = JSON.parse(help.statusList);
                                output.push(help);    
                        }
                        
                        // console.log("----------",output);

                    // output.push(output2);
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            userManager : result[1][0].userManager,
                            masterConfiguration : result[1][0].masterConfiguration,
                            attendanceRequest : result[1][0].attendanceRequest,
                            adoptionReport : result[1][0].adoptionReport,
                            empDocuments : result[1][0].empDocuments,
                            eventManager : result[1][0].eventManager,
                            HRPayrollDocs : result[1][0].HRPayrollDocs,
                            formList : output,
                            accessableFormList : result[2][0].formList ? JSON.parse(result[2][0].formList) : null
                        };
                        res.status(200).json(response);
                    }
                    else if(!err && result && result[1] && result[1][0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            userManager : result[1][0].userManager,
                            masterConfiguration : result[1][0].masterConfiguration,
                            attendanceRequest : result[1][0].attendanceRequest,
                            adoptionReport : result[1][0].adoptionReport,
                            empDocuments : result[1][0].empDocuments,
                            eventManager : result[1][0].eventManager,
                            HRPayrollDocs : result[1][0].HRPayrollDocs,
                            formList : [],
                           accessableFormList : []
                        };
                        res.status(200).json(response);
                    }
                    else if(!err ){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data";
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

managerCtrl.getFormsNeedToSelect = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    // if (!req.query.APIKey)
    // {
    //     error.APIKey = 'Invalid APIKey';
    //     validationFlag *= false;
    // }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.query.managerId = (req.query.managerId) ? req.query.managerId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.managerId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL WhatMate_get_reportForms( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formResult){
                if(!err && formResult && formResult[0]){
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = {
                        formList : formResult[0] ? formResult[0] : []
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting form list ";
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
};


module.exports = managerCtrl;