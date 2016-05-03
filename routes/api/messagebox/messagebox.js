/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title messagebox module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get message contact details
 */
router.get('/search', function(req,res,next){
    var ezeTerm = req.query.title;
    var title = null;
    var pin = null;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    if(!ezeTerm){
        error['ezeoneid'] = 'EZEOne ID not found';
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

            var ezeArr = ezeTerm.split('.');
            title = ezeArr;
            if(ezeArr.length > 1){
                title = ezeArr[0];


                /**
                 * If user may have passed the pin
                 * and therefore validating pin using standard rules
                 */
                if(!isNaN(parseInt(ezeArr[1])) && parseInt(ezeArr[1]) > 99 && parseInt(ezeArr[1]) < 1000){
                    pin = parseInt(ezeArr[1]).toString();
                }

            }
            var procParams = req.db.escape(title) + ',' + req.db.escape(pin);
            var procQuery = 'CALL get_v1_messagebox_contact(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts loaded successfully';
                                responseMessage.data = results[0]
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Message contacts not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Message contacts not available';
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
                    console.log('Error : get_v1_messagebox_contact ', err);
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
            console.log('Error get_v1_messagebox_contact : ', ex);
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
 * @discription : API to get messagebox contacts
 */
router.get('/list_test', function(req,res,next){
    var ezeTerm = req.query.title;
    var title = null;
    var pin = null;
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

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            var procParams = req.db.escape(req.query.token);
            var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contact list loaded successfully';
                                responseMessage.data = results[0]
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contact list not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Message contact list not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Message contact list not available';
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
                    console.log('Error : pGetGroupAndIndividuals_new ', err);
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
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

router.get('/list', function(req,res,next){

    var token = req.query.token;
    var groupId;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        i_count:'',
        data: null
    };

    req.query.dateObjectFlag = (req.query.dateObjectFlag) ? 1 : 0;

    var getFormattedDate = function(date,flag){
        console.log('calling formatted date');
        var dMom = null;
        try{
            dMom = moment(date,"YYYY-MM-DD HH:mm:ss");
        }
        catch(ex){
            console.log(ex);
        }
        if(date && dMom && dMom.isValid()){
            var x = date;
            if(flag){
                return x;
            }
            x = dMom.toDate();
            return x;
        }
        return date;

    };


    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = req.db.escape(token);
                        var query = 'CALL pGetGroupAndIndividuals_new(' + queryParams + ')';
                        console.log(query);
                        req.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            for(var i = 0; i < getResult[0].length; i++){
                                                getResult[0][i].CreatedDate = getFormattedDate(getResult[0][i].CreatedDate,req.query.dateObjectFlag);
                                                getResult[0][i].LUDate = getFormattedDate(getResult[0][i].LUDate,req.query.dateObjectFlag);
                                                getResult[0][i].date = getFormattedDate(getResult[0][i].date,req.query.dateObjectFlag);
                                            }
                                            var queryParams1 = req.db.escape(token);
                                            var query1 = 'CALL PGetUnreadMessageCountofGroup(' + queryParams1 + ')';
                                            console.log(query1);
                                            req.db.query(query1, function (err, get_result) {
                                                if (!err) {
                                                    if (get_result) {
                                                        if (get_result[0]) {
                                                            if (get_result[0].length > 0) {
                                                                for (var i = 0; i < getResult[0].length; i++) {
                                                                    groupId = getResult[0][i].GroupID;
                                                                    for (var j = 0; j < get_result[0].length; j++) {
                                                                        if (groupId == get_result[0][j].GroupID) {
                                                                            getResult[0][i].unreadcount = get_result[0][j].count;
                                                                            getResult[0][i].date = getFormattedDate(get_result[0][j].CreatedDate,req.query.dateObjectFlag);
                                                                            //res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                }
                                                                var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                                req.db.query(queryCount, function (err, invitationResult) {
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'GroupList loaded successfully';
                                                                    responseMessage.i_count = invitationResult[0].length;
                                                                    responseMessage.data = getResult[0];
                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnGetGroupList: GroupList loaded successfully');
                                                                });
                                                            }
                                                            else {
                                                                var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                                req.db.query(queryCount, function (err, invitationResult) {
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'GroupList loaded successfully';
                                                                    responseMessage.i_count = invitationResult[0].length;
                                                                    responseMessage.data = getResult[0];
                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnGetGroupList: GroupList loaded successfully');
                                                                });
                                                            }
                                                        }
                                                        else {
                                                            var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                            req.db.query(queryCount, function (err, invitationResult) {
                                                                responseMessage.status = true;
                                                                responseMessage.error = null;
                                                                responseMessage.message = 'GroupList loaded successfully';
                                                                responseMessage.i_count = invitationResult[0].length;
                                                                responseMessage.data = getResult[0];
                                                                res.status(200).json(responseMessage);
                                                                console.log('FnGetGroupList: GroupList loaded successfully');
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                        req.db.query(queryCount, function (err, invitationResult) {
                                                            responseMessage.status = true;
                                                            responseMessage.error = null;
                                                            responseMessage.message = 'GroupList loaded successfully';
                                                            responseMessage.i_count = invitationResult[0].length;
                                                            responseMessage.data = getResult[0];
                                                            res.status(200).json(responseMessage);
                                                            console.log('FnGetGroupList: GroupList loaded successfully');
                                                        });
                                                    }
                                                }
                                                else {
                                                    responseMessage.message = 'An error occured ! Please try again';
                                                    responseMessage.error = {
                                                        server: 'Internal Server Error'
                                                    };
                                                    res.status(500).json(responseMessage);
                                                    console.log('FnGetGroupList: error in getting GroupList:' + err);
                                                }
                                            });
                                        }
                                        else {
                                            var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                            req.db.query(queryCount, function (err, invitationResult) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'GroupList loaded successfully';
                                                responseMessage.i_count = invitationResult[0].length;
                                                responseMessage.data = [];
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetGroupList: GroupList loaded successfully');
                                            });
                                        }
                                    }
                                    else {
                                        var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                        req.db.query(queryCount, function (err, invitationResult) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'GroupList loaded successfully';
                                            responseMessage.i_count = invitationResult[0].length;
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupList: GroupList loaded successfully');
                                        });
                                    }
                                }
                                else {
                                    var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                    req.db.query(queryCount, function (err, invitationResult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'GroupList loaded successfully';
                                        responseMessage.i_count = invitationResult[0].length;
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupList: GroupList loaded successfully');
                                    });
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetGroupList: error in getting GroupList:' + err);
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
                        console.log('FnGetGroupList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetGroupList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetGroupList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});
module.exports = router;