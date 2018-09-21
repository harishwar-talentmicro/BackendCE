/**
 * Created by vedha on 04-09-2017.
 */
// We need to use the sns-mobile module
var SNS = require('sns-mobile');

var CONFIG = require('../../../ezeone-config.json');

// Some environment variables configured
// You don't want your keys in the codebase
// in plaintext
var SNS_KEY_ID = CONFIG.AWS_SNS.SNS_KEY_ID;
var SNS_ACCESS_KEY = CONFIG.AWS_SNS.SNS_SECRET_KEY_ID ;

// This is an application we created via the
// SNS web interface in the section
// Creating a GCM Platform Application (Android)
var ANDROID_ARN = CONFIG.AWS_SNS.SNS_ANDROID_ARN;
var IOS_ARN = CONFIG.AWS_SNS.SNS_IOS_ARN ;

var Dialer_ANDROID_ARN = CONFIG.AWS_SNS.SNS_Dialer_ANDROID_ARN;
var Dialer_IOS_ARN = CONFIG.AWS_SNS.SNS_Dialer_IOS_ARN ;

function Notification_aws(){
};

// Object to represent the PlatformApplication
// we're interacting with
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

var Dialer_IOS_SNS = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.IOS,
    // If using iOS change uncomment the line below
    // and comment out the 'android' one above
    // platform: 'ios',
    region: 'us-east-1',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_ACCESS_KEY,
    platformApplicationArn: Dialer_IOS_ARN
});

var ANDROID_SNS = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
    region: 'us-east-1',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_ACCESS_KEY,
    platformApplicationArn: ANDROID_ARN
});

var Dialer_ANDROID_SNS = new SNS({
    platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
    region: 'us-east-1',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_KEY_ID,
    secretAccessKey: SNS_ACCESS_KEY,
    platformApplicationArn: Dialer_ANDROID_ARN
});


// Handle user added events
// myApp.on('userAdded', function(endpointArn, deviceId) {
//     console.log('\nSuccessfully added device with deviceId: ' + deviceId + '.\nEndpointArn for user is: ' + endpointArn);
//     // Maybe do some other stuff...
// });
//
// Publically exposed function
// Recieves request and response objects
// This is used by index.js
//
// exports.register = function(req, res) {
//
// };

Notification_aws.prototype.publish_IOS = function(deviceId,messagePayload,issos) {
    // Add the user to SNS
    var sound = "default";
    var alert ="" ;
    var alarmType = (messagePayload.alarmType != 'undefined' || messagePayload.alarmType != 'Nan' || messagePayload.alarmType != null ) ? messagePayload.alarmType : 1 ;
    if(alarmType == 0){
        sound = null;
    }
    else if(alarmType == 1){
        sound = "default";
    }
    else if(alarmType == 2){
        sound = "bell.wav";
    }
    else if(alarmType == 3){
        sound = "emergency_alert.mp3";
    }
    else if(alarmType == 4){
        sound = "short.wav";
    }

    if(messagePayload.type == 72 || messagePayload.type == 74 ){
        alert = {
            title : messagePayload.eventTitle,
            body : messagePayload.message
        }
    }
    else if(messagePayload.type == 73){
        alert = {
            title : messagePayload.title,
            body : messagePayload.message
        }
    }
    else {
        alert = messagePayload.message ;
    }
    // console.log("sound",sound);


    if (issos){
        var params = {
            default : "This is the default",
            // APNS_SANDBOX : {
            APNS : {
                aps : {
                    alert : alert,
                    sound: 'emergency_alert.mp3'
                },
                payload : messagePayload
            }
        };
    }
    else {
        var params = {
            default : "This is the default",
            APNS : {
                aps : {
                    alert : alert,
                    sound : sound
                },
                payload : messagePayload
            }
        };
    }

        params.APNS = JSON.stringify(params.APNS);

        deviceId = JSON.parse(deviceId);

        for (var i = 0; i < deviceId.length; i++ ) {
            if(deviceId[i].deviceId)
            {
                IOS_SNS.addUser(deviceId[i].deviceId, null, function(err, endpointArn) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // Send notifications
                        IOS_SNS.sendMessage(endpointArn, params, function(err, data) {
                            if (err) {
                                console.log(err.stack);
                            }
                            else {
                                console.log('push sent');
                                console.log(data);
                            }

                        });
                    }
                });
            }

        }

    //});

};

