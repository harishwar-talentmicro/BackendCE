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
var amqp = require('amqp');
//var mqtt    = require('mqtt');

var CONFIG = require('../../../ezeone-config.json');

var messagePayloadList = [];

/*********************************************** AMQP upgraded code **************************************/

var url = 'amqp://indrajeet:indrajeet@'+CONFIG.MQTT.HOST+':5672/%2f';

var connOpt = { defaultExchangeName: 'amq.topic',
        url : url,
    heartbeat: 20
    , reconnect: true
        , connectionTimeout: 10000
    , reconnectExponentialLimit: 120000
    , reconnectBackoffTime: 1000
};

var messageDeliverProcessFlag = false;

var amqpConn;
function createConnection(){

    amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });

    amqpConn.on('ready',function(){
        console.log('Connection established successfully to rabbitmq broker');
        if(!messageDeliverProcessFlag){
            messageDeliverProcessFlag = true;
        }
    });

    amqpConn.on('error',function(err){
        amqpConn = null;
        console.log('Connection error', err);
        messageDeliverProcessFlag = false;
        setImmediate(function(){
                createConnection();
        });
    });
}

createConnection();


console.log('.....................................................................');
//console.log(amqpConn);
console.log('.....................................................................');

function NotificationMqtt(){
    //try{
    //    if(!amqpConn){
    //        amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });
    //        amqpConn.on('ready',function(){
    //            console.log('Connection established successfully to rabbitmq broker');
    //        });
    //
    //        amqpConn.on('error',function(){
    //            setImmediate(function(){
    //                setTimeout(function(){
    //                    amqpConn = amqp.createConnection(connOpt,  { defaultExchangeName: 'amq.topic' });
    //                },500);
    //            });
    //        });
    //    }
    //}
    //catch(ex){
    //    console.log('Unable to reach rabbitmq server!');
    //}
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

//NotificationMqtt.prototype.checkQueue = function(topic,callback){
//    amqpConn.queue(
//        topic,
//        { passive : false,durable : true,exclusive : false,autoDelete : false},
//        function(queRef){
//            if(callback){
//                callback();
//            }
//        }
//    );
//};
//
//NotificationMqtt.prototype.createQueue = function(topic,callback){
//    amqpConn.queue(
//        topic,
//        { passive : false,durable : true,exclusive : false,autoDelete : false},
//        function(queRef){
//            if(callback){
//                callback();
//            }
//        }
//    );
//};

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
    if(validationFlag) {
        var uniqueMid = uuid.v4();
        messagePayload._id = Date.now() + '-' + uniqueMid;

        /**
         * Pushing the messsage to the start of the queue
         * First in First Out
         */
        messagePayloadList.unshift({ topic : topic ,messagePayload : messagePayload });
    }
};


function processMessages(){

    var intervalId = setInterval(function(){
        if(messagePayloadList.length > 0){
            clearInterval(intervalId);
            var messageObj = messagePayloadList.pop();

            console.log('RabbitTopic : '+messageObj.topic);
            try{

                if(messageDeliverProcessFlag){
                    amqpConn.queue(
                        messageObj.topic,
                        { passive : false,durable : true,exclusive : false,autoDelete : false},
                        function(){
                            var exchange = amqpConn.exchange();
                            exchange.publish(messageObj.topic.toString(),
                                JSON.stringify(messageObj.messagePayload),
                                { deliveryMode : 2, mandatory : true},
                                function(){
                                    console.log('You are publishing to topic:'+'/'+messageObj.topic);
                                    setImmediate(processMessages);
                                });
                        });
                }
                else{
                    /**
                     * Pushing the message to requeue to the exit end of the queue
                     */
                    messagePayloadList.push(messageObj);
                }

            }
            catch(ex){
                console.log(ex);
                console.log('An exception occurred while publish message to topic: '
                    + messageObj.topic + 'with payload '+JSON.stringify(messageObj.messagePayload));

                /**
                 * Pushing the message to requeue to the exit end of the queue
                 */
                messagePayloadList.push(messageObj);
            }

        }
    },500);
}

processMessages();

module.exports = NotificationMqtt;