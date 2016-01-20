/**
 *  @author Gowri shankar
 *  @since July 30,2015  03:54PM
 *  @title MessageBox module
 *  @description Handles MessageBox functions
 */


var gcloud = require('gcloud');
var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');

var appConfig = require('../../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});




var stream = require( "stream" );
var chalk = require( "chalk" );
var util = require( "util" );
// I turn the given source Buffer into a Readable stream.
function BufferStream( source ) {

    if ( ! Buffer.isBuffer( source ) ) {

        throw( new Error( "Source must be a buffer." ) );

    }

    // Super constructor.
    stream.Readable.call( this );

    this._source = source;

    // I keep track of which portion of the source buffer is currently being pushed
    // onto the internal stream buffer during read actions.
    this._offset = 0;
    this._length = source.length;

    // When the stream has ended, try to clean up the memory references.
    this.on( "end", this._destroy );

}

util.inherits( BufferStream, stream.Readable );


// I attempt to clean up variable references once the stream has been ended.
// --
// NOTE: I am not sure this is necessary. But, I'm trying to be more cognizant of memory
// usage since my Node.js apps will (eventually) never restart.
BufferStream.prototype._destroy = function() {

    this._source = null;
    this._offset = null;
    this._length = null;

};


// I read chunks from the source buffer into the underlying stream buffer.
// --
// NOTE: We can assume the size value will always be available since we are not
// altering the readable state options when initializing the Readable stream.
BufferStream.prototype._read = function( size ) {

    // If we haven't reached the end of the source buffer, push the next chunk onto
    // the internal stream buffer.
    if ( this._offset < this._length ) {

        this.push( this._source.slice( this._offset, ( this._offset + size ) ) );

        this._offset += size;

    }

    // If we've consumed the entire source buffer, close the readable stream.
    if ( this._offset >= this._length ) {

        this.push( null );

    }

};

"use strict";
var uuid = require('node-uuid');
var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

// attachment upload to cloud server
var uploadDocumentToCloud = function(uniqueName,bufferData,callback){

    console.log('uploading to cloud');
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    var bufferStream = new BufferStream(bufferData);
    bufferStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

};


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
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;


var st = null;
var messageModule = require('./message-notification-module.js');
var msgNotification = null;

function MessageBox(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
        msgNotification = new messageModule(db,stdLib);
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

    var token  = req.body.token;
    var groupName  = req.body.group_name;
    var groupType  = req.body.group_type;
    var aboutGroup  = req.body.about_group ? req.body.about_group : '';
    var autoJoin  = req.body.auto_join ? req.body.auto_join : 0;
    var tid = req.body.tid ? req.body.tid : 0;
    var restrictReply = req.body.rr;
    var memberVisible = req.body.member_visible ? parseInt(req.body.member_visible) : 0;
    var alumniCode = req.body.alumni_code ? alterEzeoneId(req.body.alumni_code) : '';

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
                            + ',' + st.db.escape(aboutGroup) + ',' + st.db.escape(autoJoin) + ',' + st.db.escape(tid)
                            + ',' + st.db.escape(restrictReply)+ ',' + st.db.escape(memberVisible)+ ',' + st.db.escape(alumniCode);
                        var query = 'CALL pCreateMessageGroup(' + queryParams + ')';
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if(insertResult) {
                                    if (insertResult[0]) {

                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Group created successfully';
                                        responseMessage.data = {
                                            id: (insertResult[0][0]) ? (insertResult[0][0].ID) : 0,
                                            token: req.body.token,
                                            groupName: req.body.group_name,
                                            groupType: req.body.group_type,
                                            aboutGroup: req.body.about_group,
                                            autoJoin: req.body.auto_join,
                                            tid: req.body.tid,
                                            rr: req.body.rr
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
            responseMessage.message = 'An error occurred !';
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

    var name = req.query.group_name;
    var token = req.query.token;
    var groupType = req.query.group_type ? req.query.group_type : 0;
    var ezeid,pin = null ;
    var ezeidArray;

    if(name) {
        ezeidArray = name.split('.');
    }

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
            if (ezeidArray.length > 2) {
                ezeid = ezeidArray[0];
                if (ezeidArray[2]) {
                    pin = ezeidArray[2];
                }
            }
            else if (ezeidArray.length > 1) {
                ezeid = ezeidArray[0];
                if (ezeidArray[1].charAt(0) == 'L' || ezeidArray[1].charAt(0) == 'l'){
                    pin = null;
                }
                else
                {
                    pin = ezeidArray[1];
                }
            }
            else
            {
                ezeid = name;
                pin = null;
            }
            var queryParams = st.db.escape(ezeid) + ',' + st.db.escape(token) + ',' + st.db.escape(groupType)
                + ',' + st.db.escape(pin);
            var query = 'CALL pValidateGroupName(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult) {
                        if (getResult[0]) {
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
            responseMessage.message = 'An error occurred !';
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
 * @method GET
 * @service-param token <varchar>
 * @service-param group_id <int>
 * @service-param ezeone_id  <int>
 */
MessageBox.prototype.validateGroupMember = function(req,res,next){

    var groupId = (parseInt(req.query.group_id) !== NaN && parseInt(req.query.group_id ) > 0) ? parseInt(req.query.group_id) : 0;
    var token = (req.query.token) ? req.query.token : null;
    var ezeoneId = (req.query.ezeone_id) ? alterEzeoneId(req.query.ezeone_id) : null;
    var ezeid,pin = null ;
    var ezeidArray;

    if(ezeoneId) {
        ezeidArray = ezeoneId.split('.');
    }


    var error  = {};
    var status = true;
    var respMsg = {
        status : false,
        message : 'Please check the errors below',
        error : { server : 'Internal Server Error'},
        data : null
    };

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
                        if (ezeidArray.length > 1) {
                            ezeid = ezeidArray[0];
                            pin = parseInt(ezeidArray[1]) ? parseInt(ezeidArray[1]) : ezeidArray[1];
                        }
                        else
                        {
                            ezeid = ezeoneId;
                            pin = null;
                        }
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(ezeid)+ ',' + st.db.escape(pin);
                        var query = 'CALL pValidateGroupMember('+queryParams+')';
                        //console.log(query);
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

    var token  = req.body.token;
    var groupId  = parseInt(req.body.group_id);   // groupid of receiver
    var masterId  = req.body.master_id;
    var status  = parseInt(req.body.status);      // Status 0 : Pending, 1: Accepted, 2 : Rejected, 3 : Leaved, 4 : Removed
    var deleteStatus = (parseInt(req.body.group_type) !== NaN && parseInt(req.body.group_type) > 0)
        ? parseInt(req.body.group_type) : 0;
    var requester = (!isNaN(parseInt(req.body.requester))) ? parseInt(req.body.requester) : 2 ;


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
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(masterId) + ',' + st.db.escape(status)
                            + ','+ st.db.escape(deleteStatus);

                        var query = 'CALL pUpdateUserStatus(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User status updated successfully';
                                    responseMessage.data = {
                                        group_id: req.body.group_id,
                                        masterId: masterId,
                                        status: status,
                                        group_type : deleteStatus,
                                        requester : requester

                                    };

                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus: User status updated successfully');

                                    // send push notification update status
                                    var details = {
                                        token: token,
                                        groupId: groupId,
                                        masterId: masterId,
                                        status: status,
                                        deleteStatus: deleteStatus,
                                        requester: requester
                                    };
                                    msgNotification.updateStatus(details,function(err,statusResult) {
                                        console.log(statusResult);
                                        if(!err) {
                                            if (statusResult) {
                                                console.log('UpdateStatus Notification send successfully');
                                            }
                                            else{
                                                console.log('UpdateStatus Notification not send');
                                            }
                                        }
                                        else{
                                            console.log('Error in sending UpdateStatus notification');
                                        }
                                    });

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
            responseMessage.message = 'An error occurred !';
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
            responseMessage.message = 'An error occurred !';
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
            responseMessage.message = 'An error occurred !';
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
    var masterid='',receiverId,toid=[],senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId,iphoneID;

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
                        //console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if(insertResult) {
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


                                        //send notification
                                        var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + userID;
                                        st.db.query(queryParameters, function (err, iosResult) {
                                            if (iosResult) {
                                                if (iosResult[0]) {
                                                    iphoneID = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                }
                                                else {
                                                    iphoneID = '';
                                                }
                                            }
                                            else {
                                                iphoneID = '';
                                            }
                                            //console.log(iphoneId);
                                            var query1 = 'select tid from tmgroups where GroupName=' + st.db.escape(groupName);
                                            st.db.query(query1, function (err, groupDetails) {
                                                if (groupDetails) {
                                                    if (groupDetails[0]) {
                                                        var query2 = 'select tid from tmgroups where GroupType=1 and adminID=' + userID;
                                                        st.db.query(query2, function (err, getDetails) {
                                                            if (getDetails) {
                                                                if (getDetails[0]) {
                                                                    receiverId = getDetails[0].tid;
                                                                    senderTitle = groupName;
                                                                    groupTitle = groupName;
                                                                    groupId = groupDetails[0].tid;
                                                                    messageText = 'has sent an invitation ';
                                                                    messageType = 3;
                                                                    operationType = 0;
                                                                    iphoneId = iphoneID;
                                                                    messageId = 0;
                                                                    masterid = '';
                                                                    var latitude = '', longitude = '', prioritys = '';
                                                                    var dateTime = '', a_name = '', msgUserid = '';
                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, dateTime, a_name, msgUserid);
                                                                }
                                                                else {
                                                                    console.log('FnSendMessageRequest:Error getting from requestDetails');
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSendMessageRequest:Error getting from requestDetails');
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnSendMessageRequest:Error getting from groupdetails');
                                                    }
                                                }
                                                else {
                                                    console.log('FnSendMessageRequest:Error getting from groupdetails');
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        responseMessage.message = 'Message Request not send';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendMessageRequest:Message Request not send');
                                    }
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
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSendMessageRequest ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

function pass(ezeid, callback){
    if(!ezeid){
        callbcak(null, null);
    }
    try{
        console.log('coming pass func..');
        st.db.query('CALL PGetMasterIDforEZEID(' + st.db.escape(ezeid) + ')', function (err, getResult) {
            if(!err) {
                if (getResult) {
                    if(getResult[0]) {
                        if(getResult[0][0]) {
                            var to = getResult[0][0].TID;
                            callback(null, to);
                        }
                        else{
                            callbcak(null, null);
                        }
                    }
                    else{
                        callbcak(null, null);
                    }
                }
                else{
                    callbcak(null, null);
                }
            }
        });
    }
    catch(ex){
        console.log(ex);
    }
}

function FnBussinessChat(params, callback) {

    var _this = this;
    var i= 0,id1='';
    if (params) {
        //console.log('coming business chat func..');
        //console.log(params.toids.length);
        var a = function(i) {
            console.log(i);
            if( i < params.toids.length) {
                if (params.toids[i].charAt(0) == '@') {
                    pass(params.toids[i], function (err, output) {
                        if (output) {
                            if (id1 != '') {
                                id1 += ',' + output;
                            }
                            else {
                                id1 = output;
                            }

                            var queryString = 'call PSendMsgRequestbyPO(' + st.db.escape(params.toids[i]) + ',' + st.db.escape(output) + ',' + st.db.escape(params.memberVisible) + ')';
                            console.log(queryString);
                            st.db.query(queryString, function (err, results) {
                                console.log('send message request by po');
                                i = i + 1;
                                a(i);
                            });
                        }
                        else
                        {console.log('tid not found');}
                    });

                }
                else {
                    console.log('coming else..');
                    if(id1!='')
                    {
                        id1+=','+ params.toids[i];

                    }
                    else{
                        id1 = params.toids[i];
                    }

                    var queryString1 = 'call PSendMsgRequestbyPO(' + st.db.escape(params.ezeid) + ',' + st.db.escape(params.toids[i]) + ',' + st.db.escape(params.memberVisible) + ')';
                    console.log(queryString1);
                    st.db.query(queryString1, function (err, results) {
                        console.log('send message request by po');
                        i = i + 1;
                        a(i);
                    });
                }
            }
            else
            {
                console.log('callback..');
                callback(null,id1);
            }
        };
    }

    if ( i < params.toids.length){
        console.log('function call..');
        a(i);

    }
};
var uploadDocumentToCloud = function(uniqueName,bufferData,callback){


    console.log('uploading to cloud...');
    var a_url, randomName, output;
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    var bufferStream = new BufferStream(bufferData);
    bufferStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

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
    var priority  = (parseInt(req.body.priority) !== NaN) ? req.body.priority : 1;
    var targetDate  = (req.body.target_date) ? (req.body.target_date) : '';
    var expiryDate  =  (req.body.expiry_date) ? (req.body.expiry_date) : '';
    var token = req.body.token;
    var previousMessageID = req.body.previous_messageID ? req.body.previous_messageID : 0;
    var toID = req.body.to_id;                              // comma separated id of toID
    var idType = req.body.id_type ? req.body.id_type : ''; // comma seperated values(0 - Group Message, 1 - Individual Message)
    var mimeType = (req.body.mime_type) ? req.body.mime_type : '';
    var isJobseeker = req.body.isJobseeker ? req.body.isJobseeker : 0;
    var toIds= 0;
    var isBussinessChat = req.body.isBussinessChat ? req.body.isBussinessChat : 0;
    var ezeid = alterEzeoneId(req.body.ezeid);
    var istask = req.body.istask ? req.body.istask : 0;
    var memberVisible = req.body.member_visible ? req.body.member_visible : 0;
    var randomName,a_url;

    if(idType){
        id = idType.split(",");
        //console.log(id.length);
        //console.log(id);
    }
    if(toID){
        toIds = toID.split(",");
        //console.log(toIds.length);
        //console.log(toIds);
    }

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

                        var bussinessChat = function() {
                            console.log('business..');
                            var params = {
                                toids : toIds,
                                ezeid : ezeid,
                                memberVisible : memberVisible
                            };

                            FnBussinessChat(params, function (err, outputResult) {
                                toID = outputResult;
                                //console.log('final-----');
                                console.log(toID);
                                if (toID) {
                                    compose();
                                }
                            });
                        };
                        var compose = function() {

                            if (req.body.attachment) {

                                var uniqueId = uuid.v4();
                                var filetype = (req.body.attachment_filename).split('.');
                                randomName = uniqueId + '.' + filetype[1];


                                var bufferData = new Buffer((req.body.attachment).replace(/^data:(image|'+mimeType+')\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');
                                console.log(bufferData);

                                uploadDocumentToCloud(randomName, bufferData, function (err) {
                                    if (!err) {
                                        console.log(randomName);
                                        composeMessage(randomName);
                                    }
                                    else {
                                        randomName = '';
                                        composeMessage(randomName);
                                    }
                                });
                            }
                            else {
                                randomName = '';
                                composeMessage(randomName);
                            }
                        };

                        var composeMessage = function(randomName) {

                            var queryParams = st.db.escape(message) + ',' + st.db.escape(randomName) + ',' + st.db.escape(attachmentFilename)
                                + ',' + st.db.escape(priority) + ',' + st.db.escape(targetDate) + ',' + st.db.escape(expiryDate)
                                + ',' + st.db.escape(token) + ',' + st.db.escape(previousMessageID) + ',' + st.db.escape(toID)
                                + ',' + st.db.escape(idType) + ',' + st.db.escape(mimeType) + ',' + st.db.escape(isJobseeker)
                                + ',' + st.db.escape(istask);
                            var query = 'CALL pComposeMessage(' + queryParams + ')';

                            console.log(query);

                            st.db.query(query, function (err, insertResult) {
                                console.log(insertResult);
                                if (!err) {
                                    if (insertResult) {
                                        if (insertResult[0]) {
                                            if (insertResult[0][0]) {
                                                if (insertResult[0][0].messageids) {
                                                    if (insertResult[0][0].mesguserid) {

                                                        responseMessage.status = true;
                                                        responseMessage.error = null;
                                                        responseMessage.message = 'Message Composed successfully';
                                                        responseMessage.data = {
                                                            message_id: insertResult[0][0].messageids,
                                                            message_userid: insertResult[0][0].mesguserid,
                                                            message: req.body.message,
                                                            attachmentFilename: req.body.attachment_filename,
                                                            priority: req.body.priority,
                                                            targetDate: req.body.target_date,
                                                            expiryDate: req.body.expiry_date,
                                                            token: req.body.token,
                                                            previousMessageID: req.body.previous_messageID,
                                                            toID: req.body.to_id,
                                                            idType: req.body.id_type,
                                                            s_url: (randomName) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName) : ''

                                                        };
                                                        res.status(200).json(responseMessage);

                                                        /**
                                                         * @todo add code for push notification like this
                                                         */
                                                        var msgContent = {
                                                            message_id: insertResult[0][0].messageids,
                                                            message_userid: insertResult[0][0].mesguserid,
                                                            message: req.body.message ? req.body.message : '',
                                                            attachment: (randomName) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName) : '',
                                                            attachmentFilename: req.body.attachment_filename ? req.body.attachment_filename : '',
                                                            token: req.body.token,
                                                            toID: req.body.to_id,
                                                            idType: req.body.id_type ? req.body.id_type : '',
                                                            priority: (parseInt(req.body.priority) !== NaN) ? req.body.priority : 1,
                                                            mimeType: (req.body.mime_type) ? req.body.mime_type : '',
                                                            ezeid: alterEzeoneId(req.body.ezeid)
                                                        };

                                                        msgNotification.sendNotification(msgContent, function (err, statusResult) {
                                                            console.log(statusResult);
                                                            if (!err) {
                                                                if (statusResult) {
                                                                    console.log('Message Notification send successfully');
                                                                }
                                                                else {
                                                                    console.log('Message Notification not send');
                                                                }
                                                            }
                                                            else {
                                                                console.log('Error in sending message notification');
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        responseMessage.message = 'Message not Composed';
                                                        res.status(200).json(responseMessage);
                                                        console.log('FnComposeMessage:Message not Composed');
                                                    }
                                                }
                                                else {
                                                    responseMessage.message = 'Message not Composed';
                                                    res.status(200).json(responseMessage);
                                                    console.log('FnComposeMessage:Message not Composed');
                                                }
                                            }
                                            else {
                                                responseMessage.message = 'Message not Composed';
                                                res.status(200).json(responseMessage);
                                                console.log('FnComposeMessage:Message not Composed');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Message not Composed';
                                            res.status(200).json(responseMessage);
                                            console.log('FnComposeMessage:Message not Composed');
                                        }
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
                        };

                        if (isBussinessChat == 1 || memberVisible == 1) {
                            bussinessChat();
                        }
                        else
                        {
                            compose();
                        }

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
            responseMessage.message = 'An error occurred !';
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

    var groupId = req.query.group_id;

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
            var queryParams = st.db.escape(groupId);
            var query = 'CALL pGetMembersList(' + queryParams + ')';
            st.db.query(query, function (err, getResult) {
                console.log(getResult);
                if (!err) {
                    if (getResult) {
                        if(getResult[0]) {
                            if (getResult[0].length > 0) {
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
            responseMessage.message = 'An error occurred !';
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
    var trash = (req.query.trash) ? req.query.trash : 0; //if 0 normal msg ,if u want trash msg send 1 , Default is 0..
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
            responseMessage.message = 'An error occurred !';
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
    var isMessage = req.body.group_type ? req.body.group_type : 0;
    var isdeleteall=req.body.isdelete_allmsg ? req.body.isdelete_allmsg : 0;
    var toid=req.body.toid ? req.body.toid : 0;

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
                            + ',' + st.db.escape(isMessage)+ ',' + st.db.escape(isdeleteall)+ ',' + st.db.escape(toid);

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
            responseMessage.message = 'An error occurred !';
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
                                    if(getResult[0]) {
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

    var groupId = parseInt(req.body.group_id);
    var memberId  = req.body.member_id;
    var relationType  = req.body.relation_type;
    var requester = req.body.requester; // 1 for group, 2 for user
    var receiverId,senderTitle,groupTitle,gid,messageText,messageType,operationType,iosId;

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
            //console.log(query);
            st.db.query(query, function (err, insertResult) {
                if (!err) {
                    if(insertResult) {
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

                            //send notification

                            if (requester == 1) {
                                //console.log('group admin add to user');
                                var queryParams = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + memberId;
                                //console.log(queryParams);
                                st.db.query(queryParams, function (err, iosResult) {
                                    if (iosResult) {
                                        if(iosResult[0]) {
                                            iosId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                        }
                                        else{
                                            iosId = '';
                                        }
                                        //console.log(iphoneID);
                                        var queryParams1 = 'select tid,GroupName from tmgroups where GroupType=1 and adminID=' + memberId;
                                        //console.log(queryParams1);
                                        st.db.query(queryParams1, function (err, receiverDetails) {
                                            if (receiverDetails) {
                                                if (receiverDetails[0]) {
                                                    var queryParams2 = 'select GroupName from tmgroups where tid=' + groupId;
                                                    //console.log(queryParams2);
                                                    st.db.query(queryParams2, function (err, groupDetails) {
                                                        if (groupDetails) {
                                                            if (groupDetails[0]) {
                                                                receiverId = receiverDetails[0].tid;
                                                                senderTitle = groupDetails[0].GroupName;
                                                                groupTitle = groupDetails[0].GroupName;
                                                                gid = groupId;   // group id
                                                                messageText = 'has sent an invitation ';
                                                                messageType = 3;
                                                                operationType = 0;
                                                                var iphoneId = iosId;
                                                                var prioritys = '';
                                                                var messageId = 0;
                                                                var msgUserid = 0;
                                                                var masterid = 0;
                                                                var a_url = '';
                                                                var a_name = '';
                                                                var datetime = '';
                                                                var latitude = 0.00, longitude = 0.00, jobId = 0;
                                                                //console.log(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, datetime, a_name, msgUserid, jobId, a_url);

                                                            }
                                                            else {
                                                                console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnAddGroupMembers:Error getting from Receiverdetails');
                                                }
                                            }
                                            else {
                                                console.log('FnAddGroupMembers:Error getting from Receiverdetails');
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                //console.log('user join to group');

                                // don't send notification to public group admin

                                var query1 = 'select ezeid from tmaster where tid=' + st.db.escape(memberId);
                                st.db.query(query1, function (err, senderDetails) {
                                    if (senderDetails) {
                                        if (senderDetails[0]) {
                                            var query2 = 'select AdminID,GroupName from tmgroups where AutoJoin=0 and tid=' + st.db.escape(groupId);
                                            console.log(query2);
                                            st.db.query(query2, function (err, groupDetails) {
                                                if (groupDetails) {
                                                    if (groupDetails[0]) {
                                                        var query3 = 'select tid,GroupName from tmgroups where GroupType=1 and adminID=' + groupDetails[0].AdminID;
                                                        console.log(query3);
                                                        st.db.query(query3, function (err, receiverDetails) {
                                                            if (receiverDetails) {
                                                                if (receiverDetails[0]) {
                                                                    var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where tid=' + groupDetails[0].AdminID;
                                                                    console.log(queryParameters);
                                                                    st.db.query(queryParameters, function (err, iosResult) {
                                                                        if (iosResult) {
                                                                            if(iosResult[0]) {
                                                                                iosId = iosResult[0].iphoneID ? iosResult[0].iphoneID : '';
                                                                            }
                                                                            else{
                                                                                iosId='';
                                                                            }

                                                                            receiverId = receiverDetails[0].tid;
                                                                            senderTitle = senderDetails[0].ezeid;
                                                                            groupTitle = groupDetails[0].GroupName;
                                                                            gid = groupId;
                                                                            messageText = 'has sent a request';
                                                                            messageType = 3;
                                                                            operationType = 0;
                                                                            var iphoneId = iosId;
                                                                            var prioritys = '';
                                                                            var messageId = 0;
                                                                            var msgUserid = 0;
                                                                            var masterid = 0;
                                                                            var a_url = '';
                                                                            var a_name = '';
                                                                            var datetime = '';
                                                                            var latitude = 0.00, longitude = 0.00, jobId = 0;
                                                                            console.log(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, datetime, a_name, msgUserid, jobId, a_url);
                                                                            notification.publish(receiverId, senderTitle, groupTitle, gid, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude, prioritys, datetime, a_name, msgUserid, jobId, a_url);

                                                                        }
                                                                        else {
                                                                            console.log('FnAddGroupMembers:Error getting from iosId');
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    console.log('FnAddGroupMembers:Error getting from Admin Details');
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnAddGroupMembers:Error getting from Admin Details');
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnAddGroupMembers:No adminID : No send notification');
                                                    }
                                                }
                                                else {
                                                    console.log('FnAddGroupMembers:Error getting from groupdetails');
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnAddGroupMembers:Error getting from member details');
                                        }
                                    }
                                    else {
                                        console.log('FnAddGroupMembers:Error getting from member details');
                                    }
                                });
                            }
                        }
                        else {
                            responseMessage.message = 'Members already added';
                            res.status(200).json(responseMessage);
                            console.log('FnAddGroupMembers:Members already added');
                        }
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
            responseMessage.message = 'An error occurred !';
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
        data: []
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
    var groupId,count,date,arrayResult,arrayResult1,finalResult = [],invitation_count;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        i_count:'',
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
                        var query = 'CALL pGetGroupAndIndividuals(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            var queryParams1 = st.db.escape(token);
                                            var query1 = 'CALL PGetUnreadMessageCountofGroup(' + queryParams1 + ')';
                                            st.db.query(query1, function (err, get_result) {

                                                if (!err) {
                                                    if (get_result) {
                                                        if (get_result[0]) {
                                                            if (get_result[0].length > 0) {
                                                                for (var i = 0; i < getResult[0].length; i++) {
                                                                    groupId = getResult[0][i].GroupID;
                                                                    for (var j = 0; j < get_result[0].length; j++) {
                                                                        if (groupId == get_result[0][j].GroupID) {
                                                                            getResult[0][i].unreadcount = get_result[0][j].count;
                                                                            getResult[0][i].date = get_result[0][j].CreatedDate;
                                                                            //res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                }
                                                                var queryCount = 'CALL pGetPendingRequest(' + st.db.escape(token) + ')';
                                                                st.db.query(queryCount, function (err, invitationResult) {
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'GroupList loaded successfully';
                                                                    responseMessage.i_count = invitationResult[0].length;
                                                                    responseMessage.data = getResult[0];
                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnGetGroupList: GroupList loaded successfully');
                                                                });
                                                            }
                                                            else {
                                                                var queryCount = 'CALL pGetPendingRequest(' + st.db.escape(token) + ')';
                                                                st.db.query(queryCount, function (err, invitationResult) {
                                                                    responseMessage.status = true;
                                                                    responseMessage.error = null;
                                                                    responseMessage.message = 'GroupList loaded successfully';
                                                                    responseMessage.i_count = invitationResult[0].length;
                                                                    responseMessage.data = getResult[0];
                                                                    res.status(200).json(responseMessage);
                                                                    console.log('FnGetGroupList: GroupList loaded successfully');
                                                                });
                                                            }
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
    var pageSize = req.query.page_size ? req.query.page_size : 100;
    var pageCount = req.query.page_count ? req.query.page_count : 0;
    var istask = req.query.istask ? parseInt(req.query.istask) : 0;


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
                            + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(pageCount)+ ',' + st.db.escape(istask);
                        var query = 'CALL pLoadMessagesofGroup(' + queryParams + ')';
                        // console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {

                                        if (groupType == 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            for(var ct = 0; ct < getResult[1].length; ct++){
                                                getResult[1][ct].Attachment = (getResult[1][ct].Attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[1][ct].Attachment) :'';
                                            }
                                            responseMessage.data = {
                                                group_details: getResult[0],
                                                messages: getResult[1]
                                            };
                                            if(getResult[1].length > 0) {
                                                responseMessage.count = getResult[1][0].count;
                                            }
                                            else
                                            {
                                                responseMessage.count=0;
                                            }
                                            res.status(200).json(responseMessage);
                                            console.log('FnLoadMessages: Messages loaded successfully');
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Messages loaded successfully';
                                            if(getResult[0][0]) {
                                                responseMessage.count = getResult[0][0].count;
                                            }
                                            else{
                                                responseMessage.count=0;
                                            }
                                            //responseMessage.data = getResult[0];
                                            //console.log(getResult[0]);
                                            for(var ct = 0; ct < getResult[0].length; ct++){
                                                getResult[0][ct].Attachment = (getResult[0][ct].Attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][ct].Attachment) :'';
                                            }
                                            responseMessage.data = {
                                                group_details: [],
                                                messages: getResult[0]
                                            };
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
                        //console.log(query);
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
    var isMessageid = req.query.isMsgid ? parseInt(req.query.isMsgid) : 0;

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
                        var queryParams =  st.db.escape(tid)+ ',' + st.db.escape(isMessageid);
                        var query = 'CALL pGetMessageAttachment(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message attachement loaded successfully';
                                            getResult[0][0].Attachment = (getResult[0][0].Attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].Attachment) :'';
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
                        var queryParams = st.db.escape(groupId)+','+st.db.escape(type)+','+st.db.escape(token);
                        var query = 'CALL pGetGroupInfn(' + queryParams + ')';
                        //console.log(query);
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
                                    if(getResult[0]) {
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
                        //console.log(query);
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
 * @todo FnChangeGroupAdmin
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for change group admin
 */
MessageBox.prototype.changeGroupAdmin = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var groupId  = parseInt(req.body.gid);
    var masterid  = req.body.masterid; // masterid of new admin

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
    if(!masterid){
        error['masterid'] = 'Invalid masterid';
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
                        var queryParams = st.db.escape(groupId) + ',' + st.db.escape(masterid);

                        var query = 'CALL pchangeGroupAdmin(' + queryParams + ')';

                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            console.log(updateResult);
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group Admin Changed successfully';
                                    responseMessage.data = {
                                        groupId: req.body.gid,
                                        masterid : req.body.masterid
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeGroupAdmin: Group Admin Changed successfully');
                                }
                                else {
                                    responseMessage.message = 'Group Admin is not Changed';
                                    res.status(200).json(responseMessage);
                                    console.log('FnChangeGroupAdmin:Group Admin is not Changed');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnChangeGroupAdmin: error in changing groupadmin:' + err);
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
                        console.log('FnChangeGroupAdmin: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnChangeGroupAdmin:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnChangeGroupAdmin ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnUpdateTaskStatus
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for update task status
 */
MessageBox.prototype.updateTaskStatus = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var MessageId  = parseInt(req.body.id);
    var status  = req.body.status; //  0-Open, 1-Close [taskstatus]

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
    if(!MessageId){
        error['MessageId'] = 'Invalid MessageId';
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
                        var queryParams = st.db.escape(MessageId) + ',' + st.db.escape(status);

                        var query = 'CALL pupdatetaskstatus(' + queryParams + ')';

                        console.log(query);
                        st.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Task Status Updated successfully';
                                    responseMessage.data = {
                                        MessageId  : parseInt(req.body.id),
                                        status  : req.body.status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateTaskStatus: Task Status Updated successfully');
                                }
                                else {
                                    responseMessage.message = 'Task Status not Updated';
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateTaskStatus:Task Status not Updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateTaskStatus: error in changing TaskStatus:' + err);
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
                        console.log('FnUpdateTaskStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateTaskStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnUpdateTaskStatus ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetLastMsgOfGroup
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for get last message sof group
 */
MessageBox.prototype.getLastMsgOfGroup = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var msgId = parseInt(req.query.id);   // id of message
    var groupId = parseInt(req.query.gid);
    var groupType = req.query.group_type;


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
                        var queryParams =  st.db.escape(msgId) + ',' + st.db.escape(groupId)+ ',' + st.db.escape(groupType)
                            + ',' + st.db.escape(token);
                        var query = 'CALL pGetlatestmessagesofGroup(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            //console.log(getResult[0].length);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message loaded successfully';
                                        if(getResult[0].length > 0) {
                                            for (var i = 0; i < getResult[0].length; i++) {
                                                getResult[0][i].Attachment = (getResult[0][i].Attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][i].Attachment) : '';
                                            }
                                        }
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLastMsgOfGroup: Message loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Message not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetLastMsgOfGroup:Message not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Message not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetLastMsgOfGroup:Message not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetLastMsgOfGroup: error in getting Messages:' + err);
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
                        console.log('FnGetLastMsgOfGroup: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetLastMsgOfGroup:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetLastMsgOfGroup ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnForwardMessage
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for compose message
 */
MessageBox.prototype.forwardMessage = function(req,res,next){

    var _this = this;

    var token = req.body.token;
    var messageId  = req.body.msg_id;
    var toId = req.body.to_id;                              // comma separated id of toID
    var idType = req.body.id_type ? req.body.id_type : ''; // comma seperated values(0 - Group Message, 1 - Individual Message)
    var id,toIds;

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
    if(!toId){
        error['toId'] = 'Invalid toId';
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


                        var queryParams = st.db.escape(messageId) + ',' + st.db.escape(toId) + ',' + st.db.escape(idType);
                        var query = 'CALL pforwardmessage(' + queryParams + ')';

                        console.log(query);

                        st.db.query(query, function (err, insertResult) {
                            //console.log(insertResult);
                            if (!err) {
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'forwardMessage send successfully';
                                    responseMessage.data = {
                                        message_id: req.body.msg_id,
                                        toId: req.body.to_id,
                                        idType: req.body.id_type

                                    };
                                    res.status(200).json(responseMessage);

                                    /**
                                     * send notification of forward message
                                     */
                                    var msgContent = {
                                        token : req.body.token,
                                        message_id: req.body.msg_id,
                                        toId: req.body.to_id,
                                        idType: req.body.id_type
                                    };

                                    msgNotification.sendForwardNotification(msgContent, function (err, statusResult) {
                                        console.log(statusResult);
                                        if (!err) {
                                            if (statusResult) {
                                                console.log('Forward Message Notification send successfully');
                                            }
                                            else {
                                                console.log('Forward Message Notification not send');
                                            }
                                        }
                                        else {
                                            console.log('Error in sending forward message notification');
                                        }
                                    });
                                }
                                else {
                                    responseMessage.message = 'Message not send';
                                    res.status(200).json(responseMessage);
                                    console.log('FnForwardMessage:Message not send');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnForwardMessage: error in forwarding Message :' + err);
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
                        console.log('FnForwardMessage: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnForwardMessage:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnForwardMessage ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = MessageBox;
