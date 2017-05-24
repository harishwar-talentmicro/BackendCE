/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title contact of message module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');
var Sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');

var notification = null;
var NotificationTemplater = require('../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../modules/notification/notification-master.js');
var notification = new Notification();
var request = require('request');

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get serach contacts
 */
router.get('/query', function(req,res,next){
    var ezeTerm = req.query.q;
    var title = null;
    var pin = null;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    /**
     * validation goes here for each param
     */
    if(!ezeTerm){
        error.q = 'EZEOne ID not found';
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
                if (!err && tokenResult) {
                    var ezeArr = ezeTerm.split('.');
                    title = ezeArr;
                    if (ezeArr.length > 1) {
                        title = ezeArr[0];

                        /**
                         * If user may have passed the pin
                         * and therefore validating pin using standard rules
                         */
                        if (!isNaN(parseInt(ezeArr[1])) && ezeArr[1].length > 2 && parseInt(ezeArr[1]) > 0 && parseInt(ezeArr[1]) < 1000) {
                            pin = parseInt(ezeArr[1]).toString();
                        }

                    }
                    var procParams = [
                        req.db.escape(title) ,
                        req.db.escape(pin) ,
                        req.db.escape(req.query.token)
                    ];
                    var procQuery = 'CALL get_v1_messagebox_contact(' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        if (!err) {
                            console.log(results);
                            if (results && results[0] && results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts loaded successfully';
                                responseMessage.data = {
                                    contactSuggestionList :results[0]
                                };
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts not available';
                                responseMessage.data = {
                                    contactSuggestionList :[]
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
                            console.log('Error : get_v1_messagebox_contact ', err);
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
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
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
 *@param token <string> token of user
 *@param dateTime <datetime> dateTime from this time modified contact we will give
 *@param isWeb <int> isWeb is just a flaf for web 1 and for mobile 0
 * @discription : API to get messagebox contact list
 */
router.get('/', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    /**
     * validation goes here for each param
     * checking that datetime is in valid format or not
     * isweb is flag if its 1 then req comes from web and if 0 then its from mobile
     */

    var groupId;

    var attendenceCount = 0;
    var attendence = [] ;
    if(req.query.dateTime){
        if(moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.dateTime = moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.query.dateTime = null;
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
                if ((!err) && tokenResult) {
                    var procParams = [
                        req.db.escape(req.query.token) ,
                        req.db.escape(req.query.dateTime)
                    ];
                    var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams.join(' ,') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, contactResults) {
                        if (!err) {
                            /**
                             *if results are there then check for condition that its web or not
                             * */
                            if (contactResults && contactResults[0] && contactResults[0].length > 0) {
                                /**
                                 *if request comes from web then call PGetUnreadMessageCountofGroup procedure
                                 * to get unread count of messages because mobile people will save this count in their local sqllite
                                 * */
                                var unreadCountqueryParams = req.db.escape(req.query.token);
                                var unreadCountQuery = 'CALL PGetUnreadMessageCountofGroup(' + unreadCountqueryParams + ')';
                                console.log(unreadCountQuery,"unreadCountQuery");
                                req.db.query(unreadCountQuery, function (err, countResults) {
                                    if (countResults && countResults[0] && countResults[0].length > 0) {
                                        for (var i = 0; i < contactResults[0].length; i++) {
                                            /**
                                             * assign all values of group id in a variable
                                             * */

                                            contactResults[0][i].thumbnailImage = (contactResults[0][i].groupType == 1) ?
                                                ((contactResults[0][i].thumbnailImage) ?
                                                req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(contactResults[0][i].thumbnailImage) : '') :
                                                req.CONFIG.CONSTANT.GROUP_ICON_URL;
                                            console.log('contactResults[0][i].thumbnailImage',contactResults[0][i].thumbnailImage);
                                            groupId = contactResults[0][i].groupId;

                                            // contactResults[0][i].attendence = isAttendence;


                                            for (var j = 0; j < countResults[0].length; j++) {
                                                /**
                                                 * compare both group id getting from both proc if equal then push unreadcount to first results
                                                 * only in web condition
                                                 * */


                                                if (groupId == countResults[0][j].groupID) {
                                                    //console.log(countResults[0][j].groupID,"countResults[0][j].groupID");
                                                    contactResults[0][i].unreadCount = countResults[0][j].count;
                                                }
                                            }
                                        }
                                        contactList.push(results[0]);
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Contact list loaded successfully';
                                        responseMessage.data = {
                                            contactList:contactResults[0]
                                        };
                                        res.status(200).json(responseMessage);
                                    }
                                    else{
                                        var isAttendence = 0;
                                        for(var i = 0; i < contactResults[0].length; i++){



                                            contactResults[0][i].thumbnailImage = (contactResults[0][i].groupType == 1) ?
                                                ((contactResults[0][i].thumbnailImage) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(contactResults[0][i].thumbnailImage) : '') :
                                                req.CONFIG.CONSTANT.GROUP_ICON_URL;

                                        }

                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Contact list loaded successfully';
                                        responseMessage.data = {
                                            contactList:contactResults[0]
                                        };
                                        res.status(200).json(responseMessage);
                                    }
                                });


                            }
                            else{
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Contact list not available';
                                responseMessage.data = {
                                    contactList:[]
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
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
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
 * @param status* <int> is group id
 * @param userGroupId* <int> (Group Id of a user on whom operation is done)
 *
 * @discription : API to change status of contacts
 */
router.put('/status', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    /**
     * validation goes here for each param
     */

    var validationFlag = true;
    var error = {};
    req.body.groupId  = parseInt(req.body.groupId);   // groupid of receiver
    req.body.status  = parseInt(req.body.status);      // Status 0 : Pending, 1: Accepted, 2 : Rejected, 3 : Leaved, 4 : Removed
    req.body.userGroupId  = parseInt(req.body.userGroupId);

    /**
     * validating for token as token,groupId,userGroupId and status
     * */
    if (isNaN(parseInt(req.body.groupId))) {
        error.groupId = 'Invalid Group id';
        validationFlag *= false;
    }
    if(isNaN(parseInt(req.body.userGroupId))){
        error.userGroupId = 'Invalid userGroupId';
        validationFlag *= false;
    }
    /**
     * If status is 0 it means user is trying to make this connection pending again and therefore it's not possible
     * so show him error message
     */
    if(isNaN(parseInt(req.body.status)) || (!parseInt(req.body.status))){
        error.status = 'Invalid status';
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

                    var queryParams = [
                        req.db.escape(req.body.token) ,
                        req.db.escape(req.body.groupId) ,
                        req.db.escape(req.body.status) ,
                        req.db.escape(req.body.userGroupId)
                    ];
                    var notifyParams = [
                        req.db.escape(req.body.token) ,
                        req.db.escape(req.body.groupId)
                    ];
                    /**
                     * call p_v1_UpdateUserStatus to change the status like accept/reject/block
                     * */
                    var query = 'CALL p_v1_UpdateUserStatus(' + queryParams.join(',') + ');' +
                        '           CALL pnotify_on_status_change(' + notifyParams.join(',') + ');';
                    console.log(query);
                    req.db.query(query, function (err, updateResult) {
                        if (!err) {
                            /**
                             * if proc executed successfully then give response true
                             * */
                            console.log('updateResult',updateResult);


                            if (updateResult
                                && updateResult[0]
                                && updateResult[0].length > 0 && updateResult[0][0]) {
                                switch (updateResult[0][0]._e) {
                                    /**
                                     * This error will only come when for the group any other user has called this API who
                                     * is not a groupAdmin
                                     */
                                    case 'ACCESS_DENIED' :
                                        qMsg = {_e: 'ACCESS_DENIED'};
                                        responseMessage.message = "You don't have permission for the following action";
                                        responseMessage.error = qMsg;
                                        responseMessage.data = null;
                                        res.status(400).json(responseMessage);
                                        break;
                                    case 'NO_RELATION_EXISTS' :
                                        qMsg = {_e : 'NO_RELATION_EXISTS '};
                                        responseMessage.message = "You don't have permission for the following action";
                                        responseMessage.error = qMsg;
                                        responseMessage.data = null;
                                        res.status(400).json(responseMessage);
                                        break;
                                    default :
                                        console.log('updateResult[0][0].userGroupId',updateResult[0][0].userGroupId);
                                        if(updateResult[0][0].userGroupId){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'User status updated successfully';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                        else{
                                            responseMessage.status = false;
                                            responseMessage.error = { server : 'Internal server error'};
                                            responseMessage.message = 'Something went wrong!';
                                            responseMessage.data = null;
                                            res.status(400).json(responseMessage);
                                        }
                                        break;
                                }
                                var notificationTemplaterRes;
                                /**
                                 *preparing template according to all status for rejecting/accepting/removed from group
                                 * */
                                updateResult[3][0].requesterGroupId = req.body.groupId;
                                console.log('updateResult[3]',updateResult[3]);
                                var sendDeleteNotificationFlag = false;
                                switch (updateResult[0][0].status) {
                                    case req.CONFIG.CONSTANT.EZEONE_MESSAGE_ACCEPT_STATUS :
                                        notificationTemplaterRes = notificationTemplater.parse('accept_request',{
                                            adminName : (updateResult[3][0].fullName) ? updateResult[3][0].fullName : '',
                                            groupName : (updateResult[0][0].groupName) ? updateResult[0][0].groupName : ''
                                        });
                                        break;
                                    case req.CONFIG.CONSTANT.EZEONE_MESSAGE_REJECT_STATUS :
                                        notificationTemplaterRes = notificationTemplater.parse('reject_request',{
                                            adminName : (updateResult[0][0].adminName) ? updateResult[0][0].adminName : '',
                                            groupName : (updateResult[0][0].groupName) ? updateResult[0][0].groupName : ''
                                        });
                                        if(notificationTemplaterRes.parsedTpl){
                                            notification.publish(
                                                req.body.userGroupId,
                                                updateResult[0][0].groupName,
                                                updateResult[0][0].groupName,
                                                updateResult[0][0].senderId,
                                                notificationTemplaterRes.parsedTpl,
                                                32,
                                                0, '',
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
                                                updateResult[3][0],
                                                null);
                                            console.log('postNotification : notification is sent successfully');
                                        }
                                        else{
                                            console.log('Error in parsing notification reject_request template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification  is sent successfully');
                                        }
                                        break;
                                    case req.CONFIG.CONSTANT.EZEONE_MESSAGE_REMOVE_STATUS :
                                        sendDeleteNotificationFlag = true;
                                        notificationTemplaterRes = notificationTemplater.parse('removed_from_group',{
                                            adminName : (updateResult[3][0].fullName) ? updateResult[3][0].fullName : '',
                                            groupName : (updateResult[0][0].groupName) ? updateResult[0][0].groupName : ''
                                        });
                                        break;
                                    default :
                                        break;
                                }
                                //if(updateResult[0][0].status == 1){
                                //    var notificationTemplaterRes = notificationTemplater.parse('accept_request',{
                                //        adminName : (updateResult[0][0].adminName) ? updateResult[0][0].adminName : '',
                                //        groupName : (updateResult[0][0].groupName) ? updateResult[0][0].groupName : ''
                                //    });
                                //}
                                //else{
                                //    var notificationTemplaterRes = notificationTemplater.parse('reject_request',{
                                //        adminName : (updateResult[0][0].adminName) ? updateResult[0][0].adminName : '',
                                //        groupName : (updateResult[0][0].groupName) ? updateResult[0][0].groupName : ''
                                //    });
                                //}
                                console.log('FnUpdateUserStatus: User status updated successfully');

                                console.log(updateResult[0][0].status,"updateResult[0][0].status");
                                /**
                                 * all active member of group will get silent notification
                                 * */
                                for(var i=0;i<updateResult[2].length;i++){
                                    switch(updateResult[0][0].status){
                                        case req.CONFIG.CONSTANT.EZEONE_MESSAGE_ACCEPT_STATUS :
                                            if(notificationTemplaterRes.parsedTpl){
                                                notification.publish(
                                                    updateResult[2][i].groupId,
                                                    updateResult[0][0].groupName,
                                                    updateResult[0][0].groupName,
                                                    updateResult[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    32,
                                                    0, '',
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
                                                    updateResult[3][0],
                                                    null);
                                                console.log('postNotification : notification is sent successfully');
                                            }
                                            else{
                                                console.log('Error in parsing notification accept_request template - ',
                                                    notificationTemplaterRes.error);
                                                console.log('postNotification : notification  is sent successfully');
                                            }
                                            break;
                                        case req.CONFIG.CONSTANT.EZEONE_MESSAGE_REMOVE_STATUS:
                                            if(notificationTemplaterRes.parsedTpl){
                                                notification.publish(
                                                    updateResult[2][i].groupId,
                                                    updateResult[0][0].groupName,
                                                    updateResult[0][0].groupName,
                                                    updateResult[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    32,
                                                    0, '',
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
                                                    updateResult[3][0],
                                                    null);
                                                console.log('postNotification : notification is sent successfully');
                                            }
                                            else{
                                                console.log('Error in parsing notification removed_from_group template - ',
                                                    notificationTemplaterRes.error);
                                                console.log('postNotification : notification  is sent successfully');
                                            }
                                            break;
                                        default :
                                            break;
                                    }

                                }

                                /**
                                 * Sending notification to the member who is actually removed from this group
                                 * It will be silent notification and he is now not an active member also
                                 */
                                if(sendDeleteNotificationFlag && notificationTemplaterRes.parsedTpl){
                                    notification.publish(
                                        req.body.userGroupId,
                                        updateResult[0][0].groupName,
                                        updateResult[0][0].groupName,
                                        updateResult[0][0].senderId,
                                        notificationTemplaterRes.parsedTpl,
                                        32,
                                        0, '',
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
                                        updateResult[3][0],
                                        null);
                                    console.log('postNotification : notification is sent successfully');
                                }
                                else{
                                    console.log('Error in parsing notification accept_request template - ',
                                        notificationTemplaterRes.error);
                                    console.log('postNotification : notification  is sent successfully');
                                }
                            }
                            /**
                             * if proc executed unsuccessfully then give response false
                             * */
                            else {
                                var qMsg = {server: 'Internal Server Error'};
                                responseMessage.status = false;


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
                            console.log('p_v1_UpdateUserStatus: error in updating user status :' + err);
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
            console.log('Error : p_v1_UpdateUserStatus ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

router.post('/hello',function(req,res,next){
    Sendgrid.send({
        from: 'ap.anjalipandya@gmail.com', // From address
        to: 'tinipandya19@gmail.com', // To address
        subject: 'Hello World!', // Subject
        text: 'Sendgrid on Google App Engine with Node.js' // Content
    }, function (err) {
        if (err) {
            return next(err);
        }
        // Render the index route on success
        return res.send({
            sent: true
        });
    });
});

router.post('/addressBook',function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};
    var contactList = req.body.contactList;
    if(typeof(contactList) == "string") {
        contactList = JSON.parse(contactList);
    }
    if(!contactList){
        contactList = [];
    }

    var mobileCount = 0;
    var mobileData = contactList[mobileCount];
    var message;
    var attachmentObject = '';
    var senderGroupId;
    var mobileList = '';
    var indiaMobileList = '';
    var nepalMobileList = '';

    var messageId = 0 ;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

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
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){

                    // var sendInvitation = function(){
                    //     if(mobileList!='') {
                    //         mobileList = mobileList.substr(0, mobileList.length - 1);
                    //         request({
                    //             url: 'http://sms.ssdindia.com/api/sendhttp.php',
                    //             qs: {
                    //                 authkey: '12909AK9RbCdvLf57d63bfc',
                    //                 mobiles: mobileList,
                    //                 message: "You have received a message from " + tokenResult[0].fullName + " . Click on the following link based on your mobile phone type to download App.  Sign-up as new user to view messages." +
                    //                 "\n\n" +
                    //                 "For Android:  https://www.ezeone.com/EZEONE.android " +
                    //                 "\n\n" +
                    //                 "For iOS: https://www.ezeone.com/EZEONE.ios " +
                    //                 "\n\n" +
                    //                 "Hope you will enjoy using EZEOne." +
                    //                 "\n\n" +
                    //                 "EZEOne Team",
                    //                 sender: 'EZEONE',
                    //                 route: 4
                    //             },
                    //             method: 'GET'
                    //
                    //         }, function (error, response, body) {
                    //             if (error) {
                    //                 console.log(error);
                    //                console.log('Error :', err);
                    //         responseMessage.error = {
                    //             server: 'Internal Server Error'
                    //         };
                    //         responseMessage.message = 'An error occurred !';
                    //         res.status(500).json(responseMessage);
                    //             }
                    //             else {
                    //                 console.log("Message sent successfully");
                    //                 console.log("Messege body is :" + body);
                    //                  responseMessage.status = true;
                    //         responseMessage.error = null;
                    //         responseMessage.message = 'Message sent successfully';
                    //         responseMessage.data = null;
                    //         res.status(200).json(responseMessage);
                    //             }
                    //
                    //         });
                    //     }
                    //     else{
                    //         responseMessage.status = true;
                    //         responseMessage.error = null;
                    //         responseMessage.message = 'Message sent successfully';
                    //         responseMessage.data = null;
                    //         res.status(200).json(responseMessage);
                    //     }
                    // };

                    var sendInvitation = function(){
                        if(mobileList != "")
                        {
                            mobileList = mobileList.substr(0,mobileList.length - 1);
                            console.log(mobileList,"mobileList");
                            //  sms integration for international (except nepal)
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name : 'janardana@hirecraft.com',
                                    password : 'Ezeid2015',
                                    sender_id : 'EZEONE',
                                    service : 'INTSMS',
                                    mobile_no: mobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    method : 'send_sms'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);
                                }

                            });

                        }

                        if(indiaMobileList != "")
                        {
                            indiaMobileList = indiaMobileList.substr(0,indiaMobileList.length - 1);
                            console.log(indiaMobileList,"indiaMobileList");
                            //  sms integration for india
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name : 'janardana@hirecraft.com',
                                    password : 'Ezeid2015',
                                    sender_id : 'EZEONE',
                                    service : 'TRANS',
                                    mobile_no: indiaMobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    method : 'send_sms'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);
                                }

                            });

                        }

                        if(nepalMobileList != "")
                        {
                            /*  SMS integration for nepal */
                            nepalMobileList = nepalMobileList.substr(0,nepalMobileList.length - 1);
                            console.log(nepalMobileList,"nepalMobileList");
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to : nepalMobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    sender: 'Techingen'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);

                                }

                            });
                        }

                        res.json({ status : true, auth: false, message: 'Message sent successfully..',data : null});
                    };

                    var inviteMobile = function(mobileData){
                        console.log(req.body.message,"req.body.message-------------");
                        switch(req.body.messageType) {
                            case 0 :
                                message = req.body.message;
                                break;

                            case 2 :
                                var jsonDistanceObject = {
                                    latitude: req.body.latitude,
                                    longitude: req.body.longitude,
                                    text: (req.body.message) ? (req.body.message) : '',
                                    attachmentLink: req.st.getOnlyAttachmentName(req.body.attachmentLink),
                                    thumbnailLink:  req.st.getOnlyAttachmentName(req.body.thumbnailLink),
                                    fileName: req.body.fileName,
                                    mimeType: req.body.mimeType
                                };
                                message = JSON.stringify(jsonDistanceObject);
                                break;

                            case 3 :
                                var jsonAttachObject = {
                                    thumbnailLink:  req.st.getOnlyAttachmentName(req.body.thumbnailLink),
                                    attachmentLink: req.st.getOnlyAttachmentName(req.body.attachmentLink),
                                    fileName: req.body.fileName,
                                    mimeType: req.body.mimeType,
                                    text: (req.body.message) ? (req.body.message) : ''
                                };

                                message = JSON.stringify(jsonAttachObject);

                                break;

                            default :
                                message = "";
                                break;


                        }
                        var queryParams = req.st.db.escape(req.query.token) + ',' + req.st.db.escape(mobileData.mobile) + ',' + req.st.db.escape(mobileData.isdMobile)+ ',' + req.st.db.escape(mobileData.firstName)+ ',' + req.st.db.escape(mobileData.lastName)+ ',' + req.st.db.escape(mobileData.groupId);
                        var addressBookQry = 'CALL addressBook(' + queryParams + ')';
                        console.log('addressBookQry',addressBookQry);
                        req.db.query(addressBookQry, function (err, results) {
                            if (!err) {
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            var autoJoinQueryParams = [
                                                req.db.escape(req.query.token),
                                                req.db.escape(results[0][0].receiverGroupId)
                                            ];
                                            var autoJoinQuery = 'CALL pautojoin_before_Composing(' + autoJoinQueryParams.join(',') + ')';
                                            console.log(autoJoinQuery, "autoJoinQuery");
                                            req.db.query(autoJoinQuery, function (err, autoJoinResults) {
                                                if (!err) {
                                                    var procParams = [
                                                        req.db.escape(req.query.token),
                                                        req.db.escape(autoJoinResults[0][0].groupRelationStatus),
                                                        req.db.escape(autoJoinResults[0][0].luUser),
                                                        req.db.escape(results[0][0].receiverGroupId),
                                                        req.db.escape(mobileData.groupType),
                                                        req.db.escape(message),
                                                        req.db.escape(req.body.messageType)
                                                    ];
                                                    var contactParams = [
                                                        req.db.escape(req.st.alterEzeoneId(tokenResult[0].ezeoneId)),
                                                        req.db.escape(tokenResult[0].pin),
                                                        req.db.escape(results[0][0].receiverGroupId)
                                                    ];
                                                    var procQuery = 'CALL addressBook_compose_message(' + procParams.join(', ') + ');CALL get_v1_contact(' + contactParams.join(', ') + ');';
                                                    console.log(procQuery);
                                                    req.db.query(procQuery, function (err, results) {
                                                        if (!err) {
                                                            /**
                                                             * if not getting any error from db and proc called successfully then send response with status true
                                                             **/
                                                            console.log(results, "results");
                                                            if (results && results[0] && results[0].length > 0 && results[0][0].messageId) {

                                                                switch (req.body.messageType) {
                                                                    case 3:

                                                                        /**
                                                                         * @TODO Write a function in stdlib which see that attachment link is having bucket url or not if not having then add it otherwise remove and add it from EZEOne standard configuration
                                                                         */
                                                                        attachmentObject = JSON.parse(results[0][0].message);
                                                                        attachmentObject.attachmentLink = (attachmentObject.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.attachmentLink) : '';
                                                                        attachmentObject.thumbnailLink = (attachmentObject.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.thumbnailLink) : '';

                                                                        console.log(attachmentObject, "attachmentObject");
                                                                        results[0][0].message = attachmentObject;
                                                                        break;
                                                                    case 2:
                                                                        attachmentObject = JSON.parse(results[0][0].message);
                                                                        attachmentObject.attachmentLink = (attachmentObject.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.attachmentLink) : '';
                                                                        attachmentObject.thumbnailLink = (attachmentObject.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.thumbnailLink) : '';
                                                                        results[0][0].message = attachmentObject;
                                                                        break;
                                                                    default:

                                                                        break;
                                                                }
                                                                /**notification send to user to whome message is sending*/
                                                                if (results[1] && results[1].length > 0) {
                                                                    console.log(results[0][0].groupId, "groupId");
                                                                    console.log(results[0][0].senderId, "sender");
                                                                    console.log(results[0][0].groupType, "groupType");
                                                                    if (results[0][0].groupType == 0) {
                                                                        senderGroupId = results[0][0].groupId;
                                                                        var notificationTemplaterRes = notificationTemplater.parse('compose_message_group', {
                                                                            senderName: results[0][0].senderName,
                                                                            groupName: results[1][0].groupName
                                                                        });
                                                                        console.log(notificationTemplaterRes, "notificationTemplaterRes");
                                                                    }
                                                                    else {
                                                                        senderGroupId = results[0][0].senderId;
                                                                        notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                                                            senderName: results[0][0].senderName
                                                                        });
                                                                    }
                                                                    console.log(results[0][0].messageType, "messageType");

                                                                    /**
                                                                     * Condtion should be like this in restricted reply case
                                                                     * (Already handled by vedha on DB side)
                                                                     *
                                                                     * When any other user is messaging in the restricted reply group
                                                                     * then notification and message should only go to admin and not to other persons
                                                                     * of that group
                                                                     *
                                                                     * If admin is messaging in restricted reply group then notification should go to all
                                                                     * the members if explicitMemberIdList is empty
                                                                     *
                                                                     */

                                                                    for (var i = 0; i < results[1].length; i++) {
                                                                        /**
                                                                         * if relation not exist then send all sender details to receiver
                                                                         * */
                                                                        if (autoJoinResults[0][0].groupuserid == 0) {
                                                                            console.log(autoJoinResults[0][0].groupuserid, "groupuserid");
                                                                            console.log((results[1][i].iphoneId), "iphoneId");
                                                                            console.log((results[1][i].receiverGroupId), "receiverGroupId");
                                                                            if (notificationTemplaterRes.parsedTpl) {
                                                                                notification.publish(
                                                                                    results[1][i].receiverGroupId,
                                                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                                    results[0][0].senderId,
                                                                                    notificationTemplaterRes.parsedTpl,
                                                                                    31,
                                                                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                                                                        isRelationExist: 0,
                                                                                        messageList: {
                                                                                            messageId: results[0][0].messageId,
                                                                                            message: results[0][0].message,
                                                                                            createdDate: results[0][0].createdDate,
                                                                                            messageType: req.body.messageType,
                                                                                            messageStatus: results[0][0].messageStatus,
                                                                                            priority: results[0][0].priority,
                                                                                            senderName: results[0][0].senderName,
                                                                                            senderId: results[0][0].senderId,
                                                                                            receiverId: results[1][i].receiverGroupId,
                                                                                            groupType: results[0][0].groupType,
                                                                                            groupId: senderGroupId
                                                                                        },
                                                                                        contactList: {
                                                                                            groupId: senderGroupId,
                                                                                            adminEzeId: results[3][0].adminEzeId,
                                                                                            adminId: results[3][0].adminId,
                                                                                            groupName: results[3][0].groupName,
                                                                                            groupStatus: results[3][0].groupStatus,
                                                                                            isAdmin: results[3][0].isAdminNew,
                                                                                            areMembersVisible: results[3][0].areMembersVisible,
                                                                                            isReplyRestricted: results[3][0].isReplyRestricted,
                                                                                            groupRelationStatus: results[3][0].groupRelationStatus,
                                                                                            luDate: results[3][0].luDate,
                                                                                            isRequester: results[3][0].isRequester,
                                                                                            unreadCount: results[3][0].unreadCount,
                                                                                            luUser: results[3][0].luUser,
                                                                                            aboutGroup: results[3][0].aboutGroup,
                                                                                            memberCount: results[3][0].memberCount,
                                                                                            autoJoin: results[3][0].autoJoin,
                                                                                            groupType: results[0][0].groupType
                                                                                        }

                                                                                    },
                                                                                    null);
                                                                                console.log('postNotification : notification for compose_message is sent successfully');
                                                                            }
                                                                            else {
                                                                                console.log('Error in parsing notification compose_message template - ',
                                                                                    notificationTemplaterRes.error);
                                                                                console.log('postNotification : notification for compose_message is sent successfully');
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log(autoJoinResults[0][0].groupuserid, "groupuserid2");
                                                                            console.log((results[1][i].iphoneId), "iphoneId");
                                                                            if (notificationTemplaterRes.parsedTpl) {
                                                                                notification.publish(
                                                                                    results[1][i].receiverGroupId,
                                                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                                    results[0][0].senderId,
                                                                                    notificationTemplaterRes.parsedTpl,
                                                                                    31,
                                                                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                                                                        isRelationExist: 1,
                                                                                        messageList: {
                                                                                            messageId: results[0][0].messageId,
                                                                                            message: results[0][0].message,
                                                                                            createdDate: results[0][0].createdDate,
                                                                                            messageType: req.body.messageType,
                                                                                            messageStatus: results[0][0].messageStatus,
                                                                                            priority: req.body.priority,
                                                                                            senderName: results[0][0].senderName,
                                                                                            senderId: results[0][0].senderId,
                                                                                            receiverId: results[1][i].receiverGroupId,
                                                                                            groupId: senderGroupId,
                                                                                            groupType: results[0][0].groupType
                                                                                        },
                                                                                        contactList: {
                                                                                            groupId: senderGroupId,
                                                                                            adminEzeId: results[3][0].adminEzeId,
                                                                                            adminId: results[3][0].adminId,
                                                                                            groupName: results[3][0].groupName,
                                                                                            groupStatus: results[3][0].groupStatus,
                                                                                            isAdmin: results[3][0].isAdminNew,
                                                                                            areMembersVisible: results[3][0].areMembersVisible,
                                                                                            isReplyRestricted: results[3][0].isReplyRestricted,
                                                                                            groupRelationStatus: results[3][0].groupRelationStatus,
                                                                                            luDate: results[3][0].luDate,
                                                                                            isRequester: results[3][0].isRequester,
                                                                                            unreadCount: results[3][0].unreadCount,
                                                                                            luUser: results[3][0].luUser,
                                                                                            aboutGroup: results[3][0].aboutGroup,
                                                                                            memberCount: results[3][0].memberCount,
                                                                                            autoJoin: results[3][0].autoJoin,
                                                                                            groupType: results[0][0].groupType
                                                                                        }
                                                                                    },
                                                                                    null);
                                                                                console.log('postNotification : notification for compose_message is sent successfully');
                                                                            }
                                                                            else {
                                                                                console.log('Error in parsing notification compose_message template - ',
                                                                                    notificationTemplaterRes.error);
                                                                                console.log('postNotification : notification for compose_message is sent successfully');
                                                                            }
                                                                        }

                                                                    }
                                                                }

                                                            }
                                                            /**
                                                             * if getting no affected rows then send response with status false and gove error message
                                                             * */
                                                            else {
                                                                // responseMessage.status = false;
                                                                // responseMessage.error = null;
                                                                // responseMessage.message = 'Something went wrong while sending message ! Please try again';
                                                                // responseMessage.data = null;
                                                                // res.status(400).json(responseMessage);
                                                            }
                                                        }
                                                        /**
                                                         * if getting any error from db and proc called unsuccessfully then send response with status false
                                                         * */
                                                        else {
                                                            responseMessage.error = {
                                                                server: 'Internal Server Error'
                                                            };
                                                            responseMessage.message = 'An error occurred !';
                                                            res.status(500).json(responseMessage);
                                                            console.log('Error : p_v1_ComposeMessage ', err);
                                                            var errorDate = new Date();
                                                            console.log(errorDate.toTimeString() + ' ......... error ...........');

                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('Error :', err);
                                                    responseMessage.error = {
                                                        server: 'Internal Server Error'
                                                    };
                                                    responseMessage.message = 'An error occurred !';
                                                    res.status(500).json(responseMessage);
                                                }

                                            });
                                            mobileCount += 1;
                                            if(results[0][0].isdMobile == "+977"){
                                                nepalMobileList += results[0][0].mobile + ',';
                                            }
                                            else if(results[0][0].isdMobile == "+91" || results[0][0].isdMobile == "91" )
                                            {
                                                indiaMobileList += results[0][0].mobile + ',';
                                            }
                                            else if(results[0][0].isdMobile != "")
                                            {
                                                mobileList += results[0][0].mobile + ',';
                                            }

                                            // if (results[0][0].mobile != '') {
                                            //     mobileList += results[0][0].mobile + ',';
                                            // }
                                            console.log(mobileList,"mobileList----------------------------------------mobileList");
                                            if (mobileCount < contactList.length) {
                                                inviteMobile(contactList[mobileCount]);
                                            }
                                            else {
                                                sendInvitation();
                                            }
                                        }
                                        else {
                                            console.log('Invite:results no found');
                                            mobileCount += 1;
                                            if (mobileCount < contactList.length) {
                                                inviteMobile(contactList[mobileCount]);
                                            }
                                            else {
                                                sendInvitation();
                                            }
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        mobileCount += 1;
                                        if (mobileCount < contactList.length) {
                                            inviteMobile(contactList[mobileCount]);
                                        }
                                        else {
                                            sendInvitation();
                                        }
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    mobileCount += 1;
                                    if (mobileCount < contactList.length) {
                                        inviteMobile(contactList[mobileCount]);
                                    }
                                    else {
                                        sendInvitation();
                                    }
                                }
                            }
                            else{
                                console.log('Error :', err);
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                            }
                        });
                    };
                    //calling function at first time
                    if (contactList) {
                        if (contactList.length > 0) {
                            inviteMobile(mobileData);
                        }
                    }
                    else{
                        res.status(401).json(response);
                    }

                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
});

function getAttendence(req,callback) {
    var isAttendence =0 ;
    console.log(req.body.attendenceQuery,"req.body.attendenceQuery");
    req.db.query(req.body.attendenceQuery, function (err, attendenceResults) {
        console.log(attendenceResults,"attendenceResults");
        if (attendenceResults && attendenceResults[0] && attendenceResults[0].length > 0) {
            console.log(attendenceResults[0][0].type,"isAttendence");
            isAttendence =  attendenceResults[0][0].type;
            callback(isAttendence);
        }
        else{
            callback(isAttendence);
        }
    });



}
module.exports = router;
