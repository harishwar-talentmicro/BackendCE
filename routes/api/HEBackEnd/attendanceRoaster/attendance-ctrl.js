var attendanceCtrl = {};
var error = {};

var Notification_aws = require('../../../modules/notification/aws-sns-push');

var _Notification_aws = new Notification_aws();

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
<<<<<<< HEAD
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;
=======
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef

attendanceCtrl.saveAttendanceShifts = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.hemasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.body.startTime) {
        error.startTime = 'Invalid startTime';
        validationFlag *= false;
    }

    if (!req.body.duration) {
        error.duration = 'Invalid duration';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.body.shiftId = req.body.shiftId ? req.body.shiftId : 0;
                req.body.title = req.body.title ? req.body.title : "";
                req.body.break1Time = req.body.break1Time ? req.body.break1Time : null;
                req.body.break1Duration = req.body.break1Duration ? req.body.break1Duration : 0;
                req.body.break2Time = req.body.break2Time ? req.body.break2Time : null;
                req.body.break2Duration = req.body.break2Duration ? req.body.break2Duration : 0;
                req.body.break3Time = req.body.break3Time ? req.body.break3Time : null;
                req.body.break3Duration = req.body.break3Duration ? req.body.break3Duration : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.hemasterId),
                    req.st.db.escape(req.body.shiftId),
<<<<<<< HEAD
                    req.st.db.escape(req.body.shiftName),
=======
                    req.st.db.escape(req.body.title),
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef
                    req.st.db.escape(req.body.code),
                    req.st.db.escape(req.body.startTime),
                    req.st.db.escape(req.body.duration),
                    req.st.db.escape(req.body.break1Time),
                    req.st.db.escape(req.body.break1Duration),
                    req.st.db.escape(req.body.break2Time),
                    req.st.db.escape(req.body.break2Duration),
                    req.st.db.escape(req.body.break3Time),
                    req.st.db.escape(req.body.break3Duration),
                    req.st.db.escape(req.body.halfBreakAfter),
                    req.st.db.escape(req.body.fullBreakAfter),
                ];

                var procQuery = 'CALL wm_save_roasterShifts( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results ) {
                        response.status = true;
                        response.message = "Shifts saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving Shifts";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


attendanceCtrl.saveWeekEndMaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var dayList = req.body.dayList
    if (typeof (dayList) == "string") {
        dayList = JSON.parse(dayList)
    }
    if (!dayList) {
        dayList = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.body.WEMasterId = req.body.WEMasterId ? req.body.WEMasterId : 0;
                req.body.title = req.body.title ? req.body.title : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.hemasterId),
                    req.st.db.escape(req.body.WEMasterId),
<<<<<<< HEAD
                    req.st.db.escape(req.body.WEMasterName),
                    req.st.db.escape(req.body.code),
                    req.st.db.escape(JSON.stringify(dayList))
=======
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.code),
                    req.st.db.escape(JSON.parse(dayList))
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef
                ];

                var procQuery = 'CALL wm_save_WEmaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results ) {
                        response.status = true;
                        response.message = "saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


attendanceCtrl.saveroaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var roasterList = req.body.roasterList
    if (typeof (roasterList) == "string") {
        roasterList = JSON.parse(roasterList)
    }
    if (!roasterList) {
        roasterList = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.body.roasterId = req.body.roasterId ? req.body.roasterId : 0;
                req.body.title = req.body.title ? req.body.title : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.hemasterId),
                    req.st.db.escape(req.body.roasterId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.roasterCode),
<<<<<<< HEAD
                    req.st.db.escape(JSON.stringify(roasterList))
=======
                    req.st.db.escape(JSON.parse(roasterList))
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef
                ];

                var procQuery = 'CALL wm_save_roaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results ) {
                        response.status = true;
                        response.message = "saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

attendanceCtrl.getWeekDays = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.hemasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }
   

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                

                var procParams = [
                    req.st.db.escape(req.query.token),
<<<<<<< HEAD
                    req.st.db.escape(req.query.hemasterId),
=======
                    req.st.db.escape(req.body.hemasterId),
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef
                   
                ];

                var procQuery = 'CALL wm_get_weekDays( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
<<<<<<< HEAD
                    if (!err && results) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = results[0];
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

attendanceCtrl.getshifts = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.hemasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }
   

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                
                req.query.shiftId = req.query.shiftId ? req.query.shiftId : 0;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.hemasterId),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.shiftId),
                ];

                var procQuery = 'CALL wm_get_mShifts( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        if((req.query.shiftId>0)){
                            response.data = results[0][0];
                        }
                        else
                        {
                        response.data = results[0];
                        }
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

attendanceCtrl.getweekend = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.hemasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }
   

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                
                req.query.WEMasterId = req.query.WEMasterId ? req.query.WEMasterId : 0;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.hemasterId),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.WEMasterId)
                ];

                var procQuery = 'CALL wm_get_weekendMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        for(var i=0;i<results[0].length;i++){
                            results[0][i].dayList=results[0][i].dayList ? JSON.parse(results[0][i].dayList):[];
                        }
                        if((req.query.WEMasterId)>0){
                        response.data = results[0][0];
                        }
                        else{
                            response.data = results[0];
                        }
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

attendanceCtrl.getroaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.hemasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }
   

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.roasterId = req.query.roasterId ? req.query.roasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.hemasterId),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.roasterId)
                ];

                var procQuery = 'CALL wm_get_roaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        for(var i=0;i<results[0].length;i++){
                            results[0][i].roasterList=results[0][i].roasterList ? JSON.parse(results[0][i].roasterList):[];
                            
                            // results[0][i].roasterList[0].shift=results[0][i].roasterList[0].shift ? JSON.parse(results[0][i].roasterList[0].shift) :{};

                            // results[0][i].roasterList[0].weekened=results[0][i].roasterList[0].weekened ? JSON.parse(results[0][i].roasterList[0].weekened) :{};
                        }
                        if ((req.query.roasterId)>0){
                            response.data = results[0][0];
                        }
                        else{
                            response.data = results[0];
                        }
                        
=======
                    if (!err && results ) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = results[0];
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

module.exports = attendanceCtrl;