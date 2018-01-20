/**
 * Created by vedha on 20-12-2017.
 */


var windowsCtrl = {};
var error = {};

windowsCtrl.uploadPaySlip = function(req,res,next){
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
    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(JSON.stringify(req.body.data))
                ];

                var procQuery = 'CALL HE_Import_payslips( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    if (!err){
                        response.status = true;
                        response.message = "Payslip uploaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while uploading payslip";
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

windowsCtrl.uploadPaySlipFile = function(req,res,next){
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
    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }
    if (!req.body.fileName)
    {
        error.fileName = 'Invalid fileName';
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
                var fileName = req.body.fileName;
                var str = fileName.split("_");
                var month = str[1].substring(0, 3);
                var year = (str[1].replace(str[1].substring(0, 3),"")).substring(0, 4);

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(str[0]),
                    req.st.db.escape(req.body.cdnPath),
                    req.st.db.escape(month),
                    req.st.db.escape(year)
                ];

                var procQuery = 'CALL HE_Import_payslipFile( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    if (!err){
                        response.status = true;
                        response.message = "Payslip uploaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while uploading payslip";
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

windowsCtrl.uploadForm16 = function(req,res,next){
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
    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(JSON.stringify(req.body.data))
                ];

                var procQuery = 'CALL HE_Import_form16( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    if (!err){
                        response.status = true;
                        response.message = "Form-16 uploaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while uploading form16";
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

windowsCtrl.uploadTaxDeclaration = function(req,res,next){
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
    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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

                var Qndata = req.body.data;
                console.log(Qndata[0].questions);
                var questions = JSON.parse(Qndata[0].questions);
                console.log(questions.data);

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(Qndata[0].employeecode),
                    req.st.db.escape(Qndata[0].decltype),
                    req.st.db.escape(Qndata[0].amount),
                    req.st.db.escape(JSON.stringify(questions.data)),
                    req.st.db.escape(req.query.financialYear)
                ];

                var procQuery = 'CALL HE_Import_TaxDeclaration( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    if (!err){
                        response.status = true;
                        response.message = "Tax declaration uploaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while uploading tax declaration";
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

module.exports = windowsCtrl;