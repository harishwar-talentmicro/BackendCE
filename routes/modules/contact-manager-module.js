/**
 * Created by Gowrishankar on 28-09-2015
 */

"use strict";

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};

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

function ContactManager(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * @todo FnGetClientList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @server_param
 *  1. token
 *  2. title
 * @description api code for get client list
 */
ContactManager.prototype.getClientList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var title = req.query.s ? req.query.s : '';   // title
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0
    var functionType = req.query.ft ? parseInt(req.query.ft) : 0;
    var responseMessage = {
        status: false,
        count : 0,
        data: [],
        message: '',
        error: {}
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }

    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(title)+ ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount)+ ',' + st.db.escape(functionType);
                        var query = 'CALL pGetClientList(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0][0]) {
                                            if (getResult[1]) {
                                                responseMessage.status = true;
                                                responseMessage.count = getResult[0][0].count;
                                                responseMessage.data = getResult[1];
                                                responseMessage.message = 'Client List loaded successfully';
                                                responseMessage.error = null;
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetClientList: Client List loaded successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'Client List loaded successfully';
                                                responseMessage.error = null;
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetClientList: Client List loaded successfully');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Client List loaded successfully';
                                            responseMessage.error = null;
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetClientList: Client List loaded successfully');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Client List loaded successfully';
                                        responseMessage.error = null;
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetClientList: Client List loaded successfully');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Client List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientList: Client List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetClientList: error in getting Client List :' + err);
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
                        console.log('FnGetClientList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetClientList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetClientList ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetClientContacts
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @server_param
 *  1. token
 *  2. cid   // client id
 * @description api code for get client contacts
 */
ContactManager.prototype.getClientContacts = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var cid = parseInt(req.query.cid);
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0

    var responseMessage = {
        status: false,
        count : 0,
        cid :'',
        cn:'',
        cc:'',
        page :'',
        data: [],
        message: '',
        error: {}
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!cid){
        error['cid'] = 'Invalid client id';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(cid)+ ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount);
                        var query = 'CALL pGetClientcontacts(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0][0]) {
                                            if (getResult[1]) {

                                                responseMessage.status = true;
                                                responseMessage.count = getResult[0][0].count;
                                                responseMessage.cid = getResult[0][0].cid;
                                                responseMessage.cn = getResult[0][0].cn;
                                                responseMessage.cc = getResult[0][0].cc;
                                                responseMessage.page = getResult[0][0].page;
                                                responseMessage.data = getResult[1];
                                                responseMessage.message = 'Contact List loaded successfully';
                                                responseMessage.error = null;
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetClientContacts: Contact List loaded successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'Contact List not loaded';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetClientContacts: Contact List not loaded');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Contact List not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetClientContacts: Contact List not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Contact List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetClientContacts: Contact List not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Contact List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientContacts: Contact List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetClientList: error in getting Client Contact :' + err);
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
                        console.log('FnGetClientContacts: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetClientContacts:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetClientContacts ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnSaveClient
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @server_param
 * token* <char(36)>
 * id*    <INT>           if id=0 for new else its id.
 * cc     <VARCHAR(15)>   client code
 * ct*    <VARCHAR(150)>  client title
 * cs*    <TINYINT>       client status (1-sales, 2-recruitment, 3-both)
 * @description save client
 */
ContactManager.prototype.saveClient = function(req,res,next) {
    var _this = this;

    var token = req.body.token;
    var id = parseInt(req.body.id);
    var clientCode = req.body.cc;          // client code
    var clientTitle = req.body.ct;        // client title
    var status = parseInt(req.body.cs);  // client status (1-sales, 2-recruitment, 3-both)


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        id = 0;
    }
    if(parseInt(id) == NaN){
        error['tid'] = 'Invalid id';
        validateStatus *= false;
    }
    if(!clientTitle){
        error['clientTitle'] = 'Invalid ct';
        validateStatus *= false;
    }
    if(!status){
        error['status'] = 'Invalid client status';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(id) + ',' + st.db.escape(clientCode)
                            + ',' + st.db.escape(clientTitle) + ',' + st.db.escape(status);

                        var query = 'CALL pSaveClient(' + queryParams + ')';

                        st.db.query(query, function (err, insertresult) {
                            //console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Client saved successfully';
                                    responseMessage.data = {
                                        id: insertresult[0][0] ? parseInt(insertresult[0][0].id) : 0,
                                        cc: req.body.cc,
                                        ct: req.body.ct,
                                        cs: parseInt(req.body.cs)
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveClient: Client saved successfully');
                                }
                                else {
                                    responseMessage.message = 'No save Client';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveClient:No save Client');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveClient: error in saving Client:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveClient: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveClient:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveClient:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnSaveClientContact
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @server_param
 * token* <CHAR(36)>
 * id*    <INT>            if id=0 for new else its id
 * fn     <VARCHAR(30)>    first name
 * ln     <VARCHAR(30)>    last name
 * jt     <VARCHAR(100)>   job title
 * mn     <VARCHAR(12)>    mobile number
 * em     <VARCHAR(150)>   email
 * ph     <VARCHAR(12)>    phone no
 * st*    <TINYINT>        status //(1-active, 2-deactive)
 * cid*   <INT>            client id
 * @description save client
 */
ContactManager.prototype.saveClientContact = function(req,res,next) {
    var _this = this;

    var token = req.body.token;
    var id = parseInt(req.body.id);
    var clientId = parseInt(req.body.cid);
    var firstName = req.body.fn;
    var lastName = req.body.ln;
    var mobile = req.body.mn;
    var email = req.body.em;
    var phone = req.body.ph;
    var jobTitle = req.body.jt;
    var status = parseInt(req.body.st);    //(1-active, 2-deactive)


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        id = 0;
    }
    if(parseInt(id) == NaN){
        error['tid'] = 'Invalid id';
        validateStatus *= false;
    }
    if(!clientId){
        error['clientId'] = 'Invalid cid';
        validateStatus *= false;
    }
    if(!status){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(id) + ',' + st.db.escape(clientId)
                            + ',' + st.db.escape(firstName) + ',' + st.db.escape(lastName)
                            + ',' + st.db.escape(mobile) + ',' + st.db.escape(email)
                            + ',' + st.db.escape(phone) + ',' + st.db.escape(jobTitle)
                            + ',' + st.db.escape(status);

                        var query = 'CALL pSaveClientcontact(' + queryParams + ')';

                        st.db.query(query, function (err, insertresult) {
                            //console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'ClientContct saved successfully';
                                    responseMessage.data = {
                                        id: insertresult[0][0] ? parseInt(insertresult[0][0].id) : 0,
                                        fn: req.body.fn,
                                        ln: req.body.ln,
                                        jt: req.body.jt,
                                        mn: req.body.mn,
                                        em: req.body.em,
                                        ph: req.body.ph,
                                        st: parseInt(req.body.st),
                                        cid: parseInt(req.body.cid)

                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveClientContact: ClientContct saved successfully');
                                }
                                else {
                                    responseMessage.message = 'No save ClientContct';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveClientContact:No save ClientContct');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveClientContact: error in saving ClientContct:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveClientContact: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveClientContact:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveClientContact:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};


module.exports = ContactManager;