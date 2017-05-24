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
        console.log("myPhone",myPhone);
        var myDevice = new apn.Device(myPhone);
        console.log("myDevice",myDevice);


        var note = new apn.Notification();
        if (issos){
            note.sound = "sirens_x.wav";
        }
        else {
            note.sound = "notification-beep.wav";
        }

        note['content-available'] = 1;
        note.badge = 1;
        //note.sound = "notification-beep.wav";
        note.alert = { "body" : payload.s_title +' : ' +payload.message, "action-loc-key" : "Play" ,
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
            cert: (CONFIG.CONSTANT.DEBUG) ?  'cert.pem' : 'apple_cert.pem',
            key:  (CONFIG.CONSTANT.DEBUG) ?  'key.pem' : 'apple_key.pem',
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