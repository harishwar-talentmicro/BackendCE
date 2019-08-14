/**
 * Created by Jana1 on 09-09-2017.
 */
var logger = require('../../error-logger/error-log.js');  // for logging errors

var departmentCtrl = {};

departmentCtrl.saveDepartment = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'department/department-Ctrl : department.saveDepartment',
    }

    try {
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
        if (!req.query.APIKey) {
            error.APIKey = 'Invalid APIKey';
            validationFlag *= false;
        }

        if (!req.body.title) {
            error.token = 'Invalid title';
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
                try {
                    if ((!err) && tokenResult) {
                        req.body.departmentId = (req.body.departmentId) ? req.body.departmentId : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.departmentId),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_department( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, departmentResult) {
                            try {
                                if (!err) {
                                    response.status = true;
                                    response.message = "Department saved successfully";
                                    response.error = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    error_logger.error = err;
                                    error_logger.proc_call = procQuery;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            } catch (ex) {
                                error_logger.error = ex;
                                error_logger.proc_call = procQuery;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                } catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    } catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

departmentCtrl.getDepartment = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'department/department-Ctrl : department.getDepartment',
    }

    try {
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var validationFlag = true;

        if (!req.query.APIKey) {
            error.APIKey = 'Invalid APIKey';
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
                try {
                    if ((!err) && tokenResult) {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_get_department( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, departmentResult) {
                            try {
                                if (!err && departmentResult && departmentResult[0] && departmentResult[0][0]) {
                                    response.status = true;
                                    response.message = "Departments loaded successfully";
                                    response.error = null;
                                    response.data = {
                                        departmentList: departmentResult[0]
                                    };
                                    res.status(200).json(response);

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Departments loaded successfully";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    error_logger.error = err;
                                    error_logger.proc_call = procQuery;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            } catch (ex) {
                                error_logger.error = ex;
                                error_logger.proc_call = procQuery;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                } catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    } catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }

};

departmentCtrl.deleteDepartment = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'department/department-Ctrl : department.deleteDepartment',
    }

    try {
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var validationFlag = true;
        if (!req.query.departmentId) {
            error.departmentId = 'Invalid departmentId';
            validationFlag *= false;
        }
        if (!req.query.APIKey) {
            error.APIKey = 'Invalid APIKey';
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
                try {
                    if ((!err) && tokenResult) {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.departmentId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_delete_department( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, departmentResult) {
                            try {
                                if (!err && departmentResult && departmentResult[0] && departmentResult[0][0]._error) {
                                    switch (departmentResult[0][0]._error) {
                                        case 'IN_USE':
                                            response.status = false;
                                            response.message = "Department is in use";
                                            response.error = null;
                                            res.status(200).json(response);
                                            break;
                                    }
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Department deleted successfully";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    error_logger.error = err;
                                    error_logger.proc_call = procQuery;
                                    logger(req, error_logger);
                                    res.status(500).json(error_response);
                                }
                            } catch (ex) {
                                error_logger.error = ex;
                                error_logger.proc_call = procQuery;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                } catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    } catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }

};

module.exports = departmentCtrl;