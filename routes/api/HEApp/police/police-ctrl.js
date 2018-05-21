/**
 * Created by Jana1 on 06-11-2017.
 */

var policeCtrl = {};
var error = {};
var path = require('path');

var fs = require('fs');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

var Notification_aws = require('../../../modules/notification/aws-sns-push.js');

var _Notification_aws = new  Notification_aws();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

policeCtrl.getPoliceStations = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.latitude = (req.query.latitude!=undefined) ? req.query.latitude : 0;
                req.query.longitude = (req.query.longitude != undefined) ? req.query.longitude : 0;
                req.query.keywords = (req.query.keywords != undefined) ? req.query.keywords : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.latitude),
                    req.st.db.escape(req.query.longitude),
                    req.st.db.escape(req.query.keywords),
                    req.st.db.escape(req.query.WMId)
                ];

                var procQuery = 'CALL he_get_policeStations( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, policeStations) {
                   if (!err && policeStations && policeStations[0] && policeStations[0][0]) {
                        response.status = true;
                        response.message = "Police stations loaded successfully";
                        response.error = null;
                        response.data = {
                            policeStations : policeStations[0]
                        };
                        res.status(200).json(response);
                    }
                   else if(!err){
                       response.status = true;
                       response.message = "No police stations found";
                       response.error = null;
                       response.data = {
                           policeStations : []
                       };
                       res.status(200).json(response);
                   }
                   else {
                        response.status = false;
                        response.message = "Error while getting police stations";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

policeCtrl.saveIncident = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.stationId) {
                        error.stationId = 'Invalid stationId';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.incidentId = (req.body.incidentId!=undefined) ? req.body.incidentId : 0;
                        req.body.response = (req.body.response != undefined) ? req.body.response : "";
                        req.body.internalNotes = (req.body.internalNotes != undefined) ? req.body.internalNotes : "";
                        req.body.status = (req.body.status != undefined) ? req.body.status : 1;
                        req.body.description = (req.body.description != undefined) ? req.body.description : 0;
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.incidentId),
                            req.st.db.escape(req.body.stationId),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(req.body.description),
                            req.st.db.escape(req.body.latitude),
                            req.st.db.escape(req.body.longitude),
                            req.st.db.escape(req.body.response),
                            req.st.db.escape(req.body.internalNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(DBSecretKey)                                                                                        
                        ];
        
                        var procQuery = 'CALL he_save_policeIncident( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userData) {
                            if (!err && userData ) {
                                if (req.body.type == 1){
                                    // SOS message
                                    var messagePayload = {
                                        message : "SOS",
                                        type : 81,
                                        alarmType : 3,
                                        incidentDetails : userData[1][0]
                                    };
        
                                }
                                else if(req.body.type == 2){
                                    // Incident
                                    var messagePayload = {
                                        message : "Incident",
                                        type : 82,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
                                else if(req.body.type == 3){
                                    // Threat
                                    var messagePayload = {
                                        message : "Threat",
                                        type : 83,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
                                else if(req.body.type == 4){
                                    // Query
                                    var messagePayload = {
                                        message : "Query",
                                        type : 84,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
                                else if(req.body.type == 5){
                                    // Suggestion
                                    var messagePayload = {
                                        message : "Suggestion",
                                        type : 85,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
        
                                if(userData && userData[0] && userData[0][0] && userData[0][0].APNS_Id){
                                    _Notification_aws.publish_IOS(userData[0][0].APNS_Id,messagePayload,0);
                                }
        
                                if(userData && userData[0] && userData[0][0] && userData[0][0].GCM_Id){
                                    _Notification_aws.publish_Android(userData[0][0].GCM_Id,messagePayload,0);
                                }
        
                                var message = "";
                                if (req.body.type == 1){
                                    message = "SOS Message sent successfully";
                                }
                                else if(req.body.type == 2){
                                    message = "Incident saved successfully";
                                }
                                else if(req.body.type == 3){
                                    message = "Threat saved successfully";
                                }
                                else if(req.body.type == 4){
                                    message = "Query saved successfully";
                                }
                                else if(req.body.type == 5){
                                    message = "Suggestion saved successfully";
                                }
                                response.status = true;
                                response.message = message;
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if(!err){
                                response.status = true;
                                response.message = "Incident saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving incident";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

policeCtrl.getIncident = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.status = req.query.status ? req.query.status : 0;
                req.query.keywords = req.query.keywords ? req.query.keywords : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.keywords),
                    req.st.db.escape(DBSecretKey)                                                                                        
                ];

                var procQuery = 'CALL he_get_policeIncident( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, incidentData) {
                    if (!err && incidentData && incidentData[0] && incidentData[0][0]) {
                        response.status = true;
                        response.message = "Incidents loaded successfully";
                        response.error = null;
                        response.data = {
                            incidentList : incidentData[0],
                            isPolice : incidentData[1][0].isPolice
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No incidents found";
                        response.error = null;
                        response.data = {
                            incidentList : [] ,
                            isPolice : 0
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting incidents";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

policeCtrl.getMapPoliceStations = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.WMId)
                ];

                var procQuery = 'CALL he_get_map_policeStations( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, policeStations) {
                    if (!err && policeStations && policeStations[0] && policeStations[0][0]) {
                        response.status = true;
                        response.message = "Police stations loaded successfully";
                        response.error = null;
                        response.data = {
                            policeStations : policeStations[0]
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No police stations found";
                        response.error = null;
                        response.data = {
                            policeStations : []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting police stations";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

policeCtrl.getPoliceAbout = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var file = path.join(__dirname, '../../../../mail/templates/UP.html');
                fs.readFile(file, "utf8", function (err, data) {
                    if (!err) {
                        response.status = true;
                        response.message = "Information loaded successfully..";
                        response.data = data ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Internal Server Error";
                        response.data =null;
                        res.status(200).json(response);
                    }
                });

            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


policeCtrl.savePublicNotification = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(req.body.description)
                        ];
        
                        var procQuery = 'CALL he_save_policetopublicIncidents( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userData) {
                            if (!err && userData && userData[0] && userData[0][0] ) {
                                if (req.body.type == 6){
                                    // SOS message
                                    var messagePayload = {
                                        message : "SOS",
                                        type : 86,
                                        alarmType : 3,
                                        incidentDetails : userData[1][0]
                                    };
        
                                }
                                else if(req.body.type == 7){
                                    // Incident
                                    var messagePayload = {
                                        message : "Alert",
                                        type : 87,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
                                else if(req.body.type == 8){
                                    // Threat
                                    var messagePayload = {
                                        message : "Awareness",
                                        type : 88,
                                        alarmType : 1,
                                        incidentDetails : userData[1][0]
                                    };
                                }
        
                                if(userData && userData[0] && userData[0][0] && userData[0][0].APNS_Id){
                                    _Notification_aws.publish_IOS(userData[0][0].APNS_Id,messagePayload,0);
                                }
        
                                if(userData && userData[0] && userData[0][0] && userData[0][0].GCM_Id){
                                    _Notification_aws.publish_Android(userData[0][0].GCM_Id,messagePayload,0);
                                }
        
                                var message = "";
                                if (req.body.type == 6){
                                    message = "SOS Message sent successfully";
                                }
                                else if(req.body.type == 7){
                                    message = "Alert sent successfully";
                                }
                                else if(req.body.type == 8){
                                    message = "Awareness sent successfully";
                                }
        
                                response.status = true;
                                response.message = message;
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if(!err){
                                response.status = true;
                                response.message = "Access denied ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving incident";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


module.exports = policeCtrl;
