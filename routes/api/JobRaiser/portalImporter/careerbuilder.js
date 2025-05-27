const { FONT_SANS_16_BLACK } = require("jimp");
const jsdom = require("jsdom");
const { stripHtmlTags } = require("./shared-ctrl");

var shared_ctrl = require('./shared-ctrl')
careerbuilderImporter = {};
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();



careerbuilderImporter.saveApplicantsFromCareerBuilderApplied = function (req, res) {
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
                let name_ref = document.querySelector(".candidateInfoContainer .candidateInfo .candidateDetails .name");
                if (name_ref && name_ref.innerHTML) {
                    let name = name_ref.innerHTML;
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
                let email_ref = document.querySelector('.contactInfo .email');
                if (email_ref && email_ref.innerHTML) {
                    let value = email_ref.innerHTML;
                    details.email_id = shared_ctrl.removeExtraChars(value);
                }
            } catch (error) {

            }

            //mobile number
            try {
                let phone_ref = document.querySelector('.phoneContainer .phone-val');
                if (phone_ref && phone_ref.innerHTML) {
                    let mob = shared_ctrl.removeExtraChars(phone_ref.innerHTML).trim();
                    if (mob.length == 12) {
                        details.isd = mob.substr(0, 2)
                        details.mobile_number = mob.substr(2, mob.length)
                    }
                    else {
                        details.mobile_number = mob;
                    }
                }
            } catch (error) {

            }

            //details 
            let details_card = document.querySelector('.candProfileContainer');

            try {
                if (details_card) {
                    let p_tags = details_card.querySelectorAll('p');
                    if (p_tags && p_tags.length) {
                        for (let i = 0; i < p_tags.length; i++) {
                            ele = p_tags[i];
                            if (ele.querySelector('.fieldTitle') && ele.querySelector('.fieldTitle').innerHTML) {
                                try {
                                    let key = shared_ctrl.removeExtraChars(ele.querySelector('.fieldTitle').innerHTML).split(":")[0].trim();
                                    if (keyMap[key]) {
                                        details[keyMap[key]] = ele.querySelector('.fieldValue') ? shared_ctrl.removeExtraChars(ele.querySelector('.fieldValue').innerHTML).trim() : '';
                                    }
                                }
                                catch (err) {

                                }
                            }

                        }
                    }
                }
            } catch (ex) {
                console.log('Naukri error in Personal Details parsing')
            }


            //experience
            try {
                // let temp_experience = 0;
                // let temp_element = details.experience;
                // if (temp_element && temp_element.indexOf(' Year(s)') > -1 && temp_element.split(' Year(s)') && temp_element.split(' Year(s)')[0]) {
                //     temp_experience += temp_element.split(' Year(s)')[0] * 1;
                //     temp_element = temp_element.split(' Year(s)')[1];
                // }
                // if (temp_element && temp_element.indexOf(' Month(s)') > -1 && temp_element.split(' Month(s)') && temp_element.split(' Month(s)')[0])
                //     temp_experience += parseFloat((temp_element.split(' Month(s)')[0] / 12).toFixed(1));

                if (details.experience) {
                    details.experience = shared_ctrl.convertToYears(details.experience);
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
                    // if (salray_value.split(' ')[0]) {
                    //     details.present_salary_curr = salray_value.split(' ')[0].trim()
                    // }
                    if (salray_value.split(' ')[0]) {
                        details.present_salary = salray_value.split(' ')[0];
                    }
                    if (salray_value.split(' ')[1]) {
                        details.present_salary_scale = salray_value.split(' ')[1].trim()
                    }

                }
                details.notice_period = notice_period;
            } catch (error) {

            }

            //primary skills

            try {
                if (details.primary_skills && typeof details.primary_skills == 'string') {
                    details.primary_skills = details.primary_skills.split(',');
                    details.primary_skills = details.primary_skills.map(element => {
                        return element.trim()
                    });
                }
            } catch (error) {

            }



            //work experience
            try {
                if (document.querySelectorAll(".workExContainer .workExDetails .expItem")) {
                    details.work_history = [];
                    let history_elem = document.querySelectorAll(".workExContainer .workExDetails .expItem");
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
                                if (history_elem[i].querySelector('.font-l.row1')) {
                                    let value = history_elem[i].querySelector('.font-l.row1').innerHTML;
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
                                if (history_elem[i].querySelector('.font-l.row2 span')) {
                                    let value = history_elem[i].querySelector('.font-l.row2 span').innerHTML;
                                    value = shared_ctrl.stripHtmlTags((shared_ctrl.removeExtraChars(value)).trim());
                                    tempWorkHistory.designation = value;
                                    tempWorkHistory.job_title = value;

                                    if (history_elem[i].querySelector('.font-l.row2 span.ml5')) {
                                        let val = history_elem[i].querySelector('.font-l.row2 span.ml5').innerHTML;
                                        val = shared_ctrl.stripHtmlTags((shared_ctrl.removeExtraChars(val)).trim());
                                        try {
                                            let dateString = val;
                                            let dateRegex = /(\d{1,2} [a-zA-Z]{3} \d{2})/g;
                                            let dates = dateString.match(dateRegex);

                                            if (dates[0]) {
                                                let fromDate = new Date(dates[0]);
                                                tempWorkHistory.duration.from = `${fromDate.getDate().toString().padStart(2, "0")}-${(fromDate.getMonth() + 1).toString().padStart(2, "0")}-${fromDate.getFullYear().toString()}`;

                                            }
                                            if (dates[1]) {
                                                let toDate = new Date(dates[1]);
                                                tempWorkHistory.duration.to = `${toDate.getDate().toString().padStart(2, "0")}-${(toDate.getMonth() + 1).toString().padStart(2, "0")}-${toDate.getFullYear().toString()}`;
                                            }
                                        }
                                        catch (err) {

                                        }

                                    }

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
                if (document.querySelectorAll(".educationContainer")) {
                    details.education = [];
                    let history_elem = document.querySelectorAll(".educationContainer .row");
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

                                let education_ref = history_elem[i].querySelector('.font-l.color-blue');
                                if (education_ref) {
                                    let value = education_ref.innerHTML;
                                    value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                                    tempEduHistory.specialization = value;
                                    tempEduHistory.education = value;
                                }
                            } catch (error) { }

                            try {
                                let education_group_ref = history_elem[i].querySelector('.font-l.color-g66');
                                if (education_group_ref) {
                                    let value = history_elem[i].querySelector('.font-l.color-g66').childNodes[0].textContent;
                                    value = shared_ctrl.stripHtmlTags(shared_ctrl.removeExtraChars(value)).trim();
                                    tempEduHistory.type = value;
                                    tempEduHistory.education_group = value;
                                }
                            } catch (error) { }

                            try {
                                let institution_Ref = history_elem[i].querySelector('.font-s.mt5')
                                if (institution_Ref) {
                                    tempEduHistory.institution = (shared_ctrl.removeExtraChars(institution_Ref.childNodes[0].textContent).split('|')[0]).trim();
                                    tempEduHistory.passing_year = shared_ctrl.removeExtraChars(institution_Ref.childNodes[1].textContent.trim().match(/\d+/)[0]);

                                }
                            } catch (error) { }

                            details.education.push(tempEduHistory)
                        }
                    }
                }
            } catch (error) { }

            //skill experience
            try {
                if (document.querySelectorAll(".sectionContainer .contentHeading") && document.querySelectorAll(".sectionContainer .contentHeading").length) {
                    for (let i = 0; i < document.querySelectorAll(".sectionContainer .contentHeading").length; i++) {
                        let section = document.querySelectorAll(".sectionContainer .contentHeading")[i];
                        if ((section.innerHTML).toLowerCase().indexOf('skill') > -1) {
                            let skill_elements = section.parentElement.querySelectorAll('table tr');
                            for (let j = 0; j < skill_elements.length; j++) {
                                let skill_element = skill_elements[j]
                                let tempSkillExp = {};
                                try {
                                    if (skill_element.querySelectorAll('td')[0]) {
                                        tempSkillExp.skill_name = shared_ctrl.removeExtraChars((skill_element.querySelectorAll('td')[0]).innerHTML).trim();
                                    }
                                } catch (error) { }

                                try {
                                    if (skill_element.querySelectorAll('td')[1]) {
                                        tempSkillExp.version = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td')[1].innerHTML).trim();
                                    }
                                } catch (error) { }

                                try {
                                    if (skill_element.querySelectorAll('td')[2]) {
                                        tempSkillExp.last_used = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td')[2].innerHTML).trim();
                                    }
                                } catch (error) { }

                                try {
                                    if (skill_element.querySelectorAll('td')[3]) {
                                        let temp_element = shared_ctrl.removeExtraChars(skill_element.querySelectorAll('td')[3].innerHTML).trim();
                                        tempSkillExp.experience = shared_ctrl.convertToYears(temp_element);
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
                                if (tempSkillExp.skill_name) {
                                    details.skill_experience.push(tempSkillExp)
                                }
                            }
                        }
                        if ((section.innerHTML).toLowerCase().indexOf('language') > -1) {
                            let lang = section.parentElement.querySelectorAll('table tr');
                            details.languages = [];
                            for (let k = 0; k < lang.length; k++) {
                                let lang_element = lang[k];
                                try {
                                    if (lang_element.querySelectorAll('td')[0] && lang_element.querySelectorAll('td')[0].innerHTML) {
                                        details.languages.push(shared_ctrl.removeExtraChars(lang_element.querySelectorAll('td')[0].innerHTML).trim());
                                    }
                                } catch (error) { }
                            }

                        }
                    }
                }


            } catch (error) { }




            //Personal Details

            try {
                let p_tags = document.querySelector(".deatailsCont").querySelectorAll('p')
                if (p_tags && p_tags.length) {
                    for (let i = 0; i < p_tags.length; i++) {
                        ele = p_tags[i];
                        if (ele.querySelector('.fieldTitle') && ele.querySelector('.fieldTitle').innerHTML) {
                            try {
                                let key = shared_ctrl.removeExtraChars(ele.querySelector('.fieldTitle').innerHTML).split(":")[0].trim();
                                if (keyMap[key]) {
                                    details[keyMap[key]] = ele.querySelector('.fieldValue') ? shared_ctrl.removeExtraChars(ele.querySelector('.fieldValue').innerHTML).trim() : '';
                                }
                            }
                            catch (err) {

                            }
                        }

                    }
                }


            } catch (error) {
            }
            //dob
            try {
                if (details.DOB) {
                    // details.dob = shared_ctrl.dateFormat(details.dob);
                    details.DOB = shared_ctrl.dateFormat(details.DOB);
                }
            }
            catch (Err) {

            }


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

};


module.exports = careerbuilderImporter;