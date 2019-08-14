/**
 * Created by vedha on 10-03-2017.
 */

var holidayTemplateCtrl = {};
var logger = require('../../error-logger/error-log.js');  // for logging errors

/**
 *
 * @param req
 * @param res
 * @param next
 */
holidayTemplateCtrl.saveHolidayTemplate = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'holidayTemplate/holidayTemplate-Ctrl : holidayTemplateCtrl.saveHolidayTemplate',
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
                        req.body.holidayTemplateId = (req.body.holidayTemplateId) ? req.body.holidayTemplateId : 0;
                        req.body.holidayTemplateTitle = (req.body.holidayTemplateTitle) ? req.body.holidayTemplateTitle : '';
                        req.body.holidayDate = (req.body.holidayDate) ? req.body.holidayDate : null;
                        req.body.holidayTitle = (req.body.holidayTitle) ? req.body.holidayTitle : '';
                        req.body.holidayId = (req.body.holidayId) ? req.body.holidayId : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.holidayTemplateId),
                            req.st.db.escape(req.body.holidayTemplateTitle),
                            req.st.db.escape(req.body.holidayDate),
                            req.st.db.escape(req.body.holidayTitle),
                            req.st.db.escape(req.body.holidayId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL save_HE_Holiday( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, holidayTemplateResult) {
                            try {
                                console.log(err);
                                if (!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0].holidayTemplateId) {
                                    response.status = true;
                                    response.message = "Holiday template saved successfully";
                                    response.error = null;
                                    response.holidayTemplateId = holidayTemplateResult[0][0].holidayTemplateId;
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

holidayTemplateCtrl.getholidayTemplateList = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'holidayTemplate/holidayTemplate-Ctrl : holidayTemplateCtrl.getholidayTemplateList',
    }

    try {
        var response = {
            status: false,
            message: "Error while loading deal",
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
                        var procQuery = 'CALL get_HEHolidayTemplateList( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, holidayTemplateResult) {
                            try {
                                if (!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0]) {
                                    response.status = true;
                                    response.message = "Holiday template list loaded successfully";
                                    response.error = null;
                                    response.data = {
                                        holidayTemplateList: holidayTemplateResult[0]
                                    };
                                    res.status(200).json(response);

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Holiday template list loaded successfully";
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

holidayTemplateCtrl.getholidayTemplateDetails = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'holidayTemplate/holidayTemplate-Ctrl : holidayTemplateCtrl.getholidayTemplateDetails',
    }

    try {
        var response = {
            status: false,
            message: "Error while loading deal",
            data: null,
            error: null
        };
        var validationFlag = true;
        if (!req.query.holidayTemplateId) {
            error.token = 'Invalid holidayTemplateId';
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
                            req.st.db.escape(req.query.holidayTemplateId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL get_HEHolidayTemplateDetails( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, holidayTemplateResult) {
                            try {
                                if (!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0]) {
                                    response.status = true;
                                    response.message = "Holiday template loaded successfully";
                                    response.error = null;
                                    response.data = {
                                        holidayTemplate: holidayTemplateResult[0][0],
                                        holidayTemplateList: holidayTemplateResult[1]
                                    };
                                    res.status(200).json(response);

                                }
                                else if (err) {
                                    response.status = false;
                                    response.message = "Error while getting form template";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
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

holidayTemplateCtrl.deleteHolidayTemplate = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'holidayTemplate/holidayTemplate-Ctrl : holidayTemplateCtrl.deleteHolidayTemplate',
    }

    try {
        var response = {
            status: false,
            message: "Error while deleting holiday template",
            data: null,
            error: null
        };
        var validationFlag = true;
        if (!req.query.holidayTemplateId) {
            error.token = 'Invalid holidayTemplateId';
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
                            req.st.db.escape(req.query.holidayTemplateId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL delete_HE_holidayTemplate( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, formTemplateResult) {
                            try {
                                if (formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error) {
                                    switch (formTemplateResult[0][0]._error) {
                                        case 'IN_USE':
                                            response.status = false;
                                            response.message = "Holiday template is in use.";
                                            response.error = null;
                                            res.status(200).json(response);
                                            break;
                                    }
                                }


                                if (!err) {
                                    response.status = true;
                                    response.message = "Holiday template deleted successfully";
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

holidayTemplateCtrl.deleteHoliday = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'holidayTemplate/holidayTemplate-Ctrl : holidayTemplateCtrl.deleteHoliday',
    }

    try {
        var response = {
            status: false,
            message: "Error while deleting holiday template",
            data: null,
            error: null
        };
        var validationFlag = true;
        if (!req.query.holidayId) {
            error.token = 'Invalid holidayId';
            validationFlag *= false;
        }
        if (!req.query.holidayTemplateId) {
            error.token = 'Invalid holidayTemplateId';
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
                            req.st.db.escape(req.query.holidayTemplateId),
                            req.st.db.escape(req.query.holidayId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL delete_HE_holiday( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, formTemplateResult) {
                            try {
                                if (!err) {
                                    response.status = true;
                                    response.message = "Holiday deleted successfully";
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

module.exports = holidayTemplateCtrl;