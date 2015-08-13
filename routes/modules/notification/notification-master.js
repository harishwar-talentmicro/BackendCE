var st = null;

function Notification(db,stdLib){

    if(stdLib){
        st = stdLib;
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

/**
 * Publishing a message to a particular topic
 * @param groupTitle* (Name of the person or group who sent the message)
 * @param senderTitle* (Name of the person in group or the individual who sent the message)
 * @param groupId* (To which  you want to send message, TID of tmGroups table)
 * @param message (What message to be sent using notifications)
 * @param messageType (What kind of message to be sent 0 :Group, 1 : Individual, 2 : Alarm, 3: EZEOne Public Notifications)
 * @param operationType (Operation type decides what kind of notification it is)
 * @param iphoneId (If user is having iphone id then pass it also)
 */
Notification.prototype.publish = function(senderTitle,groupTitle,groupId,message,messageType,operationType,iphoneId){
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

};


Notification.prototype.sendAppleNS = function(req,res,next){
    var http = require('http');
    var apn = require('apn');

    var myPhone =         "51c33c5fef8c134ab86b6cd6b86885e7b452cc9cb865093dbe6c51164d0a1c11";

    var myDevice = new apn.Device(myPhone);

    var FinalMessage = {
        Message: 'Apple Push Notification Test for EZEOne',
        Result: 'Pass',
        StatusCode: '200'
    };

    var note = new apn.Notification();
    note.badge = 2;
    note.sound = "notification-beep.wav";
    note.alert = { "body" : "Test Message", "action-loc-key" : "Play" ,
        "launch-image" :
            "mysplash.png","JsonResult":JSON.stringify(FinalMessage)};
    note.payload =FinalMessage;

    note.device = myDevice;

    var callback = function(errorNum, notification){
        console.log('Error is: %s', errorNum);
        console.log("Note " + notification);
    };
    var options = {
        gateway: 'gateway.sandbox.push.apple.com', // this URL is different for Apple's Production Servers and changes when you go to production
        errorCallback: callback,
        cert: 'cert.pem',
        key:  'key.pem',
        passphrase: 'hire@123',
        port: 2195,
        enhanced: true,
        cacheLength: 100
    };
    var apnsConnection = new apn.Connection(options);
    //apnsConnection.sendNotification(note);
    apnsConnection.pushNotification(note, myDevice);
    res.status(200).json({status : true, message : 'Message Sent'});
};


/**
 * @todo FnGetAlarmMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for send notifications messages
 */
function FnGetAlarmMessages(){
    try
    {
    var _this = this;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var query = 'CALL pGetAlarmMessages()';
    st.db.query(query, function (err, getResult) {
        console.log(getResult);
        if (!err) {
            if (getResult) {
                if (getResult[0].length > 0) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Alarm Messages loaded successfully';
                    responseMessage.data = getResult[0];
                    res.status(200).json(responseMessage);
                    console.log('FnGetAlarmMessages: Alarm Messages loaded successfully');
                }
                else {
                    responseMessage.message = 'Alarm Messages not loaded';
                    res.status(200).json(responseMessage);
                    console.log('FnGetAlarmMessages:Alarm Messages not loaded');
                }
            }
            else {
                responseMessage.message = 'Alarm Messages not loaded';
                res.status(200).json(responseMessage);
                console.log('FnGetAlarmMessages:Alarm Messages not loaded');
            }
        }
        else {
            responseMessage.message = 'An error occured ! Please try again';
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            res.status(500).json(responseMessage);
            console.log('FnGetAlarmMessages: error in getting Alarm Messages:' + err);
        }
    });
}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetAlarmMessages ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
}
module.exports = Notification;