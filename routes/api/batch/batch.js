/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title batch module
 *  @description Handles batch functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var Mailer = require('../../../mail/mailer.js');
var mailerApi = new Mailer();
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});
function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param title* <string> title of batch
 * @param st <int> st is start date
 * @param et <string> et is end date
 * @param dt <int> dt is due date
 * @param smid <string> smid is service master id(community id)
 *
 * @discription : API to create batch process
 */

router.post('/details', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if (!req.body.token) {
        error['token'] = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.smid))){
        error.smid = 'Invalid service master id';
        validationFlag *= false;
    }
    if (!req.body.title) {
        error['title'] = 'Invalid batch title';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = req.db.escape(req.body.token) + ',' + req.db.escape(req.body.title)
                            + ',' + req.db.escape(req.body.smid) + ',' + req.db.escape(req.body.st)
                            + ',' + req.db.escape(req.body.et) + ',' + req.db.escape(req.body.dt);

                        var procQuery = 'CALL save_batch(' + queryParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].id) {

                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'batch created successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                var qMsg = {server: 'Internal Server Error'};

                                                switch (results[0][0].e) {
                                                    case 'Batch already exists' :
                                                        qMsg =  'Batch already exists';
                                                        break;
                                                    case 'ACCESS DENIED' :
                                                        qMsg =  'ACCESS DENIED';
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                responseMessage.status = false;
                                                responseMessage.error = {
                                                    error:  qMsg
                                                };
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in creating batch';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in creating batch';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in creating batch';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : save_batch ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('save_batch: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : save_batch ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error save_batch :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token<string> token of login user
 * @param smid<int> service master id
 * @discription : API to get batch
 */
router.get('/list', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.query.title){
        error.token = 'Invalid title';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.smid))){
        error.smid = 'Invalid service master id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(req.query.smid)+ ',' + req.db.escape(req.query.title);
            var procQuery = 'CALL get_batch_list(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Batch list loaded successfully';
                                responseMessage.data = results[0]
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Batch list not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Batch list not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Batch list not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : get_batch_list ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error get_batch_list : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param id<int> batch id
 * @discription : API to get batch transactions
 */
router.get('/trans', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.id))){
        error.id = 'Invalid batch id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = req.db.escape(req.query.id);
                        var procQuery = 'CALL pget_batch_trans(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'batch transaction details loaded successfully';
                                            responseMessage.data = {
                                                expenseType : results[0],
                                                expenseTypeDetails : results[1]
                                            }
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'batch transaction details not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'batch transaction details not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'batch transaction details not available';
                                    responseMessage.data = [];
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_batch_trans ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_batch_trans : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param smid<int> service master id
 * @discription : API to get batch transactions detsil
 */
router.get('/bdetails', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.query.smid))){
        error.smid = 'Invalid batch id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
                        var procParams = req.db.escape(req.query.smid);
                        var procQuery = 'CALL pget_batch_details(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'batch details loaded successfully';
                                            responseMessage.data = {
                                                expenseType : results[0],
                                                batchDetails : results[1]
                                            }
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'batch details not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'batch details not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'batch details not available';
                                    responseMessage.data = [];
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_batch_details ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_batch_details : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param smid* <int> service master id
 * @param batchId* <int> batch id
 * @param typeId* <int> type id(2bhk,3bhk id)
 * @param expenseDetails* <string>
 * @param total* <decimal> total member
 * @discription : API to create batch transaction
 */

router.post('/trans', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var id = parseInt(req.body.smid);
    var batchId = parseInt(req.body.batchId);
    var validationFlag = true;
    var error = {};
    if(req.is('json')) {
        if (id) {
            if (isNaN(id)) {
                error.id = 'Invalid id of service_masterid';
                validationFlag *= false;
            }
        }
        else {
            id = 0;
        }
        if (isNaN(batchId)) {
            error.id = 'Invalid id of batch id';
            validationFlag *= false;
        }
        if (!validationFlag) {
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {

                    var batchArrayList = req.body.batchArray;
                        var combQuery = '';
                //console.log(batchArrayList.length,"batchArrayList.length");
                        for (var i = 0; i < batchArrayList.length; i++ ){
                            var batchQueryParams = req.db.escape(batchArrayList[i].typeId)
                                + ',' + req.db.escape(batchArrayList[i].expenseDetails)+ ',' + req.db.escape(id)
                                + ',' + req.db.escape(batchArrayList[i].total)+ ',' + req.db.escape(batchId);
                            combQuery +=  ('CALL psave_batch_trans(' + batchQueryParams + ');');
                        }
                        console.log(combQuery);
                        req.db.query(combQuery, function (err, batchResult) {
                            if (!err) {
                                if (batchResult) {
                                    console.log(batchResult);
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'batch created successfully';
                                    responseMessage.data = {
                                    };
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    console.log('batch not save');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                console.log('batch not save');
                                console.log(err);
                                res.status(200).json(responseMessage);
                            }
                        });
                }
                catch (ex) {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error psave_item_group :  ', ex);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            }
        }
        else{
            responseMessage.error = "Accepted content type is json only";
            res.status(400).json(responseMessage);
        }
});

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 * @param sm_id* <int> service master id
 * @param batch_id <int> batch id
 * @discription : API to get reset batch transactions
 */
router.delete('/trans', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.query.sm_id)) || (req.query.sm_id) < 1 ) {
        error.id = 'Invalid service_master id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.batch_id)) || (req.query.batch_id) < 1 ) {
        error.batch_id = 'Invalid batch id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var procParams = req.db.escape(req.query.batch_id) + ',' + req.db.escape(req.query.sm_id);
            var procQuery = 'CALL preset_batch_trans(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'batch reset successfully';
                        responseMessage.data = {};
                        res.status(200).json(responseMessage);
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Error in reset batch';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error:', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});



