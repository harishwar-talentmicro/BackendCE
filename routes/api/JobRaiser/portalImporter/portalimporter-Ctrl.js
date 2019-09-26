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
var path = require('path');

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
        params = params.replace(/<[a-zA-Z0-9=|\-|'|" \\|\/|_;&():#\+\.,@\!%$\^\*]*>/g, '');
        params = params.replace(/<\/[a-z]*>/g, '');
        params = params.replace(/(\n)+/, ' ');
        params = params.replace(/not applicable/i, '');
        params = params.replace(/Not Applicable/i, '');
        params = params.replace(/not disclosed/i, '');
        params = params.replace(/Not Disclosed/i, '');
        params = params.replace(/(Verified)/i, '');
        params = params.replace(/not mentioned/i, '');
        params = params.replace(/Not Mentioned/i, '');
        params = params.replace(/not specified/i, '');
        params = params.replace(/Not Specified/i, '');
        params = params.replace(/[ ]{2}/g, ' ');
        params = params.replace(/&amp;/g, '&');
        params = params.replace(/<!--[a-zA-Z0-9=|-|'|" \\|\/|_;():#\.]*-->/g, '');
        params = params.replace(/[^\x00-\x7F]/g, "");
        params = params.replace(/&nbsp;/g, ' ');
        params = params.replace(/Other India \(\)/g, '');
        if (params == "n/a") {
            params = "";
        }
        params = params.trim();
        return params;
    }
    else {
        return '';
    }
}

var processIntegers = function (param) {
    if (param) {
        param = param.replace(/[A-Za-z<>]/g, '');
        param = param.replace(/\+/g, '');
        param = param.replace(/\*/g, '');
        param = param.replace(/\-/g, '');
        param = param.replace(/\%/g, '');
        param = param.replace(/ /g, '');
        return param;
    }
    return null;
}

var convertDateArrToDate = function (arr, ddmmexchangeflag) {
    if (arr && typeof arr == "object" && arr.length == 3) {

        var temp = arr[1];
        if (ddmmexchangeflag) {
            arr[1] = arr[0];
            arr[0] = temp;
        }
        temp = arr[2];
        arr[2] = arr[0];
        arr[0] = temp;
        return (arr.join('-'));
    }
    else {
        return null;
    }
}

var removeUnicodeChars = function (param) {
    param = param.replace(/[^\x00-\x7F]/g, "");
    return param;
}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var months_full = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var dateConverter = function (param) {
    param = removeExtraChars(param);
    // params = params.replace('th', '');
    param = param.replace(',', '');
    var dateStr = param;
    // var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var arr = dateStr.split(' ');
    if (arr && arr[1]) {
        if (months.indexOf(arr[1]) > -1)
            arr[1] = months.indexOf(arr[1]) + 1;
        else if (months_full.indexOf(arr[1]) > -1)
            arr[1] = months_full.indexOf(arr[1]) + 1;
        else
            return null;
        arr = arr.reverse();
        var result = arr.join('-');
        result = result.replace(/st/g, '');
        result = result.replace(/th/g, '');
        result = result.replace(/rd/g, '');
        result = result.replace(/nd/g, '');
        return result;
    }
    else {
        return null;
    }
}


var setFileType = function (mimeType) {
    var filetype = '';
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
    else if (mimeType.indexOf('officedocument.wordprocessingml.document') > -1) {
        filetype = "docx"
    }
    return filetype;
}

var checkPortalApplicants = function (portalId, applicants, req, res) {
    console.log("Entered check portal applicants");
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

// var attachment = function (req, callback) {
//     var aUrl = '', aFilename = '';
//     if (req.files) {
//         if (req.files.attachment) {
//             console.log('tthree');
//             var uniqueId = uuid.v4();
//             var filetype = (req.files.attachment.extension) ? req.files.attachment.extension : '';
//             var mimeType = req.files.attachment.mimetype;
//             if (mimeType) {
//                 filetype = setFileType(mimeType);
//             }
//             aUrl = uniqueId + '.' + filetype;
//             aFilename = req.files.attachment.originalname;
//             console.log("aFilename", aFilename);
//             // console.log("aFilenameaFilename", req.files.attachment);

//             console.log("req.files.attachment.path", req.files.attachment.path);

//             var readStream = fs.createReadStream(req.files.attachment.path);

//             uploadDocumentToCloud(aUrl, readStream, function (err) {
//                 if (!err) {
//                     console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
//                     callback(aUrl);
//                 }
//                 else {
//                     callback("");
//                 }
//             });
//         }
//         else {
//             callback(aUrl);
//         }
//     }
//     else {
//         callback(aUrl);
//     }
// };


var attachment = function (req, callback) {
    var aUrl = '', aFilename = '';

    if (req.body.attachment) {
        var attachment1 = req.body.attachment.split(',');
        if (attachment1.length && attachment1[0] && attachment1[1]) {
            var resume_document = attachment1[1];
            var filetype = '';
            filetype = setFileType(attachment1[0]);
            var uniqueId = uuid.v4();
            aUrl = uniqueId + '.' + filetype;
            aFilename = 'temp_name';
            console.log("aFilename", aFilename);

            var fileName = 'pace' + Date.now();
            let buff = new Buffer(resume_document, 'base64');
            fs.writeFileSync(path.resolve(__dirname, fileName), buff);

            var readStream = fs.createReadStream(path.resolve(__dirname, fileName));

            uploadDocumentToCloud(aUrl, readStream, function (err) {
                if (!err) {
                    fs.unlinkSync(path.resolve(__dirname, fileName));
                    console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
                    callback(aUrl);
                }
                else {
                    console.log('Failed to upload file');
                    fs.unlinkSync(path.resolve(__dirname, fileName));
                    callback("");
                }
            });
        } else {
            console.log('no attachment');
            callback("");
        }

    } else {
        console.log('no attachment');
        callback("");
    }
};

portalimporter.checkApplicantExistsFromMonsterPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 2;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        if (req.body.is_select_all == 1) {
            console.log("req.body.is_select_all", req.body.is_select_all);
            if (document.getElementsByClassName('resumeitem_Section'))
                for (var i = 0; i < document.getElementsByClassName('resumeitem_Section').length; i++) {

                    var element = document.getElementsByClassName('resumeitem_Section')[i];
                    try {
                        var name = element.getElementsByClassName('namepro')[0].innerHTML;
                        name = removeExtraChars(name);
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[name.split(' ').length - 1]) {
                                last_name = name.split(' ')[name.split(' ').length - 1];
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }
                    } catch (ex) {
                        console.log(ex)
                    }

                    var education = undefined;
                    var specialization = undefined;
                    var skills = [];
                    var industry = undefined;
                    var functional_area = undefined;

                    try {
                        var temp_ele = element.getElementsByClassName('profile_skill')[0];
                        var skill_loc_element = temp_ele.getElementsByClassName('skilltype');
                        var skill_loc_desc_element = temp_ele.getElementsByClassName('skilldesc');

                        for (var j = 0; j < skill_loc_element.length; j++) {

                            if (skill_loc_element[j].innerHTML.indexOf('Education') > -1) {
                                try {
                                    var edu_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                    if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(').length)
                                        education = removeExtraChars(edu_string.split(',')[0].split('(')[0]);
                                    if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(')[1] && edu_string.split(',')[0].split('(')[1].split(')')[0])
                                        specialization = removeExtraChars(edu_string.split(',')[0].split('(')[1].split(')')[0]);
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }

                            else if (skill_loc_element[j].innerHTML.indexOf('Skills') > -1) {
                                try {
                                    if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                        var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);

                                        var skills_arr = skills_string.split(',');
                                        for (var k = 0; k < skills_arr.length; k++) {
                                            skills[k] = removeExtraChars(skills_arr[k]);
                                        }
                                    }
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }

                            else if (skill_loc_element[j].innerHTML.indexOf('Industry') > -1) {
                                try {
                                    var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                    if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                        industry = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                    }
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }

                            else if (skill_loc_element[j].innerHTML.indexOf('Function') > -1) {
                                try {
                                    var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                    if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                        functional_area = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                    }
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }
                        }
                    } catch (ex) {
                        console.log(ex)
                    }
                    var current_location = undefined;

                    try {
                        if (element && element.getElementsByClassName('skinfoitem info_loc') && element.getElementsByClassName('skinfoitem info_loc')[0] && element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML)
                            current_location = removeExtraChars(element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML);
                    } catch (ex) {
                        console.log(ex)
                    }

                    try {
                        var jobTitle = undefined;
                        var job_title_element = element.getElementsByClassName('desig_sftlnk')[0];
                        if (job_title_element)
                            jobTitle = removeExtraChars(job_title_element.innerHTML);
                    } catch (ex) {
                        console.log(ex)
                    }

                    try {
                        var nationality = undefined;
                        if (element.getElementsByClassName('skinfoitem nationality') && element.getElementsByClassName('skinfoitem nationality')[0])
                            nationality = removeExtraChars(element.getElementsByClassName('skinfoitem nationality')[0].innerHTML);

                    } catch (ex) {
                        console.log(ex)
                    }


                    try {
                        var current_employer = undefined;
                        if (element.getElementsByClassName('pro_pic') && element.getElementsByClassName('pro_pic')[0]) {
                            for (var k = 0; k < element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span').length; k++) {
                                if (element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span')[k].innerHTML.indexOf('@ ') > -1) {
                                    current_employer = removeExtraChars(element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span')[k].innerHTML.replace('@', ''));
                                }
                            }
                        }
                    } catch (ex) {
                        console.log(ex)
                    }

                    var experience = undefined;
                    var exp_ele = element.getElementsByClassName('profile_profess padtrbl')[0];
                    if (exp_ele)
                        for (var k = 0; k < exp_ele.getElementsByTagName('div').length; k++) {
                            if (exp_ele.getElementsByTagName('div')[k].innerHTML.indexOf('Total Experience') > -1) {

                                try {
                                    var exp_string = removeExtraChars(exp_ele.getElementsByTagName('div')[k].innerHTML.replace('Total Experience', ''));
                                    var temp_exp = 0;
                                    var temp_exp_year;
                                    var temp_exp_month;
                                    if (exp_string.indexOf('Year') > -1) {
                                        temp_exp_year = removeExtraChars(exp_string.split(/Year[s]*/)[0]);
                                        if (temp_exp_year && parseInt(temp_exp_year)) {
                                            temp_exp += parseInt(temp_exp_year);
                                        }
                                    }

                                    exp_string = removeExtraChars(exp_string.replace(/[0-9]* *Year[s]*/, ''));
                                    if (exp_string.indexOf('Month') > -1) {
                                        if (exp_string.split(/Month[s]*/)[0]) {
                                            temp_exp_month = removeExtraChars(exp_string.split(/Month[s]*/)[0]);
                                            if (temp_exp_month && parseInt(temp_exp_month)) {
                                                temp_exp = temp_exp + parseFloat((temp_exp_month / 12).toFixed(1));
                                            }
                                        }
                                    }

                                    if (temp_exp > 0) {
                                        experience = temp_exp;
                                    }
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }
                        }


                    var lastModifiedDate = undefined;
                    var uniqueID = undefined;

                    try {
                        var lu_uid_element = element.getElementsByClassName('textfoot')[0];

                        if (lu_uid_element && lu_uid_element.innerHTML.split('|') && lu_uid_element.innerHTML.split('|').length) {
                            var lu_uid_arr = lu_uid_element.innerHTML.split('|');
                            for (var x = 0; x < lu_uid_arr.length; x++) {
                                if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Updated:') > -1) {
                                    lastModifiedDate = dateConverter(lu_uid_arr[x].split('Updated: ')[1]);
                                }
                                else if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Resume ID: ') > -1) {
                                    uniqueID = removeExtraChars(lu_uid_arr[x].split('Resume ID: ')[1]);
                                    if (uniqueID) {
                                        uniqueID = (uniqueID);
                                    }
                                }
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                    }

                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: i, education: education, specialization: specialization, skills: skills, current_employer: current_employer, job_title: jobTitle, experience: experience, current_location: current_location, nationality: nationality, lastModifiedDate: lastModifiedDate, uid: uniqueID, industry: industry, functional_area: functional_area });
                }

            console.log("applicants", applicants);
        }

        else {
            console.log("else part");
            if (document.getElementsByClassName('resumeitem_Section'))
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = document.getElementsByClassName('resumeitem_Section')[selected_candidates[i]];

                    try {
                        var name = element.getElementsByClassName('namepro')[0].innerHTML;
                        name = removeExtraChars(name);
                        var first_name = "";
                        var last_name = "";

                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[name.split(' ').length - 1]) {
                                last_name = name.split(' ')[name.split(' ').length - 1];
                                last_name = removeExtraChars(last_name.trim());
                            }
                        }

                        var education = undefined;
                        var specialization = undefined;
                        var skills = [];
                        var industry = undefined;
                        var functional_area = undefined;


                        var temp_ele = element.getElementsByClassName('profile_skill')[0];
                        var skill_loc_element = temp_ele.getElementsByClassName('skilltype');
                        var skill_loc_desc_element = temp_ele.getElementsByClassName('skilldesc');

                    }
                    catch (ex) {
                        console.log(ex);
                    }

                    for (var j = 0; j < skill_loc_element.length; j++) {

                        if (skill_loc_element[j].innerHTML.indexOf('Education') > -1) {
                            try {
                                var edu_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(').length)
                                    education = removeExtraChars(edu_string.split(',')[0].split('(')[0]);
                                if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(')[1] && edu_string.split(',')[0].split('(')[1].split(')')[0])
                                    specialization = removeExtraChars(edu_string.split(',')[0].split('(')[1].split(')')[0]);
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        }

                        else if (skill_loc_element[j].innerHTML.indexOf('Skills') > -1) {
                            try {
                                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                    var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);

                                    var skills_arr = skills_string.split(',');
                                    for (var k = 0; k < skills_arr.length; k++) {
                                        skills[k] = removeExtraChars(skills_arr[k]);
                                    }
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        }

                        else if (skill_loc_element[j].innerHTML.indexOf('Industry') > -1) {
                            try {
                                var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                    industry = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }

                        }

                        else if (skill_loc_element[j].innerHTML.indexOf('Function') > -1) {
                            try {
                                var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                                    functional_area = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }

                        }
                    }

                    try {
                        var current_location = undefined;

                        if (element && element.getElementsByClassName('skinfoitem info_loc') && element.getElementsByClassName('skinfoitem info_loc')[0] && element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML)
                            current_location = removeExtraChars(element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML);


                        var jobTitle = undefined;
                        var job_title_element = element.getElementsByClassName('desig_sftlnk')[0];
                        if (job_title_element)
                            jobTitle = removeExtraChars(job_title_element.innerHTML);


                        var nationality = undefined;
                        if (element.getElementsByClassName('skinfoitem nationality') && element.getElementsByClassName('skinfoitem nationality')[0])
                            nationality = removeExtraChars(element.getElementsByClassName('skinfoitem nationality')[0].innerHTML);

                        var current_employer = undefined;
                        if (element.getElementsByClassName('pro_pic') && element.getElementsByClassName('pro_pic')[0]) {
                            for (var k = 0; k < element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span').length; k++) {
                                if (element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span')[k].innerHTML.indexOf('@ ') > -1) {
                                    current_employer = removeExtraChars(element.getElementsByClassName('pro_pic')[0].getElementsByTagName('span')[k].innerHTML.replace('@', ''));
                                }
                            }
                        }

                    }
                    catch (ex) {
                        console.log(ex);
                    }


                    var experience = undefined;
                    var exp_ele = element.getElementsByClassName('profile_profess padtrbl')[0];
                    if (exp_ele)
                        for (var k = 0; k < exp_ele.getElementsByTagName('div').length; k++) {
                            try {
                                if (exp_ele.getElementsByTagName('div')[k].innerHTML.indexOf('Total Experience') > -1) {

                                    var exp_string = removeExtraChars(exp_ele.getElementsByTagName('div')[k].innerHTML.replace('Total Experience', ''));
                                    var temp_exp = 0;
                                    var temp_exp_year;
                                    var temp_exp_month;
                                    if (exp_string.indexOf('Year') > -1) {
                                        temp_exp_year = removeExtraChars(exp_string.split(/Year[s]*/)[0]);
                                        if (temp_exp_year && parseInt(temp_exp_year)) {
                                            temp_exp += parseInt(temp_exp_year);
                                        }
                                    }
                                    exp_string = removeExtraChars(exp_string.replace(/[0-9]* Year[s]*/, ''));
                                    if (exp_string.indexOf('Month') > -1) {
                                        if (exp_string.split(/Month[s]*/)[0]) {
                                            temp_exp_month = removeExtraChars(exp_string.split(/Month[s]*/)[0]);
                                            if (temp_exp_month && parseInt(temp_exp_month)) {
                                                temp_exp = temp_exp + parseFloat((temp_exp_month / 12).toFixed(1));
                                            }
                                        }
                                    }

                                    if (temp_exp > 0) {
                                        experience = temp_exp;
                                    }

                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }

                        }


                    var lastModifiedDate = undefined;
                    var uniqueID = undefined;

                    try {
                        var lu_uid_element = element.getElementsByClassName('textfoot')[0];

                        if (lu_uid_element && lu_uid_element.innerHTML.split('|') && lu_uid_element.innerHTML.split('|').length) {
                            var lu_uid_arr = lu_uid_element.innerHTML.split('|');
                            for (var x = 0; x < lu_uid_arr.length; x++) {
                                if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Updated:') > -1) {
                                    lastModifiedDate = dateConverter(lu_uid_arr[x].split('Updated: ')[1]);
                                }
                                else if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Resume ID: ') > -1) {
                                    uniqueID = removeExtraChars(lu_uid_arr[x].split('Resume ID: ')[1]);
                                    if (uniqueID) {
                                        uniqueID = (uniqueID);
                                    }
                                }
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                    }



                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: selected_candidates[i], education: education, specialization: specialization, skills: skills, current_employer: current_employer, job_title: jobTitle, experience: experience, current_location: current_location, nationality: nationality, lastModifiedDate: lastModifiedDate, uid: uniqueID, industry: industry, functional_area: functional_area });
                }
        }

        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    console.log("body", body);
                    console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }

};


portalimporter.saveApplicantsFromMonster = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = req.body.portalId || 2;   // monster
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        try {
            var tempName = document.getElementsByClassName('skname');
            if (tempName && tempName[0] && tempName[0].innerHTML) {
                var fullName = document.getElementsByClassName('skname')[0].innerHTML.trim();
                fullName = removeExtraChars(fullName);
                if (fullName && fullName.split(' ') && fullName.split(' ')[0])
                    details.firstName = removeExtraChars(fullName.split(' ')[0]);
                if (fullName && fullName.split(' ') && fullName.split(' ')[fullName.split(' ').length - 1]) {
                    details.lastName = fullName.split(' ')[fullName.split(' ').length - 1]
                    details.lastName = removeExtraChars(details.lastName.trim());
                }
            }
        } catch (ex) {
            console.log(ex)
        }
        // details.firstName = document.getElementsByClassName('skname')[0].innerHTML.trim();

        try {
            var tempDetails = document.getElementsByClassName('skinfo hg_mtch');
            if (tempDetails && tempDetails[0] && tempDetails[0].innerHTML) {

                try {
                    var emailid = tempDetails[0].innerHTML.trim();
                    var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/;   // include /s in the end
                    console.log(emailid);

                    if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
                        details.emailId = removeExtraChars(regularExp.exec(emailid)[0].trim());

                } catch (ex) {
                    console.log(ex)
                }

                if (tempDetails[0].innerHTML.indexOf(' at ') > -1) {
                    try {
                        var tempDesignation = tempDetails[0].innerHTML.split(' at ');
                        if (tempDesignation && tempDesignation[0]) {
                            details.jobTitle = removeExtraChars(tempDesignation[0].trim());
                        }
                    } catch (ex) {
                        console.log(ex)
                    }

                    try {
                        if (tempDesignation && tempDesignation[1] && tempDesignation[1].split('<br>') && tempDesignation[1].split('<br>').length) {
                            details.employer = removeExtraChars(tempDesignation[1].split('<br>')[0].trim());
                        }
                    } catch (ex) {
                        console.log(ex)
                    }
                }
            }

            try {
                var tempMobile = document.getElementsByClassName('mob_container');
                if (tempMobile && tempMobile[0] && tempMobile[0].innerHTML) {
                    var mobilenumber = tempMobile[0].innerHTML;
                    var regularExp = /(\d{7,15})/;

                    if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                        details.mobileNumber = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
                }
            } catch (ex) {
                console.log(ex)
            }

            try {
                var tempLocation = document.getElementsByClassName('skinfoitem info_loc');
                if (tempLocation && tempLocation[0] && tempLocation[0].innerHTML) {
                    var location = tempLocation[0].innerHTML;
                    details.presentLocation = removeExtraChars(location.trim());
                }
            } catch (ex) {
                console.log(ex)
            }

            var isTallint = req.body.isTallint || 0;
            details.resumeText = removeUnicodeChars(req.body.resume_text || "");
        } catch (ex) {
            console.log(ex)
        }

        var arrWSI = [];
        if (document.getElementsByClassName('scndinfo mrgn hg_mtch')) {
            arrWSI = document.getElementsByClassName('scndinfo mrgn hg_mtch');

            for (i = 0; i < arrWSI.length; i++) {
                if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Work Experience') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var exp = arrWSI[i].innerHTML.split('>:')[1].trim();
                        var years = 0;
                        var months = 0;
                        if (exp.split(' ') && exp.split(' ')[0] && exp.split(' ')[0].trim() && removeExtraChars(exp.split(' ')[0].trim()) > 0) {
                            years = removeExtraChars(exp.split(' ')[0].trim());
                        }
                        if (exp.split(' ') && exp.split(' ')[3] && exp.split(' ')[3].trim() && removeExtraChars(exp.split(' ')[3].trim()) > 0) {
                            months = (removeExtraChars(exp.split(' ')[3].trim()) / 12).toFixed(1);
                        }
                        if (years && months) {
                            details.experience = parseFloat(years) + parseFloat(months);
                        }
                        else if (years > 0) {
                            details.experience = parseInt(years);
                        }
                    }
                }

                //Skills
                else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Skills') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var skills = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (skills) {
                            details.primarySkills = skills;
                            if (details.primarySkills && details.primarySkills.split(',').length) {
                                details.primarySkills = details.primarySkills.split(',');
                                var spliceIndexes = [];
                                for (var skill = 0; skill < details.primarySkills.length; skill++) {
                                    if (removeExtraChars(details.primarySkills[skill].trim()) != '')
                                        details.primarySkills[skill] = removeExtraChars(details.primarySkills[skill].trim());
                                    else
                                        spliceIndexes.push(skill);
                                }
                                for (var ind = 0; ind < spliceIndexes.length; ind++) {
                                    details.primarySkills.splice(spliceIndexes[ind], 1);
                                }
                            }
                        }
                    }
                }

                //industry
                else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Industry') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var industry = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (industry && industry != 'Not Specified') {
                            details.industry = industry;
                            if (details.industry && details.industry.split(',').length) {
                                details.industry = details.industry.split(',');
                                var spliceIndexes = [];
                                for (var a = 0; a < details.industry.length; a++) {
                                    if (removeExtraChars(details.industry[a].trim()) != '')
                                        details.industry[a] = removeExtraChars(details.industry[a].trim());
                                    else
                                        spliceIndexes.push(a);
                                }
                                for (var ind = 0; ind < spliceIndexes.length; ind++) {
                                    details.industry.splice(spliceIndexes[ind], 1);
                                }
                            }
                        }
                    }
                }

                //preferred location
                else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Preferred Job Location') > -1) {
                    if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                        var locations = arrWSI[i].innerHTML.split('>:')[1].trim();
                        if (locations && locations != 'Not Specified')
                            details.prefLocations = locations;
                        if (details.prefLocations && details.prefLocations.split(',').length) {
                            details.prefLocations = details.prefLocations.split(',');
                            var spliceIndexes = [];
                            for (var a = 0; a < details.prefLocations.length; a++) {
                                if (removeExtraChars(details.prefLocations[a].trim()) != '')
                                    details.prefLocations[a] = removeExtraChars(details.prefLocations[a].trim()).trim();
                                else
                                    spliceIndexes.push(a);
                            }
                            for (var ind = 0; ind < spliceIndexes.length; ind++) {
                                details.prefLocations.splice(spliceIndexes[ind], 1);
                            }
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
                        if (details.DOB == 'NaN-NaN-NaN') {
                            details.DOB = undefined;
                        }
                    }
                }

                else if (arrGN[i].indexOf('Gender') > -1) {
                    if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                        if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'female') {
                            if (isTallint)
                                details.gender = 'F';
                            else
                                details.gender = 2;
                        }
                        else if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'male') {
                            if (isTallint)
                                details.gender = 'M';
                            else
                                details.gender = 1;
                        }
                        else {
                            if (isTallint)
                                details.gender = '';
                            else
                                details.gender = 3;
                        }
                    }
                }
                else if (arrGN[i].indexOf('Nationality') > -1) {
                    if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim() && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim() != '') {
                        details.nationality = removeExtraChars(arrGN[i].split(':')[1].trim());
                    }
                }
            }
        }

        try {
            var work_histories = [];
            var workHistoryElement = document.getElementsByClassName('skrworktbl');
            if (workHistoryElement && workHistoryElement[0] && workHistoryElement[0].getElementsByClassName('skrworkrow') && workHistoryElement[0].getElementsByClassName('skrworkrow').length) {
                var tempElement = workHistoryElement[0].getElementsByClassName('skrworkrow');
                for (var i = 1; i < tempElement.length; i++) {
                    if (tempElement && tempElement[i] && tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0] && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML.indexOf('Current') == -1) {
                        var work_history = {};
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML) {
                            work_history.company_name = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML);
                            if (work_history.company_name && work_history.company_name.indexOf('(Current)') > -1) {
                                work_history.company_name = work_history.company_name.replace('(Current)', '');
                                work_history.company_name = work_history.company_name.trim();
                            }
                        }

                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML)
                            work_history.designation = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML);
                        work_history.duration = {};
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0])
                            work_history.duration.from = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0]);
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1])
                            work_history.duration.to = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1]);
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML) {
                            try {
                                var salaryString = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML);
                                if (salaryString && (salaryString.indexOf('lac') > -1 || salaryString.indexOf('lacs') > -1))
                                    work_history.salary = salaryString.split(' ')[0] * 100000;
                                else
                                    work_history.salary = salaryString.split(' ')[0];
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        work_histories.push(work_history);
                    }
                    else {
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML) {
                            details.employer = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML);
                            if (details.employer && details.employer.indexOf('(Current)') > -1) {
                                details.employer = details.employer.replace('(Current)', '');
                                details.employer = details.employer.trim();
                            }
                        }

                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML)
                            details.jobTitle = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML);
                        details.currentJobDetails = {};
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0])
                            details.currentJobDetails.from = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0]);
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1])
                            details.currentJobDetails.to = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1]);
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML) {
                            var salary = removeExtraChars(document.getElementsByClassName('skrworktbl')[0].getElementsByClassName('skrworkrow')[i].getElementsByClassName('skrworkcell')[3].innerHTML);

                            salary = salary.trim();
                            salary = salary.split(' ');
                            if (salary && salary[0] && salary[0] > 0)
                                details.presentSalary = salary[0];
                            if (salary && salary[1])
                                details.presentSalaryScale = salary[1];
                            if (salary && salary[2])
                                details.presentSalaryPeriod = salary[2];
                            if (1)
                                details.presentSalaryCurr = 'INR';
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }

        details.work_history = work_histories;

        var skill_experiences = [];
        var skillExperienceElement = document.getElementsByClassName('skrworktbl');
        if (skillExperienceElement && skillExperienceElement[1] && skillExperienceElement[1].getElementsByClassName('skrworkrow') && skillExperienceElement[1].getElementsByClassName('skrworkrow').length) {
            var tempElement = skillExperienceElement[1].getElementsByClassName('skrworkrow');
            for (var i = 1; i < tempElement.length; i++) {
                if (tempElement && tempElement[i] && tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0] && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML) {
                    var skill_experience_detail = {};
                    if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0] && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML)
                        skill_experience_detail.skill_name = removeExtraChars(document.getElementsByClassName('skrworktbl')[1].getElementsByClassName('skrworkrow')[i].getElementsByClassName('skrworkcell')[0].innerHTML);

                    if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[1] && tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML) {
                        var experience = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML);
                        if (experience.split(' ') && experience.split(' ').length) {
                            for (var j = 0; j < experience.split(' ').length; j++) {
                                if (experience.split(' ') && experience.split(' ')[j] && experience.split(' ')[j] > 0) {
                                    var exp_whole_number = (experience.split(' ')[j] / 12).toFixed(1);
                                    if (typeof exp_whole_number == 'string')
                                        exp_whole_number = parseFloat(exp_whole_number);
                                    skill_experience_detail.experience = exp_whole_number;
                                }
                            }
                        }
                    }

                    if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2] && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML)
                        skill_experience_detail.last_used = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML);

                    if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[3] && tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML) {
                        skill_experience_detail.skill_level = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML);
                    }
                    skill_experiences.push(skill_experience_detail);
                }
            }
        }

        details.skill_experience = skill_experiences;

        details.education = [];
        //education - highest
        var educationElement = document.getElementsByClassName('scndinfo mrgn hg_mtch');
        if (educationElement && educationElement.length) {
            for (var i = 0; i < educationElement.length; i++) {
                if (educationElement[i] && educationElement[i].innerHTML && educationElement[i].innerHTML.indexOf('Education') > -1) {
                    var education = {};
                    if (educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:') && educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1] && educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:') && educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1]) {
                        if (educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[0]) {
                            if (educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[0].split(' - '))
                                education.education = removeExtraChars(educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[0].split(' - ')[0]);
                            if (educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[0].split(' - ')[1])
                                education.specialization = removeExtraChars(educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[0].split(' - ')[1]);
                        }

                        if (educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[1].split('Institute:')) {
                            education.passing_year = removeExtraChars(educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[1].split('Institute:')[0]);
                            education.institution = removeExtraChars(educationElement[i].innerHTML.split('<span class="scndinfo_h">Education</span>:')[1].split('Highest:')[1].split(',Passed in:')[1].split('Institute:')[1]);
                        }
                        // if (i == 0) {
                        education.highest_education = 1;
                        // }
                        details.education.push(education);
                    }
                }
            }
        }


        try {
            var notice_period;
            var notice_element = document.getElementsByClassName('matchd_wrap');

            if (notice_element && notice_element[0] && notice_element[0].innerHTML && notice_element[0].innerHTML.indexOf('Notice Period') > -1) {
                if (notice_element[0].innerHTML.split(': ') && notice_element[0].innerHTML.split(': ')[1] && notice_element[0].innerHTML.split(': ')[1].split('</div>') && notice_element[0].innerHTML.split(': ')[1].split('</div>')[0]) {
                    var temp_notice_period = removeExtraChars(notice_element[0].innerHTML.split(': ')[1].split('</div>')[0]);
                    if (temp_notice_period == 'Immediately') {
                        notice_period = 15;
                    }
                    else if (temp_notice_period.indexOf('Days') > -1) {
                        notice_period = temp_notice_period.split('Days')[0] * 1;
                    }
                    else if (temp_notice_period.indexOf('Month') > -1) {
                        notice_period = temp_notice_period.split('Month')[0] * 30;
                    }
                    else if (temp_notice_period.indexOf('Months') > -1) {
                        notice_period = temp_notice_period.split('Months')[0] * 30;
                    }
                }
            }

            details.noticePeriod = notice_period;
        }

        catch (err) {
            console.log(err);
            console.log('notice period err');
        }


        var uniqueID;
        var lastModifiedDate;
        try {
            var lu_uid_element = document.getElementsByClassName('bottomboxwrap')[0];

            if (lu_uid_element && lu_uid_element.getElementsByClassName('bottomboxtxt') && lu_uid_element.getElementsByClassName('bottomboxtxt')[0] && lu_uid_element.getElementsByClassName('bottomboxtxt')[0].innerHTML && lu_uid_element.getElementsByClassName('bottomboxtxt')[0].innerHTML.split('|') && lu_uid_element.getElementsByClassName('bottomboxtxt')[0].innerHTML.split('|').length) {
                var lu_uid_arr = lu_uid_element.getElementsByClassName('bottomboxtxt')[0].innerHTML.split('|');
                for (var x = 0; x < lu_uid_arr.length; x++) {
                    if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Last Modified:') > -1) {
                        lastModifiedDate = dateConverter(lu_uid_arr[x].split('Last Modified: ')[1]);
                    }
                    else if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Resume ID: ') > -1) {
                        uniqueID = removeExtraChars(lu_uid_arr[x].split('Resume ID: ')[1]);
                        if (uniqueID) {
                            uniqueID = (uniqueID);
                        }
                    }
                }
            }

            if (lastModifiedDate) {
                details.lastModifiedDate = lastModifiedDate;
            }

            if (uniqueID) {
                details.uid = uniqueID;
            }
        }

        catch (err) {
            console.log(err);
        }


        console.log("req.body.isTallint", req.body.isTallint);
        console.log("req.body.isIntranet", req.body.isIntranet);
        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }
        // for tallint
        if (isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    details.resume_extension = '.' + filetype;
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
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

                if (req.body.requirements)
                    details.requirements = [parseInt(req.body.requirements)];

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        // console.log(response);
                        console.log(error);
                    });
                }



                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                console.log(req.body.isTallint, req.body.isIntranet);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }



        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
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

    console.log("entered naukri duplication check")
    var uniqueIdArray = xml_string.match(/srpTupleJson = \[\{.*\}\];/);

    try {

        if (is_select_all == 1) {

            if (document.getElementsByClassName('tuple'))
                for (var i = 0; i < document.getElementsByClassName('tuple').length; i++) {
                    if (document.getElementsByClassName('tuple')[i].getAttribute('class').indexOf('viewed') == -1) {
                        var name = document.getElementsByClassName('tuple')[i].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                        name = removeExtraChars(name);
                        var first_name = "";
                        var last_name = "";

                        console.log(name);
                        if (name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[name.split(' ').length - 1])
                                last_name = removeExtraChars(name.split(' ')[name.split(' ').length - 1]);
                        }

                        if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[i] && document.getElementsByClassName('ftRight')[i].innerHTML && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                            var lastModifiedDate = dateConverter(document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]);

                        }
                        var uniqueId = "";
                        if (uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].uniqueId) {
                            uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].key;
                        }

                        //experience
                        var experience = 0;
                        var element = document.getElementsByClassName('tuple')[i];
                        if (element && element.getElementsByClassName('exp') && element.getElementsByClassName('exp')[0] && element.getElementsByClassName('exp')[0].innerHTML) {
                            var temp_experience = 0;
                            if (element.getElementsByClassName('exp')[0].innerHTML.split('yr ') && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] != 0 && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] != '') {
                                temp_experience += parseInt(element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0]);
                            }
                            if (element.getElementsByClassName('exp')[0].innerHTML.split('yr ') && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1] && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0] != 0 && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0] != '') {
                                temp_experience += parseFloat(((element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0]) / 12).toFixed(1));
                            }
                            if (temp_experience) {
                                experience = temp_experience;
                            }
                        }

                        //present location
                        var current_location = '';
                        if (element && element.getElementsByClassName('loc') && element.getElementsByClassName('loc')[0] && element.getElementsByClassName('loc')[0].innerHTML && removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML) != '') {
                            current_location = removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML);
                        }

                        //current designation
                        var job_title = '';
                        if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML && removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                            job_title = removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML);
                        }

                        //current employer
                        var current_employer = '';
                        if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML && removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                            current_employer = removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML);
                        }

                        //previous designation
                        var prev_jobtitle = '';
                        if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML && removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                            prev_jobtitle = removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML);
                        }

                        //previous employer
                        var previous_employer = '';
                        if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML && removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                            previous_employer = removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML);
                        }

                        //skills
                        var skills = [];
                        var skill_element = element.getElementsByClassName('skillkey');
                        for (var x = 0; x < skill_element.length; x++) {
                            if (skill_element[x] && skill_element[x].innerHTML)
                                skills[x] = removeExtraChars(skill_element[x].innerHTML);
                        }


                        var education;
                        if (element && element.getElementsByClassName('desc eduInfo') && element.getElementsByClassName('desc eduInfo')[0] && element.getElementsByClassName('desc eduInfo')[0].innerHTML && element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0]) {
                            education = element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0];
                        }

                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 1, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueId, current_location: current_location, current_employer: current_employer, job_title: job_title, previous_employer: previous_employer, skills: skills, education: education });
                    }
                }
        }

        else {
            if (document.getElementsByClassName('tuple'))
                for (var i = 0; i < selected_candidates.length; i++) {

                    var name = document.getElementsByClassName('tuple')[selected_candidates[i]].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                    var first_name = "";
                    var last_name = "";

                    console.log(name);
                    if (name.split(' ')) {
                        if (name.split(' ')[0])
                            first_name = removeExtraChars(name.split(' ')[0]);
                        if (name.split(' ')[name.split(' ').length - 1])
                            last_name = removeExtraChars(name.split(' ')[name.split(' ').length - 1]);
                    }

                    if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[selected_candidates[i]] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                        var lastModifiedDate = dateConverter(document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]);
                    }

                    var uniqueId = "";
                    if (uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].uniqueId) {
                        uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].key;
                    }

                    //experience
                    var experience = 0;
                    var element = document.getElementsByClassName('tuple')[i];
                    if (element && element.getElementsByClassName('exp') && element.getElementsByClassName('exp')[0] && element.getElementsByClassName('exp')[0].innerHTML) {
                        var temp_experience = 0;
                        if (element.getElementsByClassName('exp')[0].innerHTML.split('yr ') && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] != 0 && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0] != '') {
                            temp_experience += parseInt(element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[0]);
                        }
                        if (element.getElementsByClassName('exp')[0].innerHTML.split('yr ') && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1] && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0] != 0 && element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0] != '') {
                            temp_experience += parseFloat(((element.getElementsByClassName('exp')[0].innerHTML.split('yr ')[1].split('m')[0]) / 12).toFixed(1));
                        }
                        if (temp_experience) {
                            experience = temp_experience;
                        }
                    }

                    //present location
                    var current_location = '';
                    if (element && element.getElementsByClassName('loc') && element.getElementsByClassName('loc')[0] && element.getElementsByClassName('loc')[0].innerHTML && removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML) != '') {
                        current_location = removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML);
                    }

                    //current designation
                    var job_title = '';
                    if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML && removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                        job_title = removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML);
                    }

                    //current employer
                    var current_employer = '';
                    if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML && removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                        current_employer = removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML);
                    }

                    //previous designation
                    var prev_jobtitle = '';
                    if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML && removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                        prev_jobtitle = removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML);
                    }

                    //previous employer
                    var previous_employer = '';
                    if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML && removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                        previous_employer = removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML);
                    }

                    //skills
                    var skills = [];
                    var skill_element = element.getElementsByClassName('skillkey');
                    for (var x = 0; x < skill_element.length; x++) {
                        if (skill_element[x] && skill_element[x].innerHTML)
                            skills[x] = removeExtraChars(skill_element[x].innerHTML);
                    }

                    var education;
                    if (element && element.getElementsByClassName('desc eduInfo') && element.getElementsByClassName('desc eduInfo')[0] && element.getElementsByClassName('desc eduInfo')[0].innerHTML && element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0]) {
                        education = element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0];
                    }

                    applicants.push({ firstName: first_name, lastName: last_name, portalId: 1, index: selected_candidates[i], lastModifiedDate: lastModifiedDate, uid: uniqueId, current_location: current_location, current_employer: current_employer, job_title: job_title, previous_employer: previous_employer, skills: skills, education: education });
                }
        }


        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 1;
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }

    catch (err) {
        console.log(err);
    }
};


