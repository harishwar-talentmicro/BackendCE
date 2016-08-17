/**
 * Created by Hirecraft on 18-07-2016.
 */


MasterCtrl = {};
/**
 * Getting all options of fields related to resume which user will get at the time of saving resume
 * @method GET
 * @param req
 * @param res
 * @param next
 * @service-param q {string)
 *
 */
MasterCtrl.getMasterDetail = function(req,res,next){
    var response = {
        status : false,
        message : "Your session has expired please login to continue",
        data : null,
        error : {
            token : "Token is expired"
        }
    };
    var error = {};
    try {

        var jobTypeOutput = [];
        var specializationOutput = [];
        /**
         * creating jobTypeList from array of job type
         * @type {string[]}
         */

        var jobType = [
            'Full Time',
            'Part Time',
            'Work from Home',
            'Internship',
            'Apprenticeship',
            'Job Oriented Training',
            'Consultant',
            'Freelancer'
        ];
        for (var m = 0; m < jobType.length; m++){
            jobObject = {};
            jobObject.jobTypeId = m;
            jobObject.jobTypeTitle = jobType[m];
            jobTypeOutput.push(jobObject);
        }
        /**
         * validating token
         * */
        /**
         * to get all available results education id and loc id passing as 0
         * @type {string}
         */

        req.st.validateTokenAp(req.query.token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    /**
                     * isAreaPatner is flag to differentiate that request is coming from ezeone
                     * application or area partner application for pgetinstituelist procedure
                     */
                    var isAreaPatner = 1;
                    var locationParams = req.db.escape(req.query.token);
                    var countryCodeParams = req.db.escape(req.query.langId);
                    var instituteParams = [req.db.escape(req.query.token),req.db.escape(isAreaPatner)];
                    /**
                     * to get all available results education id and loc id passing as 0
                     * @type {string}
                     */
                    var query = 'CALL pGetEducations('+ 0 +'); CALL pgetcitys_ap('+ locationParams +');CALL pgetLOC('+ 0 +');' +
                        'CALL Pgetindustrycategory(' + 0 + '); CALL pGetindustryType(); CALL pget_country_code('+ countryCodeParams +');' +
                        'CALL pgetlanguages();' + 'CALL pgetinstituelist(' + instituteParams.join(',') + ');';
                    console.log(query);
                    req.db.query(query, function (err, results) {
                        if (!err) {
                            if (results && results[0] && results[0].length > 0) {
                                var outputInstitute = [];
                                if (results[14]){
                                    for (var k = 0; k < results[14].length; k++ ){
                                        var instituteResult = {};
                                        instituteResult.title = results[14][k].title,
                                        instituteResult.instituteId = results[14][k].institute_id
                                        outputInstitute.push(instituteResult);
                                    }
                                }

                                /**
                                 * preparing query to get all specialisation of education id
                                 * after that making object for multiple specialization for multiple education
                                 * @type {string}
                                 */
                                var specializationQuery = '';
                                for (var i = 0; i < results[0].length; i++){
                                    var specialisationParams = req.db.escape(results[0][i].TID);
                                    specializationQuery += "CALL pGetSpecialization("+ specialisationParams +");"
                                }
                                var outputSpecialization = [];
                                req.db.query(specializationQuery, function (err, specializationResult) {
                                    if (!err) {
                                        if (specializationResult && specializationResult.length) {
                                            for(var j = 0; j < specializationResult.length/2; j++){
                                                for (var k = 0; k < specializationResult[j*2].length; k++){
                                                    var result = {};
                                                    result.tid = specializationResult[j*2][k].TID;
                                                    result.title = specializationResult[j*2][k].Title;
                                                    result.educationId = results[0][j].TID;
                                                    outputSpecialization.push(result);
                                                }
                                            }
                                            //console.log(outputSpecialization);
                                            response.status = true;
                                            response.data = {
                                                instituteList : outputInstitute,
                                                languageList : results[12],
                                                industryCategoryList : results[6],
                                                industryTypeList : results[8],
                                                countryList : results[10],
                                                educationList : results[0],
                                                educationSplList : outputSpecialization,
                                                jobTypeList : jobTypeOutput,
                                                preferredLocationList : results[2],
                                                lineOfCareerList : results[4]
                                            };
                                            response.error = null;
                                            response.message = 'Template list loaded successfully';
                                            res.status(200).json(response);
                                        }
                                        else {
                                            console.log('Error while getting specialization');
                                            response.status = true;
                                            response.data = {
                                                instituteList : outputInstitute,
                                                languageList : results[12],
                                                industryCategoryList : results[6],
                                                industryTypeList : results[8],
                                                countryList : results[10],
                                                educationList : results[0],
                                                educationSplList : outputSpecialization,
                                                jobTypeList : jobTypeOutput,
                                                preferredLocationList : results[2],
                                                lineOfCareerList : results[4]
                                            };
                                            response.error = null;
                                            response.message = 'Template list loaded successfully';
                                            res.status(200).json(response);
                                        }
                                    }
                                    else {
                                        response.status = true;
                                        response.data = {
                                            instituteList : outputInstitute,
                                            languageList : results[12],
                                            industryCategoryList : results[6],
                                            industryTypeList : results[8],
                                            countryList : results[10],
                                            educationList : results[0],
                                            educationSplList : outputSpecialization,
                                            jobTypeList : jobTypeOutput,
                                            preferredLocationList : results[2],
                                            lineOfCareerList : results[4]
                                        };
                                        response.error = null;
                                        response.message = 'Master list loaded successfully';
                                        res.status(200).json(response);

                                        console.log('Error while getting specialization');
                                        console.log(err);
                                    }
                                });
                            }
                            else {
                                response.message = 'Master list is not available';
                                response.error = {};
                                res.json(response);
                            }
                        }
                        else {
                            response.data = null;
                            response.message = 'Error in getting master List';
                            console.log('getMasterDetail: Error in getting master List' + err);
                            res.status(500).json(response);
                        }
                    });
                }
                else {
                    response.message = 'Invalid token';
                    response.error = {
                        token: 'Invalid Token'
                    };
                    response.data = null;
                    res.status(401).json(response);
                    console.log(' Master : Invalid token');
                }
            }
            else {
                response.error = {
                    server: 'Internal Server Error'
                };
                response.message = 'Error in validating Token';
                res.status(500).json(response);
                console.log('getMasterDetail:Error in processing Token' + err);
            }
        });
    }
    catch (ex) {
        response.error = {};
        response.message = 'An error occured !';
        console.log('getMasterDetail:error ' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        res.status(400).json(response);
    }
};


