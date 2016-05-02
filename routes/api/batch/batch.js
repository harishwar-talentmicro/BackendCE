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
 *
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
            var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(req.query.smid);
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
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Batch list not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
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
 *
 * @discription : API to get batch details
 */
router.get('/details', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;

    if (isNaN(parseInt(req.query.id))){
        error.smid = 'Invalid batch id';
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
            var procParams = req.db.escape(req.query.id);
            var procQuery = 'CALL get_batch_details(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Batch details loaded successfully';
                                responseMessage.data = results[0]
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Batch details not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Batch details not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Batch details not available';
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
                    console.log('Error : get_batch_details ', err);
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
            console.log('Error get_batch_details : ', ex);
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
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'batch transaction details not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
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
 *
 * @discription : API to get batch transactions
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
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'batch details not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
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
 * @param token* <string> token of login user
 * @param title* <string> title of group
 * @param st <int> st is status of group
 * @param desc <string> desc is description of group
 * @param tid <int> tid of group in case of update
 * @param pic <string> pic is path of image
 * @param itemId <string> itemId is comma saprated ids of items
 *
 * @discription : API to create group with item
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
                console.log(batchArrayList.length,"batchArrayList.length");
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
 *
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
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param ezeid* <string> ezeoneid for which admin wants to save receipts
 * @param particulars <string> desc is description of group
 * @param smid <int> smid is service master id
 * @param amount <decimal>
 *
 * @discription : API to create batch receipts
 */

router.post('/bill_receipts', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var id = parseInt(req.body.smid);
    var validationFlag = true;
    var error = {};
        if (!req.body.ezeoneid) {
            error.ezeoneid = 'Invalid ezeoneid';
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
                var ezeoneid = alterEzeoneId(req.body.ezeoneid);
                var procParams = req.db.escape(ezeoneid) + ',' + req.db.escape(id)+ ',' + req.db.escape(req.body.particulars)
                    + ',' + req.db.escape(req.body.amount);
                var procQuery = 'CALL psave_billing_receipts(' + procParams + ')';
                req.db.query(procQuery, function (err, batchResult) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Receipt saved successfully';
                        responseMessage.data = {};
                        res.status(200).json(responseMessage);
                    }
                    else {
                        console.log('Receipt not saved');
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
                console.log('Error psave_billing_receipts :  ', ex);
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
 * @discription : API to get batch transactions
 */
router.get('/invoice', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (isNaN(parseInt(req.query.batch_id))){
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
            var procParams = req.db.escape(req.query.batch_id);
            var procQuery = 'CALL pget_batch_trans(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {

                                for (var batchCount = 0; batchCount < results[0].length; batchCount++) {
                                    /**@todo send pdf to member of communtiy */
                                    mailerApi.sendMail('proposal_template', {
                                        Name : name,
                                        RequirementDescription : req.body.message,
                                        LoggedInName : logedinuser,
                                        email : fromEmail,
                                        mobile : mn

                                    }, '', 'jain31192@gmail.com');

                                }
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
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'batch details not available';
                            responseMessage.data = [];
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
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
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get batch transactions
 */
router.get('/test_details', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    //var schema = {
    //        "smid": { "type": "integer" }
    //};
    //var validate = ajv.compile(schema);
    var validationFlag = true;
    var error = {};
    //var valid = validate(req.query.smid);
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var procParams = req.db.escape(req.query.smid);
            var procQuery = 'CALL test_new1(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    //console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                var schema1 = {
                                    "tid": { "type": "integer" },
                                    "expensetype": { "type" : "string" },
                                    "item_Tag": { "type" : "string",optional: true },
                                    "calcType": { "type" : "integer" },
                                    "resuls[1].typeId": { "type": "integer" },
                                    "type": { "type" : "string" },
                                    "area": { "type" : "integer" },
                                    "members": { "type" : "integer" }

                                };
                                ajv.validate(schema1,results[1]); // true
                                if (!valid) {
                                    responseMessage.error = validate.errors;
                                    responseMessage.message = 'Please check the errors';
                                    res.status(400).json(responseMessage);
                                    console.log(ajv.errors,"validate.errors");
                                }
                                else{
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'batch details loaded successfully';
                                    responseMessage.data = {
                                        expenseType : results[0],
                                        batchDetails : results[1]
                                    }
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
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'batch details not available';
                            responseMessage.data = [];
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
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

module.exports = router;