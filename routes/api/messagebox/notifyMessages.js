/**
 * Created by veddha on 23-04-2018.
 */


var st = null;
//  var dbConfig=require('../../../ezeone-config.json');
//  var DBSecretKey=dbConfig.DB.secretKey;
// thread
const threads = require('threads');
const config = threads.config;
const spawn = threads.spawn;

// Set base paths to thread scripts
config.set({
    basepath: {
        node: '../routes'
    }
});


var DbHelper = require('./../../../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var whatmateconfig = require('../../../ezeone-config.json');
var DBSecretKey = whatmateconfig.DB.secretKey;

function Messages() {
}

Messages.prototype.getMessagesNeedToNotify = function () {


    var procQuery = 'CALL he_get_messageList("' + DBSecretKey + '")';

    console.log(procQuery);

    db.query(procQuery, function (err, messageList) {
        if (!err && messageList && messageList[0]) {
            var numberOfThreads = Math.ceil(messageList[0].length / 10);
            console.log("numberOfThreads", numberOfThreads);
            for (var i = 0; i < numberOfThreads; i++) {

                try {
                    
                    try{
                    const thread = spawn('worker.js');
                    }
                    catch(ex){
                        console.log('spawn',ex);
                    }
                    thread
                        .send({ messageList: messageList[0], increment: i, limitValues: 100 });
                    thread
                        .on('message', function (response) {
                            console.log("thread_response", response);
                            thread.kill();

                        })
                        .on('error', function (error) {
                            console.log('Worker errored:', error);
                            thread.kill();
                        })
                        .on('exit', function () {
                            console.log('Worker has been terminated.');
                            thread.kill();
                        })
                        .on('disconnect', function () {
                            thread.kill();
                            console.log('Worker has been terminated.');
                        })
                        .on('close', function () {
                            thread.kill();
                            console.log('Worker has been terminated.');
                        });


                }
                catch (err) {
                    console.log(err);
                }

            }

        }
        else if (err) {
            console.log(err);
        }

    });
};


// Messages.prototype.authTokenFromDatabase=function(){
//     var proquery='call wm_get_twilioCredentials()';
//     db.query(proquery,function (err, result) {
//         if(!err && result[0] && result[0][0]){
//            return {
//             accountSid : result[0][0].accountSid,
//             authToken : result[0][0].authToken,
//             FromNumber : result[0][0].FromNumber
//            }
//         }
//     });
// }

module.exports = Messages;