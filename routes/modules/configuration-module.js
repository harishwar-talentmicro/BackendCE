/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Configuration module
 *  @description Handles all core configuration functions as follows
 *  1.
 *
 */
"use strict";

function Configuration(db){
    this.db = db;
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
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveStatusTypes = function(req,res,next){
    /**
     * @todo FnSaveStatusType
     */
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
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveActionTypes = function(req,res,next){
    /**
     * @todo FnSaveActionType
     */
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
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationResource = function(req,res,next){
    /**
     * @todo FnUpdateReseravtionResource
     */
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
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveReservationService = function(req,res,next){
    /**
     * @todo FnSaveReseravtionService
     */
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.updateReservationService = function(req,res,next){
    /**
     * @todo FnUpdateReseravtionService
     */
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
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Configuration.prototype.saveHoliday = function(req,res,next){
    /**
     * @todo FnSaveHolidayCalender
     */
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
};

module.exports = Configuration;







