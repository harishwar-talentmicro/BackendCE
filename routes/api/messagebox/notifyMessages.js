/**
 * Created by veddha on 23-04-2018.
 */


 var st = null;
 var dbConfig=require('../../../ezeone-config.json');
 var DBSecretKey=dbConfig.DB.secretKey;
 // thread
const threads  = require('threads');
const config  = threads.config;
const spawn   = threads.spawn;

// Set base paths to thread scripts
config.set({
    basepath : {
        node : '../routes'
    }
});

const thread = spawn('worker.js');
var DbHelper = require('./../../../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var whatmateconfig=require('../../../ezeone-config.json');
var DBSecretKey=whatmateconfig.DB.secretKey;

function Messages(){
}

Messages.prototype.getMessagesNeedToNotify = function() {


    var procQuery = 'CALL he_get_messageList("' + DBSecretKey + '")';

    console.log(procQuery);

    db.query(procQuery,function(err,messageList){
        if(!err && messageList && messageList[0]){
            var numberOfThreads = Math.ceil(messageList[0].length /100);
            console.log("numberOfThreads",numberOfThreads);
            for (var i = 0; i < numberOfThreads ; i++) {
                thread
                    .send({messageList:messageList[0],increment:i,limitValues:100})
                    .on('message', function(response) {
                        console.log("response",response);
                        thread.kill();
                    })
                    .on('error', function(error) {
                        console.log('Worker errored:', error);
                    })
                    .on('exit', function() {
                        console.log('Worker has been terminated.');
                    });
            }

        }
        else if(err) {
            console.log(err);
        }

    });
};

module.exports = Messages;