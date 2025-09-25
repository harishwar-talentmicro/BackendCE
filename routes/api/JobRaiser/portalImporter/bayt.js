const jsdom = require("jsdom");

var shared_ctrl = require('./shared-ctrl')
var fs = require('fs');
const axios = require('axios');
var curr;
BaytImporter = {};


let ConvertedSalaryInfo = {
  AED: { conversion_rate: '0.27' },
  DZD: { conversion_rate: '0.00843519' },
  EGP: { conversion_rate: '0.02' },
  INR: { conversion_rate: '0.01' },
  JOD: { conversion_rate: '1.4134' },
  KWD: { conversion_rate: '3.24' },
  LBP: { conversion_rate: '0.000663807' },
  MAD: { conversion_rate: '0.09' },
  PKR: { conversion_rate: '0.00815583' },
  QAR: { conversion_rate: '0.27' },
  SAR: { conversion_rate: '0.26' },
  USD: { conversion_rate: '1' }
}

function getConvertedSalaryText(e) {
  console.log(e, "value of currr", curr)
  void 0 === curr && (curr = "USD");
  var n = e;
  return ConvertedSalaryInfo && ConvertedSalaryInfo[curr] && "USD" != curr && (n = e / ConvertedSalaryInfo[curr].conversion_rate),
    Number(Number(n).toFixed());
}


BaytImporter.checkApplicantExistsFromBayt = function (req, res, next) {
  let response = new shared_ctrl.response();
  const { JSDOM } = jsdom;
  let request = req.body;
  let document = new JSDOM(request.xml_string).window.document;
  var applicants = [];
  curr = req.body.preferredCurrency;
  let isJSON = req.body.isJSON;
  let list = req.body.list;
  let user_detail = req.body.session;
  let portal_details = req.body.selectedPortal;
  let requirementList = req.body.requirements || [];
  if (!(list && list.length)) {
    res.status(500).json('Oops! Something went wrong. Please try again later.');
    return;
  }
  for (let i = 0; i < list.length; i++) {
    var details = {};
    var user_details = list[i];
    if (user_details) {
      //name
      try {
        try {
          details.full_name = user_details?.['personal']?.firstName + " " + user_details?.['personal']?.lastName;
          details.first_name = user_details?.['personal']?.firstName;
        } catch (error) {
        }
        try {
          details.last_name = user_details?.['personal']?.lastName;
        } catch (error) {
        }
      }
      catch (err) {
      }
      try {
        details.age = user_details?.['personal']?.age || ""
        details.nationality = user_details?.['personal']?.nationality || ""
      } catch (error) {
      }
      //address
      try {
        details.address = user_details?.['residency']?.country || "";

      } catch (err) {
        console.log(err, "save bayt details.address");
      }
      try {
        details.last_modified_date = user_details?.['general']?.lastUpdate || "";
      } catch (err) {
        console.log(err, "save bayt details.last_modified_date");
      }
      //  experience
      try {
        try {

          let temp_experience = 0;
          const temp_element = user_details?.['experiences']?.total;
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

      }
      catch (err) {
        console.log(err, "save bayt details.experience");
      }
      // Profile Pic
      try {
        details.profile_pic = user_details?.['personal']?.photoUrl || "";
      }
      catch (err) {
        console.log(err, "save bayt details.profile_pic");
      }
      // Portal Id
      try {
        details.portal_id = 24;
      }
      catch (err) {
        console.log(err, "save bayt details.portal_id");
      }
      // salary details
      try {
        details.expected_salary = getConvertedSalaryText(user_details?.['targetJob']?.salary) || 0;
        details.expected_salary_curr = curr;
      }
      catch (err) {
        console.log(err, "save bayt details.salaryDetails");
      }

      //location
      try {
        details.location = (user_details?.['residency']?.city ? user_details?.['residency']?.city + "," : '') + user_details?.['residency']?.country || ""
      }
      catch (err) {
      }
      //gender
      try {
        let gender = user_details?.['personal']?.gender;
        if (gender.toLowerCase() == "female") {

          details.gender = 'F'
        } else if (gender.toLowerCase() == "male") {

          details.gender = 'M'
        } else {
          details.gender = '';
        }
      }
      catch (err) {
        console.log(err, "save bayt gender");
      }

      //role
      try {
        details.role = user_details?.experiences?.['last']?.title || "";
      }
      catch (err) {
        console.log(err, "save bayt role");
      }
      //other_details
      try {
        details.job_title = user_details?.experiences?.['last']?.title || "";
        details.designation = user_details?.experiences?.['last']?.title || "";
        details.current_employer = user_details?.experiences?.['last']?.employer || "";

      }
      catch (err) {
      }
      //Work history
      try {
        var work_histories = [];
        var work_history_element = user_details?.['experiences']?.last;
        var work_history = {};
        try {
          work_history.job_title = work_history_element?.title || '';
          work_history.current_employer = work_history_element?.employer || '';
        }
        catch (err) {
        }
        work_histories.push(work_history);
        details.work_history = work_histories || [];

      } catch (err) {
        console.log(err, "save bayt details.work_history");
      }
      //education
      try {
        let education = [];
        let education_element = user_details?.['education']?.last;
        console.log(education_element)
        education_object = {};
        try {
          education_object.institution = education_element.institute;
          education_object.education = education_element.last.major;
          education_object.education_group = education_element.institute;
        }
        catch (err) {

        }
        education.push(education_object);
        details.education = education || [];
      } catch (err) {
        console.log(err, "save bayt details.education");
      }
      //certifications
      try {
        details.certifications = user_details?.certifications || [];
      }
      catch (err) {
      }
      try {
        details.uid = user_details?.['personal']?.cvId || ""
      }
      catch (err) {
      }
      try {
        details.bayt_response = user_details;
        details.index = i;
      }
      catch (Err) {

      }
      applicants.push(details);
    }
  }

  console.log(applicants);
  let all_detail = {
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
      'Authorization': "Bearer " + user_detail?.token
    },
    data: all_detail
  };
  console.log(config);
  axios.request(config).then((response) => {
    console.log('axios response' + JSON.stringify(response.data));
    res.status(200).json({ data: response.data });
  }).catch((error) => {
    console.log(error);
    res.status(500).json(error)
  });


}


