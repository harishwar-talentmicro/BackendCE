var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var appConfig = require('../../../../ezeone-config.json');

var DBSecretKey = CONFIG.DB.secretKey;
const jsdom = require("jsdom");

var portalimporter = {};
var error = {};


var gcloud = require('gcloud');
var fs = require('fs');
var uuid = require('node-uuid');

// var appConfig = require('../../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */
var uploadDocumentToCloud = function (uniqueName, readStream, callback) {
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function () {
        console.log('done');
        if (callback) {
            if (typeof (callback) == 'function') {
                callback(null);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function (err) {
        if (callback) {
            if (typeof (callback) == 'function') {
                console.log(err);
                callback(err);
            }
            else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};


var removeExtraChars = function (params) {
    if (params && typeof (params) == 'string' && params != '') {
        params = params.replace(/<[a-zA-Z0-9=|-|'|" \\|\/|_]*>/g, '');
        params = params.replace(/<\/[a-z]*>/g, '');
        params = params.replace(/(\n)+/, '');
        params = params.replace(/not applicable/i, '');
        params = params.replace(/not disclosed/i, '');
        params = params.replace(/(Verified)/i, '');
        params = params.replace(/Not Mentioned/i, '');
        params = params.replace(/[ ]{2}/g, '');
        params = params.replace(/&amp;/g, ' ');
        params = params.replace(/<!--[a-zA-Z0-9=|-|'|" ]*-->/g, '');
        params = params.replace(/[^\x00-\x7F]/g, "");
        params = params.trim();
        return params;
    }
    else {
        return '';
    }
}


var dateConverter = function (params) {
    params = removeExtraChars(params);
    var dateStr = params;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var arr = dateStr.split(' ');
    if (arr && arr[1]) {
        arr[1] = months.indexOf(arr[1]) + 1;
        arr = arr.reverse();
        return arr.join('-');
    }
}


var checkPortalApplicants = function (portalId, applicants, req, res) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(applicants)),
                    req.st.db.escape(portalId)
                ];

                var procQuery = 'CALL wm_checkApplicantsFromPortal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Portal applicants verified successfully";
                        response.error = null;
                        if (result[0][0].importerResults && typeof (result[0][0].importerResults) == 'string') {
                            result[0][0].importerResults = JSON.parse(result[0][0].importerResults);
                        }
                        response.data = result[0][0].importerResults ? result[0][0].importerResults : [];
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Something went wrong! Please try again";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
}

var savePortalApplicants = function (portalId, cvSourceId, details, req, res) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        console.log('asdf3');
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                console.log('two');

                attachment(req, function (aUrl) {

                    req.body.requirements = req.body.requirements != 'undefined' && req.body.requirements ? req.body.requirements : [];
                   
                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(details.applicantId || 0),
                        req.st.db.escape(details.firstName),
                        req.st.db.escape(details.lastName || ""),
                        req.st.db.escape(details.mobileISD || ""),
                        req.st.db.escape(details.mobileNumber || ""),
                        req.st.db.escape(details.emailId || ""),
                        req.st.db.escape(details.employer || ""),
                        req.st.db.escape(details.jobTitle || ""),
                        req.st.db.escape(details.presentLocation || ""),
                        req.st.db.escape(aUrl || ''),
                        req.st.db.escape(portalId),
                        req.st.db.escape(cvSourceId),

                        req.st.db.escape(details.address || ""),
                        req.st.db.escape(details.experience || 0),
                        req.st.db.escape(JSON.stringify(details.primarySkills || [])),
                        req.st.db.escape(JSON.stringify(details.presentSalaryCurr || {})),
                        req.st.db.escape(JSON.stringify(details.presentSalaryScale || {})),
                        req.st.db.escape(JSON.stringify(details.presentSalaryPeriod || {})),
                        req.st.db.escape(details.presentSalary || 0),
                        req.st.db.escape(JSON.stringify(req.body.requirements || [])),
                        req.st.db.escape(details.noticePeriod || 0),
                        req.st.db.escape(details.gender || 3),  // 3 not disclosed
                        req.st.db.escape(details.DOB || null),
                        req.st.db.escape(details.resumeText || ""),
                        req.st.db.escape(details.linkedInProfile || ""),
                        req.st.db.escape(JSON.stringify(details.industry || [])),
                        req.st.db.escape(JSON.stringify(details.prefLocations || [])),
                        req.st.db.escape(details.nationality || ""),
                        req.st.db.escape(JSON.stringify(details.functionalAreas || []))
                    ];

                    var procQuery = 'CALL wm_save_savePortalApplicants( ' + inputs.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result && result[0] && result[0][0]) {
                            response.status = true;
                            response.message = "Portal applicants saved successfully";
                            response.error = null;
                            response.data = (result[0] && result[0][0]) ? result[0][0] : {};
                            res.status(200).json(response);

                        }

                        else {
                            response.status = false;
                            response.message = "Something went wrong! Please try again";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);

                        }
                    });

                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
}

var attachment = function (req, callback) {
    var aUrl = '', aFilename = '';
    if (req.files) {
        if (req.files.attachment) {
            console.log('tthree');
            var uniqueId = uuid.v4();
            var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
            var mimeType = req.files.attachment.mimetype;
            if (mimeType) {
                if (mimeType.indexOf('png') > 0 || mimeType.indexOf('jpg') > 0) {
                    filetype = "png";
                }
                else if (mimeType.indexOf('jpeg') > 0) {
                    filetype = "jpeg";
                }
                else if (mimeType.indexOf('jpg') > 0) {
                    filetype = "jpg"
                }
                else if (mimeType.indexOf('doc') > 0) {
                    filetype = "docx"
                }
                else if (mimeType.indexOf('docx') > 0) {
                    filetype = "docx"
                }
                else if (mimeType.indexOf('rtf') > 0) {
                    filetype = "rtf"
                }
                else if (mimeType.indexOf('pdf') > 0) {
                    filetype = "pdf"
                }
                else if (mimeType.indexOf('application/msword') > -1) {
                    filetype = "docx"
                }
            }
            aUrl = uniqueId + '.' + filetype;
            aFilename = req.files.attachment.originalname;
            console.log("aFilename", aFilename);
            // console.log("aFilenameaFilename", req.files.attachment);

            console.log("req.files.attachment.path", req.files.attachment.path);

            var readStream = fs.createReadStream(req.files.attachment.path);

            uploadDocumentToCloud(aUrl, readStream, function (err) {
                if (!err) {
                    console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
                    callback(aUrl);
                }
                else {
                    callback("");
                }
            });
        }
        else {
            callback(aUrl);
        }
    }
    else {
        callback(aUrl);
    }
};

portalimporter.checkApplicantExistsFromMonsterPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    // var validationFlag = true;
    var portalId = 2;

    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;

    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;

    if (req.body.is_select_all == 1) {
        console.log("req.body.is_select_all", req.body.is_select_all);
        if (document.getElementsByClassName('resumeitem'))
            for (var i = 0; i < document.getElementsByClassName('resumeitem').length; i++) {

                var name = document.getElementsByClassName('resumeitem')[i].getElementsByClassName('ritemheader')[0].getElementsByClassName('skname')[0].innerHTML;

                console.log("name", name);
                console.log(name);
                var first_name = "";
                var last_name = "";

                if (name.split(' ')) {
                    if (name.split(' ')[0])
                        first_name = removeExtraChars(name.split(' ')[0]);
                    if (name.split(' ')[1]) {
                        last_name = name.split(' ').splice(1).join(' ');
                        last_name = removeExtraChars(last_name.trim());
                    }
                }
                applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: i });
            }

        console.log("applicants", applicants);
    }

    else {
        console.log("else part");
        if (document.getElementsByClassName('resumeitem'))
            for (var i = 0; i < selected_candidates.length; i++) {
                console.log("iiii", i);
                var name = document.getElementsByClassName('resumeitem')[selected_candidates[i]].getElementsByClassName('ritemheader')[0].getElementsByClassName('skname')[0].innerHTML;
                console.log(name);
                var first_name = "";
                var last_name = "";
                console.log("name", name);
                if (name.split(' ')) {
                    if (name.split(' ')[0])
                        first_name = removeExtraChars(name.split(' ')[0]);
                    if (name.split(' ')[1]) {
                        last_name = name.split(' ').splice(1).join(' ');
                        last_name = removeExtraChars(last_name.trim());
                    }
                }
                applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: selected_candidates[i] });
            }
    }

    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        var portalId = 2;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }

    else {
        checkPortalApplicants(portalId, applicants, req, res);
    }

};


