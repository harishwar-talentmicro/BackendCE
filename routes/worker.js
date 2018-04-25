/**
 * Created by Jana1 on 05-04-2018.
 */
// var Notification = require('../../../modules/notification/notification-master.js');
var Notification = require('../routes/modules/notification/notification-master.js');
var notification = new Notification();
var moment = require('moment');
var NotificationTemplater = require('../routes/lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();


module.exports = function(favoriteBook,done) {
    // console.log("startPage",favoriteBook.increment);
    // console.log("results",favoriteBook.results[0]);
    // console.log("limitValues",favoriteBook.limitValues);
    var messageIds = "" ;
    var startPage = favoriteBook.increment ;
    var limit = favoriteBook.limitValues ;
    var results = favoriteBook.messageList ;


    // start page =0 limit=100 loop from 0 =99  (<100)
    // start page =1 limit=100 loop from 100 = 199  (<200)
    // start page =2 limit=100 loop from 200 = 299  (<300)
    // start page =3 limit=100 loop from 300 = 399   (<400)
    // start page =4 limit=100 loop from 400 = 499   (<500) in for loop
    var initialValue = (startPage * limit) ;
    var limitValue = 100;

    if (initialValue == 0){
        limitValue = limit  ;
    }
    else {
        limitValue = ((startPage * limit) + (limit)) ;  // 200 +(100) = 200+100 =300
    }

    if(limitValue > results.length){
        limitValue = results.length ;
    }

console.log("initialValue",initialValue);
console.log("limitValue",limitValue);

    for (var i = initialValue; i < limitValue ; i++) {
        // console.log("i",i);
        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
            senderName : results[i].message ? results[i].message : ""
        });
        if (notificationTemplaterRes.parsedTpl) {
            notification.publish(
                results[i].receiverId,
                (results[i].groupName) ? (results[i].groupName) : '',
                (results[i].groupName) ? (results[i].groupName) : '',
                results[i].senderId,
                notificationTemplaterRes.parsedTpl,
                31,
                0,
                (results[i].iphoneId) ? (results[i].iphoneId) : '',
                (results[i].GCM_Id) ? (results[i].GCM_Id) : '',
                0,
                0,
                0,
                0,
                1,
                moment().format("YYYY-MM-DD HH:mm:ss"),
                '',
                0,
                0,
                null,
                '',
                /** Data object property to be sent with notification **/
                {
                    messageList: {
                        messageId: results[i].messageId,
                        message: results[i].message,
                        messageLink: results[i].messageLink,
                        createdDate: results[i].createdDate,
                        messageType: results[i].messageType,
                        messageStatus: results[i].messageStatus,
                        priority: results[i].priority,
                        senderName: results[i].senderName,
                        senderId: results[i].senderId,
                        receiverId: results[i].receiverId,
                        groupId: results[i].senderId,
                        groupType: 2,
                        transId: results[i].transId,
                        formId: results[i].formId,
                        currentStatus: results[i].currentStatus,
                        currentTransId: results[i].currentTransId,
                        parentId: results[i].parentId,
                        accessUserType: results[i].accessUserType,
                        heUserId: results[i].heUserId,
                        formData: JSON.parse(results[i].formDataJSON)
                    },
                    contactList: null
                },
                null, 1,
                results[i].secretKey);
            if(messageIds == ""){
                messageIds = results[i].messageUserId ;
            }
            else {
                messageIds = messageIds + "," + results[i].messageUserId ;
            }

            }
        else {
            console.log('Error in parsing notification compose_message template - ',
                notificationTemplaterRes.error);
        }

        if(i == (limitValue-1) ){
            messageIds = '"' + messageIds + '"' ;
            var procQuery = 'CALL he_update_isNotifiedMessages( ' + messageIds + ')';
            console.log(procQuery);
            db.query(procQuery,function(err,results) {
                if(!err){
                    done('Awesome thread script may run in browser and node.js!');
                }
                else {
                    done(err);
                }

            });
        }

    }

};