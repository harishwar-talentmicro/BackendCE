"use strict";

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');

var DbHelper = require('./../helpers/DatabaseHandler');
var db = DbHelper.getDBContext();

var maintainenceTemplate = fs.readFileSync('../views/maintainence.ejs','utf-8');
var htmlAlumniIndex = ejs.render(maintainenceTemplate);



router.get('*',function(req,res,next){
    console.log('Hello');
    var hostName = req.headers.host;
    console.log('Hostname : '+hostName);
    if(hostName){
        if(hostName.length){
            var hostNameParsed = hostName.split('.');
            if(hostNameParsed.length){

                var alumniName = hostNameParsed[0];
                if(alumniName !== 'www'){
                    /**
                     * Call procedure to fetch out alumniName
                     * If result is greater than 0, then serve alumni content else redirect him to ezeone
                     *
                     * SELECT id FROM alumni_tbl WHERE alumni = st.db.escape(alumniName);
                     *
                     * Run the above query and when results come then serve folder other than public
                     */
                     var procQuery = 'CALL pvalidatealumnicode('+db.escape(alumniName) +')';

                     console.log(procQuery);
                     db.query(procQuery,function(err,results){
                        if(err){
                           console.log('Error in pvalidatealumnicode');
                           console.log(err);
                           next();
                        }
                        else{
                            console.log(results);
                            if(results){
                                if(results[0]){
                                    if(results[0][0]){
                                        if(results[0][0].tid){
                                            var pt = req.params[0] ? req.params[0] : 'index.html';
                                            res.sendfile(pt, {root: path.join(__dirname,'../public-alumni')});

                                        }
                                        else{
                                            next();
                                        }
                                    }
                                    else{
                                        next();
                                    }
                                }
                                else{
                                    next();
                                }
                            }
                            else{
                                next();
                            }
                        }
                     });


                }
                else{
                    next();
                }
            }
            else{
                next();
            }
        }
        else{
            next();
        }
    }
    else{
        next();
    }
});

module.exports = router;