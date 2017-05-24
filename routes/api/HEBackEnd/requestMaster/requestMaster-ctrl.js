/**
 * Created by Jana1 on 18-04-2017.
 */


var requestMasterCtrl = {};

requestMasterCtrl.saveStationary = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            req.body.stationaryId = (req.body.stationaryId) ? req.body.stationaryId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.stationaryId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_stationary ( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Stationary saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving Stationary ";
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
};

requestMasterCtrl.updateStationary = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!req.body.stationaryId)
    {
        error.token = 'Invalid stationaryId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.stationaryId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_stationary ( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Stationary saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving Stationary ";
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
};

requestMasterCtrl.savePantryItem = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            req.body.pantryItemId = (req.body.pantryItemId) ? req.body.pantryItemId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.pantryItemId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_pantryItems( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,pantryItemResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Pantry item saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving pantry item ";
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
};

requestMasterCtrl.updatePantryItem = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!req.body.pantryItemId)
    {
        error.token = 'Invalid pantryItemId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.pantryItemId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_pantryItems( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,pantryItemResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Pantry item saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving pantry item ";
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
};

requestMasterCtrl.saveAssets = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            req.body.assetId = (req.body.assetId) ? req.body.assetId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.assetId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_asset( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assetResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Asset saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving asset";
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
};

requestMasterCtrl.updateAssets = function(req,res,next){
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
    if (!req.body.title)
    {
        error.token = 'Invalid title';
        validationFlag *= false;
    }
    if (!req.body.assetId)
    {
        error.token = 'Invalid assetId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.assetId),
                req.st.db.escape(req.body.title)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_save_asset( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assetResult){
                console.log(err);
                if(!err){
                    response.status = true;
                    response.message = "Asset saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving asset";
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
};

requestMasterCtrl.getStationary = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_stationary( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){
                if(!err && stationaryResult && stationaryResult[0] && stationaryResult[0][0]){
                    response.status = true;
                    response.message = "Stationeries loaded successfully";
                    response.error = null;
                    response.data = {
                        stationaryList : stationaryResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Stationeries loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting Stationeries";
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
};

requestMasterCtrl.getPantryItem = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_pantry( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,pantryResult){
                if(!err && pantryResult && pantryResult[0] && pantryResult[0][0]){
                    response.status = true;
                    response.message = "Pantry items loaded successfully";
                    response.error = null;
                    response.data = {
                        pantryItemList : pantryResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Pantry items loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting pantry items ";
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
};

requestMasterCtrl.getAssets = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_assets( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assetResult){
                if(!err && assetResult && assetResult[0] && assetResult[0][0]){
                    response.status = true;
                    response.message = "Assets items loaded successfully";
                    response.error = null;
                    response.data = {
                        assetList : assetResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Assets items loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting assets items ";
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
};

requestMasterCtrl.deleteStationary = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.stationaryId) {
        error.token = 'Invalid stationaryId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.stationaryId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_delete_stationary( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){

                if(!err && stationaryResult && stationaryResult[0] && stationaryResult[0][0]._error){
                    switch (stationaryResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Stationary item is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "Stationary item deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting Stationary item";
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
};

requestMasterCtrl.deletePantry = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.pantryItemId) {
        error.pantryItemId = 'Invalid pantryItemId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.pantryItemId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_delete_pantryItem( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,pantryResult){

                if(!err && pantryResult && pantryResult[0] && pantryResult[0][0]._error){
                    switch (pantryResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Pantry item is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "Pantry item deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting Pantry item";
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
};

requestMasterCtrl.deleteAsset = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.assetItemId) {
        error.assetItemId = 'Invalid assetItemId';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.assetItemId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_delete_assetItem( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assetResult){

                if(!err && assetResult && assetResult[0] && assetResult[0][0]._error){
                    switch (assetResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Asset item is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "Asset item deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting Asset item";
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
};


module.exports = requestMasterCtrl;