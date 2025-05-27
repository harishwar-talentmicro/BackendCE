const jsdom = require("jsdom");

var shared_ctrl = require('./shared-ctrl')
var fs = require('fs');
const axios = require('axios');

ApnaJobsImporter = {};



ApnaJobsImporter.checkApplicantExistsFromApnaJobs = function (req, res, next) {
    let response = new shared_ctrl.response();
    const { JSDOM } = jsdom;
    let request = req.body;
    var is_select_all = req.body.is_select_all;
    let document = new JSDOM(request.xml_string).window.document;
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

    if (!(list && list.length)) {
        res.status(500).json('Oops! Something went wrong. Please try again later.');
        return;
    }
    for (let i = 0; i < list.length; i++) {
        let candidate_details = list[i];

        let selected_candidate_details = {};
        try {
            selected_candidate_details.first_name = candidate_details?.fullName?.split(' ')[0] || ''
        } catch (error) { }
        try {
            selected_candidate_details.last_name = candidate_details?.fullName?.split(' ')[1] || ''
        } catch (error) { }
        try {
            selected_candidate_details.fullName = candidate_details?.fullName || ''
        } catch (error) { }
        try {
            selected_candidate_details.experience = candidate_details?.experience
        } catch (error) { }
        try {
            selected_candidate_details.last_modified_date = candidate_details?.updatedOn || ''
        } catch (error) { }
        try {
            selected_candidate_details.current_employer = candidate_details.employment?.current?.organization || ''
        } catch (error) { }
        try {
            selected_candidate_details.previous_job_title = candidate_details.employment?.previous?.designation || ''
        } catch (error) { }
        try {
            selected_candidate_details.job_title = candidate_details.currentExperience?.jobTitle.replace(/<\/?[^>]+(>|$)/g, "").trim() || ""
        } catch (error) { }
        try {
            selected_candidate_details.pref_locations = candidate_details.preferredLocation
        } catch (error) { }
        try {
            selected_candidate_details.secondary_skills = candidate_details.mayAlsoKnow

        } catch (error) { }
        try {
            selected_candidate_details.profile_pic = candidate_details.profilePhotoUrl
        } catch (error) { }

        try {
            selected_candidate_details.languages = candidate_details.languages
        } catch (error) { }

        try {
            selected_candidate_details.skills = candidate_details.skills
        } catch (error) {
        }
        try {
            selected_candidate_details.primary_skills = candidate_details.skills
        } catch (error) {
        }
        try {
            selected_candidate_details.userId = candidate_details.userId
        } catch (error) {
        }
        try {
            selected_candidate_details.score = candidate_details.score
        } catch (error) {
        }

        try {
            let notice_element = candidate_details.currentExperience?.notice;

            let notice_period = 0;
            if (notice_element.indexOf('month') > -1) {
                notice_period = shared_ctrl.removeExtraChars(notice_element.split('month')[0]) * 30;
            } else if (notice_element.indexOf('days') > -1) {
                notice_period = shared_ctrl.removeExtraChars(notice_element.split('days')[0]) * 1;
            } else if (notice_element.indexOf('Currently Serving') > -1) {
                notice_period = 15;
            }

            selected_candidate_details.notice_period = notice_period;

        } catch (error) { }

        try {
            selected_candidate_details.portal_id = 22;
        } catch (error) { }
        try {
            selected_candidate_details.index = i
        } catch (error) { }
        try {
            selected_candidate_details.education = []
            let educationKeys = Object.keys(candidate_details.education || {});
            let specialization = '';
            let institution = '';
            let year = '';
            let fullTitle = '';
            for (let key of educationKeys) {
                let eduDetails = candidate_details.education[key];
                if (eduDetails) {
                    if (key === "title") {
                        const titleParts = eduDetails.split(/,|-|\n/) || [];
                        specialization = titleParts[0]?.trim() || '';
                        institution = titleParts.slice(1).join(", ").trim() || '';
                        fullTitle = eduDetails;
                    } else if (key === "year") {
                        year = eduDetails;
                    }
                }
            }
            selected_candidate_details.education.push({
                education_group: "",
                institution: institution,
                specialization: specialization,
                University: fullTitle,
                education: specialization,
                passing_year: year || 0
            });

        } catch (error) {
            res.status(500).json("Error processing education details:", error);
        }
        try {
            selected_candidate_details.previousExperience = [];
            let educationKeys = Object.keys(candidate_details.previousExperience || {});
            let notice = "";
            let jobTitle = "";
            let year = 0;
            let endYear = 0;
            let companyName = "";
            for (let key of educationKeys) {
                let eduDetails = candidate_details.previousExperience[key];
                if (eduDetails) {
                    if (key === "notice") {
                        notice = eduDetails
                    } else if (key === "jobTitle") {
                        jobTitle = eduDetails; // Collect year
                    }
                } else if (key === "year") {
                    year = eduDetails;
                }
                else if (key === "endYear") {
                    endYear = eduDetails;

                }
                else if (key === "companyName") {
                    companyName = eduDetails;
                }
            }
            selected_candidate_details.previousExperience.push({
                notice: notice,
                job_role: jobTitle.replace(/<\/?[^>]+(>|$)/g, "").trim(),
                start_year: year,
                end_year: endYear,
                organization: companyName
            });

        } catch (error) {
            res.status(500).json("Error processing experience details:", error);
        }

        try {
            selected_candidate_details.address = [];
            let educationKeys = Object.keys(candidate_details.location || {});
            let areaId = "";
            let areaName = "";
            let areaNameV2 = 0;
            let cityId = 0;
            let cityName = "";
            let cityNameV2 = "";
            for (let key of educationKeys) {
                let eduDetails = candidate_details.location[key];
                if (eduDetails) {
                    if (key === "areaName") {
                        areaName = eduDetails
                    } else if (key === "areaId") {
                        areaId = eduDetails; // Collect year
                    }
                } else if (key === "areaNameV2") {
                    areaNameV2 = eduDetails; // Collect year
                }
                else if (key === "cityId") {
                    cityId = eduDetails; // Collect year

                }
                else if (key === "cityName") {
                    cityName = eduDetails; // Collect year
                }
                else if (key === "cityNameV2") {
                    cityNameV2 = eduDetails; // Collect year
                }
            }
            selected_candidate_details.address.push({
                areaId: areaId,
                areaName: areaName,
                areaNameV2: areaNameV2, // Start year
                cityId: cityId, // End year
                cityName: cityName, //// Use the collected year
                cityNameV2: cityNameV2 //// Use the collected year
            });

        } catch (error) {
            res.status(500).json("Error processing experience details:", error);
        }

        selected_candidate_details.portal_id == 22;
        applicants.push(selected_candidate_details);
    }

    console.log(applicants);

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
    //     try {
    //         try {
    //             if (is_select_all == 1) {
    //                 try {
    //                     if (document.querySelectorAll('ul#candidateList .candidate_card') && document.querySelectorAll('ul#candidateList .candidate_card').length) {
    //                         for (var i = 0; i < document.querySelectorAll('ul#candidateList .candidate_card').length; i++) {
    //                             var element = document.querySelectorAll('ul#candidateList .candidate_card')[i];
    //                             var applicant;
    //                             applicant = ApnaJobsDuplicateParsingRecruiter(element, selected_candidates[i], details.portal_id);
    //                             applicants.push(applicant);
    //                         }
    //                     }
    //                 } catch (ex) {
    //                     console.log(ex, "check Duplicate parsing ApnaJobs");
    //                 }
    //             }
    //             else {
    //                 try {
    //                     if (document.querySelectorAll('.css-qmeovh .MuiPaper-root .PrivateSwitchBase-input') && document.querySelectorAll('.MuiPaper-root .PrivateSwitchBase-input').length) {
    //                         for (var i = 0; i < selected_candidates.length; i++) {
    //                             var element = document.querySelectorAll('.css-qmeovh .MuiPaper-root')[selected_candidates[i]];
    //                             var applicant;
    //                             applicant = ApnaJobsDuplicateParsingRecruiter(element, selected_candidates[i], details.portal_id);
    //                             applicants.push(applicant);
    //                         }
    //                     }
    //                 } catch (ex) {
    //                     console.log(ex, "check Duplicate parsing ApnaJobs");
    //                 }
    //             }
    //         } catch (err) {
    //             console.log(err, "Check Duplicate parsing ApnaJobs")
    //         }

    //         response.status = true;
    //         response.message = "Parsed Successfully";
    //         response.error = null;
    //         response.data = applicants;
    //         res.status(200).json(response);

    //     } catch (ex) {
    //         console.log(ex);
    //         response.status = false;
    //         response.message = "something went wrong";
    //         response.error = ex;
    //         response.data = null;
    //         res.status(500).json(response);
    //     }
}

