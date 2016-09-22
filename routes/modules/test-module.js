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
var request = require('request');

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

    var http = require('https');
    var fs = require('fs');
    var count  = 0;
    var resizeAndUpload = function(resultsList){
        var successList = [];
        var failedList = [];
        var fileName = resultsList[count];
        var fileSpt = fileName.split('.');
        console.log('get call',"https://storage.googleapis.com/ezeone/"+fileName);
        http.get("https://storage.googleapis.com/ezeone/"+fileName, function(response) {

            gm(response).size({bufferStream: true}, function(err, size) {
                uploadDocumentToCloud("tn_"+fileName,this.resize(100,100).autoOrient().quality(0).stream(fileSpt[fileSpt.length - 1]),
                    function(err){
                        if(!err){
                            console.log('File resize and upload successful');
                            successList.push(fileName);
                            //count ++;
                            if(++count < resultsList.length){
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
            console.log(response);

        });
    };

    var imageArray = ["3a2e950d-f4c9-487c-a72f-e1b0ebb8da8e.jpg", "1a30db23-a563-4d50-9e76-260d69664390.jpg",
        "a321b0c2-af46-44a5-8f6d-778506d3a423.jpg",
        "052979ca-8798-45d9-b79e-a8f2fffaa1d0.png", "80fd0c91-45b3-4d96-b242-678cbd4f2686.JPG", "d8d2feeb-d109-4211-9aa1-2603a81b2055.png",
        "be881697-28c6-4970-960b-4a8c0df6cf2f.png", "98d897bd-ca2d-4fdd-9459-995ec87160fd.png", "a44340d3-e9ed-42ab-ad92-caef4fb5278d.png",
        "5a3cc390-de17-495d-b330-8dcbb0ae8f18.png", "8d4f9025-86f8-4dfa-bb17-50a9cad37e11.png",
        "c7e9d931-4bf4-411b-a2e6-96f44002bcff.jpg", "505acc04-c918-4615-bd91-f5f25aee85ee.jpg", "665c3831-5055-467c-a3ba-ab2caf80d458.png",
        "40ea6752-9f57-42be-9b64-5ec0a6261c5f.jpg"];

    resizeAndUpload(imageArray);
    //var dbQuery = "";
    //st.db.query(dbQuery,function(err,results){
    //   if(!err){
    //       if(results){
    //           if(results[0]){
    //               if(results[0].length){
    //                   var count = 0;
    //                   resizeAndUpload(results[0][count].file);
    //               }
    //           }
    //       }
    //   }
    //});
};
module.exports = Test;

