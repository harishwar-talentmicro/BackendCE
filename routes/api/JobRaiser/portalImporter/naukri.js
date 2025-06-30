const { FONT_SANS_16_BLACK } = require("jimp");
const jsdom = require("jsdom");
const { stripHtmlTags } = require("./shared-ctrl");
const axios = require('axios');
var shared_ctrl = require('./shared-ctrl')
naukriImporter = {};
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const FormData = require('form-data');

naukriImporter.checkApplicantExistsFromNaukriPortal = function (req, res) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var response_from_portal_api = req.body.response_from_portal_api;
    var is_parsed = req.body.is_parsed;
    let standAlone = req.body.standAlone;
    let version = req.body.version;
    let portal_version = req.body.portal_version;
    let isJSON = req.body.isJSON;
    let list = req.body.list;
    let user_details = req.body.session;
    let portal_details = req.body.selectedPortal;
    let requirementList = req.body.requirements || [];

    console.log("entered naukri duplication check")

    if (isJSON) {
        if (!(list && list.length)) {
            res.status(500).json({ message: 'Something went wrong' });
            return;
        }
        if (list && list.length) {

            for (let i = 0; i < list.length; i++) {
                let candidate_details = list[i];
                let selected_candidate_details = new shared_ctrl.portalimporterDetails();
                selected_candidate_details.full_name = candidate_details.jsUserName;
                try {
                    selected_candidate_details.first_name = selected_candidate_details.full_name.split(' ')[0];
                } catch (error) {

                }
                try {
                    selected_candidate_details.last_name = selected_candidate_details.full_name.split(' ')[1];
                } catch (error) {

                }
                selected_candidate_details.last_modified_date = shared_ctrl.convertMillisToDate(candidate_details.modifyDateMillis);
                selected_candidate_details.portal_id = 1;
                selected_candidate_details.index = i;
                selected_candidate_details.uid = candidate_details.jsUserId;
                selected_candidate_details.location = candidate_details.currentLocation;
                try {
                    selected_candidate_details.current_employer = candidate_details.employment.current.organization;
                    selected_candidate_details.job_title = candidate_details.employment.current.designation;
                }
                catch (err) {

                }

                try {
                    selected_candidate_details.previous_employer = candidate_details.employment.previous.organization;
                    selected_candidate_details.previous_job_title = candidate_details.employment.previous.designation;
                }
                catch (err) {

                }
                try {
                    selected_candidate_details.skills = candidate_details.keySkills.split(',');
                }
                catch (error) {

                }
                try {
                    let education = { education: '', institution: "", passing_year: "", specialization: "", University: "", education_group: "" }
                    selected_candidate_details.education = [];
                    let edu_type = Object.keys(candidate_details.education);
                    for (let j = 0; j < edu_type.length; j++) {
                        const key = edu_type[j];
                        if (candidate_details.education[key]) {
                            education.education_group = key;
                            education.institution = candidate_details.education[key].institute;
                            education.specialization = candidate_details.education[key].specialization;
                            education.University = candidate_details.education[key].university;
                            education.education = candidate_details.education[key].course;
                            education.passing_year = candidate_details.education[key].year;
                            selected_candidate_details.education.push(education);
                        }
                    }

                } catch (error) {

                }

                try {
                    selected_candidate_details.selector = [{
                        selector: `[data-tuple-id="${candidate_details.jsUserId}"]`,
                        children: [{
                            selector: ".candidate-name"
                        }]
                    },
                    {
                        selector: `[data-tuple-id="${candidate_details.jsResId}"]`,
                        children: [{
                            selector: ".candidate-name"
                        }]
                    }]

                }
                catch (err) {

                }
                applicants.push(selected_candidate_details);
            }
        }

        let details = {
            applicants: applicants,
            overwriteResumeWithDoc: portal_details.overwriteResumeWithDoc || 0,
            overwriteResumeOnlyDoc: portal_details.overwriteResumeOnlyDoc || 0,
            requirements: requirementList
        }
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: portal_details.duplicateCheckApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + user_details?.token
            },
            data: details
        };
        console.log(config);
        // res.status(200).json({ data: [] });
        axios.request(config).then((response) => {
            console.log('axios response' + JSON.stringify(response.data));
            res.status(200).json({ data: response.data });
        }).catch((error) => {
            console.log(error);
            res.status(500).json(error)
        });

    }
    else {
        try {
            if (xml_string) {
                var uniqueIdArray = xml_string.match(/srpTupleJson = \[\{.*\}\];/);
            }
            if (response_from_portal_api && is_parsed) {
                response_from_portal_api = shared_ctrl.jsonDeepParse(response_from_portal_api)
                for (let i = 0; i < selected_candidates.length; i++) {
                    if (response_from_portal_api && response_from_portal_api.body.tuples) {
                        let candidate_details = response_from_portal_api.body.tuples[selected_candidates[i]];
                        let selected_candidate_details = new shared_ctrl.portalimporterDetails();
                        selected_candidate_details.full_name = candidate_details.jsUserName;
                        try {
                            selected_candidate_details.first_name = selected_candidate_details.full_name.split(' ')[0];
                        } catch (error) {

                        }
                        try {
                            selected_candidate_details.last_name = selected_candidate_details.full_name.split(' ')[1];
                        } catch (error) {

                        }

                        selected_candidate_details.last_modified_date = candidate_details.modifyDateMillis;
                        selected_candidate_details.portal_id = 1;
                        selected_candidate_details.index = selected_candidates[i];
                        selected_candidate_details.uid = candidate_details.uniqueId;
                        selected_candidate_details.location = candidate_details.currentLocation;
                        try {
                            selected_candidate_details.current_employer = candidate_details.employment.current.organization;
                            selected_candidate_details.job_title = candidate_details.employment.current.designation;
                        }
                        catch (err) {

                        }

                        try {
                            selected_candidate_details.previous_employer = candidate_details.employment.previous.organization;
                            selected_candidate_details.previous_job_title = candidate_details.employment.previous.designation;
                        }
                        catch (err) {

                        }
                        try {
                            selected_candidate_details.skills = candidate_details.keySkills.split(',');
                        } catch (error) {

                        }
                        try {
                            let education = { education: '', institution: "", passing_year: "", specialization: "", University: "", education_group: "" }
                            selected_candidate_details.education = [];
                            let edu_type = Object.keys(candidate_details.education);
                            for (let j = 0; j < edu_type.length; j++) {
                                const key = edu_type[j];
                                if (candidate_details.education[key]) {
                                    education.education_group = key;
                                    education.institution = candidate_details.education[key].institute;
                                    education.specialization = candidate_details.education[key].specialization;
                                    education.University = candidate_details.education[key].university;
                                    education.education = candidate_details.education[key].course;
                                    education.passing_year = candidate_details.education[key].year;
                                    selected_candidate_details.education.push(education);
                                }
                            }

                        } catch (error) {

                        }

                        applicants.push(selected_candidate_details)
                    }
                }
                console.log(response_from_portal_api);

            }
            else {
                if (portal_version == 3) {
                    if (standAlone) {
                        applicants.push(parseV3DuplicateInfo(document, i))
                    }
                    else {
                        if (document.querySelectorAll('.tuples-wrap .tuple-list .tuple.on') && document.querySelectorAll('.tuples-wrap .tuple-list .tuple.on').length) {
                            for (var i = 0; i < document.querySelectorAll('.tuples-wrap .tuple-list .tuple.on').length; i++) {
                                if (document.querySelectorAll('.tuples-wrap .tuple-list .tuple.on')[i].querySelector('.naukri-icon-check-box-checked')) {
                                    applicants.push(parseV3DuplicateInfo(document.querySelectorAll('.tuples-wrap .tuple-list .tuple.on')[i], i))
                                }
                            }
                        }
                    }

                }
                else {
                    if (is_select_all == 1) {
                        try {
                            if (document.getElementsByClassName('tuple'))
                                for (var i = 0; i < document.getElementsByClassName('tuple').length; i++) {
                                    if (document.getElementsByClassName('tuple')[i].getAttribute('class').indexOf('viewed') == -1) {
                                        try {
                                            var name = document.getElementsByClassName('tuple')[i].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                                            name = shared_ctrl.removeExtraChars(name);
                                            var first_name = "";
                                            var last_name = "";

                                            console.log(name);
                                            if (name.split(' ')) {
                                                if (name.split(' ')[0])
                                                    first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
                                                if (name.split(' ')[name.split(' ').length - 1])
                                                    last_name = shared_ctrl.removeExtraChars(name.split(' ')[name.split(' ').length - 1]);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck last_name,first_name");
                                        }

                                        try {
                                            if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[i] && document.getElementsByClassName('ftRight')[i].innerHTML && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                                                var lastModifiedDate = shared_ctrl.dateConverter(document.getElementsByClassName('ftRight')[i].innerHTML.split('Modified: ')[1].split('</span>')[0]);

                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck lastModifiedDate");
                                        }
                                        try {
                                            var uniqueId = "";
                                            if (uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].uniqueId) {
                                                uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[i].key;
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck uniqueId");
                                        }
                                        //experience
                                        try {
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
                                        } catch (err) {
                                            console.log(err, "Naukricheck experience");
                                        }
                                        //present location
                                        try {
                                            var current_location = '';
                                            if (element && element.getElementsByClassName('loc') && element.getElementsByClassName('loc')[0] && element.getElementsByClassName('loc')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML) != '') {
                                                current_location = shared_ctrl.removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck current_location");
                                        }
                                        //current designation
                                        try {
                                            var job_title = '';
                                            if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                                                job_title = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck job_title");
                                        }
                                        //current employer
                                        try {
                                            var current_employer = '';
                                            if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                                                current_employer = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck current_employer");
                                        }
                                        //previous designation
                                        try {
                                            var prev_jobtitle = '';
                                            if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                                                prev_jobtitle = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck prev_jobtitle");
                                        }
                                        //previous employer
                                        try {
                                            var previous_employer = '';
                                            if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                                                previous_employer = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck previous_employer");
                                        }
                                        //skills
                                        try {
                                            var skills = [];
                                            var skill_element = element.getElementsByClassName('skillkey');
                                            for (var x = 0; x < skill_element.length; x++) {
                                                if (skill_element[x] && skill_element[x].innerHTML)
                                                    skills[x] = shared_ctrl.removeExtraChars(skill_element[x].innerHTML);
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck skills");
                                        }
                                        //education
                                        try {
                                            var education;
                                            if (element && element.getElementsByClassName('desc eduInfo') && element.getElementsByClassName('desc eduInfo')[0] && element.getElementsByClassName('desc eduInfo')[0].innerHTML && element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0]) {
                                                education = element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0];
                                            }
                                        } catch (err) {
                                            console.log(err, "Naukricheck education");
                                        }
                                        applicants.push({ first_name: first_name, last_name: last_name, portal_id: 1, index: i, last_modified_date: lastModifiedDate, uid: uniqueId, location: current_location, current_employer: current_employer, job_title: job_title, previous_employer: previous_employer, skills: skills, education: education });
                                    }
                                }
                        } catch (err) {
                            console.log(err, "Naukricheck if part");
                        }
                    }
                    else {
                        try {
                            let index;
                            if (document.getElementsByClassName('tuple'))
                                for (var i = 0; i < selected_candidates.length; i++) {
                                    index = selected_candidates[i]
                                    // name
                                    try {

                                        var name = document.getElementsByClassName('tuple')[selected_candidates[i]].getElementsByClassName('tupCmtWrap')[0].getElementsByClassName('tupData')[0].getElementsByClassName('tupLeft')[0].getElementsByClassName('clFx')[0].getElementsByClassName('userName name')[0].innerHTML;
                                        var first_name = "";
                                        var last_name = "";

                                        console.log(name);
                                        if (name.split(' ')) {
                                            if (name.split(' ')[0])
                                                first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
                                            if (name.split(' ')[name.split(' ').length - 1])
                                                last_name = shared_ctrl.removeExtraChars(name.split(' ')[name.split(' ').length - 1]);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck last_name, first_name");
                                    }

                                    // lastModifiedDate 
                                    try {
                                        if (document.getElementsByClassName('ftRight') && document.getElementsByClassName('ftRight')[selected_candidates[i]] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1] && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>') && document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]) {

                                            var lastModifiedDate = shared_ctrl.dateConverter(document.getElementsByClassName('ftRight')[selected_candidates[i]].innerHTML.split('Modified: ')[1].split('</span>')[0]);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck lastModifiedDate");
                                    }

                                    // uniqueId
                                    try {
                                        var uniqueId = "";
                                        if (uniqueIdArray && uniqueIdArray[0] && uniqueIdArray[0].split('= ') && uniqueIdArray[0].split('= ')[1] && uniqueIdArray[0].split('= ')[1].split('];') && uniqueIdArray[0].split('= ')[1].split('];')[0] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']') && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]] && JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].uniqueId) {
                                            uniqueId = JSON.parse(uniqueIdArray[0].split('= ')[1].split('];')[0] + ']')[selected_candidates[i]].key;
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck uniqueId");
                                    }
                                    //experience
                                    try {
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
                                    } catch (err) {
                                        console.log(err, "Naukricheck experience");
                                    }
                                    //present location
                                    try {
                                        var current_location = '';
                                        if (element && element.getElementsByClassName('loc') && element.getElementsByClassName('loc')[0] && element.getElementsByClassName('loc')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML) != '') {
                                            current_location = shared_ctrl.removeExtraChars(element.getElementsByClassName('loc')[0].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck current_location");
                                    }
                                    //current designation
                                    try {
                                        var job_title = '';
                                        if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                                            job_title = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[0].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck job_title");
                                    }
                                    //current employer
                                    try {
                                        var current_employer = '';
                                        if (element.getElementsByClassName('desc currInfo') && element.getElementsByClassName('desc currInfo')[0] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                                            current_employer = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc currInfo')[0].getElementsByTagName('a')[1].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck current_employer");
                                    }
                                    //previous designation
                                    try {
                                        var prev_jobtitle = '';
                                        if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML) != '') {
                                            prev_jobtitle = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[0].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck prev_jobtitle");
                                    }
                                    //previous employer
                                    try {
                                        var previous_employer = '';
                                        if (element.getElementsByClassName('desc prvInfo') && element.getElementsByClassName('desc prvInfo')[0] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a') && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1] && element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML && shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML) != '') {
                                            previous_employer = shared_ctrl.removeExtraChars(element.getElementsByClassName('desc prvInfo')[0].getElementsByTagName('a')[1].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck previous_employer");
                                    }
                                    //skills
                                    try {
                                        var skills = [];
                                        var skill_element = element.getElementsByClassName('skillkey');
                                        for (var x = 0; x < skill_element.length; x++) {
                                            if (skill_element[x] && skill_element[x].innerHTML)
                                                skills[x] = shared_ctrl.removeExtraChars(skill_element[x].innerHTML);
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck skills");
                                    }
                                    //ecudation
                                    try {
                                        var education;
                                        if (element && element.getElementsByClassName('desc eduInfo') && element.getElementsByClassName('desc eduInfo')[0] && element.getElementsByClassName('desc eduInfo')[0].innerHTML && element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0]) {
                                            education = element.getElementsByClassName('desc eduInfo')[0].innerHTML.split(' <')[0];
                                        }
                                    } catch (err) {
                                        console.log(err, "Naukricheck skills");
                                    }
                                    applicants.push({ first_name: first_name, last_name: last_name, portal_id: 1, index: selected_candidates[i], last_modified_date: lastModifiedDate, uid: uniqueId, location: current_location, current_employer: current_employer, job_title: job_title, previous_employer: previous_employer, skills: skills, education: education, index: index });
                                }
                        } catch (err) {
                            console.log(err, "Naukricheck else part");
                        }
                    }
                }
            }


            response.status = true;
            response.message = "Parsed XML Successfully";
            response.error = null;
            response.data = applicants;
            res.status(200).json(response);

        } catch (err) {
            var response = new shared_ctrl.response();
            response.status = false;
            response.message = "Error occoured";
            response.error = err;
            response.exception = err;
            res.status(200).json(response);
            console.log(err, "Naukricheck");
        }
    }

};


