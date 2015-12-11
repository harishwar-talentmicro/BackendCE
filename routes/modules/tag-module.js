/**
 * Created by Gowri shankar on 26-11-2015.
 */

"use strict";

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

function Tag(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 * @todo FnSaveStandardTags
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save standard tags
 */
Tag.prototype.saveStandardTags = function(req,res,next){

    var _this = this;


    var token = req.query.token;
    var image = req.body.image;
    var type = 0;   // 0-image, 1-url
    var tag = (!isNaN(parseInt(req.query.tag))) ?  parseInt(req.query.tag) : 'PIC';
    var pin = (!isNaN(parseInt(req.query.pin))) ?  parseInt(req.query.pin) : null;
    var randomName,tagType,imageBuffer;

    if (tag == 0){
        tagType = 0;
    }
    else if(tag == 'PIC') {
        tagType = 2;
    }
    else {
        tagType = 1;
    }



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
                        var originalFileName = '';

                        if (req.files.image) {


                            var uniqueId = uuid.v4();
                            randomName = uniqueId + '.' + req.files.image.extension;
                            originalFileName = req.files.image.name;

                            if (tagType == 0) {

                                console.log('croping tile banner...');

                                var imageParams = {
                                    path: req.files.image.path,
                                    type: req.files.image.extension,
                                    width: '288',
                                    height: '36',
                                    scale: true,
                                    crop: true
                                };

                                FnCropImage(imageParams, function (err, bufferData) {
                                    if (bufferData) {

                                        imageBuffer = bufferData;
                                        uploadtoServer(imageBuffer);
                                    }
                                });
                            }
                            else if (tagType == 1) {
                                console.log('croping info banners...');
                                var imageParams = {
                                    path: req.files.image.path,
                                    type: req.files.image.extension,
                                    width: '880',
                                    height: '293',
                                    scale: true,
                                    crop: true
                                };
                                //console.log(imageParams);
                                FnCropImage(imageParams, function (err, bufferData) {

                                    if (bufferData) {

                                        imageBuffer = bufferData;
                                        uploadtoServer(imageBuffer);
                                    }
                                });

                            }
                            else if (tagType == 2) {
                                console.log('croping profile picture...');
                                var query = "SELECT IDTypeID as idtype FROM tmaster WHERE TID=ifnull((SELECT masterid FROM tloginout WHERE token=" + st.db.escape(token)+'),0)';
                                console.log(query);
                                st.db.query(query, function (err, idResult) {
                                    if (!err) {
                                        if (idResult) {
                                            if (idResult[0].idtype == 1) {
                                                console.log('individual user');
                                                var imageParams = {
                                                    path: req.files.image.path,
                                                    type: req.files.image.extension,
                                                    width: '200',
                                                    height: '200',
                                                    scale: true,
                                                    crop: true
                                                };
                                                //console.log(imageParams);
                                                FnCropImage(imageParams, function (err, bufferData) {

                                                    if (bufferData) {

                                                        imageBuffer = bufferData;
                                                        uploadtoServer(imageBuffer);
                                                    }
                                                });
                                            }
                                            else{
                                                console.log('business user');
                                                var imageParams = {
                                                    path: req.files.image.path,
                                                    type: req.files.image.extension,
                                                    width: '880',
                                                    height: '293',
                                                    scale: true,
                                                    crop: true
                                                };
                                                //console.log(imageParams);
                                                FnCropImage(imageParams, function (err, bufferData) {

                                                    if (bufferData) {

                                                        imageBuffer = bufferData;
                                                        uploadtoServer(imageBuffer);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    else {
                                        console.log('FnSaveStandardTags:error' + err);
                                    }
                                });
                            }

                            var uploadtoServer = function (imageBuffer) {
                                //upload to cloud storage
                                console.log('uploading to cloud server...');
                                console.log(imageBuffer);
                                var gcloud = require('gcloud');
                                var fs = require('fs');


                                var gcs = gcloud.storage({
                                    projectId: req.CONFIG.CONSTANT.GOOGLE_PROJECT_ID,
                                    keyFilename: req.CONFIG.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
                                });

                                // Reference an existing bucket.
                                var bucket = gcs.bucket(req.CONFIG.CONSTANT.STORAGE_BUCKET);

                                bucket.acl.default.add({
                                    entity: 'allUsers',
                                    role: gcs.acl.READER_ROLE
                                }, function (err, aclObject) {
                                });

                                // Upload a local file to a new file to be created in your bucket

                                var remoteWriteStream = bucket.file(randomName).createWriteStream();
                                var bufferStream = new BufferStream(imageBuffer);
                                bufferStream.pipe(remoteWriteStream);

                                //var localReadStream = fs.createReadStream(req.files.image.path);
                                //localReadStream.pipe(remoteWriteStream);


                                remoteWriteStream.on('finish', function () {
                                    var queryParams = st.db.escape(token) + ',' + st.db.escape(type) + ',' + st.db.escape(originalFileName)
                                        + ',' + st.db.escape(tag) + ',' + st.db.escape(pin) + ',' + st.db.escape(randomName);

                                    var query = 'CALL psavedocsandurls(' + queryParams + ')';
                                    console.log(query);
                                    st.db.query(query, function (err, insertResult) {
                                        if (!err) {
                                            if (insertResult.affectedRows > 0) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Tags Save successfully';
                                                responseMessage.data = {
                                                    type: 0,
                                                    tag: tag,
                                                    pin: (!isNaN(parseInt(req.body.pin))) ? parseInt(req.body.pin) : null,
                                                    s_url : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSaveStandardTags: Tags Save successfully');
                                            }
                                            else {
                                                responseMessage.message = 'Tag not Saved';
                                                res.status(200).json(responseMessage);
                                                console.log('FnSaveStandardTags:Tag not Saved');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'An error occured in query ! Please try again';
                                            responseMessage.error = {
                                                server: 'Internal Server Error'
                                            };
                                            res.status(500).json(responseMessage);
                                            console.log('FnSaveStandardTags: error in saving tags:' + err);
                                        }

                                    });
                                });

                                remoteWriteStream.on('error', function () {
                                    responseMessage.message = 'An error occurred';
                                    responseMessage.error = {
                                        server: 'Internal Server error'
                                    };
                                    responseMessage.data = null;
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveStandardTags: Image upload error to google cloud');

                                });

                            };
                        }

                        else if (parseInt(req.body.type) && (!isNaN(req.body.type))) {
                            randomName = req.body.link;

                            var queryParams = st.db.escape(token) + ',' + st.db.escape(type) + ',' + st.db.escape(originalFileName)
                                + ',' + st.db.escape(tag.toString().toUpperCase()) + ',' + st.db.escape(pin) + ',' + st.db.escape(randomName);


                            var query = 'CALL psavedocsandurls(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, insertResult) {
                                if (!err) {
                                    if (insertResult.affectedRows > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Tags Save successfully';
                                        responseMessage.data = {
                                            type: 0,
                                            tag: tag,
                                            pin: (!isNaN(parseInt(req.body.pin))) ? parseInt(req.body.pin) : null,
                                            s_url : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveStandardTags: Tags Save successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Tag not Saved';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveStandardTags:Tag not Saved');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured in query ! Please try again';
                                    responseMessage.error = {
                                        server: 'Internal Server Error'
                                    };
                                    res.status(500).json(responseMessage);
                                    console.log('FnSaveStandardTags: error in saving tags:' + err);
                                }

                            });
                        }

                        else {
                            responseMessage.error = error;
                            responseMessage.message = 'Please check uploading file';
                            res.status(200).json(responseMessage);
                        }

                    }

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveStandardTags: Invalid token');
                    }
                } else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveStandardTags:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveStandardTags ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

function FnCropImage(imageParams, callback){
    /**
     * @todo FnCropImage
     */
    var _this = this;

    console.log('image croping...');

    var fs = require('fs');
    var deleteTempFile = function(){
        fs.unlink('../bin/'+imageParams.path);
        //fs.unlink('../bin/'+imageParams.path1);
    };

    var respMsg = {
        status : false,
        message : 'Invalid image',
        picture : null,
        error : {
            picture : 'Image file is invalid or corrupted'
        }
    };

    var allowedTypes = ['jpg','png'];

    var  targetHeight = (imageParams.height) ? (!isNaN(parseInt(imageParams.height)) ? parseInt(imageParams.height) : 0 ) : 0  ,
        targetWidth = (imageParams.width) ? (!isNaN(parseInt(imageParams.width)) ? parseInt(imageParams.width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (imageParams.crop) ? imageParams.crop : true;
    var scaleFlag = (imageParams.scale) ? imageParams.scale : true;
    var outputType = (allowedTypes.indexOf(imageParams.type) == -1) ? 'png' : imageParams.type;



    if(!(targetHeight && targetWidth)){
        respMsg.message = 'Invalid target dimensions';
        respMsg.error = {
            required_height : (targetHeight) ? 'Invalid target height' : null,
            required_width : (targetWidth) ? 'Invalid target width' : null
        };
        callback(null, null);
        deleteTempFile();
        return;
    }


    try{
        fs.readFile('../bin/'+ imageParams.path,function(err,data){

            if(!err){
                var bitmap = data;
                var gm = require('gm').subClass({ imageMagick: true });
                gm(bitmap).size(function (err, size) {
                    if (!err) {
                        // Orientation landscape

                        if(size.height < size.width){
                            // scale++
                            if(size.height < targetHeight || size.width < targetWidth){
                                if(targetHeight > targetWidth){
                                    console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                    scaleHeight = targetHeight.toString();
                                    ////
                                    scaleWidth = (size.width * scaleHeight)/ size.height;
                                }
                                else{
                                    console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                    scaleHeight = targetHeight;
                                    scaleWidth = (size.width * scaleHeight) / size.height;
                                }
                            }
                            // scale--
                            else{
                                if(targetHeight > targetWidth){
                                    console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                    scaleWidth = targetWidth.toString();
                                    ////
                                    scaleHeight = (scaleWidth * size.height)/ size.width;
                                }
                                else{

                                    console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
                                    scaleHeight = targetHeight.toString();
                                    scaleWidth = (scaleHeight * size.width) / size.height;

                                }
                            }
                        }

                        // Orientation is potrait
                        else{
                            //scale++
                            if(size.height < targetHeight || size.width < targetHeight){
                                if(targetHeight > targetWidth){
                                    console.log('condition false');

                                    scaleHeight = targetHeight.toString();
                                    scaleWidth = (scaleHeight * size.width)/ size.height;
                                }
                                else{
                                    scaleWidth = targetWidth.toString();
                                    scaleHeight = (scaleWidth * size.height) / size.width;
                                }
                            }
                            else{
                                scaleWidth = targetWidth.toString();
                                scaleHeight = (scaleWidth * size.height) / size.width;
                            }
                        }

                        var dimensions = {
                            originalHeight : size.height,
                            originalWidth : size.width,
                            scaleHeight : scaleHeight,
                            scaleWidth : scaleWidth,
                            targetHeight : targetHeight,
                            targetWidth : targetWidth
                        };

                        console.log(dimensions);

                        if(scaleFlag && cropFlag){
                            console.log('Scale and crop');
                            gm(bitmap)
                                .resize(scaleWidth,scaleHeight)
                                .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        var bufferData = croppedBuff;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, bufferData);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture cropped successfully...');
                                    }
                                    else{
                                        //res.status(400).json(respMsg);
                                        callback(null, null);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });
                        }

                        else if(scaleFlag && !cropFlag){
                            gm(bitmap)
                                .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        var bufferData = croppedBuff;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, bufferData);
                                        console.log('FnCropImage:Picture cropped successfully');
                                        deleteTempFile();

                                    }
                                    else{
                                        callback(null, null);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });

                        }

                        else if(!scaleFlag && cropFlag){
                            gm(bitmap)
                                .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        var bufferData = croppedBuff;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, bufferData);
                                        console.log('FnCropImage:Picture cropped successfully');
                                    }
                                    else{
                                        //res.status(400).json(respMsg);
                                        callback(null, null);
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });
                            deleteTempFile();
                        }
                    }
                    else{
                        console.log('FnCropImage : Invalid image file. Unable to find image size :' +err);
                        callback(null, null);

                    }
                });
            }
            else{
                callback(null, null);
                console.log('FnCropImage : Error in reading file :' +err);

            }
        });

    }
    catch(ex){
        console.log(ex);
        callback(null, null);
        console.log('FnCropImage : '+ ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};

/**
 * @todo FnsaveTags`
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save tags
 */
Tag.prototype.saveTags = function(req,res,next){

    var _this = this;

    var standardTagList = ['PIC','1','2','3','4','5','0'];

    var token = (req.query.token) ? req.query.token : '';
    var type = (!isNaN(parseInt(req.query.type)))  ?  parseInt(req.query.type) : 0;  // 0-image, 1- url
    var link = (req.query.link) ? req.query.link : '';
    var tag = (req.query.tag) ? req.query.tag : '';
    var pin = (!isNaN(parseInt(req.query.pin))) ?  parseInt(req.query.pin) : 0;

    var errorList = {};
    var validationStatus = true;


    var fileProperty = '';

    if(!token){
        errorList['token'] = 'Invalid token';
        validationStatus *= false;
    }

    if(type){
        if(!link){
            errorList['link'] = 'Link is required';
            validationStatus *= false;
        }
    }

    if(!type){
        if(req.files){
            for(var pr in req.files){
                if(req.files.hasOwnProperty(pr)){
                    fileProperty = pr;
                }
            }

            if(!pr){
                errorList['image'] = 'File/document is required';
                validationStatus *= false;
            }
        }
        else{
            errorList['image'] = 'File/document is required';
            validationStatus *= false;
        }
    }

    if(!tag){
        errorList['tag'] = 'Tag is required';
        validationStatus *= false;
    }

    if(tag){
        if(standardTagList.indexOf(tag) !== -1){
            errorList['tag'] = 'Standard tags are not allowed';
            validationStatus *= false;
        }
    }



    var respMsg = {
        status : false,
        error : null,
        message : 'Internal Server error!',
        data : null
    };

    if(validationStatus){
        try{
            st.validateToken(token, function (err, result) {
                if(!err){
                    if(result){


                        if(type){
                            /**
                             * Directly save into db
                             */
                            var queryParams = st.db.escape(token) + ',' + st.db.escape(1) + ',' +
                                st.db.escape('')+ ',' + st.db.escape(tag) + ',' + st.db.escape(pin) +
                                ',' + st.db.escape(link);

                            var tagQuery = "CALL psavedocsandurls("+queryParams+")";

                            console.log(tagQuery);
                            st.db.query(tagQuery,function(err,tQResults){
                                if(err){
                                    console.log('queryError in FnSaveTags');
                                    console.log(err);
                                    res.status(400).json(respMsg);
                                }
                                else{
                                    console.log(tQResults);
                                    if(tQResults){
                                        if(tQResults.affectedRows){
                                            respMsg.status = true;
                                            respMsg.message = 'Tag saved successfully';
                                            respMsg.data = {
                                                type: type,
                                                tag: tag,
                                                pin: pin,
                                                s_url : link
                                            };
                                            respMsg.error = null;
                                            res.status(200).json(respMsg);
                                        }
                                        else{
                                            res.status(400).json(respMsg);
                                        }
                                    }
                                    else{
                                        res.status(400).json(respMsg);
                                    }
                                }
                            });

                        }
                        else{
                            /**
                             * Upload file to cloud and then save to db
                             */

                            var readStream = fs.createReadStream(req.files[pr].path);
                            var uniqueFileName = uuid.v4() + ((req.files[pr].extension) ? ('.'+req.files[pr].extension) : '');
                            var originalFileName = req.files[pr].originalname;

                            uploadDocumentToCloud(uniqueFileName,readStream,function(err){
                                if(!err){
                                    var queryParams = st.db.escape(token) + ',' + st.db.escape('0') + ',' +
                                        st.db.escape(originalFileName)+ ',' + st.db.escape(tag) + ',' + st.db.escape(pin) +
                                        ',' + st.db.escape(uniqueFileName);

                                    var tagQuery = "CALL psavedocsandurls("+queryParams+")";

                                    console.log(tagQuery);
                                    st.db.query(tagQuery,function(err,tQResults){
                                        if(err){
                                            console.log('queryError in FnSaveTags');
                                            console.log(err);
                                            res.status(400).json(respMsg);
                                        }
                                        else{
                                            console.log(tQResults);
                                            if(tQResults){
                                                if(tQResults.affectedRows){
                                                    respMsg.status = true;
                                                    respMsg.message = 'Tag saved successfully';
                                                    respMsg.data = {
                                                        type: type,
                                                        tag: tag,
                                                        pin: pin,
                                                        s_url : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + uniqueFileName
                                                    };
                                                    respMsg.error = null;
                                                    res.status(200).json(respMsg);
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            }
                                            else{
                                                res.status(400).json(respMsg);
                                            }
                                        }
                                    });
                                }
                                else{
                                    res.status(400).json(respMsg);
                                }

                            });

                        }
                    }
                    else{
                        respMsg.error['token'] = 'Invalid token';
                        res.status(400).json(respMsg);
                    }
                }
                else{
                    console.log('Error in FnSaveTags');
                    console.log(err);
                    res.status(400).json(respMsg);
                }
            });
        }
        catch(ex){
            console.log('Exception in FnSaveTags');
            console.log(ex);
            res.status(400).json(respMsg);
        }
    }
    else{
        respMsg.error = errorList;
        respMsg.message = 'Check errors and mandatory fields';

        res.status(400).json(respMsg);
    }

};

/**
 * @todo FnGetStandardTags
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for download resume
 */
Tag.prototype.getStandardTags = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var output = [];

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pgetDocsandurls(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getresult) {
                            if (!err) {
                                if (getresult[0]) {

                                    for( var i=0; i < getresult[0].length;i++){
                                        var result = {};
                                        result.tid = getresult[0][i].tid;
                                        result.imageurl = getresult[0][i].type;
                                        result.pin = getresult[0][i].pin;
                                        result.imagepath = getresult[0][i].path;
                                        result.tag = getresult[0][i].tag;
                                        result.imagefilename = getresult[0][i].imagefilename;
                                        result.s_url = (getresult[0][i].imageurl) ?
                                            getresult[0][i].imagefilename :
                                        req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getresult[0][i].path;
                                        output.push(result);
                                    }

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Tags Loaded successfully';
                                    responseMessage.data = output;

                                    res.status(200).json(responseMessage);
                                    console.log('FnGetStandardTags: Tags Loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Tags not Loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetStandardTags:Tags not Loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetStandardTags: error in getting tags:' + err);
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
                        console.log('FnGetStandardTags: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetStandardTags:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetStandardTags ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTags
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get tags
 */
Tag.prototype.getTags = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var startCount = ((!isNaN(parseInt(req.query.pc))) && parseInt(req.query.pc) > 0) ?  parseInt(req.query.pc) : 0;
    var recordsPerPage = ((!isNaN(parseInt(req.query.ps))) && parseInt(req.query.ps) > 0 ) ?  parseInt(req.query.ps) : 10;

    var output = [];

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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(startCount)+ ',' + st.db.escape(recordsPerPage);
                        var query = 'CALL pgetAllDocsandurls(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getresult) {
                            if (!err) {
                                console.log(getresult);
                                if (getresult[0]) {

                                    for( var i=0; i < getresult[0].length;i++){
                                        var result = {};
                                        result.tid = getresult[0][i].tid;
                                        result.imageurl = getresult[0][i].type;
                                        result.pin = getresult[0][i].pin;
                                        result.imagepath = getresult[0][i].path;
                                        result.tag = getresult[0][i].tag;
                                        result.imagefilename = getresult[0][i].imagefilename;
                                        result.s_url = (getresult[0][i].type) ?
                                            getresult[0][i].path :
                                        req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getresult[0][i].path;
                                        output.push(result);
                                    }


                                    responseMessage.status = true;
                                    responseMessage.tc = (getresult[1]) ? ((getresult[1][0]) ? getresult[1][0].tc : 0) : 0;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Tags Loaded successfully';
                                    responseMessage.data = output;
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTags: Tags Loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Tags not Loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTags:Tags not Loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetTags: error in getting Tags:' + err);
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
                        console.log('FnGetTags: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetTags:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTags ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
Tag.prototype.deleteTag = function(req,res,next) {
    /**
     * @todo FnDeleteTag
     */
    var _this = this;


    var token = req.query.token;
    var tag = req.query.tag;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    try {
        st.validateToken(token, function (err, result) {
            if (!err) {
                if (result) {
                    var queryParams = st.db.escape(token) + ',' + st.db.escape(tag);
                    var query = 'CALL pdeleteTag(' + queryParams + ')';
                    console.log(query);
                    st.db.query(query, function (err, deleteResult) {
                        console.log(deleteResult);
                        if (!err) {
                            if (deleteResult.affectedRows > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Tag deleted Successfully';
                                responseMessage.data = {
                                    tag : tag
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnDeleteTag: Tag deleted successfully');
                            }
                            else {
                                responseMessage.message = 'Tag is not deleted';
                                res.status(200).json(responseMessage);
                                console.log('FnDeleteTag:Tag is not deleted');
                            }
                        }
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            res.status(500).json(responseMessage);
                            console.log('FnDeleteTag: error in deleting tag :' + err);
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
                    console.log('FnDeleteTag: Invalid token');
                }
            }
            else {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'Error in validating Token';
                res.status(500).json(responseMessage);
                console.log('FnDeleteTag:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(500).json(responseMessage);
        console.log('Error : FnDeleteTag ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnSavePictures
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get save pictures
 */
Tag.prototype.savePictures = function(req,res,next) {
    var _this = this;
    var fs = require("fs");

    // params order
    //flag,token,tag,type,pin,link,tid
    var params = req.body.params;
    var flag,token, tagType,type,pin,link,tid,randomName = '', originalFileName = '', imageBuffer, tags, spQuery;
    params = params.split(',');
    console.log('----------params--------');
    console.log(params);

    flag = params[0]; // 1-send token,2-send tid
    token = params[1];
    tagType = params[2] ? params[2] : 'PIC';
    type = params[3] ? params[3] : 0;   // 0 - image, 1-url
    pin = params[4] ? params[4] : null;
    link = params[5] ? params[5] : '';
    tid = params[6] ? params[6] : 0;


    if (tagType == 0) {
        tags = 0;
    }
    else if (tagType == 'PIC') {
        tags = 2;
    }
    else {
        tags = 1;
    }

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if (flag == 1) {
        if (!token) {
            error['token'] = 'Invalid token';
            validateStatus *= false;
        }
    }
    else {
        if (!tid) {
            error['tid'] = 'Invalid tid';
            validateStatus *= false;
        }
    }


    if (!validateStatus) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            if (token) {
                st.validateToken(token, function (err, result) {
                    if (!err) {
                        if (result) {
                            console.log('token is valid');
                            token = token;
                        }
                        else {
                            responseMessage.message = 'Invalid token';
                            responseMessage.error = {
                                token: 'invalid token'
                            };
                            responseMessage.data = null;
                            res.status(401).json(responseMessage);
                            console.log('FnSavePictures: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal server error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                        console.log('FnSavePictures:Error in processing Token' + err);
                    }
                });
            }
            else {
                tid = tid;
            }

            if(type == 0) {

                if (req.files.image) {

                    var uniqueId = uuid.v4();
                    var filetype = (req.files.image.extension) ? req.files.image.extension : 'jpg';
                    randomName = uniqueId + '.' + filetype ;
                    originalFileName = req.files.image.name;


                    //upload to cloud storage
                    console.log('uploading to cloud server...');

                    var gcloud = require('gcloud');
                    var fs = require('fs');

                    var gcs = gcloud.storage({
                        projectId: req.CONFIG.CONSTANT.GOOGLE_PROJECT_ID,
                        keyFilename: req.CONFIG.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
                    });

                    // Reference an existing bucket.
                    var bucket = gcs.bucket(req.CONFIG.CONSTANT.STORAGE_BUCKET);

                    bucket.acl.default.add({
                        entity: 'allUsers',
                        role: gcs.acl.READER_ROLE
                    }, function (err, aclObject) {
                    });

                    // Upload a local file to a new file to be created in your bucket

                    var localReadStream = fs.createReadStream(req.files.image.path);
                    var remoteWriteStream = bucket.file(randomName).createWriteStream();
                    localReadStream.pipe(remoteWriteStream);
                    remoteWriteStream.on('finish', function () {
                        if (token) {
                            var queryParams = st.db.escape(token) + ',' + st.db.escape(type) + ',' + st.db.escape(originalFileName)
                                + ',' + st.db.escape(tagType) + ',' + st.db.escape(pin) + ',' + st.db.escape(randomName);
                            spQuery = 'CALL psavedocsandurls(' + queryParams + ')';
                        }
                        else {
                            var queryParams = st.db.escape(parseInt(tid)) + ',' + st.db.escape(type) + ',' + st.db.escape(originalFileName)
                                + ',' + st.db.escape(tagType) + ',' + st.db.escape(pin) + ',' + st.db.escape(randomName);

                            spQuery = 'CALL psavedocsandurlsAP(' + queryParams + ')';
                        }

                        console.log(spQuery);
                        st.db.query(spQuery, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Image Saved successfully';
                                    responseMessage.data = {
                                        type: type,
                                        tag: tagType,
                                        pin: (!isNaN(parseInt(pin))) ? parseInt(pin) : null,
                                        s_url : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSavePictures: Image Saved  successfully');
                                }
                                else {
                                    responseMessage.message = 'Image not Saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSavePictures:Image not Saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSavePictures: error in saving image:' + err);
                            }
                        });
                    });
                    remoteWriteStream.on('error', function () {
                        responseMessage.message = 'An error occurred';
                        responseMessage.error = {
                            server: 'Cloud Server error'
                        };
                        responseMessage.data = null;
                        res.status(400).json(responseMessage);
                        console.log('FnSavePictures: Image upload error to google cloud');

                    });


                }
                else {
                    responseMessage.message = 'An error occurred';
                    responseMessage.error = 'Invalid image files';
                    responseMessage.data = null;
                    res.status(400).json(responseMessage);
                    console.log('FnSavePictures: Image not accessing');

                }
            }
            else {

                randomName = (req.body.link) ? req.body.link : '';

                var queryParams = st.db.escape(token) + ',' + st.db.escape(type) + ',' + st.db.escape(originalFileName)
                    + ',' + st.db.escape(tagType) + ',' + st.db.escape(pin) + ',' + st.db.escape(randomName);


                var query = 'CALL psavedocsandurls(' + queryParams + ')';
                console.log(query);
                st.db.query(query, function (err, insertResult) {
                    if (!err) {
                        if (insertResult.affectedRows > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Link Save successfully';
                            responseMessage.data = {
                                type: type,
                                tag: tagType,
                                pin: (!isNaN(parseInt(req.body.pin))) ? parseInt(req.body.pin) : null,
                                s_url : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName
                            };
                            res.status(200).json(responseMessage);
                            console.log('FnSavePictures: Link Save successfully');
                        }
                        else {
                            responseMessage.message = 'Link not Saved';
                            res.status(200).json(responseMessage);
                            console.log('FnSavePictures:Link not Saved');
                        }
                    }
                    else {
                        responseMessage.message = 'An error occured in query ! Please try again';
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        res.status(500).json(responseMessage);
                        console.log('FnSavePictures: error in saving link:' + err);
                    }

                });
            }

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSavePictures ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Tag;




