/**
 * Created by Jana1 on 08-08-2017.
 */


var interviewCtrl = {};
var error = {};
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

interviewCtrl.saveStage = function(req,res,next){
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
    if (!req.body.stageTitle)
    {
        error.stageTitle = 'Invalid stageTitle';
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
                req.body.stageId = req.body.stageId ? req.body.stageId : 0;
                req.body.type = req.body.type ? req.body.type : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.stageTitle),
                    req.st.db.escape(req.body.type)
                ];

                var procQuery = 'CALL he_save_interviewStage( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,interviewStageResult){
                    console.log(err);
                    if(!err && interviewStageResult && interviewStageResult[0] && interviewStageResult[0][0] && interviewStageResult[0][0].stageId  ){
                        response.status = true;
                        response.message = "Interview stage saved successfully";
                        response.error = null;
                        response.data = {
                            stageId : interviewStageResult[0][0].stageId,
                            stageTitle : req.body.stageTitle,
                            type : req.body.type
                        };
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "Interview stage saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving interview stage";
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

interviewCtrl.getStages = function(req,res,next){
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
                    req.st.db.escape(DBSecretKey)                                                                                
                ];

                var procQuery = 'CALL he_get_interviewStage( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,interviewStage){
                    console.log(err);
                    if(!err && interviewStage && interviewStage[0] && interviewStage[0][0] ){
                        response.status = true;
                        response.message = "Interview stages loaded successfully";
                        response.error = null;
                        response.data = interviewStage[0];
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
                        response.message = "Error while loading stages";
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

interviewCtrl.deleteStage = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting stages",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token)
    {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.stageId)
    {
        error.stageId = 'Invalid stageId';
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
                    req.st.db.escape(req.query.stageId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_delete_interviewStage( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,interviewStageResult){
                    if(!err && interviewStageResult && interviewStageResult[0] && interviewStageResult[0][0].message){
                        switch (interviewStageResult[0][0].message) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Stage is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Interview stage deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting stage";
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


interviewCtrl.saveAssessment = function(req,res,next){
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
                req.body.templateId = req.body.templateId ? req.body.templateId : 0;
                req.body.questionId = req.body.questionId ? req.body.questionId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.templateTitle),
                    req.st.db.escape(req.body.questionId),
                    req.st.db.escape(req.body.question),
                    req.st.db.escape(req.body.marks)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_interviewAssessment( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,assessmentResult){
                    console.log(err);
                    if(!err && assessmentResult && assessmentResult[0] && assessmentResult[0][0].templateId){
                        response.status = true;
                        response.message = "Assessment saved successfully";
                        response.error = null;
                        response.data ={
                            templateId : assessmentResult[0][0].templateId
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving assessment";
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

interviewCtrl.getAssessmentList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token)
    {
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
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.APIKey),
                req.st.db.escape(DBSecretKey)                                                                
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL he_get_assessment_list( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assessmentResult){
                if(!err && assessmentResult && assessmentResult[0] && assessmentResult[0][0]){
                    response.status = true;
                    response.message = "Assessment list loaded successfully";
                    response.error = null;
                    response.data = {
                        assessmentList : assessmentResult[0]
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data =null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting assessment template";
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
};

interviewCtrl.getAssessmentTemplateDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.templateId) {
        error.templateId = 'Invalid templateId';
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.templateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_assessment_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,assessmentResult){
                    if(!err && assessmentResult && assessmentResult[0] && assessmentResult[0][0]){
                        response.status = true;
                        response.message = "Assessment details loaded successfully";
                        response.error = null;
                        response.data = {
                            assessmentTemplate : assessmentResult[0][0],
                            questionList : assessmentResult[1]
                        };
                        res.status(200).json(response);

                    }
                    else if(err){
                        response.status = false;
                        response.message = "Error while getting assessment";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                    else{
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

interviewCtrl.deleteAssessmentTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting assessment template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.templateId) {
        error.templateId = 'Invalid templateId';
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.templateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_assessmentTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,assessmentResult){
                    if (assessmentResult && assessmentResult[0] && assessmentResult[0][0]._error)
                    {
                        switch (assessmentResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Assessment template is in use.";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }

                    if(!err){
                        response.status = true;
                        response.message = "assessmentResult template deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting assessmentResult template";
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

interviewCtrl.deleteQuestion = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting question",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token)
    {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.questionId) {
        error.token = 'Invalid questionId';
        validationFlag *= false;
    }
    if (!req.query.templateId) {
        error.templateId = 'Invalid templateId';
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.templateId),
                    req.st.db.escape(req.query.questionId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_delete_question( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,questionResult){
                    if(!err){
                        response.status = true;
                        response.message = "Question deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting question";
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

module.exports = interviewCtrl;