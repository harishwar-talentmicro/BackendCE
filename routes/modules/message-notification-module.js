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

msgNotification.prototype.sendNotification= function(msgContent, callBack) {
    var _this = this;

    console.log('-----Send Nofication of Compose Message-----');
    var to_ids,masterid,receiverId,gid,senderTitle,groupTitle,groupId;
    var messageText,messageType,operationType,iphoneId,messageId,id,id_type,dateTime,prioritys,msgUserid;
    try {

        var responseMessage = {
            status: false

        };

        //msg content
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
        id = msgContent.idType.split(",");
        to_ids = msgContent.toID.split(",");
        console.log('msgid:' + msgContent.message_id);

        var loopFunction = function (c) {
            if (c < id.length) {
                id_type = parseInt(id[c]);
                gid = parseInt(to_ids[c]);

                console.log('group id:' + gid);
                if (gid) {
                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + gid;
                    //console.log(queryParameters);
                    st.db.query(queryParameters, function (err, iosResult) {
                        if (iosResult) {
                            if (iosResult[0]) {
                                iphoneId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                            }
                            else {
                                iphoneId = '';
                            }
                            //console.log(iphoneId);
                            var queryParams = st.db.escape(msgContent.token) + ',' + st.db.escape(id_type) + ',' + st.db.escape(gid);
                            var messageQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                            //console.log(messageQuery);
                            st.db.query(messageQuery, function (err, groupDetails) {
                                if (groupDetails) {
                                    if (groupDetails[0]) {
                                        if (groupDetails[0].length > 0) {
                                            if (groupDetails[1]) {
                                                if (groupDetails[1].length > 0) {
                                                    var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type) + ',' + st.db.escape(msgContent.token);
                                                    var messageQuery1 = 'CALL pGetGroupInfn(' + queryParams1 + ')';
                                                    console.log(messageQuery1);
                                                    st.db.query(messageQuery1, function (err, groupDetails1) {
                                                        if (groupDetails1) {
                                                            if (groupDetails1[0]) {
                                                                if (groupDetails1[0][0]) {
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
                                                                        messageText = msgContent.message;
                                                                        messageType = id_type;
                                                                        operationType = 0;
                                                                        iphoneId = iphoneId;
                                                                        messageId = msgContent.message_id;
                                                                        msgUserid = msgContent.message_userid;
                                                                        masterid = groupDetails[0][0].AdminID;
                                                                        prioritys = msgContent.priority;
                                                                        var a_url = msgContent.attachment;
                                                                        var a_name = msgContent.attachmentFilename;
                                                                        var now = new Date();
                                                                        var t = now.toUTCString();
                                                                        var datetime = t.split(',');
                                                                        datetime = datetime[1];
                                                                        var latitude = 0.00, longitude = 0.00, jobId = 0;
                                                                        //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                        //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid, jobId, a_url);

                                                                    }
                                                                    c = c + 1;
                                                                    loopFunction(c);
                                                                    responseMessage.status = true;
                                                                    callBack(null, responseMessage);
                                                                }
                                                                else {
                                                                    console.log('FnComposeMessage:Error getting from groupname1');
                                                                    callBack(null, null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnComposeMessage:Error getting from groupname1');
                                                                callBack(null, null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnComposeMessage:Error getting from groupname1');
                                                            callBack(null, null);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnComposeMessage:Error getting from groupdetails1');
                                                    callBack(null, null);
                                                }
                                            }
                                            else {
                                                console.log('FnComposeMessage:Error getting from groupdetails2');
                                                callBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnComposeMessage:Error getting from groupdetails3');
                                            callBack(null, null);
                                        }
                                    }
                                    else {
                                        console.log('FnComposeMessage:Error getting from groupdetails4');
                                        callBack(null, null);
                                    }
                                }
                                else {
                                    console.log('FnComposeMessage:Error getting from groupdetails5');
                                    callBack(null, null);
                                }
                            });
                        }
                    });
                }
                else{
                    console.log('FnComposeMessage:Error getting from gid');
                    callBack(null, null);
                }
            }
        };

        if (msgContent) {
            var c = 0;
            loopFunction(c);
        }
        else {
            console.log('FnSendMsgNotification: Message Content not loaded');
            callBack(null, null);
        }

    }
    catch (ex) {
        console.log(' FnSendMsgNotification : Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

msgNotification.prototype.updateStatus= function(details, callBack) {

    var _this = this;

    console.log('-----Send Nofication of Update Status-----');
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupID,messageText,messageType;
    var operationType,iphoneId,messageId;
    try {

        var responseMessage = {
            status: false

        };

        if (details) {
            console.log(details);
            var token = details.token;
            var groupId = details.groupId;

            notificationQmManager.isGroupAdminByToken(token, groupId, function (err, isAdmin) {
                if (!err) {
                    //console.log('yes going into isGroupAdminByToken');
                    var isAdmin = isAdmin;

                    console.log(isAdmin);
                    switch (parseInt(details.status)) {
                        case 0 :
                            callBack(null,null);
                            break;
                        case 1 :
                            console.log('Accepted');
                            var query2 = 'select tid,GroupType,GroupName,AdminID from tmgroups where tid=' + groupId;
                            console.log(query2);
                            st.db.query(query2, function (err, getDetails) {
                                if (getDetails) {
                                    if (getDetails[0]) {
                                        var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + getDetails[0].AdminID;
                                        st.db.query(queryParameters, function (err, iosResult) {
                                            if (iosResult) {
                                                if (iosResult[0]) {
                                                    iphoneId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                }
                                                else {
                                                    iphoneId = '';
                                                }
                                            }
                                            else {
                                                iphoneId = '';
                                            }

                                                var getQuery2 = 'select EZEID from tmaster where tid=' + details.masterId;
                                            console.log(getQuery2);
                                                st.db.query(getQuery2, function (err, memberDetails) {
                                                    if (memberDetails) {
                                                        if (memberDetails[0]) {
                                                            if (getDetails[0].GroupType == 1) {
                                                                // Group type 1
                                                                receiverId = getDetails[0].tid;
                                                                senderTitle = memberDetails[0].EZEID;
                                                                groupTitle = getDetails[0].GroupName;
                                                                groupID = groupId;
                                                                messageText = 'has accepted your request ';
                                                                messageType = 3;
                                                                operationType = 0;
                                                                iphoneId = iphoneId;
                                                                messageId = 0;
                                                                masterid = '';
                                                                var latitude = '', longitude = '',prioritys='';
                                                                var dateTime='',a_name='',msgUserid='';
                                                                //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                                                responseMessage.status = true;
                                                                callBack(null, responseMessage);
                                                            }
                                                            else {
                                                                // Group type 0
                                                                if (details.requester == 1) {
                                                                    // accepting from another group

                                                                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + getDetails[0].AdminID;
                                                                    st.db.query(queryParameters, function (err, iosResult) {
                                                                        if (iosResult) {
                                                                            iphoneId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                                            var query3 = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + getDetails[0].AdminID;
                                                                            st.db.query(query3, function (err, groupDetails) {
                                                                                if (groupDetails) {
                                                                                    if (groupDetails[0]) {
                                                                                        receiverId = groupDetails[0].tid;
                                                                                        senderTitle = memberDetails[0].EZEID;
                                                                                        groupTitle = getDetails[0].GroupName;
                                                                                        groupID = groupId;
                                                                                        messageText = 'has accepted your request ';
                                                                                        messageType = 3;
                                                                                        operationType = 0;
                                                                                        iphoneId = iphoneId;
                                                                                        messageId = 0;
                                                                                        masterid = '';
                                                                                        var latitude = '', longitude = '',prioritys='';
                                                                                        var dateTime='',a_name='',msgUserid='';
                                                                                        //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                                                                        responseMessage.status = true;
                                                                                        callBack(null, responseMessage);
                                                                                    }
                                                                                    else {
                                                                                        console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                        callBack(null, null);
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                    callBack(null, null);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    //accepted from other members
                                                                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + details.masterId;
                                                                    st.db.query(queryParameters, function (err, iosResult) {
                                                                        if (iosResult) {
                                                                            iphoneId = iosResult[0].iphoneID;
                                                                        }
                                                                        else
                                                                        {
                                                                            iphoneId = '';
                                                                        }
                                                                        var query3 = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + details.masterId;
                                                                        st.db.query(query3, function (err, groupDetails) {
                                                                            if (groupDetails) {
                                                                                if (groupDetails[0]) {
                                                                                    receiverId = groupDetails[0].tid;
                                                                                    senderTitle = getDetails[0].GroupName;
                                                                                    groupTitle = getDetails[0].GroupName;
                                                                                    groupID = groupId;
                                                                                    messageText = 'has accepted your request ';
                                                                                    messageType = 3;
                                                                                    operationType = 0;
                                                                                    iphoneId = iphoneId;
                                                                                    messageId = 0;
                                                                                    masterid = '';
                                                                                    var latitude = '', longitude = '',prioritys='';
                                                                                    var dateTime='',a_name='',msgUserid='';
                                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                                                                    responseMessage.status = true;
                                                                                    callBack(null, responseMessage);
                                                                                }
                                                                                else {
                                                                                    console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                    callBack(null, null);
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                callBack(null, null);
                                                                            }
                                                                        });

                                                                    });
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnUpdateUserStatus:Error getting from menberDetails');
                                                            callBack(null, null);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnUpdateUserStatus:Error getting from menberDetails');
                                                        callBack(null, null);
                                                    }
                                                });

                                        });
                                    }
                                    else {
                                        console.log('FnUpdateUserStatus:Error getting from groupInfoRes');
                                        callBack(null, null);
                                    }
                                }
                                else {
                                    console.log('FnUpdateUserStatus:Error getting from groupInfoRes');
                                    callBack(null, null);
                                }
                            });
                            break;
                    }
                }
                else {

                    console.log('FnUpdateUserStatus:Error in isGroupAdminByToken method');
                    callBack(null, null);
                }
            });
        }
    }
    catch (ex) {
        console.log(' Update Status Notification : Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

msgNotification.prototype.sendForwardNotification = function(msgContent, callBack) {
    var _this = this;

    console.log('-----Send Nofication of Forward Message-----');
    var id,id_type,gid,iphoneId,idTypeArray,toIdArray;
    var receiverId,senderTitle,groupId,groupTitle,messageText,messageType,masterid,messageId;
    try {

        var responseMessage = {
            status: false

        };

         idTypeArray = JSON.parse("[" + msgContent.idType + "]");
         toIdArray = JSON.parse("[" + msgContent.toId + "]");


        var loopFunction = function (c) {
            if (c < idTypeArray.length) {
                id_type = parseInt(idTypeArray[c]);
                gid = parseInt(toIdArray[c]);

                console.log('group id:' + gid);
                if (gid) {
                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + gid;
                    //console.log(queryParameters);
                    st.db.query(queryParameters, function (err, iosResult) {
                        if (iosResult) {
                            if (iosResult[0]) {
                                iphoneId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                            }
                            else {
                                iphoneId = '';
                            }
                            //console.log(iphoneId);
                            var queryParams = st.db.escape(msgContent.token) + ',' + st.db.escape(id_type) + ',' + st.db.escape(gid);
                            var messageQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                            //console.log(messageQuery);
                            st.db.query(messageQuery, function (err, groupDetails) {
                                if (groupDetails) {
                                    if (groupDetails[0]) {
                                        if (groupDetails[0].length > 0) {
                                            if (groupDetails[1]) {
                                                if (groupDetails[1].length > 0) {
                                                    var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type) + ',' + st.db.escape(msgContent.token);
                                                    var messageQuery1 = 'CALL pGetGroupInfn(' + queryParams1 + ')';
                                                    console.log(messageQuery1);
                                                    st.db.query(messageQuery1, function (err, groupDetails1) {
                                                        if (groupDetails1) {
                                                            if (groupDetails1[0]) {
                                                                if (groupDetails1[0][0]) {
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
                                                                        messageText = 'Forward Message';
                                                                        messageType = id_type;
                                                                        messageId = msgContent.message_id;
                                                                        masterid = groupDetails[0][0].AdminID;
                                                                        iphoneId = iphoneId;
                                                                        var now = new Date();
                                                                        var t = now.toUTCString();
                                                                        var dateTime = t.split(',');
                                                                        dateTime = dateTime[1];
                                                                        var latitude = 0.00, longitude = 0.00, jobId = 0;
                                                                        var aName = '', aUrl = '', operationType = 0, msgUserid = 0, prioritys = 1;
                                                                        //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                        //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, aName, msgUserid, jobId, aUrl);
                                                                        responseMessage.status = true;
                                                                        callBack(null, responseMessage);
                                                                    }
                                                                    c = c + 1;
                                                                    loopFunction(c);
                                                                }
                                                                else {
                                                                    console.log('FnForwardMessage:Error getting from groupname1');
                                                                    callBack(null, null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnForwardMessage:Error getting from groupname1');
                                                                callBack(null, null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnForwardMessage:Error getting from groupname1');
                                                            callBack(null, null);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnForwardMessage:Error getting from groupdetails1');
                                                    callBack(null, null);
                                                }
                                            }
                                            else {
                                                console.log('FnForwardMessage:Error getting from groupdetails2');
                                                callBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnForwardMessage:Error getting from groupdetails3');
                                            callBack(null, null);
                                        }
                                    }
                                    else {
                                        console.log('FnForwardMessage:Error getting from groupdetails4');
                                        callBack(null, null);
                                    }
                                }
                                else {
                                    console.log('FnForwardMessage:Error getting from groupdetails5');
                                    callBack(null, null);
                                }
                            });
                        }
                    });
                }
                else{
                    console.log('FnForwardMessage:Error getting from gid');
                    callBack(null, null);
                }
            }
        };

        if (msgContent) {
            var c = 0;
            loopFunction(c);
        }
        else {
            console.log('FnSendForwardMsgNotification: Forward Message Content not loaded');
            callBack(null, null);
        }

    }
    catch (ex) {
        console.log(' FnSendForwardMsgNotification : Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};


module.exports = msgNotification;