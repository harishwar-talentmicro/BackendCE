/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Configuration module
 *  @description Handles all core configuration functions as follows
 *  1.
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

function Configuration(db,stdLib){

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
Configuration.prototype.save = function(req,res,next){
    /**
     * @todo FnSaveConfig
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var SalesTitle = req.body.SalesTitle;
        var ReservationTitle = req.body.ReservationTitle;
        var HomeDeliveryTitle = req.body.HomeDeliveryTitle;
        var ServiceTitle = req.body.ServiceTitle;
        var ResumeTitle = req.body.ResumeTitle;
        var VisibleModules = req.body.VisibleModules;
        var SalesItemListType = req.body.SalesItemListType;
        var HomeDeliveryItemListType = req.body.HomeDeliveryItemListType;
        var ResumeKeyword = req.body.ResumeKeyword;
        var Category = req.body.Category;
        var Keyword = req.body.Keyword;
        var ReservationDisplayFormat = req.body.ReservationDisplayFormat;
        var DataRefreshInterval = req.body.DataRefreshInterval;
        var SalesFormMsg = req.body.SalesFormMsg;
        var ReservationFormMsg = req.body.ReservationFormMsg;
        var HomeDeliveryFormMsg = req.body.HomeDeliveryFormMsg;
        var ServiceFormMsg = req.body.ServiceFormMsg;
        var ResumeFormMsg = req.body.ResumeFormMsg;
        var FreshersAccepted = req.body.FreshersAccepted;
        var SalesURL = req.body.SalesURL;
        var ReservationURL = req.body.ReservationURL;
        var HomeDeliveryURL = req.body.HomeDeliveryURL;
        var ServiceURL = req.body.ServiceURL;
        var ResumeURL = req.body.ResumeURL;
        var deal_enable = (parseInt(req.body.deal_enable) != NaN) ? parseInt(req.body.deal_enable) : 2;
        var deal_banner = req.body.deal_banner ? req.body.deal_banner : '';
        var deal_title = req.body.deal_title ? req.body.deal_title : '';
        var deal_desc = req.body.deal_desc ? req.body.deal_desc : '' ;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && Keyword != null && Category != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(SalesTitle) + ',' + st.db.escape(ReservationTitle) + ',' + st.db.escape(HomeDeliveryTitle) + ',' +st.db.escape(ServiceTitle)
                            + ',' +st.db.escape(ResumeTitle) + ',' +st.db.escape(VisibleModules) + ',' +st.db.escape(SalesItemListType) + ',' +st.db.escape(HomeDeliveryItemListType)
                            + ',' +st.db.escape(ResumeKeyword) + ',' +st.db.escape(Category) + ',' +st.db.escape(Keyword) + ',' +st.db.escape(ReservationDisplayFormat) + ',' +st.db.escape(DataRefreshInterval)
                            + ',' + st.db.escape(SalesFormMsg) + ',' + st.db.escape(ReservationFormMsg) + ',' + st.db.escape(HomeDeliveryFormMsg) + ',' +st.db.escape(ServiceFormMsg) + ',' +st.db.escape(ResumeFormMsg)
                            + ',' +st.db.escape(FreshersAccepted) + ',' +st.db.escape(SalesURL) + ',' +st.db.escape(ReservationURL)
                            + ',' +st.db.escape(HomeDeliveryURL) + ',' +st.db.escape(ServiceURL) + ',' +st.db.escape(ResumeURL)  + ',' +st.db.escape(deal_enable) + ',' +st.db.escape(deal_banner) + ',' +st.db.escape(deal_title) + ',' +st.db.escape(deal_desc);

                        st.db.query('CALL pSaveConfig(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveConfig:  Config details save successfully');
                                }
                                else {
                                    console.log('FnSaveConfig:No Save Config details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveConfig: error in saving Config details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveConfig: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveConfig:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveConfig: Token is empty');
            }
            else if (Category == null) {
                console.log('FnSaveConfig: Category is empty');
            }
            else if (Keyword == null) {
                console.log('FnSaveConfig: Keyword is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveConfig:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.get = function(req,res,next){
    /**
     * @todo FnGetConfig
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        st.db.query('CALL pGetconfiguration(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetConfig: Details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetConfig:No Details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetConfig:No Details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetConfig: error in getting config details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetConfig: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetConfig: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetConfig: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetConfig error:' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getBusinessCategories = function(req,res,next){
    /**
     * @todo FnGetCategory
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);
        if (LangID.toString() != 'NaN') {
            var Query = 'Select CategoryID, CategoryTitle from mcategory where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, CategoryResult) {
                if (!err) {
                    if (CategoryResult.length > 0) {
                        res.send(CategoryResult);
                        console.log('FnGetCategory: mcategory: Category sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetCategory: mcategory: No category found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetCategory: mcategory: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetCategory: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnCategory error:' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getStatusTypes = function(req,res,next){
    /**
     * @todo FnGetStatusType
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;

        if (Token != null  && FunctionType != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(FunctionType);
                        st.db.query('CALL pGetStatusType(' + query + ')', function (err, StatusResult) {
                            if (!err) {
                                if (StatusResult) {
                                    if (StatusResult[0].length > 0) {
                                        console.log('FnGetStatusType: Status type details Send successfully');
                                        res.send(StatusResult[0]);
                                    }
                                    else {

                                        console.log('FnGetStatusType:No Status type details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetStatusType:No Status type details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetStatusType: error in getting Status type details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetStatusType: Invalid Token');
                    }
                } else {

                    res.statusCode = 401;
                    res.json(null);
                    console.log('FnGetStatusType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetStatusType: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetStatusType: FunctionType is empty');
            }

            res.statusCode=401;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetStatusType error:' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.StatusTypes = function(req,res,next){
    /**
     * @todo FnStatusType
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;
        var RtnMessage = {
            Result: [],
            Message: ''
        };

        if (Token != null  && FunctionType != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var StatusAllOpen =
                        {
                            TID:'-1',
                            MasterID:'0',
                            StatusTitle:'All Open',
                            ProgressPercent:0,
                            Status:1,
                            NotificationMsg:"",
                            NotificationMailMsg:"",
                            StatusValue:"11"
                        };
                        var StatusAll = {
                            TID:'-2',
                            MasterID:'0',
                            StatusTitle:'All',
                            ProgressPercent:0,
                            Status:1,
                            NotificationMsg:"",
                            NotificationMailMsg:"",
                            StatusValue:"12"
                        };


                        var query = st.db.escape(Token) + ',' + st.db.escape(FunctionType);
                        st.db.query('CALL pGetStatusType(' + query + ')', function (err, StatusResult) {

                            if (!err) {
                                if (StatusResult != null) {
                                    if (StatusResult[0].length > 0) {
                                        StatusResult[0].unshift(StatusAll);
                                        StatusResult[0].unshift(StatusAllOpen);
                                        RtnMessage.Result = StatusResult[0];
                                        RtnMessage.Message = 'Status type details Send successfully';
                                        console.log('FnStatusType: Status type details Send successfully');
                                        res.send(RtnMessage);

                                    }
                                    else {

                                        console.log('FnGetStatusType:No Status type details found');
                                        RtnMessage.Message ='No Status type details found';
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnStatusType:No Status type details found');
                                    RtnMessage.Message ='No Status type details found';
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                RtnMessage.Message = 'error in getting Status type details';
                                console.log('FnStatusType: error in getting Status type details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        RtnMessage.Message = 'Invalid Token';
                        res.send(RtnMessage);
                        console.log('FnStatusType: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    RtnMessage.Message = 'Error in validating token';
                    res.send(RtnMessage);
                    console.log('FnStatusType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnStatusType: Token is empty');
                RtnMessage.Message ='Token is empty';
            }
            else if (FunctionType == null) {
                console.log('FnStatusType: FunctionType is empty');
                RtnMessage.Message ='FunctionType is empty';
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetStatusType error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveStatusType = function(req,res,next){
    /**
     * @todo FnSaveStatusType
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var FunctionType = req.body.FunctionType;
        var StatusTitle = req.body.StatusTitle;
        var ProgressPercent = req.body.ProgressPercent;
        var Status = req.body.Status;
        var NotificationMsg = req.body.NotificationMsg;
        var NotificationMailMsg = req.body.NotificationMailMsg;
        var StatusValue =req.body.StatusValue;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && TID.toString() != 'NaN') {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Token) + ',' + st.db.escape(TID) + ',' + st.db.escape(FunctionType) + ',' + st.db.escape(StatusTitle)
                            + ',' +st.db.escape(ProgressPercent) + ',' +st.db.escape(Status) + ',' +st.db.escape(NotificationMsg) + ',' +st.db.escape(NotificationMailMsg)
                            + ',' + st.db.escape(StatusValue);
                        st.db.query('CALL pSaveStatusTypes(' + query + ')', function (err, result) {
                            if (!err) {
                                if(result != null){
                                    if(result.affectedRows > 0){
                                        console.log('FnSaveStatusType: Status type saved successfully');
                                        RtnMessage.IsSuccessfull = true;
                                        res.send(RtnMessage);
                                    }
                                    else
                                    {
                                        console.log('FnSaveStatusType: Status type not saved');
                                        res.send(RtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnSaveStatusType: Status type  not saved');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveStatusType: error in saving Status type ' +err);
                                res.send(RtnMessage);
                            }
                        });

                    }


                    else {
                        console.log('FnSaveStatusType: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveStatusType:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveStatusType: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveStatusType: MasterID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveStatusType:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getActionTypes = function(req,res,next){
    /**
     * @todo FnGetActionType
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;

        if (Token != null && FunctionType != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(FunctionType);

                        st.db.query('CALL pGetActionType(' + query + ')', function (err, StatusResult) {
                            if (!err) {
                                if (StatusResult) {
                                    if (StatusResult[0].length > 0) {

                                        console.log('FnGetActionType: Action Type details Send successfully');
                                        res.send(StatusResult[0]);
                                    }
                                    else {

                                        console.log('FnGetActionType:No Action Type details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetActionType:No Action type details found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnGetActionType: error in getting Action Type details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetActionType: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetActionType: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetActionType: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetActionType: FunctionType is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetActionType error:' + ex.description);
          
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveActionType = function(req,res,next){
    /**
     * @todo FnSaveActionType
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var FunctionType = req.body.FunctionType;
        var ActionTitle = req.body.ActionTitle;
        var Status = req.body.Status;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && TID.toString() != 'NaN') {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Token) + ',' + st.db.escape(TID) + ',' + st.db.escape(FunctionType) + ',' + st.db.escape(ActionTitle)
                            + ',' +st.db.escape(Status);
                        st.db.query('CALL pSaveActionTypes(' + query + ')', function (err, result) {
                            if (!err) {
                                if(result){
                                    if(result.affectedRows > 0){
                                        console.log('FnSaveActionType: Action types saved successfully');
                                        RtnMessage.IsSuccessfull = true;
                                        res.send(RtnMessage);
                                    }
                                    else
                                    {
                                        console.log('FnSaveActionType:  Action types not saved');
                                        res.send(RtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnSaveActionType:  Action types not saved');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveActionType: error in saving  Action types' +err);
                                res.send(RtnMessage);
                            }
                        });

                    }

                    else {
                        console.log('FnSaveActionType: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveActionType: Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveActionType: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveActionType: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveActionType :error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getItems = function(req,res,next){
    /**
     * @todo FnGetItemList
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;
        if(Token == "")
            Token= null;
        if (Token != null && FunctionType != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        st.db.query('CALL pGetItemList(' + st.db.escape(Token) + ',' + st.db.escape(FunctionType) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0]) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetItemList: Item list details Send successfully');
                                        res.json(GetResult[0]);
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
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveItems = function(req,res,next){
    /**
     * @todo FnSaveItem
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var FunctionType = req.body.FunctionType;
        var ItemName = req.body.ItemName;
        var ItemDescription = req.body.ItemDescription;
        var Pic = req.body.Pic;
        var Rate = req.body.Rate;
        var Status = req.body.Status;
        var ItemDuration = req.body.ItemDuration;

        var RtnMessage = {
            IsSuccessfull: false
        };
        if(Rate == null || Rate =="")
            Rate=0.00;
        if (Token != null  && FunctionType != null && ItemName !=null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = st.db.escape(TID) + ',' + st.db.escape(Token) + ',' + st.db.escape(FunctionType) + ',' + st.db.escape(ItemName)
                            + ',' +st.db.escape(ItemDescription) + ',' +st.db.escape(Pic) + ',' +st.db.escape(Rate) + ',' +st.db.escape(Status) + ',' +st.db.escape(ItemDuration);
                        st.db.query('CALL pSaveItem(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveItem: Item details save successfully');
                                }
                                else {
                                    console.log('FnSaveItem:No Save Item details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveItem: error in saving item detail' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveItem: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveItem:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveItem: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnSaveItem: FunctionType is empty');
            }
            else if (ItemName == null) {
                console.log('FnSaveItem: ItemName is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveItem:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getFolders = function(req,res,next){
    /**
     * @todo FnGetFolderList
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
                    if (Result) {

                        st.db.query('CALL pGetFolderList(' + st.db.escape(Token) + ',' + st.db.escape(FunctionType) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0]) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetRoleList: Role list details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetRoleList:No Role list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetRoleList:No Role list details found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnGetRoleList: error in getting Role list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetRoleList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetRoleList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetRoleList: Token is empty');
            }
            else if (FunctionType = null) {
                console.log('FnGetRoleList: FunctionType is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetRoleList error:' + ex.description);
          
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveFolder = function(req,res,next){
    /**
     * @todo FnSaveFolderRules
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var FolderTitle = req.body.FolderTitle;
        var RuleFunction = req.body.RuleFunction;
        var RuleType = req.body.RuleType;
        var CountryID = req.body.CountryID;
        var MatchAdminLevel = req.body.MatchAdminLevel;
        var MappedNames = req.body.MappedNames;
        var Latitude =req.body.Latitude;
        var Longitude = req.body.Longitude;
        var Proximity =req.body.Proximity;
        var DefaultFolder =req.body.DefaultFolder;
        var FolderStatus = req.body.FolderStatus;
        var SeqNoFrefix = req.body.SeqNoFrefix;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && TID.toString() != 'NaN') {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Token) + ',' + st.db.escape(TID) + ',' + st.db.escape(FolderTitle) + ',' + st.db.escape(RuleFunction)
                            + ',' +st.db.escape(RuleType) + ',' +st.db.escape(CountryID) + ',' +st.db.escape(MatchAdminLevel) + ',' +st.db.escape(MappedNames) + ',' + st.db.escape(Latitude)
                            + ',' +st.db.escape(Longitude) + ',' +st.db.escape(Proximity) + ',' +st.db.escape(DefaultFolder) + ',' +st.db.escape(FolderStatus) + ',' +st.db.escape(SeqNoFrefix);
                        st.db.query('CALL pSaveFolderRules(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                console.log(InsertResult);
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveFolderRules: Folder rules details save successfully');
                                }
                                else {
                                    console.log('FnSaveFolderRules:No Folder rules details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveFolderRules: error in saving Folder rules details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveFolderRules: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveFolderRules:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveFolderRules: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveFolderRules: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveFolderRules:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getSubusers = function(req,res,next){
    /**
     * @todo FnGetSubuserList
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        st.db.query('CALL pGetSubUserList(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetSubUserList: Sub user list details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetSubUserList:No Sub user  list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetSubUserList:No Sub user  list details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetSubUserList: error in getting Sub user  list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetSubUserList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetSubUserList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetSubUserList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetSubUserList error:' + ex.description);
          
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.createSubuser = function(req,res,next){
    /**
     * @todo FnCreateSubUser
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var UserName = req.body.UserName;
        var Status  = req.body.Status;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var AccessRights = req.body.AccessRights;
        var SalesEmail = req.body.SalesEmail;
        var ReservationEmail = req.body.ReservationEmail;
        var HomeDeliveryEmail = req.body.HomeDeliveryEmail;
        var ServiceEmail = req.body.ServiceEmail;
        var ResumeEmail = req.body.ResumeEmail;
        var SalesRules = req.body.SalesRules;
        var ReservationRules = req.body.ReservationRules;
        var HomeDeliveryRules = req.body.HomeDeliveryRules;
        var ServiceRules = req.body.ServiceRules;
        var ResumeRules = req.body.ResumeRules;
        var MasterID = req.body.PersonalID;
        var templateID = parseInt(req.body.templateID);
        if(templateID.toString() == 'NaN')
            templateID =0;

        var RtnMessage = {
            IsSuccessfull: false,
            TID: 0
        };

        /*if (Token!= null && TID!= null && UserName!= null  && Status!= null && FirstName != null && LastName !=null && AccessRights !=null && SalesEmail != null
         && ReservationEmail!= null && HomeDeliveryEmail!= null && ServiceEmail!= null && ResumeEmail !=null  && SalesRules != null
         && ReservationRules != null && HomeDeliveryRules != null && ServiceRules != null && ResumeRules != null) {*/
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result) {
                    console.log(Result);
                    var query = st.db.escape(Token) + ',' + st.db.escape(TID) + ',' + st.db.escape(UserName) + ',' +st.db.escape(Status) + ',' +st.db.escape(FirstName) + ',' +st.db.escape(LastName)
                        + ',' + st.db.escape(AccessRights) + ',' + st.db.escape(SalesEmail) + ',' + st.db.escape(ReservationEmail) + ',' +st.db.escape(HomeDeliveryEmail)
                        + ',' + st.db.escape(ServiceEmail) + ',' + st.db.escape(ResumeEmail) + ',' + st.db.escape(SalesRules) + ',' +st.db.escape(ReservationRules)
                        + ',' + st.db.escape(HomeDeliveryRules) + ',' + st.db.escape(ServiceRules) + ',' + st.db.escape(ResumeRules) + ',' + st.db.escape(MasterID) + ',' + st.db.escape(templateID);
                    console.log(query);
                    st.db.query('CALL pCreateSubUser(' + query + ')', function (err, InsertResult) {
                        if (!err){
                            if (InsertResult[0])
                            {
                                if(InsertResult[0].length > 0)
                                {
                                    var Result = InsertResult[0];
                                    if(Result[0].RowAffected == 1)
                                    {
                                        RtnMessage.IsSuccessfull = true;
                                        RtnMessage.TID = Result[0].TID;
                                        res.send(RtnMessage);
                                        console.log('FnCreateSubUser: Sub User details save successfully');}
                                    else
                                    {
                                        console.log('FnCreateSubUser:No Save Sub User details');
                                        res.send(RtnMessage);
                                    }
                                }
                                else
                                {
                                    console.log('FnCreateSubUser:No Save Sub User details');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnCreateSubUser:No Save Sub User details');
                                res.send(RtnMessage);
                            }
                        }
                        else {
                            console.log('FnCreateSubUser: error in saving Sub User details' + err);
                            res.statusCode = 500;
                            res.send(RtnMessage);
                        }
                    });
                }
                else {
                    console.log('FnCreateSubUser: Invalid token');
                    res.statusCode = 401;
                    res.send(RtnMessage);
                }
            }
            else {
                console.log('FnCreateSubUser:Error in processing Token' + err);
                res.statusCode = 500;
                res.send(RtnMessage);
            }
        });
    }
    catch (ex) {
        console.log('FnCreateSubUser:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getReservationResources = function(req,res,next){
    /**
     * @todo FnGetReservationResource
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var type = req.query.type ? req.query.type : 0 ;

        console.log(req.query);

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            var query = st.db.escape(ezeid) + ', ' + st.db.escape(type);
            console.log(query);
            st.db.query('CALL pGetResource(' + query + ')', function (err, GetResult) {

                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Resource details Send successfully';
                            console.log('FnGetReservationResource: Resource details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Resource details';
                            console.log('FnGetReservationResource: No founded Resource details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No Resource details found';
                        console.log('FnGetReservationResource: No Resource details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Resource details';
                    console.log('FnGetReservationResource: error in getting Resource details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!Token) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservationResource: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservationResource:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveReservationResource = function(req,res,next){
    /**
     * @todo FnSaveReseravtionResource
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var picture = (req.body.picture) ? ((req.body.picture.trim().length > 0) ? req.body.picture : null ) : null ;;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var description = req.body.description;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var operatorid = req.body.operatorid ? req.body.operatorid : '';
        var workingtemp = req.body.working_temp ? req.body.working_temp : 0;
        if (TID.toString() == 'NaN')
            TID = 0;
        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!picture){
            responseMessage.error['picture'] = 'Invalid Picture';
            validateStatus *= false;
        }

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationResource  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token && operatorid) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(picture) + ',' + st.db.escape(title) + ',' + st.db.escape(description) + ',' + st.db.escape(status)+ ',' + st.db.escape(operatorid) + ',' + st.db.escape(workingtemp);
                        st.db.query('CALL pSaveResource(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Resource details save successfully';
                                    responseMessage.data = {
                                        TID : insertResult[0][0].maxid,
                                        title : req.body.title,
                                        status : req.body.status,
                                        description : req.body.description,
                                        picture : req.body.picture
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservationResource: Resource details save successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationResource:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationResource: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationResource: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationResource:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationResource: Token is mandatory field');
            }
            else if(!operatorid)
            {
                responseMessage.message = 'Invalid Operator ID';
                responseMessage.error = {operatorid : 'Invalid Operator ID'};
                console.log('FnSaveReservationResource: Operator ID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservationResource:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationResource = function(req,res,next){
    /**
     * @todo FnUpdateReservationResource
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var picture = (req.body.picture) ? ((req.body.picture.trim().length > 0) ? req.body.picture : null ) : null ;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;
        var description = req.body.description;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var operatorid = req.body.operatorid;
        var workingTemp = (parseInt(req.body.working_temp) !== NaN) ? parseInt(req.body.working_temp) : 0;

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!picture){
            responseMessage.error['picture'] = 'Invalid Picture';
            validateStatus *= false;
        }

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnUpdateReservationResource  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to update resource ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token && operatorid) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' +
                            st.db.escape(TID) + ',' + st.db.escape(picture) +
                            ',' + st.db.escape(title) + ',' + st.db.escape(description) +
                            ',' + st.db.escape(status) + ',' + st.db.escape(operatorid) + ','+st.db.escape(workingTemp);
                        st.db.query('CALL pSaveResource(' + query + ')', function (err, updateResult) {
                            if (!err){
                                if (updateResult.affectedRows > 0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Resource details update successfully';
                                    responseMessage.data = {
                                        TID : req.body.TID,
                                        title : req.body.title,
                                        status : req.body.status,
                                        description : req.body.description,
                                        picture : req.body.pictures
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateReservationResource: Resource details update successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnUpdateReservationResource:No Resource details updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateReservationResource: error in updating Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateReservationResource: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in processing Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateReservationResource:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateReservationResource: Token is mandatory field');
            }
            else if(!operatorid)
            {
                responseMessage.message = 'Invalid Operator ID';
                responseMessage.error = {operatorid : 'Invalid Operator ID'};
                console.log('FnUpdateReservationResource: Operator ID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateReservationResource:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getReservationServices = function(req,res,next){
    /**
     * @todo FnGetReservationService
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            st.db.query('CALL pGetResServices(' + st.db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0];
                            responseMessage.error = null;
                            responseMessage.message = 'Service details Send successfully';
                            console.log('FnGetReservationService: Service details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded service details';
                            console.log('FnGetReservationService: No founded Service details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No Service details found';
                        console.log('FnGetReservationService: No Service details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Service details';
                    console.log('FnGetReservationService: error in getting Service details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {
            if (!Token) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservationService: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservationService:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveReservationService = function(req,res,next){
    /**
     * @todo FnSaveReservationService
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = 0;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = req.body.service_ids ? req.body.service_ids : 0;

        var ID=''
        if(service_ids){
            ID = service_ids + ',' + ID;
            service_ids =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_ids);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }


        if (Token) {

            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(title) + ',' + st.db.escape(duration) + ',' + st.db.escape(rate) + ',' + st.db.escape(status)+ ',' + st.db.escape(service_ids);
                        st.db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Service details save successfully';
                                    responseMessage.data = {
                                        TID : insertResult[0][0].maxid,
                                        title : req.body.title,
                                        status : req.body.status,
                                        duration : req.body.duration,
                                        rate : req.body.rate,
                                        service_ids : req.body.service_ids
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservationService: Service details save successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationService:No Service details saved');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationService: Token is mandatory field hello');
            }
            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservationService:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationService = function(req,res,next){
    /**
     * @todo FnUpdateReservationService
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = req.body.service_ids;

        var ID=''
        if(service_ids){

            ID = service_ids + ',' + ID;
            var service_IDS =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_IDS);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnUpdateReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to update service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(Token) + ', ' + st.db.escape(TID) + ',' + st.db.escape(title) + ',' + st.db.escape(duration) + ',' + st.db.escape(rate) + ',' + st.db.escape(status)+ ',' + st.db.escape(service_IDS);
                        st.db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Service details update successfully';
                                    responseMessage.data = {
                                        TID : req.body.TID,
                                        title : req.body.title,
                                        status : req.body.status,
                                        duration : req.body.duration,
                                        rate : req.body.rate,
                                        service_ids : req.body.service_ids
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateReservationService: Service details update successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnUpdateReservationService:No Service details updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateReservationService: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateReservationService:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getResourceServiceMaps = function(req,res,next){
    /**
     * @todo FnGetReservResourceServiceMap,
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            Message:''
        };

        if (ezeid) {

            st.db.query('CALL pGetResResourceServiceMap(' + st.db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'ResourceServiceMap details Send successfully';
                            console.log('FnGetReservResourceServiceMap: ResourceServiceMap details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded ResourceServiceMap details';
                            console.log('FnGetReservResourceServiceMap: No founded ResourceServiceMap details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No ResourceServiceMap details found';
                        console.log('FnGetReservResourceServiceMap: No ResourceServiceMap details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting ResourceServiceMap details';
                    console.log('FnGetReservResourceServiceMap: error in getting ResourceServiceMap details' + err);
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
                console.log('FnGetReservResourceServiceMap: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservResourceServiceMap:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveResourceServiceMap = function(req,res,next){
    /**
     * @todo FnSaveReservResourceServiceMap
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var resourceid = req.body.resourceid;
        var serviceids = req.body.serviceids;

        var ID='';
        if(serviceids){
            ID = serviceids + ',' + ID;
            serviceids =ID.slice(0,-1);
            console.log(serviceids);
        }
        var service_id = serviceids.concat(',');
        console.log('service_ids Values:'+ service_id);
        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!resourceid){
            responseMessage.error['resourceid'] = 'Invalid Resourceid';
            validateStatus *= false;
        }

        if(!serviceids){
            responseMessage.error['serviceids'] = 'Invalid Service_ids';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservResServiceMap  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource and service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            st.validateToken(Token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = st.db.escape(resourceid) + ',' + st.db.escape(service_id);
                        st.db.query('CALL pSaveResResourceServiceMap(' + query + ')', function (err, insertResult) {

                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'ResourceService Map details save successfully';
                                    responseMessage.data = {
                                        resourceid : req.body.resourceid,
                                        serviceids : service_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap: ResourceService Map details save successfully');

                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservResServiceMap: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservResServiceMap: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservResServiceMap:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservResServiceMap: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservResServiceMap:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getWorkingHoursTemplates = function(req,res,next){
    /**
     * @todo FnGetWorkingHours
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        st.db.query('CALL pGetWorkingHours(' + st.db.escape(Token) +',' + st.db.escape(0)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetWorkingHours: Working Hours details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetWorkingHours:No Working Hours details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWorkingHours:No Working Hours details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWorkingHours: error in getting Working Hours details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWorkingHours: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWorkingHours: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWorkingHours: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetWorkingHours error:' + ex.description);
          
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveWorkingHoursTemplate = function(req,res,next){
    /**
     * @todo FnSaveWorkingHours
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var SpilloverTime = req.body.SpilloverTime;
        var MO1 = req.body.MO1;
        var MO2 = req.body.MO2;
        var MO3 = req.body.MO3;
        var MO4 = req.body.MO4;
        var TU1 = req.body.TU1;
        var TU2 = req.body.TU2;
        var TU3 = req.body.TU3;
        var TU4 = req.body.TU4;
        var WE1 = req.body.WE1;
        var WE2 = req.body.WE2;
        var WE3 = req.body.WE3;
        var WE4 = req.body.WE4;
        var TH1 = req.body.TH1;
        var TH2 = req.body.TH2;
        var TH3 = req.body.TH3;
        var TH4 = req.body.TH4;
        var FR1 = req.body.FR1;
        var FR2 = req.body.FR2;
        var FR3 = req.body.FR3;
        var FR4 = req.body.FR4;
        var SA1 = req.body.SA1;
        var SA2 = req.body.SA2;
        var SA3 = req.body.SA3;
        var SA4 = req.body.SA4;
        var SU1 = req.body.SU1;
        var SU2 = req.body.SU2;
        var SU3 = req.body.SU3;
        var SU4 = req.body.SU4;
        var WorkingHrsTemplate = req.body.WorkingHrsTemplate;
        var TID = req.body.TID;


        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && SpilloverTime != null && WorkingHrsTemplate != null && TID != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var query = st.db.escape(Token) + ',' + st.db.escape(SpilloverTime) + ',' + st.db.escape(MO1) + ',' + st.db.escape(MO2) + ',' + st.db.escape(MO3) + ',' + st.db.escape(MO4)
                            + ',' + st.db.escape(TU1) + ',' + st.db.escape(TU2) + ',' + st.db.escape(TU3) + ',' + st.db.escape(TU4)
                            + ',' + st.db.escape(WE1) + ',' + st.db.escape(WE2) + ',' + st.db.escape(WE3) + ',' + st.db.escape(WE4)
                            + ',' + st.db.escape(TH1) + ',' + st.db.escape(TH2) + ',' + st.db.escape(TH3) + ',' + st.db.escape(TH4)
                            + ',' + st.db.escape(FR1) + ',' + st.db.escape(FR2) + ',' + st.db.escape(FR3) + ',' + st.db.escape(FR4)
                            + ',' + st.db.escape(SA1) + ',' + st.db.escape(SA2) + ',' + st.db.escape(SA3) + ',' + st.db.escape(SA4)
                            + ',' + st.db.escape(SU1) + ',' + st.db.escape(SU2) + ',' + st.db.escape(SU3) + ',' + st.db.escape(SU4)
                            + ',' + st.db.escape(WorkingHrsTemplate) + ',' + st.db.escape(TID);
                        st.db.query('CALL pSaveWorkingHours(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveWorkingHours: Working Hours details save successfully');
                                }
                                else {
                                    console.log('FnSaveWorkingHours:No Save Working Hours details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveWorkingHours: error in saving Working Hours details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWorkingHours: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWorkingHours:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveWorkingHours: Token is empty');
            }
            else if (SpilloverTime == null) {
                console.log('FnSaveWorkingHours: SpilloverTime is empty');
            }
            else if (WorkingHrsTemplate == null) {
                console.log('FnSaveWorkingHours: WorkingHrsTemplate is empty');
            }
            else if (TID == null) {
                console.log('FnSaveWorkingHours: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWorkingHours:error ' + ex.description);
          
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getHolidays = function(req,res,next){
    /**
     * @todo FnGetHolidayList
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var LocID = req.query.LocID;
        var TemplateID = req.query.TemplateID;
        if(LocID == null && LocID == '')
            LocID=0;
        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        st.db.query('CALL pGetHolidayList(' + st.db.escape(LocID) + ',' + st.db.escape(TemplateID)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetHolidayList: Holiday list Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetHolidayList:No Holiday list found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetHolidayList:No Holiday list found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetHolidayList: error in getting Holiday list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetHolidayList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetHolidayList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetHolidayList: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetHolidayList error:' + ex.description);
          
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveHoliday = function(req,res,next){
    /**
     * @todo FnSaveHolidayCalendar
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var HolidayDate = req.body.HolidayDate;
        var HolidayTitle = req.body.HolidayTitle;
        var TemplateID = req.body.TemplateID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && TID != null && HolidayTitle != null  && HolidayDate != null && TemplateID != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(TID) + ',' + st.db.escape(Token) + ',' + st.db.escape(new Date(HolidayDate)) + ',' + st.db.escape(HolidayTitle) + ',' + st.db.escape(TemplateID);
                        st.db.query('CALL pSaveHolidayCalendar(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveHolidayCalendar: Holiday calander details save successfully');
                                }
                                else {
                                    console.log('FnSaveHolidayCalendar:No Save Holiday calander details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveHolidayCalendar: error in saving Holiday calander details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveHolidayCalendar: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveHolidayCalendar:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveHolidayCalendar: Token is empty');
            }
            else if (TID == null) {
                console.log('FnSaveHolidayCalendar: TID is empty');
            }
            else if (HolidayTitle == null) {
                console.log('FnSaveHolidayCalendar: HolidayTitle is empty');
            }
            else if (HolidayDate == null) {
                console.log('FnSaveHolidayCalendar: HolidayDate is empty');
            }
            else if (TemplateID == null) {
                console.log('FnSaveHolidayCalendar: TemplateID is empty');
            }


            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveHolidayCalendar:error ' + ex.description);
          
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.deleteHoliday = function(req,res,next){
    /**
     * @todo FnDeleteHolidayList
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var Token = req.query.Token;
        var TID = req.query.TID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && TID != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        //var query = st.db.escape(Token) + ',' + st.db.escape(TID);
                        st.db.query('CALL pDeleteHolidayList(' + st.db.escape(TID) + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteHolidayList: Holiday list delete successfully');
                                }
                                else {
                                    console.log('FnDeleteHolidayList:No delete Holiday list');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnDeleteHolidayList: error in deleting Holiday list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteHolidayList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteHolidayList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnDeleteHolidayList: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteHolidayList: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteHolidayList:error ' + ex.description);
          
    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.deleteWorkingHours = function(req,res,next){
    /**
     * @todo FnDeleteWorkingHours
     */
    var _this = this;
    try{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var TID = req.query.TID;
    var RtnMessage = {
        IsSuccessfull: false,
        Message:''
    };
    var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

    if (Token !=null && TID != null) {
        st.validateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('CALL pDeleteWorkinghours(' + st.db.escape(TID) + ')');
                    st.db.query('CALL pDeleteWorkinghours(' + st.db.escape(TID) + ')', function (err, deleteResult) {
                        if (!err){

                            RtnMessage.IsSuccessfull = true;
                            RtnMessage.Message = 'delete successfully';
                            res.send(RtnMessage);
                            console.log('FnDeleteWorkingHours:Working Hours delete successfully');
                        }
                        else {
                            console.log('FnDeleteWorkingHours: error in deleting Working Hours' + err);
                            res.statusCode = 500;
                            RtnMessage.Message = 'Error in deleting';
                            res.send(RtnMessage);
                        }
                    });
                }
                else {
                    console.log('FnDeleteWorkingHours: Invalid token');
                    res.statusCode = 401;
                    res.send(RtnMessage);
                }
            }
            else {
                console.log('FnDeleteWorkingHours:Error in processing Token' + err);
                res.statusCode = 500;
                res.send(RtnMessage);
            }
        });
    }
    else {
        if (Token == null) {
            console.log('FnDeleteWorkingHours: Token is empty');
        }
        else if (TID == null) {
            console.log('FnDeleteWorkingHours: TID is empty');
        }
        res.statusCode=400;
        res.send(RtnMessage);
    }
}
catch (ex) {
    console.log('FnDeleteWorkingHours:error ' + ex.description);

}
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.getWorkingHoursDetails = function(req,res,next){
    /**
     * @todo FnWorkingHoursDetails
     */
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var Token = req.query.Token;
    var TID = req.query.TID;


    var responseMessage = {
        status: false,
        data: null,
        error:{},
        message:''
    };

    if (TID) {

        st.db.query('CALL PGetworkinghourDetails(' + st.db.escape(Token) + ',' + st.db.escape(TID) + ')', function (err, GetResult) {
            console.log(GetResult)
            if (!err) {
                if (GetResult) {
                    if (GetResult[0].length > 0) {
                        responseMessage.status = true;
                        responseMessage.data = GetResult[0] ;
                        responseMessage.error = null;
                        responseMessage.message = ' Working hours Send successfully';
                        console.log('FnWorkingHoursDetails:Working hours Send successfully');
                        res.status(200).json(responseMessage);
                    }
                    else {

                        responseMessage.error = {};
                        responseMessage.message = 'No founded Working hours';
                        console.log('FnWorkingHours: No founded Working hours');
                        res.json(responseMessage);
                    }
                }
                else {


                    responseMessage.error = {};
                    responseMessage.message = 'No founded Working hours list';
                    console.log('FnWorkingHours: No founded Working hours list');
                    res.json(responseMessage);
                }

            }
            else {

                responseMessage.data = null ;
                responseMessage.error = {};
                responseMessage.message = 'Error in getting Working hours list';
                console.log('FnWorkingHours: error in getting Working hours list' + err);
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
            console.log('FnWorkingHours: Token is mandatory field');
        }

        res.status(401).json(responseMessage);
    }
}
catch (ex) {
    responseMessage.error = {};
    responseMessage.message = 'An error occured !'
    console.log('FnWorkingHours:error ' + ex.description);
    //throw new Error(ex);
    res.status(400).json(responseMessage);
}
};

module.exports = Configuration;







