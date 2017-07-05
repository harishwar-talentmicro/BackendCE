/**
 * Created by Jana1 on 24-03-2017.
 */

var masterCtrl = {};

masterCtrl.searchUsers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.query.syncDate = req.query.syncDate ? req.query.syncDate : null;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.name),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_search_users( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,userResult){
                if(!err && userResult && userResult[0] && userResult[0][0]){
                    response.status = true;
                    response.message = "User list loaded successfully";
                    response.error = null;
                    response.data = {
                        userList : userResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "No users found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting user list";
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

masterCtrl.expenseMasterData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_expenseMasterData( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,expenseMaster){
                if(!err && expenseMaster && expenseMaster[0] && expenseMaster[1]){

                    response.status = true;
                    response.message = "Expense master loaded successfully";
                    response.error = null;
                    if(!err && expenseMaster[2][0]){
                        response.data = {
                            currencyList : expenseMaster[0],
                            expenseList : expenseMaster[1],
                            defaultUserCurrency : {
                                currencyId : expenseMaster[2][0].currencyId ? expenseMaster[2][0].currencyId : 0,
                                currencySymbol : expenseMaster[2][0].currencySymbol ? expenseMaster[2][0].currencySymbol : "",
                                conversionRate : expenseMaster[2][0].conversionRate ? expenseMaster[2][0].conversionRate : 0
                            }
                        }
                    }
                    else
                    {
                        response.data = {
                            currencyList : expenseMaster[0],
                            expenseList : expenseMaster[1],
                            defaultUserCurrency : {
                                currencyId :  0,
                                currencySymbol : "",
                                conversionRate : 0
                            }
                        }
                    }

                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting master data";
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

masterCtrl.getStationary = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_stationary( ' + procParams.join(',') + ')';
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
                    response.message = "Error while getting stationeries";
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

masterCtrl.currencyData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_currencyData( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,currencyMaster){
                if(!err && currencyMaster && currencyMaster[0] && currencyMaster[0][0]){
                    response.status = true;
                    response.message = "Currency master loaded successfully";
                    response.error = null;
                    if(!err && currencyMaster[1][0]){
                        response.data = {
                            currencyList : currencyMaster[0],
                            defaultUserCurrency : {
                                currencyId : currencyMaster[1][0].currencyId ? currencyMaster[1][0].currencyId : 0,
                                currencySymbol : currencyMaster[1][0].currencySymbol ? currencyMaster[1][0].currencySymbol : "",
                                conversionRate : currencyMaster[1][0].conversionRate ? currencyMaster[1][0].conversionRate : 0
                            }
                        };
                    }
                    else {
                        response.data = {
                            currencyList : currencyMaster[0],
                            defaultUserCurrency : {
                                currencyId :  0,
                                currencySymbol : "",
                                conversionRate : 0
                            }
                        };
                    }

                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting currency";
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

masterCtrl.getPantryItems = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_pantryItems( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,stationaryResult){
                if(!err && stationaryResult && stationaryResult[0] && stationaryResult[0][0]){
                    response.status = true;
                    response.message = "Pantry item loaded successfully";
                    response.error = null;
                    response.data = {
                        pantryList : stationaryResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Pantry item loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting pantry item";
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

masterCtrl.getAssetsItems = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_assetItems( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,assetResult){
                if(!err && assetResult && assetResult[0] && assetResult[0][0]){
                    response.status = true;
                    response.message = "Asset item loaded successfully";
                    response.error = null;
                    response.data = {
                        assetList : assetResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Asset item loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting asset item";
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

masterCtrl.getHRDocItems = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_HRDocs( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,HRDocsResult){
                if(!err && HRDocsResult && HRDocsResult[0] && HRDocsResult[0][0]){
                    response.status = true;
                    response.message = "HR doc types loaded successfully";
                    response.error = null;
                    response.data = {
                        HRDocList : HRDocsResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "HR doc types loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting HR doc types";
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

masterCtrl.expenseList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_expenseList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,expenseList){
                if(!err && expenseList && expenseList[0] && expenseList[0][0]){
                    response.status = true;
                    response.message = "Expense list loaded successfully";
                    response.error = null;
                    response.data = {
                        expenseList : expenseList[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting expense list";
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

masterCtrl.getFormTypeList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
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

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){


            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_filter_formList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formTypeResult){
                if(!err && formTypeResult && formTypeResult[0] && formTypeResult[0][0]){
                    response.status = true;
                    response.message = "Form type list loaded successfully";
                    response.error = null;
                    response.data = {
                        formTypeList : formTypeResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Form type list loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting form type list";
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

masterCtrl.getWorkGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_app_workGroups( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,workGroupResult){
                if(!err && workGroupResult && workGroupResult[0] && workGroupResult[0][0]){
                    response.status = true;
                    response.message = "Work group loaded successfully";
                    response.error = null;
                    response.data = {
                        workGroupList : workGroupResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Work group loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting work group";
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

module.exports = masterCtrl;