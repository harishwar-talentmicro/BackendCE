/**
 * Created by vedha on 06-01-2017.
 */
var moment = require('moment');
var jobInfoCtrl = {};

jobInfoCtrl.saveJobInfo = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


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
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){


                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.status ? req.body.status : 0),
                        req.st.db.escape(req.body.keySkills ? req.body.keySkills : ''),
                        req.st.db.escape(req.body.exp ? req.body.exp : 0)
                    ];

                    var procQuery = 'CALL p_m_savejobInfo( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "Job info saved successfully";
                            response.error = null;
                            response.data = {
                                status : req.body.status ? req.body.status : 1,
                                keySkills : req.body.keySkills ? req.body.keySkills : '',
                                exp : req.body.exp
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving jobInfo";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

jobInfoCtrl.getJobInfo = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

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
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){
                    var procParams = [
                        req.st.db.escape(req.query.token)
                    ];
                    var procQuery = 'CALL  get_jobInfo( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result && result[0]){
                            res.status(200).json({status: true,
                                message: "Job info loaded successfully",
                                error : null,
                                data: {
                                    jobInfo :result[0][0]
                                }
                            });

                        }
                        else{
                            response.status = false;
                            response.message = "Error while getting job info.";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};


module.exports = jobInfoCtrl;