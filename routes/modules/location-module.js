/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Authentication module
 *  @description Handles functions related to secondary locations
 *  1. Secondary Locations list fetching
 *  2. Secondary Location adding (saving)
 *
 */
"use strict";

function Location(db){
    this.db = db;
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location.prototype.getAll = function(req,res,next){
    /**
     * @todo FnGetSecondaryLocation
     */
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Location.prototype.save = function(req,res,next){
    /**
     * @todo FnAddLocation
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location.prototype.getAllForEzeid = function(req,res,next){
    /**
     * @todo FnGetLocationListForEzeid
     */
};


module.exports = Location;