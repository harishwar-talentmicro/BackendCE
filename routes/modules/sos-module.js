/**
 * Created by Gowri shankar on 04-12-2015.
 */
"use strict";


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

    var ezeid = (req.body.ezeid) ? req.st.alterEzeoneId(req.body.ezeid) : '';
    var b1 = (req.body.b1) ? req.body.b1 : 0;   // 0-unselect 1-select
    var b2 = (req.body.b2) ? req.body.b2 : 0;
    var b3 = (req.body.b3) ? req.body.b3 : 0;
    var b4 = (req.body.b4) ? req.body.b4 : 0;
    var b5 = (req.body.b5) ? req.body.b5 : 0;
    var latitude = req.body.lat;
    var longitude = req.body.lng;
    var deviceId = req.body.device_id;
    var iphoneID='';
    var request = (req.body.request) ? req.body.request : '';
    var mobile = (req.body.mobile) ? req.body.mobile : '';


    req.body.service_mid = parseInt(req.body.service_mid) ? req.body.service_mid : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    try {
        var queryParams = st.db.escape(ezeid) + ',' + st.db.escape(b1)+ ',' + st.db.escape(b2)
            + ',' + st.db.escape(b3)+ ',' + st.db.escape(b4)+ ',' + st.db.escape(b5)+ ',' + st.db.escape(deviceId)
            + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude)+ ',' + st.db.escape(req.body.service_mid);
        var query = 'CALL pSaveSOSrequest(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, insertResult) {
            console.log(insertResult);
            if (!err) {
                if (insertResult) {
                    if (insertResult[0]) {
                        var queryParams1 = st.db.escape(request) + ',' + st.db.escape(mobile)+ ',' + st.db.escape(latitude)
                            + ',' + st.db.escape(longitude)+ ',' + st.db.escape(deviceId)+ ',' + st.db.escape(ezeid)
                            + ',' + st.db.escape(req.body.service_mid);
                        var query = 'CALL pPostSOSrequest(' + queryParams1 + ')';
                        console.log(query);
                        st.db.query(query, function (err, reqResult) {
                            if (!err) {
                                if (reqResult) {
                                    console.log(reqResult);
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Sos saved successfully';
                                    res.status(200).json(responseMessage);
                                    console.log('FnPostSosRequest: Sos Posted successfully');
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
                        /**
                         * send push notification for sos request
                         */
                        for (var i = 0; i < insertResult[0].length; i++) {
                            var queryParameters = 'select EZEID,tid,IPhoneDeviceID as iphoneID from tmaster where tid=' + insertResult[0][i].masterid;
                            console.log(queryParameters);
                            st.db.query(queryParameters, function (err, details) {
                                console.log(details);
                                if (details) {
                                    if (details[0]) {
                                        if (details[0].length > 0) {
                                            iphoneID = details[0].iphoneID;
                                        }
                                        var queryParams2 = 'select tid,GroupName from tmgroups where AdminID=' + details[0].tid + ' and grouptype=1';
                                        console.log(queryParams2);
                                        st.db.query(queryParams2, function (err, userDetails) {
                                            console.log(userDetails);
                                            if (userDetails) {
                                                if (userDetails[0]) {
                                                    var receiverId = userDetails[0].tid;
                                                    var senderTitle = ezeid;
                                                    var groupId = '';
                                                    var groupTitle = userDetails[0].GroupName;
                                                    var messageText = 'SOS request';
                                                    var messageType = 10;
                                                    var operationType = 0;
                                                    var iphoneId =  details[0].iphoneID;
                                                    var messageId = '';
                                                    var msgUserid = '';
                                                    var masterId = '';
                                                    var priority = '';
                                                    var a_name = '';
                                                    var dateTime = ''
                                                    var latitude = req.body.lat;
                                                    var longitude = req.body.lng;
                                                    var message = '';
                                                    var jobId = 0;
                                                    var aUrl = '';
                                                    var txId = 0;
                                                    var issos = true;
                                                    var data = {
                                                        sm_id : req.body.service_mid
                                                    };
                                                    console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                        operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                    notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                        operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                    else {
                        responseMessage.message = 'Sos not saved';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveSosRequest:Sos not saved');
                    }
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

    var request = (req.body.request) ? req.body.request : '';
    var mobile = req.body.mobile;
    var latitude = req.body.lat;
    var longitude = req.body.lng;
    var deviceId = req.body.device_id;
    var iphoneID='';
    var ezeid = (req.body.ezeid) ? req.st.alterEzeoneId(req.body.ezeid) : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {
        var queryParams = st.db.escape(request) + ',' + st.db.escape(mobile)+ ',' + st.db.escape(latitude)
            + ',' + st.db.escape(longitude)+ ',' + st.db.escape(deviceId)+ ',' + st.db.escape(ezeid)
            + ',' + st.db.escape(req.body.service_mid);

        var query = 'CALL pPostSOSrequest(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, insertResult) {
            if (!err) {
                if (insertResult) {
                    console.log(insertResult);
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Sos Posted successfully';
                    res.status(200).json(responseMessage);
                    console.log('FnPostSosRequest: Sos Posted successfully');
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


    var masterId = req.query.master_id;
    req.query.service_mid = (req.query.service_mid) ? req.query.service_mid : 0;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(masterId) + ',' + st.db.escape(req.query.service_mid) ;
        var query = 'CALL pLoadSOSrequests(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, getResult) {
            //console.log(getResult);
            if (!err) {
                if (getResult) {
                    if (getResult[0]) {
                        console.log(getResult);
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

/**
 * @todo FnUpdateSosRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save sos
 */
Sos.prototype.updateSosRequest = function(req,res,next) {

    var id = req.body.id;    // tid
    var token = req.body.token;
    var iphoneID = '';
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    try {
        var queryParams = st.db.escape(id) + ',' + st.db.escape(token)+ ',' + st.db.escape(req.body.service_mid);
        var query = 'CALL pUpdateSOSstatus(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, updateResult) {
            console.log(updateResult);
            if (!err) {
                if (updateResult) {
                    if(updateResult[0]) {
                        if(updateResult[0][0]){
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'SosRequest update successfully';
                            res.status(200).json(responseMessage);
                            console.log('FnUpdateSosRequest: SosRequest update successfully');
                            /**
                             * send push notification for sos request
                             */
                            var receiverId = updateResult[0][0].gid;
                            var senderTitle = updateResult[0][0].ezeoneId;
                            var groupId = '';
                            var contact = updateResult[0][0].contactnu + ',' + updateResult[0][0].name;
                            var groupTitle = contact;
                            var messageText = 'has accepted your SOS request ';
                            var messageType = 11;
                            var operationType = 0;
                            var iphoneId = (updateResult[0][0].deviceid) ? updateResult[0][0].deviceid : '';
                            var messageId = '';
                            var msgUserid = '';
                            var masterId = '';
                            var priority = '';
                            var a_name = '';
                            var dateTime = '';
                            var latitude = '';
                            var longitude = '';
                            var data = {
                                sm_id : req.body.service_mid
                            };
                            var jobId = 0;
                            var aUrl = '';
                            var txId = '';
                            var issos = false;
                            console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType,
                                iphoneId, messageId, masterId, latitude, longitude, priority, dateTime, a_name, msgUserid,data);
                            notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                        }
                        else {
                            responseMessage.message = 'SosRequest not update';
                            res.status(200).json(responseMessage);
                            console.log('FnUpdateSosRequest:SosRequest not update');
                        }
                    }
                    else {
                        responseMessage.message = 'SosRequest not update';
                        res.status(200).json(responseMessage);
                        console.log('FnUpdateSosRequest:SosRequest not update');
                    }
                }
                else {
                    responseMessage.message = 'SosRequest not update';
                    res.status(200).json(responseMessage);
                    console.log('FnUpdateSosRequest:SosRequest not update');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnUpdateSosRequest: error in saving SosRequest update  :' + err);
            }

        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnUpdateSosRequest ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnSaveSosServiceProvider
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save sos
 */
Sos.prototype.saveSosServiceProvider = function(req,res,next) {
    var token = req.body.token;
    var latitude = req.body.lat;
    var longitude = req.body.lng;
    var proximity = req.body.proximity;
    var mobile = req.body.mobile;
    var b1 = (req.body.b1) ? req.body.b1 : 0;   // 0-unselect 1-select
    var b2 = (req.body.b2) ? req.body.b2 : 0;
    var b3 = (req.body.b3) ? req.body.b3 : 0;
    var b4 = (req.body.b4) ? req.body.b4 : 0;
    var b5 = (req.body.b5) ? req.body.b5 : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(token) + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude)
            + ',' + st.db.escape(proximity)+ ',' + st.db.escape(mobile)+ ',' + st.db.escape(b1)+ ',' + st.db.escape(b2)
            + ',' + st.db.escape(b3)+ ',' + st.db.escape(b4)+ ',' + st.db.escape(b5);

        var query = 'CALL psaveSOSserviceprovider(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, insertResult) {
            //console.log(insertResult);
            if (!err) {
                if (insertResult) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Sos Service Provider saved successfully';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveSosServiceProvider: Sos saved successfully');

                }
                else {
                    responseMessage.message = 'Sos Service Provider not saved';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveSosServiceProvider:Sos not saved');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnSaveSosServiceProvider: error in saving Sos Service Provider  :' + err);
            }

        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnSaveSosServiceProvider ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnGetSosServiceProvider
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for load sos
 */
Sos.prototype.getSosServiceProvider = function(req,res,next) {

    var token = req.query.token;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    try {
        var queryParams = st.db.escape(token);
        var query = 'CALL pGetSOSserviceprovider(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, getResult) {
            //console.log(getResult);
            if (!err) {
                if (getResult) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.data = getResult[0];
                        responseMessage.message = 'Sos Service Provider loaded successfully';
                        res.status(200).json(responseMessage);
                        console.log('FnGetSosServiceProvider: Sos Service Provider loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Sos Service Provider not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetSosServiceProvider:Sos Service Provider not loaded');
                    }
                }
                else {
                    responseMessage.message = 'Sos Service Provider not loaded';
                    res.status(200).json(responseMessage);
                    console.log('FnGetSosServiceProvider:Sos Service Provider not loaded');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnGetSosServiceProvider: error in saving Sos Service Provider  :' + err);
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