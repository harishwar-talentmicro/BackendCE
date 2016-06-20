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
            if(req.CONFIG.VERSION_LIST.IOS.indexOf(req.query.versionCode) == -1){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.IOS.length ==
                (req.CONFIG.VERSION_LIST.IOS.indexOf(req.query.versionCode) + 1)) ? 0 : 1;
            }
            break;
        case 'android':
            /**
             * If Android version is not supported
             */
            if(req.CONFIG.VERSION_LIST.ANDROID.indexOf(req.query.versionCode) == -1){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.ANDROID.length ==
                (req.CONFIG.VERSION_LIST.ANDROID.indexOf(req.query.versionCode) + 1)) ? 0 : 1;
            }
            break;
        case 'web':
            /**
             * If Web version is not supported
             */
            if(req.CONFIG.VERSION_LIST.WEB.indexOf(req.query.versionCode) == -1){
                rtnMessage.versionStatus = 2;
                rtnMessage.versionMessage = "Please update your application to latest version to continue using it";
                res.json(rtnMessage);
                return;
            }
            else{
                rtnMessage.versionStatus = (req.CONFIG.VERSION_LIST.WEB.length ==
                (req.CONFIG.VERSION_LIST.WEB.indexOf(req.query.versionCode) + 1)) ? 0 : 1;
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

}


module.exports = EzeoneAttrbt;