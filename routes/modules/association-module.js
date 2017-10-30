/**
 *  @author Anjali Pandya
 *  @since March 10,2016  11:26AM
 *  @title Association module
 *  @description Association  functions
 */
"use strict";

var validator = require('validator');
var gm = require('gm').subClass({ imageMagick: true });
var uuid = require('node-uuid');
var gcloud = require('gcloud');
var fs = require('fs');
var path = require('path');
var util = require( "util" );
var Notification = require('./notification/notification-master.js');
var notification = null;
var request = require('request');
var stream = require( "stream" );
var chalk = require( "chalk" );

var st = null;
function Association(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
    }
};


var appConfig = require('../../ezeone-config.json');

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
    console.log("entered to cloud");
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    console.log("Uploaded");

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
        console.log("err",err);
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
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get leave type list
 * @accepts json
 * @param token <string> token of login user
 * @param service_mid <int> service master id
 * @param pg_no <int> page number
 * @param limit <int> limit
 * @param status <int> status (in case of admin)
 *
 * note : registration
 *
 */
Association.prototype.associGetEventDtl = function(req,res,next){
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
    if (isNaN(parseInt(req.query.service_mid))){
        error.service_mid = 'Invalid service master id';
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
            req.query.pg_no = (req.query.pg_no) ? req.query.pg_no : 1;
            req.query.limit = (req.query.limit) ? req.query.limit : 10;
            req.query.status = (req.query.status) ? req.query.status : null;
            req.query.searchKeyword = (req.query.searchKeyword) ? req.query.searchKeyword : '';
            req.query.type =(req.query.type) ? req.query.type : '2,5,6'

            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.service_mid)
                            + ',' + st.db.escape(req.query.pg_no)+ ',' + st.db.escape(req.query.limit)
                            + ',' + st.db.escape(req.query.status) + ',' + st.db.escape(req.query.searchKeyword)+ ',' + st.db.escape(req.query.type);
                        var procQuery = 'CALL pGetAlumni_eventdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        console.log("---------------------------------------");
                                        console.log(results);
                                        console.log("---------------------------------------");
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Association details loaded successfully';
                                            responseMessage.data = {
                                                userDetails : results[0],
                                                eventDetails : results[1],
                                                totalCount : results[2][0].tc,
                                                memberList : (results[3][0]) ? results[3] : []
                                            }
                                            res.status(200).json(responseMessage);

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Association details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Association details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Association details are not available';
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
                                console.log('Error : pGetAlumni_eventdetails ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('associGetEventDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associGetEventDtl ',err);
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
            console.log('Error associGetEventDtl     :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save association-ap comments and opinion poll
 * @accepts json
 * @param ten_id <int> id of a ten master (event, opinion poll etc.)
 * @param comments <string> comments from user
 * @param token <string> token of login user
 * @param poll_opt_id <int> opinion poll option id
 */
Association.prototype.associSaveComments = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.ten_id)) || (req.body.ten_id) < 0 ) {
        error.ten_id = 'Invalid event id';
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
            req.body.poll_opt_id = (req.body.poll_opt_id) ? req.body.poll_opt_id : 0;
            req.body.comments = (req.body.comments) ? req.body.comments : '';
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.ten_id)+ ',' + st.db.escape(req.body.comments)
                            + ',' + st.db.escape(req.body.token)+ ',' + st.db.escape(req.body.poll_opt_id);
                        var procQuery = 'CALL pSave_comments(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0]._i) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Comment added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0]._i
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding comment';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding comment';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding comment';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding comment';
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
                                console.log('Error : pSave_comments ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('associSaveComments: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associSaveComments ', err);
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
            console.log('Error associSaveComments :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get services
 */
Association.prototype.getAsscociationServices = function(req,res,next){

    var token = req.query.token;
    var masterId = parseInt(req.query.master_id);
    var status = req.query.s;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true, error = {};
    if(!token){
        error['token'] = 'token is mandatory';
        validateStatus *= false;
    }
    if(!(status)){
        error['status'] = 'status is invalid';
        validateStatus *= false;
    }
    if(isNaN(masterId)){
        error['master_id'] = 'master_id is a integer value';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            req.query.pageNo = (req.query.pageNo) ? req.query.pageNo : 1;
            req.query.limit = (req.query.limit) ? req.query.limit : 100;
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        /**
                         * pagination added
                         * @type {string}
                         */
                        var queryParams =   st.db.escape(masterId) + ',' + st.db.escape(token)+ ',' + st.db.escape(status)
                            +',' + st.db.escape(req.query.pageNo)+ ',' + st.db.escape(req.query.limit);
                        var query = 'CALL get_service_list(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    console.log(serviceResult);
                                    if(serviceResult[0]){
                                        if(serviceResult[1]){
                                            responseMessage.data1 = serviceResult[0];
                                            responseMessage.count = serviceResult[1][0].count;
                                        }
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'services loaded successfully';
                                        var output =[];
                                        for( var i=0; i < serviceResult[0].length;i++){
                                            var result = {};
                                            result.tid = serviceResult[0][i].tid;
                                            result.ref_no = serviceResult[0][i].ref_no;
                                            result.servicetype = serviceResult[0][i].servicetype;
                                            result.ezeoneid = serviceResult[0][i].ezeoneid;
                                            result.cat_title = serviceResult[0][i].cat_title;
                                            result.name = serviceResult[0][i].name;
                                            result.date = serviceResult[0][i].date;
                                            result.LUDate = serviceResult[0][i].LUDate;
                                            result.message = serviceResult[0][i].message;
                                            result.earned_points = serviceResult[0][i].earned_points;
                                            result.isattachment = serviceResult[0][i].isattachment;
                                            result.isvideo = serviceResult[0][i].isvideo;
                                            result.ae = (serviceResult[0][i].ae) ? serviceResult[0][i].ae : '' ;
                                            result.an = (serviceResult[0][i].an)? serviceResult[0][i].an : '';
                                            result.totalPoints = (serviceResult[0][i].total_points)? serviceResult[0][i].total_points : 0;
                                            var picArray =[];
                                            result.picCount = 0;
                                            if(serviceResult[0][i].picture){
                                                var picArrayNew= serviceResult[0][i].picture;
                                                picArray = picArrayNew.split(',');
                                                result.picCount = (picArray.length) ? picArray.length : 0;
                                                /**
                                                 * to add full image url with comma saprated images
                                                 */
                                                var imgArray = [];
                                                if(picArray.length <= 3){
                                                    for (var j = 0; j < picArray.length; j++) {
                                                        var attachment = (picArray[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + picArray[j] : '';
                                                        imgArray.push(attachment);
                                                    }
                                                }
                                                else {
                                                    for (var j = 0; j < 3; j++) {
                                                        var attachment = (picArray[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + picArray[j] : '';
                                                        imgArray.push(attachment);
                                                    }
                                                }
                                                //console.log("imgArray : "+imgArray);
                                                result.pic = imgArray.join();
                                                //console.log(result.pic,"result.pic");
                                            }
                                            else{
                                                result.pic = null;
                                            }
                                            var b =[];
                                            var a = serviceResult[0][i].replay;
                                            b = (a) ? a.split('^') : [];
                                            var c =[];
                                            var d = serviceResult[0][i].cd;
                                            c = (d) ? d.split('^') : [];
                                            var statusArray =[];
                                            var statusArrayNew = serviceResult[0][i].status;
                                            statusArray = (statusArrayNew) ? statusArrayNew.split('^') : [];

                                            var replyArray =[];
                                            if(serviceResult[0][i].replyname){
                                                var replyArraynew = serviceResult[0][i].replyname;
                                                replyArray = (replyArraynew) ? replyArraynew.split('^') : [];
                                            }
                                            else{
                                                replyArray = [];
                                            }
                                            var companyArray =[];
                                            if(serviceResult[0][i].companyname) {
                                                var companyArraynew = serviceResult[0][i].companyname;
                                                companyArray = companyArraynew.split('^');
                                            }
                                            else{
                                                companyArray = [];
                                            }

                                            var statusArray =[];
                                            if(serviceResult[0][i].status) {
                                                var statusArrayArraynew = serviceResult[0][i].status;
                                                statusArray = statusArrayArraynew.split('^');
                                            }
                                            else{
                                                companyArray = [];
                                            }

                                            var replayObject = [];
                                            for(var j = 0; j< b.length;j++){
                                                var robject = {};
                                                robject.replaytext = b[j];
                                                robject.cu = c[j];
                                                if(companyArray[j]){
                                                    robject.companyName = companyArray[j];
                                                }
                                                else{
                                                    robject.companyName = '';
                                                }
                                                if(replyArray[j]){
                                                    robject.Uname = replyArray[j];
                                                }
                                                else{
                                                    robject.Uname = '';
                                                }
                                                if(statusArray[j]){
                                                    robject.status =  statusArray[j];
                                                }
                                                else{
                                                    robject.status = '0';
                                                }

                                                replayObject[j]= robject;

                                            }
                                            result.replayObject = replayObject;
                                            output.push(result);
                                        }
                                        responseMessage.data1 = output;
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServices: services loaded successfully');

                                    }
                                    else {
                                        responseMessage.message = 'services not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServices:services not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'services not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServices:services not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServices: error in getting services:' + err);
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
                        console.log('FnGetServices: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServices:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServices ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save association-ap services
 * @accepts json
 * @param token <string> token of login user
 * @param service_mid <int> service_mid is service master id
 * @param message <string> message
 * @param cid <int> category id
 * @param image_path <string> image_path comma saprated strings of image
 */
Association.prototype.saveAssociationServices = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.message) {
        error.message = 'Message can not be null';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.service_mid)) || (req.body.service_mid) < 0 ) {
        error.service_mid = 'Invalid service master id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.cid)) || (req.body.cid) < 0 ) {
        error.cid = 'Invalid category id';
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
            //req.body.reply = (req.body.reply) ? req.body.reply : '';
            //req.body.status = (req.body.status) ? req.body.status : 1;
            //req.body.ep = (req.body.ep) ? req.body.ep : 0;
            //req.body.rp = (req.body.rp) ? req.body.rp : 0;
            //req.body.service_id = (req.body.service_id) ? req.body.service_id : 0;
            req.body.image_path = (req.body.image_path) ? req.body.image_path : '';
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.service_mid)
                            + ',' + st.db.escape(req.body.message)+ ',' + st.db.escape(req.body.cid);
                        var procQuery = 'CALL post_community_service(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0]._i) {
                                                var outputArray = [];
                                                if(req.body.image_path){
                                                    var imgPath = req.body.image_path.split(',');
                                                    var combQuery = '';
                                                    /**
                                                     * preparing query to insert multiple image path
                                                     */
                                                    for (var i = 0; i < imgPath.length; i++ ){
                                                        var imgQueryParams = st.db.escape(results[0][0]._i) + ',' + st.db.escape(imgPath[i])+ ',' + st.db.escape(req.body.tid);
                                                        combQuery +=  ('CALL post_community_service_picture(' + imgQueryParams + ');');
                                                    }
                                                    console.log(combQuery);
                                                    st.db.query(combQuery, function (err, attachmentResult) {
                                                        if (!err) {
                                                            if (attachmentResult) {
                                                                console.log(attachmentResult);
                                                                if (attachmentResult[0]){
                                                                    if (attachmentResult[0].length > 0){
                                                                        for(var i=0; i < attachmentResult.length/2; i++){
                                                                            var result = {};
                                                                            result.tid = attachmentResult[i*2][0].tid;
                                                                            result.pic = attachmentResult[i*2][0].pic;
                                                                            outputArray.push(result);
                                                                        }
                                                                        console.log("output",outputArray);
                                                                        responseMessage.status = true;
                                                                        responseMessage.error = null;
                                                                        responseMessage.message = 'Service posted successfully';
                                                                        responseMessage.data = {
                                                                            id : results[0][0]._i,
                                                                            imageData : outputArray
                                                                        };
                                                                        res.status(200).json(responseMessage);
                                                                        console.log("output",outputArray);
                                                                        console.log('attachment file saved');

                                                                    }
                                                                    else {
                                                                        console.log('attachment file not save');
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('attachment file not save');
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                                res.status(200).json(responseMessage);
                                                            }
                                                        }
                                                        else {
                                                            console.log('attachment file not save');
                                                            console.log(err);
                                                            res.status(200).json(responseMessage);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log("output",outputArray);
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Service posted successfully';
                                                    responseMessage.data = {
                                                        id : results[0][0]._i,
                                                        imageData : outputArray
                                                    };
                                                    res.status(200).json(responseMessage);
                                                }
                                                var notiQueryParams = st.db.escape(req.body.service_mid) + ',' + st.db.escape(req.body.token)
                                                    + ',' + st.db.escape(req.body.cid)+ ',' + st.db.escape(results[0][0]._i);
                                                var notiQuery = 'CALL get_admin_notif_details(' + notiQueryParams + ')';
                                                console.log("notiQuery",notiQuery);
                                                st.db.query(notiQuery, function (err, notiResult) {
                                                    if (!err) {
                                                        if (notiResult) {
                                                            console.log(notiResult);
                                                            if (notiResult[0]){
                                                               if (notiResult[0].length > 0){
                                                                   if (notiResult[4]){
                                                                       var fn = notiResult[3][0].fn ? notiResult[3][0].fn : notiResult[3][0].s_title;
                                                                       for (var i = 0; i < notiResult[0].length; i++ ){
                                                                           var receiverId = notiResult[0][i].gid;
                                                                           var senderTitle = notiResult[3][0].s_title;
                                                                           var groupTitle = notiResult[0][i].g_title;
                                                                           var groupId = notiResult[0][i].gid;
                                                                           var messageText ='New support request from ' + fn + '.';
                                                                           var data = {
                                                                               ten_id : results[0][0]._i,
                                                                               sm_id : req.body.service_mid,
                                                                               tid : notiResult[1][0].tid,
                                                                               ref_no : notiResult[1][0].ref_no,
                                                                               ezeoneid : notiResult[1][0].ezeoneid,
                                                                               cat_title : notiResult[1][0].cat_title,
                                                                               name : notiResult[1][0].name,
                                                                               date : notiResult[1][0].date,
                                                                               LUDate : notiResult[1][0].LUDate,
                                                                               message : notiResult[1][0].message,
                                                                               isimage : notiResult[1][0].isimage,
                                                                               isattachment : notiResult[1][0].isattachment,
                                                                               isvideo : notiResult[1][0].isvideo,
                                                                               ae : notiResult[1][0].ae,
                                                                               an : notiResult[1][0].an,
                                                                               replayObject : notiResult[2],
                                                                               communityEzeId : notiResult[1][0].communtyEzeId,
                                                                               ha : 1,
                                                                               totalPoints : notiResult[1][0].total_points,
                                                                               por : notiResult[1][0].por
                                                                           };
                                                                           var messageId = 0;
                                                                           var masterId = 0;
                                                                           var latitude = '';
                                                                           var longitude = '';
                                                                           var priority = '';
                                                                           var dateTime = '';
                                                                           var a_name = '';
                                                                           var msgUserid = '';
                                                                           var jobId = 0;
                                                                           var aUrl = '';
                                                                           var txId = 0;
                                                                           var issos = false;
                                                                           /**
                                                                            * messageType 18 is for helpdesk request to admin
                                                                            */
                                                                           var messageType = 18;
                                                                           var operationType = 0;
                                                                           var iphoneId = (notiResult[0][i].iphoneId)? notiResult[0][i].iphoneId : null;
                                                                           console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                               operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                                           notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                               operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,tokenResult[0].isWhatMate);
                                                                           console.log("Notification Send");
                                                                       }
                                                                   }
                                                               }
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in posting service';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in posting service';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in posting service';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in posting service';
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
                                console.log('Error : post_community_service ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('saveAssociationServices: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : saveAssociationServices ', err);
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
            console.log('Error saveAssociationServices :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : PUT
 * @param req
 * @param res
 * @param next
 * @description update association-ap services
 * @accepts json
 * @param token <string> token of login user
 * @param service_id <int> service_id is id of service if updating
 * @param ep <string> earned points
 * @param rp <string> redeem points
 * @param reply <int> reply from admin
 * @param status <int> status (1-submitted,2-closed)
 * @param service_mid <int> service_mid is service master id
 * @param image_details <array> image_details array of image object (tid and pic)
 *
 */
Association.prototype.updateAssociationServices = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    if(req.is('json')){
        var validationFlag = true;
        var error = {};
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        if (!req.body.reply) {
            error.reply = 'Reply can not be null';
            validationFlag *= false;
        }
        if (isNaN(parseInt(req.body.service_mid)) || (req.body.service_mid) < 0 ) {
            error.service_mid = 'Invalid service master id';
            validationFlag *= false;
        }
        if (isNaN(parseInt(req.body.service_id)) || (req.body.service_id) < 0 ) {
            error.service_mid = 'Invalid service id';
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
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.ep = (req.body.ep) ? req.body.ep : 0;
                req.body.rp = (req.body.rp) ? req.body.rp : 0;
                var imgObject = (req.body.image_details) ? req.body.image_details : '';
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.service_id)
                                + ',' + st.db.escape(req.body.ep)+ ',' + st.db.escape(req.body.rp)+ ',' + st.db.escape(req.body.reply)
                                + ',' + st.db.escape(req.body.status)+ ',' + st.db.escape(req.body.service_mid);
                            var procQuery = 'CALL update_community_service(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].tid) {
                                                    var outputArray = [];
                                                    console.log("imgObject.length", imgObject.length);
                                                    if (imgObject.length > 0){
                                                        var combQuery = '';
                                                        /**
                                                         * preparing query to update multiple image path
                                                         */
                                                        var imgArray = [];
                                                        var tidArray = [];
                                                        for (var j = 0; j < imgObject.length; j++){
                                                            tidArray.push(imgObject[j].tid);
                                                            imgArray.push(imgObject[j].pic)
                                                        }
                                                        for (var i = 0; i < tidArray.length; i++ ){
                                                            var imgQueryParams = st.db.escape(results[0][0].tid) + ',' + st.db.escape(imgArray[i])+ ',' + st.db.escape(tidArray[i]);
                                                            combQuery +=  ('CALL post_community_service_picture(' + imgQueryParams + ');');
                                                        }
                                                        console.log(combQuery);
                                                        st.db.query(combQuery, function (err, attachmentResult) {
                                                            if (!err) {
                                                                if (attachmentResult) {
                                                                    console.log(attachmentResult);
                                                                    if (attachmentResult[0]){
                                                                        if (attachmentResult[0].length > 0){
                                                                            for(var i=0; i < attachmentResult.length/2; i++){
                                                                                var result = {};
                                                                                result.tid = attachmentResult[i*2][0].tid;
                                                                                result.pic = attachmentResult[i*2][0].pic;
                                                                                outputArray.push(result);
                                                                            }
                                                                            responseMessage.status = true;
                                                                            responseMessage.error = null;
                                                                            responseMessage.message = 'Service updated successfully';
                                                                            responseMessage.data = {
                                                                                id : results[0][0].tid,
                                                                                imageData : outputArray
                                                                            };
                                                                            console.log('attachment file saved');
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                        else {
                                                                            console.log('attachment file not save');
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('attachment file not save');
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('attachment file not save');
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                                console.log(err);
                                                                res.status(200).json(responseMessage);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Service updated successfully';
                                                        responseMessage.data = {
                                                            id : results[0][0].tid,
                                                            imageData : outputArray
                                                        };
                                                        res.status(200).json(responseMessage);
                                                    }
                                                    var notiQueryParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.service_mid)
                                                        + ',' + st.db.escape(req.body.service_id);
                                                    var notiQuery = 'CALL get_service_notify_details(' + notiQueryParams + ')';
                                                    console.log("notiQuery",notiQuery);
                                                    st.db.query(notiQuery, function (err, notiResult) {
                                                        if (!err) {
                                                            if (notiResult) {
                                                                console.log(notiResult);
                                                                if (notiResult[0]){
                                                                    if (notiResult[0].length > 0){
                                                                        if (notiResult[4]){
                                                                            for (var i = 0; i < notiResult[0].length; i++ ){
                                                                                var receiverId = notiResult[0][i].gid;
                                                                                var senderTitle = notiResult[3][0].s_title;
                                                                                var groupTitle = notiResult[0][i].g_title;
                                                                                var groupId = notiResult[0][i].gid;
                                                                                var messageText = 'Response received from Helpdesk';
                                                                                var data = {
                                                                                    ten_id : req.body.service_id,
                                                                                    sm_id : req.body.service_mid,
                                                                                    tid : notiResult[1][0].tid,
                                                                                    ref_no : notiResult[1][0].ref_no,
                                                                                    ezeoneid : notiResult[1][0].ezeoneid,
                                                                                    cat_title : notiResult[1][0].cat_title,
                                                                                    name : notiResult[1][0].name,
                                                                                    date : notiResult[1][0].date,
                                                                                    LUDate : notiResult[1][0].LUDate,
                                                                                    message : notiResult[1][0].message,
                                                                                    isimage : notiResult[1][0].isimage,
                                                                                    isattachment : notiResult[1][0].isattachment,
                                                                                    isvideo : notiResult[1][0].isvideo,
                                                                                    ae : notiResult[1][0].ae,
                                                                                    an : notiResult[1][0].an,
                                                                                    replayObject : notiResult[2],
                                                                                    communtyEzeId : notiResult[1][0].communtyEzeId,
                                                                                    ha : notiResult[0][i].ha,
                                                                                    totalPoints : notiResult[1][0].total_points,
                                                                                    por : notiResult[1][0].por
                                                                                };
                                                                                console.log(data);
                                                                                var messageId = 0;
                                                                                var masterId = 0;
                                                                                var latitude = '';
                                                                                var longitude = '';
                                                                                var priority = '';
                                                                                var dateTime = '';
                                                                                var a_name = '';
                                                                                var msgUserid = '';
                                                                                var jobId = 0;
                                                                                var aUrl = '';
                                                                                var txId = 0;
                                                                                var issos = false;
                                                                                /**
                                                                                 * messageType 19 is helpdesk admin response to user
                                                                                 */
                                                                                var messageType = 19;
                                                                                var operationType = 0;
                                                                                var iphoneId = (notiResult[0][i].iphoneId)? notiResult[0][i].iphoneId : null;
                                                                                console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                                                notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,tokenResult[0].isWhatMate);
                                                                                console.log("Notification Send");
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in updating service';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in updating service';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in updating service';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in updating service';
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
                                    console.log('Error : post_community_service ', err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                            console.log('saveAssociationServices: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : saveAssociationServices ', err);
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
                console.log('Error saveAssociationServices :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get all images of service
 * @accepts json
 * @param token <string> token of login user
 * @param service_id <int> service id
 *
 */
Association.prototype.associationGetServiceImg = function(req,res,next){
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
    if (isNaN(parseInt(req.query.service_id))){
        error.service_id = 'Invalid service id';
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.service_id) ;
                        var procQuery = 'CALL get_service_picture(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Image name loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Images are not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Images are not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Images are not available';
                                    responseMessage.data = [];
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : associationGetServiceImg ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('get_service_picture: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associationGetServiceImg ',err);
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
            console.log('Error aassociationGetServiceImg  :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get all images of service
 * @accepts json
 * @param token <string> token of login user
 * @param service_mid <int> service id
 * @param ten_id <int> ten_id of (event,postor or opinion id)
 * @param flag <int> (1-previous and 2 for next)
 *
 */
Association.prototype.associationGetEventInfo = function(req,res,next){
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
    if (isNaN(parseInt(req.query.service_mid))){
        error.service_id = 'Invalid service id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.ten_id))){
        error.ten_id = 'Invalid service id';
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
            req.query.flag = (req.query.flag) ? req.query.flag : 0;
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        // req.query.type =(req.query.type) ? req.query.type : '2,5,6'

                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.service_mid)
                            + ',' + st.db.escape(req.query.ten_id) + ',' + st.db.escape(req.query.flag);
                        var procQuery = 'CALL get_event_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        if (results[0].length > 0) {
                                            var output = [];
                                            var imgArray = [];
                                            var idArray = [];
                                            if (results[0][0].attach){
                                                imgArray = results[0][0].attach.split(',');
                                                idArray = results[0][0].attachid.split(',');
                                            }
                                             var opnion_poll_result ='';
                                            if (results[2][0]){
                                                opnion_poll_result = results[2][0];
                                            }
                                            for (var i = 0; i < idArray.length; i++ ){
                                                var imjObject = {};
                                                    imjObject.pic=imgArray[i],
                                                    imjObject.tid = idArray[i]
                                                output.push(imjObject);
                                            }
                                            var tenData = {
                                                type : results[0][0].type,
                                                like_st : results[0][0].like_st,
                                                countattch : results[0][0].countattch,
                                                tenid : results[0][0].tenid,
                                                title : results[0][0].title,
                                                startdate : results[0][0].startdate,
                                                enddate : results[0][0].enddate,
                                                comments : results[0][0].comments,
                                                likes : results[0][0].likes,
                                                id : results[0][0].id,
                                                tn_attach : results[0][0].tn_attach,
                                                posted_by : results[0][0].posted_by,
                                                description : results[0][0].description,
                                                status : results[0][0].status
                                            };
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Ten details loaded successfully';
                                            responseMessage.data = {
                                                tenDetails : tenData,
                                                comments : results[1],
                                                opinion_poll : opnion_poll_result,
                                                imageDetails : output
                                            };
                                            res.status(200).json(responseMessage);

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Ten details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Ten details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Ten details are not available';
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
                                console.log('Error : associationGetServiceImg ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('get_service_picture: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associationGetServiceImg ',err);
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
            console.log('Error aassociationGetServiceImg  :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description Save HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param pr <string> image file (multipart)
 */
Association.prototype.imageUploadWithThumbnail = function(req,res,next){
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        console.log(req.files);
                        if (req.files) {
                            var deleteTempFile = function(){
                                try{
                                    if (fs.exists('../bin/'+req.files.pr.path)){
                                        fs.unlink('../bin/'+req.files.pr.path);
                                        console.log("Image Path is deleted from server");
                                    }
                                    else {
                                        console.log("image not found");
                                    }
                                }
                                catch(ex){
                                    console.log(ex);
                                }
                            };

                            var readStream = fs.createReadStream(req.files.pr.path);
                            var resizedReadStream = gm(req.files['pr'].path).resize(100,100).autoOrient().quality(0).stream(req.files.pr.extension);
                            var uniqueFileName = uuid.v4() + ((req.files.pr.extension) ? ('.' + req.files.pr.extension) : 'jpg');
                            var tnUniqueFileName = "tn_" + uniqueFileName;
                            console.log(uniqueFileName);
                            uploadDocumentToCloud(uniqueFileName, readStream, function (err) {
                                if (!err) {
                                    console.log("before delete");
                                    deleteTempFile();
                                    console.log("Afeter delete");
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
                                            console.log("err1",err);
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in uploading thumbnail';
                                            responseMessage.data = null;
                                            deleteTempFile();
                                            res.status(500).json(responseMessage);
                                        }
                                    });
                                }
                                else  {
                                    console.log("err",err);
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
                            console.log("Invalid input data");
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Invalid input data';
                            responseMessage.data = null;
                            res.status(500).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('hrisSaveHRMimg: Invalid token');
                    }
                }
                else {
                    console.log("An error occurred ");
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRMimg ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            console.log("ex",ex);
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error hrisSaveHRMimg :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save ten master details
 * @accepts json
 * @param token <string> token of login user
 * @param ten_id <int> ten_id (insert 0, update ten id)
 * @param title <string> title
 * @param description <int> description
 * @param startDate <int> startDate
 * @param endDate <string> endDate
 * @param regLastDate <string> regLastDate
 * @param status <string> status (1(pending),2=closed,3=on-hold,4=canceled)
 * @param type <string> type (1-training, 2-event, 3-news,4-knowledge,5-opinion-poll)
 * @param note <string> note
 * @param venueId <string> venueId
 * @param code <string> code
 * @param capacity <string> capacity
 * @param image_details <json> image_details array of image object (tid and pic)
 */
Association.prototype.saveAssociationTenMaster = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(req.is('json')){
        if (!req.body.token) {
            error['token'] = 'Invalid token';
            validationFlag *= false;
        }
        if (!req.body.type) {
            error['type'] = 'Invalid type';
            validationFlag *= false;
        }
        if (!req.body.title) {
            error['title'] = 'Invalid title';
            validationFlag *= false;
        }


        // if (!req.body.startDate) {
        //     error['s_date'] = 'Start date can not be empty';
        //     validationFlag *= false;
        // }
        if (!req.body.code) {
            error['code'] = 'Invalid code';
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
                var tenType = ['poster','event','poster','poster','opinion-poll','poster','message','job'];
                req.body.ten_id = (req.body.ten_id) ? req.body.ten_id : 0;      // while saving time 0 else id of user
                req.body.e_date = (req.body.e_date) ? (req.body.e_date) : null;
                req.body.reg_lastdate = (req.body.reg_lastdate) ? (req.body.reg_lastdate) : null;
                req.body.code = (req.body.code) ? req.st.alterEzeoneId(req.body.code) : '';
                req.body.venueId = (req.body.venueId) ? req.body.venueId : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.note = (req.body.note) ? req.body.note : '';
                req.body.description = (req.body.description) ? req.body.description : '';
                req.body.capacity = (req.body.capacity) ? (req.body.capacity) : 0;
                req.body.startDate = (req.body.startDate) ? (req.body.startDate) : null;

                console.log("req.body.image_details",req.body.image_details);
                var imgObject = (req.body.image_details) ? req.body.image_details : '';
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = st.db.escape(req.body.ten_id) + ',' + st.db.escape(req.body.title)
                                + ',' + st.db.escape(req.body.description) + ',' + st.db.escape(req.body.startDate)
                                + ',' + st.db.escape(req.body.endDate) + ',' + st.db.escape(req.body.status)
                                + ',' + st.db.escape(req.body.regLastDate) + ',' + st.db.escape(req.body.type)
                                + ',' + st.db.escape(req.body.token) + ',' + st.db.escape(req.body.note)
                                + ',' + st.db.escape(req.body.venueId) + ',' + st.db.escape(req.body.code)
                                + ',' + st.db.escape(req.body.capacity);
                            var procQuery = 'CALL pSaveTENMaster(' + queryParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    var outputArray = [];
                                                    console.log("imgObject.length", imgObject.length);
                                                    if (imgObject.length > 0){
                                                        var combQuery = '';
                                                        /**
                                                         * preparing query to update multiple image path
                                                         */
                                                        var imgArray = [];
                                                        var tidArray = [];
                                                        for (var j = 0; j < imgObject.length; j++){
                                                                tidArray.push(imgObject[j].tid);
                                                                imgArray.push(imgObject[j].pic);
                                                        }
                                                        for (var i = 0; i < tidArray.length; i++ ){
                                                            var fileType = imgArray[i].split('.');
                                                            var imgQueryParams = st.db.escape(tidArray[i]) + ',' + st.db.escape(results[0][0].id)
                                                                + ',' + st.db.escape(imgArray[i]) + ',' + st.db.escape(fileType[fileType.length - 1]);
                                                            combQuery +=  ('CALL save_ten_master_attach(' + imgQueryParams + ');');
                                                        }
                                                        console.log(combQuery);
                                                        st.db.query(combQuery, function (err, attachmentResult) {
                                                            if (!err) {
                                                                if (attachmentResult) {
                                                                    console.log(attachmentResult);
                                                                    if (attachmentResult[0]){
                                                                        if (attachmentResult[0].length > 0){
                                                                            for(var i=0; i < attachmentResult.length/2; i++){
                                                                                var result = {};
                                                                                result.tid = attachmentResult[i*2][0].tid;
                                                                                result.pic = attachmentResult[i*2][0].aurl;
                                                                                result.tn_pic = attachmentResult[i*2][0].tn_aurl;
                                                                                outputArray.push(result);
                                                                            }
                                                                            console.log("output",outputArray);
                                                                            responseMessage.status = true;
                                                                            responseMessage.error = null;
                                                                            responseMessage.message = 'Ten Master posted successfully';
                                                                            responseMessage.data = {
                                                                                id : results[0][0].id,
                                                                                imageData : outputArray
                                                                            };
                                                                            res.status(200).json(responseMessage);
                                                                            console.log("output",outputArray);
                                                                            console.log('attachment file saved');

                                                                        }
                                                                        else {
                                                                            console.log('attachment file not save');
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('attachment file not save');
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('attachment file not save');
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                                console.log(err);
                                                                res.status(200).json(responseMessage);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Service posted successfully';
                                                        responseMessage.data = {
                                                            id : results[0][0].id,
                                                            imageData : outputArray
                                                        };
                                                        res.status(200).json(responseMessage);
                                                    }
                                                    var notiQueryParams = st.db.escape(req.body.code) + ',' + st.db.escape(req.body.token);
                                                    var notiQuery = 'CALL get_admin_ten_notify(' + notiQueryParams + ')';
                                                    console.log("notiQuery",notiQuery);
                                                    st.db.query(notiQuery, function (err, notiResult) {
                                                        if (!err) {
                                                            if (notiResult) {
                                                                console.log(notiResult);
                                                                if (notiResult[0]){
                                                                    if (notiResult[0].length > 0){
                                                                        if (notiResult[3]){
                                                                            var fn = notiResult[1][0].fn ? notiResult[1][0].fn : notiResult[1][0].s_title;
                                                                            for (var i = 0; i < notiResult[0].length; i++ ){
                                                                                var receiverId = notiResult[0][i].gid;
                                                                                var senderTitle = notiResult[1][0].s_title;
                                                                                var groupTitle = notiResult[0][i].g_title;
                                                                                var groupId = notiResult[0][i].gid;
                                                                                var messageText = 'New '+ tenType[(req.body.type) - 1]+ ' from ' + fn +' for Approval.';
                                                                                var data = {
                                                                                    ten_id : results[0][0].id,
                                                                                    sm_id : notiResult[2][0].sm_id,
                                                                                    communityEzeId : req.body.code,
                                                                                    pa : notiResult[0][i].pa
                                                                                };
                                                                                var messageId = 0;
                                                                                var masterId = 0;
                                                                                var latitude = '';
                                                                                var longitude = '';
                                                                                var priority = '';
                                                                                var dateTime = '';
                                                                                var a_name = '';
                                                                                var msgUserid = '';
                                                                                var jobId = 0;
                                                                                var aUrl = '';
                                                                                var txId = 0;
                                                                                var issos = false;
                                                                                /**
                                                                                 * messageType 20 is event/poster/poll/ posted after approval of admin
                                                                                 */
                                                                                var messageType = 20;
                                                                                var operationType = 0;
                                                                                var iphoneId = (notiResult[0][i].iphoneId)? notiResult[0][i].iphoneId : null;
                                                                                console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                                                notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,tokenResult[0].isWhatMate);
                                                                                console.log("Notification Send");
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in posting service';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in posting service';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in posting service';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in posting service';
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
                                    console.log('Error : post_community_service ', err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                            console.log('saveAssociationServices: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : saveAssociationServices ', err);
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
                console.log('Error saveAssociationServices :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description save ten master details
 * @accepts json
 * @param token <string> token of login user
 * @param ten_id <int> ten_id (insert 0, update ten id)
 * @param title <string> title
 * @param description <int> description
 * @param startDate <int> startDate
 * @param endDate <string> endDate
 * @param regLastDate <string> regLastDate
 * @param status <string> status (1(pending),2=closed,3=on-hold,4=canceled)
 * @param type <string> type (1-training, 2-event, 3-news,4-knowledge,5-opinion-poll)
 * @param note <string> note
 * @param venueId <string> venueId
 * @param code <string> code
 * @param capacity <string> capacity
 * @param image_details <json> image_details array of image object (tid and pic)
 * @param option_details <array> option_details array of opinion poll option (tid and option)
 */
Association.prototype.saveAssociationOpinionPoll = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var outputArray = [];
    var outputArray1 = [];
    var result = {};
    var result1 = {};
    var validationFlag = true;
    var error = {};
    if(req.is('json')){
        if (!req.body.token) {
            error['token'] = 'Invalid token';
            validationFlag *= false;
        }
        if (!req.body.type) {
            error['type'] = 'Invalid type';
            validationFlag *= false;
        }
        if (!req.body.code) {
            error['code'] = 'Invalid code';
            validationFlag *= false;
        }
        if (!req.body.regLastDate) {
            error['reg_lastdate'] = 'Registration last date can not be empty';
            validationFlag *= false;
        }
        if (!req.body.title) {
            error['title'] = 'Invalid code';
            validationFlag *= false;
        }
        //if (!req.body.option_details){
        //    error['option_details'] = 'Option can not be null';
        //    validationFlag *= false;
        //}
        if (!validationFlag) {
            responseMessage.error = error;
            responseMessage.message = 'Please check the errors';
            res.status(400).json(responseMessage);
            console.log(responseMessage);
        }
        else {
            try {
                req.body.ten_id = (req.body.ten_id) ? req.body.ten_id : 0;      // while saving time 0 else id of user
                req.body.s_date = (req.body.s_date) ? (req.body.s_date) : null;
                req.body.e_date = (req.body.e_date) ? (req.body.e_date) : null;
                req.body.reg_lastdate = (req.body.reg_lastdate) ? (req.body.reg_lastdate) : null;
                req.body.code = (req.body.code) ? req.st.alterEzeoneId(req.body.code) : '';
                req.body.venueId = (req.body.venueId) ? req.body.venueId : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.note = (req.body.note) ? req.body.note : '';
                req.body.description = (req.body.description) ? req.body.description : '';
                req.body.capacity = (req.body.capacity) ? (req.body.capacity) : 0;
                var imgObject = (req.body.image_details) ? req.body.image_details : '';
                var optionObj = req.body.option_details;
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = st.db.escape(req.body.ten_id) + ',' + st.db.escape(req.body.title)
                                + ',' + st.db.escape(req.body.description) + ',' + st.db.escape(req.body.startDate)
                                + ',' + st.db.escape(req.body.endDate) + ',' + st.db.escape(req.body.status)
                                + ',' + st.db.escape(req.body.regLastDate) + ',' + st.db.escape(req.body.type)
                                + ',' + st.db.escape(req.body.token) + ',' + st.db.escape(req.body.note)
                                + ',' + st.db.escape(req.body.venueId) + ',' + st.db.escape(req.body.code)
                                + ',' + st.db.escape(req.body.capacity);
                            var procQuery = 'CALL pSaveTENMaster(' + queryParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    if (optionObj.length > 0){
                                                        console.log("optionObj",optionObj);
                                                        var combOptionQuery = '';
                                                        /**
                                                         * preparing query to save multiple options of opinion poll
                                                         */
                                                        var optionArray = [];
                                                        var optionTidArray = [];
                                                        for (var k = 0; k < optionObj.length; k++){
                                                            optionTidArray.push(optionObj[k].tid);
                                                            optionArray.push(optionObj[k].option);
                                                        }
                                                        for (var i = 0; i < optionArray.length; i++ ){
                                                            var optionQueryParams =  st.db.escape(results[0][0].id) + ',' +st.db.escape(optionArray[i]);
                                                            combOptionQuery +=  ('CALL post_opinion_poll_option(' + optionQueryParams + ');');
                                                        }
                                                        console.log(combOptionQuery);
                                                        st.db.query(combOptionQuery, function (err, optionResult) {
                                                            if (!err) {
                                                                if (optionResult) {
                                                                    console.log(optionResult);
                                                                    if (optionResult.length > 0){
                                                                        var result = {};
                                                                        for(var i=0; i < optionResult.length/2; i++){
                                                                            result.tid = optionResult[i*2][0].id;
                                                                            outputArray1.push(result);
                                                                        }
                                                                        console.log('opinoion poll option save');
                                                                        if (imgObject.length > 0){
                                                                            var combQuery = '';
                                                                            /**
                                                                             * preparing query to update multiple image path
                                                                             */
                                                                            var imgArray = [];
                                                                            var tidArray = [];
                                                                            for (var j = 0; j < imgObject.length; j++){
                                                                                tidArray.push(imgObject[j].tid);
                                                                                imgArray.push(imgObject[j].pic);
                                                                            }
                                                                            for (var i = 0; i < tidArray.length; i++ ){
                                                                                var fileType = imgArray[i].split('.');
                                                                                var imgQueryParams = st.db.escape(tidArray[i]) + ',' + st.db.escape(results[0][0].id)
                                                                                    + ',' + st.db.escape(imgArray[i]) + ',' + st.db.escape(fileType[fileType.length - 1]);
                                                                                combQuery +=  ('CALL save_ten_master_attach(' + imgQueryParams + ');');
                                                                            }
                                                                            console.log(combQuery);
                                                                            st.db.query(combQuery, function (err, attachmentResult) {
                                                                                if (!err) {
                                                                                    if (attachmentResult) {
                                                                                        console.log(attachmentResult);
                                                                                        if (attachmentResult[0]){
                                                                                            if (attachmentResult[0].length > 0){
                                                                                                var imgResult = {};
                                                                                                for(var i=0; i < attachmentResult.length/2; i++){
                                                                                                    imgResult.tid = attachmentResult[i*2][0].tid;
                                                                                                    imgResult.pic = attachmentResult[i*2][0].aurl;
                                                                                                    imgResult.tn_pic = attachmentResult[i*2][0].tn_aurl;
                                                                                                    outputArray.push(imgResult);
                                                                                                }
                                                                                                console.log('attachment file saved');
                                                                                                responseMessage.status = true;
                                                                                                responseMessage.error = null;
                                                                                                responseMessage.message = 'Service posted successfully';
                                                                                                responseMessage.data = {
                                                                                                    id : results[0][0].id,
                                                                                                    imageData : outputArray,
                                                                                                    optionID : outputArray1
                                                                                                };
                                                                                                res.status(200).json(responseMessage);
                                                                                            }
                                                                                            else {
                                                                                                console.log('attachment file not save');
                                                                                                res.status(200).json(responseMessage);
                                                                                            }
                                                                                        }
                                                                                        else {
                                                                                            console.log('attachment file not save');
                                                                                            res.status(200).json(responseMessage);
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        console.log('attachment file not save');
                                                                                        res.status(200).json(responseMessage);
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log('attachment file not save');
                                                                                    console.log(err);
                                                                                    res.status(200).json(responseMessage);
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            responseMessage.status = true;
                                                                            responseMessage.error = null;
                                                                            responseMessage.message = 'Service posted successfully';
                                                                            responseMessage.data = {
                                                                                id : results[0][0].id,
                                                                                imageData : outputArray,
                                                                                optionID : outputArray1
                                                                            };
                                                                            res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('opinoion poll option save');
                                                                        res.status(200).json(responseMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('opinoion poll option save');
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('opinoion poll option not save');
                                                                console.log(err);
                                                                res.status(200).json(responseMessage);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Service posted successfully';
                                                        responseMessage.data = {
                                                            id : results[0][0].id,
                                                            imageData : outputArray,
                                                            optionID : outputArray1
                                                        };
                                                        res.status(200).json(responseMessage);
                                                    }
                                                    var notiQueryParams = st.db.escape(req.body.code) + ',' + st.db.escape(req.body.token);
                                                    var notiQuery = 'CALL get_admin_ten_notify(' + notiQueryParams + ')';
                                                    console.log("notiQuery",notiQuery);
                                                    st.db.query(notiQuery, function (err, notiResult) {
                                                        if (!err) {
                                                            if (notiResult) {
                                                                console.log(notiResult,"notiResult");
                                                                if (notiResult[0]){
                                                                    if (notiResult[0].length > 0){
                                                                        if (notiResult[3]){
                                                                            for (var i = 0; i < notiResult[0].length; i++ ) {
                                                                                var fn = (notiResult[1][0].fn) ? notiResult[1][0].fn :
                                                                                    ((notiResult[1][0].ln) ? notiResult[1][0].ln : notiResult[1][0].s_title);
                                                                                var receiverId = notiResult[0][i].gid;
                                                                                var senderTitle = notiResult[1][0].s_title;
                                                                                var groupTitle = notiResult[0][i].g_title;
                                                                                var groupId = notiResult[0][i].gid;
                                                                                var messageText = 'New opinion-poll from ' + fn + ' for Approval.';
                                                                                console.log(notiResult[2][0].sm_id,"notiResult[2][0].sm_id");
                                                                                var data = {
                                                                                    ten_id: results[0][0].id,
                                                                                    sm_id: notiResult[2][0].sm_id,
                                                                                    communityEzeId : req.body.code,
                                                                                    pa : notiResult[0][i].pa
                                                                                };
                                                                                var messageId = 0;
                                                                                var masterId = 0;
                                                                                var latitude = '';
                                                                                var longitude = '';
                                                                                var priority = '';
                                                                                var dateTime = '';
                                                                                var a_name = '';
                                                                                var msgUserid = '';
                                                                                var jobId = 0;
                                                                                var aUrl = '';
                                                                                var txId = 0;
                                                                                var issos = false;
                                                                                /**
                                                                                 * messageType 20 is event/poster/poll/ posted after approval of admin
                                                                                 */
                                                                                var messageType = 20;
                                                                                var operationType = 0;
                                                                                var iphoneId = (notiResult[0][i].iphoneId)? notiResult[0][i].iphoneId : null;
                                                                                console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                                                notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                                    operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,tokenResult[0].isWhatMate);
                                                                                console.log("Notification Send");
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in posting service';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in posting service';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in posting service';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in posting service';
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
                                    console.log('Error : post_community_service ', err);
                                    var errorDate = new Date();
                                    console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                            console.log('saveAssociationServices: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : saveAssociationServices ', err);
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
                console.log('Error saveAssociationServices :  ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
};

/**
 * @type : PUT
 * @param req
 * @param res
 * @param next
 * @description update association-ap likes
 * @accepts json
 * @param token <string> token of login user
 * @param ten_id <int> id of a event or notice
 * @param flag <int> flag
 */
Association.prototype.associationUpdateLiks = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.ten_id)) || (req.body.ten_id) < 0 ) {
        error.ten_id = 'Invalid ten id';
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
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.ten_id)+ ',' + st.db.escape(req.body.token)
                            + ',' + st.db.escape(req.body.flag);
                        var procQuery = 'CALL save_ten_likes(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Like updated successfully';
                                    responseMessage.data = null
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in updating like';
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
                                console.log('Error : save_ten_likes ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('associationLiks: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associationLiks ', err);
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
            console.log('Error associationLiks :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE Ten Master Image
 * @accepts json
 * @param token* <int> token of login user
 * @param id* <int> id of picture
 */
Association.prototype.associationDeleteTenImg = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.params.id)) || (req.params.id) < 1 ) {
        error.id = 'Invalid Image id';
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.params.id) + ',' + st.db.escape(req.query.token);
                        var procQuery = 'CALL delete_ten_master_attachment(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Image deleted successfully';
                                    responseMessage.data = {};
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting img';
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
                                console.log('Error :', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error:', err);
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
            console.log('Error:', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE service image
 * @accepts json
 * @param token* <int> token of login user
 * @param id* <int> id of picture
 */
Association.prototype.associationDeleteServiceImg = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.params.id)) || (req.params.id) < 1 ) {
        error.id = 'Invalid Image id';
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.params.id) + ',' + st.db.escape(req.query.token);
                        var procQuery = 'CALL delete_service_picture(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Image deleted successfully';
                                    responseMessage.data = {};
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting img';
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
                                console.log('Error :', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error:', err);
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
            console.log('Error:', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : PUT
 * @param req
 * @param res
 * @param next
 * @description update association-ap likes
 * @accepts json
 * @param token <string> token of login user
 * @param ten_id <int> id of a event or notice
 * @param status <int> status given by admin
 */
Association.prototype.associationUpdateTenStatus = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.ten_id)) || (req.body.ten_id) < 1 ) {
        error.ten_id = 'Invalid ten id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.status)) || (req.body.status) < 0 ) {
        error.status = 'Invalid status';
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
            var tenType = ['poster','event','poster','poster','opinion-poll','poster'];
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.ten_id) + ',' + st.db.escape(req.body.status)
                            + ',' + st.db.escape(req.body.token);
                        var procQuery = 'CALL pupdate_ten_status(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Status updated successfully';
                                    responseMessage.data = null
                                    res.status(200).json(responseMessage);
                                    if (parseInt(req.body.status) == 3){
                                        var notiQueryParams = st.db.escape(req.body.ten_id) + ',' + st.db.escape(req.body.token);
                                        var notiQuery = 'CALL get_ten_notify_user_details(' + notiQueryParams + ')';
                                        console.log("notiQuery",notiQuery);
                                        st.db.query(notiQuery, function (err, notiResult) {
                                            if (!err) {
                                                if (notiResult) {
                                                    console.log(notiResult);
                                                    if (notiResult[0]){
                                                        if (notiResult[0].length > 0){
                                                            if (notiResult[3]){
                                                                var fn = notiResult[1][0].fn ? notiResult[1][0].fn : notiResult[1][0].s_title;
                                                                for (var i = 0; i < notiResult[0].length; i++ ){
                                                                    var receiverId = notiResult[0][i].gid;
                                                                    var senderTitle = notiResult[1][0].s_title;
                                                                    var groupTitle = notiResult[0][i].g_title;
                                                                    var groupId = notiResult[0][i].gid;
                                                                    var messageText = 'New '+tenType[(notiResult[2][0].type)-1]+ ' : '+ notiResult[2][0].title+' published.';
                                                                    var data = {
                                                                        ten_id : req.body.ten_id,
                                                                        sm_id : notiResult[2][0].sm_id,
                                                                        communityEzeId : notiResult[2][0].communityEzeid,
                                                                        pa : notiResult[0][i].PA
                                                                    };
                                                                    /**
                                                                     * messageType 17 is event/poster/poll/ posted after approval of admin
                                                                     */
                                                                    var messageId = 0;
                                                                    var masterId = 0;
                                                                    var latitude = '';
                                                                    var longitude = '';
                                                                    var priority = '';
                                                                    var dateTime = '';
                                                                    var a_name = '';
                                                                    var msgUserid = '';
                                                                    var jobId = 0;
                                                                    var aUrl = '';
                                                                    var txId = 0;
                                                                    var issos = false;
                                                                    /**
                                                                     * messageType 21 is event/poster/poll/ posted after approval of admin
                                                                     */
                                                                    var messageType = 21;
                                                                    var operationType = 0;
                                                                    var iphoneId = (notiResult[0][i].iphoneId)? notiResult[0][i].iphoneId : null;
                                                                    console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                        operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos);
                                                                    notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType,
                                                                        operationType, iphoneId,messageId,masterId,latitude,longitude,priority,dateTime,a_name,msgUserid,jobId,aUrl,txId,data,issos,tokenResult[0].isWhatMate);
                                                                    console.log("Notification Send");

                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in updating status';
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
                                console.log('Error : save_ten_likes ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('associationLiks: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : associationLiks ', err);
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
            console.log('Error associationLiks :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get all options of opinion poll
 * @accepts json
 *
 * @param token <string> token of login user
 * @param ten_id <int> ten_id id of opinion poll
 *
 */
Association.prototype.associationGetOPoptions = function(req,res,next){
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
    if (isNaN(parseInt(req.query.ten_id))){
        error.ten_id = 'Invalid service id';
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.ten_id) ;
                        var procQuery = 'CALL get_op_poll_options(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Options loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Option are not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Option are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Option are not available';
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
                                console.log('Error : ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log(': Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :  ',err);
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
            console.log('Error :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get all options of opinion poll
 * @accepts json
 *
 * @param token <string> token of login user
 * @param ten_id <int> ten_id id of opinion poll
 *
 */
Association.prototype.associationInvite = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};
    var contactList = req.body.contactList;
    if(typeof(contactList) == "string") {
        contactList = JSON.parse(contactList);
    }
    if(!contactList){
        contactList = [];
    }

    var mobileCount = 0;
    var mobileData = contactList[mobileCount];
    var message;
    var attachmentObject = '';
    var senderGroupId;
    var companyName='';
    var mobileList = '';
    var messageId = 0 ;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

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
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){

                    var sendInvitation = function(){
                        if(mobileList!='') {
                            mobileList = mobileList.substr(0, mobileList.length - 1);
                            request({
                                url: 'http://sms.ssdindia.com/api/sendhttp.php',
                                qs: {
                                    authkey: '12909AK9RbCdvLf57d63bfc',
                                    mobiles: mobileList,
                                    message: "You are invited to join " + companyName + " by " + tokenResult[0].fullName + ". Click on the following link based on your mobile phone type to download App. Sign-up as new user to join the group." +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    sender: 'EZEONE',
                                    route: 4
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    console.log('Error :', err);
                                    responseMessage.error = {
                                        server: 'Internal Server Error'
                                    };
                                    responseMessage.message = 'An error occurred !';
                                    res.status(500).json(responseMessage);
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Successfully invited ..';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }

                            });
                        }
                        else{
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Successfully invited ..';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    };

                    var inviteMobile = function(mobileData){

                        var queryParams = req.st.db.escape(req.query.token) + ',' + req.st.db.escape(mobileData.mobile) + ',' + req.st.db.escape(mobileData.isdMobile)+ ',' + req.st.db.escape(mobileData.firstName)+ ',' + req.st.db.escape(mobileData.lastName)+ ',' + req.st.db.escape(mobileData.ezeoneId)+ ',' + req.st.db.escape(req.body.serviceMasterId) ;
                        var addressBookQry = 'CALL addressBook_community(' + queryParams + ')';
                        console.log('addressBookQry_community',addressBookQry);
                        req.db.query(addressBookQry, function (err, results) {
                            if (!err) {
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {

                                            mobileCount += 1;
                                            if (results[0][0].mobile != '') {
                                                mobileList += results[0][0].mobile + ',';
                                                companyName= results[0][0].companyName ;
                                            }
                                            if (mobileCount < contactList.length) {
                                                inviteMobile(contactList[mobileCount]);
                                            }
                                            else {
                                                sendInvitation();
                                            }
                                        }
                                        else {
                                            console.log('Invite:results no found');
                                            mobileCount += 1;
                                            if (mobileCount < contactList.length) {
                                                inviteMobile(contactList[mobileCount]);
                                            }
                                            else {
                                                sendInvitation();
                                            }
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        mobileCount += 1;
                                        if (mobileCount < contactList.length) {
                                            inviteMobile(contactList[mobileCount]);
                                        }
                                        else {
                                            sendInvitation();
                                        }
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    mobileCount += 1;
                                    if (mobileCount < contactList.length) {
                                        inviteMobile(contactList[mobileCount]);
                                    }
                                    else {
                                        sendInvitation();
                                    }
                                }
                            }
                            else{
                                console.log('Error :', err);
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                            }
                        });
                    };
                    //calling function at first time


                    if (contactList) {
                        if (contactList.length > 0) {
                            inviteMobile(mobileData);
                        }
                    }
                    else{
                        res.status(401).json(response);
                    }

                }
                else{
                    res.status(401).json(response);
                }
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};


module.exports = Association;