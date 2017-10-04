/**
 * Created by vedha on 12-09-2017.
 */
var routeMapCtrl = {};
var error = {};

routeMapCtrl.getRouteMap = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.employeeCode)
    {
        error.employeeCode = 'Invalid employeeCode';
        validationFlag *= false;
    }


    if (!req.query.date)
    {
        error.date = 'Invalid date';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateHEToken(req.query.APIKey,req.query.EZEOneId,req.query.password,req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){



                var procParams = [
                    req.st.db.escape(req.query.employeeCode),
                    req.st.db.escape(req.query.date),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(req.query.APIKey)
                ];

                var procQuery = 'CALL whatmate_get_routemap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,HRQueryList){
                    if(!err && HRQueryList && HRQueryList[0]){

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            routeList : HRQueryList[0] ? HRQueryList[0] : []
                        } ;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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


module.exports = routeMapCtrl;