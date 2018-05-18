
var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

var hospitalTokenManagementCtrl = {};
var error = {};
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var request = require('request');
var path = require('path');
var uuid = require('node-uuid');
var http = require('https');
// var Readable = require('stream').Readable;
var bcrypt = null;
var EZEIDEmail = 'noreply@talentmicro.com';
const accountSid = 'ACcf64b25bcacbac0b6f77b28770852ec9';
const authToken = '3abf04f536ede7f6964919936a35e614';
const client = require('twilio')(accountSid, authToken);
// const VoiceResponse = require('twilio').twiml.VoiceResponse;


var qs = require("querystring");
var options = {
    "method": "POST",
    "hostname": "www.smsgateway.center",
    "port": null,
    "path": "/SMSApi/rest/send",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    }
};
var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();
var randomstring = require("randomstring");

hospitalTokenManagementCtrl.getDoctorList = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.WMId)
                ];

                var procQuery = 'CALL he_get_doctorsList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "DoctorsList loaded successfully";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < result[1].length; i++) {
                            var res2 = {};
                            res2.groupId = result[1][i].groupId;
                            res2.groupTitle = result[1][i].groupTitle;
                            res2.doctorList = result[1][i].doctorsList ? JSON.parse(result[1][i].doctorsList) : [];
                            output.push(res2);
                        }
                        result[0][0].bannerImages = result[0][0].bannerImages ? JSON.parse(result[0][0].bannerImages) : [];
                        response.data = {
                            hospitalDetails: result[0][0],
                            groups: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            hospitalDetails: {},
                            groups: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting  DoctorsList";
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

hospitalTokenManagementCtrl.getDoctorDetails = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.WMId),
                    req.st.db.escape(req.query.resourceId)
                ];

                var procQuery = 'CALL he_get_doctorDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    // var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "DoctorsDetails loaded successfully";
                        response.error = null;
                        result[0][0].bannerImages = result[0][0].bannerImages ? JSON.parse(result[0][0].bannerImages) : [];
                        response.data = {
                            doctorDetails: result[0][0]
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            doctorDetails: {}
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting  DoctorsDetails";
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

hospitalTokenManagementCtrl.doctorDetailsWithVistorsList = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.body.currentDatetime = req.body.currentDatetime ? req.body.currentDatetime : null;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.resourceId),
                    req.st.db.escape(req.query.currentDatetime)
                ];

                var procQuery = 'CALL he_get_doctorsDetailsVistorList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "DoctorsDetails  and visitors loaded successfully";
                        response.error = null;
                        response.data = {
                            doctorDetails: result[0][0],
                            visitorList: result[1]
                        };
                        //res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            doctorDetails: {},
                            visitorList: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting  DoctorsDetails and visitorList";
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

