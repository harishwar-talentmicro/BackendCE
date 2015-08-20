var moment = require('moment');
var AppleNotification = require('./notification-apns.js');
var NotificationMqtt = require('./notification-mqtt.js');
var notificationMqtt = new NotificationMqtt();
var apnsNotification = new AppleNotification();

var st = null;

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
_ */
Notification.prototype.publish = function(receiverId, senderTitle,groupTitle,groupId,message,
                                          messageType,operationType,iphoneId,messageId){
    var validationStatus = true;
    var error = {};
    if(!senderTitle){
        senderTitle = "";
    }
    if(!groupTitle){
        groupTitle = "";
    }
    if(parseInt(groupId) == NaN || parseInt(groupId) < 1){
        validationStatus = false;
        error.groupId = "Error parameter 3  :  \" "+groupId + "\"";
    }
    if(!message){
        validationStatus = false;
        error.message = "Error parameter 4  :  \""+message + "\"";
    }

    if(parseInt(messageType) < 0 && parseInt(messageType) > 3){
        validationStatus = false;
        error.messageType = "Error parameter 5 : \""+messageType + "\"";
    }

    if(parseInt(operationType) < 0 && parseInt(operationType) > 2){
        validationStatus = false;
        error.operationType = "Error parameter 5 : \""+messageType + "\"";
    }


    if(validationStatus){

        var msgBytes = 1024;
        var messagePayload = {
            gid : 12,
            message : notificationMqtt.limitMessage(message,msgBytes),
            s_title : senderTitle,
            g_title : groupTitle,
            type : messageType,
            ts : moment().format("YYYY-MM-DD HH:mm:ss"),
            op: operationType,
            mid : messageId
        };

        notificationMqtt.publish(receiverId,messagePayload);


        /**
         * If IPhone ID is there for this user then send notification to his iphone id also
         */
        if(iphoneId){

            apnsNotification.sendAppleNS(iphoneId,messagePayload);
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

    try{
        st.validateToken(token,function(err,result){
            if(err){
                console.log('Error : Notification Module authUser - while token validation');
                console.log(err);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
                res.send('deny');
            }
            else{
                if(result){
                    res.send('allow');
                }
                else{
                    console.log('Access Denied : Notification Module authUser - while token validation');
                    res.send('deny');
                }
            }
        });
    }
    catch(ex){
        console.log('Error : Notification Module authUser');
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.send('deny');
    }


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
        res.send('allow')
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