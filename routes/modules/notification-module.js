var st = null;

function Notification(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 *
 * @param req
 * @param res
 * @param next
 *
 * @service-param username* <string> (EZEOne ID of the person who wants to authenticate)
 * @service-param password* <string> (Token after user has logged in)
 *
 */
Notification.prototype.authUser = function(req,res,next){
    var ezeoneid = req.query.username;
    var token = req.query.password;
    res.send('deny');
};

Notification.prototype.authVHost = function(req,res,next){
    res.send('deny');
};

Notification.prototype.authResource = function(req,res,next){
    res.send('deny');
};


module.exports = Notification;