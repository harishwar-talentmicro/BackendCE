/**
 * Created by vedha on 10-03-2017.
 */


var holidayTemplateCtrl = {};

/**
 *
 * @param req
 * @param res
 * @param next
 */
holidayTemplateCtrl.saveHolidayTemplate = function(req,res,next){
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
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            req.body.holidayTemplateId = (req.body.holidayTemplateId) ? req.body.holidayTemplateId : 0;
            req.body.holidayTemplateTitle = (req.body.holidayTemplateTitle) ? req.body.holidayTemplateTitle : '';
            req.body.holidayDate = (req.body.holidayDate) ? req.body.holidayDate : null;
            req.body.holidayTitle = (req.body.holidayTitle) ? req.body.holidayTitle : '';
            req.body.holidayId = (req.body.holidayId) ? req.body.holidayId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.holidayTemplateId),
                req.st.db.escape(req.body.holidayTemplateTitle),
                req.st.db.escape(req.body.holidayDate),
                req.st.db.escape(req.body.holidayTitle),
                req.st.db.escape(req.body.holidayId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL save_HE_Holiday( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,holidayTemplateResult){
                console.log(err);
                if(!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0].holidayTemplateId){
                    response.status = true;
                    response.message = "Holiday template saved successfully";
                    response.error = null;
                    response.holidayTemplateId= holidayTemplateResult[0][0].holidayTemplateId ;
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while saving holiday template";
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

holidayTemplateCtrl.getholidayTemplateList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
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
            var procQuery = 'CALL get_HEHolidayTemplateList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,holidayTemplateResult){
                if(!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0]){
                    response.status = true;
                    response.message = "Holiday template list loaded successfully";
                    response.error = null;
                    response.data = {
                        holidayTemplateList : holidayTemplateResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Holiday template list loaded successfully";
                    response.error = null;
                    response.data =null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting holiday template";
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

holidayTemplateCtrl.getholidayTemplateDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.holidayTemplateId) {
        error.token = 'Invalid holidayTemplateId';
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
                req.st.db.escape(req.query.holidayTemplateId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HEHolidayTemplateDetails( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,holidayTemplateResult){
                if(!err && holidayTemplateResult && holidayTemplateResult[0] && holidayTemplateResult[0][0]){
                    response.status = true;
                    response.message = "Holiday template loaded successfully";
                    response.error = null;
                    response.data = {
                        holidayTemplate : holidayTemplateResult[0][0],
                        holidayTemplateList : holidayTemplateResult[1]
                    }
                    res.status(200).json(response);

                }
                else if(err){
                    response.status = false;
                    response.message = "Error while getting form template";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
                else{
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

holidayTemplateCtrl.deleteHolidayTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting holiday template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.holidayTemplateId) {
        error.token = 'Invalid holidayTemplateId';
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
                req.st.db.escape(req.query.holidayTemplateId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL delete_HE_holidayTemplate( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formTemplateResult){
                if (formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error)
                {
                    switch (formTemplateResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Holiday template is in use.";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }


                if(!err){
                    response.status = true;
                    response.message = "Holiday template deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting Holiday template";
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

holidayTemplateCtrl.deleteHoliday = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting holiday template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.holidayId) {
        error.token = 'Invalid holidayId';
        validationFlag *= false;
    }
    if (!req.query.holidayTemplateId) {
        error.token = 'Invalid holidayTemplateId';
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
                req.st.db.escape(req.query.holidayTemplateId),
                req.st.db.escape(req.query.holidayId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL delete_HE_holiday( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formTemplateResult){

                if(!err){
                    response.status = true;
                    response.message = "Holiday deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while deleting holiday";
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

module.exports = holidayTemplateCtrl;