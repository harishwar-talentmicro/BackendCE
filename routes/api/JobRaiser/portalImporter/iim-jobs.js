IIMImporter = {};
var shared_ctrl = require('./shared-ctrl')
const jsdom = require("jsdom");
IIMImporter.checkApplicantExistsFromIIMJobs = function (req, res) {

    let response = new shared_ctrl.response();
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var response_from_portal_api = req.body.response_from_portal_api;
    var xml_string = req.body.xml_string;
    try {
        const { JSDOM } = jsdom;
        var _document = new JSDOM(xml_string).window.document;
    }
    catch (err) {

    }
    if (is_select_all == 1) {
        for (let i = 0; i < _document.querySelectorAll('.candidate-item.candidateRow').length; i++) {
            if (_document.querySelectorAll('.candidate-item.candidateRow')[i]) {
                applicants.push(parseForDuplicationCheck(_document.querySelectorAll('.candidate-item.candidateRow')[i], i))
            }

        }
    }
    else {
        for (let i = 0; i < selected_candidates.length; i++) {
            if (_document.querySelectorAll('.candidate-item.candidateRow')[selected_candidates[i]]) {
                applicants.push(parseForDuplicationCheck(_document.querySelectorAll('.candidate-item.candidateRow')[selected_candidates[i]], selected_candidates[i]))
            }

        }
    }



    response.status = true;
    response.message = "XML Parsed";
    response.error = false;
    response.data = applicants;
    res.status(200).json(response);
}

function parseForDuplicationCheck(document, index) {
    let details = new shared_ctrl.portalimporterDetails();
    //uid
    try {
        details.uid = shared_ctrl.removeExtraChars(document.getAttribute('data-candidate-id'))
    } catch (ex) {

    }
    //name
    try {
        let name = document.querySelectorAll(".profile-name.js_name")[0].innerHTML;
        details.full_name = shared_ctrl.removeExtraChars(name);

        try {
            details.first_name = name.split(' ')[0]
        } catch (error) {

        }
        try {
            details.last_name = name.split(' ').pop()
        } catch (error) {

        }
    } catch (error) {

    }
    //location
    try {
        let current_location = document.querySelectorAll(".js_loc")[0].innerHTML;
        details.location = shared_ctrl.removeExtraChars(current_location);
    } catch (error) {

    }

    //js_notice

    try {
        let notice_period = document.querySelectorAll(".js_notice")[0].innerHTML;
        details.notice_period = shared_ctrl.removeExtraChars(notice_period);
    } catch (error) {

    }

    //work history
    try {
        var work_histories = [];
        var work_history_element = document.querySelectorAll('.js_prof_list .js_prof');
        //index 0 consists of current organization
        if (work_history_element && work_history_element.length) {
            for (var i = 0; i < work_history_element.length; i++) {
                let work_history = {};
                if (work_history_element[i]) {
                    let company_name = work_history_element[i].querySelectorAll('.js_prof_name');
                    let designation = work_history_element[i].querySelectorAll('.js_prof_designation');
                    work_history.duration = {};
                    let temp_tenure = work_history_element[i].querySelectorAll('.js_prof_tenure');
                    if (company_name && company_name[0] && company_name[0].innerHTML && shared_ctrl.removeExtraChars(company_name[0].innerHTML) != '')
                        work_history.employer = shared_ctrl.removeExtraChars(company_name[0].innerHTML);
                    if (designation && designation[0] && designation[0].innerHTML && shared_ctrl.removeExtraChars(designation[0].innerHTML) != '')
                        work_history.job_title = shared_ctrl.removeExtraChars(designation[0].innerHTML);
                    if (temp_tenure && temp_tenure[0]) {
                        let tenure = temp_tenure[0].innerHTML;
                        try {
                            work_history.duration.from = shared_ctrl.removeExtraChars(tenure.split('to')[0]);
                            work_history.duration.to = shared_ctrl.removeExtraChars(tenure.split('to').pop())
                        } catch (error) {

                        }
                    }
                    work_histories.push(work_history);
                }
            }
            details.work_history = work_histories;
        }
    } catch (ex) {

    }
    //education
    try {
        if (document.querySelectorAll(".js_edu_list")) {
            details.education = [];
            let history_elem = document.querySelectorAll(".js_edu_list .js_edu");
            if (history_elem && history_elem.length) {
                for (let i = 0; i < history_elem.length; i++) {
                    let tempEduHistory = {
                        institution: '',
                        type: '',
                        education: '',
                        specialization: "",
                        passing_year: "",
                        duration: {
                            from: '',
                            to: ''
                        },
                    };

                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_name')) {
                            let value = history_elem[i].querySelectorAll('.js_edu_name')[0].innerHTML;
                            value = shared_ctrl.removeExtraChars(value).trim();
                            tempEduHistory.institution = value;
                        }
                    } catch (error) { }
                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_degree') && history_elem[i].querySelectorAll('.js_edu_degree')[0]) {
                            let value = history_elem[i].querySelectorAll('.js_edu_degree')[0].innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.specialization = value;
                        }
                    } catch (error) { }

                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_tenure') && history_elem[i].querySelectorAll('.js_edu_tenure')[0]) {
                            let value = history_elem[i].querySelectorAll('.js_edu_tenure')[0].innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.duration.from = shared_ctrl.removeExtraChars(value.split('to')[0]);
                            tempEduHistory.duration.to = shared_ctrl.removeExtraChars(value.split('to')[1]);
                            tempEduHistory.passing_year = tempEduHistory.duration.to;
                        }
                    } catch (error) { }

                    details.education.push(tempEduHistory)
                }
            }
        }
    } catch (error) { }

    //index
    details.index = index;

    //portal id
    details.portal_id = 20;

    return details;
}