naukriImporter.saveApplicantsFromNaukri = async function (req, res) {

    var details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 1;
    let user_details;
    var result;
    let contact_details = shared_ctrl.jsonDeepParse(req.body.user_details);
    let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
    let selectedPortal = shared_ctrl.jsonDeepParse(req.body.selectedPortal);
    let portal_details = shared_ctrl.jsonDeepParse(req.body.portal_details);
    let client_details = shared_ctrl.jsonDeepParse(req.body.client_details);
    let session = shared_ctrl.jsonDeepParse(req.body.session);
    let save_url = req.body.save_url;

    if (selectedPortal?.resumeSaveApiUrl) {
        save_url = selectedPortal.resumeSaveApiUrl;
        console.log(save_url);
    }
    const htmlContent = shared_ctrl.jsonDeepParse(req.body.html_content)?.html_content;
    if (htmlContent) {
        const timestamp = Date.now();
        const filename = `@page_resdex.naukri.com_${timestamp}.html`;
        const filePath = path.resolve(__dirname, filename);
        console.log(filename)
        try {
            await fsp.writeFile(filePath, htmlContent);

            const form = new FormData();
            form.append('html_file', fs.createReadStream(filePath), { filename });
            form.append('output_base_name', 'string');

            const response = await axios({
                method: 'post',
                url: 'https://api.parsinga.com/naukri-html-processor',
                headers: {
                    'Authorization': "Bearer 0530148c-6dd9-41bf-81da-0a268ecad812",
                    ...form.getHeaders(),
                },
                data: form,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });

            console.log(" Parsed data:", response.data);
            user_details = response.data.parsed_data;
            result = response.data;

            await fsp.unlink(filePath);
        } catch (error) {
            console.error("Parser API call failed:", error?.response?.data || error.message);
            try {
                if (fs.existsSync(filePath)) {
                    await fsp.unlink(filePath);
                    console.log(`Temp file ${filename} removed after error.`);
                }
            } catch (cleanupErr) {
                console.error("Failed to delete temp file:", cleanupErr.message);
            }
            res.status(500).json({ error: 'Parser API failed' });
        }

        try {
            if (user_details) {
                console.log(user_details)
                //name
                try {
                    details.full_name = user_details?.full_name;
                    try {
                        details.first_name = user_details?.first_name
                    } catch (error) {

                    }
                    try {
                        details.last_name = user_details?.last_name
                    } catch (error) {

                    }
                }
                catch (err) {

                }

                //emailId
                try {
                    details.email_id = user_details?.email_id;
                }
                catch (err) { }

                //mobile_number
                try {
                    details.mobile_number = user_details?.mobile_number
                }
                catch (err) { }
                try {
                    details.mobile_isd = user_details?.mobile_isd

                }
                catch (err) {

                }
                //address
                try {
                    details.address = user_details?.parsed_data?.personal_info?.contact?.address;
                } catch (err) {
                    console.log(err, "save naukri details.address");
                }


                //  experience
                try {
                    details.experience = user_details?.experience;
                    details.age = user_details?.age;
                }
                catch (err) {
                    console.log(err, "save naukri details.experience");
                }

                //primary_skills
                try {
                    details.primary_skills = user_details?.primary_skills;
                    details.secondary_skills = user_details?.secondary_skills;
                } catch (err) {
                    console.log(err, "save naukri details.primary_skills");
                }
                //notice_period
                try {
                    details.notice_period = user_details?.notice_period;
                } catch (err) {
                    console.log(err, "save naukri details.notice_period");
                }
                // salary details
                try {
                    details.present_salary = user_details?.present_salary;

                    try {
                        details.present_salary_curr = user_details?.present_salary_curr;
                    }
                    catch (Err) {

                    }

                    details.present_salary_period = user_details?.present_salary_period;
                }

                catch (err) {
                    console.log(err, "save naukri details.salaryDetails");
                }
                //salary
                try {
                    details.expected_salary = user_details?.expected_salary;

                    try {
                        details.expected_salary_curr = user_details?.expected_salary_curr;
                    }
                    catch (Err) {

                    }

                    details.expected_salary_period = user_details?.expected_salary_period;
                }

                catch (err) {
                    console.log(err, "save naukri details.salaryDetails");
                }

                //location

                try {
                    details.location = user_details?.location
                }
                catch (err) {

                }

                //Preffered location
                try {
                    details.preferredLocations = user_details?.pref_locations;
                }
                catch (err) {

                }

                //DOB
                try {
                    details.DOB = user_details?.DOB;
                }
                catch (err) {
                }

                //gender
                try {

                    details.gender = user_details?.gender;
                }
                catch (err) {
                    console.log(err, "save naukri gender");
                }
                // industry
                try {
                    details.industry = user_details?.industry;
                }
                catch (err) {
                    console.log(err, "save naukri industry");
                }

                // functional_areas
                try {
                    details.functional_areas = user_details?.functional_areas;
                }
                catch (err) {
                    console.log(err, "save naukri functional_areas");
                }

                //role
                try {
                    details.role = user_details?.role;
                }
                catch (err) {
                    console.log(err, "save naukri role");
                }

                //other_details
                try {
                    details.job_title = user_details?.work_history[0]?.designation;
                    details.designation = user_details?.work_history[0]?.designation;
                    details.current_employer = user_details?.current_employer;
                }
                catch (err) {

                }

                //history
                try {
                    details.work_history = user_details?.work_history;
                } catch (err) {
                    console.log(err, "save naukri details.work_history");
                }

                //skill exp
                try {
                    details.skill_experience = user_details?.experience;
                } catch (err) {
                    console.log(err, "save naukri  details.skill_experience");
                }

                //education

                try {

                    details.education = user_details?.education;
                    details.projects = user_details?.projects;
                } catch (err) {
                    console.log(err, "save naukri details.education");
                }
                //certifications
                try {
                    details.certifications = user_details?.certifications || [];
                }
                catch (err) {

                }

                try {
                    details.u_id = result?.file_uuid;
                    details.nationality = user_details?.nationality
                    details.job_type = user_details?.job_type
                    details.summary = user_details?.summary
                    details.languages = user_details?.languages
                }
                catch (err) {

                }
                try {
                    // details.resume_document = result?.extracted_pdf;
                    details.attachment = result?.extracted_pdf;

                }
                catch (err) {
                    console.log('resume file error', err)
                }
                if (user_details?.cvFileName) {
                    try {
                        details.file_name = user_details?.cvFileName;
                        details.resume_extension = user_details?.cvFileName?.split('.').pop();

                    }
                    catch (err) {
                        console.log('resume file error', err)
                    }
                }
                try {
                    details.last_modified_date = user_details?.last_modified_date;
                    details.portal_id = user_details?.portal_id;

                }
                catch (err) {
                    console.log('resume file error')
                }

                try {
                    if (req.body?.requirements) {
                        try {
                            if (typeof req.body?.requirements == "string") {
                                try {
                                    req.body.requirements = JSON.parse(req.body.requirements)
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                            if (req.body?.requirements?.length) {
                                details.requirements = req.body.requirements
                            } else {
                                details.requirements = [parseInt(req.body?.requirements)];
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
                catch (Err) {

                }
            }


        } catch (err) {

            console.log(err, 'error')
        }
    } else {
        user_details = shared_ctrl.jsonDeepParse(req.body.user_details);

        try {
            if (user_details) {
                console.log(user_details)
                //name
                if (user_details?.name) {
                    try {
                        details.full_name = user_details?.name;
                        try {
                            details.first_name = user_details?.name.split(',')[0].split(' ')[0]
                        } catch (error) {

                        }
                        try {
                            details.last_name = user_details?.name.split(',')[0].split(' ').pop()
                        } catch (error) {

                        }
                    }
                    catch (err) {

                    }
                }

                //emailId
                if (user_details?.email) {
                    try {
                        details.email_id = user_details?.email;
                    }
                    catch (err) { }
                }

                //mobile_number
                if (user_details?.mobile_number) {
                    try {
                        details.mobile_number = user_details?.mobile
                    }
                    catch (err) { }
                }
                try {
                    if ((user_details?.mobile).toString().length == 12) {
                        details.mobile_number = (user_details?.mobile).toString().slice(2, 12);
                        details.isd = (user_details?.mobile).toString().slice(0, 2);
                    }
                }
                catch (err) {

                }
                //address
                if (user_details?.address) {
                    try {
                        details.address = user_details?.address;
                    } catch (err) {
                        console.log(err, "save naukri details.address");
                    }
                }

                //  experience
                if (user_details?.stotalExp) {
                    try {
                        details.experience = user_details?.stotalExp;
                    }
                    catch (err) {
                        console.log(err, "save naukri details.experience");
                    }
                }
                //details.primary_skills
                if (user_details?.mergedKeySkill) {
                    try {
                        details.primary_skills = user_details?.mergedKeySkill?.split(',');
                    } catch (err) {
                        console.log(err, "save naukri details.primary_skills");
                    }
                }
                //details.notice_period
                if (user_details?.noticePeriod) {
                    try {
                        details.notice_period = user_details?.noticePeriod;
                    } catch (err) {
                        console.log(err, "save naukri details.notice_period");
                    }
                }
                // salary details
                if (user_details?.ctcValue) {
                    try {
                        details.present_salary = user_details?.ctcValue;

                        try {
                            details.present_salary_curr = user_details?.ctcType;
                        }
                        catch (Err) {

                        }

                        details.present_salary_period = "Lacs Per Annum";
                    }


                    catch (err) {
                        console.log(err, "save naukri details.salaryDetails");
                    }
                }
                //salary
                if (user_details?.expectedCtcValue) {
                    try {
                        details.expected_salary = user_details?.expectedCtcValue;

                        try {
                            details.expected_salary_curr = user_details?.expectedCtcType;
                        }
                        catch (Err) {

                        }

                        details.expected_salary_period = "Lacs Per Annum";
                    }

                    catch (err) {
                        console.log(err, "save naukri details.salaryDetails");
                    }
                }

                //location
                if (user_details?.city) {
                    try {
                        details.location = user_details?.city
                    }
                    catch (err) {

                    }
                }
                //Preffered location
                if (user_details?.preferredLocations) {
                    try {
                        details.preferredLocations = user_details?.prefLocation.split(',')
                    }
                    catch (err) {

                    }
                }

                //DOB
                if (user_details?.DOB) {
                    try {
                        details.DOB = shared_ctrl.dateConverter(user_details?.birthDate)
                    }
                    catch (err) {

                    }
                }

                //gender
                if (user_details?.gender) {
                    try {
                        let gender = user_details?.gender;
                        if (gender.toLowerCase() == "female") {

                            details.gender = 'F'
                        } else if (gender.toLowerCase() == "male") {

                            details.gender = 'M'
                        } else {
                            details.gender = '';
                        }
                    }
                    catch (err) {
                        console.log(err, "save naukri gender");
                    }
                }
                // industry
                if (user_details?.industryType) {
                    try {
                        details.industry = user_details?.industryType;
                    }
                    catch (err) {
                        console.log(err, "save naukri industry");
                    }
                }

                // functional_areas
                if (user_details?.farea) {
                    try {
                        details.functional_areas = user_details?.farea.split(',');
                    }
                    catch (err) {
                        console.log(err, "save naukri functional_areas");
                    }
                }
                //role
                if (user_details?.role) {
                    try {
                        details.role = user_details?.role;
                    }
                    catch (err) {
                        console.log(err, "save naukri role");
                    }
                }

                //other_details
                if (user_details?.role) {
                    try {
                        details.job_title = user_details?.role;
                        details.designation = user_details?.role;
                        details.current_employer = user_details?.companyName;


                    }
                    catch (err) {

                    }
                }
                //histrory
                if (user_details?.workExperiences) {
                    try {
                        var work_histories = [];
                        var work_history_element = user_details?.workExperiences;
                        //index 0 consists of current organization
                        if (work_history_element && work_history_element.length)
                            for (var i = 0; i < work_history_element.length; i++) {
                                var work_history = {};
                                work_history.duration = {
                                    from: new Date(work_history_element[i].startYearMillis),
                                    to: work_history_element[i].endYearMillis ? new Date(work_history_element[i].endYearMillis) : 'Present'
                                };

                                try {
                                    if (!work_history_element[i].endYearMillis) {
                                        details.job_title = work_history_element[i].designation;
                                        details.designation = work_history_element[i].designation;
                                        details.current_employer = work_history_element[i].organization;
                                    }
                                }
                                catch (err) {

                                }
                                work_history.employer = work_history_element[i].organization;
                                work_history.summary = work_history_element[i].jobProfile || '';
                                work_history.designation = work_history_element[i].designation;
                                work_histories.push(work_history);

                            }
                        details.work_history = work_histories;
                    } catch (err) {
                        console.log(err, "save naukri details.work_history");
                    }
                }


                //skill exp
                if (user_details?.skills) {

                    try {
                        let skill_experiences = [];
                        let skill_experience_element = user_details?.skills;
                        if (skill_experience_element && skill_experience_element.length) {
                            for (var i = 0; i < skill_experience_element.length; i++) {
                                var skill_experience = {};
                                if (skill_experience_element[i]?.skill?.label)
                                    skill_experience.skill_name = skill_experience_element[i].skill?.label;
                                if (skill_experience_element[i].lastUsed) {
                                    skill_experience.last_used = skill_experience_element[i].lastUsed;
                                }
                                if (skill_experience_element[i].version) {
                                    skill_experience.version = skill_experience_element[i].version;
                                }
                                try {
                                    skill_experience.experience = skill_experience_element[i].experienceTime || 0;
                                }
                                catch (err) {

                                }
                                skill_experiences.push(skill_experience);
                            }
                        }

                        details.skill_experience = skill_experiences;
                    } catch (err) {
                        console.log(err, "save naukri  details.skill_experience");
                    }
                }
                //education
                if (user_details?.educations) {
                    try {
                        let education = [];
                        let education_element = user_details?.educations;
                        for (let i = 0; i < education_element.length; i++) {
                            let education_object = {};
                            try {
                                education_object.institution = education_element[i]?.['institute'].label;
                                education_object.passing_year = education_element[i]?.['yearOfCompletion'];
                                education_object.specialization = education_element[i]?.['spec'].label;
                                education_object.education = education_element[i]?.['course'].label;
                                education_object.education_group = education_element[i]?.['educationType'].label;
                                // education_object.percentageType = education_element[i]['gradeId'] == 1 ? 2 : (education_element[i]['gradeId'] == 2 ? 3 : (education_element[i]['gradeId'] == 3 ? 1 : education_element[i]['gradeId']));
                                // education_object.percentage = education_element[i]['marks'];
                                education_object.educationType = education_element[i]['courseType'];
                            }
                            catch (err) {

                            }
                            education.push(education_object)
                            console.log(education_object);
                        }
                        details.education = education;
                    } catch (err) {
                        console.log(err, "save naukri details.education");
                    }
                }
                //certifications

                if (user_details?.certifications) {
                    try {
                        details.certifications = user_details?.certifications || [];
                    }
                    catch (err) {

                    }
                }
                if (user_details?.resumeId) {
                    try {
                        details.u_id = user_details?.resumeId
                    }
                    catch (err) {

                    }
                }
                if (user_details?.requirements) {
                    try {
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
                    }
                    catch (Err) {

                    }
                }
                if (user_details) {
                    try {
                        details.naukri_response = user_details;
                    }
                    catch (Err) {

                    }
                }
            }
            if (user_details?.base64) {
                try {
                    details.attachment = resume_details.base64;
                    details.file_name = resume_details.file_name;
                    details.resume_extension = resume_details.file_name.split('.').pop();
                }
                catch (err) {
                    console.log('resume file error')
                }
            }
        } catch (err) {

            console.log(err, 'error')
        }

    }
    console.log(details);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: save_url || shared_ctrl.save_api_url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + session.token
        },
        data: details
    };

    axios.request(config).then((response) => {
        console.log(JSON.stringify(response.data));
        res.status(200).json(response.data)

    }).catch((error) => {
        console.log(error);
        res.status(500).json(error)
    });
};


naukriImporter.checkApplicantExistsFromNaukriPortalRMS = function (req, res) {

    var response = new shared_ctrl.response();
    // var details = new shared_ctrl.duplicateDetails();
    // details.portalId = 1;


    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;

    var document = new JSDOM(xml_string).window.document;
    var applicants = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;

    try {
        if (is_select_all == 1) {
            try {
                if (document.querySelectorAll('.srchTup') && document.querySelectorAll('.srchTup').length) {
                    applicants = [];
                    for (var i = 0; i < document.querySelectorAll('.srchTup').length; i++) {
                        let detail = applicantDuplicatedParsedInfo(document.querySelectorAll('.srchTup')[i]);
                        applicants.push(detail);
                    }
                }
            } catch (err) {
                console.log(err, "Naukricheck if part");
            }
        }
        else {
            try {
                if (document.querySelectorAll('.srchTup')) {
                    applicants = [];
                    for (var i = 0; i < selected_candidates.length; i++) {
                        let detail = applicantDuplicatedParsedInfo(document.querySelectorAll('.srchTup')[selected_candidates[i]], selected_candidates[i])
                        applicants.push(detail);
                    }
                }

            } catch (err) {
                console.log(err, "Naukricheck else part");
            }
        }
        response.status = true;
        response.message = "Parsed XML Successfully";
        response.error = null;
        response.data = applicants;
        res.status(200).json(response);
    } catch (err) {
        var response = new shared_ctrl.response();
        response.status = false;
        response.message = "Error occoured";
        response.error = err;
        response.exception = err;
        res.status(200).json(response);
        console.log(err, "Naukricheck");
    }

};

naukriImporter.saveApplicantsFromNaukriRMS = function (req, res) {
    var response = new shared_ctrl.response();
    var details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 1;
    const { JSDOM } = jsdom;
    let request = req.body;
    let document = new JSDOM(request.xml_string).window.document;

    try {
        if (document) {
            //name
            try {
                if (document.querySelector("#basicDetailsSection .candTop #viewBasicDiv div[data-highlight='name']")) {
                    let name = document.querySelector("#basicDetailsSection .candTop #viewBasicDiv div[data-highlight='name']").innerHTML;
                    name = shared_ctrl.removeExtraChars(name);
                    name = name.trim()
                    details.full_name = name.split(',')[0];
                    try {
                        details.first_name = name.split(',')[0].split(' ')[0]
                    } catch (error) {

                    }
                    try {
                        details.last_name = name.split(',')[0].split(' ').pop()
                    } catch (error) {

                    }
                }
            } catch (error) {
            }

            //email
            try {
                if (document.querySelectorAll("#basicDetailsSection .candTop #viewBasicDiv a[data-highlight='email']")) {
                    let value_arr = document.querySelectorAll("#basicDetailsSection .candTop #viewBasicDiv a[data-highlight='email']");
                    if (value_arr[0]) {
                        let primary_email_id = value_arr[0].innerHTML;
                        primary_email_id = shared_ctrl.removeExtraChars(primary_email_id);
                        primary_email_id = primary_email_id.trim();
                        details.email_id = primary_email_id;
                    }
                    if (value_arr[1]) {
                        let alt_email_id = value_arr[1].innerHTML;
                        alt_email_id = shared_ctrl.removeExtraChars(alt_email_id);
                        alt_email_id = alt_email_id.trim();
                        details.alt_email_id = alt_email_id;
                    }
                }
            } catch (error) {

            }

            //mobile number
            try {
                if (document.querySelectorAll("#basicDetailsSection .candTop #viewBasicDiv #candidatePhoneId")) {
                    let value_arr = document.querySelectorAll("#basicDetailsSection .candTop #viewBasicDiv #candidatePhoneId");
                    if (value_arr[0]) {
                        let primary_phone = value_arr[0].innerHTML;
                        primary_phone = shared_ctrl.removeExtraChars(primary_phone);
                        primary_phone = primary_phone.trim();
                        details.mobile_number = primary_phone;
                    }
                    if (value_arr[1]) {
                        let alt_phon_number = value_arr[1].innerHTML;
                        alt_phon_number = shared_ctrl.removeExtraChars(alt_phon_number);
                        alt_phon_number = alt_phon_number.trim();
                        details.alt_mobile_number = alt_phon_number;
                    }
                }
            } catch (error) {

            }

            //experience 
            let details_card = document.querySelector('div.expDetails');

            try {
                if (details_card) {
                    let p_tags = details_card.querySelectorAll('p');
                    if (p_tags && p_tags.length) {
                        p_tags.forEach(ele => {
                            if (ele.querySelector('em') && ele.querySelector('em').innerHTML) {
                                let val = shared_ctrl.removeExtraChars(ele.querySelector('em').innerHTML).split(":")[0].trim();
                                if (keyMap[val]) {
                                    details[keyMap[val]] = ele.querySelector('span') ? shared_ctrl.removeExtraChars(ele.querySelector('span').innerHTML).trim() : '';
                                }
                            }
                        });
                    }
                }
            } catch (err) {
                console.log('Naukri error in Personal Details parsing')
            }
            //experience
            try {
                let temp_experience = 0;
                let temp_element = details.experience;
                if (temp_element && temp_element.indexOf(' Year(s)') > -1 && temp_element.split(' Year(s)') && temp_element.split(' Year(s)')[0]) {
                    temp_experience += temp_element.split(' Year(s)')[0] * 1;
                    temp_element = temp_element.split(' Year(s)')[1];
                }
                if (temp_element && temp_element.indexOf(' Month(s)') > -1 && temp_element.split(' Month(s)') && temp_element.split(' Month(s)')[0])
                    temp_experience += parseFloat((temp_element.split(' Month(s)')[0] / 12).toFixed(1));

                if (temp_experience) {
                    details.experience = temp_experience;
                }
            } catch (error) {
            }

            //notice period
            try {
                var notice_element = details.notice_period;
                let notice_period = 0;
                if (notice_element.indexOf('Month') > -1) {
                    notice_period = shared_ctrl.removeExtraChars(notice_element.split('Month')[0]) * 30;
                } else if (notice_element.indexOf('Days') > -1) {
                    notice_period = shared_ctrl.removeExtraChars(notice_element.split('Days')[0]) * 1;
                } else if (notice_element.indexOf('Currently Serving') > -1) {
                    notice_period = 15;
                }
                details.notice_period = notice_period;
            } catch (error) {

            }

            //present salary
            try {
                var salray_value = details.present_salary;
                if (salray_value) {
                    if (salray_value.split(' ')[0]) {
                        details.present_salary_curr = salray_value.split(' ')[0].trim()
                    }
                    if (salray_value.split(' ')[1]) {
                        details.present_salary = salray_value.split(' ')[1];
                    }
                    if (salray_value.split(' ')[2]) {
                        details.present_salary_scale = salray_value.split(' ')[2].trim()
                    }

                }
                details.notice_period = notice_period;
            } catch (error) {

            }

            //primary skills

            try {
                if (details.primary_skills && typeof details.primary_skills == 'string') {
                    details.primary_skills = details.primary_skills.split(',')
                }
            } catch (error) {

            }



            //work experience
            try {
                if (document.querySelectorAll("#workExpSection ul li")) {
                    details.work_history = [];
                    let history_elem = document.querySelectorAll("#workExpSection ul li");
                    if (history_elem && history_elem.length) {
                        for (let i = 0; i < history_elem.length; i++) {
                            let tempWorkHistory = {
                                company_name: '',
                                designation: '',
                                summary: '',
                                employer: '',
                                duration: {
                                    from: '',
                                    to: ''
                                },
                            };
                            try {
                                if (history_elem[i].querySelector('label[data-highlight]')) {
                                    let value = history_elem[i].querySelector('label[data-highlight]').innerHTML;
                                    value = (shared_ctrl.removeExtraChars(value)).trim();
                                    tempWorkHistory.company_name = value;
                                    tempWorkHistory.employer = value;
                                }
                            } catch (error) { }

                            // try {
                            //     if (history_elem[i].querySelector('span[data-highlight="currentExperience_designation"]')) {
                            //         let value = history_elem[i].querySelector('span[data-highlight="currentExperience_designation"]').innerHTML;
                            //         value = (shared_ctrl.removeExtraChars(value)).trim();
                            //         tempWorkHistory.designation = value;
                            //     }
                            // } catch (error) { }

                            try {
                                if (history_elem[i].querySelector('p[data-highlight="previousExperience2_jobProfile"]')) {
                                    let value = history_elem[i].querySelector('p[data-highlight="previousExperience2_jobProfile"]').innerHTML;
                                    value = (shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value))).trim();
                                    tempWorkHistory.summary = value;
                                }
                            } catch (error) { }

                            try {
                                if (history_elem[i].querySelector('.topHead span[data-highlight]').parentNode) {
                                    let value = history_elem[i].querySelector('.topHead span[data-highlight]').parentNode.innerHTML;
                                    value = shared_ctrl.stripHtmlTags((shared_ctrl.removeExtraChars(value)).trim());
                                    tempWorkHistory.designation = (value.split("|")[0]).trim();
                                    tempWorkHistory.job_title = (value.split("|")[0]).trim();
                                    let duration = value.split("|").pop();
                                    tempWorkHistory.duration.from = duration.split('To')[0].trim()
                                    tempWorkHistory.duration.to = duration.split('To')[1].trim()
                                }
                            } catch (error) {
                                console.log(error)
                            }

                            details.work_history.push(tempWorkHistory)
                        }
                    }
                }
            } catch (error) { }


            //education
            try {
                if (document.querySelectorAll("#educationSection .educationComponent ul li")) {
                    details.education = [];
                    let history_elem = document.querySelectorAll("#educationSection .educationComponent ul li");
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
                                if (history_elem[i].querySelectorAll('.topHead')[0]) {
                                    let value = history_elem[i].querySelectorAll('.topHead')[0].innerHTML;
                                    value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                                    tempEduHistory.specialization = value;
                                }
                            } catch (error) { }

                            try {
                                if (history_elem[i].querySelectorAll('.topHead')[1]) {
                                    let value = history_elem[i].querySelectorAll('.topHead')[1].innerHTML;
                                    value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                                    tempEduHistory.type = value;
                                    tempEduHistory.education = value;
                                }
                            } catch (error) { }

                            try {
                                if (history_elem[i].querySelector('.f14')) {
                                    let value = history_elem[i].querySelector('.f14').innerHTML;
                                    value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                                    let duration = value.split("|").pop();
                                    tempEduHistory.institution = value.split("|")[0];
                                    tempEduHistory.institution = tempEduHistory.institution.trim();
                                    duration.toLowerCase();
                                    tempEduHistory.passing_year = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(duration.split("|").pop().split('in').pop())).trim();

                                    // tempEduHistory.duration.to = duration.split('to')[1]
                                }
                            } catch (error) { }

                            details.education.push(tempEduHistory)
                        }
                    }
                }
            } catch (error) { }

            //skill experience
            try {
                if (document.querySelectorAll("#itSkillsSection #viewITSkillsDiv table tbody tr") && document.querySelectorAll("#itSkillsSection #viewITSkillsDiv table tbody tr").length) {
                    let skill_elements = document.querySelectorAll("#itSkillsSection #viewITSkillsDiv table tbody tr");
                    details.skill_experience = [];
                    for (let i = 0; i < skill_elements.length; i++) {
                        let skill_element = skill_elements[i]
                        let tempSkillExp = {};
                        try {
                            if (skill_element.querySelector('td[data-highlight="itSkills"]')) {
                                tempSkillExp.skill_name = shared_ctrl.removeExtraChars(skill_element.querySelector('td[data-highlight="itSkills"]').innerHTML).trim();
                            }
                        } catch (error) { }

                        try {
                            if (skill_element.querySelectorAll('td.col3')[0]) {
                                tempSkillExp.version = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td.col3')[0].innerHTML).trim();
                            }
                        } catch (error) { }

                        try {
                            if (skill_element.querySelectorAll('td.col3')[1]) {
                                tempSkillExp.last_used = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td.col3')[1].innerHTML).trim();
                            }
                        } catch (error) { }

                        try {
                            if (skill_element.querySelectorAll('td.col3')[2]) {
                                let temp_element = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td.col3')[2].innerHTML).trim();
                                tempSkillExp.experience = temp_element;
                                // var temp_experience = 0;
                                // if (temp_element && (temp_element.indexOf(' Year') > -1 || temp_element.indexOf(' Years') > -1)) {
                                //     temp_experience += temp_element.split(' Year')[0] * 1;
                                //     temp_element = temp_element.split(' Year')[1];
                                // }
                                // if (temp_element && temp_element.indexOf(' Month(s)') > -1 && temp_element.split(' Month(s)') && temp_element.split(' Month(s)')[0])
                                //     temp_experience += parseFloat((temp_element.split(' Month(s)')[0] / 12).toFixed(1));

                                // if (temp_experience) {
                                //     tempSkillExp.experience = temp_experience;
                                // }
                            }
                        } catch (error) { }
                        details.skill_experience.push(tempSkillExp)
                    }
                }
            } catch (error) { }

            //language

            try {
                if (document.querySelectorAll("#languageSection #viewLanguageDiv table tbody tr") && document.querySelectorAll("#languageSection #viewLanguageDiv table tbody tr").length) {
                    let lang = document.querySelectorAll("#languageSection #viewLanguageDiv table tbody tr");
                    details.languages = [];
                    for (let i = 0; i < lang.length; i++) {
                        let skill_element = lang[i];
                        try {
                            if (skill_element.querySelectorAll('td.col1')[0]) {
                                details.languages.push(shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td.col1')[0].innerHTML).trim());
                            }
                        } catch (error) { }
                    }
                }
            } catch (error) { }

            //Personal Details

            try {
                if (document.querySelector("#otherDetailsSection #viewOtherDetailsDiv")) {
                    let other_details = document.querySelectorAll("#otherDetailsSection #viewOtherDetailsDiv .detailsHead")
                    if (other_details && other_details.length) {
                        for (let i = 0; i < other_details.length; i++) {
                            let other_detail = other_details[i]
                            try {
                                if (other_detail.innerHTML.includes('Personal Detail')) {
                                    let temp_personal_details = other_detail.parentNode.querySelector("p").innerHTML;
                                    let split_details = temp_personal_details.split('<br>');
                                    if (split_details && split_details.length) {
                                        for (let j = 0; j < split_details.length; j++) {
                                            let elem = shared_ctrl.stripHtmlTags(split_details[j]);
                                            if (elem.split(":") && elem.split(":")[0] && elem.split(":")[0].includes('Date of Birth')) {
                                                let DOB = shared_ctrl.removeExtraChars(elem.split(":")[1]).trim();
                                                DOB = new Date(DOB.trim());
                                                details.DOB = DOB.getFullYear() + "-" + (DOB.getMonth() + 1) + "-" + DOB.getDate();
                                                if (details.DOB == 'NaN-NaN-NaN') {
                                                    details.DOB = undefined;
                                                }
                                            }

                                            if (elem.split(":") && elem.split(":")[0] && elem.split(":")[0].includes('Gender')) {
                                                let gender = shared_ctrl.removeExtraChars(elem.split(":")[1]).trim();
                                                gender = shared_ctrl.removeExtraChars(gender);
                                                if (gender.toLowerCase() == "female") {
                                                    details.gender = 'F'
                                                } else if (gender.toLowerCase() == "male") {
                                                    details.gender = 'M'
                                                } else {
                                                    details.gender = '';
                                                }
                                            }
                                        }

                                    }
                                    // details.DOB = personal_info.split('<br>')[0].split("</span>").pop();
                                    // details.gender = personal_info.split('<br>')[1].split("</span>").pop();
                                    // details.DOB = personal_info.split('<br>')[0].split("</span>").pop();
                                }
                                if (other_detail.innerHTML.includes('Address')) {
                                    let temp_address = other_detail.parentNode.querySelector("pre").innerHTML;
                                    details.address = (shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(temp_address))).trim();
                                }

                                if (other_detail.innerHTML.includes('Desired Job Details')) {
                                    let split_details = temp_personal_details.split('<br>');
                                    if (split_details && split_details.length) {
                                        for (let j = 0; j < split_details.length; j++) {
                                            let elem = shared.ctrl.stripHtmlTags(split_details[j]);
                                            if (elem.split(":") && elem.split(":")[0] && elem.split(":")[0].includes('Job Type:')) {
                                                details.job_type = shared_ctrl.removeExtraChars(elem.split(":")[1]).trim();

                                            }
                                            if (elem.split(":") && elem.split(":")[0] && elem.split(":")[0].includes('Employment Status:')) {
                                                details.employment_status = shared_ctrl.removeExtraChars(elem.split(":")[1]).trim();

                                            }
                                        }

                                    }
                                }
                            } catch (error) { }
                        }
                    }


                }
            } catch (error) {
            }

        }


        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (error) {
        console.log(err);
        response.status = false;
        response.message = "something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }
};