portalimporter.saveApplicantsFromMonster = function (req, res, next) {
    try{
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var portalId = 2;   // monster
        var cvSourceId = 2;
        // var validationFlag = true;
    
        var details = {};
        const { JSDOM } = jsdom;
    
        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
    
        var tempName = document.getElementsByClassName('skname');
        if (tempName && tempName[0] && tempName[0].innerHTML)
            // details.firstName = document.getElementsByClassName('skname')[0].innerHTML.trim();
            var fullName = document.getElementsByClassName('skname')[0].innerHTML.trim();
    
        if (fullName && fullName.split(' ') && fullName.split(' ')[0])
            details.firstName = removeExtraChars(fullName.split(' ')[0]);
        if (fullName && fullName.split(' ') && fullName.split(' ')[1]) {
            details.lastName = fullName.split(' ').splice(1).join(' ')
            details.lastName = removeExtraChars(details.lastName.trim());
        }
    
        var tempDetails = document.getElementsByClassName('skinfo hg_mtch');
        if (tempDetails && tempDetails[0] && tempDetails[0].innerHTML) {
            var emailid = tempDetails[0].innerHTML.trim();
            var regularExp = /[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}/;   // include /s in the end
            console.log(emailid);
    
            if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
                details.emailId = removeExtraChars(regularExp.exec(emailid)[0].trim());
    
            if (tempDetails[0].innerHTML.indexOf(' at ') > -1) {
                var tempDesignation = tempDetails[0].innerHTML.split(' at ');
                if (tempDesignation && tempDesignation[0]) {
                    details.jobTitle = removeExtraChars(tempDesignation[0].trim());
                }
                if (tempDesignation && tempDesignation[1] && tempDesignation[1].split('<br>') && tempDesignation[1].split('<br>').length) {
                    details.employer = removeExtraChars(tempDesignation[1].split('<br>')[0].trim());
                }
            }
        }
        console.log('asdf');
    
        var tempMobile = document.getElementsByClassName('mob_container');
        if (tempMobile && tempMobile[0] && tempMobile[0].innerHTML) {
            var mobilenumber = tempMobile[0].innerHTML;
            var regularExp = /(\d{7,10})/;
    
            if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                details.mobileNumber = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
        }
    
        var tempLocation = document.getElementsByClassName('skinfoitem info_loc');
        if (tempLocation && tempLocation[0] && tempLocation[0].innerHTML) {
            var location = tempLocation[0].innerHTML;
            details.presentLocation = removeExtraChars(location.trim());
        }
    
        var isTallint = req.query.isTallint || 0;
        details.resumeText = removeExtraChars(req.body.resume_text || "");
    
    
        var arrWSI = [];
        if (document.getElementsByClassName('scndinfo mrgn hg_mtch')) {
            arrWSI = document.getElementsByClassName('scndinfo mrgn hg_mtch');
    
            for (i = 0; i < arrWSI.length; i++) {
                if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Work Experience') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var exp = arrWSI[i].innerHTML.split('>:')[1].trim();
                        var years = 0;
                        var months = 0;
                        if (exp.split(' ') && exp.split(' ')[0] && exp.split(' ')[0].trim()) {
                            years = parseInt(removeExtraChars(exp.split(' ')[0].trim()));
                        }
                        if (exp.split(' ') && exp.split(' ')[3] && exp.split(' ')[3].trim()) {
                            months = parseInt(removeExtraChars(exp.split(' ')[3].trim()));
                        }
                        if (months == 6) {
                            details.experience = years + months;
                        }
                        else {
                            details.experience = years
                        }
                    }
                }
    
                //Skills
                else if (arrWSI[i].innerHTML  && arrWSI[i].innerHTML.indexOf('Skills') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var skills = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (skills) {
                            details.primarySkills = skills;
                            if (details.primarySkills && details.primarySkills.split(',').length) {
                                details.primarySkills = details.primarySkills.split(',');
                                for (var skill = 0; skill < details.primarySkills.length; skill++)
                                    details.primarySkills[skill] = removeExtraChars(details.primarySkills[skill].trim());
                            }
                        }
                    }
                }
    
                //industry
                else if (arrWSI[i].innerHTML  && arrWSI[i].innerHTML.indexOf('Industry') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var industry = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (industry && industry != 'Not Specified') {
                            details.industry = industry;
                            if (details.industry && details.industry.split(',').length) {
                                details.industry = details.industry.split(',');
                                for (var a = 0; a < details.industry.length; a++)
                                    details.industry[a] = removeExtraChars(details.industry[a].trim());
                            }
                        }
                    }
                }
    
                //preferred location
                else if (arrWSI[i].innerHTML  && arrWSI[i].innerHTML.indexOf('Preferred Job Location') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var locations = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (locations && locations != 'Not Specified')
                            details.prefLocations = locations;
                        if (details.prefLocations && details.prefLocations.split(',').length) {
                            details.prefLocations = details.prefLocations.split(',');
                            for (var a = 0; a < details.prefLocations.length; a++)
                                details.prefLocations[a] = removeExtraChars(details.prefLocations[a].trim());
                        }
                    }
                }
            }
        }
    
    
        // dob nationality gender
        var arrGN = [];
        if (document.getElementsByClassName('skr_basicinfo_other left') && document.getElementsByClassName('skr_basicinfo_other left')[0] && document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML && document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML.split('<br>')) {
            arrGN = document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML.split('<br>');
    
            for (i = 0; i < arrGN.length; i++) {
                if (arrGN[i].indexOf('Date of Birth') > -1) {
                    if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                        var DOB = new Date(arrGN[i].split(':')[1].trim());
                        details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                    }
                }
    
                else if (arrGN[i].indexOf('Gender') > -1) {
                    if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                        if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'male') {
                            details.gender = 1
                        }
                        else if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'female') {
                            details.gender = 2
                        }
                        else {
                            details.gender = 3
                        }
                    }
                }
                else if (arrGN[i].indexOf('Nationality') > -1) {
                    if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                        details.nationality = removeExtraChars(arrGN[i].split(':')[1].trim());
                    }
                }
            }
        }
    
    
    
    
        // for tallint
        if (isTallint) {
            var token = req.query.token;
            var heMasterId = req.query.heMasterId;
            // var portalId = 2;
            // var formData = {
            //     applicants: applicants
            // };
    
            var a = {
                FirstName: details.firstName,
                EmailID: details.emailId,
                MobileNo: details.mobileNumber,
                FileData: req.body.attachment
            };
    
            if (req.body.attachment.indexOf('pdf') > 0) {
                a.FileName = "asdf.pdf"
            }
            else if (req.body.attachment.indexOf('application/msword') > -1) {
                a.FileName = "asdf.docx"
            }
    
            request({
                url: req.body.tallint_url,
                method: "POST",
                json: true,
                body: a
            }, function (error, response, body) {
                // if (!err && body) {
                // console.log('tallint response here');
                // }
                console.log(response);
                console.log(error);
            });
        }
    
        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch(ex){
        response.status(500).send("Error occured");
        console.log("ex",ex);
    }
};


