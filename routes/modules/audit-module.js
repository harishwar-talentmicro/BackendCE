/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Audit module
 *  @description Handles functions related to access history, create update and edit records
 *  1. Access History Fetching for EZEID
 *
 */
"use strict";

function Audit(db){
    this.db = db;
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Audit.prototype.getAccessHistory = function(req,res,next){
    /**
     * @todo FnGetSecondaryLocation
     */
};


module.exports = Audit;