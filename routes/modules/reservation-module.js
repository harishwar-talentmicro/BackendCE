/**
 *  @author Gowri shankar
 *  @since June 30,2015 02:42 PM IST
 *  @title Reservation module
 *  @description Handles save and get reservation transaction functions
 *
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

function Reservation(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.SaveReservTrans = function(req,res,next){
    /**
     * @todo FnSaveReservTransaction
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var moment = require('moment');
        var Token = req.body.Token ;
        var TID = req.body.TID;
        var contactinfo = req.body.contactinfo;
        var toEzeid = alterEzeoneId(req.body.toEzeid);
        var resourceid = req.body.resourceid;
        var res_datetime = new Date(req.body.res_datetime);
        var duration = req.body.duration;
        var status = req.body.status;
        var serviceid = req.body.serviceid ?  req.body.serviceid : '';
        var notes = req.body.notes;
        var messagetype = 2;
        var messageText,duration,verified;


        var ID=''
        if(serviceid){
            ID = serviceid + ',' + ID;
            serviceid =ID.slice(0,-1);
            console.log(serviceid);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!toEzeid){
            responseMessage.error['toEzeid'] = 'Invalid toEzeid';
            validateStatus *= false;
        }

        if(!resourceid){
            responseMessage.error['resourceid'] = 'Invalid Resourceid';
            validateStatus *= false;
        }
        if(!validateStatus){
            console.log('FnSaveReservTransaction  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource transaction ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {

                        var query = st.db.escape(TID) + ',' + st.db.escape(Token) + ',' + st.db.escape(contactinfo) + ',' + st.db.escape(toEzeid) + ',' + st.db.escape(resourceid) + ',' + st.db.escape(res_datetime) + ',' + st.db.escape(duration) + ',' + st.db.escape(status) + ',' + st.db.escape(serviceid) + ',' + st.db.escape(notes);

                        console.log('CALL pSaveResTrans(' + query + ')');

                        st.db.query('CALL pSaveResTrans(' + query + ')', function (err, insertResult) {
                            console.log(insertResult);

                            if (!err) {
                                if (insertResult) {

                                    console.log(insertResult[0]);
                                    if (!insertResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Resource Transaction details save successfully';
                                        responseMessage.data = {
                                            resourceid: req.body.resourceid,
                                            serviceid: serviceid
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveReservTransaction: Resource Transaction details save successfully');

                                        if (messagetype == 2) {
                                            fs.readFile("Reservation.html", "utf8", function (err, data) {
                                                var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where Token=' + st.db.escape(Token);
                                                st.db.query(query1, function (err, getResult) {
                                                    if (getResult[0].id == 1) {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }
                                                        //here passing date with 00:00:00 time for getting the reservation data that only date format is put like that
                                                        var date = moment(new Date(req.body.res_datetime)).format('YYYY-MM-DD 00:00:00.000');
                                                        st.db.query('CALL pGetResTrans(' + st.db.escape(resourceid) + ',' + st.db.escape(date) + ',' + st.db.escape(toEzeid) + ')', function (err, res_result) {
                                                            if (res_result) {
                                                                var i = res_result[0].length - 1;
                                                                console.log(res_result[0][i]);
                                                                messageText = res_result[0][i].service;
                                                                duration = res_result[0][i].duration;
                                                            }

                                                            else {
                                                                console.log('FnGetTransDetails::Error getting form get trans details');
                                                            }


                                                            data = data.replace("[IsVerified]", verified);
                                                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                            data = data.replace("[EZEID]", getResult[0].EZEID);
                                                            data = data.replace("[Message]", messageText);
                                                            data = data.replace("[Duration]", duration);
                                                            data = data.replace("[ActionDate]", res_datetime.toLocaleString());
                                                            var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                                                            st.db.query(mail_query, function (err, get_result) {
                                                                console.log(get_result);
                                                                if (get_result) {
                                                                    var mailOptions = {
                                                                        from: 'noreply@ezeone.com',
                                                                        to: get_result[0].EMailID,
                                                                        subject: 'Reservation Request from ' + toEzeid,
                                                                        html: data // html body
                                                                    };
                                                                    //console.log(mailOptions);
                                                                    var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(toEzeid);
                                                                    st.db.query(queryResult, function (err, result) {
                                                                        console.log(result);
                                                                        var post = {
                                                                            MessageType: messagetype,
                                                                            Priority: 3,
                                                                            ToMailID: mailOptions.to,
                                                                            Subject: mailOptions.subject,
                                                                            Body: mailOptions.html,
                                                                            SentbyMasterID: result[0].TID
                                                                        };

                                                                        var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                            // Neat!
                                                                            if (!err) {
                                                                                console.log('FnMessageMail: Reservation Mail saved Successfully....');
                                                                            }
                                                                            else {
                                                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                                                            }
                                                                        });
                                                                    });
                                                                }
                                                                else {
                                                                    console.log('FnSendMail:getting error from EmailID ');
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }
                                                        //here passing date with 00:00:00 time for getting the reservation data that only date format is put like that
                                                        var date = moment(new Date(req.body.res_datetime)).format('YYYY-MM-DD 00:00:00.000');
                                                        st.db.query('CALL pGetResTrans(' + st.db.escape(resourceid) + ',' + st.db.escape(date) + ',' + st.db.escape(toEzeid) + ')', function (err, res_result) {
                                                            if (res_result) {
                                                                var i = res_result[0].length - 1;
                                                                messageText = res_result[0][i].service;
                                                                duration = res_result[0][i].duration;
                                                            }

                                                            else {
                                                                console.log('FnGetTransDetails::Error getting form get trans details');
                                                            }
                                                            data = data.replace("[IsVerified]", verified);
                                                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                            data = data.replace("[EZEID]", getResult[0].EZEID);
                                                            data = data.replace("[Message]", messageText);
                                                            data = data.replace("[Duration]", duration);
                                                            data = data.replace("[ActionDate]", res_datetime.toLocaleString());
                                                            var mail_query = 'Select EZEID,ifnull(ReservationMailID," ") as MailID from tmaster where TID=' + getResult[0].TID;
                                                            console.log(mail_query);
                                                            st.db.query(mail_query, function (err, get_result) {

                                                                if (get_result) {
                                                                    var mailOptions = {
                                                                        from: 'noreply@ezeone.com',
                                                                        to: get_result[0].MailID,
                                                                        subject: 'Reservation Request from ' + toEzeid,
                                                                        html: data // html body
                                                                    };
                                                                    //console.log(mailOptions);
                                                                    var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(toEzeid);
                                                                    st.db.query(queryResult, function (err, result) {

                                                                        var post = {
                                                                            MessageType: Messagetype,
                                                                            Priority: 3,
                                                                            ToMailID: mailOptions.to,
                                                                            Subject: mailOptions.subject,
                                                                            Body: mailOptions.html,
                                                                            SentbyMasterID: result[0].TID
                                                                        };
                                                                        //console.log(post);
                                                                        var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                            // Neat!
                                                                            if (!err) {
                                                                                console.log('FnMessageMail: Mail saved Successfully....1');

                                                                            }
                                                                            else {
                                                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                                                            }
                                                                        });
                                                                    });
                                                                }
                                                                else {
                                                                    console.log('FnSendMail:getting error from EmailID ');
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            console.log('FnSaveReservMail::Message type is invalid');
                                        }
                                    }
                                    else {
                                        responseMessage.message = insertResult[0][0];
                                        responseMessage.error = {};
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveReservTransaction:No save Resource Transaction details');
                                    }
                                }
                                else {
                                    responseMessage.message = 'No save Resource Transaction details';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservTransaction:No save Resource Transaction details');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservTransaction: error in saving Resource Transaction details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservTransaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservTransaction:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservTransaction: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnSaveReservTransaction:error ' + ex.description);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.getReservTrans = function(req,res,next){
    /**
     * @todo FnGetReservTask
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var resourceid = req.query.resourceid;
        var date = new Date(req.query.date);
        var toEzeid = alterEzeoneId(req.query.toEzeid);

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (resourceid) {

            st.db.query('CALL pGetResTrans(' + st.db.escape(resourceid) + ',' + st.db.escape(date) + ',' + st.db.escape(toEzeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Reservation Task details Send successfully';
                            console.log('FnGetReservTask: Reservation Task details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Reservation Task details';
                            console.log('FnGetReservTask: No founded Reservation Task details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Reservation Task details';
                        console.log('FnGetReservTask: No founded Reservation Task details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Reservation Task details';
                    console.log('FnGetReservTask: error in getting Reservation Task details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!resourceid) {
                responseMessage.message = 'Invalid resourceid';
                responseMessage.error = {
                    resourceid : 'Invalid resourceid'
                };
                console.log('FnGetReservTask: resourceid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservTask:error ' + ex.description);
		var errorDate = new Date();
		console.log(errorDate.toTimeString() + ' ......... error ...........');

        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.getMapedServices = function(req,res,next){
    /**
     * @todo FnGetMapedServices
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = alterEzeoneId(req.query.ezeid);
        var resourceid = req.query.resourceid;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            st.db.query('CALL pgetMapedservices(' + st.db.escape(ezeid) + ',' + st.db.escape(resourceid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'service Maped details Send successfully';
                            console.log('FnGetMapedServices: service Maped details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded service Maped details';
                            console.log('FnGetMapedServices: No founded service Maped details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded service Maped details';
                        console.log('FnGetMapedServices: No founded service Maped details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting service Maped details';
                    console.log('FnGetMapedServices: error in getting service Maped details' + err);
                    res.status(500).json(responseMessage);
                }
            });

        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetMapedServices: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservTransaction:error ' + ex.description);
		var errorDate = new Date();
		console.log(errorDate.toTimeString() + ' ......... error ...........');

        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.getTransDetails = function(req,res,next){
    /**
     * @todo FnGetResTransDetails
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = req.query.TID;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (TID) {

            st.db.query('CALL pGetResTransDetails(' + st.db.escape(TID) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Reservation Trans details Send successfully';
                            console.log('FnGetResTransDetails: Reservation Trans details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Reservation Trans details';
                            console.log('FnGetResTransDetails: No founded Reservation Trans details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Reservation Trans details';
                        console.log('FnGetResTransDetails: No founded Reservation Trans details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Reservation Task details';
                    console.log('FnGetResTransDetails: error in getting Reservation Task details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!TID) {
                responseMessage.message = 'Invalid TID';
                responseMessage.error = {
                    resourceid : 'Invalid TID'
                };
                console.log('FnGetResTransDetails: TID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetResTransDetails:error ' + ex.description);
		var errorDate = new Date();
		console.log(errorDate.toTimeString() + ' ......... error ...........');

        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.changeReservStatus = function(req,res,next){
    /**
     * @todo FnChangeReservationStatus
     */
    var _this = this;
    var token = (req.body.Token && req.body.Token !== 2) ? req.body.Token : null;
    var tid = (req.body.tid && parseInt(req.body.tid) !== NaN) ? parseInt(req.body.tid) : null;
    var status = (req.body.status && parseInt(req.body.status) !== NaN) ? parseInt(req.body.status) : null;

    var responseMsg = {
        status : false,
        data : null,
        message : 'Please login to continue',
        error : {
            Token : 'Invalid Token'
        }
    };

    var validationFlag = true;
    if(!token){
        responseMsg.error['Token'] = 'Invalid Token';
        validationFlag *= false;
    }

    if(!tid){
        responseMsg.error['tid'] = 'Reservation Slot is empty';
        validationFlag *= false;
    }

    if(!status){
        responseMsg.error['status'] = 'Status cannot be empty';
        validationFlag *= false;
    }

    if(!validationFlag){
        res.status(401).json(responseMsg);
        return;
    }

    st.validateToken(token,function(err,tokenRes){
        if(err || (!tokenRes)){
            res.status(401).json(responseMsg);
            return;
        }
        else{
            var queryParam = st.db.escape(tid) + ',' + st.db.escape(status);
            st.db.query('CALL PUpdateResTransStatus(' + queryParam + ')', function (err, updateRes) {
                if(err){
                    responseMsg.message = 'An error occurred ! Please try again';
                    responseMsg.error['server'] = 'Internal Server Error';
                    res.status(400).json(responseMsg);
                    console.log('FnChangeReservationStatus: An error occurred ! Please try again');

                }
                else{
                    if(updateRes.affectedRows > 0){
                        responseMsg['status'] = true;
                        responseMsg['error'] = null;
                        responseMsg['message'] = 'Status changed successfully';
                        responseMsg['data'] = {
                            tid : tid,
                            status : status
                        };
                        res.status(200).json(responseMsg);
                        console.log('FnChangeReservationStatus: Status changed successfully');
                    }
                    else{
                        responseMsg['status'] = false;
                        responseMsg['error'] = {server : 'An error occurred'};
                        responseMsg['message'] = 'Unable to update ! Please try again';
                        responseMsg['data'] = {
                            tid : req.body.tid,
                            status : req.body.status
                        };
                        res.status(400).json(responseMsg);
                        console.log('FnChangeReservationStatus: Unable to update ! Please try again');
                    }


                }
            });
        }
    });
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.getworkinghoursList = function(req,res,next){
    /**
     * @todo FnGetworkinghoursList
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {

            st.db.query('CALL PGetworkinghoursList(' + st.db.escape(Token) + ')', function (err, GetResult) {
                console.log(GetResult)
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = ' Working hours list Send successfully';
                            console.log('FnGetworkinghoursList:Working hours list Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Working hours list';
                            console.log('FnGetworkinghoursList: No founded Working hours list');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Working hours list';
                        console.log('FnGetworkinghoursList: No founded Working hours list');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Working hours list';
                    console.log('FnGetworkinghoursList: error in getting Working hours list' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!Token) {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {
                    Token : 'Invalid Token'
                };
                console.log('FnGetworkinghoursList: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetworkinghoursList:error ' + ex.description);
		var errorDate = new Date();
		console.log(errorDate.toTimeString() + ' ......... error ...........');

        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Reservation.prototype.saveFeedback = function(req,res,next){
    /**
     * @todo FnSaveFeedback
     */
    var _this = this;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };


    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = alterEzeoneId(req.body.ezeid);
        var rating = req.body.rating;
        var comments = req.body.comments;
        var module = req.body.module;
        var trans_id = req.body.trans_id ? req.body.trans_id : 0;
        var resourceid = req.body.resourceid ? req.body.resourceid : 0;
        var toEzeid = alterEzeoneId(req.body.toEzeid) ? alterEzeoneId(req.body.toEzeid) : '';
        var type = req.body.type;


        var validateStatus = true;

        if (!ezeid) {
            responseMessage.error['ezeid'] = 'Invalid ezeid';
            validateStatus *= false;
        }

        if (!rating) {
            responseMessage.error['rating'] = 'Invalid rating';
            validateStatus *= false;
        }

        if (!module) {
            responseMessage.error['module'] = 'Invalid module';
            validateStatus *= false;
        }
        if (!type) {
            responseMessage.error['type'] = 'Invalid type';
            validateStatus *= false;
        }
        if (!validateStatus) {
            console.log('FnSaveFeedback  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save feedback ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (ezeid && rating && module) {

            var query = st.db.escape(ezeid) + ',' + st.db.escape(rating) + ',' + st.db.escape(comments)
                + ',' + st.db.escape(module) + ',' + st.db.escape(trans_id)+ ',' + st.db.escape(resourceid)
                + ',' + st.db.escape(toEzeid)  + ',' + st.db.escape(type);

            console.log('CALL psavefeedback(' + query + ')');

            st.db.query('CALL psavefeedback(' + query + ')', function (err, insertResult) {
                console.log(insertResult);

                if (!err) {
                    if (insertResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Feedback details save successfully';
                        responseMessage.data = {
                            ezeid : ezeid,
                            rating : rating,
                            comments : comments,
                            module : module,
                            trans_id : trans_id,
                            resourceid : resourceid,
                            toEzeid : toEzeid
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnSaveFeedback: Feedback details save successfully');

                    }
                    else {
                        responseMessage.message = 'No save Feedback details';
                        responseMessage.error = {};
                        res.status(400).json(responseMessage);
                        console.log('FnSaveFeedback:No save Feedback details');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {};
                    res.status(500).json(responseMessage);
                    console.log('FnSaveFeedback: error in saving Feedback details:' + err);
                }
            });
        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {Token: 'Invalid ezeid'};
                console.log('FnSaveFeedback: ezeid is mandatory field');
            }
            else if (!rating) {
                responseMessage.message = 'Invalid rating';
                responseMessage.error = {rating: 'Invalid rating'};
                console.log('FnSaveFeedback: rating is mandatory field');
            }
            else if (!module) {
                responseMessage.message = 'Invalid module';
                responseMessage.error = {module: 'Invalid module'};
                console.log('FnSaveFeedback: module is mandatory field');
            }
            res.status(401).json(responseMessage);
        }

    }

    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveFeedback:error ' + ex.description);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 *
 * @description Return image of a resource based on resource id (reservation resource)
 * @service-param resource_id* <integer> [Mandatory]
 * @service-param token* <string> [Mandatory]
 *
 */
Reservation.prototype.getResourcePicture = function(req,res,next){
    var _this = this;

    var resourceId = (parseInt(req.query.resource_id) !== NaN) ? parseInt(req.query.resource_id) : 0;

    var token = (req.query.token) ? req.query.token : null;

    var status = true;
    var error = {};

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    if(!resourceId){
        error['resource_id'] = 'Invalid resource';
        status *= false;
    }

    if(!token){
        error['token'] = 'Invalid token';
        status *= false;
    }

    if(!status){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try{
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = resourceId;
                        var query = 'CALL pGetResourcePic('+queryParams+')';
                        st.db.query(query,function(err,results){
                            if(err){
                                responseMessage.status = false;
                                responseMessage.message = 'An error occurred';
                                responseMessage.error = {
                                    server : 'Internal Server Error'
                                };
                                responseMessage.data = null;
                                res.status(400).json(responseMessage);
                            }
                            else{
                                var emptyResponse = {
                                    status : false,
                                    message : 'No image found',
                                    data : null,
                                    error : {
                                        resource_id : 'No image found'
                                    }
                                };
                                if(results){
                                    if(results[0]){
                                        if(results[0][0]){
                                            if(results[0][0].picture){
                                                res.status(200).json({
                                                    status: true,
                                                    message: 'Picture loaded successfully',
                                                    data: {
                                                        picture : results[0][0].picture,
                                                        resource_id : resourceId
                                                    },
                                                    error: null
                                                });
                                            }
                                            else{
                                                res.status(200).json(emptyResponse);
                                            }
                                        }
                                        else{
                                            res.status(200).json(emptyResponse);
                                        }
                                    }
                                    else{
                                        res.status(200).json(emptyResponse);
                                    }
                                }
                                else{
                                    res.status(200).json(emptyResponse);
                                }
                            }
                        });
                    }
                    else{
                        responseMessage.status = false;
                        responseMessage.message = 'Please login to continue';
                        responseMessage.error = {
                            token : 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                    }
                }
                else{
                    responseMessage.status = false;
                    responseMessage.message = 'An error occurred';
                    responseMessage.error = {
                        server : 'Internal Server Error'
                    };
                    responseMessage.data = null;
                    res.status(400).json(responseMessage);
                }
            });
        }

        catch(ex){
            responseMessage.error = {};
            responseMessage.message = 'An error occurred !'
            console.log('FnResourcePicture:error ' + ex.description);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }


};

module.exports = Reservation;