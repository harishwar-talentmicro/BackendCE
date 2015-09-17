var express = require('express');
var router = express.Router();

router.all('*',function(req,res,next){
    next();
});

module.exports = router;