/**
 * Created by Jana1 on 30-08-2017.
 *
 */
var queryCtrl = {};
var error = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;


queryCtrl.getHRQueryList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_HRQueryList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,HRQueryList){
                    if(!err && HRQueryList && HRQueryList[0]){
                        var output = [];
                        for(var i = 0; i < HRQueryList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = HRQueryList[0][i].parentId;
                            res1.transId = HRQueryList[0][i].transId;
                            res1.status = HRQueryList[0][i].status;
                            res1.statusTitle = HRQueryList[0][i].statusTitle;
                            res1.senderName = HRQueryList[0][i].senderName;
                            res1.employeeCode = HRQueryList[0][i].employeeCode;
                            res1.attachments = HRQueryList[0][i].attachments ? JSON.parse(HRQueryList[0][i].attachments) : [];
                            res1.priority = HRQueryList[0][i].priority;
                            res1.receiverNotes = HRQueryList[0][i].receiverNotes;
                            res1.requirement = HRQueryList[0][i].requirement;
                            res1.senderNotes = HRQueryList[0][i].senderNotes;
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            HRQueryList : output,
                            count : HRQueryList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getFinanceQueryList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_FinanceQueryList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,financeQueryList){
                    if(!err && financeQueryList && financeQueryList[0]){
                        var output = [];
                        for(var i = 0; i < financeQueryList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = financeQueryList[0][i].parentId;
                            res1.transId = financeQueryList[0][i].transId;
                            res1.status = financeQueryList[0][i].status;
                            res1.statusTitle = financeQueryList[0][i].statusTitle;
                            res1.senderName = financeQueryList[0][i].senderName;
                            res1.employeeCode = financeQueryList[0][i].employeeCode;
                            res1.attachments = financeQueryList[0][i].attachments ? JSON.parse(financeQueryList[0][i].attachments) : [];
                            res1.priority = financeQueryList[0][i].priority;
                            res1.receiverNotes = financeQueryList[0][i].receiverNotes;
                            res1.requirement = financeQueryList[0][i].requirement;
                            res1.senderNotes = financeQueryList[0][i].senderNotes;
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            financeQueryList : output,
                            count : financeQueryList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getAdminQueryList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_AdminQueryList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,adminQueryList){
                    if(!err && adminQueryList && adminQueryList[0]){
                        var output = [];
                        for(var i = 0; i < adminQueryList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = adminQueryList[0][i].parentId;
                            res1.transId = adminQueryList[0][i].transId;
                            res1.status = adminQueryList[0][i].status;
                            res1.statusTitle = adminQueryList[0][i].statusTitle;
                            res1.senderName = adminQueryList[0][i].senderName;
                            res1.employeeCode = adminQueryList[0][i].employeeCode;
                            res1.attachments = adminQueryList[0][i].attachments ? JSON.parse(adminQueryList[0][i].attachments) : [];
                            res1.priority = adminQueryList[0][i].priority;
                            res1.receiverNotes = adminQueryList[0][i].receiverNotes;
                            res1.requirement = adminQueryList[0][i].requirement;
                            res1.senderNotes = adminQueryList[0][i].senderNotes;
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            adminQueryList : output,
                            count : adminQueryList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getFrontOfficeQueryList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_FrontOfficeQueryList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,frontOfficeQueryList){
                    if(!err && frontOfficeQueryList && frontOfficeQueryList[0]){
                        var output = [];
                        for(var i = 0; i < frontOfficeQueryList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = frontOfficeQueryList[0][i].parentId;
                            res1.transId = frontOfficeQueryList[0][i].transId;
                            res1.status = frontOfficeQueryList[0][i].status;
                            res1.statusTitle = frontOfficeQueryList[0][i].statusTitle;
                            res1.senderName = frontOfficeQueryList[0][i].senderName;
                            res1.employeeCode = frontOfficeQueryList[0][i].employeeCode;
                            res1.attachments = frontOfficeQueryList[0][i].attachments ? JSON.parse(frontOfficeQueryList[0][i].attachments) : [];
                            res1.priority = frontOfficeQueryList[0][i].priority;
                            res1.receiverNotes = frontOfficeQueryList[0][i].receiverNotes;
                            res1.requirement = frontOfficeQueryList[0][i].requirement;
                            res1.senderNotes = frontOfficeQueryList[0][i].senderNotes;
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            frontOfficeQueryList : output,
                            count : frontOfficeQueryList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getITHelpDeskList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_ITHelpdeskList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,ITHelpDeskList){
                    if(!err && ITHelpDeskList && ITHelpDeskList[0]){
                        var output = [];
                        for(var i = 0; i < ITHelpDeskList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = ITHelpDeskList[0][i].parentId;
                            res1.transId = ITHelpDeskList[0][i].transId;
                            res1.status = ITHelpDeskList[0][i].status;
                            res1.statusTitle = ITHelpDeskList[0][i].statusTitle;
                            res1.senderName = ITHelpDeskList[0][i].senderName;
                            res1.employeeCode = ITHelpDeskList[0][i].employeeCode;
                            res1.attachments = ITHelpDeskList[0][i].attachments ? JSON.parse(ITHelpDeskList[0][i].attachments) : [];
                            res1.priority = ITHelpDeskList[0][i].priority;
                            res1.receiverNotes = ITHelpDeskList[0][i].receiverNotes;
                            res1.requirement = ITHelpDeskList[0][i].requirement;
                            res1.senderNotes = ITHelpDeskList[0][i].senderNotes;
                            res1.requestedDate = ITHelpDeskList[0][i].requestedDate;
                            res1.statusUpdatedDate = ITHelpDeskList[0][i].statusUpdatedDate;
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            ITHelpDeskList : output,
                            count : ITHelpDeskList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getMessagesList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL whatmate_get_messageList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,messageList){
                    if(!err && messageList && messageList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            messageList : messageList[0],
                            count : messageList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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


queryCtrl.getContactUs = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL WhatMate_get_contactUsList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,HRQueryList){
                    if(!err && HRQueryList && HRQueryList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            contactsList : HRQueryList[0],
                            count : HRQueryList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

queryCtrl.getTransportRequest = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

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
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
                req.query.limit = (req.query.limit) ? (req.query.limit):100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL WhatMate_get_TransportRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,transportRequest){
                    if(!err && transportRequest && transportRequest[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            transportRequestList : transportRequest[0],
                            count : transportRequest[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

module.exports = queryCtrl;