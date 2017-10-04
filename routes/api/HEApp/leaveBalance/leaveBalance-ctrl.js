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
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++ ) {
                            if (notificationTemplaterRes.parsedTpl) {
                                var leaveTypes1 = JSON.parse(results[0][0].formDataJSON);
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                    (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
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
                                        messageList: {
                                            messageId: results[0][0].messageId,
                                            message: results[0][0].message,
                                            messageLink: results[0][0].messageLink,
                                            createdDate: results[0][0].createdDate,
                                            messageType: req.body.messageType,
                                            messageStatus: results[0][0].messageStatus,
                                            priority: results[0][0].priority,
                                            senderName: results[0][0].senderName,
                                            senderId: results[0][0].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: senderGroupId,
                                            groupType: 2,
                                            transId : results[0][0].transId,
                                            formId : results[0][0].formId,
                                            currentStatus : results[0][0].currentStatus,
                                            formData : {
                                                leaveTypes : JSON.parse(leaveTypes1["leaveTypes"]),
                                                totalLeaves : leaveTypes1["totalLeaves"]
                                            }
                                        }
                                    },
                                    null,tokenResult[0].isWhatMate);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

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

module.exports = leaveBalanceCtrl;