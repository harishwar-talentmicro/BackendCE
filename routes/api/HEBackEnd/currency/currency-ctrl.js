/**
 * Created by Jana1 on 11-03-2017.
 */

var currencyCtrl = {};
var error = {};

var logger = require('../../error-logger/error-log.js');  // for logging errors


currencyCtrl.saveCurrency = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'currency/currency-Ctrl : currencyCtrl.saveCurrency',
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
        if (!req.body.currencyId) {
            error.currencyId = 'Invalid currencyId';
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
                        req.body.conversionRate = (req.body.conversionRate) ? req.body.conversionRate : 0;
                        req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                        req.body.baseCurrency = (req.body.baseCurrency) ? req.body.baseCurrency : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.currencyId),
                            req.st.db.escape(req.body.conversionRate),
                            req.st.db.escape(req.body.baseCurrency),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL save_HE_currency( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, currencyResult) {
                            try {
                                console.log(err);
                                if (!err && currencyResult && currencyResult[0] && currencyResult[0][0]._error) {
                                    switch (currencyResult[0][0]._error) {
                                        case 'ALL_READY_DEFAULT_CURRENCY':
                                            response.status = false;
                                            response.message = "Only one default currency can be created";
                                            response.error = null;
                                            res.status(200).json(response);
                                            break;
                                        default:
                                            break;
                                    }

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Currency saved successfully";
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

currencyCtrl.updateCurrency = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'currency/currency-Ctrl : currencyCtrl.updateCurrency',
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
        if (!req.body.currencySymbol) {
            error.token = 'Invalid currency symbol';
            validationFlag *= false;
        }
        if (!req.body.currencyId) {
            error.token = 'Invalid currency Id';
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
                        req.body.conversionRate = (req.body.conversionRate) ? req.body.conversionRate : 0;
                        req.body.baseCurrency = (req.body.baseCurrency) ? req.body.baseCurrency : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.currencyId),
                            req.st.db.escape(req.body.conversionRate),
                            req.st.db.escape(req.body.baseCurrency),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL save_HE_currency( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, worklocationResult) {
                            try {
                                console.log(err);
                                if (!err && worklocationResult && worklocationResult[0] && worklocationResult[0][0]._error) {
                                    switch (worklocationResult[0][0]._error) {
                                        case 'ALL_READY_DEFAULT_CURRENCY':
                                            response.status = false;
                                            response.message = "Only one default currency can be created";
                                            response.error = null;
                                            res.status(200).json(response);
                                            break;

                                        default:
                                            break;
                                    }

                                }

                                if (!err) {
                                    response.status = true;
                                    response.message = "Currency saved successfully";
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

currencyCtrl.getCurrencyList = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'currency/currency-Ctrl : currencyCtrl.updateCurrency',
    }

    try {
        var response = {
            status: false,
            message: "Error while loading currency",
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

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL get_HECurrencyList( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, currencyResult) {
                            try {
                                if (!err && currencyResult) {
                                    response.status = true;
                                    response.message = "Currency loaded successfully";
                                    response.error = null;
                                    response.data = {
                                        currencyList: currencyResult[0] ? currencyResult[0] : [],
                                        masterCurrencyList: currencyResult[1] ? currencyResult[1] : []
                                    };
                                    res.status(200).json(response);

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Currency loaded successfully";
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

currencyCtrl.deleteCurrency = function (req, res, next) {

    var error_response = {
        status: false,
        message: "Some error occured",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'currency/currency-Ctrl : currencyCtrl.updateCurrency',
    }
    try {
        var response = {
            status: false,
            message: "Error while deleting currency",
            data: null,
            error: null
        };
        var validationFlag = true;

        if (!req.query.currencyId) {
            error.token = 'Invalid currencyId';
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
                            req.st.db.escape(req.query.currencyId),
                            req.st.db.escape(req.query.APIKey)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL delete_HE_currency( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, formTemplateResult) {
                            try {
                                if (!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error) {
                                    switch (formTemplateResult[0][0]._error) {
                                        case 'IN_USE':
                                            response.status = false;
                                            response.message = "Currenncy is in use";
                                            response.error = null;
                                            res.status(200).json(response);
                                            break;
                                    }
                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "Currency deleted successfully";
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

module.exports = currencyCtrl;