/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title image module
 *  @description Handles functions related to crop image
 *  1. cropping image
 *
 */
"use strict";
var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

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

function Image(db,stdLib){

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
Image.prototype.cropImage = function(req,res,next){
    /**
     * @todo FnCropImage
     */
    var _this = this;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var fs = require('fs');

    //console.log(req.files.image.path);
    var deleteTempFile = function(){
        fs.unlink('../bin/'+req.files.image.path);
    };


    var respMsg = {
        status : false,
        message : 'Invalid image',
        picture : null,
        error : {
            picture : 'Image file is invalid or corrupted'
        }
    };


    //res.json(req.body);
    //
    //return;

    var allowedTypes = ['jpg','png'];

    var  targetHeight = (req.query.required_height) ? (!isNaN(parseInt(req.query.required_height)) ? parseInt(req.query.required_height) : 0 ) : 0  ;

    var   targetWidth = (req.query.required_width) ? (!isNaN(parseInt(req.query.required_width)) ? parseInt(req.query.required_width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (req.query.crop) ? req.query.crop : true;
    var scaleFlag = (req.query.scale) ? req.query.scale : true;
    var token = (req.query.Token && req.body.Token !==2 ) ? req.query.Token : '';
    var outputType = (allowedTypes.indexOf(req.query.output_type) == -1) ? 'png' : req.query.output_type;

    if(!(targetHeight && targetWidth)){
        respMsg.message = 'Invalid target dimensions';
        respMsg.error = {
            required_height : (targetHeight) ? 'Invalid target height' : null,
            required_width : (targetWidth) ? 'Invalid target width' : null
        };
        res.status(400).json(respMsg);
        deleteTempFile();
        return;
    }

    if(!token){
        respMsg.message = 'Please login to continue';
        respMsg.error = {
            Token : 'Token is invalid'
        };
        res.status(401).json(respMsg);
        deleteTempFile();
        return;
    }

    st.validateToken(token, function (err, Result) {
        if (!err) {
            if (Result != null) {
                try {

                    if (req.files) {
                        var type = req.files.image.mimetype;
                        if (type == 'image/jpeg' || type == 'image/jpg' || type == 'image/gif' || type == 'image/png') {

                            //var bitmap = fs.readFileSync('../bin/'+req.files.image.path);

                            fs.readFile('../bin/' + req.files.image.path, function (err, data) {
                                if (!err) {
                                    var bitmap = data;
                                    var gm = require('gm').subClass({imageMagick: true});
                                    gm(bitmap).size(function (err, size) {
                                        if (!err) {
                                            // Orientation landscape
                                            if (size.height < size.width) {
                                                // scale++
                                                if (size.height < targetHeight || size.width < targetWidth) {
                                                    if (targetHeight > targetWidth) {
                                                        console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                                        scaleHeight = targetHeight.toString();
                                                        ////
                                                        scaleWidth = (size.width * scaleHeight) / size.height;
                                                    }
                                                    else {
                                                        console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                                        scaleHeight = targetHeight;
                                                        scaleWidth = (size.width * scaleHeight) / size.height;
                                                    }
                                                }
                                                // scale--
                                                else {
                                                    if (targetHeight > targetWidth) {
                                                        console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                                        scaleWidth = targetWidth.toString();
                                                        ////
                                                        scaleHeight = (scaleWidth * size.height) / size.width;
                                                    }
                                                    else {

                                                        console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
                                                        scaleHeight = targetHeight.toString();
                                                        ////
                                                        scaleWidth = (scaleHeight * size.width) / size.height;

                                                    }
                                                }
                                            }

                                            // Orientation is potrait
                                            else {
                                                //scale++
                                                if (size.height < targetHeight || size.width < targetHeight) {
                                                    if (targetHeight > targetWidth) {
                                                        console.log('condition false');

                                                        scaleHeight = targetHeight.toString();
                                                        scaleWidth = (scaleHeight * size.width) / size.height;


                                                    }
                                                    else {
                                                        scaleWidth = targetWidth.toString();
                                                        scaleHeight = (scaleWidth * size.height) / size.width;
                                                    }
                                                }
                                                else {
                                                    scaleWidth = targetWidth.toString();
                                                    ////
                                                    scaleHeight = (scaleWidth * size.height) / size.width;
                                                }
                                            }

                                            var dimensions = {
                                                originalHeight: size.height,
                                                originalWidth: size.width,
                                                scaleHeight: scaleHeight,
                                                scaleWidth: scaleWidth,
                                                targetHeight: targetHeight,
                                                targetWidth: targetWidth
                                            };

                                            console.log(dimensions);

                                            if (scaleFlag && cropFlag) {
                                                console.log('Scale and crop');
                                                gm(bitmap)
                                                    .resize(scaleWidth, scaleHeight)
                                                    .crop(targetWidth, targetHeight, 0, 0).toBuffer(outputType.toUpperCase(), function (err, croppedBuff) {
                                                        if (!err) {
                                                            var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                            var picUrl = 'data:image/' + outputType + ';base64,' + cdataUrl;
                                                            res.status(200).json({
                                                                status: true,
                                                                picture: picUrl,
                                                                message: 'Picture cropped successfully'
                                                            });
                                                        }
                                                        else {
                                                            res.status(400).json(respMsg);
                                                        }
                                                    });
                                                console.log('FnCropImage:Picture cropped successfully...');
                                                deleteTempFile();
                                            }

                                            else if (scaleFlag && !cropFlag) {
                                                gm(bitmap)
                                                    .resize(scaleWidth, scaleHeight).toBuffer(outputType.toUpperCase(), function (err, croppedBuff) {
                                                        if (!err) {
                                                            var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                            var picUrl = 'data:image/' + outputType + ';base64,' + cdataUrl;
                                                            res.status(200).json({
                                                                status: true,
                                                                picture: picUrl,
                                                                message: 'Picture cropped successfully'
                                                            });
                                                            console.log('FnCropImage:Picture cropped successfully');
                                                            deleteTempFile();
                                                        }
                                                        else {
                                                            res.status(400).json(respMsg);
                                                        }
                                                    });

                                            }

                                            else if (!scaleFlag && cropFlag) {
                                                gm(bitmap)
                                                    .crop(targetWidth, targetHeight, 0, 0).toBuffer(outputType.toUpperCase(), function (err, croppedBuff) {
                                                        if (!err) {
                                                            var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                            var picUrl = 'data:image/' + outputType + ';base64,' + cdataUrl;
                                                            res.status(200).json({
                                                                status: true,
                                                                picture: picUrl,
                                                                message: 'Picture cropped successfully'
                                                            });
                                                        }
                                                        else {
                                                            res.status(400).json(respMsg);
                                                        }
                                                    });
                                            }
                                        }
                                        else {
                                            throw new Error('FnCropImage : Invalid image file. Unable to find image size');
                                            res.status(400).json(respMsg);
                                        }
                                    });
                                }
                                else {
                                    res.status(400).json(respMsg);
                                    throw new Error('FnCropImage : Error in reading file ' + ex.description);
                                }
                            });
                        }
                        else {
                            res.status(400).json(respMsg);
                            console.log('invalid image file');
                        }
                    }
                    else {
                        res.status(400).json(respMsg);
                        console.log('invalid image file');
                    }
                }
                catch(ex){
                    console.log(ex);
                    res.status(400).json(respMsg);
                    console.log('FnCropImage : '+ ex.description);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            }
            else{
                respMsg.message = 'Please login to continue';
                respMsg.error = {
                    Token : 'Token is invalid'
                };
                res.status(401).json(respMsg);
                throw new Error('FnCropImage : '+ 'Invalid Token');
            }
        }
        else{
            throw new Error('FnCropImage : '+ 'Error in query execution while validating token');
            res.status(400).json(respMsg);
        }
    });

};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Image.prototype.imageURL = function(req,res,next){
    /**
     * @todo FnImageURL
     */
    var _this = this;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var image_url = req.query.image_url ? req.query.image_url : 2;   // image_url : 1- getting modules images, 2 - splash images
        var image_id = req.query.image_id ? req.query.image_id : 0;      //image_id  : 0 - call test serever, 1- call live sever

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };
        if (image_id == 0 ){
            if(image_url == 1) {
                var image_url1 = 'http://104.199.128.226:3001/images/sales_enquiry.jpg';
                var image_url2 = 'http://104.199.128.226:3001/images/home_delivery.jpg';
                var image_url3 = 'http://104.199.128.226:3001/images/reservations.jpg';
                var image_url4 = 'http://104.199.128.226:3001/images/help_desk.jpg';
                var image_url5 = 'http://104.199.128.226:3001/images/human_resources.jpg';
                responseMessage.status = true;
                responseMessage.data = {pager_url1: image_url1,pager_url2: image_url2, pager_url3: image_url3,pager_url4: image_url4,pager_url5: image_url5};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }

            else {
                var image_url1 = 'http://104.199.128.226:3001/images/splash_theme_1.png';
                var image_url2 = 'http://104.199.128.226:3001/images/splash_theme_2.png';
                var image_url3 = 'http://104.199.128.226:3001/images/splash_theme_3.png';
                var image_url4 = 'http://104.199.128.226:3001/images/splash_theme_4.png';
                var image_url5 = 'http://104.199.128.226:3001/images/splash_theme_5.png';
                responseMessage.status = true;
                responseMessage.data = {splash_url1: image_url1,splash_url2: image_url2, splash_url3: image_url3,splash_url4: image_url4,splash_url5: image_url5};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }
        }
        else{
            if(image_url == 1) {
                var image_url1 = 'https://www.ezeone.com/images/sales_enquiry.jpg';
                var image_url2 = 'https://www.ezeone.com/images/home_delivery.jpg';
                var image_url3 = 'https://www.ezeone.com/images/reservations.jpg';
                var image_url4 = 'https://www.ezeone.com/images/help_desk.jpg';
                var image_url5 = 'https://www.ezeone.com/images/human_resources.jpg';
                responseMessage.status = true;
                responseMessage.data = {pager_url1: image_url1,pager_url2: image_url2, pager_url3: image_url3,pager_url4: image_url4,pager_url5: image_url5};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }

            else {
                var image_url1 = 'https://www.ezeone.com/images/splash_theme_1.png';
                var image_url2 = 'https://www.ezeone.com/images/splash_theme_2.png';
                var image_url3 = 'https://www.ezeone.com/images/splash_theme_3.png';
                var image_url4 = 'https://www.ezeone.com/images/splash_theme_4.png';
                var image_url5 = 'https://www.ezeone.com/images/splash_theme_5.png';
                responseMessage.status = true;
                responseMessage.data = {splash_url1: image_url1,splash_url2: image_url2, splash_url3: image_url3,splash_url4: image_url4,splash_url5: image_url5};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnImageURL:error ' + ex.description);
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
Image.prototype.profileImageURL = function(req,res,next){
    /**
     * @todo FnProfileImageURL
     */
    var _this = this;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var serverId = req.query.server_id ? req.query.server_id : 0;      //image_id  : 0 - call test serever, 1- call live sever

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };
        if (serverId == 0 ){
                var image_url1 = 'http://104.199.128.226:3001/images/EZEOne_profile.png';
                responseMessage.status = true;
                responseMessage.data = {EZEOne_profile: image_url1};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }
        else {
                var image_url1 = 'https://www.ezeone.com/images/EZEOne_profile.png';
                responseMessage.status = true;
                responseMessage.data = {EZEOne_profile: image_url1};
                responseMessage.error = null;
                responseMessage.message = ' Image URL Send successfully';
                console.log('FnImageURL:Image URL Send successfully');
                res.status(200).json(responseMessage);
            }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnImageURL:error ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};


/**
 * @todo FnGetPictureOfEzeid
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get picture of ezeid
 */
Image.prototype.getPictureOfEzeid = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id);
                        var query = 'CALL pgetpictureofEZEID(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                          
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Picture loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetPictureOfEzeid: Picture loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Picture not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetPictureOfEzeid:Picture not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Picture not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetPictureOfEzeid:Picture not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetPictureOfEzeid: error in getting picture:' + err);
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
                        console.log('FnGetPictureOfEzeid: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetPictureOfEzeid:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetPictureOfEzeid ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

module.exports = Image;