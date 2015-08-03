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
 * Method : POST
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
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Group Name is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'Group Name is not available';
                        res.status(200).json(responseMessage);
                        console.log('FnValidateGroupName:Group Name is not available');
                    }
                }
                        else {
                            responseMessage.message = 'Group Name is not available';
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Group Name is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'Group Name is not available';
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
                        responseMessage.message = 'Group deleted successfully';
                        responseMessage.data = {
                            groupID : groupID
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnDeleteGroup: Group deleted successfully');
                    }
                    else {
                        responseMessage.message = 'Group not deleted';
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
    var auto_join = req.body.auto_join ? req.body.auto_join : 0;
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
                            + ',' + st.db.escape(auto_join) + ',' + st.db.escape(relationType) + ',' + st.db.escape(userID);
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

/**
 * @todo FnComposeMessage
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for compose message
 */
MessageBox.prototype.composeMessage = function(req,res,next){

    var _this = this;

    var message  = req.body.message;
    var attachment  = req.body.attachment ? req.body.attachment : '';
    var attachmentFilename  = req.body.attachment_filename ? req.body.attachment_filename : '';
    var priority  = req.body.priority ? req.body.priority : 1;
    var targetDate  = req.body.target_date ? req.body.target_date : '';
    var expiryDate  =  req.body.expiry_date ? req.body.expiry_date : '';
    var token = req.body.token;
    var previousMessageID = req.body.previous_messageID;
    var toID = req.body.to_id;
    var idType = req.body.id_type;

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
    if(!toID){
        error['toID'] = 'Invalid toID';
        validateStatus *= false;
    }
    if(!previousMessageID){
        error['previousMessageID'] = 'Invalid previousMessageID';
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
                        var queryParams = st.db.escape(message) + ',' + st.db.escape(attachment) + ',' + st.db.escape(attachmentFilename)
                            + ',' + st.db.escape(priority) + ',' + st.db.escape(targetDate) + ',' + st.db.escape(expiryDate)
                            + ',' + st.db.escape(token) + ',' + st.db.escape(previousMessageID)+ ',' + st.db.escape(toID)
                            + ',' + st.db.escape(idType);
                        var query = 'CALL pComposeMessage(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            console.log(insertResult);
                            if (!err) {
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message Composed successfully';
                                    responseMessage.data = {
                                        message  : req.body.message,
                                        attachment  : req.body.attachment,
                                        attachmentFilename  : req.body.attachment_filename,
                                        priority  : req.body.priority,
                                        targetDate  : req.body.target_date,
                                        expiryDate  : req.body.expiry_date,
                                        token : req.body.token,
                                        previousMessageID : req.body.previous_messageID,
                                        toID : req.body.to_id,
                                        idType : req.body.id_type
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnComposeMessage: Message Composed successfully');
                                }
                                else {
                                    responseMessage.message = 'Message not Composed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnComposeMessage:Message not Composed');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnComposeMessage: error in composing Message :' + err);
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
                        console.log('FnComposeMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnComposeMessage:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnComposeMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetMembersList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get members list
 */

MessageBox.prototype.getMembersList = function(req,res,next){
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
            console.log('CALL pGetMembersList(' + st.db.escape(groupID) + ')');
            st.db.query('CALL pGetMembersList(' + st.db.escape(groupID) + ')', function (err, getResult) {
                console.log(getResult);

                if (!err) {
                    if (getResult) {
                        if(getResult[0]){
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Members List loaded successfully';
                        responseMessage.data = getResult[0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetMembersList: Members List loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Members List not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetMembersList:Members List not loaded');
                    }

                }
                    else {
                        responseMessage.message = 'Members List not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetMembersList:Members List not loaded');
                    }

                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetMembersList: error in getting Members:' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';s
            res.status(500).json(responseMessage);
            console.log('Error : FnGetMembersList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



/**
 * @todo FnLoadMessageBox
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load messageBox
 */

MessageBox.prototype.loadMessageBox = function(req,res,next){
    var _this = this;

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            console.log('CALL PLoadMessageBox(' + st.db.escape(ezeone_id) + ')');
            st.db.query('CALL PLoadMessageBox(' + st.db.escape(ezeone_id) + ')', function (err, getResult) {
                console.log(getResult);

                if (!err) {
                    if (getResult) {
                        if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'MessageBox loaded successfully';
                        responseMessage.data = getResult[0];
                        res.status(200).json(responseMessage);
                        console.log('FnLoadMessageBox: MessageBox loaded successfully');
                    }
                    else {
                        responseMessage.message = 'MessageBox not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnLoadMessageBox:MessageBox not loaded');
                    }

                }
                    else {
                        responseMessage.message = 'MessageBox not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnLoadMessageBox:MessageBox not loaded');
                    }

                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessageBox: error in getting MessageBox:' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';s
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadMessageBox ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



/**
 * @todo FnChangeMessageActivity
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update message activity status
 */
MessageBox.prototype.changeMessageActivity = function(req,res,next){

    var _this = this;


    var messageID  = req.body.message_id;
    var status  = req.body.status;
    var isTrash  = req.body.is_trash;
    var token  = req.body.token;

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
    if(!messageID){
        error['messageID'] = 'Invalid messageID';
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
                        var queryParams = st.db.escape(messageID) + ',' + st.db.escape(status) + ',' + st.db.escape(isTrash)+ ',' + st.db.escape(token);

                        var query = 'CALL PchangeMessageActivity(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message status changed successfully';
                                    responseMessage.data = {
                                        token: token,
                                        messageID: messageID,
                                        status:status,
                                        isTrash: isTrash

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeMessageActivity: Message status changed successfully');
                                }
                                else {
                                    responseMessage.message = 'Message status not changed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeMessageActivity:Message status not changed');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnChangeMessageActivity: error in updating Message status:' + err);
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
                        console.log('FnChangeMessageActivity: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnChangeMessageActivity:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnChangeMessageActivity ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnLoadOutBoxMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load outbox messages
 */

MessageBox.prototype.loadOutBoxMessages = function(req,res,next){
    var _this = this;

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            console.log('CALL pLoadOutBoxMessages(' + st.db.escape(ezeone_id) + ')');
            st.db.query('CALL pLoadOutBoxMessages(' + st.db.escape(ezeone_id) + ')', function (err, getResult) {
                console.log(getResult);

                if (!err) {
                    if (getResult) {
                        if (getResult[0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'OutBox Messages loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnLoadOutBoxMessages: OutBox Messages loaded successfully');
                        }
                        else {
                            responseMessage.message = 'OutBox Messages not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnLoadOutBoxMessages:OutBox Messages not loaded');
                        }

                    }
                    else {
                        responseMessage.message = 'OutBox Messages not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnLoadOutBoxMessages:OutBox Messages not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnLoadOutBoxMessages: error in getting OutBox Messages:' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadOutBoxMessages ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetSuggestionList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get Suggestion list
 */

MessageBox.prototype.getSuggestionList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!keywordsForSearch){
        error['keyword'] = 'Invalid keyword';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(keywordsForSearch) + ','  + st.db.escape(token);
                        var query = 'CALL pGetMessageboxSuggestionList(' + queryParams + ')'
                            st.db.query(query, function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'SuggestionList loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSuggestionList: SuggestionList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'SuggestionList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSuggestionList:SuggestionList not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'SuggestionList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSuggestionList:SuggestionList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetSuggestionList: error in getting OutBox Messages:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetSuggestionList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetSuggestionList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetSuggestionList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

module.exports = MessageBox;