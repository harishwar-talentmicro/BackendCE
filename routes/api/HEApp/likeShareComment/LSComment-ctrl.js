var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var LSCommentCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

LSCommentCtrl.saveLSComment=function(req,res,next){
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

    if (!req.body.heMasterId)
    {
        
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



module.exports = LSCommentCtrl;