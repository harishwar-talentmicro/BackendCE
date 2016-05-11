/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title messagebox module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');
var gm = require('gm').subClass({ imageMagick: true });
var uuid = require('node-uuid');
var gcloud = require('gcloud');
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

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});
// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);
bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

// method for upload image to cloud
var uploadDocumentToCloud = function(uniqueName,readStream,callback){
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        console.log('done');
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *@param token <string> token of user
 *@param dateTime <datetime> dateTime from this time modified contact we will give
 *@param isWeb <int> isWeb is just a flaf for web 1 and for mobile 0
 * @discription : API to get messagebox contact list
 */
router.get('/', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    /**
     * validation goes here for each param
     * checking that datetime is in valid format or not
     * isweb is flag if its 1 then req comes from web and if 0 then its from mobile
     */

    var dateTime = moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    var momentObj = moment(dateTime,'YYYY-MM-DD').isValid();
    var groupId;
    var isWeb   = (req.query.isWeb ) ? (req.query.isWeb ) :0;
    if(req.query.dateTime){
        if(!momentObj){
            error.dateTime = 'Invalid date';
            validationFlag *= false;
        }
    }
    else{
        dateTime = null;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            /**
             * validating token for login user
             * */

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                    if ((!err) && tokenResult) {
                        var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(dateTime);
                        var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, contactResults) {
                            if (!err) {
                                //console.log(results);
                                /**
                                 *if results are there then check for condition that its web or not
                                 * */
                                if (contactResults && contactResults[0] && contactResults[0].length > 0) {
                                    var contactList  =[];
                                    /**
                                     *if request comes from web then call PGetUnreadMessageCountofGroup procedure
                                     * to get unread count of messages because mobile people will save this count in their local sqllite
                                     * */
                                    if (isWeb == 1) {
                                        var unreadCountqueryParams = req.db.escape(req.query.token);
                                        var unreadCountQuery = 'CALL PGetUnreadMessageCountofGroup(' + unreadCountqueryParams + ')';
                                        //console.log(unreadCountQuery);
                                        req.db.query(unreadCountQuery, function (err, countResults) {
                                            if (countResults && countResults[0] && countResults[0].length > 0) {
                                                for (var i = 0; i < contactResults[0].length; i++) {
                                                    /**
                                                     * assign all values of group id in a variable
                                                     * */
                                                    groupId = contactResults[0][i].groupId;
                                                    for (var j = 0; j < countResults[0].length; j++) {
                                                        /**
                                                         * compare both group id getting from both proc if equal then push unreadcount to first results
                                                         * only in web condition
                                                         * */
                                                        if (groupId == countResults[0][j].groupID) {
                                                            //console.log(countResults[0][j].groupID,"countResults[0][j].groupID");
                                                            contactResults[0][i].unreadCount = countResults[0][j].count;
                                                        }
                                                    }
                                                }
                                                //contactList.push(results[0]);
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Contact list loaded successfully';
                                                responseMessage.data = {
                                                    contactList:contactResults[0]
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                        });

                                    }
                                    else{
                                        /**
                                         * if req is not for web then simply give the result from first proc i.e contact list
                                         * */
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Contact list loaded successfully';
                                        responseMessage.data = {
                                            contactList:contactResults[0]
                                        };
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else{
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Contact list not available';
                                    responseMessage.data = {
                                        contactList:[]
                                    };
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Contact list not available';
                                responseMessage.data = {
                                    contactList:[]
                                };
                                res.status(200).json(responseMessage);
                            }
                        });
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});






/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id(here requester is member)
 *
 * @discription : API to change admin of group
 */
router.post('/compose_message', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var messageType = (req.body.messageType) ? parseInt(req.body.messageType) : 0;
    if(isNaN(messageType)){
        messageType = 0;
    }
    var priority  = (req.body.priority) ? parseInt(req.body.priority) : 1;
    if(isNaN(priority )){
        priority  = 1;
    }
    if (isNaN(parseInt(req.body.receiverGroupId))) {
        error.receiverGroupId = 'Invalid id of receiver Group id';
        validationFlag *= false;
    }
    var taskTargetDate = moment(req.body.taskTargetDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    if(req.body.taskTargetDate){
        if(!taskTargetDate){
            error.taskTargetDate = 'Invalid taskTargetDate';
            validationFlag *= false;
        }
    }
    else{
        taskTargetDate = null;
    }
    var taskExpiryDate = moment(req.body.taskExpiryDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    if(req.body.taskExpiryDate){
        if(!taskExpiryDate){
            error.taskExpiryDate = 'Invalid taskExpiryDate';
            validationFlag *= false;
        }
    }
    else{
        taskExpiryDate = null;
    }
    var explicitMemberGroupIdList = (req.body.explicitMemberGroupIdList) ? (req.body.explicitMemberGroupIdList) : '';
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var message;
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                    var autoJoinQueryParams = req.db.escape(req.body.token)+ ',' + req.db.escape(req.body.receiverGroupId);
                    var autoJoinQuery = 'CALL pautojoin_before_Composing(' + autoJoinQueryParams + ')';
                    console.log(autoJoinQuery);
                    req.db.query(autoJoinQuery, function (err, autoJoinResults) {
                        if (!err) {
                            if (messageType == 0) {
                                message = req.body.message;
                            }
                            else if (messageType == 2) {
                                var jsonDistanceObject = {
                                    latitude: req.body.latitude,
                                    longitude: req.body.longitude
                                }
                                var jsonDistanceObject = JSON.stringify(jsonDistanceObject);
                                message = jsonDistanceObject;
                                console.log(jsonDistanceObject);
                            }
                            else if (messageType == 3) {
                                var jsonAttachObject = {
                                    attachmentLink: req.body.attachmentLink,
                                    fileName: req.body.fileName,
                                    mimeType: req.body.mimeType
                                }
                                var jsonAttachObject = JSON.stringify(jsonAttachObject);
                                message = jsonAttachObject;
                                console.log(jsonAttachObject);
                            }
                            var procParams = req.db.escape(req.body.token) + ',' + req.db.escape(message)
                                + ',' + req.db.escape(messageType) + ',' + req.db.escape(priority) + ',' + req.db.escape(taskTargetDate)
                                + ',' + req.db.escape(taskExpiryDate) + ',' + req.db.escape(req.body.receiverGroupId)
                                + ',' + req.db.escape(explicitMemberGroupIdList);
                            var procQuery = 'CALL p_v1_ComposeMessage(' + procParams + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results && results[0] && results[0][0] && results[0][0].messageId) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message send successfully';
                                        responseMessage.data = results[0][0];
                                        res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in message sending';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.error = {
                                        server: 'Internal Server Error'
                                    };
                                    responseMessage.message = 'An error occurred !';
                                    res.status(500).json(responseMessage);
                                    console.log('Error : p_v1_ComposeMessage ', err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                                }
                            });
                        }
                        else{
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            responseMessage.message = 'An error occurred !';
                            res.status(500).json(responseMessage);
                            console.log('Error :', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_ComposeMessage : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});



router.post('/test', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                        console.log(req.files);
                        if (req.files) {
                            var deleteTempFile = function(){
                                fs.unlink('../bin/'+req.files.pr.path);
                                console.log("Image Path is deleted from server");
                            };
                            var readStream = fs.createReadStream(req.files.pr.path);
                            var resizedReadStream = gm(req.files['pr'].path).resize(100,100).autoOrient().quality(0).stream(req.files.pr.extension);
                            var uniqueFileName = uuid.v4() + ((req.files.pr.extension) ? ('.' + req.files.pr.extension) : 'jpg');
                            var tnUniqueFileName = "tn_" + uniqueFileName;
                            console.log(uniqueFileName);
                            uploadDocumentToCloud(uniqueFileName, readStream, function (err) {
                                if (!err) {
                                    deleteTempFile();
                                    uploadDocumentToCloud(tnUniqueFileName, resizedReadStream, function (err) {
                                        if (!err) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Image and thumbnail uploaded successfully';
                                            responseMessage.data = {
                                                pic: uniqueFileName,
                                                thumnail : tnUniqueFileName
                                            };
                                            deleteTempFile();
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in uploading thumbnail';
                                            responseMessage.data = null;
                                            deleteTempFile();
                                            res.status(500).json(responseMessage);
                                        }
                                    });
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in uploading image';
                                    responseMessage.data = null;
                                    deleteTempFile();
                                    res.status(500).json(responseMessage);
                                }
                            });
                        }
                        else{
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Invalid input data';
                            responseMessage.data = null;
                            res.status(500).json(responseMessage);
                        }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : messageSaveImg ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error messageSaveImg :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});
module.exports = router;


