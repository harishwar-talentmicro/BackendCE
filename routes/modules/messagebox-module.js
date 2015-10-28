/**
 *  @author Gowri shankar
 *  @since July 30,2015  03:54PM
 *  @title MessageBox module
 *  @description Handles MessageBox functions
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

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

var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;


var st = null;
function MessageBox(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
    }
};

/**
 * @todo FnCreateMessageGroup
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for create message group
 */
MessageBox.prototype.createMessageGroup = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupName  = req.body.group_name;
    var groupType  = req.body.group_type;
    var aboutGroup  = req.body.about_group ? req.body.about_group : '';
    var autoJoin  = req.body.auto_join ? req.body.auto_join : 0;
    var tid = req.body.tid ? req.body.tid : 0;
    var restrictReply = req.body.rr;
    var memberVisible = req.body.member_visible ? parseInt(req.body.member_visible) : 0;
    var alumniCode = req.body.alumni_code ? req.body.alumni_code : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(parseInt(groupType) == NaN){
        error['groupType'] = 'Invalid groupType';
        validateStatus *= false;
    }
    if(!groupName){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupName) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(aboutGroup) + ',' + st.db.escape(autoJoin) + ',' + st.db.escape(tid)
                            + ',' + st.db.escape(restrictReply)+ ',' + st.db.escape(memberVisible);
                        var query = 'CALL pCreateMessageGroup(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult[0]) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group created successfully';
                                    responseMessage.data = {
                                        id : insertResult[0][0].ID,
                                        token: req.body.token,
                                        groupName: req.body.group_name,
                                        groupType: req.body.group_type,
                                        aboutGroup: req.body.about_group,
                                        autoJoin: req.body.auto_join,
                                        tid: req.body.tid,
                                        rr: req.body.rr
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateMessageGroup: Group created successfully');
                                }
                                else {
                                    responseMessage.message = 'Group is not created';
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateMessageGroup:Group is not created');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCreateMessageGroup: error in creating Group :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnCreateMessageGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCreateMessageGroup:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnCreateMessageGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnValidateGroupName
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for validate group name
 */
MessageBox.prototype.validateGroupName = function(req,res,next){
    var _this = this;

    var name = req.query.group_name;
    var token = req.query.token;
    var groupType = req.query.group_type ? req.query.group_type : 0;
    var ezeid,pin = null ;

    var ezeidArray = name.split('.');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!name){
        error['name'] = 'Invalid name';
        validateStatus *= false;
    }
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            if (ezeidArray.length > 2) {
                console.log('3 params');
                ezeid = ezeidArray[0];
                if (ezeidArray[2]) {
                    pin = ezeidArray[2];
                }
            }
            else if (ezeidArray.length > 1) {
                console.log('2 params');
                ezeid = ezeidArray[0];
                if (ezeidArray[1].charAt(0) == 'L' || ezeidArray[1].charAt(0) == 'l'){
                        pin = null;
                    }
                else
                {
                    pin = ezeidArray[1];
                }
            }
            else
            {
                console.log('1 params');
                ezeid = name;
                pin = null;
            }
                var queryParams = st.db.escape(ezeid) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                    + ',' + st.db.escape(pin);
                var query = 'CALL pValidateGroupName(' + queryParams + ')';
                console.log(query);
                st.db.query(query, function (err, getResult) {
                    if (!err) {
                        if (getResult) {
                            if (getResult[0]) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Name is available';
                                responseMessage.data = getResult[0];
                                res.status(200).json(responseMessage);
                                console.log('FnValidateGroupName: Name is available');
                            }
                            else {
                                responseMessage.message = 'Name is not available';
                                res.status(200).json(responseMessage);
                                console.log('FnValidateGroupName:Name is not available');
                            }
                        }
                        else {
                            responseMessage.message = 'Name is not available';
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Name is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'An error occured ! Please try again';
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        res.status(500).json(responseMessage);
                        console.log('FnValidateGroupName: error in validating Group Name :' + err);
                    }
                });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnValidateGroupName ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Validates a group number
 * @param req
 * @param res
 * @param next
 * @method GET
 * @service-param token <varchar>
 * @service-param group_id <int>
 * @service-param ezeone_id  <int>
 */
MessageBox.prototype.validateGroupMember = function(req,res,next){

    var groupId = (parseInt(req.query.group_id) !== NaN && parseInt(req.query.group_id ) > 0) ? parseInt(req.query.group_id) : 0;
    var token = (req.query.token) ? req.query.token : null;
    var ezeoneId = (req.query.ezeone_id) ? alterEzeoneId(req.query.ezeone_id) : null;
    var ezeid,pin = null ;

    var ezeidArray = ezeoneId.split('.');


    var error  = {};
    var status = true;
    var respMsg = {
        status : false,
        message : 'Please check the errors below',
        error : { server : 'Internal Server Error'},
        data : null
    }

    if(!groupId){
        error['group_id'] = 'Invalid group id';
        status *= false;
    }

    if(!ezeoneId){
        error['ezeone_id'] = 'EZEOne ID is empty';
        status *= false;
    }

    if(!status){
        respMsg.status = false;
        respMsg.error = error;
        res.status(400).json(respMsg);
    }
    else{
        try{
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        if (ezeidArray.length > 1) {
                            ezeid = ezeidArray[0];
                            pin = parseInt(ezeidArray[1]) ? parseInt(ezeidArray[1]) : ezeidArray[1];
                        }
                        else
                        {
                            ezeid = ezeoneId;
                            pin = null;
                        }
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(ezeid)+ ',' + st.db.escape(pin);
                        var query = 'CALL pValidateGroupMember('+queryParams+')';
                        //console.log(query);
                        st.db.query(query,function(err,results){
                            if(!err){
                                if(results){
                                    if(results[0]){
                                        if(results[0][0]){
                                            respMsg.data = results[0][0];
                                            respMsg.status = true;
                                            respMsg.error = null;
                                            respMsg.message = 'Yes,Member of the Group';
                                            res.status(200).json(respMsg);
                                        }
                                        else{
                                            respMsg.status = false;
                                            respMsg.error = null;
                                            respMsg.message = 'Not a member of the Group';
                                            res.status(200).json(respMsg);
                                        }
                                    }
                                    else{
                                        respMsg.status = false;
                                        respMsg.error = null;
                                        respMsg.message = 'Not a member of the Group';
                                        res.status(200).json(respMsg);
                                    }
                                }
                                else{
                                    respMsg.status = false;
                                    respMsg.error = null;
                                    respMsg.message = 'Not a member of the Group';
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                console.log('Error in messagebox-module stored procedure : validateGroupMember pValidateGroupMember');
                                console.log(err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                                respMsg.status = false;
                                respMsg.error = {server : 'Internal server error'};
                                respMsg.message = 'An error occurred';
                                res.status(500).json(respMsg);
                            }
                        });
                    }
                    else{
                        respMsg.status = false;
                        respMsg.error = {token : 'Invalid token'};
                        res.status(401).json(respMsg);
                    }
                }
                else{
                    respMsg.status = false;
                    respMsg.error = {token : 'Invalid token'};
                    res.status(401).json(respMsg);
                }
            });
        }
        catch(ex){
            console.log('Error in messagebox-module : validateGropuMember');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.status = false;
            respMsg.error = {server : 'Internal server error'};
            respMsg.message = 'An error occurred';
            res.status(500).json(respMsg);
        }
    }
};