// ApnaJobsImporter.saveApplicantForApnaJobs = function (req, res, next) {
//     let response = new shared_ctrl.response();
//     let details = new shared_ctrl.portalimporterDetails();

//     const { JSDOM } = jsdom;
//     details.portal_id = 19;
//     let request = req.body;
//     let selected_candidates = req.body.selected_candidates;
//     let applicants = [];
//     let document = new JSDOM(request.xml_string).window.document;

//     try {
//         if (document) {
//             //name
//             try {
//                 if (user_details) {
//                     //name
//                     try {
//                       details.full_name = user_details?.fullName;
//                       try {
//                         details.first_name = user_details?.fullName.split(',')[0].split(' ')[0]
//                       } catch (error) {
//                       }
//                       try {
//                         details.last_name = user_details?.fullName.split(',')[0].split(' ').pop()
//                       } catch (error) {
//                       }
//                     }
//                     catch (err) {
//                     }
//                     //emailId
//                     try {
//                       details.email_id = user_details?.email[0] || "";
//                     }
//                     catch (err) { }
//                     try {
//                       details.alt_email_id = user_details?.email[1] || "";
//                     }
//                     catch (err) { }
//                     //mobile_number
//                     try {
//                       details.mobile_number = user_details?.phoneNumber[0] || ""
//                     }
//                     catch (err) { }
//                     try {
//                       if ((user_details?.phoneNumber[0]).toString().length == 12) {
//                         details.mobile_number = (user_details?.phoneNumber[0]).toString().slice(2, 12);
//                         details.isd = (user_details?.phoneNumber[0]).toString().slice(0, 2);
//                       }
//                     }
//                     catch (err) {
//                     }
//                     try {
//                       details.age = user_details?.age || ""
//                     } catch (error) {
//                     }
//                     //address
//                     try {
//                       details.address = user_details?.city || "";
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.address");
//                     }
//                     try {
//                       details.last_modified_date = user_details?.updatedOn || "";
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.last_modified_date");
//                     }
//                     //  experience
//                     try {
//                       details.experience = user_details?.totalExperienceInYears || "";
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs details.experience");
//                     }
//                     // Profile Pic
//                     try {
//                       details.profile_pic = user_details?.profilePhotoUrl || "";
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs details.profile_pic");
//                     }
//                     // Portal Id
//                     try {
//                       details.portal_id = 22;
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs details.portal_id");
//                     }
//                     //Languages
//                     try {
//                       // let languages = [];
//                       // let language_element = user_details?.languages;
//                       // if (language_element && language_element.length) {
//                       //   for (var i = 0; i < language_element.length; i++) {
//                       //     var language = {};
//                       //     if (language_element[i])
//                       //       language.language_name = language_element[i];
//                       //     languages.push(language);
//                       //   }
//                       // }
//                       details.languages = user_details?.languages;
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.languages");
//                     }
//                     //Secondary Skills
//                     try {
//                       let secondary_skills = [];
//                       let secondary_skill_element = user_details?.mayKnow;
//                       if (secondary_skill_element && secondary_skill_element.length) {
//                         for (var i = 0; i < secondary_skill_element.length; i++) {
//                           var secondary_skill = {};
//                           if (secondary_skill_element[i])
//                             secondary_skill.skill_name = secondary_skill_element[i];
//                           secondary_skill.last_used = "";
//                           secondary_skill.experience = "";
//                           secondary_skills.push(secondary_skill);
//                         }
//                       }
//                       details.secondary_skills = secondary_skills;
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.secondary_skills");
//                     }
//                     //details.notice_period
//                     try {
//                       details.notice_period = user_details?.currentExperience?.notice || "";
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.notice_period");
//                     }
//                     // salary details
//                     try {
//                       details.present_salary = user_details?.currentSalary || "";
//                       try {
//                         details.present_salary_curr = user_details?.ctcType || "";
//                       }
//                       catch (Err) {
//                       }
//                       details.present_salary_period = "Lacs Per Annum";
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs details.salaryDetails");
//                     }
//                     //salary
//                     try {
//                       details.expected_salary = user_details?.expectedCtcValue || "";
//                       try {
//                         details.expected_salary_curr = user_details?.expectedCtcType || "";
//                       }
//                       catch (Err) {
//                       }
//                       details.expected_salary_period = "Lacs Per Annum";
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs details.salaryDetails");
//                     }
//                     //location
//                     try {
//                       details.location = user_details?.city || ""
//                     }
//                     catch (err) {
//                     }
//                     //Preffered locations
//                     try {
//                       // let preferredLocations = [];
//                       // let preferredLocation_element = user_details?.preferredLocation;
//                       // if (preferredLocation_element && preferredLocation_element.length) {
//                       //   for (var i = 0; i < preferredLocation_element.length; i++) {
//                       //     var preferredLocation = {};
//                       //     if (preferredLocation_element[i])
//                       //       preferredLocation.name = preferredLocation_element[i];
//                       //     preferredLocations.push(preferredLocation);
//                       //   }
//                       // }
//                     details.preferredLocations = user_details?.preferredLocation;
//                     } catch (err) {
//                       console.log(err, "save apna details.preferredLocation");
//                     }
//                     //DOB
//                     try {
//                       details.DOB = shared_ctrl.dateConverter(user_details?.birthDate)
//                     }
//                     catch (err) {
//                     }
//                     //gender
//                     try {
//                       let gender = user_details.gender;
//                       if (gender.toLowerCase() == "f") {
              
