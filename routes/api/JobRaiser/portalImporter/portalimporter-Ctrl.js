var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;
const jsdom = require("jsdom");

var portalimporter = {};
var error = {};



portalimporter.checkApplicantExistsFromPortal = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var portalId = 2;
    // if (!req.query.portalId) {
    //     error.portalId = 'Invalid portalId';
    //     validationFlag *= false;
    // }

    // var applicants = req.body.applicants;
    // if (typeof(applicants) == 'string'){
    //     applicants = JSON.parse(applicants);
    // }

    // if(!applicants){
    //     applicants=[];
    // }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                const { JSDOM } = jsdom;
                var xml_string = req.body.xml_string;

                var document = new JSDOM(xml_string).window.document;
                var applicants = [];
                var selected_candidates = req.body.selected_candidates;

                if (req.body.is_select_all == 1) {
                    console.log("req.body.is_select_all",req.body.is_select_all);
                    if (document.getElementsByClassName('resumeitem'))
                        for (var i = 0; i < document.getElementsByClassName('resumeitem').length; i++) {

                            var name = document.getElementsByClassName('resumeitem')[i].getElementsByClassName('ritemheader')[0].getElementsByClassName('skname')[0].innerHTML;
                            console.log("name",name);
                            console.log(name);
                            var first_name = "";
                            var last_name = "";

                            if (name.split(' ')) {
                                if (name.split(' ')[0])
                                    first_name = name.split(' ')[0];
                                if (name.split(' ')[1])
                                    last_name = name.split(' ')[1];
                            }
                            applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: i });
                        }
                 
                        console.log("applicants",applicants);
                }

                else {
                    console.log("else part");
                    if (document.getElementsByClassName('resumeitem'))
                        for (var i = 0; i < selected_candidates.length; i++) {
                            console.log("iiii",i);
                                var name = document.getElementsByClassName('resumeitem')[selected_candidates[i]].getElementsByClassName('ritemheader')[0].getElementsByClassName('skname')[0].innerHTML;
                                console.log(name);
                                var first_name = "";
                                var last_name = "";
                                console.log("name",name);
                                if (name.split(' ')) {
                                    if (name.split(' ')[0])
                                        first_name = name.split(' ')[0];
                                    if (name.split(' ')[1])
                                        last_name = name.split(' ')[1];
                                }
                                applicants.push({ firstName: first_name, lastName: last_name, portalId: 2, index: i });
                            
                        }
                }

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(applicants)),
                    req.st.db.escape(portalId)
                ];

                var procQuery = 'CALL wm_checkApplicantsFromPortal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Portal applicants verified successfully";
                        response.error = null;
                        if (result[0][0].importerResults && typeof (result[0][0].importerResults) == 'string') {
                            result[0][0].importerResults = JSON.parse(result[0][0].importerResults);
                        }
                        response.data = result[0][0].importerResults ? result[0][0].importerResults : [];
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Something went wrong! Please try again";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


module.exports = portalimporter;
