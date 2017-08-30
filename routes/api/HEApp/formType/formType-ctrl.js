/**
 * Created by Jana1 on 15-03-2017.
 */

var formTypeCtrl = {};
var moment = require('moment');
var error = {};
var validationFlag = true;

formTypeCtrl.getFormTypeList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while getting form type",
        data : null,
        error : null
    };

    if(req.query.syncDate){
        if(moment(req.query.syncDate,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.syncDate = moment(req.query.syncDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
        else{
            error.syncDate = 'Invalid timeStamp';
            validationFlag *= false;
        }
    }
    else{
        req.query.syncDate = null;

    }
    if (!validationFlag) {
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
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.syncDate)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_formList( ' + procParams.join(',') + ')';
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
    }


};


module.exports = formTypeCtrl;