portalimporter.checkApplicantExistsFromNaukriPortal = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 1;   // naukri portal


    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;

    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;

    console.log(document.getElementsByClassName('tuple').length)
    var uniqueIdArray = xml_string.match(/srpTupleJson = \[\{.*\}\];/);

    if (is_select_all == 1) {

        if (document.getElementsByClassName('tuple'))
            for (var i = 0; i < document.getElementsByClassName('tuple').length; i++) {
                if (document.getElementsByClassName('tuple')[i].getAttribute('class').indexOf('viewed') == -1) {
                    var name = document.getElementsByClassName('tuple')[i].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                    console.log(name);
                    var first_name = "";
                    var last_name = "";

                    if (name.split(' ')) {
                        if (name.split(' ')[0])
                            first_name = removeExtraChars(name.split(' ')[0]);
                        if (name.split(' ')[1])
                            last_name = removeExtraChars(name.split(' ')[1]);
                    }

                    if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[i] && document.getElementsByClassName('ftRight')[i].innerHTML && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                        var lastModifiedDate = dateConverter(document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]);

                    }
                    var uniqueId = "";
                    if(uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].uniqueId){
                        uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].uniqueId;
                    }

                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 1, index: i, lastModifiedDate: lastModifiedDate,uniqueId : uniqueId});
                }
            }
    }

    else {
        console.log(document.getElementsByClassName('userChk')[0].checked);
        if (document.getElementsByClassName('tuple'))
            for (var i = 0; i < selected_candidates.length; i++) {

                var name = document.getElementsByClassName('tuple')[selected_candidates[i]].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                console.log(name);
                var first_name = "";
                var last_name = "";

                if (name.split(' ')) {
                    if (name.split(' ')[0])
                        first_name = removeExtraChars(name.split(' ')[0]);
                    if (name.split(' ')[1])
                        last_name = removeExtraChars(name.split(' ')[1]);
                }

                if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[selected_candidates[i]] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                    var lastModifiedDate = dateConverter(document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]);
                }

                 var uniqueId = "";
                    if(uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].uniqueId){
                        uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].uniqueId;
                    }

                applicants.push({ firstName: first_name, lastName: last_name, portalId: 1, index: selected_candidates[i],lastModifiedDate : lastModifiedDate,uniqueId:uniqueId });
            }
    }


    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        var portalId = 1;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }
    else {
        checkPortalApplicants(portalId, applicants, req, res);
    }
};


