/**
 * Created by vedha on 25-09-2017.
 */

var moment = require('moment');
var vaultCtrl = {};
var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

vaultCtrl.getVaultList = function (req, res, next) {

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token)

                    ];
                    var procQuery = 'CALL  he_get_vaultList( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, vaultResult) {
                        if (!err && vaultResult && vaultResult[0]) {
                            var output = [];
                            for (var i = 0; i < vaultResult[0].length; i++) {
                                var result1 = {};
                                result1.id = vaultResult[0][i].id;
                                result1.title = vaultResult[0][i].title;
                                result1.isFolder = vaultResult[0][i].isFolder;
                                result1.dataType = vaultResult[0][i].dataType;
                                output.push(result1);
                            }

                            res.status(200).json({
                                status: true,
                                message: "Vault data loaded successfully",
                                error: null,
                                data: {
                                    vaultList: output
                                }
                            });

                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "Vault data not found";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting vault data";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.createNewFolder = function (req, res, next) {

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
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
                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.title),
                                req.st.db.escape(req.body.description)

                            ];
                            var procQuery = 'CALL he_save_vaultFolder( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, vaultResult) {
                                if (!err && vaultResult && vaultResult[0] && vaultResult[0][0] && vaultResult[0][0].message) {
                                    response.status = false;
                                    response.message = "Folder title is in use";
                                    response.error = null;
                                    res.status(200).json(response);
                                }
                                else if (!err && vaultResult && vaultResult[0] && vaultResult[0][0] && vaultResult[0][0].id) {
                                    response.status = true;
                                    response.message = "Folder created successfully";
                                    response.data = {
                                        id: vaultResult[0][0].id,
                                        title: req.body.title
                                    };
                                    response.error = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while creating folder";
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
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.getFolderData = function (req, res, next) {

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
    if (!req.query.folderId) {
        error.folderId = 'Invalid folderId';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.folderId)

                    ];
                    var procQuery = 'CALL  he_get_folderData( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, folderResult) {
                        if (!err && folderResult && folderResult[0] && folderResult[0][0]) {
                            response.status = true;
                            response.message = "Folder data loaded successfully";
                            response.error = null;
                            response.data = {
                                id: folderResult[0][0].id,
                                title: folderResult[0][0].title,
                                description: folderResult[0][0].description,
                                itemList: folderResult[1] ? folderResult[1] : []
                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting folder data";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.deleteVaultItem = function (req, res, next) {

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
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.itemId)

                    ];
                    var procQuery = 'CALL he_delete_vaultItem( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, folderResult) {
                        if (!err) {
                            response.status = true;
                            response.message = "Item deleted successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while deleting item";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.getMasterData = function (req, res, next) {

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token)

                    ];
                    var procQuery = 'CALL he_get_masterVaultData( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, masterResult) {
                        if (!err && masterResult && masterResult[0] && masterResult[0][0]) {
                            response.status = true;
                            response.message = "Folder data loaded successfully";
                            response.error = null;
                            response.data = {
                                tagList: masterResult[0],
                                folderList: masterResult[1] ? masterResult[1] : []
                            };
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.saveVaultItem = function (req, res, next) {

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (!req.body.tagId) {
                            error.tagId = 'Invalid tagId';
                            validationFlag *= false;
                        }

                        var details = req.body.details;
                        if (typeof (details) == "string") {
                            details = JSON.parse(details);
                        }
                        if (!details) {
                            error.details = 'Invalid details';
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
                            req.body.itemId = req.body.itemId ? req.body.itemId : 0;
                            req.body.folderId = req.body.folderId ? req.body.folderId : 0;

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.itemId),
                                req.st.db.escape(req.body.tagId),
                                req.st.db.escape(JSON.stringify(details)),
                                req.st.db.escape(JSON.stringify(attachments)),
                                req.st.db.escape(req.body.folderId)
                            ];

                            var procQuery = 'CALL he_save_vaultItem( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, vaultResult) {
                                if (!err && vaultResult) {
                                    response.status = true;
                                    response.message = "Vault item saved successfully";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while saving vault item";
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
            });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

vaultCtrl.getVaultItem = function (req, res, next) {

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


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    req.query.itemId = (req.query.itemId) ? req.query.itemId : 0;

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.itemId)
                    ];

                    var procQuery = 'CALL he_get_vaultItem( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, vaultResult) {
                        if (!err && vaultResult) {
                            response.status = true;
                            response.message = "Vault item saved successfully";
                            response.error = null;
                            response.data = {
                                itemId: (vaultResult[0] && vaultResult[0][0]) ? vaultResult[0][0].itemId : 0,
                                tagTitle: (vaultResult[0] && vaultResult[0][0]) ? vaultResult[0][0].tagTitle : "",
                                tagId: (vaultResult[0] && vaultResult[0][0]) ? vaultResult[0][0].tagId : 0,
                                folderId: (vaultResult[0] && vaultResult[0][0]) ? vaultResult[0][0].folderId : 0,
                                attachments: (vaultResult[0] && vaultResult[0][0] && vaultResult[0][0].attachments) ? JSON.parse(vaultResult[0][0].attachments) : [],
                                details: (vaultResult[0] && vaultResult[0][0] && vaultResult[0][0].details) ? JSON.parse(vaultResult[0][0].details) : null,
                                tagList: vaultResult[1] ? vaultResult[1] : [],
                                folderList: vaultResult[2] ? vaultResult[2] : [],
                                currencyList: vaultResult[3] ? vaultResult[3] : []
                            };
                            res.status(200).json(response);
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting vault item";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

module.exports = vaultCtrl;