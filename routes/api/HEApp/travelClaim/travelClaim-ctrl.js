/**
 * Created by Jana1 on 19-04-2017.
 */


var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var travelClaimCtrl = {};
var error = {};

travelClaimCtrl.saveTravelClaim = function(req,res,next){
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

    if (!req.body.travelRequestId) {
        error.travelRequestId = 'Invalid travelRequestId';
        validationFlag *= false;
    }

    var expenseList =req.body.expenseList;
    if(typeof(expenseList) == "string") {
        expenseList = JSON.parse(expenseList);
    }
    if(!expenseList){
        error.expenseList = 'Invalid expenseList';
        validationFlag *= false;
    }

    var senderGroupId;
    console.log(validationFlag, "validationFlag");

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.travelRequestData  = req.body.travelRequestData  ? req.body.travelRequestData : '';

                req.body.totalCurrencyId = req.body.totalCurrencyId ? req.body.totalCurrencyId : 0;
                req.body.totalAmount = req.body.totalAmount ? req.body.totalAmount : 0;
                req.body.totalPayableCurrencyId = req.body.totalPayableCurrencyId ? req.body.totalPayableCurrencyId : 0;
                req.body.totalPayableAmount = req.body.totalPayableAmount ? req.body.totalPayableAmount : 0;
                req.body.settlementPaid = (req.body.settlementPaid == undefined) ? 1 : req.body.settlementPaid;
                req.body.advanceCurrencyId = req.body.advanceCurrencyId ? req.body.advanceCurrencyId : 0;
                req.body.advanceAmount = req.body.advanceAmount ? req.body.advanceAmount : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.travelRequestId),
                    req.st.db.escape(req.body.totalCurrencyId),
                    req.st.db.escape(req.body.totalAmount),
                    req.st.db.escape(req.body.totalPayableCurrencyId),
                    req.st.db.escape(req.body.totalPayableAmount),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.settlementPaid),
                    req.st.db.escape(req.body.advanceCurrencyId),
                    req.st.db.escape(req.body.advanceAmount),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(JSON.stringify(expenseList)),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.travelRequestData)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_travelClaim( ' + procParams.join(',') + ')';
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
                                notification.publish(
                                    results[1][i].receiverId,
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
                                        messageList: {
                                            messageId: results[1][i].messageId,
                                            message: results[1][i].message,
                                            messageLink: results[1][i].messageLink,
                                            createdDate: results[1][i].createdDate,
                                            messageType: results[1][i].messageType,
                                            messageStatus: results[1][i].messageStatus,
                                            priority: results[1][i].priority,
                                            senderName: results[1][i].senderName,
                                            senderId: results[1][i].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: results[1][i].senderId,
                                            groupType: 2,
                                            transId : results[1][i].transId,
                                            formId : results[1][i].formId,
                                            currentStatus : results[1][i].currentStatus,
                                            currentTransId : results[1][i].currentTransId,
                                            parentId : results[1][i].parentId,
                                            accessUserType : results[1][i].accessUserType,
                                            heUserId : results[1][i].heUserId,
                                            formData : JSON.parse(results[1][i].formDataJSON)

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
                        response.message = "Travel claim saved successfully";
                        response.error = null;
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
                                currentTransId : results[0][0].currentTransId,
                                localMessageId : req.body.localMessageId,
                                parentId : results[0][0].parentId,
                                accessUserType : results[0][0].accessUserType,
                                heUserId : results[0][0].heUserId,
                                formData : JSON.parse(results[0][0].formDataJSON)
                            }
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving travel claim";
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

travelClaimCtrl.getTravelRequest = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_travelRequest( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,travelRequestResult){
                if(!err && travelRequestResult && travelRequestResult[0] && travelRequestResult[0][0]){
                    response.status = true;
                    response.message = "Travel request loaded successfully";
                    response.error = null;
                    if(!err && travelRequestResult[1][0]){
                        response.data = {
                            travelRequestList : travelRequestResult[0],
                            defaultUserCurrency : {
                                currencyId : travelRequestResult[1][0].currencyId ? travelRequestResult[1][0].currencyId : 0,
                                currencySymbol : travelRequestResult[1][0].currencySymbol ? travelRequestResult[1][0].currencySymbol : "",
                                conversionRate : travelRequestResult[1][0].conversionRate ? travelRequestResult[1][0].conversionRate : 0
                            },
                            currencyList : travelRequestResult[2]
                        }
                    }
                    else{
                        response.data = {
                            travelRequestList : travelRequestResult[0],
                            defaultUserCurrency : {
                                currencyId :  0,
                                currencySymbol : "",
                                conversionRate : 0
                            },
                            currencyList : travelRequestResult[2]
                        }
                    }

                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Travel request loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting travel request";
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

module.exports = travelClaimCtrl;