portalimporter.saveApplicantsFromNaukri = function (req, res, next) {

    try {
        var response = {
            status: false,
            message: "Invalid token",
            data: null,
            error: null
        };
        var validationFlag = true;
        var portalId = 1;
        var cvSourceId = 1;
        var details = {};

        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);

        var tempName = document.getElementsByClassName('bkt4 name userName');
        if (tempName && tempName[0] && tempName[0].innerHTML) {
            var name = tempName[0].innerHTML.trim(' ');
            if (name && name.split(' ')[0])
                details.firstName = removeExtraChars(name.split(' ')[0]);
            if (name && name.split(' ')[1])
                details.lastName = removeExtraChars(name.split(' ')[1]);
        }

        var tempEmailId = document.getElementsByClassName('bkt4 email');
        if (tempEmailId && tempEmailId[0] && tempEmailId[0].innerHTML) {
            var emailId = tempEmailId[0].innerHTML;
            if (emailId.split('</em>') && emailId.split('</em>')[1])
                details.emailId = removeExtraChars(emailId.split('</em>')[1].trim(' '));
        }

        var tempMobileNumber = document.getElementsByClassName('bkt4 phoneNo');
        if (tempMobileNumber && tempMobileNumber[0] && tempMobileNumber[0].innerHTML) {
            var mobileNumber = tempMobileNumber[0].innerHTML;
            if (mobileNumber.split(':'))
                details.mobileNumber = removeExtraChars(mobileNumber.split(':')[1].trim(' '));
        }

        var tempAddress = document.getElementsByClassName('address-box mt10');
        if (tempAddress && tempAddress[0] && tempAddress[0].innerHTML && tempAddress[0].innerHTML.split('</div>') && tempAddress[0].innerHTML.split('</div>')[1]) {
            details.address = removeExtraChars(tempAddress[0].innerHTML.split('</div>')[1].replace('<div>', '').trim(' '));
        }

        var tempProfilePic = document.getElementsByClassName('left-container');

        if (tempProfilePic && tempProfilePic[0] && tempProfilePic[0].getElementsByClassName('imgRound user-pic') && tempProfilePic[0].getElementsByClassName('imgRound user-pic')[0] && tempProfilePic[0].getElementsByClassName('imgRound user-pic')[0].getAttribute('src')) {
            console.log("Entered profile");
            details.profilePic = tempProfilePic[0].getElementsByClassName('imgRound user-pic')[0].getAttribute('src');
            // console.log(document.getElementsByClassName('left-container')[0].getElementsByClassName('imgRound user-pic')[0].getAttribute('src'));
            details.profilePic = removeExtraChars(details.profilePic);
            console.log(details.profilePic);
        }

        var tempExperience = document.getElementsByClassName('exp-sal-loc-box');
        if (tempExperience && tempExperience[0] && tempExperience[0].getElementsByClassName('expInfo') && tempExperience[0].getElementsByClassName('expInfo')[0] && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>") && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1] && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr') && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr')[0]) {
            console.log('Entered exp');
            details.experience = tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr')[0].trim();
            console.log(details.experience);
            if (!(parseInt(details.experience) >= 0)) {
                details.experience = 0;
            }
            details.experience = removeExtraChars(details.experience);
        }

        var tempDesignation = document.getElementsByClassName('bkt4 cDesig');
        if (tempDesignation && tempDesignation[0] && tempDesignation[0].innerHTML) {
            console.log("Entered designation");
            var designation = tempDesignation[0].innerHTML.replace(/<em class="hlite">/g, '');
            designation = designation.replace(/<em class="b-hlite">/g, '');
            designation = decodeURI(designation.replace(/<\/em>/g, ''));
            details.jobTitle = removeExtraChars(designation.trim());
            console.log(details.jobTitle);
        }

        //employer
        var tempEmployer = document.getElementsByClassName('desc cOrg');
        if (tempEmployer && tempEmployer[0] && tempEmployer[0].getElementsByClassName('cOrg bkt4') && tempEmployer[0].getElementsByClassName('cOrg bkt4')[0] && tempEmployer[0].getElementsByClassName('cOrg bkt4')[0].innerHTML) {
            var employer = document.getElementsByClassName('desc cOrg')[0].getElementsByClassName('cOrg bkt4')[0].innerHTML;
            details.employer = removeExtraChars(employer);
        }

        var tempSkills = document.getElementsByClassName('right-container');
        if (tempSkills && tempSkills[0] && tempSkills[0].getElementsByClassName('itSkill hKwd') && tempSkills[0].getElementsByClassName('itSkill hKwd')[0] && tempSkills[0].getElementsByClassName('itSkill hKwd')[0].innerHTML) {
            console.log("Entered skill");
            details.primarySkills = tempSkills[0].getElementsByClassName('itSkill hKwd')[0].innerHTML.replace(/<span id=".*/g, '');
            details.primarySkills = details.primarySkills.replace(/<em class="b-hlite">/g, '');
            details.primarySkills = details.primarySkills.replace(/<em class="hlite">/g, '');
            details.primarySkills = details.primarySkills.replace(/<\/em>/g, '');
            if (details.primarySkills && details.primarySkills.split(',').length) {
                details.primarySkills = details.primarySkills.split(',');
                for (var skill = 0; skill < details.primarySkills.length; skill++)
                    details.primarySkills[skill] = removeExtraChars(details.primarySkills[skill].trim());
            }
            // console.log(details.primarySkills);
        }

        // presentSalaryCurr
        var salaryDetails = document.getElementsByClassName('salInfo');
        if (salaryDetails && salaryDetails[0] && salaryDetails[0].innerHTML) {
            console.log("Entered salary");
            var amount = salaryDetails[0].innerHTML.replace('<em class="iconRup"></em>', '').trim().split(' ');
            if (amount && amount[0]) {
                details.presentSalary = removeExtraChars(amount[0]);
                if (amount[1] && amount[1].indexOf('Lac') > -1) {
                    details.presentSalaryScale = { scale: "Lakhs", scaleId: 4 }
                }
                document.getElementsByClassName('salInfo')[0].innerHTML.replace('<em class="iconRup"></em>', '').trim().split(' ')[0]
                if (salaryDetails[0].getElementsByClassName('iconRup') && salaryDetails[0].getElementsByClassName('iconRup').length)
                    details.presentSalaryCurr = { currencyId: 2, currencySymbol: "INR" };
                details.presentSalaryPeriod = { duration: "Per Annum", durationId: 4 };
            }
        }

        // present location
        if (document.getElementsByClassName('locInfo') && document.getElementsByClassName('locInfo')[0] && document.getElementsByClassName('locInfo')[0].innerHTML && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>') && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1] && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1].trim()) {
            var presentLocation = document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1].trim();
            details.presentLocation = removeExtraChars(presentLocation.trim());
        }

        var tempPreferedLocation = document.getElementsByClassName('exp-sal-loc-box');
        if (tempPreferedLocation && tempPreferedLocation[0] && tempPreferedLocation[0].innerHTML && tempPreferedLocation[0].innerHTML.split('>Pref </span') && tempPreferedLocation[0].innerHTML.split('>Pref </span')[1]) {
            var prefLocations = document.getElementsByClassName('exp-sal-loc-box')[0].innerHTML.split('>Pref </span')[1];

            if (details.prefLocations && details.prefLocations.split(',').length) {
                details.prefLocations = details.prefLocations.split(',');
                for (var i = 0; i < details.prefLocations.length; i++)
                    details.prefLocations[i] = removeExtraChars(details.prefLocations[i].trim());
            }
        }


        var tempGDOB = document.getElementsByClassName('clFx details-box');
        if (tempGDOB && tempGDOB[0] && tempGDOB[0].innerHTML) {
            for (var i = 0; i < document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>').length; i++) {

                if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].indexOf('Date of Birth') > -1) {
                    if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">') && document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1]) {
                        var DOB = document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1];
                        DOB = new Date(DOB.trim());
                        details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                    }
                }
                else if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].indexOf('Gender') > -1) {
                    if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">') && document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1]) {
                        var gender = document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1];
                        gender = removeExtraChars(gender);
                        if (gender.toLowerCase() == "male") {
                            details.gender = 1;
                        }
                        else if (gender.toLowerCase() == "female") {
                            details.gender = 2;
                        }
                        else {
                            details.gender = 3;
                        }
                    }
                }
            }
        }

        var tempIndustry = document.getElementsByClassName('desc indInfo');
        if (tempIndustry && tempIndustry[0] && tempIndustry[0].innerHTML && removeExtraChars(tempIndustry[0].innerHTML) != "") {
            details.industry = removeExtraChars(document.getElementsByClassName('desc indInfo')[0].innerHTML).split(',');
        }

        var tempFunctionArea = document.getElementsByClassName('desc faInfo')[0].innerHTML;
        if (tempFunctionArea && tempFunctionArea[0] && tempFunctionArea[0].innerHTML && removeExtraChars(tempFunctionArea[0].innerHTML) != "") {
            details.functionalAreas = removeExtraChars(document.getElementsByClassName('desc faInfo')[0].innerHTML).split(',');
        }

        var isTallint = req.query.isTallint || 0;

        // for tallint
        if (isTallint) {
            var token = req.query.token;
            var heMasterId = req.query.heMasterId;
            // var portalId = 2;
            var formData = {
                applicants: applicants
            };

            request({
                url: "tallint url to come here",
                method: "POST",
                json: true,
                body: formData
            }, function (error, response, body) {
                if (!err && body) {
                    console.log('tallint response here');
                }
            });
        }

        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }

    }

    catch (ex) {
        console.log(ex);
    }

};



portalimporter.checkApplicantExistsFromShinePortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 4;  // shine

    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;

    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var search_results = document.getElementsByClassName('cls_loop_chng search_result2');
    console.log('search_results', search_results.length)
    if (is_select_all == 1) {

        if (search_results)
            for (var i = 0; i < search_results.length; i++) {
                if (search_results[i]) {
                    var tempname = search_results[i].getElementsByClassName('cls_circle_name');
                    if (tempname && tempname[0] && tempname[0].innerHTML) {
                        console.log('name', name);
                        var name = tempname[0].innerHTML.trim();
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[1]) {
                                last_name = name.split(' ').splice(1).join(' ');
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }
                    }
                    document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1].trim();
                    if (document.getElementsByClassName('cls_loop_chng search_result2') && document.getElementsByClassName('cls_loop_chng search_result2')[i] && document.getElementsByClassName('cls_loop_chng search_result2')[i].getElementsByClassName('bot_profile') && document.getElementsByClassName('ftRight')[i].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n') && document.getElementsByClassName('ftRight')[i].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0] && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1]) {
                        var dateStr = document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1].trim();
                        var lastModifiedDate = dateConverter(dateStr);
                    }
                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 4, index: i, lastModifiedDate: lastModifiedDate });



                }

            }
        console.log('applicants', applicants);
    }

    else {
        // console.log(document.getElementsByClassName('userChk')[0].checked);
        if (search_results) {

            for (var i = 0; i < selected_candidates.length; i++) {
                if (selected_candidates[i] >= 0) {
                    var tempname = search_results[selected_candidates[i]].getElementsByClassName('cls_circle_name');
                    if (tempname && tempname[0] && tempname[0].innerHTML) {
                        console.log('name', name);
                        var name = tempname[0].innerHTML.trim();
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[1]) {
                                last_name = name.split(' ').splice(1).join(' ');
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }
                    }

                    if (document.getElementsByClassName('cls_loop_chng search_result2') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]] && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0] && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1]) {
                        var dateStr = document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1].trim();
                        var lastModifiedDate = dateConverter(dateStr);
                    }
                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 4, index: selected_candidates[i] });
                }
            }
            console.log('applicants', applicants);

        }
    }

    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        var portalId = 4;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }
    else {
        checkPortalApplicants(portalId, applicants, req, res);
    }
};


