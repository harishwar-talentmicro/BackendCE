/**
 *  @author Gowri shankar
 *  @since seotemper 10,2015 03:24 PM IST
 *  @title Alumni module
 *  @description Handles functions related to alumni profile and events
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}

var st = null;

function Alumni(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 * @todo FnSaveAlumniContent
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni details of a person
 */
Alumni.prototype.saveAlumniContent = function(req,res,next) {
    var _this = this;

    //var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.pg_pic;
    var pictureTitle = req.body.pg_picName;
    var pictureType = req.body.pg_picType;
    var title = req.body.pg_title;
    var subTitle = req.body.pg_subtitle;
    var footerL1 = req.body.footerL1;
    var footerL2 = req.body.footerL2;
    var ideaTitle = req.body.idea_title;
    var ideaText = req.body.idea_text;
    var purposeTitle = req.body.purpose_title;
    var purposeText = req.body.purpose_text;
    var teamTitle = req.body.team_title;
    var teamSubtitle = req.body.team_subtitle;
    var mainFooter1 = req.body.m_footer1;
    var mainFooter2 = req.body.m_footer2;
    var logo = req.body.logo;
    var logoName = req.body.l_name;
    var logoType = req.body.l_type;
    var logoTitle = req.body.logo_title;
    var alumniId = req.body.alumni_id;
    var mentorTitle = req.body.m_title;
    var mentorSubtitle = req.body.m_subtitle;
    var facultyTitle = req.body.f_title;
    var facultySubtitle = req.body.f_subtitle;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {},validateStatus = true;
    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!picture){
        error['picture'] = 'Invalid page picture';
        validateStatus *= false;
    }
    if(!title){
        error['title'] = 'Invalid page title';
        validateStatus *= false;
    }
    if(!subTitle){
        error['subTitle'] = 'Invalid page subTitle';
        validateStatus *= false;
    }
    if(!footerL1){
        error['footerL1'] = 'Invalid footerL1';
        validateStatus *= false;
    }
    if(!footerL2){
        error['footerL2'] = 'Invalid footerL2';
        validateStatus *= false;
    }
    if(!ideaTitle){
        error['ideaTitle'] = 'Invalid ideaTitle';
        validateStatus *= false;
    }
    if(!ideaText){
        error['ideaText'] = 'Invalid ideaText';
        validateStatus *= false;
    }
    if(!purposeTitle){
        error['purposeTitle'] = 'Invalid purposeTitle';
        validateStatus *= false;
    }
    if(!purposeText){
        responseMessage.error['purposeText'] = 'Invalid purposeText';
        validateStatus *= false;
    }
    if(!teamTitle){
        responseMessage.error['teamTitle'] = 'Invalid teamTitle';
        validateStatus *= false;
    }
    if(!teamSubtitle){
        responseMessage.error['teamSubtitle'] = 'Invalid teamSubtitle';
        validateStatus *= false;
    }
    if(!mainFooter1){
        responseMessage.error['mainFooter1'] = 'Invalid mainFooter1';
        validateStatus *= false;
    }
    if(!mainFooter2){
        responseMessage.error['mainFooter2'] = 'Invalid mainFooter2';
        validateStatus *= false;
    }
    if(!logo){
        responseMessage.error['logo'] = 'Invalid logo';
        validateStatus *= false;
    }
    if(!logoTitle){
        responseMessage.error['mainFooter2'] = 'Invalid logoTitle';
        validateStatus *= false;
    }
    if(!alumniId){
        responseMessage.error['alumniId'] = 'Invalid alumniId';
        validateStatus *= false;
    }
    if(!mentorTitle){
        responseMessage.error['mentorTitle'] = 'Invalid mentorTitle';
        validateStatus *= false;
    }
    if(!mentorSubtitle){
        responseMessage.error['mentorSubtitle'] = 'Invalid mentorSubtitle';
        validateStatus *= false;
    }
    if(!facultyTitle){
        responseMessage.error['facultyTitle'] = 'Invalid facultyTitle';
        validateStatus *= false;
    }
    if(!facultySubtitle){
        responseMessage.error['facultySubtitle'] = 'Invalid facultySubtitle';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(tid) + ',' + st.db.escape(picture) + ',' + st.db.escape(title)
                            + ',' + st.db.escape(subTitle) + ',' + st.db.escape(footerL1) + ',' + st.db.escape(footerL2)
                            + ',' + st.db.escape(ideaTitle) + ',' + st.db.escape(ideaText) + ',' + st.db.escape(purposeTitle)
                            + ',' + st.db.escape(purposeText) + ',' + st.db.escape(teamTitle) + ',' + st.db.escape(teamSubtitle)
                            + ',' + st.db.escape(mainFooter1) + ',' + st.db.escape(mainFooter2) + ',' + st.db.escape(logo)
                            + ',' + st.db.escape(logoTitle)+ ',' + st.db.escape(alumniId)+ ',' + st.db.escape(mentorTitle)
                            + ',' + st.db.escape(mentorSubtitle)+ ',' + st.db.escape(facultyTitle)+ ',' + st.db.escape(facultySubtitle)
                            + ',' + st.db.escape(logoName) + ',' + st.db.escape(logoType)+ ',' + st.db.escape(pictureTitle)
                            + ',' + st.db.escape(pictureType);
                        console.log('CALL pSaveAlumniContent(' + query + ')');
                        st.db.query('CALL pSaveAlumniContent(' + query + ')', function (err, insertresult) {
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni Content save successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        tid: req.body.tid,
                                        pg_pic: req.body.pg_pic,
                                        pg_picName : req.body.pg_picName,
                                        pg_picType : req.body.pg_picType,
                                        pg_title: req.body.pg_title,
                                        pg_subtitle: req.body.pg_subtitle,
                                        footerL1: req.body.footerL1,
                                        footerL2: req.body.footerL2,
                                        idea_title: req.body.idea_title,
                                        idea_text: req.body.idea_text,
                                        purpose_title: req.body.purpose_title,
                                        purpose_text: req.body.purpose_text,
                                        team_title: req.body.team_title,
                                        team_subtitle: req.body.team_subtitle,
                                        m_footer1: req.body.m_footer1,
                                        m_footer2: req.body.m_footer2,
                                        logo: req.body.logo,
                                        l_name : req.body.l_name,
                                        l_type : req.body.l_type,
                                        logo_title: req.body.logo_title,
                                        alumni_id : req.body.alumni_id,
                                        m_title : req.body.m_title,
                                        m_subtitle : req.body.m_subtitle,
                                        f_title : req.body.f_title,
                                        f_subtitle : req.body.f_subtitle
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveAlumniContent: Alumni Content save successfully');
                                }
                                else {
                                    responseMessage.message = 'No save Alumni Content';
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveAlumniContent:No save Alumni Content');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveAlumniContent: error in saving Alumni Content:' + err);
                            }
                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnSaveAlumniContent: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal server error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnSaveAlumniContent:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveAlumniContent:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnSaveAlumniTeam
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team details
 */
Alumni.prototype.saveAlumniTeam = function(req,res,next) {
    var _this = this;

    //var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.picture;
    var pictureTitle = req.body.p_title;
    var pictureType = req.body.p_type;
    var jobTitle = req.body.job_title;
    var company = req.body.company;
    var profile = req.body.profile;
    var seqNo = req.body.seq_no;
    var type = req.body.type;     // 0=core group 1=mentor 2=faculty
    var alumniId = req.body.alumni_id;
    var alumniRole = req.body.alumni_role;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!picture){
        error['picture'] = 'Invalid picture';
        validateStatus *= false;
    }
    if(!jobTitle){
        error['jobTitle'] = 'Invalid jobTitle';
        validateStatus *= false;
    }
    if(!company){
        error['company'] = 'Invalid company';
        validateStatus *= false;
    }
    if(!profile){
        error['profile'] = 'Invalid profile';
        validateStatus *= false;
    }
    if(!seqNo){
        error['seqNo'] = 'Invalid seqNo';
        validateStatus *= false;
    }
    if(!type){
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }
    if(!alumniId){
        error['alumniId'] = 'Invalid alumniId';
        validateStatus *= false;
    }
    if(!alumniRole){
        error['alumniRole'] = 'Invalid alumniRole';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(tid) + ',' + st.db.escape(picture) + ',' + st.db.escape(jobTitle)
                            + ',' + st.db.escape(company) + ',' + st.db.escape(profile) + ',' + st.db.escape(seqNo)
                            + ',' + st.db.escape(type) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(alumniRole)
                            + ',' + st.db.escape(pictureTitle) + ',' + st.db.escape(pictureType);
                        console.log('CALL pSaveAlumniTeam(' + query + ')');
                        st.db.query('CALL pSaveAlumniTeam(' + query + ')', function (err, insertresult) {
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni Team save successfully';
                                    responseMessage.data = {
                                        token : req.body.token,
                                        tid : req.body.tid,
                                        picture : req.body.picture,
                                        p_title : req.body.p_title,
                                        p_type : req.body.p_type,
                                        job_title : req.body.job_title,
                                        company : req.body.company,
                                        profile : req.body.profile,
                                        seq_no : req.body.seq_no,
                                        type : req.body.type,
                                        alumni_id : req.body.alumni_id,
                                        alumni_role : req.body.alumni_role
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveAlumniTeam: Alumni Team save successfully');
                                }
                                else {
                                    responseMessage.message = 'No save Alumni Team';
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveAlumniTeam:No save Alumni Team');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveAlumniTeam: error in saving Alumni Team:' + err);
                            }
                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnSaveAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal server error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnSaveAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveAlumniTeam:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnGetAlumniContent
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni content
 */
Alumni.prototype.getAlumniContent = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var code = req.query.code;   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(code);
                        console.log('CALL pGetAlumniContent(' + query + ')');
                        st.db.query('CALL pGetAlumniContent(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni content loaded successfully';
                                    responseMessage.data = getResult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniContent: Alumni content loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Alumni content not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniContent: Alumni content not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniContent: error in getting alumni content :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnGetAlumniContent: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnGetAlumniContent:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniContent ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniTeam
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni team
 */
Alumni.prototype.getAlumniTeam = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var code = req.query.code;   // college code
    var type = req.query.type;   // 0=core group 1=mentor 2=faculty

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if(!type){
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(code) + ',' + st.db.escape(type);
                        console.log('CALL pGetAlumniTeam(' + query + ')');
                        st.db.query('CALL pGetAlumniTeam(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni team loaded successfully';
                                    responseMessage.data = getResult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniTeam: Alumni team loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Alumni team not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniTeam: Alumni team not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniTeam: error in getting alumni team :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnGetAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnGetAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniTeam ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDeleteAlumniTeam
 * Method : Delete
 * @param req
 * @param res
 * @param next
 * @description api code for delete alumni team
 */
Alumni.prototype.deleteAlumniTeam = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var id = req.query.id;     // alumni team id

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!id){
        error['id'] = 'Invalid id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(id);
                        console.log('CALL PDeleteAlumniTeam(' + query + ')');
                        st.db.query('CALL PDeleteAlumniTeam(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni team deleted successfully';
                                    responseMessage.data = getResult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteAlumniTeam: Alumni team deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Alumni team not deleted';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteAlumniTeam: Alumni team not deleted');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteAlumniTeam: error in deleting alumni team :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnDeleteAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnDeleteAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDeleteAlumniTeam : ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniContentImage
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni content
 */
Alumni.prototype.getAlumniContentImage = function(req,res,next){
    var _this = this;

    var code = req.query.code;   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var query = st.db.escape(code);
            console.log('CALL pGetAlumniContentImage(' + query + ')');
            st.db.query('CALL pGetAlumniContentImage(' + query + ')', function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Cover Image loaded successfully';
                        responseMessage.data = getResult[0][0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlumniContentImage: Cover Image loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Cover Image not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlumniContentImage: Cover Image not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniContentImage: error in getting Cover Image :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniContentImage ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Alumni;

