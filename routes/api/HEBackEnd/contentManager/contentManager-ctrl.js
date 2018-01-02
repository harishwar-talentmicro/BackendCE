/**
 * Created by Jana1 on 07-08-2017.
 */

var contentManagerCtrl = {};
var error = {};

var Notification_aws = require('../../../modules/notification/aws-sns-push');

var _Notification_aws = new  Notification_aws();

contentManagerCtrl.saveContent = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.docTitle)
    {
        error.docTitle = 'Invalid docTitle';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    var usertype =req.body.usertype;
    if(typeof(usertype) == "string") {
        usertype = JSON.parse(usertype);
    }
    if(!usertype){
        usertype = [] ;
    }

    var grade =req.body.grade;
    if(typeof(grade) == "string") {
        grade = JSON.parse(grade);
    }
    if(!grade){
        grade = [] ;
    }

    var department =req.body.department;
    if(typeof(department) == "string") {
        department = JSON.parse(department);
    }
    if(!department){
        department = [] ;
    }

    var location =req.body.location;
    if(typeof(location) == "string") {
        location = JSON.parse(location);
    }
    if(!location){
        location = [] ;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.helpCode = req.body.helpCode ? req.body.helpCode : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.docId),
                    req.st.db.escape(req.body.docDetailId),
                    req.st.db.escape(req.body.docTitle),
                    req.st.db.escape(req.body.keywords),
                    req.st.db.escape(req.body.contentType),
                    req.st.db.escape(req.body.versionNo),
                    req.st.db.escape(req.body.versionDate),
                    req.st.db.escape(req.body.fileName),
                    req.st.db.escape(JSON.stringify(usertype)),
                    req.st.db.escape(JSON.stringify(grade)),
                    req.st.db.escape(JSON.stringify(department)),
                    req.st.db.escape(JSON.stringify(location)),
                    req.st.db.escape(req.body.helpCode)
                ];

                var procQuery = 'CALL he_save_documents( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,contentResult){
                    console.log(err);
                    if(!err && contentResult && contentResult[0] && contentResult[0][0] ){
                        var messagePayload = {
                            information : contentResult[3],
                            type : 100
                        };
console.log("messagePayload",messagePayload);
                        if(contentResult[1] && contentResult[1][0].APNS_Id){
                            _Notification_aws.publish_IOS(contentResult[1][0].APNS_Id,messagePayload,0);
                        }
                        if(contentResult[2] && contentResult[2][0].GCM_Id){
                            _Notification_aws.publish_Android(contentResult[2][0].GCM_Id ,messagePayload);
                        }

                        response.status = true;
                        response.message = "Content saved successfully";
                        response.error = null;
                        response.data = {
                            docId : contentResult[0][0].docId,
                            docDetailId : contentResult[0][0].docDetailId,
                            docTitle : req.body.docTitle,
                            keywords : req.body.keywords,
                            contentType : req.body.contentType,
                            versionNo : req.body.versionNo,
                            versionDate : req.body.versionDate,
                            fileName : (req.body.contentType == 1 ) ? req.body.fileName : (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.body.fileName),
                            usertype : req.body.usertype,
                            grade : req.body.grade,
                            department : req.body.department,
                            location : req.body.location,
                            helpCode : req.body.helpCode
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "Content saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving content";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.findDocument = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isTitle = req.query.isTitle ? req.query.isTitle : 0;
                req.query.keywords = req.query.keywords ? req.query.keywords : "" ;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.isTitle),
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'CALL he_find_document( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err && documentResult && documentResult[0] && documentResult[0][0] ){
                        response.status = true;
                        response.message = "Document loaded successfully";
                        response.error = null;
                        response.data = documentResult[0];
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No document found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.getDocumentDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.docDetailId)
    {
        error.docDetailId = 'Invalid docDetailId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.docDetailId)
                ];

                var procQuery = 'CALL he_get_document_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err && documentResult && documentResult[0] && documentResult[0][0] ){
                        response.status = true;
                        response.message = "Document details loaded successfully";
                        response.error = null;
                        var output = [];
                        for(var i = 0; i < documentResult[0].length; i++) {
                            var res1 = {};
                            res1.docId = documentResult[0][i].docId;
                            res1.docDetailId = documentResult[0][i].docDetailId;
                            res1.docTitle = documentResult[0][i].docTitle;
                            res1.contentType = documentResult[0][i].contentType;
                            res1.fileName = (documentResult[0][i].contentType == 1 ) ? documentResult[0][i].fileName : (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + documentResult[0][i].fileName);
                            res1.keywords = documentResult[0][i].keywords;
                            res1.versionDate = documentResult[0][i].versionDate;
                            res1.versionNo = documentResult[0][i].versionNo;
                            res1.usertype = (documentResult[0][i].usertype) ? JSON.parse(documentResult[0][i].usertype) : null;
                            res1.department = (documentResult[0][i].department) ? JSON.parse(documentResult[0][i].department) : null;
                            res1.grade = (documentResult[0][i].grade) ? JSON.parse(documentResult[0][i].grade) : null;
                            res1.location = (documentResult[0][i].location) ? JSON.parse(documentResult[0][i].location) : null;
                            res1.helpCode = documentResult[0][i].helpCode;
                            output.push(res1);
                        }
                        response.data = output;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No document found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading document details";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.deleteDoc = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting currency",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.docDetailId)
    {
        error.docDetailId = 'Invalid docDetailId';
        validationFlag *= false;
    }

    if (!req.query.docId)
    {
        error.docId = 'Invalid docId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.docDetailId),
                    req.st.db.escape(req.query.docId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_document( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    if (!err ){
                        response.status = true;
                        response.message = "Document deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

contentManagerCtrl.findRelatedDocument = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.docCode)
    {
        error.docCode = 'Invalid docCode';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isTitle = req.query.isTitle ? req.query.isTitle : 0;
                req.query.keywords = req.query.keywords ? req.query.keywords : "" ;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.docCode)
                ];

                var procQuery = 'CALL he_find_knowledgeDoc( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err && documentResult && documentResult[0] && documentResult[0][0] ){
                        response.status = true;
                        response.message = "Document loaded successfully";
                        response.error = null;
                        response.data = documentResult[0][0];
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No document found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.getRelatedDocument = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.docId)
    {
        error.docId = 'Invalid docId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.docId)
                ];

                var procQuery = 'CALL he_get_relatedDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err && documentResult && documentResult[0] && documentResult[0][0] ){
                        response.status = true;
                        response.message = "Document loaded successfully";
                        response.error = null;
                        response.data = documentResult[0];
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No document found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.saveRelatedDocument = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.body.docId)
    {
        error.docId = 'Invalid docId';
        validationFlag *= false;
    }
    if (!req.body.relatedDocId)
    {
        error.relatedDocId = 'Invalid relatedDocId';
        validationFlag *= false;
    }

    if (!req.body.relatedDocTitle)
    {
        error.relatedDocTitle = 'Invalid relatedDocTitle';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.docId),
                    req.st.db.escape(req.body.relatedDocId),
                    req.st.db.escape(req.body.relatedDocTitle)
                ];

                var procQuery = 'CALL he_save_relatedDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err && documentResult && documentResult[0] && documentResult[0][0] ){
                        response.status = true;
                        response.message = "Document saved successfully";
                        response.error = null;
                        response.data = documentResult[0][0];
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

contentManagerCtrl.deleteRelatedDocument = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.id)
    {
        error.id = 'Invalid id';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.id)
                ];

                var procQuery = 'CALL he_delete_relatedDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,documentResult){
                    console.log(err);
                    if(!err ){
                        response.status = true;
                        response.message = "Document deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting document";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

module.exports = contentManagerCtrl;