portalimporter.checkApplicantExistsFromTimesJobsPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 3;   // timesjob portal


    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;

    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var search_results = document.getElementsByClassName('search-result-block search-result');

    document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML


    console.log('search_results', search_results.length)
    if (is_select_all == 1) {

        if (search_results)
            for (var i = 1; i < search_results.length; i++) {
                if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML) {
                    var tempname = search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML;

                    if (tempname && tempname[0] && tempname[0].innerHTML) {
                        console.log('name', name);
                        var name = tempname[0].innerHTML.trim();
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[1]) {
                                last_name = name.split(' ').splice(1).join(' ');
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }
                    }

                    if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                        var dateStr = document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim();
                        var lastModifiedDate = dateConverter(dateStr);
                    }
                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: i, lastModifiedDate: lastModifiedDate });

                }
            }

        console.log('applicants', applicants);
    }

    else {
        // console.log(document.getElementsByClassName('userChk')[0].checked);
        if (search_results) {

            for (var i = 0; i < selected_candidates.length; i++) {
                if (selected_candidates[i] >= 0) {
                    var tempname = search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML;

                    if (search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML) {
                        console.log('name', name);
                        var name = tempname[0].innerHTML.trim();
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[1]) {
                                last_name = name.split(' ').splice(1).join(' ');
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }
                    }

                    if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                        var dateStr = document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim();
                        var lastModifiedDate = dateConverter(dateStr);
                    }
                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: selected_candidates[i] });


                }
            }
            console.log('applicants', applicants);

        }


    }


    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        var portalId = 3;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }
    else {
        checkPortalApplicants(portalId, applicants, req, res);
    }
};


portalimporter.saveApplicantsFromShine = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 4;   // Shine
    var cvSourceId = 4;

    var details = {};
    const { JSDOM } = jsdom;

    var document = new JSDOM(req.body.xml_string).window.document;
    // console.log('req.files.document',req.body.document);

    if (document && document.getElementsByClassName('cls_circle_name') && document.getElementsByClassName('cls_circle_name')[0] && document.getElementsByClassName('cls_circle_name')[0].innerHTML) {
        var tempName = document.getElementsByClassName('cls_circle_name');
        if (tempName && tempName[0] && tempName[0].innerHTML) {
            var name = tempName[0].innerHTML.trim(' ');
            if (name && name.split(' ')[0])
                details.firstName = removeExtraChars(name.split(' ')[0]);
            if (name && name.split(' ')[1]) {
                details.lastName = removeExtraChars(name.split(' ').splice(1).join(' '));
            }
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0].innerHTML) {
        var tempEmailId = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
        if (tempEmailId && tempEmailId[0] && tempEmailId[0].innerHTML) {

            var emailid = tempEmailId[0].innerHTML.trim();
            var regularExp = /[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}/;   // include /s in the end
            console.log(emailid);
            // console.log("using match all",matchAll(emailid,regularExp).toArray());
            console.log('match all here', regularExp.exec(emailid));
            // res.status(200).json(regularExp.exec(emailid)[0]);
            if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
                details.emailId = regularExp.exec(emailid)[0].trim();

            details.emailId = removeExtraChars(details.emailId);
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[1].innerHTML) {
        var tempMobileNumber = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');  // check
        if (tempMobileNumber && tempMobileNumber[1] && tempMobileNumber[1].innerHTML) {
            var mobileNumber = tempMobileNumber[1].innerHTML;
            var regularExp = /(\d{7,10})/;
            // console.log("match all mobileNumber", matchAll(mobilenumber, regularExp).toArray());
            if (regularExp.exec(mobileNumber) && regularExp.exec(mobileNumber)[0])
                details.mobileNumber = removeExtraChars(regularExp.exec(mobileNumber)[0].trim());

            // if (mobileNumber.split(':'))
            //     details.mobileNumber = mobileNumber.split(':')[1].trim(' ');
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0].innerHTML) {
        var tempEmployer = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
        if (tempEmployer && tempEmployer[0] && tempEmployer[0].innerHTML) {
            details.employer = removeExtraChars(tempEmployer[0].innerHTML.split('Company:')[1].trim(' '));
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].innerHTML) {
        var tempJobtitle = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');

        if (tempJobtitle && tempJobtitle[1] && tempJobtitle[1].innerHTML) {
            details.jobTitle = removeExtraChars(tempJobtitle[1].innerHTML.split('Job Title:')[1].trim(' '));
        }
    }


    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[2] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[2].innerHTML) {
        var tempCTC = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
        if (tempCTC && tempCTC[2] && tempCTC[2].innerHTML) {
            details.presentSalary = removeExtraChars(tempCTC[2].innerHTML.trim(' '));
        }
    }

    // if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[3].innerHTML) {
    //     var tempExperience = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
    //     if (tempExperience && tempExperience[3] && tempExperience[3].innerHTML) {
    //         details.experience = removeExtraChars(tempExperience[3].innerHTML.trim(' '));
    //     }
    // }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[4].innerHTML) {
        var tempNoticePeriod = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[4];
        if (tempNoticePeriod && tempNoticePeriod[4] && tempNoticePeriod[4].innerHTML) {
            details.noticePeriod = removeExtraChars(tempNoticePeriod[4].innerHTML.trim(' '));
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[2].innerHTML) {
        var tempLocation = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
        if (tempLocation && tempLocation[2] && tempLocation[2].innerHTML) {
            details.presentLocation = removeExtraChars(tempLocation[2].innerHTML.split('Location:')[1].trim(' '));
        }
    }

    if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[3] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[3].innerHTML) {
        var tempGender = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
        if (tempGender && tempGender[3] && tempGender[3].innerHTML) {

            if (removeExtraChars(tempGender[3].innerHTML.trim(' ')).toLowerCase().indexOf('female') > -1)
                details.gender = 2;
            else if (removeExtraChars(tempGender[3].innerHTML.trim(' ')).toLowerCase().indexOf('male') > -1)
                details.gender = 1;
        }
    }


    // if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[4] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[4].innerHTML) {
    //     var tempDOB = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
    //     if (tempDOB && tempDOB[4] && tempDOB[4].innerHTML) {
    //         details.DOB = removeExtraChars(tempDOB[4].innerHTML.trim(' '));
    //     }
    // }

    if (document && document.getElementsByClassName('resume_box wid100per') && document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn') && document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn')) {
        var tempSkills = document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn'); // [0].innerHTML;
        var skills = [];
        for (var i = 0; i < tempSkills.length; i++) {
            if (tempSkills && tempSkills[i] && tempSkills[i].getElementsByClassName('pro_mid') && tempSkills[i].getElementsByClassName('pro_mid')[0] && tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML) {
                skills.push(removeExtraChars(tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML.split('<b')[0]));
            }
        }
        details.primarySkills = skills;
    }

    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        // var portalId = 4;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }

    else {
        savePortalApplicants(portalId, cvSourceId, details, req, res);
    }
};





