/**
 * Created by Jana1 on 08-08-2017.
 */

var payslipCtrl = {};
var error = {};

payslipCtrl.uploadPaySlip = function(req,res,next){
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
    if (!req.body.employeeCode)
    {
        error.employeeCode = 'Invalid employeeCode';
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
                    req.st.db.escape(req.body.employeeCode),
                    req.st.db.escape(req.body.paySlipDate),
                    req.st.db.escape(req.body.payAmount),
                    req.st.db.escape(req.body.paySlip)
                ];

                var procQuery = 'CALL HE_save_payslip( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    console.log(err);
                    if(!err && payslipResult && payslipResult[0] && payslipResult[0][0] && payslipResult[0][0].message  ){
                        switch (payslipResult[0][0].message) {
                            case 'USER_NOT_FOUND' :
                                response.status = false;
                                response.message = "Invalid employeeCode";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err){
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

payslipCtrl.getPaySlips = function(req,res,next){
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

                req.query.limit = (req.query.limit) ? (req.query.limit) : 10;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;

                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                req.query.fromDate = req.query.fromDate ? req.query.fromDate : null;
                req.query.toDate = req.query.toDate ? req.query.toDate : null;
                req.query.documentType = req.query.documentType ? req.query.documentType : 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.employeeCode),
                    req.st.db.escape(req.query.fromDate),
                    req.st.db.escape(req.query.toDate),
                    req.st.db.escape(req.query.documentType),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_payslip( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salaryLedger){
                    if(!err && salaryLedger && salaryLedger[0] && salaryLedger[0][0]){
                        response.status = true;
                        
                        response.error = null;
                        if (req.query.documentType==3)
                        {
                            response.message = "form16 loaded successfully";
                            var output = [];
                            for(var i = 0; i < salaryLedger[0].length; i++) {
                                var res1 = {};
                                res1.employeeCode = salaryLedger[0][i].employeeCode;
                                res1.form16Id = salaryLedger[0][i].form16Id;
                                res1.savingsMasterId = salaryLedger[0][i].savingsMasterId;
                                res1.startDate = salaryLedger[0][i].startDate;
                                res1.endDate = salaryLedger[0][i].endDate;
                                res1.fileName = (salaryLedger[0][i].fileName) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salaryLedger[0][i].fileName) : "";

                                output.push(res1);
                            }
                        }
                            else {
                                response.message = "Pay slips loaded successfully";
                        var output = [];
                        for(var i = 0; i < salaryLedger[0].length; i++) {
                            var res1 = {};
                            res1.employeeCode = salaryLedger[0][i].employeeCode;
                            res1.payAmount = salaryLedger[0][i].payAmount;
                            res1.paySlipDate = salaryLedger[0][i].paySlipDate;
                            res1.updatedDate = salaryLedger[0][i].updatedDate;
                            res1.paySlip = (salaryLedger[0][i].paySlip) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salaryLedger[0][i].paySlip) : "";
                            res1.taxFile = (salaryLedger[0][i].taxFC) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salaryLedger[0][i].taxFC) : "";
                            output.push(res1);
                        }
                    }
                        response.data =  {
                            paySlips : output
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Pay slips not found";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting Pay slips";
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

payslipCtrl.deletePaySlip = function(req,res,next){
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

    if (!req.query.payslipId)
    {
        error.payslipId = 'Invalid payslipId';
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
                    req.st.db.escape(req.query.payslipId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_delete_payslip( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,salaryLedger){
                    if(!err ){
                        response.status = true;
                        response.message = "Payslip deleted successfully";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting payslip";
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

module.exports = payslipCtrl;