//                         details.gender = 'F'
//                       } else if (gender.toLowerCase() == "m") {
              
//                         details.gender = 'M'
//                       } else {
//                         details.gender = '';
//                       }
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs gender");
//                     }
//                     // industry
//                     try {
//                       // let industries = [];
//                       // let industry_element = user_details?.industries;
//                       // if (industry_element && industry_element.length) {
//                       //   for (var i = 0; i < industry_element.length; i++) {
//                       //     var industry = {};
//                       //     if (industry_element[i])
//                       //       industry.name = industry_element[i];
//                       //     industries.push(industry);
//                       //   }
//                       // }
//                       details.industry = user_details?.industries;
//                     } catch (err) {
//                       console.log(err, "save apna details.industry");
//                     }
//                     // functional_areas
//                     try {
//                       details.functional_areas = user_details?.farea || [];
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs functional_areas");
//                     }
//                     //role
//                     try {
//                       details.role = user_details?.experiences?.jobTitle | "";
//                     }
//                     catch (err) {
//                       console.log(err, "save apnaJobs role");
//                     }
//                     //other_details
//                     try {
//                       details.job_title = user_details?.experiences[1]?.jobTitle || "";
//                       details.designation = user_details?.experiences[1]?.jobTitle || "";
//                       details.current_employer = user_details?.experiences[1]?.companyName || "";
//                     }
//                     catch (err) {
//                     }
//                     //Work history
//                     try {
//                       var work_histories = [];
//                       var work_history_element = user_details?.experiences;
//                       //index 0 consists of current organization
//                       if (work_history_element && work_history_element?.length)
//                         for (var i = 0; i < work_history_element?.length; i++) {
//                           var work_history = {};
//                           work_history.duration = {
//                             from: new Date(work_history_element[i].year),
//                             to: work_history_element[i]?.endYear ? new Date(work_history_element[i].endYear) : 'Present'
//                           };
//                           try {
//                             if (!work_history_element[i]?.endYear) {
//                               details.job_title = work_history_element[i]?.jobTitle;
//                               details.designation = work_history_element[i]?.jobTitle;
//                               details.current_employer = work_history_element[i]?.companyName;
//                             }
//                           }
//                           catch (err) {
//                           }
//                           work_history.employer = work_history_element[i]?.companyName;
//                           work_history.summary = work_history_element[i]?.summary || '';
//                           work_history.designation = work_history_element[i]?.jobTitle;
//                           work_histories.push(work_history);
//                         }
//                       details.work_history = work_histories;
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.work_history");
//                     }
//                     //skill exp
//                     try {
//                       let skill_experiences = [];
//                       let skill_experience_element = user_details?.skills;
//                       if (skill_experience_element && skill_experience_element?.length) {
//                         for (var i = 0; i < skill_experience_element?.length; i++) {
//                           var skill_experience = {};
//                           if (skill_experience_element[i])
//                             skill_experience.skill_name = stripHtmlTags(skill_experience_element[i]);
//                           skill_experience.last_used = "";
//                           skill_experience.experience = "";
//                           skill_experiences.push(skill_experience);
//                         }
//                       }
//                       details.skill_experience = skill_experiences;
//                       details.primary_skills = skill_experiences;
              
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.skill_experience");
//                     }
//                     //education
//                     try {
//                       let education = [];
//                       let education_element = user_details?.education;
//                       for (let i = 0; i < education_element?.length; i++) {
//                         let education_object = {};
//                         try {
//                           education_object.institution = education_element[i]?.instituteName;
//                           education_object.passing_year = education_element[i]?.endYear ? education_element[i].endYear : "still studying";
//                           education_object.specialization = education_element[i]?.specializationName;
//                           education_object.education = education_element[i]?.courseName;
//                           education_object.education_group = education_element[i]?.instituteName;
              
