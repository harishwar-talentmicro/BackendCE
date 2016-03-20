/**
 * Created by Hirecraft on 11-03-2016.
 */


/**
 *  @author Anjali Pandya
 *  @since Feb 03,2016  10:46AM
 *  @title Hris Master module
 *  @description Handles HRIS  functions
 */
"use strict";

var validator = require('validator');

var uuid = require('node-uuid');
var gcloud = require('gcloud');
var fs = require('fs');
var path = require('path');
var util = require( "util" );
var gm = require('gm').subClass({ imageMagick: true });
var Mailer = require('../../mail/mailer.js');
var mailerApi = new Mailer();
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


var st = null;
function Test(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};
var deleteTempFile = function(){
    fs.unlink('../bin/'+req.files.pr.path);
    console.log("Image Path is deleted from server");
};

Test.prototype.testMailer = function(req,res,next){
    var emailArray = ['ap.anjalipandya19@gmail.com','tinipandya19@gmail.com','abc@gmail.com','jain31192@gmail.com','anjali2hirecraft.in'];
    var sendMail = function(){
        for ( var counter = 0; counter < emailArray.length; counter++){
            mailerApi.sendMail('job_post', {
                jobType : "Full Time",
                jobCode : "2345",
                CompanyName : "CompanyName",
                JobTitle : "JobTitle"

            }, '', emailArray[counter]);
        }
    };
};
/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description Save img
 * @accepts json
 * @param pr <string> image file (multipart)
 */
Test.prototype.test = function(req,res,next){

    console.log("req.files :"+req.files);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    try {
        console.log("req.files :"+req.files);
        if (req.files) {
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

Test.prototype.imageResizeTest = function(req,res,next){

    var uniqueName = "anjali_"+Date.now()+".png";

    //var writeStream = fs.createWriteStream(uniqueName);
    //gm('/path/to/my/img.jpg')
    //    .resize('200', '200')
    //    .stream()
    //    .pipe(writeStream);
    //writeStream.on('finish',function(){
    //   res.json(uniqueName);
    //});
    //
    //writeStream.on('error',function(){
    //    res.status(500).json(null);
    //});
    //
    uploadDocumentToCloud(uniqueName,gm(req.files['pr'].path).resize(128,128).quality(0).stream('jpg'),function(err){
        if(!err){
            console.log('File resize and upload successful');
            res.json(uniqueName);
        }
        else{
            console.log(err);
            res.status(500).json(null);
        }
    });

};

Test.prototype.createThumnail = function(){

    var http = require('http');
    var fs = require('fs');
    var count  = 0;
    var resizeAndUpload = function(resultsList){
        var successList = [];
        var failedList = [];
        var fileName = resultsList[count].file;
        var fileSpt = fileName.split('.');
        var request = http.get("https://storage.googleapis.com/ezeone/"+fileName, function(response) {
            uploadDocumentToCloud("tn_"+fileName,gm(response).resize(128,128).quality(0).stream(fileSpt[fileSpt.length - 1]),function(err){
                if(!err){
                    console.log('File resize and upload successful');
                    successList.push(fileName);
                    if(count < resultsList.length){
                        count += 1;
                        resizeAndUpload(resultsList);
                    }
                    else{
                        console.log('Done');
                        fs.writeFileSync('im-success.json',JSON.stringify(successList));
                        fs.writeFileSync('im-failed.json',JSON.stringify(failedList));
                    }
                }
                else{
                    failedList.push(fileName);
                    if(count < resultsList.length){
                        count += 1;
                        resizeAndUpload(resultsList);
                    }
                    else{
                        console.log('Done');
                        fs.writeFileSync('im-success.json',JSON.stringify(successList));
                        fs.writeFileSync('im-failed.json',JSON.stringify(failedList));
                    }
                }
            });
        });
    };

    var dbQuery = "";
    st.db.query(dbQuery,function(err,results){
       if(!err){
           if(results){
               if(results[0]){
                   if(results[0].length){
                       var count = 0;
                       resizeAndUpload(results[0][count].file);
                   }
               }
           }
       }
    });
};
module.exports = Test;

