/**
 * Created by Jana1 on 27-04-2017.
 */



var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var visitorCtrl = {};
var error = {};

visitorCtrl.saveGatePassRequest = function(req,res,next){
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

    if (!req.body.name) {
        error.name = 'Invalid name';
        validationFlag *= false;
    }

    if (!req.body.phone) {
        error.phone = 'Invalid phone';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.expectedTime = req.body.expectedTime ? req.body.expectedTime : null;
                req.body.assetDetails = req.body.assetDetails ? req.body.assetDetails : '';
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.purposeOfGuest = req.body.purposeOfGuest ? req.body.purposeOfGuest : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.companyName = req.body.companyName ? req.body.companyName : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.isd = req.body.isd ? req.body.isd : '';
                req.body.status = req.body.status ? req.body.status : 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.pictureUrl),
                    req.st.db.escape(req.body.name),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.purposeOfGuest),
                    req.st.db.escape(req.body.expectedTime),
                    req.st.db.escape(req.body.assetDetails),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.companyName),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.isd)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_visitorGatePassRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
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
                        response.message = "Visitor gate pass request saved successfully";
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
                        response.message = "Error while saving Visitor gate pass request";
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

visitorCtrl.getVisitorList = function(req,res,next){
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
            var procQuery = 'CALL HE_get_visitorList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,visitorsResult){
                if(!err && visitorsResult && visitorsResult[0] && visitorsResult[0][0]){
                    response.status = true;
                    response.message = "Visitors loaded successfully";
                    response.error = null;
                    response.data = {
                        visitorList : visitorsResult[0]
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Visitors loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting visitors";
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

visitorCtrl.saveGateAssetPassRequest = function(req,res,next){
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


    if (!req.body.name) {
        error.name = 'Invalid name';
        validationFlag *= false;
    }

    if (!req.body.phone) {
        error.phone = 'Invalid phone';
        validationFlag *= false;
    }

    if (!req.body.assetDetails) {
        error.assetDetails = 'Invalid assetDetails';
        validationFlag *= false;
    }

    if (!req.body.visitorId) {
        error.visitorId = 'Invalid visitorId';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        console.log(response);
        res.status(400).json(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '' ;
                req.body.expectedTime = req.body.expectedTime ? req.body.expectedTime : null;
                req.body.assetDetails = req.body.assetDetails ? req.body.assetDetails : '';
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.badgeNumber = req.body.badgeNumber ? req.body.badgeNumber : '';
                req.body.guestEntered = req.body.guestEntered ? req.body.guestEntered : 0;
                req.body.guestExited = req.body.guestExited ? req.body.guestExited : 0;
                req.body.purposeOfGuest = req.body.purposeOfGuest ? req.body.purposeOfGuest : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.isdPhone = req.body.isdPhone ? req.body.isdPhone : "";


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.visitorId),
                    req.st.db.escape(req.body.name),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.purposeOfGuest),
                    req.st.db.escape(req.body.expectedTime),
                    req.st.db.escape(req.body.assetDetails),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.badgeNumber),
                    req.st.db.escape(req.body.guestEntered),
                    req.st.db.escape(req.body.guestExited),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.isdPhone)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_visitorAssetPassRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
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
                        response.message = "Visitor asset pass request saved successfully";
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
                        response.message = "Error while saving visitor asset pass request";
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

visitorCtrl.searchVisitors = function(req,res,next){
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

    if (!req.query.searchWord ) {
        error.searchWord = 'Invalid searchWord';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.searchWord),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_search_visitors( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,visitorsResult){
                if(!err && visitorsResult && visitorsResult[0] && visitorsResult[0][0]){
                    var output = [];
                    for(var i = 0; i < visitorsResult[0].length; i++) {
                        var res1 = {};
                        res1.name = visitorsResult[0][i].name;
                        res1.phone = visitorsResult[0][i].phone;
                        res1.emailId = visitorsResult[0][i].emailId;
                        res1.assetDetails = visitorsResult[0][i].assetDetails;
                        res1.companyName = visitorsResult[0][i].companyName;
                        res1.isd = visitorsResult[0][i].isd;
                        res1.source = visitorsResult[0][i].source;
                        res1.pictureUrl = (visitorsResult[0][i].pictureUrl);
                            // ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + visitorsResult[0][i].pictureUrl) : "" ;

                        output.push(res1);
                    }

                    response.status = true;
                    response.message = "Data loaded successfully";
                    response.error = null;
                    response.data = {
                        visitorList : output
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting data";
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

visitorCtrl.saveGuestHospitalityRequest = function(req,res,next){
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

    if (!req.body.arrivalTime) {
        error.arrivalTime = 'Invalid arrivalTime';
        validationFlag *= false;
    }

    if (!req.body.guestList) {
        error.guestList = 'Invalid guestList';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.typeOfGuest = req.body.typeOfGuest ? req.body.typeOfGuest : 0;

                req.body.companyName = req.body.companyName ? req.body.companyName : '';
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.purpose = req.body.purpose ? req.body.purpose : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.expenseAmount = req.body.expenseAmount ? req.body.expenseAmount : 0;
                req.body.expenseCurrencyId = req.body.expenseCurrencyId ? req.body.expenseCurrencyId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.typeOfGuest),
                    req.st.db.escape(req.body.arrivalTime),
                    req.st.db.escape(req.body.companyName),
                    req.st.db.escape(req.body.guestList),
                    req.st.db.escape(req.body.purpose),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.expenseCurrencyId),
                    req.st.db.escape(req.body.expenseAmount)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_GuestHospitalityRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
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
                        response.message = "Guest hospitality request saved successfully";
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
                        response.message = "Error while saving guest hospitality request";
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

visitorCtrl.saveInternetRequest = function(req,res,next){
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


    if (!req.body.name) {
        error.name = 'Invalid name';
        validationFlag *= false;
    }

    if (!req.body.phone) {
        error.phone = 'Invalid phone';
        validationFlag *= false;
    }

    if (!req.body.assetDetails) {
        error.assetDetails = 'Invalid assetDetails';
        validationFlag *= false;
    }

    if (!req.body.visitorId) {
        error.visitorId = 'Invalid visitorId';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        console.log(response);
        res.status(400).json(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '' ;
                req.body.expectedTime = req.body.expectedTime ? req.body.expectedTime : null;
                req.body.assetDetails = req.body.assetDetails ? req.body.assetDetails : '';
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                req.body.badgeNumber = req.body.badgeNumber ? req.body.badgeNumber : '';
                req.body.guestEntered = req.body.guestEntered ? req.body.guestEntered : 0;
                req.body.guestExited = req.body.guestExited ? req.body.guestExited : 0;
                req.body.purposeOfGuest = req.body.purposeOfGuest ? req.body.purposeOfGuest : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.isdPhone = req.body.isdPhone ? req.body.isdPhone : "";


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.visitorId),
                    req.st.db.escape(req.body.name),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.purposeOfGuest),
                    req.st.db.escape(req.body.expectedTime),
                    req.st.db.escape(req.body.assetDetails),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.badgeNumber),
                    req.st.db.escape(req.body.guestEntered),
                    req.st.db.escape(req.body.guestExited),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.isdPhone)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_visitorInternetRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
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
                        response.message = "Visitor asset pass request saved successfully";
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
                        response.message = "Error while saving visitor asset pass request";
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

module.exports = visitorCtrl;