//                           education_object.educationType = education_element[i]?.degreeName
//                             ;
//                         }
//                         catch (err) {
              
//                         }
//                         if (education_object.institution)
//                           education.push(education_object);
              
//                       }
//                       details.education = education;
//                     } catch (err) {
//                       console.log(err, "save apnaJobs details.education");
//                     }
//                     //certifications
//                     try {
//                       details.certifications = user_details?.certifications || [];
//                     }
//                     catch (err) {
//                     }
//                     try {
//                       details.u_id = user_details?.userId || ""
//                     }
//                     catch (err) {
//                     }
//                     try {
//                       details.apnaJobs_response_response = user_details;
//                     }
//                     catch (Err) {
              
//                     }
                  
                    
//                 }
//             } catch (ex) { }

//             //primarySkills
//             try {
//                 if (document.querySelector('#profileContent.tab-content .ats_profile .main_content.ats_content .skills')) {
//                     let skillsElem = document.querySelectorAll('#profileContent.tab-content .ats_profile .main_content.ats_content .skills ul li.skill_tag');
//                     details.primary_skills = [];
//                     if (skillsElem && skillsElem.length) {
//                         for (let i = 0; i < skillsElem.length; i++) {
//                             let skillElem = skillsElem[i];
//                             if (skillElem.innerHTML) {
//                                 value = skillElem.innerHTML;
//                                 value = shared_ctrl.removeExtraChars(value);
//                                 value = value.trim();
//                                 details.primary_skills.push(value);
//                             }

