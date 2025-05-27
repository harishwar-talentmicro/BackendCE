/**
 * Created by vedha on 15-06-2017.
 */


/**
 * Created by vedha on 15-06-2017.
 */

var notification = null;
var moment = require('moment');
var Jimp = require('jimp');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var uuid = require('node-uuid');
var greetingCtrl = {};
var error = {};

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

var st = null;
// var htmlConvert = require('html-convert');
var htmlConvert;
var gcloud = require('gcloud');
//var fs = require('fs');

var appConfig = require('../../../../ezeone-config.json');



var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

var uploadDocumentToCloud = function (uniqueName, readStream, callback) {
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function () {
        console.log('done');
        if (callback) {
            if (typeof (callback) == 'function') {
                callback(null);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function (err) {
        if (callback) {
            if (typeof (callback) == 'function') {
                console.log(err);
                callback(err);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};

// var fs = require('fs');

function Service(db, stdLib) {

    if (stdLib) {
        st = stdLib;
        notification = new Notification(db, stdLib);
        notificationQmManager = new NotificationQueryManager(db, stdLib);
    }
};
var rewardRecognition = [];
var i = 0;
var name = title = type = title1 = title2 = '';


// var convert = htmlConvert();
var image;



greetingCtrl.sendGreeting = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var groupList = req.body.groupList;
                    if (typeof (groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if (!groupList) {
                        groupList = [];
                    }

                    var memberList = req.body.memberList;
                    if (typeof (memberList) == "string") {
                        memberList = JSON.parse(memberList);
                    }
                    if (!memberList) {
                        memberList = [];
                    }

                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                        req.body.greetingImage = req.body.greetingImage ? req.body.greetingImage : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(memberList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.greetingImage),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey)
                        ];
                        var greetingFormId = 1035;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(greetingFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */

                        var procQuery = 'CALL HE_save_greeting( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                    senderName: results[0][0].senderName
                                });

                                for (var i = 0; i < results[1].length; i++) {
                                    if (notificationTemplaterRes.parsedTpl) {
                                        console.log(results[1][0].senderId, "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
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
                                                    transId: results[1][i].transId,
                                                    formId: results[1][i].formId,
                                                    currentStatus: results[1][i].currentStatus,
                                                    currentTransId: results[1][i].currentTransId,
                                                    parentId: results[1][i].parentId,
                                                    accessUserType: results[1][i].accessUserType,
                                                    heUserId: results[1][i].heUserId,
                                                    formData: JSON.parse(results[1][i].formDataJSON)
                                                },
                                                contactList: null
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
                                response.message = "Greeting sent successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while sending greeting";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


greetingCtrl.getGreetingsMaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL he_get_greetingsMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0][1] && results[1]) {

                        response.status = true;
                        response.message = "Greetings loaded successfully";
                        response.error = null;
                        response.data = {
                            userList: results[0],
                            greetingList: results[1]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No Greetings found";
                        response.error = null;
                        response.data = {
                            userList: [],
                            greetingList: []
                        };

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting Greetings";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


greetingCtrl.getrewardandrecognition = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),

                ];

                var procQuery = 'CALL wm_get_rewardAndRcognition( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {

                        response.status = true;
                        response.message = "rewards and recognition loaded successfully";
                        response.error = null;
                        // if(typeof(results[0])=='string'){
                        //        results=JSON.parse(results[0][0].rewardAndRecognitionList);
                        // }
                        response.data = {
                            typeList: results[0],
                            rewardRecognitionList: JSON.parse(results[1][0].rewardANDrecognition),
                            totalCount: results[2][0].totalCount
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No rewards and recognition found";
                        response.error = null;
                        response.data = {
                            typeList: [],
                            rewardAndRecognitionList: [],
                            totalCount: 0
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting rewards and recognition";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


greetingCtrl.saveRewardRecognization = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while loading users",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.templateId = (req.body.templateId) ? (req.body.templateId) : 0;
                req.body.templateTitle = (req.body.templateTitle) ? req.body.templateTitle : '';
                req.body.templateImage = (req.body.templateImage) ? (req.body.templateImage) : '';
                req.body.type = (req.body.type) ? (req.body.type) : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.templateTitle),
                    req.st.db.escape(req.body.templateImage),
                    req.st.db.escape(req.body.type)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_mRewardandRecognization( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        if (req.body.type == 1) {
                            response.message = "Reward saved successfully";
                        }
                        else if (req.body.type == 2) {
                            response.message = "Recognition saved successfully";
                        }
                        response.error = null;
                        response.data = results[0] ? results[0] : [];
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

greetingCtrl.getRRTemplateMaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL he_get_rewardRecognitionMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {

                        response.status = true;
                        response.message = "Greetings loaded successfully";
                        response.error = null;
                        response.data = {
                            templateList: results[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No Greetings found";
                        response.error = null;
                        response.data = {
                            templateList: []
                        };

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting Greetings";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


greetingCtrl.saverewardAndrecognition = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var resizeX = 160;
    var resizeY = 160;
    var nameX = 50;
    var nameY = 490;
    var typeX = 50;
    var typeY = 270;
    var titleX = 50;
    var titleY = 330;
    var title2X = 50;
    var title2Y = 610;
    var title1X = 50;
    var title1Y = 660;
    var title1MaxWidth = 700;
    var profilePictureX = 562;
    var profilePictureY = 338;


    var nameFunction = Jimp.FONT_SANS_64_BLACK;
    var typeFunction = Jimp.FONT_SANS_32_BLACK;
    var titleFunction = Jimp.FONT_SANS_32_WHITE;
    var title2Function = Jimp.FONT_SANS_32_BLACK;
    var title1Function = Jimp.FONT_SANS_32_BLACK;

    var nameMaxWidth = 1000;
    var titleMaxWidth = 1000;
    var firstName = '';
    var lastName = '';

    var lastNameMaxWidth = 1000;
    var lastNameX = 300;
    var lastNameY = 300;

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    // if (!req.body.type) {
    //     error.type = 'Invalid type';
    //     validationFlag *= false;
    // }

    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }


    var rewardRecognition = req.body.rewardRecognition;
    if (typeof (rewardRecognition) == "string") {
        rewardRecognition = JSON.parse(rewardRecognition);
    }
    if (!rewardRecognition) {
        rewardRecognition = [];
    }

    var template = req.body.template;
    if (typeof (template) == "string") {
        template = JSON.parse(template);
    }
    if (!template) {
        template = {};
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var i = 0;
                    var imageUrl = '';
                    var backGroundImage = '';
                    var timestamp = Date.now();
                    console.log(template.templateId);
                    console.log(req.body.heMasterId);
                    var backGround = 'call wm_get_rrTemplateImageForProcessing(' + template.templateId + ',' + req.body.heMasterId + ')';

                    console.log(backGround);
                    req.db.query(backGround, function (err, results) {
                        console.log('err', err);
                        console.log('results', results);

                        if (!err && results[0] && results[0][0]) {
                            backGroundImage = results[0][0].templateImage;
                            console.log("--=", backGroundImage);
                            resizeX = results[0][0].resizeX;
                            resizeY = results[0][0].resizeY;
                            nameX = results[0][0].nameX;
                            nameY = results[0][0].nameY;
                            typeX = results[0][0].typeX;
                            typeY = results[0][0].typeY;
                            titleX = results[0][0].titleX;
                            titleY = results[0][0].titleY;
                            title2X = results[0][0].title2X;
                            title2Y = results[0][0].title2Y;
                            title1X = results[0][0].title1X;
                            title1Y = results[0][0].title1Y;
                            title1MaxWidth = results[0][0].title1MaxWidth;
                            profilePictureX = results[0][0].profilePictureX;
                            profilePictureY = results[0][0].profilePictureY;
                            nameMaxWidth = results[0][0].nameMaxWidth;
                            titleMaxWidth = results[0][0].titleMaxWidth;

                            lastNameX = results[0][0].lastNameX;
                            lastNameY = results[0][0].lastNameY;
                            lastNameMaxWidth = results[0][0].lastNameMaxWidth;

                            if (results[0][0].templateType == 1) {
                                nameFunction = Jimp.FONT_SANS_64_BLACK;     // rewardee full userName taken from req.body.employeeCode
                                typeFunction = Jimp.FONT_SANS_32_BLACK;     // 0f (req.body.TitleoftheAward(MAIN TITLE) /type variable)
                                titleFunction = Jimp.FONT_SANS_32_WHITE;    // of(req.body.SubTitle (comes above name) /title variable)
                                title2Function = Jimp.FONT_SANS_32_BLACK;   // Of (req.body.ContentTitle/title2 variable)
                                title1Function = Jimp.FONT_SANS_32_BLACK;   //Of (req.body.content /title1 variable)
                                lastNameFunction = Jimp.FONT_SANS_64_BLACK;
                            }
                            else {
                                nameFunction = Jimp.FONT_SANS_64_WHITE;        // rewardee full userName taken from req.body.employeeCode
                                typeFunction = Jimp.FONT_SANS_32_WHITE;      // 0f (req.body.TitleoftheAward(MAIN TITLE) /type variable)
                                titleFunction = Jimp.FONT_SANS_16_WHITE;    // of(req.body.SubTitle (comes above name) /title variable)
                                title2Function = Jimp.FONT_SANS_32_WHITE;  // Of (req.body.ContentTitle/title2 variable)
                                title1Function = Jimp.FONT_SANS_32_WHITE;   //Of (req.body.content /title1 variable)
                                lastNameFunction = Jimp.FONT_SANS_64_WHITE;
                            }
                        }
                        // else if (!err) {
                        //     backGroundImage = '783f44a0-0ba3-45d3-af79-64be754b497d.png';
                        //     console.log(backGroundImage);

                        // }
                        else {
                            backGroundImage = '783f44a0-0ba3-45d3-af79-64be754b497d.png';
                            console.log(backGroundImage);
                        };

                        if (resizeX > 0) {
                            var proc = "select a.picture from tmaster a,theusers b where  a.tId=b.userMasterId and b.employeeCode= '" + rewardRecognition[0].EmployeeCode + "' and b.heMasterId=" + req.body.heMasterId;
                            console.log(proc);
                            req.db.query(proc, function (err, results) {
                                if (req.body.imageMandatory == 1) {

                                    if (!err && results[0] && results[0].picture && results[0].picture != "") {
                                        imageUrl = results[0].picture;
                                        console.log("--=", imageUrl);
                                    }
                                    else if (!err) {
                                        imageUrl = '3927ad80-aef7-4a1f-aad0-15aa3d6ead99.png';
                                        console.log("dummy", imageUrl);

                                    }
                                    else {
                                        imageUrl = '3927ad80-aef7-4a1f-aad0-15aa3d6ead99.png';
                                        console.log(imageUrl);

                                    };
                                }
                                else {
                                    imageUrl = '3927ad80-aef7-4a1f-aad0-15aa3d6ead99.png';
                                    console.log("no mandatory image", imageUrl);
                                }
                                Jimp.read("https://storage.googleapis.com/ezeone/f693c8c5-4928-438f-9c50-23c433cd6be8.png").then(function (image2) {
                                    Jimp.read("https://storage.googleapis.com/ezeone/" + backGroundImage, function (err, lenna) {

                                        var p1 = Jimp.read('https://storage.googleapis.com/ezeone/' + imageUrl).then(function (image1) {

                                            var profile = image1;
                                            var mask = image2;
                                            var w = mask.bitmap.width; // the width of the image
                                            var h = mask.bitmap.height;
                                            // console.log(w, h);
                                            profile.resize(w, h);
                                            // console.log(h);

                                            profile.mask(mask, 0, 0)
                                                .write("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lenna-circle" + timestamp + ".png", function () {
                                                    console.log('imposing profile picture over dummy');
                                                    Jimp.read("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lenna-circle" + timestamp + ".png", function (err, penna) {
                                                        penna.resize(resizeX, resizeY);   //resizeX,resizeY
                                                        console.log('reading edited profile picture');
                                                        console.log('reading background image');
                                                        if (err) throw err;

                                                        var w = (lenna.bitmap.width); // the width of the image
                                                        var h = lenna.bitmap.height;
                                                        var name = title = type = title1 = title2 = '';
                                                        var name = "";

                                                        var name = rewardRecognition[0].UserName;    //name on card

                                                        if (name && name.split(' ')[0])
                                                            firstName = name.split(' ')[0];
                                                        if (name && name.split(' ')[1])
                                                            lastName = name.split(' ')[1];

                                                        var title = rewardRecognition[0].SubTitle;  // subtitle below main title
                                                        var type = rewardRecognition[0].TitleoftheAward;   //mainTitle
                                                        var title1 = rewardRecognition[0].Content;    //  below contentTitle
                                                        var title2 = rewardRecognition[0].ContentTitle;  //below name

                                                        var nameLength = (((name.length / 2)));
                                                        var TypeLength = (((type.length / 2)));
                                                        var titleLength = (((title.length / 2)));

                                                        lenna.quality(100)
                                                        Jimp.loadFont(nameFunction).then(function (font) {
                                                            lenna.print(font, nameX, nameY, name, nameMaxWidth)    //font->fontSize,  50 -X,490 -Y ,  nameX,nameY
                                                            // Jimp.loadFont(lastNameFunction).then(function (font) {
                                                            // lenna.print(font, lastNameX, lastNameY, lastName, lastNameMaxWidth)    //font->fontSize,  50 -X,490 -Y ,  lastNameX,lastNameX
                                                            Jimp.loadFont(typeFunction).then(function (font) {
                                                                lenna.print(font, typeX, typeY, type)      // type // typeX ,typeY
                                                                Jimp.loadFont(titleFunction).then(function (font) {
                                                                    lenna.print(font, titleX, titleY, title, titleMaxWidth)    // titleX,titleY
                                                                    Jimp.loadFont(title2Function).then(function (font) {
                                                                        lenna.print(font, title2X, title2Y, title2)    // title2X,title2Y
                                                                        Jimp.loadFont(title1Function).then(function (font) {
                                                                            lenna.print(font, title1X, title1Y, title1, title1MaxWidth)   // title1X,title1Y,700- title1MaxWidth
                                                                            console.log("image processed");
                                                                            console.log('profilePicture', profilePictureX, profilePictureY);

                                                                            lenna.composite(penna, profilePictureX, profilePictureY)
                                                                                .write("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lena-small-bw" + timestamp + ".png", function () {
                                                                                    console.log('writing final image');   // profile picture positing,profilePictureX,profilePictureY
                                                                                    // console.log("response after promise", resp);
                                                                                    // setTimeout(function () {
                                                                                    var attachment = {
                                                                                        path: "/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lena-small-bw" + timestamp + ".png",
                                                                                        extension: 'png',
                                                                                        fileName: 'gunasheel'
                                                                                    };

                                                                                    console.log("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lena-small-bw" + timestamp + ".png")

                                                                                    var filetype = (attachment.extension) ? attachment.extension : '';
                                                                                    var uniqueId = uuid.v4();
                                                                                    // consol.log()
                                                                                    aUrl = uniqueId + '.' + filetype;
                                                                                    console.log(uniqueId);
                                                                                    aFilename = attachment.fileName;
                                                                                    // console.log("aFilenameaFilename", aFilename);
                                                                                    // console.log("req.files.attachment.path", attachment.path);

                                                                                    var readStream = fs.createReadStream(attachment.path);

                                                                                    // console.log(readStream);
                                                                                    uploadDocumentToCloud(aUrl, readStream, function (err) {
                                                                                        if (!err) {
                                                                                            console.log(aUrl);
                                                                                            fs.unlinkSync("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lena-small-bw" + timestamp + ".png");
                                                                                            fs.unlinkSync("/home/ezeonetalent/ezeone1/api/routes/api/HEApp/greeting/lenna-circle" + timestamp + ".png");

                                                                                        }
                                                                                        else {

                                                                                            console.log('FnSaveServiceAttachment:attachment not upload');
                                                                                        }
                                                                                    });


                                                                                    rewardRecognition[0].image = aUrl;

                                                                                    var rewards = rewardRecognition;

                                                                                    req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                                                                                    req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                                                                                    req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                                                                                    req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                                                                                    req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                                                                                    req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                                                                                    req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;

                                                                                    req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                                                                                    req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                                                                                    req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                                                                                    var procParams = [
                                                                                        req.st.db.escape(req.query.token),

                                                                                        req.st.db.escape(req.body.heMasterId),
                                                                                        req.st.db.escape(req.body.type),
                                                                                        req.st.db.escape(JSON.stringify(rewards)),

                                                                                        req.st.db.escape(req.body.parentId),

                                                                                        req.st.db.escape(req.body.approverNotes),

                                                                                        req.st.db.escape(req.body.receiverNotes),
                                                                                        req.st.db.escape(req.body.approverCount),
                                                                                        req.st.db.escape(req.body.receiverCount),
                                                                                        req.st.db.escape(req.body.accessUserType),
                                                                                        req.st.db.escape(req.body.learnMessageId),
                                                                                        req.st.db.escape(req.body.status),
                                                                                        req.st.db.escape(DBSecretKey),
                                                                                        req.st.db.escape(JSON.stringify(template)),
                                                                                        req.st.db.escape(req.body.timestamp),
                                                                                        req.st.db.escape(req.body.createdTimeStamp)

                                                                                    ];
                                                                                    /**
                                                                                     * Calling procedure to save form template
                                                                                     * @type {string}
                                                                                     */

                                                                                    var procQuery = 'CALL wm_save_rewardsandRecognition( ' + procParams.join(',') + ');';
                                                                                    console.log(procQuery);
                                                                                    req.db.query(procQuery, function (err, results) {
                                                                                        console.log(results);
                                                                                        if (!err && results && results[0]) {
                                                                                            senderGroupId = results[0][0].senderId;

                                                                                            // notifyMessages.getMessagesNeedToNotify();

                                                                                            response.status = true;
                                                                                            response.message = "Greetings saved successfully";
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
                                                                                                    transId: results[0][0].transId,
                                                                                                    formId: results[0][0].formId,
                                                                                                    groupId: req.body.groupId,
                                                                                                    currentStatus: results[0][0].currentStatus,
                                                                                                    currentTransId: results[0][0].currentTransId,
                                                                                                    localMessageId: req.body.localMessageId,
                                                                                                    parentId: results[0][0].parentId,
                                                                                                    accessUserType: results[0][0].accessUserType,
                                                                                                    heUserId: results[0][0].heUserId,
                                                                                                    formData: JSON.parse(results[0][0].formDataJSON)
                                                                                                }
                                                                                            };
                                                                                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                                                            // zlib.gzip(buf, function (_, result) {
                                                                                            //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                                                                            res.status(200).json(response);
                                                                                            // });
                                                                                        }
                                                                                        else {
                                                                                            response.status = false;
                                                                                            response.message = "Error while saving greetings";
                                                                                            response.error = null;
                                                                                            response.data = null;
                                                                                            res.status(500).json(response);
                                                                                        }
                                                                                    });
                                                                                });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                            // });
                                                        });

                                                    });
                                                });
                                        })
                                            .catch(function () {
                                                response.status = false;
                                                response.message = "Something went wrong! Please try again";
                                                response.error = null;
                                                response.data = null;
                                                res.status(500).json(response);
                                                console.log('error');
                                            })
                                    });

                                });
                                // .then(function (resp) {

                                // });
                            });
                        }
                        else {
                            response.status = false;
                            response.message = "Invalid template! Template details not configured. Please select a different template";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            response.status = false;
            response.message = "An error occurred!";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    }

};




module.exports = greetingCtrl;