portalimporter.saveApplicantsFromTimesjobs = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 3;   // timesjob
    var cvSourceId = 3;

    var details = {};
    const { JSDOM } = jsdom;

    var document = new JSDOM(req.body.xml_string).window.document;
    // console.log('req.files.document',req.body.document);

    var tempName = document.getElementsByClassName('candidate-info lft');

    if (tempName && tempName[0] && tempName[0].getElementsByTagName('li') && tempName[0].getElementsByTagName('li')[0] && tempName[0].getElementsByTagName('li')[0].innerHTML)
        var fullName = document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[0].innerHTML.trim();

    if (fullName && fullName.split(' ') && fullName.split(' ')[0])
        details.firstName = removeExtraChars(fullName.split(' ')[0]);
    if (fullName && fullName.split(' ') && fullName.split(' ')[1]) {
        details.lastName = fullName.split(' ').splice(1).join(' ')
        details.lastName = removeExtraChars(details.lastName.trim());
    }

    var tempDetails = document.getElementsByClassName('candidate-contact lft');
    if (tempDetails && tempDetails[0] && tempDetails[0].getElementsByTagName('a') && tempDetails[0].getElementsByTagName('a')[1] && tempDetails[0].getElementsByTagName('a')[1].innerHTML) {
        var emailid = tempDetails[0].getElementsByTagName('a')[1].innerHTML.trim();
        var regularExp = /[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}/;   // include /s in the end
        console.log('match all here', regularExp.exec(emailid));
        if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
            details.emailId = removeExtraChars(regularExp.exec(emailid)[0].trim());


        // if (tempDetails[0].innerHTML.indexOf(' at ') > -1) {
        //     var tempDesignation = tempDetails[0].innerHTML.split(' at ');
        //     if (tempDesignation && tempDesignation[0]) {
        //         details.jobTitle = tempDesignation[0].trim();
        //     }
        //     if (tempDesignation && tempDesignation[1] && tempDesignation[1].split('<br>') && tempDesignation[1].split('<br>').length) {
        //         details.employer = tempDesignation[1].split('<br>')[0].trim();
        //     }
        // }
    }

    var tempMobile = document.getElementsByClassName('candidate-contact lft');
    if (tempMobile && tempMobile[0] && tempMobile[0].getElementsByTagName('a') && tempMobile[0].getElementsByTagName('a')[0] && tempMobile[0].getElementsByTagName('a')[0].innerHTML) {
        var mobilenumber = tempMobile[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[1];
        var regularExp = /(\d{7,10})/;
        if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
            details.mobileNumber = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
    }

    var tempMobileIsd = document.getElementsByClassName('candidate-contact lft');
    if (tempMobileIsd && tempMobileIsd[0] && tempMobileIsd[0].getElementsByTagName('a') && tempMobileIsd[0].getElementsByTagName('a')[0] && tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML) {
        var mobileISD = tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[0];
        var regularExp = /(\d{7,10})/;
        if (regularExp.exec(mobileISD) && regularExp.exec(mobileISD)[0])
            details.mobileISD = removeExtraChars(regularExp.exec(mobileISD)[0].trim());
    }

    var tempExp = document.getElementsByClassName('candidate-info lft');
    if (tempExp && tempExp[0] && tempExp[0].getElementsByTagName('li') && tempExp[0].getElementsByTagName('li')[1] && tempExp[0].getElementsByTagName('li')[1].innerHTML) {
        details.experience = removeExtraChars(document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[1].innerHTML.trim()).split('Year')[0].trim();
        console.log(details.experience);
    }


    // var tempSalary = document.getElementsByClassName('candidate-info lft');
    // if(tempSalary && tempSalary[0] && tempSalary[0].getElementsByTagName('li') && tempSalary[0].getElementsByTagName('li')[1] && tempSalary[0].getElementsByTagName('li')[1].innerHTML){
    //     details.presentSalary = document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[1].innerHTML.split('</span>')[1].trim();
    // }


    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        // var portalId = 4;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }

    else {
        savePortalApplicants(portalId, cvSourceId, details, req, res);
    }
};


