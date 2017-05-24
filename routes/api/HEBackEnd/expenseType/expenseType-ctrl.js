/**
 * Created by Jana1 on 15-04-2017.
 */


var expenseTypeCtrl = {};

expenseTypeCtrl.saveExpenseType = function(req,res,next){
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
    if (!req.body.typeTitle)
    {
        error.typeTitle = 'Invalid typeTitle';
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
            req.body.expenseTypeId = (req.body.expenseTypeId) ? req.body.expenseTypeId : 0;
            req.body.groupCode = (req.body.groupCode) ? req.body.groupCode : '' ;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.expenseTypeId),
                req.st.db.escape(req.body.typeTitle),
                req.st.db.escape(req.body.groupCode)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL he_save_expenseTypes( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,currencyResult){
                console.log(err);

                if(!err){
                    response.status = true;
                    response.message = "Expense type saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving expense type";
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

expenseTypeCtrl.updateExpenseType = function(req,res,next){
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
    if (!req.body.typeTitle)
    {
        error.typeTitle = 'Invalid typeTitle';
        validationFlag *= false;
    }

    if (!req.body.expenseTypeId)
    {
        error.expenseTypeId = 'Invalid expenseTypeId';
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
            req.body.groupCode = (req.body.groupCode) ? req.body.groupCode : '' ;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.expenseTypeId),
                req.st.db.escape(req.body.typeTitle),
                req.st.db.escape(req.body.groupCode)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL he_save_expenseTypes( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,currencyResult){
                if(!err){
                    response.status = true;
                    response.message = "Expense type saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while saving expense type";
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


expenseTypeCtrl.getExpenseTypeList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading expense types",
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
            var procQuery = 'CALL he_get_expenseTypes( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,expenseTypeResult){
                if(!err && expenseTypeResult && expenseTypeResult[0] && expenseTypeResult[0][0]){
                    response.status = true;
                    response.message = "Expense list loaded successfully";
                    response.error = null;
                    response.data = {
                        expenseList : expenseTypeResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Expense list loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting Expense list";
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

expenseTypeCtrl.deleteExpenseType = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting ExpenseType",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.expenseTypeId) {
        error.token = 'Invalid expenseTypeId';
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
                req.st.db.escape(req.query.expenseTypeId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_delete_expenseType( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formTemplateResult){

                if(!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error){
                    switch (formTemplateResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Expense type is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "Expense type deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting expense type";
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

module.exports = expenseTypeCtrl;