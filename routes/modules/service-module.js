/**
 *  @author Gowri shankar
 *  @since December 28,2015  12:05PM
 *  @title service module
 *  @description Handles service related functions
 */
"use strict";

var uuid = require('node-uuid');

var st = null;
var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;
var moment = require('moment');
var appConfig = require('../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;
var request = require('request');

function Service(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
    }
};


var stream = require( "stream" );
var chalk = require( "chalk" );
var util = require( "util" );
// I turn the given source Buffer into a Readable stream.
function BufferStream( source ) {

    if ( ! Buffer.isBuffer( source ) ) {

        throw( new Error( "Source must be a buffer." ) );

    }

    // Super constructor.
    stream.Readable.call( this );

    this._source = source;

    // I keep track of which portion of the source buffer is currently being pushed
    // onto the internal stream buffer during read actions.
    this._offset = 0;
    this._length = source.length;

    // When the stream has ended, try to clean up the memory references.
    this.on( "end", this._destroy );

}

util.inherits( BufferStream, stream.Readable );

// I attempt to clean up variable references once the stream has been ended.
// --
// NOTE: I am not sure this is necessary. But, I'm trying to be more cognizant of memory
// usage since my Node.js apps will (eventually) never restart.
BufferStream.prototype._destroy = function() {

    this._source = null;
    this._offset = null;
    this._length = null;

};

// I read chunks from the source buffer into the underlying stream buffer.
// --
// NOTE: We can assume the size value will always be available since we are not
// altering the readable state options when initializing the Readable stream.
BufferStream.prototype._read = function( size ) {

    // If we haven't reached the end of the source buffer, push the next chunk onto
    // the internal stream buffer.
    if ( this._offset < this._length ) {

        this.push( this._source.slice( this._offset, ( this._offset + size ) ) );

        this._offset += size;

    }

    // If we've consumed the entire source buffer, close the readable stream.
    if ( this._offset >= this._length ) {

        this.push( null );

    }

};

var gcloud = require('gcloud');
var fs = require('fs');

// var appConfig = require('../../ezeone-config.json');

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

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */
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
 * @todo FnGetServiceProviders
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service providers
 */
