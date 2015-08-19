/**
 * MQTT Server Communication Functionality managed by this sub module
 * It includes
 * 1. Creating a topic
 * 2. Publishing to a topic
 *
 * @author Indra Jeet
 * @since Aug 13, 2015 07:14 PM IST
 */

function MqttFalse(){};
function MqttFalseClient(){};

MqttFalse.prototype.connect = function(){
    var mqttFalseClient =  MqttFalseClient();
    return mqttFalseClient;
};
MqttFalse.prototype.publish = function(){};
MqttFalseClient.prototype.publish = function(topic,payload){};

var crypto = require('crypto');

var brokerUrl = 'mqtt://ms1.ezeone.com:80';
var connOpt = {
    username : 'indrajeet',
    password : 'indrajeet',
    clientId : 'mqttjs_' + crypto.randomBytes(16).toString('hex')
};

var mqtt = null;
try{
    mqtt = require('mqtt');
    try{
        var mqttClient = null;

        mqttClient = mqtt.connect(brokerUrl,connOpt);
    }
    catch(ex){
        console.log(ex);
    }
}
catch(ex){
    mqtt = MqttFalse();
    console.log(ex);
}




mqttClient.on('connect',function(){
    console.log('MQTT Client connected successfully to broker');
});

mqttClient.on('disconnect',function(){
    console.log('MQTT Client disconnected from broker ! Trying to connect in 1 second');
    setTimeout(function(){
        try{
            mqttClient = mqtt.connect(brokerUrl,connOpt);
        }
        catch(ex){
            console.log(ex);
        }
    },1000);

});


function NotificationMqtt(){

};

/**
 * Publishes message to a particular topic
 * @param topic (integer)
 * @param messagePayload (JSON object)
 */
NotificationMqtt.prototype.publish = function(topic,messagePayload){
    var validationFlag = true;
    if(!topic){
        console.log('Topic is not present');
        validationFlag *= false;
    }
    if(typeof(messagePayload) !== 'object'){
        console.log('Invalid message payload. Must be an object');
        validationFlag *= false;
    }
    if(validationFlag){
        try{
            mqttClient.publish(topic,JSON.stringify(messagePayload));
        }
        catch(ex){
            console.log(ex);
            console.log('An exception occurred while publish message to topic: '
                + topic + 'with payload '+JSON.stringify(messagePayload));
        }
    }
};

/**
 * Cut short the message to required byte to reduce the size of payload
 * @param message (string)
 * @param limit (in bytes)
 * @returns truncatedMessage (string)
 */
NotificationMqtt.prototype.limitMessage = function(message,limit){
    /**
     * @todo Limit message length to respected bytes
     */
    return message;
};


NotificationMqtt.prototype.createQueue = function(topic){

};

module.exports = NotificationMqtt;