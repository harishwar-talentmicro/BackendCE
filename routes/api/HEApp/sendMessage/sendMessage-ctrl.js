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

var sendMessageCtrl = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

sendMessageCtrl.sendMessage = function(req,res,next){
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

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList = [];
    }
    // embededImages
    var embededImages =req.body.embededImages;
    if(typeof(embededImages) == "string") {
        embededImages = JSON.parse(embededImages);
    }
    if(!embededImages){
        embededImages = [];
    }

    var userList =req.body.userList;
    if(typeof(userList) == "string") {
        userList = JSON.parse(userList);
    }
    if(!userList){
        userList = [];
    }

    var branchList =req.body.branchList;
    if(typeof(branchList) == "string") {
        branchList = JSON.parse(branchList);
    }
    if(!branchList){
        branchList = [];
    }

    var departmentList =req.body.departmentList;
    if(typeof(departmentList) == "string") {
        departmentList = JSON.parse(departmentList);
    }
    if(!departmentList){
        departmentList = [];
    }

    var gradeList =req.body.gradeList;
    if(typeof(gradeList) == "string") {
        gradeList = JSON.parse(gradeList);
    }
    if(!gradeList){
        gradeList = [];
    }

    var groupList =req.body.groupList;
    if(typeof(groupList) == "string") {
        groupList = JSON.parse(groupList);
    }
    if(!groupList){
        groupList = [];
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
                req.body.message = req.body.message ? req.body.message : '';
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.status = req.body.status ? req.body.status : 0;
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.message),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(JSON.stringify(userList)),
                    req.st.db.escape(JSON.stringify(branchList)),
                    req.st.db.escape(JSON.stringify(departmentList)),
                    req.st.db.escape(JSON.stringify(gradeList)),
                    req.st.db.escape(JSON.stringify(groupList)),
                    req.st.db.escape(req.body.alarmType),
                    req.st.db.escape(JSON.stringify(embededImages)),
                    req.st.db.escape(req.body.groupType),
                    req.st.db.escape(req.body.memberCount)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_sendMessage( ' + procParams.join(',') + ')';
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
                        response.message = "Message sent successfully";
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
                        response.message = "Error while sending message";
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

