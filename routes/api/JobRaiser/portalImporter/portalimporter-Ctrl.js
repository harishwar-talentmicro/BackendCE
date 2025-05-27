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

const { URL } = require('url');

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
}, function (err, aclObject) { });

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */

class portalimporterDetails {
    firstName = '';
    lastName = '';
    linkedInProfile = '';
    primarySkills = [];
    employer = '';
    presentLocation = '';
    emailId = '';
    requirements = [];
    mobileNumber = '';
    mobileNumber = '';
    experience = '';
    nationality = '';
    jobTitle = '';
    current_employer = '';
    location = '';
    gender = '';
    address = '';
    lastModifiedDate = '';
    expectedSalary = '';
    age = '';
    work_history = [];
    education = [];
    secondarySkills = [];
    languages = [];
    uid = 0;
    summary = [];
    recommendations = [];
    certifications = [];
}

var uploadDocumentToCloud = function (uniqueName, readStream, callback) {
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function () {
        console.log('done');
        if (callback) {
            if (typeof (callback) == 'function') {
                callback(null);
            } else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        } else {
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function (err) {
        if (callback) {
            if (typeof (callback) == 'function') {
                console.log(err);
                callback(err);
            } else {
                console.log('callback is required for uploadDocumentToCloud');
            }
        } else {
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
    } else {
        return '';
    }
}

var extractText = function (element) {
    try {
        if (element.children) {
            let i = element.children.length - 1;
            while (i >= 0) {
                if (element && element.children[i] && element.children[i].innerHTML) {
                    element.removeChild(element.children[i]);
                }
                i--;
            }
        }
        return element.innerHTML;
    }
    catch (err) {
        console.log(err);
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
    } else {
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
    if (arr && arr[0]) {
        arr[0] = arr[0].replace('st', '');
        arr[0] = arr[0].replace('nd', '');
        arr[0] = arr[0].replace('rd', '');
        arr[0] = arr[0].replace('th', '');
    }
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
    } else {
        return null;
    }
}

var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;

var setFileType = function (mimeType) {
    var filetype = '';
    if (mimeType.indexOf('png') > 0 || mimeType.indexOf('jpg') > 0) {
        filetype = "png";
    } else if (mimeType.indexOf('jpeg') > 0) {
        filetype = "jpeg";
    } else if (mimeType.indexOf('jpg') > 0) {
        filetype = "jpg"
    } else if (mimeType.indexOf('doc') > 0) {
        filetype = "docx"
    } else if (mimeType.indexOf('docx') > 0) {
        filetype = "docx"
    } else if (mimeType.indexOf('rtf') > 0) {
        filetype = "rtf"
    } else if (mimeType.indexOf('pdf') > 0) {
        filetype = "pdf"
    } else if (mimeType.indexOf('application/msword') > -1) {
        filetype = "docx"
    } else if (mimeType.indexOf('officedocument.wordprocessingml.document') > -1) {
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
    } else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(applicants)),
                    req.st.db.escape(portalId),
                    req.st.db.escape(req.body.overwriteResumeOnlyDoc || 0),
                    req.st.db.escape(req.body.overwriteResumeWithDoc || 0)
                ];

                var procQuery = 'CALL wm_checkApplicantsFromPortal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        // response.applicants = applicants;
                        response.message = "Portal applicants verified successfully";
                        response.error = null;
                        if (result[0][0].importerResults && typeof (result[0][0].importerResults) == 'string') {
                            result[0][0].importerResults = JSON.parse(result[0][0].importerResults);
                        }
                        response.data = result[0][0].importerResults ? result[0][0].importerResults : [];
                        res.status(200).json(response.data);
                    } else {
                        response.status = false;
                        response.applicants = applicants;
                        response.message = "Something went wrong! Please try again";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            } else {
                response.applicants = applicants;
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
    try {
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
        } else {
            console.log('asdf3');
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    attachment(req, function (aUrl) {

                        req.body.requirements = req.body.requirements != 'undefined' && req.body.requirements ? req.body.requirements : [];
                        if (details && details.gender == "M") {
                            details.gender = 1;
                        } else if (details && details.gender == "F") {
                            details.gender = 2;
                        } else {
                            details.gender = 3;
                        }
                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(details.applicantId || 0),
                            req.st.db.escape(details.first_name),
                            req.st.db.escape(details.last_name || ""),
                            req.st.db.escape(details.mobile_ISD || ""),
                            req.st.db.escape(details.mobile_number || ""),
                            req.st.db.escape(details.emailId || ""),
                            req.st.db.escape(details.current_employer || ""),
                            req.st.db.escape(details.job_title || ""),
                            req.st.db.escape(details.location || ""),
                            req.st.db.escape(aUrl || ''),
                            req.st.db.escape(Number(details.portal_id || 0)),
                            req.st.db.escape(cvSourceId || 0),

                            req.st.db.escape(details.address || ""),
                            req.st.db.escape(Number(details.experience || 0)),
                            req.st.db.escape(JSON.stringify(details.primary_skills || [])),
                            req.st.db.escape(details.present_salary_curr || ""), // changed from json obj to string
                            req.st.db.escape(details.present_salary_scale || ""), // changed from json obj to string
                            req.st.db.escape(details.present_salary_period || ""), // changed from json obj to string
                            req.st.db.escape(details.present_salary || 0),
                            req.st.db.escape(JSON.stringify(req.body.requirements || [])),
                            req.st.db.escape(details.notice_period || 0),
                            req.st.db.escape(details.gender || 3), // 3 not disclosed
                            req.st.db.escape(details.DOB || null),
                            req.st.db.escape(details.resume_text || ""),
                            req.st.db.escape(details.linkedInProfile || ""),
                            req.st.db.escape(JSON.stringify(details.industry || [])),
                            req.st.db.escape(JSON.stringify(details.pref_locations || [])),
                            req.st.db.escape(details.nationality || ""),
                            req.st.db.escape(JSON.stringify(details.functional_areas || [])),
                            req.st.db.escape(JSON.stringify(details.overwriteResumeOnlyDoc || 0)),
                            req.st.db.escape(JSON.stringify(details.overwriteResumeWithDoc || 0))
                        ];
                        var procQuery = 'CALL wm_save_savePortalApplicants( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);
                            if (!err && result && result[0] && result[0][0]) {
                                response.status = true;
                                if (result[0][0].isNew) {
                                    response.Code = "SUCCESS0001";
                                } else {
                                    response.Code = "FAIL0001"
                                }
                                // response.details = details;
                                console.log(response);
                                response.message = "Portal applicants saved successfully";
                                response.error = null;
                                response.data = (result[0] && result[0][0]) ? result[0][0] : {};
                                res.status(200).json(response);

                            } else {
                                response.status = true;
                                response.Code = "ERR0001";
                                response.details = details;
                                response.message = "Something went wrong! Please try again";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);

                            }
                        });

                    });
                } else {
                    response.details = details;
                    res.status(401).json(response);
                }
            });
        }
    } catch (ex) {
        console.log('exception', ex);
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

    if (req.body.resume_document && req.body.resume_document.length && req.body.resume_extension && req.body.resume_extension.length) {
        var aUrl = '',
            aFilename = '';
        var resume_document = req.body.resume_document;
        var filetype = '';
        filetype = setFileType(req.body.resume_extension);
        var uniqueId = uuid.v4();
        aUrl = uniqueId + '.' + filetype;
        aFilename = 'temp_name';
        var fileName = 'pace' + Date.now();
        let buff = new Buffer(resume_document, 'base64');
        fs.writeFileSync(path.resolve(__dirname, fileName), buff);

        var readStream = fs.createReadStream(path.resolve(__dirname, fileName));

        uploadDocumentToCloud(aUrl, readStream, function (err) {
            if (!err) {
                fs.unlinkSync(path.resolve(__dirname, fileName));
                console.log('FnSaveServiceAttachment: attachment Uploaded successfully', aUrl);
                callback(aUrl);
            } else {
                console.log('Failed to upload file');
                fs.unlinkSync(path.resolve(__dirname, fileName));
                callback("");
            }
        });

    } else {
        console.log('no attachment');
        callback("");
    }
};


var monsterDuplicateParsingV2 = function (element, index, portalId) {
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

    } catch (ex) {
        console.log(ex, "chechMonster first name, last name");
    }

    for (var j = 0; j < skill_loc_element.length; j++) {

        if (skill_loc_element[j].innerHTML.indexOf('Education') > -1) {
            try {
                var edu_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(').length)
                    education = removeExtraChars(edu_string.split(',')[0].split('(')[0]);
                if (edu_string && edu_string.split(',').length && edu_string.split(',')[0].split('(')[1] && edu_string.split(',')[0].split('(')[1].split(')')[0])
                    specialization = removeExtraChars(edu_string.split(',')[0].split('(')[1].split(')')[0]);
            } catch (ex) {
                console.log(ex, "chechMonster specialization");
            }
        } else if (skill_loc_element[j].innerHTML.indexOf('Skills') > -1) {
            try {
                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                    var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);

                    var skills_arr = skills_string.split(',');
                    for (var k = 0; k < skills_arr.length; k++) {
                        skills[k] = removeExtraChars(skills_arr[k]);
                    }
                }
            } catch (ex) {
                console.log(ex, "chechMonster skills");
            }
        } else if (skill_loc_element[j].innerHTML.indexOf('Industry') > -1) {
            try {
                var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                    industry = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                }
            } catch (ex) {
                console.log(ex, "chechMonster industry");
            }

        } else if (skill_loc_element[j].innerHTML.indexOf('Function') > -1) {
            try {
                var skills_string = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                if (skill_loc_desc_element && skill_loc_desc_element[j] && skill_loc_desc_element[j].innerHTML) {
                    functional_area = removeExtraChars(skill_loc_desc_element[j].innerHTML);
                }
            } catch (ex) {
                console.log(ex, "chechMonster functional_area");
            }

        }
    }

    try {
        var current_location = undefined;

        try {
            if (element && element.getElementsByClassName('skinfoitem info_loc') && element.getElementsByClassName('skinfoitem info_loc')[0] && element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML)
                current_location = removeExtraChars(element.getElementsByClassName('skinfoitem info_loc')[0].innerHTML);
        } catch (ex) {
            console.log(ex, "chechMonster current_location");
        }

        try {
            var jobTitle = undefined;
            var job_title_element = element.getElementsByClassName('desig_sftlnk')[0];
            if (job_title_element)
                jobTitle = removeExtraChars(job_title_element.innerHTML);
        } catch (ex) {
            console.log(ex, "chechMonster jobTitle");
        }

        try {
            var nationality = undefined;
            if (element.getElementsByClassName('skinfoitem nationality') && element.getElementsByClassName('skinfoitem nationality')[0])
                nationality = removeExtraChars(element.getElementsByClassName('skinfoitem nationality')[0].innerHTML);
        } catch (ex) {
            console.log(ex, "chechMonster nationality");
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
        } catch (er) {
            console.log(ex, "chechMonster current_employer");
        }

    } catch (ex) {
        console.log(ex, "chechMonster ");
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
            } catch (ex) {
                console.log(ex, "chechMonster experience");
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
                } else if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Resume ID: ') > -1) {
                    uniqueID = removeExtraChars(lu_uid_arr[x].split('Resume ID: ')[1]);
                    if (uniqueID) {
                        uniqueID = (uniqueID);
                    }
                }
            }
        }
    } catch (ex) {
        console.log(ex, "chechMonster uniqueID");
    }

    return { first_name: first_name, last_name: last_name, portal_id: portalId, index: index, education: education, specialization: specialization, primary_skills: skills, current_employer: current_employer, job_title: jobTitle, experience: experience, location: current_location, nationality: nationality, last_modified_date: lastModifiedDate, uid: uniqueID, industry: industry, functional_areas: functional_area };
}

