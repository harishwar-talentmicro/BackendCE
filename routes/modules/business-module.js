/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title BusinessManager module
 *  @description Handles functions related to business manager
 *  1. Create Transaction (Sales,HomeDelivery,Service,Resume)
 *  2. Update Transactions (Sales,HomeDelivery,Service,Resume)
 *  3. Fetches item list for transactions
 *
 */
"use strict";

var util = require( "util" );
var fs = require("fs");
var validator = require('validator');

var st = null;
var mailModule = require('./mail-module.js');
var mail = null;

function BusinessManager(db,stdLib){

    if(stdLib){
        st = stdLib;
        mail = new mailModule(db,stdLib);
    }
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

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getApplicantTransaction = function(req,res,next){
    /**
     * @todo FnGetApplicantTransaction
     */

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var token = req.query.token;
    var page = (!isNaN(parseInt(req.query.page))) ?  parseInt(req.query.page): 1;
    var pageSize = (!isNaN(parseInt(req.query.ps))) ?  parseInt(req.query.ps): 10;
    var clientSort = (!isNaN(parseInt(req.query.cls))) ?  parseInt(req.query.cls) : 0;
    var clientQuery = (req.query.clq) ? (req.query.clq) : '';
    var contactSort = (!isNaN(parseInt(req.query.cts))) ?  parseInt(req.query.cts): 0;
    var contactQuery = req.query.ctq ? req.query.ctq : '';
    var jobId = (req.query.jid) ? (req.query.jid) : 0;
    var jobCodeSort = (!isNaN(parseInt(req.query.jcs))) ?  parseInt(req.query.jcs) : 0;
    var jobCodeQuery = (req.query.jcq) ? (req.query.jcq) : '';
    var jobTitleSort = (!isNaN(parseInt(req.query.jts))) ?  parseInt(req.query.jts): 0;
    var jobTitleQuery = (req.query.jtq) ? (req.query.jtq) : '';
    var status = (!isNaN(parseInt(req.query.sts))) ?  parseInt(req.query.sts): 0;
    var applicantSearch = (req.query.aps) ? (req.query.aps) : '';
    var folderSort = (!isNaN(parseInt(req.query.fs))) ?  parseInt(req.query.fs): 0;

    if(!pageSize){
        pageSize = 10;
    }

    var responseMessage = {
        status: false,
        error:{},
        message:'',
        total_count:0,
        data: []
    };
    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }

    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var ToPage = 10 * page;
                        var FromPage = ToPage - 10;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }
                        var parameters = st.db.escape(token) + ',' + st.db.escape(4)
                            + ',' + st.db.escape(FromPage) + ',' + st.db.escape(pageSize)+ ',' + st.db.escape(jobId)
                            + ',' + st.db.escape(clientSort) + ',' + st.db.escape(clientQuery)
                            + ',' + st.db.escape(contactSort) + ',' + st.db.escape(contactQuery) + ',' + st.db.escape(jobCodeSort)
                            + ',' + st.db.escape(jobCodeQuery)+ ',' + st.db.escape(jobTitleSort)+ ',' + st.db.escape(jobTitleQuery)
                            + ',' + st.db.escape(applicantSearch)+ ',' + st.db.escape(status)+ ',' + st.db.escape(folderSort);
                        console.log('CALL pGetMessagesNew(' + parameters + ')');
                        st.db.query('CALL pGetMessagesNew(' + parameters + ')', function (err, transResult) {
                            if (!err) {
                                if (transResult) {
                                    if (transResult[0]) {
                                        if (transResult[0][0]) {
                                            if (transResult[1]) {
                                                responseMessage.status = true;
                                                responseMessage.total_count = transResult[0][0].count;
                                                responseMessage.data = transResult[1];
                                                responseMessage.message = 'Transaction details Send successfully';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetTransaction: Transaction details Send successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'No Transaction details found';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetTransaction:No Transaction details found');
                                            }
                                        }

                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'No Transaction details found';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetTransaction:No Transaction details found');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'No Transaction details found';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetTransaction:No Transaction details found');
                                    }
                                }
                                else {
                                    responseMessage.message = 'No Transaction details found';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTransaction:No Transaction details found');
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Transaction details';
                                console.log('FnGetTransaction:Error getting from Transaction details:' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnGetTransaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetTransaction:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnGetTransaction:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getSalesTransaction = function(req,res,next){
    /**
     * FnGetSalesTransaction
     */

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var token = req.query.token;
    var page = (!isNaN(parseInt(req.query.page))) ?  parseInt(req.query.page): 1;
    var clientSort = (!isNaN(parseInt(req.query.cls))) ?  parseInt(req.query.cls) : 0;
    var clientQuery = (req.query.clq) ? (req.query.clq) : '';
    var contactSort = (!isNaN(parseInt(req.query.cts))) ?  parseInt(req.query.cts): 0;
    var contactQuery = (req.query.ctq) ? (req.query.ctq) : '';
    var ezeoneIdSort = (!isNaN(parseInt(req.query.ezes))) ?  parseInt(req.query.ezes) : 0;
    var ezeoneIdQuery = (req.query.ezeq) ? (req.query.ezeq) : '';
    var pageSize = (!isNaN(parseInt(req.query.ps))) ?  parseInt(req.query.ps): 10;

    if(!pageSize){
        pageSize = 10;
    }

    var responseMessage = {
        status: false,
        error:{},
        message:'',
        total_count:0,
        data: []
    };
    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }

    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var ToPage = 10 * page;
                        var FromPage = ToPage - 10;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        var parameters = st.db.escape(token) + ',' + st.db.escape(FromPage)
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(clientSort) + ',' + st.db.escape(clientQuery)
                            + ',' + st.db.escape(contactSort) + ',' + st.db.escape(contactQuery) + ',' + st.db.escape(ezeoneIdSort)
                            + ',' + st.db.escape(ezeoneIdQuery);
                        //console.log('CALL pGetSalesTransaction(' + parameters + ')');
                        st.db.query('CALL pGetSalesTransaction(' + parameters + ')', function (err, transResult) {
                            //console.log(transResult);
                            if (!err) {
                                if (transResult) {
                                    if (transResult[0]) {
                                        if (transResult[0][0]) {
                                            if (transResult[1]) {
                                                responseMessage.status = true;
                                                responseMessage.total_count = transResult[0][0].count;
                                                responseMessage.data = transResult[1];
                                                responseMessage.message = 'Transaction details Send successfully';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetSalesTransaction: Transaction details Send successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'No Transaction details found';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetSalesTransaction:No Transaction details found');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'No Transaction details found';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetSalesTransaction:No Transaction details found');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'No Transaction details found';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSalesTransaction:No Transaction details found');
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.message = 'No Transaction details found';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSalesTransaction:No Transaction details found');
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Transaction details';
                                console.log('FnGetSalesTransaction:Error getting from Transaction details:' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnGetSalesTransaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetSalesTransaction:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnGetSalesTransaction:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.saveSalesTransaction = function(req,res,next){
    /**
     * @todo FnSaveSalesTransaction
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = (req.body.TID) ? (parseInt(req.body.TID)) : 0;
        var MessageText = (req.body.MessageText) ? (req.body.MessageText) : '';
        var Status = req.body.Status;
        var Notes = (req.body.Notes) ? (req.body.Notes) : '';
        var LocID = req.body.LocID;
        var Country = (req.body.Country) ? (req.body.Country) : '';    //country short name
        var State = (req.body.State) ? (req.body.State) : '';         //admin level 1
        var City = (req.body.City) ? (req.body.City) : '';       //ADMIN level 2
        var Area = (req.body.Area) ? (req.body.Area) : '';       //admin level 3
        var FunctionType = req.body.FunctionType;
        var Latitude = (req.body.Latitude) ? (req.body.Latitude) : 0;
        var Longitude = (req.body.Longitude) ? (req.body.Longitude) : 0;
        var EZEID = (req.body.EZEID) ? (alterEzeoneId(req.body.EZEID)) : '';
        var FolderRuleID = parseInt(req.body.FolderRuleID);
        var Duration = req.body.Duration;
        var DurationScales = req.body.DurationScales;
        var ItemsList = req.body.ItemsList;
        if (ItemsList) {
            ItemsList = JSON.parse(ItemsList);
        }
        else {
            ItemsList = [];
        }
        var DeliveryAddress = (req.body.DeliveryAddress) ? (req.body.DeliveryAddress) : '';
        var ItemIDList = '';
        var ToEZEID = alterEzeoneId(req.body.ToEZEID);
        var item_list_type = (req.body.item_list_type) ? (req.body.item_list_type) : 0;
        var companyName = (req.body.companyName) ? (req.body.companyName) : '';
        var company_id = (req.body.company_id) ? (req.body.company_id) : 0;
        var attachment = (req.body.attachment) ? (req.body.attachment) : null;
        var proabilities = (req.body.proabilities) ? (req.body.proabilities) : 2;
        var attachment_name = (req.body.attachment_name) ? (req.body.attachment_name) : '';
        var mime_type = (req.body.mime_type) ? (req.body.mime_type) : '';
        var alarmDuration = (req.body.alarm_duration) ? (req.body.alarm_duration) : 0;
        var targetDate = (req.body.target_date) ? (req.body.target_date) : '';
        var amount = (req.body.amount) ? (req.body.amount) : 0;
        var instituteId = (req.body.institute_id) ? (req.body.institute_id) : 0;
        var jobId = (req.body.job_id) ? (req.body.job_id) : 0;
        var educationId = (req.body.education_id) ? (req.body.education_id) : 0;
        var specializationId = (req.body.specialization_id) ? (req.body.specialization_id) : 0;
        var salaryType = (req.body.salary_type) ? (req.body.salary_type) : 3;
        var contactId = (req.body.ctid) ? (req.body.ctid) : 1;


        var respMsg = {
            status: false,
            message: '',
            error: {},
            data: []

        };

        if (isNaN(TID)) {
            TID = 0;
        }

        if (TID != 0) {
            for (var i = 0; i < ItemsList.length; i++) {
                if (ItemsList[i].TID != 0)
                    ItemIDList = ItemsList[i].TID + ',' + ItemIDList;
            }
            ItemIDList = ItemIDList.slice(0, -1);
            console.log('TID comma Values:' + ItemIDList);
        }
        if (isNaN(FolderRuleID)) {
            FolderRuleID = 0;
        }

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = st.db.escape(Token) + "," + st.db.escape(FunctionType) + "," + st.db.escape(MessageText)
                            + "," + st.db.escape(Status)+ "," + st.db.escape(Notes)
                            + "," + st.db.escape(LocID) + "," + st.db.escape(Country) + "," + st.db.escape(State)
                            + "," + st.db.escape(City) + "," + st.db.escape(Area) + "," + st.db.escape(Latitude)
                            + "," + st.db.escape(Longitude) + "," + st.db.escape(EZEID)
                            + "," + st.db.escape(FolderRuleID) + "," + st.db.escape(Duration) + "," + st.db.escape(DurationScales)
                            + "," + st.db.escape(TID)+ "," + st.db.escape(((ItemIDList != "") ? ItemIDList : ""))
                            + "," + st.db.escape(DeliveryAddress)+ "," + st.db.escape(ToEZEID) + "," + st.db.escape(item_list_type)
                            + "," + st.db.escape(companyName)+ "," + st.db.escape(company_id) + "," + st.db.escape(attachment)
                            + "," + st.db.escape(proabilities)+ "," + st.db.escape(attachment_name) + "," + st.db.escape(mime_type)
                            + "," + st.db.escape(alarmDuration)+ "," + st.db.escape(targetDate) + "," + st.db.escape(amount)
                            + ', ' + st.db.escape(instituteId) + ', ' + st.db.escape(jobId) + ', ' + st.db.escape(educationId)
                            + ', ' + st.db.escape(specializationId)
                            + ', ' + st.db.escape(salaryType) + ', ' + st.db.escape(contactId);
                        //console.log(company_id);
                        //console.log('CALL psendsalesrequest(' + query + ')');

                       var saveTransQuery ='CALL pSaveTrans(' + query + ')';
                        //console.log('CALL pSaveTrans(' + query + ')');
                        st.db.query(saveTransQuery, function (err, transResult) {
                            if (!err) {
                                if (transResult) {
                                    if (transResult[0]) {
                                        if (transResult[0].length > 0) {
                                            if (transResult[0][0]) {
                                                if (transResult[0][0]._e) {
                                                    respMsg.status = true;
                                                    respMsg.message = 'Transaction not saved';
                                                    if (TID == 0) {
                                                        respMsg.error = {
                                                            folder: 'You do not have permission to save into this folder'
                                                        };
                                                    }
                                                    else {
                                                        respMsg.error = {
                                                            folder: 'You do not have permission to update into this folder'
                                                        };
                                                    }
                                                    respMsg.data = {
                                                        TID: TID,
                                                        MessageText: MessageText,
                                                        Status: Status,
                                                        Notes: Notes,
                                                        LocID: LocID,
                                                        Country: Country,
                                                        State: State,
                                                        City: City,
                                                        Area: Area,
                                                        FunctionType: FunctionType,
                                                        Latitude: Latitude,
                                                        Longitude: Longitude,
                                                        EZEID: EZEID,
                                                        FolderRuleID: FolderRuleID,
                                                        Duration: Duration,
                                                        DurationScales: DurationScales,
                                                        DeliveryAddress: DeliveryAddress,
                                                        ToEZEID: ToEZEID,
                                                        item_list_type: item_list_type,
                                                        companyName: companyName,
                                                        company_id: company_id,
                                                        proabilities: proabilities,
                                                        attachment_name: attachment_name,
                                                        mime_type: mime_type,
                                                        alarmDuration: alarmDuration,
                                                        targetDate: targetDate,
                                                        amount: amount,
                                                        instituteId: instituteId,
                                                        jobId: jobId,
                                                        educationId: educationId,
                                                        specializationId: specializationId,
                                                        salaryType: salaryType,
                                                        contactId: contactId
                                                    };
                                                    res.status(403).json(respMsg);
                                                }
                                                else {
                                                    if (transResult[0][0]) {
                                                        respMsg.status = true;
                                                        respMsg.message = 'Transaction saved successfully';
                                                        respMsg.data = {
                                                            messageId: transResult[0][0].MessageID,
                                                            TID: TID,
                                                            MessageText: MessageText,
                                                            Status: Status,
                                                            Notes: Notes,
                                                            LocID: LocID,
                                                            Country: Country,
                                                            State: State,
                                                            City: City,
                                                            Area: Area,
                                                            FunctionType: FunctionType,
                                                            Latitude: Latitude,
                                                            Longitude: Longitude,
                                                            EZEID: EZEID,
                                                            FolderRuleID: FolderRuleID,
                                                            Duration: Duration,
                                                            DurationScales: DurationScales,
                                                            DeliveryAddress: DeliveryAddress,
                                                            ToEZEID: ToEZEID,
                                                            item_list_type: item_list_type,
                                                            companyName: companyName,
                                                            company_id: company_id,
                                                            proabilities: proabilities,
                                                            attachment_name: attachment_name,
                                                            mime_type: mime_type,
                                                            alarmDuration: alarmDuration,
                                                            targetDate: targetDate,
                                                            amount: amount,
                                                            instituteId: instituteId,
                                                            jobId: jobId,
                                                            educationId: educationId,
                                                            specializationId: specializationId,
                                                            salaryType: salaryType,
                                                            contactId: contactId
                                                        };


                                                        for (var i = 0; i < ItemsList.length; i++) {
                                                            var itemsDetails = ItemsList[i];
                                                            var items = {
                                                                MessageID: (transResult[0][0].MessageID) ? (transResult[0][0].MessageID) : 0,
                                                                ItemID: itemsDetails.ItemID,
                                                                Qty: itemsDetails.Qty,
                                                                Rate: itemsDetails.Rate,
                                                                Amount: itemsDetails.Amount,
                                                                Duration: itemsDetails.Durations
                                                            };
                                                            //console.log(items);
                                                            //console.log('TID:' + itemsDetails.TID);
                                                            if (itemsDetails.TID == 0) {
                                                                var query = st.db.query('INSERT INTO titems SET ?', items, function (err, result) {
                                                                    // Neat!
                                                                    if (!err) {
                                                                        if (result) {
                                                                            if (result.affectedRows > 0) {
                                                                                console.log('FnSaveFolderRules: Folder rules saved successfully');
                                                                            }
                                                                            else {
                                                                                console.log('FnSaveFolderRules: Folder rule not saved');
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log('FnSaveFolderRules: Folder rule not saved');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                                    }
                                                                });

                                                            }

                                                            else {
                                                                var items = {

                                                                    ItemID: itemsDetails.ItemID,
                                                                    Qty: itemsDetails.Qty,
                                                                    Rate: itemsDetails.Rate,
                                                                    Amount: itemsDetails.Amount,
                                                                    Duration: itemsDetails.Durations
                                                                };
                                                                //console.log('TID:' + itemsDetails.TID);
                                                                var query = st.db.query("UPDATE titems set ? WHERE TID = ? ", [items, itemsDetails.TID], function (err, result) {
                                                                    // Neat!
                                                                   // console.log(result);
                                                                    if (!err) {
                                                                        if (result) {
                                                                            if (result.affectedRows > 0) {

                                                                                console.log('FnSaveFolderRules: Folder rules Updated successfully');
                                                                            }
                                                                            else {
                                                                                console.log('FnSaveFolderRules: Folder rule not updated');
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log('FnSaveFolderRules: Folder rule not updated')
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                        res.status(200).json(respMsg);

                                                        console.log('FnSaveTranscation: Transaction details save successfully');

                                                        var messageContent = {
                                                            token: req.body.Token,
                                                            LocId: LocID,
                                                            messageType: parseInt(req.body.FunctionType),
                                                            message: MessageText,
                                                            ezeid: EZEID,
                                                            toEzeid: ToEZEID
                                                        };

                                                        /*sending sales enquiry mail*/
                                                        mail.fnMessageMail(messageContent, function (err, statusResult) {
                                                            //console.log(statusResult);
                                                            if (!err) {
                                                                if (Result) {
                                                                    if (statusResult.status == true) {
                                                                        console.log('FnSendMail: Mail Sent Successfully');
                                                                        //res.send(RtnMessage);
                                                                    }
                                                                    else {
                                                                        console.log('FnSendMail: Mail not Sent...1');
                                                                        //res.send(RtnMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnSendMail: Mail not Sent..2');
                                                                    //res.send(RtnMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSendMail:Error in sending mails' + err);
                                                                //res.send(RtnMessage);
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                            else {
                                                respMsg.message = 'Transaction not save';
                                                res.status(200).json(respMsg);
                                                console.log('FnSaveTranscation:Transaction not save');
                                            }
                                        }
                                        else {
                                            respMsg.message = 'Transaction not save';
                                            res.status(200).json(respMsg);
                                            console.log('FnSaveTranscation:Transaction not save');
                                        }
                                    }
                                    else {
                                        respMsg.message = 'Transaction not save';
                                        res.status(200).json(respMsg);
                                        console.log('FnSaveTranscation:Transaction not save');
                                    }
                                }

                                else {
                                    respMsg.message = 'An error occured ! Please try again';
                                    respMsg.error = {
                                        server: 'Internal Server Error'
                                    };
                                    console.log('FnSaveTranscation: error in saving Transaction' + err);
                                }
                            }
                        });
                    }
                    else {
                        respMsg.message = 'Invalid token';
                        respMsg.error = {
                            token: 'invalid token'
                        };
                        respMsg.data = null;
                        res.status(401).json(respMsg);
                        console.log('FnSaveTranscation: Invalid token');
                    }
                }
                else {
                    respMsg.error = {
                        server: 'Internal server error'
                    };
                    respMsg.message = 'Error in validating Token';
                    res.status(500).json(respMsg);
                    console.log('FnSaveTranscation:Error in processing Token' + err);

                }
            });
        }
        else {
            if (!Token) {
                respMsg.message = 'Invalid token';
                respMsg.error = {
                    token: 'invalid token'
                };
                respMsg.data = null;
                res.status(401).json(respMsg);
                console.log('FnSaveTranscation: Invalid token');
            }
        }
    }
    catch (ex) {
        console.log('FnSaveTranscation:error ' + ex.description);
        console.log(ex);
        console.log(ex.line);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.sendSalesRequest = function(req,res,next){
    /**
     * @todo FnSendSalesRequest
     */

    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = (req.body.TID) ?  parseInt(req.body.TID) : 0;
        var MessageText = (req.body.MessageText) ? (req.body.MessageText) : '';
        var Status = req.body.Status;
        var Notes = (req.body.Notes) ? (req.body.Notes) : '';
        var LocID = req.body.LocID;
        var Country = (req.body.Country) ? (req.body.Country) : '';    //country short name
        var State = (req.body.State) ? (req.body.State) : '';         //admin level 1
        var City =  (req.body.City) ? (req.body.City) : '';       //ADMIN level 2
        var Area = (req.body.Area) ? (req.body.Area) : '';       //admin level 3
        var FunctionType = req.body.FunctionType;
        var Latitude = (req.body.Latitude) ? (req.body.Latitude) : 0;
        var Longitude = (req.body.Longitude) ? (req.body.Longitude) : 0;
        var EZEID = (req.body.EZEID) ? alterEzeoneId(req.body.EZEID) : '';
        var FolderRuleID = parseInt(req.body.FolderRuleID);
        var Duration = req.body.Duration;
        var DurationScales = req.body.DurationScales;
        var ItemsList = req.body.ItemsList;
        if(ItemsList){
            ItemsList = JSON.parse(ItemsList);
        }
        else
        {
            ItemsList = [];
        }

        var DeliveryAddress = (req.body.DeliveryAddress) ? (req.body.DeliveryAddress) : '';
        var ItemIDList='';
        var ToEZEID = alterEzeoneId(req.body.ToEZEID);
        var item_list_type = (req.body.item_list_type) ? (req.body.item_list_type) : 0;
        var companyName = (req.body.companyName) ? (req.body.companyName) : '' ;
        var company_id = (req.body.company_id) ? (req.body.company_id) : 0 ;
        var attachment = (req.body.attachment) ? (req.body.attachment) : null ;
        var proabilities = (req.body.proabilities) ? (req.body.proabilities) : 2;
        var attachment_name = (req.body.attachment_name) ? (req.body.attachment_name) : '' ;
        var mime_type = (req.body.mime_type) ? (req.body.mime_type) : '' ;
        var alarmDuration = (req.body.alarm_duration) ? (req.body.alarm_duration) : 0;
        var targetDate = (req.body.target_date) ? (req.body.target_date) : '';
        var amount = (req.body.amount) ? (req.body.amount) : 0;
        var instituteId = (req.body.institute_id) ? (req.body.institute_id) : 0;
        var jobId = (req.body.job_id) ? (req.body.job_id) : 0;
        var educationId = (req.body.education_id) ? (req.body.education_id) : 0;
        var specializationId = (req.body.specialization_id) ? (req.body.specialization_id) : 0;
        var salaryType = (req.body.salary_type) ? (req.body.salary_type) : 3;
        var contactId = (req.body.ctid) ? (req.body.ctid) : 0;
        var proRef = (req.body.pro_ref) ? (req.body.pro_ref) : '';
        var proDate = (req.body.pro_date) ? (req.body.pro_date) : '';
        var proAmount = (req.body.pro_amount) ? (req.body.pro_amount) : 0;
        var proDoc = (req.body.pro_doc) ? (req.body.pro_doc) : '';
        var ve  = (req.body.ve ) ? (req.body.ve ) : '';
        var vcn  = (req.body.vcn) ? (req.body.vcn) : '';
        var rtnMessage = {
            IsSuccessfull: false,
            MessageID:0
        };

        if(isNaN(TID)) {
            TID = 0;
        }

        if(TID != 0){
            for(var i=0; i < ItemsList.length; i++) {
                if(ItemsList[i].TID != 0 )
                    ItemIDList = ItemsList[i].TID + ',' + ItemIDList  ;
            }
            console.log(ItemIDList);
            ItemIDList=ItemIDList.slice(0,-1);
            console.log('TID comma Values:'+ ItemIDList);
        }
        if(isNaN(FolderRuleID)) {
            FolderRuleID = 0;
        }

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = st.db.escape(Token) + "," + st.db.escape(FunctionType) + "," + st.db.escape(MessageText)
                            + "," + st.db.escape(Status) + "," + st.db.escape(Notes)
                            + "," + st.db.escape(LocID) + "," + st.db.escape(Country) + "," + st.db.escape(State)
                            + "," + st.db.escape(City) + "," + st.db.escape(Area) + "," + st.db.escape(Latitude)
                            + "," + st.db.escape(Longitude) + "," + st.db.escape(EZEID)
                            + "," + st.db.escape(FolderRuleID) + "," + st.db.escape(Duration) + "," + st.db.escape(DurationScales)
                            + "," + st.db.escape(TID)+ "," + st.db.escape(((ItemIDList != "") ? ItemIDList : ""))
                            + "," + st.db.escape(DeliveryAddress)+ "," + st.db.escape(ToEZEID) + "," + st.db.escape(item_list_type)
                            + "," + st.db.escape(companyName) + "," + st.db.escape(company_id) + "," + st.db.escape(attachment)+ ","
                            + st.db.escape(proabilities)+ "," + st.db.escape(attachment_name)+ "," + st.db.escape(mime_type)
                            + "," + st.db.escape(alarmDuration) + "," + st.db.escape(targetDate)+ "," + st.db.escape(amount)
                            + ', ' + st.db.escape(instituteId)+', ' + st.db.escape(jobId) + ', ' + st.db.escape(educationId)
                            + ', ' + st.db.escape(specializationId)+ ', ' + st.db.escape(salaryType)+ ', ' + st.db.escape(contactId);
                        //console.log(company_id);
                        //console.log('CALL psendsalesrequest(' + query + ')');
                        var salesLeadQuery = 'CALL pSaveTrans(' + query + ')';
                        var procurementUpdateQuery = "";

                        if((!isNaN(parseInt(TID))) && parseInt(TID) && (!isNaN(parseInt(req.body.vendor_id))) && parseInt(req.body.vendor_id)){
                            var procurementParams = st.db.escape(Token)+ "," + st.db.escape(TID) + "," + st.db.escape(proRef)
                                + "," + st.db.escape(proDate) + "," + st.db.escape(proAmount ) + "," + st.db.escape(proDoc)+ "," +
                                st.db.escape(ve)+ "," + st.db.escape(vcn);

                            procurementUpdateQuery = "; CALL pupdate_Sales_proposaldetails("+procurementParams + ");";
                        }

                        var combinedQuery = salesLeadQuery + procurementUpdateQuery;
                        console.log(combinedQuery);
                        st.db.query(combinedQuery, function (err, transResult) {
                            if (!err) {
                                //console.log(transResult);
                                if (transResult) {
                                    if (transResult[0].length > 0) {
                                        if(transResult[2]){
                                                var proposal_message = 'proposal deadline is exceded so you can not update data';
                                        }

                                        var proposal_message='';
                                        rtnMessage.IsSuccessfull = true;
                                        rtnMessage.MessageID = (transResult[0][0].MessageID) ? (transResult[0][0].MessageID) : 0;
                                        rtnMessage.proposal_message = proposal_message;
                                        //console.log(proposal_message);
                                        //console.log(transResult,"2");
                                        for (var i = 0; i < ItemsList.length; i++) {
                                            var itemsDetails = ItemsList[i];
                                            var items = {
                                                MessageID: (transResult[0][0].MessageID) ? (transResult[0][0].MessageID) : 0,
                                                ItemID: itemsDetails.ItemID,
                                                Qty: itemsDetails.Qty,
                                                Rate: itemsDetails.Rate,
                                                Amount: itemsDetails.Amount,
                                                Duration: itemsDetails.Durations
                                            };
                                            //console.log(items);
                                            //console.log('TID:' + itemsDetails.TID);
                                            if (itemsDetails.TID == 0) {
                                                var query = st.db.query('INSERT INTO titems SET ?', items, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnSaveFolderRules: Folder rules saved successfully');
                                                            }
                                                            else {
                                                                console.log('FnSaveFolderRules: Folder rule not saved');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnSaveFolderRules: Folder rule not saved');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                    }
                                                });

                                            }

                                            else {
                                                var items = {

                                                    ItemID: itemsDetails.ItemID,
                                                    Qty: itemsDetails.Qty,
                                                    Rate: itemsDetails.Rate,
                                                    Amount: itemsDetails.Amount,
                                                    Duration: itemsDetails.Durations
                                                };
                                                //console.log('TID:' + itemsDetails.TID);
                                                var query = st.db.query("UPDATE titems set ? WHERE TID = ? ", [items, itemsDetails.TID], function (err, result) {
                                                    // Neat!
                                                    //console.log(result);
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {

                                                                console.log('FnSaveFolderRules: Folder rules Updated successfully');
                                                            }
                                                            else {
                                                                console.log('FnSaveFolderRules: Folder rule not updated');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnSaveFolderRules: Folder rule not updated')
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                    }
                                                });
                                            }
                                        }
                                        res.send(rtnMessage);
                                        console.log('FnSaveTranscation: Transaction details save successfully');

                                        var messageContent = {
                                            token : req.body.Token,
                                            LocId : LocID,
                                            messageType: parseInt(req.body.FunctionType),
                                            message: MessageText,
                                            ezeid : EZEID,
                                            toEzeid :ToEZEID
                                        };

                                        /*sending sales enquiry mail*/
                                        mail.fnMessageMail(messageContent, function (err, statusResult) {
                                            //console.log(statusResult);
                                            if (!err) {
                                                if (statusResult) {
                                                    if (statusResult.status == true) {
                                                        console.log('FnSendMail: Mail Sent Successfully');
                                                        //res.send(rtnMessage);
                                                    }
                                                    else {
                                                        console.log('FnSendMail: Mail not Sent...1');
                                                        //res.send(rtnMessage);
                                                    }
                                                }
                                                else {
                                                    console.log('FnSendMail: Mail not Sent..2');
                                                    //res.send(rtnMessage);
                                                }
                                            }
                                            else {
                                                console.log('FnSendMail:Error in sending mails' + err);
                                                //res.send(rtnMessage);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        console.log('FnSaveTranscation:No Save Transaction');
                                        res.send(rtnMessage);
                                    }
                                }

                                else {
                                    console.log('FnSaveTranscation:No Save Transaction');
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscation: error in saving Transaction' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }

                        });
                    }
                    else {
                        console.log('FnSaveTranscation: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }

                }
                else {
                    console.log('FnSaveTranscation:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnSaveTranscation: Token is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveTranscation:error ' + ex.description);
        console.log(ex);
        console.log(ex.line);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.updateTransaction = function(req,res,next){
    /**
     * @todo FnUpdateTransaction
     */

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var tid = (!isNaN(parseInt(req.body.TID))) ? parseInt(req.body.TID) : 0;
    var status = req.body.status;
    var token = req.body.Token;

    var responseMessage = {
        status: false,
        error:{},
        message:'',
        data: null
    };

    try {

        if (token) {
            var queryParams = st.db.escape(status) + ', ' + st.db.escape(tid) + ',' + st.db.escape(token);
            var query = 'CALL pUpdateTrans(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, updateResult) {
                if (!err) {
                    if (updateResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Transaction details update successfully';
                        responseMessage.data = {
                            TID: req.body.TID,
                            status: req.body.status
                        };

                        res.status(200).json(responseMessage);
                        console.log('FnUpdateTransaction: Transaction details update successfully');
                    }
                    else {
                        responseMessage.message = 'An error occured ! Please try again';
                        responseMessage.error = {};
                        res.status(400).json(responseMessage);
                        console.log('FnUpdateTransaction:No update transaction details');
                    }
                }
            });
        }
        else {
            responseMessage.message = 'Invalid Token';
            responseMessage.error = {Token: 'Invalid Token'};
            console.log('FnUpdateTransaction: Token is mandatory field');
            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnUpdateTransaction:error ' + ex.description);
        console.log(ex);
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
BusinessManager.prototype.getTransactionItems = function(req,res,next){
    /**
     * @todo FnGetTransactionItems
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var msgId = req.query.MessageID;

        if (token && msgId) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(msgId);
                        var query = 'CALL pGetTranscationItems(' + queryParams + ')';
                        st.db.query(query, function (err, itemlist) {
                            if (!err) {
                                if (itemlist) {
                                    if (itemlist[0]) {
                                        console.log('FnGetTranscationItems: transaction items details Send successfully');
                                        res.send(itemlist[0]);
                                    }
                                    else {
                                        console.log('FnGetTranscationItems:No transaction items details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTranscationItems:No transaction items details found');
                                    res.json(null);
                                }

                            }
                            else {
                                console.log('FnGetTranscationItems: error in getting transaction items details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTranscationItems: Invalid Token');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTranscationItems: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetTranscationItems: Token is empty');
            }
            else if (!msgId) {
                console.log('FnGetTranscationItems: MessageID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTranscationItems error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.saveTransactionItems = function(req,res,next){
    /**
     * @todo FnSaveTransactionItems
     */
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.Token;
        var msgId = req.body.MessageID;
        var itemId = req.body.ItemID;
        var qty = req.body.Qty;
        var rate = req.body.Rate;
        var amount = req.body.Amount;
        var duration = req.body.Duration;


        var rtnMessage = {
            IsSuccessfull: false
        };

        if (token && msgId && itemId && qty && rate && amount && duration){
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(msgId) + ',' + st.db.escape(itemId) + ',' + st.db.escape(qty) +
                            ',' + st.db.escape(rate) + ',' +st.db.escape(amount) + ',' +st.db.escape(duration);
                        var query = 'CALL pSaveTranscationItems(' + queryParams + ')';
                        st.db.query(query, function (err, itemResult) {
                            if (!err){
                                if(itemResult) {
                                    if (itemResult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnSaveTranscationItems: Transaction items details save successfully');
                                    }
                                    else {
                                        console.log('FnSaveTranscationItems:No Save Transaction items details');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveTranscationItems:No Save Transaction items details');
                                    res.send(rtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveTranscationItems: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnSaveTranscationItems:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });

        }

        else {
            if (!token) {
                console.log('FnSaveTranscationItems: Token is empty');
            }
            else if (!msgId) {
                console.log('FnSaveTranscationItems: MessageID is empty');
            }
            else if (!itemId) {
                console.log('FnSaveTranscationItems: ItemID is empty');
            }
            else if (!qty) {
                console.log('FnSaveTranscationItems: Qty is empty');
            }
            else if (!rate) {
                console.log('FnSaveTranscationItems: Rate is empty');
            }
            else if (!amount) {
                console.log('FnSaveTranscationItems: Amount is empty');
            }
            else if (!duration) {
                console.log('FnSaveTranscationItems: Duration is empty');
            }

            res.statusCode=400;
            res.send(rtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveTranscationItems:error ' + ex.description);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getOutboxTransactions = function(req,res,next){
    /**
     * @todo FnGetOutBoxMessages
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ps = req.query.pagesize;
        var pc = req.query.pagecount;
        var ft = req.query.functiontype;

        var responseMessage = {
            status: false,
            data: [],
            error:{},
            message:''
        };

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ps) + ',' + st.db.escape(pc) + ',' + st.db.escape(ft);
                        var query = 'CALL pGetOutboxMessages(' + queryParams + ')';
                        st.db.query(query, function (err, msgResult) {
                            if (!err) {
                                if (msgResult) {
                                    if (msgResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.data = msgResult[0] ;
                                        responseMessage.error = null;
                                        responseMessage.message = 'OutBoxMsg details Send successfully';
                                        console.log('FnGetOutboxMessages: OutBoxMsg details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded OutBoxMsg details';
                                        console.log('FnGetOutboxMessages: No founded OutBoxMsg details');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded OutBoxMsg details';
                                    console.log('FnGetOutboxMessages: No founded OutBoxMsg details');
                                    res.status(200).json(responseMessage);
                                }

                            }
                            else {
                                responseMessage.error = {};
                                responseMessage.message = 'Error in getting OutBoxMsg details';
                                console.log('FnGetOutboxMessages: error in getting OutBoxMsg details' + err);
                                res.status(500).json(responseMessage);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        res.status(401).json(responseMessage);
                        console.log('FnGetOutboxMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetOutboxMessages:Error in processing Token' + err);
                }
            });
        }
        else {
            if (!token) {
                responseMessage.message = 'Invalid token';
                responseMessage.error = {
                    token : 'Invalid token'
                };
                console.log('FnGetOutboxMessages: token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnGetOutboxMessages:error ' + ex.description);
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
BusinessManager.prototype.getTransAutoComplete = function(req,res,next){
    /**
     * @todo FnGetTransAutoComplete
     */

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var title = req.query.title;
    var type = req.query.type;

    var responseMessage = {
        status: false,
        data: [],
        error:{},
        message:''
    };
    try{
        if (title) {

            var queryParams = st.db.escape(title) + ',' + st.db.escape(type);
            var query = 'CALL PgetTransAutocomplete(' + queryParams + ')';
            st.db.query(query, function (err, transResult) {
                if (!err) {
                    if (transResult) {
                        if (transResult[0]) {
                            responseMessage.status = true;
                            responseMessage.data = transResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Transaction details Send successfully';
                            console.log('FnGetTransAutoComplete: Transaction details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.message = 'No founded Transaction details';
                            console.log('FnGetTransAutoComplete: No founded Transaction details');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.message = 'No founded Transaction details';
                        console.log('FnGetTransAutoComplete: No founded Transaction details');
                        res.json(responseMessage);
                    }

                }
                else {
                    responseMessage.message = 'Error in getting Transaction details';
                    console.log('FnGetTransAutoComplete: error in getting Transaction details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!title) {
                responseMessage.message = 'Invalid title';
                responseMessage.error = {
                    title : 'Invalid title'
                };
                console.log('FnGetTransAutoComplete: title is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnGetTransAutoComplete:error ' + ex.description);
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
BusinessManager.prototype.getItemListForEZEID = function(req,res,next){
    /**
     * @todo FnGetItemListForEZEID
     */
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = (req.query.Token) ? req.query.Token : null;
        var ft = req.query.FunctionType;
        var ezeid = req.query.EZEID;

        if (token && ezeid && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(ft)  + ',' + st.db.escape(ezeid);
                        var query = 'CALL pItemListforEZEID(' + queryParams + ')';
                        st.db.query(query, function (err, itemList) {
                            if (!err) {
                                if (itemList) {
                                    if (itemList[0]) {
                                        console.log('FnGetItemListForEZEID: Item list details Send successfully');
                                        res.send(itemList[0]);
                                    }
                                    else {
                                        console.log('FnGetItemListForEZEID:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetItemListForEZEID:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetItemListForEZEID: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetItemListForEZEID: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetItemListForEZEID: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetItemListForEZEID: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetItemListForEZEID: FunctionType is empty');
            }
            else if (!ezeid) {
                console.log('FnGetItemListForEZEID: EZEID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetItemListForEZEID error:' + ex.description);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.deleteTransaction = function(req,res,next){
    /**
     * @todo FnDeleteTransaction
     */
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var itemTid = req.query.ItemTID;

        var rtnMessage = {
            IsSuccessfull:false
        };
        if (token && itemTid){
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(itemTid);
                        var query = 'CALL pDeleteTransactionItems(' + queryParams + ')';
                        st.db.query(query, function (err, deleteResult) {
                            if (!err) {
                                if(deleteResult) {
                                    if (deleteResult.affectedRows > 0) {
                                        rtnMessage.IsSuccessfull = true;
                                        res.send(rtnMessage);
                                        console.log('FnDeleteTranscation: transaction items delete successfully');
                                    }
                                    else {
                                        console.log('FnDeleteTranscation:No delete transaction items');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnDeleteTranscation:No delete transaction items');
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteTranscation: error in deleting transaction items' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteTranscation: Invalid token');
                        res.statusCode = 401;
                        res.send(rtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteTranscation:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(rtnMessage);

                }
            });
        }
        else {
            if (!token) {
                console.log('FnDeleteTranscation: Token is empty');
            }
            else if (!itemTid) {
                console.log('FnDeleteTranscation: ItemTID is empty');
            }
            res.statusCode=400;
            res.send(rtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteTranscation:error ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.itemList = function(req,res,next){
    /**
     * @todo FnItemList
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft = req.query.FunctionType;

        if (token && ft) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
                        var query = 'CALL pItemList(' + queryParams + ')';

                        st.db.query(query, function (err, itemList) {
                            if (!err) {
                                if (itemList) {
                                    if (itemList[0]) {
                                        console.log('FnItemList: Item list details Send successfully');
                                        res.send(itemList[0]);
                                    }
                                    else {
                                        console.log('FnGetItemList:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetItemList:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetItemList: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetItemList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetItemList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetItemList: Token is empty');
            }
            else if (!ft) {
                console.log('FnGetItemList: FunctionType is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetItemList error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.itemDetails = function(req,res,next){
    /**
     * @todo FnItemDetails
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var tid = req.query.TID;

        if (token && tid) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(tid);
                        var query = 'CALL pItemDetails(' + queryParams + ')';
                        st.db.query(query, function (err, itemDetails) {
                            if (!err) {
                                if (itemDetails) {
                                    if (itemDetails[0]) {
                                        console.log('FnItemDetails: Item list details Send successfully');
                                        res.send(itemDetails[0]);
                                    }
                                    else {

                                        console.log('FnItemDetails:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnItemDetails:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnItemDetails: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnItemDetails: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnItemDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnItemDetails: Token is empty');
            }
            else if (!tid) {
                console.log('FnItemDetails: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnItemDetails error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getUserwiseFolderList = function(req,res,next){
    /**
     * @todo FnGetUserwiseFolderList
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var rf = req.query.RuleFunction;

        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(rf);
                        var query = 'CALL pGetUserWiseFolderList(' + queryParams  + ')';

                        st.db.query(query, function (err, folderList) {
                            if (!err) {
                                if (folderList) {
                                    if (folderList[0]) {
                                        console.log('FnGetUserwiseFolderList: Folder list details Send successfully');
                                        res.send(folderList[0]);
                                    }
                                    else {
                                        console.log('FnGetUserwiseFolderList:No Folder list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetUserwiseFolderList:No Folder list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetUserwiseFolderList: error in getting Folder list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetUserwiseFolderList: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetUserwiseFolderList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnGetUserwiseFolderList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetUserwiseFolderList error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnUpdateBussinessListing
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.updateBussinessList = function(req,res,next){

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.body.TokenNo;
        var categoryId = (!isNaN(parseInt(req.body.CategoryID))) ? parseInt(req.body.CategoryID) : 0;
        var keywords = req.body.Keywords;

        var rtnMessage = {
            IsUpdated: false
        };


        if (token && keywords) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(keywords) + ',' + st.db.escape(categoryId);
                        var query = 'CALL pUpdateBusinesslist(' + queryParams + ')';

                        st.db.query(query, function (err, businesslist) {
                            if (!err) {
                                if(businesslist) {
                                    if (businesslist.affectedRows > 0) {
                                        rtnMessage.IsUpdated = true;
                                        res.send(rtnMessage);
                                        console.log('FnUpdateBussinessListing: Bussiness listing update successfully');
                                    }
                                    else {
                                        console.log('FnUpdateBussinessListing: Bussiness listing is not avaiable');
                                        res.send(rtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnUpdateBussinessListing: Bussiness listing is not avaiable');
                                    res.send(rtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateBussinessListing: ' + err);
                                res.statusCode = 500;
                                res.send(rtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnUpdateBussinessListing: Invalid token');
                        res.send(rtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateBussinessListing: : ' + err);
                    res.send(rtnMessage);
                }
            });

        }
        else {
            if (!token) {
                console.log('FnUpdateBussinessListing: token is empty');
            }
            else if (!keywords) {
                console.log('FnUpdateMessageStatus: Keywords is empty');
            }
            res.statusCode = 400;
            res.send(rtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getCompanyDetails = function(req,res,next){
    /**
     * @todo FnGetCompanyDetails
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var token = req.query.Token;
        var ft =  req.query.functiontype;

        var responseMessage = {
            status: false,
            data: [],
            error:{},
            message:''
        };

        if (token) {
            var queryParams = st.db.escape(token) + ',' + st.db.escape(ft);
            var query = 'CALL pGetCompanyDetails(' + queryParams + ')';

            st.db.query(query, function (err, companyDetails) {
                if (!err) {
                    if (companyDetails) {
                        if (companyDetails[0]) {
                            responseMessage.status = true;
                            responseMessage.data = companyDetails[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Company details Send successfully';
                            console.log('FnGetCompanyDetails: Company details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.message = 'No founded Company details';
                            console.log('FnGetCompanyDetails: No founded Company details');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.message = 'No founded Company details';
                        console.log('FnGetCompanyDetails: No founded Company details');
                        res.json(responseMessage);
                    }

                }
                else {
                    responseMessage.message = 'Error in getting Company details';
                    console.log('FnGetCompanyDetails: error in getting Company details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!token) {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {
                    Token : 'Invalid Token'
                };
                console.log('FnGetCompanyDetails: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.message = 'An error occured !';
        console.log('FnGetCompanyDetails:error ' + ex.description);
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
BusinessManager.prototype.getEZEOneIDInfo = function(req,res,next){
    /**
     * @title FnGetEZEOneIDInfo
     * @service /ezeoneid
     * @server_param
     *  1. ezeoneid <string> eg. IND1.L1.123, SANDEEP
     *  2. token
     * @desc Same as FnGetSearchInformationNew except it has only includes
     * AddressLine1, AddressLine2, CityTitle, StateTitle, CountryTitle, Latitude, Longitude
     * @usage Used to load user address information based on EZEOne ID Code
     * @conditions Will load the result if no pin is there, else have to pass pin and location sequence as EZEONE.L2.123
     * @param req
     * @param res
     * @param next
     * @constructor
     */
    var ezeTerm = alterEzeoneId(req.query.ezeoneid);
    var token = req.query.token;
    var locationSeq = 0;
    var pin = null;
    var ezeoneId = null;

    var respMsg = {
        status : false,
        message : 'Please login to continue',
        data : null,
        error : null
    };

    var error = {};
    var validationFlag = true;
    if(!token){
        error['token'] = 'Invalid Token';
        validationFlag *= false;
    }
    if(!ezeTerm){
        error['ezeoneid'] = 'EZEOne ID not found';
        validationFlag *= false;
    }

    if(!validationFlag){
        respMsg.message = 'Please check all the errors';
        respMsg.error = error;
        res.status(400).json(respMsg);
        return;
    }
    else{
        try{
            st.validateToken(token,function(err,tokenResult){
                if(err){
                    respMsg.status = false;
                    respMsg.data = null;
                    respMsg.message = 'Please check all the errors';
                    respMsg.error = {token : 'Invalid Token'};
                    res.status(401).json(respMsg);
                }
                else if(!tokenResult){
                    respMsg.status  = false;
                    respMsg.data = null;
                    respMsg.message = 'Please check all the errors';
                    respMsg.error = {token : 'Invalid Token'};
                    res.status(401).json(respMsg);
                }
                else{
                    var ezeArr = ezeTerm.split('.');
                    ezeoneId = ezeArr;
                    if(ezeArr.length > 1){
                        ezeoneId = ezeArr[0];

                        /**
                         * Try to find if user has passed the location sequence number
                         */
                        if(ezeArr[1] && ezeArr[1].substr(0,1).toUpperCase() === 'L'){
                            var seqNo = parseInt(ezeArr[1].substring(1));
                            if(!isNaN(seqNo) && seqNo > -1){
                                locationSeq = seqNo;
                            }
                        }

                        /**
                         * If location sequence number is not found assuming that user may have passed the pin
                         * and therefore validating pin using standard rules
                         */
                        else if(!isNaN(parseInt(ezeArr[1])) && parseInt(ezeArr[1]) > 99 && parseInt(ezeArr[1]) < 1000){
                            pin = parseInt(ezeArr[1]).toString();
                        }

                        /**
                         * If third element is also there in array then strictly assume it as a pin and then
                         * assign it to pin
                         */
                        else if(ezeArr.length > 2){
                            if(!isNaN(parseInt(ezeArr[2]))&& parseInt(ezeArr[2]) > 99 && parseInt(ezeArr[2]) < 1000){
                                pin = parseInt(ezeArr[2]).toString();
                            }
                        }
                    }

                    var moment = require('moment');
                    var dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
                    req.socket.remoteAddress || req.connection.socket.remoteAddress);

                    var queryParams = st.db.escape(token) + ',' + st.db.escape(dateTime) + ',' + st.db.escape(ip) +
                        ',' +st.db.escape(ezeoneId) + ',' + st.db.escape(locationSeq) + ',' + st.db.escape(pin);
                    st.db.query('CALL pSearchinfnPinbased('+queryParams+')',function(err,result){
                        if(err){
                            console.log('Error FnGetEZEOneIDInfo :  '+err);
                            respMsg.status  = false;
                            respMsg.data = null;
                            respMsg.message = 'An error occured';
                            respMsg.error = {server : 'Internal Server Error'};
                            res.status(400).json(respMsg);
                            return;
                        }


                        else{
                            if(result) {
                                if (result.length > 0) {
                                    if (result[0].length > 0) {
                                        respMsg.status = true;
                                        respMsg.data = result[0][0];
                                        respMsg.message = 'EZEOne ID found';
                                        respMsg.error = null;
                                        res.status(200).json(respMsg);
                                        return;
                                    }
                                    else {
                                        respMsg.status = false;
                                        respMsg.data = null;
                                        respMsg.message = 'Nothing found';
                                        respMsg.error = {ezeoneid: 'No results found'};
                                        res.status(404).json(respMsg);
                                    }

                                }
                                else{
                                    respMsg.status  = false;
                                    respMsg.data = null;
                                    respMsg.message = 'Nothing found';
                                    respMsg.error = { ezeoneid : 'No results found'};
                                    res.status(404).json(respMsg);
                                }
                            }
                            else{
                                respMsg.status  = false;
                                respMsg.data = null;
                                respMsg.message = 'Nothing found';
                                respMsg.error = { ezeoneid : 'No results found'};
                                res.status(404).json(respMsg);
                            }
                        }
                    });

                }
            });
        }
        catch(ex){
            console.log('Error : FnGetEZEOneIDInfo' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getTransAttachment = function(req,res,next){
    /**
     * @todo FnGetTransAttachment
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var tid = req.query.tid;
        var token = req.query.token;

        var responseMessage = {
            status: false,
            data: null,
            error: {},
            message: ''
        };

        var validateStatus = true;
        var error = {};

        if (!tid) {
            error['tid'] = 'Invalid tid';
            validateStatus *= false;
        }
        if (!token) {
            error['token'] = 'Invalid token';
            validateStatus *= false;
        }
        if (!validateStatus) {
            responseMessage.error = error;
            responseMessage.message = 'Unable to get transaction attachment ! Please check the errors';
            res.status(401).json(responseMessage);
        }

        else {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        st.db.query('CALL pGetTransAttachment(' + st.db.escape(tid) + ')', function (err, attachResult) {
                            if (!err) {
                                if (attachResult) {
                                    if (attachResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.data = attachResult[0];
                                        responseMessage.error = null;
                                        responseMessage.message = 'TransAttachment details Send successfully';
                                        console.log('FnGetTransAttachment: TransAttachment details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.message = 'No founded TransAttachment details';
                                        console.log('FnGetTransAttachment: No founded TransAttachment details');
                                        res.json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'No founded TransAttachment details';
                                    console.log('FnGetTransAttachment: No founded TransAttachment details');
                                    res.json(responseMessage);
                                }

                            }
                            else {
                                responseMessage.message = 'Error in getting TransAttachment details';
                                console.log('FnGetTransAttachment: error in getting TransAttachment details' + err);
                                res.status(500).json(responseMessage);
                            }
                        });
                    }

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        res.status(401).json(responseMessage);
                        console.log('FnSaveJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveJobs:Error in processing Token' + err);
                }
            });
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnGetTransAttachment:error ' + ex.description);
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
BusinessManager.prototype.salesStatistics = function(req,res,next){
    /**
     * @todo FnSalesStatistics
     */
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var from_date = req.query.from_date;
        var to_date = req.query.to_date;
        var stages = req.query.stages;
        var probabilities = (req.query.probabilities) ? (req.query.probabilities) : null;
        var user = req.query.user;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        var validateStatus = true;
        var error={};

        if (!stages) {
            error['stages'] = 'Invalid stages';
            validateStatus *= false;
        }
        if (!user) {
            error['user'] = 'Invalid user';
            validateStatus *= false;
        }
        if (!probabilities) {
            error['probabilities'] = 'Invalid probabilities';
            validateStatus *= false;
        }
        if (!validateStatus) {
            responseMessage.error = error;
            responseMessage.message = 'Unable to get Sales Statistics ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (stages && user && probabilities) {
            var query = st.db.escape(from_date) + ',' + st.db.escape(to_date) + ',' + st.db.escape(stages)
                + ',' + st.db.escape(probabilities)+ ',' + st.db.escape(user);
            st.db.query('CALL pTransactionfilter(' + query +')', function (err, transResult) {

                var total_count = 0;
                var total_qty = 0;
                if (!err) {
                    if (transResult) {
                        if (transResult[0]) {

                            for (var i = 0; i < transResult[0].length; i++)
                            {
                                total_count = total_count + transResult[0][i].amount;
                                total_qty = total_qty + transResult[0][i].qty;
                            }
                            responseMessage.status = true;
                            responseMessage.data = {
                                from_date :from_date,
                                to_date : to_date,
                                stages : stages,
                                probabilities : probabilities,
                                transactions : transResult[0],
                                total_amount :total_count,
                                total_items:total_qty,
                                funnel:transResult[1]
                            };
                            responseMessage.error = null;
                            responseMessage.message = 'Sales Statistics Send successfully';
                            console.log('FnSalesStatistics: Sales Statistics Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.error = {};
                            responseMessage.message = 'No founded Sales Statistics';
                            console.log('FnSalesStatistics: No founded Sales Statistics');
                            res.json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.error = {};
                        responseMessage.message = 'No founded Sales Statistics';
                        console.log('FnSalesStatistics: No founded Sales Statistics');
                        res.json(responseMessage);
                    }
                }
                else {
                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Sales Statistics';
                    console.log('FnSalesStatistics: error in getting Sales Statistics' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!stages) {
                responseMessage.message = 'Invalid stages';
                responseMessage.error = {
                    stages : 'Invalid stages'
                };
                console.log('FnSalesStatistics: stages is mandatory field');
            }
            else if (!probabilities) {
                responseMessage.message = 'Invalid probabilities';
                responseMessage.error = {
                    probabilities : 'Invalid probabilities'
                };
                console.log('FnSalesStatistics: probabilities is mandatory field');
            }
            else if (!user) {
                responseMessage.message = 'Invalid user';
                responseMessage.error = {
                    user : 'Invalid user'
                };
                console.log('FnSalesStatistics: user is mandatory field');
            }
            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !';
        console.log('FnSalesStatistics:error ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnCreateTransactionHistory
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for create transaction history
 */
BusinessManager.prototype.createTransactionHistory = function(req,res,next){

    var token = req.body.token;
    var stageType = req.body.s_type;
    var transactionId = req.body.tid;
    var stage = req.body.s;
    var reason = (req.body.reason) ? (req.body.reason) : '';
    var comments = (req.body.comments) ? (req.body.comments) : '';
    var tid=0;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
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
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(stageType)
                            + ',' + st.db.escape(transactionId) + ',' + st.db.escape(stage) + ',' + st.db.escape(reason)
                            + ',' + st.db.escape(comments);
                        var query = 'CALL pcreatetranshistory(' + queryParams + ')';
                        st.db.query(query, function (err, historyResult) {
                            //console.log(historyResult);
                            if (!err) {
                                if (historyResult) {
                                    if (historyResult[0]) {
                                        if (historyResult[0][0]) {
                                            if (historyResult[0][0].id) {
                                                tid = historyResult[0][0].id;
                                            }

                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Transaction history created successfully';
                                            responseMessage.data = {
                                                id: tid,
                                                s_type: parseInt(req.body.s_type),
                                                tid: parseInt(req.body.tid),
                                                s: parseInt(req.body.s),
                                                reason: reason,
                                                comments: comments
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnCreateTransactionHistory: Transaction history created successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Transaction history not created';
                                            res.status(200).json(responseMessage);
                                            console.log('FnCreateTransactionHistory:Transaction history not created');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Transaction history not created';
                                        res.status(200).json(responseMessage);
                                        console.log('FnCreateTransactionHistory:Transaction history not created');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Transaction history not created';
                                    res.status(200).json(responseMessage);
                                    console.log('FnCreateTransactionHistory:Transaction history not created');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal server error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnCreateTransactionHistory: error in creating transaction history:' + err);
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
                        console.log('FnCreateTransactionHistory: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnCreateTransactionHistory:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnCreateTransactionHistory ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTransactionHistory
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get transaction history
 */
BusinessManager.prototype.getTransactionHistory = function(req,res,next){

    var token = req.query.token;
    var transactionId = req.query.t_id;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
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
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token)+ ',' + st.db.escape(transactionId);
                        var query = 'CALL pgettranshistory(' + queryParams + ')';
                        st.db.query(query, function (err, historyResult) {
                            if (!err) {
                                if (historyResult) {
                                    if (historyResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Transaction history loaded successfully';
                                        responseMessage.data = historyResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetTransactionHistory: Transaction history loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Transaction history not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetTransactionHistory:Transaction history not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Transaction history not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTransactionHistory:Transaction history not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal server error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetTransactionHistory: error in loading transaction history:' + err);
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
                        console.log('FnGetTransactionHistory: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetTransactionHistory:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTransactionHistory ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnSaveSalesRequest
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.saveSalesRequest = function(req,res,next){

    /**
     * checking input parameters are json or not
     */
    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else {
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var toEzeid = alterEzeoneId(req.body.to_ezeid);
        var message = (req.body.requirement) ? req.body.requirement : '';
        var address = (req.body.address) ? req.body.address : '';
        var notes = (req.body.notes) ? req.body.notes : '';
        var aName = req.body.a_name;
        var amount = (req.body.amount) ? req.body.amount : 0.00;
        var stage = req.body.stage;
        var folderId = parseInt(req.body.folder_id);
        var proabilities = req.body.proabilities;
        var attachment = req.body.attachment;
        var id = parseInt(req.body.id);
        var clientId = parseInt(req.body.cid);
        var contactId = parseInt(req.body.ct_id);
        var targetdate = req.body.targetdate ? req.body.targetdate : null;

        if (!token) {
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if (isNaN(folderId)) {
            error['folderId'] = 'invalid folder id';
            validateStatus *= false;
        }

        if (isNaN(id)) {
            error['id'] = 'invalid id';
            validateStatus *= false;
        }
        if (isNaN(clientId)) {
            error['clientId'] = 'invalid clientId';
            validateStatus *= false;
        }
        if (isNaN(contactId)) {
            error['contactId'] = 'invalid contactId';
            validateStatus *= false;
        }
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        var queryParams = st.db.escape(token) + "," + st.db.escape(toEzeid) + "," + st.db.escape(message)
                            + "," + st.db.escape(address) + "," + st.db.escape(notes)
                            + "," + st.db.escape(attachment) + "," + st.db.escape(aName) + "," + st.db.escape(amount)
                            + "," + st.db.escape(stage) + "," + st.db.escape(folderId) + "," + st.db.escape(proabilities)
                            + "," + st.db.escape(id)+ "," + st.db.escape(clientId)+ "," + st.db.escape(contactId)
                            + "," + st.db.escape(targetdate);

                        var query = 'CALL pMSavesalesRequest(' + queryParams + ')';
                        console.log(query);

                        st.db.query(query, function (err, transResult) {
                            //console.log(transResult);
                            if (!err) {
                                if (transResult) {
                                    if (transResult[0]) {
                                        if (transResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Sales request save sucessfully';
                                            responseMessage.data = {
                                                id: transResult[0][0].id,
                                                to_ezeid: alterEzeoneId(req.body.to_ezeid),
                                                message: (req.body.msg) ? req.body.msg : '',
                                                address: req.body.address,
                                                notes: (req.body.notes) ? req.body.notes : '',
                                                a_name: req.body.a_name,
                                                amount: (req.body.amount) ? req.body.amount : 0.00,
                                                stage: req.body.stage,
                                                folder_id: folderId,
                                                proabilities: req.body.proabilities,
                                                s_url: attachment ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachment : ''
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnSaveSalesRequest: Sales request save sucessfully');

                                        }
                                        else {
                                            responseMessage.message = 'Sales request not save';
                                            res.status(200).json(responseMessage);
                                            console.log('FnSaveSalesRequest:Sales request not save');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Sales request not save';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveSalesRequest:Sales request not save');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Sales request not save';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveSalesRequest:Sales request not save');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveSalesRequest: error in saving Sales request  :' + err);
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
                        console.log('FnSaveSalesRequest: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveSalesRequest:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveSalesRequest ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetCompanyName
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get company name
 */
BusinessManager.prototype.getCompanyName = function(req,res,next){


    var token = req.query.token;
    var ezeid = (req.query.ezeid) ? alterEzeoneId(req.query.ezeid):'';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
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
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(ezeid);
                        var query = 'CALL pGetCompanyname(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, result) {
                            //console.log(result);
                            if (!err) {
                                if (result) {
                                    if (result[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'company name loaded successfully';
                                        responseMessage.data = result[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetCompanyName: company name loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'company name not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetCompanyName:company name not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'company name not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetCompanyName:company name not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal server error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetCompanyName: error in loading company name:' + err);
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
                        console.log('FnGetCompanyName: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetCompanyName:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetCompanyName ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetContactDetails
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get contact details
 */
BusinessManager.prototype.getContactDetails = function(req,res,next){


    var token = req.query.token;
    var ezeid = (req.query.ezeid) ? alterEzeoneId(req.query.ezeid):'';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
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
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(ezeid);
                        var query = 'CALL pgetcontactdetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, result) {
                            //console.log(result);
                            if (!err) {
                                if (result) {
                                    if (result[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'contact details loaded successfully';
                                        responseMessage.data = result[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetContactDetails: contact details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'contact details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetContactDetails:contact details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'contact details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetContactDetails:contact details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal server error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetContactDetails: error in loading contact details:' + err);
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
                        console.log('FnGetContactDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetContactDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetContactDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetRoles
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get roles
 */
BusinessManager.prototype.getRoles = function(req,res,next){

    /**
     * @param token
     */

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!(req.query.token)){
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(req.query.token);
                        var query = 'CALL pgetroles(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, result) {
                            //console.log(result);
                            if (!err) {
                                if (result) {
                                    if (result[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'roles loaded successfully';
                                        responseMessage.data = result[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetRoles: roles loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'roles not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetRoles:roles not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'roles not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetRoles:roles not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal server error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetRoles: error in loading roles:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Sorry ! Token is invalid';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetRoles: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetRoles:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetRoles ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getTransactionOfSales = function(req,res,next){
    /**
     * FnGetTransactionOfSales
     */

    var token = req.query.token;
    var pageCount = (!isNaN(parseInt(req.query.pc))) ?  parseInt(req.query.pc): 0;      // no of records per page
    var pageSize = (!isNaN(parseInt(req.query.ps))) ?  parseInt(req.query.ps): 10;   //  page size
    var stage = (req.query.stage) ? (req.query.stage) : '';
    var probability = (req.query.probability) ? (req.query.probability) : '';
    var folder = (req.query.folder) ? (req.query.folder) : '';
    var startDate = (req.query.sd) ? (req.query.sd) : null;
    var endDate = (req.query.ed) ? (req.query.ed) : null;


    var responseMessage = {
        status: false,
        error:{},
        message:'',
        total_count:0,
        data: []
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }

    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var endRecord = pageCount * pageSize;
                        var startRecord = endRecord - pageSize;

                        if (startRecord <= 1) {
                            startRecord = 0;
                        }
                        var parameters = st.db.escape(token) + ',' + st.db.escape(startRecord)
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(stage) + ',' + st.db.escape(probability)
                            + ',' + st.db.escape(folder) + ',' + st.db.escape(startDate) + ',' + st.db.escape(endDate);
                        var query = 'CALL pMGetSalesTransaction(' + parameters + ')';
                        console.log(query);
                        st.db.query(query, function (err, transResult) {
                            console.log(transResult);
                            if (!err) {
                                if (transResult) {
                                    if (transResult[0]) {
                                        if (transResult[0][0]) {
                                            if (transResult[1]) {
                                                var output = [];
                                                for (var i = 0; i < transResult[1].length; i++){
                                                    var reldata = {};
                                                    reldata.tid = transResult[1][i].tid,
                                                        reldata.tid = transResult[1][i].tid,
                                                        reldata.clientid = transResult[1][i].clientid,
                                                        reldata.contactid = transResult[1][i].contactid,
                                                        reldata.toezeid = transResult[1][i].toezeid,
                                                        reldata.TaskDateTime = transResult[1][i].TaskDateTime,
                                                        reldata.company_name = transResult[1][i].company_name,
                                                        reldata.cezeoneid = transResult[1][i].cezeoneid,
                                                        reldata.contactname = transResult[1][i].contactname,
                                                        reldata.contactemail = transResult[1][i].contactemail,
                                                        reldata.contactmobile = transResult[1][i].contactmobile,
                                                        reldata.contactphone = transResult[1][i].contactphone,
                                                        reldata.Attachment = (transResult[1][i].Attachment) ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +transResult[1][i].Attachment : '' ,
                                                        reldata.Message = transResult[1][i].Message,
                                                        reldata.Notes = transResult[1][i].Notes,
                                                        reldata.stage = transResult[1][i].stage,
                                                        reldata.LUDate = transResult[1][i].LUDate,
                                                        reldata.natitle = transResult[1][i].natitle,
                                                        reldata.nadate = transResult[1][i].nadate,
                                                        reldata.Proabilities = transResult[1][i].Proabilities,
                                                        reldata.nid = transResult[1][i].nid,
                                                        reldata.td = transResult[1][i].td,
                                                        reldata.da = transResult[1][i].da,
                                                        reldata.amount = transResult[1][i].Amount,
                                                        reldata.folderTitle = transResult[1][i].FolderTitle,

                                                    output.push(reldata);
                                                }

                                                console.log("this is data :"+ reldata);
                                                responseMessage.status = true;
                                                responseMessage.total_count = transResult[0][0].count;
                                                responseMessage.data = output;
                                                //responseMessage.Attachment = 'https://storage.googleapis.com/ezeone/'+ transResult[0][0].Attachment ;
                                                responseMessage.message = 'Transaction details loaded successfully';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetSalesTransaction: Transaction details loaded successfully');
                                            }
                                            else {
                                                responseMessage.status = true;
                                                responseMessage.message = 'Transaction details not loaded';
                                                res.status(200).json(responseMessage);
                                                console.log('FnGetSalesTransaction:Transaction details not loaded');
                                            }
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Transaction details not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetSalesTransaction:Transaction details not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Transaction details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetSalesTransaction:Transaction details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Transaction details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetSalesTransaction:Transaction details not loaded');
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Transaction details';
                                console.log('FnGetSalesTransaction:Error getting from Transaction details:' + err);
                                res.status(500).json(responseMessage);
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
                        console.log('FnGetSalesTransaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetSalesTransaction:Error in processing Token' + err);
                }
            });
        }

        catch (ex) {
            responseMessage.error = {
                server: 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnGetSalesTransaction:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description gives hris master details of user
 * @accepts json
 * @param token <string> token of login user
 * @param toezeoneid  <int> to whom u r raising sales request
 * @param ctn <string> client name
 * @param cntn  <string> contact name
 * @param em <string> contact person email id
 * @param mn <string>  contact person mobile number
 * @param ph <string>  contact person phone number
 * @param msg  <string>   requirement text
 * @param address <string> address
 * @param notes <string> information of that request
 * @param aurl <string>  attachment url (random path node will generate)
 * @param  aname <string> attachment file name
 *
 */
BusinessManager.prototype.saveExternalsalesRequest = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.body.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.toezeoneid){
        error.toezeoneid  = 'Invalid EzeID';
        validationFlag *= false;
    }
    var address = req.body.address ? req.body.address : '';

    if(!req.body.msg){
        error.msg  = 'Invalid EzeID';
        validationFlag *= false;
    }
    if (!validator.isLength((req.body.ctn), 3, 150)) {
        error.ctn = 'Client name can be maximum 150 characters';
        validationFlag *= false;
    }
    if (!validator.isLength((req.body.cntn), 3, 150)) {
        error.cntn = 'Contact name can be maximum 150 characters';
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
            st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.body.token) + ',' + st.db.escape(req.body.toezeoneid) + ',' + st.db.escape(req.body.ctn) + ',' +
                            st.db.escape(req.body.cntn) + ',' + st.db.escape(req.body.em) + ',' +st.db.escape(req.body.mn) + ',' +
                            st.db.escape(req.body.ph) + ',' + st.db.escape(req.body.msg) + ',' +st.db.escape(address) + ',' +
                            st.db.escape(req.body.notes) + ',' + st.db.escape(req.body.aurl) + ',' +st.db.escape(req.body.aname);
                        var procQuery = 'CALL pMSaveExternalsalesRequest(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'External sales request added successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pMSaveExternalsalesRequest ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');
                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('saveExternalsalesRequest: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : saveExternalsalesRequest ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error saveExternalsalesRequest :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get sales transaction details
 * @param token <string> token of login user
 * @param id <int> tid of sales
 *
 */
BusinessManager.prototype.getSalesTransDetails = function(req,res,next){
    var id = parseInt(req.query.id);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(id) || (id <= 0)){
        error.id = 'Invalid id of Sales';
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
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(id);
                        var procQuery = 'CALL pMGetSalesTransaction_details(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Sales Transacrion details loaded successfully';
                                            responseMessage.data = results[0];
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Sales Transacrion details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Sales Transacrion details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Sales Transacrion details  are not available';
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
                                console.log('Error : pMGetSalesTransaction_details ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('getSalesTransDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : getSalesTransDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error getSalesTransDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};


module.exports = BusinessManager;
