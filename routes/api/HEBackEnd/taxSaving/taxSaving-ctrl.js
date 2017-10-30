/**
 * Created by vedha on 26-10-2017.
 */


var taxSavingCtrl = {};
var error = {};

taxSavingCtrl.saveTaxGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.body.groupName)
    {
        error.groupName = 'Invalid groupName';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.defaultAmount = (req.body.defaultAmount) ? req.body.defaultAmount : 0;
                req.body.seqNo = (req.body.seqNo) ? req.body.seqNo : 0;
                req.body.taxgroupId = (req.body.taxgroupId) ? req.body.taxgroupId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.taxgroupId),
                    req.st.db.escape(req.body.groupName),
                    req.st.db.escape(req.body.defaultAmount),
                    req.st.db.escape(req.body.seqNo)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_taxSaving_group( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxGroupResult){
                    console.log(err);
                    if(!err && taxGroupResult && taxGroupResult[0] && taxGroupResult[0][0].error){
                        switch (taxGroupResult[0][0].error) {
                            case 'GROUPNAME_EXISTS' :
                                response.status = false;
                                response.message = "Group name exists. Try again with different group name";
                                response.error = null;
                                res.status(200).json(response);
                                break ;

                            default:
                                break;
                        }

                    }
                    else if(!err && taxGroupResult && taxGroupResult[0] && taxGroupResult[0][0]){
                        response.status = true;
                        response.message = "Tax group saved successfully";
                        response.data = {
                          taxGroups : taxGroupResult[0][0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving tax group";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taxSavingCtrl.getTaxGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_taxSaving_group( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxGroupResult){
                    console.log(err);
                    if(!err && taxGroupResult && taxGroupResult[0] && taxGroupResult[0][0]){
                        response.status = true;
                        response.message = "Tax groups loaded successfully";
                        response.data = {
                            taxGroups : taxGroupResult[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else  if (!err){
                        response.status = true;
                        response.message = "No data";
                        response.data = {
                            taxGroups : []
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting tax groups";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taxSavingCtrl.saveTaxItem = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.body.itemName)
    {
        error.itemName = 'Invalid itemName';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.seqNo = (req.body.seqNo) ? req.body.seqNo : 0;
                req.body.taxItemId = (req.body.taxItemId) ? req.body.taxItemId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.taxItemId),
                    req.st.db.escape(req.body.itemName),
                    req.st.db.escape(req.body.seqNo)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_taxSaving_items( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxItemResult){
                    console.log(err);
                    if(!err && taxItemResult && taxItemResult[0] && taxItemResult[0][0].error){
                        switch (taxItemResult[0][0].error) {
                            case 'ITEMNAME_EXISTS' :
                                response.status = false;
                                response.message = "Item name exists. Try again with different item name";
                                response.error = null;
                                res.status(200).json(response);
                                break ;

                            default:
                                break;
                        }

                    }
                    else if(!err && taxItemResult && taxItemResult[0] && taxItemResult[0][0]){
                        response.status = true;
                        response.message = "Tax item saved successfully";
                        response.data = {
                            taxItem : taxItemResult[0][0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving tax item";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taxSavingCtrl.getTaxItem = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_taxSaving_items( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxItemResult){
                    console.log(err);
                    if(!err && taxItemResult && taxItemResult[0] && taxItemResult[0][0]){
                        response.status = true;
                        response.message = "Tax items loaded successfully";
                        response.data = {
                            taxItem : taxItemResult[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else  if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            taxItem : []
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting tax items";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taxSavingCtrl.saveTaxTemplateGroupMap = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.body.templateId)
    {
        error.templateId = 'Invalid templateId';
        validationFlag *= false;
    }
    if (!req.body.groupId)
    {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.seqNo)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_taxSaving_templategroupmap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,templateGroupMapResult){
                    console.log(err);
                    if(!err){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while mapping";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

taxSavingCtrl.saveTaxGroupItemMap = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.body.itemId)
    {
        error.itemId = 'Invalid itemId';
        validationFlag *= false;
    }
    if (!req.body.groupId)
    {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.itemId),
                    req.st.db.escape(req.body.seqNo)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_taxSaving_groupitemmap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,groupItemMapResult){
                    console.log(err);
                    if(!err){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while mapping";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

module.exports = taxSavingCtrl;
