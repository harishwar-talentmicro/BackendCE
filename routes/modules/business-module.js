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
};



module.exports = BusinessManager;