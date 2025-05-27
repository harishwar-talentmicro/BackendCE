var moment = require('moment');
const { matches } = require('underscore');

var shared_ctrl = {};
//Variables
shared_ctrl.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
shared_ctrl.months_full = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
shared_ctrl.secretKey = 'T@MiCr097124!iCR';


//Classes
shared_ctrl.response = class {
    status = false;
    message = "Invalid token"
    data = null;
    error = null;
}

shared_ctrl.portalimporterDetails = class {
    DOB = "";
    address = "";
    current_employer = "";
    education = []; // {education : 'BE/BTECH', institution: "cLG NAME", passing_year: "2019", specialization: "cse", University:"VTU", education_group: "UG/PG"},
    email_id = "";
    alt_email_id = '';
    experience = "";
    full_name = "";
    first_name = '';
    last_name = '';
    gender = "";
    industry = [];
    index = "";
    job_title = "";
    last_modified_date = "";
    location = '';
    mobile_number = '';
    alt_mobile_number = '';
    isd = "";
    profile_link = '';
    notice_period = '';
    portal_id = '';
    pref_locations = [];
    present_salary = "";
    present_salary_curr = "";
    present_salary_period = "";
    present_salary_scale = "";
    expected_salary = '';
    expected_salary_curr = "";
    expected_salary_period = "";
    expected_salary_scale = "";
    primary_skills = [];
    profile_pic = "";
    resume_document = "";
    resume_extension = "";
    resume_mimeType = "";
    resume_text = '';
    skill_experience = []; //{skill_name : "",last_used :"", experience:""}
    requirements = [];
    uid = '';
    nationality = '';
    age = '';
    work_history = []; //{employer : 'BE/BTECH', institution: "cLG NAME", passing_year: "2019", specialization: "cse", University:"VTU", education_group: "UG/PG"}
    secondary_skills = [];
    languages = [];
    summary = [];
    recommendations = [];
    certifications = [];
    projects = [];
    courses = [];
    industry = '';
    functional_areas = '';
    role = '';
    job_type = '';
    employment_status = ''

}

shared_ctrl.convertToYears = function (str) {
    try {
        str = str.toLowerCase();
        const regex = /(\d+)\s*years?\s*(\d+)\s*months?/i;
        const match = str.match(regex);

        if (match) {
            const years = parseInt(match[1]);
            const months = parseInt(match[2]);
            return years + months / 12;
        } else if (str.includes("year")) {
            const years = parseInt(str);
            return years;
        } else if (str.includes("month")) {
            const months = parseInt(str);
            return months / 12;
        }

        return 0;
    }
    catch (err) {

    }

}


shared_ctrl.duplicateDetails = class {
    first_name = '';
    last_name = '';
    portal_id = '';
    index = '';
    education = [];
    specialization = '';
    primary_skills = [];
    current_employer = '';
    job_title = '';
    experience = '';
    location = '';
    nationality = '';
    last_modified_date = '';
    uid = '';
    industry = ''
    functional_areas = '';
}


//Functions
shared_ctrl.removeUnicodeChars = function (param) {
    param = param.replace(/[^\x00-\x7F]/g, "");
    return param;
}

