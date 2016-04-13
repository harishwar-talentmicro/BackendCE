/**
 *  @author Anjali Pandya
 *  @since April 04,2016  10:46AM
 *  @title group item module
 *  @description Handles item group functions
 */
"use strict";

var express = require('express');
var router = express.Router();

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get group keyword details
 */
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



/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get group keyword details (No need of token validation)
 */
router.get('/keyword', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    try {
        var procQuery = 'CALL pgetkeyword_group()';
        console.log(procQuery);
        req.db.query(procQuery, function (err, results) {
            if (!err) {
                console.log(results);
                if (results) {
                    if (results[0]) {
                        if (results[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Group keyword loaded successfully';
                            responseMessage.data = results[0]
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Group keyword not available';
                            responseMessage.data = [];
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Group keyword not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.status = false;
                    responseMessage.error = null;
                    responseMessage.message = 'Expense type not available';
                    responseMessage.data = null;
                    res.status(200).json(responseMessage);
                }
            }
            else {
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                responseMessage.message = 'An error occurred !';
                res.status(500).json(responseMessage);
                console.log('Error : pgetkeyword_group ', err);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');

            }
        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(500).json(responseMessage);
        console.log('Error pgetkeyword_group : ', ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 *
 * @discription : API to get details of item group
 */
router.get('/details', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.ezeoneid) {
        error.ezeoneid = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var ezeoneid = alterEzeoneId(req.query.ezeoneid);
            var procParams = req.db.escape(ezeoneid);
            var procQuery = 'CALL pget_itemmaster(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Item details loaded successfully';
                                responseMessage.data = results[0];
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Item not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Item not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Item not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pget_itemmaster ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_itemmaster : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
* Method : POST
* @param req
* @param res
* @param next
* @param token* <string> token of login user
 * @param title* <string> title of group
 * @param st <int> st is status of group
 * @param desc <string> desc is description of group
 * @param tid <int> tid of group in case of update
 * @param pic <string> pic is path of image
 * @param itemId <string> itemId is comma saprated ids of items
*
* @discription : API to create group with item
*/

router.post('/details', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if (!req.body.token) {
        error['token'] = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.title) {
        error['title'] = 'Invalid group title';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            req.body.desc = (req.body.desc) ? req.body.desc : '';
            req.body.tid = parseInt(req.body.tid) ? req.body.tid : 0 ;
            req.body.pic = (req.body.pic) ? req.body.pic : '';
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = req.db.escape(req.body.token) + ',' + req.db.escape(req.body.title)
                            + ',' + req.db.escape(req.body.desc) + ',' + req.db.escape(req.body.st)
                            + ',' + req.db.escape(req.body.pic) + ',' + req.db.escape(req.body.tid);

                        var procQuery = 'CALL psave_item_group(' + queryParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            if (results[0][0].id) {
                                                /**
                                                 * preparing query to update multiple items of group
                                                 * getting comma separated item ids
                                                 */
                                                var itemArray = (req.body.itemId).split(',');
                                                if (itemArray.length > 0){
                                                    var combQuery = '';
                                                    for (var i = 0; i < itemArray.length; i++ ){
                                                        var itemQueryParams = req.db.escape(results[0][0].id) + ',' + req.db.escape(itemArray[i]);
                                                        combQuery +=  ('CALL psave_group_items(' + itemQueryParams + ');');
                                                    }
                                                    console.log(combQuery);
                                                    req.db.query(combQuery, function (err, imageResult) {
                                                        if (!err) {
                                                            if (imageResult) {
                                                                console.log(imageResult);
                                                                responseMessage.status = true;
                                                                responseMessage.error = null;
                                                                responseMessage.message = 'Group created successfully';
                                                                responseMessage.data = {
                                                                    id : results[0][0].id
                                                                };
                                                                res.status(200).json(responseMessage);
                                                            }
                                                            else {
                                                                console.log('Item not save');
                                                                res.status(200).json(responseMessage);
                                                            }
                                                        }
                                                        else {
                                                            console.log('Item not save');
                                                            console.log(err);
                                                            res.status(200).json(responseMessage);
                                                        }
                                                    });
                                                }
                                                else {
                                                    responseMessage.status = true;
                                                    responseMessage.error = null;
                                                    responseMessage.message = 'Group created successfully';
                                                    responseMessage.data = {
                                                        id : results[0][0].id
                                                    };
                                                    res.status(200).json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.status = false;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Error in creating group';
                                                responseMessage.data = null;
                                                res.status(200).json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in creating group';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Error in creating group';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in creating group';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : psave_item_group ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('psave_item_group: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : psave_item_group ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error psave_item_group :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

});

module.exports = router;