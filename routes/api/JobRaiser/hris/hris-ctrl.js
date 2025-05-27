var hristrl = {};
var error = {};

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

                        for (var i = 0; i < result[11].length; i++) {
                            result[11][i].documents = result[11][i] && result[11][i].documents ? JSON.parse(result[11][i].documents) : [];
                        }


                        response.data = {
                            jobType: result[0] ? result[0] : [],
                            currency: result[1] ? result[1] : [],
                            scale: result[2] ? result[2] : [],
                            duration: result[3] ? result[3] : [],
                            country: result[4] ? result[4] : [],
                            reason: result[5] ? result[5] : [],
                            companyLocation: result[6] ? result[6] : [],
                            department: result[7] ? result[7] : [],
                            grade: result[8] ? result[8] : [],
                            designation: result[9] ? result[9] : [],
                            extraInformationMaster: result[10] ? result[10] : [],
                            documentTemplates: result[11] && result[11][0] ? result[11] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
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
                    req.st.db.escape(JSON.stringify(req.body.extraInformation || [])),
                    req.st.db.escape(req.body.address || ""),
                    req.st.db.escape(req.body.latitude || 0),
                    req.st.db.escape(req.body.longitude || 0)
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
                            employeeDetails: result[0] && result[0][0] ? result[0][0] : null
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
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

                        result[0][0].documents = result[0][0] && result[0][0].documents ? JSON.parse(result[0][0].documents) : [];

                        // if (result[0][0].documents) {
                        //     for (var i = 0; i < result[0][0].documents.length; i++) {
                        //         if (result[0][0].documents[i].cdnPath && typeof (result[0][0].documents[i].cdnPath) == 'string')
                        //             result[0][0].documents[i].cdnPath = JSON.parse(result[0][0].documents[i].cdnPath) ? result[0][0].documents[i].cdnPath : [];
                        //     }
                        // }

                        response.data = {
                            employeeDetails: result[0] && result[0][0] ? result[0][0] : null
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
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
    var error = {};

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
                    req.st.db.escape(JSON.stringify(req.body.branchId || [])),
                    req.st.db.escape(JSON.stringify(req.body.departmentId || [])),
                    req.st.db.escape(JSON.stringify(req.body.gradeId || [])),
                    req.st.db.escape(JSON.stringify(req.body.designationId || [])),
                    req.st.db.escape(req.body.search || ""),
                    req.st.db.escape(req.body.startPage || 0),
                    req.st.db.escape(req.body.limit || 0)
                ];

                var procQuery = 'CALL pace_hris_employeeeList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        if (result[0] && result[0][0] && result[0][0].employeeId)
                            response.message = "Employee data loaded successfully";
                        else
                            response.message = "No results found";

                        response.error = null;
                        response.data = {
                            employeeList: result[0] && result[0][0] && result[0][0].employeeId ? result[0] : [],
                            count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            employeeList: [],
                            count: 0
                        };
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


hristrl.SaveEmployeeDocuments = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var error = {};
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.body.employeeId) {
        error.employeeId = 'Invalid employeeId';
        validationFlag *= false;
    }

    if (!req.body.docTemplateId) {
        error.docTemplateId = 'Invalid doc templateId';
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
                    req.st.db.escape(req.body.employeeId),
                    req.st.db.escape(req.body.docTemplateId),
                    req.st.db.escape(JSON.stringify(req.body.documents || []))
                ];

                var procQuery = 'CALL pace_hris_saveEmployeeDocuments( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Employee documents saved successfully";
                        response.error = null;

                        result[0][0].documents = result[0][0] && result[0][0].documents ? JSON.parse(result[0][0].documents) : [];

                        // if (result[0][0].documents) {
                        //     for (var i = 0; i < result[0][0].documents.length; i++) {
                        //         if (result[0][0].documents[i].cdnPath && typeof (result[0][0].documents[i].cdnPath) == 'string')
                        //             result[0][0].documents[i].cdnPath = JSON.parse(result[0][0].documents[i].cdnPath) ? result[0][0].documents[i].cdnPath : [];
                        //     }
                        // }

                        response.data = {
                            employeeDocuments: result[0] && result[0][0] ? result[0][0] : null
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            employeeDocuments: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving employee data";
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

hristrl.saveHrisDocumentTemplates = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var error = {};
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.body.templateName) {
        error.templateName = 'Invalid templateName';
        validationFlag *= false;
    }

    if (!req.body.documents.length) {
        error.heMasterId = 'Invalid documents';
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
                    req.st.db.escape(req.body.templateId || 0),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(JSON.stringify(req.body.documents || [])),
                    req.st.db.escape(req.body.status || 0)
                ];

                var procQuery = 'CALL pace_hris_saveDocumentTemplates( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                        response.status = false;
                        response.message = result[0][0]._error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }


                    else if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        if (req.body.status)
                            response.message = "Document template saved successfully";
                        else
                            response.message = "Document template deleted successfully";

                        response.error = null;

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].documents = result[1][i] && result[1][i].documents ? JSON.parse(result[1][i].documents) : [];
                        }

                        response.data = {
                            masterDocuments: result[0] && result[0][0] ? result[0] : [],
                            documentTemplates: result[1] && result[1][0] ? result[1] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            masterDocuments: [],
                            documentTemplates: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving document template";
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


hristrl.getHrisDocumentTemplates = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var error = {};
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

                var procQuery = 'CALL pace_hris_get_DocumentTemplates( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Document template loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].documents = result[1][i] && result[1][i].documents ? JSON.parse(result[1][i].documents) : [];
                        }

                        response.data = {
                            masterDocuments: result[0] && result[0][0] ? result[0] : [],
                            documentTemplates: result[1] && result[1][0] ? result[1] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            masterDocuments: [],
                            documentTemplates: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading document template";
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