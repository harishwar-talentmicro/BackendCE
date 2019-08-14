var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
var email = new sendgrid.Email();

var errorNotifier = function (req,param) {
    var proc_data = [
        req.st.db.escape(param.api_name),
        req.st.db.escape(param.query),
        req.st.db.escape(param.body),
        req.st.db.escape(param.proc_call),
        req.st.db.escape(param.error),
        req.st.db.escape(param.details),
    ];
}

module.exports = errorNotifier;