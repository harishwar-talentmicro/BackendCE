/**
 * Created by Hirecraft on 15-04-2016.
 */

var express = require('express');
var router = express.Router();

/**
 * api to compare current version of area partner application
 * with version which user is using if it will not match
 * then we will not allow user to user this app
 */
router.get('/:versionCode', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var versionCode = 0;
    if (req.CONFIG.CONSTANT.ANDROID_AP_VERSION_CODE == parseInt(req.params.versionCode)){
        versionCode = 1;
        responseMessage.status = true;
        responseMessage.error = null;
        responseMessage.message = 'Application vesion is valid';
        responseMessage.data = {
            isValid : versionCode
        };
        res.status(200).json(responseMessage);
    }
    else {
        responseMessage.status = true;
        responseMessage.error = null;
        responseMessage.message = 'Application vesion is not valid';
        responseMessage.data = {
            isValid : versionCode
        };
        res.status(200).json(responseMessage);
    }

});


module.exports = router;

