/**
 * Created by vedha on 11-03-2017.
 */
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;


var userCtrl = {};
var error = {};

userCtrl.saveUser = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.userMasterId){
        error.userMasterId = 'Invalid user masterId';
        validationFlag *= false;
    }

    if(!req.body.workGroupId){
        error.workGroupId = 'Invalid workGroupId';
        validationFlag *= false;
    }
    if(!req.body.RMGroupId){
        error.RMGroupId = 'Invalid RMGroupId';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.employeeCode = (req.body.employeeCode) ? req.body.employeeCode : '';
                req.body.jobTitle = (req.body.jobTitle) ? req.body.jobTitle : '';
                req.body.departmentId = (req.body.departmentId != undefined) ? req.body.departmentId : 0;
                req.body.locationTitle = (req.body.locationTitle) ? req.body.locationTitle : '';
                req.body.grade = (req.body.grade != undefined) ? req.body.grade : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                // req.body.trackTemplateId = (req.body.trackTemplateId) ? req.body.trackTemplateId : 0;
                req.body.workLocationId = (req.body.workLocationId) ? req.body.workLocationId : 0;
                req.body.userType = (req.body.userType) ? req.body.userType : 0;
                req.body.firstName = (req.body.firstName) ? req.body.firstName : "";
                req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : "";
                req.body.emailId = (req.body.emailId) ? req.body.emailId : "";
                req.body.DOJ = (req.body.DOJ) ? req.body.DOJ : null;
                // firstName,lastName,mobileISD,mobileNumber,emailId,displayName

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.employeeCode),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.departmentTitle),
                    req.st.db.escape(req.body.locationTitle),
                    req.st.db.escape(req.body.grade),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(req.body.trackTemplate)),
                    req.st.db.escape(req.body.workLocationId),
                    req.st.db.escape(req.body.formTemplateId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.userType),
                    req.st.db.escape(req.body.workGroupId),
                    req.st.db.escape(req.body.RMGroupId),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.DOJ)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HE_user( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,currencyResult){
                    if(!err){
                        response.status = true;
                        response.message = "Hello EZE user saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving user";
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

userCtrl.getMasterData = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading master data",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_master_data( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,masterDataResult){
                    if(!err && masterDataResult){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            jobTitleList : masterDataResult[0],
                            departmentList : masterDataResult[1],
                            locationList : masterDataResult[2],
                            bankNameList : masterDataResult[3],
                            workLocationList : masterDataResult[4],
                            trackTemplateList : masterDataResult[5],
                            formTemplateList : masterDataResult[6],
                            gradeList : masterDataResult[7],
                            docGroupList : masterDataResult[8],
                            workGroupList : masterDataResult[9],
                            RMGroupList : masterDataResult[10]
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting master data";
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

userCtrl.getUserDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading master data",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else
    {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEUserId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)                
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_user_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userData){
                    if(!err && userData){
                        // var outputArray=[];
                        // var userRights = JSON.parse("[" + userData[0][0].userRights + "]");
                        // console.log(userRights);
                        //
                        // for (var i = 0; i < userRights.length ; i++ ) {
                        //     var result = {};
                        //         result.HEFormId = userRights[i].HEFormId,
                        //         result.isMapped = userRights[i].isMapped,
                        //         result.HEFormTitle = userRights[i].HEFormTitle,
                        //         result.approvers = JSON.parse("[" + userRights[i].approvers + "]"),
                        //         result.receivers = JSON.parse("[" + userRights[i].receivers + "]"),
                        //         result.accessType = JSON.parse("[" + userRights[i].accessType + "]")
                        //             outputArray.push(result);
                        // }
                        var output=[];
                        var usertemplate = (JSON.parse( userData[0][0].tracktemplate )) ? (JSON.parse(userData[0][0].tracktemplate )):[];

                        for(var i=0; i<usertemplate.length; i++){
                            var res2={};
                            res2.trackTemplateId=usertemplate[i].templateId;
                                res2.trackTemplateTitle=usertemplate[i].title;
                            output.push(res2);
                        }
                        response.status = true;
                        response.message = "User details loaded successfully";
                        response.error = null;
                        response.data = {
                            name :  userData[0][0].name,
                            employeeCode : userData[0][0].employeeCode,
                            HEJobTitleId : userData[0][0].HEJobTitleId,
                            jobTitle : userData[0][0].jobTitle,
                            HEDepartmentId : userData[0][0].HEDepartmentId,
                            departmentTitle : userData[0][0].departmentTitle,
                            HELocationId : userData[0][0].HELocationId,
                            locationTitle : userData[0][0].locationTitle,
                            grade : userData[0][0].grade,
                            gradeTitle : userData[0][0].gradeTitle,
                            status : userData[0][0].status,
                            trackTemplateList : output,
                            // trackTemplateTitle : userData[0][0].trackTemplateTitle,
                            workLocationId : userData[0][0].workLocationId,
                            workLocationTitle : userData[0][0].workLocationTitle ,
                            userType : userData[0][0].userType ,
                            workGroupId : userData[0][0].workGroupId ,
                            workGroupTitle : userData[0][0].workGroupTitle ,
                            RMGroupId : userData[0][0].RMGroupId ,
                            RMGroupTitle : userData[0][0].RMGroupTitle,
                            firstName : userData[0][0].firstName,
                            lastName : userData[0][0].lastName,
                            mobileISD : userData[0][0].mobileISD,
                            mobileNumber : userData[0][0].mobileNumber,
                            emailId : userData[0][0].emailId,
                            displayName : userData[0][0].displayName,
                            DOJ : userData[0][0].DOJ
                        };
// firstName,lastName,mobileISD,mobileNumber,emailId,displayName


                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting user details";
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

userCtrl.getUserList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading users",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                var startPage = 0;

                startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.searchKeywords),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)                
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_user_List( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userData){
                    if(!err && userData){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = {
                            count : userData[1][0].count,
                            userList : userData[0]
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting users";
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

userCtrl.getApproversList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading approvers",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            var procParams = [
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_approvers_list( ' + procParams.join(',') + ')';

            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "Approvers loaded successfully";
                    response.error = null;
                    response.data = {
                        approversList : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting approvers";
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
};

userCtrl.getReceiversList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading approvers",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(DBSecretKey)                
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_receiver_list( ' + procParams.join(',') + ')';

            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "Receivers loaded successfully";
                    response.error = null;
                    response.data = {
                        approversList : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting Receivers";
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
};

userCtrl.getUserDataAccessRights = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading access rights",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(DBSecretKey)                
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_user_dataaccessrights( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "access rights loaded successfully";
                    response.error = null;
                    response.data = {
                        accessRights : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting Receivers";
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
};

userCtrl.searchUser = function(req,res,next){
    var response = {
        status : false,
        message : "Error while searching user",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.name),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL search_HE_user( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if(!err && searchList){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = {
                            searchList : searchList[0]
                        }

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while searching users";
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

userCtrl.validateEzeoneId = function(req,res,next){
    var response = {
        status : false,
        message : "Error while validating EZEOneId",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.EZEOneId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_ezeonId_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if(!err && searchList && searchList[0] && searchList[0][0]._error){
                        switch (searchList[0][0]._error) {
                            case 'ALREADY_USER' :
                                response.status = false;
                                response.message = "User already exists";
                                response.userMasterId = searchList[0][0].userMasterId ;
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                            case 'EZEONE_DOESNT_EXISTS' :
                                response.status = false;
                                response.message = "Invalid EZEOne ID try again with correct ID";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                            default:
                                break;
                        }
                    }
                    else if (!err)
                    {
                        response.status = true;
                        response.message = "Valid EZEOne ID";
                        response.error = null;
                        response.data = {
                            searchList : searchList[0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while validating EZEOne ID";
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

userCtrl.postToProfile = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.query.APIKey)
    // {
    //     error.APIKey = 'Invalid APIKey';
    //     validationFlag *= false;
    // }

    if (!validationFlag){
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
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(DBSecretKey)                
                ];

                var procQuery = 'CALL he_profileDataHistory( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if (!err)
                    {
                        response.status = true;
                        response.message = "Profile data updated successfully ";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while updating data";
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

module.exports = userCtrl;