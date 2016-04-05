var express = require('express');
var router = express.Router();

var configurationV1 =  require('./configuration.js');
var recruitmentV1 =  require('./recruitment/recruitment-master.js');
var infoV1 =  require('./info/info.js');
var expenseV1 =  require('./expense.js');
var utilities =  require('./utilities/utilities.js');
var cvTempGenrate =  require('./cv_temp_genrate.js');
var itemGroupV1 =  require('./item_group/item_group_master.js');

router.use('/configuration',configurationV1);
router.use('/recruitment',recruitmentV1);
router.use('/info',infoV1);
router.use('/expense',expenseV1);
router.use('/utilities',utilities);
router.use('/cv_temp_genrate',cvTempGenrate);
router.use('/item',itemGroupV1);

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