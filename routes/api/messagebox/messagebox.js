/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title messagebox module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var messageModule = require('../.././modules/message-notification-module.js');
var msgNotification = null;
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
var moment = require('moment');
/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get message contact details
 */
router.get('/search', function(req,res,next){
    var ezeTerm = req.query.title;
    var title = null;
    var pin = null;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    if(!ezeTerm){
        error['ezeoneid'] = 'EZEOne ID not found';
        validationFlag *= false;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var ezeArr = ezeTerm.split('.');
                        title = ezeArr;
                        if (ezeArr.length > 1) {
                            title = ezeArr[0];


                            /**
                             * If user may have passed the pin
                             * and therefore validating pin using standard rules
                             */
                            if (!isNaN(parseInt(ezeArr[1])) && parseInt(ezeArr[1]) > 99 && parseInt(ezeArr[1]) < 1000) {
                                pin = parseInt(ezeArr[1]).toString();
                            }

                        }
                        var procParams = req.db.escape(title) + ',' + req.db.escape(pin) + ',' + req.db.escape(req.query.token);
                        var procQuery = 'CALL get_v1_messagebox_contact(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {

                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message contacts loaded successfully';
                                            responseMessage.data = results[0]
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message contacts not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message contacts not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message contacts not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : get_v1_messagebox_contact ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error get_v1_messagebox_contact : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get messagebox contacts
 */
router.get('/list_test', function(req,res,next){
    var ezeTerm = req.query.title;
    var title = null;
    var pin = null;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            var procParams = req.db.escape(req.query.token);
            var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contact list loaded successfully';
                                responseMessage.data = results[0]
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contact list not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Message contact list not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Message contact list not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pGetGroupAndIndividuals_new ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

router.get('/list', function(req,res,next){

    var token = req.query.token;
    var groupId;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        i_count:'',
        data: null
    };

    req.query.dateObjectFlag = (req.query.dateObjectFlag) ? 1 : 0;

    var getFormattedDate = function(date,flag){
        console.log('calling formatted date');
        var dMom = null;
        try{
            dMom = moment(date,"YYYY-MM-DD HH:mm:ss");
        }
        catch(ex){
            console.log(ex);
        }
        if(date && dMom && dMom.isValid()){
            var x = date;
            if(flag){
                return x;
            }
            x = dMom.toDate();
            return x;
        }
        return date;

    };


    var validateStatus = true;
    var error = {};

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
            req.st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = req.db.escape(token);
                        var query = 'CALL pGetGroupAndIndividuals_new(' + queryParams + ')';
                        console.log(query);
                        req.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            for(var i = 0; i < getResult[0].length; i++){
                                                getResult[0][i].CreatedDate = getFormattedDate(getResult[0][i].CreatedDate,req.query.dateObjectFlag);
                                                getResult[0][i].LUDate = getFormattedDate(getResult[0][i].LUDate,req.query.dateObjectFlag);
                                                getResult[0][i].date = getFormattedDate(getResult[0][i].date,req.query.dateObjectFlag);
                                            }
                                            var queryParams1 = req.db.escape(token);
                                            var query1 = 'CALL PGetUnreadMessageCountofGroup(' + queryParams1 + ')';
                                            console.log(query1);
                                            req.db.query(query1, function (err, get_result) {
                                                if (!err) {
                                                    if (get_result) {
                                                        if (get_result[0]) {
                                                            if (get_result[0].length > 0) {
                                                                for (var i = 0; i < getResult[0].length; i++) {
                                                                    groupId = getResult[0][i].GroupID;
                                                                    for (var j = 0; j < get_result[0].length; j++) {
                                                                        if (groupId == get_result[0][j].GroupID) {
                                                                            getResult[0][i].unreadcount = get_result[0][j].count;
                                                                            getResult[0][i].date = getFormattedDate(get_result[0][j].CreatedDate,req.query.dateObjectFlag);
                                                                            //res.status(200).json(responseMessage);
                                                                        }
                                                                    }
                                                                }
                                                                var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                                req.db.query(queryCount, function (err, invitationResult) {
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
                                                                var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                                req.db.query(queryCount, function (err, invitationResult) {
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
                                                            var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                            req.db.query(queryCount, function (err, invitationResult) {
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
                                                        var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                                        req.db.query(queryCount, function (err, invitationResult) {
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
                                            var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                            req.db.query(queryCount, function (err, invitationResult) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'GroupList loaded successfully';
                                                responseMessage.i_count = invitationResult[0].length;
                                                responseMessage.data = [];
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetGroupList: GroupList loaded successfully');
                                            });
                                        }
                                    }
                                    else {
                                        var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                        req.db.query(queryCount, function (err, invitationResult) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'GroupList loaded successfully';
                                            responseMessage.i_count = invitationResult[0].length;
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetGroupList: GroupList loaded successfully');
                                        });
                                    }
                                }
                                else {
                                    var queryCount = 'CALL pGetPendingRequest(' + req.db.escape(token) + ')';
                                    req.db.query(queryCount, function (err, invitationResult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'GroupList loaded successfully';
                                        responseMessage.i_count = invitationResult[0].length;
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetGroupList: GroupList loaded successfully');
                                    });
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
});


/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id
 *
 * @discription : API to change admin of group
 */
router.put('/change_admin', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.gid)) || (req.body.gid) < 0 ) {
        error.gid = 'Invalid group id';
        validationFlag *= false;
    }
    if (!req.body.ezeoneid) {
        error.ezeoneid = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    var ezeoneid = alterEzeoneId(req.body.ezeoneid);
                    if (tokenResult) {
                        var procParams = req.db.escape(ezeoneid)+ ',' + req.db.escape(req.body.gid);
                        var procQuery = 'CALL p_v1_changegroupadmin(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0][0] && results[0][0]._e) {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = results[0][0]._e;
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    var notificationTpl = 'change_admin';
                                    var notificationTemplaterRes = notificationTemplater.parse(notificationTpl,{
                                        oldAdminName : 'bhavya',
                                        newAdminName : 'vedha'
                                    });

                                    if(notificationTemplaterRes.parsedTpl){
                                        notification.publish(
                                            results[0],
                                            ezeoneId,
                                            ezeoneId,
                                            results[0],
                                            notificationTemplaterRes.parsedTpl,
                                            8,
                                            0, results.iphoneId,
                                            0,
                                            0,
                                            0,
                                            0,
                                            1,
                                            moment().format("YYYY-MM-DD HH:mm:ss"),
                                            '',
                                            0,
                                            jobID);
                                        console.log('postNotification : change admin notification sent successfully');
                                    }


                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Admin changed successfully';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : update_service_member_status ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error update_service_member_status : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get pending request of all members of group
 */
router.get('/pending_req', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.group_id))){
        error.group_id = 'Invalid group id';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = req.db.escape(req.query.group_id);
                        var procQuery = 'CALL p_v1_pending_requests(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Group pending requests loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Group pending requests not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Group pending requests not available';
                                        responseMessage.data = [];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Group pending requests not available';
                                    responseMessage.data = [];
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : p_v1_pending_requests ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_pending_requests : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id(here requester is member)
 *
 * @discription : API to change admin of group
 */
router.post('/add_member_to_group', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.relationType)) || (req.body.relationType) < 0 ) {
        error.relationType = 'Invalid relationType';
        validationFlag *= false;
    }
    if (!req.body.ezeoneId) {
        error.ezeoneId = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    var ezeoneid = alterEzeoneId(req.body.ezeoneId);
                    if (tokenResult) {
                        var procParams = req.db.escape(req.body.groupId)+ ',' + req.db.escape(ezeoneid)
                                        + ',' + req.db.escape(req.body.relationType);
                        var procQuery = 'CALL p_v1_addmemberstogroup(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0][0] && results[0][0].EZEOneId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Member added to group successfully';
                                    responseMessage.data = results[0][0];
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = results[0][0]._e;
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : p_v1_addmemberstogroup ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_addmemberstogroup : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id(here requester is group)
 *
 * @discription : API to change admin of group
 */
router.post('/add_member_by_group', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.groupId)) || (req.body.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.body.relationType)) || (req.body.relationType) < 0 ) {
        error.relationType = 'Invalid relationType';
        validationFlag *= false;
    }
    if (!req.body.ezeoneId) {
        error.ezeoneId = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    var ezeoneid = alterEzeoneId(req.body.ezeoneid);
                    if (tokenResult) {
                        var procParams = req.db.escape(req.body.groupId)+ ',' + req.db.escape(ezeoneid)
                            + ',' + req.db.escape(req.body.relationType);
                        var procQuery = 'CALL p_v1_addmembersbygroup(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0][0] && results[0][0].EZEOneId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Member added by group successfully';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = results[0][0]._e;
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : p_v1_addmembersbygroup ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_addmembersbygroup : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param groupId <int> is group id
 * @param tGrouptype <int> is group type
 * @param pageNo <int> is page no
 * @param limit <int> limit till that we will give results
 * @discription : API to change admin of group
 */
router.get('/load_message', function(req,res,next){
    var pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
    var limit = (req.query.limit) ? (req.query.limit):10;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.tGrouptype )) || (req.query.tGrouptype ) < 0 ) {
        error.tGrouptype  = 'Invalid relationType';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = req.db.escape(req.query.groupId) + ',' + req.db.escape(req.query.tGrouptype)
                            + ',' + req.db.escape(req.query.token)+ ',' + req.db.escape(pageNo)+ ',' + req.db.escape(limit);
                        var procQuery = 'CALL p_v1_LoadMessagesofGroup(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0].length>0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Messages of group loaded successfully';
                                    if(req.query.tGrouptype == 0) {
                                        responseMessage.count = results[2][0].count;
                                        responseMessage.data = {
                                            group_details: results[0],
                                            messages: results[1]
                                        };
                                    }
                                    else{
                                        responseMessage.count = results[1][0].count;
                                        responseMessage.data = {
                                            group_details: [],
                                            messages: results[0]
                                        };
                                    }

                                    //if(results[1].length > 0) {
                                    //    responseMessage.count = results[1][0].count;
                                    //}
                                    //else
                                    //{
                                    //    responseMessage.count=0;
                                    //}
                                    //if(req.query.tGrouptype = 0) {
                                    //    responseMessage.count = results[2];
                                    //    responseMessage.data = {
                                    //        group_details: results[0],
                                    //        messages: results[1]
                                    //    };
                                    //}
                                    //else{
                                    //    responseMessage.count=results[1];
                                    //    responseMessage.data = {
                                    //        group_details : [],
                                    //        messages: results[0]
                                    //
                                    //    };
                                    //
                                    //}
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Messages of group not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : p_v1_LoadMessagesofGroup ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

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
                        console.log('Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_LoadMessagesofGroup : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id(here requester is member)
 *
 * @discription : API to change admin of group
 */


var uploadDocumentToCloud = function(uniqueName,bufferData,callback){


    console.log('uploading to cloud...');
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
router.post('/compose_message', function(req,res,next){
    function FnBussinessChat(params, callback) {
        var newParam = params;
        var i= 0,id1='';
        if (params) {
            //console.log('coming business chat func..');
            //console.log(params.toids.length);
            var a = function(i) {
                console.log(i);
                if( i < params.toids.length) {
                    console.log(params.toids[i], "---------------------------------");
                    if (params.toids[i].charAt(0) == '@') {
                        pass(params.toids[i], function (err, output) {
                            if (output) {
                                if (id1 != '') {
                                    id1 += ',' + output;
                                }
                                else {
                                    id1 = output;
                                }

                                var queryString = 'call PSendMsgRequestbyPO(' + req.db.escape(params.toids[i]) + ',' + req.db.escape(output) + ',' + req.db.escape(params.memberVisible) + ')';
                                console.log(queryString);
                                req.db.query(queryString, function (err, results) {
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
                        var procParams = req.db.escape(newParam.ezeid) + ',' + req.db.escape(newParam.toids[i]) + ',' + req.db.escape(newParam.memberVisible);
                        console.log(procParams,"procParams");
                        var queryString1 = 'call PSendMsgRequestbyPO(' + procParams + ')';
                        console.log(queryString1);
                        req.db.query(queryString1, function (err, results) {
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
    var randomName;
    var id =[];
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
            console.log("toid",toID);
            req.st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        console.log(ezeid,"ezeone idssssss");
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

                            var queryParams = req.db.escape(message) + ',' + req.db.escape(randomName) + ',' + req.db.escape(attachmentFilename)
                                + ',' + req.db.escape(priority) + ',' + req.db.escape(targetDate) + ',' + req.db.escape(expiryDate)
                                + ',' + req.db.escape(token) + ',' + req.db.escape(previousMessageID) + ',' + req.db.escape(toID)
                                + ',' + req.db.escape(idType) + ',' + req.db.escape(mimeType) + ',' + req.db.escape(isJobseeker)
                                + ',' + req.db.escape(istask);
                            var query = 'CALL p_v1_ComposeMessage(' + queryParams + ')';

                            console.log(query);

                            req.db.query(query, function (err, insertResult) {
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

                                                        //msgNotification.sendComposeMessage(msgContent, function (err, statusResult) {
                                                        //    console.log(statusResult);
                                                        //    if (!err) {
                                                        //        if (statusResult) {
                                                        //            console.log('Message Notification send successfully');
                                                        //        }
                                                        //        else {
                                                        //            console.log('Message Notification not send');
                                                        //        }
                                                        //    }
                                                        //    else {
                                                        //        console.log('Error in sending message notification');
                                                        //    }
                                                        //});
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
});


/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id
 *
 * @discription : API to change admin of group
 */
router.put('/update_status', function(req,res,next){

    var token  = req.body.token;
    var groupId  = parseInt(req.body.group_id);   // groupid of receiver
    //var masterId  = req.body.master_id;
    var status  = parseInt(req.body.status);      // Status 0 : Pending, 1: Accepted, 2 : Rejected, 3 : Leaved, 4 : Removed
    var groupType = ((!isNaN(parseInt(req.body.groupType))) && (parseInt(req.body.groupType) > 0))
        ? parseInt(req.body.groupType) : 0;
    //var requester = (!isNaN(parseInt(req.body.requester))) ? parseInt(req.body.requester) : 2 ;

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
            req.st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = req.db.escape(groupId)+ ',' + req.db.escape(status)
                            + ','+ req.db.escape(groupType)+ ','+ req.db.escape(token);

                        var query = 'CALL p_v1_UpdateUserStatus(' + queryParams + ')';
                        console.log(query);
                        req.db.query(query, function (err, updateResult) {
                            if (!err) {
                                if (updateResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User status updated successfully';
                                    responseMessage.data = {
                                        group_id: req.body.group_id,
                                        //masterId: masterId,
                                        status: status,
                                        group_type : groupType,
                                        requester : requester

                                    };

                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus: User status updated successfully');

                                    // send push notification update status
                                    //var params = {
                                    //    token: token,
                                    //    groupId: groupId,
                                    //    masterId: masterId,
                                    //    status: status,
                                    //    group_type: deleteStatus,
                                    //    requester: requester
                                    //};
                                    //msgNotification.updateStatus(params,function(err,statusResult) {
                                    //    console.log(statusResult);
                                    //    if(!err) {
                                    //        if (statusResult) {
                                    //            console.log('UpdateStatus Notification send successfully');
                                    //        }
                                    //        else{
                                    //            console.log('UpdateStatus Notification not send');
                                    //        }
                                    //    }
                                    //    else{
                                    //        console.log('Error in sending UpdateStatus notification');
                                    //    }
                                    //});

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
});

module.exports = router;