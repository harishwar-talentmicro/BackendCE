/**
 *  @author Gowri Shankar
 *  @since July o6,2015 04:24 PM IST
 *  @title user module
 *  @description Handles functions related to user profile module
 *
 */
"use strict";

function User_AP(db){
    this.db = db;
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.getUserDetailsAP = function(req,res,next){
    /**
     * @todo FnGetUserDetailsAP
     */
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var TokenNo = req.query.Token;
    var EZEID = req.query.EZEID;
    if (EZEID != null && EZEID != '' && TokenNo != null) {

        FnValidateTokenAP(TokenNo, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //var Query = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CompanyName,"") as CompanyName,ifnull(CategoryID,0) as CategoryID,ifnull(FunctionID,0) as FunctionID,ifnull(RoleID,0) as RoleID,ifnull(JobTitle,"") as JobTitle,ifnull(NameTitleID,0) as NameTitleID,ifnull(AboutCompany,"") as AboutCompany,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(AddressLine1,"") as AddressLine1,ifnull(AddressLine2,"") as AddressLine2,CityID,StateID,CountryID,ifnull(PostalCode,"") as PostalCode,b.PIN,ifnull(EMailID,"") as EMailID,ifnull(EMailVerifiedID,"") as EMailVerifiedID,ifnull(PhoneNumber,"") as PhoneNumber, ifnull(MobileNumber,"") as MobileNumber,ifnull(LaptopSLNO,"") as LaptopSLNO,ifnull(VehicleNumber,"") as VehicleNumber,ifnull(Website,"") as Website,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,ifnull(d.WorkingHours,"") as WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton ,ifnull(d.SalesEnquiryMailID,"") as SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,ifnull(d.HomeDeliveryMailID,"") as HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,ifnull(d.ReservationMailID,"") as ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,ifnull(d.SupportMailID,"") as SupportMailID,ifnull(d.CVButton,1) as CVButton,ifnull(d.CVMailID,"") as CVMailID,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName  from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo=0  and a.EZEID= ' + db.escape(EZEID);
                    //   var Query ='Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CategoryID,0) as CategoryID,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName,ifnull(doc.BRDocFilename,"") as BRDocFilename, ifnull(doc.BRDoc,"") as BRDoc,ifnull(doc.BRContentType,"") as BRContentType,b.Rating,ifnull(a.BusinessSize,0) as Size  from tmaster a left outer join tlocations b on a.TID = b.MasterID left outer Join tDocs c On a.TID=c.MasterID left outer join tdocs doc on a.TID= doc.MasterID where b.SeqNo=0  and a.EZEID=' + db.escape(EZEID);
                    db.query('Call pgetUserProfileAP('+db.escape(EZEID)+')', function (err, UserDetailsResult) {
                        if (!err) {
                            if (UserDetailsResult != null) {
                                if (UserDetailsResult[0].length > 0) {
                                    //console.log('FnGetUserDetails: Token: ' + Token);
                                    console.log('FnGetUserDetailsAP : pgetUserProfileAP: User details sent successfully');
                                    //  console.log(UserDetailsResult);
                                    res.send(UserDetailsResult[0]);
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetUserDetailsAP : tmaster: No User details found');
                                }
                            }
                            else {
                                res.json(null);
                                console.log('FnGetUserDetailsAP : tmaster: No User details found');
                            }

                        }
                        else {
                            res.statusCode=500;
                            res.json(null);
                            console.log('FnGetUserDetailsAP : tmaster:' + err);
                        }
                    });
                }
                else {
                    res.statusCode=401;
                    res.json(null);
                    console.log("Invalid Token");
                }
            }
            else
            {
                res.statusCode=500;
                res.json(null);
                console.log("Error in validating the token: "+err);
            }
        });
    }
    else {
        res.statusCode=400;
        res.json(null);
        console.log('FnGetUserDetailsAP :  EZEID is empty');
    }
}
catch (ex) {
    console.log('FnGetUserDetails error:' + ex.description);

}
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.updateUserProfileAP = function(req,res,next){
    /**
     * @todo FnUpdateUserProfileAP
     */
    var _this = this;
try {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    var EZEID = req.body.EZEID;
    var EZEIDVerifiedID = req.body.EZEIDVerifiedID;
    // var TID = parseInt(req.body.TID);
    var CategoryID = req.body.CategoryID;
    if (CategoryID == null || CategoryID == '') {
        CategoryID = 0;
    }
    var Latitude = req.body.Latitude;
    if (Latitude == null || Latitude == '') {
        Latitude = 0.0;
    }
    var Longitude = req.body.Longitude;
    if (Longitude == null || Longitude == '') {
        Longitude = 0.0;
    }

    var Keywords = req.body.Keywords;
    var Picture = req.body.Picture;
    var PictureFileName = req.body.PictureFileName;
    var Icon = req.body.Icon;
    var IconFileName = req.body.IconFileName;
    var BrochureDoc = req.body.BrochureDoc;
    var BrochureDocFile = req.body.BrochureDocFile;
    var ActiveInactive = req.body.ActiveInactive;
    var BRContentType = req.body.BRContentType;
    var Token = req.body.Token;
    var Rating = req.body.Rating;
    var Size = req.body.Size;
    var IDTypeId = req.body.IDTypeID;
    var SelectionType = req.body.SelectionType;
    var RtnMessage = {
        IsSuccessful: false
    };
    var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
    if (EZEID != null && Token != null && IDTypeId != null) {
        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    if(IDTypeId == 1){
                        var InsertQuery = db.escape(0) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' +
                            db.escape(EZEIDVerifiedID) + ',' + db.escape(Token) + ',' + db.escape('') + ',' + db.escape('') + ',' + db.escape('') + ',' +
                            db.escape('') + ',' + db.escape('') + ',' + db.escape(EZEID) + ',' +
                            db.escape('') + ',' + db.escape('') + ',' + db.escape(0)+ ',' + db.escape('')+ ',' + db.escape(0) + ',' + db.escape(0)+ ',' + db.escape(IDTypeId) + ',' + db.escape(SelectionType);
                        // console.log(InsertQuery);
                        db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    RtnMessage.IsSuccessful = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP: User Profile update successfully');

                                }
                                else {
                                    //console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnUpdateUserProfileAP:tmaster:' + err);
                            }
                        });
                    }
                    else
                    {
                        var InsertQuery = db.escape(CategoryID) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' +
                            db.escape(EZEIDVerifiedID) + ',' + db.escape(Token) + ',' + db.escape(Keywords) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' +
                            db.escape(Icon) + ',' + db.escape(IconFileName) + ',' + db.escape(EZEID) + ',' +
                            db.escape(BrochureDoc) + ',' + db.escape(BrochureDocFile) + ',' + db.escape(ActiveInactive)+ ',' + db.escape(BRContentType)+ ',' + db.escape(Rating) + ',' + db.escape(Size)+ ',' + db.escape(IDTypeId)  + ',' + db.escape(SelectionType);
                        // console.log('InsertQuery: ' + InsertQuery);
                        db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    RtnMessage.IsSuccessful = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP: User Profile update successfully');

                                }
                                else {
                                    //console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnUpdateUserProfileAP:tmaster:' + err);
                            }
                        });
                    }

                }
                else
                {
                    res.statusCode=401;
                    res.send(RtnMessage);
                    console.log('FnUpdateUserProfileAP:tmaster: Invalid Token');
                }
            }
            else {
                res.statusCode=500;
                res.send(RtnMessage);
                console.log('FnUpdateUserProfileAP:tmaster: error in validating token AP' +err);
            }
        });
    }
    else {
        res.statusCode=400;
        res.send(RtnMessage);
        console.log('FnUpdateUserProfileAP:tmaster: Manditatory field empty');
    }
}
catch (ex) {
    console.log('FnUpdateUserProfileAP error:' + ex.description);

}
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.saveAPEZEID = function(req,res,next){
    /**
     * @todo FnSaveAPEZEID
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Purpose = parseInt(req.body.Purpose);
        var Type = parseInt(req.body.Type);
        var Preffereduser = req.body.Preffereduser;
        var AreaSize = req.body.AreaSize;
        var AreaUOM = req.body.AreaUOM;
        var Rate = req.body.Rate;
        var Amount = req.body.Amount;
        var SpaceQty = req.body.SpaceQty;
        var SpaceType = req.body.SpaceType;
        var FunishedType = req.body.FunishedType;
        var Description = req.body.Description;
        var Preferences = req.body.Preferences;
        var Rating = req.body.Rating;
        var EZEID = req.body.EZEID;
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Status = req.body.Status;
        var Reason = req.body.Reason;
        var AvailableDate = req.body.AvailableDate;
        var Token = req.body.Token;
        var APID = req.body.APID;
        var TID = req.body.TID;
        var NoCarParking =parseInt(req.body.NoCarParking);
        var NoBikeParking =parseInt(req.body.NoBikeParking);
        var OwnerPayment = req.body.OwnerPayment;
        var AgeOfProperty = req.body.AgeOfProperty;
        var NoOfBathrooms = req.body.NoOfBathrooms;
        var Gas = req.body.Gas;
        var Lift = req.body.Lift;
        var Gym = req.body.Gym;
        var SwimmingPool = req.body.SwimmingPool;
        var Security = req.body.Security;
        var UPS = req.body.UPS;
        var tAvailableDate = null;
        if (AvailableDate != null) {
            // datechange = new Date(new Date(TaskDateTime).toUTCString());
            tAvailableDate = new Date(AvailableDate);
            // console.log(TaskDate);
        }
        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('FnRegistration: Token: ' + TokenNo);
                    var InsertQuery = _this.db.escape(Type) + ',' + _this.db.escape(Preffereduser) + ',' + _this.db.escape(AreaSize) + ',' +_this.db.escape(AreaUOM)
                        + ','  + _this.db.escape(Rate) + ',' + _this.db.escape(Amount) + ',' + _this.db.escape(SpaceQty) + ',' + _this.db.escape(SpaceType)
                        + ',' + _this.db.escape(FunishedType) + ',' + _this.db.escape(Description) + ',' + _this.db.escape(Preferences) + ',' + _this.db.escape(Rating)
                        + ',' +_this.db.escape(EZEID) + ',' + _this.db.escape(Status) + ',' + _this.db.escape(Reason) + ',' + _this.db.escape(tAvailableDate) + ',' + _this.db.escape(Token)
                        + ',' + _this.db.escape(APID) + ',' + _this.db.escape(Latitude) + ',' + _this.db.escape(Longitude) + ',' + _this.db.escape(TID) + ',' + _this.db.escape(Purpose)
                        + ',' + _this.db.escape(NoCarParking) + ',' + _this.db.escape(NoBikeParking) + ',' + _this.db.escape(OwnerPayment) + ',' + _this.db.escape(AgeOfProperty)
                        + ',' + _this.db.escape(NoOfBathrooms) + ',' + _this.db.escape(Gas) + ',' + _this.db.escape(Lift)
                        + ',' + _this.db.escape(Gym) + ',' + _this.db.escape(SwimmingPool) + ',' + _this.db.escape(Security) + ',' + _this.db.escape(UPS);
                    // console.log(InsertQuery);
                    _this.db.query('CALL psaveRealEstateData(' + InsertQuery + ')', function (err, InsertResult) {
                        if (!err) {
                            //  console.log(InsertResult);
                            if (InsertResult != null) {
                                if (InsertResult[0].length > 0) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData: psaveRealEstateData: Data saved successfully');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                                }
                            }
                            else {
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                            }
                        }
                        else {
                            res.statusCode=500;
                            res.send(RtnMessage);
                            console.log('psaveRealEstateData:psaveRealEstateData:' + err);
                        }
                    });
                }
                else {
                    res.statusCode=401;
                    console.log('psaveRealEstateData: Invalid Token')
                    res.send(RtnMessage);
                }
            }
            else {
                res.statusCode=500;
                console.log('psaveRealEstateData: Error in processing Token' + err);
                res.send(RtnMessage);
            }
        });

        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        console.log('psaveRealEstateData error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.updateRedFlagAP = function(req,res,next){
    /**
     * @todo FnUpdateRedFlagAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var RedFlag = req.body.RedFlag;
        var Token = req.body.Token;
        var FromEZEID =req.body.FromEZEID;
        var ToEZEID =req.body.ToEZEID;
        var Message =req.body.Message;


        var RtnMessage = {
            IsUpdated: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (FromEZEID != null && ToEZEID != null && Token != null && RedFlag !=null && Message != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = _this.db.escape(FromEZEID) + ',' + _this.db.escape(ToEZEID) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(RedFlag) + ',' +_this.db.escape(Message);
                        _this.db.query('CALL pUpdateRedFlagAP(' + query + ')', function (err, UpdateRedflagResult) {
                            if (!err){
                                if (UpdateRedflagResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateRedFlagAP:Red flag history Update successfully');
                                }
                                else {
                                    console.log('FnUpdateRedFlagAP:Red flag history Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateRedFlagAP: error in Updating Red FlagAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateRedFlagAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateRedFlagAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (RedFlag == null) {
                console.log('FnUpdateRedFlagAP: Red flag is empty');
            }
            else if (Token == null) {
                console.log('FnUpdateRedFlagAP: Token is empty');
            }
            else if (FromEZEID == null) {
                console.log('FnUpdateRedFlagAP: From_Ezeid is empty');
            }
            else if (ToEZEID == null) {
                console.log('FnUpdateRedFlagAP: To_Ezeid is empty');
            }
            else if (Message == null) {
                console.log('FnUpdateRedFlagAP: Message is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateRedFlagAP:error ' + ex.description);

    }
}

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.updateEZEIDAP = function(req,res,next){
    /**
     * @todo FnUpdateEZEIDAP
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var OldEZEID = req.body.OldEZEID;
        var NewEZEID = req.body.NewEZEID;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && OldEZEID != null && OldEZEID != '' && NewEZEID != null && NewEZEID != '') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = _this.db.escape(OldEZEID) + ',' + _this.db.escape(NewEZEID) + ',' + _this.db.escape(Token);
                        _this.db.query('CALL pUpdateEZEIDAP(' + Query + ')', function (err, ChangeEZEIDResult) {
                            if (!err) {

                                if (ChangeEZEIDResult != null) {
                                    if (ChangeEZEIDResult.affectedRows > 0) {
                                        RtnMessage.IsChanged = true;
                                        res.send(RtnMessage);
                                        console.log('FnUpdateEZEIDAP:EZEID CHANGED SUCCESSFULLY');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnUpdateEZEIDAP:EZEID changed failed');
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnUpdateEZEIDAP:EZEID changed failed ');
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnUpdateEZEIDAP:Error in getting change EZEID' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnUpdateEZEIDAP:Invalid Token');
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnUpdateEZEIDAP:Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnUpdateEZEIDAP: Token is empty');
            }
            else if (OldEZEID == null && OldEZEID == ' ') {
                console.log('FnUpdateEZEIDAP: OldEZEID is empty');
            }
            else if (NewEZEID == null && NewEZEID == ' ') {
                console.log('FnUpdateEZEIDAP: NewEZEID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnUpdateEZEIDAP error:' + ex.description);

    }
};

module.exports = User_AP;