var monsterDuplicateParsingV3 = function (element, index, portalId) {
    var first_name = "";
    var last_name = "";
    var name = '';

    var education = undefined;
    var specialization = undefined;
    var skills = [];
    var industry = undefined;
    var functional_area = undefined;

    var lastModifiedDate = undefined;
    var uniqueID = undefined;
    var jobTitle = undefined;


    var current_location = undefined;
    var experience = undefined;
    var nationality = undefined;


    try {
        uniqueID = removeExtraChars(extractText(element.getElementsByClassName('footer-des footer_id')[0]).split(': ')[1]);
    }
    catch (err) {
        console.log(err);
    }

    //first name and last name
    try {

        try {
            if (element.getElementsByClassName('content_align-title')[0] && element.getElementsByClassName('content_align-title')[0].href) {
                name = extractText(element.getElementsByClassName('content_align-title')[0]);
            }
            else if (element.getElementsByClassName('content_align-title')[0] && element.getElementsByClassName('content_align-title')[0].getElementsByTagName('a')[0]) {
                name = extractText(element.getElementsByClassName('content_align-title')[0].getElementsByTagName('a')[0]);
            }
        }
        catch (err) {
            console.log(err);
        }

        if (name && name.length == 0) {
            return null;
        }

        name = removeExtraChars(name);


        if (name.split(' ')) {
            if (name.split(' ')[0])
                first_name = removeExtraChars(name.split(' ')[0]);
            if (name.split(' ')[name.split(' ').length - 1]) {
                last_name = name.split(' ')[name.split(' ').length - 1];
                last_name = removeExtraChars(last_name.trim());
            }
        }

    } catch (ex) {
        console.log(ex, " Name monster");
    }

    //skills
    try {
        if (uniqueID && element.querySelector('#skills_height_' + uniqueID)) {
            for (let i = 0; i < element.querySelector('#skills_height_' + uniqueID).getElementsByTagName('span').length; i++) {
                skills.push(removeExtraChars(extractText(element.querySelector('#skills_height_' + uniqueID).getElementsByTagName('span')[i])));
            }
        }
    }
    catch (err) {
        console.log(err, " Education monster");
    }

    //function
    try {
        if (uniqueID && extractText(element.querySelector('#function_height_' + uniqueID))) {
            functional_area = removeExtraChars(extractText(element.querySelector('#function_height_' + uniqueID).getElementsByTagName('div')));
        }
    } catch (ex) {
        console.log(ex, " Job title monster");
    }

    //current designation or job title
    try {
        if (uniqueID && extractText(element.querySelector('#desig' + uniqueID))) {
            jobTitle = removeExtraChars(extractText(element.querySelector('#desig' + uniqueID)));
        }
    } catch (ex) {
        console.log(ex, " Job title monster");
    }


    //current location
    try {
        if (uniqueID && extractText(element.querySelector('#currloc' + uniqueID))) {
            current_location = removeExtraChars(extractText(element.querySelector('#currloc' + uniqueID)));
        }
    } catch (err) {
        console.log(err, " Location monster");
    }

    //current employer
    try {
        if (uniqueID && element.querySelector('#desig' + uniqueID) && element.querySelector('#desig' + uniqueID).nextSibling && element.querySelector('#desig' + uniqueID).nextSibling.getAttribute('id') != 'currloc' + uniqueID) {
            current_employer = removeExtraChars(extractText(element.querySelector('#desig' + uniqueID).nextSibling));
        }
    } catch (err) {
        console.log(err, " Employer monster");
    }

    //experience
    try {
        for (let i = 0; i < element.getElementsByClassName('profile_small_card_subtitle').length; i++) {
            if (removeExtraChars(extractText(element.getElementsByClassName('profile_small_card_subtitle')[i]).toLowerCase().indexOf('total') > -1) && removeExtraChars(extractText(element.getElementsByClassName('profile_small_card_subtitle')[i]).toLowerCase().indexOf('exp.') > -1)) {
                var exp_string = extractText(element.getElementsByClassName('profile_small_card_subtitle')[i].nextSibling).toLowerCase();
                var temp_exp = 0;
                var temp_exp_year;
                var temp_exp_month;
                if (exp_string.toLowerCase().indexOf(' yr') > -1) {
                    temp_exp_year = removeExtraChars(exp_string.toLowerCase().split(/yr[s]*/)[0]);
                    if (temp_exp_year && parseInt(temp_exp_year)) {
                        temp_exp += parseInt(temp_exp_year);
                    }
                }
                exp_string = removeExtraChars(exp_string.toLowerCase().replace(/[0-9]* yr[s]*[,]*/, ''));
                if (exp_string.indexOf(' mos.') > -1) {
                    if (exp_string.split('mos.')[0]) {
                        temp_exp_month = removeExtraChars(exp_string.split('mos.')[0]);
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
    }
    catch (err) {
        console.log(err, ' Experience monster');
    }

    //education
    try {
        var temp_education_str = removeExtraChars(extractText(element.getElementsByClassName('education_height')[0]));
        if (temp_education_str.toLowerCase().indexOf(' at ') > -1) {
            temp_education_str = temp_education_str.split(' at ')[0];
        }
        else {
            temp_education_str = temp_education_str.split(' in ')[0];
        }
        if (temp_education_str.toLowerCase().indexOf(')(') > -1) {
            education = removeExtraChars(temp_education_str.split(')(')[0]);
            specialization = removeExtraChars(temp_education_str.split(')(')[1].replace(')', ''));
        }
        else {
            education = removeExtraChars(temp_education_str.split('(')[0]);
            if (temp_education_str.split('(')[1])
                specialization = removeExtraChars(temp_education_str.split('(')[1].replace(')', ''));
        }
    }
    catch (err) {
        console.log(err, ' Education monster');
    }


    try {
        if (element.getElementsByClassName('flag-span') && element.getElementsByClassName('flag-span')[0])
            nationality = removeExtraChars(element.getElementsByClassName('flag-span')[0].getAttribute('data-original-title'));
    } catch (ex) {
        console.log(ex, " Nationality monster");
    }


    //lu date time
    try {
        var lu_uid_element = element.getElementsByClassName('time_footer')[0].getElementsByClassName('footer-des')[0].innerHTML;
        if (lu_uid_element && lu_uid_element.indexOf('Updated:') > -1) {
            lastModifiedDate = dateConverter(lu_uid_element.split('Updated:')[1]);
        }
    } catch (ex) {
        console.log(ex, "chechMonster uniqueID");
    }

    return { first_name: first_name, last_name: last_name, portal_id: portalId, index: index, education: education, specialization: specialization, primary_skills: skills, current_employer: current_employer, job_title: jobTitle, experience: experience, location: current_location, nationality: nationality, last_modified_date: lastModifiedDate, uid: uniqueID, industry: industry, functional_areas: functional_area };
};

var monsterResumeParsingV2 = function (document, details) {
    try {
        var tempName = document.getElementsByClassName('skname');
        if (tempName && tempName[0] && tempName[0].innerHTML) {
            var fullName = document.getElementsByClassName('skname')[0].innerHTML.trim();
            fullName = removeExtraChars(fullName);
            if (fullName && fullName.split(' ') && fullName.split(' ')[0])
                details.first_name = removeExtraChars(fullName.split(' ')[0]);
            if (fullName && fullName.split(' ') && fullName.split(' ')[fullName.split(' ').length - 1] && fullName.split(' ').length > 1) {
                details.last_name = fullName.split(' ')[fullName.split(' ').length - 1]
                details.last_name = removeExtraChars(details.last_name.trim());
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
                var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/; // include /s in the end
                console.log(emailid);

                if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
                    details.emailId = removeExtraChars(regularExp.exec(emailid)[0].trim());

            } catch (ex) {
                console.log(ex, "saveMonster emailId");
            }

            try {
                if (tempDetails[0].innerHTML.indexOf(' at ') > -1) {
                    try {
                        var tempDesignation = tempDetails[0].innerHTML.split(' at ');
                        if (tempDesignation && tempDesignation[0]) {
                            details.job_title = removeExtraChars(tempDesignation[0].trim());
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster job_title");
                    }

                    try {
                        if (tempDesignation && tempDesignation[1] && tempDesignation[1].split('<br>') && tempDesignation[1].split('<br>').length) {
                            details.current_employer = removeExtraChars(tempDesignation[1].split('<br>')[0].trim());
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster current_employer");
                    }
                }
            } catch (ex) {
                console.log(ex, "saveMonster job_title, current_employer");
            }
        }

        try {
            var tempMobile = document.getElementsByClassName('skinfoitem smobile');
            if (tempMobile && tempMobile[0] && tempMobile[0].innerHTML) {
                var mobilenumber = tempMobile[0].innerHTML;
                var regularExp = /(\d{7,15})/;

                if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                    details.mobile_number = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
            }
        } catch (ex) {
            console.log(ex, "saveMonster mobile_number");
        }

        try {
            var tempLocation = document.getElementsByClassName('skinfoitem info_loc');
            if (tempLocation && tempLocation[0] && tempLocation[0].innerHTML) {
                var location = tempLocation[0].innerHTML;
                details.location = removeExtraChars(location.trim());
            }
        } catch (ex) {
            console.log(ex, "saveMonster location");
        }

        // var isTallint = req.body.isTallint || 0;
        details.resume_text = removeUnicodeChars(req.body.resume_text || "");
    } catch (ex) {
        console.log(ex, "saveMonster resume_text");
    }

    try {
        var arrWSI = [];
        if (document.getElementsByClassName('scndinfo mrgn hg_mtch')) {
            arrWSI = document.getElementsByClassName('scndinfo mrgn hg_mtch');
            try {
                for (i = 0; i < arrWSI.length; i++) {
                    if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Work Experience') > -1) {
                        try {
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
                                } else if (years > 0) {
                                    details.experience = parseInt(years);
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "saveMonster details.experience");
                        }
                    }
                    //Skills
                    else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Skills') > -1) {
                        try {
                            if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                                var skills = arrWSI[i].innerHTML.split('>:')[1].trim();
                                if (skills) {
                                    details.primary_skills = skills;
                                    if (details.primary_skills && details.primary_skills.split(',').length) {
                                        details.primary_skills = details.primary_skills.split(',');
                                        var spliceIndexes = [];
                                        for (var skill = 0; skill < details.primary_skills.length; skill++) {
                                            if (removeExtraChars(details.primary_skills[skill].trim()) != '')
                                                details.primary_skills[skill] = removeExtraChars(details.primary_skills[skill].trim());
                                            else
                                                spliceIndexes.push(skill);
                                        }
                                        for (var ind = 0; ind < spliceIndexes.length; ind++) {
                                            details.primary_skills.splice(spliceIndexes[ind], 1);
                                        }
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "saveMonster details.primary_skills");
                        }
                    }

                    //industry
                    else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Industry') > -1) {
                        try {
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
                        } catch (ex) {
                            console.log(ex, "saveMonster details.industry");
                        }
                    }

                    //preferred location
                    else if (arrWSI[i].innerHTML && arrWSI[i].innerHTML.indexOf('Preferred Job Location') > -1) {
                        try {
                            if (arrWSI[i].innerHTML.split('>:') && arrWSI[i].innerHTML.split('>:')[1] && arrWSI[i].innerHTML.split('>:')[1].trim()) {
                                var locations = arrWSI[i].innerHTML.split('>:')[1].trim();
                                if (locations && locations != 'Not Specified')
                                    details.pref_locations = locations;
                                if (details.pref_locations && details.pref_locations.split(',').length) {
                                    details.pref_locations = details.pref_locations.split(',');
                                    var spliceIndexes = [];
                                    for (var a = 0; a < details.pref_locations.length; a++) {
                                        if (removeExtraChars(details.pref_locations[a].trim()) != '')
                                            details.pref_locations[a] = removeExtraChars(details.pref_locations[a].trim()).trim();
                                        else
                                            spliceIndexes.push(a);
                                    }
                                    for (var ind = 0; ind < spliceIndexes.length; ind++) {
                                        details.pref_locations.splice(spliceIndexes[ind], 1);
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "saveMonster details.pref_locations");
                        }
                    }
                }
            } catch (ex) {
                console.log(ex, "saveMonster for");
            }
        }
    } catch (ex) {
        console.log(ex, "saveMonster");
    }

    // dob nationality gender
    try {
        var arrGN = [];
        if (document.getElementsByClassName('skr_basicinfo_other left') && document.getElementsByClassName('skr_basicinfo_other left')[0] && document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML && document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML.split('<br>')) {
            arrGN = document.getElementsByClassName('skr_basicinfo_other left')[0].innerHTML.split('<br>');
            for (i = 0; i < arrGN.length; i++) {
                if (arrGN[i].indexOf('Date of Birth') > -1) {
                    try {
                        if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                            var DOB = new Date(arrGN[i].split(':')[1].trim());
                            details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                            if (details.DOB == 'NaN-NaN-NaN') {
                                details.DOB = undefined;
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster details.DOB");
                    }
                } else if (arrGN[i].indexOf('Gender') > -1) {
                    try {
                        if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim()) {
                            if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'female') {
                                // if (isTallint)
                                details.gender = 'F';
                                // else
                                //     details.gender = 2;
                            } else if (removeExtraChars(arrGN[i].split(':')[1].trim()).toLowerCase() == 'male') {
                                // if (isTallint)
                                details.gender = 'M';
                                // else
                                //     details.gender = 1;
                            } else {
                                // if (isTallint)
                                details.gender = '';
                                // else
                                //     details.gender = 3;
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster details.gender");
                    }
                } else if (arrGN[i].indexOf('Nationality') > -1) {
                    try {
                        if (arrGN[i].split(':') && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim() && arrGN[i].split(':')[1] && arrGN[i].split(':')[1].trim() != '') {
                            details.nationality = removeExtraChars(arrGN[i].split(':')[1].trim());
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster details.nationality");
                    }
                }
            }
        }
    } catch (ex) {
        console.log(ex, "saveMonster");
    }
    try {
        var work_histories = [];
        var workHistoryElement = document.getElementsByClassName('skrworktbl');
        if (workHistoryElement && workHistoryElement[0] && workHistoryElement[0].getElementsByClassName('skrworkrow') && workHistoryElement[0].getElementsByClassName('skrworkrow').length) {
            var tempElement = workHistoryElement[0].getElementsByClassName('skrworkrow');
            for (var i = 1; i < tempElement.length; i++) {
                if (tempElement && tempElement[i] && tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0] && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML.indexOf('Current') == -1) {
                    try {
                        var work_history = {};
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML) {
                            work_history.employer = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML);
                            if (work_history.employer && work_history.employer.indexOf('(Current)') > -1) {
                                work_history.employer = work_history.employer.replace('(Current)', '');
                                work_history.employer = work_history.employer.trim();
                            }
                        }

                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML)
                            work_history.job_title = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML);
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
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        work_histories.push(work_history);
                    } catch (ex) {
                        console.log(ex, "saveMonster work_history");
                    }
                } else {
                    try {
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML) {
                            details.current_employer = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[0].innerHTML);
                            if (details.current_employer && details.current_employer.indexOf('(Current)') > -1) {
                                details.current_employer = details.current_employer.replace('(Current)', '');
                                details.current_employer = details.current_employer.trim();
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "saveMonster details.current_employer");
                    }

                    try {
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML)
                            details.job_title = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[1].innerHTML);
                        details.current_job_details = {};


                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0])
                            details.current_job_details.from = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[0]);


                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>') && tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1])
                            details.current_job_details.to = removeExtraChars(tempElement[i].getElementsByClassName('skrworkcell')[2].innerHTML.split('<strong>to</strong>')[1]);
                    } catch (ex) {
                        console.log(ex, "saveMonster details.current_job_details");
                    }

                    try {
                        if (tempElement[i].getElementsByClassName('skrworkcell') && tempElement[i].getElementsByClassName('skrworkcell')[3].innerHTML) {
                            var salary = removeExtraChars(document.getElementsByClassName('skrworktbl')[0].getElementsByClassName('skrworkrow')[i].getElementsByClassName('skrworkcell')[3].innerHTML);

                            salary = salary.trim();
                            salary = salary.split(' ');
                            if (salary && salary[0] && salary[0] > 0)
                                details.present_salary = salary[0];
                            if (salary && salary[1])
                                details.present_salary_scale = salary[1];
                            if (salary && salary[2])
                                details.present_salary_period = salary[2];
                            if (1)
                                details.present_salary_curr = '';
                        }
                    }
                    catch (ex) {
                        console.log(ex, "saveMonster salary");
                    }
                }
            }
        }
        details.work_history = work_histories;
    } catch (err) {
        console.log(err);
    }


    try {
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
    } catch (ex) {
        console.log(ex, "saveMonster  details.skill_experience");
    }

    try {
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
    } catch (ex) {
        console.log(ex, "saveMonster  details.education");
    }

    try {
        var notice_period;
        var notice_element = document.getElementsByClassName('matchd_wrap');

        if (notice_element && notice_element[0] && notice_element[0].innerHTML && notice_element[0].innerHTML.indexOf('Notice Period') > -1) {
            if (notice_element[0].innerHTML.split(': ') && notice_element[0].innerHTML.split(': ')[1] && notice_element[0].innerHTML.split(': ')[1].split('</div>') && notice_element[0].innerHTML.split(': ')[1].split('</div>')[0]) {
                var temp_notice_period = removeExtraChars(notice_element[0].innerHTML.split(': ')[1].split('</div>')[0]);
                if (temp_notice_period == 'Immediately') {
                    notice_period = 15;
                } else if (temp_notice_period.indexOf('Days') > -1) {
                    notice_period = temp_notice_period.split('Days')[0] * 1;
                } else if (temp_notice_period.indexOf('Month') > -1) {
                    notice_period = temp_notice_period.split('Month')[0] * 30;
                } else if (temp_notice_period.indexOf('Months') > -1) {
                    notice_period = temp_notice_period.split('Months')[0] * 30;
                }
            }
        }

        details.notice_period = notice_period;
    } catch (ex) {
        console.log(ex, "saveMonster  details.notice_period");
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
                } else if (lu_uid_arr[x] && lu_uid_arr[x].indexOf('Resume ID: ') > -1) {
                    uniqueID = removeExtraChars(lu_uid_arr[x].split('Resume ID: ')[1]);
                    if (uniqueID) {
                        uniqueID = (uniqueID);
                    }
                }
            }
        }
        if (lastModifiedDate) {
            details.last_modified_date = lastModifiedDate;
        }

        if (uniqueID) {
            details.uid = uniqueID;
        }
    } catch (err) {
        console.log(ex, "saveMonster  details.last_modified_date  details.uid");
    }
    return details;
};

var monsterResumeParsingV3 = function (document, details, portalId) {
    try {
        //first name and last name
        try {
            var tempName = document.getElementsByClassName('candidate-name');
            if (tempName && tempName[0] && tempName[0].innerHTML) {
                var fullName = extractText(document.getElementsByClassName('candidate-name')[0]).trim();
                fullName = removeExtraChars(fullName);
                if (fullName && fullName.split(' ') && fullName.split(' ')[0])
                    details.first_name = removeExtraChars(fullName.split(' ')[0]);
                if (fullName && fullName.split(' ') && fullName.split(' ')[fullName.split(' ').length - 1] && fullName.split(' ').length > 1) {
                    details.last_name = fullName.split(' ')[fullName.split(' ').length - 1]
                    details.last_name = removeExtraChars(details.last_name.trim());
                }
            }
        }
        catch (err) {
            console.log(err, ' Name monster');
        }

        //email id
        try {
            var emailid = document.getElementsByClassName('email_selection')[0].innerHTML.trim();
            var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/; // include /s in the end
            console.log(emailid);

            if (regularExp.exec(emailid) && regularExp.exec(emailid)[0])
                details.emailId = removeExtraChars(regularExp.exec(emailid)[0].trim());

        } catch (ex) {
            console.log(ex, "saveMonster emailId");
        }

        //mobile number
        try {
            var tempMobile = document.querySelector('#contact_details_num_2');
            if (tempMobile && tempMobile.innerHTML) {
                var mobilenumber = tempMobile.innerHTML;
                var regularExp = /(\d{7,15})/;

                if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                    details.mobile_number = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());

                if (mobilenumber.split(' ') && mobilenumber.split(' ')[0])
                    details.country_code = mobilenumber.split(' ')[0];
            }
        } catch (ex) {
            console.log(ex, "saveMonster mobile_number");
        }

        //designation
        try {
            var tempDesignation = document.getElementsByClassName('candidate-designation')[0].innerHTML;
            if (tempDesignation) {
                details.job_title = removeExtraChars(tempDesignation);
            }
        } catch (ex) {
            console.log(ex, "saveMonster job_title");
        }

        //experience
        try {
            for (let i = 0; i < document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle').length; i++) {
                if (document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].innerHTML.toLowerCase().indexOf('total') > -1) {
                    var exp_string = removeExtraChars(extractText(document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].nextSibling.nextSibling).toLowerCase());
                    var temp_exp = 0;
                    var temp_exp_year;
                    var temp_exp_month;
                    if (exp_string.toLowerCase().indexOf(' yr') > -1) {
                        temp_exp_year = removeExtraChars(exp_string.toLowerCase().split(/yr[s]*/)[0]);
                        if (temp_exp_year && parseInt(temp_exp_year)) {
                            temp_exp += parseInt(temp_exp_year);
                        }
                    }
                    exp_string = removeExtraChars(exp_string.toLowerCase().replace(/[0-9]* yr[s]*[,]*/, ''));
                    if (exp_string.indexOf(' mos.') > -1) {
                        if (exp_string.split('mos.')[0]) {
                            temp_exp_month = removeExtraChars(exp_string.split('mos.')[0]);
                            if (temp_exp_month && parseInt(temp_exp_month)) {
                                temp_exp = temp_exp + parseFloat((temp_exp_month / 12).toFixed(1));
                            }
                        }
                    }

                    if (temp_exp > 0) {
                        details.experience = temp_exp;
                    }
                }
            }
        }
        catch (err) {
            console.log(err, ' experience monster');
        }

        //salary
        try {
            for (let i = 0; i < document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle').length; i++) {
                if (document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].innerHTML.toLowerCase().indexOf('monthly') > -1) {
                    var salary_string = removeExtraChars(extractText(document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].nextSibling.nextSibling).toLowerCase());
                    if (salary_string > 0) {
                        details.present_salary = salary_string;
                        details.present_salary.replace(/\,/g, '');
                        details.present_salary.replace(/\./g, '');
                        if (details.present_salary.indexOf(' L') > -1) {
                            details.present_salary.replace(' L', '');
                            details.present_salary *= 100000;
                        }
                    }
                    try {
                        details.present_salary_curr = removeExtraChars(document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].innerHTML.toLowerCase().split(' / ')[0]);

                        if (removeExtraChars(document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].innerHTML.toLowerCase().split(' / ')[1]).toLowerCase() == 'monthly')
                            details.present_salary_period = 'per month';

                    }
                    catch (err) {
                        console.log(err, ' currency monster');
                    }
                }
            }
        }
        catch (err) {
            console.log(err, ' ctc monster');
        }

        //notice period
        try {
            for (let i = 0; i < document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle').length; i++) {
                if (document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].innerHTML.toLowerCase().indexOf('notice') > -1) {
                    details.notice_period = removeExtraChars(extractText(document.getElementsByClassName('profile-main-details')[0].getElementsByClassName('profile_subtitle')[i].nextSibling.nextSibling).toLowerCase());
                    details.notice_period.replace('days', '');
                }
            }
        }
        catch (err) {
            console.log(err, ' notice period monster');
        }

        //work history
        try {
            var work_histories = [];
            var workHistoryElement = document.getElementsByClassName('experience-data-details');
            if (workHistoryElement && workHistoryElement.length) {
                for (var i = 0; i < workHistoryElement.length; i++) {
                    if (!(workHistoryElement[i].getElementsByClassName('experience-data-present') && workHistoryElement[i].getElementsByClassName('experience-data-present').length)) {
                        try {
                            var work_history = {};
                            if (workHistoryElement[i].getElementsByClassName('experience-data-company') && workHistoryElement[i].getElementsByClassName('experience-data-company')[0] && workHistoryElement[i].getElementsByClassName('experience-data-company')[0].innerHTML) {
                                work_history.employer = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-company')[0].innerHTML);
                            }

                            if (workHistoryElement[i].getElementsByClassName('experience-data-designation') && workHistoryElement[i].getElementsByClassName('experience-data-designation')[0].innerHTML) {
                                work_history.job_title = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-designation')[0].innerHTML);
                            }

                            work_history.duration = {};
                            if (workHistoryElement[i].getElementsByClassName('experience-data-year') && workHistoryElement[i].getElementsByClassName('experience-data-year')[0].innerHTML) {
                                work_history.duration.from = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-year')[0].innerHTML).split(' - ')[0];
                                work_history.duration.to = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-year')[0].innerHTML).split(' - ')[1];
                            }


                            if (workHistoryElement[i].getElementsByClassName('experience-data-salary') && workHistoryElement[i].getElementsByClassName('experience-data-salary')[0].innerHTML) {
                                try {
                                    work_history.salary = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-salary')[0].innerHTML);

                                    work_history.salary.replace(/\,/g, '');
                                    work_history.salary.replace(/\./g, '');

                                    if (work_history.salary.indexOf(' L') > -1) {
                                        work_history.salary.replace(' L', '');
                                        work_history.salary *= 100000;
                                    }

                                    try {
                                        work_history.salary_curr = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-salary-details')[0].split(' / ')[0]);
                                    }
                                    catch (err) {
                                        console.log(err, 'currency monster');
                                    }

                                    try {
                                        if (removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-salary-details')[0].split(' / ')[1]).toLowerCase() == 'monthly')
                                            work_history.salary_period = 'per month';
                                    }
                                    catch (err) {
                                        console.log(err, ' monthly monster');
                                    }
                                } catch (err) {
                                    console.log(err, ' work history salary monster');
                                }
                            }
                            work_histories.push(work_history);
                        } catch (ex) {
                            console.log(ex, "saveMonster work_history");
                        }
                    } else {
                        try {
                            console.log(workHistoryElement[i].getElementsByClassName('experience-data-company'));
                            if (workHistoryElement[i].getElementsByClassName('experience-data-company') && workHistoryElement[i].getElementsByClassName('experience-data-company')[0].innerHTML) {
                                details.current_employer = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-company')[0].innerHTML);
                            }
                        } catch (ex) {
                            console.log(ex, "saveMonster details.current_employer");
                        }

                        try {
                            if (workHistoryElement[i].getElementsByClassName('experience-data-designation') && workHistoryElement[i].getElementsByClassName('experience-data-designation')[0].innerHTML)
                                details.job_title = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-designation')[0].innerHTML);
                            details.current_job_details = {};


                            if (workHistoryElement[i].getElementsByClassName('experience-data-year') && workHistoryElement[i].getElementsByClassName('experience-data-year')[0].innerHTML)
                                details.current_job_details.from = removeExtraChars(workHistoryElement[i].getElementsByClassName('experience-data-year')[0].innerHTML).split(' - ')[0];

                        } catch (ex) {
                            console.log(ex, "saveMonster details.current_job_details");
                        }
                    }
                }
            }
            details.work_history = work_histories;
        } catch (err) {
            console.log(err);
        }

        try {
            details.uid = removeExtraChars(document.getElementsByClassName('header-profile-id')[0].innerHTML.split(': ')[1]);
        }
        catch (err) {
            console.log(err, ' uid monster');
        }

        try {
            details.last_modified_date = dateConverter(extractText(document.getElementsByClassName('updated_on')[0]));
        }
        catch (err) {
            console.log(err, ' last modified monster');
        }
    }
    catch (err) {
        console.log(err, ' Monster save');
        return {};
    }
    return details;
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
        try {
            if (req.body.is_select_all == 1) {
                try {
                    console.log("req.body.is_select_all", req.body.is_select_all);
                    if (document.getElementsByClassName('single_profile_card'))
                        for (var i = 0; i < document.getElementsByClassName('single_profile_card').length; i++) {
                            var element = document.getElementsByClassName('single_profile_card')[i];
                            var applicant;
                            if (req.body.portal_version == 3)
                                applicant = monsterDuplicateParsingV3(element, i, portalId);
                            else
                                applicant = monsterDuplicateParsingV2(element, i, portalId);
                            applicants.push(applicant);
                        }
                    console.log("applicants", applicants);
                } catch (ex) {
                    console.log(ex, "chechMonster if part");
                }
            } else {
                console.log("else part");
                try {
                    if (document.getElementsByClassName('single_profile_card'))
                        for (var i = 0; i < selected_candidates.length; i++) {
                            var element = document.getElementsByClassName('single_profile_card')[selected_candidates[i]];
                            var applicant;
                            if (req.body.portal_version == 3)
                                applicant = monsterDuplicateParsingV3(element, selected_candidates[i], portalId);
                            else
                                applicant = monsterDuplicateParsingV2(element, selected_candidates[i], portalId);

                            applicants.push(applicant);
                        }
                } catch (ex) {
                    console.log(ex, "chechMonster else part");
                }
            }
        } catch (err) {
            console.log(err, "checkApplicantExistsMonsterPortal")
        }

        response.status = true;
        response.message = "Parsed Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);

    } catch (ex) {
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

        // var portalId = req.body.portalId || 2; // monster
        var portalId = req.body.portalId;
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        if (req.body.portal_version == 3)
            details = monsterResumeParsingV3(document, details, portalId);
        else
            details = monsterResumeParsingV2(document, details, portalId);

        console.log("req.body.isTallint", req.body.isTallint);
        console.log("req.body.isIntranet", req.body.isIntranet);
        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }

        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }


        // for tallint

        try {
            if (req.body.attachment) {
                var attachment1 = req.body.attachment.split(',');
                if (attachment1.length && attachment1[0] && attachment1[1]) {
                    details.resume_document = attachment1[1];
                    var filetype = '';
                    filetype = setFileType(attachment1[0]);
                    details.resume_extension = '.' + filetype;
                    details.resume_size = req.body.resume_size;
                    details.resume_type = req.body.resume_type;
                }
            }
        }
        catch (err) {
            console.log(err, ' document monster');
        }

        details.portal_id = portalId;

        console.log(req.body.isTallint, req.body.isIntranet);
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }
};


