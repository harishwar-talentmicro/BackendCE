/**
 * Created by vedha on 20-12-2017.
 */

var request = require('request');
var randomstring = require("randomstring");
var windowsCtrl = {};
var error = {};
var Mailer = require('../../../mail/mailer.js');
var mailerApi = new Mailer();

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

windowsCtrl.exportTaxDeclaration = function(req,res,next){
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.fYear)
                ];

                var procQuery = 'CALL HE_Export_TaxDeclaration( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,payslipResult){
                    if (!err){
                        response.status = true;
                        response.message = "Tax declaration uploaded successfully";
                        response.error = null;
                        response.data = {
                            tax : payslipResult[0],
                            questions : payslipResult[1]
                        };
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

windowsCtrl.uploadUsers = function(req,res,next){
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

                var password = randomstring.generate({
                    length: 6,
                    charset: 'alphanumeric'
                });
                var message = "" ;

                var encryptPwd = req.st.hashPassword(password);
                var Qndata = req.body.data;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(Qndata[0].employeecode),
                    req.st.db.escape(Qndata[0].name),
                    req.st.db.escape(Qndata[0].mobile),
                    req.st.db.escape(Qndata[0].isdmobile),
                    req.st.db.escape(encryptPwd),
                    req.st.db.escape(Qndata[0].tracktemplate),
                    req.st.db.escape(Qndata[0].worklocation),
                    req.st.db.escape(Qndata[0].workgroup),
                    req.st.db.escape(Qndata[0].rm),
                    req.st.db.escape(Qndata[0].email)
                ];

                //CompanyName
                var procQuery = 'CALL he_import_bulkUsers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userResult){
                    if (!err && userResult && userResult[0] ){
                        console.log("userResult[0][0].status",userResult[0][0].status);

                        if (userResult[0][0].status == "New" ){
                            if(Qndata[0].email != ""){
                                mailerApi.sendMailNew('NewUserUpload', {
                                    name : Qndata[0].name,
                                    UserName : userResult[0][0].whatmateId,
                                    Password : password
                                }, '',Qndata[0].email,[]);
                            }

                            message = 'Dear ' + Qndata[0].name  + ', Your WhatMate credentials, Login ID: ' + userResult[0][0].whatmateId + ',Password: ' + password ;

                            if(Qndata[0].mobile !="")
                            {
                                if(Qndata[0].isdmobile == "+977"){
                                    request({
                                        url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                        qs: {
                                            token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                            to : Qndata[0].mobile,
                                            message: message,
                                            sender: 'Techingen'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        if(error)
                                        {
                                            console.log(error,"SMS");
                                        }
                                        else{
                                            console.log("SUCCESS","SMS response");
                                        }

                                    });
                                }
                                else if(Qndata[0].isdmobile == "+91")
                                {
                                    request({
                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                        qs: {
                                            user_name : 'janardana@hirecraft.com',
                                            password : 'Ezeid2015',
                                            sender_id : 'EZEONE',
                                            service : 'TRANS',
                                            mobile_no: Qndata[0].mobile,
                                            message: message,
                                            method : 'send_sms'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        if(error)
                                        {
                                            console.log(error,"SMS");
                                        }
                                        else{
                                            console.log("SUCCESS","SMS response");
                                        }
                                    });
                                }
                                else if(Qndata[0].isdmobile != "")
                                {
                                    client.messages.create(
                                        {
                                            body: message,
                                            to: Qndata[0].isdmobile + Qndata[0].mobile,
                                            from: '+14434322305'
                                        },
                                        function (error, response) {
                                            if(error)
                                            {
                                                console.log(error,"SMS");
                                            }
                                            else{
                                                console.log("SUCCESS","SMS response");
                                            }
                                        }
                                    );

                                    // request({
                                    //     url: 'https://rest.nexmo.com/sms/json',
                                    //     qs: {
                                    //         api_key : '4405b7b5 ',
                                    //         api_secret : '77dfad076c27e4c8',
                                    //         to: Qndata[0].isdmobile.replace("+","") + Qndata[0].mobile,
                                    //         from : 'WtMate',
                                    //         text: message
                                    //     },
                                    //     method: 'POST'
                                    //
                                    // }, function (error, response, body) {
                                    //     if(error)
                                    //     {
                                    //         console.log(error,"SMS");
                                    //     }
                                    //     else{
                                    //         console.log("SUCCESS","SMS response");
                                    //     }
                                    // });

                                }

                            }

                        }
                        else if(userResult[0][0].status == "Existing") {
                            if(Qndata[0].email != ""){
                                mailerApi.sendMailNew('existingUsers', {
                                    name : Qndata[0].name,
                                    UserName : userResult[0][0].whatmateId,
                                    CompanyName : req.query.CompanyName
                                }, '',Qndata[0].email,[]);
                            }

                            message = 'Dear ' + Qndata[0].name  + ', Your existing profile on WhatMate is successfully linked to ' + req.query.CompanyName + ' now.';

                            if(Qndata[0].mobile !="")
                            {
                                if(Qndata[0].isdmobile == "+977"){
                                    request({
                                        url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                        qs: {
                                            token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                            to : Qndata[0].mobile,
                                            message: message,
                                            sender: 'Techingen'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        if(error)
                                        {
                                            console.log(error,"SMS");
                                        }
                                        else{
                                            console.log("SUCCESS","SMS response");
                                        }

                                    });
                                }
                                else if(Qndata[0].isdmobile == "+91")
                                {
                                    request({
                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                        qs: {
                                            user_name : 'janardana@hirecraft.com',
                                            password : 'Ezeid2015',
                                            sender_id : 'EZEONE',
                                            service : 'TRANS',
                                            mobile_no: Qndata[0].mobile,
                                            message: message,
                                            method : 'send_sms'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        if(error)
                                        {
                                            console.log(error,"SMS");
                                        }
                                        else{
                                            console.log("SUCCESS","SMS response");
                                        }
                                    });
                                }
                                else if(Qndata[0].isdmobile != "")
                                {
                                    client.messages.create(
                                        {
                                            body: message,
                                            to: Qndata[0].isdmobile + Qndata[0].mobile,
                                            from: '+14434322305'
                                        },
                                        function (error, response) {
                                            if(error)
                                            {
                                                console.log(error,"SMS");
                                            }
                                            else{
                                                console.log("SUCCESS","SMS response");
                                            }
                                        }
                                    );
                                    // request({
                                    //     url: 'https://rest.nexmo.com/sms/json',
                                    //     qs: {
                                    //         api_key : '4405b7b5 ',
                                    //         api_secret : '77dfad076c27e4c8',
                                    //         to: Qndata[0].isdmobile.replace("+","") + Qndata[0].mobile,
                                    //         from : 'WtMate',
                                    //         text: message
                                    //     },
                                    //     method: 'POST'
                                    //
                                    // }, function (error, response, body) {
                                    //     if(error)
                                    //     {
                                    //         console.log(error,"SMS");
                                    //     }
                                    //     else{
                                    //         console.log("SUCCESS","SMS response");
                                    //     }
                                    // });

                                }

                            }
                        }

                        response.status = true;
                        response.message = "Users uploaded successfully";
                        response.error = null;
                        response.data = {
                            status : userResult[0][0].status
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while uploading users";
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