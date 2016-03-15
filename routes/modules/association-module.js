/**
 *  @author Anjali Pandya
 *  @since March 10,2016  11:26AM
 *  @title Association module
 *  @description Association  functions
 */

"use strict";

var util = require('util');
var validator = require('validator');
var gm = require('gm').subClass({ imageMagick: true });

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
var uuid = require('node-uuid');
var gcloud = require('gcloud');
var fs = require('fs');
var path = require('path');
var util = require( "util" );

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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.service_mid);
                        var procQuery = 'CALL pGetAlumni_eventdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]){
                                        if (results[0].length > 0) {
                                            if (results[2]) {
                                                var output = [];
                                                for (var i = 0; i < results[2].length; i++) {
                                                    var imgArray = [];
                                                    var tnImgArray = [];
                                                    /**
                                                     * to add full image url with comma saprated images
                                                     */
                                                    if (results[2][i].attach) {
                                                        var imagePath = results[2][i].attach.split(',');
                                                        for (var j = 0; j < imagePath.length; j++) {
                                                            var attachment = (imagePath[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imagePath[j] : ''
                                                            imgArray.push(attachment);
                                                        }
                                                    }
                                                    var imgString = imgArray.join();

                                                    if (results[2][i].tn_attach) {
                                                        var imagePath = results[2][i].tn_attach.split(',');
                                                        for (var j = 0; j < imagePath.length; j++) {
                                                            var attachment = (imagePath[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imagePath[j] : ''
                                                            tnImgArray.push(attachment);
                                                        }
                                                    }
                                                    var tnImgString = tnImgArray.join();
                                                    var noticDetails = {};
                                                        noticDetails.countattch = results[2][i].countattch,
                                                        noticDetails.tenid = results[2][i].tenid,
                                                        noticDetails.title = results[2][i].title,
                                                        noticDetails.comments = results[2][i].comments,
                                                        noticDetails.likes = results[2][i].likes,
                                                        noticDetails.startdate = results[2][i].startdate,
                                                        noticDetails.attach = imgString,
                                                        noticDetails.tn_attach = tnImgString
                                                        output.push(noticDetails);
                                                }
                                                var output1 = [];
                                                for(var i = 0; i < results[1].length; i++){
                                                    var imgArray = [];
                                                    var tnImgArray = [];
                                                    /**
                                                     * to add full image url with comma saprated images
                                                     */
                                                    if (results[1][i].attach) {
                                                        var imagePath = results[1][i].attach.split(',');
                                                        for (var j = 0; j < imagePath.length; j++) {
                                                            var attachment = (imagePath[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imagePath[j] : ''
                                                            imgArray.push(attachment);
                                                        }
                                                    }
                                                    var imgString = imgArray.join();

                                                    if (results[1][i].tn_attach) {
                                                        var imagePath = results[1][i].tn_attach.split(',');
                                                        for (var j = 0; j < imagePath.length; j++) {
                                                            var attachment = (imagePath[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imagePath[j] : ''
                                                            tnImgArray.push(attachment);
                                                        }
                                                    }
                                                    var tnImgString = tnImgArray.join();
                                                    var eventDetails = {};
                                                    eventDetails.countattch = results[1][i].countattch,
                                                        eventDetails.tenid = results[1][i].tenid,
                                                        eventDetails.title = results[1][i].title,
                                                        eventDetails.startdate = results[1][i].startdate,
                                                        eventDetails.comments = results[1][i].comments,
                                                        eventDetails.likes = results[1][i].likes,
                                                        eventDetails.attach = imgString,
                                                        eventDetails.tn_attach = tnImgString
                                                        output1.push(eventDetails);
                                                }
                                            }
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Association details loaded successfully';
                                            responseMessage.data = {
                                                userDetails : {
                                                    tid : results[0][0].tid,
                                                    banner_pic : (results[0][0].banner_pic) ? req.CONFIG.CONSTANT.GS_URL +
                                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +results[0][0].banner_pic : '' ,
                                                    cn : results[0][0].cn,
                                                    id_no : results[0][0].id_no,
                                                    pt : results[0][0].pt,
                                                    ptStr : "You are well paid off,no payment due",
                                                    IDName : results[0][0].IDName
                                                },
                                                eventDetails : output1,
                                                noticDetails : output
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

Association.prototype.testXYZ = function(req,res,next){
    console.log("req.files hello");
    //console.log("req.files :"+req.files);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    try {
        console.log(req.files);
        if (req.files) {
            //var readStream;
            //gm(req.files.pr.path)
            //    .resize('128', '128')
            //    .stream(function (err, stdout, stderr) {
            //        readStream = fs.createReadStream(req.files.pr.path);
            //        stdout.pipe(readStream);
            //    });
            //console.log(readStream);
            //var writeStream ;
            //gm(req.files.pr.path)
            //    .resize(53, 57)
            //    .autoOrient()
            //    .write(req.files, function (err) {
            //        console.log("hello");
            //        if(!err){
            //         console.log(' hooray! ');
            //        }
            //        else{
            //            console.log(' error! '+err);
            //        };
            //    });
            var resizereadStream = gm(req.files.pr.path).resize(128, 128);
            console.log(resizereadStream);
            var readStream = fs.createReadStream(resizereadStream.source);
            var uniqueFileName = "tn_" + uuid.v4() + ".jpg";
            console.log(uniqueFileName);
            uploadDocumentToCloud(uniqueFileName, readStream, function (err) {
                if (!err) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Image uploaded successfully';
                    responseMessage.data = {
                        pic: uniqueFileName
                    };
                    res.status(200).json(responseMessage);
                }
                else {
                    responseMessage.status = false;
                    responseMessage.error = null;
                    responseMessage.message = 'Error in uploading image';
                    responseMessage.data = null;
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
                                                result.replyname=serviceResult[0][i].replyname;
                                            }
                                            var companyArray =[];
                                            if(serviceResult[0][i].companyname) {
                                                var companyArraynew = serviceResult[0][i].companyname;
                                                companyArray = companyArraynew.split('^');
                                                //result.companyname = companyArray;
                                            }
                                            else{
                                                result.companyname=serviceResult[0][i].companyname;
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
 * @param status <int> status (1-submitted,2-closed)
 * @param reply <int> reply from admin
 * @param prop is json object of image
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
    var randomName = '';
    var randomNameTN = '';

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.message) {
        error.message = 'Message can not be null';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.service_mid)) || (req.query.service_mid) < 0 ) {
        error.service_mid = 'Invalid service master id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.cid)) || (req.query.cid) < 0 ) {
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
            req.query.status = (req.query.status) ? req.query.status : 0;
            req.query.service_id = (req.query.service_id) ? req.query.service_id : 0;
            req.query.reply = req.query.reply ? req.query.reply : '';
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.service_mid)
                            + ',' + st.db.escape(req.query.message)+ ',' + st.db.escape(req.query.cid)
                            + ',' + st.db.escape(req.query.service_id)+ ',' + st.db.escape(req.query.status)
                            + ',' + st.db.escape(req.query.reply);
                        var procQuery = 'CALL post_community_service(' + procParams + ')';
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
                                                responseMessage.message = 'Service posted successfully';
                                                responseMessage.data = {
                                                    id : results[0][0]._i
                                                };
                                                res.status(200).json(responseMessage);

                                                //upload to cloud server
                                                if(req.files) {
                                                    for (var prop in req.files) {
                                                        if (req.files.hasOwnProperty(prop)) {
                                                            var uniqueId = uuid.v4();
                                                            var filetype = (req.files[prop].extension) ? req.files[prop].extension : 'jpg';
                                                            randomName = uniqueId + '.' + filetype;
                                                            randomNameTN = "tn_" + uniqueId + '.' + filetype;
                                                            console.log(randomName);
                                                            var readStream = fs.createReadStream(req.files[prop].path);
                                                            var picContent = {
                                                                randomName: randomName,
                                                                readStream: readStream,
                                                                service_id: req.query.service_id
                                                            };
                                                            var resizeReadStream = gm(req.files[prop].path).resize(128,128).quality(0).stream(filetype);
                                                            var thumbNailContent = {
                                                                randomNameTN: randomNameTN,
                                                                resizeReadStream: resizeReadStream
                                                            };
                                                            serviceSavePic(picContent, function (err, picResult) {
                                                                if (!err) {
                                                                    if (picResult) {
                                                                        console.log(picResult);
                                                                    }
                                                                    else {
                                                                        console.log('result not load');
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('error in save multiple pic');
                                                                    console.log(err);
                                                                }
                                                            });

                                                            // upload thumbnail of image to cloud server
                                                            saveThumbnail(thumbNailContent, function (err, thumbNailResult) {
                                                                if (!err) {
                                                                    if (thumbNailResult) {
                                                                        console.log(thumbNailResult);
                                                                    }
                                                                    else {
                                                                        console.log('result not loaded');
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('error in save multiple thumbnail');
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            console.log('attachment is empty');
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    console.log('attachment is empty');
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
 *
 * @param picContent
 * @param callback
 * @returns {string}
 * function to upload multiple image to serever
 */
function serviceSavePic(picContent, callback) {
    try {
        var localStream = picContent.readStream;
        var remoteWriteStream = bucket.file(picContent.randomName).createWriteStream();
        localStream.pipe(remoteWriteStream);
        remoteWriteStream.on('finish', function () {
            var imgQueryParams = st.db.escape(picContent.service_id) + ',' + st.db.escape(picContent.randomName);
            var procQuery = 'CALL post_community_service_picture(' + imgQueryParams + ')';
            console.log(procQuery);
            st.db.query(procQuery, function (err, attachmentResult) {
                if (!err) {
                    if (attachmentResult) {
                        console.log('attachment file saved');
                        var url = appConfig.CONSTANT.GS_URL + appConfig.CONSTANT.STORAGE_BUCKET + '/' + picContent.randomName;
                        callback(null, url);
                    }
                    else {
                        console.log('attachment file not save');
                        callback(null, null);
                    }
                }
                else {
                    console.log('attachment file not save');
                    console.log(err);
                    callback(null, null);
                }
            });
        });
        remoteWriteStream.on('error', function () {
            console.log('FnSavePictures: Image upload error to google cloud');
            callback(null, null);
        });
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        return 'error'
    }
};
/**
 *
 * @param thumbNailContent
 * @param callback
 * @returns {string}
 * function to upload multiple thumbnail to server
 */
function saveThumbnail(thumbNailContent, callback) {
    try {
        var localStream = thumbNailContent.resizeReadStream;
        var remoteWriteStream = bucket.file(thumbNailContent.randomNameTN).createWriteStream();
        localStream.pipe(remoteWriteStream);
        remoteWriteStream.on('finish', function (err) {
            if (!err) {
                console.log('attachment file saved');
                var thumbnail_url = appConfig.CONSTANT.GS_URL + appConfig.CONSTANT.STORAGE_BUCKET + '/' + thumbNailContent.randomNameTN;
                callback(null, thumbnail_url);
            }
            else {
                console.log('attachment file not save');
                console.log(err);
                callback(null, null);
            }
        });
        remoteWriteStream.on('error', function () {
            console.log('saveThumbnail: Thumbnail upload error to google cloud');
            callback(null, null);
        });
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        return 'error'
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
                                            var tnImgArray = [];
                                            /**
                                             * to add full image url with comma saprated images
                                             */
                                            if (results[0][0].pic) {
                                                var imagePath = results[0][0].pic.split(',');
                                                for (var j = 0; j < imagePath.length; j++) {
                                                    var attachment = (imagePath[j]) ? req.CONFIG.CONSTANT.GS_URL +
                                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imagePath[j] : ''
                                                    imgArray.push(attachment);
                                                }
                                            }
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Image name loaded successfully';
                                            responseMessage.data = {
                                            }
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

module.exports = Association;