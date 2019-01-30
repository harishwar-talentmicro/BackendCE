var reqGroup = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;


reqGroup.saveRequirementGroup = function (req, res, next) {
    var error = {};
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.reqGroupName) {
        error.reqGroupName = 'Invalid reqGroupName';
        validationFlag *= false;
    }
    if (!req.body.reqGroupJobCode) {
        error.reqGroupJobCode = 'Invalid reqGroupJobCode';
        validationFlag *= false;
    }

    if (!(req.body.reqJobCodeArray && req.body.reqJobCodeArray.length)) {
        error.reqJobCodeArray = 'Invalid reqJobCodeArray';
        validationFlag *= false;
    }

    if (!(req.body.heDepartment && req.body.heDepartment.heDepartmentId)) {
        error.heDepartment = 'Invalid heDepartment';
        validationFlag *= false;
    }

    if (!(req.body.branchList && req.body.branchList[0] && req.body.branchList[0].branchId)) {
        error.branchList = 'Invalid branchList';
        validationFlag *= false;
    }

    if (!(req.body.contactList && req.body.contactList.length)) {
        error.contactList = 'Invalid contactList';
        validationFlag *= false;
    }

    if (!(req.body.requirements && req.body.requirements.length)) {
        error.requirements = 'Invalid requirements';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var input = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body.reqJobCodeArray)),
                    req.st.db.escape(req.body.reqGroupJobCode),
                    req.st.db.escape(req.body.reqGroupId || 0)
                ];

                var procQuery = 'CALL pace_check_reqGroupJobCodeArray( ' + input.join(',') + ')';
                console.log(procQuery);

                req.db.query(procQuery, function (err, jobCodeResult) {

                    if (!err && jobCodeResult && jobCodeResult[0] && jobCodeResult[0][0] && jobCodeResult[0][0].message) {

                        req.body.targetDate = (req.body.targetDate) ? req.body.targetDate : null;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.body.reqGroupId || 0),
                            req.st.db.escape(req.body.reqGroupName),
                            req.st.db.escape(req.body.reqGroupJobCode),
                            req.st.db.escape(req.body.targetDate || null),
                            req.st.db.escape(JSON.stringify(req.body.heDepartment)),
                            req.st.db.escape(JSON.stringify(req.body.branchList)),
                            req.st.db.escape(JSON.stringify(req.body.contactList)),
                            req.st.db.escape(JSON.stringify(req.body.requirements))
                        ];

                        var procQuery = 'CALL pace_save_requirementGroup( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, requirementResult) {
                            console.log(err);
                            if (!err && requirementResult && requirementResult[0] && requirementResult[0][0] && requirementResult[0][0].message) {

                                response.status = true;
                                response.message = requirementResult[0][0].message;
                                response.error = null;
                                response.data = {
                                    reqGroupDetails: requirementResult[0][0]
                                };
                                res.status(200).json(response);
                            }

                            else if (!err && requirementResult && requirementResult[0] && requirementResult[0][0] && requirementResult[0][0]._error) {
                                response.status = false;
                                response.message = requirementResult[0][0]._error;
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving requirement group";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);

                            }
                        });

                    }
                    else if (!err && jobCodeResult && jobCodeResult[0] && jobCodeResult[0][0] && jobCodeResult[0][0]._error) {
                        response.status = false;
                        response.message = jobCodeResult[0][0]._error;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Something error occured";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }

                });

            }
            else {
                res.status(401).json(response);
            }

        });
    }
};


reqGroup.getRequirementGroup = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.query.reqGroupId) {
        error.reqGroupId = 'Invalid reqGroupId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqGroupId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL pace_get_requirementGroupDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Requirement group details loaded successfully";
                        response.error = null;
                        response.data = {
                            reqGroupDetails: result[0][0] ? result[0][0] : null
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while generating Jobcode";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


reqGroup.getrequirementGroupList = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.applicantId || 0)
                ];

                var procQuery = 'CALL pace_get_requirementGroupList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] || result[1]) {
                        response.status = true;
                        response.message = "Requirement list loaded successfully";
                        response.error = null;
                        response.data = {
                            requirementGroupList: result[0] && result[0][0] ? result[0] : [],
                            totalDBResumeCount: result[1] && result[1][0] && result[1][0].totalDBResumeCount ? result[1][0].totalDBResumeCount : 0
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            requirementGroupList: [],
                            totalDBResumeCount: result[1] && result[1][0] && result[1][0].totalDBResumeCount ? result[1][0].totalDBResumeCount : 0
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting requirement List";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

reqGroup.getRequirementViewGroup = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.query.status = (req.query.status) ? req.query.status : 0;
                req.query.type = (req.query.type) ? req.query.type : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.query.startPage || 0),
                    req.st.db.escape(req.query.limit || 0),
                    req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                    req.st.db.escape(req.query.search || ""),
                    req.st.db.escape(JSON.stringify(req.body.webStatusFilter || [])),
                    req.st.db.escape(req.query.isWeb || 0),
                    req.st.db.escape(req.body.departmentTitle || ""),
                    req.st.db.escape(req.body.branchName || ""),
                    req.st.db.escape(req.body.jobCode || ""),
                    req.st.db.escape(req.body.jobTitle || ""),
                    req.st.db.escape(req.body.positions || 0),
                    req.st.db.escape(req.body.positionsFilled || 0),
                    req.st.db.escape(req.body.requirementTeam || ""),
                    req.st.db.escape(req.body.notes || ""),
                    req.st.db.escape(req.body.offeredCTC || 0),
                    req.st.db.escape(req.body.joiningDate || null),
                    req.st.db.escape(req.body.jobType || 0),
                    req.st.db.escape(req.body.creatorName || ""),
                    req.st.db.escape(req.body.createdDate || null),
                    req.st.db.escape(req.body.reqGroupName || ""),
                    req.st.db.escape(req.body.reqGroupJobCode || "")
                ];

                var procQuery = 'CALL pace_get_requirementViewGroup( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && (results[0] || results[1])) {
                        response.status = true;
                        response.message = " Requirement View loaded sucessfully";
                        response.error = null;

                        // for (var i = 0; i < results[0].length; i++) {
                        //     results[0][i].branchList = JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList) : [],
                        //         results[0][i].contactList = JSON.parse(results[0][i].contactList) ? JSON.parse(results[0][i].contactList) : [],
                        //         results[0][i].stageDetail = JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail) : []
                        // }

                        // for (var i = 0; i < results[2].length; i++) {
                        //     results[2][i].status = results[2] && results[2][i] && JSON.parse(results[2][i].status) ? JSON.parse(results[2][i].status) : [];
                        // }

                        response.data = {
                            requirementGroupView: results[0] ? results[0] : [],
                            requirementGroupCount: (results[1] && results[1][0] && results[1][0].requirementCount) ? results[1][0].requirementGroupCount : 0,
                            stageList: results[2] && results[2][0] ? results[2] : []
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = " Requirement View is empty";
                        response.error = null;
                        response.data = {
                            requirementGroupView: [],
                            stageList: (results && results[1] && results[1][0]) ? JSON.parse(results[1][0].stageList) : []

                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Requirement View";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }

                });

            }
            else {
                res.status(401).json(response);
            }


        });
    }
};
module.exports = reqGroup;