// naukriImporter.checkApplicantExistsFromNaukriPortalApplied = function (req, res) {

//     var response = {
//         status: false,
//         message: "Invalid token",
//         data: null,
//         error: null
//     };

//     const { JSDOM } = jsdom;
//     var xml_string = req.body.xml_string;
//     var document = new JSDOM(xml_string).window.document;
//     var applicants = [];
//     var selected_candidates = req.body.selected_candidates;
//     var is_select_all = req.body.is_select_all;
//     var response_from_portal_api = req.body.response_from_portal_api;
//     var is_parsed = req.body.is_parsed;
//     let standAlone = req.body.standAlone;
//     let version = req.body.version;
//     let portal_version = req.body.portal_version;
//     let isJSON = req.body.isJSON;
//     let list = req.body.list;
//     let user_detailss = req.body.session;
//     let portal_details = req.body.selectedPortal;
//     let requirementList = req.body.requirements || [];

//     try {
//         if (list) {
//             for (var i = 0; i < list.length; i++) {
//                 user_details = list[i]
//                 //name
//                 try {
//                     details.full_name = user_details?.name || "";;
//                     try {
//                         details.first_name = user_details?.name.split(',')[0].split(' ')[0] || "";
//                     } catch (error) {
//                     }
//                     try {
//                         details.last_name = user_details?.name.split(',')[0].split(' ').pop() || "";
//                     } catch (error) {
//                     }
//                 }
//                 catch (err) {
//                 }
//                 //emailId
//                 try {
//                     details.email_id = user_details?.email || "";
//                 }
//                 catch (err) { }
//                 try {
//                     details.alt_email_id = user_details?.email || "";
//                 }
//                 catch (err) { }
//                 //mobile_number
//                 // try {
//                 //   details.mobile_number = user_details?.phoneNumber[0] || ""
//                 // }
//                 // catch (err) { }
//                 // try {
//                 //   if ((user_details?.phoneNumber[0]).toString().length == 12) {
//                 //     details.mobile_number = (user_details?.phoneNumber[0]).toString().slice(2, 12);
//                 //     details.isd = (user_details?.phoneNumber[0]).toString().slice(0, 2);
//                 //   }
//                 // }
//                 // catch (err) {
//                 // }
//                 try {
//                     details.age = user_details?.age || ""
//                 } catch (error) {
//                 }
//                 //address
//                 try {
//                     details.address = user_details?.currentCity || "";
//                 } catch (err) {
//                     console.log(err, "save naukri details.address");
//                 }
//                 try {
//                     details.last_modified_date = user_details?.lastActiveOnResdex || "";
//                 } catch (err) {
//                     console.log(err, "save naukri details.last_modified_date");
//                 }
//                 //  experience
//                 try {
//                     details.experience = user_details?.experience['years'] + " years " + user_details?.experience['months'] + " months" || "";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri details.experience");
//                 }
//                 // Profile Pic
//                 try {
//                     details.profile_pic = user_details?.photo || "";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri details.profile_pic");
//                 }
//                 // Portal Id
//                 try {
//                     details.portal_id = 1;
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri details.portal_id");
//                 }
//                 //Languages
//                 try {
//                     // let languages = [];
//                     // let language_element = user_details?.languages;
//                     // if (language_element && language_element.length) {
//                     //   for (var i = 0; i < language_element.length; i++) {
//                     //     var language = {};
//                     //     if (language_element[i])
//                     //       language.language_name = language_element[i];
//                     //     languages.push(language);
//                     //   }
//                     // }
//                     details.languages = user_details?.languages || [];
//                 } catch (err) {
//                     console.log(err, "save naukri details.languages");
//                 }
//                 //Secondary Skills
//                 // try {
//                 //   let secondary_skills = [];
//                 //   let secondary_skill_element = user_details?.mayKnow;
//                 //   if (secondary_skill_element && secondary_skill_element.length) {
//                 //     for (var i = 0; i < secondary_skill_element.length; i++) {
//                 //       var secondary_skill = {};
//                 //       if (secondary_skill_element[i])
//                 //         secondary_skill.skill_name = secondary_skill_element[i];
//                 //       secondary_skill.last_used = "";
//                 //       secondary_skill.experience = "";
//                 //       secondary_skills.push(secondary_skill);
//                 //     }
//                 //   }
//                 //   details.secondary_skills = secondary_skills;
//                 // } catch (err) {
//                 //   console.log(err, "save naukri details.secondary_skills");
//                 // }
//                 //details.notice_period
//                 try {
//                     details.notice_period = user_details?.noticePeriod || "";
//                 } catch (err) {
//                     console.log(err, "save naukri details.notice_period");
//                 }
//                 // salary details
//                 try {
//                     details.present_salary = user_details?.ctc['lacs'] + "." + user_details?.ctc['thousands'] + " " + user_details?.ctc['currency'] || "";
//                     try {
//                         details.present_salary_curr = user_details?.ctc['currency'] || "";
//                     }
//                     catch (Err) {
//                     }
//                     details.present_salary_period = "Lacs Per Annum";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri details.salaryDetails");
//                 }
//                 //salary
//                 try {
//                     details.expected_salary = user_details?.expectedCtc['lacs'] + "." + user_details?.expectedCtc['thousands'] + " " + user_details?.expectedCtc['currency'] || "";
//                     try {
//                         details.expected_salary_curr = user_details?.expectedCtc['currency'] || "";
//                     }
//                     catch (Err) {
//                     }
//                     details.expected_salary_period = "Lacs Per Annum";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri details.salaryDetails");
//                 }
//                 //location
//                 try {
//                     details.location = user_details?.currentCity || ""
//                 }
//                 catch (err) {
//                 }
//                 //Preffered locations
//                 try {
//                     // let preferredLocations = [];
//                     // let preferredLocation_element = user_details?.preferredLocation;
//                     // if (preferredLocation_element && preferredLocation_element.length) {
//                     //   for (var i = 0; i < preferredLocation_element.length; i++) {
//                     //     var preferredLocation = {};
//                     //     if (preferredLocation_element[i])
//                     //       preferredLocation.name = preferredLocation_element[i];
//                     //     preferredLocations.push(preferredLocation);
//                     //   }
//                     // }
//                     details.preferredLocations = user_details?.preferredLocations;
//                 } catch (err) {
//                     console.log(err, "save apna details.preferredLocation");
//                 }
//                 //DOB
//                 // try {
//                 //   details.DOB = shared_ctrl.dateConverter(user_details?.birthDate)
//                 // }
//                 // catch (err) {
//                 // }
//                 //gender
//                 // try {
//                 //   let gender = user_details?.gender;
//                 //   if (gender.toLowerCase() == "f") {

