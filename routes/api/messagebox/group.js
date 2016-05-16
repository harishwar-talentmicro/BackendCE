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
                    var procParams = [
                        req.db.escape(req.query.token) ,
                        req.db.escape(req.query.groupName)
                        ];
                    var procQuery = 'CALL p_v1_validateGroup(' + procParams.join(',') + ')';
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
 * @param groupName*  <string>
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
    /** validation goes here
     * checking that groupId,showMembers,restrictedReply,autoJoin we are getting from front end or not if no then default
     * value is 0 and if getting then check that its integer or not,if not give error
     *
     * */
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
    /**
     * validating token and groupName is mandatory field so cheking whether from front end we are getting or not
     * if not getting then give error
     * */
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
            /**
             * validating token of login user
             * */

            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                        /**
                         * created one function in which we are calling p_v1_createMessageGroup to create group
                         * */
                        var createGroup = function(){
                            var queryParamsList = [
                                req.db.escape(req.body.token) ,
                                req.db.escape(req.body.groupId),
                                req.db.escape(req.body.groupName) ,
                                req.db.escape(req.body.aboutGroup),
                                req.db.escape(req.body.showMembers) ,
                                req.db.escape(req.body.restrictedReply),
                                req.db.escape(req.body.autoJoin)
                            ];

                            var procQuery = 'CALL p_v1_createMessageGroup(' + queryParamsList.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    /**
                                     * if from proc in response we are getting groupId then return response
                                     * prepare response according to creation and updation time
                                     * */
                                    if (results && results[0] && results[0][0].groupId) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        if(req.body.groupId == 0){
                                            responseMessage.message = 'group created successfully';
                                        }
                                        else{
                                            responseMessage.message = 'group updated successfully';
                                        }
                                        responseMessage.data = {
                                            groupId : results[0][0].groupId
                                        };
                                        res.status(200).json(responseMessage);
                                    }
                                    /**
                                     * if login user is not admin
                                     * */
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = results[0][0]._e;
                                        responseMessage.message = 'Error in creating group';
                                        responseMessage.data = {

                                        };
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
                        };
                        if(req.body.groupId == 0){
                            /**
                             * call procedure for validating groupname
                             * */
                            var procParams = [
                                req.db.escape(req.body.token) ,
                                req.db.escape(req.body.groupName)
                            ];
                            var procQuery = 'CALL p_v1_validateGroup(' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, validateGroupResults) {
                                /**
                                 * while calling procedure if not getting any error and if get result then in response
                                 * if isAvailable is 0 then Group Name is not available to create else Group Name is available
                                 *
                                 * */
                                if ((!err) && validateGroupResults &&
                                    validateGroupResults[0] &&
                                    validateGroupResults[0].length > 0 &&
                                    validateGroupResults[0][0].isAvailable == 1) {
                                    createGroup();
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group Name is not available';
                                    responseMessage.data = {
                                    };
                                    res.status(200).json(responseMessage);
                                }
                            });
                        }
                        else{
                            createGroup();
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


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param groupId <int>
 * @param groupName*  <string>
 * @param aboutGroup  <string>
 * @param showMembers  <int>(0 : false (default) , 1 : true)
 * @param restrictedReply  <int>(0 : false (default) , 1 : true)
 * @param autoJoin <int> (0 : false (default) , 1 : true)
 * @discription : API to create group
 */

router.post('/members', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    /** validation goes here
     * checking that groupId we are getting from front end or not if no then default
     * value is 0 and if getting then check that its integer or not,if not give error
     *
     * */
    req.body.groupId= (req.body.groupId) ? parseInt(req.body.groupId) : 0;
    req.body.ezeoneId = req.st.alterEzeoneId(req.body.ezeoneId);
    if(isNaN(req.body.groupId)){
        error.groupId = 'Invalid group Id';
        validationFlag *= false;
    }
    /**
     * validating token and groupName is mandatory field so cheking whether from front end we are getting or not
     * if not getting then give error
     * */
    if (!req.body.token) {
        error.token = 'Invalid token';
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
             * validating token of login user
             * */

            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var queryParams = [req.db.escape(req.body.token) ,
                        req.db.escape(req.body.groupId) ,
                        req.db.escape(req.body.status) ,
                        req.db.escape(req.body.userGroupId)
                    ];
                    /**
                     * call p_v1_addmembersbygroup to add members to the group
                     * */
                    var query = 'CALL p_v1_addmembersbygroup(' + queryParams.join(',') + ')';
                    console.log(query);
                    req.db.query(query, function (err, addMemberResult) {
                        if (!err) {
                            /**
                             * if proc executed successfully then give response true
                             * */

                            if (addMemberResult && addMemberResult[0] && addMemberResult[0].length>0 && addMemberResult[0][0]) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Member added to group successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                                console.log('p_v1_addmembersbygroup: Member added to group successfully');

                            }
                            /**
                             * if proc executed unsuccessfully then give response false
                             * */
                            else {
                                responseMessage.message = 'Member added to group successfully';
                                res.status(200).json(responseMessage);
                                console.log('p_v1_addmembersbygroup:Member added to group successfully');
                            }
                        }
                        /**
                         * while executing proc if error comes then give error
                         * */
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            res.status(500).json(responseMessage);
                            console.log('p_v1_addmembersbygroup: error in updating user status :' + err);
                        }
                    });

                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : p_v1_addmembersbygroup ', err);
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
            console.log('Error p_v1_addmembersbygroup :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});


module.exports = router;