var express = require('express');
var router = express.Router();

router.get('/test',function(req,res,next){
    var query = 'select * from tmaster WHERE EZEID = ' + req.db.escape("@SGOWRI2");
    req.db.query(query, function(err,results){
        if(!err){
            if (results){
                console.log(results);
                res.json({
                    status : true,
                    message : "Test working",
                    result : (results) ? ((results[0]) ? results[0] : null) : null
                });
            };
        }
    });

});

module.exports = router;