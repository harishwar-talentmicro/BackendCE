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

var Notification = require('./notification/notification-master.js');
var notification = null;


var st = null;
function MessageBox(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
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
    if(parseInt(groupType) == NaN){
        error['groupType'] = 'Invalid groupType';
        validateStatus *= false;
    }
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupName) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(aboutGroup) + ',' + st.db.escape(autoJoin) + ',' + st.db.escape(tid);
                        var query = 'CALL pCreateMessageGroup(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult[0]) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group created successfully';
                                    responseMessage.data = {
                                        id : insertResult[0][0].ID,
                                        token: req.body.token,
                                        groupName: req.body.group_name,
                                        groupType: req.body.group_type,
                                        aboutGroup: req.body.about_group,
                                        autoJoin: req.body.auto_join,
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


    var name = req.query.group_name;
    var token = req.query.token;
    var groupType = req.query.group_type ? req.query.group_type : 0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!name){
        error['name'] = 'Invalid name';
        validateStatus *= false;
    }
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var queryParams = st.db.escape(name) + ',' +  st.db.escape(token)+ ',' +  st.db.escape(groupType);
            var query = 'CALL pValidateGroupName(' + queryParams + ')';
            st.db.query(query, function (err, getResult) {
                console.log(getResult);
                if (!err) {
                    if (getResult) {
                        if(getResult[0]){
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Name is available';
                                responseMessage.data = getResult[0];
                                res.status(200).json(responseMessage);
                                console.log('FnValidateGroupName: Name is available');
                            }
                            else {
                                responseMessage.message = 'Name is not available';
                                res.status(200).json(responseMessage);
                                console.log('FnValidateGroupName:Name is not available');
                            }
                        }
                        else {
                            responseMessage.message = 'Name is not available';
                            res.status(200).json(responseMessage);
                            console.log('FnValidateGroupName:Name is not available');
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
 * Validates a group number
 * @param req
 * @param res
 * @param next
 *
 * @method GET
 * @service-param token <varchar>
 * @service-param group_id <int>
 * @service-param ezeone_id  <int>
 */
MessageBox.prototype.validateGroupMember = function(req,res,next){

    var groupId = (parseInt(req.query.group_id) !== NaN && parseInt(req.query.group_id ) > 0) ? parseInt(req.query.group_id) : 0;

    var token = (req.query.token) ? req.query.token : null;

    var ezeoneId = (req.query.ezeone_id) ? alterEzeoneId(req.query.ezeone_id) : null;

    var error  = {};
    var status = true;
    var respMsg = {
        status : false,
        message : 'Please check the errors below',
        error : { server : 'Internal Server Error'},
        data : null
    }



    if(!groupId){
        error['group_id'] = 'Invalid group id';
        status *= false;
    }

    if(!ezeoneId){
        error['ezeone_id'] = 'EZEOne ID is empty';
        status *= false;
    }

    if(!status){
        respMsg.status = false;
        respMsg.error = error;
        res.status(400).json(respMsg);
    }
    else{
        try{
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(ezeoneId);
                        var query = 'CALL pValidateGroupMember('+queryParams+')';
                        console.log(query);
                        st.db.query(query,function(err,results){
                            if(!err){
                                if(results){
                                    if(results[0]){
                                        if(results[0][0]){
                                            respMsg.data = results[0][0];
                                            respMsg.status = true;
                                            respMsg.error = null;
                                            respMsg.message = 'Yes,Member of the Group';
                                            res.status(200).json(respMsg);
                                        }
                                        else{
                                            respMsg.status = false;
                                            respMsg.error = null;
                                            respMsg.message = 'Not a member of the Group';
                                            res.status(200).json(respMsg);
                                        }
                                    }
                                    else{
                                        respMsg.status = false;
                                        respMsg.error = null;
                                        respMsg.message = 'Not a member of the Group';
                                        res.status(200).json(respMsg);
                                    }
                                }
                                else{
                                    respMsg.status = false;
                                    respMsg.error = null;
                                    respMsg.message = 'Not a member of the Group';
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                console.log('Error in messagebox-module stored procedure : validateGroupMember pValidateGroupMember');
                                console.log(err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                                respMsg.status = false;
                                respMsg.error = {server : 'Internal server error'};
                                respMsg.message = 'An error occurred';
                                res.status(500).json(respMsg);
                            }
                        });
                    }
                    else{
                        respMsg.status = false;
                        respMsg.error = {token : 'Invalid token'};
                        res.status(401).json(respMsg);
                    }
                }
                else{
                    respMsg.status = false;
                    respMsg.error = {token : 'Invalid token'};
                    res.status(401).json(respMsg);
                }
            });
        }
        catch(ex){
            console.log('Error in messagebox-module : validateGropuMember');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.status = false;
            respMsg.error = {server : 'Internal server error'};
            respMsg.message = 'An error occurred';
            res.status(500).json(respMsg);
        }
    }
};

/**
 * @todo FnUpdateUserStatus
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for Update User status
 */
MessageBox.prototype.updateUserStatus = function(req,res,next){
    console.log('hai...........');
    console.log(req.body);
    var _this = this;

    var token  = req.body.token;
    var groupId  = parseInt(req.body.group_id);
    var masterId  = req.body.master_id;
    var status  = parseInt(req.body.status);
    var deleteStatus = (parseInt(req.body.group_type) !== NaN && parseInt(req.body.group_type) > 0)
        ? parseInt(req.body.group_type) : 0;

    console.log(req.body);

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
    if(!masterId){
        error['masterId'] = 'Invalid masterId';
        validateStatus *= false;
    }
    if(parseInt(status) == NaN){
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
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(masterId) + ',' + st.db.escape(status) + ','+ st.db.escape(deleteStatus);

                        var query = 'CALL pUpdateUserStatus(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User status updated successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        groupId: req.body.group_id,
                                        masterId: masterId,
                                        status: req.body.status

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus: User status updated successfully');
                                }
                                else {
                                    responseMessage.message = 'User status is not updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus:User status is not updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateUserStatus: error in updating user status :' + err);
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
                        console.log('FnUpdateUserStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateUserStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateUserStatus ' + ex.description);
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
    if(parseInt(relationType) == NaN){
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

    var token  = req.query.token;
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        console.log('CALL pDeleteGroup(' + st.db.escape(groupID) + ')');
                        st.db.query('CALL pDeleteGroup(' + st.db.escape(groupID) + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group deleted successfully';
                                    responseMessage.data = {
                                        groupID: groupID
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
    if(parseInt(groupType) == NaN){
        error['groupType'] = 'Invalid groupType';
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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(groupName) + ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(auto_join) + ',' + st.db.escape(relationType) + ',' + st.db.escape(userID);
                        var query = 'CALL pSendMessageRequest(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult.affectedRows > 0) {

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
    var previousMessageID = req.body.previous_messageID ? req.body.previous_messageID : 0;
    var toID = req.body.to_id;                              // comma separated id of toID
    var idType = req.body.id_type ? req.body.id_type : ''; // comma seperated values(0 - Group Message, 1 - Individual Message)
    var mimeType = (req.body.mime_type) ? req.body.mime_type : '';
    var isJobseeker = req.body.isJobseeker ? req.body.isJobseeker : 0;
    var masterid='',receiverId,senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId;

    console.log(req.body);

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
                        var queryParams = st.db.escape(message) + ',' + st.db.escape(attachment) + ',' + st.db.escape(attachmentFilename)
                            + ',' + st.db.escape(priority) + ',' + st.db.escape(targetDate) + ',' + st.db.escape(expiryDate)
                            + ',' + st.db.escape(token) + ',' + st.db.escape(previousMessageID)+ ',' + st.db.escape(toID)
                            + ',' + st.db.escape(idType)+ ',' + st.db.escape(mimeType)+ ',' + st.db.escape(isJobseeker);
                        var query = 'CALL pComposeMessage(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {

                            if (!err) {
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message Composed successfully';
                                    responseMessage.data = {
                                        message: req.body.message,
                                        attachmentFilename: req.body.attachment_filename,
                                        priority: req.body.priority,
                                        targetDate: req.body.target_date,
                                        expiryDate: req.body.expiry_date,
                                        token: req.body.token,
                                        previousMessageID: req.body.previous_messageID,
                                        toID: req.body.to_id,
                                        idType: req.body.id_type
                                    };
                                    res.status(200).json(responseMessage);

                                    /**
                                     * @todo add code for push notification like this
                                     */
                                    var query1 = 'SELECT masterid FROM tloginout WHERE token=' + st.db.escape(token);
                                    st.db.query(query1, function (err, result) {
                                        console.log('-----------------------------1');
                                        console.log(result);

                                        if (result[0]) {
                                            masterid = result[0].masterid;
                                        }
                                        else {
                                            console.log('FnComposeMessage:Error getting from masterid');
                                        }
                                        var query2 = 'select * from tmgroups where GroupType=1 and adminid=' + masterid;
                                        st.db.query(query2, function (err, getResult) {
                                            console.log('-----------------------------');
                                            console.log(getResult);
                                            if (getResult[0]) {
                                                var query3 = 'select * from tmgroupusers where GroupID=' + getResult[0].GroupID;
                                                st.db.query(query3, function (err, get_result) {
                                                    console.log('-----------------------------3');
                                                    console.log(get_result);
                                                    if (get_result[0]) {
                                                        var length = get_result[0].length;
                                                    }
                                                    else {
                                                        console.log('FnComposeMessage:Invalid length');
                                                    }

                                                    receiverId = toID;
                                                    senderTitle = getResult[0].GroupName;
                                                    groupTitle = getResult[0].GroupName;
                                                    groupId = getResult[0].GroupID;
                                                    messageText = message;
                                                    messageType = idType;
                                                    operationType = 0;
                                                    iphoneId = '';
                                                    messageId = previousMessageID;
                                                    console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId);
                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId);
                                                    // notification.publish(receiverId, senderTitle,groupTitle,groupId,message,messageType,operationType,iphoneId);

                                                    console.log('FnComposeMessage: Message Composed successfully');
                                                });
                                            }
                                            else {
                                                console.log('FnComposeMessage:Error getting from members');
                                            }
                                        });
                                    });
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
                if (!err) {
                    if (getResult) {
                        if(getResult[0].length > 0){
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

    var token = req.query.token;
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var trash = (req.query.trash) ? req.query.trash : 0; //if 0 normalmsg ,if u want trash msg send 1....Default is 0..
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id) + ',' + st.db.escape(trash) + ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount);
                        var query = 'CALL PLoadMessageBox(' + queryParams + ')';

                        st.db.query(query, function (err, getResult) {
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
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadMessageBox: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessageBox:Error in processing Token' + err);
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
    var token  = req.body.token;
    var isMessage = req.body.ismessage_open ? req.body.ismessage_open : 0;

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
                        var queryParams = st.db.escape(messageID) + ',' + st.db.escape(status)+ ',' + st.db.escape(token)
                            + ',' + st.db.escape(isMessage);

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
                                        status:status
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

    var token = req.query.token;
    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['toke'] = 'Invalid token';
        validateStatus *= false;
    }
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(ezeone_id) + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount);
                        var query = 'CALL pLoadOutBoxMessages(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
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

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnLoadOutBoxMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadOutBoxMessages:Error in processing Token' + err);
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
                        var query = 'CALL pGetMessageboxSuggestionList(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
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
                                console.log('FnGetSuggestionList: error in getting SuggestionList:' + err);
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

/**
 * @todo FnAddGroupMembers
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for Add Group Members
 */
MessageBox.prototype.addGroupMembers = function(req,res,next){

    var _this = this;

    var groupId = req.body.group_id;
    var memberId  = req.body.member_id;
    var relationType  = req.body.relation_type;
    var requester = req.body.requester; // 1 for group, 2 for user


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!groupId){
        error['groupId'] = 'Invalid groupId';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var queryParams = st.db.escape(groupId) + ',' + st.db.escape(memberId) + ',' + st.db.escape(relationType)+ ',' + st.db.escape(requester);
            var query = 'CALL pAddMemberstoGroup(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, insertResult) {
                if (!err) {
                    if (insertResult.affectedRows > 0) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Group Members added successfully';
                        responseMessage.data = {
                            groupId: groupId,
                            memberId: memberId,
                            relationType: relationType
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnAddGroupMembers: Group Members added successfully');
                    }
                    else {
                        responseMessage.message = 'Members already added';
                        res.status(200).json(responseMessage);
                        console.log('FnAddGroupMembers:Members already added');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnAddGroupMembers: error in adding GroupMembers :' + err);
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !'
            res.status(500).json(responseMessage);
            console.log('Error : FnAddGroupMembers ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetPendingRequest
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get Pending Request
 */
MessageBox.prototype.getPendingRequest = function(req,res,next){
    var _this = this;

    var token = req.query.token;

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetPendingRequest(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'PendingList loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetPendingRequest: PendingList loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'PendingList not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetPendingRequest:PendingList not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'PendingList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetPendingRequest:PendingList not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'PendingList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetPendingRequest:PendingList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetPendingRequest: error in getting OutBox Messages:' + err);
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
                        console.log('FnGetPendingRequest: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetPendingRequest:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetPendingRequest ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetGroupList
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get group list
 */
MessageBox.prototype.getGroupList = function(req,res,next){
    var _this = this;

    var token = req.query.token;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetGroupAndIndividuals(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'GroupList loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupList: GroupList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'GroupList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupList:GroupList not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'GroupList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetGroupList:GroupList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetGroupList: error in getting GroupList:' + err);
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
                        console.log('FnGetGroupList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetGroupList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetGroupList ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLoadMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for load messages of group
 */
MessageBox.prototype.loadMessages = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var id = parseInt(req.query.id); // toId or groupid
    var groupType = parseInt(req.query.group_type);
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        count:'',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        error['id'] = 'Invalid id';
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
                        var queryParams =  st.db.escape(id) + ',' + st.db.escape(groupType)+ ',' + st.db.escape(token)
                            + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount);
                        var query = 'CALL pLoadMessagesofGroup(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (groupType == 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            responseMessage.count = getResult[1][0].count;
                                            responseMessage.data = {
                                                group_details: getResult[0],
                                                messages: getResult[1]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadMessages: Messages loaded successfully');
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadMessages: Messages loaded successfully');
                                        }
                                    }

                                    else {
                                        responseMessage.message = 'Messages not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnLoadMessages:Messages not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Messages not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLoadMessages:Messages not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLoadMessages: error in getting Messages:' + err);
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
                        console.log('FnLoadMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLoadMessages:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnLoadMessages ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnViewMessage
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for view messages
 */
MessageBox.prototype.viewMessage = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message
    var pageSize = req.query.page_size ? req.query.page_size : 100;
    var pageCount = req.query.page_count ? req.query.page_count : 0;


    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
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
                        var queryParams =  st.db.escape(tid) + ',' + st.db.escape(token)+ ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount);
                        var query = 'CALL pViewMessage(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage: Message loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage:Message not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewMessage:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewMessage:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewMessage: error in getting Messages:' + err);
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
                        console.log('FnViewMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetMessageAttachment
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for get message attachement
 */
MessageBox.prototype.getMessageAttachment = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message id

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
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
                        var queryParams =  st.db.escape(tid);
                        var query = 'CALL pGetMessageAttachment(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message attachement loaded successfully';
                                            responseMessage.data = getResult[0][0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetMessageAttachment: Message attachement loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message attachement not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetMessageAttachment:Message attachement not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message attachement not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetMessageAttachment:Message attachement not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message attachement not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetMessageAttachment:Message attachement not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetMessageAttachment: error in getting Message attachement:' + err);
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
                        console.log('FnGetMessageAttachment: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetMessageAttachment:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetMessageAttachment ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetGroupInfo
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param group_id <int>
 * @description api code for get group infromation
 */
MessageBox.prototype.getGroupInfo = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var groupId = parseInt(req.query.group_id); // tid of group
    var type =req.query.type;     //0=Group info,1=ezeone info,2=messageInfromation

    var responseMessage = {
        status: false,
        error: null,
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
                        var queryParams = st.db.escape(groupId)+','+st.db.escape(type);
                        var query = 'CALL pGetGroupInfn(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'GroupInfromation loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupInfo: GroupInfromation loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'GroupInfromation not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'GroupInfromation not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'GroupInfromation not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetGroupInfo:GroupInfromation not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetGroupInfo: error in getting GroupInfromation:' + err);
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
                        console.log('FnGetGroupInfo: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetGroupInfo:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetGroupInfo ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};
/**
 * @todo FnCountOfUnreadMessage
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get group list
 */
MessageBox.prototype.countOfUnreadMessage = function(req,res,next){
    var _this = this;

    var token = req.query.token;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

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
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pGetCountOfUnreadMessage(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Unread Count loaded successfully';
                                        responseMessage.data = getResult[0][0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnCountOfUnreadMessage: GroupList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Unread Count not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnCountOfUnreadMessage:Unread Count not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Unread Count not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnCountOfUnreadMessage:Unread Count not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCountOfUnreadMessage: error in getting Unread Count:' + err);
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
                        console.log('FnCountOfUnreadMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCountOfUnreadMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnCountOfUnreadMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnViewMessageNew
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int>
 * @description api code for view messages
 */
MessageBox.prototype.viewMessageNew = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = parseInt(req.query.tid); // tid of message

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
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
                        var queryParams =  st.db.escape(tid);
                        var query = 'CALL pViewMessagenew(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message loaded successfully';
                                            responseMessage.data = getResult[0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage: Message loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Message not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnViewMessage:Message not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewMessage:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewMessage:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewMessage: error in getting Messages:' + err);
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
                        console.log('FnViewMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewMessage:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = MessageBox;