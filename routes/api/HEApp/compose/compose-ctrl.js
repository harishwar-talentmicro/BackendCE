/**
 * Created by Jana1 on 15-03-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var zlib = require('zlib');

var composeCtrl = {};

composeCtrl.sendMessage = function(req,res,next){
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
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                        if (!req.body.message) {
                            error.token = 'Invalid message';
                            validationFlag *= false;
                        }
                        if (!req.body.receiverGroupId) {
                            error.token = 'Invalid receiverGroupId';
                            validationFlag *= false;
                        }
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        var procParams = [
                            req.st.db.escape(req.body.token),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.receiverGroupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_send_message( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            console.log(results);
                            if(!err){
                                response.status = true;
                                response.message = "Message send successfully";
                                response.error = null;
                                response.data = {
                                    formId : results[0][0].formId,
                                    message : results[0][0].message
                                };
                                res.status(200).json(response);
                            }
                            else{
                                response.status = false;
                                response.message = "Error while searching form";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }

                }
                );
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

composeCtrl.learnMessage = function(req,res,next){
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
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.message) {
                        error.token = 'Invalid message';
                        validationFlag *= false;
                    }
                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }
                    if (!req.body.formId) {
                        error.formId = 'Invalid formId';
                        validationFlag *= false;
                    }
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.formId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save learned words for form
                         * @type {string}
                         */
                        var procQuery = 'CALL he_learn_robotic_message( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            console.log(results);
                            if(!err){
                                response.status = true;
                                response.message = "Message saved successfully";
                                response.error = null;
                                response.data = null ;
                                res.status(200).json(response);
                            }
                            else{
                                response.status = false;
                                response.message = "Error while saving message";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });

            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

module.exports = composeCtrl;