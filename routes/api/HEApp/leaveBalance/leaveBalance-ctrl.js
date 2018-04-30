/**
 * Created by Jana1 on 04-04-2017.
 */


var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var leaveBalanceCtrl = {};


var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

leaveBalanceCtrl.getLeaveBalanceForm = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.localMessageId = req.query.localMessageId ? req.query.localMessageId : 0;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(1),
                    req.st.db.escape(req.query.localMessageId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_leave_balance( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        senderGroupId = results[0][0].senderId;
                        // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                        //     senderName : results[0][0].message
                        // });
                        //
                        // for (var i = 0; i < results[1].length; i++ ) {
                        //     if (notificationTemplaterRes.parsedTpl) {
                        //         var leaveTypes1 = JSON.parse(results[0][0].formDataJSON);
                        //         notification.publish(
                        //             results[1][i].receiverId,
                        //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                        //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                        //             results[0][0].senderId,
                        //             notificationTemplaterRes.parsedTpl,
                        //             31,
                        //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                        //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                        //             0,
                        //             0,
                        //             0,
                        //             0,
                        //             1,
                        //             moment().format("YYYY-MM-DD HH:mm:ss"),
                        //             '',
                        //             0,
                        //             0,
                        //             null,
                        //             '',
                        //             /** Data object property to be sent with notification **/
                        //             {
                        //                 messageList: {
                        //                     messageId: results[0][0].messageId,
                        //                     message: results[0][0].message,
                        //                     messageLink: results[0][0].messageLink,
                        //                     createdDate: results[0][0].createdDate,
                        //                     messageType: req.body.messageType,
                        //                     messageStatus: results[0][0].messageStatus,
                        //                     priority: results[0][0].priority,
                        //                     senderName: results[0][0].senderName,
                        //                     senderId: results[0][0].senderId,
                        //                     receiverId: results[1][i].receiverId,
                        //                     groupId: senderGroupId,
                        //                     groupType: 2,
                        //                     transId : results[0][0].transId,
                        //                     formId : results[0][0].formId,
                        //                     currentStatus : results[0][0].currentStatus,
                        //                     formData : {
                        //                         leaveTypes : JSON.parse(leaveTypes1["leaveTypes"]),
                        //                         totalLeaves : leaveTypes1["totalLeaves"]
                        //                     }
                        //                 }
                        //             },
                        //             null,tokenResult[0].isWhatMate);
                        //         console.log('postNotification : notification for compose_message is sent successfully');
                        //     }
                        //     else {
                        //         console.log('Error in parsing notification compose_message template - ',
                        //             notificationTemplaterRes.error);
                        //         console.log('postNotification : notification for compose_message is sent successfully');
                        //     }
                        // }
                        notifyMessages.getMessagesNeedToNotify();

                        response.status = true;
                        response.message = "Leave balance loaded successfully";
                        response.error = null;
                        var leaveTypes = JSON.parse(results[0][0].formDataJSON);
                        response.data = {
                            messageList: {
                                messageId: results[0][0].messageId,
                                message: results[0][0].message,
                                messageLink: results[0][0].messageLink,
                                createdDate: results[0][0].createdDate,
                                messageType: results[0][0].messageType,
                                messageStatus: results[0][0].messageStatus,
                                priority: results[0][0].priority,
                                senderName: results[0][0].senderName,
                                senderId: results[0][0].senderId,
                                receiverId: results[0][0].receiverId,
                                transId : results[0][0].transId,
                                formId : results[0][0].formId,
                                groupId: req.body.groupId,
                                currentStatus : results[0][0].currentStatus,
                                localMessageId : req.body.localMessageId,
                                formData : {
                                    leaveTypes : JSON.parse(leaveTypes["leaveTypes"]),
                                    totalLeaves : leaveTypes["totalLeaves"]
                                }
                            }
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting leave balance";
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

leaveBalanceCtrl.getLeaveBalance = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.learnMessageId = req.query.learnMessageId ? req.query.learnMessageId : 0;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(0),
                    req.st.db.escape(req.query.learnMessageId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_leave_balance( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){

                        response.status = true;
                        response.message = "Leave balance loaded successfully";
                        response.error = null;
                        var leaveTypes = JSON.parse(results[0][0].leaveJSON);
                        response.data = {
                            leaveTypes : JSON.parse(leaveTypes["leaveTypes"]),
                            totalLeaves : leaveTypes["totalLeaves"]
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting leave balance";
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

leaveBalanceCtrl.getLeaveApplications = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isMySelf = req.query.isMySelf ? req.query.isMySelf : 0;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                req.query.keywords = (req.query.keywords) ? (req.query.keywords) : "";

                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.isMySelf),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.keywords)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_leaveApplications( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){

                        response.status = true;
                        response.message = "Leave applications loaded successfully";
                        response.error = null;
                        response.data = {
                            leaveApplications : results[0],
                            count : results[1][0].count
                        };
                        // res.status(200).json(response);
                         buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No leave applications found";
                        response.error = null;
                        response.data = {
                            leaveApplications : [],
                            count : 0
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting leave applications";
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

module.exports = leaveBalanceCtrl;