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

    // if (!(req.body.branchList && req.body.branchList[0] && req.body.branchList[0].branchId)) {
    //     error.branchList = 'Invalid branchList';
    //     validationFlag *= false;
    // }

    // if (!(req.body.contactList && req.body.contactList.length)) {
    //     error.contactList = 'Invalid contactList';
    //     validationFlag *= false;
    // }

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
                            req.st.db.escape(JSON.stringify(req.body.requirements)),
                            req.st.db.escape(JSON.stringify(req.body.members || [])),
                            req.st.db.escape(JSON.stringify(req.body.memberInterviewRound || [])),
                            req.st.db.escape(req.body.status || 1),
                            req.st.db.escape(req.body.statusTitle),
                            req.st.db.escape(req.body.statusNotes || "")
                        ];

                        var procQuery = 'CALL pace_save_requirementGroup( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, requirementResult) {
                            console.log(err);
                            if (!err && requirementResult && requirementResult[0] && requirementResult[0][0] && requirementResult[0][0].message) {

                                response.status = true;
                                response.message = requirementResult[0][0].message;
                                response.error = null;

                                // for (var i = 0; i < requirementResult[2].length; i++) {
                                //     requirementResult[2][i].followUpNotes = (requirementResult[2] && requirementResult[2][i]) ? JSON.parse(requirementResult[2][i].followUpNotes) : [];
                                // }

                                
                                response.data = {
                                    reqGroupDetails: requirementResult[0][0],
                                    reqGroupCompleteDetails: requirementResult[1][0] ? requirementResult[1][0] : null,
                                    // followUpNotes: (requirementResult[2] && requirementResult[2][0]) ? requirementResult[2] : []
                                    requirementGroupList :requirementResult[2] ? requirementResult[2] : []
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

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].followUpNotes = (result[1] && result[1][i]) ? JSON.parse(result[1][i].followUpNotes) : [];
                        }

                        response.data = {
                            reqGroupDetails: result[0][0] ? result[0][0] : null,
                            followUpNotes: (result[1] && result[1][0]) ? result[1] : []
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
                    req.st.db.escape(req.body.reqGroupJobCode || ""),
                    req.st.db.escape(req.body.reqGroupCreatedUserName || ""),
                    req.st.db.escape(req.body.reqGroupCreatedDate || null)
                    // req.st.db.escape(req.body.reqGroupStatusTitle || "")
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
                        //         results[0][i].reqGroupStageDetail = JSON.parse(results[0][i].reqGroupStageDetail) ? JSON.parse(results[0][i].reqGroupStageDetail) : [],
                        //         results[0][i].requirements = JSON.parse(results[0][i].requirements) ? JSON.parse(results[0][i].requirements) : []
                        // }

                        response.data = {
                            requirementGroupView: results[0] ? results[0] : [],
                            requirementGroupCount: (results[1] && results[1][0] && results[1][0].requirementGroupCount) ? results[1][0].requirementGroupCount : 0
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = " Requirement View is empty";
                        response.error = null;
                        response.data = {
                            requirementGroupView: [],
                            requirementGroupCount:0
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

reqGroup.getreqApplicantViewWithReqGroup = function (req, res, next) {
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
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
    }
    var heDepartmentId = req.body.heDepartmentId;
    if (!heDepartmentId) {
        heDepartmentId = [];
    }
    else if (typeof (heDepartmentId) == "string") {
        heDepartmentId = JSON.parse(heDepartmentId);
    }


    var jobTitleId = req.body.jobTitleId;
    if (!jobTitleId) {
        jobTitleId = [];
    }
    else if (typeof (jobTitleId) == "string") {
        jobTitleId = JSON.parse(jobTitleId);
    }


    var stageId = req.body.stageId;
    if (!stageId) {
        stageId = [];
    }
    else if (typeof (stageId) == "string") {
        stageId = JSON.parse(stageId);
    }

    var statusId = req.body.statusId;
    if (!statusId) {
        statusId = [];
    }
    else if (typeof (statusId) == "string") {
        statusId = JSON.parse(statusId);
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
                // req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                // req.body.jobTitleId = (req.body.jobTitleId) ? req.body.jobTitleId : [];
                // req.body.stageId = (req.body.stageId) ? req.body.stageId : [];
                // req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                req.body.startPage = (req.body.startPage) ? req.body.startPage : 0;
                req.body.limit = (req.body.limit) ? req.body.limit : 12;
                req.body.applicantId = (req.body.applicantId) || (req.body.applicantId == "") ? req.body.applicantId : 0;
                req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                req.body.type = (req.body.type) ? req.body.type : 1;
                req.body.name = (req.body.name) ? req.body.name.trim() : '';
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                if(req.body.name != "") {
                    req.body.name = req.body.name.split(',');
                }
                else{
                    req.body.name = [];
                }

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(heDepartmentId)),
                    req.st.db.escape(JSON.stringify(jobTitleId)),
                    // req.st.db.escape(req.query.heDepartmentId),
                    // req.st.db.escape(req.query.jobTitleId),
                    req.st.db.escape(req.body.applicantId),
                    // req.st.db.escape(req.query.stageId),
                    // req.st.db.escape(req.body.statusId),
                    req.st.db.escape(JSON.stringify(stageId)),
                    req.st.db.escape(JSON.stringify(statusId)),
                    req.st.db.escape(req.body.startPage),
                    req.st.db.escape(req.body.limit),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(JSON.stringify(req.body.name || [])),
                    req.st.db.escape(req.body.from || null),
                    req.st.db.escape(req.body.to || null),
                    req.st.db.escape(req.body.userMasterId || 0),
                    req.st.db.escape(req.query.isWeb || 0),
                    req.st.db.escape(JSON.stringify(req.body.stageDetail || {})),
                    req.st.db.escape(req.body.applicantName || ""),
                    req.st.db.escape(req.body.emailId || ""),
                    req.st.db.escape(req.body.mobileNumber || ""),
                    req.st.db.escape(req.body.requirementJobTitle || ""),
                    req.st.db.escape(req.body.jobCode || ""),
                    req.st.db.escape(req.body.clientName || ""),
                    req.st.db.escape(req.body.stageName || ""),
                    req.st.db.escape(req.body.statusName || ""),
                    req.st.db.escape(req.body.applicantJobTitle || ""),
                    req.st.db.escape(req.body.employer || ""),
                    req.st.db.escape(req.body.experience || ""),
                    req.st.db.escape(req.body.stageStatusNotes || ""),
                    req.st.db.escape(req.body.cvSource || ""),
                    req.st.db.escape(req.body.primarySkills || ""),
                    req.st.db.escape(req.body.secondarySkills || ""),
                    req.st.db.escape(req.body.presentLocation || ""),
                    req.st.db.escape(req.body.education || ""),
                    req.st.db.escape(req.body.passportNumber || ""),
                    req.st.db.escape(req.body.faceSheet || ""),
                    req.st.db.escape(req.body.cvCreatedUserName || ""),
                    req.st.db.escape(req.body.cvUpdatedUserName || ""),
                    req.st.db.escape(req.body.reqCvCreatedUserName || ""),
                    req.st.db.escape(req.body.reqCvUpdatedUserName || ""),
                    req.st.db.escape(req.body.cvCreatedDate || null),
                    req.st.db.escape(req.body.cvUpdatedDate || null),
                    req.st.db.escape(req.body.reqCvCreatedDate || null),
                    req.st.db.escape(req.body.reqCvUpdatedDate || null),
                    req.st.db.escape(req.body.emigrationCheck || ""),
                    req.st.db.escape(req.body.DOB || null),
                    req.st.db.escape(req.body.ppExpiryDate || null),
                    req.st.db.escape(req.body.ppIssueDate || null),
                    req.st.db.escape(req.body.reqGroupJobCode || ""),
                    req.st.db.escape(req.body.reqGroupName || "")
                ];

                var procQuery = 'CALL wm_get_applicantsViewWithRequirementGroup( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result && Result[0] || Result[2] || Result[3]) {
                        response.status = true;
                        response.message = "Applicants loaded successfully";
                        response.error = null;
                        if (Result[0] && Result[0][0] && Result[0][0].reqApplicantId) {
                            for (var i = 0; i < Result[0].length; i++) {
                                Result[0][i].clientContacts = Result[0][i].clientContacts ? JSON.parse(Result[0][i].clientContacts) : [];

                                Result[0][i].faceSheetDetailWithAnswers = Result[0][i].faceSheetDetailWithAnswers ? JSON.parse(Result[0][i].faceSheetDetailWithAnswers) : [];

                                var facesheet = [];
                                for (var f = 0; f < Result[0][i].faceSheetDetailWithAnswers.length; f++) {
                                    if (Result[0][i].faceSheetDetailWithAnswers[f].answer) {
                                        var answer = Result[0][i].faceSheetDetailWithAnswers[f].answer;
                                    }
                                    else {
                                        var answer = "Not Applicable";
                                    }
                                    var QandA = Result[0][i].faceSheetDetailWithAnswers[f].question + " - " + answer;
                                    facesheet.push(QandA);
                                }
                                Result[0][i].faceSheetDetailWithAnswers = facesheet;
                            }
                        }
                        var cvSearchMasterData = {};
                        var offerMasterData = {};
                        if(req.query.isWeb == 0 && Result[6] && Result[6][0] && Result[7] && Result[7][0]){
                           cvSearchMasterData = {
                                skillList : Result[6] ? Result[6] : [],
                                roles : Result[7] ? Result[7] : [],
                                industry : Result[8] ? Result[8] : [],
                                cvSource : Result[9] ? Result[9] : [],
                                functionalAreas : Result[10] ? Result[10] : [],
                                nationality : Result[11] ? Result[11] : []                           

                            }
                            offerMasterData  = {
                                currency: Result[2] ? Result[2] : [],
                                scale: Result[3] ? Result[3] : [],
                                duration: Result[4] ? Result[4] : [],
                                attachment: Result[5] ? Result[5] : [],
                                grade : Result[12] ? Result[12] : [],
                                designation :  Result[7] ? Result[7] : []
                            } 
                        }

                        response.data = {
                            applicantlist: Result[0] && Result[0][0] && Result[0][0].reqApplicantId ? Result[0] : [],
                            count: Result[1][0].count,
                            offerMasterData: offerMasterData,
                            cvSearchMasterData : cvSearchMasterData
                        };
                        // console.log(response.data);
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Applicants not found";
                        response.error = null;
                        response.data = {
                            applicantlist: [],
                            count: [],
                            currency: [],
                            scale: [],
                            duration: [],
                            attachment: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading applicants";
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


reqGroup.getMailerApplicantsForReqGroup = function (req, res, next) {
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
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
    }

    var stageStatusId = req.body.stageStatusId;
    if (!stageStatusId) {
        stageStatusId = [];
    }
    else if (typeof (stageStatusId) == "string") {
        stageStatusId = JSON.parse(stageStatusId);
    }

    var reqApplicants = req.body.reqApp;
    if (!reqApplicants) {
        reqApplicants = [];
    }
    else if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
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
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.body.startPage = (req.body.startPage) ? req.body.startPage : 0;
                req.body.limit = (req.body.limit) ? req.body.limit : 100;



                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(stageStatusId)),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(req.body.startPage),
                    req.st.db.escape(req.body.limit),
                    req.st.db.escape(req.body.type || 1)  // take my self by default
                ];

                var procQuery = 'CALL wm_get_mailerApplicantsForRequirementGroup( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result && Result[0] && Result[0][0]) {
                        response.status = true;
                        response.message = "Applicants loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < Result[0].length; i++) {
                            Result[0][i].clientContacts = Result[0][i] && Result[0][i].clientContacts ? JSON.parse(Result[0][i].clientContacts) : [];
                        }
                        response.data = {
                            applicantlist: Result[0] ? Result[0] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Applicants not found";
                        response.error = null;
                        response.data = {
                            applicantlist: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading applicants";
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

reqGroup.savePaceFollowUpNotesForGroup = function (req, res, next) {
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

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.body.type) {
        error.type = 'Invalid type';
        validationFlag *= false;
    }

    if (!req.body.reqGroupId) {
        error.reqGroupId = 'Invalid reqGroupId';
        validationFlag *= false;
    }

    var followUpNotes = req.body.followUpNotes;
    if (typeof (followUpNotes) == "string") {
        followUpNotes = JSON.parse(followUpNotes);
    }
    if (!followUpNotes) {
        followUpNotes = []
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
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.reqGroupId),
                    req.st.db.escape(JSON.stringify(followUpNotes))
                ];

                var procQuery = 'CALL wm_save_paceFollowUpNotesForGroup( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].followUpNotes = (result[0] && result[0][i]) ? JSON.parse(result[0][i].followUpNotes) : [];
                        }

                        response.status = true;
                        response.message = "followUp Data saved sucessfully";
                        response.error = null;
                        response.data = result[0] && result[0][0] ? result[0] : [];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "followUp Data saved sucessfully";
                        response.error = null;
                        response.data = [];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving followUp data";
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