IIMImporter.saveApplicantForIIMJobs = function (req, res) {
    let response = new shared_ctrl.response();
    let xml_string = req.body.xml_string;

    try {
        const { JSDOM } = jsdom;
        var _document = new JSDOM(xml_string).window.document;
    }
    catch (err) {

    }

    let details = parseSaveDetails(_document)
    response.status = true;
    response.message = "XML Parsed";
    response.error = false;
    response.data = details;
    res.status(200).json(response);
}

function parseSaveDetails(document) {
    let details = new shared_ctrl.portalimporterDetails();

    //uid
    try {
        details.uid = shared_ctrl.removeExtraChars(document.querySelector('.candidateDetailsModal').getAttribute('data-candidate-id'))
    } catch (ex) {

    }
    //name
    try {
        let name = document.querySelectorAll(".profile-name.js_name")[0].innerHTML;
        details.full_name = shared_ctrl.removeExtraChars(name);

        try {
            details.first_name = name.split(' ')[0]
        } catch (error) {

        }
        try {
            details.last_name = name.split(' ').pop()
        } catch (error) {

        }
    } catch (error) {

    }
    //location
    try {
        let current_location = document.querySelectorAll(".js_loc")[0].innerHTML;
        details.location = shared_ctrl.removeExtraChars(current_location);
    } catch (error) {

    }

    //pref location

    try {
        let pref_locations = shared_ctrl.removeExtraChars(document.querySelector('.pref_loc').innerHTML);
        if (pref_locations) {
            details.pref_locations = pref_locations.split(',')
        }

    } catch (error) {
    }

    //work history
    try {
        var work_histories = [];
        var work_history_element = document.querySelectorAll('.js_prof_list .js_prof');
        //index 0 consists of current organization
        if (work_history_element && work_history_element.length) {
            for (var i = 0; i < work_history_element.length; i++) {
                let work_history = {};
                if (work_history_element[i]) {
                    let company_name = work_history_element[i].querySelectorAll('.js_prof_name');
                    let designation = work_history_element[i].querySelectorAll('.js_prof_designation');
                    work_history.duration = {};
                    let temp_tenure = work_history_element[i].querySelectorAll('.js_prof_tenure');
                    if (company_name && company_name[0] && company_name[0].innerHTML && shared_ctrl.removeExtraChars(company_name[0].innerHTML) != '')
                        work_history.employer = shared_ctrl.removeExtraChars(company_name[0].innerHTML);
                    if (designation && designation[0] && designation[0].innerHTML && shared_ctrl.removeExtraChars(designation[0].innerHTML) != '')
                        work_history.job_title = shared_ctrl.removeExtraChars(designation[0].innerHTML);
                    if (temp_tenure && temp_tenure[0]) {
                        let tenure = temp_tenure[0].innerHTML;
                        try {
                            work_history.duration.from = shared_ctrl.removeExtraChars(tenure.split('to')[0]);
                            work_history.duration.to = shared_ctrl.removeExtraChars(tenure.split('to').pop())
                        } catch (error) {

                        }
                    }
                    work_histories.push(work_history);
                }
            }
            details.work_history = work_histories;
        }
    } catch (ex) {

    }
    //education
    try {
        if (document.querySelectorAll(".js_edu_list")) {
            details.education = [];
            let history_elem = document.querySelectorAll(".js_edu_list .js_edu");
            if (history_elem && history_elem.length) {
                for (let i = 0; i < history_elem.length; i++) {
                    let tempEduHistory = {
                        institution: '',
                        type: '',
                        education: '',
                        specialization: "",
                        passing_year: "",
                        duration: {
                            from: '',
                            to: ''
                        },
                    };

                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_name')) {
                            let value = history_elem[i].querySelectorAll('.js_edu_name')[0].innerHTML;
                            value = shared_ctrl.removeExtraChars(value).trim();
                            tempEduHistory.institution = value;
                        }
                    } catch (error) { }
                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_degree') && history_elem[i].querySelectorAll('.js_edu_degree')[0]) {
                            let value = history_elem[i].querySelectorAll('.js_edu_degree')[0].innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.specialization = value;
                        }
                    } catch (error) { }

                    try {
                        if (history_elem[i].querySelectorAll('.js_edu_tenure') && history_elem[i].querySelectorAll('.js_edu_tenure')[0]) {
                            let value = history_elem[i].querySelectorAll('.js_edu_tenure')[0].innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.duration.from = shared_ctrl.removeExtraChars(value.split('to')[0]);
                            tempEduHistory.duration.to = shared_ctrl.removeExtraChars(value.split('to')[1]);
                            tempEduHistory.passing_year = tempEduHistory.duration.to;
                        }
                    } catch (error) { }

                    details.education.push(tempEduHistory)
                }
            }
        }
    } catch (error) { }

    //gender

    try {
        var gender = document.querySelector('.js_gender').innerHTML;
        gender = shared_ctrl.removeExtraChars(gender);
        if (gender.toLowerCase() == "female") {
            details.gender = 'F'
        } else if (gender.toLowerCase() == "male") {
            details.gender = 'M'
        } else {
            details.gender = '';
        }
    } catch (error) {

    }
    //notice period
    try {
        let notice_period = document.querySelectorAll(".js_notice")[0].innerHTML;
        details.notice_period = shared_ctrl.removeExtraChars(notice_period);
    } catch (error) {

    }

    //age
    try {
        let age = document.querySelectorAll(".js_notice")[0].innerHTML;
        details.age = shared_ctrl.removeExtraChars(shared_ctrl.parseNumberOnly(notice_period));
    } catch (error) {

    }

    // mobile_number
    try {
        details.mobile_number = shared_ctrl.removeExtraChars(document.querySelectorAll('.contact')[0].innerHTML);
    } catch (error) {

    }
    //email id
    try {
        details.email_id = shared_ctrl.removeExtraChars(document.querySelectorAll('.email-address')[0].innerHTML);
    } catch (error) {

    }

    details.portal_id = 20;

    return details;
}


module.exports = IIMImporter;
