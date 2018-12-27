/**
 * Created by Jana1 on 25-07-2017.
 */


var salesCtrl = {};
var error = {};
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

salesCtrl.saveItems = function (req, res, next) {
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
    if (!req.body.itemName) {
        error.itemName = 'Invalid itemName';
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
            if ((!err) && tokenResult) {
                req.body.itemCode = (req.body.itemCode) ? req.body.itemCode : '';
                // UOM means Units of measurements
                req.body.UOM = (req.body.UOM) ? req.body.UOM : 0;
                req.body.description = (req.body.description) ? req.body.description : null;
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.minQuantity = (req.body.minQuantity) ? req.body.minQuantity : 0;
                req.body.maxQuantity = (req.body.maxQuantity) ? req.body.maxQuantity : 0;
                req.body.itemId = (req.body.itemId) ? req.body.itemId : 0;
                req.body.itemRate = (req.body.itemRate) ? req.body.itemRate : 0;
                req.body.itemImage = (req.body.itemImage) ? req.body.itemImage : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.itemId),
                    req.st.db.escape(req.body.itemName),
                    req.st.db.escape(req.body.itemCode),
                    req.st.db.escape(req.body.UOM),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.minQuantity),
                    req.st.db.escape(req.body.maxQuantity),
                    req.st.db.escape(req.body.itemRate),
                    req.st.db.escape(req.body.itemImage),
                    req.st.db.escape(req.body.notes)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL HE_save_salesItems( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems[0] && salesItems[0][0]) {
                        response.status = true;
                        response.message = "Sales item saved successfully";
                        response.data = {
                            itemId: salesItems[0][0].itemId,
                            itemName: req.body.itemName,
                            itemCode: req.body.itemCode,
                            UOM: req.body.UOM,
                            UOMTitle: salesItems[0][0].UOMTitle,
                            description: req.body.description,
                            status: req.body.status,
                            minQuantity: req.body.minQuantity,
                            maxQuantity: req.body.maxQuantity,
                            notes: req.body.notes
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales item saved successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving sales item";
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

salesCtrl.getSalesItems = function (req, res, next) {
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
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_salesItems( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0] && salesItems[0][0]) {
                        response.status = true;
                        response.message = "Sales items loaded successfully";
                        response.error = null;
                        response.data = {
                            salesItemList: salesItems[0]
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales items loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales items";
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

salesCtrl.saveUOM = function (req, res, next) {
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
    if (!req.body.UOMTitle) {
        error.UOMTitle = 'Invalid UOMTitle';
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
            if ((!err) && tokenResult) {
                // UOM means Units of measurements
                req.body.status = (req.body.status) ? req.body.status : 1;
                req.body.factor = (req.body.factor) ? req.body.factor : 1;
                req.body.UOMId = (req.body.UOMId) ? req.body.UOMId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.UOMId),
                    req.st.db.escape(req.body.UOMTitle),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.factor)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL HE_save_UOM( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, UOM) {
                    if (!err && UOM[0] && UOM[0][0] && UOM[0][0].message) {
                        response.status = true;
                        response.message = "Units of measurement title already exists";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err && UOM[0] && UOM[0][0] && UOM[0][0].UOMId) {
                        response.status = true;
                        response.message = "Units of measurements saved successfully";
                        response.data = {
                            UOMId: UOM[0][0].UOMId,
                            UOMTitle: req.body.UOMTitle,
                            status: req.body.status,
                            factor: req.body.factor
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Units of measurements saved successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving units of measurements";
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

salesCtrl.getUOM = function (req, res, next) {
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
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_UOM( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, UOMList) {
                    if (!err && UOMList && UOMList[0] && UOMList[0][0]) {
                        response.status = true;
                        response.message = "Units of measurements loaded successfully";
                        response.error = null;
                        response.data = {
                            UOMList: UOMList[0]
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Units of measurements loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting units of measurements";
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

salesCtrl.saveStageStatus = function (req, res, next) {
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

    if (!req.body.stageTitle) {
        error.stageTitle = 'Invalid stageTitle';
        validationFlag *= false;
    }

    var statusList = req.body.statusList;
    if (typeof (statusList) == "string") {
        statusList = JSON.parse(statusList);
    }
    if (!statusList) {
        statusList = [];
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
                // UOM means Units of measurements
                req.body.stageId = (req.body.stageId) ? req.body.stageId : 0;
                req.body.stageProgress = (req.body.stageProgress) ? req.body.stageProgress : 0;
                req.body.stageStatus = (req.body.stageStatus) ? req.body.stageStatus : 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.stageId),
                    req.st.db.escape(req.body.stageTitle),
                    req.st.db.escape(req.body.stageProgress),
                    req.st.db.escape(req.body.stageStatus),
                    req.st.db.escape(JSON.stringify(statusList))
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_save_stageStatus( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, stageStatus) {
                    if (!err && stageStatus[0] && stageStatus[0][0] && stageStatus[0][0].message) {
                        response.status = true;
                        response.message = "Stage title already exists";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err && stageStatus[0] && stageStatus[0][0] && stageStatus[0][0].stageId) {
                        response.status = true;
                        response.message = "Sales stage and status saved successfully";
                        response.data = {
                            stageId: stageStatus[0][0].stageId,
                            stageTitle: req.body.stageTitle,
                            stageProgress: req.body.stageProgress,
                            stageStatus: req.body.stageStatus,
                            statusList: req.body.statusList
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales stage and status saved successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving Sales stage and status";
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

salesCtrl.getStageStatus = function (req, res, next) {
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
            if ((!err) && tokenResult) {
                // UOM means Units of measurements

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_get_stageStatus( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, stageStatus) {
                    if (!err && stageStatus[0] && stageStatus[0][0]) {

                        var output = [];
                        for (var i = 0; i < stageStatus[0].length; i++) {
                            var res1 = {};
                            res1.stageId = stageStatus[0][i].stageId;
                            res1.stageTitle = stageStatus[0][i].stageTitle;
                            res1.stageProgress = stageStatus[0][i].stageProgress;
                            res1.stageStatus = stageStatus[0][i].stageStatus;
                            res1.statusList = JSON.parse(stageStatus[0][i].statusList);
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Sales stage and status loaded successfully";
                        response.data = output;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales stage and status loaded successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loaded Sales stage and status";
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

salesCtrl.saveSalesMembers = function (req, res, next) {
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

    if (!req.body.memberId) {
        error.memberId = 'Invalid memberId';
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
                req.body.id = (req.body.id) ? req.body.id : 0;
                req.body.customerId = (req.body.customerId) ? req.body.customerId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.id),
                    req.st.db.escape(req.body.memberId),
                    req.st.db.escape(req.body.customerId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL he_save_salesMembers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesMemberList) {
                    if (!err && salesMemberList[0] && salesMemberList[0][0]) {
                        response.status = true;
                        response.message = "Sales member added successfully";
                        response.data = salesMemberList[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales member added successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving Sales member";
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

salesCtrl.getSalesMembers = function (req, res, next) {
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
            if ((!err) && tokenResult) {
                // UOM means Units of measurements

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_get_salesMembers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesMemberList) {
                    if (!err && salesMemberList[0] && salesMemberList[0][0]) {

                        response.status = true;
                        response.message = "Sales members loaded successfully";
                        response.data = salesMemberList[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales members loaded successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loaded Sales members";
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

salesCtrl.saveCategory = function (req, res, next) {
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
        error.title = 'Invalid title';
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
                // UOM means Units of measurements
                req.body.categoryId = req.body.categoryId ? req.body.categoryId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.categoryId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_save_categories( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, categories) {
                    if (!err && categories[0] && categories[0][0]) {
                        response.status = true;
                        response.message = "Categories saved successfully";
                        response.data = categories[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Categories saved successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving categories";
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

salesCtrl.getCategory = function (req, res, next) {
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
            if ((!err) && tokenResult) {
                // UOM means Units of measurements


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_get_categories( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, categories) {
                    if (!err && categories[0] && categories[0][0]) {
                        response.status = true;
                        response.message = "Categories loaded successfully";
                        response.data = categories[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Categories loaded successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading categories";
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

salesCtrl.saveSupportMembers = function (req, res, next) {
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

    if (!req.body.memberId) {
        error.memberId = 'Invalid memberId';
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
                req.body.id = (req.body.id) ? req.body.id : 0;
                req.body.customerId = (req.body.customerId) ? req.body.customerId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.id),
                    req.st.db.escape(req.body.memberId),
                    req.st.db.escape(req.body.customerId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL he_save_supportMembers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesMemberList) {
                    if (!err && salesMemberList[0] && salesMemberList[0][0]) {
                        response.status = true;
                        response.message = "Support member added successfully";
                        response.data = salesMemberList[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Support member added successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving support member";
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

salesCtrl.getSupportMembers = function (req, res, next) {
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
            if ((!err) && tokenResult) {
                // UOM means Units of measurements

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save units of measurements
                 */
                var procQuery = 'CALL he_get_supportMembers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesMemberList) {
                    if (!err && salesMemberList[0] && salesMemberList[0][0]) {

                        response.status = true;
                        response.message = "Support members loaded successfully";
                        response.data = salesMemberList[0];
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Support members loaded successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loaded Support members";
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

salesCtrl.getSalesItemDetails = function (req, res, next) {
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.itemId),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_get_salesItem_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0] && salesItems[0][0]) {
                        response.status = true;
                        response.message = "Sales items loaded successfully";
                        response.error = null;
                        response.data = {
                            itemId: salesItems[0][0].itemId,
                            itemName: salesItems[0][0].itemName,
                            itemCode: salesItems[0][0].itemCode,
                            UOM: salesItems[0][0].UOM,
                            UOMTitle: salesItems[0][0].UOMTitle,
                            description: salesItems[0][0].description,
                            status: salesItems[0][0].status,
                            minQuantity: salesItems[0][0].minQuantity,
                            maxQuantity: salesItems[0][0].maxQuantity,
                            createdDate: salesItems[0][0].createdDate,
                            updatedDate: salesItems[0][0].updatedDate,
                            createdBy: salesItems[0][0].createdBy,
                            updatedBy: salesItems[0][0].updatedBy,
                            itemRate: salesItems[0][0].itemRate,
                            notes: salesItems[0][0].notes,
                            itemImage: (salesItems[0][0].itemImage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salesItems[0][0].itemImage) : ""
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Sales items loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales items";
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


salesCtrl.saveprobability = function (req, res, next) {
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

    if (!req.body.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.body.probabilityId = (req.body.probabilityId) ? (req.body.probabilityId) : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.probabilityId),
                    req.st.db.escape(req.body.HEMasterId),
                    req.st.db.escape(req.body.percentage),
                    req.st.db.escape(req.body.title)

                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_probabilities( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results) {
                        response.status = true;
                        response.message = "Probability saved successfully";
                        response.error = null;
                        response.data = null;
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        //});
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving probability";
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

salesCtrl.savetimeline = function (req, res, next) {
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

    if (!req.body.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.body.timelineId = (req.body.timelineId) ? (req.body.timelineId) : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.timelineId),

                    req.st.db.escape(req.body.HEMasterId),
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to),
                    req.st.db.escape(req.body.title)

                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_mheperformancetimeline( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results) {
                        response.status = true;
                        response.message = "Timeline data saved successfully";
                        response.error = null;
                        response.data = null;
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving Timeline data";
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

salesCtrl.getprobability = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId)
                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_get_probabilities( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results) {
                        response.status = true;
                        response.message = "Probability loaded successfully";
                        response.error = null;
                        response.data =
                            {
                                probabilityList: results[0]
                            };
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading probability";
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

salesCtrl.gettimeline = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId)

                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_get_mheperformancetimeline( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results) {
                        response.status = true;
                        response.message = "Timeline data loaded successfully";
                        response.error = null;
                        response.data = {
                            timelineList: results[0]
                        };
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Timeline data";
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


salesCtrl.deleteprobability = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.probabilityId)

                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_delete_probabilities( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = false;
                        response.message = "Probability is already in use";
                        response.error = null;
                        response.data = results[0];

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        //});
                    }

                    else if (!err && results) {
                        response.status = true;
                        response.message = "Probability deleted successfully";
                        response.error = null;
                        response.data = null;

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting probability";
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

salesCtrl.deletetimeline = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.timelineId)

                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_delete_mheperformancetimeline( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results) {
                        response.status = true;
                        response.message = "Timeline data deleted successfully";
                        response.error = null;
                        response.data = null;
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        //});
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting Timeline data";
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
salesCtrl.getUserstats = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                    req.st.db.escape(req.query.HEMasterId)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_loginStats( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0]) {

                        response.status = true;
                        response.message = "Login statistics data loaded successfully";

                        response.data = {
                            userLoginoutdata: result[0]
                        };

                        response.error = null;

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading Login statistics data ";
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

salesCtrl.formTransaction = function (req, res, next) {
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

    if (!req.body.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
        validationFlag *= false;
    }
    var forms = req.body.formId;
    if (typeof (forms) == "string") {
        forms = JSON.parse(forms);
    }
    if (!forms) {
        forms = [];
    }

    var branchList = req.body.branchList;
    if (typeof (branchList) == "string") {
        branchList = JSON.parse(branchList);
    }
    if (!branchList) {
        branchList = [];
    }
    var departmentList = req.body.departmentList;
    if (typeof (departmentList) == "string") {
        departmentList = JSON.parse(departmentList);
    }
    if (!departmentList) {
        departmentList = [];
    }
    var gradeList = req.body.gradeList;
    if (typeof (gradeList) == "string") {
        gradeList = JSON.parse(gradeList);
    }
    if (!gradeList) {
        gradeList = [];
    }
    var groupList = req.body.groupList;
    if (typeof (groupList) == "string") {
        groupList = JSON.parse(groupList);
    }
    if (!groupList) {
        groupList = [];
    }

    var userList = req.body.userList;
    if (typeof (userList) == "string") {
        userList = JSON.parse(userList);
    }
    if (!userList) {
        userList = [];
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

                // var totalTransactionCount="totalTransactionCount" ;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.HEMasterId),
                    req.st.db.escape(req.body.fromDate),
                    req.st.db.escape(req.body.toDate),
                    req.st.db.escape(JSON.stringify(forms)),
                    req.st.db.escape(JSON.stringify(userList)),
                    req.st.db.escape(JSON.stringify(branchList)),
                    req.st.db.escape(JSON.stringify(departmentList)),
                    req.st.db.escape(JSON.stringify(gradeList)),
                    req.st.db.escape(JSON.stringify(groupList))

                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_formAdoptionReport( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    console.log(err);
                    if (!err && result && result[0]) {

                        response.status = true;
                        response.message = "Form Transaction Data loaded successfully";
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i]["totalTransactionCount"] = (result[0][i].senderCount + result[0][i].approverCount + result[0][i].receiverCount);
                        }
                        response.data = {
                            formTransactionData: result[0]
                        };

                        response.error = null;

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading Form Transaction data ";
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


module.exports = salesCtrl;