reqGroup.getRecruiterPerformanceByRequirementGroup = function (req, res, next) {
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

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    // if (!req.query.userMasterId) {
    //     error.userMasterId = 'Invalid userMasterId';
    //     validationFlag *= false;
    // }

    // if (!req.query.heDepartmentId) {
    //     error.heDepartmentId = 'Invalid heDepartmentId';
    //     validationFlag *= false;
    // }
    if (!req.body.from) {
        error.from = 'Invalid from';
        validationFlag *= false;
    }

    if (!req.body.to) {
        error.to = 'Invalid to';
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
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to),
                    req.st.db.escape(JSON.stringify(req.body.userMasterId || [])),
                    req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                    req.st.db.escape(JSON.stringify(req.body.requirementId || [])),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL pace_get_dashboardRecruiterPerformanceRequirementGroupView( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data ={
                                requirementGroupData: result[0] ? result[0] : []                               
                            };
                            res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
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
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


reqGroup.getclientRequirementGroup = function (req, res, next) {
    var error = {};

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag = false;
    }

    if (!req.body.heDepartmentId) {
        error.heDepartmentId = "Invalid client";
        validationFlag = false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.type = req.query.type ? req.query.type : 1;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to)
                ];

                var procQuery = 'CALL wm_get_paceClientRequirementsGroup( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;

                        response.data = result[0];
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading dashobard data";
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


reqGroup.getRecruiterPerformanceReqAppForRequirementGroups = function (req, res, next) {
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

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    // if (!req.query.userMasterId) {
    //     error.userMasterId = 'Invalid userMasterId';
    //     validationFlag *= false;
    // }

    // if (!req.query.heDepartmentId) {
    //     error.heDepartmentId = 'Invalid heDepartmentId';
    //     validationFlag *= false;
    // }

    // if (!req.query.requirementId) {
    //     error.requirementId = 'Invalid requirementId';
    //     validationFlag *= false;
    // }
    if (!req.body.from) {
        error.from = 'Invalid from';
        validationFlag *= false;
    }

    if (!req.body.to) {
        error.to = 'Invalid to';
        validationFlag *= false;
    }

    if (!req.body.userMasterId.length) {
        error.to = 'Invalid userMasterId';
        validationFlag *= false;
    }

    // if (!req.body.heDepartmentId.length) {
    //     error.to = 'Invalid heDepartmentId';
    //     validationFlag *= false;
    // }
    // if (!req.body.requirementId.length) {
    //     error.to = 'Invalid requirementId';
    //     validationFlag *= false;
    // }

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
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to),
                    req.st.db.escape(JSON.stringify(req.body.userMasterId || [])),
                    req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                    req.st.db.escape(JSON.stringify(req.body.reqGroupId || [])),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.body.stageId || 0)
                ];

                var procQuery = 'CALL pace_get_dashboardRecruiterPerformanceAppViewReqGroups( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        // for (var i=0; i < result[0].length; i++){
                        //     result[0][i].clientContacts = result[0][i] && result[0][i].clientContacts && JSON.parse(result[0][i].clientContacts) ? JSON.parse(result[0][i].clientContacts) : [];

                        // }
                        response.data ={
                                reqApplicantData: result[0] ? result[0] : []                               
                            };
                            res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data =null;
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
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};
module.exports = reqGroup;