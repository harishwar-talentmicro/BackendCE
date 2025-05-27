/**
 * Created by Jana1 on 05-04-2018.
 */
// var Notification = require('../../../modules/notification/notification-master.js');
var Notification = require('../routes/modules/notification/notification-master.js');
var notification = new Notification();
var moment = require('moment');
var NotificationTemplater = require('../routes/lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var limitValue = 100;
var messageIds = "";


var zlib = require('zlib');
var AES_256_encryption = require('../routes/encryption/encryption.js');
var encryption = new AES_256_encryption();
var Notification_aws = require('../routes/modules/notification/aws-sns-push.js');
var _Notification_aws = new Notification_aws();

var SNS = require('sns-mobile');
var CONFIG = require('../ezeone-config.json');

var SNS_KEY_ID = CONFIG.AWS_SNS.SNS_KEY_ID;
var SNS_ACCESS_KEY = CONFIG.AWS_SNS.SNS_SECRET_KEY_ID;
var ANDROID_ARN = CONFIG.AWS_SNS.SNS_ANDROID_ARN;
var IOS_ARN = CONFIG.AWS_SNS.SNS_IOS_ARN;

var ANDROID_SNS = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
    region: 'us-east-1',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_ACCESS_KEY,
    platformApplicationArn: ANDROID_ARN
});

var IOS_SNS = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.IOS,
    // If using iOS change uncomment the line below
    // and comment out the 'android' one above
    // platform: 'ios',
    region: 'us-east-1',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_ACCESS_KEY,
    platformApplicationArn: IOS_ARN
});

