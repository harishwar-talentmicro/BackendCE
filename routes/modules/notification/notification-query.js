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

    var query = "SELECT tid FROM tmgroups WHERE tid = "+ st.db.escape(groupId) + " AND AdminID = " +
            " (SELECT masterid FROM tloginout WHERE token = "+ st.db.escape(groupId) + " LIMIT 1)";


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
};

module.exports = NotificationQueryManager;