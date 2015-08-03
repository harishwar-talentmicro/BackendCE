var st = null;

function Notification(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 *
 * Authorizes an MQTT user based on ezeoneId and token
 * @param req
 * @param res
 * @param next
 *
 * @service-param username* <string> (EZEOne ID of the person who wants to authenticate)
 * @service-param password* <string> (Token after user has logged in)
 *
 */
Notification.prototype.authUser = function(req,res,next){
    var ezeoneId = req.query.username;
    var token = req.query.password;
    var status = true;

    if(!token){
        status *= false;
    }

    if(!ezeoneId){
        status *= false;
    }

    try{
        st.validateToken(token,function(err,result){
            if(err){
                console.log('Error : Notification Module authUser - while token validation');
                console.log(err);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
                res.send('deny');
            }
            else{
                if(result){
                    res.send('allow');
                }
                else{
                    console.log('Access Denied : Notification Module authUser - while token validation');
                    res.send('deny');
                }
            }
        });
    }
    catch(ex){
        console.log('Error : Notification Module authUser');
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.send('deny');
    }


};

Notification.prototype.authVHost = function(req,res,next){
    var ezeoneId = req.query.username;
    var token = req.query.password;
    var status = true;

    if(!token){
        status *= false;
    }

    if(!ezeoneId){
        status *= false;
    }

    try{
        st.validateToken(token,function(err,result){
            if(err){
                console.log('Error : Notification Module authUser - while token validation');
                console.log(err);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
                res.send('deny');
            }
            else{
                if(result){
                    res.send('allow');
                }
                else{
                    console.log('Access Denied : Notification Module authUser - while token validation');
                    res.send('deny');
                }
            }
        });
    }
    catch(ex){
        console.log('Error : Notification Module authUser');
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.send('deny');
    }
};

Notification.prototype.authResource = function(req,res,next){
    var ezeoneId = req.query.username;
    var token = req.query.password;

    // RabbitMQ virtual host
    var vHost = req.query.vhost;

    // RabbitMQ resource path
    var resource = req.query.resource;

    // RabbitMQ resource Name
    var resourceName = req.query.name;

    // RabbitMQ resource permissions : Configure, read and write
    var resourcePermission = req.query.permission;

    var status = true;

    if(!token){
        status *= false;
    }

    if(!ezeoneId){
        status *= false;
    }

    if(resourcePermission == 'configure'){
        status *= false;
    }

    if(!status){
        res.status(200).send('deny');
    }
    else{
        try{
            st.validateToken(token,function(err,result){
                if(err){
                    console.log('Error : Notification Module authUser - while token validation');
                    console.log(err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    res.status(200).send('deny');
                }
                else{
                    if(result){
                        res.status(200).send('allow');
                    }
                    else{
                        console.log('Access Denied : Notification Module authUser - while token validation');
                        res.status(200).send('deny');
                    }
                }
            });
        }
        catch(ex){
            console.log('Error : Notification Module authUser');
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(200).send('deny');
        }
    }

};


module.exports = Notification;