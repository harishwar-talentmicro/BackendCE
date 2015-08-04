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

function BusinessManager(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.getTransactions = function(req,res,next){
    /**
     * @todo FnGetTransaction
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = parseInt(req.query.FunctionType);
        var Page = parseInt(req.query.Page);
        var Status = (req.query.Status) ? req.query.Status : null;
        var searchkeyword = req.query.searchkeyword ? req.query.searchkeyword : '';
        var sortBy = (parseInt(req.query.sort_by) !== NaN) ? parseInt(req.query.sort_by) : 0 ;
        var folderRules = (req.query.folder_rules) ? req.query.folder_rules : '';
        var jobIDS = req.query.job_id ? req.query.job_id : '';
        var institute = req.query.institute ? req.query.institute : '';
        var expFrom = req.query.exp_from ? req.query.exp_from : 0;
        var expTo = req.query.exp_to ? req.query.exp_to : 0;
        var locationID = req.query.location_id ? req.query.location_id : '';

        console.log(req.query);
        var RtnMessage = {
            TotalPage:'',
            Result:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && FunctionType.toString() != null && Page.toString() != 'NaN' && Page.toString() != 0) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var ToPage = 10 * Page;
                        var FromPage = ToPage - 10;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        var parameters = st.db.escape(Token) + ',' + st.db.escape(FunctionType) + ',' + st.db.escape(Status)
                            + ',' + st.db.escape(FromPage) + ',' + st.db.escape(10) + ',' + st.db.escape(searchkeyword)
                            + ',' + st.db.escape(sortBy) + ','+ st.db.escape(folderRules)+ ',' + st.db.escape(jobIDS)
                            + ',' + st.db.escape(institute) + ',' + st.db.escape(expFrom)+ ',' + st.db.escape(expTo)
                            + ','+ st.db.escape(locationID);
                        console.log('CALL pGetMessagesNew(' + parameters + ')');
                        st.db.query('CALL pGetMessagesNew(' + parameters + ')', function (err, GetResult) {

                            if (!err) {
                                if (GetResult) {
                                    console.log('Length:'+GetResult[0].length);
                                    if (GetResult[0].length > 0) {
                                        var totalRecord=GetResult[0][0].TotalCount;
                                        var limit= 10;
                                        var PageValue = parseInt(totalRecord / limit);
                                        var PageMod = totalRecord % limit;
                                        if (PageMod > 0){
                                            var TotalPage = PageValue + 1;
                                        }
                                        else{
                                            TotalPage = PageValue;
                                        }

                                        //TotalPage = parseInt(GetResult[0][0].TotalCount / 10) + 1;
                                        RtnMessage.TotalPage = TotalPage;
                                        RtnMessage.Result =GetResult[0];
                                        res.send(RtnMessage);
                                        console.log('FnGetTranscation: Transaction details Send successfully');
                                    }

                                    else {
                                        console.log('FnGetTranscation:No Transaction details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTranscation:No transaction details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTranscation: error in getting transaction details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTranscation: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTranscation: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTranscation: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetTranscation: FunctionType is empty');
            }
            else if (Page.toString() == 'NaN') {
                console.log('FnGetMessages: Page is empty');
            }
            else if (Page.toString() == 0) {
                console.log('FnGetMessages: Sending page 0');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTranscation error:' + ex.description);
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
BusinessManager.prototype.saveTransaction = function(req,res,next){
    /**
     * @todo FnSaveTransaction
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var fs = require("fs");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var MessageText =req.body.MessageText;
        var Status = req.body.Status;
        var TaskDateTime = req.body.TaskDateTime;
        var Notes = req.body.Notes;
        var LocID = req.body.LocID;
        var Country = req.body.Country;    //country short name
        var State = req.body.State;         //admin level 1
        var City = req.body.City;       //ADMIN level 2
        var Area = req.body.Area;       //admin level 3
        var FunctionType = req.body.FunctionType;
        var Latitude = req.body.Latitude;
        var Longitude = req.body.Longitude;
        var EZEID = alterEzeoneId(req.body.EZEID);
        var ContactInfo = req.body.ContactInfo;
        var FolderRuleID = parseInt(req.body.FolderRuleID);
        var Duration = req.body.Duration;
        var DurationScales = req.body.DurationScales;
        var ItemsList = req.body.ItemsList;
        ItemsList = JSON.parse(ItemsList);
        var NextAction = req.body.NextAction;
        var NextActionDateTime = req.body.NextActionDateTime;
        var  TaskDateNew = new Date(TaskDateTime);
        var NextActionDateTimeNew = new Date(NextActionDateTime);
        var DeliveryAddress = req.body.DeliveryAddress;
        if(DeliveryAddress == '')
            DeliveryAddress = '';
        var ItemIDList='';
        var ToEZEID = alterEzeoneId(req.body.ToEZEID);
        var item_list_type = req.body.item_list_type ? req.body.item_list_type : 0;
        var companyName = req.body.companyName ? req.body.companyName : '' ;
        var company_id = req.body.company_id ? req.body.company_id : 0 ;
        var attachment = req.body.attachment ? req.body.attachment : null ;
        var proabilities = req.body.proabilities ? req.body.proabilities : 0 ;
        var attachment_name = req.body.attachment_name ? req.body.attachment_name : '' ;
        var mime_type = req.body.mime_type ? req.body.mime_type : '' ;
        var alarmDuration = req.body.alarm_duration ? req.body.alarm_duration : 0;
        var messagetype,verified;

        if (FunctionType == 0){
            //sales
            messagetype = 1;
        }
        else if (FunctionType == 2){
            //HomeDelivery
            messagetype = 3;
        }
        else if (FunctionType == 3){
            //Service
            messagetype = 4;
        }
        else if (FunctionType == 4){
            //Cv
            messagetype = 5;
        }
        var RtnMessage = {
            IsSuccessfull: false,
            MessageID:0
        };

        if(TID.toString() == 'NaN')
            TID = 0;

        if(TID != 0){
            for(var i=0; i < ItemsList.length; i++) {
                if(ItemsList[i].TID != 0 )
                    ItemIDList = ItemsList[i].TID + ',' + ItemIDList  ;
            }
            console.log(ItemIDList);
            ItemIDList=ItemIDList.slice(0,-1)
            console.log('TID comma Values:'+ ItemIDList);
        }
        if(FolderRuleID.toString() == 'NaN')
            FolderRuleID=0;

        if (Token != null && ItemsList != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = st.db.escape(Token) + "," + st.db.escape(FunctionType) + "," + st.db.escape(MessageText)
                            + "," + st.db.escape(Status) + "," + st.db.escape(TaskDateNew) + "," + st.db.escape(Notes)
                            + "," + st.db.escape(LocID) + "," + st.db.escape(Country) + "," + st.db.escape(State)
                            + "," + st.db.escape(City) + "," + st.db.escape(Area) + "," + st.db.escape(Latitude)
                            + "," + st.db.escape(Longitude) + "," + st.db.escape(EZEID) + "," + st.db.escape(ContactInfo)
                            + "," + st.db.escape(FolderRuleID) + "," + st.db.escape(Duration) + "," + st.db.escape(DurationScales)
                            + "," + st.db.escape(NextAction) + "," + st.db.escape(NextActionDateTimeNew) + "," + st.db.escape(TID)
                            + "," + st.db.escape(((ItemIDList != "") ? ItemIDList : "")) + "," + st.db.escape(DeliveryAddress)
                            + "," + st.db.escape(ToEZEID) + "," + st.db.escape(item_list_type) + "," + st.db.escape(companyName)
                            + "," + st.db.escape(company_id) + "," + st.db.escape(attachment)+ "," + st.db.escape(proabilities)
                            + "," + st.db.escape(attachment_name)+ "," + st.db.escape(mime_type)+ "," + st.db.escape(alarmDuration);
                        // st.db.escape(NextActionDateTime);
                        console.log('CALL pSaveTrans(' + query + ')');
                        st.db.query('CALL pSaveTrans(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult[0] != null) {
                                    if (InsertResult[0].length > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        var Message = InsertResult[0];
                                        RtnMessage.MessageID = Message[0].MessageID;
                                        console.log(Message);
                                        for (var i = 0; i < ItemsList.length; i++) {
                                            var itemsDetails = ItemsList[i];
                                            var items = {
                                                MessageID: Message[0].MessageID,
                                                ItemID: itemsDetails.ItemID,
                                                Qty: itemsDetails.Qty,
                                                Rate: itemsDetails.Rate,
                                                Amount: itemsDetails.Amount,
                                                Duration: itemsDetails.Durations
                                            };
                                            console.log(items);
                                            console.log('TID:' + itemsDetails.TID);
                                            if (itemsDetails.TID == 0) {
                                                var query = st.db.query('INSERT INTO titems SET ?', items, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        if (result != null) {
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
                                                console.log('TID:' + itemsDetails.TID);
                                                var query = st.db.query("UPDATE titems set ? WHERE TID = ? ", [items, itemsDetails.TID], function (err, result) {
                                                    // Neat!
                                                    console.log(result);
                                                    if (!err) {
                                                        if (result != null) {
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
                                        res.send(RtnMessage);
                                        console.log('FnSaveTranscationItems: Transaction items details save successfully');
                                        if (messagetype == 1) {
                                            fs.readFile("SalesMail.html", "utf8", function (err, data) {
                                                var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(EZEID);
                                                st.db.query(query1, function (err, getResult) {

                                                    if (getResult[0].id == 1) {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }

                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                                                        st.db.query(mail_query, function (err, get_result) {
                                                            console.log(get_result);
                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].EMailID,
                                                                    subject: 'Sales Enquiry from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
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
                                                    }
                                                    else {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }
                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID=' + getResult[0].TID;
                                                        console.log(mail_query);
                                                        st.db.query(mail_query, function (err, get_result) {

                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].SalesMailID,
                                                                    subject: 'Sales Enquiry from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
                                                                st.db.query(queryResult, function (err, result) {

                                                                    var post = {
                                                                        MessageType: messagetype,
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
                                                    }
                                                });
                                            });
                                        }
                                        else if (messagetype == 3) {
                                            fs.readFile("homedelivery.html", "utf8", function (err, data) {
                                                var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(EZEID);
                                                st.db.query(query1, function (err, getResult) {

                                                    if (getResult[0].id == 1) {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }

                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                                                        st.db.query(mail_query, function (err, get_result) {
                                                            console.log(get_result);
                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].EMailID,
                                                                    subject: 'HomeDelivery from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
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
                                                                            console.log('FnMessageMail: Home Delivery Mail saved Successfully....1');
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
                                                    }
                                                    else {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }
                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(HomeDeliveryMailID," ") as MailID from tmaster where TID=' + getResult[0].TID;
                                                        console.log(mail_query);
                                                        st.db.query(mail_query, function (err, get_result) {

                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].MailID,
                                                                    subject: 'HomeDelivery from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
                                                                st.db.query(queryResult, function (err, result) {

                                                                    var post = {
                                                                        MessageType: messagetype,
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
                                                                            console.log('FnMessageMail: HomeDelivery Mail saved Successfully....1');

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
                                                    }
                                                });
                                            });
                                        }
                                        else if (messagetype == 4) {
                                            fs.readFile("ServiceMail.html", "utf8", function (err, data) {
                                                var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(EZEID);
                                                st.db.query(query1, function (err, getResult) {

                                                    if (getResult[0].id == 1) {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }

                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                                                        st.db.query(mail_query, function (err, get_result) {
                                                            console.log(get_result);
                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].EMailID,
                                                                    subject: 'Service Request from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
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
                                                                            console.log('FnMessageMail: Service Mail saved Successfully....1');
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
                                                    }
                                                    else {
                                                        if (getResult[0].EZEIDVerifiedID == 1) {
                                                            verified = 'Not Verified';
                                                        }
                                                        else {
                                                            verified = 'Verified';
                                                        }
                                                        data = data.replace("[IsVerified]", verified);
                                                        data = data.replace("[EZEOneID]", getResult[0].EZEID);
                                                        data = data.replace("[EZEID]", getResult[0].EZEID);
                                                        data = data.replace("[Message]", MessageText);

                                                        var mail_query = 'Select EZEID,ifnull(ServiceMailID," ") as MailID from tmaster where TID=' + getResult[0].TID;
                                                        console.log(mail_query);
                                                        st.db.query(mail_query, function (err, get_result) {

                                                            if (get_result) {
                                                                var mailOptions = {
                                                                    from: 'noreply@ezeone.com',
                                                                    to: get_result[0].MailID,
                                                                    subject: 'Service Request from ' + ToEZEID,
                                                                    html: data // html body
                                                                };
                                                                //console.log(mailOptions);
                                                                var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
                                                                st.db.query(queryResult, function (err, result) {

                                                                    var post = {
                                                                        MessageType: messagetype,
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
                                                    }
                                                });
                                            });
                                        }
                                    }
                                    else
                                    {
                                        console.log('FnSaveTranscationItems:No Save Transaction items details');
                                        res.send(RtnMessage);
                                    }
                                }

                                else {
                                    console.log('FnSaveTranscationItems:No Save Transaction items details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveTranscationItems: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }

                }
                else {
                    console.log('FnSaveTranscationItems:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveTranscationItems: Token is empty');
            }
            else
                console.log(RtnMessage);

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveTranscationItems:error ' + ex.description);
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
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.body.TID);
        var status = req.body.status;
        var folderRuleID = parseInt(req.body.folderRuleID);
        var nextAction = (parseInt(req.body.nextAction) != NaN ) ? parseInt(req.body.nextAction) : 0;
        var nextActionDateTime = new Date(req.body.nextActionDateTime);
        var Token = req.body.Token;
        var alarmDuration = req.body.alarm_duration ? req.body.alarm_duration : 0;


        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };

        if(Token){

            var query = st.db.escape(TID) + ', ' + st.db.escape(status) + ',' + st.db.escape(folderRuleID)
                + ',' + st.db.escape(nextAction) + ',' + st.db.escape(nextActionDateTime)
                + ', ' + st.db.escape(Token)+ ', ' + st.db.escape(alarmDuration);
            st.db.query('CALL pUpdateTrans(' + query + ')', function (err, updateResult) {
                if (!err){
                    if (updateResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Transaction details update successfully';
                        responseMessage.data = {
                            TID : req.body.TID,
                            status : req.body.status,
                            folderRuleID : req.body.folderRuleID,
                            nextAction : (parseInt(req.body.nextAction) != NaN ) ? parseInt(req.body.nextAction) : 0,
                            nextActionDateTime : req.body.nextActionDateTime
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
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateTransaction: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateTransaction:error ' + ex.description);
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var MessageID = req.query.MessageID;

        if (Token != null && MessageID != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        st.db.query('CALL pGetTranscationItems(' + st.db.escape(MessageID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetTranscationItems: transaction items details Send successfully');
                                        res.send(GetResult[0]);
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
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTranscationItems: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTranscationItems: Token is empty');
            }
            else if (MessageID == null) {
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
    var _this = this;
try{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.body.Token;
    var MessageID = req.body.MessageID;
    var ItemID = req.body.ItemID;
    var Qty = req.body.Qty;
    var Rate = req.body.Rate;
    var Amount = req.body.Amount;
    var Duration = req.body.Duration;


    var RtnMessage = {
        IsSuccessfull: false
    };

    if (Token != null && MessageID!= null && ItemID != null && Qty !=null && Rate !=null && Amount != null && Duration !=null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    var query = st.db.escape(MessageID) + ',' + st.db.escape(ItemID) + ',' + st.db.escape(Qty) + ',' + st.db.escape(Rate) + ',' +st.db.escape(Amount) + ',' +st.db.escape(Duration);
                    st.db.query('CALL pSaveTranscationItems(' + query + ')', function (err, InsertResult) {
                        if (!err){
                            if (InsertResult.affectedRows > 0) {
                                RtnMessage.IsSuccessfull = true;
                                res.send(RtnMessage);
                                console.log('FnSaveTranscationItems: Transaction items details save successfully');
                            }
                            else {
                                console.log('FnSaveTranscationItems:No Save Transaction items details');
                                res.send(RtnMessage);
                            }
                        }

                        else {
                            console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                            res.statusCode = 500;
                            res.send(RtnMessage);
                        }
                    });
                }
                else {
                    console.log('FnSaveTranscationItems: Invalid token');
                    res.statusCode = 401;
                    res.send(RtnMessage);
                }
            }
            else {
                console.log('FnSaveTranscationItems:Error in processing Token' + err);
                res.statusCode = 500;
                res.send(RtnMessage);

            }
        });

    }

    else {
        if (Token == null) {
            console.log('FnSaveTranscationItems: Token is empty');
        }
        else if (MessageID == null) {
            console.log('FnSaveTranscationItems: MessageID is empty');
        }
        else if (ItemID == null) {
            console.log('FnSaveTranscationItems: ItemID is empty');
        }
        else if (Qty == null) {
            console.log('FnSaveTranscationItems: Qty is empty');
        }
        else if (Rate == null) {
            console.log('FnSaveTranscationItems: Rate is empty');
        }
        else if (Amount == null) {
            console.log('FnSaveTranscationItems: Amount is empty');
        }
        else if (Duration == null) {
            console.log('FnSaveTranscationItems: Duration is empty');
        }

        res.statusCode=400;
        res.send(RtnMessage);
    }

}
catch (ex) {
    console.log('FnSaveTranscationItems:error ' + ex.description);
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var pagesize = req.query.pagesize;
        var pagecount = req.query.pagecount;
        var functiontype = req.query.functiontype;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pGetOutboxMessages(' + st.db.escape(Token) + ',' + st.db.escape(pagesize) + ',' + st.db.escape(pagecount) + ',' + st.db.escape(functiontype) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.data = GetResult[0] ;
                                        responseMessage.error = null;
                                        responseMessage.message = 'OutBoxMsg details Send successfully';
                                        console.log('FnGetOutboxMessages: OutBoxMsg details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {

                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded OutBoxMsg details';
                                        console.log('FnGetOutboxMessages: No founded OutBoxMsg details');
                                        res.json(responseMessage);
                                    }
                                }
                                else {


                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded OutBoxMsg details';
                                    console.log('FnGetOutboxMessages: No founded OutBoxMsg details');
                                    res.json(responseMessage);
                                }

                            }
                            else {

                                responseMessage.data = null ;
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
                        responseMessage.data = null;
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
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetCompanyDetails: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var title = req.query.title;
        var type = req.query.type;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (title) {

            st.db.query('CALL PgetTransAutocomplete(' + st.db.escape(title) + ',' + st.db.escape(type) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Transaction details Send successfully';
                            console.log('FnGetTransAutoComplete: Transaction details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Transaction details';
                            console.log('FnGetTransAutoComplete: No founded Transaction details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Transaction details';
                        console.log('FnGetTransAutoComplete: No founded Transaction details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
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
        responseMessage.message = 'An error occured !'
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
    var _this = this;
    try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var FunctionType = req.query.FunctionType;
    var EZEID = req.query.EZEID;
    if(Token == "")
        Token= null;
    if (Token != null && FunctionType != null && EZEID != null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    console.log('CALL pItemListforEZEID(' +  st.db.escape(FunctionType)  + ',' + st.db.escape(EZEID) + ')');
                    st.db.query('CALL pItemListforEZEID(' +  st.db.escape(FunctionType)  + ',' + st.db.escape(EZEID) + ')', function (err, GetResult) {
                        if (!err) {
                            if (GetResult[0] != null) {
                                if (GetResult[0].length > 0) {
                                    console.log('FnGetItemListForEZEID: Item list details Send successfully');
                                    res.send(GetResult[0]);
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
        if (Token == null) {
            console.log('FnGetItemListForEZEID: Token is empty');
        }
        else if (FunctionType == null) {
            console.log('FnGetItemListForEZEID: FunctionType is empty');
        }
        else if (EZEID == null) {
            console.log('FnGetItemListForEZEID: EZEID is empty');
        }
        res.statusCode=400;
        res.json(null);
    }
}
catch (ex) {
    console.log('FnGetItemListForEZEID error:' + ex.description);
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
    var _this = this;
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var ItemTID = req.query.ItemTID;

        var RtnMessage = {
            IsSuccessfull:false
        };
        if (Token != null && ItemTID != null){
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        st.db.query('CALL pDeleteTransactionItems(' + st.db.escape(ItemTID) + ')', function (err, deleteResult) {
                            if (!err) {
                                if (deleteResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteTranscation: transaction items delete successfully');
                                }
                                else {
                                    console.log('FnDeleteTranscation:No delete transaction items');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteTranscation: error in deleting transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteTranscation: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteTranscation:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteTranscation: Token is empty');
            }
            else if (ItemTID == null) {
                console.log('FnDeleteTranscation: ItemTID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
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
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var FunctionType = req.query.FunctionType;

    if (Token != null && FunctionType != null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    st.db.query('CALL pItemList(' + st.db.escape(Token) + ',' + st.db.escape(FunctionType) + ')', function (err, GetResult) {
                        if (!err) {
                            if (GetResult != null) {
                                if (GetResult[0].length > 0) {
                                    console.log('FnItemList: Item list details Send successfully');
                                    res.send(GetResult[0]);
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
        if (Token == null) {
            console.log('FnGetItemList: Token is empty');
        }
        else if (FunctionType == null) {
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token != null && TID != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        st.db.query('CALL pItemDetails(' + st.db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnItemDetails: Item list details Send successfully');
                                        res.send(GetResult[0]);
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
            if (Token == null) {
                console.log('FnItemDetails: Token is empty');
            }
            else if (TID == null) {
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
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var RuleFunction = req.query.RuleFunction;

    if (Token != null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    st.db.query('CALL pGetUserWiseFolderList(' + st.db.escape(Token) + ',' + st.db.escape(RuleFunction) + ')', function (err, GetResult) {
                        if (!err) {
                            if (GetResult != null) {
                                if (GetResult[0].length > 0) {

                                    console.log('FnGetUserwiseFolderList: Folder list details Send successfully');
                                    res.send(GetResult[0]);
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
        if (Token == null) {
            console.log('FnGetUserwiseFolderList: Token is empty');
        }
        if (RuleFunction == null) {
            console.log('FnGetUserwiseFolderList: RuleFunction is empty');
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
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
BusinessManager.prototype.updateBussinessList = function(req,res,next){
    /**
     * @todo FnUpdateBussinessListing
     */
    var _this = this;
try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var token = req.body.TokenNo;
    var CategoryID = parseInt(req.body.CategoryID);
    var Keywords = req.body.Keywords;
    var RtnMessage = {
        IsUpdated: false
    };
    var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

    if (token != null && token != '' && CategoryID.toString() != 'NaN' && Keywords != null) {
        st.validateToken(token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //  var fileName = BrochureDocFile.split('.').pop();
                    var query = st.db.escape(token) + ',' + st.db.escape(Keywords) + ',' + st.db.escape(CategoryID);
                    //console.log(query);
                    st.db.query('CALL pUpdateBusinesslist(' + query + ')', function (err, UpdateResult) {
                        if (!err) {
                            //console.log(UpdateResult);
                            // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                            if (UpdateResult.affectedRows > 0) {
                                RtnMessage.IsUpdated = true;
                                res.send(RtnMessage);
                                console.log('FnUpdateBussinessListing: Bussiness listing update successfully');
                            }
                            else {
                                console.log('FnUpdateBussinessListing: Bussiness listing is not avaiable');
                                res.send(RtnMessage);
                            }
                        }
                        else {
                            console.log('FnUpdateBussinessListing: ' + err);
                            res.statusCode = 500;
                            res.send(RtnMessage);
                        }
                    });
                }
                else {
                    res.statusCode = 401;
                    console.log('FnUpdateBussinessListing: Invalid token');
                    res.send(RtnMessage);
                }
            }
            else {
                res.statusCode = 500;
                console.log('FnUpdateBussinessListing: : ' + err);
                res.send(RtnMessage);

            }
        });

    }
    else {
        if (token == null || token == '') {
            console.log('FnUpdateBussinessListing: token is empty');
        }
        else if (CategoryID.toString() == 'NaN') {
            console.log('FnUpdateMessageStatus: CategoryID is empty');
        }
        else if (Keywords == null) {
            console.log('FnUpdateMessageStatus: Keywords is empty');
        }
        res.statusCode = 400;
        res.send(RtnMessage);

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
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var functiontype =  req.query.functiontype;
    var responseMessage = {
        status: false,
        data: null,
        error:{},
        message:''
    };

    if (Token) {

        st.db.query('CALL pGetCompanyDetails(' + st.db.escape(Token) + ',' + st.db.escape(functiontype) + ')', function (err, GetResult) {
            if (!err) {
                if (GetResult) {
                    if (GetResult[0].length > 0) {
                        responseMessage.status = true;
                        responseMessage.data = GetResult[0] ;
                        responseMessage.error = null;
                        responseMessage.message = 'Company details Send successfully';
                        console.log('FnGetCompanyDetails: Company details Send successfully');
                        res.status(200).json(responseMessage);
                    }
                    else {

                        responseMessage.error = {};
                        responseMessage.message = 'No founded Company details';
                        console.log('FnGetCompanyDetails: No founded Company details');
                        res.json(responseMessage);
                    }
                }
                else {


                    responseMessage.error = {};
                    responseMessage.message = 'No founded Company details';
                    console.log('FnGetCompanyDetails: No founded Company details');
                    res.json(responseMessage);
                }

            }
            else {

                responseMessage.data = null ;
                responseMessage.error = {};
                responseMessage.message = 'Error in getting Company details';
                console.log('FnGetCompanyDetails: error in getting Company details' + err);
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
            console.log('FnGetCompanyDetails: Token is mandatory field');
        }

        res.status(401).json(responseMessage);
    }
}
catch (ex) {
    responseMessage.error = {};
    responseMessage.message = 'An error occured !'
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
    var _this = this;
var ezeTerm = alterEzeoneId(req.query['ezeoneid']);
var token = req.query['token'];
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
                        if(seqNo !== NaN && seqNo > -1){
                            locationSeq = seqNo;
                        }
                    }

                    /**
                     * If location sequence number is not found assuming that user may have passed the pin
                     * and therefore validating pin using standard rules
                     */
                    else if(parseInt(ezeArr[1]) !== NaN && parseInt(ezeArr[1]) > 99 && parseInt(ezeArr[1]) < 1000){
                        pin = parseInt(ezeArr[1]).toString();
                    }

                    /**
                     * If third element is also there in array then strictly assume it as a pin and then
                     * assign it to pin
                     */
                    else if(ezeArr.length > 2){
                        if(parseInt(ezeArr[2]) !== NaN && parseInt(ezeArr[2]) > 99 && parseInt(ezeArr[2]) < 1000){
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
                        if(result && result.length > 0){
                            if(result[0].length > 0){
                                respMsg.status  = true;
                                respMsg.data = result[0][0];
                                respMsg.message = 'EZEOne ID found';
                                respMsg.error = null;
                                res.status(200).json(respMsg);
                                return;
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
    var _this = this;
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

        if (!tid) {
            responseMessage.error['tid'] = 'Invalid tid';
            validateStatus *= false;
        }
        if (!token) {
            responseMessage.error['token'] = 'Invalid token';
            validateStatus *= false;
        }
        if (!validateStatus) {
            console.log('FnGetTransAttachment  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to get transaction attachment ! Please check the errors';
            res.status(401).json(responseMessage);
            return;
        }

        else {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        st.db.query('CALL pGetTransAttachment(' + st.db.escape(tid) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.data = GetResult[0];
                                        responseMessage.error = null;
                                        responseMessage.message = 'TransAttachment details Send successfully';
                                        console.log('FnGetTransAttachment: TransAttachment details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {

                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded TransAttachment details';
                                        console.log('FnGetTransAttachment: No founded TransAttachment details');
                                        res.json(responseMessage);
                                    }
                                }
                                else {


                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded TransAttachment details';
                                    console.log('FnGetTransAttachment: No founded TransAttachment details');
                                    res.json(responseMessage);
                                }

                            }
                            else {

                                responseMessage.data = null;
                                responseMessage.error = {};
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
                        responseMessage.data = null;
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
        responseMessage.message = 'An error occured !'
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var from_date = req.query.from_date;
        var to_date = req.query.to_date;
        var stages = req.query.stages;
        var probabilities = req.query.probabilities ? req.query.probabilities : null;
        var user = req.query.user;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        var validateStatus = true;

        if (!stages) {
            responseMessage.error['stages'] = 'Invalid stages';
            validateStatus *= false;
        }

        if (!user) {
            responseMessage.error['user'] = 'Invalid user';
            validateStatus *= false;
        }
        if (!probabilities) {
            responseMessage.error['probabilities'] = 'Invalid probabilities';
            validateStatus *= false;
        }
        if (!validateStatus) {
            console.log('FnSalesStatistics  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to get Sales Statistics ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (stages && user && probabilities) {
            var query = st.db.escape(from_date) + ',' + st.db.escape(to_date) + ',' + st.db.escape(stages)
                + ',' + st.db.escape(probabilities)+ ',' + st.db.escape(user);
            st.db.query('CALL pTransactionfilter(' + query +')', function (err, GetResult) {
                var length = GetResult[0].length;
                var total_count = 0, total_qty = 0;
                if (!err) {
                    if (GetResult) {
                        if (GetResult.length > 0) {
                            console.log(GetResult[0][0].amount);
                            for (var i = 0; i < length; i++)
                            {
                                total_count = total_count + GetResult[0][i].amount;
                                total_qty = total_qty + GetResult[0][i].qty;
                            }
                            responseMessage.status = true;
                            responseMessage.data = {
                                from_date :from_date,
                                to_date : to_date,
                                stages : stages,
                                probabilities : probabilities,
                                transactions : GetResult[0],
                                total_amount :total_count,
                                total_items:total_qty,
                                funnel:GetResult[1]
                            }
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
        responseMessage.message = 'An error occured !'
        console.log('FnSalesStatistics:error ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(responseMessage);
    }
};

module.exports = BusinessManager;