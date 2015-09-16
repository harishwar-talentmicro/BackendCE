/**
 * MQTT Server Communication Functionality managed by this sub module
 * It includes
 * 1. Creating a topic
 * 2. Publishing to a topic
 *
 * @author Indra Jeet
 * @since Aug 13, 2015 07:14 PM IST
 */

var fs = require('fs');
var uuid = require('node-uuid');

var request = require('request');
//console.log(__dirname+'../../../ezeone-config.json');
//var CONFIG = JSON.parse(fs.readFileSync('./ezeone-config.json'));

var CONFIG = require('../../../ezeone-config.json');
console.log(CONFIG);

function MqttFalse(){};
function MqttFalseClient(){};

MqttFalse.prototype.connect = function(){
    var mqttFalseClient =  MqttFalseClient();
    return mqttFalseClient;
};
MqttFalse.prototype.publish = function(){};
MqttFalseClient.prototype.publish = function(topic,payload){};

var crypto = require('crypto');

var brokerUrl = 'mqtt://'+ CONFIG.MQTT.HOST+':'+CONFIG.MQTT.PORT;
var connOpt = {
    username : 'indrajeet',
    password : 'indrajeet',
    clientId : 'mqttjs_' + crypto.randomBytes(16).toString('hex')
};

var mqtt = null;
var mqttClient = null;

function NotificationMqtt(){
    try{
        mqtt = require('mqtt');
        try{
            if(!mqttClient){
                mqttClient = mqtt.connect(brokerUrl,connOpt);

                mqttClient.on('connect',function(){
                    console.log('MQTT Client connected successfully to broker');
                });
            }


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

        }
        catch(ex){
            console.log(ex);
        }
    }
    catch(ex){
        mqtt = MqttFalse();
        console.log(ex);
    }

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
        var uniqueMid = uuid.v4();

        messagePayload._id = Date.now() + '-' + uniqueMid;

        try{
            this.checkQueue(topic,function(){
                mqttClient.publish('/'+topic,JSON.stringify(messagePayload),{qos : 1},function(){
                    console.log('Message published : '+ topic);
                });
                console.log('You are publishing to topic:'+'/'+topic);
            },function(){
                console.log('Error publishing message to topic : '+topic);
                console.log(JSON.stringify(messagePayload));
            });
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
    function convertHtmlToText(htmlString){
        var regStr = "<([^>]*)>";

        var regExp = new RegExp(regStr,'g');
        return htmlString.replace(regExp, "");
    }
    
    
    function cutMessage(msgStr){
        /**
         * to get size of message and fix it at 1024 byte;
         */



        var bufsize = Buffer.byteLength(msgStr);
        console.log('original message buffer size : '+bufsize);
        console.log(typeof(bufsize));
        if (bufsize > 1024){
            var buf = new buffer(1024);
            buf.write(msgStr);
            var stringMessage = buf.toString('utf8');
            var stringbufsize = Buffer.byteLength(stringMessage);
            msgStr = stringMessage;
        }

        return msgStr;
    };
    
    var withoutHtml =  cutMessage(convertHtmlToText(message));
    return withoutHtml;

};


/**
 * Create a message queue for each EZEID when they signup or subuser is created
 * @param topic
 */
NotificationMqtt.prototype.createQueue = function(topic,callback,failedCallback){

    request({
        url: CONFIG.MQTT.ADMIN_PROTOCOL+ '://'+CONFIG.MQTT.ADMIN_HOST+ ((CONFIG.MQTT.ADMIN_PORT) ? ':'+ CONFIG.MQTT.ADMIN_PORT : '') +'/api/queues/%2F/'+topic.toString(), //URL to hit
        method: 'PUT',
        auth : {
            'user': CONFIG.MQTT.USERNAME,
            'pass': CONFIG.MQTT.PASSWORD,
            'sendImmediately': true
        },
        body: {
            durable : true,
            autodelete : false
        },
        json : true
    }, function(error, response, body){
        if(parseInt(response.statusCode) === 204){
            console.log('Topic created successfully : '+ topic.toString());
            if(callback){
                if(typeof(callback) == 'function'){
                    callback();
                }
            }
        }
        else{
            if(failedCallback){
                if(typeof(failedCallback) == 'function'){
                    failedCallback();
                }
            }
        }
    });

};

/**
 * Callback to be executed after finishing checking queue
 * @param topic
 * @param callback
 */
NotificationMqtt.prototype.checkQueue = function(topic,callback,failedCallback){
    var _this = this;

    try{
        request
            .get(CONFIG.MQTT.ADMIN_PROTOCOL+ '://'+CONFIG.MQTT.ADMIN_HOST+ ((CONFIG.MQTT.ADMIN_PORT) ? ':'+ CONFIG.MQTT.ADMIN_PORT : '')+'/api/queues/%2F/'+topic.toString(),{
                'auth': {
                    'user': CONFIG.MQTT.USERNAME,
                    'pass': CONFIG.MQTT.PASSWORD,
                    'sendImmediately': true
                }
            })
            .on('response', function(response) {
                if(parseInt(response.statusCode) === 200){
                    console.log('Topic :'+topic.toString() + ' exists');
                    if(callback){
                        if(typeof(callback) == 'function'){
                            callback();
                        }
                    }
                }
                else if(parseInt(response.statusCode) === 404){
                    _this.createQueue(topic,callback,failedCallback);
                }
                else{
                    if(failedCallback){
                        if(typeof(failedCallback) == 'function'){
                            failedCallback();
                        }
                    }
                    console.log('Error connecting to rabbit server at '+Date.now());
                    console.log('Message delayed for topic: ' + topic.toString());
                }
            });
    }
    catch(ex){
        console.log('Error in finding queue notification-mqtt.js');
        console.log(ex);
    }

};

module.exports = NotificationMqtt;