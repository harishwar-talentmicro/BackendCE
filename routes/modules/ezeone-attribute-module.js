/**
 * Created by Anjali Pandya on 26-02-2016.
 */


var appConfig = require('../../ezeone-config.json');


var st = null;
function EzeoneAttrbt(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

EzeoneAttrbt.prototype.signUpData = function(req,res,next){

    var rtnMessage = appConfig.SIGNUPDATA;

    switch(req.platform){
        case 'ios':
            /**
             * If IOS version is not supported
             */
            if(req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else if(req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.versionStatus = 1;
                rtnMessage.versionMessage = (rtnMessage.versionStatus) ? "New update available. Please update your application to latest version" : rtnMessage.versionMessage;
            }
            else{
                rtnMessage.versionStatus = 0;
                rtnMessage.versionMessage = (rtnMessage.versionStatus)
                    ? "New update available. Please update your application to latest version" : rtnMessage.versionMessage;
            }
            break;
        case 'android':
            /**
             * If Android version is not supported
             */
            if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
                (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
                rtnMessage.versionMessage = (rtnMessage.versionStatus)
                    ? "New update available. Please update your application to latest version" : rtnMessage.versionMessage;
            }
            break;
        case 'web':
            /**
             * If Web version is not supported
             */
            if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
                (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1;
                rtnMessage.versionMessage = (rtnMessage.versionStatus)
                    ? "New update available. Please update your application to latest version" : rtnMessage.versionMessage;
            }
            break;
        default:
            rtnMessage.versionStatus = 2;
            rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
            res.json(rtnMessage);
            return;
            break;
    }

    res.status(200).json(rtnMessage);

};


EzeoneAttrbt.prototype.versionCode = function(req,res,next){

    var rtnMessage = {
        status : true,
        message : "Version code status loaded ",
        data : null,
        error : null
    };

    switch(req.platform){
        case 'ios':
            /**
             * If IOS version is not supported
             */
            if(req.CONFIG.VERSION_LIST.IOS[0].indexOf(parseInt(req.query.versionCode)) == -1 && req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1 ){
                rtnMessage.data  = {
                    versionStatus : 2,
                    versionMessage : "Please update your application to latest version to continue using it"
                };
                res.json(rtnMessage);
                return;
            }
            else if(req.CONFIG.VERSION_LIST.IOS[1].indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.data = {
                    versionStatus : 1,
                    versionMessage : "New update available. Please update your application to latest version"
                }
            }
            else{
                rtnMessage.data = {
                    versionStatus : 0,
                versionMessage : "New update available. Please update your application to latest version"

                };

            }
            break;
        case 'android':
            /**
             * If Android version is not supported
             */
            if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.data = {
                    versionStatus : 2,
                    versionMessage : "Please update your application to latest version to continue using it"
                };

                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.data = {
                    versionStatus : (req.CONFIG.VERSION_LIST.ANDROID.length ==
                    (req.CONFIG.VERSION_LIST.ANDROID.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1,
                versionMessage :"New update available. Please update your application to latest version"

                };

            }
            break;
        case 'web':
            /**
             * If Web version is not supported
             */
            if(req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) == -1){
                rtnMessage.data = {
                    versionStatus : 2,
                    versionMessage : "Please update your application to latest version to continue using it"
                };

                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.data = {
                    versionStatus : (req.CONFIG.VERSION_LIST.WEB.length ==
                    (req.CONFIG.VERSION_LIST.WEB.indexOf(parseInt(req.query.versionCode)) + 1)) ? 0 : 1,
                    versionMessage : "New update available. Please update your application to latest version"

                };

            }
            break;
        default:
            rtnMessage.data = {
                versionStatus : 2,
                versionMessage : "Please update your application to latest version to continue using it"
            };

            res.json(rtnMessage);
            return;
            break;
    }

    res.status(200).json(rtnMessage);

};


module.exports = EzeoneAttrbt;