portalimporter.savePortalApplicantsLinkedIn = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    // var validationFlag = true;
    var portalId = 8;  // linkedIn
    var cvSourceId = 8; // linkedIn
    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var contact_string = req.body.contact_string;

    var document = new JSDOM(xml_string).window.document;

    var contact = new JSDOM(contact_string).window.document;
    var applicants = [];
    var details = {};

    // linkedIn Profile
    if (contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url') && contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url')[0] && contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url')[0].getElementsByClassName('pv-contact-info__contact-link') && contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url')[0].getElementsByClassName('pv-contact-info__contact-link')[0] && contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url')[0].getElementsByClassName('pv-contact-info__contact-link')[0].innerHTML) {
        details.linkedInProfile = removeExtraChars(contact.getElementsByClassName('pv-contact-info__contact-type ci-vanity-url')[0].getElementsByClassName('pv-contact-info__contact-link')[0].innerHTML.trim());
    }

    if (document.getElementsByClassName('pv-top-card-section__name')[0].innerHTML.trim()) {
        name = document.getElementsByClassName('pv-top-card-section__name')[0].innerHTML.trim();
        if (name.split(' ')) {
            if (name.split(' ')[0])
                details.firstName = removeExtraChars(name.split(' ')[0]);
            if (name.split(' ')[1]) {
                last_name = name.split(' ').splice(1).join(' ');
                details.lastName = removeExtraChars(last_name.trim());
            }
        }
    }

    //skills
    if (document.getElementsByClassName('pv-skill-category-entity__name') && document.getElementsByClassName('pv-skill-category-entity__name').length && document.getElementsByClassName('pv-skill-category-entity__name')[0]) {
        // window.scrollTo(0, (document.body.scrollHeight - 1000));
        // document.getElementsByClassName('pv-profile-section__card-action-bar')[0].click()
        var skilllength = document.getElementsByClassName('pv-skill-category-entity__name').length;
        var skills = [];
        details.primarySkills = [];
        for (var i = 0; i < skilllength; i++) {
            if (document.getElementsByClassName('pv-skill-category-entity__name')[i] && document.getElementsByClassName('pv-skill-category-entity__name')[i].getElementsByTagName('span').length)
                skills.push(removeExtraChars(document.getElementsByClassName('pv-skill-category-entity__name')[i].getElementsByTagName('span')[0].innerHTML.trim()));
            else
                skills.push(removeExtraChars(document.getElementsByClassName('pv-skill-category-entity__name')[i].innerHTML.trim()));
        }
        details.primarySkills = skills;
    }


    //company name 
    if (document.getElementsByClassName('pv-top-card-v2-section__entity-name pv-top-card-v2-section__company-name') && document.getElementsByClassName('pv-top-card-v2-section__entity-name pv-top-card-v2-section__company-name')[0] && document.getElementsByClassName('pv-top-card-v2-section__entity-name pv-top-card-v2-section__company-name')[0].innerHTML) {

        details.employer = removeExtraChars(document.getElementsByClassName('pv-top-card-v2-section__entity-name pv-top-card-v2-section__company-name')[0].innerHTML.trim());
    }

    //location
    if (document.getElementsByClassName('pv-top-card-section__location') && document.getElementsByClassName('pv-top-card-section__location')[0] && document.getElementsByClassName('pv-top-card-section__location')[0].innerHTML) {

        details.presentLocation = removeExtraChars(document.getElementsByClassName('pv-top-card-section__location')[0].innerHTML.trim());
    }

    //emailid
    if (contact.getElementsByClassName('pv-contact-info__contact-type ci-email') && contact.getElementsByClassName('pv-contact-info__contact-type ci-email')[0] && contact.getElementsByClassName('pv-contact-info__contact-type ci-email')[0].getElementsByClassName('pv-contact-info__contact-link') && contact.getElementsByClassName('pv-contact-info__contact-type ci-email')[0].getElementsByClassName('pv-contact-info__contact-link')[0] && contact.getElementsByClassName('pv-contact-info__contact-type ci-email')[0].getElementsByClassName('pv-contact-info__contact-link')[0].innerHTML) {
        var emailId = contact.getElementsByClassName('pv-contact-info__contact-type ci-email')[0].getElementsByClassName('pv-contact-info__contact-link')[0].innerHTML;

        var regularExp = /[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}/;   // include /s in the end
        if (regularExp.exec(emailId) && regularExp.exec(emailId)[0]) {
            details.emailId = removeExtraChars(regularExp.exec(emailId)[0].trim());
        }
    }

    var isTallint = req.query.isTallint || 0;

    // for tallint
    if (isTallint) {
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        var portalId = 8;
        var formData = {
            applicants: applicants
        };

        request({
            url: "tallint url to come here",
            method: "POST",
            json: true,
            body: formData
        }, function (error, response, body) {
            if (!err && body) {
                console.log('tallint response here');
            }
        });
    }

    else {
        savePortalApplicants(portalId, cvSourceId, details, req, res);
    }

};

module.exports = portalimporter;