//                 //     details.gender = 'F'
//                 //   } else if (gender.toLowerCase() == "m") {

//                 //     details.gender = 'M'
//                 //   } else {
//                 //     details.gender = '';
//                 //   }
//                 // }
//                 // catch (err) {
//                 //   console.log(err, "save naukri gender");
//                 // }
//                 // industry
//                 try {
//                     // let industries = [];
//                     // let industry_element = user_details?.industries;
//                     // if (industry_element && industry_element.length) {
//                     //   for (var i = 0; i < industry_element.length; i++) {
//                     //     var industry = {};
//                     //     if (industry_element[i])
//                     //       industry.name = industry_element[i];
//                     //     industries.push(industry);
//                     //   }
//                     // }
//                     details.industry = user_details?.industry;
//                 } catch (err) {
//                     console.log(err, "save apna details.industry");
//                 }
//                 // functional_areas
//                 try {
//                     details.functional_areas = user_details?.functionalArea || [];
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri functional_areas");
//                 }
//                 //role
//                 try {
//                     details.role = user_details?.role || "";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri role");
//                 }
//                 try {
//                     details.skills = user_details?.keySkills || "";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri skills");
//                 }
//                 try {
//                     details.summary = user_details?.summary || "";
//                 }
//                 catch (err) {
//                     console.log(err, "save naukri summary");
//                 }
//                 //other_details
//                 try {
//                     details.job_title = user_details?.workExp[0]?.designation || "";
//                     details.designation = user_details?.designation || "";
//                     details.current_employer = user_details?.current_employer || "";
//                 }
//                 catch (err) {
//                 }
//                 //Work history
//                 try {
//                     var work_histories = [];
//                     var work_history_element = user_details?.workExp;
//                     //index 0 consists of current organization
//                     if (work_history_element && work_history_element?.length)
//                         for (var i = 0; i < work_history_element?.length; i++) {
//                             var work_history = {};
//                             work_history.duration = {
//                                 from: new Date(work_history_element[i].workingFrom),
//                                 to: work_history_element[i]?.workingTo ? new Date(work_history_element[i].workingTo) : 'Present'
//                             };
//                             work_history.employer = work_history_element[i]?.company;
//                             work_history.summary = work_history_element[i]?.jobProfile || '';
//                             work_history.designation = work_history_element[i]?.designation;
//                             work_histories.push(work_history);
//                         }
//                     details.work_history = work_histories;
//                 } catch (err) {
//                     console.log(err, "save naukri details.work_history");
//                 }
//                 //skill exp
//                 // try {
//                 //   let skill_experiences = [];
//                 //   let skill_experience_element = user_details?.skills;
//                 //   if (skill_experience_element && skill_experience_element?.length) {
//                 //     for (var i = 0; i < skill_experience_element?.length; i++) {
//                 //       var skill_experience = {};
//                 //       if (skill_experience_element[i])
//                 //         skill_experience.skill_name = stripHtmlTags(skill_experience_element[i]);
//                 //       skill_experience.last_used = "";
//                 //       skill_experience.experience = "";
//                 //       skill_experiences.push(skill_experience);
//                 //     }
//                 //   }
//                 //   details.skill_experience = skill_experiences;
//                 //   details.primary_skills = skill_experiences;

