const { FONT_SANS_16_BLACK } = require("jimp");
const jsdom = require("jsdom");
const { stripHtmlTags } = require("./shared-ctrl");
const axios = require('axios');
var shared_ctrl = require('./shared-ctrl')
shineImporter = {};

shineImporter.checkApplicantExistsFromShinePortalNew = function (req, res) {
    // var response = {
    //     status: false,
    //     message: "Invalid token",
    //     data: null,
    //     error: null
    // };
    // try {
    const { JSDOM } = jsdom;
    var xml_string = req.body.xml_string;
    var document = new JSDOM(xml_string).window.document;
    // var selected_candidates = req.body.selected_candidates;
    var is_select_all = req.body.is_select_all;
    var tempResume = {};
    var applicants = [];
    var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;
    var search_results = document.querySelectorAll(".cls_loop_chng")
    var selected_candidates = document.querySelectorAll(".cls_loop_chng")
    let user_details = req.body.session;
    let portal_details = req.body.selectedPortal;
    let requirementList = req.body.requirements || [];
    if (is_select_all) {
        if (search_results)
            for (var i = 0; i < search_results.length; i++) {
                console.log(i);
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
                    // last-modified
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML.split(':')[1]) {
                            var dateStr = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML.split(':')[1].split('|')[0].trim());
                            var lastModifiedDate = shared_ctrl.dateConverter(dateStr);
                        }
                    } catch (ex) {
                        console.log("lastModifiedDate", ex);
                    }


                    // job-title

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0].innerHTML) {

                            var tempJobTitle = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempJobTitle = tempJobTitle.split("-")[0].trim();
                            tempResume.job_title = tempJobTitle;
                        }
                    } catch (ex) {
                        console.log("shine job title", ex);
                    }

                    // current-employer

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0].innerHTML) {

                            var tempCurrentEmployer = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("Jtittle")[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempCurrentEmployer = tempCurrentEmployer.split("-")[1].trim();
                            tempResume.current_employer = tempCurrentEmployer;
                        }
                    } catch (ex) {
                        console.log("shine current employer", ex);
                    }

                    //  experience
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[0].innerHTML) {
                            var tempExperience = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[0].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.experience = parseFloat(tempExperience.split(" ")[0] + "." + Number(tempExperience.split(" ")[2] / 12).toFixed(2));
                        }
                    } catch (ex) {
                        console.log('shine experience ', ex)
                    }

                    // salary 

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1].innerHTML) {
                            var tempSalary = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.salary = tempSalary.split(" ")[1]
                        }
                    } catch (ex) {
                        console.log("shine salary", ex)
                    }

                    // location

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[2].innerHTML) {
                            var tempLocation = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("cc")[0].getElementsByTagName("li")[2].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.current_location = tempLocation;
                        }

                    } catch (ex) {
                        console.log("shine location", ex)
                    }


                    // previous employer

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0').length) {
                            var tempCompanyNo = document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0');

                            var tempCompanyList = [];
                            for (var s = 0; s < tempCompanyNo.length; s++) {
                                if (tempCompanyNo[s] && tempCompanyNo[s].innerHTML) {
                                    tempCompanyList.push(
                                        shared_ctrl.removeExtraChars(tempCompanyNo[s].innerHTML.replace(removeTagsRegex, '').trim().replace("|", ''))
                                    )
                                }
                            }
                            tempResume.previous_employer = tempCompanyList;
                        }

                    } catch (ex) {
                        console.log("shine previous employer", ex)
                    }

                    //education details 

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p').length) {

                            var tempEducation = document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p');

                            var tempEducationList = [];
                            for (var s = 0; s < tempEducation.length; s++) {
                                if (tempEducation[s] && tempEducation[s].innerHTML) {
                                    tempEducationList.push({
                                        qualification: shared_ctrl.removeExtraChars(tempEducation[s].innerHTML.replace(removeTagsRegex, '').trim().split("|")[0].trim()),
                                        institution: shared_ctrl.removeExtraChars(tempEducation[s].innerHTML.replace(removeTagsRegex, '').trim().split("|")[1].trim())
                                    })
                                }
                            }
                            tempResume.education = tempEducationList;
                        }
                    } catch (ex) {
                        console.log("shine education details", ex)
                    }


                    // skills 
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0].innerHTML) {
                            var tempSkills = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0].innerHTML.replace("...more", '')).split(',')

                            tempResume.skills = [];
                            for (var s = 0; s < tempSkills.length; s++) {
                                tempResume.skills.push(
                                    shared_ctrl.removeExtraChars(tempSkills[s].trim())
                                )
                            }

                        }
                    } catch (ex) {
                        console.log("shine skills", ex);
                    }

                    var uniqueID = "";
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] &&
                            document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile') && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile')[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile')[0].dataset && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile')[0].dataset.cid) {

                            // var url =document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile')[0].dataset.cid
                            // var urlObj = new URL(url);
                            // uniqueID = urlObj.searchParams.get('uid');
                            uniqueID = document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName('cls_circle_name cls_loadProfile')[0].dataset.cid;

                        }
                    } catch (err) {
                        console.log("uniqueID", err);
                    }

                    applicants.push({ first_name: first_name, last_name: last_name, portal_id: 4, index: i, last_modified_date: lastModifiedDate, job_title: tempResume.job_title, current_employer: tempResume.current_employer, previous_employer: tempResume.previous_employer, location: tempResume.current_location, education: tempResume.education, experience: tempResume.experience, salary: tempResume.salary, primary_skills: tempResume.skills, uid: uniqueID });
                    console.log('applicants1', applicants);

                }

            }
    } else {
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
                                        first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
                                    if (name.split(' ')[1]) {
                                        last_name = name.split(' ').splice(1).join(' ');
                                        last_name = shared_ctrl.removeExtraChars(last_name.trim());
                                    }
                                }
                            } catch (ex) {
                                console.log("first_name last_name", ex);
                            }
                        }
                    } catch (ex) {
                        console.log("name", ex);
                    }

                    // last-modified
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("active_date")[0] && document.getElementsByClassName('cls_loop_chng')[i].getElementsByClassName("active_date")[0].innerHTML &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("active_date")[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("active_date")[0].innerHTML.split(':')[1]) {
                            var dateStr = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("active_date")[0].innerHTML.split(':') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("active_date")[0].innerHTML.split(':')[1].split('|')[0].trim());
                            var lastModifiedDate = shared_ctrl.dateConverter(dateStr);
                        }
                    } catch (ex) {
                        console.log("lastModifiedDate", ex);
                    }


                    // job-title

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0].innerHTML) {

                            var tempJobTitle = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempJobTitle = tempJobTitle.split("-")[0].trim();
                            tempResume.job_title = tempJobTitle;
                        }
                    } catch (ex) {
                        console.log("shine job title", ex);
                    }

                    // current-employer

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0].innerHTML) {

                            var tempCurrentEmployer = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("Jtittle")[0].innerHTML.trim().replace(removeTagsRegex, ''));
                            tempCurrentEmployer = tempCurrentEmployer.split("-")[1].trim();
                            tempResume.current_employer = tempCurrentEmployer;
                        }
                    } catch (ex) {
                        console.log("shine current employer", ex);
                    }

                    //  experience
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[0].innerHTML) {
                            var tempExperience = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[0].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.experience = tempExperience.split(" ")[0] + "." + Number(tempExperience.split(" ")[2] / 12).toFixed(2);
                        }
                    } catch (ex) {
                        console.log('shine experience ', ex)
                    }

                    // salary 

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1].innerHTML) {
                            var tempSalary = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.salary = tempSalary.split(" ")[1]
                        }
                    } catch (ex) {
                        console.log("shine salary", ex)
                    }

                    // location

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0] &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li") &&
                            document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[1] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[2].innerHTML) {
                            var tempLocation = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cc")[0].getElementsByTagName("li")[2].innerHTML.replace(removeTagsRegex, '').trim());
                            tempResume.current_location = tempLocation;
                        }

                    } catch (ex) {
                        console.log("shine location", ex)
                    }


                    // previous employer

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0').length) {
                            var tempCompanyNo = document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap pcomp')[0].getElementsByClassName('fs-14 pb-0');

                            var tempCompanyList = [];
                            for (var s = 0; s < tempCompanyNo.length; s++) {
                                if (tempCompanyNo[s] && tempCompanyNo[s].innerHTML) {
                                    tempCompanyList.push(
                                        shared_ctrl.removeExtraChars(tempCompanyNo[s].innerHTML.replace(removeTagsRegex, '').trim().replace("|", ''))
                                    )
                                }
                            }
                            tempResume.previous_employer = tempCompanyList;
                        }

                    } catch (ex) {
                        console.log("shine previous employer", ex)
                    }

                    //education details 

                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[i] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p').length) {

                            var tempEducation = document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap educ')[0].getElementsByTagName('p');

                            var tempEducationList = [];
                            for (var s = 0; s < tempEducation.length; s++) {
                                if (tempEducation[s] && tempEducation[s].innerHTML) {
                                    tempEducationList.push({
                                        qualification: shared_ctrl.removeExtraChars(tempEducation[s].innerHTML.replace(removeTagsRegex, '').trim().split("|")[0].trim()),
                                        institution: shared_ctrl.removeExtraChars(tempEducation[s].innerHTML.replace(removeTagsRegex, '').trim().split("|")[1].trim())
                                    })
                                }
                            }
                            tempResume.education = tempEducationList;
                        }
                    } catch (ex) {
                        console.log("shine education details", ex)
                    }


                    // skills 
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0].innerHTML) {
                            var tempSkills = shared_ctrl.removeExtraChars(document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('company-detail')[0].getElementsByClassName('iconWrap skills')[0].innerHTML.replace("...more", '')).split(',')

                            tempResume.skills = [];
                            for (var s = 0; s < tempSkills.length; s++) {
                                tempResume.skills.push(
                                    shared_ctrl.removeExtraChars(tempSkills[s].trim())
                                )
                            }

                        }
                    } catch (ex) {
                        console.log("shine skills", ex);
                    }

                    var uniqueID;
                    try {
                        if (document.getElementsByClassName('cls_loop_chng') && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cls_circle_name cls_loadProfile") && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cls_circle_name cls_loadProfile")[0] && document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cls_circle_name cls_loadProfile")[0].dataset.cid) {
                            // var url = document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName("cls_circle_name cls_loadProfile")[0].href;
                            // console.log('url',url)
                            // var urlObj = new URL(url);

                            // uniqueID = urlObj.searchParams.get('uid');
                            uniqueID = document.getElementsByClassName('cls_loop_chng')[selected_candidates[i]].getElementsByClassName('cls_circle_name cls_loadProfile')[0].dataset.cid;
                            console.log('uniqueID', uniqueID);
                        }
                    } catch (err) {
                        console.log('uniqueID', err)
                    }

                    applicants.push({ first_name: first_name, last_name: last_name, portal_id: 4, index: i, last_modified_date: lastModifiedDate, job_title: tempResume.job_title, current_employer: tempResume.current_employer, location: tempResume.current_location, previous_employer: tempResume.previous_employer, education: tempResume.education, experience: tempResume.experience, salary: tempResume.salary, primary_skills: tempResume.skills, uid: uniqueID });
                    console.log('applicants', applicants);
                }
            }
            console.log('applicants2', applicants);
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


    //     console.log('applicants', applicants);

    //     response.status = true;
    //     response.message = "Parsed XML Successfully";
    //     response.error = null;
    //     response.data = applicants;
    //     res.status(200).json(response);
    // } catch (ex) {
    //     console.log(ex);
    //     response.status = false;
    //     response.message = "Something went wrong";
    //     response.error = ex;
    //     response.data = null;
    //     res.status(500).json(response);
    // }
};

