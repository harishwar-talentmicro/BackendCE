const { FONT_SANS_16_BLACK } = require("jimp");
const jsdom = require("jsdom");
const { stripHtmlTags } = require("./shared-ctrl");

var shared_ctrl = require('./shared-ctrl')
monsterUSImporter = {};

monsterUSImporter.checkApplicantExistsFromMonsterPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    try {

        // var validationFlag = true;
        var portalId = 21;

        const { JSDOM } = jsdom;
        var xml_string = req.body.xml_string;

        var document = new JSDOM(xml_string).window.document;
        var applicants = [];
        var selected_candidates = req.body.selected_candidates;
        try {
            if (req.body.is_select_all == 1) {
                try {
                    console.log("req.body.is_select_all", req.body.is_select_all);
                    if (document.querySelectorAll('.smui-card'))
                        for (var i = 0; i < document.querySelectorAll('.smui-card').length; i++) {
                            var element = document.querySelectorAll('.smui-card')[i];
                            var applicant;
                            applicant = monsterDuplicateParsing(element, i, portalId);
                            applicants.push(applicant);
                        }
                    console.log("applicants", applicants);
                } catch (ex) {
                    console.log(ex, "chechMonster if part");
                }
            }
            else {
                console.log("else part");
                try {
                    if (document.querySelectorAll('.smui-card'))
                        for (var i = 0; i < selected_candidates.length; i++) {
                            var element = document.querySelectorAll('.smui-card')[selected_candidates[i]];
                            var applicant;

                            applicant = monsterDuplicateParsing(element, selected_candidates[i], portalId);

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


monsterUSImporter.saveApplicantsFromMonster = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occurred",
        data: null,
        error: null
    };
    try {

        // var portalId = req.body.portalId || 2; // monster
        var portalId = 21;
        // var validationFlag = true;

        var details = {};
        const { JSDOM } = jsdom;

        var document = new JSDOM(req.body.document).window.document;
        var resume_details = new JSDOM(req.body.resume_string).window.document;
        // console.log('req.files.document',req.body.document);
        details = monsterResumeParsing(document, resume_details, portalId);

        if (typeof req.body.isTallint == "string") {
            req.body.isTallint = parseInt(req.body.isTallint);
        }
        if (typeof req.body.isIntranet == "string") {
            req.body.isIntranet = parseInt(req.body.isIntranet);
        }


        // for tallint


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

var monsterDuplicateParsing = function (document, index, portalId) {
    let details = new shared_ctrl.portalimporterDetails();
    try {

        details.portal_id = 21;
        details.index = index;
        //name
        try {
            details.full_name = shared_ctrl.removeExtraChars((document.querySelector('.candidate-name span').innerHTML));
            details.first_name = "";
            details.last_name = "";

            console.log(details.full_name);
            if (details.full_name.split(' ')) {
                if (details.full_name.split(' ')[0])
                    details.first_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[0]);
                if (details.full_name.split(' ')[details.full_name.split(' ').length - 1])
                    details.last_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[details.full_name.split(' ').length - 1]);
            }
        }
        catch (ex) {
            console.log(ex, "Naukricheck last_name, first_name");
        }
        try {
            details.uid = shared_ctrl.removeExtraChars((document.querySelector('.smui-checkbox-wrap input').value));
        }
        catch (ex) {
            console.log(ex, "Monster Duplicate us Location");
        }
        //location
        try {
            details.location = shared_ctrl.removeExtraChars((document.querySelector('.candidate-location').innerHTML));
        }
        catch (ex) {
            console.log(ex, "Monster Duplicate us Location  ");
        }
        //current employer
        try {
            details.current_employer = shared_ctrl.removeExtraChars((document.querySelectorAll(".smui-card-body .candidate-jobs.current-prev-job .job-company")[0].innerHTML));
            details.role = shared_ctrl.removeExtraChars((document.querySelectorAll(".smui-card-body .candidate-jobs.current-prev-job .job-position .job-title")[0].innerHTML));
        }
        catch (ex) {
            console.log(ex, "Monster Duplicate us current employer  ");
        }
        //top skills`
        try {
            details.primary_skills = shared_ctrl.removeExtraChars((document.querySelectorAll(".smui-card-body .job-position.top-skills .first-three-skills")[0].innerHTML));

        }
        catch (ex) {
            console.log(ex, "Monster Duplicate us current employer");
        }

    }
    catch (ex) {
        console.log(ex, "chechMonster first name, last name");
    }

    return details;
}

function monsterResumeParsing(document, resume_doc, portalId) {
    let details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 21;
    //Name
    try {
        details.full_name = shared_ctrl.removeExtraChars((document.querySelector('.candidate-name div').innerHTML));
        details.first_name = "";
        details.last_name = "";

        console.log(details.full_name);
        if (details.full_name.split(' ')) {
            if (details.full_name.split(' ')[0])
                details.first_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[0]);
            if (details.full_name.split(' ')[details.full_name.split(' ').length - 1])
                details.last_name = shared_ctrl.removeExtraChars(details.full_name.split(' ')[details.full_name.split(' ').length - 1]);
        }
    }
    catch (err) {
        console.log("Monster save name", err)
    }
    //location
    try {
        details.location = shared_ctrl.removeExtraChars((document.querySelector('.candidate-location').innerHTML));
    }
    catch (err) {
        console.log("Monster save location", err)
    }

    //skill experience
    try {
        if (document.querySelectorAll(".profile-skills-table .subTableWrap") && document.querySelectorAll(".profile-skills-table .subTableWrap").length) {
            let skill_elements = document.querySelectorAll(".profile-skills-table .subTableWrap");
            details.skill_experience = [];
            for (let i = 0; i < skill_elements.length; i++) {
                let skill_element = skill_elements[i]
                let tempSkillExp = {};
                try {
                    if (skill_element.querySelector('.nameColumn')) {
                        tempSkillExp.skill_name = shared_ctrl.removeExtraChars(skill_element.querySelector('.nameColumn').innerHTML).trim();
                    }
                } catch (error) { }

                // try {
                //     if (skill_element.querySelectorAll('td.col3')[0]) {
                //         tempSkillExp.version = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td.col3')[0].innerHTML).trim();
                //     }
                // } catch (error) { }

                try {
                    if (skill_element.querySelector('.usedColumn')) {
                        tempSkillExp.last_used = shared_ctrl.dateFormat('01/' + shared_ctrl.removeExtraChars(skill_element.querySelector('.usedColumn').innerHTML).trim());
                    }
                } catch (error) { }

                try {
                    if (skill_element.querySelector('.skillDurationColumn')) {
                        let temp_element = shared_ctrl.removeExtraChars(skill_element.querySelector('.skillDurationColumn').innerHTML).trim();
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

    //work experience
    try {
        if (document.querySelectorAll("#expandingExperienceSectionsContainer .subTableWrap")) {
            details.work_history = [];
            let history_elem = document.querySelectorAll("#expandingExperienceSectionsContainer .subTableWrap");
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
                        if (history_elem[i].querySelector('.durationColumn')) {
                            let value = history_elem[i].querySelector('.durationColumn').innerHTML;
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
                        if (history_elem[i].querySelector('.detailsColumn')) {
                            let value = history_elem[i].querySelector('.detailsColumn').innerHTML;
                            value = (shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value))).trim();
                            tempWorkHistory.summary = value;
                        }
                    } catch (error) { }

                    try {
                        if (history_elem[i].querySelector('.usedColumn')) {
                            let value = history_elem[i].querySelector('.usedColumn').innerHTML;
                            value = shared_ctrl.stripHtmlTags((shared_ctrl.removeExtraChars(value)).trim());
                            tempWorkHistory.designation = (value).trim();
                            tempWorkHistory.job_title = (value).trim();

                        }
                    } catch (error) {
                        console.log(error)
                    }

                    try {
                        if (history_elem[i].querySelector('.nameColumn')) {
                            let value = history_elem[i].querySelector('.nameColumn').innerHTML;
                            value = shared_ctrl.stripHtmlTags((shared_ctrl.removeExtraChars(value)).trim());
                            let duration = value.split("-");
                            tempWorkHistory.duration.from = duration[0].trim()
                            tempWorkHistory.duration.to = duration[1].trim()



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
        if (document.querySelectorAll("#expandingEducationSectionsContainer .subTableWrap")) {
            details.education = [];
            let history_elem = document.querySelectorAll("#expandingEducationSectionsContainer .subTableWrap");
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
                        if (history_elem[i].querySelector('.usedColumn')) {
                            let value = history_elem[i].querySelector('.usedColumn').innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            let val = value.split(',')
                            if (val[1]) {
                                tempEduHistory.specialization = val[1].trim();
                                tempEduHistory.education = val[0].trim();
                            }
                            else {
                                tempEduHistory.education = val[0], trim();
                            }
                        }
                    } catch (error) { }

                    // try {
                    //     if (history_elem[i].querySelectorAll('.topHead')[1]) {
                    //         let value = history_elem[i].querySelectorAll('.topHead')[1].innerHTML;
                    //         value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                    //         tempEduHistory.type = value;
                    //         tempEduHistory.education = value;
                    //     }
                    // } catch (error) { }

                    try {
                        if (history_elem[i].querySelector('.durationColumn')) {
                            let value = history_elem[i].querySelector('.durationColumn').innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.institution = value;

                        }
                    } catch (error) { }

                    try {
                        if (history_elem[i].querySelector('.nameColumn')) {
                            let value = history_elem[i].querySelector('.nameColumn').innerHTML;
                            value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                            tempEduHistory.passing_year = value;

                            // tempEduHistory.duration.to = duration.split('to')[1]
                        }
                    } catch (error) { }

                    details.education.push(tempEduHistory)
                }
            }
        }
    } catch (error) {
        console.log(error, "moNSTER Education")
    }

    //Personal details

    try {
        if (document.querySelectorAll("#expandingInformationSectionsContainer .section-item")) {
            let elem = document.querySelectorAll("#expandingInformationSectionsContainer .section-item");
            for (let i = 0; i < elem.length; i++) {
                try {
                    if (keyMap[shared_ctrl.removeExtraChars(elem[i].querySelector('.information-name').innerHTML).trim()]) {
                        details[keyMap[shared_ctrl.removeExtraChars(elem[i].querySelector('.information-name').innerHTML).trim()]] = shared_ctrl.removeExtraChars(elem[i].querySelector('.information-value').innerHTML).trim()
                    }
                } catch (error) {

                }
            }
        }
    } catch (error) { }
    //Pref Locations
    try {
        if (document.querySelectorAll("#expandingInformationSectionsContainer .additional-tabled-information .subTableWrap")) {
            let elem = document.querySelectorAll("#expandingInformationSectionsContainer .additional-tabled-information .subTableWrap");
            details.pref_locations = [];
            for (let i = 0; i < elem.length; i++) {
                try {
                    // if (keyMap[shared_ctrl.removeExtraChars(elem[i].querySelector('.information-name').innerHTML).trim()]) {
                    details.pref_locations.push(shared_ctrl.removeExtraChars(elem[i].querySelector('.information-value').innerHTML).trim())
                    // }
                } catch (error) {

                }
            }
        }
    } catch (error) { }

    //Email
    try {
        details.email_id = shared_ctrl.removeExtraChars((resume_doc.querySelector('#contact-legend-detail').innerHTML));
    }
    catch (err) {
        console.log("Monster save email_id", err)
    }

    //Phone
    try {
        let val = shared_ctrl.removeExtraChars((resume_doc.querySelectorAll('#candidate-contact .has-candidate-contact-block')[0].innerHTML));
        if (val.split('Phone:')[1].trim() != '-') {
            details.alt_mobile_number = val.split('Phone:')[1].trim()
        }
    }
    catch (err) {
        console.log("Monster save phone", err)
    }
    //Home
    try {
        let val = shared_ctrl.removeExtraChars((resume_doc.querySelectorAll('#candidate-contact .has-candidate-contact-block')[1].innerHTML));
        if (val.split('Home:')[1].trim() != '-') {
            details.mobile_number = val.split('Home:')[1].trim()
        }
    }
    catch (err) {
        console.log("Monster save phone", err)
    }


    return details;

}


var keyMap = {
    "Relevant Work Experience": "experience",
    "Most Recent Employer:": "current_employer",
    "Current Location:": "location",
    "Highest Education:": "highest_degree",
}
module.exports = monsterUSImporter;