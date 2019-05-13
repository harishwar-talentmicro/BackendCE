var errorNotifier = function (req, param) {

    var heMasterId = req.query.heMasterId ? req.body.heMasterId : 0;
    var api_name = req.originalUrl;


    var proc_data = [
        req.st.db.escape(heMasterId),
        req.st.db.escape(api_name),
        req.st.db.escape(JSON.stringify(req.body)),
        req.st.db.escape(param.proc_call),
        req.st.db.escape(param.error.toString()),
        req.st.db.escape(JSON.stringify(param.details))
    ];
    var procQuery = 'CALL Save_db_error_Logger( ' + proc_data.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery, function (err, result) {
        if(!err){
            console.log("Errors saved sucessfully");
        }
        else{
            console.log("Logger error",err);
        }
    });
}

module.exports = errorNotifier;