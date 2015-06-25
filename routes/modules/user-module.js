/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title User module
 *  @description Handles master user level functions as follows
 *  1. Registration (Updating user and primary location also done with this call only)
 *  2. Login
 *  3. Logout
 *  4. Company Profile fetching and saving
 *  5. Weblinks fetching, saving and deleting
 *  6. Password change
 *  7. Country, State and City List Fetching
 *
 */
"use strict";

function User(db){
    this.db = db;
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.register = function(req,res,next){
    /**
     * @todo FnRegistration
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.login = function(req,res,next){
    /**
     * @todo FnLogin
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.logout = function(req,res,next){
    /**
     * @todo FnLogout
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCountry = function(req,res,next){

    /**
     * @todo FnGetCountry
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getState = function(req,res,next){
    /**
     * @todo FnGetState
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCity = function(req,res,next){
    /**
     * @todo FnGetCity
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getUserDetails = function(req,res,next){
    /**
     * @todo FnGetUserDetails
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.checkEzeid = function(req,res,next){
    /**
     * @todo FnCheckEZEID
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.changePassword = function(req,res,next){
    /**
     * @todo FnChangePassword
     */
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCompanyProfile = function(req,res,next){
    /**
     * @todo FnGetCompanyProfile
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveCompanyProfile = function(req,res,next){
    /**
     * @todo FnSaveCompanyProfile
     */
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getWebLink = function(req,res,next){
    /**
     * @todo FnGetWebLink
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveWebLink = function(req,res,next){
    /**
     * @todo FnSaveWebLink
     */
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
User.prototype.deleteWebLink = function(req,res,next){
    /**
     * @todo FnDeleteWebLink
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getEzeidDetails = function(req,res,next){
    /**
     * @todo FnEZEIDPrimaryDetails
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getResume = function(req,res,next){
    /**
     * @todo FnGetCVInfo
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveResume = function(req,res,next){
    /**
     * @todo FnSaveCVInfo
     */
};



module.exports = User;