portalimporter.saveApplicantsFromNaukri = function (req, res, next) {

    console.time("started parsing");
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        var validationFlag = true;
        var portalId = 1;
        var cvSourceId = 1;
        var details = {};

        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        var isTallint = req.query.isTallint || 0;

        var tempName = document.getElementsByClassName('bkt4 name userName');
        if (tempName && tempName[0] && tempName[0].innerHTML) {
            var name = tempName[0].innerHTML.trim(' ');
            name = removeExtraChars(name);
            if (name && name.split(' ')[0])
                details.firstName = removeExtraChars(name.split(' ')[0]);
            if (name && name.split(' ')[name.split(' ').length - 1])
                details.lastName = removeExtraChars(name.split(' ')[name.split(' ').length - 1]);
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
            //console.log(details.profilePic);
        }

        var tempExperience = document.getElementsByClassName('exp-sal-loc-box');
        if (tempExperience && tempExperience[0] && tempExperience[0].getElementsByClassName('expInfo') && tempExperience[0].getElementsByClassName('expInfo')[0] && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>") && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1] && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr') && tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr')[0]) {
            //console.log('Entered exp');
            details.experience = tempExperience[0].getElementsByClassName('expInfo')[0].innerHTML.split("</em>")[1].split('yr')[0].trim();
            //console.log(details.experience);
            if (!(parseInt(details.experience) >= 0)) {
                details.experience = 0;
            }
            details.experience = removeExtraChars(details.experience);
            if (typeof details.experience == 'string' && parseInt(details.experience) != NaN) {
                details.experience = parseInt(details.experience);
            }
        }

        var tempDesignation = document.getElementsByClassName('bkt4 cDesig');
        if (tempDesignation && tempDesignation[0] && tempDesignation[0].innerHTML) {
            //console.log("Entered designation");
            var designation = tempDesignation[0].innerHTML.replace(/<em class="hlite">/g, '');
            designation = designation.replace(/<em class="b-hlite">/g, '');
            designation = decodeURI(designation.replace(/<\/em>/g, ''));
            details.jobTitle = removeExtraChars(designation.trim());
            //console.log(details.jobTitle);
        }

        //employer
        var tempEmployer = document.getElementsByClassName('desc cOrg');
        if (tempEmployer && tempEmployer[0] && tempEmployer[0].getElementsByClassName('cOrg bkt4') && tempEmployer[0].getElementsByClassName('cOrg bkt4')[0] && tempEmployer[0].getElementsByClassName('cOrg bkt4')[0].innerHTML) {
            var employer = document.getElementsByClassName('desc cOrg')[0].getElementsByClassName('cOrg bkt4')[0].innerHTML;
            details.employer = removeExtraChars(employer);
        }

        var tempSkills = document.getElementsByClassName('right-container');
        if (tempSkills && tempSkills[0] && tempSkills[0].getElementsByClassName('itSkill hKwd') && tempSkills[0].getElementsByClassName('itSkill hKwd')[0] && tempSkills[0].getElementsByClassName('itSkill hKwd')[0].innerHTML) {
            //console.log("Entered skill");
            details.primarySkills = tempSkills[0].getElementsByClassName('itSkill hKwd')[0].innerHTML.replace(/<span id=".*/g, '');
            details.primarySkills = details.primarySkills.replace(/<em class="b-hlite">/g, '');
            details.primarySkills = details.primarySkills.replace(/<em class="hlite">/g, '');
            details.primarySkills = details.primarySkills.replace(/<\/em>/g, '');
            if (details.primarySkills && details.primarySkills.split(',').length) {
                details.primarySkills = details.primarySkills.split(',');
                var spliceIndexes = [];
                for (var skill = 0; skill < details.primarySkills.length; skill++) {
                    if (removeExtraChars(details.primarySkills[skill].trim()) != '')
                        details.primarySkills[skill] = removeExtraChars(details.primarySkills[skill].trim());
                    else
                        spliceIndexes.push(skill);
                }
                for (var ind = 0; ind < spliceIndexes.length; ind++) {
                    details.primarySkills.splice(spliceIndexes[ind], 1);
                }
            }
            // //console.log(details.primarySkills);
        }

        // presentSalaryCurr
        var salaryDetails = document.getElementsByClassName('salInfo');
        if (salaryDetails && salaryDetails[0] && salaryDetails[0].innerHTML) {
            //console.log("Entered salary");
            var amount = salaryDetails[0].innerHTML.replace('<em class="iconRup"></em>', '').trim().split(' ');
            if (amount && amount[0]) {
                if (parseInt(processIntegers(removeExtraChars(amount[0]))) != NaN)
                    details.presentSalary = processIntegers(removeExtraChars(amount[0]));
                if (amount[1] && amount[1].indexOf('Lac') > -1) {
                    if (!isTallint)
                        details.presentSalaryScale = { scale: "Lakhs", scaleId: 4 }
                    else
                        details.presentSalaryScale = "Lakhs"
                }
                document.getElementsByClassName('salInfo')[0].innerHTML.replace('<em class="iconRup"></em>', '').trim().split(' ')[0]
                if (salaryDetails[0].getElementsByClassName('iconRup') && salaryDetails[0].getElementsByClassName('iconRup').length) {
                    if (!isTallint)
                        details.presentSalaryCurr = { currencyId: 2, currencySymbol: "INR" };
                    else
                        details.presentSalaryCurr = 'INR';
                }
                if (!isTallint)
                    details.presentSalaryPeriod = { duration: "Per Annum", durationId: 4 };
                else
                    details.presentSalaryPeriod = "Per Annum";
            }
        }

        // present location
        if (document.getElementsByClassName('locInfo') && document.getElementsByClassName('locInfo')[0] && document.getElementsByClassName('locInfo')[0].innerHTML && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>') && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1] && document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1].trim()) {
            var presentLocation = document.getElementsByClassName('locInfo')[0].innerHTML.split('</em>')[1].trim();
            details.presentLocation = removeExtraChars(presentLocation.trim());
        }

        try {
            var tempPreferedLocation = document.getElementsByClassName('exp-sal-loc-box');
            if (tempPreferedLocation && tempPreferedLocation[0] && tempPreferedLocation[0].innerHTML && tempPreferedLocation[0].innerHTML.split('>Pref </span') && tempPreferedLocation[0].innerHTML.split('>Pref </span')[1]) {
                var prefLocations = document.getElementsByClassName('exp-sal-loc-box')[0].innerHTML.split('>Pref </span')[1];

                if (prefLocations && prefLocations.split(',').length) {
                    details.prefLocations = prefLocations.split(',');
                    var spliceIndexes = [];
                    for (var i = 0; i < details.prefLocations.length; i++) {
                        if (removeExtraChars(details.prefLocations[i].trim()) != '')
                            // details.prefLocations[i] = removeExtraChars(details.prefLocations[i].trim());
                            details.prefLocations[i] = removeExtraChars(details.prefLocations[i].trim()).replace(/[<>]*/, '');
                        else
                            spliceIndexes.push(i);
                    }
                    for (var ind = 0; ind < spliceIndexes.length; ind++) {
                        details.prefLocations.splice(spliceIndexes[ind], 1);
                    }
                }
            }
        }

        catch (err) {
            console.log(err);
        }



        var tempGDOB = document.getElementsByClassName('clFx details-box');
        if (tempGDOB && tempGDOB[0] && tempGDOB[0].innerHTML) {
            for (var i = 0; i < document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>').length; i++) {

                if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].indexOf('Date of Birth') > -1) {
                    if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">') && document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1]) {
                        var DOB = document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1];
                        DOB = new Date(DOB.trim());
                        details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                        if (details.DOB == 'NaN-NaN-NaN') {
                            details.DOB = undefined;
                        }
                    }
                }
                else if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].indexOf('Gender') > -1) {
                    if (document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">') && document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1]) {
                        var gender = document.getElementsByClassName('clFx details-box')[0].innerHTML.split('</div>')[i].split('"desc">')[1];
                        gender = removeExtraChars(gender);
                        if (gender.toLowerCase() == "female") {
                            if (!isTallint)
                                details.gender = 2;
                            else
                                details.gender = 'F'
                        }
                        else if (gender.toLowerCase() == "male") {
                            if (!isTallint)
                                details.gender = 1;
                            else
                                details.gender = 'M'
                        }
                        else {
                            if (!isTallint)
                                details.gender = 3;
                            else
                                details.gender = '';
                        }
                    }
                }
            }
        }

        var tempIndustry = document.getElementsByClassName('desc indInfo');
        if (tempIndustry && tempIndustry[0] && tempIndustry[0].innerHTML && removeExtraChars(tempIndustry[0].innerHTML) != "") {
            details.industry = removeExtraChars(document.getElementsByClassName('desc indInfo')[0].innerHTML).split(',');
        }

        if (document.getElementsByClassName('desc faInfo') && document.getElementsByClassName('desc faInfo')[0] && document.getElementsByClassName('desc faInfo')[0].innerHTML) {
            var tempFunctionArea = document.getElementsByClassName('desc faInfo')[0].innerHTML;
            if (tempFunctionArea && tempFunctionArea[0] && tempFunctionArea[0].innerHTML && removeExtraChars(tempFunctionArea[0].innerHTML) != "") {
                details.functionalAreas = removeExtraChars(document.getElementsByClassName('desc faInfo')[0].innerHTML).split(',');
            }
        }

        var work_histories = [];
        var work_history_element = document.getElementsByClassName('exp-container');
        //index 0 consists of current organization
        if (work_history_element && work_history_element.length)
            for (var i = 1; i < work_history_element.length; i++) {
                var work_history = {};
                if (work_history_element[i]) {
                    var company_name = work_history_element[i].getElementsByClassName('org pOrg');
                    var designation = work_history_element[i].getElementsByClassName('designation pDesig bkt4');
                    work_history.duration = {};
                    var temp_from = work_history_element[i].getElementsByClassName('time');
                    if (company_name && company_name[0] && company_name[0].innerHTML && removeExtraChars(company_name[0].innerHTML) != '')
                        work_history.company_name = removeExtraChars(company_name[0].innerHTML);
                    if (designation && designation[0] && designation[0].innerHTML && removeExtraChars(designation[0].innerHTML) != '')
                        work_history.designation = removeExtraChars(designation[0].innerHTML);
                    if (temp_from && temp_from[0] && temp_from[0].innerHTML && temp_from[0].innerHTML.split('</span>') && temp_from[0].innerHTML.split('</span>')[1] && temp_from[0].innerHTML.split('</span>')[1].split('to') && temp_from[0].innerHTML.split('</span>')[1].split('to')[0]) {
                        work_history.duration.from = removeExtraChars(temp_from[0].innerHTML.split('</span>')[1].split('to')[0]);
                    }
                    if (temp_from && temp_from[0] && temp_from[0].innerHTML && temp_from[0].innerHTML.split('</span>') && temp_from[0].innerHTML.split('</span>')[1] && temp_from[0].innerHTML.split('</span>')[1].split('to') && temp_from[0].innerHTML.split('</span>')[1].split('to')[1]) {
                        work_history.duration.to = removeExtraChars(temp_from[0].innerHTML.split('</span>')[1].split('to')[1]);
                    }
                    work_histories.push(work_history);
                }
            }

        details.work_history = work_histories;

        var skill_experiences = [];
        var skill_experience_element = document.getElementById('jump-it-skill') ? document.getElementById('jump-it-skill').getElementsByTagName('tr') : undefined;
        if (skill_experience_element && skill_experience_element.length) {
            for (var i = 1; i < document.getElementById('jump-it-skill').getElementsByTagName('tr').length; i++) {
                var skill_experience = {};
                if (skill_experience_element[i] && skill_experience_element[i].getElementsByTagName('td') && skill_experience_element[i].getElementsByTagName('td')[0] && removeExtraChars(skill_experience_element[i].getElementsByTagName('td')[0].innerHTML) != '')
                    skill_experience.skill_name = removeExtraChars(document.getElementById('jump-it-skill').getElementsByTagName('tr')[i].getElementsByTagName('td')[0].innerHTML);
                if (skill_experience_element[i] && skill_experience_element[i].getElementsByTagName('td') && skill_experience_element[i].getElementsByTagName('td')[0] && removeExtraChars(skill_experience_element[i].getElementsByTagName('td')[2].innerHTML) != '')
                    skill_experience.last_used = removeExtraChars(document.getElementById('jump-it-skill').getElementsByTagName('tr')[i].getElementsByTagName('td')[2].innerHTML);


                if (skill_experience_element[i] && skill_experience_element[i].getElementsByTagName('td') && skill_experience_element[i].getElementsByTagName('td')[0] && removeExtraChars(skill_experience_element[i].getElementsByTagName('td')[3].innerHTML) != '') {
                    var temp_element = removeExtraChars(document.getElementById('jump-it-skill').getElementsByTagName('tr')[i].getElementsByTagName('td')[3].innerHTML);
                    var temp_experience = 0;
                    if (temp_element && temp_element.indexOf(' Year(s)') > -1 && temp_element.split(' Year(s)') && temp_element.split(' Year(s)')[0]) {
                        temp_experience += temp_element.split(' Year(s)')[0] * 1;
                        temp_element = temp_element.split(' Year(s)')[1];
                    }
                    if (temp_element && temp_element.indexOf(' Month(s)') > -1 && temp_element.split(' Month(s)') && temp_element.split(' Month(s)')[0])
                        temp_experience += parseFloat((temp_element.split(' Month(s)')[0] / 12).toFixed(1));

                    if (temp_experience) {
                        skill_experience.experience = temp_experience;
                    }
                }

                skill_experiences.push(skill_experience);
            }
        }

        details.skill_experience = skill_experiences;

        //naukri education 
        var education = [];
        var education_element = document.getElementsByClassName('education-inner');
        for (var x = 0; x < education_element.length; x++) {
            var education_object = {};
            if (education_element[x].innerHTML.indexOf('Other Qualifications') == -1) {
                if (education_element[x] && education_element[x].getElementsByClassName('org bkt4') && education_element[x].getElementsByClassName('org bkt4')[0] && education_element[x].getElementsByClassName('org bkt4')[0].innerHTML)
                    education_object.institution = removeExtraChars(education_element[x].getElementsByClassName('org bkt4')[0].innerHTML);
                if (education_element[x] && education_element[x].getElementsByClassName('detail') && education_element[x].getElementsByClassName('detail')[0] && education_element[x].getElementsByClassName('detail')[0].innerHTML && education_element[x].getElementsByClassName('detail')[0].innerHTML.split('</span>') && education_element[x].getElementsByClassName('detail')[0].innerHTML.split('</span>')[1] && education_element[x].getElementsByClassName('detail')[0].innerHTML.split('</span>')[1])
                    education_object.passing_year = removeExtraChars(education_element[x].getElementsByClassName('detail')[0].innerHTML.split('</span>')[1]);

                if (education_element[x] && education_element[x].getElementsByClassName('detail') && education_element[x].getElementsByClassName('detail')[0] && education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg') && education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0] && education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0].innerHTML) {
                    education_object.education = removeExtraChars(education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0].innerHTML.split('(')[0]);
                    if (education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0].innerHTML.split('(')[1] && education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0].innerHTML.split('(')[1].split(')')[0])
                        education_object.specialization = removeExtraChars(education_element[x].getElementsByClassName('detail')[0].getElementsByClassName('deg')[0].innerHTML.split('(')[1].split(')')[0]);
                }
                if (education_object.education != '')
                    education.push(education_object);
            }
        }

        details.education = education;


        try {
            //notice period
            var notice_period;
            var notice_period_element = document.getElementsByClassName('innerDetailsCont clFx');
            if (notice_period_element && notice_period_element[0] && notice_period_element[0].innerHTML && notice_period_element[0].innerHTML.indexOf('Notice Period') > -1) {
                for (var i = 0; i < notice_period_element[0].getElementsByClassName('desc').length; i++) {
                    var notice_element = notice_period_element[0].getElementsByClassName('desc')[i];
                    if (notice_element.innerHTML.indexOf('Month') > -1) {
                        notice_period = removeExtraChars(notice_element.innerHTML.split('Month')[0]) * 30;
                    }
                    else if (notice_element.innerHTML.indexOf('Days') > -1) {
                        notice_period = removeExtraChars(notice_element.innerHTML.split('Days')[0]) * 1;
                    }
                    else if (notice_element.innerHTML.indexOf('Currently Serving') > -1) {
                        notice_period = 15;
                    }
                }
            }
            details.noticePeriod = notice_period;
        }

        catch (err) {
            console.log(err);
            console.log('notice period error');
        }

        try {
            var uniqueID;
            var uniqueIdArray = req.body.xml_string.match(/var ukey = "[a-zA-Z0-9]*"/);
            if (uniqueIdArray && uniqueIdArray.length && uniqueIdArray[0]) {
                var temp_uid = uniqueIdArray[0].match(/"[a-zA-Z0-9]*"/);
                if (temp_uid && temp_uid.length && temp_uid[0]) {
                    uniqueID = temp_uid[0].replace(/"/g, '')
                    if (uniqueID) {
                        details.uid = uniqueID;
                    }
                }
            }
        }

        catch (err) {
            console.log(err);
            console.log('UID error');
        }

        try {
            var lu_date;
            var lu_elements = document.getElementsByClassName('tupleFoot');
            if (lu_elements && lu_elements[0]) {
                var lu_element = lu_elements[0].getElementsByClassName('mr15');
                if (lu_element && lu_element.length) {
                    for (var x = 0; x < lu_element.length; x++) {
                        if (lu_element[x].innerHTML.indexOf('Modified: ') > -1 && lu_element[x].innerHTML.split('Modified: ')[1]) {
                            lu_date = removeExtraChars(lu_element[x].innerHTML.split('Modified: ')[1]);
                            if (lu_date) {
                                details.lastModifiedDate = dateConverter(lu_date);
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }

        details.resumeText = removeUnicodeChars(req.body.resume_text || "");

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        console.timeEnd("Completed with parsing");
        // var isTallint = req.query.isTallint || 0;

        // for tallint
        if (isTallint) {
            var token = req.query.token;
            var heMasterId = req.query.heMasterId;
            // var portalId = 2;

            details.portalId = portalId;
            details.token = req.body.tallintToken;
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                //console.log(attachment1);
                if (attachment1.length && attachment1[0] && attachment1[1]) {

                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    details.resume_extension = '.' + filetype;
                }
            }
            delete (details.resumeText);

            if (req.body.requirements)
                details.requirements = [parseInt(req.body.requirements)];


            if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1 && !req.body.isIntranet) {
                request({
                    headers: {
                        Authorization: 'Bearer ' + req.body.tallintToken
                    },
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: details
                }, function (error, resp, body) {
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: {
                                headers: {
                                    Authorization: 'Bearer ' + req.body.tallintToken
                                },
                                url: req.body.tallint_url,
                                method: "POST",
                                json: true,
                                body: details
                            },
                            resonseOfTallint: body
                        };
                        if (body.Code != 'ERR0001') {
                            res.status(200).json(response);
                        }
                        else {
                            res.status(500).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: {
                                headers: {
                                    Authorization: 'Bearer ' + req.body.tallintToken
                                },
                                url: req.body.tallint_url,
                                method: "POST",
                                json: true,
                                body: details
                            },
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }

                });
            }

            else if (req.body.isTallint && (req.body.isIntranet)) {
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: {
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    },
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else {
            console.log(details);
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }

    }

    catch (ex) {
        console.log(ex);
        response.data = ex;
        res.status(500).json(response);
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
    try {
        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;
        var is_select_all = req.body.is_select_all;
        var search_results = document.getElementsByClassName('cls_loop_chng search_result2');
        //console.log('search_results', search_results.length)
        if (is_select_all == 1) {

            if (search_results)
                for (var i = 0; i < search_results.length; i++) {
                    if (search_results[i]) {

                        try {
                            var tempname = search_results[i].getElementsByClassName('cls_circle_name');
                            if (tempname && tempname[0] && tempname[0].innerHTML && tempname[0].innerHTML.trim()) {
                                //console.log('name', name);
                                var name = tempname[0].innerHTML.trim();
                                var first_name = "";
                                var last_name = "";

                                if (name && name.split(' ')) {
                                    if (name.split(' ')[0])
                                        first_name = removeExtraChars(name.split(' ')[0]);
                                    if (name.split(' ')[1]) {
                                        last_name = name.split(' ').splice(1).join(' ');
                                        last_name = removeExtraChars(last_name.trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex);
                        }

                        try {
                            if (document.getElementsByClassName('cls_loop_chng search_result2') && document.getElementsByClassName('cls_loop_chng search_result2')[i] && document.getElementsByClassName('cls_loop_chng search_result2')[i].getElementsByClassName('bot_profile') && document.getElementsByClassName('ftRight')[i].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n') && document.getElementsByClassName('ftRight')[i].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0] && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1]) {
                                var dateStr = document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1].trim();
                                var lastModifiedDate = dateConverter(dateStr);
                            }
                        } catch (ex) {
                            console.log(ex);
                        }

                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 4, index: i, lastModifiedDate: lastModifiedDate });



                    }

                }
            //console.log('applicants', applicants);
        }

        else {
            // console.log(document.getElementsByClassName('userChk')[0].checked);
            if (search_results) {

                for (var i = 0; i < selected_candidates.length; i++) {
                    if (selected_candidates[i] >= 0) {

                        try {
                            var tempname = search_results[selected_candidates[i]].getElementsByClassName('cls_circle_name');
                            if (tempname && tempname[0] && tempname[0].innerHTML && tempname[0].innerHTML.trim()) {
                                //console.log('name', name);
                                var name = tempname[0].innerHTML.trim();
                                var first_name = "";
                                var last_name = "";
                                try {
                                    if (name && name.split(' ')) {
                                        if (name.split(' ')[0])
                                            first_name = removeExtraChars(name.split(' ')[0]);
                                        if (name.split(' ')[1]) {
                                            last_name = name.split(' ').splice(1).join(' ');
                                            last_name = removeExtraChars(last_name.trim());
                                        }
                                    }
                                } catch (ex) {
                                    console.log(ex);
                                }
                            }
                        } catch (ex) {
                            console.log(ex);
                        }

                        try {
                            if (document.getElementsByClassName('cls_loop_chng search_result2') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]] && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n') && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0] && document.getElementsByClassName('cls_loop_chng search_result2')[search_results[selected_candidates[i]]].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1]) {
                                var dateStr = document.getElementsByClassName('cls_loop_chng search_result2')[0].getElementsByClassName('bot_profile')[0].getElementsByClassName('bor_n')[0].innerHTML.split(':')[1].trim();
                                var lastModifiedDate = dateConverter(dateStr);
                            }
                        } catch (ex) {
                            console.log(ex);
                        }
                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 4, index: selected_candidates[i] });
                    }
                }
                //console.log('applicants', applicants);

            }
        }

        // for tallint
        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;
        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    try {
                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: applicants,
                                resonseOfTallint: body
                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: applicants,
                                resonseOfTallint: error
                            };
                            res.status(500).json(response);
                        }

                    }
                    catch (ex) {
                        response.status = false;
                        response.message = "Something went wrong";
                        response.error = ex;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            var portalId = 4;
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
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

    try {

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;
        var is_select_all = req.body.is_select_all;
        var search_results = document.getElementsByClassName('search-result-block search-result');


        document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML

        //console.log('search_results', search_results.length)
        if (is_select_all == 1) {

            if (search_results)
                for (var i = 1; i < search_results.length; i++) {
                    if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML) {
                        try {
                            //console.log('name', name);
                            var name = search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML.trim();
                            var first_name = "";
                            var last_name = "";

                            if (name && name.split(' ')) {
                                try {
                                    if (name.split(' ')[0])
                                        first_name = removeExtraChars(name.split(' ')[0]);
                                    if (name.split(' ')[1]) {
                                        last_name = name.split(' ').splice(1).join(' ');
                                        last_name = removeExtraChars(last_name.trim());
                                    }
                                }
                                catch (ex) {
                                    console.log(ex);
                                }
                            }

                        }
                        catch (ex) {
                            console.log(ex);
                        }
                        if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                            try {
                                var dateStr = document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim();
                                var lastModifiedDate = dateConverter(dateStr);

                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        }
                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: i, lastModifiedDate: lastModifiedDate });

                    }
                }

            //console.log('applicants', applicants);
        }

        else {
            // console.log(document.getElementsByClassName('userChk')[0].checked);
            if (search_results) {

                for (var i = 0; i < selected_candidates.length; i++) {
                    if (selected_candidates[i] >= 0) {
                        try {
                            var tempname = search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML;

                            if (search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML) {
                                //console.log('name', name);
                                try {
                                    var name = search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML.trim();
                                    var first_name = "";
                                    var last_name = "";

                                    if (name.split(' ')) {
                                        if (name.split(' ')[0])
                                            first_name = removeExtraChars(name.split(' ')[0]);
                                        if (name.split(' ')[1]) {
                                            try {
                                                last_name = name.split(' ').splice(1).join(' ');
                                                last_name = removeExtraChars(last_name.trim());
                                            }
                                            catch (ex) {
                                                console.log(ex);
                                            }
                                        }
                                    }
                                }
                                catch (ex) {
                                    console.log(ex);
                                }
                            }
                            try {
                                if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                                    try {
                                        var dateStr = document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim();

                                        var lastModifiedDate = dateConverter(dateStr);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                    }
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                            applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: selected_candidates[i] });

                        }
                        catch (ex) {
                            console.log(ex);
                        }
                    }
                }
                //console.log('applicants', applicants);

            }


        }

        // for tallint
        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;
        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    try {
                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: applicants,
                                resonseOfTallint: body
                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: applicants,
                                resonseOfTallint: error
                            };
                            res.status(500).json(response);
                        }

                    }
                    catch (ex) {
                        response.status = false;
                        response.message = "Something went wrong";
                        response.error = ex;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            var portalId = 3;
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
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

    try {
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        try {
            if (document && document.getElementsByClassName('cls_circle_name') && document.getElementsByClassName('cls_circle_name')[0] && document.getElementsByClassName('cls_circle_name')[0].innerHTML) {
                var tempName = document.getElementsByClassName('cls_circle_name');
                if (tempName && tempName[0] && tempName[0].innerHTML && tempName[0].innerHTML.trim(' ')) {
                    var name = tempName[0].innerHTML.trim(' ');
                    if (name && name.split(' ')[0])
                        details.firstName = removeExtraChars(name.split(' ')[0]);
                    if (name && name.split(' ')[1]) {
                        details.lastName = removeExtraChars(name.split(' ').splice(1).join(' '));
                    }
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0].innerHTML) {
                var tempEmailId = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
                if (tempEmailId && tempEmailId[0] && tempEmailId[0].innerHTML) {
                    try {
                        var emailid = tempEmailId[0].innerHTML.trim();
                        var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/;   // include /s in the end
                        //console.log(emailid);
                        // //console.log("using match all",matchAll(emailid,regularExp).toArray());
                        //console.log('match all here', regularExp.exec(emailid));
                        // res.status(200).json(regularExp.exec(emailid)[0]);
                        if (regularExp.exec(emailid) && regularExp.exec(emailid)[0] && regularExp.exec(emailid)[0].trim())
                            details.emailId = regularExp.exec(emailid)[0].trim();

                        details.emailId = removeExtraChars(details.emailId);
                    } catch (ex) {
                        console.log(ex)
                    }
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[1].innerHTML) {
                var tempMobileNumber = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');  // check
                if (tempMobileNumber && tempMobileNumber[1] && tempMobileNumber[1].innerHTML) {
                    var mobileNumber = tempMobileNumber[1].innerHTML;
                    var regularExp = /(\d{7,10})/;
                    // console.log("match all mobileNumber", matchAll(mobilenumber, regularExp).toArray());
                    if (regularExp.exec(mobileNumber) && regularExp.exec(mobileNumber)[0] && regularExp.exec(mobileNumber)[0].trim())
                        details.mobileNumber = removeExtraChars(regularExp.exec(mobileNumber)[0].trim());

                    // if (mobileNumber.split(':'))
                    //     details.mobileNumber = mobileNumber.split(':')[1].trim(' ');
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0].innerHTML) {
                var tempEmployer = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
                if (tempEmployer && tempEmployer[0] && tempEmployer[0].innerHTML && tempEmployer[0].innerHTML.split('Company:') && tempEmployer[0].innerHTML.split('Company:')[1] && tempEmployer[0].innerHTML.split('Company:')[1].trim(' ')) {
                    details.employer = removeExtraChars(tempEmployer[0].innerHTML.split('Company:')[1].trim(' '));
                }
            }

        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].innerHTML) {
                var tempJobtitle = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');

                if (tempJobtitle && tempJobtitle[1] && tempJobtitle[1].innerHTML && tempJobtitle[1].innerHTML.split('Job Title:') && tempJobtitle[1].innerHTML.split('Job Title:')[1] && tempJobtitle[1].innerHTML.split('Job Title:')[1].trim(' ')) {
                    details.jobTitle = removeExtraChars(tempJobtitle[1].innerHTML.split('Job Title:')[1].trim(' '));
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[2] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[2].innerHTML) {
                var tempCTC = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
                if (tempCTC && tempCTC[2] && tempCTC[2].innerHTML && tempCTC[2].innerHTML.trim(' ')) {
                    details.presentSalary = removeExtraChars(tempCTC[2].innerHTML.trim(' '));
                }
            }
        } catch (ex) {
            console.log(ex)
        }
        // if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[3].innerHTML) {
        //     var tempExperience = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
        //     if (tempExperience && tempExperience[3] && tempExperience[3].innerHTML) {
        //         details.experience = removeExtraChars(tempExperience[3].innerHTML.trim(' '));
        //     }
        // }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li')[4].innerHTML) {
                var tempNoticePeriod = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[0].getElementsByTagName('li');
                if (tempNoticePeriod[4] && tempNoticePeriod[4].innerHTML && tempNoticePeriod[4].innerHTML.trim(' ')) {
                    details.noticePeriod = removeExtraChars(tempNoticePeriod[4].innerHTML.trim(' '));
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[2].innerHTML) {
                var tempLocation = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
                if (tempLocation && tempLocation[2] && tempLocation[2].innerHTML) {
                    details.presentLocation = removeExtraChars(tempLocation[2].innerHTML.split('Location:')[1].trim(' '));
                }
            }
        } catch (ex) {
            console.log(ex)
        }

        try {
            if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[3] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[3].innerHTML) {
                var tempGender = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
                if (tempGender && tempGender[3] && tempGender[3].innerHTML) {

                    if (removeExtraChars(tempGender[3].innerHTML.trim(' ')).toLowerCase().indexOf('female') > -1)
                        details.gender = 2;
                    else if (removeExtraChars(tempGender[3].innerHTML.trim(' ')).toLowerCase().indexOf('male') > -1)
                        details.gender = 1;
                }
            }
        } catch (ex) {
            console.log(ex)
        }


        // if (document && document.getElementsByClassName('snapshot education_box wid100per') && document.getElementsByClassName('snapshot education_box wid100per')[0] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li') && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[4] && document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li')[4].innerHTML) {
        //     var tempDOB = document.getElementsByClassName('snapshot education_box wid100per')[0].getElementsByClassName('inner_box')[1].getElementsByTagName('li');
        //     if (tempDOB && tempDOB[4] && tempDOB[4].innerHTML) {
        //         details.DOB = removeExtraChars(tempDOB[4].innerHTML.trim(' '));
        //     }
        // }

        try {
            if (document && document.getElementsByClassName('resume_box wid100per') && document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn') && document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn')) {
                var tempSkills = document.getElementsByClassName('resume_box wid100per')[0].getElementsByClassName('pro_btn'); // [0].innerHTML;
                var skills = [];
                for (var i = 0; i < tempSkills.length; i++) {
                    try {
                        if (tempSkills && tempSkills[i] && tempSkills[i].getElementsByClassName('pro_mid') && tempSkills[i].getElementsByClassName('pro_mid')[0] && tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML && tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML.split('<b') && tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML.split('<b')[0]) {
                            skills.push(removeExtraChars(tempSkills[i].getElementsByClassName('pro_mid')[0].innerHTML.split('<b')[0]));
                        }
                    } catch (ex) {
                        console.log(ex)
                    }
                }
                details.primarySkills = skills;
            }
        } catch (ex) {
            console.log(ex)
        }



        var isTallint = req.body.isTallint || 0;

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        console.timeEnd("Completed with parsing");
        // var isTallint = req.query.isTallint || 0;

        // for tallint
        if (isTallint) {
            var token = req.query.token;
            var heMasterId = req.query.heMasterId;
            // var portalId = 2;

            details.portalId = portalId;
            details.token = req.body.tallintToken;
            if (req.body.attachment) {
                try {
                    var attachment1 = req.body.attachment.split(',');
                    //console.log(attachment1);
                    if (attachment1.length && attachment1[0] && attachment1[1]) {

                        details.resume_document = attachment1[1];
                        var filetype = '';
                        filetype = setFileType(attachment1[0]);
                        details.resume_extension = '.' + filetype;
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
            delete (details.resumeText);

            if (req.body.requirements)
                details.requirements = [parseInt(req.body.requirements)];


            if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1 && !req.body.isIntranet) {
                request({
                    headers: {
                        Authorization: 'Bearer ' + req.body.tallintToken
                    },
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: details
                }, function (error, resp, body) {
                    try {
                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                },
                                resonseOfTallint: body
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                },
                                resonseOfTallint: error
                            };
                            res.status(500).json(response);
                        }
                    } catch (ex) {
                        console.log(ex);
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = ex;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }

            else if (req.body.isTallint && (req.body.isIntranet)) {
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: {
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    },
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else {
            console.log(details);
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
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

    try {
        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        try {
            var tempName = document.getElementsByClassName('candidate-info lft');

            if (tempName && tempName[0] && tempName[0].getElementsByTagName('li') && tempName[0].getElementsByTagName('li')[0] && tempName[0].getElementsByTagName('li')[0].innerHTML)
                var fullName = document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[0].innerHTML.trim();

            if (fullName && fullName.split(' ') && fullName.split(' ')[0])
                details.firstName = removeExtraChars(fullName.split(' ')[0]);
            if (fullName && fullName.split(' ') && fullName.split(' ')[1]) {
                details.lastName = fullName.split(' ').splice(1).join(' ')
                details.lastName = removeExtraChars(details.lastName.trim());
            }
        } catch (ex) {
            console.log(ex);
        }

        try {
            var tempDetails = document.getElementsByClassName('candidate-contact lft');
            if (tempDetails && tempDetails[0] && tempDetails[0].getElementsByTagName('a') && tempDetails[0].getElementsByTagName('a')[1] && tempDetails[0].getElementsByTagName('a')[1].innerHTML) {
                try {
                    var emailid = tempDetails[0].getElementsByTagName('a')[1].innerHTML.trim();
                    var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/;   // include /s in the end
                    //console.log('match all here', regularExp.exec(emailid));
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

                } catch (ex) {
                    console.log(ex);
                }
            }
        } catch (ex) {
            console.log(ex);
        }

        try {
            var tempMobile = document.getElementsByClassName('candidate-contact lft');
            if (tempMobile && tempMobile[0] && tempMobile[0].getElementsByTagName('a') && tempMobile[0].getElementsByTagName('a')[0] && tempMobile[0].getElementsByTagName('a')[0].innerHTML) {
                var mobilenumber = tempMobile[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[1];
                var regularExp = /(\d{7,10})/;
                if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                    details.mobileNumber = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
            }
        } catch (ex) {
            console.log(ex);
        }

        try {
            var tempMobileIsd = document.getElementsByClassName('candidate-contact lft');
            if (tempMobileIsd && tempMobileIsd[0] && tempMobileIsd[0].getElementsByTagName('a') && tempMobileIsd[0].getElementsByTagName('a')[0] && tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML) {
                var mobileISD = tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[0];
                var regularExp = /(\d{7,10})/;
                if (regularExp.exec(mobileISD) && regularExp.exec(mobileISD)[0])
                    details.mobileISD = removeExtraChars(regularExp.exec(mobileISD)[0].trim());
            }
        } catch (ex) {
            console.log(ex);
        }

        try {
            var tempExp = document.getElementsByClassName('candidate-info lft');
            if (tempExp && tempExp[0] && tempExp[0].getElementsByTagName('li') && tempExp[0].getElementsByTagName('li')[1] && tempExp[0].getElementsByTagName('li')[1].innerHTML) {
                details.experience = removeExtraChars(document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[1].innerHTML.trim()).split('Year')[0].trim();
                //console.log(details.experience);
            }
        } catch (ex) {
            console.log(ex);
        }

        // var tempSalary = document.getElementsByClassName('candidate-info lft');
        // if(tempSalary && tempSalary[0] && tempSalary[0].getElementsByTagName('li') && tempSalary[0].getElementsByTagName('li')[1] && tempSalary[0].getElementsByTagName('li')[1].innerHTML){
        //     details.presentSalary = document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[1].innerHTML.split('</span>')[1].trim();
        // }


        var isTallint = req.body.isTallint || 0;

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        console.timeEnd("Completed with parsing");
        // var isTallint = req.query.isTallint || 0;

        // for tallint
        if (isTallint) {
            var token = req.query.token;
            var heMasterId = req.query.heMasterId;
            // var portalId = 2;

            details.portalId = portalId;
            details.token = req.body.tallintToken;
            if (req.body.attachment) {
                try {
                    var attachment1 = req.body.attachment.split(',');
                    //console.log(attachment1);
                    if (attachment1.length && attachment1[0] && attachment1[1]) {

                        details.resume_document = attachment1[1];
                        var filetype = '';
                        filetype = setFileType(attachment1[0]);
                        details.resume_extension = '.' + filetype;
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
            delete (details.resumeText);

            if (req.body.requirements)
                details.requirements = [parseInt(req.body.requirements)];


            if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1 && !req.body.isIntranet) {
                request({
                    headers: {
                        Authorization: 'Bearer ' + req.body.tallintToken
                    },
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: details
                }, function (error, resp, body) {
                    try {
                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                },
                                resonseOfTallint: body
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                },
                                resonseOfTallint: error
                            };
                            res.status(500).json(response);
                        }
                    } catch (ex) {
                        console.log(ex);
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = ex;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }

            else if (req.body.isTallint && (req.body.isIntranet)) {
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: {
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    },
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }
        }

        else {
            console.log(details);
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
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

        var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/;   // include /s in the end
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
            url: req.body.tallint_url,
            method: "POST",
            json: true,
            body: details
        }, function (error, response, body) {
            if (!error && body) {
                response.status = true;
                response.message = "Response from tallint DB";
                response.error = null;
                response.data = {
                    resonseOfTallint: body
                };
                res.status(200).json(response);
            }
            else if (error) {
                response.status = false;
                response.message = "Error from tallint DB";
                response.error = null;
                response.data = {
                    resonseOfTallint: error
                };
                res.status(200).json(response);
            }
        });
    }

    else {
        savePortalApplicants(portalId, cvSourceId, details, req, res);
    }

};


portalimporter.checkApplicantExistsFromTotalJobsPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 5;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        if (req.body.is_select_all == 1) {
            if (document.getElementById('rptResults') && document.getElementById('rptResults').getElementsByClassName('row card-row')) {

                for (var i = 0; i < document.getElementById('rptResults')[0].getElementsByClassName('row card-row').length; i++) {
                    var element = document.getElementById('rptResults')[0].getElementsByClassName('row card-row')[i];

                    var first_name = "";
                    var last_name = "";

                    var first_name_ele = element.getElementsByClassName('firstName');
                    var last_name_ele = element.getElementsByClassName('lastName');

                    if (first_name_ele && first_name_ele[0].innerHTML)
                        first_name = removeExtraChars(first_name_ele[0].innerHTML);
                    if (last_name_ele && last_name_ele[0].innerHTML) {
                        last_name = removeExtraChars(last_name_ele[0].innerHTML);
                    }


                    var current_location = undefined;

                    if (element && element.getElementsByClassName('span-location') && element.getElementsByClassName('span-location')[0] && element.getElementsByClassName('span-location')[0].innerHTML)
                        current_location = removeExtraChars(element.getElementsByClassName('span-location')[0].innerHTML);


                    // var jobTitle = undefined;
                    // var job_title_element = element.getElementsByClassName('desig_sftlnk')[0];
                    // if (job_title_element)
                    //     jobTitle = removeExtraChars(job_title_element.innerHTML);



                    var lastModifiedDate = undefined;
                    var uniqueID = undefined;

                    try {
                        var lu_element = element.getElementsByClassName('activity-period');

                        if (lu_element && lu_element[0] && lu_element[0].title) {
                            lastModifiedDate = convertDateArrToDate(lu_element.split('/'));
                            // temp = lu_element[1];
                            // lu_element[1] = lu_element[0];
                            // lu_element[0] = temp;
                            // temp = lu_element[2];
                            // lu_element[2] = lu_element[0];
                            // lu_element[0] = temp;
                            // var temp_date = lu_element.join('-');
                            // lastModifiedDate = temp_date;
                        }

                        if (element.getElementsByClassName('candidate-lnk') && element.getElementsByClassName('candidate-lnk')[0] && element.getElementsByClassName('candidate-lnk')[0].getAttribute('data-target')) {
                            uniqueID = element.getElementsByClassName('candidate-lnk')[0].getAttribute('data-target');
                        }
                    }

                    catch (err) {
                        console.log(err);
                    }



                    if (uniqueID) {
                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 5, index: i, current_location: current_location, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                    }
                }
            }

            //console.log("applicants", applicants);
        }

        else {
            console.log("else part");
            if (document.getElementsByClassName('resumeitem_Section'))
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = document.getElementById('rptResults').getElementsByClassName('row card-row')[selected_candidates[i]];

                    var first_name = "";
                    var last_name = "";

                    var first_name_ele = element.getElementsByClassName('firstName');
                    var last_name_ele = element.getElementsByClassName('lastName');

                    if (first_name_ele && first_name_ele[0].innerHTML)
                        first_name = removeExtraChars(first_name_ele[0].innerHTML);
                    if (last_name_ele && last_name_ele[0].innerHTML) {
                        last_name = removeExtraChars(last_name_ele[0].innerHTML);
                    }


                    var current_location = undefined;

                    if (element && element.getElementsByClassName('span-location') && element.getElementsByClassName('span-location')[0] && element.getElementsByClassName('span-location')[0].innerHTML)
                        current_location = removeExtraChars(element.getElementsByClassName('span-location')[0].innerHTML);


                    // var jobTitle = undefined;
                    // var job_title_element = element.getElementsByClassName('desig_sftlnk')[0];
                    // if (job_title_element)
                    //     jobTitle = removeExtraChars(job_title_element.innerHTML);



                    var lastModifiedDate = undefined;
                    var uniqueID = undefined;

                    try {
                        var lu_element = element.getElementsByClassName('activity-period');

                        if (lu_element && lu_element[0] && lu_element[0].title) {
                            lastModifiedDate = convertDateArrToDate(lu_element[0].title.split('/'));
                            // lu_element = lu_element[0].title.split('/');
                            // temp = lu_element[1];
                            // lu_element[1] = lu_element[0];
                            // lu_element[0] = temp;
                            // var temp_date = new Date(lu_element.join('/'));
                            // lastModifiedDate = temp_date.getFullYear() + "-" + (temp_date.getMonth() + 1) + "-" + temp_date.getDate();
                        }

                        if (element.getElementsByClassName('candidate-lnk') && element.getElementsByClassName('candidate-lnk')[0] && element.getElementsByClassName('candidate-lnk')[0].getAttribute('data-target')) {
                            uniqueID = element.getElementsByClassName('candidate-lnk')[0].getAttribute('data-target');
                        }
                    }

                    catch (err) {
                        console.log(err);
                    }


                    if (uniqueID) {
                        applicants.push({ firstName: first_name, lastName: last_name, portalId: 5, index: selected_candidates[i], current_location: current_location, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                    }
                }
        }

        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    //console.log("body", body);
                    //console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }

};

portalimporter.saveApplicantsFromTotalJobs = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = 5;   // totaljobs
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;
        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);


        var temp_name = document.getElementsByClassName('candidate-lnk');
        if (temp_name && temp_name[0] && temp_name[0].innerHTML) {
            temp_name = removeExtraChars(document.getElementsByClassName('candidate-lnk')[0].innerHTML);
            if (temp_name && temp_name.split(":")[0]) {
                temp_name = temp_name.split(":")[0].replace(/Mr[s]* /, '');
                if (temp_name.split(' ')) {
                    temp_name = temp_name.split(' ');
                    details.lastName = temp_name.splice(temp_name.length - 1, 1)[0];
                    if (temp_name[0]) {
                        details.firstName = temp_name.join(' ');
                    }
                }
            }
        }


        var temp_jobtitle = document.getElementsByClassName('candidate-lnk');
        if (temp_jobtitle && temp_jobtitle[0] && temp_jobtitle[0].innerHTML) {
            temp_jobtitle = removeExtraChars(document.getElementsByClassName('candidate-lnk')[0].innerHTML);
            if (temp_jobtitle && temp_jobtitle.split(":")[1]) {
                temp_jobtitle = removeExtraChars(temp_jobtitle.split(":")[1]);
                if (temp_jobtitle[temp_jobtitle.length - 1] == ',') {
                    temp_jobtitle = temp_jobtitle.replace(/,$/, '')
                }
                details.jobTitle = temp_jobtitle;
            }
        }


        var temp_emailid = document.getElementById('btnEmailCandidate');
        if (temp_emailid && temp_emailid.innerHTML) {
            details.emailId = removeExtraChars(document.getElementById('btnEmailCandidate').innerHTML);
        }


        var temp_mobilenumber = document.getElementById('btnHomePhone');
        if (temp_mobilenumber && temp_mobilenumber.innerHTML) {
            details.mobileNumber = removeExtraChars(temp_mobilenumber.innerHTML).replace(/ /g, '');
        }

        var uniqueID = document.getElementsByClassName('candidate-info-id');
        if (uniqueID && uniqueID[0] && uniqueID[0].innerHTML && uniqueID[0].innerHTML.split('ID:') && uniqueID[0].innerHTML.split('ID:')[1]) {
            details.uid = removeExtraChars(uniqueID[0].innerHTML.split('ID:')[1]);
        }

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        var lastModifiedDate = xml_string;
        if (lastModifiedDate && lastModifiedDate.split("dateUpdatedProfile = '") && lastModifiedDate.split("dateUpdatedProfile = '")[1] && lastModifiedDate.split("dateUpdatedProfile = '")[1].split("';") && lastModifiedDate.split("dateUpdatedProfile = '")[1].split("';")[0] && lastModifiedDate.split("dateUpdatedProfile = '")[1].split("';")[0].split(' ')[0]) {
            // lastModifiedDate = lastModifiedDate.split('/');
            lastModifiedDate = convertDateArrToDate(lastModifiedDate.split("dateUpdatedProfile = '")[1].split("';")[0].split(' ')[0].split('/'), 1);
            if (lastModifiedDate) {
                details.lastModifiedDate = lastModifiedDate;
            }
            // var temp_date = new Date(lastModifiedDate);
            // lastModifiedDate = temp_date.getFullYear() + "-" + (temp_date.getMonth() + 1) + "-" + temp_date.getDate();
            // if (lastModifiedDate) {
            //     details.lastModifiedDate = lastModifiedDate;
            // }
        }

        // for tallint
        var isTallint = req.body.isTallint;
        if (isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    details.resume_extension = '.' + filetype;
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
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

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        //console.log(response);
                        console.log(error);
                    });
                }



                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                console.log(req.body.isTallint, req.body.isIntranet);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }



        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};


