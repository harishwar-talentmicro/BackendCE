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
  /*  if (!req.body.itemTag) {
        error.itemTag = 'Invalid itemTag';
        validationFlag *= false;
    }*/

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
                    req.st.db.escape(req.body.seqNo),
                    req.st.db.escape(req.body.itemTag)


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
                    if(!err && templateGroupMapResult && templateGroupMapResult[0]){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = {
                            templateGroupMapList : templateGroupMapResult[0][0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = {
                            templateGroupMapList : {}
                        };
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
                    if(!err && groupItemMapResult && groupItemMapResult[0] && groupItemMapResult[0][0]){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = {
                            groupItemMapList : groupItemMapResult[0][0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Mapped successfully";
                        response.data = {
                            groupItemMapList : {}
                        };
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

taxSavingCtrl.getTaxMap = function(req,res,next){
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
    if (!req.query.templateId)
    {
        error.templateId = 'Invalid templateId';
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
                    req.st.db.escape(req.query.templateId)

                ];

                var procQuery = 'CALL he_get_taxSaving_templategroupmap( ' + procParams.join(',') + ')';
                req.db.query(procQuery,function(err,templateGroupMapResult){
                    console.log(err);
                    if(!err && templateGroupMapResult ){
                        response.status = true;
                        response.message = "Details loaded successfully";
                        response.data = {
                            templateGroupMapList : templateGroupMapResult[0],
                            groupItemMapList : templateGroupMapResult[1]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = null ;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading data";
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

taxSavingCtrl.saveTemplate = function(req,res,next){
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
    if (!req.body.title)
    {
        error.title = 'Invalid title';
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
                    req.st.db.escape(req.body.title)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_tax_template( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,templateResult){
                    if(!err && templateResult && templateResult[0] && templateResult[0][0] && templateResult[0][0].templateId ){
                        response.status = true;
                        response.message = "Template saved successfully";
                        response.data = {
                            templateId : templateResult[0][0].templateId
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving";
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

taxSavingCtrl.getTemplate = function(req,res,next){
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
                var procQuery = 'CALL he_get_tax_template( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,templateResult){
                    if(!err && templateResult && templateResult[0] && templateResult[0][0] && templateResult[0][0].templateId ){
                        response.status = true;
                        response.message = "Template deatils loaded successfully";
                        response.data = {
                            templateDetails : templateResult[0][0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            templateDetails : {}
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data";
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

taxSavingCtrl.saveSavingsMaster = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.savingMasterId = (req.body.savingMasterId != undefined) ? req.body.savingMasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.savingMasterId),
                    req.st.db.escape(req.body.startDate),
                    req.st.db.escape(req.body.endDate),
                    req.st.db.escape(req.body.lockStatus)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_tax_savingMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,savingMasterResult){
                    if(!err && savingMasterResult && savingMasterResult[0] && savingMasterResult[0][0] ){
                        response.status = true;
                        response.message = "Tax saving master saved successfully";
                        response.data = {
                            savingMasterId : savingMasterResult[0][0].savingMasterId
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving";
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

taxSavingCtrl.getSavingsMaster = function(req,res,next){
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
    if (!req.query.templateId)
    {
        error.templateId = 'Invalid templateId';
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
                    req.st.db.escape(req.query.templateId)

                ];
                /**
                 * Calling procedure to save tax saving group
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_tax_savingMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,savingMasterResult){
                    if(!err && savingMasterResult && savingMasterResult[0] && savingMasterResult[0][0] ){
                        response.status = true;
                        response.message = "Tax saving master data loaded successfully";
                        response.data = {
                            savingMaster : savingMasterResult[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data";
                        response.error = null;
                        response.data = {
                            savingMaster : []
                        };
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

taxSavingCtrl.deleteTaxGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.taxGroupId) {
        error.taxGroupId = 'Invalid taxGroupId';
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.taxGroupId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_taxGroup( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxGroupResult){

                    if(!err && taxGroupResult && taxGroupResult[0] && taxGroupResult[0][0].error){
                        switch (taxGroupResult[0][0].error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Tax group is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Tax group deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting group";
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

taxSavingCtrl.deleteTaxItem = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.taxItemId) {
        error.taxItemId = 'Invalid taxItemId';
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.taxItemId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_taxItem( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxItemResult){

                    if(!err && taxItemResult && taxItemResult[0] && taxItemResult[0][0].error){
                        switch (taxItemResult[0][0].error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Tax item is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Tax item deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting item";
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

taxSavingCtrl.deleteTaxTemplateGroupMap = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.templateGroupMapId) {
        error.templateGroupMapId = 'Invalid templateGroupMapId';
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.templateGroupMapId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_templateGroupMap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxItemResult){
                    if (!err ){
                        response.status = true;
                        response.message = "Template group map deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting template group map";
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

taxSavingCtrl.deleteTaxGroupItemMap = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.groupItemMapId) {
        error.groupItemMapId = 'Invalid groupItemMapId';
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.groupItemMapId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_GroupItemMap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxItemResult){
                    if (!err ){
                        response.status = true;
                        response.message = "Template group map deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting template group map";
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

taxSavingCtrl.deleteSavingMaster = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.savingMasterId) {
        error.savingMasterId = 'Invalid savingMasterId';
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
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.savingMasterId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_taxSavingMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,taxSavingResult){
                    if(!err && taxSavingResult && taxSavingResult[0] && taxSavingResult[0][0].error){
                        switch (taxSavingResult[0][0].error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Saving master is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Saving master template deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting master template";
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



taxSavingCtrl.saveItemQuestion = function(req,res,next){
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

    if (!req.body.itemId)
    {
        error.itemId = 'Invalid itemId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                req.body.question = (req.body.question) ? req.body.question : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.itemId),
                    req.st.db.escape(req.body.question)

                ];

                var procQuery = 'CALL he_save_item_questions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result ) {
                        response.status = true;
                        response.message = "Questions saved successfully";
                        response.data = {
                            ItemQuestionID: Result[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving question";
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


taxSavingCtrl.getItemQuestionlist = function(req,res,next){
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

    if (!req.query.itemId)
    {
        error.itemId = 'Invalid itemId';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.itemId)

                ];

                var procQuery = 'CALL he_get_item_questions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result ) {
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.data = {
                            ItemQuestionList: Result[0]
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading questions";
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


taxSavingCtrl.deleteItemQuestion = function(req,res,next){
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

    if (!req.query.itemId)
    {
        error.itemId = 'Invalid itemId';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.itemId)

                ];

                var procQuery = 'CALL he_delete_item_questions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result ) {
                        response.status = true;
                        response.message = "Questions deleted successfully";
                        response.data = null;
                        response.error = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while deleting questions";
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

module.exports = taxSavingCtrl;
