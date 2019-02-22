var hristrl = {};

hristrl.masterData = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL pace_hris_masterData( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] || result[1]) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            jobType : result[0] ? result[0] : [],
                            currency : result[1] ? result[1] : [],
                            scale : result[2] ? result[2] : [],
                            duration : result[3] ? result[3] : [],
                            country : result[4] ? result[4] : [],
                            reason : result[5] ? result[5] : [],
                            companyLocation : result[6] ? result[6] : [],
                            department : result[7] ? result[7] : [],
                            grade : result[8] ? result[8] : [],
                            designation : result[9] ? result[9] : [],
                            extraInformationMaster : result[10] ? result[10] : []                          
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting master data";
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


hristrl.saveEmployeeData = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.employeeId || 0),
                    req.st.db.escape(req.body.empCode),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName || ""),
                    req.st.db.escape(req.body.branchId || 0),
                    req.st.db.escape(req.body.departmentId || 0),
                    req.st.db.escape(req.body.gradeId || 0),
                    req.st.db.escape(req.body.designationId || 0),
                    req.st.db.escape(req.body.picturePath || ""),
                    req.st.db.escape(req.body.officeMobileNoCC || ""),
                    req.st.db.escape(req.body.officeMobileNo || ""),
                    req.st.db.escape(req.body.officePhoneNoCC || ""),
                    req.st.db.escape(req.body.officePhoneNo || ""),
                    req.st.db.escape(req.body.officeEmailId || ""),
                    req.st.db.escape(req.body.personalMobileNoCC || ""),
                    req.st.db.escape(req.body.personalMobileNo || ""),
                    req.st.db.escape(req.body.personalPhoneNoCC || ""),
                    req.st.db.escape(req.body.personalPhoneNo || ""),
                    req.st.db.escape(req.body.personalEmailId || ""),
                    req.st.db.escape(req.body.doj || null),
                    req.st.db.escape(req.body.status || 0),
                    req.st.db.escape(req.body.reasonId || 0),
                    req.st.db.escape(req.body.doe || null),
                    req.st.db.escape(req.body.gender || 0),                    
                    req.st.db.escape(req.body.dob || null),
                    req.st.db.escape(req.body.maritalStatus || 0), 
                    req.st.db.escape(JSON.stringify(req.body.extraInformation || []))
                ];

                var procQuery = 'CALL pace_hris_saveEmployeeData( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                        response.status = true;
                        response.message = result[0][0]._error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Employee data loaded successfully";
                        response.error = null;
                        response.data = {
                          employeeDetails : result[0] && result[0][0] ? result[0][0] : null                          
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting master data";
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


hristrl.employeeDetails = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.query.employeeId) {
        error.employeeId = 'Invalid employeeId';
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.employeeId)
                ];

                var procQuery = 'CALL pace_hris_getEmployeeDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Employee data loaded successfully";
                        response.error = null;
                        response.data = {
                          employeeDetails : result[0] && result[0][0] ? result[0][0] : null                          
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting employee data";
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

hristrl.employeeList = function (req, res, next) {
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
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.branchId || ""),
                    req.st.db.escape(req.body.departmentId || ""),
                    req.st.db.escape(req.body.gradeId || ""),
                    req.st.db.escape(req.body.designationId || ""),
                    req.st.db.escape(req.body.search || "")
                ];

                var procQuery = 'CALL pace_hris_employeeeList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Employee data loaded successfully";
                        response.error = null;
                        response.data = {
                          employeeList : result[0] && result[0][0] ? result[0] : null                          
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting employee data";
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

module.exports = hristrl;