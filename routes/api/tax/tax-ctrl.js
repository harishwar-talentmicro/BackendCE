/**
 * Created by vedha on 17-10-2017.
 */

var taxCtrl = {};
var error = {};

taxCtrl.getTaxDeclarations = function (req, res, next) {
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
    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
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
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.taxDate)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_tax_declaration( ' + procParams.join(',') + ')';
                req.db.query(procQuery, function (err, taxDeclaration) {
                    if (!err && taxDeclaration && taxDeclaration[0] && taxDeclaration[0][0]) {
                        var output = [];
                        for (var i = 0; i < taxDeclaration[1].length; i++) {
                            var res1 = {};
                            res1.groupName = taxDeclaration[1][i].groupName;
                            res1.taxGroupId = taxDeclaration[1][i].taxGroupId;
                            res1.plannedAmount = taxDeclaration[1][i].plannedAmount;
                            res1.actualAmount = taxDeclaration[1][i].actualAmount;

                            for (var j = 0; j < taxDeclaration[2].length; j++) {

                                if (taxDeclaration[1][i].taxGroupId == taxDeclaration[2][j].taxGroupId) {
                                    res1.items = (taxDeclaration[2][j].items) ? JSON.parse("[" + taxDeclaration[2][j].items + "]") : [];
                                    break;
                                }
                                else {
                                    res1.items = [];
                                }
                            }
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Tax declaration loaded successfully";
                        response.error = null;
                        response.data = {
                            savingMasterId: taxDeclaration[0][0].savingMasterId,
                            startDate: taxDeclaration[0][0].startDate,
                            endDate: taxDeclaration[0][0].endDate,
                            helpUrlLink: taxDeclaration[0][0].helpUrlLink,
                            totalPlannedAmount: taxDeclaration[0][0].totalPlannedAmount,
                            actualAmount: taxDeclaration[0][0].actualAmount,
                            form16: (taxDeclaration[3] && taxDeclaration[3][0] && taxDeclaration[3][0].file) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + taxDeclaration[3][0].file) : "",
                            groupList: output,
                            uploadLockStatus: (taxDeclaration[4] && taxDeclaration[4][0]) ? taxDeclaration[4][0].uploadLockStatus : 1,
                            plannedLockStatus: (taxDeclaration[5] && taxDeclaration[5][0]) ? taxDeclaration[5][0].plannedLockStatus : 1
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting tax declaration";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        );
    }

};

taxCtrl.saveTaxItems = function (req, res, next) {
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
                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.taxGroupId) {
                        error.taxGroupId = 'Invalid taxGroupId';
                        validationFlag *= false;
                    }
                    if (!req.body.taxItemId) {
                        error.taxItemId = 'Invalid taxItemId';
                        validationFlag *= false;
                    }

                    var attachments = req.body.attachments;
                    if (typeof (attachments) == "string") {
                        attachments = JSON.parse(attachments);
                    }
                    if (!attachments) {
                        attachments = [];
                    }
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.savingMasterId = req.body.savingMasterId ? req.body.savingMasterId : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.taxGroupId),
                            req.st.db.escape(req.body.taxItemId),
                            req.st.db.escape(req.body.billNo),
                            req.st.db.escape(req.body.billDate),
                            req.st.db.escape(req.body.amount),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(JSON.stringify(attachments)),
                            req.st.db.escape(req.body.savingMasterId)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL he_save_tax_items( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, taxItem) {
                            if (!err && taxItem && taxItem[0] && taxItem[0][0] && taxItem[0][0].message) {
                                response.status = true;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);

                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Item saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving item";
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
        }
        );
    }
};

taxCtrl.getTaxItems = function (req, res, next) {
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
    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }

    if (!req.query.taxGroupId) {
        error.taxGroupId = 'Invalid taxGroupId';
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
                req.query.taxItemId = req.query.taxItemId ? req.query.taxItemId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.taxGroupId),
                    req.st.db.escape(req.query.taxItemId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_tax_items( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taxItem) {
                    if (!err && taxItem && taxItem[0] && taxItem[0][0]) {
                        var output = [];
                        for (var i = 0; i < taxItem[0].length; i++) {
                            var res1 = {};
                            res1.entryId = taxItem[0][i].entryId;
                            res1.billNo = taxItem[0][i].billNo;
                            res1.billDate = taxItem[0][i].billDate;
                            res1.amount = taxItem[0][i].amount;
                            res1.notes = taxItem[0][i].notes;
                            res1.attachments = (taxItem[0][i].attachments) ? JSON.parse(taxItem[0][i].attachments) : [];
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Tax items loaded successfully";
                        response.error = null;
                        response.data = {
                            itemList: output
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Tax items loaded successfully";
                        response.error = null;
                        response.data = {
                            itemList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting tax items";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        );
    }

};

taxCtrl.deleteTaxItems = function (req, res, next) {
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
    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }

    if (!req.query.entryId) {
        error.entryId = 'Invalid entryId';
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
                req.query.taxItemId = req.query.taxItemId ? req.query.taxItemId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.entryId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_tax_item( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taxItem) {
                    if (!err) {
                        response.status = true;
                        response.message = "Tax item deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting tax item";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        );
    }

};

taxCtrl.saveTaxGroupPlannedAmount = function (req, res, next) {
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
                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.savingMasterId) {
                        error.savingMasterId = 'Invalid savingMasterId';
                        validationFlag *= false;
                    }

                    var taxGroupList = req.body.taxGroupList;
                    if (typeof (taxGroupList) == "string") {
                        taxGroupList = JSON.parse(taxGroupList);
                    }
                    if (!taxGroupList) {
                        error.taxGroupList = 'Invalid taxGroupList';
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
                            req.st.db.escape(req.body.savingMasterId),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(taxGroupList))
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL he_save_tax_plannedAmount( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, taxItem) {
                            if (!err) {
                                response.status = true;
                                response.message = "Planned amount saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving planned amount";
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
        }
        );
    }
};

taxCtrl.getTaxItemQuestions = function (req, res, next) {
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
    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!req.query.itemId) {
        error.itemId = 'Invalid itemId';
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
                    req.st.db.escape(req.query.itemId),
                    req.st.db.escape(req.query.groupId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_itemQuestions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taxDeclaration) {
                    if (!err && taxDeclaration && taxDeclaration[0] && taxDeclaration[0][0]) {
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.error = null;
                        response.data = {
                            questions: taxDeclaration[0]
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting questions";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        );
    }

};

taxCtrl.saveTaxItemQuestions = function (req, res, next) {
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
                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }
                    if (!req.body.itemId) {
                        error.itemId = 'Invalid itemId';
                        validationFlag *= false;
                    }

                    var questions = req.body.questions;
                    if (typeof (questions) == "string") {
                        questions = JSON.parse(questions);
                    }
                    if (!questions) {
                        questions = [];
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
                            req.st.db.escape(req.body.itemId),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(questions))
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL he_save_itemQuestions( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, taxDeclaration) {
                            if (!err) {
                                response.status = true;
                                response.message = "Questions saved successfully";
                                response.error = null;
                                response.data = {
                                    mandatoryQuestionCount: taxDeclaration[0][0].mandatoryQuestionCount
                                };
                                res.status(200).json(response);

                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving questions";
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
        }
        );
    }
};

module.exports = taxCtrl;