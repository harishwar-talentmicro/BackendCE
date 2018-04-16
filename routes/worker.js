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


module.exports = function(results,done) {

    notificationTemplaterRes = notificationTemplater.parse('compose_message',{
        senderName : results.message ? results.message : ""
    });
    if (notificationTemplaterRes.parsedTpl) {
        notification.publish(
            results.receiverId,
            (results.groupName) ? (results.groupName) : '',
            (results.groupName) ? (results.groupName) : '',
            results.senderId,
            notificationTemplaterRes.parsedTpl,
            31,
            0,
            (results.iphoneId) ? (results.iphoneId) : '',
            (results.GCM_Id) ? (results.GCM_Id) : '',
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
                    messageId: results.messageId,
                    message: results.message,
                    messageLink: results.messageLink,
                    createdDate: results.createdDate,
                    messageType: results.messageType,
                    messageStatus: results.messageStatus,
                    priority: results.priority,
                    senderName: results.senderName,
                    senderId: results.senderId,
                    receiverId: results.receiverId,
                    groupId: results.senderId,
                    groupType: 2,
                    transId: results.transId,
                    formId: results.formId,
                    currentStatus: results.currentStatus,
                    currentTransId: results.currentTransId,
                    parentId: results.parentId,
                    accessUserType: results.accessUserType,
                    heUserId: results.heUserId,
                    formData: JSON.parse(results.formDataJSON)
                },
                contactList: null
            },
            null, 1,
            results.secretKey);

        var procQuery = 'insert into test_1(receiverId) values(' + results.receiverId + ')';
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
    else {
        console.log('Error in parsing notification compose_message template - ',
            notificationTemplaterRes.error);
    }


};