// New
portalimporter.checkApplicantExistsFromTimesJobsPortalNew = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var exception = {}
    var validationFlag = true;
    var portalId = 3; // timesjob portal


    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;
    try {

        var document = new JSDOM(xml_string).window.document;

        var selected_candidates = req.body.selected_candidates;
        var is_select_all = req.body.is_select_all;
        var search_results = document.getElementsByClassName('search-result-block search-result');
        var applicants = [];

        document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML

        //console.log('search_results', search_results.length)
        if (is_select_all == 1) {

            if (search_results)
                for (var i = 1; i < search_results.length; i++) {
                    var timesJobs = {};

                    if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML) {
                        try {
                            //console.log('name', name);
                            var name = search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('span')[1].getElementsByTagName('li')[0].innerHTML.trim();
                            var first_name = "";
                            var last_name = "";

                            if (name && name.split(' ')) {
                                try {
                                    if (name.split(' ')[0])
                                        timesJobs.first_name = removeExtraChars(name.split(' ')[0]);
                                    if (name.split(' ')[1]) {
                                        last_name = name.split(' ').splice(1).join(' ');
                                        timesJobs.last_name = removeExtraChars(last_name.trim());
                                    }
                                } catch (ex) {
                                    console.log("timesJobs.first_name  timesJobs.last_name", ex);
                                    exception.fname = ex
                                }
                            }

                        } catch (ex) {
                            console.log("name", ex);
                            exception.name = ex
                        }

                        if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                            try {
                                var dateStr = removeExtraChars(document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim());
                                timesJobs.lastModifiedDate = dateConverter(dateStr);

                            } catch (ex) {
                                console.log("timesJobs.lastModifiedDate", ex);
                            }
                        }
                        // applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: i, lastModifiedDate: lastModifiedDate });
                    }


                    // -------------------experience--------

                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].innerHTML) {

                            timesJobs.experience = removeExtraChars(search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].innerHTML.trim());
                        }
                    } catch (ex) {
                        console.log("timesJobs.experience", ex);
                        exception.experience = ex
                    }
                    // ----------------salary----------
                    try {

                        if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].innerHTML) {

                            timesJobs.salary = removeExtraChars(search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].innerHTML.trim());
                        }
                    } catch (ex) {
                        console.log("timesJobs.salary", ex);
                        exception.salary = ex;
                    }
                    // ----------------place----------
                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('candidate-profile lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3] && search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3].innerHTML) {

                            timesJobs.place = removeExtraChars(search_results[i].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3].innerHTML.trim());
                        }
                    } catch (ex) {
                        console.log("timesJobs.place", ex);
                        exception.place = ex;
                    }
                    // ----------------primary skills----------

                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('srp-key-skills') && search_results[i].getElementsByClassName('srp-key-skills')[0] && search_results[i].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt') && search_results[i].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt').length) {

                            timesJobs.primarySkills = [];

                            for (var j = 0; j < search_results[i].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt').length; j++) {
                                if (search_results[i].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt')[j].innerHTML) {
                                    timesJobs.primarySkills.push(removeExtraChars(search_results[i].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt')[j].innerHTML.trim()));
                                }
                            }
                        }
                    } catch (ex) {
                        console.log("timesJobs.primarySkills", ex);
                        exception.primarySkills = ex;
                    }

                    // ----------------Job Title----------
                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('srp-key lft') && search_results[i].getElementsByClassName('srp-key lft')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray')[0]) {
                            timesJobs.jobTitle = removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray')[0].innerHTML.trim());
                        }
                    } catch (ex) {
                        console.log("timesJobs.jobTitle", ex);
                        exception.jobTitle = ex;
                    }
                    // imployement History
                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('srp-key lft') && search_results[i].getElementsByClassName('srp-key lft')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p').length) {

                            timesJobs.work_history = [];
                            for (var k = 0; k < search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p').length; k++) {

                                if (search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k]) {

                                    var tempEmpHis = {}
                                    if (search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML) {
                                        tempEmpHis.employer = removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML.trim());
                                    }
                                    if (search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('gray')[0].innerHTML) {
                                        tempEmpHis.job_title = removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('gray')[0].innerHTML.replace(removeTagsRegex, '').trim());
                                    }

                                    timesJobs.work_history.push(tempEmpHis);
                                }
                            }
                        }
                    } catch (err) {
                        console.log("timesJobs.work_history", err);
                        exception.jobTitle = err;
                    }

                    // education History
                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('srp-key lft') && search_results[i].getElementsByClassName('srp-key lft')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p').length) {

                            timesJobs.educationHistory = [];
                            for (var k = 0; k < search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p').length; k++) {

                                if (search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML) {
                                    timesJobs.educationHistory.push({
                                        UniversityName: removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML.trim()),

                                        qualification: removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('gray')[0].innerHTML.trim())

                                    })
                                }
                            }
                        }
                    } catch (err) {
                        console.log("timesJobs.educationHistory", err);
                        exception.educationHistory = err;
                    }
                    // ---keystrength---
                    try {
                        if (search_results[i] && search_results[i].getElementsByClassName('srp-key lft') && search_results[i].getElementsByClassName('srp-key lft')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray') && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray').length) {


                            timesJobs.keystrength = []
                            for (var k = 0; k < search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray').length; k++) {
                                timesJobs.keystrength.push(removeExtraChars(search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray')[k].innerHTML.trim()));
                            }
                        }
                    } catch (err) {
                        console.log("timesJobs.keystrength", err);
                        exception.keystrength = err;
                    }

                    try {
                        if (search_results && search_results[i] && search_results[i].getElementsByClassName('chk-bx check-hgt chk') && search_results[i].getElementsByClassName('chk-bx check-hgt chk')[0] && search_results[i].getElementsByClassName('chk-bx check-hgt chk')[0].getElementsByTagName('input')[0]) {
                            timesJobs.uniqueID = removeExtraChars(search_results[i].getElementsByClassName('chk-bx check-hgt chk')[0].getElementsByTagName('input')[0].getAttribute('name').replace('chk', ''));
                        }
                    } catch (err) {
                        console.log("timesJobs.uniqueID", err);
                        exception.uniqueID = ex;
                    }

                    applicants.push({ portal_id: 3, index: i, first_name: timesJobs.first_name, last_name: last_name, experience: timesJobs.experience, last_modified_date: timesJobs.lastModifiedDate, salary: timesJobs.salary, location: timesJobs.place, primary_skills: timesJobs.primarySkills, job_title: timesJobs.jobTitle, work_history: timesJobs.work_history, education: timesJobs.educationHistory, keystrength: timesJobs.keystrength, uid: timesJobs.uniqueID });
                }

            console.log('applicants', applicants);
        } else {
            // console.log(document.getElementsByClassName('userChk')[0].checked);
            if (search_results) {

                for (var i = 0; i < selected_candidates.length; i++) {
                    var timesJobs = {};
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
                                            timesJobs.first_name = removeExtraChars(name.split(' ')[0]);
                                        if (name.split(' ')[1]) {
                                            try {
                                                last_name = name.split(' ').splice(1).join(' ');
                                                timesJobs.last_name = removeExtraChars(last_name.trim());
                                            } catch (ex) {
                                                console.log("timesJobs.first_name timesJobs.last_name", ex);
                                            }
                                        }
                                    }
                                } catch (ex) {
                                    console.log("name", ex);
                                    exception.name = ex;
                                }
                            }
                            try {
                                if (document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0] && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':') && document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1]) {
                                    try {
                                        var dateStr = removeExtraChars(document.getElementsByClassName('search-result-block search-result')[1].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('modify-active clearfix')[0].getElementsByClassName('lft')[0].innerHTML.split(':')[1].trim());

                                        timesJobs.lastModifiedDate = dateConverter(dateStr);
                                    } catch (ex) {
                                        console.log("timesJobs.lastModifiedDate", ex);
                                    }
                                }
                            } catch (ex) {
                                console.log("lastModifiedDate", ex);
                                exception.lastModifiedDate = ex;
                            }
                            // applicants.push({ firstName: first_name, lastName: last_name, portalId: 3, index: selected_candidates[i] });

                            // -------------------experience--------

                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].innerHTML) {

                                    timesJobs.experience = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].innerHTML.trim());
                                }
                            } catch (ex) {
                                console.log("timesJobs.experience", ex);
                                exception.experience = ex;
                            }
                            // ----------------salary----------
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].innerHTML) {

                                    timesJobs.salary = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].innerHTML.trim());

                                }
                            } catch (ex) {
                                console.log("timesJobs.salary", ex);
                                exception.salary = ex;
                            }
                            // ----------------place----------

                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3] && search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3].innerHTML) {

                                    timesJobs.place = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('candidate-profile lft')[0].getElementsByClassName('profile-des lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[3].innerHTML.trim());

                                }
                            } catch (ex) {
                                console.log("timesJobs.place", ex);
                                exception.place = ex;
                            }
                            // ----------------primary skills----------
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills') && search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt') && search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt').length) {

                                    timesJobs.primarySkills = [];

                                    for (var j = 0; j < search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt').length; j++) {
                                        if (search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt')[j].innerHTML) {
                                            timesJobs.primarySkills.push(removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key-skills')[0].getElementsByClassName('srphglt')[j].innerHTML.trim()));
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("timesJobs.primarySkills", ex);
                                exception.primarySkills = ex;
                            }

                            // ----------------Job Title----------
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0] && search_results[i].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray')[0]) {

                                    timesJobs.jobTitle = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[0].getElementsByClassName('gray')[0].innerHTML.trim());
                                }
                            } catch (ex) {
                                console.log("timesJobs.jobTitle", ex);
                                exception.jobTitle = ex;
                            }
                            // imployement History
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p').length) {


                                    timesJobs.work_history = [];
                                    for (var k = 0; k < search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p').length; k++) {

                                        if (search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML) {
                                            timesJobs.work_history.push({
                                                employer: removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML.trim()),

                                                jobTitle: removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[0].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('gray')[0].innerHTML.trim())

                                            })
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log("timesJobs.work_history", err);
                                exception.work_history = err;
                            }

                            // education History
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p').length) {


                                    timesJobs.educationHistory = [];
                                    for (var k = 0; k < search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p').length; k++) {

                                        if (search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML) {
                                            timesJobs.educationHistory.push({
                                                institution: removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('dis-heading')[0].innerHTML.trim()),

                                                qualification: removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[1].getElementsByTagName('div')[0].getElementsByTagName('p')[k].getElementsByClassName('gray')[0].innerHTML.trim())
                                            })
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log("timesJobs.educationHistory", err);
                                exception.work_history = err;
                            }
                            // ---keystrength---
                            try {
                                if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0] && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray') && search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray').length) {


                                    timesJobs.keystrength = []
                                    for (var k = 0; k < search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray').length; k++) {
                                        timesJobs.keystrength.push(
                                            removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('srp-key lft')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')[2].getElementsByTagName('div')[0].getElementsByClassName('gray')[k].innerHTML.trim())
                                        );
                                    }
                                }
                            } catch (err) {
                                console.log("timesJobs.keystrength", err);
                                exception.keystrength = err;
                            }

                            try {
                                if (search_results && search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('chk-bx check-hgt chk') && search_results[selected_candidates[i]].getElementsByClassName('chk-bx check-hgt chk')[0] && search_results[selected_candidates[i]].getElementsByClassName('chk-bx check-hgt chk')[0].getElementsByTagName('input')[0]) {
                                    timesJobs.uniqueID = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('chk-bx check-hgt chk')[0].getElementsByTagName('input')[0].getAttribute('name').replace('chk', ''));
                                }
                            } catch (err) {
                                console.log("timesJobs.uniqueID", err)
                                exception.uniqueID = ex;
                            }

                            applicants.push({ portal_id: 3, index: selected_candidates[i], first_name: timesJobs.first_name, last_name: timesJobs.last_name, experience: timesJobs.experience, last_modified_date: timesJobs.lastModifiedDate, salary: timesJobs.salary, location: timesJobs.place, primary_skills: timesJobs.primarySkills, job_title: timesJobs.jobTitle, work_history: timesJobs.work_history, education: timesJobs.educationHistory, key_strengths: timesJobs.keystrength, uid: timesJobs.uniqueID });
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
                }
                //console.log('applicants', applicants);

            }


        }
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        response.exception = exception;
        res.status(200).json(response);
    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        response.exception = exception;
        res.status(500).json(response);
    }
};





// New Timesjob