//                 // } catch (err) {
//                 //   console.log(err, "save naukri details.skill_experience");
//                 // }
//                 //education
//                 try {
//                     let education = [];
//                     let education_element = user_details?.education;
//                     for (let i = 0; i < education_element?.length; i++) {
//                         let education_object = {};
//                         try {
//                             education_object.institution = education_element[i]?.institute;
//                             education_object.passing_year = education_element[i]?.year ? education_element[i].year : "still studying";
//                             education_object.specialization = education_element[i]?.specialization;
//                             education_object.education = education_element[i]?.courseType;
//                             education_object.education_group = education_element[i]?.institute;

//                             education_object.educationType = education_element[i]?.degreeType
//                                 ;
//                         }
//                         catch (err) {

//                         }
//                         if (education_object.institution)
//                             education.push(education_object);

//                     }
//                     details.education = education;
//                 } catch (err) {
//                     console.log(err, "save naukri details.education");
//                 }

//                 try {
//                     details.uid = user_details?.applicationId || ""
//                 }
//                 catch (err) {
//                 }
//                 try {
//                     details.naukri_response = user_details;
//                 }
//                 catch (Err) {

//                 }
//             }

//             console.log(details);

//         let details = {
//             applicants: applicants,
//             overwriteResumeWithDoc: portal_details.overwriteResumeWithDoc || 0,
//             overwriteResumeOnlyDoc: portal_details.overwriteResumeOnlyDoc || 0,
//             requirements: requirementList
//         }
//         let config = {
//             method: 'post',
//             maxBodyLength: Infinity,
//             url: portal_details.duplicateCheckApiUrl,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': "Bearer " + user_details?.token
//             },
//             data: details
//         };
//         console.log(config);
//         // res.status(200).json({ data: [] });
//         axios.request(config).then((response) => {
//             console.log('axios response' + JSON.stringify(response.data));
//             res.status(200).json({ data: response.data });
//         }).catch((error) => {
//             console.log(error);
//             res.status(500).json(error)
//         });

