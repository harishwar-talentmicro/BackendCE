/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title BusinessManager module
 *  @description Handles functions related to EZEID search with various parameters
 *  1. Search using keyword and filters
 *  2. Location Information based on TID
 *
 */
"use strict";

function Search(db){
    this.db = db;
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Search.prototype.searchKeyword = function(req,res,next){
    /**
     * @todo FnSearchByKeywords
     */
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Search.prototype.searchInformation = function(req,res,next){
    /**
     * @todo FnGetSearchInformation
     */
};