/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to generate invoice and send in to each member of community
 */
router.post('/testinvoice', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.body.batchId))){
        error.batchId = 'Invalid batch id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.serviceMasterId))){
        error.serviceMasterId = 'Invalid batch id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.memberId))){
        error.memberId = 'Invalid batch id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var procParams = req.db.escape(req.query.batch_id);
            var procQuery = 'CALL get_billing_invoice_details(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {

                                for (var batchCount = 0; batchCount < results[0].length; batchCount++) {
                                    /**@todo send pdf to member of communtiy */
                                    //mailerApi.sendMail('proposal_template', {
                                    //    Name : name,
                                    //    RequirementDescription : req.body.message,
                                    //    LoggedInName : logedinuser,
                                    //    email : fromEmail,
                                    //    mobile : mn
                                    //
                                    //}, '', 'jain31192@gmail.com');

                                }
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'invoice send successfully';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'invoice details not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'invoice details not available';
                            responseMessage.data = [];
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'invoice details not available';
                        responseMessage.data = [];
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pget_batch_trans ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_batch_trans : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

router.post('/invoice', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if (!req.body.token) {
        error['token'] = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.batchId))){
        error.batchId = 'Invalid batch id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.serviceMasterId))){
        error.serviceMasterId = 'Invalid service master id';
        validationFlag *= false;
    }
    if (!req.body.memberArray){
        error.memberArray = 'Invalid member id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var memberArrayList =req.body.memberArray;
                        console.log(memberArrayList,"memberArrayList");
                        var combinedInvoieQuery = "";
                        for (var batchCount = 0; batchCount < memberArrayList.length; batchCount++) {
                            /**@todo send pdf to member of communtiy */
                            //mailerApi.sendMail('proposal_template', {
                            //    Name : name,
                            //    RequirementDescription : req.body.message,
                            //    LoggedInName : logedinuser,
                            //    email : fromEmail,
                            //    mobile : mn
                            //
                            //}, '', 'jain31192@gmail.com');
                            var queryParams = req.db.escape(memberArrayList[batchCount]) + ',' + req.db.escape(req.body.batchId)
                                + ',' + req.db.escape(req.body.serviceMasterId);
                            var procQuery = 'CALL get_billing_invoice_details(' + queryParams + ');';
                            combinedInvoieQuery += procQuery;
                        }

                        console.log(combinedInvoieQuery,"combinedInvoieQuery");
                        req.db.query(combinedInvoieQuery, function (err, results) {
                            if (!err) {
                                //console.log(results,"results");
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length>0) {
                                            for (var i = 1; i < (results.length-4); i++) {
                                                i = (i>1)?i+4:1;
                                                console.log(i,"count");
                                                mailerApi.sendMail('invoice', {
                                                    Name : 'bhavya',
                                                    RequirementDescription : 'jdfhjhdj',
                                                    LoggedInName : 'hdjhjhvd',
                                                    email : 'bhavya@hirecraft.in',
                                                    mobile : '9900687881'

                                                }, '', results[i][0].email);
                                                console.log(results[i],"results[i].email");
                                            }

                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'invoice send successfully';
                                                responseMessage.data = {};
                                                res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in creating batch';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in creating batch';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in creating batch';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : save_batch ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('save_batch: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : save_batch ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error save_batch :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});

module.exports = router;