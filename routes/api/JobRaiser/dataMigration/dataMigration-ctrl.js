var dataMigration = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;


dataMigration.saveUserManager = function (req, res, next) {

    var error = {};
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
    
    if (!req.body.HC_ID) {
        error.HC_ID = 'Invalid HC_ID';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    var accessRights = req.body.accessRights;
    if (typeof (accessRights) == "string") {
        accessRights = JSON.parse(accessRights);
    }
    if (!accessRights) {
        accessRights = {};
    }

    var reportingTo = req.body.reportingTo;
    if (typeof (reportingTo) == "string") {
        reportingTo = JSON.parse(reportingTo);
    }
    if (!reportingTo) {
        reportingTo = [];
    }

    var branch = req.body.branch;
    if (typeof (branch) == "string") {
        branch = JSON.parse(branch);
    }
    if (!branch) {
        branch = {};
    }

    var department = req.body.department;
    if (typeof (department) == "string" && department != "") {
        department = JSON.parse(department);
    }
    if (!department || department == "") {
        department = {};
    }
    console.log('department', department);
    var grade = req.body.grade;
    if (typeof (grade) == "string") {
        grade = JSON.parse(grade);
    }
    if (!grade) {
        grade = {};
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {


                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.apiKey = req.query.apiKey ? req.query.apiKey : 0;
                req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;
                req.body.status = req.body.status ? req.body.status : false;
                req.body.shortSignature = req.body.shortSignature ? req.body.shortSignature : '';
                req.body.fullSignature = req.body.userMasterId ? req.body.fullSignature : '';
                req.body.userType = req.body.userType ? req.body.userType : 0;
                req.body.firstName = req.body.firstName ? req.body.firstName : '';
                req.body.lastName = req.body.lastName ? req.body.lastName : '';
                req.body.mobileISD = req.body.mobileISD ? req.body.mobileISD : '';
                req.body.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : '';
                req.body.emailId = req.body.emailId ? req.body.emailId : '';
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                req.body.location = req.body.location ? req.body.location : '';
                req.body.gradeId = req.body.gradeId ? req.body.gradeId : 0;
                req.body.workGroupId = req.body.workGroupId ? req.body.workGroupId : 0;
                req.body.RMId = req.body.RMId ? req.body.RMId : 0;
                req.body.exitDate = req.body.exitDate ? req.body.exitDate : null;
                req.body.password = req.body.password ? req.body.password : '';
                var encryptPwd = req.st.hashPassword(req.body.password);
                req.body.mailer = req.body.mailer ? req.body.mailer : 2;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.apiKey),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.employeeCode),
                    req.st.db.escape(typeof (req.body.jobTitle) == "string" ? req.body.jobTitle : JSON.stringify(req.body.jobTitle)),
                    req.st.db.escape(JSON.stringify(accessRights)),
                    req.st.db.escape(JSON.stringify(reportingTo)),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.shortSignature),
                    req.st.db.escape(req.body.fullSignature),
                    req.st.db.escape(JSON.stringify(req.body.transferredTo)),
                    req.st.db.escape(typeof (req.body.userType) == "string" ? req.body.userType : JSON.stringify(req.body.userType)),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(JSON.stringify(department)),
                    req.st.db.escape(req.body.location),
                    req.st.db.escape(JSON.stringify(grade)),
                    req.st.db.escape(req.body.workGroupId),
                    req.st.db.escape(req.body.RMId),
                    req.st.db.escape(req.body.exitDate),
                    req.st.db.escape(req.body.joiningDate),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(encryptPwd),
                    req.st.db.escape(req.body.mailer),
                    req.st.db.escape(JSON.stringify(branch)),
                    req.st.db.escape(req.body.HC_ID),
                    req.st.db.escape(req.body.createdDate || null),
                    req.st.db.escape(req.body.updatedDate || null)
                ];
                var procQuery = 'CALL save_Pace_migrantUser( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0] && results[0][0].message) {
                        response.status = true;
                        response.message = results[0][0].message;
                        response.error = null;
                        response.data = {
                            userDetails: results[0][0]
                        };
                        res.status(200).json(response);
                    }

                    else if (!err && results && results[0] && results[0][0].error) {
                        response.status = false;
                        response.message = results[0][0].error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving user data";
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


module.exports = dataMigration;