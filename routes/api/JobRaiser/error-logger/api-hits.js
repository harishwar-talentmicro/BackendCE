var apiHitFunction = {
    saveApiHits : function (req) {
        var proc_data = [
            req.st.db.escape(req.query.token || ""),
            req.st.db.escape(req.query.heMasterId ? req.query.heMasterId : req.body.heMasterId),
            req.st.db.escape(req.originalUrl),
            req.st.db.escape(req.method),
            req.st.db.escape(req.ip || ""),
            req.st.db.escape(req.headers.origin || "")                        
        ];
        var procQuery = 'CALL pace_save_apiHits( ' + proc_data.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err) {
                console.log("api hit saved sucessfully",result);
            }
            else {
                console.log("api hit error", err);
            }
        });
    }
}
module.exports = apiHitFunction;