hospitalTokenManagementCtrl.printToken = function (req, res, next) {

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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.HEMasterId) {
                        error.HEMasterId = 'Invalid HEMasterId';
                        validationFlag *= false;
                    }
                    if (!req.body.resourceId) {
                        error.resourceId = 'Invalid resourceId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.type = req.body.type ? req.body.type : 0;
                        req.body.whatmateId = req.body.whatmateId ? req.body.whatmateId : 0;
                        req.body.currentDatetime = req.body.currentDatetime ? req.body.currentDatetime : null;

                        var mobileNo = req.body.mobileNumber;
                        var isdMobile = req.body.mobileISD ? req.body.mobileISD: "";
                        var message = "";


                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.HEMasterId),
                            req.st.db.escape(req.body.resourceId),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(req.body.whatmateId),
                            req.st.db.escape(req.body.name),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(req.body.currentDatetime)
                        ];

                        var procQuery = 'CALL he_print_hospitalToken( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0] && results[0][0].error) {
                                response.status = false;
                                response.message = "Max token count exceded ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                // to send sms
                                message = "Your token number is " + results[0][0].tokenNumber + " Please wait. Thank You";
                                if (isdMobile == "+977") {
                                    request({
                                        url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                        qs: {
                                            token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                            to: mobileNo,
                                            message: message,
                                            sender: 'Techingen'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        console.log('loop one executed');
                                        if (error) {
                                            console.log(error, "SMS");
                                        }
                                        else {
                                            console.log("SUCCESS", "SMS response");
                                        }

                                    });
                                }
                                else if (isdMobile == "+91") {
                                    request({
                                        url: 'https://aikonsms.co.in/control/smsapi.php',
                                        qs: {
                                            user_name: 'janardana@hirecraft.com',
                                            password: 'Ezeid2015',
                                            sender_id: 'WtMate',
                                            service: 'TRANS',
                                            mobile_no: mobileNo,
                                            message: message,
                                            method: 'send_sms'
                                        },
                                        method: 'GET'

                                    }, function (error, response, body) {
                                        console.log('loop 2 executed for +91');
                                        if (error) {
                                            console.log(error, "SMS");
                                        }
                                        else {
                                            console.log("SUCCESS", "SMS response");
                                        }
                                    });

                                    var req = http.request(options, function (res) {
                                        var chunks = [];

                                        res.on("data", function (chunk) {
                                            chunks.push(chunk);
                                        });

                                        res.on("end", function () {
                                            var body = Buffer.concat(chunks);
                                            console.log(body.toString());
                                        });
                                    });

                                    req.write(qs.stringify({
                                        userId: 'talentmicro',
                                        password: 'TalentMicro@123',
                                        senderId: 'WTMATE',
                                        sendMethod: 'simpleMsg',
                                        msgType: 'text',
                                        mobile: isdMobile.replace("+", "") + mobileNo,
                                        msg: message,
                                        duplicateCheck: 'true',
                                        format: 'json'
                                    }));
                                    req.end();


                                }
                                else if (isdMobile != "") {
                                    client.messages.create(
                                        {
                                            body: message,
                                            to: isdMobile + mobileNo,
                                            from: '+14434322305'
                                        },
                                        function (error, response) {
                                            console.log('loop executed 3 for all isds');

                                            if (error) {
                                                console.log(error, "SMS");
                                            }
                                            else {
                                                console.log("SUCCESS", "SMS response");
                                            }
                                        }
                                    );
                                }
                                response.status = true;
                                response.message = "Token generated successfully";
                                response.error = null;
                                response.data = {
                                    tokenNumber: results[0][0].tokenNumber
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while generating token";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

hospitalTokenManagementCtrl.getAppointmentSlots = function (req, res, next) {
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
    if (!req.query.resourceId) {
        error.resourceId = 'Invalid resourceId';
        validationFlag *= false;
    }
    if (!req.query.sessionDate) {
        error.sessionDate = 'Invalid sessionDate';
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
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.resourceId),
                    req.st.db.escape(req.query.sessionDate)
                ];

                var procQuery = 'CALL he_get_appointmentSlots( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Slots loaded successfully";
                        response.error = null;
                        response.data = {
                            slots: result[0]
                        };


                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No slots found";
                        response.error = null;
                        response.data = {
                            slots: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting slots";
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

hospitalTokenManagementCtrl.bookAppointment = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.HEMasterId) {
                        error.HEMasterId = 'Invalid HEMasterId';
                        validationFlag *= false;
                    }
                    if (!req.body.resourceId) {
                        error.resourceId = 'Invalid resourceId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        //         req.body.type = req.body.type ? req.body.type : 0;
                        //         req.body.whatmateId = req.body.whatmateId ? req.body.whatmateId : 0;
                        //         req.body.currentDatetime = req.body.currentDatetime ? req.body.currentDatetime : null;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.appointmentDate),
                            req.st.db.escape(req.body.startTime),
                            req.st.db.escape(req.body.resourceId),
                            req.st.db.escape(req.body.HEMasterId),
                            req.st.db.escape(req.body.name),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(DBSecretKey)                            
                        ];

                        var procQuery = 'CALL he_create_appointment( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err) {
                                response.status = true;
                                response.message = "Appointment booked successfully ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while booking";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


hospitalTokenManagementCtrl.printSpecialToken = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.HEMasterId) {
                        error.HEMasterId = 'Invalid HEMasterId';
                        validationFlag *= false;
                    }
                    if (!req.body.resourceId) {
                        error.resourceId = 'Invalid resourceId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.type = req.body.type ? req.body.type : 0;
                        req.body.whatmateId = req.body.whatmateId ? req.body.whatmateId : 0;
                        req.body.currentDatetime = req.body.currentDatetime ? req.body.currentDatetime : null;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.HEMasterId),
                            req.st.db.escape(req.body.resourceId),
                            req.st.db.escape(req.body.type),
                            req.st.db.escape(req.body.whatmateId),
                            req.st.db.escape(req.body.name),
                            req.st.db.escape(req.body.mobileISD),
                            req.st.db.escape(req.body.mobileNumber),
                            req.st.db.escape(req.body.currentDatetime)
                        ];

                        var procQuery = 'CALL he_print_hospitalSpecialToken( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0] && results[0][0].error) {
                                response.status = false;
                                response.message = "Max token count exceded ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Token generated successfully";
                                response.error = null;
                                response.data = {
                                    tokenNumber: results[0][0].tokenNumber
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while generating token";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


hospitalTokenManagementCtrl.updateAppointmentStatus = function (req, res, next) {
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
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    if (!req.body.resourceId) {
                        error.resourceId = 'Invalid resourceId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {


                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.resourceId),
                            req.st.db.escape(req.body.patientId),
                            req.st.db.escape(req.body.appointmentDate),
                            req.st.db.escape(req.body.startTime),
                            req.st.db.escape(req.body.status)
                        ];

                        var procQuery = 'CALL he_cancel_appointment( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err) {
                                response.status = true;
                                response.message = "Appointment status updated successfully ";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while updating";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

module.exports = hospitalTokenManagementCtrl;