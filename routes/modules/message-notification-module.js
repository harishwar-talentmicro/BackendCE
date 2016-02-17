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

msgNotification.prototype.sendComposeMessage= function(msgContent, callBack) {

    console.log('-----Send Notification of Compose Message-----');
    var to_ids;
    var id_type;
    var id;
    var gid;
    var iosId;
    var groupId;
    var groupTitle;
    try {

        var responseMessage = {
            status: false

        };
        if(msgContent) {
            id = msgContent.idType.split(",");
            to_ids = msgContent.toID.split(",");

            var loopFunction = function (c) {
                if (c < id.length) {
                    id_type = parseInt(id[c]);
                    gid = parseInt(to_ids[c]);

                    if (gid) {
                        var iosDetailsQuery = 'select ezeid,IPhoneDeviceID as iosId from tmaster where tid=' + gid;
                        //console.log(iosDetailsQuery);
                        st.db.query(iosDetailsQuery, function (err, iosResult) {
                            if (iosResult) {
                                if (iosResult[0]) {
                                    iosId = (iosResult[0].iosId) ? (iosResult[0].iosId) : '';
                                }
                                else {
                                    iosId = '';
                                }
                            }
                            //console.log(iosId);
                            var memberQueryParams = st.db.escape(msgContent.token) + ',' + st.db.escape(id_type) + ',' + st.db.escape(gid);
                            var memberDetailsQuery = 'CALL PgetGroupDetails(' + memberQueryParams + ')';
                            //console.log(memberDetailsQuery);
                            st.db.query(memberDetailsQuery, function (err, groupDetails) {
                                if (groupDetails) {
                                    if (groupDetails[0]) {
                                        if (groupDetails[0].length > 0) {
                                            if (groupDetails[1]) {
                                                if (groupDetails[1].length > 0) {
                                                    var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type) + ',' + st.db.escape(msgContent.token);
                                                    var memberDetailsQuery1 = 'CALL pGetGroupInfn(' + queryParams1 + ')';
                                                    //console.log(memberDetailsQuery1);
                                                    st.db.query(memberDetailsQuery1, function (err, groupInfo) {
                                                        if (groupInfo) {
                                                            if (groupInfo[0]) {
                                                                if (groupInfo[0][0]) {

                                                                    for (var i = 0; i < groupDetails[1].length; i++) {

                                                                        if (groupDetails[0][0].tid != groupDetails[1][i].tid) {
                                                                            var receiverId = groupDetails[1][i].tid;
                                                                            var senderTitle = groupDetails[0][0].groupname;
                                                                            if (id_type == 0) {
                                                                                groupId = groupInfo[0][0].groupid;
                                                                                groupTitle = groupInfo[0][0].groupname;
                                                                            }
                                                                            else {
                                                                                groupId = groupDetails[0][0].tid;
                                                                                groupTitle = groupDetails[0][0].groupname;
                                                                            }
                                                                            var messageText = msgContent.message;
                                                                            var messageType = id_type;
                                                                            var operationType = 0;
                                                                            var iphoneId = iosId;
                                                                            var messageId = msgContent.message_id;
                                                                            var msgUserid = msgContent.message_userid;
                                                                            var masterid = groupDetails[0][0].AdminID;
                                                                            var priority = msgContent.priority;
                                                                            var a_url = msgContent.attachment;
                                                                            var a_name = msgContent.attachmentFilename;
                                                                            var now = new Date();
                                                                            var t = now.toUTCString();
                                                                            var datetime = t.split(',');
                                                                            datetime = datetime[1];
                                                                            var latitude = 0.00;
                                                                            var longitude = 0.00;
                                                                            var jobId = 0;
                                                                            //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                            notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                        }
                                                                    }
                                                                    c = c + 1;
                                                                    loopFunction(c);
                                                                    responseMessage.status = true;
                                                                    callBack(null, responseMessage);
                                                                }
                                                                else {
                                                                    console.log('FnComposeMessage:Error getting from groupinfo');
                                                                    callBack(null, null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnComposeMessage:Error getting from groupinfo');
                                                                callBack(null, null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnComposeMessage:Error getting from groupinfo');
                                                            callBack(null, null);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnComposeMessage:Error getting from group details');
                                                    callBack(null, null);
                                                }
                                            }
                                            else {
                                                console.log('FnComposeMessage:Error getting from group details');
                                                callBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnComposeMessage:Error getting from group details');
                                            callBack(null, null);
                                        }
                                    }
                                    else {
                                        console.log('FnComposeMessage:Error getting from group details');
                                        callBack(null, null);
                                    }
                                }
                                else {
                                    console.log('FnComposeMessage:Error getting from group details');
                                    callBack(null, null);
                                }
                            });
                        });
                    }
                    else {
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
                console.log('FnComposeMessage: Message Content not loaded');
                callBack(null, null);
            }
        }
        else {
            console.log('FnComposeMessage: Message Content not loaded');
            callBack(null, null);
        }

    }
    catch (ex) {
        console.log(' FnComposeMessage : Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};


msgNotification.prototype.updateStatus= function(details, callBack) {

    console.log('-----Send Notification of Update Status-----');
    var receiverId;
    var senderTitle;
    var groupTitle;
    var gid;
    var messageText;
    var messageType;
    var iosId='';
    try {

        var responseMessage = {
            status: false

        };

        if (details) {
            //console.log(details);
            var token = details.token;
            var groupId = details.groupId;
            var groupType = details.group_type;

            switch (parseInt(details.status)) {
                case 0 :
                    callBack(null, null);
                    break;

                // case 1 : Accept the invite
                case 1 :
                    console.log('Accepted request');
                    var groupDetailsQuery = 'select tid,GroupType,GroupName,AdminID from tmgroups where tid=' + groupId;
                    st.db.query(groupDetailsQuery, function (err, getDetails) {
                        if (getDetails) {
                            if (getDetails[0]) {
                                var iosDetailsQuery = 'select ezeid,IPhoneDeviceID as iosId from tmaster where tid=' + getDetails[0].AdminID;
                                st.db.query(iosDetailsQuery, function (err, iosResult) {
                                    if (iosResult) {
                                        if (iosResult[0]) {
                                            iosId = (iosResult[0].iosId) ? (iosResult[0].iosId) : '';
                                        }
                                    }

                                    var senderDetailsQuery = 'select ezeid from tmaster where tid=' + details.masterId;
                                    st.db.query(senderDetailsQuery, function (err, senderDetails) {
                                        if (senderDetails) {
                                            if (senderDetails[0]) {

                                                // Group type 1
                                                if (getDetails[0].GroupType == 1) {
                                                    receiverId = getDetails[0].tid;
                                                    senderTitle = senderDetails[0].ezeid;
                                                    groupTitle = getDetails[0].GroupName;
                                                    gid = groupId;
                                                    messageText = 'has accepted your request ';
                                                    messageType = 3;
                                                    var operationType = 0;
                                                    var iphoneId = iosId;
                                                    var priority = '';
                                                    var messageId = 0;
                                                    var msgUserid = 0;
                                                    var masterid = 0;
                                                    var a_url = '';
                                                    var a_name = '';
                                                    var datetime = '';
                                                    var latitude = 0.00;
                                                    var longitude = 0.00;
                                                    var jobId = 0;
                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                    notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                    responseMessage.status = true;
                                                    callBack(null, responseMessage);
                                                }
                                                else {
                                                    // Group type 0
                                                    if (details.requester == 1) {
                                                        // accepting from another group
                                                        console.log('accepting from another group');
                                                        var groupDetailsQuery = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + getDetails[0].AdminID;
                                                        st.db.query(groupDetailsQuery, function (err, groupDetails) {
                                                            if (groupDetails) {
                                                                if (groupDetails[0]) {

                                                                    var queryParams = st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(groupId);
                                                                    var memberDetailsQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                                                                    st.db.query(memberDetailsQuery, function (err, groupMembers) {
                                                                        if (groupMembers) {
                                                                            if (groupMembers[0]) {
                                                                                if (groupMembers[0].length > 0) {
                                                                                    if (groupMembers[1]) {
                                                                                        if (groupMembers[1].length > 0) {

                                                                                            var memberLoop = function (i) {

                                                                                                if (i < groupMembers[1].length) {
                                                                                                    if (groupMembers[0][0].tid != groupMembers[1][i].tid) {
                                                                                                        var iosDetailsQuery = 'select ezeid,IPhoneDeviceID as iphoneId from tmaster where tid=' + groupMembers[1][i].AdminID;
                                                                                                        st.db.query(iosDetailsQuery, function (err, iosResult) {
                                                                                                            //console.log(iosResult);
                                                                                                            if (!err) {
                                                                                                                if (iosResult) {
                                                                                                                    if (iosResult[0]) {
                                                                                                                        iosId = (iosResult[0].iphoneId) ? (iosResult[0].iphoneId) : '';
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        });

                                                                                                        receiverId = groupMembers[1][i].tid;
                                                                                                        senderTitle = senderDetails[0].ezeid;
                                                                                                        groupTitle = getDetails[0].GroupName;
                                                                                                        gid = groupId;
                                                                                                        messageText = 'has accepted your request';
                                                                                                        messageType = 3;
                                                                                                        var operationType = 0;
                                                                                                        var iphoneId = iosId;
                                                                                                        var priority = '';
                                                                                                        var messageId = 0;
                                                                                                        var msgUserid = 0;
                                                                                                        var masterid = 0;
                                                                                                        var a_url = '';
                                                                                                        var a_name = '';
                                                                                                        var datetime = '';
                                                                                                        var latitude = 0.00;
                                                                                                        var longitude = 0.00;
                                                                                                        var jobId = 0;
                                                                                                        //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                                        notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                                        i = i + 1;
                                                                                                        memberLoop(i);
                                                                                                    }
                                                                                                    else{
                                                                                                        i = i + 1;
                                                                                                        memberLoop(i);
                                                                                                    }
                                                                                                }
                                                                                                else {
                                                                                                    responseMessage.status = true;
                                                                                                    callBack(null, responseMessage);
                                                                                                }
                                                                                            };

                                                                                            if (groupMembers[1].length > 0) {
                                                                                                console.log('call member loop');
                                                                                                var i = 0;
                                                                                                memberLoop(i);
                                                                                            }
                                                                                            else {
                                                                                                console.log('FnUpdateUserStatus:groupMembers is empty');
                                                                                                callBack(null, null);
                                                                                            }
                                                                                        }
                                                                                        else {
                                                                                            console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                            callBack(null, null);
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                        callBack(null, null);
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                    callBack(null, null);
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                callBack(null, null);
                                                                            }
                                                                        }
                                                                    });
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

                                                    else {
                                                        //admin accept from other members
                                                        var iosDetailsQuery = 'select EZEID,IPhoneDeviceID as iosId from tmaster where tid=' + details.masterId;
                                                        st.db.query(iosDetailsQuery, function (err, iosResult) {
                                                            if (iosResult) {
                                                                if (iosResult[0]) {
                                                                    iosId = (iosResult[0].iosId) ? (iosResult[0].iosId) : '';
                                                                }
                                                                else {
                                                                    iosId = '';
                                                                }
                                                            }
                                                            var groupDetailsQuery = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + details.masterId;
                                                            //console.log(groupDetailsQuery);
                                                            st.db.query(groupDetailsQuery, function (err, groupDetails) {
                                                                if (groupDetails) {
                                                                    if (groupDetails[0]) {

                                                                        receiverId = groupDetails[0].tid;
                                                                        senderTitle = getDetails[0].GroupName;
                                                                        groupTitle = getDetails[0].GroupName;
                                                                        gid = groupId;
                                                                        messageText = 'has accepted your request ';
                                                                        messageType = 3;
                                                                        var operationType = 0;
                                                                        var iphoneId = iosId;
                                                                        var priority = '';
                                                                        var messageId = 0;
                                                                        var msgUserid = 0;
                                                                        var masterid = 0;
                                                                        var a_url = '';
                                                                        var a_name = '';
                                                                        var datetime = '';
                                                                        var latitude = 0.00;
                                                                        var longitude = 0.00;
                                                                        var jobId = 0;
                                                                        //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                        notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);


                                                                        //send notification to group members
                                                                        var queryParams = st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(groupId);
                                                                        var memberDetailsQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                                                                        //console.log(memberDetailsQuery);
                                                                        st.db.query(memberDetailsQuery, function (err, groupMembers) {
                                                                            console.log(groupMembers);
                                                                            if (groupMembers) {
                                                                                if (groupMembers[0]) {
                                                                                    if (groupMembers[0].length > 0) {
                                                                                        if (groupMembers[1]) {
                                                                                            if (groupMembers[1].length > 0) {

                                                                                                var memebers = function (i) {
                                                                                                    if (i < groupMembers[1].length) {

                                                                                                        if (groupMembers[0][0].tid != groupMembers[1][i].tid) {

                                                                                                            var iosDetailsQuery = 'select ezeid,IPhoneDeviceID as iosId from tmaster where tid=' + groupMembers[1][i].AdminID;
                                                                                                            //console.log(iosDetailsQuery);
                                                                                                            st.db.query(iosDetailsQuery, function (err, iosResult) {
                                                                                                                //console.log(iosResult);
                                                                                                                if (!err) {
                                                                                                                    if (iosResult) {
                                                                                                                        if (iosResult[0]) {
                                                                                                                            iosId = (iosResult[0].iosId) ? (iosResult[0].iosId) : '';
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            });

                                                                                                            receiverId = groupMembers[1][i].tid;
                                                                                                            senderTitle = senderDetails[0].ezeid;
                                                                                                            groupTitle = getDetails[0].GroupName;
                                                                                                            gid = groupId;
                                                                                                            messageText = 'has accepted your request';
                                                                                                            messageType = 3;
                                                                                                            var operationType = 0;
                                                                                                            var iphoneId = iosId;
                                                                                                            var priority = '';
                                                                                                            var messageId = 0;
                                                                                                            var msgUserid = 0;
                                                                                                            var masterid = 0;
                                                                                                            var a_url = '';
                                                                                                            var a_name = '';
                                                                                                            var datetime = '';
                                                                                                            var latitude = 0.00;
                                                                                                            var longitude = 0.00;
                                                                                                            var jobId = 0;
                                                                                                            //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                                            notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                                            i = i + 1;
                                                                                                            memebers(i);
                                                                                                        }
                                                                                                        else{
                                                                                                            i = i + 1;
                                                                                                            memebers(i);
                                                                                                        }
                                                                                                    }
                                                                                                    else {
                                                                                                        responseMessage.status = true;
                                                                                                        callBack(null, responseMessage);
                                                                                                    }
                                                                                                };

                                                                                                if (groupMembers[1].length > 0) {
                                                                                                    console.log('call member loop');
                                                                                                    var i = 0;
                                                                                                    memebers(i);
                                                                                                }
                                                                                                else {
                                                                                                    console.log('FnUpdateUserStatus:groupMembers is empty');
                                                                                                    callBack(null, null);
                                                                                                }
                                                                                            }
                                                                                            else {
                                                                                                console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                                callBack(null, null);
                                                                                            }
                                                                                        }
                                                                                        else {
                                                                                            console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                            callBack(null, null);
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                        callBack(null, null);
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                    callBack(null, null);
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnUpdateUserStatus:Error getting from groupMembers');
                                                                                callBack(null, null);
                                                                            }
                                                                        });
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

                // case 3 : Leave and Remove group
                case 3 :
                    console.log('user leave from group');
                    /**
                     * user leave from group
                     */
                    var groupDetailsQuery = 'select tid,GroupType,GroupName,AdminID from tmgroups where tid=' + groupId;
                    st.db.query(groupDetailsQuery, function (err, getDetails) {
                        if (getDetails) {
                            if (getDetails[0]) {
                                var userDetailsQuery = 'select ezeid from tmaster where tid=' + details.masterId;
                                st.db.query(userDetailsQuery, function (err, senderDetails) {
                                    if (senderDetails) {
                                        if (senderDetails[0]) {

                                            var memberQueryParams = st.db.escape(token) + ',' + st.db.escape(groupType) + ',' + st.db.escape(groupId);
                                            var memberDetailsQuery = 'CALL PgetGroupDetails(' + memberQueryParams + ')';
                                            //console.log(memberDetailsQuery);
                                            st.db.query(memberDetailsQuery, function (err, groupMembers) {
                                                //console.log(groupMembers);
                                                if (groupMembers) {
                                                    if (groupMembers[0]) {
                                                        if (groupMembers[0].length > 0) {
                                                            if (groupMembers[1]) {
                                                                if (groupMembers[1].length > 0) {

                                                                    var memeberLoop = function (i) {
                                                                        if (i < groupMembers[1].length) {
                                                                            if (groupMembers[0][0].tid != groupMembers[1][i].tid) {

                                                                                var iosDetailsQuery = 'select ezeid,IPhoneDeviceID as iphoneId from tmaster where tid=' + groupMembers[1][i].AdminID;
                                                                                //console.log(iosDetailsQuery);
                                                                                st.db.query(iosDetailsQuery, function (err, iosResult) {
                                                                                    //console.log(iosResult);
                                                                                    if (!err) {
                                                                                        if (iosResult) {
                                                                                            if (iosResult[0]) {
                                                                                                iosId = (iosResult[0].iphoneId) ? (iosResult[0].iphoneId) : '';
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });

                                                                                receiverId = groupMembers[1][i].tid;
                                                                                senderTitle = senderDetails[0].ezeid;
                                                                                groupTitle = getDetails[0].GroupName;
                                                                                gid = groupId;
                                                                                messageText = 'has left from in group';
                                                                                messageType = 3;
                                                                                var operationType = 0;
                                                                                var iphoneId = iosId;
                                                                                var priority = '';
                                                                                var messageId = 0;
                                                                                var msgUserid = 0;
                                                                                var masterid = 0;
                                                                                var a_url = '';
                                                                                var a_name = '';
                                                                                var datetime = '';
                                                                                var latitude = 0.00;
                                                                                var longitude = 0.00;
                                                                                var jobId = 0;
                                                                                //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                i = i + 1;
                                                                                memeberLoop(i);
                                                                            }
                                                                            else{
                                                                                i = i + 1;
                                                                                memberLoop(i);
                                                                            }
                                                                        }
                                                                        else {
                                                                            responseMessage.status = true;
                                                                            callBack(null, responseMessage);
                                                                        }
                                                                    };

                                                                    if (groupMembers[1].length > 0) {
                                                                        console.log('call member loop');
                                                                        var i = 0;
                                                                        memeberLoop(i);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                                    callBack(null, null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                                callBack(null, null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                            callBack(null, null);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                        callBack(null, null);
                                                    }
                                                }
                                                else {
                                                    console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                    callBack(null, null);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnUpdateUserStatus:Error getting from sender details');
                                            callBack(null, null);
                                        }
                                    }
                                    else {
                                        console.log('FnUpdateUserStatus:Error getting from sender details');
                                        callBack(null, null);
                                    }
                                });
                            }
                            else {
                                console.log('FnUpdateUserStatus:Error getting from get details');
                                callBack(null, null);
                            }
                        }
                        else {
                            console.log('FnUpdateUserStatus:Error getting from get details');
                            callBack(null, null);
                        }
                    });
                    break;

                case 4 :
                    console.log('user removed from group');
                    /**
                     * user removed from group
                     */
                    var groupDetailsQuery = 'select tid,GroupType,GroupName,AdminID from tmgroups where tid=' + groupId;
                    st.db.query(groupDetailsQuery, function (err, getDetails) {
                        if (getDetails) {
                            if (getDetails[0]) {
                                var iosDetailsQuery = 'select EZEID,IPhoneDeviceID as iphoneId from tmaster where tid=' + details.masterId;
                                st.db.query(iosDetailsQuery, function (err, iosResult) {
                                    if (iosResult) {
                                        if (iosResult[0]) {
                                            iosId =  (iosResult[0].iphoneId) ? (iosResult[0].iphoneId) :'';
                                        }
                                        else {
                                            iosId = '';
                                        }
                                    }
                                    if (groupType == 0) {
                                        var groupDetailsQuery1 = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + details.masterId;
                                        st.db.query(groupDetailsQuery1, function (err, groupDetails) {
                                            if (groupDetails) {
                                                if (groupDetails[0]) {

                                                    receiverId = groupDetails[0].tid;
                                                    senderTitle = getDetails[0].GroupName;
                                                    groupTitle = getDetails[0].GroupName;
                                                    gid = groupId;
                                                    messageText = 'has removed from in group ';
                                                    messageType = 3;
                                                    var operationType = 0;
                                                    var iphoneId = iosId;
                                                    var priority = '';
                                                    var messageId = 0;
                                                    var msgUserid = 0;
                                                    var masterid = 0;
                                                    var a_url = '';
                                                    var a_name = '';
                                                    var datetime = '';
                                                    var latitude = 0.00;
                                                    var longitude = 0.00;
                                                    var jobId = 0;
                                                    //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                    notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                }
                                                else {
                                                    console.log('FnUpdateUserStatus:Error getting from group details');
                                                    callBack(null, null);
                                                }
                                            }
                                            else {
                                                console.log('FnUpdateUserStatus:Error getting from group details');
                                                callBack(null, null);
                                            }
                                        });
                                    }


                                    //send notification to all group members

                                    var senderDetailsQuery = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + details.masterId;
                                    st.db.query(senderDetailsQuery, function (err, senderDetails) {
                                        if (senderDetails) {
                                            if (senderDetails[0]) {

                                                var memberQueryParams = st.db.escape(token) + ',' + st.db.escape(groupType) + ',' + st.db.escape(groupId);
                                                var memberDetailsQuery = 'CALL PgetGroupDetails(' + memberQueryParams + ')';
                                                //console.log(memberDetailsQuery);
                                                st.db.query(memberDetailsQuery, function (err, groupMembers) {
                                                    //console.log(groupMembers);
                                                    if (groupMembers) {
                                                        if (groupMembers[0]) {
                                                            if (groupMembers[0].length > 0) {
                                                                if (groupMembers[1]) {
                                                                    if (groupMembers[1].length > 0) {

                                                                        var member = function (i) {
                                                                            if (i < groupMembers[1].length) {
                                                                                if (groupMembers[0][0].tid != groupMembers[1][i].tid) {

                                                                                    var iosDetailsQuery1 = 'select ezeid,IPhoneDeviceID as iphoneId from tmaster where tid=' + groupMembers[1][i].AdminID;
                                                                                    //console.log(queryParameters);
                                                                                    st.db.query(iosDetailsQuery1, function (err, iosResult) {
                                                                                        //console.log(iosResult);
                                                                                        if (!err) {
                                                                                            if (iosResult) {
                                                                                                if (iosResult[0]) {
                                                                                                    iosId = (iosResult[0].iphoneId) ? (iosResult[0].iphoneId) : '';
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    });

                                                                                    receiverId = groupMembers[1][i].tid;
                                                                                    if (groupType == 0) {
                                                                                        senderTitle = getDetails[0].GroupName;
                                                                                        groupTitle = getDetails[0].GroupName;
                                                                                    }
                                                                                    else {
                                                                                        senderTitle = senderDetails[0].GroupName;
                                                                                        groupTitle = senderDetails[0].GroupName;
                                                                                    }
                                                                                    gid = groupId;
                                                                                    messageText = 'has removed from in group';
                                                                                    messageType = 3;
                                                                                    var operationType = 0;
                                                                                    var iphoneId = iosId;
                                                                                    var priority = '';
                                                                                    var messageId = 0;
                                                                                    var msgUserid = 0;
                                                                                    var masterid = 0;
                                                                                    var a_url = '';
                                                                                    var a_name = '';
                                                                                    var datetime = '';
                                                                                    var latitude = 0.00;
                                                                                    var longitude = 0.00;
                                                                                    var jobId = 0;
                                                                                    //console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                    notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                                                                    i = i + 1;
                                                                                    member(i);
                                                                                }
                                                                                else {
                                                                                    i = i + 1;
                                                                                    member(i);
                                                                                }
                                                                            }
                                                                            else {
                                                                                responseMessage.status = true;
                                                                                callBack(null, responseMessage);
                                                                            }
                                                                        };

                                                                        if (groupMembers[1].length > 0) {
                                                                            console.log('call member loop');
                                                                            var i = 0;
                                                                            member(i);
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                                        callBack(null, null);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                                    callBack(null, null);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                                callBack(null, null);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                            callBack(null, null);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnUpdateUserStatus:Error getting from groupmembers');
                                                        callBack(null, null);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnUpdateUserStatus:Error getting from sender details');
                                                callBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnUpdateUserStatus:Error getting from sender details');
                                            callBack(null, null);
                                        }
                                    });
                                });
                            }
                            else {
                                console.log('FnUpdateUserStatus:Error getting from get details');
                                callBack(null, null);
                            }
                        }
                        else {
                            console.log('FnUpdateUserStatus:Error getting from get details');
                            callBack(null, null);
                        }
                    });
                    break;
            }
        }
        else {
            console.log('FnUpdateUserStatus: details is empty');
            callBack(null, null);
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


    console.log('-----Send Notification of Forward Message-----');
    var id;
    var id_type;
    var gid;
    var iphoneId;
    var idTypeArray;
    var toIdArray;
    var groupId;
    var groupTitle;

    try {

        var responseMessage = {
            status: false

        };

        if(msgContent) {

            idTypeArray = JSON.parse("[" + msgContent.idType + "]");
            toIdArray = JSON.parse("[" + msgContent.toId + "]");


            var loopFunction = function (c) {
                if (c < idTypeArray.length) {
                    id_type = parseInt(idTypeArray[c]);
                    gid = parseInt(toIdArray[c]);

                    console.log('group id:' + gid);
                    if (gid) {
                        var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneId from tmaster where tid=' + gid;
                        //console.log(queryParameters);
                        st.db.query(queryParameters, function (err, iosResult) {
                            if (iosResult) {
                                if (iosResult[0]) {
                                    iphoneId = (iosResult[0].iphoneId) ? (iosResult[0].iphoneId) : '';
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
                                                                            var receiverId = groupDetails[1][i].tid;
                                                                            var senderTitle = groupDetails[0][0].groupname;
                                                                            if (id_type == 0) {
                                                                                groupId = groupDetails1[0][0].groupid;
                                                                                groupTitle = groupDetails1[0][0].groupname;
                                                                            }
                                                                            else {
                                                                                groupId = groupDetails[0][0].tid;
                                                                                groupTitle = groupDetails[0][0].groupname;
                                                                            }
                                                                            var messageText = 'Forward Message';
                                                                            var messageType = id_type;
                                                                            var messageId = msgContent.message_id;
                                                                            var masterid = groupDetails[0][0].AdminID;
                                                                            var iphoneId = iphoneId;
                                                                            var now = new Date();
                                                                            var t = now.toUTCString();
                                                                            var dateTime = t.split(',');
                                                                            dateTime = dateTime[1];
                                                                            var latitude = 0.00;
                                                                            var longitude = 0.00;
                                                                            var jobId = 0;
                                                                            var aName = '';
                                                                            var aUrl = '';
                                                                            var operationType = 0;
                                                                            var priority = 1;
                                                                            var msgUserid=0;
                                                                            //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                            //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                            notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, dateTime, aName, msgUserid, jobId, aUrl);
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
                    else {
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