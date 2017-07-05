/**
 * Created by Jana1 on 15-06-2017.
 */


var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var greetingCtrl = {};
var error = {};

greetingCtrl.sendGreeting = function(req,res,next){
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

    if (!req.body.messageId || req.body.messageId == 0) {
        error.messageId = 'Invalid messageId';
        validationFlag *= false;
    }

    if (!req.body.groupId || req.body.groupId == 0) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }

    if (!req.body.comments) {
        error.comments = 'Invalid comments';
        validationFlag *= false;
    }
    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.body.groupId),
                req.st.db.escape(req.body.messageId),
                req.st.db.escape(req.body.comments)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */

            var procQuery = 'CALL he_save_comments( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,results){
                console.log(results);
                if(!err && results && results[0] ){
                    senderGroupId = results[0][0].senderId;
                    notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                        senderName : results[0][0].senderName
                    });


                        if (notificationTemplaterRes.parsedTpl) {
                            console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                            notification.publish(
                                results[1][i].receiverId,
                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                results[1][0].senderId,
                                notificationTemplaterRes.parsedTpl,
                                40,
                                0,
                                (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                    comments: {
                                        groupId: results[0][i].groupId,
                                        formId: results[0][i].formId,
                                        transId: results[0][i].transId,
                                        parentId: results[0][i].parentId
                                    }
                                },
                                null,
                                tokenResult[0].isWhatMate);
                            console.log('postNotification : notification for compose_message is sent successfully');
                        }
                        else {
                            console.log('Error in parsing notification compose_message template - ',
                                notificationTemplaterRes.error);
                            console.log('postNotification : notification for compose_message is sent successfully');
                        }


                    response.status = true;
                    response.message = "Greeting sent successfully";
                    response.error = null;
                    response.data = {
                        comments: {
                            groupId: results[0][i].groupId,
                            formId: results[0][i].formId,
                            transId: results[0][i].transId,
                            parentId: results[0][i].parentId
                        }
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while sending greeting";
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
};

module.exports = greetingCtrl;