BaytImporter.saveApplicantForBayt = function (req, res) {
  var response = new shared_ctrl.response();
  var details = new shared_ctrl.portalimporterDetails();
  details.portal_id = 24;
  var tallintToken = req.body.session['token'];
  let user_details = shared_ctrl.jsonDeepParse(req.body.user_details);
  let resume_details = shared_ctrl.jsonDeepParse(req.body.attachment);
  let portal_details = shared_ctrl.jsonDeepParse(req.body.portal_details);
  let selectedPortal = shared_ctrl.jsonDeepParse(req.body.selectedPortal);
  let save_url = req.body.save_url;
  if (selectedPortal.resumeSaveApiUrl) {
    save_url = selectedPortal.resumeSaveApiUrl;
  } try {
    if (user_details) {
      //name
      try {
        details.full_name = user_details?.cvSections?.['personalInformationSection']?.name || ""
        try {
          details.first_name = user_details?.cvSections?.['personalInformationSection']?.name?.split(" ").slice(0, -1).join(" ") || "";
        } catch (error) {
        }
        try {
          details.last_name = user_details?.cvSections?.['personalInformationSection']?.name?.split(" ").pop() || "";
        } catch (error) {
        }
      }
      catch (err) {
      }
      // emailId
      try {
        details.email_id = user_details?.['cvSections']?.['busniessCard']?.contactData?.email || "";
      }
      catch (err) { }
      // try {
      //     details.alt_email_id = user_details?.['cvSections']?.['busniessCard']?.cellPhone || "";
      // }
      // catch (err) { }
      // mobile_number
      try {
        details.mobile_number = user_details?.['cvSections']?.['busniessCard']?.cellPhone.split('.')[1] || ""
        details.isd = user_details?.['cvSections']?.['busniessCard']?.cellPhone.split('.')[0] || ""
      }
      catch (err) { }
      try {
        details.nationality = user_details?.cvSections?.['personalInformationSection']?.nationality || ""
      }
      catch (err) { }
      try {
        details.age = user_details?.cvSections?.['personalInformationSection']?.age || ""
      } catch (error) {
      }
      //address
      try {
        details.address = user_details?.cvSections?.['personalInformationSection']?.residenceCountry || "";
      } catch (err) {
        console.log(err, "save bayt details.address");
      }
      try {
        details.last_modified_date = user_details?.lastCVUpdate || "";
      } catch (err) {
        console.log(err, "save bayt details.last_modified_date");
      }
      //  experience
      try {
        // details.experience = user_details?.['cvSections']?.['busniessCard']?.totalExperience || "";
        try {
          let temp_experience = 0;

          // Extract totalExperience string
          const totalExperience = user_details?.['cvSections']?.['busniessCard']?.totalExperience;

          if (totalExperience) {
            // Extract years and months using regex
            const yearMatch = totalExperience.match(/(\d+)\s*year/); // Match years
            const monthMatch = totalExperience.match(/(\d+)\s*month/); // Match months

            // Add years to temp_experience
            if (yearMatch) {
              temp_experience += parseInt(yearMatch[1], 10); // Convert years to number
            }

            // Add months converted to years to temp_experience
            if (monthMatch) {
              temp_experience += parseFloat((parseInt(monthMatch[1], 10) / 12).toFixed(2)); // Convert months to years
            }
          }

          // Assign temp_experience to details.experience if it's valid
          if (temp_experience) {
            details.experience = temp_experience; // Total experience in years (e.g., 6.25 for 6 years, 3 months)
          }

        } catch (error) {
        }
      }
      catch (err) {
        console.log(err, "save bayt details.experience");
      }
      // Profile Pic
      try {
        details.profile_pic = user_details?.['cvSections']?.['busniessCard']?.userPhoto || "";
      }
      catch (err) {
        console.log(err, "save bayt details.profile_pic");
      }
      // Portal Id
      try {
        details.portal_id = 24;
      }
      catch (err) {
        console.log(err, "save bayt details.portal_id");
      }
      // Languages
      try {
        details.languages = user_details?.cvSections?.['languagesSection'];
      } catch (err) {
        console.log(err, "save bayt details.languages");
      }
      //details.notice_period
      try {
        details.notice_period = user_details?.cvSections?.targetJobSection?.noticePeriod || "";
      } catch (err) {
        console.log(err, "save bayt details.notice_period");
      }
      // salary details
      // try {
      //     details.present_salary = user_details?.['targetJob']?.salary || "";
      //     details.present_salary_period = "Lacs Per Annum";
      // }
      // catch (err) {
      //     console.log(err, "save bayt details.salaryDetails");
      // }
      //salary
      try {
        // details.expected_salary =  user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue.split(' ')[1] ? user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue.split(' ')[1] : 0;
        const salaryValue = user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue;

        if (salaryValue && salaryValue !== "-") {
          // const [currency, amount] = salaryValue.split(' ');

          details.expected_salary = Number(salaryValue.split(' ')[1]) || 0;
          details.expected_salary_curr = salaryValue.split(' ')[0] || "KWD";
        } else {
          details.expected_salary = 0;
          details.expected_salary_curr = "KWD";
        }
        details.expected_salary_scale = "Per Annum"
        // console.log(Number(user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue.split(' ')[1]))
        // console.log((user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue.split(' ')[0]))
        // console.log((user_details?.cvSections?.['targetJobSection']?.convertedTrgtSalaryValue.split(' ')[1]))
      }
      catch (err) {
        console.log(err, "save bayt details.salaryDetails");
      }
      //location
      try {
        details.location = user_details?.['cvSections']?.['busniessCard']?.contactData?.location || ""
      }
      catch (err) {
      }
      // Preffered locations
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
        details.preferredLocations = user_details?.cvSections?.targetJobSection?.targetLocationAndVisa;
      } catch (err) {
        console.log(err, "save bayt details.preferredLocation");
      }
      // DOB
      try {
        details.DOB = shared_ctrl.dateFormat(user_details?.cvSections?.['personalInformationSection']?.birthdayAgeFormated);
      }
      catch (err) {
      }
      //gender
      try {
        let gender = user_details?.cvSections?.['personalInformationSection']?.gender || '';
        if (gender) {
          if (gender.toLowerCase() == "female") {

            details.gender = 'F'
          } else if (gender.toLowerCase() == "male") {

            details.gender = 'M'
          } else {
            details.gender = '';
          }
        }
      }
      catch (err) {
        console.log(err, "save bayt gender");
      }
      //role
      try {
        details.role = user_details?.cvSections?.['busniessCard']?.position || "";
      }
      catch (err) {
        console.log(err, "save bayt role");
      }
      //other_details
      try {
        details.job_title = user_details?.cvSections?.['busniessCard']?.position || "";
        details.designation = user_details?.cvSections?.['busniessCard']?.position || "";
        details.current_employer = user_details?.cvSections?.['busniessCard']?.companyName || "";
        details.marital_status = user_details?.cvSections?.['personalInformationSection']?.maritalStatus || ""
      }
      catch (err) {
      }
      //Work history
      try {
        var work_histories = [];
        var work_history_element = user_details?.['cvSections']?.['experienceSection']?.experienceData;
        //index 0 consists of current organization
        Object.entries(work_history_element).forEach(([key, value]) => {
          var work_history = {};
          work_history.duration = {
            from: new Date(value.startDate),
            to: value.endDate ? new Date(value.endDate) : 'Present'
          };
          try {
            if (!key?.endDate) {
              details.job_title = value?.jobRoleTxt || '';
              details.designation = value?.position || '';
              details.current_employer = value?.companyName || '';
            }
          }
          catch (err) {
          }
          work_history.employer = value?.companyName || '';
          details.job_title = value?.jobRoleTxt || '';
          work_history.summary = value?.description || '';
          work_history.designation = value?.position || '';
          work_histories.push(work_history);
        })
        details.work_history = work_histories || [];
      } catch (err) {
        console.log(err, "save bayt details.work_history");
      }
      //skill exp
      try {
        // let skill_experiences = [];
        // let skill_experience_element = user_details?.skills;
        // if (skill_experience_element && skill_experience_element?.length) {
        //     for (var i = 0; i < skill_experience_element?.length; i++) {
        //         var skill_experience = {};
        //         if (skill_experience_element[i])
        //             skill_experience.skill_name = stripHtmlTags(skill_experience_element[i]);
        //         skill_experience.last_used = "";
        //         skill_experience.experience = "";
        //         skill_experiences.push(skill_experience);
        //     }
        // }
        details.skill_experience = user_details?.['cvSections']?.skillsSection || [];
        // details.primary_skills = skill_experiences;

      } catch (err) {
        console.log(err, "save bayt details.skill_experience");
      }
      //education
      try {
        let education = [];
        let education_element = user_details?.['cvSections']?.educationSection?.educationData;
        Object.entries(education_element).forEach(([key, value]) => {
          let education_object = {};
          try {
            education_object.institution = value.institution;
            education_object.passing_year = value.endDate ? value.endDate : "still studying";
            education_object.specialization = value.major;
            education_object.education = value.degree;
            education_object.education_group = value.institution;
            education_object.educationType = value.degree;
          }
          catch (err) {

          }
          // if (education_object.institution)
          education.push(education_object);


        })
        details.education = education || [];
      } catch (err) {
        console.log(err, "save bayt details.education");
      }
      //certifications
      try {
        details.certifications = user_details?.certifications || [];
      }
      catch (err) {
      }
      try {
        details.uid = user_details?.cvId || ""
      }
      catch (err) {
      }
      try {
        details.bayt_response = user_details;
        details.index = i;
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
    try {
      if (req.body?.requirements) {
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





module.exports = BaytImporter;