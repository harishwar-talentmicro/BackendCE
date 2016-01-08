/**
 *  @author Gowri shankar
 *  @since December 28,2015  12:05PM
 *  @title service module
 *  @description Handles service related functions
 */
"use strict";

var uuid = require('node-uuid');

var st = null;
function Service(db,stdLib){

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
    var dateTime = req.query.dt;
    var lat = req.query.lat ? req.query.lat : 0.00;
    var lng = req.query.lng ? req.query.lng : 0.00;
    var serviceType = parseInt(req.query.service_type);

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Sorry! token is mandatory';
        console.log('token is mandatory');
        validateStatus *= false;
    }
    if(isNaN(serviceType)){
        error['service_type'] = 'Sorry! service_type is not integer value';
        console.log('service_type is a integer value');
        validateStatus *= false;
    }

    if(!validateStatus){
        res.json(error);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =   st.db.escape(token) + ',' + st.db.escape(dateTime)+ ',' + st.db.escape(lat)
                            + ',' + st.db.escape(lng)+ ',' + st.db.escape(serviceType);
                        var query = 'CALL pgetserviceproviders(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        if(serviceResult[1]){
                                            for(var i=0; i < serviceResult[1].length; i++){
                                                serviceResult[1][i].tilebanner = serviceResult[1][i].tilebanner ?
                                                req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + serviceResult[1][i].tilebanner: '';
                                            }
                                            res.status(200).json({
                                                totalcount : serviceResult[0][0].totalcount,
                                                Result : serviceResult[1]
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
                    error['token'] = 'Sorry! Error in validating Token'
                    res.status(500).json(error);
                    console.log('FnGetServiceProviders:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(null);
            console.log('Error : FnGetServiceProviders ' + ex.description);
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
    var status = parseInt(req.query.s);

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
    if(isNaN(status)){
        error['status'] = 'status is a integer value';
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
                        var query = 'CALL ploadservices(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    if(serviceResult[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'services loaded successfully';
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
            console.log('Error : FnGetServices ' + ex.description);
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
            console.log('Error : FnGetServiceCategories ' + ex.description);
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
                        var queryParams =   st.db.escape(serviceId);
                        var query = 'CALL ploadservicedetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, details) {
                            if (!err) {
                                if (details) {
                                    if(details[0]){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'service details loaded successfully';
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
            console.log('Error : FnGetServiceDetails ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSavePic
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save service pic
 */
Service.prototype.saveServicePic = function(req,res,next) {

    var randomName='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try{

        if(req.files) {
            console.log('coming....');
            console.log(req.files.pic);

            var uniqueId = uuid.v4();
            var filetype = (req.files.pic.extension) ? req.files.pic.extension : 'jpg';
            randomName = uniqueId + '.' + filetype;

            var readStream = fs.createReadStream(req.files.pic.path);

            uploadDocumentToCloud(randomName, readStream, function (err) {
                if (!err) {
                    responseMessage.status = true;
                    responseMessage.message = 'Pic Uploaded successfully';
                    responseMessage.data = { pic : randomName};
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
        else{
            console.log('save url...');
            var pic = ((picture).replace(/^https:\/\/storage.googleapis.com/, '')).split('/');
            pic = pic[2];
            console.log(pic);
            responseMessage.message = 'page pic is updated';
            responseMessage.status = true;
            responseMessage.data = pic;
            res.status(200).json(responseMessage);
            console.log('pic is updating');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSavePic:error ' + ex.description);
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
        var pic = req.body.pic ? req.body.pic :'';

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
                            + ',' + st.db.escape(pic);

                        var query = 'CALL ppostservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, serviceResult) {
                            if (!err) {
                                if (serviceResult) {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Service Created successfully';
                                    responseMessage.data = {
                                        master_id: masterId,
                                        message: req.body.message,
                                        cid: categoryId,
                                        pic: pic ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + pic : ''

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateService: Service Created successfully');
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
            console.log('Error : FnCreateService ' + ex.description);
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
        error: {},
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
            console.log('Error : FnUpdateService ' + ex.description);
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
        error: {},
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
        var ezeid = alterEzeoneId(req.body.ezeid);

        if(!(token)){
            error['token'] = 'token is Mandatory';
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

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ezeid)
                            + ',' + st.db.escape(req.body.identify_name);

                        var query = 'CALL paddmembertoservice(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, memberResult) {
                            console.log(memberResult);
                            if (!err) {
                                if (memberResult) {
                                    if (memberResult.affectedRows > 0) {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Member added successfully';
                                        responseMessage.data = {
                                            ezeid: ezeid,
                                            identify_name: req.body.identify_name
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnAddMembersToService: Member added successfully');
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
                                                responseMessage.message = 'Member not add';
                                                res.status(200).json(responseMessage);
                                                console.log('FnAddMembersToService:Member not add');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Member not add';
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
            console.log('Error : FnAddMembersToService ' + ex.description);
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
                                        responseMessage.message = 'communityResult loaded successfully';
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
            console.log('Error : FnGetJoinedCommunity ' + ex.description);
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
    var ezeid = alterEzeoneId(req.query.ezeid);

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
                                    responseMessage.data = {ezeid : alterEzeoneId(req.query.ezeid)};
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
            console.log('Error : FnDeleteCommunityMember : ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Service;
