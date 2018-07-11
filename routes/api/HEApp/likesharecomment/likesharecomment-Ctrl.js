var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;


var likesharecommentCtrl = {};
var error = {};


likesharecommentCtrl.saveLSComment=function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading users",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.heMasterId){
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    var comment = req.body.comment;
    if (typeof (comment) == "string") {
        comment = JSON.parse(comment);
    }
    if (!comment) {
        comment = {};
    }
    
    var share = req.body.share;
    if (typeof (share) == "string") {
        share = JSON.parse(share);
    }
    if (!share) {
        share = {};
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

                // req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                // req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                // req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                // var startPage = 0;

                // startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.formId),
                    req.st.db.escape(req.body.transId),
                    req.st.db.escape(req.body.heParentId),
                    req.st.db.escape(req.body.type),   
                    req.st.db.escape(JSON.stringify(comment)),
                    req.st.db.escape(JSON.stringify(share)),
                    req.st.db.escape(req.body.likeStatus),
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_saveLikeShareComment( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userData){
                    console.log(err);
                    if(!err && userData){
                        response.status = true;
                        response.message = "data saved successfully";
                        response.error = null;
                        response.data = null

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

likesharecommentCtrl.getlikecommentusers=function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading users",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }

    if (!req.body.heParentId) {
        error.heParentId = 'Invalid heParentId';
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
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                

                // req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                // req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                // req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                // var startPage = 0;

                // startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.formId),
                    req.st.db.escape(req.body.transId),
                    req.st.db.escape(req.body.heParentId),
                    req.st.db.escape(req.body.type)   
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_likescommentsUserList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    if(!err && results && results[0] && results[0][0]){
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;
                        var likeCommentResult;
                        if(req.body.type ==2){
                            for(var i=0; i<results[0].length; i++){
                                results[0][i].comment = (results[0][i] && results[0][i].comment) ? JSON.parse(results[0][i].comment) :{}
                            }
                            likeCommentResult = {
                                commentList: results[0],
                                count: results[1][0].count
                            }
                        }
                        else{
                            likeCommentResult = {
                                likeList: results[0],
                                count: results[1][0].count
                            }

                        }  

                        response.data = likeCommentResult;
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = false;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};



likesharecommentCtrl.getcommentmaster=function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading comment list",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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

                // req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                // req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                // req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                // var startPage = 0;

                // startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)   
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_commentMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    if(!err && results && results[0] && results[0][0]){
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;
                        response.data = results[0];
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = false;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};


module.exports = likesharecommentCtrl;