/**
 * @todo FnUpdateUserStatus
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update User status
 */
MessageBox.prototype.updateUserStatus = function(req,res,next){
    var _this = this;

    var token  = req.body.token;
    var groupId  = parseInt(req.body.group_id);   // groupid of receiver
    var masterId  = req.body.master_id;
    var status  = parseInt(req.body.status);      // Status 0 : Pending, 1: Accepted, 2 : Rejected, 3 : Leaved, 4 : Removed
    var deleteStatus = (parseInt(req.body.group_type) !== NaN && parseInt(req.body.group_type) > 0)
        ? parseInt(req.body.group_type) : 0;

    var requester = req.body.requester ? parseInt(req.body.requester) : 2 ;
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupID,messageText,messageType,operationType,iphoneID,iphoneId,messageId;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }
    if(!masterId){
        error['masterId'] = 'Invalid masterId';
        validateStatus *= false;
    }
    if(parseInt(status) == NaN){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(masterId) + ',' + st.db.escape(status) + ','+ st.db.escape(deleteStatus);

                        var query = 'CALL pUpdateUserStatus(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User status updated successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupId: req.body.group_id,
                                        masterId: masterId,
                                        status: req.body.status

                                    };
                                    var notificationParams = {
                                        receiverId: "", senderTitle: "", groupTitle: "",
                                        groupId: "", messageText: "",
                                        messageType: "", operationType: "", iphoneId: "",
                                        messageId: ""
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus: User status updated successfully');

                                    /**
                                     * Fetch group_admin and token master_id if both are same
                                     * then admin is logged in and he is doing status change for some other user
                                     */

                                    notificationQmManager.isGroupAdminByToken(token, groupId, function (err, isAdmin) {
                                        if (!err) {
                                            //console.log('yes going into isGroupAdminByToken');
                                            var isAdmin = isAdmin;
                                            switch (parseInt(status)) {
                                                          /*case 0:

                                                                // Pending
                                                                // Notification has to be sent to req.master_id (if admin has requested him to join)
                                                                // Notification has to be sent to req.group_id admin (if someone has requested admin to join his group)

                                                                /**
                                                                 * If he is an admin of a group and group_type is Group

                                                                if(isAdmin && (!parseInt(deleteStatus))){

                                                                    console.log('yes going into isAdmin');
                                                                    notificationQmManager.getGroupInfo(groupId,deleteStatus,function(err,groupInfoRes){
                                                                        if(!err){
                                                                            console.log('yes going into getGroupInfo');
                                                                            if(groupInfoRes){
                                                                                st.getGroupMasterIdList([masterId],function(err,groupListRes1){
                                                                                    console.log('yes going into getGroupMasterIdList');
                                                                                    if(!err){
                                                                                        if(groupListRes1){
                                                                                            console.log(groupListRes1);
                                                                                            for(var cx = 0; cx < groupListRes1.length; cx++){
                                                                                                console.log(groupListRes1[cx]);
                                                                                                console.log(groupListRes1[cx].tid);
                                                                                                notificationQmManager.getEzeidDetails(masterId,groupListRes1[cx].tid,function(err,ezeidResults,receiverId){
                                                                                                    if(!err){
                                                                                                        if(ezeidResults){
                                                                                                            console.log(receiverId,ezeidResults.ezeid , groupInfoRes.groupname, groupId, "Request to join",
                                                                                                                1, 0, null, 0);
                                                                                                            notification.publish(receiverId,ezeidResults.ezeid , groupInfoRes.groupname, groupId, "Request to join",
                                                                                                                1, 0, ezeidResults.iphoneId, 0);
                                                                                                        }

                                                                                                    }

                                                                                                });
                                                                                            }

                                                                                        }
                                                                                    }
                                                                                });
                                                                            }

                                                                        }

                                                                    });


                                                                }
                                                                else{
                                                                    notificationQmManager.getGroupInfo(groupId,deleteStatus,function(err,groupInfoRes){
                                                                        if(!err){
                                                                            console.log('yes going into getGroupInfo');
                                                                            if(groupInfoRes){
                                                                                st.getGroupMasterIdList([masterId],function(err,groupListRes1){
                                                                                    console.log('yes going into getGroupMasterIdList');
                                                                                    if(!err){
                                                                                        if(groupListRes1){
                                                                                            console.log(groupListRes1);
                                                                                            for(var cx = 0; cx < groupListRes1.length; cx++){
                                                                                                console.log(groupListRes1[cx]);
                                                                                                console.log(groupListRes1[cx].tid);
                                                                                                notificationQmManager.getEzeidDetails(masterId,groupListRes1[cx].tid,function(err,ezeidResults,receiverId){
                                                                                                    if(!err){
                                                                                                        if(ezeidResults){
                                                                                                            console.log(receiverId,ezeidResults.ezeid , groupInfoRes.groupname, groupId, "Request to join",
                                                                                                                1, 0, null, 0);
                                                                                                            notification.publish(receiverId,ezeidResults.ezeid , groupInfoRes.groupname, groupId, "Request to join",
                                                                                                                1, 0, ezeidResults.iphoneId, 0);
                                                                                                        }

                                                                                                    }

                                                                                                });
                                                                                            }

                                                                                        }
                                                                                    }
                                                                                });
                                                                            }

                                                                        }

                                                                    });
                                                                }

                                                                break;*/
                                                case 1 :
                                                    //console.log('Accepted');
                                                    var query2 = 'select tid,GroupType,GroupName,AdminID from tmgroups where tid=' + groupId;
                                                    st.db.query(query2, function (err, getDetails) {
                                                        if (getDetails) {
                                                            if (getDetails[0]) {
                                                                var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid='+getDetails[0].AdminID;
                                                                st.db.query(queryParameters, function (err, iosResult) {
                                                                    if (iosResult) {
                                                                        iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                                        var getQuery2 = 'select EZEID from tmaster where tid=' + masterId;
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
                                                                                        iphoneId = iphoneID;
                                                                                        messageId = 0;
                                                                                        masterid = '';
                                                                                        //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                    }
                                                                                    else {
                                                                                        // Group type 0
                                                                                        if (requester == 1) {
                                                                                            // accepting from another group

                                                                                            var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + getDetails[0].AdminID;
                                                                                            st.db.query(queryParameters, function (err, iosResult) {
                                                                                                if (iosResult) {
                                                                                                    iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
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
                                                                                                                iphoneId = iphoneID;
                                                                                                                messageId = 0;
                                                                                                                masterid = '';
                                                                                                                console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                                notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                            }
                                                                                                            else {
                                                                                                                console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                                            }
                                                                                                        }
                                                                                                        else {
                                                                                                            console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            //accepted from other members
                                                                                            var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + masterId;
                                                                                            st.db.query(queryParameters, function (err, iosResult) {
                                                                                                if (iosResult) {
                                                                                                    iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                                                                    var query3 = 'select tid, GroupName from tmgroups where grouptype=1 and adminid =' + masterId;
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
                                                                                                                iphoneId = iphoneID;
                                                                                                                messageId = 0;
                                                                                                                masterid = '';
                                                                                                                console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                                notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                            }
                                                                                                            else {
                                                                                                                console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                                            }
                                                                                                        }
                                                                                                        else {
                                                                                                            console.log('FnUpdateUserStatus:Error getting from groupDetails');
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('FnUpdateUserStatus:Error getting from menberDetails');
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnUpdateUserStatus:Error getting from menberDetails');
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                console.log('FnUpdateUserStatus:Error getting from groupInfoRes');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnUpdateUserStatus:Error getting from groupInfoRes');
                                                        }
                                                    });
                                                    break;
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'User status is not updated';
                                            res.status(200).json(responseMessage);
                                            console.log('FnUpdateUserStatus:User status is not updated');
                                        }
                                    });
                                }

                                else {
                                    responseMessage.message = 'User status is not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus:User status is not updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateUserStatus: error in updating user status :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateUserStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateUserStatus ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateUserRelationship
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update User Relationship
 */
MessageBox.prototype.updateUserRelationship = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupId  = req.body.group_id;
    var memberID  = req.body.member_id;
    var relationType  = req.body.relation_type;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }
    if(!memberID){
        error['memberID'] = 'Invalid memberID';
        validateStatus *= false;
    }
    if(parseInt(relationType) == NaN){
        error['relationType'] = 'Invalid relationType';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(memberID) + ',' + st.db.escape(relationType);

                        var query = 'CALL pUpdateUserRelationship(' + queryParams + ')';
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User Relationship updated successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupId: req.body.group_id,
                                        memberID: req.body.member_id,
                                        relation_type: req.body.relation_type

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserRelationship: User Relationship updated successfully');
                                }
                                else {
                                    responseMessage.message = 'User Relationship is not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserRelationship:User Relationship is not updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateUserRelationship: error in updating user Relationship :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateUserRelationship: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserRelationship:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateUserRelationship ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDeleteGroup
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 * @description api code for Delete Group
 */
MessageBox.prototype.deleteGroup = function(req,res,next){
    var _this = this;

    var token  = req.query.token;
    var groupID = req.query.group_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupID){
        error['groupID'] = 'Invalid groupID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pDeleteGroup(' + st.db.escape(groupID) + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group deleted successfully';
                                    responseMessage.data = {
                                        groupID: groupID
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteGroup: Group deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Group not deleted';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteGroup:Group not deleted');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteGroup: error in deleting Group:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateUserRelationship: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserRelationship:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnDeleteGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSendMessageRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for send message request
 */
MessageBox.prototype.sendMessageRequest = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupName  = req.body.group_name;
    var groupType  = req.body.group_type;
    var auto_join = req.body.auto_join ? req.body.auto_join : 0;
    var relationType = req.body.relation_type;
    var userID = req.body.user_id ? req.body.user_id : 0;
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId,iphoneID;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupName){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }
    if(parseInt(groupType) == NaN){
        error['groupType'] = 'Invalid groupType';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(groupName) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(auto_join) + ',' + st.db.escape(relationType) + ',' + st.db.escape(userID);
                        var query = 'CALL pSendMessageRequest(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult.affectedRows > 0) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message Request send successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupName: req.body.group_name,
                                        groupType: req.body.group_type,
                                        relationType: req.body.relation_type,
                                        userID: req.body.user_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMessageRequest: Message Request send successfully');


                                    //send notification
                                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid='+userID;
                                    st.db.query(queryParameters, function (err, iosResult) {
                                        if (iosResult) {
                                            iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                            //console.log(iphoneId);
                                            var query1 = 'select tid from tmgroups where GroupName=' + st.db.escape(groupName);
                                            st.db.query(query1, function (err, groupDetails) {
                                                if (groupDetails) {
                                                        var query2 = 'select tid from tmgroups where GroupType=1 and adminID=' + userID;
                                                        st.db.query(query2, function (err, getDetails) {
                                                            if (getDetails) {
                                                                if (getDetails[0]) {
                                                                    receiverId = getDetails[0].tid;
                                                                    senderTitle = groupName;
                                                                    groupTitle = groupName;
                                                                    groupId = groupDetails[0].tid;
                                                                    messageText = 'has sent an invitation ';
                                                                    messageType = 3;
                                                                    operationType = 0;
                                                                    iphoneId = iphoneID;
                                                                    messageId = 0;
                                                                    masterid = '';
                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);

                                                                }
                                                                else {
                                                                    console.log('FnSendMessageRequest:Error getting from requestDetails');
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSendMessageRequest:Error getting from requestDetails');
                                                            }
                                                        });
                                                    }
                                                else {
                                                    console.log('FnSendMessageRequest:Error getting from groupdetails');
                                                }
                                            });
                                        }
                                    });
                                    }
                                else {
                                    responseMessage.message = 'Message Request not send';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMessageRequest:Message Request not send');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSendMessageRequest: error in Message Request :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSendMessageRequest: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSendMessageRequest:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSendMessageRequest ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

function pass(ezeid, callback){
    if(!ezeid){
        callbcak(null, null);
    }
    try{
        console.log('coming pass func..');
        st.db.query('CALL PGetMasterIDforEZEID(' + st.db.escape(ezeid) + ')', function (err, getResult) {
            if(!err) {
                if (getResult) {
                    var to = getResult[0][0].TID;
                    callback(null, to);
                }
            }
        });
    }
    catch(ex){
        console.log(ex);
    }
}

function FnBussinessChat(params, callback) {

    var _this = this;
    var i= 0,id1='';
    if (params) {
        //console.log('coming business chat func..');
        //console.log(params.toids.length);
        var a = function(i) {
            console.log(i);
            if( i < params.toids.length) {

               //console.log(params.toids[i]);
               // console.log(params.toids[i].charAt(0));
                if (params.toids[i].charAt(0) == '@') {
                    //console.log('print ezeid..');
                    //console.log(params.toids[i]);
                    pass(params.toids[i], function (err, output) {
                        if (output) {
                            //console.log('print tid..');
                            //console.log(output);
                            if (id1 != '') {
                                //console.log('111....');
                                id1 += ',' + output;

                            }
                            else {
                                //console.log('222...');
                                id1 = output;
                            }

                            var queryString = 'call PSendMsgRequestbyPO(' + st.db.escape(params.toids[i]) + ',' + st.db.escape(output) + ',' + st.db.escape(params.memberVisible) + ')';
                            console.log(queryString);
                            st.db.query(queryString, function (err, results) {
                                console.log('send message request by po');
                                i = i + 1;
                                a(i);
                            });
                        }
                        else
                        {console.log('tid not found');}
                    });

                }
                else {
                    console.log('coming else..');
                      if(id1!='')
                       {

                           //console.log('333...');
                           //console.log(i);
                           //console.log(params);
                            id1+=','+ params.toids[i];

                       }
                       else{
                          //console.log('444...');
                            id1 = params.toids[i];
                        }

                        var queryString1 = 'call PSendMsgRequestbyPO(' + st.db.escape(params.ezeid) + ',' + st.db.escape(params.toids[i]) + ',' + st.db.escape(params.memberVisible) + ')';
                        console.log(queryString1);
                        st.db.query(queryString1, function (err, results) {
                            console.log('send message request by po');
                            i = i + 1;
                            a(i);
                        });
                    }
                }
            else
            {
                console.log('callback..');
                callback(null,id1);
            }
        };
        }

        if ( i < params.toids.length){
            console.log('function call..');
            a(i);
            //i = i + 1;
        }
};

/**
 * @todo FnComposeMessage
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for compose message
 */
MessageBox.prototype.composeMessage = function(req,res,next){

    var _this = this;

    var message  = req.body.message;
    var attachment  = req.body.attachment ? req.body.attachment : '';
    var attachmentFilename  = req.body.attachment_filename ? req.body.attachment_filename : '';
    var priority  = (parseInt(req.body.priority) !== NaN) ? req.body.priority : 1;
    var targetDate  = (req.body.target_date) ? (req.body.target_date) : '';
    var expiryDate  =  (req.body.expiry_date) ? (req.body.expiry_date) : '';
    var token = req.body.token;
    var previousMessageID = req.body.previous_messageID ? req.body.previous_messageID : 0;
    var toID = req.body.to_id;                              // comma separated id of toID
    var idType = req.body.id_type ? req.body.id_type : ''; // comma seperated values(0 - Group Message, 1 - Individual Message)
    var mimeType = (req.body.mime_type) ? req.body.mime_type : '';
    var isJobseeker = req.body.isJobseeker ? req.body.isJobseeker : 0;
    var b_id='',get_tid,i=0,c=0,toIds,to_ids,to_Ids,masterid,receiverId,gid,toid=[],senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId,id,id_type,msgId,iphoneID,dateTime,prioritys;
    var latitude = '', longitude = '';
    var isBussinessChat = req.body.isBussinessChat ? req.body.isBussinessChat : 0;
    var ezeid = alterEzeoneId(req.body.ezeid);
    var istask = req.body.istask ? req.body.istask : 0;
    var memberVisible = req.body.member_visible ? req.body.member_visible : 0;

    if(idType){
        id = idType.split(",");
        //console.log(id.length);
        //console.log(id);
    }
    if(toID){
        toIds = toID.split(",");
        //console.log(toIds.length);
        //console.log(toIds);
    }

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!toID){
        error['toID'] = 'Invalid toID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                            var bussinessChat = function() {
                                console.log('business..');
                                var params = {
                                    toids : toIds,
                                    ezeid : ezeid,
                                    memberVisible : memberVisible
                                };

                                FnBussinessChat(params, function (err, outputResult) {
                                    toID = outputResult;
                                    //console.log('final-----');
                                    console.log(toID);
                                    if (toID) {
                                        compose();
                                    }
                                });
                            };
                            var compose = function() {
                                var queryParams = st.db.escape(message) + ',' + st.db.escape(attachment) + ',' + st.db.escape(attachmentFilename)
                                    + ',' + st.db.escape(priority) + ',' + st.db.escape(targetDate) + ',' + st.db.escape(expiryDate)
                                    + ',' + st.db.escape(token) + ',' + st.db.escape(previousMessageID) + ',' + st.db.escape(toID)
                                    + ',' + st.db.escape(idType) + ',' + st.db.escape(mimeType) + ',' + st.db.escape(isJobseeker)
                                    + ',' + st.db.escape(istask);
                                var query = 'CALL pComposeMessage(' + queryParams + ')';
                                //console.log(query);

                                st.db.query(query, function (err, insertResult) {
                                    //console.log(insertResult);
                                    if (!err) {
                                        if (insertResult) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message Composed successfully';
                                            responseMessage.data = {
                                                message_id : insertResult[0][0].messageids,
                                                message: req.body.message,
                                                attachmentFilename: req.body.attachment_filename,
                                                priority: req.body.priority,
                                                targetDate: req.body.target_date,
                                                expiryDate: req.body.expiry_date,
                                                token: req.body.token,
                                                previousMessageID: req.body.previous_messageID,
                                                toID: req.body.to_id,
                                                idType: req.body.id_type
                                            };
                                            res.status(200).json(responseMessage);

                                            /**
                                             * @todo add code for push notification like this
                                             */
                                            var queryParameter1 = 'select max(tid) as id from tmmessagebox';
                                            st.db.query(queryParameter1, function (err, messageResult) {
                                                if (messageResult) {
                                                    msgId = messageResult[0].id;
                                                    for (var c = 0; c < id.length; c++) {
                                                        id_type = parseInt(id[c]);
                                                        if(toID.length > 1){
                                                            var toIDS = toID;
                                                            to_ids = toIDS.split(",");
                                                            //console.log(toIds.length);
                                                            //console.log(toIds);
                                                        }
                                                        else
                                                        {
                                                            to_ids = [];
                                                            to_ids.push(toID);
                                                           // console.log('to_ids..');
                                                           // console.log(to_ids);
                                                        }
                                                        gid = parseInt(to_ids[c]);
                                                        console.log('------------------');
                                                        console.log(gid);
                                                        var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + gid;
                                                        //console.log(queryParameters);
                                                        st.db.query(queryParameters, function (err, iosResult) {
                                                            if (iosResult) {
                                                                if (iosResult[0]) {
                                                                    iphoneID = iosResult[0].iphoneID;
                                                                }
                                                                else
                                                                {
                                                                    iphoneID = '';
                                                                }
                                                                //console.log(iphoneID);
                                                                var queryParams = st.db.escape(token) + ',' + st.db.escape(id_type) + ',' + st.db.escape(gid);
                                                                var messageQuery = 'CALL PgetGroupDetails(' + queryParams + ')';
                                                                //console.log(messageQuery);
                                                                st.db.query(messageQuery, function (err, groupDetails) {
                                                                    if (groupDetails) {
                                                                        if (groupDetails[0]) {
                                                                            if (groupDetails[0].length > 0) {
                                                                                if (groupDetails[1]) {
                                                                                    if (groupDetails[1].length > 0) {
                                                                                        var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type)+ ',' + st.db.escape(token);
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
                                                                                                    messageText = message;
                                                                                                    messageType = id_type;
                                                                                                    operationType = 0;
                                                                                                    iphoneId = iphoneID;
                                                                                                    messageId = msgId;
                                                                                                    masterid = groupDetails[0][0].AdminID;
                                                                                                    prioritys = priority;
                                                                                                    var a_name = attachmentFilename;
                                                                                                    var now = new Date();
                                                                                                    var t = now.toUTCString();
                                                                                                    var datetime = t.split(',');
                                                                                                    datetime = datetime[1];
                                                                                                    console.log(datetime);

                                                                                                    //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid,latitude, longitude,prioritys,dateTime,a_name);
                                                                                                }
                                                                                            }
                                                                                            else {
                                                                                                console.log('FnComposeMessage:Error getting from groupname');
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        console.log('FnComposeMessage:Error getting from groupdetails1');
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('FnComposeMessage:Error getting from groupdetails2');
                                                                                }
                                                                            }
                                                                            else {
                                                                                console.log('FnComposeMessage:Error getting from groupdetails3');
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log('FnComposeMessage:Error getting from groupdetails4');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnComposeMessage:Error getting from groupdetails5');
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                                else {
                                                    console.log('FnComposeMessage: MessageId not loaded');
                                                }
                                            });
                                        }
                                        else {
                                            responseMessage.message = 'Message not Composed';
                                            res.status(200).json(responseMessage);
                                            console.log('FnComposeMessage:Message not Composed');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'An error occured ! Please try again';
                                        responseMessage.error = {
                                            server: 'Internal Server Error'
                                        };
                                        res.status(500).json(responseMessage);
                                        console.log('FnComposeMessage: error in composing Message :' + err);
                                    }
                                });
                            };

                        if (isBussinessChat == 1 || memberVisible == 1) {
                            bussinessChat();
                        }
                        else
                        {
                            compose();
                        }

                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnComposeMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnComposeMessage:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnComposeMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetMembersList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get members list
 */
MessageBox.prototype.getMembersList = function(req,res,next){
    var _this = this;

    var groupID = req.query.group_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupID){
        error['groupID'] = 'Invalid groupID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.db.query('CALL pGetMembersList(' + st.db.escape(groupID) + ')', function (err, getResult) {
                if (!err) {
                    if (getResult) {
                        if(getResult[0].length > 0){
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Members List loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetMembersList: Members List loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Members List not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetMembersList:Members List not loaded');
                        }

                    }
                    else {
                        responseMessage.message = 'Members List not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetMembersList:Members List not loaded');
                    }

                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetMembersList: error in getting Members:' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetMembersList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadMessageBox
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load messageBox
 */
MessageBox.prototype.loadMessageBox = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var trash = (req.query.trash) ? req.query.trash : 0; //if 0 normal msg ,if u want trash msg send 1 , Default is 0..
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id) + ',' + st.db.escape(trash) + ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount);
                        var query = 'CALL PLoadMessageBox(' + queryParams + ')';

                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'MessageBox loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadMessageBox: MessageBox loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'MessageBox not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadMessageBox:MessageBox not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'MessageBox not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadMessageBox:MessageBox not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadMessageBox: error in getting MessageBox:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadMessageBox: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessageBox:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';s
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadMessageBox ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnChangeMessageActivity
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update message activity status
 */
MessageBox.prototype.changeMessageActivity = function(req,res,next){

    var _this = this;

    var messageID  = req.body.message_id;
    var status  = req.body.status;
    var token  = req.body.token;
    var isMessage = req.body.ismessage_open ? req.body.ismessage_open : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!messageID){
        error['messageID'] = 'Invalid messageID';
        validateStatus *= false;
    }
    if(!status){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(messageID) + ',' + st.db.escape(status)+ ',' + st.db.escape(token)
                            + ',' + st.db.escape(isMessage);

                        var query = 'CALL PchangeMessageActivity(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message status changed successfully';
                                    responseMessage.data = {
                                        token: token,
                                        messageID: messageID,
                                        status:status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeMessageActivity: Message status changed successfully');
                                }
                                else {
                                    responseMessage.message = 'Message status not changed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeMessageActivity:Message status not changed');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnChangeMessageActivity: error in updating Message status:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnChangeMessageActivity: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnChangeMessageActivity:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnChangeMessageActivity ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadOutBoxMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load outbox messages
 */
MessageBox.prototype.loadOutBoxMessages = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['toke'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id) + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount);
                        var query = 'CALL pLoadOutBoxMessages(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'OutBox Messages loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadOutBoxMessages: OutBox Messages loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'OutBox Messages not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadOutBoxMessages:OutBox Messages not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'OutBox Messages not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadOutBoxMessages:OutBox Messages not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadOutBoxMessages: error in getting OutBox Messages:' + err);
                            }
                        });
                    }

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadOutBoxMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadOutBoxMessages:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadOutBoxMessages ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetSuggestionList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get Suggestion list
 */
MessageBox.prototype.getSuggestionList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!keywordsForSearch){
        error['keyword'] = 'Invalid keyword';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(keywordsForSearch) + ','  + st.db.escape(token);
                        var query = 'CALL pGetMessageboxSuggestionList(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'SuggestionList loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSuggestionList: SuggestionList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'SuggestionList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSuggestionList:SuggestionList not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'SuggestionList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSuggestionList:SuggestionList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetSuggestionList: error in getting SuggestionList:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetSuggestionList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetSuggestionList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetSuggestionList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnAddGroupMembers
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for Add Group Members
 */
MessageBox.prototype.addGroupMembers = function(req,res,next){

    var _this = this;

    var groupId = parseInt(req.body.group_id);
    var memberId  = req.body.member_id;
    var relationType  = req.body.relation_type;
    var requester = req.body.requester; // 1 for group, 2 for user
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupID,messageText,messageType,operationType,iphoneId,iphoneID,messageId;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var queryParams = st.db.escape(groupId) + ',' + st.db.escape(memberId) + ',' + st.db.escape(relationType)+ ',' + st.db.escape(requester);
            var query = 'CALL pAddMemberstoGroup(' + queryParams + ')';
            //console.log(query);
            st.db.query(query, function (err, insertResult) {
                if (!err) {
                    if (insertResult.affectedRows > 0) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Group Members added successfully';
                        responseMessage.data = {
                            groupId: groupId,
                            memberId: memberId,
                            relationType: relationType
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnAddGroupMembers: Group Members added successfully');

                        //send notification

                        if (requester == 1) {
                        //console.log('group admin to user');
                            var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid='+memberId;
                            st.db.query(queryParameters, function (err, iosResult) {
                                if (iosResult) {
                                    iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                    //console.log(iphoneID);
                                    var queryParams = 'select tid from tmgroups where GroupType=1 and adminID=' + memberId;
                                    st.db.query(queryParams, function (err, receiverDetails) {
                                        if (receiverDetails) {
                                            if (receiverDetails[0]) {
                                                var queryParams = 'select tid,GroupName from tmgroups where tid=' + groupId;
                                                st.db.query(queryParams, function (err, groupDetails) {
                                                    if (groupDetails) {
                                                        if (groupDetails[0]) {
                                                            receiverId = receiverDetails[0].tid;
                                                            senderTitle = groupDetails[0].GroupName;
                                                            groupTitle = groupDetails[0].GroupName;
                                                            groupID = groupId;
                                                            messageText = 'has sent an invitation ';
                                                            messageType = 3;
                                                            operationType = 0;
                                                            iphoneId = iphoneID;
                                                            messageId = 0;
                                                            masterid = '';
                                                            //console.log(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                            notification.publish(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId, masterid);

                                                        }
                                                        else {
                                                            console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnAddGroupMembers:Error getting from Receiverdetails');
                                            }
                                        }
                                        else {
                                            console.log('FnAddGroupMembers:Error getting from Receiverdetails');
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            //console.log('user to group admin');

                            // dont send notification to public group admin

                                    var getQuery = 'select EZEID from tmaster where tid=' + st.db.escape(memberId);
                                    st.db.query(getQuery, function (err, memberDetails) {
                                        if (memberDetails) {
                                            if (memberDetails[0]) {
                                                var query1 = 'select AdminID,GroupName from tmgroups where AutoJoin=0 and tid=' + st.db.escape(groupId);
                                                //console.log(query1);
                                                st.db.query(query1, function (err, groupDetails) {
                                                    if (groupDetails) {
                                                        if (groupDetails[0]) {
                                                                var query2 = 'select tid from tmgroups where GroupType=1 and adminID=' + groupDetails[0].AdminID;
                                                                //console.log(query2);
                                                                st.db.query(query2, function (err, getDetails) {
                                                                    if (getDetails) {
                                                                        if (getDetails[0]) {
                                                                            var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + groupDetails[0].AdminID;
                                                                            st.db.query(queryParameters, function (err, iosResult) {
                                                                                if (iosResult) {
                                                                                    iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                                                    //console.log(iphoneID);
                                                                                    receiverId = getDetails[0].tid;
                                                                                    senderTitle = memberDetails[0].EZEID;
                                                                                    groupTitle = groupDetails[0].GroupName;
                                                                                    groupID = groupId;
                                                                                    messageText = 'has sent a request';
                                                                                    messageType = 3;
                                                                                    operationType = 0;
                                                                                    iphoneId = iphoneID;
                                                                                    messageId = 0;
                                                                                    //console.log(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId);
                                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId);

                                                                                }
                                                                                else {
                                                                                    console.log('FnAddGroupMembers:Error getting from iphoneid');
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            console.log('FnAddGroupMembers:Error getting from Admin Details');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnAddGroupMembers:Error getting from Admin Details');
                                                                    }
                                                                });
                                                            }
                                                        else {
                                                            console.log('FnAddGroupMembers:No adminID : No send notification');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnAddGroupMembers:Error getting from member details');
                                            }
                                        }
                                        else {
                                            console.log('FnAddGroupMembers:Error getting from member details');
                                        }
                                    });
                                }
                    }
                    else {
                        responseMessage.message = 'Members already added';
                        res.status(200).json(responseMessage);
                        console.log('FnAddGroupMembers:Members already added');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnAddGroupMembers: error in adding GroupMembers :' + err);
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnAddGroupMembers ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetPendingRequest
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get Pending Request
 */
MessageBox.prototype.getPendingRequest = function(req,res,next){
    var _this = this;

    var token = req.query.token;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetPendingRequest(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'PendingList loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetPendingRequest: PendingList loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'PendingList not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetPendingRequest:PendingList not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'PendingList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetPendingRequest:PendingList not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'PendingList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetPendingRequest:PendingList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetPendingRequest: error in getting OutBox Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetPendingRequest: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetPendingRequest:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetPendingRequest ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetGroupList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get group list
 */
MessageBox.prototype.getGroupList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var groupId,count,date,arrayResult,arrayResult1,finalResult = [],invitation_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        i_count:'',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetGroupAndIndividuals(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        var queryParams1 = st.db.escape(token);
                                        var query1 = 'CALL PGetUnreadMessageCountofGroup(' + queryParams1 + ')';
                                        st.db.query(query1, function (err, get_result) {

                                            if (!err) {
                                                if (get_result) {
                                                    if (get_result[0].length > 0) {
                                                        for (var i = 0; i < getResult[0].length; i++) {
                                                            groupId = getResult[0][i].GroupID;
                                                            for (var j = 0; j < get_result[0].length; j++) {
                                                                if (groupId == get_result[0][j].GroupID) {
                                                                    getResult[0][i].unreadcount = get_result[0][j].count;
                                                                    getResult[0][i].date = get_result[0][j].CreatedDate;
                                                                    //res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                        }
                                                        var queryCount = 'CALL pGetPendingRequest(' + st.db.escape(token) + ')';
                                                        st.db.query(queryCount, function (err, invitationResult) {
                                                            responseMessage.status = true;
                                                            responseMessage.error = null;
                                                            responseMessage.message = 'GroupList loaded successfully';
                                                            responseMessage.i_count = invitationResult[0].length;
                                                            responseMessage.data = getResult[0];
                                                            res.status(200).json(responseMessage);
                                                            console.log('FnGetGroupList: GroupList loaded successfully');
                                                        });
                                                    }
                                                    else {
                                                        var queryCount = 'CALL pGetPendingRequest(' + st.db.escape(token) + ')';
                                                        st.db.query(queryCount, function (err, invitationResult) {
                                                            responseMessage.status = true;
                                                            responseMessage.error = null;
                                                            responseMessage.message = 'GroupList loaded successfully';
                                                            responseMessage.i_count = invitationResult[0].length;
                                                            responseMessage.data = getResult[0];
                                                            res.status(200).json(responseMessage);
                                                            console.log('FnGetGroupList: GroupList loaded successfully');
                                                        });
                                                    }
                                                }
                                                else {
                                                    responseMessage.message = 'GroupList not loaded';
                                                    res.status(200).json(responseMessage);
                                                    console.log('FnGetGroupList:GroupList not loaded');
                                                }
                                            }
                                            else {
                                                responseMessage.message = 'An error occured ! Please try again';
                                                responseMessage.error = {
                                                    server: 'Internal Server Error'
                                                };
                                                res.status(500).json(responseMessage);
                                                console.log('FnGetGroupList: error in getting GroupList:' + err);
                                            }
                                        });
                                    }
                                    else {
                                        responseMessage.message = 'GroupList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupList:GroupList not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'GroupList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetGroupList:GroupList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetGroupList: error in getting GroupList:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetGroupList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetGroupList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetGroupList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load messages of group
 */
MessageBox.prototype.loadMessages = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var id = parseInt(req.query.id); // toId or groupid
    var groupType = parseInt(req.query.group_type);
    var pageSize = req.query.page_size ? req.query.page_size : 100;
    var pageCount = req.query.page_count ? req.query.page_count : 0;
    var istask = req.query.istask ? parseInt(req.query.istask) : 0;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        count:'',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        error['id'] = 'Invalid id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(id) + ',' + st.db.escape(groupType)+ ',' + st.db.escape(token)
                            + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount)+ ',' + st.db.escape(istask);
                        var query = 'CALL pLoadMessagesofGroup(' + queryParams + ')';
                       // console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {

                                        if (groupType == 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            responseMessage.data = {
                                                group_details: getResult[0],
                                                messages: getResult[1]
                                            };
                                            if(getResult[1].length > 0) {
                                                responseMessage.count = getResult[1][0].count;
                                            }
                                            else
                                            {
                                                responseMessage.count=0;
                                            }
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadMessages: Messages loaded successfully');
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            if(getResult[0][0]) {
                                                responseMessage.count = getResult[0][0].count;
                                            }
                                            else{
                                                responseMessage.count=0;
                                            }
                                            //responseMessage.data = getResult[0];
                                            //console.log(getResult[0]);
                                            responseMessage.data = {
                                                group_details: [],
                                                messages: getResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadMessages: Messages loaded successfully');
                                        }
                                    }

                                    else {
                                        responseMessage.message = 'Messages not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadMessages:Messages not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Messages not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadMessages:Messages not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadMessages: error in getting Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessages:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadMessages ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnViewMessage
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for view messages
 */
MessageBox.prototype.viewMessage = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message
    var pageSize = req.query.page_size ? req.query.page_size : 100;
    var pageCount = req.query.page_count ? req.query.page_count : 0;


    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(tid) + ',' + st.db.escape(token)+ ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount);
                        var query = 'CALL pViewMessage(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage: Message loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage:Message not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewMessage:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewMessage:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewMessage: error in getting Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnViewMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetMessageAttachment
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for get message attachement
 */
MessageBox.prototype.getMessageAttachment = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message id

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(tid);
                        var query = 'CALL pGetMessageAttachment(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message attachement loaded successfully';
                                            responseMessage.data = getResult[0][0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetMessageAttachment: Message attachement loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message attachement not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetMessageAttachment:Message attachement not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message attachement not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetMessageAttachment:Message attachement not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message attachement not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetMessageAttachment:Message attachement not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetMessageAttachment: error in getting Message attachement:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetMessageAttachment: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetMessageAttachment:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetMessageAttachment ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetGroupInfo
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param group_id <int>
 * @description api code for get group infromation
 */
MessageBox.prototype.getGroupInfo = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var groupId = parseInt(req.query.group_id); // tid of group
    var type =req.query.type;     //0=Group info,1=ezeone info,2=messageInfromation

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId)+','+st.db.escape(type)+','+st.db.escape(token);
                        var query = 'CALL pGetGroupInfn(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'GroupInfromation loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupInfo: GroupInfromation loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'GroupInfromation not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'GroupInfromation not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'GroupInfromation not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetGroupInfo: error in getting GroupInfromation:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetGroupInfo: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetGroupInfo:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetGroupInfo ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnCountOfUnreadMessage
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get group list
 */
MessageBox.prototype.countOfUnreadMessage = function(req,res,next){
    var _this = this;

    var token = req.query.token;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetCountOfUnreadMessage(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Unread Count loaded successfully';
                                        responseMessage.data = getResult[0][0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnCountOfUnreadMessage: GroupList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Unread Count not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnCountOfUnreadMessage:Unread Count not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Unread Count not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnCountOfUnreadMessage:Unread Count not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCountOfUnreadMessage: error in getting Unread Count:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnCountOfUnreadMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCountOfUnreadMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnCountOfUnreadMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnViewMessageNew
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for view messages
 */
MessageBox.prototype.viewMessageNew = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(tid);
                        var query = 'CALL pViewMessagenew(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage: Message loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage:Message not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewMessage:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewMessage:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewMessage: error in getting Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnViewMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnChangeGroupAdmin
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for change group admin
 */
MessageBox.prototype.changeGroupAdmin = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupId  = parseInt(req.body.gid);
    var masterid  = req.body.masterid; // masterid of new admin

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }
    if(!masterid){
        error['masterid'] = 'Invalid masterid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(masterid);

                        var query = 'CALL pchangeGroupAdmin(' + queryParams + ')';

                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            console.log(updateResult);
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group Admin Changed successfully';
                                    responseMessage.data = {
                                        groupId: req.body.gid,
                                        masterid : req.body.masterid
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeGroupAdmin: Group Admin Changed successfully');
                                }
                                else {
                                    responseMessage.message = 'Group Admin is not Changed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeGroupAdmin:Group Admin is not Changed');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnChangeGroupAdmin: error in changing groupadmin:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnChangeGroupAdmin: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnChangeGroupAdmin:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnChangeGroupAdmin ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateTaskStatus
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for update task status
 */
MessageBox.prototype.updateTaskStatus = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var MessageId  = parseInt(req.body.id);
    var status  = req.body.status; //  0-Open, 1-Close [taskstatus]

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!MessageId){
        error['MessageId'] = 'Invalid MessageId';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(MessageId) + ',' + st.db.escape(status);

                        var query = 'CALL pupdatetaskstatus(' + queryParams + ')';

                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Task Status Updated successfully';
                                    responseMessage.data = {
                                        MessageId  : parseInt(req.body.id),
                                        status  : req.body.status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateTaskStatus: Task Status Updated successfully');
                                }
                                else {
                                    responseMessage.message = 'Task Status not Updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateTaskStatus:Task Status not Updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateTaskStatus: error in changing TaskStatus:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateTaskStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateTaskStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateTaskStatus ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetLastMsgOfGroup
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get last message sof group
 */
MessageBox.prototype.getLastMsgOfGroup = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var msgId = parseInt(req.query.id);   // id of message
    var groupId = parseInt(req.query.gid);
    var groupType = req.query.group_type;


    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(msgId) + ',' + st.db.escape(groupId)+ ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(token);
                        var query = 'CALL pGetlatestmessagesofGroup(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLastMsgOfGroup: Message loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLastMsgOfGroup:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetLastMsgOfGroup:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetLastMsgOfGroup: error in getting Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetLastMsgOfGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetLastMsgOfGroup:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetLastMsgOfGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = MessageBox;