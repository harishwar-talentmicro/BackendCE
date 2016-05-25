/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Configuration module
 *  @description Handles all core configuration functions as follows
 *  1.
 *
 */
"use strict";
var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';
var uuid = require('node-uuid');
var gcloud = require('gcloud');

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


var stream = require( "stream" );
//var chalk = require( "chalk" );
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



var st = null;

function Configuration(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.save = function(req,res,next){
    /**
     * @todo FnSaveConfig
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var salesTitle = req.body.SalesTitle;
        var reservationTitle = req.body.ReservationTitle;
        var homeDeliveryTitle = req.body.HomeDeliveryTitle;
        var serviceTitle = req.body.ServiceTitle;
        var resumeTitle = req.body.ResumeTitle;
        var visibleModules = req.body.VisibleModules;
        var salesItemListType = req.body.SalesItemListType;
        var homeDeliveryItemListType = req.body.HomeDeliveryItemListType;
        var resumeKeyword = req.body.ResumeKeyword;
        var category = req.body.Category;
        var reservationDisplayFormat = req.body.ReservationDisplayFormat;
        var dataRefreshInterval = req.body.DataRefreshInterval;
        var salesFormMsg = req.body.SalesFormMsg;
        var reservationFormMsg = req.body.ReservationFormMsg;
        var homeDeliveryFormMsg = req.body.HomeDeliveryFormMsg;
        var serviceFormMsg = req.body.ServiceFormMsg;
        var resumeFormMsg = req.body.ResumeFormMsg;
        var freshersAccepted = req.body.FreshersAccepted;
        var salesURL = req.body.SalesURL;
        var reservationURL = req.body.ReservationURL;
        var homeDeliveryURL = req.body.HomeDeliveryURL;
        var serviceURL = req.body.ServiceURL;
        var resumeURL = req.body.ResumeURL;
        var deal_enable = (!isNaN(parseInt(req.body.deal_enable))) ? parseInt(req.body.deal_enable) : 2;
        var deal_banner = (req.body.deal_banner) ? req.body.deal_banner : '';
        var deal_title = (req.body.deal_title) ? req.body.deal_title : '';
        var deal_desc = (req.body.deal_desc) ? req.body.deal_desc : '' ;
        var randomName;

        var rtnMessage = {
            IsSuccessfull: false
        };
        if (token && category) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        if(req.body.deal_banner) {
                            var uniqueId = uuid.v4();
                            var fileType = (req.body.deal_banner).split(';base64');
                            var type = fileType[0].split('/');
                            randomName = uniqueId + '.' + type[1];
                            var s_url =req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName;
                            console.log(s_url);

                            var bufferData = new Buffer((req.body.deal_banner).replace(/^data:(image|'+mimeType+')\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');

                            var remoteWriteStream = bucket.file(randomName).createWriteStream();
                            var bufferStream = new BufferStream(bufferData);
                            bufferStream.pipe(remoteWriteStream);

                            remoteWriteStream.on('finish', function () {

                                var query = st.db.escape(token) + ',' + st.db.escape(salesTitle) + ',' + st.db.escape(reservationTitle)
                                    + ',' + st.db.escape(homeDeliveryTitle) + ',' + st.db.escape(serviceTitle)
                                    + ',' + st.db.escape(resumeTitle) + ',' + st.db.escape(visibleModules)
                                    + ',' + st.db.escape(salesItemListType) + ',' + st.db.escape(homeDeliveryItemListType)
                                    + ',' + st.db.escape(resumeKeyword) + ',' + st.db.escape(category)
                                    + ',' + st.db.escape(reservationDisplayFormat)+ ',' + st.db.escape(dataRefreshInterval)
                                    + ',' + st.db.escape(salesFormMsg) + ',' + st.db.escape(reservationFormMsg)
                                    + ',' + st.db.escape(homeDeliveryFormMsg) + ',' + st.db.escape(serviceFormMsg)
                                    + ',' + st.db.escape(resumeFormMsg)+ ',' + st.db.escape(freshersAccepted)
                                    + ',' + st.db.escape(salesURL) + ',' + st.db.escape(reservationURL)
                                    + ',' + st.db.escape(homeDeliveryURL) + ',' + st.db.escape(serviceURL)
                                    + ',' + st.db.escape(resumeURL)+ ',' + st.db.escape(deal_enable) + ',' + st.db.escape(randomName)
                                    + ',' + st.db.escape(deal_title)+ ',' + st.db.escape(deal_desc);
                                    console.log('CALL pSaveConfig(' + query + ')');
                                st.db.query('CALL pSaveConfig(' + query + ')', function (err, configResult) {
                                    if (!err) {
                                        if (configResult) {
                                            console.log(configResult);
                                            if (configResult.affectedRows > 0) {
                                                rtnMessage.IsSuccessfull = true;
                                                res.send(rtnMessage);
                                                console.log('FnSaveConfig:  Config details save successfully');
                                            }
                                            else {
                                                console.log('FnSaveConfig:No Save Config details');
                                                res.send(rtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSaveConfig:No Save Config details');
                                            res.send(rtnMessage);
                                        }
                                    }

                                    else {
                                        console.log('FnSaveConfig: error in saving Config details' + err);
                                        res.statusCode = 500;
                                        res.send(rtnMessage);
                                    }
                                });
                            });

                            remoteWriteStream.on('error', function () {
                                res.statusCode = 400;
                                res.send(rtnMessage);
                                console.log('FnSaveConfig: deal banner upload error to google cloud');

                            });
                        }

                        else{
                            var query = st.db.escape(token) + ',' + st.db.escape(salesTitle) + ',' + st.db.escape(reservationTitle)
                                + ',' + st.db.escape(homeDeliveryTitle) + ',' + st.db.escape(serviceTitle)
                                + ',' + st.db.escape(resumeTitle) + ',' + st.db.escape(visibleModules)
                                + ',' + st.db.escape(salesItemListType) + ',' + st.db.escape(homeDeliveryItemListType)
                                + ',' + st.db.escape(resumeKeyword) + ',' + st.db.escape(category)
                                + ',' + st.db.escape(reservationDisplayFormat)+ ',' + st.db.escape(dataRefreshInterval)
                                + ',' + st.db.escape(salesFormMsg) + ',' + st.db.escape(reservationFormMsg)
                                + ',' + st.db.escape(homeDeliveryFormMsg) + ',' + st.db.escape(serviceFormMsg)
                                + ',' + st.db.escape(resumeFormMsg)+ ',' + st.db.escape(freshersAccepted)
                                + ',' + st.db.escape(salesURL) + ',' + st.db.escape(reservationURL)
                                + ',' + st.db.escape(homeDeliveryURL) + ',' + st.db.escape(serviceURL)
                                + ',' + st.db.escape(resumeURL)+ ',' + st.db.escape(deal_enable) + ',' + st.db.escape(randomName)
                                + ',' + st.db.escape(deal_title)+ ',' + st.db.escape(deal_desc);

                            st.db.query('CALL pSaveConfig(' + query + ')', function (err, configResult) {
                                if (!err) {
                                    if (configResult) {
                                        if (configResult.affectedRows > 0) {
                                            rtnMessage.IsSuccessfull = true;
                                            res.send(rtnMessage);
                                            console.log('FnSaveConfig:  Config details save successfully');
                                        }
                                        else {
                                            console.log('FnSaveConfig:No Save Config details');
                                            res.send(rtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveConfig:No Save Config details');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveConfig: error in saving Config details' + err);
                                    res.statusCode = 500;
                                    res.send(rtnMessage);
                                }
                            });
                        }
                    }
                    else {
                        console.log('FnSaveConfig: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveConfig:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }
        else {
            if (!token) {
                console.log('FnSaveConfig: Token is empty');
            }
            else if (!category) {
                console.log('FnSaveConfig: Category is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveConfig:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.get = function(req,res,next){
    /**
     * @todo FnGetConfig
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.Token;

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetconfiguration(' + queryParams + ')';

                        st.db.query(query, function (err, configResult) {
                            if (!err) {
                                if (configResult) {
                                    if (configResult[0]) {
                                        if(configResult[0][0]) {
                                            configResult[0][0].dealbanner = (configResult[0][0].dealbanner) ?
                                                (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + configResult[0][0].dealbanner) : '';
                                        }
                                        res.send(configResult[0]);
                                        console.log('FnGetConfig: Details Send successfully');
                                    }
                                    else {

                                        console.log('FnGetConfig:No Details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetConfig:No Details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetConfig: error in getting config details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetConfig: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetConfig: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetConfig: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetConfig error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getBusinessCategories = function(req,res,next){
    /**
     * @todo FnGetCategory
     */
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);
        if (!isNaN(LangID)) {
            var query = 'Select CategoryID, CategoryTitle from mcategory where LangID=' + st.db.escape(LangID);
            st.db.query(query, function (err, categoryResult) {
                if (!err) {
                    if (categoryResult) {
                        res.send(categoryResult);
                        console.log('FnGetCategory: mcategory: Category sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetCategory: mcategory: No category found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetCategory: mcategory: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetCategory: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnCategory error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getStatusTypes = function(req,res,next){
    /**
     * @todo FnGetStatusType
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft = req.query.FunctionType;

        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
                        var query = 'CALL pGetStatusType(' + queryParams + ')';
                        st.db.query(query, function (err, statusResult) {
                            if (!err) {
                                if (statusResult) {
                                    if (statusResult[0]) {
                                        if (statusResult[0].length > 0) {
                                            console.log('FnGetStatusType: Status type details Send successfully');
                                            res.send(statusResult[0]);
                                        }
                                        else {

                                            console.log('FnGetStatusType:No Status type details found');
                                            res.json(null);
                                        }
                                    }
                                    else {

                                        console.log('FnGetStatusType:No Status type details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetStatusType:No Status type details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetStatusType: error in getting Status type details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetStatusType: Invalid Token');
                    }
                } else {

                    res.statusCode = 401;
                    res.json(null);
                    console.log('FnGetStatusType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetStatusType: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetStatusType: FunctionType is empty');
            }

            res.statusCode=401;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetStatusType error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.StatusTypes = function(req,res,next){
    /**
     * @todo FnStatusType
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft = req.query.FunctionType;

        var rtnMessage = {
            Result: [],
            Message: ''
        };

        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var statusAllOpen = {
                            TID:'-1',
                            MasterID:'0',
                            StatusTitle:'All Open',
                            ProgressPercent:0,
                            Status:1,
                            NotificationMsg:"",
                            NotificationMailMsg:"",
                            StatusValue:"11"
                        };
                        var statusAll = {
                            TID:'-2',
                            MasterID:'0',
                            StatusTitle:'All',
                            ProgressPercent:0,
                            Status:1,
                            NotificationMsg:"",
                            NotificationMailMsg:"",
                            StatusValue:"12"
                        };


                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
                        var query = 'CALL pGetStatusType(' + queryParams + ')';
                        st.db.query(query, function (err, statusResult) {

                            if (!err) {
                                if (statusResult) {
                                    if (statusResult[0]) {
                                        statusResult[0].unshift(statusAll);
                                        statusResult[0].unshift(statusAllOpen);
                                        rtnMessage.Result = statusResult[0];
                                        rtnMessage.Message = 'Status type details Send successfully';
                                        console.log('FnStatusType: Status type details Send successfully');
                                        res.send(rtnMessage);

                                    }
                                    else {
                                        console.log('FnGetStatusType:No Status type details found');
                                        rtnMessage.Message ='No Status type details found';
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnStatusType:No Status type details found');
                                    rtnMessage.Message ='No Status type details found';
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                rtnMessage.Message = 'error in getting Status type details';
                                console.log('FnStatusType: error in getting Status type details' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        rtnMessage.Message = 'Invalid Token';
                        res.send(rtnMessage);
                        console.log('FnStatusType: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    rtnMessage.Message = 'Error in validating token';
                    res.send(rtnMessage);
                    console.log('FnStatusType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnStatusType: Token is empty');
                rtnMessage.Message ='Token is empty';
            }
            else if (!ft) {
                console.log('FnStatusType: FunctionType is empty');
                rtnMessage.Message ='FunctionType is empty';
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetStatusType error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveStatusType = function(req,res,next){
    /**
     * @todo FnSaveStatusType
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = (!isNaN(parseInt(req.body.TID))) ? parseInt(req.body.TID) : 0;
        var ft = req.body.FunctionType;
        var statusTitle = req.body.StatusTitle;
        var progressPercent = req.body.ProgressPercent;
        var status = req.body.Status;
        var notificationMsg = req.body.NotificationMsg;
        var notificationMailMsg = req.body.NotificationMailMsg;
        var statusValue =req.body.StatusValue;

        var rtnMessage = {
            status : false,
            message : "Internal Server error",
            error : {
                server : "Internal Server error"
            },
            data : null
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tid) + ',' + st.db.escape(ft)
                            + ',' + st.db.escape(statusTitle)+ ',' +st.db.escape(progressPercent) + ',' +st.db.escape(status)
                            + ',' +st.db.escape(notificationMsg) + ',' +st.db.escape(notificationMailMsg)
                            + ',' + st.db.escape(statusValue);
                        var query = 'CALL pSaveStatusTypes(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, result) {
                            if (!err) {
                                console.log('result : ',result);
                                if(result){
                                    if(result[0]){
                                        if(result[0][0]){
                                            if(result[0][0].id){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Status saved successfully";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    saved : true
                                                }
                                                rtnMessage.error = null;
                                                res.status(200).json(rtnMessage);
                                            }
                                            else if(result[0][0].deleted == 0){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Stage is used in business manager ! Unable to delete";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    deleted : false
                                                }
                                                rtnMessage.error = {
                                                    TID : "Stage cannot be deleted as it is currently in use"
                                                };
                                                res.status(200).json(rtnMessage);
                                            }

                                            else if(result[0][0].deleted == 1){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Stage deleted successfully";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    deleted : true
                                                }
                                                rtnMessage.error = null;
                                                res.status(200).json(rtnMessage);
                                            }
                                            else{
                                                console.log('FnSaveActionType: Stage Type    not saved');
                                                res.status(200).json(rtnMessage);
                                            }
                                        }
                                        else{
                                            console.log('FnSaveActionType: Stage Type   not saved');
                                            res.status(200).json(rtnMessage);
                                        }
                                    }
                                    else{
                                        console.log('FnSaveActionType: Stage Type  not saved');
                                        res.status(200).json(rtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnSaveStatusType: Stage Type  not saved');
                                    res.status(200).json(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveStatusType: error in saving  Stage Type   ' +err);
                                res.status(500).json(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveStatusType: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveStatusType: Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });
        }
        else {
            console.log('FnSaveStatusType: Invalid token');
            rtnMessage.message = "Please login to continue";
            rtnMessage.status = false;
            rtnMessage.error = {
                token : "Invalid token"
            };
            res.status(401).json(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveStatusType:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(500).json(rtnMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getActionTypes = function(req,res,next){
    /**
     * @todo FnGetActionType
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft = req.query.FunctionType;

        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
                        var query = 'CALL pGetActionType(' + queryParams + ')';

                        st.db.query(query, function (err, statusResult) {
                            if (!err) {
                                if (statusResult) {
                                    if (statusResult[0]) {
                                        if (statusResult[0].length > 0) {
                                            console.log('FnGetActionType: Action Type details Send successfully');
                                            res.send(statusResult[0]);
                                        }
                                        else {
                                            console.log('FnGetActionType:No Action Type details found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetActionType:No Action Type details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetActionType:No Action type details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetActionType: error in getting Action Type details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetActionType: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetActionType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetActionType: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetActionType: FunctionType is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetActionType error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveActionType = function(req,res,next){
    /**
     * @todo FnSaveActionType
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = (!isNaN(parseInt(req.body.TID))) ? parseInt(req.body.TID) : 0;
        var ft = req.body.FunctionType;
        var actionTitle = req.body.ActionTitle;
        var status = req.body.Status;

        var rtnMessage = {
            status : false,
            message : "Internal Server error",
            error : {
                server : "Internal Server error"
            },
            data : null
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tid) + ',' + st.db.escape(ft)
                            + ',' + st.db.escape(actionTitle)+ ',' +st.db.escape(status);
                        var query = "CALL pSaveActionTypes("+ queryParams + ")";
                        st.db.query(query, function (err, result) {
                            if (!err) {
                                console.log('result : ',result);
                                if(result){
                                    if(result[0]){
                                        if(result[0][0]){
                                            if(result[0][0].id){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Task type saved successfully";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    saved : true
                                                }
                                                rtnMessage.error = null;
                                                res.status(200).json(rtnMessage);
                                            }
                                            else if(result[0][0].deleted == 0){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Task type is currently used in task manager ! Unable to delete";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    deleted : false
                                                }
                                                rtnMessage.error = {
                                                    TID : "Task type is currently used in task manager "
                                                };
                                                res.status(200).json(rtnMessage);
                                            }

                                            else if(result[0][0].deleted == 1){
                                                rtnMessage.status = true;
                                                rtnMessage.message = "Task type is currently used in task manager ";
                                                rtnMessage.data = {
                                                    TID : result[0][0].id,
                                                    deleted : true
                                                }
                                                rtnMessage.error = null;
                                                res.status(200).json(rtnMessage);
                                            }
                                            else{
                                                console.log('FnSaveActionType: Action Type (Task Type) type  not saved');
                                                res.status(200).json(rtnMessage);
                                            }
                                        }
                                        else{
                                            console.log('FnSaveActionType: Action Type (Task Type) type  not saved');
                                            res.status(200).json(rtnMessage);
                                        }
                                    }
                                    else{
                                        console.log('FnSaveActionType: Action Type (Task Type) type  not saved');
                                        res.status(200).json(rtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnSaveActionType: Action Type (Task Type) type  not saved');
                                    res.status(200).json(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveActionType: error in saving  Action Type (Task Type)  ' +err);
                                res.status(500).json(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveActionType: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveActionType: Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });
        }
        else {
            if (!token) {
                console.log('FnSaveActionType: Token is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveActionType :error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getItems = function(req,res,next){
    /**
     * @todo FnGetItemList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft = req.query.FunctionType;

        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
                        var query = 'CALL pGetItemList(' + queryParams + ')';
                        st.db.query(query, function (err, itemList) {

                            if (!err) {
                                if (itemList) {
                                    if (itemList[0]) {
                                        console.log('FnGetItemList: Item list details Send successfully');
                                        res.json(itemList[0]);
                                    }
                                    else {

                                        console.log('FnGetItemList:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetItemList:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnGetItemList: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetItemList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetItemList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetItemList: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetItemList: FunctionType is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetItemList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveItems = function(req,res,next){
    /**
     * @todo FnSaveItem
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = req.body.TID;
        var ft = req.body.FunctionType;
        var itemName = req.body.ItemName;
        var itemDescription = req.body.ItemDescription;
        var pic = req.body.Pic;
        var rate = (req.body.Rate) ? req.body.Rate : 0.00;
        var status = req.body.Status;
        var itemDuration = req.body.ItemDuration;

        var rtnMessage = {
            IsSuccessfull: false
        };


        if (token && itemName) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var deleteFlag = false;

                        if(!isNaN(parseInt(tid))&& parseInt(tid)> 0 && parseInt(status) != 1){
                            deleteFlag = true;
                        }

                        var queryParams = st.db.escape(tid) + ',' + st.db.escape(token) + ',' + st.db.escape(ft) + ',' + st.db.escape(itemName)
                            + ',' +st.db.escape(itemDescription) + ',' +st.db.escape(pic) + ',' +st.db.escape(rate)
                            + ',' +st.db.escape(status) + ',' +st.db.escape(itemDuration);

                        var query = 'CALL pSaveItem(' + queryParams + ')';

                        st.db.query(query, function (err, itemResult) {

                            if (!err){
                                if(itemResult) {
                                    if (itemResult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnSaveItem: Item details save successfully');
                                    }
                                    else {
                                        rtnMessage.IsSuccessfull = true;
                                        console.log('FnSaveItem:No Save Item details');
                                        if(itemResult[0][0]) {
                                            if (deleteFlag && itemResult[0][0].deleted) {
                                                rtnMessage.deleted = true;
                                            }
                                        }
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    rtnMessage.IsSuccessfull = true;
                                    console.log('FnSaveItem:No Save Item details');
                                    if(itemResult[0][0]) {
                                        if (deleteFlag && itemResult[0][0].deleted) {
                                            rtnMessage.deleted = true;
                                        }
                                    }
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveItem: error in saving item detail' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveItem: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveItem:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }

        else {
            if (!token) {
                console.log('FnSaveItem: Token is empty');
            }
            else if (!itemName) {
                console.log('FnSaveItem: ItemName is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveItem:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getFolders = function(req,res,next){
    /**
     * @todo FnGetFolderList
     */

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.Token;
        var ft = req.query.FunctionType;
        var flag =  (req.query.flag) ? req.query.flag : 0 ;
        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft)+ ',' + st.db.escape(flag);
                        var query = 'CALL pGetFolderList(' + queryParams + ')';

                        st.db.query(query, function (err, folderList) {
                            if (!err) {
                                if (folderList) {
                                    if (folderList[0]) {
                                        if (folderList[0].length > 0) {
                                            console.log('FnGetRoleList: Role list details Send successfully');
                                            res.send(folderList[0]);
                                        }
                                        else {
                                            console.log('FnGetRoleList:No Role list details found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetRoleList:No Role list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetRoleList:No Role list details found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnGetRoleList: error in getting Role list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetRoleList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetRoleList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetRoleList: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetRoleList: FunctionType is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetRoleList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveFolder = function(req,res,next){
    /**
     * @todo FnSaveFolderRules
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = (!isNaN(parseInt(req.body.TID))) ? parseInt(req.body.TID) : 0;
        var folderTitle = req.body.FolderTitle;
        var ruleFunction = req.body.RuleFunction;
        var ruleType = req.body.RuleType;
        var countryId = req.body.CountryID;
        var matchAdminLevel = req.body.MatchAdminLevel;
        var mappedNames = req.body.MappedNames;
        var latitude =req.body.Latitude;
        var longitude = req.body.Longitude;
        var proximity =req.body.Proximity;
        var defaultFolder =req.body.DefaultFolder;
        var folderStatus = req.body.FolderStatus;
        var seqNoFrefix = req.body.SeqNoFrefix;

        var rtnMessage = {
            IsSuccessfull: false,
            message : ''
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tid) + ',' + st.db.escape(folderTitle)
                            + ',' + st.db.escape(ruleFunction)+ ',' +st.db.escape(ruleType) + ',' +st.db.escape(countryId)
                            + ',' +st.db.escape(matchAdminLevel) + ',' +st.db.escape(mappedNames) + ',' + st.db.escape(latitude)
                            + ',' +st.db.escape(longitude) + ',' +st.db.escape(proximity) + ',' +st.db.escape(defaultFolder)
                            + ',' +st.db.escape(folderStatus) + ',' +st.db.escape(seqNoFrefix);

                        var query = 'CALL pSaveFolderRules(' + queryParams + ')';

                        st.db.query(query, function (err, folderRules) {
                            if (!err){
                                if(folderRules) {
                                    if (folderRules.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        rtnMessage.message = 'saved';
                                        res.send(rtnMessage);
                                        console.log('FnSaveFolderRules: Folder rules details save successfully');
                                    }
                                    else {
                                        console.log('FnSaveFolderRules:Folder rules not save');
                                        rtnMessage.message = folderRules[0][0] ? folderRules[0][0].message : 'Folder rules not save';
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveFolderRules:Folder rules not save');
                                    rtnMessage.message = folderRules[0][0] ? folderRules[0][0].message : 'Folder rules not save';
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveFolderRules: error in saving Folder rules details' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveFolderRules: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveFolderRules:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });
        }
        else {
            if (!token) {
                console.log('FnSaveFolderRules: Token is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveFolderRules:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getSubusers = function(req,res,next){
    /**
     * @todo FnGetSubuserList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetSubUserList(' + queryParams + ')';

                        st.db.query(query, function (err, subuserList) {
                            if (!err) {
                                if (subuserList) {
                                    if (subuserList[0]) {
                                        if (subuserList[0].length > 0) {
                                            console.log('FnGetSubUserList: Sub user list details Send successfully');
                                            res.send(subuserList[0]);
                                        }
                                        else {
                                            console.log('FnGetSubUserList:No Sub user  list details found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetSubUserList:No Sub user  list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetSubUserList:No Sub user  list details found');
                                    res.json(null);
                                }

                            }
                            else {
                                console.log('FnGetSubUserList: error in getting Sub user  list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetSubUserList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetSubUserList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetSubUserList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetSubUserList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.createSubuser = function(req,res,next){
    /**
     * @todo FnCreateSubUser
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = req.body.TID;
        var userName = req.st.alterEzeoneId(req.body.UserName);
        var status  = req.body.Status;
        var firstName = req.body.FirstName;
        var lastName = req.body.LastName;
        var accessRights = req.body.AccessRights;
        var salesEmail = req.body.SalesEmail;
        var reservationEmail = req.body.ReservationEmail;
        var homeDeliveryEmail = req.body.HomeDeliveryEmail;
        var serviceEmail = req.body.ServiceEmail;
        var resumeEmail = req.body.ResumeEmail;
        var salesRules = req.body.SalesRules;
        var reservationRules = req.body.ReservationRules;
        var homeDeliveryRules = req.body.HomeDeliveryRules;
        var serviceRules = req.body.ServiceRules;
        var resumeRules = req.body.ResumeRules;
        var masterId = req.st.alterEzeoneId(req.body.PersonalID);
        var templateId = (!isNaN(parseInt(req.body.templateID))) ? parseInt(req.body.templateID) : 0;

        var rtnMessage = {
            IsSuccessfull: false,
            TID: 0
        };

        st.validateToken(token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {

                    var queryParams = st.db.escape(token) + ',' + st.db.escape(tid) + ',' + st.db.escape(userName)
                        + ',' +st.db.escape(status) + ',' +st.db.escape(firstName) + ',' +st.db.escape(lastName)
                        + ',' + st.db.escape(accessRights) + ',' + st.db.escape(salesEmail) + ',' + st.db.escape(reservationEmail)
                        + ',' +st.db.escape(homeDeliveryEmail)+ ',' + st.db.escape(serviceEmail) + ',' + st.db.escape(resumeEmail)
                        + ',' + st.db.escape(salesRules) + ',' +st.db.escape(reservationRules)+ ',' + st.db.escape(homeDeliveryRules)
                        + ',' + st.db.escape(serviceRules) + ',' + st.db.escape(resumeRules) + ',' + st.db.escape(masterId)
                        + ',' + st.db.escape(templateId);
                    var query = 'CALL pCreateSubUser(' + queryParams + ')';
                    console.log(query);
                    st.db.query(query, function (err, subuserResult) {
                        if (!err){
                            if (subuserResult) {
                                console.log(subuserResult);
                                if(subuserResult[0]) {
                                    var result = subuserResult[0];
                                    if (result[0]) {
                                        if (result[0].RowAffected == 1) {
                                            rtnMessage.IsSuccessfull = true;
                                            rtnMessage.TID = result[0].TID;
                                            res.send(rtnMessage);
                                            console.log('FnCreateSubUser: Sub User details save successfully');
                                        }
                                        else {
                                            var qMsg ;
                                            switch (subuserResult[0][0].message ) {
                                                case 'Duplicate EZEOneID' :
                                                    qMsg = 'Duplicate EZEOneID';
                                                    break;
                                                default:
                                                    break;
                                            }
                                            console.log('FnCreateSubUser:No Save Sub User details');
                                            rtnMessage.error = qMsg;
                                            res.send(rtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnCreateSubUser:No Save Sub User details');
                                        res.send(rtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnCreateSubUser:No Save Sub User details');
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnCreateSubUser:No Save Sub User details');
                                res.send(rtnMessage);
                            }
                        }
                        else {
                            console.log('FnCreateSubUser: error in saving Sub User details' + err);
                            res.statusCode = 500;
                            res.send(rtnMessage);
                        }
                    });
                }
                else {
                    console.log('FnCreateSubUser: Invalid token');
                    res.statusCode = 401;
                    res.send(rtnMessage);
                }
            }
            else {
                console.log('FnCreateSubUser:Error in processing Token' + err);
                res.statusCode = 500;
                res.send(rtnMessage);
            }
        });
    }
    catch (ex) {
        console.log('FnCreateSubUser:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getReservationResources = function(req,res,next){
    /**
     * @todo FnGetReservationResource
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.st.alterEzeoneId(req.query.ezeid);
        var type = (req.query.type) ? req.query.type : 0 ;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            var queryParams = st.db.escape(ezeid) + ', ' + st.db.escape(type);
            var query = 'CALL pGetResource(' + queryParams + ')';

            st.db.query(query, function (err, resourceResult) {

                if (!err) {
                    if (resourceResult) {
                        if (resourceResult[0]) {
                            responseMessage.status = true;
                            responseMessage.data = resourceResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Resource details Send successfully';
                            console.log('FnGetReservationResource: Resource details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.error = {};
                            responseMessage.message = 'No founded Resource details';
                            console.log('FnGetReservationResource: No founded Resource details');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = {};
                        responseMessage.message = 'No Resource details found';
                        console.log('FnGetReservationResource: No Resource details found');
                        res.json(responseMessage);
                    }

                }
                else {
                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Resource details';
                    console.log('FnGetReservationResource: error in getting Resource details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservationResource: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnGetReservationResource:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveReservationResource = function(req,res,next){
    /**
     * @todo FnSaveReseravtionResource
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = (!isNaN(parseInt(req.body.TID))) ? parseInt(req.body.TID) : 0;
        var picture = (req.body.picture) ? ((req.body.picture.trim().length > 0) ? req.body.picture : null ) : null ;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;
        var description = req.body.description;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var operatorid = (req.body.operatorid) ? req.body.operatorid : '';
        var workingtemp = (req.body.working_temp) ? req.body.working_temp : 0;

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!picture){
            responseMessage.error['picture'] = 'Invalid Picture';
            validateStatus *= false;
        }

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationResource  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token && operatorid) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(picture) + ',' + st.db.escape(title) + ',' + st.db.escape(description) + ',' + st.db.escape(status)+ ',' + st.db.escape(operatorid) + ',' + st.db.escape(workingtemp);
                        st.db.query('CALL pSaveResource(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    if (insertResult[0]) {
                                        if (insertResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Resource details save successfully';
                                            responseMessage.data = {
                                                TID: insertResult[0][0].maxid,
                                                title: req.body.title,
                                                status: req.body.status,
                                                description: req.body.description,
                                                picture: req.body.picture
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnSaveReservationResource: Resource details save successfully');
                                        }
                                        else {
                                            responseMessage.message = 'An error occured ! Please try again';
                                            responseMessage.error = {};
                                            res.status(400).json(responseMessage);
                                            console.log('FnSaveReservationResource:No save Resource details');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'An error occured ! Please try again';
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveReservationResource:No save Resource details');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationResource:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationResource: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationResource: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationResource:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationResource: Token is mandatory field');
            }
            else if(!operatorid)
            {
                responseMessage.message = 'Invalid Operator ID';
                responseMessage.error = {operatorid : 'Invalid Operator ID'};
                console.log('FnSaveReservationResource: Operator ID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnSaveReservationResource:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationResource = function(req,res,next){
    /**
     * @todo FnUpdateReservationResource
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var picture = (req.body.picture) ? ((req.body.picture.trim().length > 0) ? req.body.picture : null ) : null ;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;
        var description = req.body.description;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var operatorid = req.body.operatorid;
        var workingTemp = (!isNaN(parseInt(req.body.working_temp))) ? parseInt(req.body.working_temp) : 0;

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!picture){
            responseMessage.error['picture'] = 'Invalid Picture';
            validateStatus *= false;
        }

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnUpdateReservationResource  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to update resource ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token && operatorid) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' +
                            st.db.escape(TID) + ',' + st.db.escape(picture) +
                            ',' + st.db.escape(title) + ',' + st.db.escape(description) +
                            ',' + st.db.escape(status) + ',' + st.db.escape(operatorid) + ','+st.db.escape(workingTemp);
                        st.db.query('CALL pSaveResource(' + query + ')', function (err, updateResult) {
                            if (!err){
                                if(updateResult) {
                                    if (updateResult.affectedRows > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Resource details update successfully';
                                        responseMessage.data = {
                                            TID: req.body.TID,
                                            title: req.body.title,
                                            status: req.body.status,
                                            description: req.body.description,
                                            picture: req.body.pictures
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnUpdateReservationResource: Resource details update successfully');
                                    }
                                    else {
                                        responseMessage.message = 'An error occured ! Please try again';
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnUpdateReservationResource:No Resource details updated');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnUpdateReservationResource:No Resource details updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateReservationResource: error in updating Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateReservationResource: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in processing Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateReservationResource:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateReservationResource: Token is mandatory field');
            }
            else if(!operatorid)
            {
                responseMessage.message = 'Invalid Operator ID';
                responseMessage.error = {operatorid : 'Invalid Operator ID'};
                console.log('FnUpdateReservationResource: Operator ID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateReservationResource:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getReservationServices = function(req,res,next){
    /**
     * @todo FnGetReservationService
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.st.alterEzeoneId(req.query.ezeid);
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            st.db.query('CALL pGetResServices(' + st.db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0]) {
                            if (GetResult[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.data = GetResult[0];
                                responseMessage.error = null;
                                responseMessage.message = 'Service details Send successfully';
                                console.log('FnGetReservationService: Service details Send successfully');
                                res.status(200).json(responseMessage);
                            }
                            else {

                                responseMessage.error = {};
                                responseMessage.message = 'No Service details found';
                                console.log('FnGetReservationService: No Service details found');
                                res.json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.error = {};
                            responseMessage.message = 'No Service details found';
                            console.log('FnGetReservationService: No Service details found');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = {};
                        responseMessage.message = 'No Service details found';
                        console.log('FnGetReservationService: No Service details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Service details';
                    console.log('FnGetReservationService: error in getting Service details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {
            if (!Token) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservationService: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservationService:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveReservationService = function(req,res,next){
    /**
     * @todo FnSaveReservationService
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = 0;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = (req.body.service_ids) ? req.body.service_ids : 0;

        var ID=''
        if(service_ids){
            ID = service_ids + ',' + ID;
            service_ids =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_ids);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }


        if (Token) {

            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(title) + ',' + st.db.escape(duration) + ',' + st.db.escape(rate) + ',' + st.db.escape(status)+ ',' + st.db.escape(service_ids);
                        st.db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    if (insertResult[0]) {
                                        if (insertResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Service details save successfully';
                                            responseMessage.data = {
                                                TID: insertResult[0][0].maxid,
                                                title: req.body.title,
                                                status: req.body.status,
                                                duration: req.body.duration,
                                                rate: req.body.rate,
                                                service_ids: req.body.service_ids
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnSaveReservationService: Service details save successfully');
                                        }
                                        else {
                                            responseMessage.message = 'An error occured ! Please try again';
                                            responseMessage.error = {};
                                            res.status(400).json(responseMessage);
                                            console.log('FnSaveReservationService:No Service details saved');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'An error occured ! Please try again';
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveReservationService:No Service details saved');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationService:No Service details saved');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationService: Token is mandatory field hello');
            }
            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservationService:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationService = function(req,res,next){
    /**
     * @todo FnUpdateReservationService
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = req.body.service_ids;

        var ID=''
        if(service_ids){

            ID = service_ids + ',' + ID;
            var service_IDS =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_IDS);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnUpdateReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to update service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(title) + ',' + st.db.escape(duration) + ',' + st.db.escape(rate) + ',' + st.db.escape(status)+ ',' + st.db.escape(service_IDS);
                        st.db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Service details update successfully';
                                    responseMessage.data = {
                                        TID : req.body.TID,
                                        title : req.body.title,
                                        status : req.body.status,
                                        duration : req.body.duration,
                                        rate : req.body.rate,
                                        service_ids : req.body.service_ids
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateReservationService: Service details update successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnUpdateReservationService:No Service details updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateReservationService: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateReservationService:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getResourceServiceMaps = function(req,res,next){
    /**
     * @todo FnGetReservResourceServiceMap,
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.st.alterEzeoneId(req.query.ezeid);
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            Message:''
        };

        if (ezeid) {

            st.db.query('CALL pGetResResourceServiceMap(' + st.db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if(GetResult[0]) {
                            if (GetResult[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.data = GetResult[0];
                                responseMessage.error = null;
                                responseMessage.message = 'ResourceServiceMap details Send successfully';
                                console.log('FnGetReservResourceServiceMap: ResourceServiceMap details Send successfully');
                                res.status(200).json(responseMessage);
                            }
                            else {

                                responseMessage.error = {};
                                responseMessage.message = 'Not founded ResourceServiceMap details';
                                console.log('FnGetReservResourceServiceMap: No founded ResourceServiceMap details');
                                res.json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.error = {};
                            responseMessage.message = 'No ResourceServiceMap details found';
                            console.log('FnGetReservResourceServiceMap: No ResourceServiceMap details found');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = {};
                        responseMessage.message = 'No ResourceServiceMap details found';
                        console.log('FnGetReservResourceServiceMap: No ResourceServiceMap details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting ResourceServiceMap details';
                    console.log('FnGetReservResourceServiceMap: error in getting ResourceServiceMap details' + err);
                    res.status(500).json(responseMessage);
                }
            });

        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservResourceServiceMap: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservResourceServiceMap:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveResourceServiceMap = function(req,res,next){
    /**
     * @todo FnSaveReservResourceServiceMap
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var resourceid = req.body.resourceid;
        var serviceids = req.body.serviceids;

        var ID='';
        if(serviceids){
            ID = serviceids + ',' + ID;
            serviceids =ID.slice(0,-1);
            console.log(serviceids);
        }
        var service_id = serviceids.concat(',');
        console.log('service_ids Values:'+ service_id);
        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!resourceid){
            responseMessage.error['resourceid'] = 'Invalid Resourceid';
            validateStatus *= false;
        }

        if(!serviceids){
            responseMessage.error['serviceids'] = 'Invalid Service_ids';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservResServiceMap  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource and service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = st.db.escape(resourceid) + ',' + st.db.escape(service_id);
                        st.db.query('CALL pSaveResResourceServiceMap(' + query + ')', function (err, insertResult) {

                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'ResourceService Map details save successfully';
                                    responseMessage.data = {
                                        resourceid : req.body.resourceid,
                                        serviceids : service_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap: ResourceService Map details save successfully');

                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservResServiceMap: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservResServiceMap: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservResServiceMap:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservResServiceMap: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservResServiceMap:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getWorkingHoursTemplates = function(req,res,next){
    /**
     * @todo FnGetWorkingHours
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) +',' + st.db.escape(0);
                        var query = 'CALL pGetWorkingHours(' + queryParams + ')';
                        st.db.query(query, function (err, workingHoursResult) {
                            if (!err) {
                                if (workingHoursResult) {
                                    if (workingHoursResult[0]) {
                                        if (workingHoursResult[0].length > 0) {

                                            console.log('FnGetWorkingHours: Working Hours details Send successfully');
                                            res.send(workingHoursResult[0]);
                                        }
                                        else {
                                            console.log('FnGetWorkingHours:No Working Hours details found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetWorkingHours:No Working Hours details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWorkingHours:No Working Hours details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWorkingHours: error in getting Working Hours details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWorkingHours: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWorkingHours: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnGetWorkingHours: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetWorkingHours error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveWorkingHoursTemplate = function(req,res,next){
    /**
     * @todo FnSaveWorkingHours
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var spilloverTime = req.body.SpilloverTime ? req.body.SpilloverTime : 0;
        var m1 = req.body.MO1;
        var m2 = req.body.MO2;
        var m3 = req.body.MO3;
        var m4 = req.body.MO4;
        var tu1 = req.body.TU1;
        var tu2 = req.body.TU2;
        var tu3 = req.body.TU3;
        var tu4 = req.body.TU4;
        var w1 = req.body.WE1;
        var w2 = req.body.WE2;
        var w3 = req.body.WE3;
        var w4 = req.body.WE4;
        var th1 = req.body.TH1;
        var th2 = req.body.TH2;
        var th3 = req.body.TH3;
        var th4 = req.body.TH4;
        var f1 = req.body.FR1;
        var f2 = req.body.FR2;
        var f3 = req.body.FR3;
        var f4 = req.body.FR4;
        var sa1 = req.body.SA1;
        var sa2 = req.body.SA2;
        var sa3 = req.body.SA3;
        var sa4 = req.body.SA4;
        var su1 = req.body.SU1;
        var su2 = req.body.SU2;
        var su3 = req.body.SU3;
        var su4 = req.body.SU4;
        var workingHrsTemplate = req.body.WorkingHrsTemplate;
        var tid = req.body.TID;


        var rtnMessage = {
            IsSuccessfull: false
        };

        if (token && workingHrsTemplate) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(spilloverTime) + ',' + st.db.escape(m1)
                            + ',' + st.db.escape(m2) + ',' + st.db.escape(m3) + ',' + st.db.escape(m4)
                            + ',' + st.db.escape(tu1) + ',' + st.db.escape(tu2) + ',' + st.db.escape(tu3) + ',' + st.db.escape(tu4)
                            + ',' + st.db.escape(w1) + ',' + st.db.escape(w2) + ',' + st.db.escape(w3) + ',' + st.db.escape(w4)
                            + ',' + st.db.escape(th1) + ',' + st.db.escape(th2) + ',' + st.db.escape(th3) + ',' + st.db.escape(th4)
                            + ',' + st.db.escape(f1) + ',' + st.db.escape(f2) + ',' + st.db.escape(f3) + ',' + st.db.escape(f4)
                            + ',' + st.db.escape(sa1) + ',' + st.db.escape(sa2) + ',' + st.db.escape(sa3) + ',' + st.db.escape(sa4)
                            + ',' + st.db.escape(su1) + ',' + st.db.escape(su2) + ',' + st.db.escape(su3) + ',' + st.db.escape(su4)
                            + ',' + st.db.escape(workingHrsTemplate) + ',' + st.db.escape(tid);
                        var query = 'CALL pSaveWorkingHours(' + queryParams + ')';
                        st.db.query(query, function (err, workingHoursresult) {
                            if (!err){
                                if(workingHoursresult) {
                                    if (workingHoursresult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnSaveWorkingHours: Working Hours details save successfully');
                                    }
                                    else {
                                        console.log('FnSaveWorkingHours:No Save Working Hours details');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveWorkingHours:No Save Working Hours details');
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveWorkingHours: error in saving Working Hours details' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWorkingHours: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWorkingHours:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }

        else {
            if (!token) {
                console.log('FnSaveWorkingHours: Token is empty');
            }
            else if (!workingHrsTemplate) {
                console.log('FnSaveWorkingHours: WorkingHrsTemplate is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWorkingHours:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getHolidays = function(req,res,next){
    /**
     * @todo FnGetHolidayList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        //var token = req.query.Token;
        /**
         * because of mobile compatibility we have not changed name of LocID
         */
        var masterId = (req.query.LocID) ? req.query.LocID : 0;
        //var templateId = (req.query.TemplateID) ? req.query.TemplateID : 0;
        var queryParams = st.db.escape(masterId);
        var query = 'CALL pGetHolidayList(' + queryParams + ')';
        console.log(query);
        st.db.query(query, function (err, holidayList) {
            if (!err) {
                if (holidayList) {
                    console.log(holidayList);
                    if (holidayList[0]) {
                        if (holidayList[0].length > 0) {
                            console.log('FnGetHolidayList: Holiday list Send successfully');
                            res.json(holidayList[0]);
                        }
                        else {
                            console.log('FnGetHolidayList:No Holiday list found');
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnGetHolidayList:No Holiday list found');
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetHolidayList:No Holiday list found');
                    res.json(null);
                }

            }
            else {
                console.log('FnGetHolidayList: error in getting Holiday list' + err);
                res.statusCode = 500;
                res.json(null);
            }
        });
    }
    catch (ex) {
        console.log('FnGetHolidayList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveHoliday = function(req,res,next){
    /**
     * @todo FnSaveHolidayCalendar
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var tid = req.body.TID;
        var holidayDate = req.body.HolidayDate;
        var holidayTitle = req.body.HolidayTitle;
        var templateId = req.body.TemplateID;

        var rtnMessage = {
            IsSuccessfull: false
        };

        if (token && holidayDate && holidayTitle && templateId) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(tid) + ',' + st.db.escape(token) + ',' + st.db.escape(new Date(holidayDate))
                            + ',' + st.db.escape(holidayTitle) + ',' + st.db.escape(templateId);
                        var query = 'CALL pSaveHolidayCalendar(' + queryParams + ')';
                        st.db.query(query, function (err, holidayResult) {
                            if (!err){
                                if(holidayResult) {
                                    if (holidayResult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnSaveHolidayCalendar: Holiday calander details save successfully');
                                    }
                                    else {
                                        console.log('FnSaveHolidayCalendar:No Save Holiday calander details');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveHolidayCalendar:No Save Holiday calander details');
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveHolidayCalendar: error in saving Holiday calander details' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveHolidayCalendar: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveHolidayCalendar:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }

        else {
            if (!token) {
                console.log('FnSaveHolidayCalendar: Token is empty');
            }
            else if (!holidayTitle) {
                console.log('FnSaveHolidayCalendar: HolidayTitle is empty');
            }
            else if (!holidayDate) {
                console.log('FnSaveHolidayCalendar: HolidayDate is empty');
            }
            else if (!templateId) {
                console.log('FnSaveHolidayCalendar: TemplateID is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveHolidayCalendar:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.deleteHoliday = function(req,res,next){
    /**
     * @todo FnDeleteHolidayList
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var token = req.query.Token;
        var tid = req.query.TID;

        var rtnMessage = {
            IsSuccessfull: false
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(tid);
                        var query = 'CALL pDeleteHolidayList(' + queryParams + ')';
                        st.db.query(query, function (err, holidayResult) {
                            if (!err){
                                if(holidayResult) {
                                    if (holidayResult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnDeleteHolidayList: Holiday list delete successfully');
                                    }
                                    else {
                                        console.log('FnDeleteHolidayList:No delete Holiday list');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnDeleteHolidayList:No delete Holiday list');
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnDeleteHolidayList: error in deleting Holiday list' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteHolidayList: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteHolidayList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }
        else {
            if (!token) {
                console.log('FnDeleteHolidayList: Token is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteHolidayList:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.deleteWorkingHours = function(req,res,next){
    /**
     * @todo FnDeleteWorkingHours
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var tid = req.query.TID;

        var rtnMessage = {
            IsSuccessfull: false,
            Message:''
        };

        if (token && tid) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams =  st.db.escape(tid);
                        var query = 'CALL pDeleteWorkinghours(' + queryParams + ')';

                        st.db.query(query, function (err, workinghoursResult) {
                            if (!err) {
                                if (workinghoursResult) {
                                    rtnMessage.IsSuccessfull = true;
                                    rtnMessage.Message = 'delete successfully';
                                    res.send(rtnMessage);
                                    console.log('FnDeleteWorkingHours:Working Hours delete successfully');
                                }
                                else {
                                    console.log('FnDeleteWorkingHours:working hours no delete');
                                    res.statusCode = 200;
                                    rtnMessage.Message = 'working hours no delete';
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteWorkingHours: error in deleting Working Hours' + err);
                                res.statusCode = 500;
                                rtnMessage.Message = 'Error in deleting';
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteWorkingHours: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteWorkingHours:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnDeleteWorkingHours: Token is empty');
            }
            else if (!tid) {
                console.log('FnDeleteWorkingHours: TID is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteWorkingHours:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getWorkingHoursDetails = function(req,res,next){
    /**
     * @todo FnWorkingHoursDetails
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var tid = req.query.TID;


        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tid);
                        var query = 'CALL PGetworkinghourDetails(' + queryParams + ')';

                        st.db.query(query, function (err, workinghourDetails) {

                            if (!err) {
                                if (workinghourDetails) {
                                    if (workinghourDetails[0]) {
                                        if (workinghourDetails[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.data = workinghourDetails[0];
                                            responseMessage.error = null;
                                            responseMessage.message = ' Working hours Send successfully';
                                            console.log('FnWorkingHoursDetails:Working hours Send successfully');
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.message = 'No founded Working hours';
                                            console.log('FnWorkingHours: No founded Working hours');
                                            res.json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'No founded Working hours';
                                        console.log('FnWorkingHours: No founded Working hours');
                                        res.json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'No founded Working hours list';
                                    console.log('FnWorkingHours: No founded Working hours list');
                                    res.json(responseMessage);
                                }

                            }
                            else {
                                responseMessage.data = null;
                                responseMessage.message = 'Error in getting Working hours list';
                                console.log('FnWorkingHours: error in getting Working hours list' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnWorkingHours: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnWorkingHours:Error in processing Token' + err);
                }
            });
        }

        else {
            if (!token) {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {
                    Token : 'Invalid Token'
                };
                console.log('FnWorkingHours: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnWorkingHours:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnSaveInstituteGroup
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token (char)
 * @param id (int)
 * @param title (varchar(150)
 * @param institute_id (varchar(150))
 * @description api code for save Institute Group
 */
Configuration.prototype.saveInstituteGroup = function(req,res,next){
    /**
     * checking input parameters are json or not
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else{
        /**
         * storing and validating the input parameters
         */

        if(!(req.body.token)){
            error['token'] = 'Token is Mandatory';
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
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id)
                            + ',' + st.db.escape(req.body.title)+ ',' + st.db.escape(req.body.institute_id);
                        var query = 'CALL psaveinstitutegroup(' + queryParams + ')';
                        st.db.query(query, function (err, result) {
                            if (!err) {
                                if (result) {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Institute Group saved successfully';
                                    responseMessage.data = {
                                        id:req.body.id,
                                        institute_id:req.body.institute_id,
                                        title:req.body.title
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveInstituteGroup: Institute Group saved successfully');
                                }
                                else {
                                    responseMessage.message = 'Institute Group not save';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveInstituteGroup:Institute Group not save');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveInstituteGroup: error in saving Institute Group  :' + err);
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
                        console.log('FnSaveInstituteGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveInstituteGroup:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveInstituteGroup ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetInstituteGroup
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token (char)
 * @description api code for get Institute Group
 */
Configuration.prototype.getInstituteGroup = function(req,res,next){


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!(req.query.token)){
        error['token'] = 'Token is Mandatory';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(req.query.token);
                        var query = 'CALL pgetinstituegroups(' + queryParams + ')';

                        st.db.query(query, function (err, groupResult) {
                            if (!err) {
                                if (groupResult) {
                                    if (groupResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Institute Group Loaded successfully';
                                        responseMessage.data = groupResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveInstituteGroup: Institute Group Loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Institute Group not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveInstituteGroup:Institute Group not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Institute Group not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveInstituteGroup:Institute Group not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveInstituteGroup: error in loading Institute Group  :' + err);
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
                        console.log('FnSaveInstituteGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveInstituteGroup:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveInstituteGroup ' + ex);
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
 */
Configuration.prototype.getInstituteConfig = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if((!req.query.lat) && (!req.query.long)){
        error.lat = 'Invalid latitude or longitute';
        validationFlag *= false;
    }
    if(!req.query.keywords){
        error.keywords = 'Keywords can not be empty';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }

    else{
        try {
            if (req.query.token) {
                st.validateToken(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = st.db.escape(req.query.lat) + ',' + st.db.escape(req.query.long)+ ',' + st.db.escape(req.query.keywords);
                            var query = 'CALL pFindInstituteconfig(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, institudeDetails) {

                                if (!err) {
                                    console.log(institudeDetails);
                                    if (institudeDetails) {
                                        if (institudeDetails[0]) {
                                            if (institudeDetails[0].length > 0) {
                                                responseMessage.status = true;
                                                responseMessage.data = institudeDetails[0];
                                                responseMessage.error = null;
                                                responseMessage.message = ' Institude details Send successfully';
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.message = 'Institude details are not sent';
                                                responseMessage.status = true;
                                                res.json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Institude details are not sent';
                                            res.json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Institude details are not sent';
                                        res.json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.data = null;
                                    responseMessage.message = 'Error in getting Institude details';
                                    console.log('getInstituteConfig: Error in getting Institude details' + err);
                                    res.status(500).json(responseMessage);
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
                            console.log('getInstituteConfig: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('getInstituteConfig:Error in processing Token' + err);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    responseMessage.message = 'Invalid Token';
                    responseMessage.error = {
                        Token : 'Invalid Token'
                    };
                    console.log('getInstituteConfig: Token is mandatory field');
                }

                res.status(401).json(responseMessage);
            }
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('getInstituteConfig:error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getInstituteGroupDetails = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if((!req.query.lat) && (!req.query.long)){
        error.lat = 'Invalid latitude or longitute';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.groupid))){
        error.groupid = 'Invalid group Id';
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
            if (req.query.token) {
                st.validateToken(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = st.db.escape(req.query.groupid) + ',' + st.db.escape(req.query.lat)
                                + ',' + st.db.escape(req.query.long);
                            var query = 'CALL pgetinstituegroupdetails(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, institudeDetails) {

                                if (!err) {
                                    console.log(institudeDetails);
                                    if (institudeDetails) {
                                        if (institudeDetails[0]) {
                                            if (institudeDetails[0].length > 0) {
                                                responseMessage.status = true;
                                                responseMessage.data = institudeDetails[0];
                                                responseMessage.error = null;
                                                responseMessage.message = ' Institude group details Send successfully';
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.message = 'Institude details are not sent';
                                                responseMessage.status = true;
                                                res.json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Institude details are not sent';
                                            res.json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Institude details are not sent';
                                        res.json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.data = null;
                                    responseMessage.message = 'Error in getting Institude details';
                                    console.log('getInstituteGroupDetails: Error in getting Institude details' + err);
                                    res.status(500).json(responseMessage);
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
                            console.log('getInstituteGroupDetails: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('getInstituteGroupDetails : Error in processing Token' + err);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    responseMessage.message = 'Invalid Token';
                    responseMessage.error = {
                        Token : 'Invalid Token'
                    };
                    console.log('getInstituteGroupDetails : Token is mandatory field');
                }

                res.status(401).json(responseMessage);
            }
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('getInstituteGroupDetails : error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }

};

/**
 * New working hour API
 * Working Schedule for Businesses and Institutes
 * @param req
 * @param res
 * @param next
 *
 * @service-param token <string>
 * @service-body <json>
    [
     {
         id : 0,
         days : [0,1,2],
         st : "09:00",
         et : "19:00"
     },
     {
         id : 0,
         days : [0,1,3],
         st : "10:00",
         et : "13:00"
     }
    ]
 */
Configuration.prototype.saveWorkingSchedule = function(req,res,next){
    try{
        /**
         * Sample data structure you will get from Client(Web)
         * It will be accessible through req.body and req type will always be json
         */
        var dataFromClient = [
            {
                id : 0,
                days : [0,1,2],
                st : "09:00",
                et : "19:00"
            },
            {
                id : 0,
                days : [0,1,3],
                st : "10:00",
                et : "13:00"
            }
        ];

        var error = {
        };
        var validationFlag = true;

        /**
         * TID of tmaster wherer you want to update working hours schedule
         * It can be main business TID or it can be a branch TID (i.e. also in tmaster but pointing to some other TID which is it's parent)
         */
        req.query.tid = parseInt(req.query.tid);
        if(isNaN(req.query.tid) || req.query.tid < 1){
            validationFlag *= false;
            error['tid'] = "Invalid TID";
        }

        /**
         * Slots which should not be deleted for working hours
         */
        var excludedIdList = [];

        var combSaveQuery = "";
        for(var i = 0; i < dataFromClient.length; i++){
            var startMoment = moment(dataFromClient.st,"HH:mm");
            var endMoment = moment(dataFromClient.et,"HH:mm");
            error[i] = null;

            /**
             * Validating start time
             */
            if(startMoment){
                if(!startMoment.isValid()){
                    error[i] = { st : 'Invalid time format'};
                    validationFlag *= false;
                }
            }
            else{
                error[i] = { st : 'Invalid time format'};
                validationFlag *= false;
            }
            /**
             * Validating end time
             */
            if(endMoment){
                if(!endMoment.isValid()){
                    error[i] = { et : 'Invalid time format'};
                    validationFlag *= false;
                }
            }
            else{
                error[i] = { et : 'Invalid time format'};
                validationFlag *= false;
            }

            /**
             * Validating days
             */
            if(dataFromClient[i].days){
                if(dataFromClient[i].days.length < 1) {
                    error[i] = {days: 'Days are empty'};
                    validationFlag *= false;
                }
                else{
                    for(var j = 0; j < dataFromClient[i].days.length; j++){
                        dataFromClient[i].days = parseInt(dataFromClient[i].days);
                        if(dataFromClient[i].days[j] > 6 || dataFromClient[i].days[j] < 0 || isNaN(dataFromClient[i].days[j])){
                            if(dataFromClient[i].days[j] > 6){
                                dataFromClient[i].days[j] = dataFromClient[i].days[j] % 6;
                            }
                            if(isNaN(dataFromClient[i].days[j]) || dataFromClient[i].days[j] < 0){
                                dataFromClient[i].days.splice(j,1);
                            }
                        }
                    }

                    if(!dataFromClient[i].days.length){
                        error[i] = { days : 'Days are empty'};
                        validationFlag *= false;
                    }
                }
            }
            else {
                error[i] = { days : 'Days are empty'};
                validationFlag *= false;
            }
            dataFromClient[i].id = parseInt(dataFromClient[i].id);
            if(isNaN(dataFromClient[i].id) || dataFromClient[i].id < 1){
                error[i] = { days : 'Invalid slot id'};
                validationFlag *= false;
            }

            if(error[i]){
                continue;
            }

            if(dataFromClient[i].id){
                excludedIdList.push(dataFromClient[i].id);
            }

            var queryParams = [
                st.db.escape(req.query.token),
                st.db.escape(dataFromClient[i].id),
                st.db.escape(dataFromClient[i].days.join(',')),
                st.db.escape((startMoment.hours() * 60)+startMoment.minutes()),
                st.db.escape((endMoment.hours() * 60)+endMoment.minutes()),
                st.db.escape(st.db.escape(req.query.tid))
            ];

            combSaveQuery += "CALL post_working_hour("+ queryParams.join(',')+");";

        }

        /**
         * The slots which are not to be deleted are pushed into excluded list
         */
        if(excludedIdList.length){
            var delQueryParams = [
                st.db.escape(req.query.token),
                st.db.escape(excludedIdList.join(',')),
                st.db.escape(st.db.escape(req.query.tid))
            ];
            /**
             * The slots other than the passed slots will get deleted with this procedure
             */
            combSaveQuery += "CALL delete_working_hours("+ delQueryParams.join(',')+");";
        }

        if(!validationFlag){
            res.status(200).json({
                status : false,
                message : "Please check the errors",
                error : error,
                data : null
            });
        }
        else{
            st.db.query(combSaveQuery,function(err,results){
                if(err){
                    console.debug('Error ',' In saving new working hours slot');
                    console.debug('Error message',err);
                    res.status(500).json({
                        status: false,
                        message : 'Internal Server error',
                        error : {
                            server : 'Internal Server error'
                        },
                        data : null
                    });
                }
                else{
                    res.status(200).json({
                        status : true,
                        message : "Working hours updated successfully",
                        error : null,
                        data : dataFromClient,
                        results : results
                    });
                }
            });
        }
    }
    catch(ex){
        console.debug('Exception error ',' In saving new working hours slot');
        console.debug('Exception message',ex);
        res.status(500).json({
            status: false,
            message : 'Internal Server error',
            error : {
                server : 'Internal Server error'
            },
            data : null
        });
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @discription : API to get working hour schedule for business and branches
 * @param token <string> token of login user
 * @param tid <int> (TID of login user or TID of branch depending upon whose working hours you want to update
 */
Configuration.prototype.getWorkingSchedule = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
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

    else{
        try {
            if (req.query.token) {
                st.validateToken(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var queryParams = st.db.escape(req.query.lat) + ',' + st.db.escape(req.query.long)+ ',' + st.db.escape(req.query.keywords);
                            var query = 'CALL pFindInstituteconfig(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, institudeDetails) {

                                if (!err) {
                                    console.log(institudeDetails);
                                    if (institudeDetails) {
                                        if (institudeDetails[0]) {
                                            if (institudeDetails[0].length > 0) {
                                                responseMessage.status = true;
                                                responseMessage.data = institudeDetails[0];
                                                responseMessage.error = null;
                                                responseMessage.message = ' Institude details Send successfully';
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.message = 'Institude details are not sent';
                                                responseMessage.status = true;
                                                res.json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Institude details are not sent';
                                            res.json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Institude details are not sent';
                                        res.json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.data = null;
                                    responseMessage.message = 'Error in getting Institude details';
                                    console.log('getInstituteConfig: Error in getting Institude details' + err);
                                    res.status(500).json(responseMessage);
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
                            console.log('getInstituteConfig: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('getInstituteConfig:Error in processing Token' + err);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    responseMessage.message = 'Invalid Token';
                    responseMessage.error = {
                        Token : 'Invalid Token'
                    };
                    console.log('getInstituteConfig: Token is mandatory field');
                }

                res.status(401).json(responseMessage);
            }
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            console.log('getInstituteConfig:error ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @type : DELETE
 * @param req
 * @param res
 * @param next
 * @description DELETE job of institute
 * @accepts json
 * @param token <string> token of login user
 * @param job_id <int> job id
 * @param institute_id <string> institute id(comma seprated)
 *
 */
Configuration.prototype.deleteJobInstitute = function(req,res,next){
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
    if (isNaN(parseInt(req.params.job_id)) || (req.params.job_id <= 0)){
        error.job_id = 'Invalid job id';
        validationFlag *= false;
    }
    if(!req.params.institute_id){
        error.institute_id = 'Invalid institute id';
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
            var combProcQuery = "";
            var instituteId = req.params.institute_id.split(',');
            console.log(instituteId);
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        for (var i = 0; i < instituteId.length; i++ ) {
                            var procParams = st.db.escape(req.params.job_id) + ',' + st.db.escape(instituteId[i]) ;
                            var procQuery = 'CALL pdeletejobinstitue(' + procParams + ');';
                            combProcQuery += procQuery;
                        }
                        console.log("combProcQuery :"+combProcQuery);
                        st.db.query(combProcQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            var intituteInUse = [];
                                            var deletedInstitute = [];
                                            for (var k = 0; k < results.length/2; k++ ){
                                                var count = (k) ? 2 * k : 0;
                                                if (results[count][0].error_code == 'in_use') {
                                                    intituteInUse.push(results[count][0].institue_id);
                                                    console.log(intituteInUse);
                                                }
                                                else {
                                                    deletedInstitute.push(results[count][0].institue_id);
                                                    console.log(deletedInstitute);
                                                }
                                            }
                                            var respMsg = '';
                                            if ((intituteInUse.length > 0) && (deletedInstitute.length > 0)){
                                                respMsg = 'Some institutes are deleted and some are in use';
                                            }
                                            else if (intituteInUse.length > 0){
                                                respMsg = 'Institutes are in use';
                                            }
                                            else if (deletedInstitute.length > 0){
                                                respMsg = 'Institutes deleted successfully';
                                            }
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = respMsg;
                                            responseMessage.data = {
                                                intituteInUse : intituteInUse,
                                                deletedInstitute : deletedInstitute
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in deleting job of institute';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in deleting job of institute';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in deleting job of institute';
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
                                console.log('Error : pdeletejobinstitue ',err);
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
                        console.log('deleteJobInstitute: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : deleteJobInstitute ',err);
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
            console.log('Error deleteJobInstitute :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

module.exports = Configuration;







