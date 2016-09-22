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
var CONFIG = require('../../../ezeone-config.json');
var mailerApi = new Mailer();
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});
var ejs = require('ejs');
var fs = require('fs');
var moment = require('moment');

var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');

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
                    }//
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
                            /**preparing query for getting all member results in a single shot */
                            var queryParams = req.db.escape(memberArrayList[batchCount]) + ',' + req.db.escape(req.body.batchId)
                                + ',' + req.db.escape(req.body.serviceMasterId)+ ',' + req.db.escape(req.body.token);
                            var procQuery = 'CALL get_billing_invoice_details(' + queryParams + ');';
                            combinedInvoieQuery += procQuery;
                        }

                        console.log(combinedInvoieQuery,"combinedInvoieQuery");
                        /**execute the query */
                        req.db.query(combinedInvoieQuery, function (err, results) {
                            if (!err) {
                                //console.log(results,"results");
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length>0) {

                                            var memberDemandNoteList = [];

                                            var getNewDemandNote = function(){
                                                return {
                                                    batchTilte : '',
                                                    startDate : '',
                                                    endDate : '',
                                                    dueDate : '',
                                                    logo : '',
                                                    communityAddress : '',
                                                    batchCreationDate : '',
                                                    fullName : '',
                                                    refNumber : '',
                                                    sqFt : '',
                                                    typeTitle : '',
                                                    adminName : '',
                                                    email : '',
                                                    expenseList : [],
                                                    totalAmount : 0.00
                                                }
                                            };


                                            memberDemandNoteList.push(getNewDemandNote());
                                            ////////////////////////////////////////////////////

                                            for(var counter1 = 0; counter1 < results.length; counter1++){
                                                /**
                                                 * Only take 4 consecutive result set for one member
                                                 * 5th result set is mysql system message
                                                 * then from 6th again the result set start for next member
                                                 */

                                                var recordNumber = (counter1+1)%5;
                                                if(recordNumber){
                                                    //console.log('inside recordNumber if');
                                                    //console.log('results[counter1]',results[counter1]);
                                                    switch(recordNumber){
                                                        case 1 :
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].batchTitle = results[counter1][0].batchTitle;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].startDate = results[counter1][0].start_date;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].endDate = results[counter1][0].end_date;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].dueDate = results[counter1][0].due_date;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].logo = results[counter1][0].logo;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].communityAddress = results[counter1][0].comunityAddress;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].batchCreationDate = results[counter1][0].batch_created_date;
                                                            break;
                                                        case 2 :
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].fullName = results[counter1][0].name;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].refNumber = results[counter1][0].reference_name?results[counter1][0].reference_name:123;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].sqFt = results[counter1][0].sft;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].typeTitle = results[counter1][0].typeTitle;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].adminName = results[counter1][0].adminName;
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].email = results[counter1][0].email;
                                                            break;
                                                        case 3 :
                                                            for(var counter2 = 0; counter2 < results[counter1].length; counter2++){
                                                                memberDemandNoteList[memberDemandNoteList.length - 1].expenseList.push({
                                                                    expenseType : results[counter1][counter2].expensetype,
                                                                    amount : results[counter1][counter2].Amount.toFixed(2)
                                                                });
                                                                //console.log(results[counter1][counter2].expensetype,"expenseList");
                                                            }
                                                            break;
                                                        case 4 :
                                                            memberDemandNoteList[memberDemandNoteList.length - 1].totalAmount = results[counter1][0].totalAmount.toFixed(2);
                                                            break;
                                                        default :
                                                            break;
                                                    }
                                                }
                                                else{
                                                    if(counter1 < (results.length - 1)){
                                                        memberDemandNoteList.push(getNewDemandNote());
                                                        console.log('testcase');
                                                    }

                                                }
                                            }


                                            /**
                                             * Counter to keep track how much demand notes are send through mail till yet for
                                             * recursive loop
                                             */
                                            var memberDemandNoteCounter = 0;

                                            /**
                                             * Sends demand note for the members of the community after
                                             * generating PDF for that demand note and attaching it to mail
                                             *
                                             * Function is called recursively as we are performing async operation
                                             * for generating PDF
                                             */
                                            var sendDemandNote = function(){
                                                console.log('memberDemandNoteList',memberDemandNoteList[memberDemandNoteCounter]);
                                            /**
                                             * preparing template for each member
                                             * */
                                                var htmlMail = mailerApi.renderTemplate('invoice',{
                                                    communityAddress : memberDemandNoteList[memberDemandNoteCounter].communityAddress,
                                                    memberName : memberDemandNoteList[memberDemandNoteCounter].fullName,
                                                    imageUrl : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET +'/'+memberDemandNoteList[memberDemandNoteCounter].logo,
                                                    memberAddress : memberDemandNoteList[memberDemandNoteCounter].communityAddress ,
                                                    billDate : moment(memberDemandNoteList[memberDemandNoteCounter].batchCreationDate).format('Do MMMM, YYYY'),
                                                    startDate : moment(memberDemandNoteList[memberDemandNoteCounter].startDate).format(' MMMM, YYYY'),
                                                    endDate : moment(memberDemandNoteList[memberDemandNoteCounter].endDate).format(' MMMM, YYYY'),
                                                    totalAmount : memberDemandNoteList[memberDemandNoteCounter].totalAmount,
                                                    dueDate : moment(memberDemandNoteList[memberDemandNoteCounter].dueDate).format('Do MMMM, YYYY'),
                                                    adminName : memberDemandNoteList[memberDemandNoteCounter].adminName,
                                                    type : memberDemandNoteList[memberDemandNoteCounter].typeTitle,
                                                    area : memberDemandNoteList[memberDemandNoteCounter].sqFt,
                                                    refNo : memberDemandNoteList[memberDemandNoteCounter].refNumber,
                                                    expenseList: memberDemandNoteList[memberDemandNoteCounter].expenseList
                                                });

                                                var pdf = require('html-pdf');
                                                var options = {format: 'A4'};

                                                pdf.create(htmlMail,options).toBuffer(function(err, pdfBuffer){
                                                    console.log("pdfBuffer",pdfBuffer);
                                                    if(!err){
                                                        console.log('Sending mail');
                                                        mailerApi.sendMailNew('invoice', {
                                                            communityAddress : memberDemandNoteList[memberDemandNoteCounter].communityAddress,
                                                            memberName : memberDemandNoteList[memberDemandNoteCounter].fullName,
                                                            imageUrl : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET +'/'+memberDemandNoteList[memberDemandNoteCounter].logo,
                                                            memberAddress : memberDemandNoteList[memberDemandNoteCounter].communityAddress ,
                                                            billDate : moment(memberDemandNoteList[memberDemandNoteCounter].batchCreationDate).format('Do MMMM, YYYY'),
                                                            startDate : moment(memberDemandNoteList[memberDemandNoteCounter].startDate).format(' MMMM, YYYY'),
                                                            endDate : moment(memberDemandNoteList[memberDemandNoteCounter].endDate).format(' MMMM, YYYY'),
                                                            totalAmount : memberDemandNoteList[memberDemandNoteCounter].totalAmount,
                                                            dueDate : moment(memberDemandNoteList[memberDemandNoteCounter].dueDate).format('Do MMMM, YYYY'),
                                                            adminName : memberDemandNoteList[memberDemandNoteCounter].adminName,
                                                            type : memberDemandNoteList[memberDemandNoteCounter].typeTitle,
                                                            area : memberDemandNoteList[memberDemandNoteCounter].sqFt,
                                                            refNo : memberDemandNoteList[memberDemandNoteCounter].refNumber,
                                                            expenseList: memberDemandNoteList[memberDemandNoteCounter].expenseList
                                                        }, '', memberDemandNoteList[memberDemandNoteCounter].email,[
                                                            {
                                                            filename : "Demand Note - "+ memberDemandNoteList[memberDemandNoteCounter].batchCreationDate+'.pdf',
                                                            content : pdfBuffer
                                                        }
                                                        ]);

                                                    }
                                                    else{
                                                        console.log('PDF Generation error for demand note : ',err);
                                                    }

                                                    if(memberDemandNoteCounter < memberDemandNoteList.length-1){
                                                        memberDemandNoteCounter++;
                                                        console.log('Sending mail');
                                                        setImmediate(sendDemandNote);
                                                    }
                                                });
                                            }

                                            sendDemandNote();

                                            ///////////////////////////////////////////////////


                                            //var arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
                                           // var resArr = [];
                                           // resArr[0] = [];
                                           // var counter = 0;
                                           // for(var i = 0;i < results.length; i++)
                                           //// console.log(results[i],"results[i]");
                                           // {
                                           //     if(i%5 == 4)
                                           //     {
                                           //         counter++;
                                           //         resArr[counter] = [];
                                           //     }
                                           //     else
                                           //     {
                                           //         resArr[counter].push(results[i])
                                           //     }
                                           //
                                           // }
                                           // for(var i = 0; i < resArr.length-1; i++)
                                           // {
                                           //     //console.log(resArr[i], "FATHER "+i);
                                           //
                                           //     for(var j = 0; j < resArr[i][j].length; j++)
                                           //     {
                                           //             //console.log(resArr[i][1][0],"[i][j]");
                                           //         var communityAddress = resArr[i][0][0].comunityAddress;
                                           //         var memberName = resArr[i][1][0].name;
                                           //         var memberAddress = resArr[i][0][0].comunityAddress;
                                           //         var billDate = resArr[i][0][0].start_date;
                                           //         var startDate = resArr[i][0][0].start_date;
                                           //         var endDate = resArr[i][0][0].end_date;
                                           //         var totalAmount = resArr[i][3][0].totalAmount;
                                           //         var dueDate = resArr[i][0][0].due_date;
                                           //         var adminName = resArr[i][1][0].adminName;
                                           //         var type = resArr[i][1][0].typeTitle;
                                           //         var area = resArr[i][1][0].sft;
                                           //         var refNo = (resArr[i][1][0].reference_name)?(resArr[i][1][0].reference_name):'123';
                                           //         //var templateString = fs.readFileSync(__dirname+ "../../../../mail/templates/invoice.html", 'utf-8');
                                           //         //ejs.render(templateString,{
                                           //         //    expenseDetailsList:resArr[i][2][0].expensetype
                                           //         //});
                                           //         var expenseDetails = resArr[i][2][1].expensetype;
                                           //         var expenseAmount = resArr[i][2][1].Amount;
                                           //
                                           //         console.log(expenseDetails,"expenseDetails");
                                           //         console.log(expenseAmount,"expenseAmount");
                                           //         mailerApi.sendMail('invoice', {
                                           //             communityAddress : communityAddress,
                                           //             memberName : memberName,
                                           //             memberAddress : memberAddress,
                                           //             billDate : billDate,
                                           //             startDate : startDate,
                                           //             endDate : endDate,
                                           //             totalAmount : totalAmount,
                                           //             dueDate : dueDate,
                                           //             adminName : adminName,
                                           //             type : type,
                                           //             area : area,
                                           //             refNo : refNo,
                                           //             expenseDetails: expenseDetails,
                                           //             expenseAmount: expenseAmount
                                           //         }, '', 'jain31192@gmail.com');
                                           //     }      }
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'invoice send successfully';
                                            responseMessage.data = {};
                                            res.status(200).json(responseMessage);

                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in creating invoice';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in creating invoice';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in creating invoice';
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
                                console.log('Error : get_billing_invoice_details ', err);
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
                        console.log('get_billing_invoice_details: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : get_billing_invoice_details ', err);
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
            console.log('Error get_billing_invoice_details :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});

module.exports = router;