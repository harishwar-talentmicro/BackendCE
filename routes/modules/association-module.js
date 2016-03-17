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

var st = null;
function Association(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.service_mid)
                            + ',' + st.db.escape(req.query.pg_no)+ ',' + st.db.escape(req.query.limit);
                        var procQuery = 'CALL pGetAlumni_eventdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Association details loaded successfully';
                                            responseMessage.data = {
                                                userDetails : results[0],
                                                eventDetails : results[1],
                                                totalCount : results[2][0].tc
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
 * @description save association comments
 * @accepts json
 * @param token <string> token of login user
 * @param tid <int> tid of comment table
 * @param ten_id <int> id of a event or notice
 * @param comments <string> comments from user
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
    if (!req.body.comment) {
        error.comment = 'Comment can not be null';
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
            req.body.tid = (parseInt(req.body.tid)) ? req.body.tid : 0;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.tid) + ',' + st.db.escape(req.body.ten_id)
                            + ',' + st.db.escape(req.body.comment)+ ',' + st.db.escape(req.body.token);
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =   st.db.escape(masterId) + ',' + st.db.escape(token)+ ',' + st.db.escape(status);
                        var query = 'CALL get_service_list(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        if(serviceResult[1]){
                                            responseMessage.data1 = serviceResult[0];
                                        }

                                        //var arr =[];
                                        //arr.push(serviceResult[0]);
                                        //console.log(arr,"arr1");
                                        //arr.forEach(function(data){
                                        //    for(var key in data	)
                                        //    {
                                        //        var tid = data[key].tid;
                                        //        //console.log(tid,"tid");
                                        //        //arr.forEach(function(data) {
                                        //        //    if(data[key].tid= tid){
                                        //        //        arr.push(arr.reply);
                                        //        //        console.log(arr);
                                        //        //    }
                                        //        //});
                                        //        for(var i =0;i<data[key].length;i++){
                                        //            if(data[key].tid= tid){
                                        //                arr.push(arr.reply);
                                        //                console.log(arr,"teste");
                                        //            }
                                        //        }
                                        //}
                                        //
                                        //
                                        //
                                        //});

                                        //var array = string.split(',');
                                        //for(var i = 0; i < str_array.length; i++) {
                                        //    // Trim the excess whitespace.
                                        //    str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
                                        //    // Add additional code here, such as:
                                        //    alert(str_array[i]);
                                        //}

                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'services loaded successfully';
                                        //for(var i=0;i<serviceResult[0].length;i++){
                                        //    serviceResult[0][i].isimage = (serviceResult[0][i].isimage != 0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isimage :0;
                                        //    serviceResult[0][i].isattachment = (serviceResult[0][i].isattachment !=0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isattachment :0;
                                        //    serviceResult[0][i].isvideo = (serviceResult[0][i].isvideo !=0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isvideo :0;
                                        //}
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
                                            //result.pic = serviceResult[0][i].picture;
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
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + picArray[j] : ''
                                                        imgArray.push(attachment);
                                                    }
                                                }
                                                else {
                                                    for (var j = 0; j < 3; j++) {
                                                        var attachment = (picArray[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + picArray[j] : ''
                                                        imgArray.push(attachment);
                                                    }
                                                }
                                                console.log("imgArray : "+imgArray);
                                                result.pic = imgArray.join();
                                            }
                                            else{
                                                result.pic = null;
                                            }
                                            //console.log(serviceResult[0][i].replay,"repl");
                                            //for(var i = 0; i <serviceResult[0].length; i++) {
                                            //    var str = serviceResult[0][i].replay;
                                            //    var str2 = serviceResult[0][i].cd;
                                            //    var array = str.split('^');
                                            //    var array1 = str2.split('^');
                                            //}
                                            ////console.log(array,"arr");

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
                                                //result.replyname = replyArray;
                                            }
                                            else{
                                                replyArray = [];
                                                //result.replyname = [];
                                            }
                                            var companyArray =[];
                                            if(serviceResult[0][i].companyname) {
                                                var companyArraynew = serviceResult[0][i].companyname;
                                                companyArray = companyArraynew.split('^');
                                                //result.companyname = companyArray;
                                            }
                                            else{
                                                //result.companyname=serviceResult[0][i].companyname;
                                                companyArray = [];
                                            }
                                            var replayObject = [];
                                            console.log(b.length,"length iof b");
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
                                                if(replyArray[j]){
                                                    robject.status =  statusArray[j];
                                                }
                                                else{
                                                    robject.status = '';
                                                }

                                                replayObject[j]= robject;

                                            }
                                            result.replayObject = replayObject;//push(replayObject);

                                            output.push(result);
                                        }
                                        //responseMessage.data = serviceResult[0];
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
            console.log('Error : FnGetServices ' + ex.description);
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
 * @description save association services
 * @accepts json
 * @param token <string> token of login user
 * @param service_mid <int> service_mid is service master id
 * @param message <string> message
 * @param cid <int> category id
 * @param service_id <int> service_id is id of service if updating
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
            req.body.service_id = (req.body.service_id) ? req.body.service_id : 0;
            req.body.tid = (req.body.tid) ? req.body.tid : 0;
            req.body.image_path = (req.body.image_path) ? req.body.image_path : '';
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.service_mid)
                            + ',' + st.db.escape(req.body.message)+ ',' + st.db.escape(req.body.cid)
                            + ',' + st.db.escape(req.body.service_id);
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
                                                                if (attachmentResult.length > 0){
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
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                            }
                                                        }
                                                        else {
                                                            console.log('attachment file not save');
                                                            console.log(err);
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
 * @description update association services
 * @accepts json
 * @param token <string> token of login user
 * @param service_id <int> service_id is id of service if updating
 * @param ep <string> earned points
 * @param rp <string> redeem points
 * @param reply <int> reply from admin
 * @param status <int> status (1-submitted,2-closed)
 * @param service_mid <int> service_mid is service master id
 * @param image_details <json> image_details array of image object (tid and pic)
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
                                                            if (imgObject[j].tid){
                                                                tidArray.push(imgObject[j].tid);
                                                                imgArray.push(imgObject[j].pic)
                                                            }
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
                                                                    if (attachmentResult.length > 0){
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
                                                                        res.status(200).json(responseMessage);
                                                                        console.log('attachment file saved');
                                                                    }
                                                                    else {
                                                                        console.log('attachment file not save');
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('attachment file not save');
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                                console.log(err);
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
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Images are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Images are not available';
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
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Ten details loaded successfully';
                                            responseMessage.data = results[0];
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
                                fs.unlink('../bin/'+req.files.pr.path);
                                console.log("Image Path is deleted from server");
                            };
                            var readStream = fs.createReadStream(req.files.pr.path);
                            var resizedReadStream = gm(req.files['pr'].path).resize(128,128).quality(0).stream(req.files.pr.extension);
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
        if (!req.body.status) {
            error['status'] = 'Invalid status';
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
        if (!req.body.note) {
            error['note'] = 'Invalid code';
            validationFlag *= false;
        }
        if (!req.body.venueId) {
            error['venueId'] = 'Invalid code';
            validationFlag *= false;
        }
        if (!req.body.title) {
            error['title'] = 'Invalid code';
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
                req.body.ten_id = (req.body.ten_id) ? req.body.ten_id : 0;      // while saving time 0 else id of user
                req.body.s_date = (req.body.s_date) ? (req.body.s_date) : null;
                req.body.e_date = (req.body.e_date) ? (req.body.e_date) : null;
                req.body.reg_lastdate = (req.body.reg_lastdate) ? (req.body.reg_lastdate) : null;
                req.body.code = alterEzeoneId(req.body.code);
                req.body.capacity = (req.body.capacity) ? (req.body.capacity) : 0;
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
                                                            var imgQueryParams = st.db.escape(tidArray[i]) + ',' + st.db.escape(results[0][0].id)
                                                                + ',' + st.db.escape(imgArray[i]) + ',' + st.db.escape('jpg');
                                                            combQuery +=  ('CALL save_ten_master_attach(' + imgQueryParams + ');');
                                                        }
                                                        console.log(combQuery);
                                                        st.db.query(combQuery, function (err, attachmentResult) {
                                                            if (!err) {
                                                                if (attachmentResult) {
                                                                    console.log(attachmentResult);
                                                                    if (attachmentResult.length > 0){
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
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('attachment file not save');
                                                                }
                                                            }
                                                            else {
                                                                console.log('attachment file not save');
                                                                console.log(err);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log("output",outputArray);
                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Service posted successfully';
                                                        responseMessage.data = {
                                                            id : results[0][0].id,
                                                            imageData : outputArray
                                                        };
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

module.exports = Association;