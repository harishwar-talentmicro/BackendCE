var paceAdmin = {};
var error = {};


paceAdmin.paceAdminDashboard = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {

        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(req.query.fromDate),
            req.st.db.escape(req.query.toDate),
            req.st.db.escape(JSON.stringify(req.body.heMasterId || []))
        ];

        var procQuery = 'CALL pace_admin_dashboard( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result) {
                response.status = true;
                response.message = "Data loaded successfully";
                response.error = null;

                result[0][0].heMasterData = result[0] && result[0][0] && result[0][0].heMasterData && JSON.parse(result[0][0].heMasterData) ? JSON.parse(result[0][0].heMasterData) : [];

                result[2][0].heMasterData = result[2] && result[2][0] && result[2][0].heMasterData && JSON.parse(result[2][0].heMasterData) ? JSON.parse(result[2][0].heMasterData) : [];

                result[3][0].heMasterData = result[3] && result[3][0] && result[3][0].heMasterData && JSON.parse(result[3][0].heMasterData) ? JSON.parse(result[3][0].heMasterData) : [];

                result[4][0].heMasterData = result[4] && result[4][0] && result[4][0].heMasterData && JSON.parse(result[4][0].heMasterData) ? JSON.parse(result[4][0].heMasterData) : [];

                result[5][0].heMasterData = result[5] && result[5][0] && result[5][0].heMasterData && JSON.parse(result[5][0].heMasterData) ? JSON.parse(result[5][0].heMasterData) : [];

                result[6][0].heMasterData = result[6] && result[6][0] && result[6][0].heMasterData && JSON.parse(result[6][0].heMasterData) ? JSON.parse(result[6][0].heMasterData) : [];


                response.data = {
                    resumeData: result[0] && result[0][0] ? result[0][0] : null,
                    transactionData: result[2] && result[2][0] ? result[2][0] : null,
                    transactionHistoryData: result[3] && result[3][0] ? result[3][0] : null,
                    requirementHistoryData: result[4] && result[4][0] ? result[4][0] : null,
                    requirementGroupHistoryData : result[5] && result[5][0] ? result[5][0] : null,
                    clientHistoryData : result[6] && result[6][0] ? result[6][0] : null,
                    heMasterList : result[7] && result[7][0] ? result[7] : []
                };

                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "Failed to load data";
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while loading data";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


paceAdmin.paceSaveHeMasterConfiguration = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {

        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(JSON.stringify(req.body.heMasterConfiguration || []))
        ];

        var procQuery = 'CALL pace_admin_save_heMasterCOnfiguration( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result && result[0]) {
                response.status = true;
                response.message = "Data saved successfully";
                response.error = null;

                response.data = {
                    heMasterList : result[0] && result[0][0] ? result[0] : []
                };

                res.status(200).json(response);
            }
            else if (!err) {
                response.status = false;
                response.message = "Failed to save data";
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while loading data";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


module.exports = paceAdmin;