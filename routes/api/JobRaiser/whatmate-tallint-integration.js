function integrationMethods() {
}

integrationMethods.prototype.fetchAPiUrl = function (req, callback) {

    var inputs = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.heMasterId)
    ];

    var procQuery = 'call wm_tallint_get_apiUrlData(' + inputs.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery, function (err, result) {
        if (!err && result && result[0] && result[0][0]) {
            callback(err, result[0][0]);
        }
        else if (!err) {
            callback(err, result[0][0]);
        }
        else {
            callback(err, null);
        }
    });
}


module.exports = integrationMethods;