//         }
//     } catch (err) {
//         var response = new shared_ctrl.response();
//         response.status = false;
//         response.message = "Error occoured";
//         response.error = err;
//         response.exception = err;
//         res.status(200).json(response);
//         console.log(err, "Naukricheck");
//     }

// };

naukriImporter.checkApplicantExistsFromNaukriPortalApplied = function (req, res) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var document = new JSDOM(xml_string).window.document;
    var applicantss = [];
    var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var response_from_portal_api = req.body.response_from_portal_api;
    var is_parsed = req.body.is_parsed;
    let standAlone = req.body.standAlone;
    let version = req.body.version;
    let portal_version = req.body.portal_version;
    let isJSON = req.body.isJSON;
    let list = req.body.list;
    let user_detail = req.body.session;
    let portal_details = req.body.selectedPortal;
    let requirementList = req.body.requirements || [];

    console.log("entered naukri duplication check")
    console.log(list.length)
    console.log(list, "liiiiiiiiii")
    if (isJSON) {
        if (!(list && list.length)) {
            res.status(500).json({ message: 'Something went wrong' });
            return;
        }
        if (list) {

            for (var i = 0; i < list.length; i++) {
                const details = {};
                const user_details = list[i];
                if (!user_details) {
                    console.error(`User details missing at index ${i}`);
                    continue;
                }
                // user_details = list[i]
                // console.log(user_details,"uuuuuuuuuuuuuuuuusssssssssssddddd")
                // console.log(i, "uuuuuuuuuuuuuuuuusssssssssssddddd",list.length)
                //name
                try {
                    details.full_name = user_details?.name || "";
                    details.first_name = user_details?.name?.split(",")[0]?.split(" ")[0] || "";
                    details.last_name = user_details?.name?.split(",")[0]?.split(" ").pop() || "";
                    details.email_id = user_details?.email || "";
                    details.alt_email_id = user_details?.email || "";
                    details.age = user_details?.age || "";
                    details.address = user_details?.currentCity || "";
                    details.last_modified_date = user_details?.lastActiveOnResdex || "";
                    details.experience = `${user_details?.experience?.years || 0} years ${user_details?.experience?.months || 0} months`;
                    details.profile_pic = user_details?.photo || "";
                    details.portal_id = 1;
                    details.languages = user_details?.languages || [];
                    details.notice_period = user_details?.noticePeriod || "";
                    details.present_salary = `${user_details?.ctc?.lacs || 0}.${user_details?.ctc?.thousands || 0} ${user_details?.ctc?.currency || ""}`;
                    details.expected_salary = `${user_details?.expectedCtc?.lacs || 0}.${user_details?.expectedCtc?.thousands || 0} ${user_details?.expectedCtc?.currency || ""}`;
                    details.location = user_details?.currentCity || "";
                    details.preferredLocations = user_details?.preferredLocations || [];
                    details.industry = user_details?.industry || "";
                    details.functional_areas = user_details?.functionalArea || [];
                    details.role = user_details?.role || "";
                    details.skills = user_details?.keySkills || "";
                    details.summary = user_details?.summary || "";
                    details.job_title = user_details?.workExp?.[0]?.designation || "";
                    details.designation = user_details?.designation || "";
                    details.current_employer = user_details?.current_employer || "";

                    // Work history
                    const work_histories = [];
                    const work_history_element = user_details?.workExp || [];
                    for (const work of work_history_element) {
                        work_histories.push({
                            duration: {
                                from: work?.workingFrom ? new Date(work.workingFrom) : null,
                                to: work?.workingTo ? new Date(work.workingTo) : "Present",
                            },
                            employer: work?.company || "",
                            summary: work?.jobProfile || "",
                            designation: work?.designation || "",
                        });
                    }
                    details.work_history = work_histories;

                    // Education
                    const education = [];
                    const education_element = user_details?.education || [];
                    for (const edu of education_element) {
                        education.push({
                            institution: edu?.institute || "",
                            passing_year: edu?.year || "still studying",
                            specialization: edu?.specialization || "",
                            education: edu?.courseType || "",
                            education_group: edu?.institute || "",
                            educationType: edu?.degreeType || "",
                        });
                    }
                    details.education = education;

                    details.uid = user_details?.applicationId || "";
                    details.index = i;
                    details.naukri_response = user_details;

                    // Push the details object to the applicantss array
                    applicantss.push(details);

                } catch (err) {
                    console.error(`Error processing user at index ${i}:`, err);
                }
            }

        }
        console.log(applicantss, "aaaaaaaaaaa");

        let detail = {
            applicants: applicantss,
            overwriteResumeWithDoc: portal_details.overwriteResumeWithDoc || 0,
            overwriteResumeOnlyDoc: portal_details.overwriteResumeOnlyDoc || 0,
            requirements: requirementList
        }
        console.log(detail, "aaaaaaaaaaappppppppppp")
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: portal_details.duplicateCheckApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + user_detail?.token
            },
            data: detail
        };
        console.log(config, "configggggg");
        // res.status(200).json({ data: [] });
        axios.request(config).then((response) => {
            console.log('axios response' + JSON.stringify(response.data));
            res.status(200).json({ data: response.data });
        }).catch((error) => {
            console.log(error);
            res.status(500).json(error)
        });

    }

};

