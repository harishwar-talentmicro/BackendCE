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

    console.log(req.files.image.path);
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

    var allowedTypes = ['jpg','png'];

    var  targetHeight = (req.body.required_height) ? (!isNaN(parseInt(req.body.required_height)) ? parseInt(req.body.required_height) : 0 ) : 0  ,
        targetWidth = (req.body.required_width) ? (!isNaN(parseInt(req.body.required_width)) ? parseInt(req.body.required_width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (req.body.crop) ? req.body.crop : true;
    var scaleFlag = (req.body.scale) ? req.body.scale : true;
    var token = (req.body.Token && req.body.Token !==2 ) ? req.body.Token : '';
    var outputType = (allowedTypes.indexOf(req.body.output_type) == -1) ? 'png' : req.body.output_type;

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
                try{
                    console.log(req.files.image.path);
                    //var bitmap = fs.readFileSync('../bin/'+req.files.image.path);

                    fs.readFile('../bin/'+ req.files.image.path,function(err,data){
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
                                                scaleWidth = targetWidth.toString();
                                                ////
                                                scaleHeight = (size.height * scaleWidth) / size.width;
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
                                                ////
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
                                            ////
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
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });
                                        console.log('FnCropImage:Picture cropped successfully...');
                                        deleteTempFile();
                                    }

                                    else if(scaleFlag && !cropFlag){
                                        gm(bitmap)
                                            .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                    console.log('FnCropImage:Picture cropped successfully');
                                                    deleteTempFile();
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });

                                    }

                                    else if(!scaleFlag && cropFlag){
                                        gm(bitmap)
                                            .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });
                                    }
                                }
                                else{
                                    throw new Error('FnCropImage : '+ 'Invalid image file. Unable to find image size');
                                    res.status(400).json(respMsg);
                                }
                            });
                        }
                        else{
                            res.status(400).json(respMsg);
                            throw new Error('FnCropImage : Error in reading file '+ ex.description);
                        }
                    });

                }
                catch(ex){
                    console.log(ex);
                    res.status(400).json(respMsg);
                    throw new Error('FnCropImage : '+ ex.description);
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


module.exports = Image;