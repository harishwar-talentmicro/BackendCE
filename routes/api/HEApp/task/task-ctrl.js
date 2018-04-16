/**
 * Created by Jana1 on 22-03-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var taskCtrl = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();


taskCtrl.saveTask = function(req,res,next){
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

    if (!req.body.title) {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!req.body.starts) {
        error.token = 'Invalid start date';
        validationFlag *= false;
    }

    var memberList =req.body.memberList;
    if(typeof(memberList) == "string") {
        memberList = JSON.parse(memberList);
    }
    if(!memberList){
        memberList = [];
    }

    var sharedMemberList =req.body.sharedMemberList;
    if(typeof(sharedMemberList) == "string") {
        sharedMemberList = JSON.parse(sharedMemberList);
    }
    if(!sharedMemberList){
        sharedMemberList = [];
    }

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList = [];
    }

    var senderGroupId;

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
                req.body.description = req.body.description ? req.body.description : '';
                req.body.progress = req.body.progress ? req.body.progress : 0;
                req.body.status = req.body.status ? req.body.status : 0;
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.type = req.body.type ? req.body.type : 0;  // 1-Task 2-Meeting
                req.body.isRepeats = req.body.isRepeats ? req.body.isRepeats : 0;
                req.body.repeatCount = req.body.repeatCount != undefined ? req.body.repeatCount : 1;
                req.body.repeatType = req.body.repeatType ? req.body.repeatType : 3;
                req.body.isEndDate = req.body.isEndDate ? req.body.isEndDate : 0;
                req.body.alertType = req.body.alertType ? req.body.alertType : 0;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : "";
                req.body.ends = req.body.ends != undefined ? req.body.ends : null;

                if(req.body.ends == ""){
                    req.body.ends = null
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(req.body.starts),
                    req.st.db.escape(req.body.ends),
                    req.st.db.escape(req.body.progress),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(JSON.stringify(memberList)),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.isRepeats),
                    req.st.db.escape(req.body.repeatCount),
                    req.st.db.escape(req.body.repeatType),
                    req.st.db.escape(req.body.isEndDate),
                    req.st.db.escape(req.body.alertType),
                    req.st.db.escape(JSON.stringify(sharedMemberList)),
                    req.st.db.escape(req.body.senderNotes)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_taskForm( ' + procParams.join(',') + ')';
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
                                console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[1][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0,
                                    (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                        },
                                        contactList : null
                                    },
                                    null,tokenResult[0].isWhatMate,
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
                        response.message = "Task saved successfully";
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
                                groupId: req.body.groupId,
                                receiverId: results[0][0].receiverId,
                                transId : results[0][0].transId,
                                formId : results[0][0].formId,
                                currentStatus : results[0][0].currentStatus,
                                currentTransId : results[0][0].currentTransId,
                                localMessageId : req.body.localMessageId,
                                parentId : results[0][0].parentId,
                                accessUserType : results[0][0].accessUserType,
                                heUserId : results[0][0].heUserId,
                                formData : JSON.parse(results[0][0].formDataJSON)
                            }
                        };
                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving task";
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

taskCtrl.saveTaskEnc = function(req,res,next){
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

    // if (!req.body.title) {
    //     error.token = 'Invalid title';
    //     validationFlag *= false;
    // }
    //
    // if (!req.body.starts) {
    //     error.token = 'Invalid start date';
    //     validationFlag *= false;
    // }
    //

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    console.log("resultDecrypt.toString('utf-8')",resultDecrypt.toString('utf-8'));
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));


                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.description = req.body.description ? req.body.description : '';
                req.body.progress = req.body.progress ? req.body.progress : 0;
                req.body.status = req.body.status ? req.body.status : 0;
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.type = req.body.type ? req.body.type : 0;  // 1-Task 2-Meeting
                req.body.isRepeats = req.body.isRepeats ? req.body.isRepeats : 0;
                req.body.repeatCount = req.body.repeatCount != undefined ? req.body.repeatCount : 1;
                req.body.repeatType = req.body.repeatType ? req.body.repeatType : 3;
                req.body.isEndDate = req.body.isEndDate ? req.body.isEndDate : 0;
                req.body.alertType = req.body.alertType ? req.body.alertType : 0;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : "";
                req.body.ends = req.body.ends != undefined ? req.body.ends : null;

                    var memberList =req.body.memberList;
                    if(typeof(memberList) == "string") {
                        memberList = JSON.parse(memberList);
                    }
                    if(!memberList){
                        memberList = [];
                    }

                    var sharedMemberList =req.body.sharedMemberList;
                    if(typeof(sharedMemberList) == "string") {
                        sharedMemberList = JSON.parse(sharedMemberList);
                    }
                    if(!sharedMemberList){
                        sharedMemberList = [];
                    }

                    var attachmentList =req.body.attachmentList;
                    if(typeof(attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if(!attachmentList){
                        attachmentList = [];
                    }


                    if(req.body.ends == ""){
                    req.body.ends = null
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(req.body.starts),
                    req.st.db.escape(req.body.ends),
                    req.st.db.escape(req.body.progress),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(JSON.stringify(memberList)),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.isRepeats),
                    req.st.db.escape(req.body.repeatCount),
                    req.st.db.escape(req.body.repeatType),
                    req.st.db.escape(req.body.isEndDate),
                    req.st.db.escape(req.body.alertType),
                    req.st.db.escape(JSON.stringify(sharedMemberList)),
                    req.st.db.escape(req.body.senderNotes)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_taskForm( ' + procParams.join(',') + ')';
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
                                console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                notification.publish(
                                    results[1][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[1][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0,
                                    (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                        },
                                        contactList : null
                                    },
                                    null,tokenResult[0].isWhatMate,
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
                        response.message = "Task saved successfully";
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
                                groupId: req.body.groupId,
                                receiverId: results[0][0].receiverId,
                                transId : results[0][0].transId,
                                formId : results[0][0].formId,
                                currentStatus : results[0][0].currentStatus,
                                currentTransId : results[0][0].currentTransId,
                                localMessageId : req.body.localMessageId,
                                parentId : results[0][0].parentId,
                                accessUserType : results[0][0].accessUserType,
                                heUserId : results[0][0].heUserId,
                                formData : JSON.parse(results[0][0].formDataJSON)
                            }
                        };
                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving task";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });

                });

            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taskCtrl.getTask = function(req,res,next){
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
                req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                req.query.status = (req.query.status) ? (req.query.status) : 1;

                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_scheduledTaskList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        response.status = true;
                        response.message = "Task requests loaded successfully";
                        response.error = null;
                        response.data = {
                            taskList : results[0],
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
                        response.message = "No task requests found";
                        response.error = null;
                        response.data = {
                            taskList : [],
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
                        response.message = "Error while getting task requests";
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

taskCtrl.updateTaskStatus = function(req,res,next){
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

    if (!req.body.scheduledId) {
        error.scheduledId = 'Invalid scheduledId';
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
                    req.st.db.escape(req.body.scheduledId),
                    req.st.db.escape(req.body.status)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_taskStatus( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err){
                        response.status = true;
                        response.message = "Task status updated successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while updating task status";
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

taskCtrl.scheduleTask = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
                var procQuery = 'CALL he_schedule_tasks()';
                console.log(procQuery);

                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err){
                        response.status = true;
                        response.message = "Task Scheduled successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while scheduling task";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });



    }

};

taskCtrl.getStationary = function(req,res,next){
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
            var procQuery = 'CALL HE_get_app_stationary( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){
                if(!err && stationaryResult && stationaryResult[0] && stationaryResult[0][0]){
                    response.status = true;
                    response.message = "Stationeries loaded successfully";
                    response.error = null;
                    response.data = stationaryResult[0][0];

                    /*
                     * dcrypt and again unzip and extract data */

                    var bufA = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                    // console.log("bufA",bufA.toString('utf-8'));
                    zlib.unzip(bufA, function (_, resultDecrypt) {
                        console.log("resultDecrypt",resultDecrypt.toString('utf-8'));
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        console.log("req.body",req.body);
                        console.log("req.body.stationaryId",req.body.stationaryId);
                    });


                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    // response.data = encryption.encrypt(buf,tokenResult[0].secretKey).toString('base64');
                    // res.status(200).json(response);

                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if(!err){
                    response.status = true;
                    response.message = "Stationeries loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting stationeries";
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

module.exports = taskCtrl;