naukriImporter.saveApplicantsFromNaukriApplied = function (req, res) {
    var response = new shared_ctrl.response();
    var details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 1;
    var tallintToken = req.body.session['token'];
    let user_details = shared_ctrl.jsonDeepParse(req.body.user_details);
    let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
    let portal_details = shared_ctrl.jsonDeepParse(req.body.portal_details);
    let client_details = shared_ctrl.jsonDeepParse(req.body.client_details);
    let selectedPortal = shared_ctrl.jsonDeepParse(req.body.selectedPortal);
    let save_url = req.body.save_url;

    if (selectedPortal.resumeSaveApiUrl) {
        save_url = selectedPortal.resumeSaveApiUrl;
        console.log(save_url)
    } try {
        if (user_details) {
            //name
            try {
                details.full_name = user_details?.name || "";;
                try {
                    details.first_name = user_details?.name.split(',')[0].split(' ')[0] || "";
                } catch (error) {
                }
                try {
                    details.last_name = user_details?.name.split(',')[0].split(' ').pop() || "";
                } catch (error) {
                }
            }
            catch (err) {
            }
            //emailId
            try {
                details.email_id = user_details?.email || "";
            }
            catch (err) { }
            try {
                details.alt_email_id = user_details?.email || "";
            }
            catch (err) { }
            //mobile_number
            // try {
            //   details.mobile_number = user_details?.phoneNumber[0] || ""
            // }
            // catch (err) { }
            // try {
            //   if ((user_details?.phoneNumber[0]).toString().length == 12) {
            //     details.mobile_number = (user_details?.phoneNumber[0]).toString().slice(2, 12);
            //     details.isd = (user_details?.phoneNumber[0]).toString().slice(0, 2);
            //   }
            // }
            // catch (err) {
            // }
            try {
                details.age = user_details?.age || ""
            } catch (error) {
            }
            //address
            try {
                details.address = user_details?.currentCity || "";
            } catch (err) {
                console.log(err, "save naukri details.address");
            }
            try {
                details.last_modified_date = user_details?.lastActiveOnResdex || "";
            } catch (err) {
                console.log(err, "save naukri details.last_modified_date");
            }
            //  experience
            // try {
            //     details.experience = user_details?.experience['years'] + " years " + user_details?.experience['months'] + " months" || "";

            // }
            // catch (err) {
            //     console.log(err, "save naukri details.experience");
            // }
            // try {
            //     // let temp_experience = 0;
            //     // console.log(user_details?.experience);

            //     // const temp_element = user_details?.experience;

            //     // if (temp_element?.years) {
            //     //     temp_experience += temp_element.years;
            //     // }

            //     // if (temp_element?.months) {
            //     //     temp_experience += parseFloat((temp_element.months / 12).toFixed(1));
            //     // }

            //     // if (temp_experience) {
            //     //     details.experience = temp_experience;
            //     // }

            //     console.log("Converted Experience:", temp_experience);
            // } catch (error) {
            //     console.error("Error processing experience:", error);
            // }

            try {
                details.profile_pic = user_details?.photo || "";
            }
            catch (err) {
                console.log(err, "save naukri details.profile_pic");
            }
            // Portal Id
            try {
                details.portal_id = 1;
            }
            catch (err) {
                console.log(err, "save naukri details.portal_id");
            }
            //Languages
            try {
                // let languages = [];
                // let language_element = user_details?.languages;
                // if (language_element && language_element.length) {
                //   for (var i = 0; i < language_element.length; i++) {
                //     var language = {};
                //     if (language_element[i])
                //       language.language_name = language_element[i];
                //     languages.push(language);
                //   }
                // }
                details.languages = user_details?.languages || [];
            } catch (err) {
                console.log(err, "save naukri details.languages");
            }
            //Secondary Skills
            // try {
            //   let secondary_skills = [];
            //   let secondary_skill_element = user_details?.mayKnow;
            //   if (secondary_skill_element && secondary_skill_element.length) {
            //     for (var i = 0; i < secondary_skill_element.length; i++) {
            //       var secondary_skill = {};
            //       if (secondary_skill_element[i])
            //         secondary_skill.skill_name = secondary_skill_element[i];
            //       secondary_skill.last_used = "";
            //       secondary_skill.experience = "";
            //       secondary_skills.push(secondary_skill);
            //     }
            //   }
            //   details.secondary_skills = secondary_skills;
            // } catch (err) {
            //   console.log(err, "save naukri details.secondary_skills");
            // }
            //details.notice_period
            try {
                details.notice_period = user_details?.noticePeriod || "";
            } catch (err) {
                console.log(err, "save naukri details.notice_period");
            }
            // salary details
            try {
                details.present_salary = user_details?.ctc['lacs'] + " " + user_details?.ctc['thousands'];
                try {
                    details.present_salary_curr = user_details?.ctc['currency'] || "";
                }
                catch (Err) {
                }
                details.present_salary_period = "Lacs Per Annum";
            }
            catch (err) {
                console.log(err, "save naukri details.salaryDetails");
            }
            //salary
            try {
                details.expected_salary = user_details?.expectedCtc['lacs'] + "." + user_details?.expectedCtc['thousands'];
                try {
                    details.expected_salary_curr = user_details?.expectedCtc['currency'] || "";
                }
                catch (Err) {
                }
                details.expected_salary_period = "Lacs Per Annum";
            }
            catch (err) {
                console.log(err, "save naukri details.salaryDetails");
            }
            //location
            try {
                details.location = user_details?.currentCity || ""
            }
            catch (err) {
            }
            //Preffered locations
            try {
                // let preferredLocations = [];
                // let preferredLocation_element = user_details?.preferredLocation;
                // if (preferredLocation_element && preferredLocation_element.length) {
                //   for (var i = 0; i < preferredLocation_element.length; i++) {
                //     var preferredLocation = {};
                //     if (preferredLocation_element[i])
                //       preferredLocation.name = preferredLocation_element[i];
                //     preferredLocations.push(preferredLocation);
                //   }
                // }
                details.preferredLocations = user_details?.preferredLocations;
            } catch (err) {
                console.log(err, "save apna details.preferredLocation");
            }
            //DOB
            // try {
            //   details.DOB = shared_ctrl.dateConverter(user_details?.birthDate)
            // }
            // catch (err) {
            // }
            //gender
            // try {
            //   let gender = user_details?.gender;
            //   if (gender.toLowerCase() == "f") {

            //     details.gender = 'F'
            //   } else if (gender.toLowerCase() == "m") {

            //     details.gender = 'M'
            //   } else {
            //     details.gender = '';
            //   }
            // }
            // catch (err) {
            //   console.log(err, "save naukri gender");
            // }
            // industry
            try {
                // let industries = [];
                // let industry_element = user_details?.industries;
                // if (industry_element && industry_element.length) {
                //   for (var i = 0; i < industry_element.length; i++) {
                //     var industry = {};
                //     if (industry_element[i])
                //       industry.name = industry_element[i];
                //     industries.push(industry);
                //   }
                // }
                details.industry = user_details?.industry;
            } catch (err) {
                console.log(err, "save apna details.industry");
            }
            // functional_areas
            try {
                details.functional_areas = user_details?.functionalArea || [];
            }
            catch (err) {
                console.log(err, "save naukri functional_areas");
            }
            //role
            try {
                details.role = user_details?.role || "";
            }
            catch (err) {
                console.log(err, "save naukri role");
            }
            try {
                details.skills = user_details?.keySkills || "";
            }
            catch (err) {
                console.log(err, "save naukri skills");
            }
            try {
                details.summary = user_details?.summary || "";
            }
            catch (err) {
                console.log(err, "save naukri summary");
            }
            //other_details
            try {
                details.job_title = user_details?.workExp[0]?.designation || "";
                details.designation = user_details?.designation || "";
                details.current_employer = user_details?.current_employer || "";
            }
            catch (err) {
            }
            //Work history
            try {
                var work_histories = [];
                var work_history_element = user_details?.workExp;
                //index 0 consists of current organization
                if (work_history_element && work_history_element?.length)
                    for (var i = 0; i < work_history_element?.length; i++) {
                        var work_history = {};
                        work_history.duration = {
                            from: new Date(work_history_element[i].workingFrom),
                            to: work_history_element[i]?.workingTo ? new Date(work_history_element[i].workingTo) : 'Present'
                        };
                        work_history.employer = work_history_element[i]?.company;
                        work_history.summary = work_history_element[i]?.jobProfile || '';
                        work_history.designation = work_history_element[i]?.designation;
                        work_histories.push(work_history);
                    }
                details.work_history = work_histories;
            } catch (err) {
                console.log(err, "save naukri details.work_history");
            }
            //skill exp
            // try {
            //   let skill_experiences = [];
            //   let skill_experience_element = user_details?.skills;
            //   if (skill_experience_element && skill_experience_element?.length) {
            //     for (var i = 0; i < skill_experience_element?.length; i++) {
            //       var skill_experience = {};
            //       if (skill_experience_element[i])
            //         skill_experience.skill_name = stripHtmlTags(skill_experience_element[i]);
            //       skill_experience.last_used = "";
            //       skill_experience.experience = "";
            //       skill_experiences.push(skill_experience);
            //     }
            //   }
            //   details.skill_experience = skill_experiences;
            //   details.primary_skills = skill_experiences;

            // } catch (err) {
            //   console.log(err, "save naukri details.skill_experience");
            // }
            //education
            try {
                let education = [];
                let education_element = user_details?.education;
                for (let i = 0; i < education_element?.length; i++) {
                    let education_object = {};
                    try {
                        education_object.institution = education_element[i]?.institute;
                        education_object.passing_year = education_element[i]?.year ? education_element[i].year : "still studying";
                        education_object.specialization = education_element[i]?.specialization;
                        education_object.education = education_element[i]?.courseType;
                        education_object.education_group = education_element[i]?.institute;
                        education_object.educationType = education_element[i]?.degreeType;
                    }
                    catch (err) {

                    }
                    if (education_object.institution)
                        education.push(education_object);

                }
                details.education = education;
            } catch (err) {
                console.log(err, "save naukri details.education");
            }

            try {
                details.uid = user_details?.jobSeekerUserId || ""
            }
            catch (err) {
            }
            try {
                details.naukri_response = user_details;
            }
            catch (Err) {

            }
        }

        console.log(details);
        // try {
        //     details.attachment = resume_details?.base64;
        //     details.file_name = resume_details?.file_name;
        //     details.resume_extension = resume_details.file_name?.split('.').pop();
        // }
        // catch (err) {
        //     console.log('resume file error')
        // }
    } catch (err) {

        console.log(err, 'error')
    }

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: save_url || shared_ctrl.save_api_url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + tallintToken
        },
        data: details
    };
    console.log(config)
    axios.request(config).then((response) => {
        console.log(JSON.stringify(response.data));
        res.status(200).json(response.data)
    }).catch((error) => {
        console.log(error);
        res.status(500).json(error)
    });
}


