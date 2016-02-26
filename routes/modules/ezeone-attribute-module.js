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

    var data = appConfig.SIGNUPDATA
    res.status(200).json(data);

}


module.exports = EzeoneAttrbt;