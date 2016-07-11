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


var CONFIG = require('../../../ezeone-config.json');

/*********************************************** AMQP upgraded code **************************************/

var messageList = [];

function createConnection(){
    var open = require('amqplib').connect('amqp://'+CONFIG.MQTT.USERNAME+':'+CONFIG.MQTT.PASSWORD+'@'+CONFIG.MQTT.HOST+
        ':'+CONFIG.MQTT.AMQP_PORT+'/'+CONFIG.MQTT.VHOST+'?heartbeat=500');
    var openConn = open;

    openConn.then(function(conn) {

        conn.on('error',function(){
            setTimeout(function(){
                createConnection();
            },1000);
        });

        conn.on('close',function(){
            setTimeout(function(){
                createConnection();
            },1000);
        });

        var ok = conn.createChannel();

        ok = ok.then(function(channel){
            publishMessage(channel);
        });
        return ok;

    }).then(function(){
        console.log('ok');
        // publishMessage();
    },function(){
        setTimeout(function(){
            createConnection();
        },1000);
    });
}

createConnection();

var counter  = 0;
function publishMessage(channel){
    setImmediate(function() {
        if (messageList.length) {
            var msgObj = messageList.shift();
            try{
                channel.assertQueue(msgObj.topic).then(function(){
                    channel.publish('amq.topic', msgObj.topic, new Buffer(JSON.stringify(msgObj.message)));
                    console.log('Published message : ', ++counter );
                },function(){
                    messageList.unshift(msgObj);
                });
            }
            catch(ex){
                messageList.unshift(msgObj);
            }
        }
        publishMessage(channel);
    });
}


function NotificationMqtt(){
};

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

        return msgStr;
    };
    console.log('message ',message);
    var withoutHtml =  (message) ? cutMessage(convertHtmlToText(message)) : '';
    if(!withoutHtml){
        console.log('message is empty');
    }
    return withoutHtml;
};

NotificationMqtt.prototype.checkQueue = function(topic,callback){
};

NotificationMqtt.prototype.createQueue = function(topic,callback){

};

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

        console.log('RabbitTopic : '+topic);
        // console.log(messagePayload);

        try{

            messageList.push({
                topic : topic.toString(),
                message : messagePayload
            });
        }
        catch(ex){
            console.log(ex);
            console.log('An exception occurred while publish message to topic: '
                + topic + 'with payload '+JSON.stringify(messagePayload));
        }
    }
};

module.exports = NotificationMqtt;