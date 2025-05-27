const jsdom = require("jsdom");
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var shared_ctrl = require('./shared-ctrl')
var fs = require('fs');
const axios = require('axios');

linkedInImporter = {};

linkedInImporter.checkApplicantExistsFromLinkedInRecruiter = function (req, res, next) {
    // var decryptBuf = encryption.decrypt1((req.body.data), shared_ctrl.secretKey);
    // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
    // req.body = JSON.parse(resultDecrypt.toString('utf-8'));
    let response = new shared_ctrl.response();
    const { JSDOM } = jsdom;
    let request = req.body;
    let selected_candidates = req.body.selected_candidates;
    let applicants = [];
    var is_select_all = req.body.is_select_all;
    let document = new JSDOM(request.xml_string).window.document;
    try {
        try {
            if (is_select_all == 1) {
                try {
                    if (document.querySelectorAll("ol.profile-list li.profile-list__border-bottom") && document.querySelectorAll("ol.profile-list li.profile-list__border-bottom").length)
                        for (let i = 0; i < document.querySelectorAll("ol.profile-list li.profile-list__border-bottom").length; i++) {
                            let element = document.querySelectorAll("ol.profile-list li.profile-list__border-bottom")[i];
                            let applicant;
                            applicant = linkedinDuplicateParsingRecruiter(element, i, 8);

                            applicants.push(applicant);
                        }
                }
                catch (ex) {
                    console.log(ex, "check if part Duplicate parsing LinkedIn recruiter");
                }
            }
            else {
                try {
                    if (document.querySelectorAll("ol.profile-list li.profile-list__border-bottom") && document.querySelectorAll("ol.profile-list li.profile-list__border-bottom").length)
                        for (var i = 0; i < selected_candidates.length; i++) {
                            var element = document.querySelectorAll("ol.profile-list li.profile-list__border-bottom")[selected_candidates[i]];
                            var applicant;
                            applicant = linkedinDuplicateParsingRecruiter(element, selected_candidates[i], 8);
                            applicants.push(applicant);
                        }
                } catch (ex) {
                    console.log(ex, "check else part Duplicate parsing LinkedIn recruiter");
                }
            }
        } catch (err) {
            console.log(err, "Check Duplicate parsing LinkedIn recruiter")
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

    // })
}

// linkedInImporter.checkApplicantsLinkedIn = function (req, res, next) {
//     let response = new shared_ctrl.response();
//     const { JSDOM } = jsdom;
//     let list = req.body.list;
//     let user_details = req.body.session;
//     let portal_details = req.body.selectedPortal;
//     let requirementList = req.body.requirements || [];
//     console.log(list, "list")
//     let details = {
//         applicants: list,
//         overwriteResumeWithDoc: portal_details.overwriteResumeWithDoc || 0,
//         overwriteResumeOnlyDoc: portal_details.overwriteResumeOnlyDoc || 0,
//         requirements: requirementList
//     }
//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: portal_details.duplicateCheckApiUrl,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': "Bearer " + user_details?.token
//         },
//         data: details
//     };
//     console.log(config);
//     // res.status(200).json({ data: [] });
//     axios.request(config).then((response) => {
//         console.log('axios response' + JSON.stringify(response.data));
//         res.status(200).json({ data: response.data });
//     }).catch((error) => {
//         console.log(error);
//         res.status(500).json(error)
//     });

// };





linkedInImporter.checkApplicantsLinkedIn = function (req, res, next) {
    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var document = new JSDOM(xml_string).window.document;
    var tempResume = {};
    var applicants = [];
    var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;
    var search_results = document.querySelectorAll("li.hiring-applicants__list-item")
    let user_details = req.body.session;
    let portal_details = req.body.selectedPortal;
    let requirementList = req.body.requirements || [];

    if (search_results)
        for (var i = 0; i < search_results.length; i++) {
            console.log(i);
            if (search_results[i]) {

                //name

                try {
                    var tempname = search_results[i].getElementsByClassName("hiring-people-card__title");
                    if (tempname && tempname[0] && tempname[0].innerHTML && tempname[0].innerHTML.trim()) {
                        var name = tempname[0].innerHTML.trim();
                        var first_name = "";
                        var last_name = "";

                        if (name && name.split(' ')) {
                            if (name.split(' ')[0])
                                first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
                            if (name.split(' ')[1]) {
                                last_name = name.split(' ').splice(1).join(' ');
                                last_name = shared_ctrl.removeExtraChars(last_name.trim());
                            }
                        }
                    }
                } catch (ex) {
                    console.log("first_name last_name", ex);
                }

                // job-title

                try {
                    if (document.getElementsByClassName('hiring-applicants__list-item') && document.getElementsByClassName('hiring-applicants__list-item')[i]) {

                        var tempJobTitle = shared_ctrl.removeExtraChars(document.querySelectorAll("li.hiring-applicants__list-item")[i].querySelectorAll(".artdeco-entity-lockup__metadata")[0].innerHTML.trim().replace(removeTagsRegex, ''));
                        tempResume.job_title = tempJobTitle;
                    }
                } catch (ex) {
                    console.log("linkedin job title", ex);
                }


                // location

                try {
                    if (document.getElementsByClassName('hiring-applicants__list-item') && document.getElementsByClassName('hiring-applicants__list-item')[i]) {

                        var tempLocation = shared_ctrl.removeExtraChars(document.querySelectorAll("li.hiring-applicants__list-item")[i].querySelectorAll(".artdeco-entity-lockup__metadata")[1].innerHTML.trim().replace(removeTagsRegex, ''));
                        tempResume.current_location = tempLocation;
                    }
                } catch (ex) {
                    console.log("linkedin job title", ex);
                }

                // Employement History

                tempResume.employment = [];
                try {
                    if (document && search_results) {
                        var tempEmployementHis = document.querySelectorAll("li.hiring-applicants__list-item")[i].querySelectorAll(".lt-line-clamp__line.lt-line-clamp__line--last");
                    
                        if (tempEmployementHis && tempEmployementHis.length > 0) {
                            try {
                                var tempEmpHis1 = {
                                    employer: shared_ctrl.removeExtraChars(tempEmployementHis[0].innerHTML.replace(removeTagsRegex, '').trim())
                                };
                                tempResume.employment.push(tempEmpHis1);
                            } catch (ex) {
                                console.log("linkedin save employment History-employer 1", ex);
                            }
                        }
                    
                        if (tempEmployementHis && tempEmployementHis.length > 1) {
                            try {
                                var tempEmpHis2 = {
                                    employer: shared_ctrl.removeExtraChars(tempEmployementHis[1].innerHTML.replace(removeTagsRegex, '').trim())
                                };
                                tempResume.employment.push(tempEmpHis2);
                            } catch (ex) {
                                console.log("linkedin save employment History-employer 2", ex);
                            }
                        }
                    
                        console.log(tempResume.employment);
                    }
                    
                } catch (ex) {
                    console.log('linkedin save work_history', ex);
                }
                applicants.push({
                    full_name: name,
                    address: tempResume.current_location,
                    current_employer: "",
                    first_name: first_name,
                    last_name: last_name,
                    gender: "",
                    portal_id: 8,
                    last_modified_date: "",
                    job_title: tempResume.job_title,
                    previous_employer: "",
                    location: tempResume.current_location,
                    education: [],
                    industry: [],
                    salary: "",
                    primary_skills: [],
                    uid: "",
                    index: i,
                    skills: [],
                    languages: [],
                    projects: [],
                    experience: "",
                    certificates: [],
                    courses: [],
                    summary: "",
                    workHistory: tempResume.employment,
                });
                console.log('applicants1', applicants);
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

};





var linkedinDuplicateParsingRecruiter = (document, index, portalId) => {
    let details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 8;
    if (document) {
        //name 
        try {
            if (document.querySelector('.artdeco-entity-lockup__content .lockup__content-title .artdeco-entity-lockup__title a')) {
                let name = document.querySelector('.artdeco-entity-lockup__content .lockup__content-title .artdeco-entity-lockup__title a').innerHTML;
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
        }
        catch (error) { }
        //email
        try {
            if (document.querySelector('.contact-row .contact-row__method a')) {
                let email = document.querySelector('.contact-row .contact-row__method a').innerHTML;
                email = shared_ctrl.removeExtraChars(email);
                details.email_id = email.trim()
            }
        }
        catch (error) { }

        //phone number
        try {
            if (document.querySelector('.contact-row .contact-row__method a')) {
                let phone_number = document.querySelector('.contact-row .contact-row__method span').innerHTML;
                phone_number = shared_ctrl.removeExtraChars(phone_number);
                phone_number = phone_number.trim();
                details.mobile_number = phone_number;
            }
        }
        catch (err) {
        }
    }
    details.index = index;
    return details;

}

linkedInImporter.savePortalApplicantsLinkedInRecruiter = function (req, res, next) {
    // var decryptBuf = encryption.decrypt1((req.body.data), shared_ctrl.secretKey);
    // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
    // req.body = JSON.parse(resultDecrypt.toString('utf-8'));
    let response = new shared_ctrl.response();
    let details = new shared_ctrl.portalimporterDetails();
    const { JSDOM } = jsdom;
    details.portal_id = 8;
    let request = req.body;
    let selected_candidates = req.body.selected_candidates;
    let applicants = [];
    let exception_query_selector = {}
    let document = new JSDOM(request.xml_string).window.document;

    try {
        if (document) {
            //name
            try {
                if (document.querySelector('div[data-test-topcard-condensed-lockup] .lockup .artdeco-entity-lockup .artdeco-entity-lockup__content.lockup__content .lockup__content-title span[data-live-test-row-lockup-full-name] .artdeco-entity-lockup__title') && document.querySelector('div[data-test-topcard-condensed-lockup] .lockup .artdeco-entity-lockup .artdeco-entity-lockup__content.lockup__content .lockup__content-title span[data-live-test-row-lockup-full-name] .artdeco-entity-lockup__title').innerHTML) {
                    let name = document.querySelector('div[data-test-topcard-condensed-lockup] .lockup .artdeco-entity-lockup .artdeco-entity-lockup__content.lockup__content .lockup__content-title span[data-live-test-row-lockup-full-name] .artdeco-entity-lockup__title').innerHTML;
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
                else {
                    exception_query_selector.name = 'div[data-test-topcard-condensed-lockup] .lockup .artdeco-entity-lockup .artdeco-entity-lockup__content.lockup__content .lockup__content-title span[data-live-test-row-lockup-full-name] .artdeco-entity-lockup__title'
                }
            }
            catch (error) {
                exception_query_selector.name = 'div[data-test-topcard-condensed-lockup] .lockup .artdeco-entity-lockup .artdeco-entity-lockup__content.lockup__content .lockup__content-title span[data-live-test-row-lockup-full-name] .artdeco-entity-lockup__title'
            }

            //location
            try {
                if (document.querySelector('div[data-test-topcard-condensed-lockup] div[data-live-test-row-lockup-location]') && document.querySelector('div[data-test-topcard-condensed-lockup] div[data-live-test-row-lockup-location]').innerHTML) {
                    let value = document.querySelector('div[data-test-topcard-condensed-lockup] div[data-live-test-row-lockup-location]').innerHTML;
                    value = shared_ctrl.removeExtraChars(value);
                    value = value.trim();
                    details.location = value;
                }
            }
            catch (ex) { }

            //email
            try {
                if (document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-email-address]') && document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-email-address]').length) {
                    let value_arr = document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-email-address]');
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
                if (document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-phone]') && document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-phone]').length) {
                    let value_arr = document.querySelectorAll('div[data-test-topcard-condensed-lockup] span[data-test-contact-phone]');
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
            try {
                if (document.querySelectorAll('.background-section.experience-card ul li') && document.querySelectorAll('.background-section.experience-card ul li').length) {
                    details.work_history = [];
                    let work_history = document.querySelectorAll('.background-section.experience-card ul li');
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
                            if (history.querySelector('h3[data-test-position-entity-title] a') && history.querySelector('h3[data-test-position-entity-title] a').innerHTML) {
                                let value = history.querySelector('h3[data-test-position-entity-title] a').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEmpHistory.designation = value;
                            }
                        } catch (error) { }
                        try {
                            if (history.querySelector('dd[data-test-position-entity-company-name] a') && history.querySelector('dd[data-test-position-entity-company-name] a').innerHTML) {
                                let value = history.querySelector('dd[data-test-position-entity-company-name] a').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempEmpHistory.company_name = value;
                            }
                        } catch (error) {

                        }
                        try {
                            // if (history.querySelector('dd span[data-test-position-entity-date-range]') && history.querySelector('dd span[data-test-position-entity-date-range]').innerHTML) {
                            //     let value = history.querySelector('dd span[data-test-position-entity-date-range]').innerHTML;
                            //     value = shared_ctrl.removeExtraChars(value);
                            //     value = value.trim();

                            //     try {
                            //         tempEmpHistory.duration.from = value.split('  ')[0];
                            //         tempEmpHistory.duration.to = value.split(' ')[1];
                            //     } catch (error) {

                            //     }
                            //     // tempEmpHistory.company_name = value;
                            // }
                        } catch (error) {

                        }
                        details.work_history.push(tempEmpHistory)

                    }
                }
            } catch (error) {

            }

            //education
            try {
                if (document.querySelectorAll('.background-section.education-card ul li') && document.querySelectorAll('.background-section.education-card ul li').length) {
                    details.education = [];
                    let education = document.querySelectorAll('.background-section.education-card ul li');
                    for (let i = 0; i < education.length; i++) {
                        let tempEduHistory = {
                            education: '',
                            institution: '',
                            type: '',
                            passing_year: '',
                            specialization: "",
                            university: "",
                            education_group: "",
                            duration: {
                                from: '',
                                to: ''
                            },

                        };
                        //institution
                        let edu = education[i];
                        try {
                            if (edu.querySelector('h3[data-test-education-entity-school-name]') && edu.querySelector('h3[data-test-education-entity-school-name]').innerHTML) {
                                let value = edu.querySelector('h3[data-test-education-entity-school-name]').innerHTML;
                                value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
                                value = value.trim();
                                tempEduHistory.institution = value;
                            }
                        } catch (error) { }

                        try {
                            if (edu.querySelector('span[data-test-education-entity-degree-name]') && edu.querySelector('span[data-test-education-entity-degree-name]').innerHTML) {
                                let value = edu.querySelector('span[data-test-education-entity-degree-name]').innerHTML;
                                value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
                                value = value.trim();
                                tempEduHistory.type = value;
                                tempEduHistory.specialization = value;
                            }
                        } catch (error) {

                        }
                        try {
                            if (edu.querySelector('dd[data-test-education-entity-dates]') && edu.querySelector('dd[data-test-education-entity-dates]').innerHTML) {
                                let value = edu.querySelector('dd[data-test-education-entity-dates]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();

                                try {
                                    tempEduHistory.duration.from = shared_ctrl.dateFormat(value.split('  ')[0]);
                                    tempEduHistory.duration.to = shared_ctrl.dateFormat(value.split('  ')[1]);
                                } catch (error) {

                                }
                                // tempEmpHistory.company_name = value;
                            }
                        } catch (error) {
                        }
                        //passing year
                        try {
                            tempEduHistory.passing_year = tempEduHistory.duration.to;
                        } catch (error) {

                        }
                        details.education.push(tempEduHistory)

                    }
                }
            } catch (error) {

            }

            //primarySkills
            // try {
            //     if (document.querySelector('.skills-card')) {
            //         let skillsElem = document.querySelectorAll('.skills-card ul li');
            //         details.primary_skills = [];
            //         if (skillsElem && skillsElem.length) {
            //             for (let i = 0; i < skillsElem.length; i++) {
            //                 let skillElem = skillsElem[i];
            //                 if (skillElem.querySelector('dt[data-test-skill-entity-skill-name]')) {
            //                     value = skillElem.querySelector('dt[data-test-skill-entity-skill-name]').innerHTML
            //                     value = shared_ctrl.removeExtraChars(value);
            //                     value = value.trim();
            //                     details.primary_skills.push(value);
            //                 }

            //             }
            //         }
            //     }
            // } catch (error) {

            // }
            //projects
            try {
                if (document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.project-entity') && document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.project-entity').length) {
                    details.projects = [];
                    let projects = document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.project-entity');
                    for (let i = 0; i < projects.length; i++) {
                        let tempProject = {
                            name: '',
                            description: '',
                            duration: {
                                from: '',
                                to: ''
                            },

                        };
                        let project = projects[i];
                        try {
                            if (project.querySelector('h3[data-test-accomplishments-base-entity-title]') && project.querySelector('h3[data-test-accomplishments-base-entity-title]').innerHTML) {
                                let value = project.querySelector('h3[data-test-accomplishments-base-entity-title]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempProject.name = value;
                            }
                        } catch (error) { }
                        try {
                            if (project.querySelector('p[data-test-accomplishments-base-entity-description]') && project.querySelector('p[data-test-accomplishments-base-entity-description]').innerHTML) {
                                let value = project.querySelector('p[data-test-accomplishments-base-entity-description]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempProject.description = value;
                            }
                        } catch (error) {

                        }
                        try {
                            if (project.querySelector('div.accomplishments-base-entity__date') && project.querySelector('div.accomplishments-base-entity__date').innerText) {
                                let value = project.querySelector('div.accomplishments-base-entity__date]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();

                                try {
                                    tempProject.duration.from = shared_ctrl.dateFormat(value.split('  ')[0]);
                                    tempProject.duration.to = shared_ctrl.dateFormat(value.split('  ')[1]);
                                } catch (error) {

                                }
                                // tempEmpHistory.company_name = value;
                            }
                        } catch (error) {

                        }
                        details.projects.push(tempProject)

                    }
                }
            } catch (error) {

            }

            //courses
            try {
                if (document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.course-entity') && document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.course-entity').length) {
                    details.courses = [];
                    let courses = document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.course-entity');
                    for (let i = 0; i < courses.length; i++) {
                        let course = courses[i];
                        try {
                            if (course.querySelector('span.course-entity__name') && course.querySelector('span.course-entity__name').innerHTML) {
                                let value = course.querySelector('span.course-entity__name').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                details.courses.push(value)
                            }
                        } catch (error) { }



                    }
                }
            } catch (error) { }

            //languages
            // try {
            //     if (document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.language-entity') && document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.language-entity').length) {
            //         details.languages = [];
            //         let languages = document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.language-entity');
            //         for (let i = 0; i < languages.length; i++) {
            //             let language = languages[i];
            //             try {
            //                 if (language.querySelector('div[data-test-language-name]') && language.querySelector('div[data-test-language-name]').innerHTML) {
            //                     let value = language.querySelector('div[data-test-language-name]').innerHTML;
            //                     value = shared_ctrl.removeExtraChars(value);
            //                     value = value.trim();
            //                     details.languages.push(value)
            //                 }
            //             } catch (error) { }




            //         }
            //     }
            // } catch (error) { }

            //certification
            try {
                if (document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.certification-entity') && document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.certification-entity').length) {
                    details.certifications = [];
                    let certifications = document.querySelectorAll('.accomplishments-expandable-list .accomplishments-expandable-list__list-container ul li.certification-entity');
                    for (let i = 0; i < certifications.length; i++) {
                        let tempCert = {
                            name: '',
                            company_name: '',
                            issue_date: '',
                            expiry_date: '',

                        };
                        let certification = certifications[i];
                        try {
                            if (certification.querySelector('h3[data-test-accomplishments-base-entity-title]') && certification.querySelector('h3[data-test-accomplishments-base-entity-title]').innerHTML) {
                                let value = certification.querySelector('h3[data-test-accomplishments-base-entity-title]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempCert.name = value;
                            }
                        } catch (error) { }
                        try {
                            if (certification.querySelector('div[data-test-accomplishments-base-entity-org-lockup] a h3') && certification.querySelector('div[data-test-accomplishments-base-entity-org-lockup] a h3').innerHTML) {
                                let value = certification.querySelector('div[data-test-accomplishments-base-entity-org-lockup] a h3').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();
                                tempCert.company_name = value;
                            }
                        } catch (error) { }
                        try {
                            if (certification.querySelector('div.accomplishments-base-entity__date') && certification.querySelector('div.accomplishments-base-entity__date').innerText) {
                                let value = certification.querySelector('div.accomplishments-base-entity__date]').innerHTML;
                                value = shared_ctrl.removeExtraChars(value);
                                value = value.trim();

                                try {
                                    tempCert.issue_date = value.split('  ')[0];
                                    tempCert.expiry_date = value.split('  ')[1] || '';
                                } catch (error) {

                                }
                                // tempEmpHistory.company_name = value;
                            }
                        } catch (error) { }
                        details.certifications.push(tempCert);

                    }
                }
            } catch (error) { }

            //profile link
            if (document.querySelectorAll('.personal-info.component-card .personal-info__content a span')) {
                details.profile_link = document.querySelectorAll('.personal-info.component-card .personal-info__content a').href;
            }
        }

        if (exception_query_selector && exception_query_selector.name) {
            shared_ctrl.sendMail('LinkedIn', exception_query_selector)
        }
        response.status = true;
        response.message = "XML Parsed";
        response.error = false;
        response.data = details;
        res.status(200).json(response);

    } catch (error) {
        console.log(ex);
        response.status = false;
        response.message = "something went wrong";
        response.error = ex;
        response.data = null;
        res.status(500).json(response);
    }
    // })
}





linkedInImporter.savePortalApplicantsLinkedIn = function (req, res, next) {
    var response = new shared_ctrl.response();
    var details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 8;
    var tallintToken = req.body.session['token'];
    let user_details = shared_ctrl.jsonDeepParse(req.body.user_details);
    let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
    // let portal_details = shared_ctrl.jsonDeepParse(req.body.portal_details);
    let selectedPortal = shared_ctrl.jsonDeepParse(req.body.selectedPortal);
    let save_url = req.body.save_url;
    if (selectedPortal.resumeSaveApiUrl) {
        save_url = selectedPortal.resumeSaveApiUrl;
        // console.log(save_url)
    }
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: save_url || shared_ctrl.save_api_url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + tallintToken
        },
        data: user_details
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




// linkedInImporter.savePortalApplicantsLinkedIn = function (req, res, next) {
//     // var decryptBuf = encryption.decrypt1((req.body.data), shared_ctrl.secretKey);
//     // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
//     // req.body = JSON.parse(resultDecrypt.toString('utf-8'));
//     var response = new shared_ctrl.response();
//     var details = new shared_ctrl.portalimporterDetails();
//     details.portal_id = 8;
//     // var validationFlag = true;
//     var portalId = 8; // linkedIn
//     var cvSourceId = 8; // linkedIn
//     const { JSDOM } = jsdom;
//     var xml_string = req.body.document;
//     var contact_string = req.body.contact;
//     var contact_object = req.body.contact_object;
//     var other_details = req.body.other_details;
//     var experience_str = req.body.experience_str;
//     var education_str = req.body.education_str;
//     var skills_str = req.body.skills_str;
//     var languages_str = req.body.languages_str;
//     var document = new JSDOM(xml_string).window.document;

//     var contact = new JSDOM(contact_string).window.document;
//     var applicants = [];
//     var exception = {};
//     var uniqueID
//     // console.log("linked in document", document)
//     // linkedIn Profile
//     try {
//         if (contact.querySelector('section.pv-contact-info__contact-type.ci-vanity-url .pv-contact-info__ci-container .pv-contact-info__contact-link') && contact.querySelector('section.pv-contact-info__contact-type.ci-vanity-url .pv-contact-info__ci-container .pv-contact-info__contact-link').innerHTML) {
//             details.profile_link = shared_ctrl.removeExtraChars(contact.querySelector('section.pv-contact-info__contact-type.ci-vanity-url .pv-contact-info__ci-container .pv-contact-info__contact-link').innerHTML).trim();
//             if (details.profileLink) {
//                 var tempArray = details.profile_link.split("/");
//                 if (tempArray && tempArray.length) {
//                     uniqueID = tempArray[tempArray.length - 1];
//                     details.uid = uniqueID;
//                 }
//             }
//         }
//     } catch (ex) {
//         console.log("profile", ex);
//         exception.linkedInProfile = ex;
//     }

//     try {
//         let name;
//         if (document.querySelector('.pv-text-details__left-panel .text-heading-xlarge') && document.querySelector('.pv-text-details__left-panel .text-heading-xlarge').innerHTML.trim()) {
//             name = (document.querySelector('.pv-text-details__left-panel .text-heading-xlarge').innerHTML).trim();
//             try {
//                 details.full_name = shared_ctrl.removeExtraChars(name);
//             } catch (error) {

//             }
//             if (name.split(' ')) {
//                 if (name.split(' ')[0])
//                     details.first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
//                 if (name.split(' ')[1]) {
//                     last_name = name.split(' ').splice(1).join(' ');
//                     details.last_name = shared_ctrl.removeExtraChars(last_name.trim());
//                 }
//             }
//         }
//     } catch (ex) {
//         console.log("name", ex);
//         exception.name = ex;

//     }


//     //skills
//     try {
//         if (document.querySelectorAll(".pv-skill-category-entity__name-text") && document.querySelectorAll(".pv-skill-category-entity__name-text").length) {
//             // window.scrollTo(0, (document.body.scrollHeight - 1000));
//             // document.getElementsByClassName('pv-profile-section__card-action-bar')[0].click()
//             var skilllength = document.querySelectorAll(".pv-skill-category-entity__name-text").length;
//             var skills = [];
//             details.primary_skills = [];
//             for (var i = 0; i < skilllength; i++) {
//                 if (document.querySelectorAll(".pv-skill-category-entity__name-text")[i])
//                     skills.push(shared_ctrl.removeExtraChars(document.querySelectorAll(".pv-skill-category-entity__name-text")[i].innerHTML.trim()));
//                 else
//                     skills.push(shared_ctrl.removeExtraChars(document.getElementsByClassName('pv-skill-category-entity')[i].innerHTML.trim()));
//             }
//             details.primary_skills = skills;
//         }
//     } catch (ex) {
//         console.log("primary skills", ex);
//         exception.primarySkills = ex;

//     }

//     //company name
//     try {
//         if (document.getElementsByClassName('pv-top-card--experience-list-item') && document.getElementsByClassName('pv-top-card--experience-list-item')[0] && document.getElementsByClassName('pv-top-card--experience-list-item')[0].getElementsByTagName('span') && document.getElementsByClassName('pv-top-card--experience-list-item')[0].getElementsByTagName('span').length && document.getElementsByClassName('pv-top-card--experience-list-item')[0].getElementsByTagName('span')[0].innerHTML) {

//             details.current_employer = shared_ctrl.removeExtraChars(document.getElementsByClassName('pv-top-card--experience-list-item')[0].getElementsByTagName('span')[0].innerHTML.trim());
//         }
//     } catch (ex) {
//         console.log("current employer", ex);
//         exception.current_employer = ex;

//     }

//     details.work_history = []
//     // try {
//     //     if (document.getElementsByClassName("pv-profile-section-pager ember-view") && document.getElementsByClassName("pv-profile-section-pager ember-view")[0] && document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view") && document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-no-more") && document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-no-more")[0] && document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-no-more")[0].getElementsByClassName("pv-entity__position-group-pager pv-profile-section__list-item ember-view") && document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-no-more")[0].getElementsByClassName("pv-entity__position-group-pager pv-profile-section__list-item ember-view").length) {

//     //         let tempEmpHis = document.getElementsByClassName("pv-profile-section-pager ember-view")[0].getElementsByClassName("pv-profile-section experience-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-no-more")[0].getElementsByClassName("pv-entity__position-group-pager pv-profile-section__list-item ember-view");

//     //         for (let i = 0; i < tempEmpHis.length; i++) {
//     //             if (tempEmpHis && tempEmpHis[i] && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view") && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0] && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0].getElementsByClassName("display-flex flex-column full-width") && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0].getElementsByClassName("display-flex flex-column full-width")[0] && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0].getElementsByClassName("display-flex flex-column full-width")[0].getElementsByClassName("pv-entity__summary-info pv-entity__summary-info--background-section") && tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0].getElementsByClassName("display-flex flex-column full-width")[0].getElementsByClassName("pv-entity__summary-info pv-entity__summary-info--background-section")[0]) {
//     //                 let tempEmpHistory = {};
//     //                 tempEmpHistory.salary = "";
//     //                 let tempEmpObj = tempEmpHis[i].getElementsByClassName("pv-profile-section__card-item-v2 pv-profile-section pv-position-entity ember-view")[0].getElementsByClassName("display-flex flex-column full-width")[0].getElementsByClassName("pv-entity__summary-info pv-entity__summary-info--background-section")[0];

//     //                 // -- company name--
//     //                 if (tempEmpObj && tempEmpObj.getElementsByClassName("pv-entity__secondary-title t-14 t-black t-normal") && tempEmpObj.getElementsByClassName("pv-entity__secondary-title t-14 t-black t-normal")[0] && tempEmpObj.getElementsByClassName("pv-entity__secondary-title t-14 t-black t-normal")[0].innerHTML) {
//     //                     let company_details = tempEmpObj.getElementsByClassName("pv-entity__secondary-title t-14 t-black t-normal")[0].innerHTML;
//     //                     try {
//     //                         tempEmpHistory.company_name = shared_ctrl.removeExtraChars(company_details.split('<span')[0]);
//     //                         if (company_details.indexOf('<span') > -1) {
//     //                             tempEmpHistory.job_type = shared_ctrl.removeExtraChars(company_details.substring(company_details.indexOf('<span')));

//     //                         }
//     //                     } catch (error) {
//     //                         tempEmpHistory.company_name = shared_ctrl.removeExtraChars(company_details);
//     //                     }
//     //                 }

//     //                 //  --designation--
//     //                 if (tempEmpObj && tempEmpObj.getElementsByClassName("t-16 t-black t-bold") && tempEmpObj.getElementsByClassName("t-16 t-black t-bold")[0] && tempEmpObj.getElementsByClassName("t-16 t-black t-bold")[0].innerHTML) {
//     //                     tempEmpHistory.designation = shared_ctrl.removeExtraChars(tempEmpObj.getElementsByClassName("t-16 t-black t-bold")[0].innerHTML.trim());
//     //                 }

//     //                 //  --duration--
//     //                 if (tempEmpObj && tempEmpObj.getElementsByClassName("pv-entity__date-range t-14 t-black--light t-normal") && tempEmpObj.getElementsByClassName("pv-entity__date-range t-14 t-black--light t-normal")[0] && tempEmpObj.getElementsByClassName("pv-entity__date-range t-14 t-black--light t-normal")[0].getElementsByTagName("span") && tempEmpObj.getElementsByClassName("pv-entity__date-range t-14 t-black--light t-normal")[0].getElementsByTagName("span")[1].innerHTML) {
//     //                     tempEmpHistory.duration = {};
//     //                     let tempDuration = shared_ctrl.removeExtraChars(tempEmpObj.getElementsByClassName("pv-entity__date-range t-14 t-black--light t-normal")[0].getElementsByTagName("span")[1].innerHTML.trim());
//     //                     if (tempDuration.split("  ")[0] && tempDuration.split("  ")[0].trim()) {
//     //                         tempEmpHistory.duration.from = shared_ctrl.removeExtraChars(tempDuration.split("  ")[0].trim());
//     //                     }
//     //                     if (tempDuration.split("  ")[0] && tempDuration.split("  ")[0].trim()) {
//     //                         tempEmpHistory.duration.to = shared_ctrl.removeExtraChars(tempDuration.split("  ")[1].trim());
//     //                     }
//     //                 }

//     //                 // -- location --
//     //                 tempEmpHistory.location = "";
//     //                 if (tempEmpObj && tempEmpObj.getElementsByClassName("pv-entity__location t-14 t-black--light t-normal block") && tempEmpObj.getElementsByClassName("pv-entity__location t-14 t-black--light t-normal block")[0] && tempEmpObj.getElementsByClassName("pv-entity__location t-14 t-black--light t-normal block")[0].getElementsByTagName("span") && tempEmpObj.getElementsByClassName("pv-entity__location t-14 t-black--light t-normal block")[0].getElementsByTagName("span")[1].innerHTML) {
//     //                     tempEmpHistory.location = shared_ctrl.removeExtraChars(tempEmpObj.getElementsByClassName("pv-entity__location t-14 t-black--light t-normal block")[0].getElementsByTagName("span")[1].innerHTML.trim());
//     //                 }
//     //                 console.log(tempEmpHistory)
//     //                 details.work_history.push(tempEmpHistory);
//     //             }
//     //         }

//     //     }

//     // } catch (ex) {
//     //     console.log(ex);
//     //     exception.work_history = ex
//     // }
//     details.education = parseEducationSelf(education_str, document);
//     details.work_history = parseEmploymentSelf(experience_str, document);
//     try {
//         details.experience = processExp(details.work_history)
//     } catch (error) {

//     }
//     details.languages = parseLanguageSelf(languages_str, document);
//     details.primary_skills = parseskillsSelf(skills_str, document)
//     // //education
//     // try {
//     //     if (document.querySelectorAll('#education-section ul li') && document.querySelectorAll('#education-section ul li').length) {
//     //         details.education = [];
//     //         let education = document.querySelectorAll('#education-section ul li');
//     //         for (let i = 0; i < education.length; i++) {
//     //             let tempEduHistory = {
//     //                 education: '',
//     //                 institution: '',
//     //                 type: '',
//     //                 passing_year: '',
//     //                 specialization: "",
//     //                 university: "",
//     //                 education_group: "",
//     //                 duration: {
//     //                     from: '',
//     //                     to: ''
//     //                 },

//     //             };
//     //             //institution
//     //             let edu = education[i];
//     //             try {
//     //                 if (edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name') && edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name').innerHTML) {
//     //                     let value = edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name').innerHTML;
//     //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
//     //                     value = value.trim();
//     //                     tempEduHistory.institution = value;
//     //                 }
//     //             } catch (error) { }

//     //             try {
//     //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item').innerHTML) {
//     //                     let value = edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item').innerHTML;
//     //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
//     //                     value = value.trim();
//     //                     tempEduHistory.type = value;
//     //                     tempEduHistory.education = value;
//     //                 }
//     //             } catch (error) {

//     //             }

//     //             try {
//     //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item').innerHTML) {
//     //                     let value = edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item').innerHTML;
//     //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
//     //                     value = value.trim();
//     //                     tempEduHistory.specialization = value;
//     //                 }
//     //             } catch (error) {

//     //             }
//     //             try {
//     //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__dates') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__dates').innerHTML) {
//     //                     let value = edu.querySelectorAll('a[data-control-name="background_details_school"] .pv-entity__dates time');
//     //                     // value = shared_ctrl.removeExtraChars(value);
//     //                     // value = value.trim();

//     //                     try {
//     //                         tempEduHistory.duration.from = shared_ctrl.removeExtraChars(value[0].innerHTML).trim();
//     //                         tempEduHistory.duration.to = shared_ctrl.removeExtraChars(value[1].innerHTML).trim();
//     //                     } catch (error) {

//     //                     }
//     //                     // tempEmpHistory.company_name = value;
//     //                 }
//     //             } catch (error) {
//     //             }
//     //             //passing year
//     //             try {
//     //                 tempEduHistory.passing_year = tempEduHistory.duration.to;
//     //             } catch (error) {

//     //             }
//     //             details.education.push(tempEduHistory)

//     //         }
//     //     }
//     // } catch (error) {

//     // }


//     //location
//     try {
//         if (document.querySelector("div.pb2 > span.text-body-small.inline.t-black--light.break-words") && document.querySelector("div.pb2 > span.text-body-small.inline.t-black--light.break-words").innerHTML) {

//             details.location = shared_ctrl.removeExtraChars(document.querySelector("div.pb2 > span.text-body-small.inline.t-black--light.break-words").innerHTML.trim());
//         }
//     } catch (ex) {
//         console.log("location", ex);
//         exception.location = ex;

//     }


//     //emailid
//     try {
//         try {
//             if (contact.querySelector('.pv-profile-section__section-info section.pv-contact-info__contact-type.ci-email > div > a.pv-contact-info__contact-link') && contact.querySelector('.pv-profile-section__section-info section.pv-contact-info__contact-type.ci-email > div > a.pv-contact-info__contact-link').innerHTML) {
//                 var emailId = shared_ctrl.removeExtraChars(contact.querySelector('.pv-profile-section__section-info section.pv-contact-info__contact-type.ci-email > div > a.pv-contact-info__contact-link').innerHTML.trim());
//                 details.email_id = emailId;
//                 // var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/; // include /s in the end
//                 // if (regularExp.exec(emailId)) {
//                 //     details.email_id = shared_ctrl.removeExtraChars(regularExp.exec(emailId).trim());
//                 // }
//             }
//             else if (contact.querySelector('.ci-email .pv-contact-info__ci-container a')) {
//                 let emailId = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(contact.querySelector('.ci-email .pv-contact-info__ci-container a').innerHTML.trim()));
//                 details.email_id = emailId;
//             }
//         }
//         catch (err) {
//             console.log(err)
//         }
//     } catch (ex) {
//         console.log("email", ex);
//         exception.email = ex;
//     }

//     //phone number
//     try {
//         try {
//             if (contact.querySelector('.ci-phone .pv-contact-info__ci-container .t-black') && contact.querySelector('.ci-phone .pv-contact-info__ci-container .t-black').innerHTML) {
//                 var phone_number = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(contact.querySelector('.ci-phone .pv-contact-info__ci-container .t-black').innerHTML)).trim();
//                 details.mobile_number = phone_number;
//             }
//         }
//         catch (err) {

//         }

//     } catch (ex) {
//         console.log("email", ex);
//         exception.email = ex;
//     }

//     //DOB
//     try {
//         try {
//             if (contact.querySelector('.ci-birthday .pv-contact-info__ci-container .t-black') && contact.querySelector('.ci-birthday .pv-contact-info__ci-container .t-black').innerHTML) {
//                 var dob = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(contact.querySelector('.ci-birthday .pv-contact-info__ci-container .t-black').innerHTML)).trim();
//                 details.DOB = shared_ctrl.dateFormat(dob);
//             }
//         }
//         catch (err) {

//         }

//     } catch (ex) {
//         console.log("dob", ex);
//         exception.email = ex;
//     }

//     //address
//     try {
//         try {
//             if (contact.querySelector('.ci-address .pv-contact-info__ci-container a') && contact.querySelector('.ci-address .pv-contact-info__ci-container a').innerHTML) {
//                 var address = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(contact.querySelector('.ci-address .pv-contact-info__ci-container a').innerHTML)).trim();
//                 details.address = address;
//             }
//         }
//         catch (err) {

//         }

//     } catch (ex) {
//         console.log("dob", ex);
//         exception.email = ex;
//     }



//     //summary 
//     try {
//         if (document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view') && document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view')[0] && document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view')[0].getElementsByClassName('lt-line-clamp__raw-line') && document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view')[0].getElementsByClassName('lt-line-clamp__raw-line')[0] && document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view')[0].getElementsByClassName('lt-line-clamp__raw-line')[0].innerHTML) {
//             details.summary = shared_ctrl.removeExtraChars(document.getElementsByClassName('artdeco-container-card pv-profile-section pv-about-section ember-view')[0].getElementsByClassName('lt-line-clamp__raw-line')[0].innerHTML.trim())
//         }
//     } catch (ex) {
//         console.log(ex);
//         exception.summary = ex
//     }

//     // imployment History


//     // -- recommendation--
//     details.recommendations = [];
//     try {
//         if (document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view") && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0] && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining") && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0] && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0].getElementsByClassName("artdeco-tabpanel active ember-view") && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0].getElementsByClassName("artdeco-tabpanel active ember-view")[0] && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0].getElementsByClassName("artdeco-tabpanel active ember-view")[0].getElementsByClassName("pv-recommendation-entity ember-view") && document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0].getElementsByClassName("artdeco-tabpanel active ember-view")[0].getElementsByClassName("pv-recommendation-entity ember-view").length) {

//             let recommendationObj = document.getElementsByClassName("pv-profile-section pv-recommendations-section artdeco-container-card ember-view")[0].getElementsByClassName("recommendations-inlining")[0].getElementsByClassName("artdeco-tabpanel active ember-view")[0].getElementsByClassName("pv-recommendation-entity ember-view");

//             for (let i = 0; i < recommendationObj.length; i++) {
//                 let tempRecommObj = {};
//                 if (recommendationObj && recommendationObj[i] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header")[0].getElementsByClassName("pv-recommendation-entity__member ember-view") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header")[0].getElementsByClassName("pv-recommendation-entity__member ember-view")[0] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header")[0].getElementsByClassName("pv-recommendation-entity__member ember-view")[0].getElementsByClassName("pv-recommendation-entity__detail") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header")[0].getElementsByClassName("pv-recommendation-entity__member ember-view")[0].getElementsByClassName("pv-recommendation-entity__detail")[0]) {
//                     let tempObj = recommendationObj[i].getElementsByClassName("pv-recommendation-entity__header")[0].getElementsByClassName("pv-recommendation-entity__member ember-view")[0].getElementsByClassName("pv-recommendation-entity__detail")[0];

//                     tempRecommObj.name = "";
//                     if (tempObj && tempObj.getElementsByClassName("t-16 t-black t-bold") && tempObj.getElementsByClassName("t-16 t-black t-bold")[0] && tempObj.getElementsByClassName("t-16 t-black t-bold")[0].innerHTML) {
//                         tempRecommObj.name = shared_ctrl.removeExtraChars(tempObj.getElementsByClassName("t-16 t-black t-bold")[0].innerHTML.trim());
//                     }

//                     tempRecommObj.designation = "";
//                     if (tempObj && tempObj.getElementsByClassName("pv-recommendation-entity__headline t-14 t-black t-normal pb1") && tempObj.getElementsByClassName("pv-recommendation-entity__headline t-14 t-black t-normal pb1")[0] && tempObj.getElementsByClassName("pv-recommendation-entity__headline t-14 t-black t-normal pb1")[0].innerHTML) {
//                         tempRecommObj.designation = shared_ctrl.removeExtraChars(tempObj.getElementsByClassName("pv-recommendation-entity__headline t-14 t-black t-normal pb1")[0].innerHTML.trim());

//                     }
//                 }

//                 if (recommendationObj && recommendationObj[i] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlightsr") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view")[0] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view")[0].getElementsByTagName("span") && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view")[0].getElementsByTagName("span")[0] && recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view")[0].getElementsByTagName("span")[0].innerHTML) {
//                     tempRecommObj.description = shared_ctrl.removeExtraChars(recommendationObj[i].getElementsByClassName("pv-recommendation-entity__highlights")[0].getElementsByClassName("pv-recommendation-entity__text relative")[0].getElementsByClassName("ember-view")[0].getElementsByTagName("span")[0].innerHTML.trim());

//                 }
//                 console.log(tempRecommObj);
//                 details.recommendations.push(tempRecommObj);
//             }
//         }

//     } catch (ex) {
//         console.log("linkedin recommendation", ex);
//         exception.recommendations = ex
//     }

//     // Training and certification
//     details.certifications = []
//     try {
//         if (document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view") && document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0] && document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-more") && document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-more")[0] && document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-more")[0].getElementsByClassName("pv-profile-section__sortable-item pv-certification-entity ember-view") && document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-more")[0].getElementsByClassName("pv-profile-section__sortable-item pv-certification-entity ember-view").length) {
//             console.log("1");

//             var tempCertificationObj = document.getElementsByClassName("pv-profile-section pv-profile-section--certifications-section ember-view")[0].getElementsByClassName("pv-profile-section__section-info section-info pv-profile-section__section-info--has-more")[0].getElementsByClassName("pv-profile-section__sortable-item pv-certification-entity ember-view");
//             console.log("2");

//             for (var i = 0; i < tempCertificationObj.length; i++) {
//                 var certification = {}
//                 console.log("3");

//                 // certification name
//                 certification.name = ""
//                 if (tempCertificationObj && tempCertificationObj[i] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-16 t-bold") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-16 t-bold")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-16 t-bold")[0].innerHTML) {
//                     certification.name = shared_ctrl.removeExtraChars(tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-16 t-bold")[0].innerHTML.trim())
//                 }
//                 console.log("4");

//                 // issuing company
//                 certification.company = ""
//                 if (tempCertificationObj && tempCertificationObj[i] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[0].getElementsByTagName("span") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[0].getElementsByTagName("span")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[0].getElementsByTagName("span")[1].innerHTML) {
//                     certification.company = shared_ctrl.removeExtraChars(tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[0].getElementsByTagName("span")[1].innerHTML.trim());
//                 }

//                 // issuing and expiring Date
//                 certification.issue_date = "";
//                 certification.expiry_date = "";

//                 if (tempCertificationObj && tempCertificationObj[i] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span")[1].innerHTML) {

//                     var tempstr = shared_ctrl.removeExtraChars(tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[1].getElementsByTagName("span")[1].innerHTML.trim());
//                     console.log("5");

//                     if (tempstr && tempstr.indexOf("Expires") > -1 && tempstr.indexOf("No") == -1) {
//                         console.log("6");

//                         var tempIssueDate = tempstr.split("Expires")[0];
//                         if (tempIssueDate && tempIssueDate.indexOf("Issued") > -1) {
//                             certification.issue_date = tempIssueDate.split("Issued")[1].trim();
//                         }
//                         var tempExpDate = tempstr.split("Expires")[1];
//                         if (tempExpDate) {
//                             certification.expiry_date = tempExpDate.trim();
//                         }
//                     }
//                     if (tempstr && tempstr.indexOf("No") > -1 && tempstr.indexOf("Expires") == -1) {
//                         console.log("7");

//                         var tempIssueDate = tempstr.split("No")[0];
//                         if (tempIssueDate && tempIssueDate.indexOf("Issued") > -1) {
//                             certification.issue_date = tempIssueDate.split("Issued")[1].trim();
//                         }

//                     }
//                 }

//                 // credential ID
//                 certification.credential_id = ""
//                 if (tempCertificationObj && tempCertificationObj[i] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByTagName("p")[2] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-14 t-black--light")[0] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-14 t-black--light")[0].getElementsByTagName("span") && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-14 t-black--light")[0].getElementsByTagName("span")[1] && tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-14 t-black--light")[0].getElementsByTagName("span")[1].innerHTML) {
//                     console.log("8");

//                     var tempCredStr = shared_ctrl.removeExtraChars(tempCertificationObj[i].getElementsByClassName("pv-certifications__summary-info pv-entity__summary-info pv-entity__summary-info--background-section")[0].getElementsByClassName("t-14 t-black--light")[0].getElementsByTagName("span")[1].innerHTML.trim());
//                     if (tempCredStr && tempCredStr.indexOf("Credential ID") > -1) {
//                         certification.credential_id = tempCredStr.split("Credential ID")[1].trim();
//                     }
//                 }
//                 details.certifications.push(certification);
//             }
//             console.log(details)
//         }
//     } catch (ex) {
//         console.log("training and certification", ex);
//         exception.certification = ex
//     }

//     details.uid = uniqueID;
//     // profile picture
//     try {
//         if (req.body.profile_pic) {
//             try {
//                 var profile_pic = req.body.profile_pic.split(',');
//                 console.log(profile_pic);
//                 if (profile_pic.length && profile_pic[0] && profile_pic[1]) {

//                     details.profile_pic = profile_pic[1];
//                     var filetype = '';
//                     filetype = setFileType(profile_pic[0]);
//                     details.profile_extension = '.' + filetype;
//                 }
//             } catch (ex) {
//                 console.log(ex);
//             }
//         }
//     } catch (ex) {
//         console.log("profile_pic", ex);
//         exception.profile_pic = ex;
//     }

//     try {
//         if (req.body.requirements) {
//             try {
//                 if (typeof req.body.requirements == "string") {
//                     try {
//                         req.body.requirements = JSON.parse(req.body.requirements)
//                     } catch (err) {
//                         console.log(err);
//                     }
//                 }
//                 if (req.body.requirements.length) {
//                     details.requirements = req.body.requirements
//                 } else {
//                     details.requirements = [parseInt(req.body.requirements)];
//                 }
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//     } catch (ex) {
//         console.log("requriment", ex);
//         exception.requriment = ex;

//     }

//     details.portal_id = portalId;
//     try {
//         if (req.body.attachment) {
//             try {
//                 var attachment1 = req.body.attachment.split(',');
//                 //console.log(attachment1);
//                 if (attachment1.length && attachment1[0] && attachment1[1]) {

//                     details.resume_document = attachment1[1];
//                     var filetype = '';
//                     filetype = setFileType(attachment1[0]);
//                     details.resume_extension = '.' + filetype;
//                 }
//             } catch (ex) {
//                 console.log(ex);
//             }
//         }
//     } catch (ex) {
//         console.log("attchments", ex);
//         exception.attchments = ex;

//     }

//     try {
//         if (contact_object) {
//             contact_object = JSON.parse(contact_object);
//             if (contact_object.address) {
//                 details.address = contact_object.address;
//             }
//             if (contact_object.emailAddress) {
//                 details.email_id = contact_object.emailAddress;
//             }
//             if (contact_object.phoneNumbers && contact_object.phoneNumbers.length) {
//                 details.mobile_number = contact_object.phoneNumbers[0].number;
//             }

//             if (contact_object.birthDateOn) {
//                 details.DOB = shared_ctrl.dateFormat(shared_ctrl.months_full[contact_object.birthDateOn.month - 1] + ' ' + contact_object.birthDateOn.day);
//             }
//         }
//     } catch (error) {

//     }


//     response.status = true;
//     response.message = "XML Parsed";
//     response.error = false;
//     response.data = details;
//     response.exception = exception;
//     res.status(200).json(response);
//     // })
// };

function parseEducationSelf(education_str, main_document) {
    const { JSDOM } = jsdom;
    if (education_str) {
        let education = [];
        let document = new JSDOM(education_str).window.document;
        try {

            for (let i = 0; i < document.querySelectorAll('.pvs-list__container li').length; i++) {
                let tempEduHistory = {
                    education: '',
                    institution: '',
                    type: '',
                    passing_year: '',
                    specialization: "",
                    university: "",
                    education_group: "",
                    duration: {
                        from: '',
                        to: ''
                    },

                }
                try {
                    tempEduHistory.institution = shared_ctrl.removeExtraChars(document.querySelectorAll('.pvs-list__container li')[i].querySelector('.t-bold .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    tempEduHistory.education = shared_ctrl.removeExtraChars(document.querySelectorAll('.pvs-list__container li')[i].querySelector('.t-14.t-normal .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    let duration = shared_ctrl.removeExtraChars(document.querySelectorAll('.pvs-list__container li')[i].querySelector('.t-14.t-normal.t-black--light .visually-hidden').innerHTML);
                    tempEduHistory.duration.from = shared_ctrl.dateFormat(duration.split('-')[0].trim());
                    tempEduHistory.duration.to = shared_ctrl.dateFormat(duration.split('-')[1].trim());
                } catch (error) {

                }
                if (tempEduHistory.institution) {
                    education.push(tempEduHistory);
                }


            }

        }
        catch (err) {

        }
        return education;
    }
    else {
        let education = [];
        try {
            for (let i = 0; i < (main_document.getElementById("education").parentElement).querySelectorAll('li.pvs-list__item--one-column').length; i++) {
                let elem = (main_document.getElementById("education").parentElement).querySelectorAll('li.pvs-list__item--one-column')[i];
                let tempEduHistory = {
                    education: '',
                    institution: '',
                    type: '',
                    passing_year: '',
                    specialization: "",
                    university: "",
                    education_group: "",
                    duration: {
                        from: '',
                        to: ''
                    },

                }
                try {
                    tempEduHistory.institution = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    tempEduHistory.education = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    let duration = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal.t-black--light .visually-hidden').innerHTML);
                    tempEduHistory.duration.from = shared_ctrl.dateFormat(duration.split('-')[0].trim());
                    tempEduHistory.duration.to = shared_ctrl.dateFormat(duration.split('-')[1].trim());
                } catch (error) {

                }
                if (tempEduHistory.institution) {
                    education.push(tempEduHistory);
                }


            }
        }
        catch (err) {

        }
        return education;
    }
    // try {
    //     if (document.querySelectorAll('#education-section ul li') && document.querySelectorAll('#education-section ul li').length) {
    //         details.education = [];
    //         let education = document.querySelectorAll('#education-section ul li');
    //         for (let i = 0; i < education.length; i++) {
    // let tempEduHistory = {
    //     education: '',
    //     institution: '',
    //     type: '',
    //     passing_year: '',
    //     specialization: "",
    //     university: "",
    //     education_group: "",
    //     duration: {
    //         from: '',
    //         to: ''
    //     },

    //             };
    //             //institution
    //             let edu = education[i];
    //             try {
    //                 if (edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name') && edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name').innerHTML) {
    //                     let value = edu.querySelector('a[data-control-name="background_details_school"] h3.pv-entity__school-name').innerHTML;
    //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
    //                     value = value.trim();
    //                     tempEduHistory.institution = value;
    //                 }
    //             } catch (error) { }

    //             try {
    //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item').innerHTML) {
    //                     let value = edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__degree-name .pv-entity__comma-item').innerHTML;
    //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
    //                     value = value.trim();
    //                     tempEduHistory.type = value;
    //                     tempEduHistory.education = value;
    //                 }
    //             } catch (error) {

    //             }

    //             try {
    //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item').innerHTML) {
    //                     let value = edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__fos .pv-entity__comma-item').innerHTML;
    //                     value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value));
    //                     value = value.trim();
    //                     tempEduHistory.specialization = value;
    //                 }
    //             } catch (error) {

    //             }
    //             try {
    //                 if (edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__dates') && edu.querySelector('a[data-control-name="background_details_school"] .pv-entity__dates').innerHTML) {
    //                     let value = edu.querySelectorAll('a[data-control-name="background_details_school"] .pv-entity__dates time');
    //                     // value = shared_ctrl.removeExtraChars(value);
    //                     // value = value.trim();

    //                     try {
    //                         tempEduHistory.duration.from = shared_ctrl.removeExtraChars(value[0].innerHTML).trim();
    //                         tempEduHistory.duration.to = shared_ctrl.removeExtraChars(value[1].innerHTML).trim();
    //                     } catch (error) {

    //                     }
    //                     // tempEmpHistory.company_name = value;
    //                 }
    //             } catch (error) {
    //             }
    //             //passing year
    //             try {
    //                 tempEduHistory.passing_year = tempEduHistory.duration.to;
    //             } catch (error) {

    //             }
    //             details.education.push(tempEduHistory)

    //         }
    //     }
    // } catch (error) {

    // }
}

function processExp(work_history) {
    try {
        let total_year = 0;
        let total_month = 0;
        let sub_month = 0;
        if (work_history && work_history.length) {
            for (let index = 0; index < work_history.length; index++) {
                let his = work_history[index];
                try {
                    total_year += his.exp.year;
                    total_month += his.exp.month;
                }
                catch (error) {

                }
            }
            if (total_month > 11) {
                total_year += Math.floor(total_month / 12);
                sub_month = total_month % 12;
            }
        }
        return total_year + '.' + (sub_month || total_month)
    } catch (error) {
        return 0
    }
}

function parseEmploymentSelf(doc_string, main_document) {
    const { JSDOM } = jsdom;
    let emp_details = [];
    if (doc_string) {

        let document = new JSDOM(doc_string).window.document;
        try {

            for (let i = 0; i < document.querySelectorAll('.pvs-list__container li.pvs-list__paged-list-item.artdeco-list__item').length; i++) {
                let elem = document.querySelectorAll('.pvs-list__container li.pvs-list__paged-list-item.artdeco-list__item')[i];
                let tempEmpHistory = {
                    company_name: '',
                    designation: '',
                    duration: {
                        from: '',
                        to: ''
                    },

                };
                try {
                    tempEmpHistory.designation = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    let company_name = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal .visually-hidden').innerHTML);
                    tempEmpHistory.company_name = company_name.split('·')[0].trim();
                    // tempEmpHistory.designation = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal .visually-hidden').innerHTML);
                } catch (error) {

                }

                try {
                    let duration = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal.t-black--light .visually-hidden').innerHTML);
                    tempEmpHistory.duration.from = shared_ctrl.dateFormat(duration.split('-')[0].trim());
                    tempEmpHistory.duration.to = shared_ctrl.dateFormat(duration.split('-')[1].trim());
                } catch (error) {

                }
                if (tempEmpHistory.company_name) {
                    emp_details.push(tempEmpHistory);
                }


            }

        }
        catch (err) {
            // return emp_details;
        }
        return emp_details;
    }
    else {

        try {
            for (let i = 0; i < (main_document.getElementById("experience").parentElement).querySelectorAll('li.pvs-list__item--one-column').length; i++) {
                let elem = (main_document.getElementById("experience").parentElement).querySelectorAll('li.pvs-list__item--one-column')[i];
                let tempEmpHistory = {
                    company_name: '',
                    designation: '',
                    duration: {
                        from: '',
                        to: ''
                    },
                    exp: {
                        year: 0,
                        month: 0
                    }

                };

                if (elem.querySelectorAll('ul .t-bold .visually-hidden') && elem.querySelectorAll('ul .t-bold .visually-hidden')[0]) {
                    try {
                        let designation = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);

                        tempEmpHistory.designation = designation.split('·')[0].trim();
                    }
                    catch (err) {

                    }

                    try {
                        let company_name = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);

                        tempEmpHistory.company_name = company_name.split('·')[0].trim();


                    } catch (error) {

                    }
                    try {
                        let duration = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal.t-black--light .visually-hidden').innerHTML);
                        tempEmpHistory.duration.from = shared_ctrl.dateFormat(duration.split('-')[0].trim());
                        try {
                            let to = (duration.split('-')[1].split('  ')[0]).trim();
                            tempEmpHistory.duration.to = shared_ctrl.dateFormat(to);

                            let exp_str = (duration.split('-')[1].split('  ')[1]).trim();

                            if (exp_str && exp_str.includes('yr') && exp_str.includes('mo')) {
                                tempEmpHistory.exp.year = eval(exp_str.match(/\d+/g)[0]);
                                tempEmpHistory.exp.month = eval(exp_str.match(/\d+/g)[1]);
                            }
                            else if (exp_str.includes('yr')) {
                                tempEmpHistory.exp.year = eval(exp_str.match(/\d+/g)[0]);
                            }

                            else if (exp_str.includes('mo')) {
                                tempEmpHistory.exp.month = eval(exp_str.match(/\d+/g)[0]);

                            }
                            console.log(tempEmpHistory);
                        }
                        catch (err) {

                        }
                        // tempEmpHistory.duration.to =
                        // tempEmpHistory.duration.to = shared_ctrl.dateFormat(duration.split('-')[1].trim());
                    } catch (error) {

                    }
                    if (tempEmpHistory.company_name) {
                        emp_details.push(tempEmpHistory);
                    }
                }
                else {
                    try {
                        let designation = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);

                        tempEmpHistory.designation = designation.split('·')[0].trim();


                    } catch (error) {

                    }

                    try {
                        let company_name = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal .visually-hidden').innerHTML);

                        tempEmpHistory.company_name = company_name.split('  ')[0].trim();
                        // tempEmpHistory.designation = 
                    } catch (error) {

                    }

                    try {
                        let duration = shared_ctrl.removeExtraChars(elem.querySelector('.t-14.t-normal.t-black--light .visually-hidden').innerHTML);
                        tempEmpHistory.duration.from = shared_ctrl.dateFormat(duration.split('-')[0].trim());
                        try {
                            let to = (duration.split('-')[1].split('  ')[0]).trim();
                            tempEmpHistory.duration.to = shared_ctrl.dateFormat(to);

                            let exp = (duration.split('-')[1].split('  ')[1]).trim();
                        }
                        catch (err) {

                        }
                        // tempEmpHistory.duration.to =
                        // tempEmpHistory.duration.to = shared_ctrl.dateFormat(duration.split('-')[1].trim());
                    } catch (error) {

                    }
                    if (tempEmpHistory.company_name) {
                        emp_details.push(tempEmpHistory);
                    }
                }



            }
        } catch (error) {

        }
        return emp_details;
    }
}
function parseLanguageSelf(education_str, details) {

}
function parseskillsSelf(doc_string, main_document) {
    const { JSDOM } = jsdom;
    let skills = [];
    if (doc_string) {

        let document = new JSDOM(doc_string).window.document;
        try {

            for (let i = 0; i < document.querySelectorAll('.pvs-list__container li.pvs-list__paged-list-item.artdeco-list__item').length; i++) {
                let elem = document.querySelectorAll('.pvs-list__container li.pvs-list__paged-list-item.artdeco-list__item')[i];

                try {
                    let skill = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML)
                    if (skill) {
                        skills.push(skill);

                    }
                } catch (error) {

                }


            }

        }
        catch (err) {
            // return emp_details;
        }
        return skills;
    }
    else {

        try {
            for (let i = 0; i < (main_document.getElementById("skills").parentElement).querySelectorAll('li.pvs-list__item--one-column').length; i++) {
                let elem = (main_document.getElementById("skills").parentElement).querySelectorAll('li.pvs-list__item--one-column')[i];
                try {
                    let skill = shared_ctrl.removeExtraChars(elem.querySelector('.t-bold .visually-hidden').innerHTML);

                    if (skill) {
                        skills.push(skill);
                    }


                } catch (error) {

                }



            }
        } catch (error) {

        }
        return skills;
    }
}


module.exports = linkedInImporter;