shineImporter.saveApplicantsFromShineNew = function (req, res, next) {
    // var response = {
    //     status: false,
    //     message: "Invalid token",
    //     data: null,
    //     error: null
    // };
    var validationFlag = true;
    var portalId = 4; // Shine
    var cvSourceId = 4;
    var removeTagsRegex = /(<[^>]+>|<[^>]>|<\/[^>]>)/g;
    var details = {};
    var response = new shared_ctrl.response();
    var details = new shared_ctrl.portalimporterDetails();
    //   details.portal_id = 4;
    var tallintToken = req.body.session['token'];
    let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
    let save_url = req.body.save_url;
    // try {
    const { JSDOM } = jsdom;
    var document = new JSDOM(req.body.xml_string).window.document;
    // console.log('req.files.document',req.body.document);
    // first name
    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('name') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('name')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('name')[0].innerHTML) {
            // var tempName = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('name')[0].innerHTML.trim();
            var tempName = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('profile_name')[0].innerHTML.trim();
            if (tempName && tempName.trim(' ')) {
                var name = tempName.trim(' ');
                details.full_name = name;
                if (name && name.split(' ')[0])
                    details.first_name = shared_ctrl.removeExtraChars(name.split(' ')[0]);
                if (name && name.split(' ')[1]) {
                    details.last_name = shared_ctrl.removeExtraChars(name.split(' ').splice(1).join(' '));
                }
            }
        }
    } catch (ex) {
        console.log("save shine name", ex)
    }

    // email id

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[1] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[1].getElementsByTagName('em') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[1].getElementsByTagName('em')[0]) {
            var tempEmailId = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[1].getElementsByTagName('em');
            if (tempEmailId && tempEmailId[0] && tempEmailId[0].innerHTML) {
                try {
                    var emailid = tempEmailId[0].innerHTML.trim();
                    var regularExp = /[A-Za-z]+[A-Za-z0-9._]+@[A-Za-z]+\.[A-Za-z.]{2,5}/; // include /s in the end
                    //console.log(emailid);
                    // //console.log("using match all",matchAll(emailid,regularExp).toArray());
                    //console.log('match all here', regularExp.exec(emailid));
                    // res.status(200).json(regularExp.exec(emailid)[0]);
                    if (regularExp.exec(emailid) && regularExp.exec(emailid)[0] && regularExp.exec(emailid)[0].trim())
                        details.emailId = regularExp.exec(emailid)[0].trim();

                    details.emailId = shared_ctrl.removeExtraChars(details.emailId);
                } catch (ex) {
                    console.log("shine save emailId", ex)
                }
            }
        }
    } catch (ex) {
        console.log(ex)
    }

    // mobile number

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[0].getElementsByTagName('em') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[0].getElementsByTagName('em')[0]) {
            var tempMobileNumber = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_right')[0].getElementsByTagName('p')[0].getElementsByTagName('em');
            if (tempMobileNumber && tempMobileNumber[0] && tempMobileNumber[0].innerHTML) {
                var mobileNumber = tempMobileNumber[0].innerHTML;
                var regularExp = /(\d{7,10})/;
                // console.log("match all mobileNumber", matchAll(mobilenumber, regularExp).toArray());
                if (regularExp.exec(mobileNumber) && regularExp.exec(mobileNumber)[0] && regularExp.exec(mobileNumber)[0].trim())
                    details.mobile_number = shared_ctrl.removeExtraChars(regularExp.exec(mobileNumber)[0].trim());

                if (mobileNumber && mobileNumber.split("-") && mobileNumber.split("-")[0]) {
                    details.mobile_ISD = mobileNumber.split("-")[0];
                }
            }
        }
    } catch (ex) {
        console.log("shine save mobile no", ex)
    }

    // job Title

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[0].innerHTML) {
            var tempJobTitle = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[0].innerHTML;

            details.job_title = shared_ctrl.removeExtraChars(tempJobTitle.trim());

        }

    } catch (ex) {
        console.log("shine save job title", ex)
    }

    // employer

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[1].innerHTML) {
            var tempEmployer = document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByClassName('job-tittle')[0].getElementsByTagName('span')[1].innerHTML;

            details.current_employer = shared_ctrl.removeExtraChars(tempEmployer.trim().replace("- ", ''));
        }

    } catch (ex) {
        console.log("shine save employer", ex)
    }

    // present salary
    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('salary') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('salary')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('salary')[0].innerHTML) {
            var tempCTC = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('salary')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

            if (tempCTC && tempCTC.split(" ") && tempCTC.split(" ")[1])
                details.present_salary = tempCTC.split(" ")[1].trim();
            if (tempCTC && tempCTC.split(" ") && tempCTC.split(" ")[0])
                details.present_salary_curr = tempCTC.split(" ")[0].trim();
            if (tempCTC && tempCTC.split(" ") && tempCTC.split(" ")[2])
                details.present_salary_scale = tempCTC.split(" ")[2].trim();
        }
    } catch (ex) {
        console.log("shine save presentSalary", ex)
    }

    // experience

    try {
        details.experience = 0;
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('years') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('years')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('years')[0].innerHTML) {
            var tempExpStr = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('years')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());
            tempExp = 0;
            if (tempExpStr && tempExpStr.split(" ")[0]) {
                tempExp = Number(tempExpStr.split(" ")[0])
            }
            if (tempExpStr.split(" ")[2] && Number(tempExpStr.split(" ")[2] / 12).toFixed(2)) {
                tempExp = tempExp + "." + Number(tempExpStr.split(" ")[2] / 12).toFixed(2).split(".")[1];
            }
            if (tempExp) {
                details.experience = parseFloat(tempExp);
            } else {
                details.experience = 0;
            }
        }
    } catch (ex) {
        console.log('shine save experience', ex)
    }

    // present location

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('location') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('location')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('location')[0].innerHTML) {

            var tempLocation = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_left')[0].getElementsByTagName('ul')[0].getElementsByClassName('location')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

            details.location = tempLocation;
        }
    } catch (ex) {
        console.log('shine save presentLocation', ex)
    }

    // notice period

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[0].innerHTML) {

            var tempNoticePeriod = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[0].innerHTML.replace(removeTagsRegex, "").replace('Notice Period', "").trim());

            details.notice_period = tempNoticePeriod;

            if (details.notice_period.split(' ').length && details.notice_period.split(' ')[1] && details.notice_period.split(' ')[1].trim()) {

                if (details.notice_period.toUpperCase() == 'IMMEDIATELY') {
                    details.notice_period = 15;
                } else if (details.notice_period.toUpperCase().indexOf('DAYS') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('DAYS')[0].trim() * 1;
                } else if (details.notice_period.toUpperCase().indexOf('MONTH') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('MONTH')[0].trim() * 30;
                } else if (details.notice_period.toUpperCase().indexOf('MONTHS') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('MONTHS')[0].trim() * 30;
                } else if (details.notice_period.toUpperCase().indexOf('WEEK') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('WEEK')[0].trim() * 7;
                } else if (details.notice_period.toUpperCase().indexOf('WEEKS') > -1) {
                    details.notice_period = details.notice_period.toUpperCase().split('WEEKS')[0].trim() * 7;
                } else {
                    details.notice_period = -1;
                }
            } else {
                details.notice_period = -1;
            }

        }
    } catch (ex) {
        console.log("shine save noticePeriod", ex)
    }

    // preferred location 

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[1] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[1] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[1].innerHTML) {

            var tempPrefLocation = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('notice-period')[1].innerHTML.replace(removeTagsRegex, "").replace('Preferred location', "").trim());
            if (tempPrefLocation && tempPrefLocation.split(",") && tempPrefLocation.split(",").length) {
                details.pref_locations = [];
                for (var s = 0; s < tempPrefLocation.split(",").length; s++) {
                    details.pref_locations.push(tempPrefLocation.split(',')[s]);
                }
            }
        }
    } catch (ex) {
        console.log('shine save prefLocations', ex)
    }

    // last modified date

    try {
        if (document && document.getElementsByClassName('profile_top') && document.getElementsByClassName('profile_top')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base')[0].getElementsByTagName('i') && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base')[0].getElementsByTagName('i')[0] && document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base')[0].getElementsByTagName('i')[0].innerHTML) {

            var tempLastModifiedDate = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile_top')[0].getElementsByClassName('profile_base')[0].getElementsByClassName('profile_right_base')[0].getElementsByTagName('i')[0].innerHTML.replace(removeTagsRegex, "").trim());

            details.last_modified_date = tempLastModifiedDate.split('|')[0].replace('Active:', '').trim();
        }
    } catch (ex) {
        console.log('shine save lastModifiedDate', ex)
    }

    // Employement History
    details.work_history = [];

    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {
                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());

                    if (tempSection == "Experience".toUpperCase()) {

                        var tempEmployementHis = document.getElementsByClassName('profile')[p].getElementsByClassName('experience_box');

                        for (var s = 0; s < tempEmployementHis.length; s++) {
                            var tempEmpHis = {};

                            // Employement History company name

                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('sub-tittle') && tempEmployementHis[s].getElementsByClassName('sub-tittle')[0] && tempEmployementHis[s].getElementsByClassName('sub-tittle')[0].innerHTML) {
                                    tempEmpHis.employer = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('sub-tittle')[0].innerHTML.replace(removeTagsRegex, '').trim());
                                }
                            } catch (ex) {
                                console.log("shine save employment History-employer", ex);
                            }

                            // Employement History designation
                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByTagName('h3') && tempEmployementHis[s].getElementsByTagName('h3')[0] && tempEmployementHis[s].getElementsByTagName('h3')[0].innerHTML) {
                                    tempEmpHis.job_title = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByTagName('h3')[0].innerHTML.replace(removeTagsRegex, '').trim());
                                }
                            } catch (ex) {
                                console.log("shine save employment History-jobTitle", ex)
                            }
                            // Employement History duration

                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[1] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[1].innerHTML) {
                                    var tempDuration = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[1].innerHTML.replace(removeTagsRegex, '').trim());

                                    if (tempDuration.split("-") && tempDuration.split("-")[0]) {
                                        tempEmpHis.experience = tempDuration.split("-")[0].trim()[0]
                                    } else {
                                        tempEmpHis.experience = "0"
                                    }
                                    if (tempDuration.split("-") && tempDuration.split("-")[1]) {
                                        tempEmpHis.experience += "." + tempDuration.split("-")[1].trim()[0]
                                    }
                                    tempEmpHis.experience = parseFloat(tempEmpHis.experience);
                                }
                            } catch (ex) {
                                console.log("shine save employment History-duration", ex);
                            }


                            // Employement History functionalAreas

                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right") && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span')[0].innerHTML) {
                                    var tempFunctionArea = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    tempEmpHis.functional_areas = tempFunctionArea.split(',');
                                }
                            } catch (ex) {
                                console.log("shine save employment History-functionalAreas", ex);
                            }

                            // Employement History industry

                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right") && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[0].getElementsByTagName('span')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[1].getElementsByTagName('span')[0].innerHTML) {
                                    var tempIndustry = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName("w-70 float-right")[0].getElementsByClassName('single-list')[0].getElementsByTagName('li')[1].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    tempEmpHis.industry = tempIndustry.split(',');
                                }
                            } catch (ex) {
                                console.log("shine save employment History-industry", ex);
                            }

                            // Employement History To - From 
                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0].innerHTML) {
                                    var period = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0].innerHTML.replace(removeTagsRegex, ''));
                                    tempEmpHis.duration = {}
                                    if (period && period.split('-') && period.split('-')[0]) {
                                        let from = period.split('-')[0];
                                        let month = from.split(' ')[0];
                                        let year = from.split(' ')[1];
                                        tempEmpHis.duration.from = shared_ctrl.dateFormat(month + ' 01 ' + year);
                                    }
                                    if (period && period.split('-') && period.split('-')[1]) {
                                        let from = period.split('-')[1];
                                        let month = from.split(' ')[0];
                                        let year = from.split(' ')[1];
                                        tempEmpHis.duration.to = period.split('-')[1] == 'Present' ? period.split('-')[1] : shared_ctrl.dateFormat(month + ' 01 ' + year);
                                    }
                                }
                            } catch (ex) {
                                console.log("shine save employment History- To - From", ex);
                            }

                            details.work_history.push(tempEmpHis);
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log('shine save work_history', ex);
    }

    // Projects
    details.projects = [];
    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {
                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());

                    if (tempSection == "Projects".toUpperCase()) {

                        var tempEmployementHis = document.getElementsByClassName('profile')[p].getElementsByClassName('experience_box');

                        for (var s = 0; s < tempEmployementHis.length; s++) {
                            var tempEmpHis = {};
                            // Employement History designation
                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByTagName('h3') && tempEmployementHis[s].getElementsByTagName('h3')[0] && tempEmployementHis[s].getElementsByTagName('h3')[0].innerHTML) {
                                    tempEmpHis.projectName = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByTagName('h3')[0].innerHTML.replace(removeTagsRegex, '').trim());
                                }
                            } catch (ex) {
                                console.log("shine save Project title", ex)
                            }
                            try {
                                if (tempEmployementHis && tempEmployementHis[s] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p') && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0] && tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0].innerHTML) {
                                    tempEmpHis.year = shared_ctrl.removeExtraChars(tempEmployementHis[s].getElementsByClassName('clearfix mt-10')[0].getElementsByClassName('w-30 float-left')[0].getElementsByTagName('p')[0].innerHTML.replace(removeTagsRegex, '').trim());
                                }
                            } catch (ex) {
                                console.log("shine save Project description", ex)
                            }
                            details.projects.push(tempEmpHis);
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log('shine save work_history', ex);
    }



    //--------education details-----
    details.education = [];

    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {

                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());
                    if (tempSection == "Education".toUpperCase()) {
                        var tempEducationDetails = document.getElementsByClassName('profile')[p].getElementsByClassName('education')[0].getElementsByTagName('li');

                        for (var s = 0; s < tempEducationDetails.length; s++) {
                            var tempEducation = {};
                            try {
                                if (tempEducationDetails && tempEducationDetails[s] && tempEducationDetails[s].getElementsByTagName('h3') && tempEducationDetails[s].getElementsByTagName('h3')[0] && tempEducationDetails[s].getElementsByTagName('h3')[0].innerHTML) {

                                    var tempQualification = shared_ctrl.removeExtraChars(tempEducationDetails[s].getElementsByTagName('h3')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());
                                    tempEducation.education = tempQualification.split('|')[0].trim();
                                    tempEducation.specialization = tempQualification.split('|')[1];
                                }

                            } catch (ex) {
                                console.log("shine save educcation details qualification - specialization", ex)
                            }

                            try {
                                if (tempEducationDetails && tempEducationDetails[s] && tempEducationDetails[s].getElementsByClassName('sub-tittle pb-5') && tempEducationDetails[s].getElementsByClassName('sub-tittle pb-5')[0] && tempEducationDetails[s].getElementsByClassName('sub-tittle pb-5')[0].innerHTML) {

                                    var tempInstituteName = shared_ctrl.removeExtraChars(tempEducationDetails[s].getElementsByClassName('sub-tittle pb-5')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());
                                    tempEducation.institution = tempInstituteName.trim();
                                }

                            } catch (ex) {
                                console.log("shine save educcation details institution", ex)
                            }

                            try {
                                if (tempEducationDetails && tempEducationDetails[s] && tempEducationDetails[s].getElementsByClassName('pb-0 fs-13') && tempEducationDetails[s].getElementsByClassName('pb-0 fs-13')[0] && tempEducationDetails[s].getElementsByClassName('pb-0 fs-13')[0].innerHTML) {

                                    var tempType = shared_ctrl.removeExtraChars(tempEducationDetails[s].getElementsByClassName('pb-0 fs-13')[0].innerHTML?.trim()?.replace(removeTagsRegex, '')?.trim());
                                    tempEducation.type = tempType?.split('-')[0]?.trim();
                                    tempEducation.passing_year = tempType?.split('-')[1]?.trim();
                                }
                            } catch (ex) {
                                console.log("shine save educcation details passing_year - type", ex)
                            }
                            details.education.push(tempEducation);
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log("Shine save education details", ex);
    }

    // ---primary Skills----

    // try {
    //     if (document && document.getElementsByClassName('profile')) {

    //         for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
    //             if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {

    //                 var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());
    //                 if (tempSection == "Skills".toUpperCase()) {
    //                     if (document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn') && document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn')[0]) {

    //                         var tempSkillsList = document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn');
    //                         for (var s = 0; s < tempSkillsList.length; s++) {

    //                             try {

    //                                 if (tempSkillsList && tempSkillsList[s] && tempSkillsList[s].innerHTML) {
    //                                     var tempSkill = shared_ctrl.removeExtraChars(tempSkillsList[s].innerHTML.trim().replace(removeTagsRegex, '').trim());
    //                                     details.primary_skills.push(
    //                                         tempSkill.trim()
    //                                     );
    //                                 }
    //                             } catch (ex) {
    //                                 console.log("shine skills", ex)
    //                             }
    //                         }
    //                     }
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // } catch (ex) {
    //     console.log("Shine save skills", ex);
    // }
    details.primary_skills = [];
    try {
        if (document && document.getElementsByClassName('profile') && document.querySelectorAll(".profileData_skillsTxt")?.length) {
            var skill = document.querySelectorAll(".profileData_skillsTxt");
            for (var p = 0; p < skill?.length; p++) {
                try {
                    var tempSkill = shared_ctrl.removeExtraChars(skill[p].innerHTML.trim().replace(removeTagsRegex, '').trim());
                    details.primary_skills.push(
                        tempSkill.trim()
                    );
                }
                catch (ex) {
                    console.log("shine skills", ex)
                }
            }
        }
    } catch (ex) {
        console.log("Shine save skills", ex);
    }
    // social skills
    details.social_skills = [];
    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {

                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());
                    if (tempSection == "Social Skills".toUpperCase()) {
                        if (document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn') && document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn')[0]) {

                            var tempSkillsList = document.getElementsByClassName('profile')[p].getElementsByClassName('pro_btn');
                            for (var s = 0; s < tempSkillsList.length; s++) {

                                try {
                                    if (tempSkillsList && tempSkillsList[s] && tempSkillsList[s].innerHTML) {
                                        var tempSkill = shared_ctrl.removeExtraChars(tempSkillsList[s].innerHTML.trim().replace(removeTagsRegex, '').trim());
                                        details.social_skills.push(
                                            tempSkill.trim()
                                        );
                                    }
                                } catch (ex) {
                                    console.log("shine Social Skills", ex)
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log("Shine save skills", ex);
    }

    // More details

    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {

                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());

                    if (tempSection == "More details".toUpperCase()) {

                        if (document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByClassName('half-list') && document.getElementsByClassName('profile')[p].getElementsByClassName('half-list')[0] && document.getElementsByClassName('profile')[p].getElementsByClassName('half-list')[0].getElementsByTagName('li') && document.getElementsByClassName('profile')[p].getElementsByClassName('half-list')[0].getElementsByTagName('li').length) {

                            var tempMoreDetails = document.getElementsByClassName('profile')[p].getElementsByClassName('half-list')[0].getElementsByTagName('li');

                            // Team Handled
                            try {
                                if (tempMoreDetails && tempMoreDetails[0] && tempMoreDetails[0].getElementsByTagName('span') && tempMoreDetails[0].getElementsByTagName('span')[0].innerHTML) {
                                    details.team_handled = shared_ctrl.removeExtraChars(tempMoreDetails[0].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                                }
                            } catch (ex) {
                                console.log('save shine team handled', ex);
                            }
                            // Date of Birth
                            try {
                                if (tempMoreDetails && tempMoreDetails[1] && tempMoreDetails[1].getElementsByTagName('span') && tempMoreDetails[1].getElementsByTagName('span')[0].innerHTML) {
                                    var tempDOB = shared_ctrl.removeExtraChars(tempMoreDetails[1].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                                    details.DOB = shared_ctrl.dateConverter(tempDOB) || null;
                                }
                            } catch (ex) {
                                console.log('save shine DOB', ex);
                            }

                            // Functional Areas
                            try {
                                if (tempMoreDetails && tempMoreDetails[2] && tempMoreDetails[2].getElementsByTagName('span') && tempMoreDetails[2].getElementsByTagName('span')[0].innerHTML) {
                                    var tempFunctionArea = shared_ctrl.removeExtraChars(tempMoreDetails[2].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, ''));

                                    details.functional_areas = tempFunctionArea.split(',');

                                }
                            } catch (ex) {
                                console.log('save shine  functionalAreas', ex);
                            }

                            // Gender
                            try {
                                if (tempMoreDetails && tempMoreDetails[3] && tempMoreDetails[3].getElementsByTagName('span') && tempMoreDetails[3].getElementsByTagName('span')[0].innerHTML) {
                                    var tempGender = shared_ctrl.removeExtraChars(tempMoreDetails[3].getElementsByTagName('span')[0].innerHTML.trim().replace(removeTagsRegex, ''));
                                    if (tempGender && tempGender.toUpperCase() == "MALE") {
                                        // if (isTallint)
                                        details.gender = 'M';
                                        // else
                                        //     details.gender = 1;
                                    } else if (tempGender && tempGender.toUpperCase() == "FEMALE") {
                                        // if (isTallint)
                                        details.gender = 'F';
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
                                console.log('save shine  gender', ex);
                            }
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log("Shine save skills", ex);
    }

    // desired Job Details 
    details.desired_job_details = {}
    try {
        if (document && document.getElementsByClassName('profile')) {

            for (var p = 0; p < document.getElementsByClassName('profile').length; p++) {
                if (document.getElementsByClassName('profile') && document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByTagName('h2') && document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0]) {

                    var tempSection = shared_ctrl.removeExtraChars(document.getElementsByClassName('profile')[p].getElementsByTagName('h2')[0].innerHTML.trim().replace(removeTagsRegex, '').trim().toUpperCase());

                    if (tempSection == "Desired job details".toUpperCase()) {

                        if (document.getElementsByClassName('profile')[p] && document.getElementsByClassName('profile')[p].getElementsByClassName('single-list') && document.getElementsByClassName('profile')[p].getElementsByClassName('single-list')[0] && document.getElementsByClassName('profile')[p].getElementsByClassName('single-list')[0].getElementsByTagName('li') && document.getElementsByClassName('profile')[p].getElementsByClassName('single-list')[0].getElementsByTagName('li').length) {

                            var tempDesiredJobDetails = document.getElementsByClassName('profile')[p].getElementsByClassName('single-list')[0].getElementsByTagName('li');

                            // desired job location
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[0] && tempDesiredJobDetails[0].getElementsByTagName('em') && tempDesiredJobDetails[0].getElementsByTagName('em')[0] && tempDesiredJobDetails[0].getElementsByTagName('em')[0].innerHTML) {
                                    var tempJobLocation = shared_ctrl.removeExtraChars(tempDesiredJobDetails[0].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    if (tempJobLocation && tempJobLocation.split(',') && tempJobLocation.split(',').length) {
                                        details.desired_job_details.job_location = [];
                                        for (var s = 0; s < tempJobLocation.split(',').length; s++) {
                                            details.desired_job_details.job_location.push(tempJobLocation.split(',')[s].trim())
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log('Shine save Desired Job location', ex);
                            }

                            // desired functional areas
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[1] && tempDesiredJobDetails[0].getElementsByTagName('em') && tempDesiredJobDetails[1].getElementsByTagName('em')[0] && tempDesiredJobDetails[1].getElementsByTagName('em')[0].innerHTML) {
                                    var tempFunctionArea = shared_ctrl.removeExtraChars(tempDesiredJobDetails[1].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    if (tempFunctionArea && tempFunctionArea.split(',') && tempFunctionArea.split(',').length) {
                                        details.desired_job_details.functional_areas = [];
                                        for (var s = 0; s < tempFunctionArea.split(',').length; s++) {
                                            details.desired_job_details.functional_areas.push(tempFunctionArea.split(',')[s].trim());
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log('Shine save Desired functionalAreas', ex);
                            }

                            // desired industry
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[2] && tempDesiredJobDetails[2].getElementsByTagName('em') && tempDesiredJobDetails[2].getElementsByTagName('em')[0] && tempDesiredJobDetails[2].getElementsByTagName('em')[0].innerHTML) {
                                    var tempIndustry = shared_ctrl.removeExtraChars(tempDesiredJobDetails[2].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    if (tempIndustry && tempIndustry.split(',') && tempIndustry.split(',').length) {
                                        details.desired_job_details.industry = [];
                                        for (var s = 0; s < tempIndustry.split(',').length; s++) {
                                            details.desired_job_details.industry.push(tempIndustry.split(',')[s].trim());
                                        }
                                    }
                                }
                            } catch (ex) {
                                console.log('Shine save Desired functionalAreas', ex);
                            }
                            // Desired job type
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[3] && tempDesiredJobDetails[2].getElementsByTagName('em') && tempDesiredJobDetails[3].getElementsByTagName('em')[0] && tempDesiredJobDetails[3].getElementsByTagName('em')[0].innerHTML) {
                                    var tempJobType = shared_ctrl.removeExtraChars(tempDesiredJobDetails[3].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    details.desired_job_details.job_type = tempJobType.trim();

                                }
                            } catch (ex) {
                                console.log('Shine save Desired job Type', ex);
                            }

                            // Desired shift type
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[4] && tempDesiredJobDetails[4].getElementsByTagName('em') && tempDesiredJobDetails[4].getElementsByTagName('em')[0] && tempDesiredJobDetails[4].getElementsByTagName('em')[0].innerHTML) {
                                    var tempShiftType = shared_ctrl.removeExtraChars(tempDesiredJobDetails[4].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    details.desired_job_details.shift_type = tempShiftType.trim();

                                }
                            } catch (ex) {
                                console.log('Shine save Desired job Type', ex);
                            }

                            // Desired expected salary
                            try {
                                if (tempDesiredJobDetails && tempDesiredJobDetails[5] && tempDesiredJobDetails[4].getElementsByTagName('em') && tempDesiredJobDetails[5].getElementsByTagName('em')[0] && tempDesiredJobDetails[5].getElementsByTagName('em')[0].innerHTML) {
                                    var tempExpected = shared_ctrl.removeExtraChars(tempDesiredJobDetails[5].getElementsByTagName('em')[0].innerHTML.trim().replace(removeTagsRegex, '').trim());

                                    details.desired_job_details.expected_salary = tempExpected.trim();

                                }
                            } catch (ex) {
                                console.log('Shine save Desired job Type', ex);
                            }
                        }
                        break;
                    }
                }
            }
        }
    } catch (ex) {
        console.log("shine Desired job details", ex);
    }

    details.uid = ''
    try {
        if (document.getElementsByClassName('profile-date') && document.getElementsByClassName('profile-date')[0] && document.getElementsByClassName('profile-date')[0].getElementsByTagName('div') && document.getElementsByClassName('profile-date')[0].getElementsByTagName('div')[0] && document.getElementsByClassName('profile-date')[0].getElementsByTagName('div')[0].id) {
            var tempUid = document.getElementsByClassName('profile-date')[0].getElementsByTagName('div')[0].id;
            details.uid = tempUid.trim().replace('id_profile_shine_', "").trim();
        }
    } catch (ex) {
        console.log('shine unique ID', ex);
    }

    details.summary = ''
    try {
        if (document.querySelector(".experience_box> p")) {
            var tempSummary = document.querySelector(".experience_box> p");
            // details.summary = tempSummary.innerHTML.trim();
            details.summary = tempSummary.textContent.trim();
        }
    } catch (ex) {
        console.log('shine unique ID', ex);
    }
    details.portal_id = portalId;
    // console.timeEnd("Completed with parsing");
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

    try {
        details.attachment = resume_details?.base64;
        details.file_name = resume_details?.file_name;
        details.resume_extension = resume_details.file_name?.split('.').pop();
    }
    catch (err) {
        console.log('resume file error')
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
    //     console.log(details)
    //     response.status = true;
    //     response.message = "XML Parsed";
    //     response.error = false;
    //     response.data = details;
    //     res.status(200).json(response);

    // } catch (ex) {
    //     console.log(ex);
    //     response.status = false;
    //     response.message = "Something went wrong";
    //     response.error = ex;
    //     response.data = null;
    //     res.status(500).json(response);
    // }
};

module.exports = shineImporter;

