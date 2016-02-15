/**
 *  @author Anjali Pandya
 *  @since Feb 03,2016  10:46AM
 *  @title Hris Master module
 *  @description Handles HRIS  functions
 */
"use strict";

var util = require('util');
var validator = require('validator');

var uuid = require('node-uuid');
var gcloud = require('gcloud');
var fs = require('fs');
var path = require('path');


var stream = require( "stream" );
var chalk = require( "chalk" );
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

var st = null;
function HrisHRM(db,stdLib){

    if(stdLib){
        st = stdLib;

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
HrisHRM.prototype.hrisSaveHRMimg = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
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
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        console.log(req.files);
                        if (req.files) {
                            if(req.files){
                                var deleteTempFile = function(){
                                    fs.unlink('../bin/'+req.files.pr.path);
                                    console.log("Image Path is deleted from server");
                                };
                                var readStream = fs.createReadStream(req.files.pr.path);
                                var uniqueFileName = uuid.v4() + ((req.files.pr.extension) ? ('.' + req.files.pr.extension) : '');
                                console.log(uniqueFileName);
                                uploadDocumentToCloud(uniqueFileName, readStream, function (err) {
                                    if (!err) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Image uploaded successfully';
                                        responseMessage.data = {
                                            pic: uniqueFileName
                                        };
                                        deleteTempFile();
                                        res.status(200).json(responseMessage);
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
 * @description Save HRM
 * @accepts json
 * @param token <string> token of login user
 * @param id <int> id of HRM [insert 0,update id]
 * @param ec <string> employee code,
 * @param jtid <int> jtid is jobtitle id if u r selecting from master
 * @param jt <string> jobtitle if u r entering new title no need to send if u r selecting from master(''),
 * @param fn <string> first name,
 * @param ln <string> last name,
 * @param blocid <int> business location id,
 * @param bloc <string> Business Location title,
 * @param deptid <int> Department id,
 * @param dept <string> department title,
 * @param jdate <datetime> joining date,
 * @param gradeid <int> grade id,
 * @param grade <string> grade title,
 * @param rmid <int> Reporting manager id,
 * @param ezeoneid <string> ezeone id of employee,
 * @param st <int> status  1-Active 2-Quit,
 * @param exitdate <datetime> exit datetime (default null),
 * @param einfn <string> employee information,
 * @param picpath <string> random path of image
 *
 */
HrisHRM.prototype.hrisSaveHRM = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.einfn){
        //error.einfn = 'Invalid employee information';
        //validationFlag *= false;
        /**
         * Non mandatory parameter
         */
        req.body.eifn = "";
    }
    if (!validator.isLength(req.body.fn, 3, 45)) {
        error.fn = 'First Name can be maximum 45 characters';
        validationFlag *= false;
    }
    if (req.body.id){
        if (isNaN(req.body.id)) {
            error.id = 'Invalid id of HRM';
            validationFlag *= false;
        }
    }
    else {
        req.body.id = 0;
    }
    if (req.body.jtid){
        if (isNaN(req.body.jtid)) {
            error.jtid = 'Invalid id of Job Title';
            validationFlag *= false;
        }
    }
    else {
        req.body.jtid = 0;
    }
    if (req.body.blocid){
        if (isNaN(req.body.blocid)) {
            error.blocid = 'Invalid id of business location';
            validationFlag *= false;
        }
    }
    else {
        req.body.blocid = 0;
    }
    if (req.body.deptid){
        if (isNaN(req.body.deptid)) {
            error.deptid = 'Invalid id of HRM';
            validationFlag *= false;
        }
    }
    else {
        req.body.deptid = 0;
    }
    if (req.body.gradeid){
        if (isNaN(req.body.gradeid)) {
            error.gradeid = 'Invalid id of grade';
            validationFlag *= false;
        }
    }
    else {
        req.body.gradeid = 0;
    }
    if (req.body.rmid){
        if (isNaN(req.body.rmid)) {
            error.rmid = 'Invalid id of Reporting manager';
            validationFlag *= false;
        }
    }
    else {
        req.body.rmid = 0;
    }
    if (isNaN(req.body.st)) {
        error.st = 'Invalid status';
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
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.id) + ',' + st.db.escape(req.body.ec)
                            + ',' + st.db.escape(req.body.jtid)+ ',' + st.db.escape(req.body.jt)+ ',' + st.db.escape(req.body.fn)
                            + ',' + st.db.escape(req.body.ln)+ ',' + st.db.escape(req.body.blocid)+ ',' + st.db.escape(req.body.bloc)
                            + ',' + st.db.escape(req.body.deptid)+ ',' + st.db.escape(req.body.dept)+ ',' + st.db.escape(req.body.jdate)
                            + ',' + st.db.escape(req.body.gradeid)+ ',' + st.db.escape(req.body.grade)+ ',' + st.db.escape(req.body.rmid)
                            + ',' + st.db.escape(req.body.ezeoneid)+ ',' + st.db.escape(req.body.st)+ ',' + st.db.escape(req.body.exitdate)
                            + ',' + st.db.escape(req.body.einfn)+ ',' + st.db.escape(req.body.picpath);
                        var procQuery = 'CALL psaveHRM(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].id){
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'HRM added successfully';
                                                responseMessage.data = {
                                                    id : results[0][0].id,
                                                    pic : req.body.picpath
                                                };
                                                res.status(200).json(responseMessage);
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding HRM';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding HRM';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding  HRM';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in adding HRM';
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
                                console.log('Error : psaveHRM ',err);
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
                        console.log('hrisSaveHRM: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRM ',err);
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
            console.log('Error hrisSaveHRM :  ',ex);
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
 * @description get HRM details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 *
 */
HrisHRM.prototype.hrisGetHRM = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
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
                        var procParams = st.db.escape(req.query.hrm_id);
                        var procQuery = 'CALL pgetHRM(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM details loaded successfully';
                                            responseMessage.data = results[0][0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'HRM details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'HRM details are not available';
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
                                console.log('Error : pgetHRM ',err);
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
                        console.log('hrisGetHRM: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRM ',err);
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
            console.log('Error hrisGetHRM :  ',ex);
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
 * @param hrmid <int> id of HRM
 * @param pr_al1 <string> present addressline 1,
 * @param pr_al2 <stringt> present addressline 2,
 * @param pr_city <string> present city title,
 * @param pr_state <string> present state title,
 * @param pr_country <string> present country,
 * @param pr_pc <int> present address postal code,
 * @param pe_al1 <string> permanent Addressline1,
 * @param pe_al2  <int> permanent Addressline2,
 * @param pe_city <string> permanent city title,
 * @param pe_state <string> permanent state,
 * @param pe_country <string> permanent country ,
 * @param pe_pc <string> permanent postal code,
 * @param mobile <string> mobile number,
 * @param phone <string> phone number,
 * @param email <string> email,
 * @param misd <string> mobile number isd code,
 * @param pisd <string> phone number isd code,
 * @param notes <string> notes of the employer
 *
 */
HrisHRM.prototype.hrisSaveHRMContactDtl = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(req.body.hrmid) || (req.body.hrmid <= 0)){
        error.hrmid = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (!validator.isEmail(req.body.email)) {
        error.e = 'Invalid Email';
        validationFlag *= false;
    }
    if (isNaN(req.body.mobile)){
        error.e = 'Invalid Mobile Number';
        validationFlag *= false;
    }
    //if (!validator.isLength((req.body.fn), 3, 45)) {
    //    error.fn = 'First Name can be maximum 45 characters';
    //    validationFlag *= false;
    //}

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var image = null;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.hrmid) + ',' + st.db.escape(req.body.pr_al1)
                            + ',' + st.db.escape(req.body.pr_al2)+ ',' + st.db.escape(req.body.pr_city)+ ',' + st.db.escape(req.body.pr_state)
                            + ',' + st.db.escape(req.body.pr_country)+ ',' + st.db.escape(req.body.pr_pc)+ ',' + st.db.escape(req.body.pe_al1)
                            + ',' + st.db.escape(req.body.pe_al2)+ ',' + st.db.escape(req.body.pe_city)+ ',' + st.db.escape(req.body.pe_state)
                            + ',' + st.db.escape(req.body.pe_country)+ ',' + st.db.escape(req.body.pe_pc)+ ',' + st.db.escape(req.body.mobile)
                            + ',' + st.db.escape(req.body.phone)+ ',' + st.db.escape(req.body.email)+ ',' + st.db.escape(req.body.misd)
                            + ',' + st.db.escape(req.body.pisd)+ ',' + st.db.escape(req.body.notes);
                        var procQuery = 'CALL psave_hrm_contactdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'HRM contact details added successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_hrm_contactdetails ',err);
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
                        console.log('hrisSaveHRMContactDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRMContactDtl ',err);
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
            console.log('Error hrisSaveHRMContactDtl :  ',ex);
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
 * @description get HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 *
 */
HrisHRM.prototype.hrisGetHRMContactDtl = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
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
                        var procParams = st.db.escape(req.query.hrm_id);
                        var procQuery = 'CALL pget_hrm_contactdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM contact details loaded successfully';
                                            responseMessage.data = results[0][0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM contact details are not available';
                                            responseMessage.data = {};
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'HRM contact details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'HRM contact details are not available';
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
                                console.log('Error : pget_hrm_contactdetails ',err);
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
                        console.log('hrisGetHRMContactDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMContactDtl ',err);
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
            console.log('Error hrisGetHRMContactDtl :  ',ex);
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
 * @description save employer salary details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> tid of hrm primary details
 * @param ed <datetime> Effective Date
 * @param t_id <int> template ID
 * @param e_sal <array>json objects of ctc and header_id
 */
HrisHRM.prototype.hrisSaveHRMCompnstn = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    if(req.is('json')) {
        var validationFlag = true;
        var error = {};
        if (!req.body.e_sal) {
            error.e_sal = 'Invalid employe salary details';
            validationFlag *= false;
        }
        if (!req.body.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }
        if (isNaN(req.body.hrm_id) || (req.body.hrm_id) < 0 ) {
            error.hrm_id = 'Invalid HRM id';
            validationFlag *= false;
        }
        if (isNaN(req.body.t_id) || (req.body.t_id) < 0 ) {
            error.t_id = 'Invalid template id';
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
                var e_sal = req.body.e_sal;
                st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.hrm_id) + ',' + st.db.escape(req.body.ed)
                                + ',' + st.db.escape(req.body.t_id);
                            var procQuery = 'CALL psave_hrmcompensation(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    for (var i = 0; i < e_sal.length; i++) {
                                                        if (e_sal[i].header_id && e_sal[i].ctc) {
                                                            var procParams = st.db.escape(results[0][0].id) + ',' + st.db.escape(e_sal[i].header_id)
                                                                + ',' + st.db.escape(e_sal[i].ctc) ;
                                                            var procQuery = 'CALL psave_hrmcompensation_details(' + procParams + ')';
                                                            console.log(procQuery);
                                                            st.db.query(procQuery, function (err, resultsDetails) {
                                                                if (!err) {
                                                                    console.log(resultsDetails);
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'Employe salary details added successfully';
                                                                    responseMessage.data = null;
                                                                    res.status(200).json(responseMessage);
                                                                }
                                                                else {
                                                                    responseMessage.error = {
                                                                        server: 'Internal Server Error'
                                                                    };
                                                                    responseMessage.message = 'An error occurred !';
                                                                    res.status(500).json(responseMessage);
                                                                    console.log('Error : pget_hrmcompensation_details ', err);
                                                                    var errorDate = new Date();
                                                                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                                                                }
                                                            });
                                                        }
                                                        else{
                                                            responseMessage.status = false;
                                                            responseMessage.error = null;
                                                            responseMessage.message = 'Invalid header id or ctc';
                                                            responseMessage.data = null;
                                                            res.status(400).json(responseMessage);
                                                        }
                                                    }
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in adding employe salary details';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding employe salary details';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding employe salary details';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding employe salary details';
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
                                    console.log('Error : hrisSaveHRMCompnstn ', err);
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
                            console.log('hrisSaveHRMCompnstn: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : hrisSaveHRMCompnstn ', err);
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
                console.log('Error hrisSaveHRMCompnstn :  ', ex);
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
 * @description get employe salary details
 * @accepts json
 * @param token <string> token of login user
 * @param cid <int> compensation id
 *
 */
HrisHRM.prototype.hrisGetHRMCompnstnDtl = function(req,res,next){
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
    if (isNaN(req.query.cid) || (req.query.cid <= 0)){
        error.cid = 'Invalid compensation id';
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
                        var procParams = st.db.escape(req.query.cid);
                        var procQuery = 'CALL pget_hrmcompensation_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'compensation details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'compensation details are not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'compensation details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'compensation details are not available';
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
                                console.log('Error : pget_hrmcompensation_details ',err);
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
                        console.log('hrisGetHRMCompnstnDtl: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMCompnstnDtl ',err);
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
            console.log('Error hrisGetHRMCompnstnDtl :  ',ex);
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
 * @param ltype_id <int> leave type id
 * @param hrm_id <int> id of HRM
 * @param count <int> number of leave applicable for that leave type
 *
 */
HrisHRM.prototype.hrisSaveHRMLeaveRegi = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(req.body.hrm_id) || (req.body.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (isNaN(req.body.ltype_id) || (req.body.ltype_id <= 0)){
        error.ltype_id = 'Invalid leave type id';
        validationFlag *= false;
    }
    if (isNaN(req.body.count) || (req.body.count <= 0)){
        error.count = 'Count can not be null';
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
            var image = null;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.hrm_id)
                            + ',' + st.db.escape(req.body.ltype_id)+ ',' + st.db.escape(req.body.count);
                        var procQuery = 'CALL psave_hrm_leaveregister(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'HRM leave register added successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_hrm_leaveregister ',err);
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
                        console.log('hrisSaveLeaveRegi: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveLeaveRegi ',err);
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
            console.log('Error hrisSaveLeaveRegi :  ',ex);
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
 * @param ld <datetime> leave datetime
 * @param hrm_id <int> id of HRM
 * @param lt <int> leave type
 * @param nu <int> number of leave applied
 *
 */
HrisHRM.prototype.hrisSaveHRMLeaveAppli = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.ld){
        error.ld = 'Invalid leave date';
        validationFlag *= false;
    }
    if (isNaN(req.body.hrm_id) || (req.body.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (isNaN(req.body.lt) || (req.body.lt <= 0)){
        error.lt = 'Invalid leave type ';
        validationFlag *= false;
    }
    if (isNaN(req.body.nu) || (req.body.nu <= 0)){
        error.nu = 'Number of leave applied can not be null';
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
            var image = null;
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.hrm_id)
                            + ',' + st.db.escape(req.body.ld)+ ',' + st.db.escape(req.body.lt)+ ',' + st.db.escape(req.body.nu);
                        var procQuery = 'CALL psave_hrm_leaveapplication(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'HRM leave application added successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_hrm_leaveapplication ',err);
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
                        console.log('hrisSaveLeaveAppli: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveLeaveAppli ',err);
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
            console.log('Error hrisSaveLeaveAppli :  ',ex);
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
 * @description get HRM leave register details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 *
 */
HrisHRM.prototype.hrisGetHRMLeaveRegi = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
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
                        var procParams = st.db.escape(req.query.hrm_id);
                        var procQuery = 'CALL pget_hrm_leaveregister(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Leave register details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Leave register details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Leave register details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Leave register details are not available';
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
                                console.log('Error : pget_hrm_leaveregister ',err);
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
                        console.log('hrisGetHRMLeaveRegi: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMLeaveRegi ',err);
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
            console.log('Error hrisGetHRMLeaveRegi :  ',ex);
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
 * @description get HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 * @param page_size <int> page_size
 * @param page_count <int> page_count
 *
 */
HrisHRM.prototype.hrisGetHRMLeaveAppli = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (req.query.page_size){
        if (isNaN(req.body.page_size)) {
            error.page_size = 'Page size should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_size = 10;
    }
    if (req.query.page_count){
        if (isNaN(req.query.page_count)) {
            error.page_count = 'Page count should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_count = 0;
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
                        var procParams = st.db.escape(req.query.hrm_id) + ',' + st.db.escape(req.query.page_size)  + ',' + st.db.escape(req.query.page_count);

                        var procQuery = 'CALL pget_hrm_leaveapplication(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Leave applications details loaded successfully';
                                            responseMessage.data = results;
                                            res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Leave applications details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Leave applications details are not available';
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
                                console.log('Error : pget_hrm_leaveapplication ',err);
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
                        console.log('hrisGetHRMLeaveAppli: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMLeaveAppli ',err);
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
            console.log('Error hrisGetHRMLeaveAppli :  ',ex);
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
 * @description get compensation
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 * @param page_size <int> page_size
 * @param page_count <int> page_count
 *
 */
HrisHRM.prototype.hrisGetHRMCompnstn = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (req.query.page_size){
        if (isNaN(req.query.page_size)) {
            error.page_size = 'Page size should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_size = 10;
    }
    if (req.query.page_count){
        if (isNaN(req.query.page_count)) {
            error.page_count = 'Page count should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_count = 0;
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
                        var procParams = st.db.escape(req.query.hrm_id) + ',' + st.db.escape(req.query.page_size)  + ',' + st.db.escape(req.query.page_count);

                        var procQuery = 'CALL pget_hrmcompensation(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'compensation loaded successfully';
                                        responseMessage.data = (results[1]) ? results[1] : [];
                                        responseMessage.count = (results[0][0]) ? results[0][0].count : 0;
                                        res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Compensation is not available';
                                        responseMessage.data = null;
                                        responseMessage.count = (results[0][0]) ? results[0][0].count : 0;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Compensation is not available';
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
                                console.log('Error : pget_hrmcompensation ',err);
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
                        console.log('hrisGetHRMCompnstn: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMCompnstn ',err);
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
            console.log('Error hrisGetHRMCompnstn :  ',ex);
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
 * @description get HRM contact details
 * @accepts json
 * @param token <string> token of login user
 * @param st <string> status
 *
 *
 */
HrisHRM.prototype.hrisGetHRMEmpList = function(req,res,next){
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
    if(isNaN(parseInt(req.query.st)) || parseInt(req.query.st) < 1){
        req.query.st = null;
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
                        var procParams = st.db.escape(req.query.token) + ',' + st.db.escape(req.query.st);

                        var procQuery = 'CALL pload_hrmemployers_list(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM Employe list loaded successfully';
                                            responseMessage.data = results[0];
                                            responseMessage.g_url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET;
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'HRM Employe details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'HRM Employe details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'HRM Employe details are not available';
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
                                console.log('Error : pload_hrmemployers_list ',err);
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
                        console.log('hrisGetHRMEmpList: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMEmpList ',err);
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
            console.log('Error hrisGetHRMEmpList :  ',ex);
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
 * @description save HRM document
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> tid of hrm primary details
 * @param dtid <int> document type id
 * @param dt <int> document type like 1-Document ,2-Link
 * @param path <array> random path of document u generated
 */
HrisHRM.prototype.hrisSaveHRMDoc = function(req,res,next){
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
        if (!req.body.path) {
            error.token = 'Invalid Doc Path';
            validationFlag *= false;
        }
        if (isNaN(req.body.hrm_id) || (req.body.hrm_id) < 0 ) {
            error.hrm_id = 'Invalid HRM id';
            validationFlag *= false;
        }
        if (isNaN(req.body.dt) || (req.body.dt) < 0 ) {
            error.dt = 'Invalid document type';
            validationFlag *= false;
        }
        if (isNaN(req.body.dtid) || (req.body.dtid) < 0 ) {
            error.dtid = 'Invalid Document type id';
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
                            var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.hrm_id) + ',' + st.db.escape(req.body.dtid)
                                + ',' + st.db.escape(req.body.dt)+ ',' + st.db.escape(req.body.path);
                            var procQuery = 'CALL psave_hrmdocument(' + procParams + ')';
                            console.log(procQuery);
                            st.db.query(procQuery, function (err, results) {
                                if (!err) {
                                    console.log(results);
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                if (results[0][0].id) {
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'HRM document added successfully';
                                                    responseMessage.data = {
                                                        id : results[0][0].id
                                                    };
                                                    res.status(200).json(responseMessage);
                                                }
                                                else {
                                                    responseMessage.status = false;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Error in adding HRM document';
                                                    responseMessage.data = null;
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in adding HRM document';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in adding HRM document';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in adding HRM document';
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
                                    console.log('Error : psave_hrmdocument ', err);
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
                            console.log('hrisSaveHRMDoc: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : hrisSaveHRMDoc ', err);
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
                console.log('Error hrisSaveHRMDoc :  ', ex);
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
 * @description get HRM document
 * @accepts json
 * @param token <string> token of login user
 * @param hrm_id <int> hrm id
 * @param page_size <int> page_size
 * @param page_count <int> page_count
 *
 */
HrisHRM.prototype.hrisGetHRMDoc = function(req,res,next){
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
    if (isNaN(req.query.hrm_id) || (req.query.hrm_id <= 0)){
        error.hrm_id = 'Invalid HRM id';
        validationFlag *= false;
    }
    if (req.query.page_size){
        if (isNaN(req.body.page_size)) {
            error.page_size = 'Page size should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_size = 10;
    }
    if (req.query.page_count){
        if (isNaN(req.query.page_count)) {
            error.page_count = 'Page count should be a number';
            validationFlag *= false;
        }
    }
    else {
        req.query.page_count = 0;
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
                        var procParams = st.db.escape(req.query.hrm_id) + ',' + st.db.escape(req.query.page_size)  + ',' + st.db.escape(req.query.page_count);
                        var procQuery = 'CALL pget_hrmdocument(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Document loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Document are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Document are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Document are not available';
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
                                console.log('Error : pget_hrmdocument ',err);
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
                        console.log('hrisGetHRMDoc: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisGetHRMDoc ',err);
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
            console.log('Error hrisGetHRMDoc :  ',ex);
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
 * @description DELETE HRM compensation
 * @accepts json
 * @param token <string> token of login user
 * @param cid <int> HRM compensation id
 *
 */
HrisHRM.prototype.hrisDelHRMCompnstn = function(req,res,next){

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
    if (isNaN(req.params.cid) || (req.params.cid <= 0)){
        error.cid = 'Invalid id of HRM compensation';
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
                        var procParams = st.db.escape(req.params.cid);
                        var procQuery = 'CALL pdelete_hrmcompensation(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'HRM compensation has been deleted successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pdelete_document_type ',err);
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
                        console.log('hrisDelHRMCompnstn: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisDelHRMCompnstn ',err);
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
            console.log('Error hrisDelHRMCompnstn :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

module.exports = HrisHRM;