//var NodeGeocoder = require('node-geocoder');
//var geocoder = require('geocoder');

/*MasterCtrl.getLatLong = function(req,res,next){


    var options = {
        provider: 'google',

        // Optional depending on the providers
        httpAdapter: 'https', // Default
        apiKey: '', // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    };

    //var geocoder = NodeGeocoder(options);
    var query = 'SELECT tid,title,latitude,longitude FROM mcity_ap LIMIT 77,1';
    var query1 = '';
    req.db.query(query, function (err, results1) {
        console.log(results1);
        if (!err && results1 && results1.length){
            var i = 0;
            while (i < results1.length){
                getLocation(results1[i].title,results1[i].tid);
                i++;
            }
            res.send(200)
        }
        else {
            console.log('err',err);
            res.send(500);
        }

    });
    var getLocation = function(title,tid){

        geocoder.geocode(title, function(err, data) {
            if (!err){
                console.log(data);
                console.log('data1',data.results[0].geometry.location.lat);
                console.log('data2',data.results[0].geometry.location.lng);
                var query1 = 'UPDATE mcity_ap SET latitude= '+ req.db.escape(data.results[0].geometry.location.lat)+',longitude='+
                    req.db.escape(data.results[0].geometry.location.lng) +' WHERE tid= '+req.db.escape(tid)+';';
                console.log(query1);
                req.db.query(query1, function (err, finalResults) {
                    if (!err){
                        console.log('Success');

                    }
                    else {
                        console.log('err',err);
                    }
                });
            }
            else {
                console.log(err);
            }
        });
    }
};*/


module.exports = MasterCtrl;