//
// For Development
// Notification_aws.prototype.publish_IOS = function(deviceId,messagePayload,issos) {
//     // Add the user to SNS
//     var sound = "default";
//     var alert ="" ;
//     var alarmType = (messagePayload.alarmType != 'undefined' || messagePayload.alarmType != 'Nan' || messagePayload.alarmType != null ) ? messagePayload.alarmType : 1 ;
//     if(alarmType == 0){
//         sound = null;
//     }
//     else if(alarmType == 1){
//         sound = "default";
//     }
//     else if(alarmType == 2){
//         sound = "bell.wav";
//     }
//     else if(alarmType == 3){
//         sound = "emergency_alert.mp3";
//     }
//     else if(alarmType == 4){
//         sound = "short.wav";
//     }
//
//     if(messagePayload.type == 72 || messagePayload.type == 74 ){
//         alert = {
//             title : messagePayload.eventTitle,
//             body : messagePayload.message
//         }
//     }
//     else if(messagePayload.type == 73){
//         alert = {
//             title : messagePayload.title,
//             body : messagePayload.message
//         }
//     }
//     else {
//         alert = messagePayload.message ;
//     }
//     console.log("sound",sound);
//
//
//     if (issos){
//         var params = {
//             default : "This is the default",
//             // APNS_SANDBOX : {
//             APNS_SANDBOX : {
//                 aps : {
//                     alert : alert,
//                     sound: 'emergency_alert.mp3'
//                 },
//                 payload : messagePayload
//             }
//         };
//     }
//     else {
//         var params = {
//             default : "This is the default",
//             APNS_SANDBOX : {
//                 aps : {
//                     alert : alert,
//                     sound : sound
//                 },
//                 payload : messagePayload
//             }
//         };
//     }
//
//     params.APNS_SANDBOX = JSON.stringify(params.APNS_SANDBOX);
//
//     deviceId = JSON.parse(deviceId);
//
//     for (var i = 0; i < deviceId.length; i++ ) {
//         if(deviceId[i].deviceId)
//         {
//             IOS_SNS.addUser(deviceId[i].deviceId, null, function(err, endpointArn) {
//                 if (err) {
//                     console.log(err);
//                 }
//                 else {
//                     // Send notifications
//                     IOS_SNS.sendMessage(endpointArn, params, function(err, data) {
//                         if (err) {
//                             console.log(err.stack);
//                         }
//                         else {
//                             console.log('push sent');
//                             console.log(data);
//                         }
//
//                     });
//                 }
//             });
//         }
//
//     }
//
//     //});
//
// };

Notification_aws.prototype.publish_Android = function(deviceId,messagePayload) {
    // Add the user to SNS
    var params = {
        default : "This is the default message which must be present when publishing a message to a topic. The default message will only be used if a message is not present one of the notification platforms.",
        GCM : {
            data : {
                message : messagePayload.message,
                body : messagePayload
            }
        }
    };
    params.GCM = JSON.stringify(params.GCM);
    deviceId = JSON.parse(deviceId);

    for (var i = 0; i < deviceId.length; i++ ) {
        if (deviceId[i].deviceId) {
            console.log("deviceId[i].deviceId",deviceId[i].deviceId);
            ANDROID_SNS.addUser(deviceId[i].deviceId, null, function(err, endpointArn) {
                if (err) {
                    console.log(err);
                }
                else {
                    ANDROID_SNS.sendMessage(endpointArn, params, function(err, messageId) {
                        console.log("messageId",messageId,"======",endpointArn);
                        if(err) {
                            console.log('An error occured sending message to device %s', endpointArn);
                            console.log(err);
                        } else {
                            console.log('Successfully sent a message to device %s. MessageID was %s', messageId);
                        }
                    });
                }
            });
        }
    }

    // });
};

