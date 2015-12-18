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

//var request = require('request');
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

/*********************************************** AMQP upgraded code **************************************/

var amqp = require('amqp');
var url = 'amqp://indrajeet:indrajeet@'+CONFIG.MQTT.HOST+':5672/%2f';


var connOpt = {
        host: CONFIG.MQTT.HOST,
    port: 5672, login: 'indrajeet'
    , password: 'indrajeet'
    , connectionTimeout: 10000
    , authMechanism: 'AMQPLAIN'
    , vhost: '/'
    , noDelay: true
    , ssl: { enabled : false}
};

var amqpConn = null;

//amqpConn = amqp.createConnection({url: url},  { defaultExchangeName: 'amq.topic' });
amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });
console.log('.....................................................................');
console.log(amqpConn);
console.log('.....................................................................');
if(amqpConn){
    amqpConn.on('ready',function(){
        console.log('Connection established successfully to rabbitmq broker');
    });

    amqpConn.on('error',function(err){
        console.log(err);
        console.log('Connection generated an error event');
        amqpConn = amqp.createConnection({url: url},  { defaultExchangeName: 'amq.topic' });
    });
}



function NotificationMqtt(){
    try{
        if(!amqpConn){
            amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });
            amqpConn.on('ready',function(){
                console.log('Connection established successfully to rabbitmq broker');
            });

            amqpConn.on('error',function(){
                console.log('Connection generated an error event');
                amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });
            });
        }
    }
    catch(ex){
        console.log('Unable to reach rabbitmq server!');
    }
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
        /**
         * to get size of message and fix it at 1024 byte;
         */



        var bufsize = Buffer.byteLength(msgStr);
        console.log('original message buffer size : '+bufsize);
        console.log(typeof(bufsize));
        if (bufsize > 1024){
            var buf = new Buffer(1024);
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

NotificationMqtt.prototype.checkQueue = function(topic,callback){
    amqpConn.queue(
        topic,
        { passive : false,durable : true,exclusive : false,autoDelete : false},
        function(queRef){
            var exchange = amqpConn.exchange();
            callback();
        }
    );
};

NotificationMqtt.prototype.createQueue = function(topic,callback){
    amqpConn.queue(
        topic,
        { passive : false,durable : true,exclusive : false,autoDelete : false},
        function(queRef){
            var exchange = amqpConn.exchange();
            if(callback){
                callback();
            }
        }
    );
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
        //console.log(messagePayload);

        try{
            this.checkQueue(topic.toString(),function(){
                //mqttClient.publish('/'+topic,JSON.stringify(messagePayload),{qos : 1},function(){
                //    console.log('Message published : '+ topic);
                //});
                var exchange = amqpConn.exchange();
                exchange.publish(topic.toString(),
                    JSON.stringify(messagePayload),
                    { deliveryMode : 2, mandatory : false, immediate : false},
                    function(){
                        console.log('You are publishing to topic:'+'/'+topic);
                    });

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

module.exports = NotificationMqtt;