module.exports = function (favoriteBook, done) {


    var startPage = favoriteBook.increment;
    var limit = favoriteBook.limitValues;
    var results = [];


    results = favoriteBook.messageList;

    var archiveFlag = 0;
    var initialValue = (startPage * limit);


    if (initialValue == 0) {
        limitValue = limit;
    }
    else {
        limitValue = ((startPage * limit) + (limit));  // 200 +(100) = 200+100 =300
    }

    if (limitValue > results.length) {
        limitValue = results.length;
    }


    var msgBytes = 1024;
    var messagePayload = {};

    var uploader = function (i) {
        var data = {};
        var messagePayload = {};
        try {
            if (i < limitValue) {



                notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                    senderName: results[i].message ? results[i].message : ""
                });
                var msgId = results[i].messageId;
                console.log('msgId', msgId);
                var procQuery = 'select ifnull((isArchive),0) as isArchive from tmmessageusers where messageId=' + msgId + ' limit 1';
                console.log('isArchive query', procQuery);
                db.query(procQuery, function (err, archiveresults) {
                    try {
                        console.log('archiveresults', archiveresults[0]);
                        console.log('err', err);
                        if (!err) {
                            archiveFlag = archiveresults[0].isArchive ? archiveresults[0].isArchive : 0;
                        }
                    }
                    catch (ex) {
                        console.log('archive query error');


                    }
                });


                if (results[i].groupType == 0) {
                    senderGroupId = results[i].groupId;

                }
                else {
                    senderGroupId = results[i].senderId;

                }
                data = {
                    messageList: {
                        messageId: results[i].messageId,
                        message: results[i].message,
                        messageLink: results[i].messageLink,
                        createdDate: results[i].createdDate,
                        messageType: results[i].messageType,
                        messageStatus: results[i].messageStatus,
                        priority: results[i].priority,
                        senderName: results[i].senderName,
                        senderId: results[i].senderId,
                        receiverId: results[i].receiverId,
                        groupId: senderGroupId,
                        groupName: results[i].groupName,
                        groupType: results[i].groupType,
                        transId: results[i].transId,
                        formId: results[i].formId,
                        currentStatus: results[i].currentStatus,
                        currentTransId: results[i].currentTransId,
                        parentId: results[i].parentId,
                        accessUserType: results[i].accessUserType,
                        heUserId: results[i].heUserId,
                        formData: JSON.parse(results[i].formDataJSON),
                        isArchive: archiveFlag
                    },
                    contactList: results[i].contactData ? JSON.parse(results[i].contactData) : null
                };




                var buf = new Buffer(JSON.stringify(data), 'utf-8');


                zlib.gzip(buf, function (_, result) {
                    messagePayload = {
                        gid: results[i].senderId,
                        message: notificationTemplaterRes.parsedTpl,
                        s_title: (results[i].groupName) ? (results[i].groupName) : '',
                        g_title: (results[i].groupName) ? (results[i].groupName) : '',
                        type: results[i].notificationType && results[i].notificationType!=0 ? results[i].notificationType : 31,
                        ts: moment().format("YYYY-MM-DD HH:mm:ss"),
                        op: 0,
                        mid: 0,
                        masterid: 0,
                        lat: 0,
                        long: 0,
                        priority: 0,
                        date_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                        a_filename: "",
                        msgUserid: 0,
                        job_id: 0,
                        a_url: null,
                        tx_id: '',
                        data: encryption.encrypt(result, results[i].secretKey).toString('base64')
                    };



                    var iphoneId = (results[i].iphoneId) ? (results[i].iphoneId) : '';
                    var isDialer = (results[i].isDialer) ? (results[i].isDialer) : 0;
                    var dialerGCM_Id = (results[i].DialerGCM_Id) ? (results[i].DialerGCM_Id) : '';
                    var GCM_Id = (results[i].GCM_Id) ? (results[i].GCM_Id) : '';

                    console.log('from results GCM_Id', results[i].GCM_Id);
                    console.log('iphoneId', results[i].iphoneId);
                    // console.log('results[i]',results[i]);

                    if (isDialer == 1) {
                        GCM_Id = dialerGCM_Id;
                    }

                    // console.log('iphoneId',iphoneId,'GCM_Id',GCM_Id);
                    if (iphoneId != "") {
                        var sound = "default";
                        var alert = "";
                        var alarmType = (messagePayload.alarmType != 'undefined' || messagePayload.alarmType != 'Nan' || messagePayload.alarmType != null) ? messagePayload.alarmType : 1;
                        if (alarmType == 0) {
                            sound = null;
                        }
                        else if (alarmType == 1) {
                            sound = "default";
                        }
                        else if (alarmType == 2) {
                            sound = "bell.wav";
                        }
                        else if (alarmType == 3) {
                            sound = "emergency_alert.mp3";
                        }
                        else if (alarmType == 4) {
                            sound = "short.wav";
                        }

                        if (messagePayload.type == 72 || messagePayload.type == 74) {
                            alert = {
                                title: messagePayload.eventTitle,
                                body: messagePayload.message
                            }
                        }
                        else if (messagePayload.type == 73) {
                            alert = {
                                title: messagePayload.title,
                                body: messagePayload.message
                            }
                        }
                        else {
                            alert = messagePayload.message;
                        }

                        var params = {
                            default: "This is the default",
                            APNS: {
                                aps: {
                                    alert: alert,
                                    sound: sound
                                },
                                payload: messagePayload
                            }
                        };
                        params.APNS = JSON.stringify(params.APNS);

                        IOS_SNS.addUser(iphoneId, null, function (err, endpointArn) {
                            if (err) {
                                if (messageIds == "") {
                                    messageIds = results[i].messageUserId;
                                }
                                else {
                                    messageIds = messageIds + "," + results[i].messageUserId;
                                }

                                return uploader(i + 1);
                            }
                            else {
                                // Send notifications
                                IOS_SNS.sendMessage(endpointArn, params, function (err, data) {
                                    if (err) {
                                        if (messageIds == "") {
                                            messageIds = results[i].messageUserId;
                                        }
                                        else {
                                            messageIds = messageIds + "," + results[i].messageUserId;
                                        }
                                        return uploader(i + 1);
                                    }
                                    else {

                                        if (messageIds == "") {
                                            messageIds = results[i].messageUserId;
                                        }
                                        else {
                                            messageIds = messageIds + "," + results[i].messageUserId;
                                        }
                                        return uploader(i + 1);
                                    }

                                });
                            }
                        });
                    }

                    else if (GCM_Id != "") {
                        console.log("GCM_ID", GCM_Id);

                        //  _Notification_aws.publish_Android(GCM_Id,messagePayload);
                        params = {
                            default: "This is the default message which must be present when publishing a message to a topic. The default message will only be used if a message is not present one of the notification platforms.",
                            GCM: {
                                data: {
                                    message: messagePayload.message,
                                    body: messagePayload
                                }
                            }
                        };
                        params.GCM = JSON.stringify(params.GCM);

                        ANDROID_SNS.addUser(GCM_Id, null, function (err, endpointArn) {
                            if (err) {
                                console.log('err', err);
                                if (messageIds == "") {
                                    messageIds = results[i].messageUserId;
                                }
                                else {
                                    messageIds = messageIds + "," + results[i].messageUserId;
                                }
                                return uploader(i + 1);
                            }
                            else {
                                ANDROID_SNS.sendMessage(endpointArn, params, function (err, messageId) {
                                    console.log("messageId", messageId, "======", endpointArn);
                                    if (err) {
                                        if (messageIds == "") {
                                            messageIds = results[i].messageUserId;
                                        }
                                        else {
                                            messageIds = messageIds + "," + results[i].messageUserId;
                                        }

                                        return uploader(i + 1);
                                    } else {
                                        if (messageIds == "") {
                                            messageIds = results[i].messageUserId;
                                        }
                                        else {
                                            messageIds = messageIds + "," + results[i].messageUserId;
                                        }

                                        console.log('Successfully sent a message to device %s. MessageID was %s', messageId);
                                        return uploader(i + 1);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        console.log('NO GCM_Id');
                        if (messageIds == "") {
                            messageIds = results[i].messageUserId;
                        }
                        else {
                            messageIds = messageIds + "," + results[i].messageUserId;
                        }

                        return uploader(i + 1);
                    }

                });


                // vedha

            }
            else {
                results = [];
                messageIds = '"' + messageIds + '"';
                var procQuery = 'CALL he_update_isNotifiedMessages( ' + messageIds + ')';
                console.log(procQuery);
                db.query(procQuery, function (err, results) {
                    if (!err) {
                        done('Awesome thread script may run in browser and node.js!');
                    }
                    else {
                        done(err);
                    }

                });

            }
        }
        catch (ex) {
            console.log('atfirst loop', ex)
            done('some error ocuured ');
        }

    };

    return uploader(initialValue);
    favoriteBook = [];

};