Notification_aws.prototype.publish_dialer_IOS = function(deviceId,messagePayload,issos) {
    // Add the user to SNS
    var sound = "default";
    var alert ="" ;
    var alarmType = (messagePayload.alarmType != 'undefined' || messagePayload.alarmType != 'Nan' || messagePayload.alarmType != null ) ? messagePayload.alarmType : 1 ;
    if(alarmType == 0){
        sound = null;
    }
    else if(alarmType == 1){
        sound = "default";
    }
    else if(alarmType == 2){
        sound = "bell.wav";
    }
    else if(alarmType == 3){
        sound = "emergency_alert.mp3";
    }
    else if(alarmType == 4){
        sound = "short.wav";
    }

    if(messagePayload.type == 72 || messagePayload.type == 74 ){
        alert = {
            title : messagePayload.eventTitle,
            body : messagePayload.message
        }
    }
    else if(messagePayload.type == 73){
        alert = {
            title : messagePayload.title,
            body : messagePayload.message
        }
    }

    else if(messagePayload.type == 201){
        alert = "";
    }


    else {
        alert = messagePayload.message ;
    }
    // console.log("sound",sound);


    if (issos){
        var params = {
            default : "This is the default",
            // APNS_SANDBOX : {
            APNS : {
                aps : {
                    alert : alert,
                    sound: 'emergency_alert.mp3'
                },
                payload : messagePayload
            }
        };
    }
    else {
        var params = {
            default : "This is the default",
            APNS : {
                aps : {
                    alert : alert,
                    sound : sound
                },
                payload : messagePayload
            }
        };
    }

    params.APNS = JSON.stringify(params.APNS);

    deviceId = JSON.parse(deviceId);

    for (var i = 0; i < deviceId.length; i++ ) {
        if(deviceId[i].deviceId)
        {
            Dialer_IOS_SNS.addUser(deviceId[i].deviceId, null, function(err, endpointArn) {
                if (err) {
                    console.log(err);
                }
                else {
                    // Send notifications
                    Dialer_IOS_SNS.sendMessage(endpointArn, params, function(err, data) {
                        if (err) {
                            console.log(err.stack);
                        }
                        else {
                            console.log('push sent');
                            console.log(data);
                        }

                    });
                }
            });
        }

    }

    //});

};


Notification_aws.prototype.publish_dialer_Android = function(deviceId,messagePayload) {
    // Add the user to SNS
    var params = {
        default : "This is the default message which must be present when publishing a message to a topic. The default message will only be used if a message is not present one of the notification platforms.",
        GCM : {
            data : {
                message : messagePayload.message,
                body : messagePayload
            }
        }
    };
    params.GCM = JSON.stringify(params.GCM);
    deviceId = JSON.parse(deviceId);

    for (var i = 0; i < deviceId.length; i++ ) {
        if (deviceId[i].deviceId) {
            console.log("deviceId[i].deviceId",deviceId[i].deviceId);
            Dialer_ANDROID_SNS.addUser(deviceId[i].deviceId, null, function(err, endpointArn) {
                if (err) {
                    console.log(err);
                }
                else {
                    Dialer_ANDROID_SNS.sendMessage(endpointArn, params, function(err, messageId) {
                        console.log("messageId",messageId,"======",endpointArn);
                        if(err) {
                            console.log('An error occured sending message to device %s', endpointArn);
                            console.log(err);
                        } else {
                            console.log('Successfully sent a message to device %s. MessageID was %s', messageId);
                        }
                    });
                }
            });
        }
    }

    // });
};

module.exports = Notification_aws;