sendMessageCtrl.getUserConfig = function(req,res,next){
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
    else{
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
                var procQuery = 'CALL he_Get_UserMsgMapDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,configResult){
                    if(!err && configResult ){
                        response.status = true;
                        response.message = "Configurations loaded successfully";
                        response.error = null;
                        response.data = {
                            branchList : configResult[0] ? configResult[0] : [],
                            departmentList : configResult[1] ? configResult[1] : [],
                            gradeList : configResult[2] ? configResult[2] : [],
                            groupList : configResult[3] ? configResult[3] : []
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting configuration";
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

sendMessageCtrl.getMemberCount = function(req,res,next){
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

    if (!req.body.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var branchList = req.body.branchList!=undefined ? req.body.branchList : "";
                var departmentList = req.body.departmentList!=undefined ? req.body.departmentList : "";
                var gradeList = req.body.gradeList!=undefined ? req.body.gradeList : "";
                var groupList = req.body.groupList!=undefined ? req.body.groupList : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(JSON.stringify(branchList)),
                    req.st.db.escape(JSON.stringify(departmentList)),
                    req.st.db.escape(JSON.stringify(gradeList)),
                    req.st.db.escape(JSON.stringify(groupList))
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_Get_sendMsgUserCount( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,configResult){
                    if(!err && configResult ){
                        response.status = true;
                        response.message = "Member count loaded successfully .";
                        response.error = null;
                        response.data = {
                            memberCount : configResult[0][0].count
                        };
                        res.status(200).json(response);

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        //     res.status(200).json(response);
                        // });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting member count";
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

sendMessageCtrl.getMasterData = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.HEMasterId = req.query.HEMasterId ? req.query.HEMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId)
                ];

                var procQuery = 'CALL He_get_MsgMasterData( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,masterResult){
                    if(!err && masterResult ){
                        response.status = true;
                        response.message = "Master data loaded successfully .";
                        response.error = null;
                        response.data = {
                            branches : masterResult[0] ? (masterResult[0]) : [],
                            departments: masterResult[1] ? masterResult[1] : [],
                            grades: masterResult[2] ? masterResult[2] : [],
                            RMGroups: masterResult[3] ? masterResult[3] : []
                        };
                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                         });

                    }
                    else if(!err){
                        response.status = false;
                        response.message = "master data is null";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting master data";
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

sendMessageCtrl.searchusersData = function(req,res,next){
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
    if (!req.query.keywords) {
        error.keywords = 'Invalid keyword';
        validationFlag *= false;
    }
    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.keywords = req.query.keywords ? req.query.keywords : '';


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'CALL He_get_UsersData( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if(!err && userResult && userResult[0]){
                        response.status = true;
                        response.message = "User data loaded successfully .";
                        response.error = null;
                        var output = [];
                        for(var i = 0; i < userResult[0].length; i++) {
                            var res2 = {};
                            res2.HEUserId = userResult[0][i].HEUserId;
                            res2.name = userResult[0][i].name;
                            res2.deptTitle = userResult[0][i].deptTitle;
                            res2.branches = userResult[0][i].branch ? JSON.parse(userResult[0][i].branch) : [];
                            res2.departments = userResult[0][i].department ? JSON.parse(userResult[0][i].department) : [];
                            res2.grades = userResult[0][i].grade ? JSON.parse(userResult[0][i].grade) : [] ;
                            res2.RMGroups = userResult[0][i].RMGroup ? JSON.parse(userResult[0][i].RMGroup) : [] ;
                            output.push(res2);
                        }

                        response.data = {
                            userData : output
                        };
                       //  res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                         res.status(200).json(response);
                        });

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "User data not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting User data";
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

sendMessageCtrl.GetMsgMapUsersData = function(req,res,next){
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
    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.keywords = req.query.keywords ? req.query.keywords : '';
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.keywords),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];

                var procQuery = 'CALL he_get_msgMap_userList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if(!err && userResult && userResult[0]){
                        response.status = true;
                        response.message = "User data loaded successfully .";
                        response.error = null;

                        var output = [];
                        for(var i = 0; i < userResult[0].length; i++) {
                            var res2 = {};
                            res2.HEUserId = userResult[0][i].HEUserId;
                            res2.name = userResult[0][i].name;
                            res2.branches = userResult[0][i].branch ? JSON.parse(userResult[0][i].branch) : [];
                            res2.departments = userResult[0][i].department ? JSON.parse(userResult[0][i].department) : [];
                            res2.grades = userResult[0][i].grade ? JSON.parse(userResult[0][i].grade) : [] ;
                            res2.RMGroups = userResult[0][i].RMGroup ? JSON.parse(userResult[0][i].RMGroup) : [] ;

                            output.push(res2);
                        }

                        response.data = {
                            userData : output,
                            count : userResult[1][0].count
                        };

                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "User data not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting User data";
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

sendMessageCtrl.saveMsgMapUsersData = function(req,res,next){
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
    if (!req.body.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }
    if (!req.body.HEUserId) {
        error.HEUserId = 'Invalid HEUserId';
        validationFlag *= false;
    }

    var branches =req.body.branches;
    if(typeof(branches) == "string") {
        branches = JSON.parse(branches);
    }
    if(!branches){
        branches = [];
    }

    var departments =req.body.departments;
    if(typeof(departments) == "string") {
        departments = JSON.parse(departments);
    }
    if(!departments){
        departments = [];
    }

    var grades =req.body.grades;
    if(typeof(grades) == "string") {
        grades = JSON.parse(grades);
    }
    if(!grades){
        grades = [];
    }

    var RMGroups =req.body.RMGroups;
    if(typeof(RMGroups) == "string") {
        RMGroups = JSON.parse(RMGroups);
    }
    if(!RMGroups){
        RMGroups = [];
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.keywords = req.query.keywords ? req.query.keywords : '';


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.HEMasterId),
                    req.st.db.escape(req.body.HEUserId),
                    req.st.db.escape(JSON.stringify(branches)),
                    req.st.db.escape(JSON.stringify(departments)),
                    req.st.db.escape(JSON.stringify(grades)),
                    req.st.db.escape(JSON.stringify(RMGroups))
                ];

                var procQuery = 'CALL he_save_msgMapDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if(!err ){
                        response.status = true;
                        response.message = "User data saved successfully .";
                        response.error = null;
                        response.data = null;

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving User data";
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


sendMessageCtrl.DeleteMsgMapUsersData = function(req,res,next){
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
    if (!req.query.HEUserId) {
        error.HEUserId = 'Invalid HEUserId';
        validationFlag *= false;
    }

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
                    req.st.db.escape(req.query.HEUserId)
                ];

                var procQuery = 'CALL he_delete_msgmap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if(!err ){
                        response.status = true;
                        response.message = "User data deleted successfully .";
                        response.error = null;

                        response.data = null;

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting User data";
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

module.exports = sendMessageCtrl;