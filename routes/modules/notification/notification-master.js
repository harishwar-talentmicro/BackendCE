var moment = require('moment');
var AppleNotification = require('./notification-apns.js');
var NotificationMqtt = require('./notification-mqtt.js');
var Notification_aws = require('./aws-sns-push.js');

var _notificationMqtt = new NotificationMqtt();
var _apnsNotification = new AppleNotification();

var _Notification_aws = new  Notification_aws();

var st = null;


var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

function Notification(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * Publishing a message to a particular user
 * @param receiverId (Group Id of the intended user who will receive this notification) [ TID of tmGroups table]
 * @param groupTitle* (Name of the person or group who sent the message)
 * @param senderTitle* (Name of the person in group or the individual who sent the message)
 * @param groupId* (Who is responsible for notification for eg. If I(21)
 *        want to send request to join the HSR Group(43), then it will be 21 ,
 *        If Programmers (87) is a group and they requested me (21) to join the group then it will be 87 [TID of tmGroups table]
 * @param message (What message to be sent using notifications)
 * @param messageType (What kind of message to be sent 0 :Group, 1 : Individual, 2 : Alarm, 3: EZEOne Public Notifications)
 * @param operationType (Operation type decides what kind of notification it is)
 * @param iphoneId (If user is having iphone id then pass it also)
 * @param masterId (masterId of adminid or pass empty)
 * @param latitude (latitude of location)
 * @param longitude (longitude of location)
_ */
Notification.prototype.publish = function(receiverId, senderTitle,groupTitle,groupId,message,messageType,operationType,iphoneId,GCM_Id,
                                          messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,isWhatMate,secretKey){

    console.log('It is coming to publish block of Notification');
    var validationStatus = true;
    var error = {};
    if(!senderTitle){
        senderTitle = "";
    }
    if(!groupTitle){
        groupTitle = "";
    }

    /**
     * Commenting this to support SOS
     */
    //if(parseInt(groupId) == NaN || parseInt(groupId) < 1){
    //    validationStatus = false;
    //    error.groupId = "Error parameter 3  :  \" "+groupId + "\"";
    //}
    if(!aUrl){
        if(!message){
            validationStatus = false;
            error.message = "Error parameter 4  :  \""+message + "\"";
        }
    }


    if(parseInt(messageType) < 0 && parseInt(messageType) > 3){
        validationStatus = false;
        error.messageType = "Error parameter 5 : \""+messageType + "\"";
    }

    if(parseInt(operationType) < 0 && parseInt(operationType) > 2){
        validationStatus = false;
        error.operationType = "Error parameter 5 : \""+messageType + "\"";
    }
    if(!masterId){
        masterId = 0;
    }
    if(!latitude){
        latitude = 0.00;
    }
    if(!longitude){
        longitude = 0.00;
    }
    if(!priority){
        priority = "";
    }
    if(!dateTime){
        dateTime = "";
    }
    if(!a_name){
        a_name = "";
    }
    if(!msgUserid){
        msgUserid = 0;
    }
    if(!jobId){
        jobId = 0;
    }
    if(!aUrl){
        aUrl = '';
    }



    if(validationStatus){
        var msgBytes = 1024;
        var messagePayload = {} ;
        if (messageType == 31){
            var buf = new Buffer(JSON.stringify(data), 'utf-8');
            zlib.gzip(buf, function (_, result) {
                messagePayload = {
                    gid : groupId,
                    message : _notificationMqtt.limitMessage(message,msgBytes),
                    s_title : senderTitle,
                    g_title : groupTitle,
                    type : messageType,
                    ts : moment().format("YYYY-MM-DD HH:mm:ss"),
                    op: operationType,
                    mid : messageId,
                    masterid : masterId,
                    lat : latitude,
                    long : longitude,
                    priority : priority,
                    date_time : dateTime,
                    a_filename : a_name,
                    msgUserid : msgUserid,
                    job_id : jobId,
                    a_url : aUrl,
                    tx_id : txId,
                    data : encryption.encrypt(result,secretKey).toString('base64')
                };

                if(iphoneId){
                    _Notification_aws.publish_IOS(iphoneId,messagePayload,issos);
                }

                if (GCM_Id){
                    _Notification_aws.publish_Android(GCM_Id,messagePayload);
                }
            });
        }
        else {
            messagePayload = {
                gid : groupId,
                message : _notificationMqtt.limitMessage(message,msgBytes),
                s_title : senderTitle,
                g_title : groupTitle,
                type : messageType,
                ts : moment().format("YYYY-MM-DD HH:mm:ss"),
                op: operationType,
                mid : messageId,
                masterid : masterId,
                lat : latitude,
                long : longitude,
                priority : priority,
                date_time : dateTime,
                a_filename : a_name,
                msgUserid : msgUserid,
                job_id : jobId,
                a_url : aUrl,
                tx_id : txId,
                data : data
            };

            if(iphoneId){
                _Notification_aws.publish_IOS(iphoneId,messagePayload,issos);
            }

            if (GCM_Id){
                _Notification_aws.publish_Android(GCM_Id,messagePayload);
            }
        }


    }


};


/**
 *
 * Authorizes an MQTT user based on ezeoneId and token
 * @param req
 * @param res
 * @param next
 *
 * @service-param username* <string> (EZEOne ID of the person who wants to authenticate)
 * @service-param password* <string> (Token after user has logged in)
 *
 */
Notification.prototype.authUser = function(req,res,next){
    console.log(req.query);
    console.log(req.params);

    var ezeoneId = req.query.username;
    var token = req.query.password;
    var status = true;

    if(!token){
        status *= false;
    }

    if(!ezeoneId){
        status *= false;
    }

    //try{
    //    st.validateToken(token,function(err,result){
    //        if(err){
    //            console.log('Error : Notification Module authUser - while token validation');
    //            console.log(err);
    //            var errorDate = new Date();
    //            console.log(errorDate.toTimeString() + ' ......... error ...........');
    //            res.send('deny');
    //        }
    //        else{
    //            if(result){
    //                res.send('allow');
    //            }
    //            else{
    //                console.log('Access Denied : Notification Module authUser - while token validation');
    //                res.send('deny');
    //            }
    //        }
    //    });
    //}
    //catch(ex){
    //    console.log('Error : Notification Module authUser');
    //    console.log(ex);
    //    var errorDate = new Date();
    //    console.log(errorDate.toTimeString() + ' ......... error ...........');
    //    res.send('deny');
    //}
    res.send('allow');

};

Notification.prototype.authVHost = function(req,res,next){
    console.log(req.query);
    console.log(req.params);

    var ezeoneId = req.query.username;
    var token = req.query.password;
    var status = true;

    if(!token){
        status *= false;
    }

    if(!ezeoneId){
        status *= false;
    }

    try{
        //st.validateToken(token,function(err,result){
        //    if(err){
        //        console.log('Error : Notification Module authUser - while token validation');
        //        console.log(err);
        //        var errorDate = new Date();
        //        console.log(errorDate.toTimeString() + ' ......... error ...........');
        //        res.send('deny');
        //    }
        //    else{
        //        if(result){
        //            res.send('allow');
        //        }
        //        else{
        //            console.log('Access Denied : Notification Module authUser - while token validation');
        //            res.send('deny');
        //        }
        //    }
        //});
        res.send('allow');
    }
    catch(ex){
        console.log('Error : Notification Module authUser');
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.send('deny');
    }
};

Notification.prototype.authResource = function(req,res,next){
    console.log(req.query);
    console.log(req.params);

    // RabbitMQ virtual host
    var vHost = req.query.vhost;

    // RabbitMQ resource path
    var resource = req.query.resource;

    // RabbitMQ resource Name
    var resourceName = req.query.name;

    // RabbitMQ resource permissions : Configure, read and write
    var resourcePermission = req.query.permission;

    var status = true;

    //if(resourcePermission == 'configure'){
    //    status *= false;
    //}

    if(!status){
        res.status(200).send('deny');
    }
    else{
        try{
            //st.validateToken(token,function(err,result){
            //    if(err){
            //        console.log('Error : Notification Module authUser - while token validation');
            //        console.log(err);
            //        var errorDate = new Date();
            //        console.log(errorDate.toTimeString() + ' ......... error ...........');
            //        res.status(200).send('deny');
            //    }
            //    else{
            //        if(result){
            //            res.status(200).send('allow');
            //        }
            //        else{
            //            console.log('Access Denied : Notification Module authUser - while token validation');
            //            res.status(200).send('deny');
            //        }
            //    }
            //});
            res.send('allow');
        }
        catch(ex){
            console.log('Error : Notification Module authUser');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(200).send('deny');
        }
    }

};

module.exports = Notification;