portalimporter.checkApplicantExistsFromReed = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 6;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        if (document.getElementsByClassName('openRow cvsearchResult')) {

            for (var i = 0; i < document.getElementsByClassName('openRow cvsearchResult').length; i++) {
                var element = document.getElementsByClassName('openRow cvsearchResult')[i];

                var first_name = "";
                var last_name = "";

                var temp_name = element.getElementsByClassName('fullName');
                if (temp_name && temp_name[0] && temp_name[0].innerHTML) {
                    temp_name = removeExtraChars(element.getElementsByClassName('fullName')[0].innerHTML);
                    if (temp_name.split(' ')) {
                        temp_name = temp_name.split(' ');
                        last_name = temp_name.splice(temp_name.length - 1, 1)[0];
                        if (temp_name[0]) {
                            first_name = temp_name.join(' ');
                        }
                    }
                }


                // var temp_date = new Date();
                // for (var i = 0; i < document.getElementsByClassName('jobTitle salary-block bottomInfos').length; i++) {
                var lastModifiedDate = null;
                if (element.getElementsByClassName('jobTitle salary-block bottomInfos') && element.getElementsByClassName('jobTitle salary-block bottomInfos')[0] && element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML && element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ') && element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1] && element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0]) {
                    if (element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].indexOf('month') > -1)
                        lastModifiedDate = moment(new Date()).subtract(element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].split(' month')[0], 'months').format('YYYY-MM-DD');
                    if (document.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].indexOf('year') > -1)
                        lastModifiedDate = moment(new Date()).subtract(element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].split(' year')[0], 'years').format('YYYY-MM-DD');
                    if (document.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].indexOf('week') > -1)
                        lastModifiedDate = moment(new Date()).subtract(element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].split(' week')[0], 'weeks').format('YYYY-MM-DD');
                    if (document.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].indexOf('day') > -1)
                        lastModifiedDate = moment(new Date()).subtract(element.getElementsByClassName('jobTitle salary-block bottomInfos')[0].innerHTML.split('Last active ')[1].split('|')[0].split(' day')[0], 'd').format('YYYY-MM-DD');

                    if (!lastModifiedDate) {
                        lastModifiedDate = moment(new Date()).format('YYYY-MM-DD');
                    }
                }
                // }
                // var lastModifiedDate = temp_date.getFullYear() + "-" + (temp_date.getMonth() + 1) + "-" + temp_date.getDate();
                var uniqueID = undefined;

                // console.log('---------------------------------------------------', document.querySelector('[data-bind="attr:{id:\'actions\'+ CandidateId}"]'));
                try {
                    // var lu_element = getElementsByClassName('activity-period');

                    // if (lu_element && lu_element[0] && lu_element[0].title) {
                    //     lastModifiedDate = moment((lu_element[0].title)).format('DD-MM-YYYY');
                    // }
                    // element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0].href.split('candidateId=')[1].split('&')[0]
                    if (element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background') && element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0] && element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0].href && element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0].href.split('candidateId=')[1] && element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0].href.split('candidateId=')[1].split('&')[0]) {
                        uniqueID = element.getElementsByClassName('btn btn-action gtm_downloadCV tansition-background')[0].href.split('candidateId=')[1].split('&')[0];
                    }
                }

                catch (err) {
                    console.log(err);
                }


                applicants.push({ firstName: first_name, lastName: last_name, portalId: 6, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
            }
        }

        //console.log("applicants", applicants);


        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    //console.log("body", body);
                    //console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({});
    }

};

