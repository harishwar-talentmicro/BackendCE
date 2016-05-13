/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title messagebox for grouptype group
 *  @description Handles message functions of group
 */
"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *@param token* <string> token of user
 *@param groupName* <string> groupName for validating whether its available or not
 * @discription : API to validate group name
 */
router.get('/validate', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

/**
 * validation goes here
 * validating token and group name as both are mandatory fields
 * */
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.groupName) {
        error.token = 'Invalid group name';
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
            /**
             * validating token for login user
             * */

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                /**
                 * while validating token if not getting any error procees further otherwise give error
                 * */
                if ((!err) && tokenResult) {

                    /**
                     * call procedure for validating groupname
                     * */
                    var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(req.query.groupName);
                    var procQuery = 'CALL p_v1_validateGroup(' + procParams + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, validateGroupResults) {
                        /**
                         * while calling procedure if not getting any error and if get result then in response
                         * if isAvailable is 0 then Group Name is not available to create else Group Name is available
                         *
                         * */
                        if (!err && validateGroupResults && validateGroupResults[0] && validateGroupResults[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            if(validateGroupResults[0][0].isAvailable == 0){
                                responseMessage.message = 'Group Name is not available';
                            }
                            else{
                                responseMessage.message = 'Group Name is available';
                            }

                            responseMessage.data = {
                                isAvailable: validateGroupResults[0][0].isAvailable
                            };
                            res.status(200).json(responseMessage);
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
            console.log('Error p_v1_validateGroup : ', ex);
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
 * @param groupId <int>
 * @param groupName  <string>
 * @param aboutGroup  <string>
 * @param showMembers  <int>(0 : false (default) , 1 : true)
 * @param restrictedReply  <int>(0 : false (default) , 1 : true)
 * @param autoJoin <int> (0 : false (default) , 1 : true)
 * @discription : API to create group
 */

router.post('/', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    req.body.groupId= (req.body.groupId) ? parseInt(req.body.groupId) : 0;
    req.body.showMembers= (req.body.showMembers) ? parseInt(req.body.showMembers) : 0;
    req.body.restrictedReply= (req.body.restrictedReply) ? parseInt(req.body.restrictedReply) : 0;
    req.body.autoJoin= (req.body.autoJoin) ? parseInt(req.body.autoJoin) : 0;

    if(isNaN(req.body.groupId)){
        error.groupId = 'Invalid group Id';
        validationFlag *= false;
    }
    if(isNaN(req.body.showMembers)){
        error.showMembers = 'Invalid show member flag';
        validationFlag *= false;
    }
    if(isNaN(req.body.restrictedReply)){
        error.restrictedReply = 'Invalid restrictedReply flag';
        validationFlag *= false;
    }
    if(isNaN(req.body.autoJoin)){
        error.autoJoin = 'Invalid autoJoin flag';
        validationFlag *= false;
    }

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.groupName ) {
        error.groupName = 'Invalid group Name';
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
                if ((!err) && tokenResult) {
                        var queryParams = req.db.escape(req.body.token) + ',' + req.db.escape(req.body.groupId)
                            + ',' + req.db.escape(req.body.GroupName) + ',' + req.db.escape(req.body.AboutGroup)
                            + ',' + req.db.escape(req.body.showMembers) + ',' + req.db.escape(req.body.restrictedReply)
                            + ',' + req.db.escape(req.body.autoJoin);

                        var procQuery = 'CALL p_v1_createMessageGroup(' + queryParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0][0].groupId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'group created successfully';
                                    responseMessage.data = {
                                        groupId : results[0][0].groupId
                                    };
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in creating group';
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
                                console.log('Error : p_v1_createMessageGroup ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : p_v1_createMessageGroup ', err);
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
            console.log('Error p_v1_createMessageGroup :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});

module.exports = router;