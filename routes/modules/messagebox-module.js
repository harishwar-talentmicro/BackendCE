/**
 *  @author Gowri shankar
 *  @since July 30,2015  03:54PM
 *  @title MessageBox module
 *  @description Handles MessageBox functions
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}
var st = null;
function MessageBox(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * @todo FnCreateMessageGroup
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for create message group
 */
MessageBox.prototype.createMessageGroup = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupName  = req.body.group_name;
    var groupType  = req.body.group_type;
    var aboutGroup  = req.body.about_group ? req.body.about_group : '';
    var autoJoin  = req.body.auto_join ? req.body.auto_join : 0;
    var memberID  = req.body.member_id;
    var relationType = req.body.relation_type;
    var tid = req.body.tid ? req.body.tid : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupName){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }
    if(!groupType){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }
    if(!memberID){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupName) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(aboutGroup) + ',' + st.db.escape(autoJoin) + ',' + st.db.escape(memberID)
                            + ',' + st.db.escape(relationType) + ',' + st.db.escape(tid);
                        var query = 'CALL pCreateMessageGroup(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            console.log(insertResult);
                            if (!err) {
                                if (insertResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group created successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupName: req.body.group_name,
                                        groupType: req.body.group_type,
                                        aboutGroup: req.body.about_group,
                                        autoJoin: req.body.auto_join,
                                        memberID: req.body.member_id,
                                        relationType: req.body.relation_type,
                                        tid: req.body.tid
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateMessageGroup: Group created successfully');
                                }
                                else {
                                    responseMessage.message = 'Group is not created';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateMessageGroup:Group is not created');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCreateMessageGroup: error in creating Group :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnCreateMessageGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCreateMessageGroup:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnCreateMessageGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnValidateGroupName
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for validate group name
 */
MessageBox.prototype.validateGroupName = function(req,res,next){
    var _this = this;

    var groupName = req.query.group_name;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupName){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            console.log('CALL pValidateGroupName(' + st.db.escape(groupName) + ')');
            st.db.query('CALL pValidateGroupName(' + st.db.escape(groupName) + ')', function (err, getResult) {
                console.log(getResult);

                if (!err) {
                    if (getResult) {
                        if(getResult[0]){
                            if(getResult[0][0]){
                                if(getResult[0][0].id == 0){

                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Group Name is available';
                            responseMessage.data = {
                                groupName : groupName
                            };
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName: Group Name is available');
                        }
                        else {
                            responseMessage.message = 'Group Name is not available';
                            responseMessage.error = {};
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Group Name is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'Group Name is not available';
                        responseMessage.error = {};
                        res.status(200).json(responseMessage);
                        console.log('FnValidateGroupName:Group Name is not available');
                    }
                }
                        else {
                            responseMessage.message = 'Group Name is not available';
                            responseMessage.error = {};
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Group Name is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'Group Name is not available';
                        responseMessage.error = {};
                        res.status(200).json(responseMessage);
                        console.log('FnValidateGroupName:Group Name is not available');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnValidateGroupName: error in validating Group Name :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnValidateGroupName ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateUserResponse
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update User Response
 */
MessageBox.prototype.updateUserResponse = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupId  = req.body.group_id;
    var ezeone_id  = alterEzeoneId(req.body.ezeone_id);
    var status  = req.body.status;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!status){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(ezeone_id) + ',' + st.db.escape(status);

                        var query = 'CALL pUpdateUserStatus(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User Response updated successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupId: req.body.group_id,
                                        ezeone_id: req.body.ezeone_id,
                                        status: req.body.status

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserResponse: User Response updated successfully');
                                }
                                else {
                                    responseMessage.message = 'User Response is not updated';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserResponse:User Response is not updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateUserResponse: error in updating user response :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateUserResponse: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserResponse:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateUserResponse ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnUpdateUserRelationship
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update User Relationship
 */
MessageBox.prototype.updateUserRelationship = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupId  = req.body.group_id;
    var memberID  = req.body.member_id;
    var relationType  = req.body.relation_type;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }
    if(!memberID){
        error['memberID'] = 'Invalid memberID';
        validateStatus *= false;
    }
    if(!relationType){
        error['relationType'] = 'Invalid relationType';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(memberID) + ',' + st.db.escape(relationType);

                        var query = 'CALL pUpdateUserRelationship(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User Relationship updated successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupId: req.body.group_id,
                                        memberID: req.body.member_id,
                                        relation_type: req.body.relation_type

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserRelationship: User Relationship updated successfully');
                                }
                                else {
                                    responseMessage.message = 'User Relationship is not updated';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserRelationship:User Relationship is not updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateUserRelationship: error in updating user Relationship :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateUserRelationship: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserRelationship:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateUserRelationship ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



/**
 * @todo FnDeleteGroup
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 * @description api code for Delete Group
 */
MessageBox.prototype.deleteGroup = function(req,res,next){
    var _this = this;

    var groupID = req.query.group_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupID){
        error['groupID'] = 'Invalid groupID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            console.log('CALL pDeleteGroup(' + st.db.escape(groupID) + ')');
            st.db.query('CALL pDeleteGroup(' + st.db.escape(groupID) + ')', function (err, getResult) {
                console.log(getResult);

                if (!err) {
                    if (getResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Group deleted sucessfully';
                        responseMessage.data = {
                            groupID : groupID
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnDeleteGroup: Group deleted sucessfully');
                    }
                    else {
                        responseMessage.message = 'Group not deleted';
                        responseMessage.error = null;
                        res.status(200).json(responseMessage);
                        console.log('FnDeleteGroup:Group not deleted');
                    }

                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnDeleteGroup: error in deleting Group:' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnDeleteGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



/**
 * @todo FnSendMessageRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for send message request
 */
MessageBox.prototype.sendMessageRequest = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupName  = req.body.group_name;
    var groupType  = req.body.group_type;
    var relationType = req.body.relation_type;
    var userID = req.body.user_id ? req.body.user_id : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!groupName){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }
    if(!groupType){
        error['groupName'] = 'Invalid groupName';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupName) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(aboutGroup) + ',' + st.db.escape(relationType) + ',' + st.db.escape(userID);
                        var query = 'CALL pSendMessageRequest(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            console.log(insertResult);
                            if (!err) {
                                if (insertResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message Request send successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupName: req.body.group_name,
                                        groupType: req.body.group_type,
                                        relationType: req.body.relation_type,
                                        userID: req.body.user_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMessageRequest: Message Request send successfully');
                                }
                                else {
                                    responseMessage.message = 'Message Request not send';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMessageRequest:Message Request not send');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSendMessageRequest: error in Message Request :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSendMessageRequest: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSendMessageRequest:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnSendMessageRequest ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



module.exports = MessageBox;