var keyMap = {
    "Current Designation": "designation",
    "Current Company": "current_employer",
    "Current Location": "location",
    "Pref. Location": "pref_locations",
    "Preferred Locations": "pref_locations",
    "Functional Area": "functional_areas",
    "Role": "role",
    "Industry": "industry",
    "Key Skills": "primary_skills",
    "Current Location": "location",
    "Pref Location": "pref_locations",
    "Total Experience": "experience",
    "Annual Salary": "present_salary",
    "Highest Degree": "highest_degree",
    "Notice period": "notice_period",
    "Date of Birth": "DOB",
    "Gender": "gender",
    "Marital Status:": "marital_status",
    "Job Type": "job_type",
    "Employment Status:": "employment_status",
    "Department": "department",
    "Experience": "experience",
    "Current Salary": "present_salary",
    "Expected Salary": "exp_salary",


}

function parseV3DuplicateInfo(document, index = 0) {
    let details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 1;
    details.index = index;
    //u_id = ""
    try {
        let link = document.querySelector('.candidate-headline a').getAttribute('href');
        details.uid = shared_ctrl.getParameterByName('uniqId', link);
    } catch (error) {

    }
    //name
    try {

        details.full_name = shared_ctrl.removeExtraChars((document.querySelector('.candidate-name').innerHTML));
        details.first_name = "";
        details.last_name = "";

        console.log(details.full_name);
        if (details.full_name.split(' ')) {
            if (details.full_name.split(' ')[0])
                details.first_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[0]);
            if (details.full_name.split(' ')[details.full_name.split(' ').length - 1])
                details.last_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[details.full_name.split(' ').length - 1]);
        }
    } catch (err) {
        console.log(err, "Naukricheck last_name, first_name");
    }

    //location
    try {
        details.location = shared_ctrl.removeExtraChars((document.querySelector('.location').innerHTML))
    } catch (error) {

    }

    //current employer

    try {
        for (let j = 0; j < document.querySelectorAll('.detail').length; j++) {
            let elem = document.querySelectorAll('.detail')[j];
            let key = shared_ctrl.removeExtraChars((elem.querySelector('label').innerHTML));
            // if (keyMapV3Dup.key) {
            try {
                if (key == 'Current') {
                    details.job_title = shared_ctrl.removeExtraChars((elem.querySelectorAll('.link-button')[0].innerHTML))
                    details.current_employer = shared_ctrl.removeExtraChars((elem.querySelectorAll('.link-button')[1].innerHTML));
                }
            }
            catch (error) { }

            try {
                if (key == 'Pref. Location') {
                    details.pref_locations = [shared_ctrl.removeExtraChars((elem.querySelectorAll('span')[0].innerHTML))]
                }
            }
            catch (error) { }

            try {
                if (key == 'Keyskills' || elem.querySelectorAll('.key-skills button') && elem.querySelectorAll('.key-skills button').length) {
                    let skill_elem = []
                    for (let k = 0; k < elem.querySelectorAll('.key-skills button').length; k++) {
                        let skill = shared_ctrl.removeExtraChars((elem.querySelectorAll('.key-skills button')[k].innerHTML));
                        skill_elem.push(skill);
                    }

                    details.skills = skill_elem;
                }
            }
            catch (error) { }
            // }
        }
        // details.current_employer = ;
        // details.job_title = ;
    }
    catch (error) { }

    return details;
}

var keyMapV3Dup = {
    "Current:": "current_employer",
    "Previous:": "current_employer",
    "Education:": "location",
    "Pref. Location:": "pref_locations",
    "Keyskills:": "primary_skills"
}

module.exports = naukriImporter;











