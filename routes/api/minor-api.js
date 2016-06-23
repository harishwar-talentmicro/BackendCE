var express = require('express');
var router = express.Router();
var Ajv = require('ajv');

var configurationV1 =  require('./configuration.js');
var recruitmentV1 =  require('./recruitment/recruitment-master.js');
var infoV1 =  require('./info/info.js');
var expenseV1 =  require('./expense.js');
var utilities =  require('./utilities/utilities.js');
//var cvTempGenrate =  require('./cv_temp_genrate.js');
var itemGroupV1 =  require('./item-group/item-group-master.js');
var associationV1 =  require('./association/association-master.js');
var batchV1 =  require('./batch/batch-master.js');
var messaageBoxV1 =  require('./messagebox/messagebox-master.js');
var locForecastV1 =  require('./line-of-career/loc-master.js');
var apVersionV1 =  require('./ap-module/version.js');
//var testInfoV1 =  require('./info/test_info.js');
//var associationAPV1 =  require('./ap-module/association-ap/association-master-ap.js');

router.use('/configuration',configurationV1);
router.use('/recruitment',recruitmentV1);
router.use('/info',infoV1);
router.use('/expense',expenseV1);
router.use('/utilities',utilities);
//router.use('/cv_temp_genrate',cvTempGenrate);
router.use('/item',itemGroupV1);
router.use('/association',associationV1);
router.use('/batch',batchV1);
router.use('/mbox',messaageBoxV1);
router.use('/loc',locForecastV1);
router.use('/versionCode',apVersionV1);
//router.use('/test_info',testInfoV1);
//router.use('/association-ap',associationAPV1);

router.get('/test',function(req,res,next){
    /**
     * Keep coerceTypes true for inputData to cast one datatype into another
     * for eg. '1'[string] to 1[integer]
     */
    var inAjv = new Ajv({coerceTypes : true});
    var validInputSchema = {
        "properties" : {
            "ezeoneId" : {
                "type" : "string",
                "maxLength" : 15
            },
            "idType" : {
                "type" : "number",
                "minimum" : 1,
                "maximum" : 4
            }
        },
        "required" : ["ezeoneId","idType"]
    };
    //////////////////////////////////////////////////

    var inSchema = schemaLoader.load('/api/v1.1/test','GET','input',0);
    var outSchema1 = schemaLoader.load('/api/v1.1/test','GET','output',0);
    var outSchema2 = schemaLoader.load('/api/v1.1/test','GET','output',1);


    ajv.validate(inSchema,req.body);



    /////////////////////////////////////////////////


    if(!inAjv.validate(validInputSchema,req.query)){
        console.log('In Schema validation failed');
        res.json({
            status : false,
            error : inAjv.errors,
            message : 'Please check errors',
            data : null
        });
        return;
    }

    var validOutputSchema = {
        "properties" : {
            "id" : {
                "type" : "integer",
                "min" : 1
            },
            "companyName" : {
                "type" : "string",
                "maxLength" : 100
            }
        },
        "required" : ["id","companyName"]
    };

    var query = 'select TID AS id, CompanyName AS companyName from tmaster WHERE EZEID = ' + req.db.escape("@SGOWRI2");
    req.db.query(query, function(err,results){
        if(!err){
            console.log(results);
            if (results && results[0]){
                /**
                 * Compares only first object as we assume that one query will produce same kind of objects if
                 * multiple results are there
                 *
                 */

                var outAjv = new Ajv();
                if(!outAjv.validate(validOutputSchema,results[0])){
                    console.log('Out Schema validation failed');
                    res.status(500).json({
                        status : false,
                        message : "Invalid schema",
                        data : null,
                        error : outAjv.errors
                    });
                    return;
                }

                res.json({
                    status : true,
                    message : "Test working",
                    result : results,
                    error : null
                });
            }
            else{
                res.json({
                    status : true,
                    message : "Test working",
                    result : [],
                    error : null
                });
            }
        }
    });

});


module.exports = router;