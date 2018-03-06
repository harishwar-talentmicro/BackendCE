/**
 * Created by Jana1 on 27-07-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var salesCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

salesCtrl.getMasterData = function(req,res,next){
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

    if (!req.query.groupId)
    {
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL HE_get_app_salesmaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,masterData){
                    if(!err && masterData[0] && masterData[0][0]){
                        var output = [];
                        for(var i = 0; i < masterData[0].length; i++) {
                            var res1 = {};
                            res1.stageId = masterData[0][i].stageId;
                            res1.stageTitle = masterData[0][i].stageTitle;
                            res1.stageProgress = masterData[0][i].stageProgress;
                            res1.statusList = JSON.parse(masterData[0][i].statusList);
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.data = {
                            stageStatusList : output,
                            categoryList : masterData[1] ? masterData[1] : [],
                            currencyList : masterData[2] ? masterData[2] : [],
                            memberList : masterData[3] ? masterData[3] : [],
                            salesType : masterData[4] ? masterData[4][0].salesDisplayFormat : 0,
                            currency : {
                                currencySymbol : (masterData[5] && masterData[5][0] && masterData[5][0].currencySymbol) ? masterData[5][0].currencySymbol : '',
                                currencyId : (masterData[5] && masterData[5][0] && masterData[5][0].currencyId) ? masterData[5][0].currencyId : 0
                            },
                            probability : masterData[6] ? masterData[6] : []
                        } ;
                        response.error = null;
                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            stageStatusList : [],
                            categoryList : [],
                            currencyList : [],
                            memberList : []
                        };
                        response.error = null;
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
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
    }

};

salesCtrl.saveSalesRequest = function(req,res,next){
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

    if (!req.body.requirement) {
        error.requirement = 'Invalid requirement';
        validationFlag *= false;
    }

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList = [] ;
    }

    var items =req.body.items;
    if(typeof(items) == "string") {
        items = JSON.parse(items);
    }
    if(!items){
        items = [] ;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.clientId = req.body.clientId ? req.body.clientId : 0;
                req.body.categoryId = req.body.categoryId ? req.body.categoryId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.stage = req.body.stage ? req.body.stage : 1;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : "";
                req.body.reason = req.body.reason ? req.body.reason : "";
                req.body.currencyId = req.body.currencyId ? req.body.currencyId : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : "";
                req.body.amount = req.body.amount ? req.body.amount : 0;
                req.body.probability = req.body.probability ? req.body.probability : 0;
                req.body.infoToSender = req.body.infoToSender ? req.body.infoToSender : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.clientName = req.body.clientName ? req.body.clientName : "";
                req.body.categoryTitle = req.body.categoryTitle ? req.body.categoryTitle : "";
                req.body.stageTitle = req.body.stageTitle ? req.body.stageTitle : "";
                req.body.statusTitle = req.body.statusTitle ? req.body.statusTitle : "";
                req.body.currencyTitle = req.body.currencyTitle ? req.body.currencyTitle : "";
                req.body.isInfoToSenderChanged = req.body.isInfoToSenderChanged ? req.body.isInfoToSenderChanged : 0;
                req.body.clientISDMobile = req.body.clientISDMobile ? req.body.clientISDMobile : "";
                req.body.clientMobile = req.body.clientMobile ? req.body.clientMobile : "";
                req.body.clientEmail = req.body.clientEmail ? req.body.clientEmail : "";
                req.body.clientCompany = req.body.clientCompany ? req.body.clientCompany : "";
                req.body.clientJobTitle = req.body.clientJobTitle ? req.body.clientJobTitle : "";
                req.body.discount  = req.body.discount  ? req.body.discount  : 0;
                req.body.itemCurrencyId  = req.body.itemCurrencyId  ? req.body.itemCurrencyId  : 0;
                req.body.itemCurrencySymbol  = req.body.itemCurrencySymbol  ? req.body.itemCurrencySymbol  : 0;
                req.body.isdPhone  = req.body.isdPhone != undefined  ? req.body.isdPhone  : "";
                req.body.phoneNo  = req.body.phoneNo != undefined  ? req.body.phoneNo  : "";
                req.body.lastName  = req.body.lastName != undefined  ? req.body.lastName  : "";
                req.body.notes  = req.body.notes != undefined  ? req.body.notes  : "";
                req.body.contactId  = req.body.contactId != undefined  ? req.body.contactId  : 0;
                req.body.targetDate  = req.body.targetDate != undefined  ? req.body.targetDate  : null;

                if(req.body.phoneNo == ""){
                    req.body.isdPhone = "";
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.clientId),
                    req.st.db.escape(req.body.categoryId),
                    req.st.db.escape(req.body.requirement),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.stage),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.reason),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.amount),
                    req.st.db.escape(req.body.probability),
                    req.st.db.escape(req.body.infoToSender),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.clientName),
                    req.st.db.escape(req.body.categoryTitle),
                    req.st.db.escape(req.body.stageTitle),
                    req.st.db.escape(req.body.statusTitle),
                    req.st.db.escape(req.body.currencyTitle),
                    req.st.db.escape(req.body.isInfoToSenderChanged),
                    req.st.db.escape(req.body.clientISDMobile),
                    req.st.db.escape(req.body.clientMobile),
                    req.st.db.escape(req.body.clientEmail),
                    req.st.db.escape(req.body.clientCompany),
                    req.st.db.escape(req.body.clientJobTitle),
                    req.st.db.escape(req.body.discount),
                    req.st.db.escape(JSON.stringify(items)),
                    req.st.db.escape(req.body.itemCurrencyId),
                    req.st.db.escape(req.body.itemCurrencySymbol),
                    req.st.db.escape(req.body.isdPhone),
                    req.st.db.escape(req.body.phoneNo),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.contactId),
                    req.st.db.escape(req.body.targetDate)
                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_salesRequest_new( ' + procParams.join(',') + ')';
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

                                var formDataJSON = JSON.parse(results[1][i].formDataJSON) ;

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
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        if(results && results[2] &&  results[2][0] && results[2][0].receiverId){
                            if (notificationTemplaterRes.parsedTpl) {
                                notification.publish(
                                    results[2][0].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    41,
                                    0, (results[2][0].iphoneId) ? (results[2][0].iphoneId) : '',
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
                                        parentId: results[2][0].parentId,
                                        groupId: results[2][0].groupId,
                                        requirement: results[2][0].requirement,
                                        feedback: results[2][0].feedback,
                                        rating: results[2][0].rating,
                                        updatedDate: results[2][0].updatedDate,
                                        status: results[2][0].status
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Expense claim saved successfully";
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
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving expense claim";
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

salesCtrl.assignToUser = function(req,res,next){
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

    if (!req.body.memberId) {
        error.memberId = 'Invalid memberId';
        validationFlag *= false;
    }

    if (!req.body.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!req.body.parentId) {
        error.parentId = 'Invalid parentId';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.assignedReason = req.body.assignedReason ? req.body.assignedReason : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.memberId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.assignedReason)
                ];
                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_assign_sales( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        console.log("results[0].senderName",results[0][0].senderName);

                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });

                        for (var i = 0; i < results[0].length; i++ ) {
                            if (notificationTemplaterRes.parsedTpl) {

                                var formDataJSON = JSON.parse(results[0][i].formDataJSON) ;

                                notification.publish(
                                    results[0][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[0][i].iphoneId) ? (results[0][i].iphoneId) : '',
                                    (results[0][i].GCM_Id) ? (results[0][i].GCM_Id) : '',
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
                                            messageId: results[0][i].messageId,
                                            message: results[0][i].message,
                                            messageLink: results[0][i].messageLink,
                                            createdDate: results[0][i].createdDate,
                                            messageType: results[0][i].messageType,
                                            messageStatus: results[0][i].messageStatus,
                                            priority: results[0][i].priority,
                                            senderName: results[0][i].senderName,
                                            senderId: results[0][i].senderId,
                                            receiverId: results[0][i].receiverId,
                                            groupId: results[0][i].senderId,
                                            groupType: 2,
                                            transId : results[0][i].transId,
                                            formId : results[0][i].formId,
                                            currentStatus : results[0][i].currentStatus,
                                            currentTransId : results[0][i].currentTransId,
                                            parentId : results[0][i].parentId,
                                            accessUserType : results[0][i].accessUserType,
                                            heUserId : results[0][i].heUserId,
                                            formData : JSON.parse(results[0][i].formDataJSON)

                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[0][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Assigned successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else if(!err)
                    {
                        response.status = true;
                        response.message = "Assigned successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while assigning to member";
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

salesCtrl.findHECustomer = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token)
    {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.groupId)
    {
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
                req.query.keyword = req.query.keyword ? req.query.keyword : "" ;
                req.query.isSupport = req.query.isSupport != undefined ? req.query.isSupport : 0 ;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.keyword),
                    req.st.db.escape(req.query.isSupport)
                ];

                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_find_customer( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if(!err && userResult && userResult[0] && userResult[0][0]){
                        response.status = true;
                        response.message = "Client loaded successfully";
                        response.error = null;
                        var output = [];

                        for(var i = 0; i < userResult[0].length; i++) {
                            var res1 = {};
                            res1.clientId = userResult[0][i].clientId;
                            res1.contactId = userResult[0][i].contactId;
                            res1.name = userResult[0][i].name;
                            res1.isdMobile = userResult[0][i].isdMobile;
                            res1.mobile = userResult[0][i].mobile;
                            res1.emailId = userResult[0][i].emailId;
                            res1.companyName = userResult[0][i].companyName;
                            res1.jobTitle = userResult[0][i].jobTitle;
                            res1.isdPhone = userResult[0][i].isdPhone;
                            res1.phoneNo = userResult[0][i].phoneNo;
                            res1.lastName = userResult[0][i].lastName;
                            res1.notes = userResult[0][i].notes;
                            res1.updaterDetails = (userResult[0][i].updaterDetails) ? JSON.parse(userResult[0][i].updaterDetails) : null;
                            output.push(res1);
                        }
                        response.data = {
                            client : output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No clients found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting client";
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

salesCtrl.saveSalesFeedback = function(req,res,next){
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

    if (!req.body.parentId) {
        error.parentId = 'Invalid parentId';
        validationFlag *= false;
    }
    if (!req.body.formId) {
        error.formId = 'Invalid formId';
        validationFlag *= false;
    }

    if (!req.body.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.requirement),
                    req.st.db.escape(req.body.feedback),
                    req.st.db.escape(req.body.rating),
                    req.st.db.escape(req.body.formId)
                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_Feedback( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        response.status = true;
                        response.message = "Feedback saved successfully";
                        response.error = null;
                        response.data = results[0] ;
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving feedback";
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

salesCtrl.getSalesItems = function(req,res,next){
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

    if (!req.query.groupId)
    {
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
                req.query.keywords = req.query.keywords ? req.query.keywords : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.keywords)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_app_salesItems( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salesItems){
                    if(!err && salesItems[0] && salesItems[0][0]){
                        var output = [];
                        for(var i = 0; i < salesItems[0].length; i++) {
                            var res1 = {};
                            res1.description = salesItems[0][i].description;
                            res1.itemId = salesItems[0][i].itemId;
                            res1.itemCode = salesItems[0][i].itemCode;
                            res1.itemImage = (salesItems[0][i].itemImage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salesItems[0][i].itemImage) : "";
                            res1.itemName = salesItems[0][i].itemName;
                            res1.itemRate = salesItems[0][i].itemRate;
                            res1.maxQuantity = salesItems[0][i].maxQuantity;
                            res1.minQuantity = salesItems[0][i].minQuantity;
                            res1.notes = salesItems[0][i].notes;
                            res1.UOM = salesItems[0][i].UOM;
                            res1.UOMTitle = salesItems[0][i].UOMTitle;
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Items loaded successfully";
                        response.data = {
                            salesItems : output
                        } ;
                        response.error = null;
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No items found";
                        response.data = {
                            salesItems : []
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting items";
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

salesCtrl.getSalesTracker = function(req,res,next){
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

    if (!req.query.groupId)
    {
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
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL HE_get_salesTracker( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salesItems){
                    if(!err && salesItems && salesItems[0]){

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";
                        response.data = {
                            chartData : salesItems[0],
                            transactionData : salesItems[1],
                            count : salesItems[2][0].count
                        };

                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData : [],
                            transactionData : [],
                            count : 0
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.getSalesSummary = function(req,res,next){
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

    if (!req.query.HEMasterId)
    {
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL HE_get_salesSummary( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salesItems){
                    if(!err && salesItems && salesItems[0]){

                        response.status = true;
                        response.message = "Sales summary data loaded successfully";
                        response.data = {
                            probabilityData : salesItems[0],
                            timeLineData : (salesItems[1] && salesItems[1][0]) ? salesItems[1] : []
                        };

                        response.error = null;
                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData : [],
                            transactionData : [],
                            count : 0
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.getSalesUserPerformanceByProbability = function(req,res,next){
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

    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_salesUserByProbability( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salesItems){
                    if(!err && salesItems && salesItems[0]){

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";
                        var output = [];
                        for(var i = 0; i < salesItems[0].length; i++) {
                            var res1 = {};
                            res1.name = salesItems[0][i].name;
                            res1.probabilityData = salesItems[0][i].probabilityData ? JSON.parse(salesItems[0][i].probabilityData) : [];
                            output.push(res1);
                        }

                        response.data = {
                            transactionData : output,
                            count : salesItems[1][0].count,
                            probabilities : salesItems[2]
                        };

                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData : [],
                            transactionData : [],
                            count : 0
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.getSalesUserPerformanceByTimeLine = function(req,res,next){
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

    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_salesUserByTimeLine( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salesItems){
                    if(!err && salesItems && salesItems[0] && salesItems[0][0].message != "no_data_found" ){

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";
                        var output = [];
                        for(var i = 0; i < salesItems[0].length; i++) {
                            var res1 = {};
                            res1.name = salesItems[0][i].name;
                            res1.timeLineData = salesItems[0][i].timeLineData ? JSON.parse(salesItems[0][i].timeLineData) : [];
                            output.push(res1);
                        }

                        response.data = {
                            transactionData : output,
                            count : salesItems[1][0].count,
                            timeLineMaster : salesItems[2]
                        };

                        response.error = null;

                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData : [],
                            transactionData : [],
                            count : 0
                        };
                        response.error = null;
                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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






module.exports = salesCtrl;
