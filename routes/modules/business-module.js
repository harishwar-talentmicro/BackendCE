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

                        var parameters = _this.db.escape(Token) + ',' + _this.db.escape(FunctionType) + ',' + _this.db.escape(Status) + ',' + _this.db.escape(FromPage) + ',' + _this.db.escape(10) + ',' + _this.db.escape(searchkeyword) + ',' + _this.db.escape(sortBy) + ','+ _this.db.escape(folderRules);
                        console.log('CALL pGetMessagesNew(' + parameters + ')');
                        _this.db.query('CALL pGetMessagesNew(' + parameters + ')', function (err, GetResult) {
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

                        var query = _this.db.escape(Token)+","+_this.db.escape(FunctionType)+","+ _this.db.escape(MessageText)+ "," + _this.db.escape(Status) +"," + _this.db.escape(TaskDateNew) + ","  + _this.db.escape(Notes) + "," + _this.db.escape(LocID)  + "," + _this.db.escape(Country)   + "," + _this.db.escape(State) + "," + _this.db.escape(City)   + "," + _this.db.escape(Area) + ","  + _this.db.escape(Latitude)  + "," + _this.db.escape(Longitude)  +  "," + _this.db.escape(EZEID)  + "," + _this.db.escape(ContactInfo)  + "," + _this.db.escape(FolderRuleID)  + "," + _this.db.escape(Duration)  + "," + _this.db.escape(DurationScales) + "," + _this.db.escape(NextAction) + "," + _this.db.escape(NextActionDateTimeNew) + "," + _this.db.escape(TID) + "," + _this.db.escape(((ItemIDList != "") ? ItemIDList : "")) + "," + _this.db.escape(DeliveryAddress) + "," + _this.db.escape(ToEZEID) + "," + _this.db.escape(item_list_type) + "," + _this.db.escape(companyName) + "," + _this.db.escape(company_id);
                        // _this.db.escape(NextActionDateTime);
                        console.log('CALL pSaveTrans(' + query + ')');
                        _this.db.query('CALL pSaveTrans(' + query + ')', function (err, InsertResult) {
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
                                                var query = _this.db.query('INSERT INTO titems SET ?', items, function (err, result) {
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
                                                var query = _this.db.query("UPDATE titems set ? WHERE TID = ? ",[items,itemsDetails.TID], function (err, result) {
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

            var query = _this.db.escape(TID) + ', ' + _this.db.escape(status) + ',' + _this.db.escape(folderRuleID) + ',' + _this.db.escape(nextAction) + ',' + _this.db.escape(nextActionDateTime)+ ', ' + _this.db.escape(Token);
            _this.db.query('CALL pUpdateTrans(' + query + ')', function (err, updateResult) {
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

                        _this.db.query('CALL pGetTranscationItems(' + _this.db.escape(MessageID) + ')', function (err, GetResult) {
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
        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    var query = _this.db.escape(MessageID) + ',' + _this.db.escape(ItemID) + ',' + _this.db.escape(Qty) + ',' + _this.db.escape(Rate) + ',' +_this.db.escape(Amount) + ',' +_this.db.escape(Duration);
                    _this.db.query('CALL pSaveTranscationItems(' + query + ')', function (err, InsertResult) {
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
                        _this.db.query('CALL pGetOutboxMessages(' + _this.db.escape(Token) + ',' + _this.db.escape(pagesize) + ',' + _this.db.escape(pagecount)+ ')', function (err, GetResult) {
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

            _this.db.query('CALL PgetTransAutocomplete(' + _this.db.escape(title) + ',' + _this.db.escape(type) + ')', function (err, GetResult) {
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
        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    console.log('CALL pItemListforEZEID(' +  db.escape(FunctionType)  + ',' + db.escape(EZEID) + ')');
                    db.query('CALL pItemListforEZEID(' +  db.escape(FunctionType)  + ',' + db.escape(EZEID) + ')', function (err, GetResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pDeleteTransactionItems(' + db.escape(ItemTID) + ')', function (err, deleteResult) {
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
        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    db.query('CALL pItemList(' + db.escape(Token) + ',' + db.escape(FunctionType) + ')', function (err, GetResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pItemDetails(' + db.escape(TID) + ')', function (err, GetResult) {
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

    }
};

module.exports = BusinessManager;