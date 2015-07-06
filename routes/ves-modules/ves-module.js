/**
 *  @author Gowri Shankar
 *  @since July o6,2015 12:24 AM IST
 *  @title VES module
 *  @description Handles functions related to VES module
 *
 */
"use strict";

function VES(db){
    this.db = db;
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.loginVES = function(req,res,next){
    /**
     * @todo FnLoginVES
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.query.EZEID;
        var Password = req.query.Password;
        if (EZEID != null && EZEID != '' && Password != null && Password != '') {
            //var EncryptPWD = FnEncryptPassword(Password);
            //console.log('Encrypt password' +EncryptPWD);
            db.query('CALL pLoginVES(' + db.escape(EZEID) + ',' + db.escape(Password) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult != null) {
                        if (GetResult[0].length > 0) {
                            console.log('FnLoginVES: LoginVES details Send successfully');
                            res.send(GetResult[0]);
                        }
                        else {
                            console.log('FnLoginVES:No LoginVES Details found');
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnLoginVES:No LoginVES Details found');
                        res.json(null);
                    }
                }
                else {
                    console.log('FnLoginVES: error in getting LoginVES details' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            if (EZEID == null) {
                console.log('FnLoginVES: EZEID is empty');
            }
            if (Password == null) {
                console.log('FnLoginVES: Password is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnLoginVES error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
VES.prototype.saveContactVES = function(req,res,next){
    /**
     * @todo FnSaveContactVES
     */

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var EZEID = req.body.EZEID;
        var Pic = req.body.Pic;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var PhoneNo = req.body.PhoneNo;
        var MobileNo = req.body.MobileNo;
        var EmailID = req.body.EmailID;
        var CompanyName = req.body.CompanyName;
        var Address1 = req.body.Address1;
        var Address2 = req.body.Address2;
        var CountryID = req.body.CountryID;
        var StateID = req.body.StateID;
        var City = req.body.City;
        var PostalCode = req.body.PostalCode;
        var Synced = req.body.Synced;
        var ContactID = req.body.ContactID;
        var LaptopSLNO = req.body.LaptopSLNO;
        var VehicalTypeNo = req.body.VehicalTypeNo;
        var InTime = req.body.InTime;
        var OutTime = req.body.OutTime;
        var ContactDeptID = req.body.ContactDeptID;
        var PassReturned = req.body.PassReturned;
        var Status = req.body.Status;
        var GateNo  = req.body.GateNo;
        var SyncedInout = req.body.SyncedInout;
        var ContactEZEID = req.body.ContactEZEID;
        var ContactName = req.body.ContactName;
        var InTimeNew = new Date(InTime);

        if(OutTime != null){
            var OutTimeNew = new Date(OutTime);
        }
        else{
            var OutTimeNew=null;
        }
        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && EZEID != null && ContactID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(EZEID) + ',' + db.escape(Pic) + ',' + db.escape(FirstName) + ',' +db.escape(LastName)
                            + ',' +db.escape(PhoneNo) + ',' +db.escape(MobileNo) + ',' +db.escape(EmailID) + ',' +db.escape(CompanyName)
                            + ',' +db.escape(Address1) + ',' +db.escape(Address2) + ',' +db.escape(CountryID) + ',' +db.escape(StateID) + ',' +db.escape(City)
                            + ',' + db.escape(PostalCode) + ',' + db.escape(Synced) + ',' + db.escape(ContactID) + ',' +db.escape(LaptopSLNO) + ',' +db.escape(VehicalTypeNo)
                            + ',' + db.escape(InTimeNew) + ',' + db.escape(OutTimeNew) + ',' + db.escape(ContactDeptID) + ',' + db.escape(PassReturned) + ',' + db.escape(Status)
                            + ',' + db.escape(GateNo) + ',' + db.escape(SyncedInout) + ',' + db.escape(ContactEZEID) + ',' + db.escape(ContactName);
                        db.query('CALL pSaveContactVES(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveContactVES:  Contact details save successfully');
                                }
                                else {
                                    console.log('FnSaveContactVES:No Save Contact details');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveContactVES: error in saving Contact details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveContactVES: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveContactVES:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveContactVES: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnSaveContactVES: EZEID is empty');
            }
            else if (ContactID == null) {
                console.log('FnSaveContactVES: ContactID is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveContactVES:error ' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.getAllContactsVES = function(req,res,next){
    /**
     * @todo FnGetAllContactsVES
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var Date1 = req.query.Date1;
        var Date2 = req.query.Date2;
        var DateNew1 = new Date(Date1);
        var DateNew2 = new Date(Date2);

        if (Token != null && DateNew1 !=null && DateNew2 != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(DateNew1) + ',' + db.escape(DateNew2);
                        db.query('CALL pGetAllContactsVES(' + query + ')', function (err, GetResult) {

                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetAllContactsVES: ContactsVES details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetAllContactsVES:No ContactsVES details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetAllContactsVES:No ContactsVES details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetAllContactsVES: error in getting ContactsVES details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetAllContactsVES: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetAllContactsVES: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAllContactsVES: Token is empty');
            }
            else if (DateNew1 == null) {
                console.log('FnGetAllContactsVES: Date1 is empty');
            }
            else if (DateNew2 == null) {
                console.log('FnGetAllContactsVES: Date2 is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetAllContactsVES error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.getDepartmentVES = function(req,res,next){
    /**
     * @todo FnGetDepartmentVES
     */
    var _this = this;

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var MasterID = req.query.MasterID;
        if (MasterID != null) {
            var Query = 'Select TID,DeptName from mdept where MasterID=' + db.escape(MasterID);
            //var MaxQuery = 'Select max(TID) as ID from  mdept';

            db.query(Query, function (err, DeptResult) {
                if (!err) {
                    if (DeptResult.length > 0) {
                        res.send(DeptResult);
                        console.log('FnGetDepartmentVES: Departments details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetDepartmentVES: No Departments details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetDepartmentVES: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetDepartmentVES: MasterID is empty');
        }


    }
    catch (ex) {
        console.log('FnGetDepartmentVES error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.getContactVES = function(req,res,next){
    /**
     * @todo FnGetContactVES
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

                        db.query('CALL pGetContactVES(' + db.escape(Token) + ',' + db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetContactsVES: ContactsVES details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetContactsVES:No ContactsVES details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetContactsVES:No ContactsVES details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetContactsVES: error in getting ContactsVES details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetContactsVES: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetContactsVES: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetContactsVES: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetContactsVES: TID is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetContactsVES error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.searchContactsVES = function(req,res,next){
    /**
     * @todo FnSearchContactsVES
     */
    var _this = this;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Date1 = req.query.Date1;
        var Date2 = req.query.Date2;
        var Status = req.query.Status;
        var Keywords = req.query.Keywords;
        var Type = req.query.Type;
        var DateNew1 = new Date(Date1);
        var DateNew2 = new Date(Date2);

        if (Token != null && DateNew1 !=null && DateNew2 != null && Status !=null && Keywords != null && Type !=null) {

            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var SearchParameter = db.escape(Token) + ',' + db.escape(DateNew1) + ',' + db.escape(DateNew2) + ',' + db.escape(Status) + ',' + db.escape(Keywords) + ',' + db.escape(Type);

                        db.query('CALL pSearchContactsVES(' + SearchParameter + ')', function (err, Result) {
                            if (!err) {
                                if (Result[0].length > 0) {
                                    res.send(Result[0]);
                                    console.log('FnSearchContactsVES: Search result sent successfully');
                                }
                                else {
                                    res.json(null);
                                    console.log('FnSearchContactsVES: No search found');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnSearchContactsVES: error in getting search contact' + err);
                            }
                        });

                    }
                    else {
                        console.log('FnSearchContactsVES: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnSearchContactsVES: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);

                }
            });
        }

        else {
            if (Token == null) {
                console.log('FnSearchContactsVES: Token is empty');
            }
            else if (DateNew1 == null) {
                console.log('FnSearchContactsVES: Date1 is empty');
            }
            else if (DateNew2 == null) {
                console.log('FnSearchContactsVES: Date2 is empty');
            }
            else if (Status == null) {
                console.log('FnSearchContactsVES: Status is empty');
            }
            else if (Keywords == null) {
                console.log('FnSearchContactsVES: Keywords is empty');
            }
            else if (Type == null) {
                console.log('FnSearchContactsVES: Type is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnSearchContactsVES error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.checkPasswordVES = function(req,res,next){
    /**
     * @todo FnCheckPasswordVES
     */
    var _this = this;

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Password = req.query.Password;
        if (Password != null) {
            var Query = 'Select TID from tmaster where StatusID=1 and VESPassword=' + db.escape(Password);
            db.query(Query, function (err, PasswordResult) {
                if (!err) {
                    if (PasswordResult.length > 0) {
                        res.send(PasswordResult);
                        console.log('FnCheckPasswordVES : Password check details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnCheckPasswordVES : No Password check details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnCheckPasswordVES : error in getting check password' + err);
                }
            });
        }
        else {
            if (Password == null) {
                console.log('FnCheckPasswordVES: Password is empty');
            }

            res.statusCode=400;
            res.json(null);
        }


    }
    catch (ex) {
        console.log('FnCheckPasswordVES : error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
VES.prototype.getGatesVES = function(req,res,next){
    /**
     * @todo FnGetGatesVES
     */
    var _this = this;

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var MasterID = req.query.MasterID;
        if (MasterID != null) {
            var Query = 'Select TID,GateNo from mgates where MasterID=' + db.escape(MasterID);
            db.query(Query, function (err, Result) {
                if (!err) {
                    if (Result.length > 0) {
                        res.send(Result);
                        console.log('FnGetGatesVES: GatesVES details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetGatesVES: No GatesVES details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetGatesVES: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetGatesVES: MasterID is empty');
        }


    }
    catch (ex) {
        console.log('FnGetGatesVES error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
VES.prototype.saveDepartmentsVES = function(req,res,next){
    /**
     * @todo FnSaveDepartmentsVES
     */
    var _this = this;

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Name = req.body.Name;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        if (Token != null && Name != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Name) + ',' + db.escape(TID);
                        db.query('CALL pSaveDepartments(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult != null) {
                                    if (InsertResult[0].length > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        var Insert = InsertResult[0];
                                        RtnMessage.TID=Insert[0].TID;
                                        res.send(Insert);
                                        //res.send(RtnMessage);
                                        console.log('FnSaveDepartmentsVES: DepartmentsVES details saved successfully');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnSaveDepartmentsVES: DepartmentsVES details Saving Failed');
                                    }
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveDepartmentsVES: DepartmentsVES details saving Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveDepartmentsVES: Error in getting DepartmentsVES details' + err);
                            }
                        });

                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveDepartmentsVES: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveDepartmentsVES: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnSaveDepartmentsVES: Token is empty');
            }
            else if (Name == null) {
                console.log('FnSaveDepartmentsVES: Name is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveDepartmentsVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveContactVES:error ' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
VES.prototype.saveGatesVES = function(req,res,next){
    /**
     * @todo FnSaveGatesVES
     */
    var _this = this;

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Name = req.body.Name;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        if (Token != null && Name != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Name) + ',' + db.escape(TID);
                        db.query('CALL pSaveGates(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //  console.log(InsertResult);
                                if (InsertResult != null) {
                                    if (InsertResult[0].length > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        var Insert = InsertResult[0];
                                        RtnMessage.TID=Insert[0].TID;
                                        res.send(Insert);
                                        //res.send(RtnMessage);
                                        console.log('FnSaveGatesVES: GatesVES details saved successfully');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnSaveGatesVES: GatesVES details Saving Failed');
                                    }
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveGatesVES: GatesVES details saving Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveGatesVES: Error in getting GatesVES etails' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveGatesVES: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveGatesVES: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnSaveGatesVES: Token is empty');
            }
            else if (Name == null) {
                console.log('FnSaveGatesVES: Name is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveGatesVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveGatesVES:error ' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
VES.prototype.saveCitysVES = function(req,res,next){
    /**
     * @todo FnSaveCitysVES
     */
    var _this = this;

    
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var StateID = req.body.StateID;
        var CityTitle = req.body.CityTitle;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));


        if (StateID != null && CityTitle != null) {
            var Insertquery = db.escape(StateID) + ',' + db.escape(CityTitle) + ',' + db.escape(TID);
            db.query('CALL pSaveCitysVES(' + Insertquery + ')', function (err, InsertResult) {
                if (!err) {
                    //  console.log(InsertResult);
                    if (InsertResult != null) {
                        if (InsertResult[0].length > 0) {
                            RtnMessage.IsSuccessfull = true;
                            var Insert = InsertResult[0];
                            RtnMessage.TID=Insert[0].TID;
                            res.send(Insert);
                            //res.send(RtnMessage);
                            console.log('FnSaveCitysVES: CitysVES details saved successfully');
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnSaveCitysVES: CitysVES details Saving Failed');
                        }
                    }
                    else {
                        console.log(RtnMessage);
                        res.send(RtnMessage);
                        console.log('FnSaveCitysVES: CitysVES details saving Failed');
                    }
                }
                else {
                    res.statusCode=500;
                    res.send(RtnMessage);
                    console.log('FnSaveCitysVES: Error in getting CitysVES etails' + err);
                }
            });
        }

        else {
            if (StateID == null) {
                console.log('FnSaveCitysVES: StateID is empty');
            }
            else if (CityTitle == null) {
                console.log('FnSaveCitysVES: CityTitle is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveCitysVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveCitysVES:error ' + ex.description);

    }
};

module.exports = VES;