//                         }
//                     }
//                 }
//             } catch (ex) {

//             }

//             //licences andcertifications

//             try {

//                 if (document.querySelectorAll('.licenses_certifications .section_content ol li') && document.querySelectorAll('.licenses_certifications .section_content ol li').length) {
//                     let cert_elements = document.querySelectorAll('.licenses_certifications .section_content ol li');
//                     details.certifications = []
//                     for (let i = 0; i < cert_elements.length; i++) {
//                         let cert_element = cert_elements[i];
//                         let tempCert = {
//                             name: '',
//                             company_name: '',
//                             issue_date: '',
//                             expiry_date: '',
//                         };
//                         if (cert_element.querySelector('.headline') && cert_element.querySelector('.headline').innerHTML) {
//                             let value = cert_element.querySelector('.headline').innerHTML;
//                             value = shared_ctrl.removeExtraChars(value);
//                             value = value.trim();
//                             tempCert.name = value;
//                         }
//                     }

//                 }
//             } catch (error) {

//             }
//             //profile link
//             // if (window.location.href) {
//             //     details.profileLink = window.location.href;
//             // }
//         }


//         response.status = true;
//         response.message = "XML Parsed";
//         response.error = false;
//         response.data = details;
//         res.status(200).json(response);

//     } catch (ex) {
//         console.log(ex);
//         response.status = false;
//         response.message = "something went wrong";
//         response.error = ex;
//         response.data = null;
//         res.status(500).json(response);
//     }
// }

