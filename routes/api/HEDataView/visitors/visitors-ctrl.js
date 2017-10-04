/**
 * Created by Jana1 on 01-09-2017.
 */

var visitorCtrl = {};
var error = {};

visitorCtrl.getVisitorAssetList = function(req,res,next){
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
                    req.st.db.escape(tokenResult[0].masterid)
                ];

                var procQuery = 'CALL whatmate_get_visitorAssetList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,visitorAssetList){
                    if(!err && visitorAssetList && visitorAssetList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            visitorAssetList : visitorAssetList[0],
                            count : visitorAssetList[1][0].count
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

visitorCtrl.getVisitorGatePassList = function(req,res,next){
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
                    req.st.db.escape(tokenResult[0].masterid)
                ];

                var procQuery = 'CALL whatmate_get_visitorGatePassList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,visitorGatePassList){
                    if(!err && visitorGatePassList && visitorGatePassList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            visitorGatePassList : visitorGatePassList[0],
                            count : visitorGatePassList[1][0].count
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

visitorCtrl.getVisitorInternetList = function(req,res,next){
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
                    req.st.db.escape(tokenResult[0].masterid)
                ];

                var procQuery = 'CALL whatmate_get_visitorInternetList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,visitorInternetList){
                    if(!err && visitorInternetList && visitorInternetList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            visitorInternetList : visitorInternetList[0],
                            count : visitorInternetList[1][0].count
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

visitorCtrl.getVisitorHospitalityList = function(req,res,next){
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
                    req.st.db.escape(tokenResult[0].masterid)
                ];

                var procQuery = 'CALL whatmate_get_VisitorHospitalityList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,visitorHospitalityList){
                    if(!err && visitorHospitalityList && visitorHospitalityList[0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            visitorHospitalityList : visitorHospitalityList[0],
                            count : visitorHospitalityList[1][0].count
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

module.exports = visitorCtrl;