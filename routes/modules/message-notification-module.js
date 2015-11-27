/**
 * Created by Gowri shankar on 27-11-2015.
 */

"use strict";

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}

var st = null;
var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;

function msgNotification(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
    }
};

msgNotification.prototype.sendNotification= function(MsgContent, CallBack) {
    var _this = this;

    console.log('-----Send Nofication of Compose Message-----');
    var to_ids,masterid,receiverId,gid,senderTitle,groupTitle,groupId;
    var messageText,messageType,operationType,iphoneId,messageId,id,id_type,iphoneID,dateTime,prioritys,msgUserid;
    try {

        var RtnMessage = {
            status: false

        };

        if (MsgContent) {
            ////msg content
            //{ message_id: 2976,
            //    message_userid: null,
            //    message: '<p>hi</p>',
            //    attachment: '',
            //    attachmentFilename: '',
            //    token: '56286bbc-94c9-11e5-88cc-42010af0ea4e',
            //    toID: '324',
            //    idType: '1',
            //    mimeType: '',
            //    ezeid: '@SGOWRI2' }
            id = MsgContent.idType.split(",");
                    console.log('msgid:'+MsgContent.message_id);
                    for (var c = 0; c < id.length; c++) {
                        id_type = parseInt(id[c]);
                        if (MsgContent.toID.length > 1) {
                            var toIDS = MsgContent.toID;
                            to_ids = toIDS.split(",");
                        }
                        else {
                            to_ids = [];
                            to_ids.push(MsgContent.toID);
                        }
                        gid = parseInt(to_ids[c]);
                        console.log('group id:'+gid);
                        var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + gid;
                        //console.log(queryParameters);
                        st.db.query(queryParameters, function (err, iosResult) {
                            if (iosResult) {
                                if (iosResult[0]) {
                                    iphoneID = iosResult[0].iphoneID;
                                }
                                else {
                                    iphoneID = '';
                                }
                                //console.log(iphoneID);
                                var queryParams = st.db.escape(MsgContent.token) + ',' + st.db.escape(id_type) + ',' + st.db.escape(gid);
                                var messageQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                                //console.log(messageQuery);
                                st.db.query(messageQuery, function (err, groupDetails) {
                                    if (groupDetails) {
                                        if (groupDetails[0]) {
                                            if (groupDetails[0].length > 0) {
                                                if (groupDetails[1]) {
                                                    if (groupDetails[1].length > 0) {
                                                        var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type) + ',' + st.db.escape(MsgContent.token);
                                                        var messageQuery1 = 'CALL pGetGroupInfn(' + queryParams1 + ')';
                                                        console.log(messageQuery1);
                                                        st.db.query(messageQuery1, function (err, groupDetails1) {
                                                            if (groupDetails1) {
                                                                for (var i = 0; i < groupDetails[1].length; i++) {
                                                                    receiverId = groupDetails[1][i].tid;
                                                                    senderTitle = groupDetails[0][0].groupname;
                                                                    if (id_type == 0) {
                                                                        groupId = groupDetails1[0][0].groupid;
                                                                        groupTitle = groupDetails1[0][0].groupname;
                                                                    }
                                                                    else {
                                                                        groupId = groupDetails[0][0].tid;
                                                                        groupTitle = groupDetails[0][0].groupname;
                                                                    }
                                                                    messageText = MsgContent.message;
                                                                    messageType = id_type;
                                                                    operationType = 0;
                                                                    iphoneId = iphoneID;
                                                                    messageId = MsgContent.message_id;
                                                                    msgUserid = MsgContent.message_userid;
                                                                    masterid = groupDetails[0][0].AdminID;
                                                                    prioritys = MsgContent.priority;
                                                                    var a_name = MsgContent.attachmentFilename;
                                                                    var now = new Date();
                                                                    var t = now.toUTCString();
                                                                    var datetime = t.split(',');
                                                                    datetime = datetime[1];
                                                                    var latitude='', longitude = '';
                                                                    //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                                                    RtnMessage.status = true;
                                                                    CallBack(null, RtnMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnComposeMessage:Error getting from groupname');
                                                                CallBack(null, null);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnComposeMessage:Error getting from groupdetails1');
                                                        CallBack(null, null);
                                                    }
                                                }
                                                else {
                                                    console.log('FnComposeMessage:Error getting from groupdetails2');
                                                    CallBack(null, null);
                                                }
                                            }
                                            else {
                                                console.log('FnComposeMessage:Error getting from groupdetails3');
                                                CallBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnComposeMessage:Error getting from groupdetails4');
                                            CallBack(null, null);
                                        }
                                    }
                                    else {
                                        console.log('FnComposeMessage:Error getting from groupdetails5');
                                        CallBack(null, null);
                                    }
                                });
                            }
                        });
                    }
                }
                else {
                    console.log('FnSendMsgNotification: Message Content not loaded');
                    CallBack(null, null);
                }

        }
    catch (ex) {
        console.log(' FnSendMsgNotification : Catch error:' + ex.description);
        CallBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

module.exports = msgNotification;