portalimporter.saveApplicantsFromTimesjobsNew = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var exception = {};
    var validationFlag = true;
    var portalId = 3; // timesjob
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
                details.first_name = removeExtraChars(fullName.split(' ')[0]);
            if (fullName && fullName.split(' ') && fullName.split(' ')[1]) {
                details.last_name = fullName.split(' ').splice(1).join(' ')
                details.last_name = removeExtraChars(details.last_name.trim());
            }
        } catch (ex) {
            console.log("fullName", ex);
            exception.fName = ex
        }

        try {
            var tempDetails = document.getElementsByClassName('candidate-contact lft');
            if (tempDetails && tempDetails[0] && tempDetails[0].getElementsByTagName('a') && tempDetails[0].getElementsByTagName('a')[1] && tempDetails[0].getElementsByTagName('a')[1].innerHTML) {
                try {
                    var emailid = tempDetails[0].getElementsByTagName('a')[1].innerHTML.trim();
                    var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/; // include /s in the end
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
                    console.log("details.emailId", ex);
                    exception.emailId = ex;
                }
            }
        } catch (ex) {
            console.log("details.emailId", ex);
            exception.emailId = ex;
        }

        try {
            var tempMobile = document.getElementsByClassName('candidate-contact lft');
            if (tempMobile && tempMobile[0] && tempMobile[0].getElementsByTagName('a') && tempMobile[0].getElementsByTagName('a')[0] && tempMobile[0].getElementsByTagName('a')[0].innerHTML) {
                var mobilenumber = tempMobile[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[1];
                var regularExp = /(\d{7,10})/;
                if (regularExp.exec(mobilenumber) && regularExp.exec(mobilenumber)[0])
                    details.mobile_number = removeExtraChars(regularExp.exec(mobilenumber)[0].trim());
            }
        } catch (ex) {
            console.log("details.mobileNumber", ex);
            exception.mobile_number = ex;
        }

        try {
            var tempMobileIsd = document.getElementsByClassName('candidate-contact lft');
            if (tempMobileIsd && tempMobileIsd[0] && tempMobileIsd[0].getElementsByTagName('a') && tempMobileIsd[0].getElementsByTagName('a')[0] && tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML) {
                var mobileISD = tempMobileIsd[0].getElementsByTagName('a')[0].innerHTML.trim().split('-')[0];
                var regularExp = /(\d{7,10})/;
                if (regularExp.exec(mobileISD) && regularExp.exec(mobileISD)[0])
                    details.mobile_ISD = removeExtraChars(regularExp.exec(mobileISD)[0].trim());
            }
        } catch (ex) {
            console.log("details.mobileISD", ex);
            exception.mobile_ISD = ex;
        }

        try {
            details.experience = 0;
            if (document.getElementsByClassName('candidate-info lft') && document.getElementsByClassName('candidate-info lft')[0] && document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li') && document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[2] && document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[2].innerHTML) {
                var tempExpStr = removeExtraChars(document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[2].innerHTML.trim())
                var tempExp = 0;
                if (tempExpStr.split('Year')[0].trim() && Number(tempExpStr.split('Year')[0].trim())) {
                    tempExp = Number(tempExpStr.split('Year')[0].trim());
                }
                if (tempExpStr.split('Month')[0].trim()) {
                    var monthStr = tempExpStr.split('Month')[0].trim()[tempExpStr.split('Month')[0].trim().length - 1];
                    if (monthStr && parseFloat(Number(monthStr / 12).toFixed(2)))
                        tempExp = tempExp + "." + Number(monthStr / 12).toFixed(2).split(".")[1];
                }
                if (tempExp) {
                    details.experience = parseFloat(tempExp);
                }
                //console.log(details.experience);
            }
        } catch (ex) {
            console.log("details.experience", ex);
            exception.experience = ex;
        }

        //-------job Title--------

        try {
            var tempJobTitle = document.getElementsByClassName('candidate-info lft');

            if (tempJobTitle && tempJobTitle[0] && tempJobTitle[0].getElementsByTagName('li') && tempJobTitle[0].getElementsByTagName('li')[0] && tempJobTitle[0].getElementsByTagName('li')[0].innerHTML)
                details.job_title = removeExtraChars(tempJobTitle[0].getElementsByTagName('li')[1].innerHTML.trim().replace(removeTagsRegex, ''));


        } catch (ex) {
            console.log("details.job_title", ex);
            exception.job_title = ex;
        }
        // -----------salary------

        try {
            var tempSalary = document.getElementsByClassName('candidate-info lft');
            if (tempSalary && tempSalary[0] && tempSalary[0].getElementsByTagName('li') && tempSalary[0].getElementsByTagName('li')[2]) {
                var tempSalary = removeExtraChars(tempSalary[0].getElementsByTagName('li')[2].innerHTML.trim().replace(removeTagsRegex, '').split('|')[1]);
                tempSalary = tempSalary.split(' ');
                if (tempSalary && tempSalary[0]) {
                    details.present_salary_curr = tempSalary[0];
                }
                if (tempSalary && tempSalary[1]) {
                    details.present_salary = Number(tempSalary[1]);
                }
                if (tempSalary && tempSalary[2]) {
                    details.present_salary_scale = tempSalary[2];
                }
                if (tempSalary && tempSalary[3]) {
                    details.present_salary_period = tempSalary[3];
                }
            }
        } catch (ex) {
            console.log("details.present_salary", ex);
            exception.present_salary = ex;
        }

        //Date Of Birth
        try {
            var tempDOB = document.getElementsByClassName('candidate-info lft');
            if (tempDOB && tempDOB[0] && tempDOB[0].getElementsByTagName('li') && tempDOB[0].getElementsByTagName('li')[3]) {
                var DOB = removeExtraChars(tempDOB[0].getElementsByTagName('li')[3].innerHTML.trim().replace(removeTagsRegex, ''));
                DOB = new Date(DOB.substring(DOB.indexOf('(') + 1, DOB.indexOf(')')));
                details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                if (details.DOB == 'NaN-NaN-NaN') {
                    details.DOB = undefined;
                }
            }
        } catch (ex) {
            console.log("details.DOB", ex);
            exception.DOB = ex;
        }

        //gender
        try {
            var tempGender = document.getElementsByClassName('candidate-info lft');
            if (tempGender && tempGender[0] && tempGender[0].getElementsByTagName('li') && tempGender[0].getElementsByTagName('li')[3]) {
                var gender = removeExtraChars(tempGender[0].getElementsByTagName('li')[3].innerHTML.trim().replace(removeTagsRegex, '')).split(" ")[0];
                if (gender && gender.toUpperCase() == 'MALE') {
                    details.gender = "M";
                } else if (gender && gender.toUpperCase() == 'FEMALE') {
                    details.gender = "F";
                } else {
                    details.gender = "";
                }
            }
        } catch (ex) {
            console.log("details.DOB", ex);
            exception.DOB = ex;
        }

        //-------address---------

        try {
            var tempAddress = document.getElementsByClassName('candidate-info lft');
            if (tempAddress && tempAddress[0] && tempAddress[0].getElementsByTagName('li') && tempAddress[0].getElementsByTagName('li')[4]) {
                details.address = removeExtraChars(tempAddress[0].getElementsByTagName('li')[4].innerHTML.trim().replace(removeTagsRegex, ''));


            }
        } catch (ex) {
            console.log("details.address", ex);
            exception.address = ex;
        }

        // ---primarySkills--

        try {
            var tempPrimarySkills = document.getElementsByClassName('candidate-exp');
            if (tempPrimarySkills && tempPrimarySkills[0] && tempPrimarySkills[0] && tempPrimarySkills[0].getElementsByClassName('keyskills') && tempPrimarySkills[0].getElementsByClassName('keyskills')[0] && tempPrimarySkills[0].getElementsByClassName('keyskills')[0].getElementsByClassName('skills-sm') && tempPrimarySkills[0].getElementsByClassName('keyskills')[0].getElementsByClassName('skills-sm').length) {
                details.primary_skills = [];
                for (var i = 0; i < tempPrimarySkills[0].getElementsByClassName('keyskills')[0].getElementsByClassName('skills-sm').length; i++) {
                    if (tempPrimarySkills[0].getElementsByClassName('keyskills')[0].getElementsByClassName('skills-sm')[i].innerHTML) {
                        details.primary_skills.push(
                            removeExtraChars(tempPrimarySkills[0].getElementsByClassName('keyskills')[0].getElementsByClassName('skills-sm')[i].innerHTML.trim().replace(removeTagsRegex, ''))
                        );
                    }

                }
            }
        } catch (err) {
            console.log("details.primary_skills", err);
            exception.primary_skills = err;
        }

        // ---Current Employer---

        try {
            var tempCurrentEmployer = document.getElementsByClassName('candidate-exp');
            if (tempCurrentEmployer && tempCurrentEmployer[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0]) {
                details.current_employer = removeExtraChars(tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].innerHTML.trim().split(',')[0].trim().replace(removeTagsRegex, ''));
            }
        } catch (err) {
            console.log("details.currentEmployer", err);
            exception.current_employer = err;
        }

        // ----Current Location---

        try {
            var tempCurrentEmployer = document.getElementsByClassName('candidate-exp');
            if (tempCurrentEmployer && tempCurrentEmployer[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0]) {
                details.location = removeExtraChars(tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }
        } catch (err) {
            console.log("details.currentLocation", err);
            exception.location = err;
        }

        // ----Preferred Location---

        try {
            var tempCurrentEmployer = document.getElementsByClassName('candidate-exp');
            if (tempCurrentEmployer && tempCurrentEmployer[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2].getElementsByClassName('other-key')[0]) {
                details.pref_locations = removeExtraChars(tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2].getElementsByClassName('other-key')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }
        } catch (err) {
            console.log("details.preferredLocation", err);
            exception.prefLocations = err;
        }

        // ----Notice Period ----
        try {
            var tempCurrentEmployer = document.getElementsByClassName('candidate-exp');
            if (tempCurrentEmployer && tempCurrentEmployer[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3] && tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3].getElementsByClassName('other-key')[0]) {
                details.notice_period = removeExtraChars(tempCurrentEmployer[0].getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3].getElementsByClassName('other-key')[0].innerHTML.trim().replace(removeTagsRegex, ''));

                if (details.notice_period.toUpperCase() == 'IMMEDIATELY') {
                    details.notice_period = 15;
                } else if (details.notice_period.toUpperCase().indexOf('DAYS') > -1) {
                    details.notice_period = details.notice_period.split('days')[0] * 1;
                } else if (details.notice_period.toUpperCase().indexOf('MONTH') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('Month')[0] * 30;
                } else if (details.notice_period.toUpperCase().indexOf('MONTHS') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('Months')[0] * 30;
                }
            }
        } catch (err) {
            console.log("details.notice_period", err);
            exception.notice_period = err;
        }

        //------functional area-------

        try {
            details.functional_areas = [];
            var tempProfessionalDetails = document.getElementById('Professional-Details');
            if (tempProfessionalDetails && tempProfessionalDetails.getElementsByClassName('other-key-info') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('edu-year') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('edu-year')[0]) {
                var tempfuncArea = removeExtraChars(tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('edu-year')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempfuncArea && tempfuncArea.spli) {

                }
            }


        } catch (err) {
            console.log("details.functional_areas", err);
            exception.functional_areas = err;
        }

        // ------current roll

        try {
            var tempProfessionalDetails = document.getElementById('Professional-Details');
            if (tempProfessionalDetails && tempProfessionalDetails.getElementsByClassName('other-key-info') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key') &&
                tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0]) {
                details.current_role = removeExtraChars(tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }


        } catch (err) {
            console.log("details.current_role", err);
            exception.current_role = err;
        }

        //----area of specialization-----

        try {
            var tempProfessionalDetails = document.getElementById('Professional-Details');
            if (tempProfessionalDetails && tempProfessionalDetails.getElementsByClassName('other-key-info') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2].getElementsByClassName('edu-year') &&
                tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2].getElementsByClassName('edu-year ')[0]) {
                details.specialization = removeExtraChars(tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[2].getElementsByClassName('edu-year')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (err) {
            console.log("details.specialization", err);
            exception.specialization = err;
        }

        // -------industry-----

        try {
            var tempProfessionalDetails = document.getElementById('Professional-Details');
            if (tempProfessionalDetails && tempProfessionalDetails.getElementsByClassName('other-key-info') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3] && tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3].getElementsByClassName('other-key') &&
                tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3].getElementsByClassName('other-key')[0]) {
                details.industry = removeExtraChars(tempProfessionalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[3].getElementsByClassName('other-key')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }


        } catch (err) {
            console.log("details.industry", err);
            exception.industry = err;
        }



        // --------language----------

        try {
            var tempLanguage = document.getElementsByClassName('professional-exp');
            if (tempLanguage && tempLanguage[3] && tempLanguage[3].getElementsByClassName('lang-info') && tempLanguage[3].getElementsByClassName('lang-info')[0] && tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul') && tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul').length) {
                details.languages = [];
                for (var j = 1; j < tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul').length; j++) {

                    if (tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul')[j].getElementsByTagName('li') && tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul')[j].getElementsByTagName('li')[0])

                        details.languages.push(removeExtraChars(tempLanguage[3].getElementsByClassName('lang-info')[0].getElementsByTagName('ul')[j].getElementsByTagName('li')[0].innerHTML.trim().replace(removeTagsRegex, '')))
                }
            }
        } catch (err) {
            console.log("details.languages", err);
            exception.laguages = err;
        }


        // ----------- education details--------

        details.education = []

        try {
            if (document.getElementById('Educational-Details').getElementsByClassName('other-key-info') && document.getElementById('Educational-Details').getElementsByClassName('other-key-info')[0] && document.getElementById('Educational-Details').getElementsByClassName('other-key-info')[0].getElementsByTagName('p')) {

                var tempEducationDetails = document.getElementById('Educational-Details').getElementsByClassName('other-key-info')[0].getElementsByTagName('p');

                if (tempEducationDetails && tempEducationDetails.length) {
                    for (var e = 0; e < tempEducationDetails.length; e++) {

                        var tempEducation = { education: "", specialization: "", passing_year: "", institution: "" }
                        //education passing_year
                        try {
                            if (tempEducationDetails[e] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("lft educ-det") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("lft educ-det")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("lft educ-det")[0].innerHTML) {
                                var temp_passing_year = removeExtraChars(tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("lft educ-det")[0].innerHTML.trim());
                                if (temp_passing_year) {
                                    tempEducation.passing_year = temp_passing_year;
                                } else {
                                    tempEducation.passing_year = "";
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "timesjobs tempEducation.passing_year")
                        }
                        //education education
                        try {
                            if (tempEducationDetails[e] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML) {
                                var temp_education_str = removeExtraChars(tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML.trim());

                                if (temp_education_str && temp_education_str.split("in") && temp_education_str.split("in").length && temp_education_str.split("in")[0].trim()) {
                                    tempEducation.education = temp_education_str.split("in")[0].trim();
                                } else {
                                    tempEducation.education = "";
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "timesjobs tempEducation.education")
                        }

                        //eduction specialization
                        try {
                            if (tempEducationDetails[e] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML) {

                                var temp_education_str = removeExtraChars(tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML.trim());

                                if (temp_education_str && temp_education_str.split("in") && temp_education_str.split("in").length && temp_education_str.split("in")[1].trim()) {
                                    var temp_spec_str = temp_education_str.split("in")[1].trim();

                                    if (temp_spec_str && temp_spec_str.split("-") && temp_spec_str.split("-").length && temp_spec_str.split("-")[0].trim()) {
                                        tempEducation.specialization = temp_spec_str.split("-")[0].trim()
                                    } else {
                                        tempEducation.specialization = "";
                                    }
                                } else {
                                    tempEducation.specialization = "";
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "timesjobs tempEducation.specialization")
                        }

                        //education institution
                        try {
                            if (tempEducationDetails[e] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details") && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0] && tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML) {

                                var temp_education_str = removeExtraChars(tempEducationDetails[e].getElementsByClassName("edu-year clearfix")[0].getElementsByClassName("rgt education-details")[0].innerHTML.trim());

                                if (temp_education_str && temp_education_str.split("in") && temp_education_str.split("in").length && temp_education_str.split("in")[1].trim()) {
                                    var temp_inst_str = temp_education_str.split("in")[1].trim();

                                    if (temp_inst_str && temp_inst_str.split("-") && temp_inst_str.split("-").length && temp_inst_str.split("-")[1].trim()) {
                                        tempEducation.institution = temp_inst_str.split("-")[1].trim()
                                    } else {
                                        tempEducation.institution = "";
                                    }
                                } else {
                                    tempEducation.institution = "";
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "timesjobs tempEducation.institution")
                        }
                        if (tempEducation) {
                            details.education.push(tempEducation)
                        }
                    }
                }
            }

        } catch (ex) {
            console.log(ex, "timesjob details.education");
        }

        // // ---UG---
        // try {
        //     var tempEducationalDetails = document.getElementById('Educational-Details');
        //     // year of passing----

        //     if (tempEducationalDetails && tempEducationalDetails.getElementsByClassName('other-key-info') && tempEducationalDetails.getElementsByClassName('other-key-info')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key') &&
        //         tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det')[0]) {

        //         var UGYearOfPassing = removeExtraChars(tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det')[0].innerHTML.trim().replace(removeTagsRegex, ''));
        //     }

        //     if (tempEducationalDetails && tempEducationalDetails.getElementsByClassName('other-key-info') && tempEducationalDetails.getElementsByClassName('other-key-info')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key') &&
        //         tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details')[0]) {

        //         var UGDetails = removeExtraChars(tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[0].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details')[0].innerHTML.trim().replace(removeTagsRegex, '')).replace(/\s+/g, ' ').trim();
        //     }
        //     details.education[0] = { type: 'UG', passing_year: UGYearOfPassing, details: UGDetails };


        // } catch (err) {
        //     console.log("details.educationDetails", err);
        //     exception.UGeducationDetails = err;

        // }

        // // ---------PG----------


        // try {
        //     var tempEducationalDetails = document.getElementById('Educational-Details');
        //     // year of passing----
        //     if (tempEducationalDetails && tempEducationalDetails.getElementsByClassName('other-key-info') && tempEducationalDetails.getElementsByClassName('other-key-info')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1]) {

        //         if (tempEducationalDetails && tempEducationalDetails.getElementsByClassName('other-key-info') && tempEducationalDetails.getElementsByClassName('other-key-info')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key') &&
        //             tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det')[0]) {

        //             var PGYearOfPassing = removeExtraChars(tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('educ-det')[0].innerHTML.trim().replace(removeTagsRegex, ''));
        //         }

        //         if (tempEducationalDetails && tempEducationalDetails.getElementsByClassName('other-key-info') && tempEducationalDetails.getElementsByClassName('other-key-info')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key') &&
        //             tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0] && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details') && tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details')[0]) {

        //             var PGDetails = removeExtraChars(tempEducationalDetails.getElementsByClassName('other-key-info')[0].getElementsByTagName('p')[1].getElementsByClassName('other-key')[0].getElementsByClassName('edu-year')[0].getElementsByClassName('education-details')[0].innerHTML.trim().replace(removeTagsRegex, '')).replace(/\s+/g, ' ').trim();

        //         }

        //         details.education[1] = { type: 'PG', passing_year: PGYearOfPassing, details: PGDetails };
        //     }

        // } catch (err) {
        //     console.log("details.educationDetails", err);
        //     exception.PGeducationDetails = err;
        // }

        console.log(details);

        // var tempSalary = document.getElementsByClassName('candidate-info lft');
        // if(tempSalary && tempSalary[0] && tempSalary[0].getElementsByTagName('li') && tempSalary[0].getElementsByTagName('li')[1] && tempSalary[0].getElementsByTagName('li')[1].innerHTML){
        //     details.presentSalary = document.getElementsByClassName('candidate-info lft')[0].getElementsByTagName('li')[1].innerHTML.split('</span>')[1].trim();
        // }




        console.timeEnd("Completed with parsing");
        // var isTallint = req.query.isTallint || 0;

        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }


        // for tallint
        var token = req.query.token;
        var heMasterId = req.query.heMasterId;
        // var portalId = 2;

        details.portal_id = portalId;
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
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        response.exception = exception;
        res.status(200).json(response);


    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        response.exception = exception;
        res.status(500).json(response);
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
                    } catch (err) {
                        console.log(err);
                    }

                    if (uniqueID) {
                        applicants.push({ first_name: first_name, last_name: last_name, portal_id: 5, index: i, location: current_location, last_modified_date: lastModifiedDate, uid: uniqueID });
                    }
                }
            }

            //console.log("applicants", applicants);
        } else {
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
                    } catch (err) {
                        console.log(err);
                    }


                    if (uniqueID) {
                        applicants.push({ first_name: first_name, last_name: last_name, portal_id: 5, index: selected_candidates[i], location: current_location, last_modified_date: lastModifiedDate, uid: uniqueID });
                    }
                }
        }
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
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

        var portalId = 5; // totaljobs
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
                    details.last_name = temp_name.splice(temp_name.length - 1, 1)[0];
                    if (temp_name[0]) {
                        details.first_name = temp_name.join(' ');
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
                details.job_title = temp_jobtitle;
            }
        }


        var temp_emailid = document.getElementById('btnEmailCandidate');
        if (temp_emailid && temp_emailid.innerHTML) {
            details.emailId = removeExtraChars(document.getElementById('btnEmailCandidate').innerHTML);
        }


        var temp_mobilenumber = document.getElementById('btnHomePhone');
        if (temp_mobilenumber && temp_mobilenumber.innerHTML) {
            details.mobile_number = removeExtraChars(temp_mobilenumber.innerHTML).replace(/ /g, '');
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
                details.last_modified_date = lastModifiedDate;
            }
            // var temp_date = new Date(lastModifiedDate);
            // lastModifiedDate = temp_date.getFullYear() + "-" + (temp_date.getMonth() + 1) + "-" + temp_date.getDate();
            // if (lastModifiedDate) {
            //     details.lastModifiedDate = lastModifiedDate;
            // }
        }
        if (req.body.attachment) {
            var attachment1 = req.body.attachment.split(',');
            if (attachment1.length && attachment1[0] && attachment1[1]) {
                details.resume_document = attachment1[1];
                var filetype = '';
                filetype = setFileType(attachment1[0]);
                details.resume_extension = '.' + filetype;
            }
        }

        details.portal_id = portalId;
        console.log(req.body.isTallint, req.body.isIntranet);
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);
    } catch (ex) {
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
                } catch (err) {
                    console.log(err);
                }


                applicants.push({ first_name: first_name, last_name: last_name, portal_id: 6, index: i, last_modified_date: lastModifiedDate, uid: uniqueID });
            }
        }
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
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

        var portalId = 6; // totaljobs
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
                details.last_name = temp_name.splice(temp_name.length - 1, 1)[0];
                if (temp_name[0]) {
                    details.first_name = temp_name.join(' ');
                }
            }
        }


        var temp_jobtitle = document.getElementsByClassName('nameAndDetails clearfix');
        if (temp_jobtitle && temp_jobtitle[0] && temp_jobtitle[0].getElementsByClassName('detailsJob') && temp_jobtitle[0].getElementsByClassName('detailsJob')[0] && temp_jobtitle[0].getElementsByClassName('detailsJob')[0].innerHTML) {
            temp_jobtitle = removeExtraChars(temp_jobtitle[0].getElementsByClassName('detailsJob')[0].innerHTML);
            if (temp_jobtitle && removeExtraChars(temp_jobtitle.split(" at "))) {
                temp_jobtitle = removeExtraChars(temp_jobtitle.split(" at "));
                details.job_title = removeExtraChars(temp_jobtitle[0]);
                if (removeExtraChars(temp_jobtitle[1])) {
                    details.current_employer = removeExtraChars(temp_jobtitle[1]);
                }
            }
        }


        var temp_emailid = document.getElementsByClassName('email');
        if (temp_emailid && temp_emailid[0] && temp_emailid[0].innerHTML) {
            details.emailId = removeExtraChars(temp_emailid[0].innerHTML);
        }


        var temp_mobilenumber = document.getElementsByClassName('phone');
        if (temp_mobilenumber && temp_mobilenumber[0] && temp_mobilenumber[0].innerHTML) {
            details.mobile_number = removeExtraChars(temp_mobilenumber[0].innerHTML);
        }

        var temp_presentlocation = document.getElementsByClassName('town');
        if (temp_presentlocation && temp_presentlocation[0] && temp_presentlocation[0].innerHTML) {
            details.location = removeExtraChars(temp_presentlocation[0].innerHTML);
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
                    details.notice_period = parseInt(temp_noticeperiod) * 30;
                }
            } else {
                details.notice_period = 0;
            }
        }

        var uniqueID = document.getElementById('downloadOriginalCV');
        if (uniqueID && uniqueID.getAttribute('data-download-link') && uniqueID.getAttribute('data-download-link').split('candidateId=') && uniqueID.getAttribute('data-download-link').split('candidateId=')[1] && uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&') && uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&')[0]) {
            //console.log("entered uid --------------------------");
            details.uid = uniqueID.getAttribute('data-download-link').split('candidateId=')[1].split('&')[0];
        }

        // details.lastModifiedDate = "2019-04-25";

        if (req.body.attachment) {
            var attachment1 = req.body.attachment.split(',');
            if (attachment1.length && attachment1[0] && attachment1[1]) {
                details.resume_document = attachment1[1];
                var filetype = '';
                filetype = setFileType(attachment1[0]);
                details.resume_extension = '.' + filetype;
            }
        }

        details.portal_id = portalId;

        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);
    } catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};

var jobStreetDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var parseObj = {}
        // parseObj.lastModifiedDate = undefined;
        // parseObj.uniqueID = undefined;
        try {
            //unique ID
            try {
                if (element.getElementsByTagName('input')) {
                    if (element.getElementsByTagName('input') && element.getElementsByTagName('input')[1] && element.getElementsByTagName('input')[1].value) {
                        parseObj.uniqueID = element.getElementsByTagName('input')[1].value;
                    }
                }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.uniqueID");
            }

            //lastModifiedDate
            try {
                var last_modified_element = element.getElementsByTagName('table');
                if (last_modified_element && last_modified_element[0] && last_modified_element[0].getElementsByTagName('tr')) {
                    for (let x = 0; x < last_modified_element[0].getElementsByTagName('tr').length; x++) {
                        if (last_modified_element[0].getElementsByTagName('tr')[x] && last_modified_element[0].getElementsByTagName('tr')[x].innerHTML) {
                            if (last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.indexOf('Last Modified') > -1) {
                                parseObj.lastModifiedDate = dateConverter(removeExtraChars(last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.split(':')[1]));
                            }
                        }
                    }
                }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.lastModifiedDate");
            }
            // ---name---
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[1] && element.getElementsByTagName('td')[1].getElementsByTagName('a') && element.getElementsByTagName('td')[1].getElementsByTagName('a')[0] && element.getElementsByTagName('td')[1].getElementsByTagName('a') && element.getElementsByTagName('td')[1].getElementsByTagName('a')[0]) {
                    var temp_name = element.getElementsByTagName('td')[1].getElementsByTagName('a')[0].innerHTML;

                    if (temp_name.split(' ')) {
                        temp_name = temp_name.split(' ');
                        if (temp_name.length - 1 > 0) {
                            parseObj.lastName = temp_name.splice(temp_name.length - 1, 1)[0];
                        }
                        else {
                            parseObj.lastName = ''
                        }
                        if (temp_name[0]) {
                            parseObj.firstName = temp_name.join(' ');
                        }
                    }
                    console.log(parseObj.firstName, parseObj.lastName);
                }
            } catch (ex) {
                console.log(ex, "check jobstreet firstName lastName");
            }

            //    ---candidate details---
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[1] && element.getElementsByTagName('td')[1].innerHTML) {
                    var tempCandidateDetails = element.getElementsByTagName('td')[1].innerHTML.trim();

                    //---basic details---
                    if (tempCandidateDetails && tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>'))) {
                        var tempBasicDetails = tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>'))
                        try {
                            tempBasicDetails = tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>')).split('<br>')
                            tempBasicDetails = tempBasicDetails.filter(res => {
                                if (res) {
                                    return res
                                }
                            })
                        } catch (error) {

                        }
                    }

                    try {
                        if (tempBasicDetails && tempBasicDetails.length) {

                            // ---age---
                            try {
                                var tempAge = tempBasicDetails[0]
                                if (tempAge && parseInt(tempAge) && parseInt(tempAge) != NaN) {
                                    parseObj.age = parseInt(tempAge);
                                }
                                else {
                                    var tempAge = tempBasicDetails[0].split(',')[1]
                                    if (tempAge && parseInt(tempAge) && parseInt(tempAge) != NaN) {
                                        parseObj.age = parseInt(tempAge);
                                    }
                                }
                            } catch (ex) {
                                console.log(ex, "check jobstreet  parseObj.age");
                            }

                            // ---gender---
                            try {
                                var tempGender = tempBasicDetails[0].split(',')[0].trim();
                                if (tempGender && tempGender.toLowerCase() == "male") {
                                    parseObj.gender = "M";
                                } else if (tempGender && tempGender.toLowerCase() == "female") {
                                    parseObj.gender = "F";
                                } else {
                                    parseObj.gender = "";
                                }
                            } catch (ex) {
                                console.log(ex, "check jobstreet  parseObj.gender");
                            }

                            // ---region---
                            try {
                                var tempRegion = tempBasicDetails[0];
                                var age_found;
                                parseObj.region = ''
                                if (tempRegion) {
                                    try {
                                        tempRegion = tempRegion.split(',');
                                        for (let i = 0; i < tempRegion.length; i++) {
                                            if (!isNaN(parseInt(tempRegion[i].trim()))) {
                                                age_found = 1;
                                            }
                                        }
                                        if (age_found) {
                                            tempRegion = tempBasicDetails[1];
                                            if (tempRegion.indexOf('Preferred work location') == -1) {
                                                parseObj.region = removeExtraChars(tempRegion)
                                            }
                                        }
                                        else {
                                            if (tempRegion.indexOf('Preferred work location') == -1) {
                                                parseObj.region = removeExtraChars(tempRegion.toString())
                                            }
                                        }
                                    }
                                    catch (err) {
                                        console.log(err)
                                    }
                                }
                                // if (tempRegion && tempRegion.substring(0, tempRegion.indexOf('('))) {
                                //     parseObj.region = tempRegion.substring(0, tempRegion.indexOf('(')).trim();
                                // }
                            } catch (ex) {
                                console.log(ex, "check jobstreet parseObj.region");
                            }
                            // ---country---
                            try {
                                var tempCountry = tempBasicDetails.split(',')[2].trim();
                                if (tempCountry && tempCountry.substring(tempCountry.indexOf('(') + 1, tempCountry.indexOf(')'))) {
                                    parseObj.country = tempCountry.substring(tempCountry.indexOf('(') + 1, tempCountry.indexOf(')')).trim();
                                }
                            } catch (ex) {
                                console.log(ex, "check jobstreet parseObj.country");
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "check jobstreet basic details");
                    }

                    // ---skills---
                    try {
                        var tempCandidateskills = element.querySelector('td.skill').innerHTML.trim();
                        if (tempCandidateskills) {
                            var tempSkills = tempCandidateskills.split('<br>')
                            try {
                                tempSkills = tempSkills.filter(res => {
                                    if (res) {
                                        res = removeExtraChars(res)
                                        if (res != '-') {
                                            return res
                                        }
                                    }
                                })
                            } catch (error) {

                            }
                            if (tempSkills && tempSkills.length) {
                                parseObj.primarySkills = tempSkills || [];
                            }
                        }

                    } catch (ex) {
                        console.log(ex, "check jobstreet parseObj.primarySkills");
                    }
                }
            } catch (ex) {
                console.log(ex, "check jobstreet candidate details");
            }

            var work_history_str = element.querySelector('td.employment').innerHTML.trim()
            // ---employement History---
            try {
                parseObj.work_history = [];
                if (work_history_str) {
                    try {
                        var work_history_str_array;
                        var job_title = [];
                        var employer = []
                        work_history_str_array = work_history_str.split('<b>')
                        try {
                            work_history_str_array = work_history_str_array.filter(res => {
                                if (res) {
                                    job_title.push(removeExtraChars(res.split('</b>')[0]))
                                    let company_name = res.split('</b>')[1].split('<br>')[0].trim().split(')')[1].trim()
                                    employer.push(company_name)
                                }
                            })
                        } catch (error) {

                        }
                        let length = employer.length > job_title.length ? employer.length : job_title.length;
                        for (let i = 0; i < length; i++) {
                            parseObj.work_history.push({ job_title: job_title[i], employer: employer[i] })
                        }

                        // var tempJobTitle_1 = removeExtraChars(element.querySelector('td.employment').innerHTML.trim());
                    }
                    catch (ex) {
                        console.log(ex, "check jobstreet parseObj.work_history.jobTitle");
                    }


                    // // ---1st Company Name---
                    // try {
                    //     if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[5] && element.getElementsByTagName('td')[5].getElementsByTagName('b') && element.getElementsByTagName('td')[5].getElementsByTagName('b')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('b')[0].getElementsByTagName('b') && element.getElementsByTagName('td')[2].getElementsByTagName('b')[0].getElementsByTagName('b')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('b')[0].getElementsByTagName('b')[0].innerHTML) {
                    //         var tempEmpHistory = element.getElementsByTagName('td')[5].innerHTML.trim();

                    //         if (tempEmpHistory && tempEmpHistory.substring(tempEmpHistory.indexOf('<br>') + 4, tempEmpHistory.indexOf('<p>'))) {
                    //             var tempCompanyName_1 = removeExtraChars(tempEmpHistory.substring(tempEmpHistory.indexOf('<br>') + 4, tempEmpHistory.indexOf('<p>')).trim())
                    //         }
                    //     }
                    // } catch (ex) {
                    //     console.log(ex, "check jobstreet parseObj.work_history.CompanyName_1");
                    // }

                    // if (tempJobTitle_1 && tempCompanyName_1) {
                    //     parseObj.work_history.push({ job_title: tempJobTitle_1, employer: tempCompanyName_1 });
                    // }

                    // // ---2nd job title---
                    // try {

                    //     if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[2] && element.getElementsByTagName('td')[2].getElementsByTagName('p') && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].getElementsByTagName('b') && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].getElementsByTagName('b')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].getElementsByTagName('b')[0].innerHTML) {

                    //         var tempJobTitle_2 = removeExtraChars(element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].getElementsByTagName('b')[0].innerHTML.trim());
                    //     }
                    // } catch (ex) {
                    //     console.log(ex, "check jobstreet parseObj.work_history.JobTitle_2");
                    // }

                    // // ---2nd Company Name---
                    // try {
                    //     if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[2] && element.getElementsByTagName('td')[2].getElementsByTagName('p') && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].innerHTML) {
                    //         var tempEmpHistory = element.getElementsByTagName('td')[2].getElementsByTagName('p')[0].innerHTML.trim();

                    //         if (tempEmpHistory && tempEmpHistory.substring(tempEmpHistory.lastIndexOf("<br>") + 4)) {
                    //             var tempCompanyName_2 = removeExtraChars(tempEmpHistory.substring(tempEmpHistory.lastIndexOf("<br>") + 4).trim());
                    //         }
                    //     }
                    // } catch (ex) {
                    //     console.log(ex, "check jobstreet parseObj.work_history.CompanyName_2");
                    // }

                    // if (tempJobTitle_2 && tempCompanyName_2) {
                    //     parseObj.work_history.push({ job_title: tempJobTitle_2, companyName: tempCompanyName_2 });
                    // }

                    // --experience--
                    // try {
                    //     if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[2] && element.getElementsByTagName('td')[2].getElementsByTagName('p') && element.getElementsByTagName('td')[2].getElementsByTagName('p')[1] && element.getElementsByTagName('td')[2].getElementsByTagName('p')[1].innerHTML) {
                    //         var tempExperience = element.getElementsByTagName('td')[2].getElementsByTagName('p')[1].innerHTML.trim();

                    //         if (tempExperience && tempExperience.substring(tempExperience.indexOf('of') + 3).split(' ')[0]) {
                    //             parseObj.totalExperience = parseInt(tempExperience.substring(tempExperience.indexOf('of') + 3).split(' ')[0]);
                    //         }
                    //     }
                    // } catch (ex) {
                    //     console.log(ex, "check jobstreet parseObj.totalExperience");
                    // }
                }
            } catch (error) {
            }
            //experience
            try {
                parseObj.experience = ''
                if (work_history_str && !isNaN(parseInt(work_history_str.substring(work_history_str.lastIndexOf('of') + 3).split(' ')[0].trim()))) {
                    parseObj.experience = work_history_str.substring(work_history_str.lastIndexOf('of') + 3).split(' ')[0]
                }
            }
            catch (error) {
            }
            parseObj.education = {}
            var education_str = element.querySelector('td.education').innerHTML.trim();
            try {
                var education_str_array = education_str.split('<b>').filter(res => {
                    if (res) {
                        return res
                    }
                });
                parseObj.education.type = education_str_array[0].split('</b>')[0].trim();
                // if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3] && element.getElementsByTagName('td')[3].getElementsByTagName('b') && element.getElementsByTagName('td')[3].getElementsByTagName('b')[0] && element.getElementsByTagName('td')[3].getElementsByTagName('b')[0].innerHTML) {
                //     parseObj.education.type = removeExtraChars(element.getElementsByTagName('td')[3].getElementsByTagName('b')[0].innerHTML.trim());
                // }

            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.education.type");
            }

            try {

                // if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3]) {
                //     var tempSpecialization = element.getElementsByTagName('td')[3].innerHTML.trim();
                //     var firstIndex = tempSpecialization.indexOf('<br>');
                //     var lastIndex = tempSpecialization.indexOf('<br>', firstIndex + 1)
                //     parseObj.education.specialization = removeExtraChars(tempSpecialization.substring(firstIndex + 4, lastIndex).trim());
                // }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.education.specialization");
            }

            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3]) {
                    var tempIndustry = element.getElementsByTagName('td')[3].innerHTML.trim();
                    var firstIndex = tempIndustry.indexOf('<br>', tempIndustry.indexOf('<br>') + 1);
                    var lastIndex = tempIndustry.indexOf('<br>', firstIndex + 1)
                    parseObj.education.industry = removeExtraChars(tempIndustry.substring(firstIndex + 4, lastIndex).trim());
                }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.education.industry");
            }
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3]) {
                    var tempUniversity = element.getElementsByTagName('td')[3].innerHTML.trim();
                    var tempIndex = tempUniversity.indexOf('<br>', tempUniversity.indexOf('<br>') + 1);
                    var firstIndex = tempUniversity.indexOf('<br>', tempIndex + 1);
                    var lastIndex = tempUniversity.indexOf('<br>', firstIndex + 1)
                    parseObj.education.institution = removeExtraChars(tempUniversity.substring(firstIndex + 4, lastIndex).trim());
                }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.education.institution");
            }

            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3]) {
                    var tempIndex = element.getElementsByTagName('td')[3].innerHTML.trim().lastIndexOf('<br>') + 4;
                    var tempYearOfPassing = element.getElementsByTagName('td')[3].innerHTML.trim().substring(tempIndex);
                    parseObj.education.passing_year = dateConverter(removeExtraChars(tempYearOfPassing.substring(tempYearOfPassing.indexOf('on') + 2).trim()));
                }
            } catch (ex) {
                console.log(ex, "check jobstreet parseObj.education.passing_year");
            }

            return { uid: parseObj.uniqueID, last_modified_date: parseObj.lastModifiedDate, portal_id: portalId, index: index, first_name: parseObj.firstName, last_name: parseObj.lastName, age: parseObj.age, gender: parseObj.gender, region: parseObj.region, country: parseObj.country, primarySkills: parseObj.primarySkills || [], work_history: parseObj.work_history, experience: parseObj.experience, education: parseObj.education }
        }

        catch (err) {

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
        else if (document.getElementById('listtable') && document.getElementById('listtable').getElementsByTagName('tbody') && document.getElementById('listtable').getElementsByTagName('tbody')[0]) {
            if (document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('TR1'))
                length1 = document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('TR1').length
            if (document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('tr-resultrow')) {
                length2 = document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('tr-resultrow').length;
            }
            if (document.getElementById('listtable') && document.getElementById('listtable').getElementsByTagName('tbody')[0] && document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('TRHL')) {
                length1 = document.getElementById('listtable').getElementsByTagName('tbody')[0].getElementsByClassName('TRHL').length;
            }

        }
        else if (document.getElementsByClassName('content_body')[0] && document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20]) {
            if (document.getElementsByClassName('content_body')[0] && document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TR1'))
                length1 = document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TR1').length;
            if (document.getElementsByClassName('content_body')[0] && document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TR2'))
                length2 = document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TR2').length;
            if (document.getElementsByClassName('content_body')[0] && document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TRHL'))
                length3 = document.getElementsByClassName('content_body')[0].getElementsByTagName('table')[20].getElementsByTagName('tbody')[0].getElementsByClassName('TRHL').length;
        }
        if (req.body.is_select_all == 1) {
            //console.log("req.body.is_select_all", req.body.is_select_all);
            try {
                for (var i = 0; i < length1 + length2; i++) {
                    var element = document.getElementById('resultRow' + i);

                    let applicant = jobStreetDuplicationParsing(element, i, req.body.portalId || portalId);

                    // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromJobStreetPortal")
            }
            //console.log("applicants", applicants);
        } else {
            //console.log("else part");
            try {
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = document.getElementById('resultRow' + selected_candidates[i]);

                    let applicant = jobStreetDuplicationParsing(element, selected_candidates[i], req.body.portalId || portalId);

                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromJobStreetPortal")
            }
        }

        // var portalId = 2;
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
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

        var portalId = req.body.portalId || 7; // job street
        if (typeof portalId == "string") {
            portalId = parseInt(portalId);
        }
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        //name
        try {
            if (document.getElementsByClassName('colLeft main-heading space-gap_front')[0]) {
                temp_name = removeExtraChars(document.getElementsByClassName('colLeft main-heading space-gap_front')[0].innerHTML);
                if (temp_name.split(' ')) {
                    temp_name = temp_name.split(' ');
                    details.last_name = temp_name.splice(temp_name.length - 1, 1)[0];
                    if (temp_name[0]) {
                        details.first_name = temp_name.join(' ');
                    }
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet name")
        }
        //mobile number and email id
        try {
            if (document.getElementsByClassName('section-right-inner')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')) {
                for (var x = 0; x < document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow').length; x++) {
                    if (document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('icon-phone icon').length > 0) {
                        details.mobile_number = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
                    }
                    if (document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('icon-envelope').length > 0) {
                        details.emailId = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[x].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
                    }
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet mobile_number emailId");
        }
        //experience and nationality
        try {
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
        } catch (ex) {
            console.log(ex, "save jobstreet experience nationality");
        }
        //current_employer
        try {
            if (document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0] && document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML) {
                details.job_title = removeExtraChars(document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML.split(' at ')[0]);
                details.current_employer = removeExtraChars(document.getElementsByClassName('colLeft position-title-heading space-gap_front')[0].innerHTML.split(' at ')[1]);
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.current_employer");
        }
        //location
        try {
            if (document.getElementsByClassName('section-right-inner')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0] && document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0].getElementsByClassName('icon-marker-dot').length) {
                details.location = removeExtraChars(document.getElementsByClassName('section-right-inner')[0].getElementsByClassName('pageRow')[0].getElementsByClassName('colMiddle resume-summary-heading')[0].innerHTML);
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.location");
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
                        try {
                            if (tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i] && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML) {
                                details.gender = removeExtraChars(tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML);
                                // if (req.body.isTallint) {
                                if (details.gender && details.gender.toLowerCase() == 'male') {
                                    details.gender = "M";
                                } else if (details.gender && details.gender.toLowerCase() == 'female') {
                                    details.gender = "F";
                                } else {
                                    details.gender = "";
                                }
                                // }
                                // else {
                                //     if (details.gender.toLowerCase() == "male" || details.gender.toLowerCase() == "female") {
                                //         if (details.gender.toLowerCase() == "male") {
                                //             details.gender = 1;
                                //         } else if (details.gender.toLowerCase() == "female") {
                                //             details.gender = 2;
                                //         } else {
                                //             details.gender = 0;
                                //         }
                                //     } else {
                                //         details.gender = 0;
                                //     }
                                // }
                            }
                        } catch (ex) {
                            console.log(ex, "save jobstreet details.gender");
                        }
                    }

                    try {
                        if (tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i] && tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-left')[i].innerHTML.indexOf('Address') > -1) {
                            details.address = removeExtraChars(tempGenderAddress[tempGenderAddress.length - 1].getElementsByClassName('resume-detail-item-about-me-middle')[i].innerHTML);
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet details.address");
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        var uniqueID;
        var lastModifiedDate;
        //unique ID
        try {
            var lu_uid_element = document.getElementsByClassName('resume-update')[0];

            if (lu_uid_element && lu_uid_element.getElementsByClassName('right')[0] && lu_uid_element.getElementsByClassName('right')[0].innerHTML) {
                details.last_modified_date = dateConverter(removeExtraChars(lu_uid_element.getElementsByClassName('right')[0].innerHTML).split(':')[1].trim());
            }

            if (req.body.xml_string && req.body.xml_string.split('strOpenCaID')[1] && req.body.xml_string.split('strOpenCaID')[1].split(';')[0]) {
                details.uid = req.body.xml_string.split('strOpenCaID = ')[1].split(';')[0].trim().replace(/"/g, '');
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.uid");
        }

        // ---lastModifiedDate---

        try {
            if (document.getElementsByClassName('formSection') && document.getElementsByClassName('formSection')[0] && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###') && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0] && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update') && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0] && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update') && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update')[0] && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update')[0].getElementsByClassName('right') && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update')[0].getElementsByClassName('right')[0] && document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update')[0].getElementsByClassName('right')[0].innerHTML) {
                var tempLastModifiedDate = removeExtraChars(document.getElementsByClassName('formSection')[0].getElementsByClassName('###pageRowPlaceHolder###')[0].getElementsByClassName('resume-row-update')[0].getElementsByClassName('resume-update')[0].getElementsByClassName('right')[0].innerHTML.trim().replace(removeTagsRegex, '')).split(':')[1].trim();

                if (tempLastModifiedDate && dateConverter(tempLastModifiedDate)) {
                    details.last_modified_date = dateConverter(tempLastModifiedDate);
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.last_modified_date");
        }


        // ---expected salary---
        try {
            if (document.getElementsByClassName('resume-header-inner') && document.getElementsByClassName('resume-header-inner')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0].getElementsByClassName('exp-salary') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0].getElementsByClassName('exp-salary')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0].getElementsByClassName('exp-salary')[0].getElementsByClassName("pageRow exp-salary-label-bold salary_value") && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0].getElementsByClassName('exp-salary')[0].getElementsByClassName("pageRow exp-salary-label-bold salary_value")[0]) {
                details.expected_salary = removeExtraChars(document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-left')[0].getElementsByClassName('resume-photo')[0].getElementsByClassName('exp-salary')[0].getElementsByClassName("pageRow exp-salary-label-bold salary_value")[0].innerHTML.replace(removeTagsRegex, '').trim());
            }

        } catch (ex) {
            console.log(ex, "save jobstreet details.expected_salary");
        }

        // --- Age---

        try {
            if (document.getElementsByClassName('resume-header-inner') && document.getElementsByClassName('resume-header-inner')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[2] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[2].getElementsByClassName('colMiddle resume-summary-heading long-text-word') && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[2].getElementsByClassName('colMiddle resume-summary-heading long-text-word')[0] && document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[2].getElementsByClassName('colMiddle resume-summary-heading long-text-word')[0].innerHTML) {
                var tempAge = document.getElementsByClassName('resume-header-inner')[0].getElementsByClassName('resume-section-top-right')[0].getElementsByClassName('section-right-inner')[0].getElementsByClassName('new-pageRow')[2].getElementsByClassName('colMiddle resume-summary-heading long-text-word')[0].innerHTML.trim();

                details.age = parseInt(tempAge);
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.age");
        }

        // ---work history ---

        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[0] && document.getElementsByClassName('resume-detail')[0].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[0].getElementsByClassName('resume-detail-summary').length) {
                details.work_history = [];

                for (var i = 0; i < document.getElementsByClassName('resume-detail')[0].getElementsByClassName('resume-detail-summary').length; i++) {
                    var tempEmpHistory = {};
                    var tempDomObj = document.getElementsByClassName('resume-detail')[0].getElementsByClassName('resume-detail-summary')[i];
                    // ---experience---
                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[1] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[1].innerHTML) {
                            var tempExpStr = tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[1].innerHTML.replace('(', '').trim();
                            if (tempExpStr && (tempExpStr.indexOf('years') > -1 || tempExpStr.indexOf('year') > -1)) {
                                if (tempExpStr && tempExpStr.split('years') && tempExpStr.split('years')[0]) {
                                    tempExp = removeExtraChars(tempExpStr.split('years')[0].trim());
                                }

                                tempExp += '.';
                                if (tempExpStr && tempExpStr.split('years') && tempExpStr.split('years')[1])
                                    tempExp += removeExtraChars(tempExpStr.split('years')[1].trim()).split(' ')[0];
                                if (tempExp && parseFloat(tempExp) != NaN) {
                                    tempEmpHistory.experience = parseFloat(tempExp);
                                }
                            }

                            if (tempExpStr && tempExpStr.indexOf('years') == -1 && tempExpStr.indexOf('month') > -1) {
                                tempExp = '.';
                                if (tempExpStr && tempExpStr.split('month') && tempExpStr.split('month')[0])
                                    tempExp += removeExtraChars(tempExpStr.split('month')[0].trim());
                                if (tempExp && parseFloat(tempExp) != NaN) {
                                    tempEmpHistory.experience = parseFloat(tempExp);
                                }
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.experience");
                    }

                    // --duration--

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[0].innerHTML) {
                            var tempDuration = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.duration = tempDuration;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.duration");
                    }

                    // ---job Title---

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0].innerHTML) {
                            var tempJobTitle = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.job_title = tempJobTitle;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.job_title");
                    }

                    // --- company Name---
                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML) {
                            var tempCompanyName = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.employer = tempCompanyName;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.employer");
                    }

                    // --- industry---
                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[0].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[0].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[0].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML) {

                            var tempIndustry = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[0].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.industry = tempIndustry;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.industry");
                    }

                    // --- specialization---
                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[1] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[1].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[1].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[1].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML) {

                            var tempSpecialization = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[1].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML.trim().replace(removeTagsRegex, ''));

                            tempEmpHistory.specialization = tempSpecialization;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.specialization");
                    }

                    // ---position level---

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[2] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[2].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[2].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[2].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML) {

                            var tempPositionLevel = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[2].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.position_level = tempPositionLevel;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.position_level");
                    }

                    // ---role---

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[3] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[3].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[3].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[3].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML) {

                            var tempRole = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[3].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.role = tempRole;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.role");
                    }

                    // ---monthly salary---

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[4] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[4].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[4].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[4].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML) {

                            var tempMonthlySalary = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-item-inner resume-margin')[4].getElementsByClassName('resume-detail-item-inner-middle resume-summary-heading')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.monthly_salary = tempMonthlySalary;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.monthly_salary");
                    }

                    // ---summary---

                    try {
                        if (tempDomObj && tempDomObj.getElementsByClassName('resume-detail-item2') && tempDomObj.getElementsByClassName('resume-detail-item2')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow long-text resume-label-dark-grey') && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow long-text resume-label-dark-grey')[0] && tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow long-text resume-label-dark-grey')[0].innerHTML) {

                            var tempSummary = removeExtraChars(tempDomObj.getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow long-text resume-label-dark-grey')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempEmpHistory.summary = tempSummary;
                        }
                    } catch (ex) {
                        console.log(ex, "save jobstreet tempEmpHistory.summary");
                    }

                    console.log(tempEmpHistory);
                    details.work_history.push(tempEmpHistory);
                }
            }
        } catch (err) {
            console.log(err);
        }

        // --- education details_1---
        details.education = [];
        // ---year of passing---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0].innerHTML) {
                var tempYearOfPassing_1 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0].innerHTML.trim().replace(removeTagsRegex, ''));

            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempYearOfPassing_1");
        }

        // --- university---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow pageRow resume-detail-position long-text-word')[0].innerHTML) {
                var tempUniversity_1 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempUniversity_1");
        }
        // --- education details---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML) {
                var tempEducationDetails_1 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempEducationDetails_1");
        }


        if (tempYearOfPassing_1 && tempUniversity_1 && tempEducationDetails_1) {
            details.education.push({ 'passing_year': tempYearOfPassing_1, 'institution': tempUniversity_1, 'education': tempEducationDetails_1 });
        }

        // --- education details_2---
        //  ---year of passing_2---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0].innerHTML) {
                var tempYearOfPassing_2 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colLeft resume-detail-item-left')[0].getElementsByClassName('resume-detail-item-label grad_year')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempYearOfPassing_2");
        }

        //  ---University_2---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0].innerHTML) {
                var tempUniversity_2 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-detail-position long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempUniversity_2");
        }

        // ---education_details_2---

        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word') && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0] && document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML) {
                var tempEducation_Details_2 = removeExtraChars(document.getElementsByClassName('resume-detail')[1].getElementsByClassName('resume-detail-summary')[1].getElementsByClassName('resume-detail-item2')[0].getElementsByClassName('colMiddle resume-detail-item-middle')[0].getElementsByClassName('pageRow resume-company-location long-text-word')[0].innerHTML.trim().replace(removeTagsRegex, ''));
            }

        } catch (ex) {
            console.log(ex, "save jobstreet tempEducation_Details_2");
        }


        if (tempYearOfPassing_2 && tempUniversity_2 && tempEducation_Details_2) {
            details.education.push({ 'passing_year': tempYearOfPassing_2, 'institution': tempUniversity_2, 'education': tempEducation_Details_2 });
        }

        // --- primarySkills_1---
        details.primary_skills = [];

        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[2] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[0].getElementsByClassName('pageRow resume-font-14') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[0].getElementsByClassName('pageRow resume-font-14')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[0].getElementsByClassName('pageRow resume-font-14')[0].innerHTML) {
                var tempPrimarySkills = removeExtraChars(document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[0].getElementsByClassName('pageRow resume-font-14')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempPrimarySkills && tempPrimarySkills.split(',') && tempPrimarySkills.split(',').length) {
                    for (var i = 0; i < tempPrimarySkills.split(',').length; i++) {
                        details.primary_skills.push(tempPrimarySkills.split(',')[i]);
                    }
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.primary_skills");
        }
        // --- primarySkills_2---
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[2] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[1] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[1].getElementsByClassName('pageRow resume-font-14') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[1].getElementsByClassName('pageRow resume-font-14')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[1].getElementsByClassName('pageRow resume-font-14')[0].innerHTML) {
                var tempPrimarySkills = removeExtraChars(document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[1].getElementsByClassName('pageRow resume-font-14')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempPrimarySkills && tempPrimarySkills.split(',') && tempPrimarySkills.split(',').length) {
                    for (var i = 0; i < tempPrimarySkills.split(',').length; i++) {
                        details.primary_skills.push(tempPrimarySkills.split(',')[i]);
                    }
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.primary_skills");
        }

        // ---SecondarySkills_2---
        details.secondary_skills = [];
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[2] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[2] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[2].getElementsByClassName('pageRow resume-font-14') && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[2].getElementsByClassName('pageRow resume-font-14')[0] && document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[2].getElementsByClassName('pageRow resume-font-14')[0].innerHTML) {
                var tempSecondarySkills = removeExtraChars(document.getElementsByClassName('resume-detail')[2].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item')[0].getElementsByClassName('colMiddle resume-detail-item-middle resume-line-height')[2].getElementsByClassName('pageRow resume-font-14')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempSecondarySkills && tempSecondarySkills.split(',') && tempSecondarySkills.split(',').length) {

                    details.secondary_skills = tempSecondarySkills.split(',');

                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.secondary_skills");
        }

        // ---languages---
        details.languages = [];
        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[3] && document.getElementsByClassName('resume-detail')[3] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[0] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[0].getElementsByClassName('resume-detail-item-language-left') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[0].getElementsByClassName('resume-detail-item-language-left')[0] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[0].getElementsByClassName('resume-detail-item-language-left')[0].innerHTML) {
                var tempLanguage = removeExtraChars(document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[0].getElementsByClassName('resume-detail-item-language-left')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempLanguage && tempLanguage != '') {
                    details.languages.push(tempLanguage);
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.languages");
        }

        try {
            if (document.getElementsByClassName('resume-detail') && document.getElementsByClassName('resume-detail')[3] && document.getElementsByClassName('resume-detail')[3] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[1] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[1].getElementsByClassName('resume-detail-item-language-left') && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[1].getElementsByClassName('resume-detail-item-language-left')[0] && document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[1].getElementsByClassName('resume-detail-item-language-left')[0].innerHTML) {
                var tempLanguage = removeExtraChars(document.getElementsByClassName('resume-detail')[3].getElementsByClassName('resume-detail-summary')[0].getElementsByClassName('resume-detail-item-language resume-font-14')[1].getElementsByClassName('resume-detail-item-language-left')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                if (tempLanguage && tempLanguage != '') {
                    details.languages.push(tempLanguage);
                }
            }
        } catch (ex) {
            console.log(ex, "save jobstreet details.languages");
        }


        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }

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

        details.portal_id = portalId;

        //console.log(req.body.isTallint, req.body.isIntranet);
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
};

var bestJobsDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var lastModifiedDate = undefined;
        var uniqueID = undefined;

        try {
            //unique ID
            try {
                if (element.getElementsByTagName('a')) {
                    if (element.getElementsByTagName('a')[0] && element.getElementsByTagName('a')[0].id) {
                        uniqueID = element.getElementsByTagName('a')[0].id;
                        if (uniqueID && typeof uniqueID != "string") {
                            uniqueID = uniqueID.toString();
                        }
                    }
                }
            } catch (ex) {
                console.log(ex, "check bestJobs uniqueID");
            }
            //lastModifiedDate
            try {
                var last_modified_element = element.getElementsByClassName('fecha')[0];
                if (last_modified_element && last_modified_element.getElementsByTagName('p')[0]) {
                    var tempLastModifiedDate = removeExtraChars(last_modified_element.getElementsByTagName('p')[0].innerHTML.split('Updated ')[1]);
                    var today = new Date();
                    if (tempLastModifiedDate.indexOf('Today') > -1) {
                        lastModifiedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    } else if (tempLastModifiedDate.indexOf('Yesterday') > -1) {
                        today.setDate(today.getDate() - 1);
                        lastModifiedDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate());
                    } else {
                        if (tempLastModifiedDate.split(' ').length == 2) {
                            tempLastModifiedDate = tempLastModifiedDate + ' ' + '2019';
                        }
                        lastModifiedDate = dateConverter(tempLastModifiedDate);
                    }
                }
            } catch (ex) {
                console.log(ex, "check bestJobs lastModifiedDate");
            }
            return { uid: uniqueID, last_modified_date: lastModifiedDate, portal_id: portalId, index: index }
        } catch (err) {
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
            try {
                //console.log("req.body.is_select_all", req.body.is_select_all);
                for (var i = 0; i < document.getElementsByClassName('cm-12 box box_c cp devclick').length; i++) {
                    var element = document.getElementsByClassName('cm-12 box box_c cp devclick')[i];

                    let applicant = bestJobsDuplicationParsing(element, i, 14);

                    // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromBestJobsPortal");
            }
            //console.log("applicants", applicants);
        } else {
            //console.log("else part");
            try {
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = document.getElementsByClassName('cm-12 box box_c cp devclick')[selected_candidates[i]];

                    let applicant = bestJobsDuplicationParsing(element, selected_candidates[i], 14);

                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromBestJobsPortal");
            }
        }

        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
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

        var portalId = 14; // best jobs
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);

        //name
        try {
            if (document.getElementById('headerCvDetail') && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0] && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML && document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML.split('of')[1]) {
                var tempName = removeExtraChars(document.getElementById('headerCvDetail').getElementsByTagName('strong')[0].innerHTML.split('of ')[1]);
                if (tempName) {
                    var tempArr = tempName.split(' ');

                    details.last_name = tempArr.splice(tempArr.length - 1, 1)[0];
                    details.first_name = tempArr.join(' ');
                }
            }
        } catch (ex) {
            console.log(ex, "save bestjobs details.first_name");
        }
        for (var i = 0; i < document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li').length; i++) {
            try {
                if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('icon email').length) {
                    details.emailId = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].innerHTML.split('</span>')[1]);
                }
            } catch (ex) {
                console.log(ex, "save bestjobs details.emailId");
            }
            try {
                if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('fl fw_n mt3').length) {
                    if (!details.mobileNumber) {
                        details.mobile_number = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('fl fw_n mt3')[0].innerHTML);
                    }
                }
            } catch (ex) {
                console.log(ex, "save bestjobs details.mobile_number");
            }
            try {
                if (document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].getElementsByClassName('icon pais').length) {
                    details.location = removeExtraChars(document.getElementsByClassName('cm-3 box_p_icon')[0].getElementsByTagName('ul')[1].getElementsByTagName('li')[i].innerHTML.split('</span>')[1]);
                }
            } catch (ex) {
                console.log(ex, "save bestjobs details.location");
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
                            details.last_modified_date = tempLastModifiedDate;
                        }
                    }
                }
            }


        } catch (ex) {
            console.log(ex, "save bestjobs details.last_modified_date ");
        }

        var xml_string = req.body.xml_string;
        if (xml_string && xml_string.split("idcv: '")[1] && xml_string.split("idcv: '")[1].split("',")[0]) {
            details.uid = xml_string.split("idcv: '")[1].split("',")[0];
        }

        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }
        if (req.body.attachment) {
            var attachment1 = req.body.attachment.split(',');
            if (attachment1.length && attachment1[0] && attachment1[1]) {
                details.resume_document = attachment1[1];
                var filetype = '';
                if (document.getElementById('cvCandidatePdf')) {
                    if (document.getElementById('cvCandidatePdf').getElementsByClassName('icon doc_hdv')[0]) {
                        filetype = "docx";
                    } else {
                        filetype = "pdf";
                    }
                }
                details.resume_extension = '.' + filetype || 'docx';
            }
        }
        details.portal_id = portalId;
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);
    } catch (ex) {
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
            return { first_name: firstName, last_name: lastName, emailId: emailId, mobile_number: mobileNumber, uid: uniqueID, last_modified_date: lastModifiedDate, portal_id: portalId, index: index }
        } catch (err) {
            console.log(err, "jobSearchDuplicationParsing");
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
            try {
                for (var i = 0; i < candidate_details.length; i++) {
                    var element = candidate_details[i];

                    let applicant = jobSearchDuplicationParsing(element, i, 15);

                    // applicants.push({ portalId: 7, index: i, lastModifiedDate: lastModifiedDate, uid: uniqueID });
                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromJobSearchPortal");
            }            //console.log("applicants", applicants);
        } else {
            try {
                //console.log("else part");
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = candidate_details[selected_candidates[i]];

                    let applicant = jobSearchDuplicationParsing(element, selected_candidates[i], 15);

                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromJobSearchPortal");
            }
        }
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
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

        var portalId = 15; // JobSearch
        var cvSourceId = 2;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document; // = req.body.xml_string || JSON.parse(req.body.xml_string).window.document;

        if (typeof req.body.xml_string == "string") {
            document = JSON.parse(req.body.xml_string);
        } else {
            document = req.body.xml_string;
        }

        try {
            if (document.FirstName) {
                details.first_name = document.FirstName;
            }

            if (document.LastName) {
                details.last_name = document.LastName;
            }

            if (document.Details && document.Details.EmailAddress) {
                details.emailId = document.Details.EmailAddress;
            }

            if (document.Details && document.Details.MobilePhoneNumber) {
                details.mobile_number = document.Details.MobilePhoneNumber;
            }

            if (document.CandidateId) {
                details.uid = document.CandidateId;
            }

            var last_modified_element = document.UpdatedOn;
            if (last_modified_element) {
                var temp_last_modified = new Date(last_modified_element);
                if (temp_last_modified && temp_last_modified.getDate() && temp_last_modified.getMonth() && temp_last_modified.getFullYear()) {
                    details.last_modified_date = temp_last_modified.getFullYear() + '-' + (temp_last_modified.getMonth() + 1) + '-' + temp_last_modified.getDate();
                }
            }
        } catch (err) {
            console.log(err, "saveApplicantsFromJobSearch");
        }


        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }



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

        details.portal_id = portalId;
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);
    } catch (ex) {
        console.log("ex", ex);
        res.status(500).send({ message: "Error occured" });
    }
};


// check applicant from portal importer
portalimporter.checkApplicantForPacehcm = function (req, res, next) {
    //req.body.applicants
    checkPortalApplicants(req.query.portalId, req.body.applicants, req, res);

}


// save applicant from portal importer
portalimporter.saveApplicantForPacehcm = function (req, res, next) {
    //req.body.applicants
    savePortalApplicants(req.query.portalId, req.body.portalId, req.body, req, res);

}

