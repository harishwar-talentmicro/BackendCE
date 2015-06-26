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

function BusinessManager(db){
    this.db = db;
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

        console.log(req.query);
        var RtnMessage = {
            TotalPage:'',
            Result:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && FunctionType.toString() != null && Page.toString() != 'NaN' && Page.toString() != 0) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var ToPage = 10 * Page;
                        var FromPage = ToPage - 10;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        var parameters = db.escape(Token) + ',' + db.escape(FunctionType) + ',' + db.escape(Status) + ',' + db.escape(FromPage) + ',' + db.escape(10) + ',' + db.escape(searchkeyword) + ',' + db.escape(sortBy) + ','+ db.escape(folderRules);
                        console.log('CALL pGetMessagesNew(' + parameters + ')');
                        db.query('CALL pGetMessagesNew(' + parameters + ')', function (err, GetResult) {
                            console.log(GetResult);
                            if (!err) {
                                if (GetResult) {
                                    console.log('Length:'+GetResult[0].length);
                                    if (GetResult[0].length > 0) {
                                        var totalRecord=GetResult[0][0].TotalCount;
                                        var limit= 10;
                                        var PageValue = parseInt(totalRecord / limit);
                                        var PageMod = totalRecord % limit;
                                        if (PageMod > 0){
                                            TotalPage = PageValue + 1;
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
        throw new Error(ex);
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
        var EZEID = req.body.EZEID;
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
        var ToEZEID = req.body.ToEZEID;
        var item_list_type = 0;
        var companyName = req.body.companyName ? req.body.companyName : '' ;
        var company_id = req.body.company_id ? req.body.company_id : 0 ;
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = db.escape(Token)+","+db.escape(FunctionType)+","+ db.escape(MessageText)+ "," + db.escape(Status) +"," + db.escape(TaskDateNew) + ","  + db.escape(Notes) + "," + db.escape(LocID)  + "," + db.escape(Country)   + "," + db.escape(State) + "," + db.escape(City)   + "," + db.escape(Area) + ","  + db.escape(Latitude)  + "," + db.escape(Longitude)  +  "," + db.escape(EZEID)  + "," + db.escape(ContactInfo)  + "," + db.escape(FolderRuleID)  + "," + db.escape(Duration)  + "," + db.escape(DurationScales) + "," + db.escape(NextAction) + "," + db.escape(NextActionDateTimeNew) + "," + db.escape(TID) + "," + db.escape(((ItemIDList != "") ? ItemIDList : "")) + "," + db.escape(DeliveryAddress) + "," + db.escape(ToEZEID) + "," + db.escape(item_list_type) + "," + db.escape(companyName) + "," + db.escape(company_id);
                        // db.escape(NextActionDateTime);
                        console.log('CALL pSaveTrans(' + query + ')');
                        db.query('CALL pSaveTrans(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                console.log(InsertResult);
                                if (InsertResult[0]) {
                                    if(InsertResult[0].length > 0){
                                        RtnMessage.IsSuccessfull = true;
                                        var Message = InsertResult[0];
                                        RtnMessage.MessageID=Message[0].MessageID;
                                        console.log(Message);
                                        for(var i=0; i < ItemsList.length; i++) {
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
                                            console.log('TID:' +itemsDetails.TID);
                                            if(itemsDetails.TID == 0){
                                                var query = db.query('INSERT INTO titems SET ?', items, function (err, result) {
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

                                            else{
                                                var items = {

                                                    ItemID: itemsDetails.ItemID,
                                                    Qty: itemsDetails.Qty,
                                                    Rate: itemsDetails.Rate,
                                                    Amount: itemsDetails.Amount,
                                                    Duration: itemsDetails.Durations
                                                };
                                                console.log('TID:' +itemsDetails.TID);
                                                var query = db.query("UPDATE titems set ? WHERE TID = ? ",[items,itemsDetails.TID], function (err, result) {
                                                    // Neat!
                                                    console.log(result);
                                                    if (!err) {
                                                        if(result){
                                                            if(result.affectedRows > 0){

                                                                console.log('FnSaveFolderRules: Folder rules Updated successfully');
                                                            }
                                                            else
                                                            {
                                                                console.log('FnSaveFolderRules: Folder rule not updated');
                                                            }
                                                        }
                                                        else
                                                        {
                                                            console.log('FnSaveFolderRules: Folder rule not updated')
                                                        }
                                                    }
                                                    else
                                                    {
                                                        console.log('FnSaveFolderRules: error in saving folder rules' +err);
                                                    }
                                                });
                                            }
                                        }
                                        res.send(RtnMessage);
                                        console.log('FnSaveTranscationItems: Transaction items details save successfully');
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
        throw new Error(ex);
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


        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };

        if(Token){

            var query = db.escape(TID) + ', ' + db.escape(status) + ',' + db.escape(folderRuleID) + ',' + db.escape(nextAction) + ',' + db.escape(nextActionDateTime)+ ', ' + db.escape(Token);
            db.query('CALL pUpdateTrans(' + query + ')', function (err, updateResult) {
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
        throw new Error(ex);
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        db.query('CALL pGetTranscationItems(' + db.escape(MessageID) + ')', function (err, GetResult) {
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
        throw new Error(ex);
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

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {
                        db.query('CALL pGetOutboxMessages(' + db.escape(Token) + ',' + db.escape(pagesize) + ',' + db.escape(pagecount)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.data = GetResult[0] ;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Company details Send successfully';
                                        console.log('FnGetOutboxMessages: Company details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {

                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded Company details';
                                        console.log('FnGetOutboxMessages: No founded Company details');
                                        res.json(responseMessage);
                                    }
                                }
                                else {


                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded Company details';
                                    console.log('FnGetOutboxMessages: No founded Company details');
                                    res.json(responseMessage);
                                }

                            }
                            else {

                                responseMessage.data = null ;
                                responseMessage.error = {};
                                responseMessage.message = 'Error in getting Company details';
                                console.log('FnGetOutboxMessages: error in getting Company details' + err);
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
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }

};



module.exports = BusinessManager;