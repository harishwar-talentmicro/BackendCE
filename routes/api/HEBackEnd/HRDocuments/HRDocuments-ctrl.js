/**
 * Created by Jana1 on 15-07-2017.
 */
var HRDocsCtrl = {};
var error = {};

HRDocsCtrl.saveHRDocs = function(req,res,next){
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

                req.body.docTypeId = req.body.docTypeId ? req.body.docTypeId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.docTypeTitle),
                    req.st.db.escape(req.body.docTypeId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_HRDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,hrDocResult){
                    console.log(err);
                    if(!err && hrDocResult && hrDocResult[0] && hrDocResult[0][0].message){
                        switch (hrDocResult[0][0].message) {
                            case 'ACCESS_DENIED' :
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                res.status(200).json(response);
                                break ;

                            default:
                                break;
                        }

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Document saved successfully";
                        response.error = null;
                        response.data = {
                            docId : hrDocResult[0][0].id,
                            docTypeTitle : hrDocResult[0][0].docTypeTitle
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving currency";
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

HRDocsCtrl.getHRDocList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading currency",
        data : null,
        error : null
    };
    var validationFlag = true;


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
                    req.st.db.escape(req.query.APIKey)
                ];

                var procQuery = 'CALL HE_get_HRDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,HRDocResult){
                    if(!err && HRDocResult && HRDocResult[0] && HRDocResult[0][0]){
                        response.status = true;
                        response.message = "HR docs loaded successfully";
                        response.error = null;
                        response.data = {
                            HRDocs : HRDocResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "HR docs loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting HR docs";
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

HRDocsCtrl.deleteHRDocs = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting currency",
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

    if (!req.query.HRDocId) {
        error.HRDocId = 'Invalid HRDocId';
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
                    req.st.db.escape(req.query.HRDocId)
                ];

                var procQuery = 'CALL he_delete_HRDocs( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,HRDocsResult){

                    if(!err && HRDocsResult && HRDocsResult[0] && HRDocsResult[0][0]._error){
                        switch (HRDocsResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Document is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
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

module.exports = HRDocsCtrl;