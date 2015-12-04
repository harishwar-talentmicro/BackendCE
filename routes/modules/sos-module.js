/**
 * Created by Gowri shankar on 04-12-2015.
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
var notification = null;


function Sos(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
    }
};


/**
 * @todo FnSaveSosRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save sos
 */
Sos.prototype.saveSos = function(req,res,next) {


    var _this = this;

    var ezeid = req.body.ezeid ? alterEzeoneId(req.body.ezeid) : '';
    var b1 = req.body.b1 ? req.body.b1 : 0;   // 0-unselect 1-select
    var b2 = req.body.b2 ? req.body.b2 : 0;
    var b3 = req.body.b3 ? req.body.b3 : 0;
    var b4 = req.body.b4 ? req.body.b4 : 0;
    var b5 = req.body.b5 ? req.body.b5 : 0;
    var latitude = req.body.lat;
    var longitude = req.body.lng;
    var deviceId = req.body.device_id;
    var iphoneID='';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(ezeid) + ',' + st.db.escape(b1)+ ',' + st.db.escape(b2)
            + ',' + st.db.escape(b3)+ ',' + st.db.escape(b4)+ ',' + st.db.escape(b5)+ ',' + st.db.escape(latitude)
            + ',' + st.db.escape(longitude)+ ',' + st.db.escape(deviceId);

        var query = 'CALL pSaveSOSrequest(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, insertResult) {
            console.log(insertResult);
            if (!err) {
                if (insertResult) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Sos saved successfully';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveSosRequest: Sos saved successfully');

                    /**
                     * send push notification for sos request
                     */
                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where MasterId=' + insertResult[0].masterid;
                    //console.log(queryParameters);
                    st.db.query(queryParameters, function (err, iosResult) {
                        if (iosResult) {
                            iphoneID = iosResult[0].iphoneID;
                        }
                        else {
                            iphoneID = '';
                        }

                        var queryParams2 = 'select tid,GroupName from tmgroups where AdminId=' + insertResult[0].masterid;
                        console.log(queryParams2);
                        st.db.query(queryParams2, function (err, userDetails) {
                            console.log(userDetails);

                            if (userDetails) {
                                if (userDetails[0]) {

                                    for (var i = 0; i < userDetails[0].length; i++) {
                                        var receiverId = userDetails[0].tid;
                                        var senderTitle = '';
                                        var groupId = '';
                                        var groupTitle = userDetails[0][0].groupname;
                                        var messageText = '';
                                        var messageType = 10;
                                        var operationType = 0;
                                        var iphoneId = iphoneID;
                                        var messageId = '', msgUserid = '', masterid = '', prioritys = '';
                                        var a_name = '', dateTime = '', latitude = '', longitude = '';

                                        notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                    }
                                }
                            }

                        });

                    });
                }
                else {
                    responseMessage.message = 'Sos not saved';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveSosRequest:Sos not saved');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnSaveSosRequest: error in saving Sos  :' + err);
            }

        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnSaveSosRequest ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnPostSosRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for Post sos
 */
Sos.prototype.postSos = function(req,res,next) {


    var _this = this;

    var request = req.body.request ? req.body.request : '';
    var mobile = req.body.mobile;
    var latitude = req.body.lat;
    var longitude = req.body.lng;
    var deviceId = req.body.device_id;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(request) + ',' + st.db.escape(mobile)+ ',' + st.db.escape(latitude)
            + ',' + st.db.escape(longitude)+ ',' + st.db.escape(deviceId);

        var query = 'CALL pPostSOSrequest(' + queryParams + ')';
        st.db.query(query, function (err, insertResult) {
            if (!err) {
                if (insertResult) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Sos Posted successfully';
                    res.status(200).json(responseMessage);
                    console.log('FnPostSosRequest: Sos Posted successfully');

                    /**
                     * send push notification for sos request
                     */
                    var queryParams1 = st.db.escape(gid) + ',' + st.db.escape(id_type) + ',' + st.db.escape(MsgContent.token);
                    var messageQuery1 = 'CALL (' + queryParams1 + ')';
                    console.log(messageQuery1);
                    st.db.query(messageQuery1, function (err, groupDetails1) {
                        if (groupDetails1) {
                            for (var i = 0; i < groupDetails[1].length; i++) {
                                var receiverId = '';
                                var senderTitle = '';
                                var groupId = groupDetails1[0][0].groupid;
                                var groupTitle = groupDetails1[0][0].groupname;
                                var messageText = MsgContent.message;
                                var messageType = id_type;
                                var operationType = 0;
                                var iphoneId = iphoneID;
                                var messageId = MsgContent.message_id;
                                var msgUserid = MsgContent.message_userid;
                                var masterid = groupDetails[0][0].AdminID;
                                var prioritys = MsgContent.priority;
                                var a_name = MsgContent.attachmentFilename;
                                var datetime = '', latitude = '', longitude = '';
                                //console.log('senderid:' + groupId + '     receiverid:' + receiverId);
                                //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                            }
                        }
                    });

                }
                else {
                    responseMessage.message = 'Sos not Posted';
                    res.status(200).json(responseMessage);
                    console.log('FnPostSosRequest:Sos not Posted');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnPostSosRequest: error in saving Sos  :' + err);
            }

        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnPostSosRequest ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnLoadSosRequest
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for load sos
 */
Sos.prototype.loadSosRequest = function(req,res,next) {


    var _this = this;

    var msaterId = req.body.master_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(msaterId);
        var query = 'CALL pLoadSOSrequests(' + queryParams + ')';
        st.db.query(query, function (err, getResult) {
            if (!err) {
                if (getResult) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.data = getResult[0];
                        responseMessage.message = 'Sos Request loaded successfully';
                        res.status(200).json(responseMessage);
                        console.log('FnLoadSosRequest: Sos Request loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Sos Request not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnLoadSosRequest:Sos Request not loaded');
                    }
                }
                else {
                    responseMessage.message = 'Sos Request not loaded';
                    res.status(200).json(responseMessage);
                    console.log('FnLoadSosRequest:Sos Request not loaded');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnLoadSosRequest: error in saving Sos  :' + err);
            }

        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnLoadSosRequest ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

module.exports = Sos;