portalimporter.saveApplicantsFromReed = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = 6;   // totaljobs
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);


        var temp_name = document.getElementsByClassName('nameAndDetails clearfix');
        if (temp_name && temp_name[0] && temp_name[0].getElementsByTagName('h1') && temp_name[0].getElementsByTagName('h1')[0] && temp_name[0].getElementsByTagName('h1')[0].innerHTML) {
            temp_name = removeExtraChars(temp_name[0].getElementsByTagName('h1')[0].innerHTML);
            if (temp_name.split(' ')) {
                temp_name = temp_name.split(' ');
                details.lastName = temp_name.splice(temp_name.length - 1, 1)[0];
                if (temp_name[0]) {
                    details.firstName = temp_name.join(' ');
                }
            }
        }


        var temp_jobtitle = document.getElementsByClassName('nameAndDetails clearfix');
        if (temp_jobtitle && temp_jobtitle[0] && temp_jobtitle[0].getElementsByClassName('detailsJob') && temp_jobtitle[0].getElementsByClassName('detailsJob')[0] && temp_jobtitle[0].getElementsByClassName('detailsJob')[0].innerHTML) {
            temp_jobtitle = removeExtraChars(temp_jobtitle[0].getElementsByClassName('detailsJob')[0].innerHTML);
            if (temp_jobtitle && removeExtraChars(temp_jobtitle.split(" at "))) {
                temp_jobtitle = removeExtraChars(temp_jobtitle.split(" at "));
                details.jobTitle = removeExtraChars(temp_jobtitle[0]);
                if (removeExtraChars(temp_jobtitle[1])) {
                    details.employer = removeExtraChars(temp_jobtitle[1]);
                }
            }
        }


        var temp_emailid = document.getElementsByClassName('email');
        if (temp_emailid && temp_emailid[0] && temp_emailid[0].innerHTML) {
            details.emailId = removeExtraChars(temp_emailid[0].innerHTML);
        }


        var temp_mobilenumber = document.getElementsByClassName('phone');
        if (temp_mobilenumber && temp_mobilenumber[0] && temp_mobilenumber[0].innerHTML) {
            details.mobileNumber = removeExtraChars(temp_mobilenumber[0].innerHTML);
        }

        var temp_presentlocation = document.getElementsByClassName('town');
        if (temp_presentlocation && temp_presentlocation[0] && temp_presentlocation[0].innerHTML) {
            details.presentLocation = removeExtraChars(temp_presentlocation[0].innerHTML);
        }

        var temp_address = document.getElementsByClassName('address');
        if (temp_address && temp_address[0] && temp_address[0].getElementsByTagName('span') && temp_address[0].getElementsByTagName('span')[0] && temp_address[0].getElementsByTagName('span')[0].innerHTML) {
            details.address = temp_address[0].getElementsByTagName('span')[0].innerHTML.trim();
        }

        var temp_noticeperiod = document.getElementsByClassName('notice');
        if (temp_noticeperiod && temp_noticeperiod[0] && temp_noticeperiod[0].getElementsByTagName('span') && temp_noticeperiod[0].getElementsByTagName('span')[0] && temp_noticeperiod[0].getElementsByTagName('span')[0].innerHTML) {
            temp_noticeperiod = temp_noticeperiod[0].getElementsByTagName('span')[0].innerHTML;
            if (temp_noticeperiod.indexOf('month') > -1) {
                temp_noticeperiod = removeExtraChars(temp_noticeperiod.split('month')[0]);
                if (temp_noticeperiod) {
                    details.noticePeriod = parseInt(temp_noticeperiod) * 30;
                }
            }
            else {
                details.noticePeriod = 0;
            }
        }

        var uniqueID = document.getElementById('downloadOriginalCV');
        if (uniqueID && uniqueID.getAttribute('data-download-link') && uniqueID.getAttribute('data-download-link').split('candidateId=') && uniqueID.getAttribute('data-download-link').split('candidateId=')[1] && uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&') && uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&')[0]) {
            //console.log("entered uid --------------------------");
            details.uid = uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&')[0];
        }


        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        details.lastModifiedDate = "2019-04-25";

        // for tallint
        if (req.body.isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    details.resume_extension = '.' + filetype;
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
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

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    //console.log('============================', details.uid);
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        //console.log(response);
                        console.log(error);
                    });
                }



                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                //console.log('============================', details.uid);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }



        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};

var jobStreetDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var lastModifiedDate = undefined;
        var uniqueID = undefined;

        try {

            if (element.getElementsByTagName('input')) {
                if (element.getElementsByTagName('input') && element.getElementsByTagName('input')[1] && element.getElementsByTagName('input')[1].value) {
                    uniqueID = element.getElementsByTagName('input')[1].value;
                }
            }

            var last_modified_element = element.getElementsByTagName('table');
            if (last_modified_element && last_modified_element[0] && last_modified_element[0].getElementsByTagName('tr')) {
                for (let x = 0; x < last_modified_element[0].getElementsByTagName('tr').length; x++) {
                    if (last_modified_element[0].getElementsByTagName('tr')[x] && last_modified_element[0].getElementsByTagName('tr')[x].innerHTML) {
                        if (last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.indexOf('Last Modified') > -1) {
                            lastModifiedDate = dateConverter(removeExtraChars(last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.split(':')[1]));
                        }
                    }
                }
            }
            return { uid: uniqueID, lastModifiedDate: lastModifiedDate, portalId: portalId, index: index }
        }

        catch (err) {
            console.log(err);
        }
    }
}

portalimporter.checkApplicantExistsFromJobStreetPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 7;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        var length1 = 0;
        var length2 = 0;
        if (document.getElementById('cdetail') && document.getElementById('cdetail').getElementsByTagName('tbody') && document.getElementById('cdetail').getElementsByTagName('tbody')[0]) {
            if (document.getElementById('cdetail').getElementsByTagName('tbody')[0].getElementsByClassName('TR1'))
                length1 = document.getElementById('cdetail').getElementsByTagName('tbody')[0].getElementsByClassName('TR1').length
            if (document.getElementById('cdetail').getElementsByTagName('tbody')[0].getElementsByClassName('TR2'))
                length2 = document.getElementById('cdetail').getElementsByTagName('tbody')[0].getElementsByClassName('TR2').length
        }

        if (req.body.is_select_all == 1) {
            //console.log("req.body.is_select_all", req.body.is_select_all);
            for (var i = 0; i < length1 + length2; i++) {
                var element = document.getElementById('resultRow' + i);

                let applicant = jobStreetDuplicationParsing(element, i, req.body.portalId || portalId);

                // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                applicants.push(applicant);
            }

            //console.log("applicants", applicants);
        }

        else {
            //console.log("else part");
            for (var i = 0; i < selected_candidates.length; i++) {
                var element = document.getElementById('resultRow' + selected_candidates[i]);

                let applicant = jobStreetDuplicationParsing(element, selected_candidates[i], req.body.portalId || portalId);

                applicants.push(applicant);
            }
        }

        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            //console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    //console.log("body", body);
                    console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({});
    }
};


