var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');
var url = require('url');

var DbHelper = require('../../helpers/DatabaseHandler');
var db = DbHelper.getDBContext();

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
    var parsedUrl = url.parse(req.originalUrl);

    var requestedPath = parsedUrl.pathname;

    console.log(parsedUrl);

    var alumniDomainList = ['www.vvalumni.com'];


        console.log('Hostname : '+hostName);

        if(hostName && hostName.length){
            var hostNameParsed = hostName.split('.');
            if(hostNameParsed.length){

                var alumniName = hostNameParsed[0];
                if(alumniName == 'www' || alumniName == '@www'){
                    next();
                }
                else{


                    alumniName = alterEzeoneId(alumniName);
                    /**
                     * If browser tries to open a branch ezeid then split the branch code and just return master ezeid
                     * _ (underscore) is separator for branch code
                     */
                    alumniName = alumniName.split('_')[0];
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
                            res.redirect(req.CONFIG.CONSTANT.EZEONE_URL);
                        }
                        else{
                            console.log(results);
                            if(results && results[0] && results[0][0] && results[0][0].verified == 2){
                                /**
                                 * Loads alumni portal
                                 */

                                    /**
                                     * User has requested for a file or a path
                                     * By default we assume he haven't requested for any file
                                     */
                                    console.log('calling next');

                                    next();



                                ///**
                                // * Loads custom web portal for verified companies
                                // */
                                //else if(results[0][0].verified == 2){
                                //    alumniName = alumniName.replace('@','');
                                //    console.log('Coming to alumni block');
                                //    console.log('Redirecting to '+ alumniName + req.CONFIG.EZEONE_DOMAIN + parsedUrl.pathname);
                                //    res.redirect('https://'+alumniName + req.CONFIG.EZEONE_DOMAIN + parsedUrl.pathname);
                                //}
                                /**
                                 * Loads ezeone portal
                                 */


                            }
                            else{
                                res.redirect(req.CONFIG.CONSTANT.EZEONE_URL);
                            }
                        }
                    });
                }
            }
            else{
                                           res.redirect(req.CONFIG.CONSTANT.EZEONE_URL);
            }
        }
        else{
                                       res.redirect(req.CONFIG.CONSTANT.EZEONE_URL);
        }
});

module.exports = router;
