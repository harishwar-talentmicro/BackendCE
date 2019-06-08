var dataMigration = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

dataMigration.resumeBackUp = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid Token",
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.userMasterId = req.query.userMasterId ? req.query.userMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.customRange),
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to),
                    req.st.db.escape(req.body.startPage || 1),
                    req.st.db.escape(req.body.limit || 500),
                    req.st.db.escape(req.body.subBackUpType || 0)
                ];


                if (req.body.backupType == 1) {
                    var procQuery = 'CALL pace_backup_applicantResumeData( ' + inputs.join(',') + ')';
                }
                else if (req.body.backupType == 2) {
                    var procQuery = 'CALL pace_backup_requirementData( ' + inputs.join(',') + ')';
                }
                else if (req.body.backupType == 3) {
                    var procQuery = 'CALL pace_backup_clientData( ' + inputs.join(',') + ')';
                }
                else if (req.body.backupType == 4) {
                    var procQuery = 'CALL pace_backup_requirementApplicantData( ' + inputs.join(',') + ')';
                }
                else if (req.body.backupType == 5) {
                    var procQuery = 'CALL pace_backup_reqAppTransactionHistoryData( ' + inputs.join(',') + ')';
                }

                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        if (req.body.backupType == 1) {
                            response.data = {
                                data: result[0] ? result[0] : [],
                                exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                            }
                        }
                        else if (req.body.backupType == 2) {
                            response.data = {
                                requirementData: result[0] ? result[0] : [],
                                exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0,
                                clientContactData: result[2] ? result[2] : [],
                                teamMembersData: result[3] ? result[3] : [],
                                interviewPanelMembersData: result[4] ? result[4] : [],
                                followUpNotesData: result[5] ? result[5] : []
                            }
                        }
                        else if (req.body.backupType == 3) {
                            response.data = {
                                clientData: result[0] ? result[0] : [],
                                exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0,
                                clientBranchData: result[2] ? result[2] : [],
                                clientContractData: result[3] ? result[3] : [],
                                clientContactData: result[4] ? result[4] : [],
                                followUpNotesData: result[5] ? result[5] : [],
                                mailHistoryData: result[6] ? result[6] : []
                            }
                        }
                        else if (req.body.backupType == 4) {
                            response.data = {
                                reqAppData: result[0] ? result[0] : [],
                                exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0,
                            }
                        }
                        else if (req.body.backupType == 5) {
                            response.data = {
                                reqAppTransactionData: result[0] ? result[0] : [],
                                exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0,
                            }
                        }


                        if (req.query.isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data";
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