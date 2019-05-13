var spawn = require("child_process").spawn;
var fs = require("fs");
var resumeMaskingCtrl = {};
var path = require('path');
var uuid = require('node-uuid');
var logger = require('../../error-logger/error-log.js');

// var resume_masking = function (original_path, new_path, header, footer, required_data) {
resumeMaskingCtrl.resume_masking = function (req, res, next) {
    var error_response = {
        status: false,
        message: "Some error occurred!",
        error: null,
        data: null
    }

    var error_logger = {
        details: 'resumeMaskingCtrl.resume_masking'
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
                try {
                    if ((!err) && tokenResult) {


                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.body.applicantId),
                            req.st.db.escape(req.body.reqAppId || 0)
                        ];

                        var procQuery = 'CALL pace_resumeMasking( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, Result) {
                            try {
                                console.log(err);

                                if (!err && Result && Result[0] && Result[1] && Result[1][0] && Result[1][0].cvPath != "") {
                                    try {

                                        var orgCVPath = Result[1][0].cvPath;
                                        var clientCVHeader = Result[0][0].clientCVHeader;
                                        var clientCVFooter = Result[0][0].clientCVFooter;
                                        var clientCVMaskMobileNo = Result[0][0].clientCVMaskMobileNo;
                                        var clientCVMaskEmail = Result[0][0].clientCVMaskEmail;
                                        var logoFile = Result[0][0].logoFile;

                                        var uniqueId = uuid.v4();

                                        var uniqueId = uniqueId + "." + orgCVPath.split('.')[1];

                                        if (logoFile != "") {
                                            logoFile = 'https://storage.googleapis.com/ezeone/' + logoFile;
                                        }


                                        var process = spawn('python', [path.resolve(__dirname, "word.py"), 'https://storage.googleapis.com/ezeone/' + orgCVPath, uniqueId, logoFile, clientCVHeader, clientCVFooter, clientCVMaskMobileNo, clientCVMaskEmail]);
                                        // fs.readFile(path.resolve(__dirname, "word.py"), function (err, res) {
                                        //     console.log(err, res);
                                        // })
                                        // var process = spawn('python', [path.resolve(__dirname, "test.py")]);

                                        process.stdout.on('data', function (data) {
                                            try {
                                                console.log(data.toString());

                                                var update = [
                                                    req.st.db.escape(req.query.token),
                                                    req.st.db.escape(req.query.heMasterId),
                                                    req.st.db.escape(req.body.applicantId),
                                                    req.st.db.escape(req.body.reqAppId || 0),
                                                    req.st.db.escape(uniqueId)
                                                ];

                                                var procQuery = 'CALL pace_resumeMaskingUpdate( ' + update.join(',') + ')';
                                                console.log(procQuery);
                                                req.db.query(procQuery, function (err, Result) {
                                                    try {
                                                        console.log(err);

                                                        console.log('output: ' + data.toString());
                                                        response.status = true;
                                                        response.message = "Success";
                                                        response.error = null;
                                                        response.data = {
                                                            clientCVPath: uniqueId
                                                        };
                                                        res.status(200).json(response);
                                                    }
                                                    catch (ex) {
                                                        console.log(ex);
                                                        response.status = true;
                                                        response.message = "Error while masking";
                                                        res.status(500).json(response);
                                                    }
                                                    // res.send(200)
                                                });
                                            } catch (ex) {
                                                console.log(ex);
                                                response.status = true;
                                                response.message = "Error while masking";
                                                res.status(500).json(response);
                                            }
                                        })
                                    } catch (ex) {
                                        console.log(ex);
                                        response.status = true;
                                        response.message = "Error while masking";
                                        res.status(500).json(response);
                                    }
                                }
                                else if (!err) {
                                    response.status = false;
                                    response.message = "Original resume not found";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Something went wrong";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                error_logger.error = ex;
                                error_logger.proc_call = procQuery;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });

                    } else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }
    catch (ex) {
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
}

module.exports = resumeMaskingCtrl;