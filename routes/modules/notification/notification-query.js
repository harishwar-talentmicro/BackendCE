function NotificationQueryManager(db,stdLib){

};

/**
 * Checks if the logged in user is admin of this group or not
 * @param token
 * @param groupId
 * @param isGroupAdminCallback (err,result)
 *  err : Error in execution of query , result : boolean (true if isAdmin and false if not an admin)
 */
NotificationQueryManager.prototype.isGroupAdminByToken = function(token,groupId,isGroupAdminCallback){

    if((typeof(isGroupAdminCallback)).toString() !== "function"){
        isGroupAdminCallback = function(error,res){
            console.log('No callback passed to isGroupAdminByToken');
            if(error){
                console.log('Error in isGroupAdminByToken');
                console.log(error);
            }
            else{
                console.log(res);
            }
        };
    }

    if(token && groupId){
        var query = "SELECT tid FROM tmgroups WHERE tid = "+ st.db.escape(groupId) + " AND AdminID = " +
            " (SELECT masterid FROM tloginout WHERE token = "+ st.db.escape(token) + " LIMIT 1)";


        st.db.query(query,function(err,results){
            if(err){
                console.log('Error in isGroupAdminByToken');
                console.log(err);
                isGroupAdminCallback(err,null);
            }
            else{
                if(results){
                    if(results[0]){
                        isGroupAdminCallback(null,true);
                    }
                    else{
                        isGroupAdminCallback(null,false);
                    }
                }
            }
        });
    }

};


/**
 * Checks if the logged in user is admin of this group or not
 * @param masterId
 * @param getEzeidDetailsCallback (err,result)
 *  err : Error in execution of query , result : boolean (true if isAdmin and false if not an admin)
 */
NotificationQueryManager.prototype.getEzeidDetails = function(masterId,getEzeidDetailsCallback){

    if((typeof(getEzeidDetailsCallback)).toString() !== "function"){
        getEzeidDetailsCallback = function(error,res){
            console.log('No callback passed to getEzeidDetailsCallback');
            if(error){
                console.log('Error in getEzeidDetailsCallback');
                console.log(error);
            }
            else{
                console.log(res);
            }
        };
    }

    if(token && groupId){
        var query = "SELECT ezeid FROM tmaster WHERE tid = "+ st.db.escape(masterId) + " LIMIT 1";


        st.db.query(query,function(err,results){
            if(err){
                console.log('Error in isGroupAdminByToken');
                console.log(err);
                getEzeidDetailsCallback(err,null);
            }
            else{
                if(results){
                    if(results[0]){
                        getEzeidDetailsCallback(null,results[0]);
                    }
                    else{
                        getEzeidDetailsCallback(null,null);
                    }
                }
            }
        });
    }

};



NotificationQueryManager.getGroupInfo = function(groupId,groupType,getGroupInfoCallback){
    if((typeof(getGroupInfoCallback)).toString() !== "function"){
        getGroupInfoCallback = function(error,res){
            console.log('No callback passed to getGroupInfo');
            if(error){
                console.log('Error in getGroupInfo');
                console.log(error);
            }
            else{
                console.log(res);
            }
        };
    }


    var queryParams = st.db.escape(groupId)+','+st.db.escape(type);
    var query = 'CALL pGetGroupInfn(' + queryParams + ')';

    st.db.query(query, function (err, getResult) {
        if (!err) {
            if (getResult) {
                if (getResult[0]) {
                    if (getResult[0].length > 0){
                        if(getResult[0][0]){
                            if(getResult[0][0]){
                                getGroupInfoCallback(null,getResult[0][0]);
                            }
                            else{
                                getGroupInfoCallback(null,null);
                            }
                        }
                        else{
                            getGroupInfoCallback(null,null);
                        }

                    }
                    else{
                        getGroupInfoCallback(null,null);
                    }

                }
                else{
                    getGroupInfoCallback(null,null);
                }

            }
            else{
                getGroupInfoCallback(null,null);
            }

        }
        else{
            getGroupInfoCallback(err,null);
        }
    })
};


module.exports = NotificationQueryManager;