portalimporter.saveApplicantsFromJobStreet = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = req.body.portalId || 7;   // job street
        if (typeof portalId == "string") {
            portalId = parseInt(portalId);
        }
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);

        if (document.getElementsByClassName('colLeft main-heading space-gap_front')[0]) {
            temp_name = removeExtraChars(document.getElementsByClassName('colLeft main-heading space-gap_front')[0].innerHTML);
            if (temp_name.split(' ')) {
                temp_name = temp_name.split(' ');
                details.lastName = temp_name.splice(temp_name.length - 1, 1)[0];
                if (temp_name[0]) {
                    details.firstName = temp_name.join(' ');
                }
            }
        }
        if (document.getElementsByClassName('section-right-inner')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')) {
            for (var x = 0; x < document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow').length; x++) {
                if (document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('icon-phone icon').length > 0) {
                    details.mobileNumber = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
                }
                if (document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('icon-envelope').length > 0) {
                    details.emailId = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
                }
            }
        }
        if (document.getElementsByClassName('colLeft resume-summary-heading')) {
            for (var x = 0; x < document.getElementsByClassName('colLeft resume-summary-heading').length; x++) {

                if (document.getElementsByClassName('colLeft resume-summary-heading')[x].getElementsByClassName('col-left resume-label')[0].innerHTML.indexOf('Experience') > -1) {
                    details.experience = parseInt(removeExtraChars(document.getElementsByClassName('colLeft resume-summary-heading')[x].getElementsByClassName('col-middle')[0].innerHTML).replace(' years', ''));
                }
                if (document.getElementsByClassName('col-left resume-label')[x].innerHTML.indexOf('Nationality') > -1) {
                    details.nationality = removeExtraChars(document.getElementsByClassName('colLeft resume-summary-heading')[x].getElementsByClassName('col-middle')[0].innerHTML);
                }
            }
        }
        if (document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0] && document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML) {
            details.jobTitle = removeExtraChars(document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML.split(' at ')[0]);
            details.employer = removeExtraChars(document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML.split(' at ')[1]);
        }
        if (document.getElementsByClassName('section-right-inner')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0].getElementsByClassName('icon-marker-dot').length) {
            details.presentLocation = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
        }
        // if (document.getElementsByClassName('resume-section-top-inner')[i]) {
        //     if (document.getElementsByClassName('col-middle')[0]) {
        //         details.experience = document.getElementsByClassName('col-middle')[0].innerHTML;
        //     }
        //     if (document.getElementsByClassName('col-middle')[i + 1]) {
        //         details.previous = document.getElementsByClassName('col-middle')[i + 1].innerHTML.split('<br>')[i];
        //     }
        //     if (document.getElementsByClassName('pageRow')[i]) {
        //         details.edu = document.getElementsByClassName('col-middle space-gap_front_2')[i].innerHTML.trim();
        //     }
        // }

        try {
            var tempGenderAddress = document.getElementsByClassName('resume-detail');
            if (tempGenderAddress[tempGenderAddress.length - 1] && tempGenderAddress[tempGenderAddress.length - 1].innerHTML && tempGenderAddress[tempGenderAddress.length - 1].innerHTML.indexOf('icon-user') > -1 && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left').length) {

                for (var i = 0; i < tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left').length; i++) {
                    if (tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left')[i] && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left')[i].innerHTML && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left')[i].innerHTML.indexOf('Gender') > -1) {
                        if (tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i] && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML) {
                            details.gender = removeExtraChars(tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML);
                            if (req.body.isTallint) {
                                if (details.gender.toLowerCase() == 'male') {
                                    details.gender = "M";
                                }
                                else if (details.gender.toLowerCase() == 'female') {
                                    details.gender = "F";
                                }
                            }
                        }
                    }
                    if (tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i] && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left')[i].innerHTML.indexOf('Address') > -1) {
                        details.address = removeExtraChars(tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML);
                    }
                }
            }
        }

        catch (err) {
            console.log(err);
        }

        var uniqueID;
        var lastModifiedDate;
        try {
            var lu_uid_element = document.getElementsByClassName('resume-update')[0];

            if (lu_uid_element && lu_uid_element.getElementsByClassName('right')[0] && lu_uid_element.getElementsByClassName('right')[0].innerHTML) {
                details.lastModifiedDate = dateConverter(removeExtraChars(lu_uid_element.getElementsByClassName('right')[0].innerHTML).split(':')[1].trim());
            }

            if (req.body.xml_string && req.body.xml_string.split('strOpenCaID')[1] && req.body.xml_string.split('strOpenCaID')[1].split(';')[0]) {
                details.uid = req.body.xml_string.split('strOpenCaID = ')[1].split(';')[0].trim().replace(/"/g, '');
            }
        }

        catch (err) {
            console.log(err);
        }


        //console.log("req.body.isTallint", req.body.isTallint);
        //console.log("req.body.isIntranet", req.body.isIntranet);
        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }
        var isTallint = req.body.isTallint;
        // for tallint
        if (isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    var req_file_name = req.body.file_name;
                    var doc_extension;
                    if (req_file_name && req_file_name != '') {
                        doc_extension = req_file_name.split('.');
                        doc_extension = doc_extension[doc_extension.length - 1];
                    }
                    details.resume_extension = '.' + (doc_extension || filetype || 'docx');
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
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

                if (req.body.requirements)
                    details.requirements = [parseInt(req.body.requirements)];

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        //console.log(response);
                        console.log(error);
                    });
                }


                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                //console.log(req.body.isTallint, req.body.isIntranet);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }

        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};

var bestJobsDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var lastModifiedDate = undefined;
        var uniqueID = undefined;

        try {

            if (element.getElementsByTagName('a')) {
                if (element.getElementsByTagName('a')[0] && element.getElementsByTagName('a')[0].id) {
                    uniqueID = element.getElementsByTagName('a')[0].id;
                    if (uniqueID && typeof uniqueID != "string") {
                        uniqueID = uniqueID.toString();
                    }
                }
            }

            var last_modified_element = element.getElementsByClassName('fecha')[0];
            if (last_modified_element && last_modified_element.getElementsByTagName('p')[0]) {
                var tempLastModifiedDate = removeExtraChars(last_modified_element.getElementsByTagName('p')[0].innerHTML.split('Updated ')[1]);
                var today = new Date();
                if (tempLastModifiedDate.indexOf('Today') > -1) {
                    lastModifiedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                }
                else if (tempLastModifiedDate.indexOf('Yesterday') > -1) {
                    today.setDate(today.getDate() - 1);
                    lastModifiedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate());
                }
                else {
                    if (tempLastModifiedDate.split(' ').length == 2) {
                        tempLastModifiedDate = tempLastModifiedDate + ' ' + '2019';
                    }
                    lastModifiedDate = dateConverter(tempLastModifiedDate);
                }
            }
            return { uid: uniqueID, lastModifiedDate: lastModifiedDate, portalId: portalId, index: index }
        }

        catch (err) {
            console.log(err);
        }
    }
}