portalimporter.checkApplicantExistsFromFreshersWorldPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 16; // shine
    try {
        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        console.log("document 2734829", document)
        var selected_candidates = req.body.selected_candidates;
        var is_select_all = req.body.is_select_all;
        var tempResume = {};
        var applicants = [];
        var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;
        if (document && document.getElementById('search_result') && document.getElementById('search_result').getElementsByClassName("media")) {
            var search_results = document.getElementById('search_result').getElementsByClassName("media");
        }
        //console.log('search_results', search_results.length)
        if (is_select_all == 1) {
            if (search_results)
                for (var i = 0; i < search_results.length; i++) {
                    console.log(i);
                    if (search_results[i]) {
                        console.log(i);

                        // freshers World name
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0].innerHTML) {
                                var tempName = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0].innerHTML.trim());
                                var first_name = "";
                                var last_name = ""
                                if (tempName && tempName.split(' ')[0]) {
                                    first_name = tempName.split(' ')[0].trim();
                                }
                                if (tempName && tempName.split(' ')[1]) {
                                    last_name = tempName.split(' ')[1].trim();
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "freshers world Name")
                        }
                        // freshers World uid
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0].innerHTML) {

                                var uniqueID = ""
                                var tempId = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0].innerHTML.trim());

                                uniqueID = tempId.replace('(', '').replace(')', '');

                            }
                        } catch (ex) {
                            console.log(ex, "freshers world uniqueID")
                        }

                        // freshers World last modified date
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span') && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1] && search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1].innerHTML) {
                                var tempLastModDate = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1].innerHTML.trim());
                                var lastModifiedDate = "";
                                if (tempLastModDate && tempLastModDate.split(":") && tempLastModDate.split(":")[1]) {
                                    lastModifiedDate = dateConverter(tempLastModDate.split(":")[1].replace("-", ' ').replace("-", ' '));
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "freshers world last modified date")
                        }
                        // freshers World last education
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0].innerHTML) {
                                var tempEduStr = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0].innerHTML.trim());
                                var education = [];
                                var tempEducation = { institution: '', qualification: '', specialization: '' };
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[0] && tempEduStr.split('from')[0].split(',')[0]) {
                                    tempEducation.qualification = removeExtraChars(tempEduStr.split('from')[0].split(',')[0].trim());
                                }
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[0] && tempEduStr.split('from')[0].split(',')[1]) {
                                    tempEducation.specialization = removeExtraChars(tempEduStr.split('from')[0].split(',')[1].trim());
                                }
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[1] && tempEduStr.split('from')[1].split(',')[0]) {
                                    tempEducation.institution = removeExtraChars(tempEduStr.split('from')[1].split(',')[0].trim());
                                }
                                education.push(tempEducation);
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world education')
                        }

                        // freshers World skills
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1].innerHTML) {
                                var tempSkillsStr = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1].innerHTML.trim());
                                var primarySkills = [];
                                if (tempSkillsStr && tempSkillsStr.split(":") && tempSkillsStr.split(":")[1].trim() && tempSkillsStr.split(":")[1].trim().split(',')) {
                                    tempSkills = tempSkillsStr.split(":")[1].trim().split(',');
                                    var length = tempSkills.length;
                                    for (var p = 0; p < length; p++) {
                                        primarySkills.push(tempSkills[p].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world primarySkills')
                        }
                        // freshers World Languages
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2].innerHTML) {
                                var tempLangStr = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2].innerHTML.trim());
                                var languages = [];
                                if (tempLangStr && tempLangStr.split(':') && tempLangStr.split(':')[1].trim() && tempLangStr.split(':')[1].trim().split(',')) {
                                    var tempLang = tempLangStr.split(':')[1].trim().split(',');

                                    var length = tempLang.length;
                                    for (var l = 0; l < length; l++) {
                                        languages.push(tempLang[l].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world languages')
                        }

                        // freshers World specialization
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3].innerHTML) {
                                var tempSpecStr = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3].innerHTML.trim());
                                var specialization = [];
                                if (tempSpecStr && tempSpecStr.split(':') && tempSpecStr.split(':')[1].trim() && tempSpecStr.split(':')[1].trim().split(',')) {
                                    var tempSpec = tempSpecStr.split(':')[1].trim().split(',');

                                    var length = tempSpec.length;
                                    for (var s = 0; s < length; s++) {
                                        specialization.push(tempSpec[s].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world specialization')
                        }

                        // Freshers World JobTitle and Employer
                        try {
                            if (search_results[i] && search_results[i].getElementsByClassName('media-body') && search_results[i].getElementsByClassName('media-body')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4].innerHTML) {
                                var tempJobTitleStr = removeExtraChars(search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4].innerHTML.trim());
                                var tempJobTitle = tempJobTitleStr.split(":")[1];
                                var job_title = "";
                                if (tempJobTitle && tempJobTitle.split('at') && tempJobTitle.split('at')[0].trim()) {
                                    job_title = tempJobTitle.split('at')[0].trim()
                                }
                                var employer = "";
                                if (tempJobTitle && tempJobTitle.split('at') && tempJobTitle.split('at')[1].trim()) {
                                    employer = tempJobTitle.split('at')[1].trim()
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world JobTitle and Employer')
                        }

                        // Freshers World location

                        try {
                            if (document && document.getElementById('search_result') && document.getElementById('search_result').getElementsByClassName('row') && document.getElementById('search_result').getElementsByClassName('row')[i] && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-map-marker vdivide') && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0] && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0].innerText) {
                                var tempLocStr = removeExtraChars(document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0].innerText.trim());
                                var loc = "";
                                if (tempLocStr) {
                                    loc = tempLocStr.trim();
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world location')
                        }
                        // Freshers World experience
                        try {
                            if (document && document.getElementById('search_result') && document.getElementById('search_result').getElementsByClassName('row') && document.getElementById('search_result').getElementsByClassName('row')[i] && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-briefcase vdivide') && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0] && document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0].innerText) {
                                var tempExpStr = removeExtraChars(document.getElementById('search_result').getElementsByClassName('row')[i].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0].innerText.trim());
                                var experience = "";
                                if (tempExpStr) {
                                    experience = tempExpStr.trim().split(" ")[0];
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world experience')
                        }

                        applicants.push({ first_name: first_name, last_name: last_name, portal_id: 16, index: i, last_modified_date: lastModifiedDate, uid: uniqueID, education: education, primary_skills: primarySkills, languages: languages, specialization: specialization, job_title: job_title, employer: employer, location: loc, experience: experience });
                        console.log('applicants', applicants);

                    }
                }
        } else {
            // console.log(document.getElementsByClassName('userChk')[0].checked);
            if (search_results) {
                console.log("search_results", search_results);
                for (var i = 0; i < selected_candidates.length; i++) {
                    if (selected_candidates[i] >= 0) {
                        console.log("selected Enter", selected_candidates, selected_candidates[i]);
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0].innerHTML) {
                                var tempName = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByClassName('candidate_gloabalurl')[0].innerHTML.trim());
                                var first_name = "";
                                var last_name = ""
                                if (tempName && tempName.split(' ')[0]) {
                                    first_name = tempName.split(' ')[0].trim();
                                }
                                if (tempName && tempName.split(' ')[1]) {
                                    last_name = tempName.split(' ')[1].trim();
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "freshers world Name")
                        }
                        // freshers World uid
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0].innerHTML) {

                                var uniqueID = ""
                                var tempId = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[0].innerHTML.trim());
                                uniqueID = tempId.replace('(', '').replace(')', '');

                            }
                        } catch (ex) {
                            console.log(ex, "freshers world uniqueID")
                        }

                        // freshers World last modified date
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('candidate_gloabalurl') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1].innerHTML) {
                                var tempLastModDate = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByClassName('media-heading')[0].getElementsByTagName('span')[1].innerHTML.trim());
                                var lastModifiedDate = "";
                                if (tempLastModDate && tempLastModDate.split(":") && tempLastModDate.split(":")[1]) {
                                    lastModifiedDate = dateConverter(tempLastModDate.split(":")[1].replace("-", ' ').replace("-", ' '));
                                }
                            }
                        } catch (ex) {
                            console.log(ex, "freshers world last modified date")
                        }
                        // freshers World last education
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0] && search_results[i].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0].innerHTML) {
                                var tempEduStr = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[0].innerHTML.trim());
                                var education = [];
                                var tempEducation = { institution: '', qualification: '', specialization: '' };
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[0] && tempEduStr.split('from')[0].split(',')[0]) {
                                    tempEducation.qualification = removeExtraChars(tempEduStr.split('from')[0].split(',')[0].trim());
                                }
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[0] && tempEduStr.split('from')[0].split(',')[1]) {
                                    tempEducation.specialization = removeExtraChars(tempEduStr.split('from')[0].split(',')[1].trim());
                                }
                                if (tempEduStr && tempEduStr.split('from') && tempEduStr.split('from')[1] && tempEduStr.split('from')[1].split(',')[0]) {
                                    tempEducation.institution = removeExtraChars(tempEduStr.split('from')[1].split(',')[0].trim());
                                }
                                education.push(tempEducation);
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world education')
                        }

                        // freshers World skills
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1].innerHTML) {
                                var tempSkillsStr = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[1].innerHTML.trim());
                                var primarySkills = [];
                                if (tempSkillsStr && tempSkillsStr.split(":") && tempSkillsStr.split(":")[1].trim() && tempSkillsStr.split(":")[1].trim().split(',')) {
                                    tempSkills = tempSkillsStr.split(":")[1].trim().split(',');
                                    var length = tempSkills.length;
                                    for (var p = 0; p < length; p++) {
                                        primarySkills.push(tempSkills[p].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world primarySkills')
                        }
                        // freshers World Languages
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2].innerHTML) {
                                var tempLangStr = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[2].innerHTML.trim());
                                var languages = [];
                                if (tempLangStr && tempLangStr.split(':') && tempLangStr.split(':')[1].trim() && tempLangStr.split(':')[1].trim().split(',')) {
                                    var tempLang = tempLangStr.split(':')[1].trim().split(',');

                                    var length = tempLang.length;
                                    for (var l = 0; l < length; l++) {
                                        languages.push(tempLang[l].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world languages')
                        }

                        // freshers World specialization
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3].innerHTML) {
                                var tempSpecStr = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[3].innerHTML.trim());
                                var specialization = [];
                                if (tempSpecStr && tempSpecStr.split(':') && tempSpecStr.split(':')[1].trim() && tempSpecStr.split(':')[1].trim().split(',')) {
                                    var tempSpec = tempSpecStr.split(':')[1].trim().split(',');

                                    var length = tempSpec.length;
                                    for (var s = 0; s < length; s++) {
                                        specialization.push(tempSpec[s].trim());
                                    }
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world specialization')
                        }

                        // Freshers World JobTitle and Employer
                        try {
                            if (search_results[selected_candidates[i]] && search_results[selected_candidates[i]].getElementsByClassName('media-body') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div') && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4] && search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4].innerHTML) {
                                var tempJobTitleStr = removeExtraChars(search_results[selected_candidates[i]].getElementsByClassName('media-body')[0].getElementsByTagName('div')[4].innerHTML.trim());
                                var tempJobTitle = tempJobTitleStr.split(":")[1];
                                var job_title = "";
                                if (tempJobTitle && tempJobTitle.split('at') && tempJobTitle.split('at')[0].trim()) {
                                    job_title = tempJobTitle.split('at')[0].trim()
                                }
                                var employer = "";
                                if (tempJobTitle && tempJobTitle.split('at') && tempJobTitle.split('at')[1].trim()) {
                                    employer = tempJobTitle.split('at')[1].trim()
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world JobTitle and Employer')
                        }

                        // Freshers World location

                        try {
                            if (document && document.getElementById('search_result') && document.getElementById('search_result').getElementsByClassName('row') && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]] && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-map-marker vdivide') && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0] && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0].innerText) {
                                var tempLocStr = removeExtraChars(document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-map-marker vdivide')[0].innerText.trim());
                                var loc = "";
                                if (tempLocStr) {
                                    loc = tempLocStr.trim();
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world location')
                        }
                        // Freshers World experience
                        try {
                            if (document && document.getElementById('search_result') && document.getElementById('search_result').getElementsByClassName('row') && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]] && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-briefcase vdivide') && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0] && document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0].innerText) {
                                var tempExpStr = removeExtraChars(document.getElementById('search_result').getElementsByClassName('row')[selected_candidates[i]].getElementsByClassName('glyphicon glyphicon-briefcase vdivide')[0].innerText.trim());
                                var experience = "";
                                if (tempExpStr) {
                                    experience = tempExpStr.trim().split(" ")[0];
                                }
                            }
                        } catch (ex) {
                            console.log(ex, 'freshers world experience')
                        }

                        applicants.push({ first_name: first_name, last_name: last_name, portal_id: 16, index: selected_candidates[i], last_modified_date: lastModifiedDate, uid: uniqueID, education: education, primary_skills: primarySkills, languages: languages, specialization: specialization, job_title: job_title, employer: employer, location: loc, experience: experience });
                        console.log('applicants', applicants);
                    }
                }
            }
        }
        console.log('applicants', applicants);

        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }
};


