const jsdom = require("jsdom");

var shared_ctrl = require('./shared-ctrl')
var fs = require('fs');

ziprecruiterImporter = {};



ziprecruiterImporter.checkApplicantExistsFromZipRecruiter = function (req, res, next) {
    let response = new shared_ctrl.response();
    let details = new shared_ctrl.portalimporterDetails();
    const { JSDOM } = jsdom;
    details.portal_id = 19;
    let request = req.body;
    let selected_candidates = req.body.selected_candidates;
    let applicants = [];
    var is_select_all = req.body.is_select_all;
    let document = new JSDOM(request.xml_string).window.document;
    try {
        try {
            if (is_select_all == 1) {
                try {
                    if (document.querySelectorAll('ul#candidateList .candidate_card') && document.querySelectorAll('ul#candidateList .candidate_card').length) {
                        for (var i = 0; i < document.querySelectorAll('ul#candidateList .candidate_card').length; i++) {
                            var element = document.querySelectorAll('ul#candidateList .candidate_card')[i];
                            var applicant;
                            applicant = ZipRecruiterDuplicateParsingRecruiter(element, selected_candidates[i], details.portal_id);
                            applicants.push(applicant);
                        }
                    }
                } catch (ex) {
                    console.log(ex, "check Duplicate parsing ZipRecruiter");
                }
            }
            else {
                try {
                    if (document.querySelectorAll('ul#candidateList .candidate_card') && document.querySelectorAll('ul#candidateList .candidate_card').length) {
                        for (var i = 0; i < selected_candidates.length; i++) {
                            var element = document.querySelectorAll('ul#candidateList .candidate_card')[selected_candidates[i]];
                            var applicant;
                            applicant = ZipRecruiterDuplicateParsingRecruiter(element, selected_candidates[i], details.portal_id);
                            applicants.push(applicant);
                        }
                    }
                } catch (ex) {
                    console.log(ex, "check Duplicate parsing ZipRecruiter");
                }
            }
        } catch (err) {
            console.log(err, "Check Duplicate parsing ZipRecruiter")
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
}

var ZipRecruiterDuplicateParsingRecruiter = (document, index, portalId) => {
    let details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 19;

    if (document) {
        //name 
        try {
            if (document.querySelector("div.candidate_info h3.header a")) {
                let name = document.querySelector("div.candidate_info h3.header a").innerHTML;
                name = shared_ctrl.removeExtraChars(name);
                name = name.trim()
                details.full_name = name.split(',')[0];
                try {
                    details.first_name = name.split(',')[0].split(' ')[0]
                } catch (ex) {

                }
                try {
                    details.last_name = name.split(',')[0].split(' ').pop()
                } catch (ex) {

                }
            }
        }
        catch (ex) { }
        //email
        // try {
        //     if (document.querySelector('.contact-row .contact-row__method a')) {
        //         let email = document.querySelector('.contact-row .contact-row__method a').innerHTML;
        //         email = shared_ctrl.removeExtraChars(email);
        //         details.emailId = email.trim()
        //     }
        // }
        // catch (ex) { }

        //education
        try {
            if (document.querySelector(".experienceList li.education")) {
                let edu = document.querySelector(".experienceList li.education").innerHTML;
                edu = shared_ctrl.removeExtraChars(edu);
                edu = phone_number.trim();
                details.education = edu;
            }
        }
        catch (err) {
        }

        //uid
        try {
            if (document.querySelector("div.candidate_info h3.header a")) {
                let uid = document.querySelector("div.candidate_info h3.header a").getAttribute('data-contact_id');
                details.uid = uid;
            }
        }
        catch (ex) { }

    }
    details.index = index;
    return details;
}

ziprecruiterImporter.saveApplicantForZipRecruiter = function (req, res, next) {
    let response = new shared_ctrl.response();
    let details = new shared_ctrl.portalimporterDetails();

    const { JSDOM } = jsdom;
    details.portal_id = 19;
    let request = req.body;
    let selected_candidates = req.body.selected_candidates;
    let applicants = [];
    let document = new JSDOM(request.xml_string).window.document;

    try {
        if (document) {
            //name
            try {
                if (document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .name') && document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .name').innerHTML) {
                    let name = document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .name').innerHTML;
                    name = shared_ctrl.removeExtraChars(name);
                    name = name.trim()
                    details.full_name = name.split(',')[0];
                    try {
                        details.first_name = name.split(',')[0].split(' ')[0]
                    } catch (ex) {

                    }
                    try {
                        details.last_name = name.split(',')[0].split(' ').pop()
                    } catch (ex) {

                    }
                }
            } catch (ex) {
            }

            //designaion
            try {
                if (document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .headline') && document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .headline').innerHTML) {
                    let value = document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .headline').innerHTML;
                    value = shared_ctrl.removeExtraChars(value);
                    value = value.trim()
                    details.designation = value;
                }
            } catch (ex) {
            }



            //location

            try {
                if (document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .location') && document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .location').innerHTML) {
                    let value = document.querySelector('#profileContent.tab-content .ats_profile .side_content.ats_content .about_me .section_content .location').innerHTML;
                    value = shared_ctrl.removeExtraChars(value);
                    value = value.trim();
                    details.location = value;
                }
            }
            catch (ex) { }

            //email
            try {
                if (document.querySelectorAll('#profileContent.tab-content .ats_profile .side_content.ats_content .summary .section_content dd.email_address a')) {
                    let value_arr = document.querySelectorAll('#profileContent.tab-content .ats_profile .side_content.ats_content .summary .section_content dd.email_address a');
                    if (value_arr[0]) {
                        let primary_email_id = value_arr[0].innerHTML;
                        primary_email_id = shared_ctrl.removeExtraChars(primary_email_id);
                        primary_email_id = primary_email_id.trim();
                        details.email_id = primary_email_id;
                    }
                }
                else if (document.querySelectorAll('.dropdown-menu .email_link_wrap a.textEmail') && document.querySelectorAll('.dropdown-menu .email_link_wrap a.textEmail').length) {
                    let value_arr = document.querySelectorAll('.dropdown-menu .email_link_wrap a.textEmail');
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
            } catch (ex) {

            }

            //mobile number
            try {
                if (document.querySelectorAll('#profileContent.tab-content .ats_profile .side_content.ats_content .summary .section_content dd.phone_number')) {
                    let value_arr = document.querySelectorAll('#profileContent.tab-content .ats_profile .side_content.ats_content .summary .section_content dd.phone_number');
                    if (value_arr[0]) {
                        let primary_phone = value_arr[0].innerHTML;
                        primary_phone = shared_ctrl.removeExtraChars(primary_phone);
                        primary_phone = primary_phone.trim();
                        details.mobile_number = primary_phone;
                    }
                }
                else if (document.querySelectorAll('.dropdown-menu .phone_wrap a.textPhone') && document.querySelectorAll('.dropdown-menu .phone_wrap a.textPhone').length) {
                    let value_arr = document.querySelectorAll('.dropdown-menu .phone_wrap a.textPhone');
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
            } catch (ex) {

            }
            //experience 

            //work_history
            try {
                if (document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .experience .section_content ol li') && document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .experience .section_content ol li').length) {
                    details.work_history = [];
                    let work_history = document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .experience .section_content ol li');
                    for (let i = 0; i < work_history.length; i++) {
                        let tempEmpHistory = {
                            company_name: '',
                            designation: '',
                            duration: {
                                from: '',
                                to: ''
                            },

                        };
                        let history = work_history[i];
                        try {
                            if (history.querySelector('.headline') && history.querySelector('.headline').innerHTML) {
                                let value = history.querySelector('.headline').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEmpHistory.designation = value;
                            }
                        } catch (ex) { }
                        try {
                            if (history.querySelector('.subheadlines .subhead') && history.querySelector('.subheadlines .subhead').innerHTML) {
                                let value = history.querySelector('.subheadlines .subhead').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEmpHistory.company_name = value;
                            }
                        } catch (ex) {

                        }
                        try {
                            if (history.querySelector('.subheadlines .dates')) {
                                let value = history.querySelectorAll('.subheadlines .dates time');
                                if (value && value.length) {
                                    tempEmpHistory.duration.from = value[0] ? value[0].getAttribute('datetime') : '';
                                    tempEmpHistory.duration.to = value[1] ? value[1].getAttribute('datetime') : '';
                                }
                                else {
                                    let value = history.querySelector('.subheadlines .dates').innerHTML;
                                    value = shared_ctrl.removeExtraChars(value);
                                    value = value.trim();
                                    try {
                                        tempEmpHistory.duration.from = value.split('-')[0];
                                        tempEmpHistory.duration.to = value.split('-')[1];
                                    } catch (ex) {

                                    }
                                }



                                // tempEmpHistory.company_name = value;
                            }
                        } catch (ex) {

                        }
                        details.work_history.push(tempEmpHistory)

                    }
                }
            } catch (ex) { }

            //education
            try {
                if (document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .education .section_content ol li') && document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .education .section_content ol li').length) {
                    details.education = [];
                    let education = document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .education .section_content ol li');
                    for (let i = 0; i < education.length; i++) {
                        let tempEduHistory = {
                            institution: '',
                            type: '',
                            duration: {
                                from: '',
                                to: ''
                            },

                        };
                        let edu = education[i];
                        try {
                            if (edu.querySelector('h4.headline') && edu.querySelector('h4.headline').innerHTML) {
                                let value = edu.querySelector('h4.headline').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEduHistory.institution = value;
                            }
                        } catch (ex) { }
                        try {
                            if (edu.querySelector('.subheadlines .subhead') && edu.querySelector('.subheadlines .subhead').innerHTML) {
                                let value = edu.querySelector('.subheadlines .subhead').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEduHistory.type = value;
                            }
                        } catch (ex) {

                        }
                        try {
                            if (edu.querySelector('.subheadlines .dates')) {
                                let value = edu.querySelectorAll('.subheadlines .dates time');
                                if (value && value.length) {
                                    tempEduHistory.duration.from = value[0] ? value[0].getAttribute('datetime') : '';
                                    tempEduHistory.duration.to = value[1] ? value[1].getAttribute('datetime') : '';
                                }
                                else {
                                    let value = edu.querySelector('.subheadlines .dates').innerHTML;
                                    value = shared_ctrl.removeExtraChars(value);
                                    value = value.trim();
                                    try {
                                        tempEduHistory.duration.from = value.split('-')[0];
                                        tempEduHistory.duration.to = value.split('-')[1];
                                    } catch (ex) {

                                    }
                                }



                                // tempEmpHistory.company_name = value;
                            }
                        } catch (ex) {

                        }
                        details.education.push(tempEduHistory)

                    }
                }
            } catch (ex) { }

            //primarySkills
            try {
                if (document.querySelector('#profileContent.tab-content .ats_profile .main_content.ats_content .skills')) {
                    let skillsElem = document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .skills ul li.skill_tag');
                    details.primary_skills = [];
                    if (skillsElem && skillsElem.length) {
                        for (let i = 0; i < skillsElem.length; i++) {
                            let skillElem = skillsElem[i];
                            if (skillElem.innerHTML) {
                                value = skillElem.innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                details.primary_skills.push(value);
                            }

                        }
                    }
                }
            } catch (ex) {

            }

            //licences andcertifications

            try {

                if (document.querySelectorAll('.licenses_certifications .section_content ol li') && document.querySelectorAll('.licenses_certifications .section_content ol li').length) {
                    let cert_elements = document.querySelectorAll('.licenses_certifications .section_content ol li');
                    details.certifications = []
                    for (let i = 0; i < cert_elements.length; i++) {
                        let cert_element = cert_elements[i];
                        let tempCert = {
                            name: '',
                            company_name: '',
                            issue_date: '',
                            expiry_date: '',
                        };
                        if (cert_element.querySelector('.headline') && cert_element.querySelector('.headline').innerHTML) {
                            let value = cert_element.querySelector('.headline').innerHTML;
                            value = shared_ctrl.removeExtraChars(value);
                            value = value.trim();
                            tempCert.name = value;
                        }
                    }

                }
            } catch (error) {

            }
            //profile link
            // if (window.location.href) {
            //     details.profileLink = window.location.href;
            // }
        }


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
}




module.exports = ziprecruiterImporter;