portalimporter.checkApplicantExistsFromBestJobsPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 14;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        var length1 = 0;
        var length2 = 0;

        if (req.body.is_select_all == 1) {
            //console.log("req.body.is_select_all", req.body.is_select_all);
            for (var i = 0; i < document.getElementsByClassName('cm-12 box box_c cp devclick').length; i++) {
                var element = document.getElementsByClassName('cm-12 box box_c cp devclick')[i];

                let applicant = bestJobsDuplicationParsing(element, i, 14);

                // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                applicants.push(applicant);
            }

            //console.log("applicants", applicants);
        }

        else {
            //console.log("else part");
            for (var i = 0; i < selected_candidates.length; i++) {
                var element = document.getElementsByClassName('cm-12 box box_c cp devclick')[selected_candidates[i]];

                let applicant = bestJobsDuplicationParsing(element, selected_candidates[i], 14);

                applicants.push(applicant);
            }
        }

        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            //console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    //console.log("body", body);
                    console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({});
    }
};

portalimporter.saveApplicantsFromBestJobs = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = 14;   // best jobs
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);

        if (document.getElementById('headerCvDetail') && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0] && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML.split('of')[1]) {
            var tempName = removeExtraChars(document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML.split('of ')[1]);
            if (tempName) {
                var tempArr = tempName.split(' ');

                details.lastName = tempArr.splice(tempArr.length - 1, 1)[0];
                details.firstName = tempArr.join(' ');
            }
        }

        for (var i = 0; i < document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li').length; i++) {
            if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('icon email').length) {
                details.emailId = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].innerHTML.split('</span>')[1]);
            }
            if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('fl fw_n mt3').length) {
                if (!details.mobileNumber) {
                    details.mobileNumber = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('fl fw_n mt3')[0].innerHTML);
                }
            }
            if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('icon pais').length) {
                details.presentLocation = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].innerHTML.split('</span>')[1]);
            }
        }
        for (var i = 0; i < document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li').length; i++) {
            if (document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i].innerHTML.indexOf('Last modification date') > -1) {
                //console.log(document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i].getElementsByTagName('span')[0].innerHTML);
            }
        }

        var uniqueID;
        var lastModifiedDate;
        try {
            if (document.getElementsByClassName('infomodificaciones')[0] && document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li').length) {
                for (var i = 0; i < document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li').length; i++) {
                    if (document.getElementsByClassName('infomodificaciones')[0] && document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i] && document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i].innerHTML && document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i].innerHTML.indexOf('Last modification date') > -1) {
                        var tempLastModifiedDate = removeExtraChars(document.getElementsByClassName('infomodificaciones')[0].getElementsByTagName('li')[i].getElementsByTagName('span')[0].innerHTML);
                        if (tempLastModifiedDate) {
                            tempLastModifiedDate = tempLastModifiedDate.replace(',', '');
                            tempLastModifiedDate = tempLastModifiedDate.split(' ');
                            if (months.indexOf(tempLastModifiedDate[0]) > -1)
                                tempLastModifiedDate[0] = months.indexOf(tempLastModifiedDate[0]) + 1;
                            else if (months_full.indexOf(tempLastModifiedDate[0]) > -1)
                                tempLastModifiedDate[0] = months_full.indexOf(tempLastModifiedDate[0]) + 1;

                            tempLastModifiedDate = convertDateArrToDate(tempLastModifiedDate, 1);
                            details.lastModifiedDate = tempLastModifiedDate;
                        }
                    }
                }
            }


        }

        catch (err) {
            console.log(err);
        }

        var xml_string = req.body.xml_string;
        if (xml_string && xml_string.split("idcv: '")[1] && xml_string.split("idcv: '")[1].split("',")[0]) {
            details.uid = xml_string.split("idcv: '")[1].split("',")[0];
        }

        //console.log("req.body.isTallint", req.body.isTallint);
        //console.log("req.body.isIntranet", req.body.isIntranet);
        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }
        var isTallint = req.body.isTallint;
        // for tallint
        if (isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    if (document.getElementById('cvCandidatePdf')) {
                        if (document.getElementById('cvCandidatePdf').getElementsByClassName('icon doc_hdv')[0]) {
                            filetype = "docx";
                        }
                        else {
                            filetype = "pdf";
                        }
                    }
                    // if (attachment1[0].indexOf('png') > 0 || attachment1[0].indexOf('jpg') > 0) {
                    //     filetype = "png";
                    // }
                    // else if (attachment1[0].indexOf('jpeg') > 0) {
                    //     filetype = "jpeg";
                    // }
                    // else if (attachment1[0].indexOf('jpg') > 0) {
                    //     filetype = "jpg"
                    // }
                    // else if (attachment1[0].indexOf('doc') > 0) {
                    //     filetype = "docx"
                    // }
                    // else if (attachment1[0].indexOf('docx') > 0) {
                    //     filetype = "docx"
                    // }
                    // else if (attachment1[0].indexOf('rtf') > 0) {
                    //     filetype = "rtf"
                    // }
                    // else if (attachment1[0].indexOf('pdf') > 0) {
                    //     filetype = "pdf"
                    // }
                    // else if (attachment1[0].indexOf('application/msword') > -1) {
                    //     filetype = "docx"
                    // }
                    details.resume_extension = '.' + filetype || 'docx';
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
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

                if (req.body.requirements)
                    details.requirements = [parseInt(req.body.requirements)];

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        //console.log(response);
                        console.log(error);
                    });
                }


                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                //console.log(req.body.isTallint, req.body.isIntranet);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }

        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};


var jobSearchDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var lastModifiedDate = undefined;
        var uniqueID = undefined;

        try {
            if (element.FirstName) {
                firstName = element.FirstName;
            }

            if (element.LastName) {
                lastName = element.LastName;
            }

            if (element.Details && element.Details.EmailAddress) {
                emailId = element.Details.EmailAddress;
            }

            if (element.Details && element.Details.MobilePhoneNumber) {
                mobileNumber = element.Details.MobilePhoneNumber;
            }

            if (element.CandidateId) {
                uniqueID = element.CandidateId;
                if (uniqueID && typeof uniqueID != "string") {
                    uniqueID = uniqueID.toString();
                }
            }

            var last_modified_element = element.UpdatedOn;
            if (last_modified_element) {
                var temp_last_modified = new Date(last_modified_element);
                if (temp_last_modified && temp_last_modified.getDate() && temp_last_modified.getMonth() && temp_last_modified.getFullYear()) {
                    lastModifiedDate = temp_last_modified.getFullYear() + '-' + (temp_last_modified.getMonth() + 1) + '-' + temp_last_modified.getDate();
                }
            }
            return { firstName: firstName, lastName: lastName, emailId: emailId, mobileNumber: mobileNumber, uid: uniqueID, lastModifiedDate: lastModifiedDate, portalId: portalId, index: index }
        }

        catch (err) {
            console.log(err);
        }
    }
}


portalimporter.checkApplicantExistsFromJobSearchPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        var portalId = 15;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var candidate_details = JSON.parse(xml_string);
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        if (req.body.is_select_all == 1) {
            //console.log("req.body.is_select_all", req.body.is_select_all);
            for (var i = 0; i < candidate_details.length; i++) {
                var element = candidate_details[i];

                let applicant = jobSearchDuplicationParsing(element, i, 15);

                // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                applicants.push(applicant);
            }

            //console.log("applicants", applicants);
        }

        else {
            //console.log("else part");
            for (var i = 0; i < selected_candidates.length; i++) {
                var element = candidate_details[selected_candidates[i]];

                let applicant = jobSearchDuplicationParsing(element, selected_candidates[i], 15);

                applicants.push(applicant);
            }
        }

        var isTallint = req.body.isTallint || 0;
        var isIntranet = req.body.isIntranet || 0;

        // for tallint
        if (isTallint && !isIntranet) {
            // var token = req.query.token;
            // var heMasterId = req.query.heMasterId;
            var portalId = 2;
            //console.log("tallint api hit");
            if (req.body.tallint_url && req.body.tallint_url.length > 1) {
                request({
                    url: req.body.tallint_url,
                    method: "POST",
                    json: true,
                    body: { applicants: applicants }
                }, function (error, resp, body) {
                    //console.log("body", body);
                    console.log("error", error);
                    if (!error && body) {
                        response.status = true;
                        response.message = "Response from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: body
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error from tallint DB";
                        response.error = null;
                        response.data = {
                            ourjson: applicants,
                            resonseOfTallint: error
                        };
                        res.status(500).json(response);
                    }
                });
            }
            else {
                response.status = false;
                response.message = "Tallint error! Api url not found";
                response.error = null;
                response.data = {
                    ourjson: applicants,
                    resonseOfTallint: error
                };
                res.status(500).json(response);
            }

        }

        else if (isTallint && isIntranet) {
            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);
        }

        else {
            checkPortalApplicants(portalId, applicants, req, res);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({});
    }
};

portalimporter.saveApplicantsFromJobSearch = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        var portalId = 15;   // JobSearch
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document; // = req.body.xml_string || JSON.parse(req.body.xml_string).window.document;

        if (typeof req.body.xml_string == "string") {
            document = JSON.parse(req.body.xml_string);
        }
        else {
            document = req.body.xml_string;
        }

        try {
            if (document.FirstName) {
                details.firstName = document.FirstName;
            }

            if (document.LastName) {
                details.lastName = document.LastName;
            }

            if (document.Details && document.Details.EmailAddress) {
                details.emailId = document.Details.EmailAddress;
            }

            if (document.Details && document.Details.MobilePhoneNumber) {
                details.mobileNumber = document.Details.MobilePhoneNumber;
            }

            if (document.CandidateId) {
                details.uid = document.CandidateId;
            }

            var last_modified_element = document.UpdatedOn;
            if (last_modified_element) {
                var temp_last_modified = new Date(last_modified_element);
                if (temp_last_modified && temp_last_modified.getDate() && temp_last_modified.getMonth() && temp_last_modified.getFullYear()) {
                    details.lastModifiedDate = temp_last_modified.getFullYear() + '-' + (temp_last_modified.getMonth() + 1) + '-' + temp_last_modified.getDate();
                }
            }
        }

        catch (err) {
            console.log(err);
        }

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }
        var isTallint = req.body.isTallint;
        // for tallint
        if (isTallint) {
            delete (details.resumeText);
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    if (document.Resume && document.Resume.FileType) {
                        filetype = document.Resume.FileType;
                    }
                    details.resume_extension = '.' + filetype || 'docx';
                }
            }

            details.portalId = portalId;
            if (!req.body.isIntranet) {
                var token = req.query.token;
                var heMasterId = req.query.heMasterId;
                // var portalId = 2;
                // var formData = {
                //     applicants: applicants
                // };

                if (req.body.requirements)
                    details.requirements = [parseInt(req.body.requirements)];

                if (req.body.isTallint && req.body.tallint_url && req.body.tallint_url.length > 1) {
                    request({
                        headers: {
                            Authorization: 'Bearer ' + req.body.tallintToken
                        },
                        url: req.body.tallint_url,
                        method: "POST",
                        json: true,
                        body: details
                    }, function (error, resp, body) {

                        if (!error && body) {
                            response.status = true;
                            response.message = "Response from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: body,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            if (body.Code != 'ERR0001') {
                                res.status(200).json(response);
                            }
                            else {
                                res.status(500).json(response);
                            }
                        }
                        else {
                            response.status = false;
                            response.message = "Error from tallint DB";
                            response.error = null;
                            response.data = {
                                resonseOfTallint: error,
                                ourjson: {
                                    headers: {
                                        Authorization: 'Bearer ' + req.body.tallintToken
                                    },
                                    url: req.body.tallint_url,
                                    method: "POST",
                                    json: true,
                                    body: details
                                }
                            };
                            res.status(500).json(response);
                        }
                        //console.log(response);
                        console.log(error);
                    });
                }


                else {
                    response.status = false;
                    response.message = "Tallint error! Api url not found";
                    response.error = null;
                    response.data = {
                        resonseOfTallint: error,
                        ourjson: {
                            headers: {
                                Authorization: 'Bearer ' + req.body.tallintToken
                            },
                            url: req.body.tallint_url,
                            method: "POST",
                            json: true,
                            body: details
                        }
                    };
                    res.status(500).json(response);
                }
            }
            else if (req.body.isIntranet) {
                //console.log(req.body.isTallint, req.body.isIntranet);
                response.status = true;
                response.message = "XML Parsed";
                response.error = false;
                response.data = details;
                res.status(200).json(response);
            }
        }

        else {
            savePortalApplicants(portalId, cvSourceId, details, req, res);
        }
    }
    catch (ex) {
        console.log("ex", ex);
        res.status(500).send({ message: "Error occured" });
    }
};



module.exports = portalimporter;
