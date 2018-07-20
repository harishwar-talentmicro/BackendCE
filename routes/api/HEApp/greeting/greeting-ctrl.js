/**
 * Created by vedha on 15-06-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var uuid = require('node-uuid');

var st = null;
var htmlConvert = require('html-convert');

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

var convert = htmlConvert();
var image;
var attachFile = new Promise(function (resolve, reject) {
    // var p1 = Jimp.read("https://storage.googleapis.com/ezeone/9794bcc4-ff71-4477-8fb1-8484be3b8b72.png");
    // var p2 = Jimp.read("https://storage.googleapis.com/ezeone/f693c8c5-4928-438f-9c50-23c433cd6be8.png");
    // var guna;
    // Promise.all([p1, p2]).then(function (images) {


    //     var circleImage = new Promise(function (resolve, reject) {
    //         var profile = images[0];
    //         var mask = images[1];
    //         var w = (mask.bitmap.width); // the width of the image
    //         var h = mask.bitmap.height;
    //         profile.resize(w, h);
    //         console.log(h);
    //         profile.mask(mask, 0, 0).write("lenna-circle.png");
    //         resolve("lenna-circle.png");
    //     });
    //     circleImage.then(function () {
    //         Jimp.read("lenna-circle.png", function (err, penna) {
    //             penna.resize(160, 160);

    // open a file called "lenna.png"
    Jimp.read("https://storage.googleapis.com/ezeone/cfa611d0-31de-459e-b1a2-60e41980d5ad.png", function (err, lenna) {

        if (err) throw err;
        // resize


        var w = (lenna.bitmap.width); // the width of the image
        var h = lenna.bitmap.height;
        rewardRecognition
        var name = rewardRecognition[i][0].name;
        var title = rewardRecognition[i][0].title;
        var type = rewardRecognition[i][0].type;
        var title1 = rewardRecognition[i][0].title1;
        var title2 = rewardRecognition[i][0].title2;
        // console.log(name);
        // console.log(w);

        var nameLength = (((name.length / 2)));
        var TypeLength = (((type.length / 2)));
        var titleLength = (((title.length / 2)));

        //  console.log(name.width);
        //     lenna.autocrop([12, 1]); // automatically crop same-color borders from image (if any), frames must be a Boolean
        // lenna.crop( 12, 15, 10, 23);  

        lenna.quality(100)
        Jimp.loadFont(Jimp.FONT_SANS_64_BLACK).then(function (font) {
            lenna.print(font, (280 - (38 * nameLength)), 490, name)
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font) {
                lenna.print(font, (260 - (16 * TypeLength)), 270, type)
                Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(function (font) {
                    lenna.print(font, 10, 330, title)
                    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font) {
                        lenna.print(font, 50, 610, title1)
                        Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(function (font) {
                            lenna.print(font, 50, 660, title2, 650)
                            resolve(lenna.write("lena-small-bw.png"));

                        });

                    });

                });

            });

        });

    });
});

var greetingCtrl = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

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

greetingCtrl.saverewardAndrecognition = function (req, res, next) {
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
    if (!req.body.type) {
        error.type = 'Invalid type';
        validationFlag *= false;
    }

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


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                // var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(tokenResult)


                var senderGroupId;
                console.log(validationFlag, "validationFlag");


                // else{

                // for (var i = 0; i < rewardRecognition.length; i++) {
                //     var userName = rewardRecognition[i].Name;
                //     var amount = rewardRecognition[i].amount;
                //     rewardRecognition[i].image = image;
                // }

                var proc = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(JSON.stringify(rewardRecognition)),
                    req.st.db.escape(req.body.type),

                ];
                var procQuery = 'CALL wm_get_rewardRecognitionUserDetail( ' + proc.join(',') + ');';
                console.log(procQuery);
                req.db.query(procQuery, function (err, rewardRecognitionresults) {
                    console.log(err);
                    var result=rewardRecognition


                    rewardRecognition= JSON.parse(rewardRecognition);
                    for (var i = 0; i < rewardRecognition; i++) {

                        attachFile.then(function (resp) {
                            // console.log("response after promise", resp);
                            setTimeout(function () {
                                var attachment = {
                                    path: "lena-small-bw.png",
                                    extension: 'png',
                                    fileName: 'gunasheel'
                                };

                                // console.log("lena-small-bw.png")

                                var filetype = (attachment.extension) ? attachment.extension : '';

                                // console.log(filetype);
                                aUrl = uniqueId + '.' + filetype;
                                // console.log(uniqueId);
                                aFilename = attachment.fileName;
                                // console.log("aFilenameaFilename", aFilename);
                                // console.log("req.files.attachment.path", attachment.path);

                                var readStream = fs.createReadStream(attachment.path);

                                // console.log(readStream);
                                uploadDocumentToCloud(aUrl, readStream, function (err) {
                                    if (!err) {
                                        // console.log(aUrl)
                                    }
                                    else {

                                        console.log('FnSaveServiceAttachment:attachment not upload');
                                    }
                                });

                                // console.log(aUrl);
                                //  });  
                                // console.log("saved successfully");
                                //   })
                                // });
                            }, 1000)
                            rewardRecognition[i][0].image=aUrl;
                        });



                      

                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;

                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;



                var procParams = [
                    req.st.db.escape(req.query.token),

                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(JSON.stringify(rewardRecognition)),

                    req.st.db.escape(req.body.approverNotes),

                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(DBSecretKey)
                ];


                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_rewardsandRecognitions( ' + procParams.join(',') + ');';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results && results[0]) {
                        senderGroupId = results[0][0].senderId;
                        // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                        //     senderName : results[0][0].message
                        // });
                        //
                        // for (var i = 0; i < results[1].length; i++ ) {
                        //     if (notificationTemplaterRes.parsedTpl) {
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
                        //                     messageId: results[1][i].messageId,
                        //                     message: results[1][i].message,
                        //                     messageLink: results[1][i].messageLink,
                        //                     createdDate: results[1][i].createdDate,
                        //                     messageType: results[1][i].messageType,
                        //                     messageStatus: results[1][i].messageStatus,
                        //                     priority: results[1][i].priority,
                        //                     senderName: results[1][i].senderName,
                        //                     senderId: results[1][i].senderId,
                        //                     receiverId: results[1][i].receiverId,
                        //                     groupId: results[1][i].senderId,
                        //                     groupType: 2,
                        //                     transId : results[1][i].transId,
                        //                     formId : results[1][i].formId,
                        //                     currentStatus : results[1][i].currentStatus,
                        //                     currentTransId : results[1][i].currentTransId,
                        //                     parentId : results[1][i].parentId,
                        //                     accessUserType : results[1][i].accessUserType,
                        //                     heUserId : results[1][i].heUserId,
                        //                     formData : JSON.parse(results[1][i].formDataJSON)
                        //
                        //                 }
                        //             },
                        //             null,
                        //             tokenResult[0].isWhatMate,
                        //             results[1][i].secretKey);
                        //         console.log('postNotification : notification for compose_message is sent successfully');
                        //     }
                        //     else {
                        //         console.log('Error in parsing notification compose_message template - ',
                        //             notificationTemplaterRes.error);
                        //         console.log('postNotification : notification for compose_message is sent successfully');
                        //     }
                        // }

                        // pdf generation starts

                        // pdf generation ends

                        notifyMessages.getMessagesNeedToNotify();

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
                        response.message = "Error while saving expense claim";
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


module.exports = greetingCtrl;