portalimporter.saveApplicantsFromFreshersWorld = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var portalId = 16; // Shine
    var cvSourceId = 16;

    var details = {};

    try {
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // first name and last name
        try {
            details.first_name = "";
            details.last_name = "";
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-first-name") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-first-name")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-first-name")[0].innerHTML) {
                var tempName = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-first-name")[0].innerHTML.trim())

                if (tempName && tempName.split(" ") && tempName.split(" ")[0]) {
                    details.first_name = tempName.split(" ")[0];
                }
                if (tempName && tempName.split(" ") && tempName.split(" ")[1]) {
                    details.last_name = tempName.split(" ")[1];
                }
            }
        } catch (ex) {
            console.log("save freshersworlds name", ex)
        }

        //unique ID

        try {
            details.uid = ""
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("pull-right bg-fwid-board") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("pull-right bg-fwid-board")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("pull-right bg-fwid-board")[0].innerHTML) {
                var tempUid = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("pull-right bg-fwid-board")[0].innerHTML.trim());
                if (tempUid) {
                    details.uid = tempUid;
                }
            }
        } catch (ex) {
            console.log("save freshersworlds uniqueID", ex)
        }

        //education 
        try {
            details.education = { qualification: "", specialization: "", institution: "", passing_year: "" };
            // education qualification
            try {
                if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].getElementsByTagName("strong") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].getElementsByTagName("strong")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].getElementsByTagName("strong")[0].innerHTML) {
                    var tempQual = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].getElementsByTagName("strong")[0].innerHTML.trim());
                    if (tempQual && tempQual.trim()) {
                        details.education.qualification = tempQual.trim()
                    }
                }
            } catch (ex) {
                console.log("save freshersWorlds education.qualification", ex)
            }

            // education specialization
            try {
                if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].innerHTML) {
                    var tempSpecStr = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font no-bot-mar")[0].innerHTML.trim());
                    if (tempSpecStr.split("(") && tempSpecStr.split("(").length && tempSpecStr.split("(")[1]) {
                        var tempEduSpec = tempSpecStr.split("(")[1].trim();
                    }
                    if (tempEduSpec && tempEduSpec.trim()) {
                        details.education.specialization = tempEduSpec.trim()
                    }
                }
            } catch (ex) {
                console.log("save freshersWorlds education.specialization", ex)
            }
            // education institution
            try {
                if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font")[1] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font")[1].innerHTML) {
                    var tempInsti = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("resume-header-norm-font")[1].innerHTML.trim());
                    if (tempInsti && tempInsti.trim()) {
                        details.education.institution = tempInsti.trim()
                    }
                }
            } catch (ex) {
                console.log("save freshersWorlds education.institution", ex)
            }
            // education passing year
            try {
                if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0].innerHTML) {
                    var tempPassYear = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0].innerHTML.trim());
                    if (tempPassYear && tempPassYear.split("|")[1].trim() && tempPassYear.split("|")[1].trim() && tempPassYear.split("|")[1].trim().split(" ") && tempPassYear.split("|")[1].trim().split(" ")[0] && tempPassYear.split("|")[1].trim().split(" ")[0].trim()) {
                        details.education.passing_year = tempPassYear.split("|")[1].trim().split(" ")[0].trim();
                    }
                }
            } catch (ex) {
                console.log("save freshersWorlds education.passing_year year", ex)
            }

        } catch (ex) {
            console.log("save freshersWorlds education", ex)
        }
        // location
        try {
            details.location = ""
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0].innerHTML) {
                var templocStr = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("no-bot-mar hidden-xs")[0].innerHTML.trim());
                if (templocStr && templocStr.split("|")[0].trim() && templocStr.split("|")[0].trim() && templocStr.split("|")[0].trim().split(":") && templocStr.split("|")[0].trim().split(":")[1]) {
                    details.location = templocStr.split("|")[0].trim().split(":")[1].trim();
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds education.passing_year year", ex)
        }

        // ceat Score
        try {
            details.ceat_score = ""
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("ceat_score_block") && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("ceat_score_block")[0] && document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("ceat_score_block")[0].innerHTML) {
                var tempCeatScore = removeExtraChars(document.getElementsByClassName("row negateRow")[0].getElementsByClassName("border-top-bottom border-left-right first_box")[0].getElementsByClassName("ceat_score_block")[0].innerHTML.trim());
                if (tempCeatScore && tempCeatScore.split(":") && tempCeatScore.split(":")[1].trim() && tempCeatScore.split(":")[1].trim().split(" ") && tempCeatScore.split(":")[1].trim().split(" ")[0]) {
                    details.ceat_score = tempCeatScore.split(":")[1].trim().split(" ")[0].trim();
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds education.ceat_score", ex)
        }

        // primary skills

        // try {
        //     details.primary_skills = []
        //     if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0].getElementsByClassName("col-md-9 col-xs-6") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0].getElementsByClassName("col-md-9 col-xs-6")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0].getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
        //         var tempPrimSkillStr = removeExtraChars(document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0].getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
        //         if (tempPrimSkillStr) {
        //             var tempPrimSkill = tempPrimSkillStr.slice(1).split(",");
        //             var length = tempPrimSkill.length;
        //             for (var p = 0; p < length; p++) {
        //                 details.primary_skills.push(tempPrimSkill[p].trim());
        //             }
        //         }
        //     }
        // } catch (ex) {
        //     console.log("save freshersWorlds education.primary_skills", ex)
        // }

        // primary skills

        try {
            details.primary_skills = []
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head")) {

                var tempRowElement = document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head");
                if (tempRowElement && tempRowElement.length) {
                    for (var e = 0; e < tempRowElement.length; e++) {
                        var tempSkillDetails = removeExtraChars(tempRowElement[e].innerHTML.trim());
                        if (tempSkillDetails.toUpperCase().indexOf("SKILLS") > -1) {
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempPrim = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempPrim && tempPrim.toUpperCase().indexOf("SKILLS SET") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempPrimSkills = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempPrimSkills) {
                                            tempPrimSkills = tempPrimSkills.slice(1).trim();
                                            tempPrimSkills = tempPrimSkills.split(",");
                                            var length = tempPrimSkills.length;
                                            for (var p = 0; p < length; p++) {
                                                details.primary_skills.push(tempPrimSkills[p].trim());
                                            }
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Gender", ex)
                            }


                        }
                    }
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds DOB,Gender,languages,address", ex)
        }

        // specialization

        // try {
        //     details.specialization = [];
        //     if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[1].getElementsByClassName("col-md-9 col-xs-6") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[1].getElementsByClassName("col-md-9 col-xs-6")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[1].getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
        //         var tempSpecStr = removeExtraChars(document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("row res-group")[1].getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
        //         if (tempSpecStr) {
        //             var tempSpecialization = tempSpecStr.slice(1).split(",");
        //             var length = tempSpecialization.length
        //             for (var s = 0; s < length; s++) {
        //                 details.specialization.push(tempSpecialization[s].trim());
        //             }
        //         }
        //     }
        // } catch (ex) {
        //     console.log("save freshersWorlds education.specialization", ex)
        // }

        // specialization

        try {
            details.specialization = [];
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head")) {

                var tempRowElement = document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head");
                if (tempRowElement && tempRowElement.length) {
                    for (var e = 0; e < tempRowElement.length; e++) {
                        var tempSpecDetails = removeExtraChars(tempRowElement[e].innerHTML.trim());
                        if (tempSpecDetails.toUpperCase().indexOf("CAREER PREFERENCES") > -1) {
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempSpec = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempSpec && tempSpec.toUpperCase().indexOf("PREFERRED JOB ROLES") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempSpecialization = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempSpecialization) {
                                            tempSpecialization = tempSpecialization.slice(1).trim();
                                            tempSpecialization = tempSpecialization.split(",");
                                            var length = tempSpecialization.length;
                                            for (var s = 0; s < length; s++) {
                                                details.specialization.push(tempSpecialization[s].trim());
                                            }
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Gender", ex)
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds DOB,Gender,languages,address", ex)
        }

        //experience and employer

        // try {
        //     details.experience = "";
        //     details.employer = "";
        //     details.jobTitle = "";
        //     if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group")[3] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group")[3].getElementsByTagName('p') && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group")[3].getElementsByTagName('p')[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group")[3].getElementsByTagName('p')[0].innerHTML) {
        //         var tempExpStr = removeExtraChars(document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("res-group")[3].getElementsByTagName('p')[0].innerHTML.trim());
        //         if (tempExpStr && tempExpStr.toUpperCase().indexOf("MONTH") > -1 && tempExpStr.split("month")[0].trim()) {
        //             var tempMonthStr = tempExpStr.split("month")[0].trim();
        //             var month = tempMonthStr.charAt(tempMonthStr.length - 1) || 0;
        //         }
        //         if (tempExpStr && tempExpStr.toUpperCase().indexOf("YEAR") > -1 && tempExpStr.split("year")[0].trim()) {
        //             var tempYearStr = tempExpStr.split("year")[0].trim();
        //             var year = tempYearStr.charAt(tempYearStr.length - 1) || 0;
        //         }
        //         if (month || year) {
        //             details.experience = year + "" + (Number(month / 12).toFixed(2) + "").slice(1);
        //         }

        //         if (tempExpStr && tempExpStr.substring(tempExpStr.indexOf("in ") + 2, tempExpStr.indexOf(" as")).trim()) {
        //             details.employer = tempExpStr.substring(tempExpStr.indexOf("in ") + 2, tempExpStr.indexOf(" as")).trim();
        //         }

        //         if (tempExpStr && tempExpStr.substring(tempExpStr.indexOf("as a") + 4).trim()) {
        //             details.jobTitle = tempExpStr.substring(tempExpStr.indexOf("as a") + 4).trim();
        //         }
        //     }
        // } catch (ex) {
        //     console.log("save freshersWorlds education.experience", ex)
        // }

        //experience and employer

        try {
            details.experience = 0;
            details.employer = "";
            details.jobTitle = "";
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head")) {

                var tempRowElement = document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head");
                if (tempRowElement && tempRowElement.length) {
                    for (var e = 0; e < tempRowElement.length; e++) {
                        var tempWorkDetails = removeExtraChars(tempRowElement[e].innerHTML.trim());
                        if (tempWorkDetails.toUpperCase().indexOf("WORK EXPERIENCE") > -1) {
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempExpStr = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempExpStr && tempExpStr.toUpperCase().indexOf("MONTH") > -1 && tempExpStr.split("month")[0].trim()) {
                                        var tempMonthStr = tempExpStr.split("month")[0].trim();
                                        var month = tempMonthStr.charAt(tempMonthStr.length - 1) || 0;
                                    }
                                    if (tempExpStr && tempExpStr.toUpperCase().indexOf("YEAR") > -1 && tempExpStr.split("year")[0].trim()) {
                                        var tempYearStr = tempExpStr.split("year")[0].trim();
                                        var year = tempYearStr.charAt(tempYearStr.length - 1) || 0;
                                    }
                                    if (month || year) {
                                        details.experience = year + "" + (Number(month / 12).toFixed(2) + "").slice(1);
                                        if (details.experience) {
                                            details.experience = parseFloat(details.experience);
                                        } else {
                                            details.experience = 0;
                                        }
                                    }

                                    if (tempExpStr && tempExpStr.substring(tempExpStr.indexOf("in ") + 2, tempExpStr.indexOf(" as")).trim()) {
                                        details.employer = tempExpStr.substring(tempExpStr.indexOf("in ") + 2, tempExpStr.indexOf(" as")).trim();
                                    }

                                    if (tempExpStr && tempExpStr.substring(tempExpStr.indexOf("as a") + 4).trim()) {
                                        details.jobTitle = tempExpStr.substring(tempExpStr.indexOf("as a") + 4).trim();
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Gender", ex)
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds DOB,Gender,languages,address", ex)
        }

        // DOB

        try {
            details.DOB = "";
            details.gender = "";
            details.languages = [];
            details.address = ""
            if (document && document.getElementsByClassName("row negateRow") && document.getElementsByClassName("row negateRow")[1] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right") && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0] && document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head")) {

                var tempRowElement = document.getElementsByClassName("row negateRow")[1].getElementsByClassName("border-top-bottom border-left-right")[0].getElementsByClassName("category-head");
                if (tempRowElement && tempRowElement.length) {
                    for (var e = 0; e < tempRowElement.length; e++) {
                        var tempPersonalDetails = removeExtraChars(tempRowElement[e].innerHTML.trim());
                        if (tempPersonalDetails.toUpperCase().indexOf("PERSONAL DETAILS") > -1) {
                            //DOB
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempDOBStr = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempDOBStr && tempDOBStr.toUpperCase().indexOf("DATE OF BIRTH") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempDOB = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempDOB) {
                                            tempDOB = tempDOB.slice(1).trim();
                                            console.log(tempDOB);
                                            details.DOB = tempDOB.split("-").reverse().join("-");
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Gender", ex)
                            }

                            // gender 
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempGenStr = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempGenStr && tempGenStr.toUpperCase().indexOf("GENDER") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempGen = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempGen) {
                                            tempGen = tempGen.replace("-", " ").replace("-", " ");
                                            if (tempGen && tempGen.toUpperCase().indexOf("MALE") > -1) {
                                                details.gender = "M"
                                            } else if (tempGen && tempGen.toUpperCase().indexOf("FEMALE") > -1) {
                                                details.gender = "F"
                                            } else {
                                                details.gender = ""
                                            }
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Gender", ex)
                            }
                            // Languages
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempLangStr = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempLangStr && tempLangStr.toUpperCase().indexOf("LANGUAGES KNOWN") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempLang = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempLang) {
                                            tempLang = tempLang.slice(1);
                                            var tempLangArr = tempLang.split(',');
                                            var length = tempLangArr.length;
                                            for (var l = 0; l < length; l++) {
                                                if (tempLangArr[l].trim())
                                                    details.languages.push(tempLangArr[l].trim());
                                            }
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Languages", ex)
                            }
                            // Address
                            try {
                                if (tempRowElement[e] && tempRowElement[e].nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML) {

                                    var tempAddStr = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML.trim());

                                    if (tempAddStr && tempAddStr.toUpperCase().indexOf("ADDRESS") > -1 && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6") && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0] && tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML) {
                                        var tempAdd = removeExtraChars(tempRowElement[e].nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.getElementsByClassName("col-md-9 col-xs-6")[0].innerHTML.trim());
                                        if (tempAdd) {
                                            tempAdd = tempAdd.slice(1);
                                            details.address = tempAdd.trim();
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log("save freshersWorlds Address", ex)
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds DOB,Gender,languages,address", ex)
        }
        // mobile Number
        try {
            details.mobile_number = "";
            if (document && document.getElementsByClassName("popover fade top in") && document.getElementsByClassName("popover fade top in")[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content") && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div') && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div') && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[1] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[1].innerHTML) {
                var tempMobileStr = removeExtraChars(document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[1].innerHTML.trim());
                if (tempMobileStr && tempMobileStr.toUpperCase().indexOf("MOBILE") > -1) {
                    details.mobile_number = tempMobileStr.split(":")[1].trim();
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds mobile number", ex)
        }

        // Email ID

        try {
            details.emailId = "";
            if (document && document.getElementsByClassName("popover fade top in") && document.getElementsByClassName("popover fade top in")[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content") && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div') && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div') && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[2] && document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[2].innerHTML) {
                var tempEmailStr = removeExtraChars(document.getElementsByClassName("popover fade top in")[0].getElementsByClassName("popover-content")[0].getElementsByTagName('div')[0].getElementsByTagName('div')[2].innerHTML.trim());
                if (tempEmailStr && tempEmailStr.toUpperCase().indexOf("EMAIL") > -1) {
                    details.emailId = tempEmailStr.split(":")[1].trim();
                }
            }
        } catch (ex) {
            console.log("save freshersWorlds email", ex)
        }
        details.portal_id = portalId

        console.timeEnd("Completed with parsing");
        // var isTallint = req.query.isTallint || 0;

        if (req.body.requirements) {
            try {
                if (typeof req.body.requirements == "string") {
                    try {
                        req.body.requirements = JSON.parse(req.body.requirements)
                    } catch (err) {
                        console.log(err);
                    }
                }
                if (req.body.requirements.length) {
                    details.requirements = req.body.requirements
                } else {
                    details.requirements = [parseInt(req.body.requirements)];
                }
            } catch (err) {
                console.log(err);
            }
        }


        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (ex) {
        console.log(ex);
        response.status = false;
        response.message = "Something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }
};

portalimporter.checkApplicantExistsFromJobCentral = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        var portalId = 17;
        // req = ''
        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;

        var length1 = 0;
        var length2 = 0;

        if (document && document.querySelector('table.reportTable')) {
            if (document.querySelector('table.reportTable').querySelectorAll('input[name="mail[]"]'))
                length1 = document.querySelector('table.reportTable').querySelectorAll('input[name="mail[]"]').length
        }

        if (req.is_select_all == 1) {
            try {
                for (var i = 0; i < length1 + length2; i++) {
                    var element = document.querySelectorAll('tbody>tr')[i]
                    let applicant = jobCentralDuplicationParsing(element, i, req.portalId || portalId);
                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromjobCentralPortal")
            }
        }
        else {
            try {
                for (var i = 0; i < selected_candidates.length; i++) {
                    var element = document.querySelectorAll('tbody>tr')[i]

                    let applicant = jobCentralDuplicationParsing(element, selected_candidates[i], req.portalId || portalId);

                    applicants.push(applicant);
                }
            } catch (ex) {
                console.log(ex, "checkApplicantExistsFromjobCentralPortal")
            }
        }

        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({});
    }
};
var jobCentralDuplicationParsing = function (element, index, portalId) {
    if (element) {
        var parseObj = {}
        // parseObj.lastModifiedDate = undefined;
        // parseObj.uniqueID = undefined;
        try {
            //unique ID
            try {

                if (element.getElementsByTagName('a') && element.getElementsByTagName('a')[0] && element.getElementsByTagName('a')[0].getAttribute('href') && element.getElementsByTagName('a')[0].getAttribute('href').split('/').length) {
                    parseObj.uniqueID = element.getElementsByTagName('a')[0].getAttribute('href').split('/')[element.getElementsByTagName('a')[0].getAttribute('href').split('/').length - 1]
                }

            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.uniqueID");
            }

            //lastModifiedDate
            try {
                var last_modified_element = element.getElementsByTagName('table');
                if (last_modified_element && last_modified_element[0] && last_modified_element[0].getElementsByTagName('tr')) {
                    for (let x = 0; x < last_modified_element[0].getElementsByTagName('tr').length; x++) {
                        if (last_modified_element[0].getElementsByTagName('tr')[x] && last_modified_element[0].getElementsByTagName('tr')[x].innerHTML) {
                            if (last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.indexOf('Last Modified') > -1) {
                                parseObj.lastModifiedDate = dateConverter(removeExtraChars(last_modified_element[0].getElementsByTagName('tr')[x].innerHTML.split(':')[1]));
                            }
                        }
                    }
                }
            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.lastModifiedDate");
            }
            // ---name---
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[2] && element.getElementsByTagName('td')[2].getElementsByTagName('a') && element.getElementsByTagName('td')[2].getElementsByTagName('a')[0] && element.getElementsByTagName('td')[2].getElementsByTagName('a') && element.getElementsByTagName('td')[2].getElementsByTagName('a')[0]) {
                    var temp_name = removeExtraChars(element.getElementsByTagName('td')[2].getElementsByTagName('a') && element.getElementsByTagName('td')[2].getElementsByTagName('a')[0].innerHTML);

                    if (temp_name.split(' ')) {
                        temp_name = temp_name.split(' ');
                        if (temp_name.length - 1 > 0) {
                            parseObj.lastName = temp_name.splice(temp_name.length - 1, 1)[0];
                        }
                        else {
                            parseObj.lastName = ''
                        }
                        if (temp_name[0]) {
                            parseObj.firstName = temp_name.join(' ');
                        }
                    }
                    console.log(parseObj.firstName, parseObj.lastName);
                }
            } catch (ex) {
                console.log(ex, "check jobCentral firstName lastName");
            }

            //    ---candidate details---
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[2] && element.getElementsByTagName('td')[2].innerHTML) {
                    var tempCandidateDetails = element.getElementsByTagName('td')[2].innerHTML.trim();

                    //---basic details---
                    if (tempCandidateDetails && tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>'))) {
                        var tempBasicDetails = tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>'))
                        try {
                            tempBasicDetails = tempCandidateDetails.substring(tempCandidateDetails.indexOf('<br>')).split('<br>')
                            tempBasicDetails = tempBasicDetails.filter(res => {
                                if (res) {
                                    return res
                                }
                            })
                        } catch (error) {

                        }
                    }

                    try {
                        if (tempBasicDetails && tempBasicDetails.length) {
                            try {
                                var temp_phone_number = tempBasicDetails[0]
                                if (temp_phone_number && parseInt(temp_phone_number) && !isNaN(temp_phone_number)) {
                                    parseObj.phone_number = parseInt(temp_phone_number);
                                }
                                else {
                                    var temp_phone_number = tempBasicDetails[1]
                                    if (temp_phone_number && parseInt(temp_phone_number) && !isNaN(temp_phone_number)) {
                                        parseObj.phone_number = parseInt(temp_phone_number);
                                    }
                                }
                            } catch (ex) {
                                console.log(ex, "check jobCentral  parseObj.phone_number");
                            }
                            //---emailId----
                            try {
                                var temp_emailId = tempBasicDetails[0]
                                if (temp_emailId && isNaN(temp_emailId)) {
                                    parseObj.mail_id = temp_emailId
                                }
                                else {
                                    var temp_emailId = tempBasicDetails[1]
                                    if (temp_emailId && isNaN(temp_emailId)) {
                                        parseObj.mail_id = temp_emailId
                                    }
                                }
                            } catch (ex) {
                                console.log(ex, "check jobCentral  parseObj.mail_id");
                            }
                            // ---gender---
                            try {
                                var tempGender = tempBasicDetails[0].split(',')[0].trim();
                                if (tempGender && tempGender.toLowerCase() == "male") {
                                    parseObj.gender = "M";
                                } else if (tempGender && tempGender.toLowerCase() == "female") {
                                    parseObj.gender = "F";
                                } else {
                                    parseObj.gender = "";
                                }
                            } catch (ex) {
                                console.log(ex, "check jobCentral  parseObj.gender");
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "check jobCentral basic details");
                    }

                    // ---region---


                    // ---age---
                    try {
                        if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[5]) {
                            var temp_age = removeExtraChars(element.getElementsByTagName('td')[5].innerHTML.trim());
                            if (temp_age && !isNaN(temp_age)) {
                                parseObj.age = temp_age;
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "check jobCentral parseObj.age");
                    }
                    // ---country---
                    try {
                        if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[6]) {
                            var temp_country = removeExtraChars(element.getElementsByTagName('td')[6].innerHTML.trim());
                            if (temp_country) {
                                parseObj.country = temp_country;
                            }
                        }
                    } catch (ex) {
                        console.log(ex, "check jobCentral parseObj.country");
                    }

                    // ---skills---
                    try {
                        parseObj.primarySkills = []
                    } catch (ex) {
                        console.log(ex, "check jobCentral parseObj.primarySkills");
                    }
                }
            } catch (ex) {
                console.log(ex, "check jobCentral candidate details");
            }

            // ---employement History---
            try {
                parseObj.work_history = [];
            } catch (err) {
            }
            //experience

            try {
                parseObj.experience = ''
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[7] && element.getElementsByTagName('td')[7].innerHTML) {
                    var temp_experience = removeExtraChars(element.getElementsByTagName('td')[7].innerHTML.trim())
                    parseObj.experience = temp_experience;
                }
            }
            catch (error) {
            }
            parseObj.education = {}
            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[3] && element.getElementsByTagName('td')[3].innerHTML) {
                    var education_type = removeExtraChars(element.getElementsByTagName('td')[3].innerHTML.trim())
                    parseObj.education.type = education_type;

                }
            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.education.type");
            }

            try {
                if (element && element.getElementsByTagName('td') && element.getElementsByTagName('td')[4] && element.getElementsByTagName('td')[4].innerHTML) {
                    var education_specialization = removeExtraChars(element.getElementsByTagName('td')[4].innerHTML.trim())
                    parseObj.education.specialization = education_specialization;
                }

            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.education.specialization");
            }

            try {
                parseObj.education.industry = ''
            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.education.industry");
            }
            try {
                parseObj.education.institution = ''
            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.education.institution");
            }

            try {
                parseObj.education.passing_year = ''
            } catch (ex) {
                console.log(ex, "check jobCentral parseObj.education.passing_year");
            }

            return {
                uid: parseObj.uniqueID || '',
                last_modified_date: parseObj.lastModifiedDate || '',
                portal_id: portalId || '',
                index: index || '',
                first_name: parseObj.firstName || '',
                last_name: parseObj.lastName || '',
                age: parseObj.age || '',
                gender: parseObj.gender || '',
                region: parseObj.region || '',
                country: parseObj.country || '',
                primarySkills: parseObj.primarySkills || [],
                work_history: parseObj.work_history || '',
                experience: parseObj.experience || '',
                education: parseObj.education || '',
                phone_number: parseObj.phone_number || '',
                mail_id: parseObj.mail_id || ''
            }
        }

        catch (err) {

        }
    }
}
portalimporter.saveApplicantJobCentral = function (element, index, portalId) {
    try {
        var portalId = req.body.portalId || 17; // jobcentral
        if (typeof portalId == "string") {
            portalId = parseInt(portalId);
        }
        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.xml_string).window.document;
        // console.log('req.files.document',req.body.document);
        details = saveResumeParseObj(document, req)
        details.portal_id = portalId;

        //console.log(req.body.isTallint, req.body.isIntranet);
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (ex) {
        console.log("ex", ex);
        res.status(500).send("Error occured");
    }
}
var saveResumeParseObj = function (element, req) {
    var details = {
        first_name: null,
        last_name: null,
        gender: null,
        nationality: null,
        location: null,
        mobile_number: null,
        emailId: null,
        languages: [],
        dob: null,
        experience: null,

        work_history: [{
            job_title: null,
            employer: null,
            industry: null,
            experience: null,
            duration: null,
            specialization: null,
            role: null,
            monthly_salary: null,
            summary: null
        }],
        current_employer: {
            job_title: null,
            current_employer: null
        },
        address: null,
        uid: null,
        last_modified_date: null,
        expected_salary: null,
        age: null,
        position_level: null,
        education: [],
        primary_skills: [],
        secondary_skills: [],
        requirements: [],
        attachment: []


    }
    try {
        var temp_personal_details = element.querySelectorAll('table.fm_table>tbody>tr>td.container>table.container>tbody>tr>td.container>table.container>tbody>tr');
        if (temp_personal_details) {
            //name
            if (temp_personal_details.length) {
                for (let i = 0; i < temp_personal_details.length; i++) {
                    let tr_element = temp_personal_details[i];
                    let prop_name;
                    let prop_value;
                    if (tr_element) {
                        if (tr_element.querySelector('.td_normalb') && tr_element.querySelector('.td_normalb').innerHTML && tr_element.querySelector('.td_normal') && tr_element.querySelector('.td_normal').innerHTML) {
                            prop_name = removeExtraChars(tr_element.querySelector('.td_normalb').innerHTML.trim()).toLowerCase();
                            prop_value = removeExtraChars(tr_element.querySelector('.td_normal').innerHTML.trim());

                            //name
                            if (prop_name == 'full name') {
                                try {
                                    var temp_name = prop_value;
                                    if (temp_name.split(' ')) {
                                        temp_name = temp_name.split(' ');
                                        if (temp_name.length - 1 > 0) {
                                            details.last_name = temp_name.splice(temp_name.length - 1, 1)[0];
                                        }
                                        else {
                                            details.last_name = ''
                                        }
                                        if (temp_name[0]) {
                                            details.first_name = temp_name.join(' ');
                                        }
                                    }
                                } catch (err) {

                                }

                            }

                            //gender
                            else if (prop_name == 'gender') {
                                try {
                                    var tempGender = prop_value;
                                    if (tempGender && tempGender.toLowerCase() == "male") {
                                        details.gender = "M";
                                    } else if (tempGender && tempGender.toLowerCase() == "female") {
                                        details.gender = "F";
                                    } else {
                                        details.gender = "";
                                    }
                                } catch (error) {

                                }
                            }

                            //nationality
                            else if (prop_name == 'nationality') {
                                details.nationality = prop_value;
                            }

                            //location
                            else if (prop_name == 'country of residence') {
                                details.location = prop_value;
                            }

                            else if (prop_name == 'work permit') {

                            }
                            else if (prop_name == 'date of birth') {
                                try {
                                    var str = prop_value;
                                    details.dob = dateConverter(str.split('(')[0])
                                    details.age = str.substring(str.indexOf('(') + 1, str.lastIndexOf(')'))
                                } catch (error) {

                                }
                            }
                            else if (prop_name == 'language proficiency') {
                                details.languages = prop_value.split(',')
                            }
                        }
                    }
                }
            }
        }

    } catch (err) { }


    try {
        var temp_contact_information = element.querySelectorAll('table.fm_table>tbody>tr');
        if (temp_contact_information && temp_contact_information.length) {
            for (let i = 0; i < temp_contact_information.length; i++) {
                let tr_element = temp_contact_information[i];
                let prop_name;
                let prop_value;
                if (tr_element) {
                    if (tr_element.querySelector('.td_normalb') && tr_element.querySelector('.td_normalb').innerHTML && tr_element.querySelector('.td_normal') && tr_element.querySelector('.td_normal').innerHTML) {
                        prop_name = removeExtraChars(tr_element.querySelector('.td_normalb').innerHTML.trim()).toLowerCase();
                        prop_value = removeExtraChars(tr_element.querySelector('.td_normal').innerHTML.trim());
                    }

                    if (prop_name == 'email') {
                        details.emailId = prop_value;
                    }
                    else if (prop_name == 'main contact') {
                        details.mobile_number = prop_value;
                    }
                    else if (prop_name == 'address') {
                        details.address = prop_value;
                    }
                    else if ('years worked') {
                        details.experience = prop_value;
                    }
                    else if ('current / latest monthly salary') {
                        details.monthly_salary = prop_value;
                    }
                    else if ('position level') {
                        details.position_level = prop_value;
                    }

                }
            }
        }

    } catch (error) {
        console.log(error)
    }

    try {
        var temp_emp_details = element.querySelectorAll('table.fm_table')[1].querySelectorAll('tbody>tr>td>table.container')
        details.work_history = [];
        if (temp_emp_details && temp_emp_details.length) {
            for (let i = 0; i < temp_emp_details.length; i++) {
                let emp_detail_table = temp_emp_details[i];
                let temp_variable = {}
                if (emp_detail_table) {
                    let emp_detail_row = emp_detail_table.querySelectorAll('tbody>tr');
                    for (let j = 0; j < emp_detail_row.length; j++) {
                        let tr_element = emp_detail_row[j];
                        let prop_name;
                        let prop_value;

                        if (tr_element) {
                            if (tr_element.querySelector('.td_normalb') && tr_element.querySelector('.td_normalb').innerHTML && tr_element.querySelector('.td_normal') && tr_element.querySelector('.td_normal').innerHTML) {
                                prop_name = removeExtraChars(tr_element.querySelector('.td_normalb').innerHTML.trim()).toLowerCase();
                                prop_value = removeExtraChars(tr_element.querySelector('.td_normal').innerHTML.trim());
                                if (prop_name == 'company name') {
                                    temp_variable.employer = prop_value
                                }
                                if (prop_name == 'job title') {
                                    temp_variable.job_title = prop_value
                                }
                            }
                        }

                    }
                    details.work_history.push(temp_variable)
                }

            }

        }
    }
    catch (err) { }

    try {
        var temp_edu_details = element.querySelectorAll('table.fm_table')[2].querySelectorAll('tbody>tr>td>table.container')
        details.education = [];
        if (temp_edu_details && temp_edu_details.length) {
            for (let i = 0; i < temp_edu_details.length; i++) {
                let edu_detail_table = temp_edu_details[i];
                let temp_variable = { 'passing_year': null, 'institution': null, 'education': null }
                if (edu_detail_table) {
                    let edu_detail_row = edu_detail_table.querySelectorAll('tbody>tr');
                    for (let j = 0; j < edu_detail_row.length; j++) {
                        let tr_element = edu_detail_row[j];
                        let prop_name;
                        let prop_value;

                        if (tr_element) {
                            if (tr_element.querySelector('.td_normalb') && tr_element.querySelector('.td_normalb').innerHTML && tr_element.querySelector('.td_normal') && tr_element.querySelector('.td_normal').innerHTML) {
                                prop_name = removeExtraChars(tr_element.querySelector('.td_normalb').innerHTML.trim()).toLowerCase();
                                prop_value = removeExtraChars(tr_element.querySelector('.td_normal').innerHTML.trim());
                                if (prop_name == 'school name') {
                                    temp_variable.institution = prop_value
                                }
                                if (prop_name == '(expected) grad date') {
                                    temp_variable.passing_year = prop_value
                                }
                                if (prop_name == 'course / major') {
                                    temp_variable.education = prop_value
                                }
                            }
                        }

                    }
                    details.education.push(temp_variable)
                }

            }

        }
    }
    catch (err) { }



    if (req.body.requirements) {
        try {
            if (typeof req.body.requirements == "string") {
                try {
                    req.body.requirements = JSON.parse(req.body.requirements)
                } catch (err) {
                    console.log(err);
                }
            }
            if (req.body.requirements.length) {
                details.requirements = req.body.requirements
            } else {
                details.requirements = [parseInt(req.body.requirements)];
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (req.body.attachment) {
        // var attachment1 = req.body.attachment.split(',');
        // if (attachment1.length && attachment1[0] && attachment1[1]) {
        //     details.resume_document = attachment1[1];
        //     var filetype = '';
        //     filetype = setFileType(attachment1[0]);
        //     var req_file_name = req.body.file_name;
        //     var doc_extension;
        //     if (req_file_name && req_file_name != '') {
        //         doc_extension = req_file_name.split('.');
        //         doc_extension = doc_extension[doc_extension.length - 1];
        //     }
        //     details.resume_extension = '.' + (doc_extension || filetype || 'docx');
        // }
    }

    return details;

}


module.exports = portalimporter;