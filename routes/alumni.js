"use strict";

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var url = require('url');

var DbHelper = require('./../helpers/DatabaseHandler');
var db = DbHelper.getDBContext();

var maintainenceTemplate = fs.readFileSync('../views/maintainence.ejs','utf-8');
var htmlAlumniIndex = ejs.render(maintainenceTemplate);

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}



router.get('*',function(req,res,next){
    console.log('Hello');
    var hostName = req.headers.host;
    console.log('Hostname : '+hostName);
    if(hostName){
        if(hostName.length){
            var hostNameParsed = hostName.split('.');
            if(hostNameParsed.length){

                var alumniName = alterEzeoneId(hostNameParsed[0]);
                if(!(alumniName == 'www' || alumniName == '@www')){
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


                                            /**
                                             * User has requested for a file or a path
                                             * By default we assume he haven't requested for any file
                                             */

                                            var urlPathFileRequest = false;

                                            var parsedUrl = url.parse(req.originalUrl);
                                            console.log(parsedUrl);
                                            var pathSplit = (parsedUrl.pathname) ? parsedUrl.pathname.split('/') : [];



                                            /**
                                             * Parsing the request url to find out for what user has requested this path
                                             */
                                            console.log('pathSplit');
                                            console.log(pathSplit);

                                            if(pathSplit.length > 0){
                                                var lastPathSec = pathSplit[pathSplit.length - 1];
                                                console.log('lastPathSec');
                                                console.log(lastPathSec);
                                                if(lastPathSec){
                                                    console.log('lastPathSec split');
                                                    console.log(lastPathSec.split('.'));
                                                    if(lastPathSec.split('.').length > 1){
                                                        /**
                                                         * User is requesting for a file send him a 404 header with
                                                         * no content or custom not found page
                                                         */
                                                        urlPathFileRequest = true;
                                                    }
                                                }
                                            }

                                            if(!pathSplit.length){
                                                res.status(200).sendFile('index.html', {root: path.join(__dirname,'../public-alumni')});
                                            }
                                            else{
                                                var fileStats = null;

                                                try{
                                                    fileStats = fs.statSync(path.join(__dirname,'../public-alumni')+ parsedUrl.pathname);
                                                }
                                                catch(ex){
                                                    fileStats = null;
                                                }


                                                var fileSent = false;

                                                if(fileStats){
                                                    if(fileStats.isFile()){
                                                        fileSent = true;
                                                        res.status(200).sendFile(parsedUrl.pathname, {root: path.join(__dirname,'../public-alumni')});
                                                    }
                                                }

                                                if(!fileSent){
                                                    var tmpPath = '';
                                                    for(var i = pathSplit.length; i > 0 ; i--){
                                                        tmpPath =  ((pathSplit[i]) ? '/' +pathSplit[i] : '') + tmpPath;
                                                        console.log(tmpPath);

                                                        try{
                                                            fileStats = fs.statSync(path.join(__dirname,'../public-alumni')+ tmpPath);
                                                        }
                                                        catch(ex){
                                                            fileStats = null;
                                                        }
                                                        if(fileStats){
                                                            if(fileStats.isFile()){
                                                                fileSent = true;
                                                                res.status(200).sendFile(tmpPath, {root: path.join(__dirname,'../public-alumni')});
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }

                                                if(!fileSent){
                                                    if(urlPathFileRequest){
                                                        res.status(404).send('Not found');
                                                    }
                                                    else{
                                                        res.status(200).sendFile('index.html', {root: path.join(__dirname,'../public-alumni')});
                                                    }
                                                }

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