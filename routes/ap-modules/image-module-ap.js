/**
 *  @author Gowri Shankar
 *  @since July o6,2015 04:24 PM IST
 *  @title image module
 *  @description Handles functions related to save and update profile picture and banner picture module
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

function Image_AP(db,stdLib){
    this.db = db;
    if(stdLib){
        this.stdLib = stdLib;
    }
};


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.saveAPEZEIDPicture = function(req,res,next){
    /**
     * @todo FnSaveAPEZEIDPicture
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var PicNo = parseInt(req.body.PicNo);
        var Picture = req.body.Picture;
        var TID = parseInt(req.body.TID);
        var Token = req.body.Token;

        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Picture != null && Picture != '' && PicNo.toString() != 'NaN' && TID.toString() != 'NaN') {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = _this.db.escape(TID) + ',' + _this.db.escape(Picture) + ',' + _this.db.escape(PicNo);
                        console.log(InsertQuery);
                        _this.db.query('CALL psaveRealEstatePicture(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveAPEZEIDPicture:tmaster: Registration Failed');
                                }
                            }
                            else {

                                res.send(RtnMessage);
                                console.log('FnSaveAPEZEIDPicture:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveAPEZEIDPicture: Invalid Token')
                        res.send(RtnMessage);
                        res.statusCode=401;
                    }
                }
                else {
                    console.log('FnSaveAPEZEIDPicture: Error in processing Token' + err);
                    res.send(RtnMessage);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (Picture != null || Picture != '') {
                console.log('FnSaveAPEZEIDPicture: Picture is empty');
            }
            else if (PicNo.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: PicNo is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: TID is empty');
            }
            res.send(RtnMessage);
        }


        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        console.log('FnSaveAPEZEIDPicture error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.getAPEZEIDPicture = function(req,res,next){
    /**
     * @todo FnGetAPEZEIDPicture
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.query.TID);
        var PicNo = parseInt(req.query.PicNo);
        var Token = req.query.Token;
        if (Token != null && TID.toString() != 'NaN' && PicNo.toString() != 'NaN') {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        _this.db.query('CALL pGetRealEstatePicture(' + _this.db.escape(TID) + ',' + _this.db.escape(PicNo) + ')', function (err, PictuerResult) {
                            if (!err) {
                                // console.log(PictuerResult);
                                if (PictuerResult[0] != null) {
                                    if (PictuerResult[0].length > 0) {
                                        res.send(PictuerResult[0]);
                                        console.log('FnGetAPEZEIDPicture: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {

                                res.json(null);
                                console.log('FnGetAPEZEIDPicture:pGetRealEstateData:' + err);
                            }
                        });

                    } else {
                        res.json(null);
                        console.log('FnGetAPEZEIDPicture: Invalid Token');
                        res.statusCode=401;
                    }
                } else {
                    res.json(null);
                    console.log('FnGetAPEZEIDPicture: Error in validating token:  ' + err);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAPEZEIDPicture: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnGetAPEZEIDPicture: TID is empty');
            }
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetAPEZEIDPicture error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.saveBannerPictureAP = function(req,res,next){
    /**
     * @todo FnSaveBannerPictureAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.body.SeqNo);
        var Picture = req.body.Picture;
        var Token = req.body.Token;
        var Ezeid = req.body.Ezeid;
        var TID = req.body.TID;
        if(TID == null ){
            TID = 0;
        }
        var RtnMessage = {
            IsSaved: false,
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Picture != null  && SeqNo.toString() != 'NaN' && Ezeid != null) {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = _this.db.escape(Ezeid)  + ',' + _this.db.escape(SeqNo) + ',' + _this.db.escape(Picture) + ',' + _this.db.escape(TID);
                        //console.log(InsertQuery);
                        _this.db.query('CALL PSaveBannerPics(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    var InsertData = InsertResult[0];
                                    RtnMessage.IsSaved =true;
                                    RtnMessage.TID=InsertData[0].TID;
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);

                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveBannerPicture:tmaster: Banner Save Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveBannerPicture:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveBannerPicture: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveBannerPicture: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Picture != null || Picture != '') {
                console.log('FnSaveBannerPicture: Picture is empty');
            }
            else if (SeqNo.toString() == 'NaN') {
                console.log('FnSaveBannerPicture: SeqNo is empty');
            }
            else if(Token == null) {
                console.log('FnSaveBannerPicture: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnSaveBannerPicture: Ezeid is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveBannerPicture error:' + ex.description);

    }
}

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.getBannerPictureAP = function(req,res,next){
    /**
     * @todo FnGetBannerPictureAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.query.SeqNo);
        var Token = req.query.Token;
        var Ezeid = req.query.Ezeid;

        if (Token != null  && SeqNo.toString() != 'NaN' && Ezeid != null) {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = _this.db.escape(Ezeid)  + ',' + _this.db.escape(SeqNo);
                        //console.log(InsertQuery);
                        _this.db.query('CALL PGetBannerPics(' + Query + ')', function (err, BannerResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (BannerResult != null) {
                                    if(BannerResult[0].length > 0){
                                        var Picture = BannerResult[0];
                                        console.log('FnGetBannerPicsAP:tmaster: Banner Picture send sucessfully ');
                                        res.send(Picture[0]);
                                    }
                                    else
                                    {
                                        res.json(null);
                                        console.log('FnGetBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetBannerPicsAP:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetBannerPicsAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetBannerPicsAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else {
            if (SeqNo.toString() == 'NaN') {
                console.log('FnGetBannerPicsAP: SeqNo is empty');
            }
            else if(Token == null) {
                console.log('FnGetBannerPicsAP: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnGetBannerPicsAP: Ezeid is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetBannerPicsAP error:' + ex.description);

    }
}

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.getAllBannerPicsAP = function(req,res,next){
    /**
     * @todo FnGetAllBannerPicsAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;

        if (Token != null && EZEID != null) {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = _this.db.escape(EZEID);
                        //console.log(InsertQuery);
                        _this.db.query('CALL pGetAllBannerPics(' + Query + ')', function (err, BannerResult) {
                            console.log(err);

                            if (!err) {
                                //console.log(InsertResult);
                                if (BannerResult != null) {
                                    //if(BannerResult[0].length > 0){
                                    //var Picture = BannerResult;
                                    console.log('FnGetAllBannerPicsAP:tmaster: Banner Picture send sucessfully ');
                                    //res.send(Picture);
                                    res.send(BannerResult[0]);
                                }
                                else
                                {
                                    res.json(null);
                                    console.log('FnGetAllBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetAllBannerPicsAP:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetAllBannerPicsAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetAllBannerPicsAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else {
            if(Token == null) {
                console.log('FnGetAllBannerPicsAP: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnGetAllBannerPicsAP: Ezeid is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetAllBannerPicsAP error:' + ex.description);

    }
};

/**
 * Method : post
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.deleteBannerPictureAP = function(req,res,next){
    /**
     * @todo FnDeleteBannerPictureAP
     */
    var _this = this;

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var EZEID = req.body.EZEID;
        var SeqNo = req.body.SeqNo;
        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && EZEID != null && SeqNo !=null)  {
            _this.stdLib.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = _this.db.escape(SeqNo) + ',' + _this.db.escape(EZEID);
                        _this.db.query('CALL pDeleteBanner(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteBannerPictureAP: Banner Picture delete successfully');
                                }
                                else {
                                    console.log('FnDeleteBannerPictureAP:No delete Banner Picture');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteBannerPictureAP: error in deleting Banner Picture' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteBannerPictureAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteBannerPictureAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteBannerPictureAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnDeleteBannerPictureAP: EZEID is empty');
            }
            else if (SeqNo == null) {
                console.log('FnDeleteBannerPictureAP: SeqNo is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteBannerPictureAP:error ' + ex.description);

    }
};

/**
 * Method : post
 * @param req
 * @param res
 * @param next
 */
Image_AP.prototype.cropImageAP = function(req,res,next){
    /**
     * @todo FnCropImageAP
     */
    var _this = this;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var fs = require('fs');

    console.log(req.files.image.path);
    var deleteTempFile = function(){
        fs.unlink('../bin/uploads/'+req.files.image.path);
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

    _this.stdLib.validateTokenAp(token, function (err, Result) {
        if (!err) {
            if (Result) {
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

                                    }

                                    else if(scaleFlag && !cropFlag){
                                        gm(bitmap)
                                            .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
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

exports.Base64Data = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var RtnResponse = {
            IsSent: false
        };
        var RtnResponse = JSON.parse(JSON.stringify(RtnResponse));
        //var path = path + StateTitle+'.jpg' ;
        var bitmap = fs.readFileSync("D:\\images\\Product1.jpg");
        // convert binary data to base64 encoded string
        RtnResponse.Picture = new Buffer(bitmap).toString('base64');
        res.send(RtnResponse);
        console.log('Base64Data: Default Banner sent successfully');

    }
    catch (ex) {
        console.log('OTP fnCreateFile error:' + ex.description);

        return 'error'
    }
};

module.exports = Image_AP;