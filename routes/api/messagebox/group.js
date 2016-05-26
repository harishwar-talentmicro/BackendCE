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
var st = null;
var notification = null;
var NotificationTemplater = require('../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../modules/notification/notification-master.js');
var notification = new Notification();

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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
    req.body.aboutGroup = req.body.aboutGroup ? req.body.aboutGroup : ''
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
                                            groupId : results[0][0].groupId,
                                            groupName : req.body.groupName,
                                            aboutGroup : req.body.aboutGroup,
                                            showMembers : req.body.showMembers,
                                            restrictedReply : req.body.restrictedReply,
                                            autoJoin : req.body.autoJoin
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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
 * @param ezeoneId <string>
 * @discription : API to add members to the group(admin will call this api)
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
     * checking that groupId,token we are getting from front end or not if no then give error
     *
     * */
    req.body.ezeoneId = req.st.alterEzeoneId(req.body.ezeoneId);
    if (isNaN(parseInt(req.body.groupId))) {
        error.groupId = 'Invalid Group id';
        validationFlag *= false;
    }
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

                    var queryParams = [
                        req.db.escape(req.body.groupId) ,
                        req.db.escape(req.body.ezeoneId)
                    ];
                    /**
                     * call p_v1_addmembersbygroup to add members to the group
                     * */
                    var query = 'CALL p_v1_addmembersbygroup(' + queryParams.join(',') + ')';
                    console.log(query);
                    req.db.query(query, function (err, addMemberResult) {
                        if (!err) {
                            /**
                             * if proc executed successfully then give response true and send notification to mwember of a group
                             * who is added by admin to accept the request to join the group
                             * */

                            if (addMemberResult && addMemberResult[0] && addMemberResult[0].length>0 && addMemberResult[0][0].userGroupId) {
                                console.log(addMemberResult,"addMemberResult");
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Member added to group successfully';
                                responseMessage.data = {
                                    userGroupId : addMemberResult[0][0].userGroupId,
                                    groupName : addMemberResult[0][0].groupName,
                                    fullName : addMemberResult[0][0].fullName,
                                    groupStatus : addMemberResult[0][0].groupStatus,
                                    groupRelationStatus : addMemberResult[0][0].groupRelationStatus,
                                    luDate : addMemberResult[0][0].luDate
                                };
                                res.status(200).json(responseMessage);
                                console.log('p_v1_addmembersbygroup: Member added to group successfully');
                                var notificationTemplaterRes = notificationTemplater.parse('add_members_to_group',{
                                    groupName : addMemberResult[0][0].groupName,
                                    adminName : addMemberResult[0][0].adminName
                                });
                                console.log(notificationTemplaterRes.parsedTpl,"notificationTemplaterRes.parsedTpl");
                                if(notificationTemplaterRes.parsedTpl){
                                    notification.publish(
                                        addMemberResult[0][0].userGroupId,
                                        addMemberResult[0][0].fullName,
                                        addMemberResult[0][0].groupName,
                                        addMemberResult[0][0].senderId,
                                        notificationTemplaterRes.parsedTpl,
                                        33,
                                        0, addMemberResult[0][0].iphoneId,
                                        0,
                                        0,
                                        0,
                                        0,
                                        1,
                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                        '',
                                        0,
                                        0);
                                    console.log('postNotification : notification for add members to group is sent successfully');
                                }
                                else{
                                    /**
                                     * it will come in this block when error in notification will come
                                     * */
                                    console.log('Error in parsing notification add_members_to_group template - ',
                                        notificationTemplaterRes.error);
                                    console.log('postNotification : notification for add members to group not sent');
                                }

                            }
                            else{
                                var qMsg = {server: 'Internal Server Error'};
                                switch (addMemberResult[0][0]._e) {
                                    case 'EZEOneId Does not exists' :
                                        qMsg = {_e: 'EZEOneId Does not exists'};
                                        break;
                                    case 'Already a member of group' :
                                        qMsg = {_e: 'Already a member of group'};
                                        break;
                                    case 'Your request is in pending status' :
                                        qMsg = {_e: 'Your request is in pending state'};
                                        break;
                                    default:
                                        break;
                                }
                                responseMessage.status = false;
                                responseMessage.error = null;
                                responseMessage.message = qMsg;
                                responseMessage.data = {};
                                res.status(200).json(responseMessage);
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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error p_v1_addmembersbygroup :  ', ex);
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
 * @discription : API to join group(members will call this api)
 */

router.post('/join', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    /** validation goes here
     * checking that groupId,token we are getting from front end or not if no then give error
     *
     * */
    req.body.groupId= (req.body.groupId) ? parseInt(req.body.groupId) : 0;
    if(isNaN(req.body.groupId)){
        error.groupId = 'Invalid group Id';
        validationFlag *= false;
    }
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

                    var queryParams = [
                        req.db.escape(req.body.groupId) ,
                        req.db.escape(req.body.token)
                    ];
                    /**
                     * call p_v1_addmembersbygroup to add members to the group where member will send request to join the group
                     * */
                    var query = 'CALL p_v1_addmemberstogroup(' + queryParams.join(',') + ')';
                    console.log(query);
                    req.db.query(query, function (err, addMemberResult) {
                        if (!err) {
                            /**
                             * if proc executed successfully then give response true
                             * */

                            if (addMemberResult && addMemberResult[0] && addMemberResult[0].length>0 && addMemberResult[0][0].groupId) {
                                var output =[];
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Member added to group successfully';
                                output.push({
                                    groupId : addMemberResult[0][0].groupId,
                                    adminEzeId : addMemberResult[0][0].adminEzeId,
                                    adminId : addMemberResult[0][0].adminId,
                                    groupName : addMemberResult[0][0].groupName,
                                    groupStatus : addMemberResult[0][0].groupStatus,
                                    groupRelationStatus : addMemberResult[0][0].groupRelationStatus,
                                    groupType : addMemberResult[0][0].groupType,
                                    isAdmin : addMemberResult[0][0].isAdmin,
                                    luDate : addMemberResult[0][0].luDate,
                                    areMembersVisible : addMemberResult[0][0].areMembersVisible,
                                    isReplyRestricted : addMemberResult[0][0].isReplyRestricted,
                                    isRequester : addMemberResult[0][0].isRequester,
                                    unreadCount : addMemberResult[0][0].unreadCount
                                });
                                console.log("output",output);
                                responseMessage.data = {
                                    groupMemberList : output
                                };
                                res.status(200).json(responseMessage);
                                console.log('p_v1_addmembersbygroup: Member added to group successfully');

                                var notificationTemplaterRes = notificationTemplater.parse('join_group',{
                                    groupName : addMemberResult[0][0].groupName,
                                    fullName : addMemberResult[0][0].fullName
                                });
                                if(notificationTemplaterRes.parsedTpl){
                                    notification.publish(
                                        addMemberResult[0][0].adminGroupId,
                                        addMemberResult[0][0].groupName,
                                        addMemberResult[0][0].groupName,
                                        addMemberResult[0][0].senderId,
                                        notificationTemplaterRes.parsedTpl,
                                        34,
                                        0, addMemberResult[0][0].iphoneId,
                                        0,
                                        0,
                                        0,
                                        0,
                                        1,
                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                        '',
                                        0,
                                        0);
                                    console.log('postNotification : notification for join_group is sent successfully');
                                }
                                else{
                                    console.log('Error in parsing notification join_group template - ',
                                        notificationTemplaterRes.error);
                                    console.log('postNotification : notification for join_group is sent successfully');
                                }

                            }

                            /**
                             * if proc executed unsuccessfully then give response false
                             * */
                            else {
                                var qMsg = {server: 'Internal Server Error'};
                                switch (addMemberResult[0][0]._e) {
                                    case 'Already a member of group' :
                                        qMsg = {_e: 'Already a member of group'};
                                        break;

                                    default:
                                        break;
                                }
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = qMsg;
                                responseMessage.data = {};
                                res.status(200).json(responseMessage);
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
                            console.log('p_v1_addmembersbygroup: error in adding members :' + err);
                        }
                    });

                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error p_v1_addmembersbygroup :  ', ex);
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
 *@param token* <string> token of user
 *@param groupId* <int> group id
 *@param timestamp* <datetime>
 * @discription : API to get group members
 */
router.get('/members', function(req,res,next){
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
    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }
    console.log(req.query.timeStamp,"timestamp");
    if(req.query.timeStamp){
        if(moment(req.query.timeStamp,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.timeStamp = moment(req.query.timeStamp,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.query.timeStamp = null;
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
                        req.db.escape(req.query.groupId),
                        req.db.escape(req.query.timeStamp)
                    ];
                    var procQuery = 'CALL p_v1_getGroupMembers(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, groupMemberResults) {
                        /**
                         * while calling procedure if not getting any error and if get result then in response
                         * if isAvailable is 0 then Group Name is not available to create else Group Name is available
                         *
                         * */
                        console.log(groupMemberResults[0],"groupMemberResults[0]");
                        if (!err){
                            if(groupMemberResults && groupMemberResults[0] && groupMemberResults[0][0]){
                                        if(groupMemberResults[0][0].groupId) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Group members list loaded successfully';
                                            responseMessage.data = {
                                                groupMemberList : groupMemberResults[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else{
                                            var qMsg = {server: 'Internal Server Error'};

                                            switch (groupMemberResults[0][0]._e) {
                                                case 'ACCESS DENIED' :
                                                    qMsg = {_e: 'ACCESS DENIED'};
                                                    break;

                                                default:
                                                    break;
                                            }
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = qMsg;
                                            responseMessage.data = {};
                                            res.status(200).json(responseMessage);

                                        }
                            }
                            else{
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group members list are not available';
                                responseMessage.data = {
                                    groupMemberList : []
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
                            console.log('Error :', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
 * Method : GET
 * @param req
 * @param res
 * @param next
 *@param token* <string> token of user
 *@param groupId* <int> group id
 * @discription : API to get group details
 */
router.get('/details', function(req,res,next){
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
    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
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
                        req.db.escape(req.query.groupId)
                    ];
                    var procQuery = 'CALL p_v1_getgroupDetails(' + procParams + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, groupDetailResults) {
                        /**
                         * while calling procedure if not getting any error and if get result then in response
                         *
                         * */
                        if (!err){
                            if(groupDetailResults && groupDetailResults[0] && groupDetailResults[0].length > 0
                                && groupDetailResults[0][0]) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group details loaded successfully';
                                responseMessage.data = groupDetailResults[0];
                                res.status(200).json(responseMessage);
                            }
                            else{
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group details are not available';
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
                            console.log('Error :', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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

router.post('/change_admin', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    /** validation goes here
     * checking that groupId we are getting from front end or not if no then give error
     * if
     * */
    if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }

    /**
     * validating token is mandatory field so cheking whether from front end we are getting or not
     * if not getting then give error
     * */
    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.ezeoneId ) {
        error.ezeoneId = 'Invalid ezeoneId';
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
                    req.body.ezeoneId = req.st.alterEzeoneId(req.body.ezeoneId);
                        var procParams = [
                            req.db.escape(req.body.ezeoneId) ,
                            req.db.escape(req.body.groupId) ,
                            req.db.escape(req.body.token)
                        ];
                        var procQuery = 'CALL p_v1_changegroupadmin(' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, changeAdminResults) {
                            console.log(changeAdminResults,"changeAdminResults");
                            if (!err){
                                if (changeAdminResults &&
                                    changeAdminResults[0] &&
                                    changeAdminResults[0].length > 0 &&
                                    changeAdminResults[0][0].adminUserGroupId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Admin changed successfully';
                                    responseMessage.data = {
                                        adminUserGroupId : changeAdminResults[0][0].adminUserGroupId
                                    }
                                    res.status(200).json(responseMessage);

                                    var notificationTemplaterRes = notificationTemplater.parse('change_admin',{
                                        groupName : changeAdminResults[0][0].groupName,
                                        oldAdminName : changeAdminResults[0][0].oldAdminName
                                    });
                                    console.log(notificationTemplaterRes,"notificationTemplaterRes");
                                    if(notificationTemplaterRes.parsedTpl){
                                        notification.publish(
                                            changeAdminResults[0][0].adminUserGroupId,
                                            changeAdminResults[0][0].groupName,
                                            changeAdminResults[0][0].groupName,
                                            changeAdminResults[0][0].senderId,
                                            notificationTemplaterRes.parsedTpl,
                                            35,
                                            0, changeAdminResults[0][0].iphoneId,
                                            0,
                                            0,
                                            0,
                                            0,
                                            1,
                                            moment().format("YYYY-MM-DD HH:mm:ss"),
                                            '',
                                            0,
                                            0);
                                        console.log('postNotification : notification for change_admin is sent successfully');
                                    }
                                    else{
                                        console.log('Error in parsing notification change_admin template - ',
                                            notificationTemplaterRes.error);
                                        console.log('postNotification : notification for change_admin is sent successfully');
                                    }

                                }
                                else{
                                    var qMsg = {server: 'Internal Server Error'};
                                    switch (changeAdminResults[0][0]._e) {
                                        case 'ACCESS DENIED' :
                                            qMsg = {_e: 'ACCESS DENIED'};
                                            break;
                                        case 'EZEOneId does not exists' :
                                            qMsg = {_e: 'EZEOneId does not exists'};
                                            break;
                                        default:
                                            break;
                                    }
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = qMsg;
                                    responseMessage.data = {};
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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error p_v1_createMessageGroup :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});


/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 * @param id* <int> expense type id
 * @param token* <string> token of login user
 *
 * @discription : API to delete group
 */
router.delete('/:groupId', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    /** validation goes here
     * checking that groupId we are getting from front end or not if no then give error
     * if
     * */
    if (isNaN(parseInt(req.params.groupId)) || (req.params.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }

    /**
     * validating token is mandatory field so cheking whether from front end we are getting or not
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
                    var procParams = [
                        req.db.escape(req.params.groupId) ,
                        req.db.escape(req.body.token)
                    ];
                        var procQuery = 'CALL pDeleteGroup(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, deleteGroupResults) {
                        if (!err){
                            if (deleteGroupResults
                                && deleteGroupResults[0]
                                && deleteGroupResults[0].length>0
                                && deleteGroupResults[0][0].groupId) {

                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group deleted successfully';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                                console.log(deleteGroupResults[1],"deleteGroupResults");
                                if(deleteGroupResults[1] && deleteGroupResults[1].length>0){
                                    for (var i = 0; i < deleteGroupResults[1].length; i++ ) {
                                        var notificationTemplaterRes = notificationTemplater.parse('delete_group',{
                                            groupName : deleteGroupResults[0][0].groupName
                                        });
                                        console.log(notificationTemplaterRes,"notificationTemplaterRes");
                                        if(notificationTemplaterRes.parsedTpl){
                                            notification.publish(
                                                deleteGroupResults[1][i].memberGroupId,
                                                deleteGroupResults[0][0].groupName,
                                                deleteGroupResults[0][0].groupName,
                                                deleteGroupResults[0][0].groupId,
                                                notificationTemplaterRes.parsedTpl,
                                                36,
                                                0, 0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0);
                                            console.log('postNotification : notification for delete_group is sent successfully');
                                        }
                                        else{
                                            console.log('Error in parsing notification delete_group template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for delete_group is sent successfully');
                                        }
                                    }

                                }


                            }
                            else{
                                var qMsg = {server: 'Internal Server Error'};
                                switch (deleteGroupResults[0][0]._e) {
                                    case 'ACCESS DENIED' :
                                        qMsg = {_e: 'ACCESS DENIED'};
                                        break;
                                    default:
                                        break;
                                }
                                responseMessage.status = false;
                                responseMessage.error = null;
                                responseMessage.message = qMsg;
                                responseMessage.data = {};
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            responseMessage.message = 'An error occurred !';
                            res.status(500).json(responseMessage);
                            console.log('Error : pDeleteGroup ', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                    });

                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error pDeleteGroup :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param groupId* <int> group id(Group Id of an individual user or a group where the operation has to be done)
 * @discription : API to leave the group
 */
router.put('/leave', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    /**
     * validation goes here for each param
     */

    var validationFlag = true;
    var error = {};
    if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }

    /**
     * validating for token as token,groupId,userGroupId and status
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
             * validation for token of login user
             * */
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err && tokenResult) {

                    var queryParams = [req.db.escape(req.body.token) ,
                        req.db.escape(req.body.groupId)
                    ];
                    /**
                     * call p_v1_UpdateUserStatus to change the status like accept/reject/block
                     * */
                    var query = 'CALL p_v1_leaveGroup(' + queryParams.join(',') + ')';
                    console.log(query);
                    req.db.query(query, function (err, leaveGroupResult) {
                        if (!err) {
                            if(leaveGroupResult
                                && leaveGroupResult[0]
                                && leaveGroupResult[0].length>0
                            && leaveGroupResult[0][0].senderId)
                            {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'leave group successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                                console.log('p_v1_leaveGroup: leave group successfully');

                                var notificationTemplaterRes = notificationTemplater.parse('leave_group',{
                                    groupName : leaveGroupResult[0][0].groupName,
                                    memberName : leaveGroupResult[0][0].memberName
                                });
                                console.log(notificationTemplaterRes,"notificationTemplaterRes");
                                if(notificationTemplaterRes.parsedTpl){
                                    notification.publish(
                                        leaveGroupResult[0][0].adminGroupId,
                                        leaveGroupResult[0][0].groupName,
                                        leaveGroupResult[0][0].groupName,
                                        leaveGroupResult[0][0].senderId,
                                        notificationTemplaterRes.parsedTpl,
                                        37,
                                        0, leaveGroupResult[0][0].iphoneId,
                                        0,
                                        0,
                                        0,
                                        0,
                                        1,
                                        moment().format("YYYY-MM-DD HH:mm:ss"),
                                        '',
                                        0,
                                        0);
                                    console.log('postNotification : notification for leave_group is sent successfully');
                                }
                                else{
                                    console.log('Error in parsing notification leave_group template - ',
                                        notificationTemplaterRes.error);
                                    console.log('postNotification : notification for leave_group is sent successfully');
                                }

                            }

                            else {
                                var qMsg = {server: 'Internal Server Error'};
                                switch (leaveGroupResult[0][0]._e) {
                                    case 'ACCESS DENIED' :
                                        qMsg = {_e: 'ACCESS DENIED'};
                                        break;
                                    default:
                                        break;
                                }
                                responseMessage.status = false;
                                responseMessage.error = null;
                                responseMessage.message = qMsg;
                                responseMessage.data = {};
                                res.status(200).json(responseMessage);
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
                            console.log('p_v1_leaveGroup: error in updating user status :' + err);
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error : p_v1_leaveGroup ' + ex);
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
 *@param token* <string> token of user
 *@param groupId* <int> group id
 * @discription : API to get pending request of group
 */
router.get('/pending_request', function(req,res,next){
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
if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0 ) {
    error.groupId = 'Invalid group id';
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
                    req.db.escape(req.query.groupId) ,
                    req.db.escape(req.query.token)
                ];
                var procQuery = 'CALL p_v1_pending_requests(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, pendingRequestResults) {
                    /**
                     * while calling procedure if not getting any error and if get result then in response
                     *
                     * */
                    if (!err){
                        //console.log(pendingRequestResults[0],"pendingRequestResults[0]");
                        if(pendingRequestResults && pendingRequestResults[0] && pendingRequestResults[0].length > 0) {
                            if (pendingRequestResults[0][0] && pendingRequestResults[0][0].groupId) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Pending request of group loaded successfully';
                                responseMessage.data = {
                                    memberInvitationList: pendingRequestResults[0]
                                };
                                res.status(200).json(responseMessage);
                            }
                            else {
                                console.log(pendingRequestResults[0][0]._e,"pendingRequestResults[0][0]._e");
                                var qMsg = {server: 'Internal Server Error'};
                                switch (pendingRequestResults[0][0]._e) {
                                    case 'ACCESS DENIED' :
                                        qMsg = {_e: 'ACCESS DENIED'};
                                        break;
                                    default:
                                        break;
                                }
                                responseMessage.status = false;
                                responseMessage.error = null;
                                responseMessage.message = qMsg;
                                responseMessage.data = {};
                                res.status(200).json(responseMessage);

                            }
                        }
                        else{
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Pending request of group is not available';
                            responseMessage.data = {
                                memberInvitationList: []
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
                        console.log('Error :', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    }
                });
            }
            else {
                responseMessage.error = {
                    server: 'Invalid Token'
                };
                responseMessage.message = 'Error in validating Token';
                res.status(401).json(responseMessage);
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

module.exports = router;