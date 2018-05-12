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
var appConfig = require('../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
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

router.post('/', function (req, res, next) {
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
     * value is 0 and if getting then check that its integer or not,if not give error and aboutGroup by default empty string
     *
     * */
    if(!req.query.token){
        error.token='';
        validationFlag *=false;
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

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        req.body.groupId = (req.body.groupId) ? parseInt(req.body.groupId) : 0;
                        req.body.showMembers = (req.body.showMembers) ? parseInt(req.body.showMembers) : 0;
                        req.body.restrictedReply = (req.body.restrictedReply) ? parseInt(req.body.restrictedReply) : 0;
                        req.body.autoJoin = (req.body.autoJoin) ? parseInt(req.body.autoJoin) : 0;
                        req.body.aboutGroup = req.body.aboutGroup ? req.body.aboutGroup : ''
                        if (isNaN(req.body.groupId)) {
                            error.groupId = 'Invalid group Id';
                            validationFlag *= false;
                        }
                        if (isNaN(req.body.showMembers)) {
                            error.showMembers = 'Invalid show member flag';
                            validationFlag *= false;
                        }
                        if (isNaN(req.body.restrictedReply)) {
                            error.restrictedReply = 'Invalid restrictedReply flag';
                            validationFlag *= false;
                        }
                        if (isNaN(req.body.autoJoin)) {
                            error.autoJoin = 'Invalid autoJoin flag';
                            validationFlag *= false;
                        }
                        /**
                         * validating token and groupName is mandatory field so cheking whether from front end we are getting or not
                         * if not getting then give error
                         * */
                        if (!req.body.groupName) {
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
                            var createGroup = function () {
                                var queryParamsList = [
                                    req.db.escape(req.query.token),
                                    req.db.escape(req.body.groupId),
                                    req.db.escape(req.body.groupName),
                                    req.db.escape(req.body.aboutGroup),
                                    req.db.escape(req.body.showMembers),
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
                                            if (req.body.groupId == 0) {
                                                responseMessage.message = 'group created successfully';
                                            }
                                            else {
                                                responseMessage.message = 'group updated successfully';
                                            }
                                            responseMessage.data = {
                                                groupId: results[0][0].groupId,
                                                groupName: req.body.groupName,
                                                aboutGroup: req.body.aboutGroup,
                                                areMembersVisible: req.body.showMembers,
                                                isReplyRestricted: req.body.restrictedReply,
                                                autoJoin: req.body.autoJoin,
                                                adminEzeId: tokenResult[0].ezeoneId,
                                                adminId: tokenResult[0].groupId,
                                                groupStatus: 0,
                                                groupRelationStatus: 1,
                                                groupType: 0,
                                                isAdmin: 1,
                                                luDate: '',
                                                isRequester: 1,
                                                memberCount: 1,
                                                unreadCount: 0
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        /**
                                         * if login user is not admin
                                         * */
                                        else {
                                            var qMsg = { server: 'Internal Server Error' };
                                            switch (results[0][0]._e) {
                                                case 'ACCESS_DENIED':
                                                    qMsg = { _e: 'ACCESS_DENIED' };
                                                    responseMessage.message = "You don't have permission for the following action";
                                                    break;
                                            }
                                            responseMessage.status = false;
                                            responseMessage.error = qMsg;
                                            responseMessage.data = {
                                            };
                                            res.status(400).json(responseMessage);
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
                            if (req.body.groupId == 0) {
                                /**
                                 * call procedure for validating groupname
                                 * */
                                var procParams = [
                                    req.db.escape(req.query.token),
                                    req.db.escape(req.body.groupName)
                                ];
                                var procQuery = 'CALL p_v1_validateGroup(' + procParams.join(',') + ')';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, validateGroupResults) {
                                    /**
                                     * while calling procedure if isAvailable = 1 then call function to create group
                                     *
                                     * */
                                    if (!err) {
                                        if (validateGroupResults &&
                                            validateGroupResults[0] &&
                                            validateGroupResults[0].length > 0 &&
                                            validateGroupResults[0][0].isAvailable == 1) {
                                            createGroup();
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Group Name is not available';
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
                                        console.log('Error :', err);
                                        var errorDate = new Date();
                                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                                    }

                                });
                            }
                            /**
                             * in case of individual directly call the function to create group without validating group name
                             * */

                            else {
                                createGroup();
                            }
                        }
                    });
                    /**
                     * created one function in which we are calling p_v1_createMessageGroup to create group
                     * */


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
 * Method : GET
 * @param req
 * @param res
 * @param next
 *@param token* <string> token of user
 *@param groupName* <string> groupName for validating whether its available or not
 * @discription : API to validate group name
 */
router.get('/validate', function (req, res, next) {
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
                        req.db.escape(req.query.token),
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
                            if (validateGroupResults[0][0].isAvailable == 0) {
                                responseMessage.message = 'Group Name is not available';
                            }
                            else {
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
 * @param ezeoneId <string>
 * @discription : API to add members to the group(admin will call this api)
 */

router.post('/members', function (req, res, next) {
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
    if(!req.query.token){
        error.token='';
        validationFlag *=false;
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
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        var memberList = req.body.memberList;
                        if (typeof (memberList) == "string") {
                            memberList = JSON.parse(memberList);
                        }
                        if (!memberList) {
                            error.itemList = 'Invalid members';
                            validationFlag *= false;
                        }

                        if (isNaN(parseInt(req.body.groupId))) {
                            error.groupId = 'Invalid Group id';
                            validationFlag *= false;
                        }
                        if (!validationFlag) {
                            responseMessage.error = error;
                            responseMessage.message = 'Please check the errors';
                            res.status(400).json(responseMessage);
                            console.log(responseMessage);
                        }
                        else {
                            var queryParams = [
                                req.db.escape(req.body.groupId),
                                req.db.escape(JSON.stringify(memberList)),
                                req.db.escape(req.query.token),
                                req.db.escape(DBSecretKey)
                            ];
                            /**
                             * call p_v1_addmembersbygroup to add members to the group
                             * */
                            var query = 'CALL p_v1_addmembersbygroup(' + queryParams.join(',') + ')';
                            console.log(query);
                            req.db.query(query, function (err, addMemberResult) {
                                if (!err) {
                                    console.log(addMemberResult, "addMemberResult");
                                    /**
                                     * if proc executed successfully then give response true and send notification to mwember of a group
                                     * who is added by admin to accept the request to join the group
                                     * */

                                    if (addMemberResult && addMemberResult[0] && addMemberResult[0].length > 0 && addMemberResult[0][0].userGroupId) {
                                        var contactParams = [
                                            req.db.escape(addMemberResult[0][0].groupName),
                                            req.db.escape(0),
                                            req.db.escape(req.body.groupId)
                                        ];
                                        var contactQuery = 'CALL get_v1_contact(' + contactParams.join(',') + ')';
                                        console.log(contactQuery, "contactQuery");
                                        req.db.query(contactQuery, function (err, contactGroupResult) {
                                            console.log(contactGroupResult, "contactGroupResult");
                                            if (!err) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Member invited to group successfully';
                                                responseMessage.data = {
                                                    userGroupId: addMemberResult[0][0].userGroupId,
                                                    groupName: addMemberResult[0][0].groupName,
                                                    fullName: addMemberResult[0][0].fullName,
                                                    groupStatus: addMemberResult[0][0].groupStatus,
                                                    groupRelationStatus: addMemberResult[0][0].groupRelationStatus,
                                                    luDate: addMemberResult[0][0].luDate,
                                                    isRequester: addMemberResult[0][0].isRequester
                                                };
                                                res.status(200).json(responseMessage);

                                                var notificationTemplaterRes = notificationTemplater.parse('add_members_to_group', {
                                                    groupName: addMemberResult[0][0].groupName,
                                                    adminName: addMemberResult[0][0].adminName
                                                });
                                                console.log(notificationTemplaterRes.parsedTpl, "notificationTemplaterRes.parsedTpl");
                                                for (var i = 0; i < addMemberResult[0].length; i++) {
                                                    if (notificationTemplaterRes.parsedTpl) {
                                                        notification.publish(
                                                            addMemberResult[0][i].userGroupId,
                                                            addMemberResult[0][i].fullName,
                                                            addMemberResult[0][i].groupName,
                                                            addMemberResult[0][i].senderId,
                                                            notificationTemplaterRes.parsedTpl,
                                                            33,
                                                            0, (addMemberResult[0][i].iphoneId) ? addMemberResult[0][i].iphoneId : '',
                                                            (addMemberResult[0][i].GCM_Id) ? addMemberResult[0][i].GCM_Id : '',
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            1,
                                                            moment().format("YYYY-MM-DD HH:mm:ss"),
                                                            '',
                                                            0,
                                                            0,
                                                            null,
                                                            '',
                                                            /** Data object property to be sent with notification **/
                                                            {
                                                                groupId: contactGroupResult[0][0].groupId,
                                                                adminEzeId: contactGroupResult[0][0].adminEzeId,
                                                                adminId: contactGroupResult[0][0].adminId,
                                                                groupName: contactGroupResult[0][0].groupName,
                                                                groupStatus: contactGroupResult[0][0].groupStatus,
                                                                isAdmin: contactGroupResult[0][0].isAdminNew,
                                                                areMembersVisible: contactGroupResult[0][0].areMembersVisible,
                                                                isReplyRestricted: contactGroupResult[0][0].isReplyRestricted,
                                                                groupRelationStatus: addMemberResult[0][i].groupRelationStatus,
                                                                groupType: 0,
                                                                luDate: contactGroupResult[0][0].luDate,
                                                                isRequester: contactGroupResult[0][0].isRequester,
                                                                unreadCount: contactGroupResult[0][0].unreadCount,
                                                                luUser: contactGroupResult[0][0].luUser,
                                                                aboutGroup: contactGroupResult[0][0].aboutGroup,
                                                                memberCount: contactGroupResult[0][0].memberCount,
                                                                autoJoin: contactGroupResult[0][0].autoJoin
                                                            },
                                                            null, tokenResult[0].isWhatMate);
                                                        console.log('postNotification : notification for add members to group is sent successfully');
                                                    }
                                                    else {
                                                        /**
                                                         * it will come in this block when error in notification will come
                                                         * */
                                                        console.log('Error in parsing notification add_members_to_group template - ',
                                                            notificationTemplaterRes.error);
                                                        console.log('postNotification : notification for add members to group not sent');
                                                    }
                                                }

                                            }
                                            else {
                                                responseMessage.message = 'An error occured ! Please try again';
                                                responseMessage.error = {
                                                    server: 'Internal Server Error'
                                                };
                                                res.status(500).json(responseMessage);
                                                console.log('get_v1_contact: error in getting group contact details :' + err);
                                            }
                                        });


                                    }
                                    /***
                                     * if member is not added in group successfully then come in this block to handle all this error
                                     * */
                                    else {
                                        var qMsg = { server: 'Internal Server Error' };
                                        switch (addMemberResult[0][0]._e) {
                                            case 'EZEONEID_NOT_EXIST':
                                                qMsg = { _e: 'EZEONEID_NOT_EXIST' };
                                                responseMessage.message = 'EZEOneId does not exists';
                                                break;
                                            case 'ALREADY_MEMBER':
                                                qMsg = { _e: 'ALREADY_MEMBER' };
                                                responseMessage.message = 'User is already a member of this group';
                                                break;
                                            case 'PENDING_STATUS':
                                                qMsg = { _e: 'PENDING_STATUS' };
                                                responseMessage.message = 'User has not yet accepted your request';
                                                break;
                                            case 'ACCESS_DENIED':
                                                qMsg = { _e: 'ACCESS_DENIED' };
                                                responseMessage.message = "You don't have permission for the following action";
                                                break;
                                            default:
                                                break;
                                        }
                                        responseMessage.status = false;
                                        responseMessage.error = qMsg;
                                        responseMessage.data = {};
                                        res.status(400).json(responseMessage);
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
                                    console.log('p_v1_addmembersbygroup: error in adding member in group :' + err);
                                }
                            });
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
router.post('/join', function (req, res, next) {
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
    if(!req.query.token){
        error.token='';
        validationFlag *=false;
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

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        req.body.groupId = (req.body.groupId) ? parseInt(req.body.groupId) : 0;
                        if (isNaN(req.body.groupId)) {
                            error.groupId = 'Invalid group Id';
                            validationFlag *= false;
                        }
                        if (!validationFlag) {
                            responseMessage.error = error;
                            responseMessage.message = 'Please check the errors';
                            res.status(400).json(responseMessage);
                            console.log(responseMessage);
                        }
                        else {
                            var queryParams = [
                                req.db.escape(req.body.groupId),
                                req.db.escape(req.query.token)
                            ];
                            /**
                             * call p_v1_addmembersbygroup to add members to the group where member will send request to join the group
                             * */
                            var query = 'CALL p_v1_addmemberstogroup(' + queryParams.join(',') + ')';
                            console.log(query);
                            req.db.query(query, function (err, joinGroupResult) {
                                console.log(joinGroupResult[1], "joinGroupResult[1]");
                                if (!err) {
                                    /**
                                     * if proc executed successfully then give response true
                                     * */

                                    if (joinGroupResult && joinGroupResult[0] && joinGroupResult[0].length > 0 && joinGroupResult[0][0].groupId) {
                                        var output = [];
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Your request to join group made successfully';
                                        output.push({
                                            groupId: joinGroupResult[0][0].groupId,
                                            adminEzeId: joinGroupResult[0][0].adminEzeId,
                                            adminId: joinGroupResult[0][0].adminId,
                                            groupName: joinGroupResult[0][0].groupName,
                                            groupStatus: joinGroupResult[0][0].groupStatus,
                                            groupRelationStatus: joinGroupResult[0][0].groupRelationStatus,
                                            groupType: joinGroupResult[0][0].groupType,
                                            isAdmin: joinGroupResult[0][0].isAdmin,
                                            luDate: joinGroupResult[0][0].luDate,
                                            areMembersVisible: joinGroupResult[0][0].areMembersVisible,
                                            isReplyRestricted: joinGroupResult[0][0].isReplyRestricted,
                                            isRequester: joinGroupResult[0][0].isRequester,
                                            unreadCount: joinGroupResult[0][0].unreadCount
                                        });
                                        console.log("output", output);
                                        responseMessage.data = {
                                            groupMemberList: output
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('p_v1_addmembersbygroup: Member added to group successfully');
                                        if (joinGroupResult[0][0].groupType == 0 && joinGroupResult[0][0].groupRelationStatus == 0) {

                                            var notificationTemplaterRes = notificationTemplater.parse('join_group', {
                                                groupName: joinGroupResult[0][0].groupName,
                                                fullName: joinGroupResult[0][0].fullName
                                            });
                                            if (notificationTemplaterRes.parsedTpl) {
                                                notification.publish(
                                                    joinGroupResult[0][0].adminGroupId,
                                                    joinGroupResult[0][0].groupName,
                                                    joinGroupResult[0][0].groupName,
                                                    joinGroupResult[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    34,
                                                    0,
                                                    (joinGroupResult[0][0].iphoneId) ? (joinGroupResult[0][0].iphoneId) : '',
                                                    (joinGroupResult[0][0].GCM_Id) ? (joinGroupResult[0][0].GCM_Id) : '',
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    1,
                                                    moment().format("YYYY-MM-DD HH:mm:ss"),
                                                    '',
                                                    0,
                                                    0,
                                                    null,
                                                    '',
                                                    /** Data object property to be sent with notification **/
                                                    {
                                                        groupId: joinGroupResult[1][0].groupId,
                                                        fullName: joinGroupResult[1][0].fullName,
                                                        groupName: joinGroupResult[1][0].groupName,
                                                        groupRelationStatus: joinGroupResult[1][0].groupRelationStatus,
                                                        groupType: joinGroupResult[1][0].groupType,
                                                        isRequester: joinGroupResult[1][0].isRequester,
                                                        receiverGroupId: joinGroupResult[0][0].groupId
                                                    },
                                                    null, tokenResult[0].isWhatMate);
                                                console.log('postNotification : notification for join_group is sent successfully');
                                            }
                                            else {
                                                console.log('Error in parsing notification join_group template - ',
                                                    notificationTemplaterRes.error);
                                                console.log('postNotification : notification for join_group is sent successfully');
                                            }
                                        }
                                        else {
                                            var notificationTemplaterRes = notificationTemplater.parse('auto_join_group', {
                                                groupName: joinGroupResult[0][0].groupName,
                                                fullName: joinGroupResult[0][0].fullName
                                            });
                                            if (notificationTemplaterRes.parsedTpl) {
                                                notification.publish(
                                                    joinGroupResult[0][0].adminGroupId,
                                                    joinGroupResult[0][0].groupName,
                                                    joinGroupResult[0][0].groupName,
                                                    joinGroupResult[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    34,
                                                    0,
                                                    (joinGroupResult[0][0].iphoneId) ? (joinGroupResult[0][0].iphoneId) : '',
                                                    (joinGroupResult[0][0].GCM_Id) ? (joinGroupResult[0][0].GCM_Id) : '',
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                    1,
                                                    moment().format("YYYY-MM-DD HH:mm:ss"),
                                                    '',
                                                    0,
                                                    0,
                                                    null,
                                                    '',
                                                    /** Data object property to be sent with notification **/
                                                    {
                                                        groupId: joinGroupResult[1][0].groupId,
                                                        fullName: joinGroupResult[1][0].fullName,
                                                        groupName: joinGroupResult[1][0].groupName,
                                                        groupRelationStatus: joinGroupResult[1][0].groupRelationStatus,
                                                        groupType: joinGroupResult[1][0].groupType,
                                                        isRequester: joinGroupResult[1][0].isRequester,
                                                        receiverGroupId: joinGroupResult[0][0].groupId
                                                    },
                                                    null, tokenResult[0].isWhatMate);
                                                console.log('postNotification : notification for join_group is sent successfully');
                                            }
                                            else {
                                                console.log('Error in parsing notification join_group template - ',
                                                    notificationTemplaterRes.error);
                                                console.log('postNotification : notification for join_group is sent successfully');
                                            }
                                        }


                                    }

                                    /**
                                     * if proc executed unsuccessfully then give response false and handle the error which
                                     * we are getting from database
                                     * */
                                    else {
                                        var qMsg = { server: 'Internal Server Error' };
                                        switch (joinGroupResult[0][0]._e) {
                                            case 'ALREADY_MEMBER':
                                                qMsg = { _e: 'ALREADY_MEMBER' };
                                                responseMessage.message = 'Already a member of group';
                                                break;

                                            default:
                                                break;
                                        }
                                        responseMessage.status = true;
                                        responseMessage.error = qMsg;
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
                                    console.log('p_v1_addmemberstogroup: error in join group :' + err);
                                }
                            });
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
            console.log('Error p_v1_addmemberstogroup :  ', ex);
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
router.get('/members', function (req, res, next) {
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
    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }
    if (req.query.timeStamp) {
        if (moment(req.query.timeStamp, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            req.query.timeStamp = moment(req.query.timeStamp, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else {
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
                        req.db.escape(req.query.token),
                        req.db.escape(req.query.groupId),
                        req.db.escape(req.query.timeStamp),
                        req.db.escape(DBSecretKey)
                    ];
                    var procQuery = 'CALL p_v1_getGroupMembers(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, groupMemberResults) {
                        /**
                         *if getting group member list with group id then give list of group members in response
                         * */
                        // console.log(groupMemberResults[0], "groupMemberResults[0]");
                        if (!err) {
                            if (groupMemberResults && groupMemberResults[0] && groupMemberResults[0][0]) {
                                if (groupMemberResults[0][0].groupId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group members list loaded successfully';
                                    responseMessage.data = {
                                        groupMemberList: groupMemberResults[0]
                                    };
                                    res.status(200).json(responseMessage);
                                }
                                /**
                                 * if not grtting groupid then come to this block in which error is
                                 * handled coming from database
                                 * */
                                else {
                                    var qMsg = { server: 'Internal Server Error' };

                                    switch (groupMemberResults[0][0]._e) {
                                        case 'ACCESS_DENIED':
                                            qMsg = { _e: 'ACCESS_DENIED' };
                                            responseMessage.message = "You don't have permission for the following action";
                                            break;
                                        default:
                                            break;
                                    }
                                    responseMessage.status = false;
                                    responseMessage.error = qMsg;
                                    responseMessage.data = {};
                                    res.status(400).json(responseMessage);

                                }
                            }
                            /**
                             * if no groupMemberList is not there then give in response empty array
                             * */
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group members list are not available';
                                responseMessage.data = {
                                    groupMemberList: []
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
router.get('/details', function (req, res, next) {
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
     * validating token and group id(checking that group id is integer or not) as both are mandatory fields
     * */

    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0) {
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
                 * while validating token if not getting any error proceed further otherwise give error
                 * */
                if ((!err) && tokenResult) {

                    /**
                     * call procedure for getting group details
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
                        if (!err) {
                            if (groupDetailResults && groupDetailResults[0] && groupDetailResults[0].length > 0
                                && groupDetailResults[0][0]) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group details loaded successfully';
                                responseMessage.data = groupDetailResults[0][0];
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group details are not available';
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
 * @param ezeoneId*<string>
 * @discription : API to change admin of group(call by group admin)
 */

router.post('/change_admin', function (req, res, next) {
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
    if(!req.query.token){
        error.token='';
        validationFlag *=false;
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

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                /**
                 * */
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0) {
                            error.groupId = 'Invalid group id';
                            validationFlag *= false;
                        }

                        /**
                         * validating token is mandatory field so checking whether from front end we are getting or not
                         * if not getting then give error
                         * */
                        if (!req.body.ezeoneId) {
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
                            req.body.ezeoneId = req.st.alterEzeoneId(req.body.ezeoneId);
                            var procParams = [
                                req.db.escape(req.body.ezeoneId),
                                req.db.escape(req.body.groupId),
                                req.db.escape(req.query.token),
                                req.db.escape(DBSecretKey)
                            ];

                            /**
                             * calling p_v1_changegroupadmin to change the admin of the group
                             * */
                            var procQuery = 'CALL p_v1_changegroupadmin(' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, changeAdminResults) {
                                console.log(changeAdminResults, "changeAdminResults");
                                if (!err) {
                                    if (changeAdminResults &&
                                        changeAdminResults[0] &&
                                        changeAdminResults[0].length > 0 &&
                                        changeAdminResults[0][0].adminUserGroupId) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Admin changed successfully';
                                        responseMessage.data = {
                                            adminUserGroupId: changeAdminResults[0][0].adminUserGroupId
                                        }
                                        res.status(200).json(responseMessage);

                                        var notificationTemplaterRes = notificationTemplater.parse('change_admin', {
                                            groupName: changeAdminResults[0][0].groupName,
                                            oldAdminName: changeAdminResults[0][0].oldAdminName
                                        });
                                        console.log(notificationTemplaterRes, "notificationTemplaterRes");
                                        if (notificationTemplaterRes.parsedTpl) {
                                            notification.publish(
                                                changeAdminResults[0][0].adminUserGroupId,
                                                changeAdminResults[0][0].groupName,
                                                changeAdminResults[0][0].groupName,
                                                changeAdminResults[0][0].senderId,
                                                notificationTemplaterRes.parsedTpl,
                                                35,
                                                0,
                                                changeAdminResults[0][0].iphoneId,
                                                changeAdminResults[0][0].GCM_Id,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0, null, null, null, null, tokenResult[0].isWhatMate);
                                            console.log('postNotification : notification for change_admin is sent successfully');
                                        }
                                        else {
                                            console.log('Error in parsing notification change_admin template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for change_admin is sent successfully');
                                        }

                                    }
                                    /**
                                     * handled all error coming from database if member is try to change the admin,
                                     * if ezeone not exist then return error
                                     *  */
                                    else {
                                        var qMsg = { server: 'Internal Server Error' };
                                        switch (changeAdminResults[0][0]._e) {
                                            case 'ACCESS_DENIED':
                                                qMsg = { _e: 'ACCESS_DENIED' };
                                                responseMessage.message = "You don't have permission for the following action";
                                                break;
                                            case 'EZEONEID_DOES_NOT_EXISTS':
                                                qMsg = { _e: 'EZEOneId does not exists' };
                                                responseMessage.message = "EZEOneId does not exists";
                                                break;
                                            default:
                                                break;
                                        }
                                        responseMessage.status = false;
                                        responseMessage.error = qMsg;
                                        responseMessage.data = {};
                                        res.status(400).json(responseMessage);
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
 * @param groupId* <int> group id
 * @param token* <string> token of login user
 *
 * @discription : API to delete group(This API will be called only by group Admin)
 */
router.delete('/:groupId', function (req, res, next) {
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
    if (isNaN(parseInt(req.params.groupId)) || (req.params.groupId) < 0) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }

    /**
     * validating token is mandatory field so checking whether from front end we are getting or not
     * if not getting then give error
     * */
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

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var procParams = [
                        req.db.escape(req.params.groupId),
                        req.db.escape(req.query.token),
                        req.st.db.escape(DBSecretKey)
                    ];
                    /**
                     * calling procedure to delete group by admin
                     * */
                    var procQuery = 'CALL pDeleteGroup(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, deleteGroupResults) {
                        if (!err) {
                            if (deleteGroupResults
                                && deleteGroupResults[0]
                                && deleteGroupResults[0].length > 0
                                && deleteGroupResults[0][0].groupId) {

                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Group deleted successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);

                                console.log(deleteGroupResults[1], "deleteGroupResults");
                                if (deleteGroupResults[1] && deleteGroupResults[1].length > 0) {
                                    for (var i = 0; i < deleteGroupResults[1].length; i++) {
                                        var notificationTemplaterRes = notificationTemplater.parse('delete_group', {
                                            groupName: deleteGroupResults[0][0].groupName
                                        });
                                        console.log(notificationTemplaterRes, "notificationTemplaterRes");
                                        if (notificationTemplaterRes.parsedTpl) {
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
                                                0, null, null, null, null, tokenResult[0].isWhatMate);
                                            console.log('postNotification : notification for delete_group is sent successfully');
                                        }
                                        else {
                                            console.log('Error in parsing notification delete_group template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for delete_group is sent successfully');
                                        }
                                    }

                                }
                                /**
                                 * if admin is not calling this api then return error
                                 * */

                            }
                            else {
                                var qMsg = { server: 'Internal Server Error' };
                                switch (deleteGroupResults[0][0]._e) {
                                    case 'ACCESS_DENIED':
                                        qMsg = { _e: 'ACCESS_DENIED' };
                                        responseMessage.message = "You don't have permission for the following action";
                                        break;
                                    default:
                                        break;
                                }
                                responseMessage.status = false;
                                responseMessage.error = qMsg;
                                responseMessage.data = null;
                                res.status(400).json(responseMessage);
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
router.put('/leave', function (req, res, next) {
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

    /**
     * validating for token as token,groupId,userGroupId and status
     * */
    if(!req.query.token){
        error.token='';
        validationFlag *=false;
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
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0) {
                            error.groupId = 'Invalid group id';
                            validationFlag *= false;
                        }

                        /**
                         * validating for token as token,groupId,userGroupId and status
                         * */
                        if (!validationFlag) {
                            responseMessage.error = error;
                            responseMessage.message = 'Please check the errors';
                            res.status(400).json(responseMessage);
                            console.log(responseMessage);
                        }
                        else {
                            var queryParams = [
                                req.db.escape(req.query.token),
                                req.db.escape(req.body.groupId),
                                req.db.escape(DBSecretKey)
                            ];
                            /**
                             * call p_v1_UpdateUserStatus to change the status like accept/reject/block
                             * if not admin then only able to leave group
                             * */
                            var query = 'CALL p_v1_leaveGroup(' + queryParams.join(',') + ')';
                            console.log(query);
                            req.db.query(query, function (err, leaveGroupResult) {
                                if (!err) {
                                    if (leaveGroupResult
                                        && leaveGroupResult[0]
                                        && leaveGroupResult[0].length > 0
                                        && leaveGroupResult[0][0].senderId) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'leave group successfully';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                        console.log('p_v1_leaveGroup: leave group successfully');

                                        var notificationTemplaterRes = notificationTemplater.parse('leave_group', {
                                            groupName: leaveGroupResult[0][0].groupName,
                                            memberName: leaveGroupResult[0][0].memberName
                                        });
                                        console.log(notificationTemplaterRes, "notificationTemplaterRes");
                                        if (notificationTemplaterRes.parsedTpl) {
                                            notification.publish(
                                                leaveGroupResult[0][0].adminGroupId,
                                                leaveGroupResult[0][0].groupName,
                                                leaveGroupResult[0][0].groupName,
                                                leaveGroupResult[0][0].senderId,
                                                notificationTemplaterRes.parsedTpl,
                                                37,
                                                0,
                                                leaveGroupResult[0][0].iphoneId,
                                                leaveGroupResult[0][0].GCM_Id,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0, null, null, null, null, tokenResult[0].isWhatMate);
                                            console.log('postNotification : notification for leave_group is sent successfully');
                                        }
                                        else {
                                            console.log('Error in parsing notification leave_group template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for leave_group is sent successfully');
                                        }

                                    }

                                    else {
                                        var qMsg = { server: 'Internal Server Error' };
                                        switch (leaveGroupResult[0][0]._e) {
                                            case 'ACCESS_DENIED':
                                                qMsg = { _e: 'ACCESS_DENIED' };
                                                responseMessage.message = "You don't have permission for the following action";
                                                break;
                                            default:
                                                break;
                                        }
                                        responseMessage.status = false;
                                        responseMessage.error = qMsg;
                                        responseMessage.data = null;
                                        res.status(400).json(responseMessage);
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
 * @discription : API to get pending request of group(This API will be called by group Admin only)
 */
router.get('/pending_request', function (req, res, next) {
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

    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0) {
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
                     * call procedure for getting pending request by admin only
                     * */
                    var procParams = [
                        req.db.escape(req.query.groupId),
                        req.db.escape(req.query.token),
                        req.db.escape(DBSecretKey)
                    ];
                    var procQuery = 'CALL p_v1_pending_requests(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, pendingRequestResults) {
                        /**
                         * while calling procedure if not getting any error and if get result then in response of all pending request
                         *
                         * */
                        if (!err) {
                            //console.log(pendingRequestResults[0],"pendingRequestResults[0]");
                            if (pendingRequestResults && pendingRequestResults[0] && pendingRequestResults[0].length > 0) {
                                if (pendingRequestResults[0][0] && pendingRequestResults[0][0].groupId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Pending request of group loaded successfully';
                                    responseMessage.data = {
                                        memberInvitationList: pendingRequestResults[0]
                                    };
                                    res.status(200).json(responseMessage);
                                }
                                /**
                                 * if member is trying to get pending request then will get error
                                 * */
                                else {
                                    var qMsg = { server: 'Internal Server Error' };
                                    switch (pendingRequestResults[0][0]._e) {
                                        case 'ACCESS_DENIED':
                                            qMsg = { _e: 'ACCESS_DENIED' };
                                            responseMessage.message = "You don't have permission for the following action";
                                            break;
                                        default:
                                            break;
                                    }
                                    responseMessage.status = false;
                                    responseMessage.error = qMsg;
                                    responseMessage.data = {};
                                    res.status(400).json(responseMessage);

                                }
                            }
                            else {
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