shared_ctrl.convertDateArrToDate = function (arr, ddmmexchangeflag) {
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

shared_ctrl.processIntegers = function (param) {
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

shared_ctrl.removeExtraChars = function (params) {
    if (params && typeof (params) == 'string' && params != '') {
        params = shared_ctrl.stripHtmlTags(params)
        params = params.replace(/<[a-zA-Z0-9=|-|'|" \\|\/|_;&():#\+\.,@\!%$\^\*]*>/g, '');
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
        params = params.replace(/&amp;/g, '&');
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

shared_ctrl.getParameterByName = function (name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
shared_ctrl.extractText = function (element) {
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

shared_ctrl.processIntegers = function (param) {
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

shared_ctrl.dateConverter = function (param) {
    param = shared_ctrl.removeExtraChars(param);
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
        if (shared_ctrl.months.indexOf(arr[1]) > -1)
            arr[1] = shared_ctrl.months.indexOf(arr[1]) + 1;
        else if (shared_ctrl.months_full.indexOf(arr[1]) > -1)
            arr[1] = shared_ctrl.months_full.indexOf(arr[1]) + 1;
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

shared_ctrl.setFileType = function (mimeType) {
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

shared_ctrl.stripHtmlTags = function (str) {
    try {
        str = str.replace(/(<([^>]+)>)/gi, "");
        str = str.replace(/&nbsp;/gi, ' ');
        return str
    } catch (err) {
        return str;
    }
}

shared_ctrl.sendMail = (portal_name, html_body) => {

    try {
        var mail = {
            from: 'noreply@tallite.com',
            to: ['arun.gavimath@talentmicro.com', 'praphul@talentmicro.com'],
            subject: 'JobPortal Exception from' + portal_name,
            html: JSON.stringify(html_body) // html body
        };
        const nodemailer = require('nodemailer');
        let transport = nodemailer.createTransport({
            host: 'email-smtp.us-east-1.amazonaws.com',
            port: 587,
            // ignoreTLS: secure || false,
            secure: secure || false,
            auth: {
                user: 'AKIAYKNZIJSI7DEHOSXD',
                pass: 'BIwMw6xMr/Vi1sLuSyg0OxsnXT01Sb0gLXBNH7Dz9PJa'
            },
            tls: { rejectUnauthorized: false }
        });

        transport.sendMail(mail, function (err, result) {
            if (!err) {
                console.log("Mail sent success");
            }
            else {
                console.log("Mail Error", err);
            }
        });
    } catch (error) {

    }
}

shared_ctrl.jsonDeepParse = (str) => {
    try {
        if (str) {
            str = shared_ctrl.jsonParse(str);
            if (str && str.length && typeof str == 'object') {
                str.forEach(element => {
                    element = shared_ctrl.jsonDeepParse(element);
                });
            }
            else if (str && typeof str == 'object') {
                let keys = Object.keys(str);
                if (keys && keys.length) {
                    keys.forEach(key => {
                        str[key] = shared_ctrl.jsonDeepParse(str[key]);
                    });
                }
            }
            return str;
        }
        else {
            return str;
        }
    }
    catch (e) {
        return str;
    }
}

shared_ctrl.save_api_url = 'https://www.tallite.com/api_v2/icrweb/home/save_portal_applicants';

shared_ctrl.jsonParse = (str) => {
    try {
        if (typeof str == 'string')
            return JSON.parse(str);
        else
            return str;
    } catch (e) {

        if (typeof str == 'object')
            return str;
        else
            return str;
    }
}

shared_ctrl.parseNumberOnly = str => {
    try {
        return str.replace(/\D/g, '');
    } catch (e) {
        return str;
    }
}

shared_ctrl.dateFormat = (date) => {
    try {
        var reg1 = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
        var reg2 = /^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$/;
        // var reg3 = /^((^(10|12|0?[13578])(3[01]|[12][0-9]|0?[1-9])((1[8-9]\d{2})|([2-9]\d{3}))$)|(^(11|0?[469])(30|[12][0-9]|0?[1-9])((1[8-9]\d{2})|([2-9]\d{3}))$)|(^(0?2)(2[0-8]|1[0-9]|0?[1-9])((1[8-9]\d{2})|([2-9]\d{3}))$)|(^(0?2)(29)([2468][048]00)$)|(^(0?2)(29)([3579][26]00)$)|(^(0?2)(29)([1][89][0][48])$)|(^(0?2)(29)([2-9][0-9][0][48])$)|(^(0?2)(29)([1][89][2468][048])$)|(^(0?2)(29)([2-9][0-9][2468][048])$)|(^(0?2)(29)([1][89][13579][26])$)|(^(0?2)(29)([2-9][0-9][13579][26])$))$/;
        // var reg3 = /^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
        var reg3 = /^([0-2][\s|0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$/;
        var out1 = reg1.test(date);
        var out2 = reg2.test(date);
        var out3 = reg3.test(date);
        console.log(out3)
        if (out1 == true || out2 == true || out3 == true) {
            if (out1 == true) {
                var parts = date.split("/");
                var dtDOB = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
                var dtCurrent = new Date(dtDOB);
            }
            else if (out2 == true) {
                var parts = date.split("-");
                var dtDOB = new Date(parts[1] + "-" + parts[0] + "-" + parts[2]);
                var dtCurrent = new Date(dtDOB);
            }
            else if (out3 == true) {
                var parts = date.split("/");
                var dtDOB = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
                var dtCurrent = new Date(dtDOB);
            }


            var month = '' + (dtCurrent.getMonth() + 1);
            var day = '' + dtCurrent.getDate();
            var year = dtCurrent.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }
        else {
            var d = new Date(date);
            var month = '' + (d.getMonth() + 1);
            var day = '' + d.getDate();
            var year = d.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            if (year == NaN || month == NaN || day == NaN) {
                return null
            }
            else {
                return [year, month, day].join('-');

            }

        }
    } catch (error) {
        return null;
    }
}

shared_ctrl.convertMillisToDate = (millis) => {
    const date = new Date(millis);

    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so +1
    return `${year}-${month}-${day}`;
}

shared_ctrl.getNumberFromString = (str) => {
    try {


        let matches = str.match(/\d+/g);


        return matches[0]



    }
    catch (Err) {
        return str
    }
}


shared_ctrl.setFileType = function (mimeType) {
    var filetype = '';
    if (mimeType) {
        if (mimeType.indexOf('png') > 0) {
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
    }
    return filetype;
}


module.exports = shared_ctrl;