Service.prototype.getServiceProviders = function(req,res,next){

    var token = req.query.token;
    var lat = req.query.lat ? req.query.lat : 0.00;
    var lng = req.query.lng ? req.query.lng : 0.00;
    var serviceType = parseInt(req.query.service_type);
    req.query.dt = (req.query.dt) ? req.query.dt : moment().format('YYYY-MM-DD,h:mm:ss a');

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Sorry! token is mandatory';
        console.log('token is mandatory');
        validateStatus *= false;
    }
    if(isNaN(serviceType)){
        error['service_type'] = 'Sorry! service_type is invalid';
        console.log('service_type is a integer value');
        validateStatus *= false;
    }
    if(!validateStatus){
        res.status(400).json(error);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(lat)
                            + ',' + st.db.escape(lng)+ ',' + st.db.escape(serviceType) + ',' + st.db.escape(req.query.service_mid)
                            + ',' + st.db.escape(req.query.dt)+','+st.db.escape(DBSecretKey);

                        var query = 'CALL pgetserviceproviders(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        if(serviceResult[1]){
                                            for(var i=0; i < serviceResult[0].length; i++){

                                                serviceResult[0][i].OpenStatus = st.getOpenStatus(serviceResult[0][i].OpenStatus,serviceResult[0][i].wh);

                                                /**
                                                 * Removing wh property from search results
                                                 */
                                                serviceResult[0][i].wh = undefined;

                                                serviceResult[0][i].tilebanner = serviceResult[0][i].tilebanner ?
                                                req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].tilebanner: '';
                                            }
                                            res.status(200).json({
                                                totalcount : (serviceResult[1][0]) ? serviceResult[1][0].totalcount : 0,
                                                Result : (serviceResult[0]) ? serviceResult[0] : []
                                            });
                                            console.log('FnGetServiceProviders: service providers loaded successfully');
                                        }
                                        else {
                                            res.status(200).json(null);
                                            console.log('FnGetServiceProviders:service providers not loaded');
                                        }
                                    }
                                    else {
                                        res.status(200).json(null);
                                        console.log('FnGetServiceProviders:service providers not loaded');
                                    }
                                }
                                else {
                                    res.status(200).json(null);
                                    console.log('FnGetServiceProviders:service providers not loaded');
                                }
                            }
                            else {
                                error['Server'] = 'Internal Server Error';
                                res.status(500).json(error);
                                console.log('FnGetServiceProviders: error in getting service providers :' + err);
                            }
                        });
                    }
                    else {
                        error['token'] = 'Sorry! token is invalid';
                        res.status(401).json(error);
                        console.log('FnGetServiceProviders: Invalid token');
                    }
                }
                else {
                    error['token'] = 'Sorry! Error in validating Token';
                    res.status(500).json(error);
                    console.log('FnGetServiceProviders:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(null);
            console.log('Error : FnGetServiceProviders ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetServices
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get services
 */
Service.prototype.getServices = function(req,res,next){

    var token = req.query.token;
    var masterId = parseInt(req.query.master_id);
    //var status = parseInt(req.query.s);

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
    if(!(req.query.s)){
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
                        var queryParams =   st.db.escape(masterId) + ',' + st.db.escape(token)+ ',' + st.db.escape(req.query.s);
                        var query = 'CALL ploadservices(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'services loaded successfully';
                                        for(var i=0;i<serviceResult[0].length;i++){
                                            serviceResult[0][i].isimage = (serviceResult[0][i].isimage != 0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isimage :0;
                                            serviceResult[0][i].isattachment = (serviceResult[0][i].isattachment !=0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isattachment :0;
                                            serviceResult[0][i].isvideo = (serviceResult[0][i].isvideo !=0) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[0][i].isvideo :0;
                                        }
                                        responseMessage.data = serviceResult[0];
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

 * @todo FnGetServiceCategories
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service categories
 */
Service.prototype.getServiceCategories= function(req,res,next){

    var token = req.query.token;
    var masterId = parseInt(req.query.master_id);

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
                        var queryParams =   st.db.escape(masterId) + ',' + st.db.escape(token);
                        var query = 'CALL pgetservicecatagories(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, categoryResult) {
                            if (!err) {
                                if (categoryResult) {
                                    if(categoryResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service categories loaded successfully';
                                        responseMessage.data = categoryResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceCategories: service categories loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'service categories not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceCategories:service categories not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'service categories not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServiceCategories:service categories not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServiceCategories: error in getting service categories:' + err);
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
                        console.log('FnGetServiceCategories: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServiceCategories:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServiceCategories ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetServiceDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service Details
 */
Service.prototype.getServiceDetails = function(req,res,next){

    var token = req.query.token;
    var serviceId = parseInt(req.query.id);

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
    if(isNaN(serviceId)){
        error['id'] = 'id is a integer value';
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
                        var queryParams =   st.db.escape(serviceId)+','+ st.db.escape(token);
                        var query = 'CALL ploadservicedetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, details) {
                            if (!err) {
                                if (details) {
                                    if(details[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service details loaded successfully';
                                        if(details[0][0]) {
                                            details[0][0].isimage = details[0][0].isimage ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + details[0][0].isimage : 0;
                                            details[0][0].isattachment = details[0][0].isattachment ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + details[0][0].isattachment : 0;
                                            details[0][0].isvideo = details[0][0].isvideo ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + details[0][0].isvideo : 0;
                                        }
                                        responseMessage.data = details[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceDetails: service details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'service details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetServiceDetails:service details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'service details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetServiceDetails:service details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetServiceDetails: error in getting service details:' + err);
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
                        console.log('FnGetServiceDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetServiceDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetServiceDetails ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveServicePic
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save service pic
 */
Service.prototype.saveServicePic = function(req,res,next) {

    var picUrl='',picFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{

        if(req.files) {
            if(req.files.pic) {
                console.log(req.files.pic);
                var uniqueId = uuid.v4();
                var filetype = (req.files.pic.extension) ? req.files.pic.extension : 'jpg';
                picUrl = uniqueId + '.' + filetype;
                picFilename = req.files.pic.originalname;
                var readStream = fs.createReadStream(req.files.pic.path);

                uploadDocumentToCloud(picUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'Pic Uploaded successfully';
                        responseMessage.data = {
                            pic_url : picUrl,
                            pic_fn :picFilename
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnSavePic: Pic Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'Pic not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSavePic:Pic not upload');
                    }
                });
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('pic file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSavePic:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnSaveServiceAttachment
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save service pic
 */
Service.prototype.saveServiceAttachment = function(req,res,next) {

    var aUrl='',aFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{
        if(req.files) {
            if(req.files.attachment) {
                var uniqueId = uuid.v4();
                var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
                var mimeType = req.files.attachment.mimetype;
                if(mimeType && filetype==''){
                    if(mimeType.indexOf('png') > 0|| mimeType.indexOf('jpg') > 0 ){
                        filetype = "png";
                    }
                    else if(mimeType.indexOf('jpeg') > 0 ){
                        filetype = "jpeg";
                    }
                    else if(mimeType.indexOf('jpg') > 0 ){
                        filetype = "jpg"
                    }
                    else if(mimeType.indexOf('doc') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('docx') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('rtf') > 0 ){
                        filetype = "rtf"
                    }
                    else if(mimeType.indexOf('pdf') > 0 ){
                        filetype = "pdf"
                    }
                    else if(mimeType.indexOf('application/msword') > -1 ){
                        filetype = "docx"
                    }
                }
                aUrl = uniqueId + '.' + filetype;
                aFilename = req.files.attachment.originalname;
                console.log("aFilenameaFilename",aFilename);
                console.log("aFilenameaFilename",req.files.attachment);
                
                console.log("req.files.attachment.path",req.files.attachment.path);

                var readStream = fs.createReadStream(req.files.attachment.path);

                uploadDocumentToCloud(aUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'attachment Uploaded successfully';
                        responseMessage.data = {
                            a_url : aUrl,
                            a_fn :aFilename
                        };
                        console.log("responseMessage",responseMessage);

                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment: attachment Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'attachment not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment:attachment not upload');
                    }
                });
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceAttachment:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

Service.prototype.saveServiceAttachmentForPacehcm = function(req,res,next) {

    var aUrl='',aFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{
        if(req.files) {
            if(req.files.attachment) {
                var uniqueId = uuid.v4();
                var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
                var mimeType = req.files.attachment.mimetype;
                if(mimeType){
                    if(mimeType.indexOf('png') > 0|| mimeType.indexOf('jpg') > 0 ){
                        filetype = "png";
                    }
                    else if(mimeType.indexOf('jpeg') > 0 ){
                        filetype = "jpeg";
                    }
                    else if(mimeType.indexOf('jpg') > 0 ){
                        filetype = "jpg"
                    }
                    else if(mimeType.indexOf('doc') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('docx') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('rtf') > 0 ){
                        filetype = "rtf"
                    }
                    else if(mimeType.indexOf('pdf') > 0 ){
                        filetype = "pdf"
                    }
                    else if(mimeType.indexOf('application/msword') > -1 ){
                        filetype = "docx"
                    }
                }
                aUrl = uniqueId + '.' + filetype;
                aFilename = req.files.attachment.originalname;
                console.log("aFilenameaFilename",aFilename);
                console.log("aFilenameaFilename",req.files.attachment);
                
                console.log("req.files.attachment.path",req.files.attachment.path);

                var readStream = fs.createReadStream(req.files.attachment.path);

                uploadDocumentToCloud(aUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'attachment Uploaded successfully';
                        responseMessage.data = {
                            a_url : aUrl,
                            a_fn :aFilename
                        };
                        console.log("responseMessage",responseMessage);

                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment: attachment Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'attachment not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment:attachment not upload');
                    }
                });
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceAttachment:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};


Service.prototype.saveServiceAttachmentPace = function(req,res,next) {

    var aUrl='',aFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{
        if(req.files) {
            if(req.files.attachment) {
                var uniqueId = uuid.v4();
                var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
                var mimeType = req.files.attachment.mimetype;
                if(mimeType){
                    if(mimeType.indexOf('png') > 0|| mimeType.indexOf('jpg') > 0 ){
                        filetype = "png";
                    }
                    else if(mimeType.indexOf('jpeg') > 0 ){
                        filetype = "jpeg";
                    }
                    else if(mimeType.indexOf('jpg') > 0 ){
                        filetype = "jpg"
                    }
                    else if(mimeType.indexOf('doc') > 0 ){
                        filetype = "doc"
                    }
                    else if(mimeType.indexOf('docx') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('rtf') > 0 ){
                        filetype = "rtf"
                    }
                    else if(mimeType.indexOf('pdf') > 0 ){
                        filetype = "pdf"
                    }
                    else if(mimeType.indexOf('application/msword') > -1 ){
                        filetype = "doc"
                    }
                }

                if(filetype!='doc'){
                aUrl = uniqueId + '.' + filetype;
                aFilename = req.files.attachment.originalname;
                console.log("aFilenameaFilename",aFilename);
                console.log("aFilenameaFilename",req.files.attachment);
                
                console.log("req.files.attachment.path",req.files.attachment.path);

                var readStream = fs.createReadStream(req.files.attachment.path);

                uploadDocumentToCloud(aUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'attachment Uploaded successfully';
                        responseMessage.data = {
                            a_url : aUrl,
                            a_fn :aFilename
                        };
                        console.log("responseMessage",responseMessage);

                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment: attachment Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'attachment not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment:attachment not upload');
                    }
                });
            }else {


                var formData = {
                    attachment: fs.createReadStream(req.files.attachment.path),
                  };
                  request.post({url:'http://23.236.49.140:1002/api/service_attachment_doc', formData: formData}, function (err, httpResponse, body) {
                    if (err) {
                      return console.error('upload failed:', err);
                    }
                    else{
                    console.log('Response message convert:', body);
                    responseMessage.message = "Converted to docx";
                    // responseMessage.data = body.data;

                    res.status(200).json(JSON.parse(body));
                }  
                });

            }
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error',
            message : ex.toString()
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceAttachment:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        
        res.status(400).json(responseMessage);
    }
};


Service.prototype.saveServiceAttachmentDoc = function(req,res,next) {

    var aUrl='',aFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{
        if(req.files) {
            if(req.files.attachment) {
                var uniqueId = uuid.v4();
                var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
                var mimeType = req.files.attachment.mimetype;
                if(mimeType){
                    if(mimeType.indexOf('png') > 0|| mimeType.indexOf('jpg') > 0 ){
                        filetype = "png";
                    }
                    else if(mimeType.indexOf('jpeg') > 0 ){
                        filetype = "jpeg";
                    }
                    else if(mimeType.indexOf('jpg') > 0 ){
                        filetype = "jpg"
                    }
                    else if(mimeType.indexOf('doc') > 0 ){
                        filetype = "doc"
                    }
                    else if(mimeType.indexOf('docx') > 0 ){
                        filetype = "docx"
                    }
                    else if(mimeType.indexOf('rtf') > 0 ){
                        filetype = "rtf"
                    }
                    else if(mimeType.indexOf('pdf') > 0 ){
                        filetype = "pdf"
                    }
                    else if(mimeType.indexOf('application/msword') > -1 ){
                        filetype = "doc"
                    }
                }
                aUrl = uniqueId + '.' + filetype;
                aFilename = req.files.attachment.originalname;
                console.log("aFilenameaFilename",aFilename);
                console.log("aFilenameaFilename",req.files.attachment);
                
                console.log("req.files.attachment.path",req.files.attachment.path);

                var readStream = fs.createReadStream(req.files.attachment.path);

                uploadDocumentToCloud(aUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'attachment Uploaded successfully';
                        responseMessage.data = {
                            a_url : aUrl,
                            a_fn :aFilename
                        };
                        console.log("responseMessage",responseMessage);

                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment: attachment Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'attachment not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceAttachment:attachment not upload');
                    }
                });
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error',
            message : ex.toString()
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceAttachment:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};


/**
 * @todo FnSaveServiceVideo
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save service video
 */
Service.prototype.saveServiceVideo = function(req,res,next) {

    var vUrl='',vFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{

        if(req.files) {

            if(req.files.video) {
                var uniqueId = uuid.v4();
                var filetype = (req.files.video.extension) ? req.files.video.extension : '';
                vUrl = uniqueId + '.' + filetype;
                vFilename = req.files.video.originalname;
                var readStream = fs.createReadStream(req.files.video.path);

                uploadDocumentToCloud(vUrl, readStream, function (err) {
                    if (!err) {
                        responseMessage.status = true;
                        responseMessage.message = 'video Uploaded successfully';
                        responseMessage.data = {
                            v_url : vUrl,
                            v_fn :vFilename
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceVideo: video Uploaded successfully');
                    }
                    else {
                        responseMessage.message = 'video not upload';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveServiceVideo:video not upload');
                    }
                });
            }
        }
        else{
            responseMessage.message = 'file is required';
            res.status(200).json(responseMessage);
            console.log('file is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceVideo:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnCreateService
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for created new service
 */
Service.prototype.createService = function(req,res,next){

    /**
     * checking input parameters are json or not
     * @param token (char(36))
     * @param master_id (int)
     * @param message (VARCHAR(250))
     * @param cid (int) category id
     * @param pic  (file)
     */

    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else {
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var masterId = parseInt(req.body.master_id);
        var message = req.body.message;
        var categoryId = parseInt(req.body.cid);
        var pic = req.body.pic_url ? req.body.pic_url :'';
        var picFilename = req.body.pic_fn ? req.body.pic_fn :'';
        var attachment = req.body.a_url ? req.body.a_url :'';
        var aFilename = req.body.a_fn ? req.body.a_fn :'';
        var videoUrl = req.body.video_url ? req.body.video_url :'';
        var vFilename = req.body.video_fn ? req.body.video_fn :'';
        var id = (!isNaN(parseInt(req.body.id))) ? (parseInt(req.body.id)) :0; // new service it s 0 else tid
        var status = req.body.status ? req.body.status : 1; // in case of admin
        if (!token) {
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if (isNaN(masterId)) {
            error['masterId'] = 'masterId is a integer value';
            validateStatus *= false;
        }

        if (isNaN(categoryId)) {
            error['categoryId'] = 'categoryId is a integer value';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(masterId)
                            + ',' + st.db.escape(message) + ',' + st.db.escape(categoryId)
                            + ',' + st.db.escape(pic)+ ',' + st.db.escape(picFilename)
                            + ',' + st.db.escape(attachment) + ',' + st.db.escape(aFilename)
                            + ',' + st.db.escape(videoUrl)+ ',' + st.db.escape(vFilename)+ ',' + st.db.escape(id)
                            + ',' + st.db.escape(status);

                        var query = 'CALL ppostservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {

                            console.log(serviceResult);
                            if (!err) {
                                if (serviceResult) {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Service Created successfully';
                                    responseMessage.data = {
                                        master_id: masterId,
                                        message: req.body.message,
                                        cid: categoryId,
                                        pic_url : req.body.pic_url ? req.body.pic_url :'',
                                        pic_fn : req.body.pic_fn ? req.body.pic_fn :'',
                                        a_url : req.body.a_url ? req.body.a_url :'',
                                        a_fn : req.body.a_fn ? req.body.a_fn :'',
                                        video_url : req.body.video_url ? req.body.video_url :'',
                                        video_fn : req.body.video_fn ? req.body.video_fn :''
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateService: Service Created successfully');

                                    if(serviceResult[0]) {

                                        for (var i = 0; i < serviceResult[0].length; i++) {

                                            //send notification
                                            var receiverId = serviceResult[0][i].groupid;
                                            var senderTitle = serviceResult[0][i].sender;
                                            var groupTitle = '';
                                            var gid = serviceResult[0][i].groupid;
                                            var messageText = 'NewService-' + serviceResult[0][i].ct + '-' + serviceResult[0][i].name;
                                            var messageType = 12;
                                            var operationType = 0;
                                            var iphoneId = serviceResult[0][i].iphoneid;
                                            var priority = '';
                                            var messageId = 0;
                                            var msgUserid = 0;
                                            var masterid = masterId;
                                            var a_url = '';
                                            var a_name = '';
                                            var datetime = '';
                                            var latitude = 0.00;
                                            var longitude = 0.00;
                                            var jobId = 0;
                                            console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                            notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                        }
                                    }

                                }
                                else {
                                    responseMessage.message = 'service not created';
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateService:service not created');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCreateService: error in saving service  :' + err);
                            }

                        });
                    }

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnCreateService: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCreateService:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnCreateService ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateService
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for update service
 */
Service.prototype.updateService = function(req,res,next){

    /**
     * checking input parameters are json or not
     * @param token (CHAR(36))
     * @param id 	(int)
     * @param ep (int) // earned points
     * @param rp (int) //
     * @param replay  (VARCHAR(250))
     * @param st	 (int) // status  [1-submit,2-close,3-cancel]
     * @param master_id  (int) //servicemaster id
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        message: '',
        error: {},
        data: null
    };

    var validateStatus = true,error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else{
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var id = parseInt(req.body.id);
        var earnedPoints = req.body.ep ? parseInt(req.body.ep) : 0;
        var redeemedPoints = req.body.rp ? parseInt(req.body.rp):0;
        var status = parseInt(req.body.st);
        var masterId = parseInt(req.body.master_id);

        if(!token){
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if(isNaN(masterId)){
            error['masterId'] = 'masterId is not integer value';
            validateStatus *= false;
        }

        if(isNaN(id)){
            error['id'] = 'id is not integer value';
            validateStatus *= false;
        }
        if(isNaN(status)){
            error['status'] = 'status is not integer value';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(id)
                            + ',' + st.db.escape(earnedPoints) + ',' + st.db.escape(redeemedPoints)
                            + ',' + st.db.escape(req.body.replay) + ',' + st.db.escape(status)+ ',' + st.db.escape(masterId);

                        var query = 'CALL pupdateservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, updateserviceResult) {
                            console.log(updateserviceResult);
                            if (!err) {
                                if (updateserviceResult) {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Service updated successfully';
                                    responseMessage.data = {
                                        id : id,
                                        ep : earnedPoints,
                                        rp : redeemedPoints,
                                        replay : req.body.replay,
                                        st : status,
                                        master_id : masterId
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateService: Service updated successfully');


                                    //send notification
                                    if(updateserviceResult[0]) {

                                        for (var i = 0; i < updateserviceResult[0].length; i++) {

                                            //send notification
                                            var status;
                                            if(updateserviceResult[0][i].status == 1){
                                                status = 'submit'
                                            }
                                            else if(updateserviceResult[0][i].status == 2)
                                            {status = 'close'}
                                            else if(updateserviceResult[0][i].status == 3)
                                            {status = 'cancel'}

                                            var receiverId = updateserviceResult[0][i].groupid;
                                            var senderTitle = updateserviceResult[0][i].sender;
                                            var groupTitle = '';
                                            var gid = updateserviceResult[0][i].groupid;
                                            var messageText = updateserviceResult[0][i].ref_no + '-' + updateserviceResult[0][i].ct + '-' + status;
                                            var messageType = 12;
                                            var operationType = 0;
                                            var iphoneId = updateserviceResult[0][i].iphoneid;
                                            var priority = '';
                                            var messageId = 0;
                                            var msgUserid = 0;
                                            var masterid = masterId;
                                            var a_url = '';
                                            var a_name = '';
                                            var datetime = '';
                                            var latitude = 0.00;
                                            var longitude = 0.00;
                                            var jobId = 0;
                                            console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                            notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, priority, datetime, a_name, msgUserid, jobId, a_url);
                                        }
                                    }

                                }
                                else {
                                    responseMessage.message = 'service not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateService:service not updated');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateService: error in updating service  :' + err);
                            }

                        });

                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateService: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateService:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnUpdateService ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnAddMembersToService
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for created new service
 */
Service.prototype.addMembersToService = function(req,res,next){

    /**
     * checking input parameters are json or not
     * @param token (char(36))
     * @param ezeid VARCHAR(35)
     * @param identify name VARCHAR(25)
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else{
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var ezeid = req.st.alterEzeoneId(req.body.ezeoneId);

        if(!(token)){
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if (!req.body.communityType){
            error['communityType'] = 'Community type is Mandatory';
            validateStatus *= false;
        }
        if (!req.body.identifyName){
            error['identifyName'] = 'Identify name is Mandatory';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        req.body.notes = (req.body.notes) ? (req.body.notes) : '';
                        req.body.batch = (req.body.batch) ? (req.body.batch) : 0;
                        req.body.educationId = (req.body.educationId) ? (req.body.educationId) : 0;
                        req.body.higherEducationId = (req.body.higherEducationId) ? (req.body.higherEducationId) : 0;
                        req.body.specializationId = (req.body.specializationId) ? (req.body.specializationId) : 0;
                        req.body.companyName = (req.body.companyName) ? (req.body.companyName) : '';
                        req.body.jobTitle = (req.body.jobTitle) ? (req.body.jobTitle) : '';
                        req.body.gender = (req.body.gender) ? (req.body.gender) : 2;
                        req.body.dob = (req.body.dob) ? (req.body.dob) : null;

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ezeid)
                            + ',' + st.db.escape(req.body.identifyName)+ ',' + st.db.escape(req.body.notes);

                        var query = 'CALL paddmembertoservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, memberResult) {
                            if (!err) {
                                if (memberResult) {
                                    console.log(memberResult);
                                    if (memberResult.affectedRows > 0) {
                                    var finalQuery = '';
                                        var educationParam = st.db.escape(token) + ',' + st.db.escape(ezeid) + ',' +
                                        st.db.escape(req.body.batch) + ',' + st.db.escape(req.body.educationId)+ ',' + st.db.escape(req.body.higherEducationId)
                                            + ',' + st.db.escape(req.body.specializationId)+ ',' + st.db.escape(req.body.identifyName);

                                        var ezeIdParam = st.db.escape(token) + ',' + st.db.escape(req.body.companyName)
                                            + ',' + st.db.escape(req.body.jobTitle)+ ',' + st.db.escape(req.body.gender)
                                            + ',' + st.db.escape(req.body.dob)+ ',' + st.db.escape(req.body.communityType);

                                        if (parseInt(req.body.communityType) == 2 || parseInt(req.body.communityType) == 5){
                                            finalQuery = "CALL pSaveAlumniProfile_v2(" + educationParam + "); CALL pupdate_ezeone_details("+ ezeIdParam +");";
                                            console.log('finalQuery',finalQuery);
                                            st.db.query(finalQuery, function (err, result) {
                                                if (!err && result){
                                                    responseMessage.status = true;
                                                    responseMessage.message = 'Member added successfully';
                                                    responseMessage.data = {
                                                        ezeoneId: ezeid,
                                                        identifyName: req.body.identifyName
                                                    };
                                                    res.status(200).json(responseMessage)
                                                }
                                                else{
                                                    responseMessage.status = false;
                                                    responseMessage.message = 'Error while adding member';
                                                    responseMessage.data = null
                                                    res.status(200).json(responseMessage);
                                                }

                                            });
                                        }
                                        else if (parseInt(req.body.communityType) == 6){
                                            finalQuery = "CALL pupdate_ezeone_details("+ ezeIdParam +");";
                                            console.log('finalQuery',finalQuery);
                                            st.db.query(finalQuery, function (err, result) {
                                                if (!err && result){
                                                    responseMessage.status = true;
                                                    responseMessage.message = 'Member added successfully';
                                                    responseMessage.data = {
                                                        ezeoneId: ezeid,
                                                        identifyName: req.body.identifyName
                                                    };
                                                    res.status(200).json(responseMessage)
                                                }
                                                else{
                                                    responseMessage.status = false;
                                                    responseMessage.message = 'Error while adding member';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }

                                            });
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Member added successfully';
                                            responseMessage.data = {
                                                ezeoneId: ezeid,
                                                identifyName: req.body.identifyName
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        if (memberResult[0]) {
                                            if (memberResult[0][0]) {
                                                if (memberResult[0][0].message == -2) {
                                                    responseMessage.status = true;
                                                    responseMessage.message = 'community doesnt exists';
                                                    responseMessage.data = { message : memberResult[0][0].message };
                                                    res.status(200).json(responseMessage);
                                                    console.log('FnAddMembersToService: community doesnt exists');
                                                }
                                                else {
                                                    responseMessage.status = true;
                                                    responseMessage.message = 'already a member of that community';
                                                    responseMessage.data = { message : memberResult[0][0].message };
                                                    res.status(200).json(responseMessage);
                                                    console.log('FnAddMembersToService: already a member of that community');
                                                }
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'Member added successfully';
                                                responseMessage.data = {
                                                    ezeoneId: ezeid,
                                                    identify_name: req.body.identify_name
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnAddMembersToService: Member added successfully');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Member added successfully';
                                            res.status(200).json(responseMessage);
                                            console.log('FnAddMembersToService:Member not add');
                                        }
                                    }
                                }
                                else {
                                    responseMessage.message = 'Member not add';
                                    res.status(200).json(responseMessage);
                                    console.log('FnAddMembersToService:Member not add');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnAddMembersToService: error in adding member  :' + err);
                            }

                        });

                    }
                    else {
                        responseMessage.message = 'Sorry! token is invalid';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnAddMembersToService: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnAddMembersToService:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnAddMembersToService ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetJoinedCommunity
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get service Details
 */
Service.prototype.getJoinedCommunity = function(req,res,next){

    var token = req.query.token;

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetjoinedcommunity(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, communityResult) {
                            if (!err) {
                                if (communityResult) {
                                    if(communityResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'community result loaded successfully';
                                        responseMessage.data = communityResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetJoinedCommunity: communityResult loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'communityResult not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetJoinedCommunity:communityResult not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'communityResult not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetJoinedCommunity:communityResult not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetJoinedCommunity: error in getting communityResult:' + err);
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
                        console.log('FnGetJoinedCommunity: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetJoinedCommunity:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetJoinedCommunity ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDeleteCommunityMember
 * Method : Delete
 * @param req
 * @param res
 * @param next
 * @description api code for delete Community Member
 */
Service.prototype.deleteCommunityMember = function(req,res,next){

    var token = req.query.token;
    var ezeid = req.st.alterEzeoneId(req.query.ezeid);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(ezeid) +','+ st.db.escape(token) ;
                        var query= 'CALL pdeletecommunitymember(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, deleteResult) {
                            console.log(deleteResult);
                            if (!err) {
                                if (deleteResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Community member deleted successfully';
                                    responseMessage.data = {ezeid : req.st.alterEzeoneId(req.query.ezeid)};
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteCommunityMember: Community member deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Community member not delete';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteCommunityMember: Community member not delete');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteCommunityMember: error in deleting community member :' + err);
                            }

                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnDeleteCommunityMember: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnDeleteCommunityMember:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDeleteCommunityMember : ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnIsCommunityMember
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @service-param
 * token <string> [Logged in user token]
 *
 * @description
 * Check for the logged in user that user is a member of any communities or not
 */
Service.prototype.isCommunityMember = function(req,res,next){
    var token = (req.query.token) ? req.query.token  : '';
    var respMsg = {
        status : false,
        message : 'Please login to continue',
        error : {token : 'Invalid token'},
        data : null
    };
    if(req.query.token){

        try{
            var queryParams = st.db.escape(token) ;
            var query= 'CALL is_community_member(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, communityResult) {
                console.log(communityResult);
                if (!err) {
                    respMsg.message = 'Community result count loaded';
                    respMsg.error = null;
                    respMsg.data = null;
                    respMsg.status = false;
                    if(communityResult){
                        if(communityResult[0]){
                            if(communityResult[0][0]){
                                if(communityResult[0][0].err_code == 'UNAUTHORIZED'){
                                    respMsg.error = {token : 'Invalid token'};
                                    respMsg.message = 'Please login to continue';
                                    res.status(401).json(respMsg);
                                }
                                else{
                                    respMsg.status = true;
                                    respMsg.data = {
                                        isCommunity : (communityResult[0][0].is_community_member) ? 1 : 0};
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                res.status(400).json(respMsg);
                            }

                        }
                        else{
                            res.status(400).json(respMsg);
                        }
                    }
                    else{
                        res.status(400).json(respMsg);
                    }
                }
                else{
                    console.log('Error in FnIsCommunityMember : Procedure is_community_member');
                    console.log(err);
                    respMsg.message = 'Internal server error';
                    respMsg.error = {server : 'Internal server error'};
                    res.status(500).json(respMsg);
                }
            });
        }
        catch(ex){
            console.log('Exception in FnIsCommunityMember');
            console.log(err);
            res.status(500).json(respMsg);
        }

    }
    else{
        res.status(401).json(respMsg);
    }
};


//To delete files from cloud storage permanently
/*
Service.prototype.deleteFileFromCloud = function(req,res,next) {

    var aUrl='',aFilename='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{
        if(req.body) {
            if(req.body.attachment) {

                
                // var gcloud = require('gcloud')({
                //     projectId: "sampleProject1"
                //   });
                //   var gcs = gcloud.storage();
                //   var myBucket = gcs.bucket('sampleBucket1');
                //   var file = myBucket.file('1.png');
                  
                //   file.delete(function (err, apiResponse) {
                //     if (err) {
                //       console.log(err);
                //     }
                //     else {
                //       console.log("Deleted successfully");
                //     }
                //   });
                

                function deleteFile(bucketName, filename) {
                    // [START storage_delete_file]
                    // Imports the Google Cloud client library
                    const Storage = require('@google-cloud/storage');
                  
                    // Creates a client
                    const storage = new Storage();
                  
                    
                     // TODO(developer): Uncomment the following lines before running the sample.
                     
                    // const bucketName = 'Name of a bucket, e.g. my-bucket';
                    // const filename = 'File to delete, e.g. file.txt';
                  
                    // Deletes the file from the bucket
                    storage
                      .bucket(bucket)
                      .file(req.body.attachment)
                      .delete()
                      .then(() => {
                        console.log(`gs://${bucket}/${req.body.attachment} deleted.`);
                      })
                      .catch(err => {
                        console.error('ERROR:', err);
                      });
                    // [END storage_delete_file]
                    responseMessage.message = 'File Deleted Successfully';
                    res.status(200).json(responseMessage);                   
                }
            }
        }
        else{
            responseMessage.message = 'path is required';
            res.status(200).json(responseMessage);
            console.log('path is required');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveServiceAttachment:error ' + ex);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};*/

module.exports = Service;
