var CONFIG = require('../../../ezeone-config.json');
function AppleNotification(){

};


/**
 * Payload is a well formed message in JSON format (already mentioned in document properly)
 * @param iphoneId
 * @param payload (JSON Object)
 */
AppleNotification.prototype.sendAppleNS = function(iphoneId,payload,issos){
    var http = require('http');
    var apn = require('apn');

    var myPhone =  iphoneId;


    try{
        var myDevice = new apn.Device(myPhone);


        var note = new apn.Notification();
        if (issos){
            note.sound = "sirens_x.wav";
        }
        else {
            note.sound = "notification-beep.wav";
        }

        note.badge = 0;
        //note.sound = "notification-beep.wav";
        note.alert = { "body" : payload.g_title +' : ' +payload.message, "action-loc-key" : "Play" ,
            "launch-image" :
                //"mysplash.png","JsonResult":JSON.stringify(payload)};
                "mysplash.png"};
        note.payload = payload;

        note.device = myDevice;

        var callback = function(errorNum, notification){
            console.log('Error is: %s', errorNum);
            console.log("Note ", notification);
        };
        var options = {

            //gateway: 'gateway.sandbox.push.apple.com', // this URL is different for Apple's Production Servers and changes when you go to production
            //gateway: 'gateway.push.apple.com', // this URL is different for Apple's Production Servers and changes when you go to production
            gateway : (CONFIG.APNS.GATEWAY) ? CONFIG.APNS.GATEWAY : 'gateway.sandbox.push.apple.com',
            errorCallback: callback,
            cert: 'cert.pem',
            key:  'key.pem',
            passphrase: (CONFIG.APNS.PASSPHRASE) ? CONFIG.APNS.PASSPHRASE : 'hire@123',
            port: (CONFIG.APNS.PORT) ? CONFIG.APNS.PORT : 2195,
            enhanced: true,
            cacheLength: 100
        };
        console.log('options',options);
            var apnsConnection = new apn.Connection(options);
            apnsConnection.pushNotification(note, myDevice);
    }
    catch(ex){
        console.log(ex);
        console.log('An error occurred while sending apple push notification');
        console.log('Payload For Apple Push Notification : '+JSON.stringify(payload));
    }


};


module.exports = AppleNotification;