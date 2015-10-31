/**
 *  @author Gowri Shankar
 *  @since July o6,2015 04:24 PM IST
 *  @title user module
 *  @description Handles functions related to user profile module
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
function User_AP(db,stdLib){

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
User_AP.prototype.getUserDetailsAP = function(req,res,next){
    /**
     * @todo FnGetUserDetailsAP
     */
    var _this = this;
    try {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var TokenNo = req.query.Token;
        var EZEID = alterEzeoneId(req.query.EZEID);
    if (EZEID != null && EZEID != '' && TokenNo != null) {

        st.validateTokenAp(TokenNo, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //var Query = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CompanyName,"") as CompanyName,ifnull(CategoryID,0) as CategoryID,ifnull(FunctionID,0) as FunctionID,ifnull(RoleID,0) as RoleID,ifnull(JobTitle,"") as JobTitle,ifnull(NameTitleID,0) as NameTitleID,ifnull(AboutCompany,"") as AboutCompany,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(AddressLine1,"") as AddressLine1,ifnull(AddressLine2,"") as AddressLine2,CityID,StateID,CountryID,ifnull(PostalCode,"") as PostalCode,b.PIN,ifnull(EMailID,"") as EMailID,ifnull(EMailVerifiedID,"") as EMailVerifiedID,ifnull(PhoneNumber,"") as PhoneNumber, ifnull(MobileNumber,"") as MobileNumber,ifnull(LaptopSLNO,"") as LaptopSLNO,ifnull(VehicleNumber,"") as VehicleNumber,ifnull(Website,"") as Website,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,ifnull(d.WorkingHours,"") as WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton ,ifnull(d.SalesEnquiryMailID,"") as SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,ifnull(d.HomeDeliveryMailID,"") as HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,ifnull(d.ReservationMailID,"") as ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,ifnull(d.SupportMailID,"") as SupportMailID,ifnull(d.CVButton,1) as CVButton,ifnull(d.CVMailID,"") as CVMailID,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName  from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo=0  and a.EZEID= ' + st.db.escape(EZEID);
                    //   var Query ='Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CategoryID,0) as CategoryID,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName,ifnull(doc.BRDocFilename,"") as BRDocFilename, ifnull(doc.BRDoc,"") as BRDoc,ifnull(doc.BRContentType,"") as BRContentType,b.Rating,ifnull(a.BusinessSize,0) as Size  from tmaster a left outer join tlocations b on a.TID = b.MasterID left outer Join tDocs c On a.TID=c.MasterID left outer join tdocs doc on a.TID= doc.MasterID where b.SeqNo=0  and a.EZEID=' + st.db.escape(EZEID);
                    st.db.query('Call pgetUserProfileAP('+st.db.escape(EZEID)+')', function (err, UserDetailsResult) {
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

    var EZEID = alterEzeoneId(req.body.EZEID);
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
        st.validateTokenAp(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    if(IDTypeId == 1){
                        var InsertQuery = st.db.escape(0) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' +
                            st.db.escape(EZEIDVerifiedID) + ',' + st.db.escape(Token) + ',' + st.db.escape('') + ',' + st.db.escape('') + ',' + st.db.escape('') + ',' +
                            st.db.escape('') + ',' + st.db.escape('') + ',' + st.db.escape(EZEID) + ',' +
                            st.db.escape('') + ',' + st.db.escape('') + ',' + st.db.escape(0)+ ',' + st.db.escape('')+ ',' + st.db.escape(0) + ',' + st.db.escape(0)+ ',' + st.db.escape(IDTypeId) + ',' + st.db.escape(SelectionType);
                        // console.log(InsertQuery);
                        st.db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
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
                        var InsertQuery = st.db.escape(CategoryID) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' +
                            st.db.escape(EZEIDVerifiedID) + ',' + st.db.escape(Token) + ',' + st.db.escape(Keywords) + ',' + st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' +
                            st.db.escape(Icon) + ',' + st.db.escape(IconFileName) + ',' + st.db.escape(EZEID) + ',' +
                            st.db.escape(BrochureDoc) + ',' + st.db.escape(BrochureDocFile) + ',' + st.db.escape(ActiveInactive)+ ',' + st.db.escape(BRContentType)+ ',' + st.db.escape(Rating) + ',' + st.db.escape(Size)+ ',' + st.db.escape(IDTypeId)  + ',' + st.db.escape(SelectionType);
                        // console.log('InsertQuery: ' + InsertQuery);
                        st.db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
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
        var EZEID = alterEzeoneId(req.body.EZEID);
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

        st.validateTokenAp(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('FnRegistration: Token: ' + TokenNo);
                    var InsertQuery = st.db.escape(Type) + ',' + st.db.escape(Preffereduser) + ',' + st.db.escape(AreaSize) + ',' +st.db.escape(AreaUOM)
                        + ','  + st.db.escape(Rate) + ',' + st.db.escape(Amount) + ',' + st.db.escape(SpaceQty) + ',' + st.db.escape(SpaceType)
                        + ',' + st.db.escape(FunishedType) + ',' + st.db.escape(Description) + ',' + st.db.escape(Preferences) + ',' + st.db.escape(Rating)
                        + ',' +st.db.escape(EZEID) + ',' + st.db.escape(Status) + ',' + st.db.escape(Reason) + ',' + st.db.escape(tAvailableDate) + ',' + st.db.escape(Token)
                        + ',' + st.db.escape(APID) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(TID) + ',' + st.db.escape(Purpose)
                        + ',' + st.db.escape(NoCarParking) + ',' + st.db.escape(NoBikeParking) + ',' + st.db.escape(OwnerPayment) + ',' + st.db.escape(AgeOfProperty)
                        + ',' + st.db.escape(NoOfBathrooms) + ',' + st.db.escape(Gas) + ',' + st.db.escape(Lift)
                        + ',' + st.db.escape(Gym) + ',' + st.db.escape(SwimmingPool) + ',' + st.db.escape(Security) + ',' + st.db.escape(UPS);
                    // console.log(InsertQuery);
                    st.db.query('CALL psaveRealEstateData(' + InsertQuery + ')', function (err, InsertResult) {
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
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
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
        var FromEZEID =alterEzeoneId(req.body.FromEZEID);
        var ToEZEID =alterEzeoneId(req.body.ToEZEID);
        var Message =req.body.Message;


        var RtnMessage = {
            IsUpdated: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (FromEZEID != null && ToEZEID != null && Token != null && RedFlag !=null && Message != null) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = st.db.escape(FromEZEID) + ',' + st.db.escape(ToEZEID) + ',' + st.db.escape(Token) + ',' + st.db.escape(RedFlag) + ',' +st.db.escape(Message);
                        st.db.query('CALL pUpdateRedFlagAP(' + query + ')', function (err, UpdateRedflagResult) {
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
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
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
        var OldEZEID = alterEzeoneId(req.body.OldEZEID);
        var NewEZEID = alterEzeoneId(req.body.NewEZEID);
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && OldEZEID != null && OldEZEID != '' && NewEZEID != null && NewEZEID != '') {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = st.db.escape(OldEZEID) + ',' + st.db.escape(NewEZEID) + ',' + st.db.escape(Token);
                        st.db.query('CALL pUpdateEZEIDAP(' + Query + ')', function (err, ChangeEZEIDResult) {
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
	var errorDate = new Date();
	console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnUpdateEZEIDAP error:' + ex.description);

    }
};


/**
 * @todo FnSavePaidBannersAp
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save banners ap
 */
User_AP.prototype.savePaidBannersAp = function(req,res,next){

    var _this = this;

    var token = req.body.token;
    var masterid = req.body.master_id;
    var apID = req.body.ap_id;
    var apUserid = req.body.apuser_id;
    var image = req.body.image;
    var tag = req.body.tag;
    var id = (!isNaN(parseInt(req.body.id))) ?  parseInt(req.body.id) : 0;
    var height = req.body.height;
    var width = req.body.width;
    var randomName,mimetype;


    var uuid = require('node-uuid');
    var request = require('request');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
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

                        if (req.files.image) {

                            var uniqueId = uuid.v4();
                            randomName = uniqueId + '.' + req.files.image.extension;
                            mimetype = req.files.image.mimetype;
                            console.log(randomName);
                        }
                        else {
                            randomName = '';
                            mimetype = '';
                        }

                        //upload to cloud storage
                        request({
                            url: 'https://www.googleapis.com/upload/storage/v1/b/' + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/o',
                            method: 'POST',
                            headers: {
                                'Content-Type': mimetype
                            },
                            uploadType: 'multipart',
                            body: 'hello',
                            name: randomName
                        }, function (error, response, body) {
                            if (error) {
                                console.log('error..');
                                console.log(error);
                            } else {
                                console.log('response..');
                                console.log(response.statusCode);
                                console.log(body);

                                var queryParams = st.db.escape(masterid) + ',' + st.db.escape(apID) + ',' + st.db.escape(apUserid)
                                    + ',' + st.db.escape(randomName) + ',' + st.db.escape(tag) + ',' + st.db.escape(id);

                                var query = 'CALL psavepaidbannersAP(' + queryParams + ')';
                                console.log(query);
                                st.db.query(query, function (err, insertResult) {
                                    if (!err) {
                                        if (insertResult.affectedRows > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Banners Saved successfully';
                                            responseMessage.data = {
                                                master_id : req.body.master_id,
                                                ap_id : req.body.ap_id,
                                                apuser_id : req.body.apuser_id,
                                                tag : req.body.tag,
                                                id : (!isNaN(parseInt(req.body.id))) ?  parseInt(req.body.id) : 0
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnSavePaidBannersAp: Banners Saved successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Banners not Saved';
                                            res.status(200).json(responseMessage);
                                            console.log('FnSavePaidBannersAp:Banners not Saved');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'An error occured in query ! Please try again';
                                        responseMessage.error = {
                                            server: 'Internal Server Error'
                                        };
                                        res.status(500).json(responseMessage);
                                        console.log('FnSavePaidBannersAp: error in saving Banners:' + err);
                                    }

                                });
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
                        console.log('FnSavePaidBannersAp: Invalid token');
                    }
                } else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSavePaidBannersAp:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSavePaidBannersAp ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = User_AP;