ApnaJobsImporter.saveApplicantForApnaJobs = function (req, res) {
    var response = new shared_ctrl.response();
    var details = new shared_ctrl.portalimporterDetails();
    details.portal_id = 22;
    var tallintToken = req.body.session['token'];
    let user_details = shared_ctrl.jsonDeepParse(req.body.user_details);
    let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
    let portal_details = shared_ctrl.jsonDeepParse(req.body.portal_details);
    let client_details = shared_ctrl.jsonDeepParse(req.body.client_details);
    let selectedPortal = shared_ctrl.jsonDeepParse(req.body.selectedPortal);
    let save_url = req.body.save_url;
    console.log(req.body,"reqqqqqqqqqqqqqqqqqqq")
    if (selectedPortal.resumeSaveApiUrl) {
        save_url = selectedPortal.resumeSaveApiUrl;
        console.log(save_url)
    } try {
        if (user_details) {
            console.log(user_details)
            //name
            try {
              details.full_name = user_details?.fullName;
              try {
                details.first_name = user_details?.fullName.split(',')[0].split(' ')[0]
              } catch (error) {
              }
              try {
                details.last_name = user_details?.fullName.split(',')[0].split(' ').pop()
              } catch (error) {
              }
            }
            catch (err) {
            }
            //emailId
            try {
              details.email_id = user_details?.email[0] || "";
            }
            catch (err) { }
            try {
              details.alt_email_id = user_details?.email[1] || "";
            }
            catch (err) { }
            //mobile_number
            try {
              details.mobile_number = user_details?.phoneNumber[0] || ""
            }
            catch (err) { }
            try {
              if ((user_details?.phoneNumber[0]).toString().length == 12) {
                details.mobile_number = (user_details?.phoneNumber[0]).toString().slice(2, 12);
                details.isd = (user_details?.phoneNumber[0]).toString().slice(0, 2);
              }
            }
            catch (err) {
            }
            try {
              details.age = user_details?.age || ""
            } catch (error) {
            }
            //address
            try {
              details.address = user_details?.city || "";
            } catch (err) {
              console.log(err, "save apnaJobs details.address");
            }
            try {
              details.last_modified_date = user_details?.updatedOn || "";
            } catch (err) {
              console.log(err, "save apnaJobs details.last_modified_date");
            }
            //  experience
            try {
              details.experience = user_details?.totalExperienceInYears || "";
            }
            catch (err) {
              console.log(err, "save apnaJobs details.experience");
            }
            // Profile Pic
            try {
              details.profile_pic = user_details?.profilePhotoUrl || "";
            }
            catch (err) {
              console.log(err, "save apnaJobs details.profile_pic");
            }
            // Portal Id
            try {
              details.portal_id = 22;
            }
            catch (err) {
              console.log(err, "save apnaJobs details.portal_id");
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
              details.languages = user_details?.languages;
            } catch (err) {
              console.log(err, "save apnaJobs details.languages");
            }
            //Secondary Skills
            try {
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
              details.secondary_skills = user_details?.mayKnow;
            } catch (err) {
              console.log(err, "save apnaJobs details.secondary_skills");
            }
            //details.notice_period
            try {
              details.notice_period = user_details?.currentExperience?.notice || "";
            } catch (err) {
              console.log(err, "save apnaJobs details.notice_period");
            }
            // salary details
            try {
              details.present_salary = user_details?.currentSalary || "";
              try {
                details.present_salary_curr = user_details?.ctcType || "";
              }
              catch (Err) {
              }
              details.present_salary_period = "Lacs Per Annum";
            }
            catch (err) {
              console.log(err, "save apnaJobs details.salaryDetails");
            }
            //salary
            try {
              details.expected_salary = user_details?.expectedCtcValue || "";
              try {
                details.expected_salary_curr = user_details?.expectedCtcType || "";
              }
              catch (Err) {
              }
              details.expected_salary_period = "Lacs Per Annum";
            }
            catch (err) {
              console.log(err, "save apnaJobs details.salaryDetails");
            }
            //location
            try {
              details.location = user_details?.city || ""
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
            details.preferredLocations = user_details?.preferredLocation;
            } catch (err) {
              console.log(err, "save apna details.preferredLocation");
            }
            //DOB
            try {
              details.DOB = shared_ctrl.dateConverter(user_details?.birthDate)
            }
            catch (err) {
            }
            //gender
            try {
                details.gender = user_details?.gender;
            //   if (gender.toLowerCase() == "f") {
      
            //     details.gender = 'F'
            //   } else if (gender.toLowerCase() == "m") {
      
            //     details.gender = 'M'
            //   } else {
            //     details.gender = '';
            //   }
            }
            catch (err) {
              console.log(err, "save apnaJobs gender");
            }
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
              details.industry = user_details?.industries;
            } catch (err) {
              console.log(err, "save apna details.industry");
            }
            // functional_areas
            try {
              details.functional_areas = user_details?.farea || [];
            }
            catch (err) {
              console.log(err, "save apnaJobs functional_areas");
            }
            //role
            try {
              details.role = user_details?.experiences?.jobTitle | "";
            }
            catch (err) {
              console.log(err, "save apnaJobs role");
            }
            //other_details
            try {
              details.job_title = user_details?.experiences[1]?.jobTitle || "";
              details.designation = user_details?.experiences[1]?.jobTitle || "";
              details.current_employer = user_details?.experiences[1]?.companyName || "";
            }
            catch (err) {
            }
            //Work history
            try {
            //   var work_histories = [];
            //   var work_history_element = user_details?.experiences;
            //   //index 0 consists of current organization
            //   if (work_history_element && work_history_element?.length)
            //     for (var i = 0; i < work_history_element?.length; i++) {
            //       var work_history = {};
            //       work_history.duration = {
            //         from: new Date(work_history_element[i].year),
            //         to: work_history_element[i]?.endYear ? new Date(work_history_element[i].endYear) : 'Present'
            //       };
            //       try {
            //         if (!work_history_element[i]?.endYear) {
            //           details.job_title = work_history_element[i]?.jobTitle;
            //           details.designation = work_history_element[i]?.jobTitle;
            //           details.current_employer = work_history_element[i]?.companyName;
            //         }
            //       }
            //       catch (err) {
            //       }
            //       work_history.employer = work_history_element[i]?.companyName;
            //       work_history.summary = work_history_element[i]?.summary || '';
            //       work_history.designation = work_history_element[i]?.jobTitle;
            //       work_histories.push(work_history);
            //     }
              details.work_history = user_details?.experiences;
            } catch (err) {
              console.log(err, "save apnaJobs details.work_history");
            }
            //skill exp
            try {
              let skill_experiences = [];
              let skill_experience_element = user_details?.skills;
              if (skill_experience_element && skill_experience_element?.length) {
                for (var i = 0; i < skill_experience_element?.length; i++) {
                  var skill_experience = {};
                  if (skill_experience_element[i])
                    skill_experience.skill_name = stripHtmlTags(skill_experience_element[i]);
                  skill_experience.last_used = "";
                  skill_experience.experience = "";
                  skill_experiences.push(skill_experience);
                }
              }
              details.skill_experience = skill_experiences;
              details.primary_skills = skill_experiences;
      
            } catch (err) {
              console.log(err, "save apnaJobs details.skill_experience");
            }
            //education
            try {
            //   let education = [];
            //   let education_element = user_details?.education;
            //   for (let i = 0; i < education_element?.length; i++) {
            //     let education_object = {};
            //     try {
            //       education_object.institution = education_element[i]?.instituteName;
            //       education_object.passing_year = education_element[i]?.endYear ? education_element[i].endYear : "still studying";
            //       education_object.specialization = education_element[i]?.specializationName;
            //       education_object.education = education_element[i]?.courseName;
            //       education_object.education_group = education_element[i]?.instituteName;
      
            //       education_object.educationType = education_element[i]?.degreeName
            //         ;
            //     }
            //     catch (err) {
      
            //     }
            //     if (education_object.institution)
            //       education.push(education_object);
      
            //   }
              details.education = user_details?.education;
            } catch (err) {
              console.log(err, "save apnaJobs details.education");
            }
            //certifications
            try {
              details.certifications = user_details?.certifications || [];
            }
            catch (err) {
            }
            try {
              details.u_id = user_details?.userId || ""
            }
            catch (err) {
            }
            try {
              details.apnaJobs_response_response = user_details;
            }
            catch (Err) {
      
            }
          }

        console.log(details);
        try {
            details.attachment = resume_details?.base64;
            details.file_name = resume_details?.file_name;
            details.resume_extension = resume_details.file_name?.split('.').pop();
        }
        catch (err) {
            console.log('resume file error')
        }
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

function stripHtmlTags(str) {
  try {
      str = str.replace(/(<([^>]+)>)/gi, "");
      str = str.replace(/&nbsp;/gi, ' ');
      return str
  } catch (err) {
      return str;
  }
}

function convertyearToDecimal(str) {
    const regex = /(\d+)(?:\s*yr)?(?:\s*(\d+))?/;
    const matches = str.match(regex);

    if (matches) {
        const years = matches[1] ? parseInt(matches[1]) : 0;
        const months = matches[2] ? parseInt(matches[2]) : 0;
        const decimalValue = years + months / 12;
        return decimalValue.toFixed(1);
    }

    return null;
}



module.exports = ApnaJobsImporter;